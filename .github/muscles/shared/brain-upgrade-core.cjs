#!/usr/bin/env node
/**
 * @module brain-upgrade-core
 * @description Shared per-project Phase 1 logic for brain upgrades.
 * @platform node
 * @requires fs, path
 * @inheritance inheritable
 * @currency 2026-04-23
 *
 * This module is the single source of truth for the mechanical (Phase 1) portion
 * of an Alex brain upgrade on a single project. It is consumed by:
 *   - scripts/upgrade-brain.cjs  (fleet orchestrator, Master-only)
 *   - .github/muscles/brain-upgrade.cjs (LLM-callable trifecta muscle)
 *
 * Phase 1 guarantees (contract):
 *   - Eligibility gate: only recognized Alex brains that are not locked/protected
 *   - Non-destructive: rename .github -> .github-backup-<stamp>, never delete
 *   - Fresh install of brain from a known brain source on disk
 *   - Auto-preserve heir-managed files (config/*, brain-version identity/lock)
 *   - Save old copilot-instructions.md and NORTH-STAR.md as .backup.md for Phase 2
 *     LLM-led reconciliation (NORTH-STAR is semantic, not mechanical: the LLM
 *     decides whether to merge, keep old, keep new, or relocate a misplaced copy)
 *   - Auto-restore non-brain content (workflows, CODEOWNERS, etc.)
 *   - Additive .vscode/settings.json merge (user customization wins)
 *   - Version stamp (brain-version.json `version` field; legacy `.alex-brain-version` is no longer written)
 *
 * Phase 2 (semantic, LLM-led) is owned by the trifecta skill + instruction and is
 * NOT part of this module. This module only provides the mechanical primitives.
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ── Constants ───────────────────────────────────────────────────────────────

const BRAIN_SUBDIRS = ["instructions", "skills", "prompts", "agents", "muscles", "config", "hooks"];
const BRAIN_ROOT_FILES = ["copilot-instructions.md", "ABOUT.md", "NORTH-STAR.md", "EXTERNAL-API-REGISTRY.md", "brain-version.json"];

const RESTORE_DIRS = ["workflows", "ISSUE_TEMPLATE", "episodic", "memory", "domain-knowledge"];
const RESTORE_FILES = ["PULL_REQUEST_TEMPLATE.md", "dependabot.yml", "CODEOWNERS", "FUNDING.yml", "MEMORY.md"];

// NORTH-STAR.md is intentionally NOT in this list. It is handled like
// copilot-instructions.md: fresh template installed in Phase 1, old copy saved
// as NORTH-STAR.backup.md for Phase 2 LLM reconciliation.
const HEIR_MANAGED_ROOT_FILES = [];
const HEIR_MANAGED_CONFIG_FILES = ["loop-menu.json", "taglines.json", "cognitive-config.json", "markdown-light.css"];

// Trifecta files — installed fresh in Phase 1, must NEVER be restored from backup
// during Phase 2. An old trifecta silently overwriting a new one is the single worst
// failure mode we can have (self-downgrade of the upgrader itself).
const PROTECTED_TRIFECTA_PATHS = [
  "skills/brain-upgrade/SKILL.md",
  "instructions/brain-upgrade.instructions.md",
  "muscles/brain-upgrade.cjs",
  "muscles/shared/brain-upgrade-core.cjs",
];

// Recognized Alex brain patterns in copilot-instructions.md first line (older brains)
const ALEX_CI_PATTERNS = [
  /^# Alex$/,                     // v7 standard
  /Alex Cognitive Architecture/,  // v5 hybrid / v8 variants
  /^# Alex v\d/,                  // v8 versioned
  /GCX Copilot/,                  // GCX customization
  /PBI Visual/,                   // PBI customization
  /INSTRUMENTATION/,              // v3 legacy
];

const PROTECTED_MARKER_FILE = path.join(".github", "config", "MASTER-ALEX-PROTECTED.json");
const WORKSPACE_SETTINGS_FILE = path.join(".vscode", "settings.json");
const BRAIN_VERSION_FILE = path.join(".github", "brain-version.json");
// Legacy stamp file (pre-v8.3). No longer written; removed on upgrade if present.
const LEGACY_VERSION_STAMP_FILE = path.join(".github", ".alex-brain-version");

const ESSENTIAL_SETTINGS = {
  "chat.useCustomAgentHooks": true,
  "github.copilot.chat.copilotMemory.enabled": false,
  "chat.customAgentInSubagent.enabled": true,
  "chat.useNestedAgentsMdFiles": true,
  "chat.includeReferencedInstructions": true,
  "github.copilot.chat.agent.thinkingTool": true,
  "chat.plugins.enabled": true,
  "markdown.styles": [".github/config/markdown-light.css"],
};

// ── Default logger (silent) ──────────────────────────────────────────────────

const silentLogger = {
  phase:   () => {},
  action:  () => {},
  ok:      () => {},
  warn:    () => {},
  err:     () => {},
};

// ── Filesystem helpers ───────────────────────────────────────────────────────

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

function rmRecursive(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) count += countFiles(path.join(dir, entry.name));
    else count++;
  }
  return count;
}

// ── Semver helpers (lightweight, no deps) ────────────────────────────────────

/**
 * Parse a semver-ish string into [major, minor, patch] numbers.
 * Accepts "8.3.0", "v8.3.0", "8.3", "8". Returns null on invalid input.
 */
function parseSemver(v) {
  if (typeof v !== "string") return null;
  const m = v.trim().match(/^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2] || 0), Number(m[3] || 0)];
}

/**
 * Compare two semver strings. Returns -1 | 0 | 1, or null if either is unparseable.
 */
function compareSemver(a, b) {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa || !pb) return null;
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

/**
 * Read the installed brain version from a project's brain-version.json.
 * Returns the version string or null if unavailable/unparseable.
 */
function readInstalledVersion(projectPath) {
  const cfg = readBrainVersionConfig(projectPath);
  if (!cfg || typeof cfg.version !== "string") return null;
  return cfg.version;
}

// ── Eligibility / detection ──────────────────────────────────────────────────

function readBrainVersionConfig(projectPath) {
  const p = path.join(projectPath, BRAIN_VERSION_FILE);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function isUpgradeLocked(projectPath) {
  const cfg = readBrainVersionConfig(projectPath);
  if (!cfg || typeof cfg !== "object") return false;
  return cfg.upgradeLock === true
    || cfg.lockUpgrade === true
    || cfg.locked === true
    || (cfg.lock && cfg.lock.upgrades === true);
}

function isProtectedProject(projectPath) {
  if (isUpgradeLocked(projectPath)) return true;
  if (fs.existsSync(path.join(projectPath, PROTECTED_MARKER_FILE))) return true;

  const settingsPath = path.join(projectPath, WORKSPACE_SETTINGS_FILE);
  if (!fs.existsSync(settingsPath)) return false;
  try {
    const settingsText = fs.readFileSync(settingsPath, "utf8");
    return /"alex\.workspace\.protectedMode"\s*:\s*true/i.test(settingsText);
  } catch {
    return false;
  }
}

/**
 * Detect whether a project is a recognized Alex brain.
 * Returns: "v8" | "legacy" | null (not an Alex repo — skip).
 *
 * Gates:
 *   1. No .github folder -> null (not an Alex repo).
 *   2. brain-version.json with Alex architecture -> "v8".
 *   3. Recognizable copilot-instructions.md first line -> "legacy".
 *   4. Otherwise -> null (has .github but unknown, do not upgrade).
 */
function detectAlexBrain(projectPath) {
  const ghDir = path.join(projectPath, ".github");
  if (!fs.existsSync(ghDir)) return null;

  const bvPath = path.join(ghDir, "brain-version.json");
  if (fs.existsSync(bvPath)) {
    try {
      const bv = JSON.parse(fs.readFileSync(bvPath, "utf8"));
      if (typeof bv.architecture === "string" && /alex/i.test(bv.architecture)) return "v8";
    } catch { /* fall through */ }
  }

  const ciPath = path.join(ghDir, "copilot-instructions.md");
  if (fs.existsSync(ciPath)) {
    try {
      const firstLine = fs.readFileSync(ciPath, "utf8").split(/\r?\n/)[0].trim();
      if (ALEX_CI_PATTERNS.some(p => p.test(firstLine))) return "legacy";
    } catch { /* fall through */ }
  }

  return null;
}

function getCIFormat(ciPath) {
  try {
    const lines = fs.readFileSync(ciPath, "utf8").split("\n").filter(l => l.trim());
    const first = lines[0] || "";
    if (!first.trim()) return "blank";
    if (/^# Alex$/.test(first)) return "alex-v7";
    if (/Alex Cognitive Architecture.*Hybrid/.test(first)) return "hybrid-v5";
    if (/^# Alex v\d/.test(first)) return "alex-versioned";
    if (/GCX Copilot/.test(first)) return "gcx-custom";
    if (/PBI Visual/.test(first)) return "pbi-custom";
    if (/INSTRUMENTATION/.test(first)) return "legacy-v3";
    return "project-custom";
  } catch {
    return "unknown";
  }
}

/**
 * Is a given path inside the backup a protected trifecta file?
 * Backup-relative path (e.g. "muscles/brain-upgrade.cjs").
 */
function isProtectedTrifectaPath(backupRelativePath) {
  const normalized = backupRelativePath.replace(/\\/g, "/");
  return PROTECTED_TRIFECTA_PATHS.includes(normalized);
}

// ── Preservation primitives ──────────────────────────────────────────────────

function preserveHeirManagedFiles(restoreSource, ghDir, { dryRun = false, logger = silentLogger } = {}) {
  for (const file of HEIR_MANAGED_ROOT_FILES) {
    const src = path.join(restoreSource, file);
    const dest = path.join(ghDir, file);
    if (!fs.existsSync(src)) continue;
    if (!dryRun) fs.copyFileSync(src, dest);
    logger.action(`preserve ${file} (heir-managed)`);
  }

  for (const file of HEIR_MANAGED_CONFIG_FILES) {
    const src = path.join(restoreSource, "config", file);
    const dest = path.join(ghDir, "config", file);
    if (!fs.existsSync(src)) continue;
    if (!dryRun) fs.copyFileSync(src, dest);
    logger.action(`preserve config/${file} (heir-managed)`);
  }
}

function preserveBrainVersionCustomization(restoreSource, ghDir, { dryRun = false, logger = silentLogger } = {}) {
  const backupPath = path.join(restoreSource, "brain-version.json");
  const currentPath = path.join(ghDir, "brain-version.json");
  if (!fs.existsSync(backupPath) || !fs.existsSync(currentPath)) return;

  try {
    const backupConfig = JSON.parse(fs.readFileSync(backupPath, "utf8"));
    const currentConfig = JSON.parse(fs.readFileSync(currentPath, "utf8"));
    currentConfig.identity = backupConfig.identity || currentConfig.identity;
    if (Object.prototype.hasOwnProperty.call(backupConfig, "upgradeLock")) {
      currentConfig.upgradeLock = backupConfig.upgradeLock;
    }
    if (Object.prototype.hasOwnProperty.call(backupConfig, "lockReason")) {
      currentConfig.lockReason = backupConfig.lockReason;
    }
    if (!dryRun) {
      fs.writeFileSync(currentPath, JSON.stringify(currentConfig, null, 2) + "\n", "utf8");
    }
    logger.action("preserve brain-version.json customization (identity/lock)");
  } catch {
    logger.warn("could not preserve brain-version.json customization");
  }
}

// ── Settings merge ───────────────────────────────────────────────────────────

function mergeWorkspaceSettings(projectPath, { dryRun = false, logger = silentLogger } = {}) {
  const vscodeDir = path.join(projectPath, ".vscode");
  const settingsFile = path.join(vscodeDir, "settings.json");
  if (!dryRun) {
    if (!fs.existsSync(vscodeDir)) fs.mkdirSync(vscodeDir, { recursive: true });
    let existing = {};
    if (fs.existsSync(settingsFile)) {
      try { existing = JSON.parse(fs.readFileSync(settingsFile, "utf8")); } catch { existing = {}; }
    }
    // Additive merge: user customization wins, new defaults fill gaps only
    const merged = { ...ESSENTIAL_SETTINGS, ...existing };
    fs.writeFileSync(settingsFile, JSON.stringify(merged, null, 2), "utf8");
  }
  logger.action("merge .vscode/settings.json (user customization preserved, new defaults added)");
}

// ── Backup stamp ─────────────────────────────────────────────────────────────

function buildBackupSuffix(date = new Date()) {
  const pad = n => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

// ── Core operations ──────────────────────────────────────────────────────────

/**
 * Validate that a brain source directory is complete.
 * Returns { ok: true } or { ok: false, reason: "..." }.
 */
function validateBrainSource(brainSource) {
  if (!fs.existsSync(brainSource)) {
    return { ok: false, reason: `Brain source not found: ${brainSource}` };
  }
  for (const subdir of BRAIN_SUBDIRS) {
    if (!fs.existsSync(path.join(brainSource, subdir))) {
      return { ok: false, reason: `Missing brain subdirectory: ${subdir}` };
    }
  }
  return { ok: true };
}

/**
 * Run Phase 1 (mechanical upgrade) on a single project.
 *
 * @param {object} params
 * @param {string} params.projectPath       Absolute path to the project root (contains .github/).
 * @param {string} params.brainSource       Absolute path to a fresh brain source on disk.
 * @param {string} params.brainVersion      Version string to stamp into .alex-brain-version.
 * @param {string} [params.backupSuffix]    Timestamp suffix; auto-generated if omitted.
 * @param {boolean} [params.dryRun=false]
 * @param {boolean} [params.force=false]    When false, skip projects whose installed
 *                                          brain-version.json `version` is >= target.
 * @param {object} [params.logger]          Logger with {phase, action, ok, warn, err}.
 *
 * @returns {{ ok: boolean, skipped?: boolean, reason?: string, installedVersion?: string, backupDir?: string, error?: string }}
 */
function upgradeProject({
  projectPath,
  brainSource,
  brainVersion,
  backupSuffix = buildBackupSuffix(),
  dryRun = false,
  force = false,
  logger = silentLogger,
}) {
  const ghDir = path.join(projectPath, ".github");
  const backupDir = path.join(projectPath, `.github-backup-${backupSuffix}`);

  // Skip-if-up-to-date gate. Only applies when we can read a semver-valid version
  // stamp. Legacy projects (no brain-version.json `version` field) always proceed
  // because they need the stamp written. `--force` bypasses this gate.
  if (!force) {
    const installed = readInstalledVersion(projectPath);
    if (installed) {
      const cmp = compareSemver(installed, brainVersion);
      if (cmp !== null && cmp >= 0) {
        logger.action(`skip: already at v${installed} (target v${brainVersion}); pass force=true to reinstall`);
        return { ok: true, skipped: true, reason: "up-to-date", installedVersion: installed };
      }
    }
  }

  // Refuse if already backed up at this stamp (collision, don't clobber)
  if (fs.existsSync(backupDir)) {
    return { ok: false, error: `backup already exists: ${path.basename(backupDir)}` };
  }

  // Validate brain source before touching anything
  const v = validateBrainSource(brainSource);
  if (!v.ok) return { ok: false, error: v.reason };

  try {
    // Step 1: backup (rename, not delete)
    if (fs.existsSync(ghDir)) {
      if (!dryRun) {
        fs.renameSync(ghDir, backupDir);
        if (!fs.existsSync(backupDir)) {
          throw new Error(`Backup directory was not created: ${backupDir}`);
        }
      }
      logger.action(`backup -> .github-backup-${backupSuffix}/`);
    } else {
      logger.action("no existing .github/, performing fresh install");
    }

    // Step 2: fresh install from brain source
    if (!dryRun) fs.mkdirSync(ghDir, { recursive: true });

    for (const subdir of BRAIN_SUBDIRS) {
      const src = path.join(brainSource, subdir);
      const dest = path.join(ghDir, subdir);
      if (!dryRun) copyRecursive(src, dest);
      logger.action(`install ${subdir}/ (${countFiles(src)} files)`);
    }

    for (const file of BRAIN_ROOT_FILES) {
      const src = path.join(brainSource, file);
      if (fs.existsSync(src)) {
        if (!dryRun) fs.copyFileSync(src, path.join(ghDir, file));
        logger.action(`install ${file}`);
      }
    }

    // Version stamp: write into brain-version.json (authoritative since v8.3).
    // Legacy .alex-brain-version is not written. If it exists in the freshly
    // installed brain for any reason, remove it so it doesn't linger.
    const bvPath = path.join(ghDir, "brain-version.json");
    if (!dryRun) {
      let bvConfig = {};
      if (fs.existsSync(bvPath)) {
        try { bvConfig = JSON.parse(fs.readFileSync(bvPath, "utf8")); } catch { bvConfig = {}; }
      }
      bvConfig.version = brainVersion;
      bvConfig.architecture = bvConfig.architecture || "Alex Cognitive Architecture";
      bvConfig.lastSync = new Date().toISOString();
      fs.writeFileSync(bvPath, JSON.stringify(bvConfig, null, 2) + "\n", "utf8");
      const legacy = path.join(ghDir, ".alex-brain-version");
      if (fs.existsSync(legacy)) {
        try { fs.unlinkSync(legacy); } catch { /* best effort */ }
      }
    }
    logger.action(`stamp brain-version.json version = ${brainVersion}`);

    // Step 3: additive settings merge
    mergeWorkspaceSettings(projectPath, { dryRun, logger });

    // Step 4: auto-preserve heir-managed customization from backup
    const restoreSource = dryRun ? ghDir : backupDir;
    if (fs.existsSync(restoreSource)) {
      preserveHeirManagedFiles(restoreSource, ghDir, { dryRun, logger });
      preserveBrainVersionCustomization(restoreSource, ghDir, { dryRun, logger });
    }

    // Step 5: auto-restore non-brain content
    if (fs.existsSync(restoreSource)) {
      for (const dir of RESTORE_DIRS) {
        const src = path.join(restoreSource, dir);
        if (fs.existsSync(src)) {
          const dest = path.join(ghDir, dir);
          if (!dryRun) copyRecursive(src, dest);
          logger.action(`restore ${dir}/ (${countFiles(src)} files)`);
        }
      }
      for (const file of RESTORE_FILES) {
        const src = path.join(restoreSource, file);
        if (fs.existsSync(src)) {
          if (!dryRun) fs.copyFileSync(src, path.join(ghDir, file));
          logger.action(`restore ${file}`);
        }
      }

      // Save old CI for Phase 2 reconciliation
      const oldCI = path.join(restoreSource, "copilot-instructions.md");
      if (fs.existsSync(oldCI)) {
        if (!dryRun) fs.copyFileSync(oldCI, path.join(ghDir, "copilot-instructions.backup.md"));
        logger.action("save old copilot-instructions -> copilot-instructions.backup.md");
      }

      // Save old NORTH-STAR for Phase 2 LLM curation. Unlike config files
      // (mechanically preserved), NORTH-STAR is a semantic document — the LLM
      // decides whether to keep, merge, or relocate the old copy. It may also
      // have been placed in the wrong directory; Phase 2 handles that too.
      const oldNorthStar = path.join(restoreSource, "NORTH-STAR.md");
      if (fs.existsSync(oldNorthStar)) {
        if (!dryRun) fs.copyFileSync(oldNorthStar, path.join(ghDir, "NORTH-STAR.backup.md"));
        logger.action("save old NORTH-STAR -> NORTH-STAR.backup.md (Phase 2 LLM curation)");
      }

      // Save old EXTERNAL-API-REGISTRY for Phase 2 LLM curation. Heirs often
      // append project-specific API sections (e.g. "Book Publishing Pipeline",
      // "KDP Specs") to the bottom of the master template. These sections must
      // survive upgrades — Phase 2 merges them back into the fresh template.
      const oldApiRegistry = path.join(restoreSource, "EXTERNAL-API-REGISTRY.md");
      if (fs.existsSync(oldApiRegistry)) {
        if (!dryRun) fs.copyFileSync(oldApiRegistry, path.join(ghDir, "EXTERNAL-API-REGISTRY.backup.md"));
        logger.action("save old EXTERNAL-API-REGISTRY -> EXTERNAL-API-REGISTRY.backup.md (Phase 2 LLM curation)");
      }
    }

    return { ok: true, backupDir };
  } catch (e) {
    // Auto-rollback on failure
    if (!dryRun && fs.existsSync(backupDir)) {
      try {
        rmRecursive(ghDir);
        fs.renameSync(backupDir, ghDir);
        logger.warn("auto-rolled back from backup");
      } catch { /* best effort */ }
    }
    return { ok: false, error: e.message };
  }
}

/**
 * Verify a project's brain is installed correctly.
 * Returns { ok: boolean, issues: string[] }.
 */
function verifyProject({ projectPath, brainSource, brainVersion }) {
  const ghDir = path.join(projectPath, ".github");
  const issues = [];

  // Detect whether this project is the brain source itself (Master) or a heir.
  // Heirs intentionally receive a filtered subset (master-only content stripped
  // by sync-to-heir.cjs), so file-count comparison against the brain source
  // would always fail. For heirs we do a structural check (folders + key files).
  const isMaster = isProtectedProject(projectPath);

  // Version stamp: brain-version.json `version` field is authoritative.
  const bvPath = path.join(ghDir, "brain-version.json");
  if (fs.existsSync(bvPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(bvPath, "utf8"));
      if (cfg.version && cfg.version !== brainVersion) {
        issues.push(`version mismatch: expected ${brainVersion}, got ${cfg.version}`);
      } else if (!cfg.version) {
        issues.push("brain-version.json missing `version` field");
      }
    } catch {
      issues.push("brain-version.json unreadable");
    }
  } else {
    issues.push("missing brain-version.json");
  }

  // Warn if legacy stamp still present (should be removed on upgrade).
  if (fs.existsSync(path.join(ghDir, ".alex-brain-version"))) {
    issues.push("legacy .alex-brain-version present (should have been removed on upgrade)");
  }

  for (const subdir of BRAIN_SUBDIRS) {
    const dir = path.join(ghDir, subdir);
    if (!fs.existsSync(dir)) {
      issues.push(`missing directory: ${subdir}/`);
    } else if (isMaster) {
      // Strict file-count check only for Master (the brain source).
      const expected = countFiles(path.join(brainSource, subdir));
      const actual = countFiles(dir);
      if (actual < expected) issues.push(`${subdir}/: ${actual} files (expected >= ${expected})`);
    } else {
      // Heir: structural check only — directory exists and is non-empty.
      const actual = countFiles(dir);
      if (actual === 0) issues.push(`${subdir}/: empty directory`);
    }
  }

  const ciPath = path.join(ghDir, "copilot-instructions.md");
  if (fs.existsSync(ciPath)) {
    const firstLine = fs.readFileSync(ciPath, "utf8").split(/\r?\n/)[0].trim();
    if (firstLine !== "# Alex") issues.push(`copilot-instructions.md not v8 format (first line: ${firstLine})`);
  } else {
    issues.push("missing copilot-instructions.md");
  }

  return { ok: issues.length === 0, issues };
}

/**
 * Roll back from the most recent .github-backup-* directory.
 */
function rollbackProject({ projectPath, dryRun = false, logger = silentLogger }) {
  const ghDir = path.join(projectPath, ".github");
  const backups = fs.readdirSync(projectPath, { withFileTypes: true })
    .filter(e => e.isDirectory() && e.name.startsWith(".github-backup-"))
    .map(e => e.name)
    .sort()
    .reverse();
  const backupName = backups[0];
  if (!backupName) return { ok: false, error: "no backup found" };

  const backupDir = path.join(projectPath, backupName);
  if (!dryRun) {
    rmRecursive(ghDir);
    fs.renameSync(backupDir, ghDir);
  }
  logger.action(`restored from ${backupName}`);
  return { ok: true, restoredFrom: backupName };
}

// ── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  // Constants
  BRAIN_SUBDIRS,
  BRAIN_ROOT_FILES,
  RESTORE_DIRS,
  RESTORE_FILES,
  HEIR_MANAGED_ROOT_FILES,
  HEIR_MANAGED_CONFIG_FILES,
  PROTECTED_TRIFECTA_PATHS,
  ALEX_CI_PATTERNS,
  ESSENTIAL_SETTINGS,
  PROTECTED_MARKER_FILE,
  WORKSPACE_SETTINGS_FILE,
  BRAIN_VERSION_FILE,
  LEGACY_VERSION_STAMP_FILE,

  // Helpers
  silentLogger,
  copyRecursive,
  rmRecursive,
  countFiles,
  buildBackupSuffix,
  parseSemver,
  compareSemver,
  readInstalledVersion,

  // Eligibility / detection
  readBrainVersionConfig,
  isUpgradeLocked,
  isProtectedProject,
  detectAlexBrain,
  getCIFormat,
  isProtectedTrifectaPath,

  // Preservation
  preserveHeirManagedFiles,
  preserveBrainVersionCustomization,
  mergeWorkspaceSettings,

  // Core operations
  validateBrainSource,
  upgradeProject,
  verifyProject,
  rollbackProject,
};

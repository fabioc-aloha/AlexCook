#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle brain-upgrade
 * @lifecycle stable
 * @description LLM-callable per-project brain upgrade — Phase 1 mechanics + Phase 2 semantic helpers
 * @platform node
 * @requires fs, path
 * @inheritance inheritable
 * @currency 2026-04-23
 *
 * This is the muscle half of the `brain-upgrade` trifecta (skill + instruction + muscle).
 * The same per-project Phase 1 contract used by the fleet orchestrator
 * (scripts/upgrade-brain.cjs) lives in the shared core module:
 *   .github/muscles/shared/brain-upgrade-core.cjs
 *
 * Three executors, one contract:
 *   - scripts/upgrade-brain.cjs   → fleet upgrade (Master-only, iterates projects)
 *   - VS Code extension bootstrap → single-project upgrade from the cockpit
 *   - this muscle                 → single-project upgrade driven by the LLM
 *
 * Phase 1 modes (mechanical):
 *   Audit     — detect whether the current project is a recognized Alex brain
 *   Upgrade   — backup .github, install fresh brain, auto-preserve, auto-restore
 *   Verify    — check that the brain is installed correctly against a brain source
 *   Rollback  — restore from the most recent .github-backup-*
 *
 * Phase 2 modes (semantic, LLM-assisting):
 *   Scan        — inventory unrestored content in the backup
 *   AutoRestore — copy safe non-brain content from backup (skips protected trifecta paths)
 *   Curate      — interactive copilot-instructions.md reconciliation
 *   Clean       — delete the backup (after user consent)
 *
 * Usage:
 *   # Phase 1 (single project, defaults to CWD)
 *   node .github/muscles/brain-upgrade.cjs --mode Upgrade  --brain-source C:/path/to/fresh/.github
 *   node .github/muscles/brain-upgrade.cjs --mode Verify   --brain-source C:/path/to/fresh/.github
 *   node .github/muscles/brain-upgrade.cjs --mode Rollback
 *
 *   # Phase 2 (fleet-wide by default; --include to narrow)
 *   node .github/muscles/brain-upgrade.cjs --mode Scan
 *   node .github/muscles/brain-upgrade.cjs --mode AutoRestore --dry-run
 *   node .github/muscles/brain-upgrade.cjs --mode Curate --include "CorreaX"
 *   node .github/muscles/brain-upgrade.cjs --mode Clean  --include "ChessCoach,AlexBooks"
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const core = require(path.join(__dirname, 'shared', 'brain-upgrade-core.cjs'));
const {
  PROTECTED_TRIFECTA_PATHS,
  isProtectedTrifectaPath,
  detectAlexBrain,
  isProtectedProject,
  buildBackupSuffix,
  upgradeProject,
  verifyProject,
  rollbackProject,
} = core;

// ── CLI Parsing ─────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    mode: null,
    targetDir: process.platform === 'win32' ? 'C:\\Development' : path.join(require('os').homedir(), 'Development'),
    projectDir: process.cwd(),
    brainSource: null,
    brainVersion: null,
    include: [],
    exclude: ['AlexMaster', 'pbi', 'pbi-test', 'GCX_Master', 'GCX_Copilot', 'cXpert', 'Lahai'],
    dryRun: false,
    force: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i].toLowerCase();
    if (arg === '--mode' && args[i + 1]) {
      opts.mode = args[++i];
    } else if (arg === '--target-dir' && args[i + 1]) {
      opts.targetDir = args[++i];
    } else if (arg === '--project-dir' && args[i + 1]) {
      opts.projectDir = path.resolve(args[++i]);
    } else if (arg === '--brain-source' && args[i + 1]) {
      opts.brainSource = path.resolve(args[++i]);
    } else if (arg === '--brain-version' && args[i + 1]) {
      opts.brainVersion = args[++i];
    } else if (arg === '--include' && args[i + 1]) {
      opts.include = args[++i].split(',').map(s => s.trim()).filter(Boolean);
    } else if (arg === '--exclude' && args[i + 1]) {
      opts.exclude = args[++i].split(',').map(s => s.trim()).filter(Boolean);
    } else if (arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg === '--force') {
      opts.force = true;
    }
  }

  const phase1Modes = ['audit', 'upgrade', 'verify', 'rollback'];
  const phase2Modes = ['scan', 'autorestore', 'curate', 'clean'];
  const validModes = [...phase1Modes, ...phase2Modes];
  if (!opts.mode || !validModes.includes(opts.mode.toLowerCase())) {
    console.error(`Usage: node brain-upgrade.cjs --mode <${validModes.join('|')}>`);
    console.error('  Phase 1 (single project): Audit | Upgrade | Verify | Rollback');
    console.error('    --project-dir <path>    (default: cwd)');
    console.error('    --brain-source <path>   (required for Upgrade / Verify)');
    console.error('    --brain-version <ver>   (optional; defaults to brain source package version or "unknown")');
    console.error('  Phase 2 (fleet-wide):     Scan | AutoRestore | Curate | Clean');
    console.error('    --target-dir <path>     (default: C:\\Development on Windows)');
    console.error('    --include "a,b"         (restrict to listed projects)');
    console.error('    --exclude "x,y"         (skip listed projects)');
    console.error('  --dry-run                  (simulate)');
    console.error('  --force                    (reinstall even if installed version >= target)');
    process.exit(1);
  }
  opts.mode = opts.mode.toLowerCase();
  return opts;
}

// ── Constants ───────────────────────────────────────────────────────────────

// Brain-managed directories — content installed by upgrade-brain.cjs
const BRAIN_SUBDIRS = ['instructions', 'skills', 'prompts', 'agents', 'muscles', 'config', 'hooks', 'assets'];
const BRAIN_ROOT_FILES = ['copilot-instructions.md', '.alex-brain-version'];
const AUTO_PRESERVED_ROOT_FILES = ['NORTH-STAR.md', 'brain-version.json'];

// Already auto-restored by upgrade-brain.cjs
const AUTO_RESTORED_DIRS = ['workflows', 'ISSUE_TEMPLATE', 'episodic', 'memory', 'domain-knowledge'];
const AUTO_RESTORED_FILES = ['PULL_REQUEST_TEMPLATE.md', 'dependabot.yml', 'CODEOWNERS', 'FUNDING.yml', 'MEMORY.md'];

// Files to skip (replaced by v8 structure or obsolete)
const SKIP_FILES = ['hooks.json'];

// ── Helpers (console) ───────────────────────────────────────────────────────

const C = {
  cyan:    s => `\x1b[36m${s}\x1b[0m`,
  gray:    s => `\x1b[90m${s}\x1b[0m`,
  yellow:  s => `\x1b[33m${s}\x1b[0m`,
  green:   s => `\x1b[32m${s}\x1b[0m`,
  red:     s => `\x1b[31m${s}\x1b[0m`,
  darkYel: s => `\x1b[33m${s}\x1b[0m`,
  darkGray:s => `\x1b[90m${s}\x1b[0m`,
  white:   s => `\x1b[97m${s}\x1b[0m`,
};

function writePhase(text)           { console.log(`\n${C.cyan(`═══ ${text} ═══`)}`); }
function writeProject(name, text)   { console.log(`  ${C.gray(`[${name}] ${text}`)}`); }
function writeAction(text)          { console.log(`    ${C.yellow(`→ ${text}`)}`); }
function writeOK(text)              { console.log(`    ${C.green(`✓ ${text}`)}`); }
function writeWarn(text)            { console.log(`    ${C.darkYel(`⚠ ${text}`)}`); }

// ── Helpers (filesystem) ────────────────────────────────────────────────────

function dirEntries(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true });
}

function countFilesRecursive(dir) {
  let count = 0;
  for (const entry of dirEntries(dir)) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countFilesRecursive(full);
    else count++;
  }
  return count;
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of dirEntries(src)) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function askQuestion(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(prompt, answer => { rl.close(); resolve(answer); });
  });
}

// ── Project Discovery ───────────────────────────────────────────────────────

function getBackupProjects(opts) {
  if (!fs.existsSync(opts.targetDir)) return [];
  return dirEntries(opts.targetDir)
    .filter(d => d.isDirectory())
    .map(d => ({ name: d.name, fullPath: path.join(opts.targetDir, d.name) }))
    .filter(p => {
      const backups = dirEntries(p.fullPath).filter(e => e.isDirectory() && e.name.startsWith('.github-backup-'));
      return backups.length > 0;
    })
    .filter(p => !opts.exclude.includes(p.name))
    .filter(p => opts.include.length === 0 || opts.include.includes(p.name));
}

function getLatestBackup(projectPath) {
  const backups = dirEntries(projectPath)
    .filter(d => d.isDirectory() && d.name.startsWith('.github-backup-'))
    .map(d => d.name)
    .sort()
    .reverse();
  return backups.length > 0 ? path.join(projectPath, backups[0]) : null;
}

function getLatestBackupName(projectPath) {
  const backups = dirEntries(projectPath)
    .filter(d => d.isDirectory() && d.name.startsWith('.github-backup-'))
    .map(d => d.name)
    .sort()
    .reverse();
  return backups[0] || null;
}

// ── Content Analysis ────────────────────────────────────────────────────────

function getUnrestoredContent(backupPath) {
  const findings = {
    rootFiles: [],
    unknownDirs: [],
    customCI: false,
    customNorthStar: false,
    customApiRegistry: false,
    oldArtifacts: [],
  };

  // Check root-level files
  for (const entry of dirEntries(backupPath)) {
    if (entry.isDirectory()) {
      if (BRAIN_SUBDIRS.includes(entry.name)) continue;
      if (AUTO_RESTORED_DIRS.includes(entry.name)) continue;
      const fileCount = countFilesRecursive(path.join(backupPath, entry.name));
      findings.unknownDirs.push({ name: entry.name, fileCount });
    } else {
      if (BRAIN_ROOT_FILES.includes(entry.name)) continue;
      if (AUTO_PRESERVED_ROOT_FILES.includes(entry.name)) continue;
      if (AUTO_RESTORED_FILES.includes(entry.name)) continue;
      if (entry.name === 'copilot-instructions.backup.md') continue;
      if (entry.name === 'NORTH-STAR.backup.md') continue;
      if (entry.name === 'EXTERNAL-API-REGISTRY.backup.md') continue;
      if (SKIP_FILES.includes(entry.name)) {
        findings.oldArtifacts.push(entry.name);
        continue;
      }
      findings.rootFiles.push(entry.name);
    }
  }

  // Check if old CI had project-specific content
  const oldCI = path.join(backupPath, 'copilot-instructions.md');
  if (fs.existsSync(oldCI)) {
    const content = fs.readFileSync(oldCI, 'utf8');
    if (/(?:## (?:Project|Active) Context|## Coding Standards|## Tech Stack|## Architecture)/i.test(content)) {
      findings.customCI = true;
    }
  }

  // Check if old NORTH-STAR diverges from the Master template
  // (Master ships a detailed vision doc; heirs typically rewrite it.
  //  Flag any NORTH-STAR whose first non-empty H1 doesn't reference
  //  "most advanced and trusted AI partner" — the Master's tagline.)
  const oldNorthStar = path.join(backupPath, 'NORTH-STAR.md');
  if (fs.existsSync(oldNorthStar)) {
    const content = fs.readFileSync(oldNorthStar, 'utf8');
    if (content.trim().length > 0 && !/most advanced and trusted AI partner/i.test(content)) {
      findings.customNorthStar = true;
    }
  }

  // Check if old EXTERNAL-API-REGISTRY has project-specific API sections.
  // Fresh template has "## API Categories" placeholder; any additional
  // ## section with a body is project customization.
  const oldApiRegistry = path.join(backupPath, 'EXTERNAL-API-REGISTRY.md');
  if (fs.existsSync(oldApiRegistry)) {
    const content = fs.readFileSync(oldApiRegistry, 'utf8');
    // Count H2 sections that aren't template placeholders
    const projectSections = (content.match(/^## (?!API Categories|Usage Notes|Template|Placeholder)[A-Z]/gmi) || []).length;
    if (projectSections > 0) {
      findings.customApiRegistry = true;
    }
  }

  return findings;
}

// ── Mode: Scan ──────────────────────────────────────────────────────────────

function invokeScan(opts) {
  writePhase('SCAN — Finding pending curation work');

  const projects = getBackupProjects(opts);
  if (projects.length === 0) {
    console.log('  No projects with .github-backup-* found.');
    return;
  }

  console.log(`  Found ${projects.length} projects with backup directories\n`);

  let needsCuration = 0;
  let totalFindings = 0;

  for (const p of projects) {
    const backupPath = getLatestBackup(p.fullPath);
    if (!backupPath) continue;
    const backupName = getLatestBackupName(p.fullPath);

    const findings = getUnrestoredContent(backupPath);
    const hasWork = findings.rootFiles.length > 0 || findings.unknownDirs.length > 0 || findings.customCI || findings.customNorthStar || findings.customApiRegistry;

    if (hasWork) {
      writeProject(p.name, `backup: ${backupName}`);
      needsCuration++;

      for (const f of findings.rootFiles) {
        writeAction(`ROOT_FILE: ${f}`);
        totalFindings++;
      }
      for (const d of findings.unknownDirs) {
        writeAction(`UNKNOWN_DIR: ${d.name}/ (${d.fileCount} files)`);
        totalFindings++;
      }
      if (findings.customCI) {
        writeWarn('CI_CUSTOM: copilot-instructions.md has project-specific sections');
        totalFindings++;
      }
      if (findings.customNorthStar) {
        writeWarn('NORTH_STAR_CUSTOM: NORTH-STAR.md diverges from Master template — see NORTH-STAR.backup.md');
        totalFindings++;
      }
      if (findings.customApiRegistry) {
        writeWarn('API_REGISTRY_CUSTOM: EXTERNAL-API-REGISTRY.md has project-specific sections — see EXTERNAL-API-REGISTRY.backup.md');
        totalFindings++;
      }
      for (const a of findings.oldArtifacts) {
        console.log(`    ${C.darkGray(`· SKIP: ${a} (obsolete)`)}`);
      }
      console.log('');
    } else {
      writeOK(`${p.name}: clean — backup can be removed`);
    }
  }

  writePhase('SCAN SUMMARY');
  console.log(`  Projects with backups: ${projects.length}`);
  console.log(`  Needing curation: ${needsCuration}`);
  console.log(`  Total findings: ${totalFindings}`);

  if (needsCuration > 0) {
    console.log(`\n${C.white('  Next steps:')}`);
    console.log('    1. node .github/muscles/brain-upgrade.cjs --mode AutoRestore      (safe auto-copy)');
    console.log('    2. node .github/muscles/brain-upgrade.cjs --mode Curate --include X (CI merging)');
    console.log('    3. node scripts/upgrade-brain.cjs --mode Verify  (mechanical sanity check)');
    console.log('    4. node .github/muscles/brain-upgrade.cjs --mode Clean             (remove backups — asks first)');
  }
}

// ── Mode: AutoRestore ───────────────────────────────────────────────────────

function invokeAutoRestore(opts) {
  writePhase('AUTO-RESTORE — Copying non-brain content from backups');

  const projects = getBackupProjects(opts);
  let restored = 0;
  let skipped = 0;

  for (const p of projects) {
    const backupPath = getLatestBackup(p.fullPath);
    if (!backupPath) continue;

    const ghDir = path.join(p.fullPath, '.github');
    if (!fs.existsSync(ghDir)) {
      writeWarn(`${p.name}: no .github/ directory — skipping`);
      skipped++;
      continue;
    }

    const findings = getUnrestoredContent(backupPath);
    const hasWork = findings.rootFiles.length > 0 || findings.unknownDirs.length > 0;
    if (!hasWork) continue;

    writeProject(p.name, 'auto-restoring');

    // Copy root files — protected trifecta files are never restored from backup
    for (const f of findings.rootFiles) {
      if (isProtectedTrifectaPath(f)) {
        writeWarn(`refuse to restore ${f} (protected trifecta path)`);
        continue;
      }
      const source = path.join(backupPath, f);
      const target = path.join(ghDir, f);
      if (fs.existsSync(target)) {
        writeWarn(`already exists: ${f} — skipping`);
        continue;
      }
      if (!opts.dryRun) {
        fs.copyFileSync(source, target);
      }
      writeAction(`restore ${f}`);
      restored++;
    }

    // Copy unknown directories — protected trifecta dirs are never restored from backup
    for (const d of findings.unknownDirs) {
      if (isProtectedTrifectaPath(d.name) || PROTECTED_TRIFECTA_PATHS.some(p => p.startsWith(d.name + '/'))) {
        writeWarn(`refuse to restore ${d.name}/ (contains protected trifecta files)`);
        continue;
      }
      const source = path.join(backupPath, d.name);
      const target = path.join(ghDir, d.name);
      if (fs.existsSync(target)) {
        writeWarn(`already exists: ${d.name}/ — skipping`);
        continue;
      }
      if (!opts.dryRun) {
        copyDirRecursive(source, target);
      }
      writeAction(`restore ${d.name}/ (${d.fileCount} files)`);
      restored++;
    }
  }

  console.log(`\n  Restored: ${restored} items | Skipped: ${skipped} projects`);
}

// ── Mode: Curate ────────────────────────────────────────────────────────────

async function invokeCurate(opts) {
  writePhase('CURATE — Interactive per-project curation');

  const projects = getBackupProjects(opts);
  if (projects.length === 0) {
    console.log('  No projects with backups found.');
    return;
  }

  for (const p of projects) {
    const backupPath = getLatestBackup(p.fullPath);
    if (!backupPath) continue;
    const backupName = getLatestBackupName(p.fullPath);

    const ghDir = path.join(p.fullPath, '.github');
    const findings = getUnrestoredContent(backupPath);

    writeProject(p.name, `backup: ${backupName}`);

    // Step 1: Report findings
    const hasNonCI = findings.rootFiles.length > 0 || findings.unknownDirs.length > 0;
    if (hasNonCI) {
      writeWarn('Non-brain content not yet restored:');
      for (const f of findings.rootFiles) writeAction(`ROOT_FILE: ${f}`);
      for (const d of findings.unknownDirs) writeAction(`UNKNOWN_DIR: ${d.name}/ (${d.fileCount} files)`);
      console.log('');
      console.log(C.darkGray('    Run --mode AutoRestore to copy these automatically.'));
    }

    // Step 2: CI curation
    const backupCI = path.join(backupPath, 'copilot-instructions.md');
    const currentCI = path.join(ghDir, 'copilot-instructions.md');

    if (fs.existsSync(backupCI) && findings.customCI) {
      writeWarn('copilot-instructions.md has project-specific content:');
      console.log('');

      // Extract project-specific sections from old CI
      const oldContent = fs.readFileSync(backupCI, 'utf8');
      const sections = [];

      const sectionRegex = /^## (Project Context|Active Context|Context|Tech Stack|Coding Standards|Architecture)\s*\r?\n([\s\S]*?)(?=\r?\n## |\s*$)/gm;
      let match;
      while ((match = sectionRegex.exec(oldContent)) !== null) {
        const sectionName = match[1];
        const sectionBody = match[2].trim();
        if (sectionBody.length > 10) {
          sections.push({ name: sectionName, body: sectionBody, lines: sectionBody.split('\n').length });
        }
      }

      if (sections.length > 0) {
        console.log(C.white(`    Found ${sections.length} project-specific section(s):`));
        for (const s of sections) {
          console.log(C.gray(`      - ## ${s.name} (${s.lines} lines)`));
        }
        console.log('');

        if (!opts.dryRun) {
          const answer = await askQuestion('    Append these sections to current CI? (y/N): ');
          if (answer.toLowerCase() === 'y') {
            let currentContent = fs.existsSync(currentCI) ? fs.readFileSync(currentCI, 'utf8') : '';
            for (const s of sections) {
              currentContent += `\n\n## ${s.name}\n\n${s.body}`;
            }
            fs.writeFileSync(currentCI, currentContent, 'utf8');
            writeOK(`Appended ${sections.length} section(s) to copilot-instructions.md`);
          } else {
            console.log(C.gray('    Skipped CI merge.'));
          }
        } else {
          console.log(C.darkGray('    (dry-run) Would prompt to append sections'));
        }
      }
    }

    console.log('');
  }
}

// ── Mode: Clean ─────────────────────────────────────────────────────────────

function invokeClean(opts) {
  writePhase('CLEAN — Removing .github-backup-* directories');

  const projects = getBackupProjects(opts);
  let cleaned = 0;
  let blocked = 0;

  for (const p of projects) {
    const backupPath = getLatestBackup(p.fullPath);
    if (!backupPath) continue;
    const backupName = getLatestBackupName(p.fullPath);

    const ghDir = path.join(p.fullPath, '.github');

    // Safety: verify brain is installed
    const versionFile = path.join(ghDir, '.alex-brain-version');
    if (!fs.existsSync(versionFile)) {
      writeWarn(`${p.name}: no .alex-brain-version stamp — skipping (run Verify first)`);
      blocked++;
      continue;
    }

    // Safety: check for unrestored content
    const findings = getUnrestoredContent(backupPath);
    const hasUnrestored = findings.rootFiles.length > 0 || findings.unknownDirs.length > 0;
    if (hasUnrestored) {
      writeWarn(`${p.name}: unrestored content remains — run AutoRestore first`);
      for (const f of findings.rootFiles) writeAction(`ROOT_FILE: ${f}`);
      for (const d of findings.unknownDirs) writeAction(`UNKNOWN_DIR: ${d.name}/ (${d.fileCount} files)`);
      blocked++;
      continue;
    }

    writeProject(p.name, `removing ${backupName}`);
    if (!opts.dryRun) {
      fs.rmSync(backupPath, { recursive: true, force: true });
    }
    writeOK('backup removed');
    cleaned++;
  }

  console.log(`\n  Cleaned: ${cleaned} | Blocked: ${blocked}`);
}

// ── Phase 1: Single-project modes (LLM-callable, cockpit-callable) ──────────

function resolveBrainVersion(opts) {
  if (opts.brainVersion) return opts.brainVersion;
  // Try to read from the brain source's extension package.json (Master layout)
  if (opts.brainSource) {
    const extPkg = path.resolve(opts.brainSource, '..', 'platforms', 'vscode-extension', 'package.json');
    if (fs.existsSync(extPkg)) {
      try {
        return JSON.parse(fs.readFileSync(extPkg, 'utf8')).version;
      } catch { /* fall through */ }
    }
    // Fallback: brain-version.json version field
    const bv = path.join(opts.brainSource, 'brain-version.json');
    if (fs.existsSync(bv)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(bv, 'utf8'));
        if (parsed && parsed.version) return parsed.version;
      } catch { /* fall through */ }
    }
  }
  return 'unknown';
}

function phase1Logger() {
  return {
    phase:  writePhase,
    action: writeAction,
    ok:     writeOK,
    warn:   writeWarn,
    err:    t => console.log(`    ${C.red(`✗ ${t}`)}`),
  };
}

function invokeAuditSingle(opts) {
  writePhase('AUDIT — Single-project eligibility check');
  const gen = detectAlexBrain(opts.projectDir);
  const locked = isProtectedProject(opts.projectDir);

  writeProject(path.basename(opts.projectDir), opts.projectDir);
  if (!gen) {
    writeWarn('not a recognized Alex brain (no .github, or unrecognized copilot-instructions.md)');
    console.log('    Upgrade will be refused. Fix by initializing a brain here, or pointing --project-dir elsewhere.');
    return;
  }
  writeAction(`brain generation: ${gen}`);
  if (locked) {
    writeWarn('upgrade-locked (brain-version.json lock OR MASTER-ALEX-PROTECTED.json OR alex.workspace.protectedMode)');
  } else {
    writeOK('eligible for upgrade');
  }
}

function invokeUpgradeSingle(opts) {
  writePhase('UPGRADE — Single-project Phase 1 mechanical install');

  if (!opts.brainSource) {
    console.log(C.red('    --brain-source <path> is required for Upgrade mode'));
    process.exit(1);
  }
  if (isProtectedProject(opts.projectDir)) {
    writeWarn('project is upgrade-locked — refusing to proceed');
    process.exit(1);
  }
  // Allow upgrading a non-brain folder (initialize case) or an existing brain
  const gen = detectAlexBrain(opts.projectDir);
  if (!gen && fs.existsSync(path.join(opts.projectDir, '.github'))) {
    writeWarn('.github exists but is not a recognized Alex brain — refusing to proceed');
    console.log('    Move or remove the existing .github first, or use a different --project-dir.');
    process.exit(1);
  }

  const brainVersion = resolveBrainVersion(opts);
  writeAction(`brain source: ${opts.brainSource}`);
  writeAction(`target:       ${opts.projectDir}`);
  writeAction(`version:      ${brainVersion}`);

  const result = upgradeProject({
    projectPath: opts.projectDir,
    brainSource: opts.brainSource,
    brainVersion,
    backupSuffix: buildBackupSuffix(),
    dryRun: opts.dryRun,
    force: opts.force,
    logger: phase1Logger(),
  });

  if (result.ok) {
    if (result.skipped) {
      writeOK(`skipped (${result.reason || 'up-to-date'}${result.installedVersion ? ` @ v${result.installedVersion}` : ''})`);
      return;
    }
    writeOK('upgraded');
    if (!opts.dryRun && result.backupDir) {
      console.log(`\n${C.white('  Next step: Phase 2 semantic curation via the LLM')}`);
      console.log('    node .github/muscles/brain-upgrade.cjs --mode Scan --target-dir ' + path.dirname(opts.projectDir));
      console.log('    then follow the brain-upgrade skill for Phase 2 reconciliation.');
    }
  } else {
    console.log(C.red(`    ✗ FAILED: ${result.error}`));
    process.exit(1);
  }
}

function invokeVerifySingle(opts) {
  writePhase('VERIFY — Single-project brain integrity check');
  if (!opts.brainSource) {
    console.log(C.red('    --brain-source <path> is required for Verify mode'));
    process.exit(1);
  }
  const brainVersion = resolveBrainVersion(opts);
  const result = verifyProject({ projectPath: opts.projectDir, brainSource: opts.brainSource, brainVersion });
  writeProject(path.basename(opts.projectDir), opts.projectDir);
  if (result.ok) {
    writeOK(`PASS (v${brainVersion})`);
  } else {
    console.log(C.red('    ✗ FAIL'));
    for (const i of result.issues) console.log(C.red(`      - ${i}`));
    process.exit(1);
  }
}

function invokeRollbackSingle(opts) {
  writePhase('ROLLBACK — Single-project restore from most recent backup');
  const result = rollbackProject({ projectPath: opts.projectDir, dryRun: opts.dryRun, logger: phase1Logger() });
  if (result.ok) {
    writeOK(`restored from ${result.restoredFrom}`);
  } else {
    writeWarn(result.error);
    process.exit(1);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  switch (opts.mode) {
    // Phase 1 (single project, mechanical)
    case 'audit':
      invokeAuditSingle(opts);
      break;
    case 'upgrade':
      invokeUpgradeSingle(opts);
      break;
    case 'verify':
      invokeVerifySingle(opts);
      break;
    case 'rollback':
      invokeRollbackSingle(opts);
      break;
    // Phase 2 (fleet-wide, LLM-assisting)
    case 'scan':
      invokeScan(opts);
      break;
    case 'autorestore':
      invokeAutoRestore(opts);
      break;
    case 'curate':
      await invokeCurate(opts);
      break;
    case 'clean':
      invokeClean(opts);
      break;
  }

  console.log(`\n${C.cyan('Done.')}\n`);
}

main().catch(err => { console.error(C.red(`FATAL: ${err.message}`)); process.exit(1); });

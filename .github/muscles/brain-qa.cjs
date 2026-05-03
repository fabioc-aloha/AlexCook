#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle brain-qa
 * @lifecycle stable
 * @inheritance inheritable
 * @description Generate brain health quality grid for cognitive architecture
 * @version 1.0.0
 * @skill brain-qa
 * @currency 2026-04-20
 * @platform windows,macos,linux
 * @requires node
 *
 * Brain QA - Generates brain health quality grid
 * Location: .github/muscles/brain-qa.cjs
 * 
 * Single responsibility: Scan cognitive architecture, output quality grid.
 * Other trifectas handle fixing issues identified in the grid.
 * 
 * Pass criteria (all types):
 *   fm       - Frontmatter complete (type-specific required fields)
 *   currency - Updated within CURRENCY_MAX_DAYS (90 days)
 * 
 * Informational dimensions (shown in grid, not scored):
 *   tri    - Trifecta complete (if workflow skill, has .instructions.md)
 *   inh    - Inheritance (1 = master-only, 0 = synced to heirs)
 *            Validated during currency audits to ensure master-only items don't leak
 *   cur    - Currency date (YYYY-MM-DD) when content was last researched & updated
 * 
 * 
 * Usage:
 *   node brain-qa.cjs              # Generate grid to .github/quality/
 *   node brain-qa.cjs --stdout     # Output to stdout instead of file
 */

"use strict";

const fs = require("fs");
const path = require("path");
const skillMeta = require("./shared/skill-meta.cjs");

// --- Config ---
const ROOT = path.resolve(__dirname, "..", "..");
const GH = path.join(ROOT, ".github");
const QUALITY_DIR = path.join(GH, "quality");
const STDOUT_MODE = process.argv.includes("--stdout");

// --- Review Cadence Sidecar (FM8a) ---
// Lifecycle-driven currency windows loaded from .github/config/review-cadence.json.
// Falls back to a flat 90-day window if the sidecar is missing.
const REVIEW_CADENCE_PATH = path.join(GH, "config", "review-cadence.json");
let reviewCadence = null;
try {
  reviewCadence = JSON.parse(fs.readFileSync(REVIEW_CADENCE_PATH, "utf-8"));
} catch { /* degrade gracefully — use flat threshold */ }

const LIFECYCLE_WINDOWS = reviewCadence?.lifecycleWindows ?? {};
const LIFECYCLE_GATES = reviewCadence?.lifecycleGates ?? {};

// Legacy flat threshold — used when lifecycle is unknown or sidecar missing
const CURRENCY_MAX_DAYS = 90;

// --- Drift Detection Helpers ---

/**
 * List brain file names in a directory for drift detection.
 * Skills use subdirectory names; others use file basenames.
 */
function listBrainFiles(dir, category) {
  if (!fs.existsSync(dir)) return [];
  try {
    if (category === "skills") {
      return fs.readdirSync(dir, { withFileTypes: true })
        .filter(d => d.isDirectory() && fs.existsSync(path.join(dir, d.name, "SKILL.md")))
        .map(d => d.name);
    }
    return fs.readdirSync(dir)
      .filter(f => f.endsWith(".md") || f.endsWith(".cjs") || f.endsWith(".json"));
  } catch {
    return [];
  }
}

// --- Token Waste Detection ---
// Brain files are LLM-consumed. Mermaid diagrams render for humans, not LLMs.
// LLMs see raw syntax like "flowchart LR" and "style X fill:#..." which waste tokens.
// Better: Use concise prose descriptions (e.g., "A → B → C").
//
// EXCEPTION: Skills that TEACH Mermaid (markdown-mermaid) may legitimately have examples.
// These should be minimal and clearly labeled as "example output" not workflow docs.

/**
 * Detect token waste patterns in brain files
 * @param {string} content - File content
 * @returns {{mermaidBlocks: number, mermaidLines: number, styleLines: number, wasteScore: number}}
 */
function detectTokenWaste(content) {
  // Count Mermaid blocks
  const mermaidMatches = content.match(/```mermaid[\s\S]*?```/g) || [];
  const mermaidBlocks = mermaidMatches.length;
  
  // Count lines inside Mermaid blocks
  const mermaidLines = mermaidMatches.reduce((sum, block) => {
    return sum + block.split('\n').length;
  }, 0);
  
  // Count style/linkStyle lines (pure visual, zero value to LLM)
  const styleLines = (content.match(/^\s*(style|linkStyle)\s+/gm) || []).length;
  
  // Calculate waste score (0 = clean, higher = more waste)
  // Each Mermaid block = 5 points (significant waste)
  // Each style line = 1 point (minor waste)
  const wasteScore = (mermaidBlocks * 5) + styleLines;
  
  return { mermaidBlocks, mermaidLines, styleLines, wasteScore };
}

// --- FM4: Mechanical Obsolescence Checks Library ---
// Reusable check functions. Each returns an array of finding strings (empty = pass).
// Check assignments per type come from review-cadence.json typeChecks.

const TYPE_CHECKS = reviewCadence?.typeChecks ?? {};

const CHECK_LIBRARY = {
  /**
   * Verify that file references (.github/skills/X, .github/instructions/X, etc.) resolve.
   * Covered by scanCrossReferences() globally; this per-file variant is lightweight.
   */
  'file-refs-exist': (content, filePath) => {
    const findings = [];
    const SKILL_RE = /(?:skills\/|skills\\)([\w-]+)(?:\/|\\)SKILL\.md/g;
    const INSTR_RE = /(?:instructions\/|instructions\\)([\w-]+)\.instructions\.md/g;
    for (const m of content.matchAll(SKILL_RE)) {
      if (!fs.existsSync(path.join(GH, "skills", m[1], "SKILL.md"))) {
        findings.push(`broken skill ref: ${m[1]}`);
      }
    }
    for (const m of content.matchAll(INSTR_RE)) {
      if (!fs.existsSync(path.join(GH, "instructions", `${m[1]}.instructions.md`))) {
        findings.push(`broken instruction ref: ${m[1]}`);
      }
    }
    return findings;
  },

  /**
   * Verify that applyTo glob pattern matches at least one file in .github/.
   * Empty applyTo or universal patterns (**) always pass.
   */
  'applyTo-matches-something': (content, _filePath) => {
    const match = content.match(/^applyTo:\s*["']?(.+?)["']?\s*$/m);
    if (!match) return ['missing applyTo field'];
    const raw = match[1].trim();
    if (raw === '**' || raw === '**/*' || raw === '**/**') return [];
    // Check each comma-separated pattern has meaningful specificity
    const patterns = raw.split(',').map(p => p.trim());
    const empty = patterns.filter(p => !p || p === '**' || p === '**/*');
    if (empty.length === patterns.length) return ['applyTo has only universal patterns'];
    return [];
  },

  /**
   * Verify that referenced VS Code commands exist in package.json.
   * Matches patterns like `alex.commandName` or `workbench.action.X`.
   */
  'referenced-commands-exist': (content, _filePath) => {
    // Only check alex.* commands (not VS Code built-ins)
    const cmdRefs = content.matchAll(/\balex\.([\w.]+)/g);
    const findings = [];
    // Load commands from package.json if available
    const pkgPath = path.join(ROOT, "heir", "platforms", "vscode-extension", "package.json");
    let knownCommands = null;
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      knownCommands = new Set((pkg.contributes?.commands || []).map(c => c.command));
    } catch { /* extension package.json not available */ }

    if (knownCommands) {
      for (const m of cmdRefs) {
        const cmd = `alex.${m[1]}`;
        if (!knownCommands.has(cmd)) {
          findings.push(`unknown command: ${cmd}`);
        }
      }
    }
    return findings;
  },

  /**
   * Verify that markdown links resolve to existing files.
   * Checks relative links like [text](../path/file.md).
   */
  'markdown-links-resolve': (content, filePath) => {
    const findings = [];
    const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g;
    const dir = path.dirname(filePath);
    for (const m of content.matchAll(linkRe)) {
      const target = m[2];
      // Skip URLs, anchors, mailto, and template vars
      if (/^(https?:|mailto:|#|\{\{)/.test(target)) continue;
      // Strip anchor from path
      const cleanTarget = target.split('#')[0];
      if (!cleanTarget) continue;
      const resolved = path.resolve(dir, cleanTarget);
      if (!fs.existsSync(resolved)) {
        findings.push(`broken link: ${target}`);
      }
    }
    return findings;
  },

  /**
   * Verify that skill files contain at least one decision table (## header with table).
   */
  'decision-table-present': (content, _filePath) => {
    // Look for markdown tables (| ... | pattern after a ## header)
    const hasTable = /^##.*(?:decision|triage|table)/im.test(content) ||
                     /^\|.*\|.*\|/m.test(content);
    if (!hasTable) return ['no decision table found'];
    return [];
  },
};

/**
 * Run mechanical obsolescence checks for a brain file.
 * @param {string} content - File content
 * @param {string} filePath - Absolute file path
 * @param {string|null} fileType - ADR-014 type (skill, instruction, etc.)
 * @returns {{ checks: string[], findings: string[] }}
 */
function runMechanicalChecks(content, filePath, fileType) {
  const checkNames = TYPE_CHECKS[fileType] || [];
  const findings = [];
  for (const checkName of checkNames) {
    const fn = CHECK_LIBRARY[checkName];
    if (!fn) continue;
    const result = fn(content, filePath);
    findings.push(...result.map(f => `[${checkName}] ${f}`));
  }
  return { checks: checkNames, findings };
}

// --- Cross-Reference Validation (QA3) ---
// Scans brain files for references to other brain files and checks targets exist.
// Detects: skill→skill, skill→instruction, instruction→skill, agent→skill references.

function scanCrossReferences() {
  const brokenRefs = [];

  // Build inventory of existing brain files
  const skillsDir = path.join(GH, "skills");
  const instrDir = path.join(GH, "instructions");
  const agentsDir = path.join(GH, "agents");
  const promptsDir = path.join(GH, "prompts");
  const musclesDir = path.join(GH, "muscles");

  const existingSkills = new Set();
  if (fs.existsSync(skillsDir)) {
    fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && fs.existsSync(path.join(skillsDir, d.name, "SKILL.md")))
      .forEach(d => existingSkills.add(d.name));
  }

  const existingInstructions = new Set();
  if (fs.existsSync(instrDir)) {
    fs.readdirSync(instrDir)
      .filter(f => f.endsWith(".instructions.md"))
      .forEach(f => existingInstructions.add(f.replace(".instructions.md", "")));
  }

  const existingAgents = new Set();
  if (fs.existsSync(agentsDir)) {
    fs.readdirSync(agentsDir)
      .filter(f => f.endsWith(".agent.md"))
      .forEach(f => existingAgents.add(f.replace(".agent.md", "")));
  }

  const existingPrompts = new Set();
  if (fs.existsSync(promptsDir)) {
    // Root-level prompts
    fs.readdirSync(promptsDir)
      .filter(f => f.endsWith(".prompt.md"))
      .forEach(f => existingPrompts.add(f.replace(".prompt.md", "")));
    // Subdirectory prompts
    fs.readdirSync(promptsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .forEach(d => {
        const sub = path.join(promptsDir, d.name);
        fs.readdirSync(sub)
          .filter(f => f.endsWith(".prompt.md"))
          .forEach(f => existingPrompts.add(f.replace(".prompt.md", "")));
      });
  }

  const existingMuscles = new Set();
  if (fs.existsSync(musclesDir)) {
    fs.readdirSync(musclesDir)
      .filter(f => f.endsWith(".cjs") || f.endsWith(".js") || f.endsWith(".ps1"))
      .forEach(f => existingMuscles.add(f));
  }

  // Reference patterns to detect in brain file content
  // Matches: skills/name, skill-name (when preceded by skill-related context),
  // .instructions.md file refs, .agent.md file refs, SKILL.md paths

  const SKILL_PATH_RE = /(?:skills\/|skills\\)([\w-]+)(?:\/|\\)SKILL\.md/g;
  const INSTR_PATH_RE = /(?:instructions\/|instructions\\)([\w-]+)\.instructions\.md/g;
  const AGENT_PATH_RE = /(?:agents\/|agents\\)([\w-]+)\.agent\.md/g;
  const PROMPT_PATH_RE = /(?:prompts\/|prompts\\)(?:[\w-]+\/)?([\w-]+)\.prompt\.md/g;
  const MUSCLE_PATH_RE = /(?:muscles\/|muscles\\)([\w-]+\.(?:cjs|js|ps1))/g;

  // Scan a directory of brain files for cross-references
  function scanDir(dir, fileFilter, sourceLabel) {
    if (!fs.existsSync(dir)) return;

    const entries = fileFilter(dir);
    for (const { name, content } of entries) {
      // Check skill references
      for (const match of content.matchAll(SKILL_PATH_RE)) {
        if (!existingSkills.has(match[1])) {
          brokenRefs.push({ source: `${sourceLabel}/${name}`, refType: 'skill', target: match[1] });
        }
      }
      // Check instruction references
      for (const match of content.matchAll(INSTR_PATH_RE)) {
        if (!existingInstructions.has(match[1])) {
          brokenRefs.push({ source: `${sourceLabel}/${name}`, refType: 'instruction', target: match[1] });
        }
      }
      // Check agent references
      for (const match of content.matchAll(AGENT_PATH_RE)) {
        if (!existingAgents.has(match[1])) {
          brokenRefs.push({ source: `${sourceLabel}/${name}`, refType: 'agent', target: match[1] });
        }
      }
      // Check prompt references
      for (const match of content.matchAll(PROMPT_PATH_RE)) {
        if (!existingPrompts.has(match[1])) {
          brokenRefs.push({ source: `${sourceLabel}/${name}`, refType: 'prompt', target: match[1] });
        }
      }
      // Check muscle references
      for (const match of content.matchAll(MUSCLE_PATH_RE)) {
        if (!existingMuscles.has(match[1])) {
          brokenRefs.push({ source: `${sourceLabel}/${name}`, refType: 'muscle', target: match[1] });
        }
      }
    }
  }

  // Skill files
  scanDir(skillsDir, (dir) => {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isDirectory() && fs.existsSync(path.join(dir, d.name, "SKILL.md")))
      .map(d => ({
        name: d.name,
        content: fs.readFileSync(path.join(dir, d.name, "SKILL.md"), "utf-8"),
      }));
  }, 'skills');

  // Instruction files
  scanDir(instrDir, (dir) => {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith(".instructions.md"))
      .map(f => ({
        name: f.replace(".instructions.md", ""),
        content: fs.readFileSync(path.join(dir, f), "utf-8"),
      }));
  }, 'instructions');

  // Agent files
  scanDir(agentsDir, (dir) => {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith(".agent.md"))
      .map(f => ({
        name: f.replace(".agent.md", ""),
        content: fs.readFileSync(path.join(dir, f), "utf-8"),
      }));
  }, 'agents');

  // Deduplicate (same source+target may appear from repeated references)
  // Filter out placeholder/example names commonly found in documentation
  const PLACEHOLDER_NAMES = new Set(['name', 'my', 'example', 'your', 'sample', 'foo', 'bar', 'test']);
  const seen = new Set();
  return brokenRefs.filter(ref => {
    if (PLACEHOLDER_NAMES.has(ref.target)) return false;
    const key = `${ref.source}|${ref.refType}|${ref.target}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// --- QA5: Skill Conflict Detection ---
// Detects potential conflicts where two brain files (skills or instructions)
// have overlapping applyTo patterns AND overlapping topic keywords.
// Structural heuristic — flags pairs for manual review, not definitive conflicts.

/**
 * Extract glob keywords from an applyTo pattern string.
 * E.g. "**\/*api*,**\/*rest*,**\/*.bicep" → Set{"api","rest","bicep"}
 */
function extractApplyToKeywords(applyTo) {
  if (!applyTo || applyTo === "**" || applyTo === "**/*") return new Set();
  const keywords = new Set();
  const segments = applyTo.split(",").map(s => s.trim());
  for (const seg of segments) {
    // Extract meaningful identifiers from glob patterns
    // Match word chars between * or / delimiters: **/*api* → api, **/*.bicep → bicep
    const matches = seg.matchAll(/\*([a-z][a-z0-9-]+)\*|\.([a-z][a-z0-9]+)/gi);
    for (const m of matches) {
      const kw = (m[1] || m[2] || "").toLowerCase();
      if (kw && kw.length > 2) keywords.add(kw);
    }
    // Also match exact folder/file names: **/agents/*, **/test/**
    const folderMatch = seg.matchAll(/\/([\w-]{3,})\//g);
    for (const m of folderMatch) {
      keywords.add(m[1].toLowerCase());
    }
  }
  return keywords;
}

/**
 * Extract topic keywords from file name, description, and section headers.
 * Returns Set of lowercase terms (stop words filtered).
 */
function extractTopicKeywords(name, content) {
  const STOP_WORDS = new Set([
    "the", "and", "for", "with", "from", "that", "this", "are", "was",
    "will", "can", "has", "have", "been", "being", "use", "used", "using",
    "not", "but", "all", "any", "each", "how", "when", "where", "what",
    "into", "over", "also", "more", "most", "than", "then", "some",
    "patterns", "best", "practices", "rules", "guidelines", "instructions",
    "skill", "always", "active", "ensure", "apply", "based", "should",
  ]);

  const keywords = new Set();

  // From name (split on hyphens)
  for (const part of name.split("-")) {
    const lc = part.toLowerCase();
    if (lc.length > 2 && !STOP_WORDS.has(lc)) keywords.add(lc);
  }

  // From description in frontmatter
  const descMatch = content.match(/^description:\s*["']?(.+?)["']?\s*$/m);
  if (descMatch) {
    const words = descMatch[1].toLowerCase().replace(/[^a-z0-9\s-]/g, "").split(/\s+/);
    for (const w of words) {
      if (w.length > 3 && !STOP_WORDS.has(w)) keywords.add(w);
    }
  }

  // From ## section headers
  const headers = content.matchAll(/^##\s+(.+)$/gm);
  for (const h of headers) {
    const words = h[1].toLowerCase().replace(/[^a-z0-9\s-]/g, "").split(/\s+/);
    for (const w of words) {
      if (w.length > 3 && !STOP_WORDS.has(w)) keywords.add(w);
    }
  }

  return keywords;
}

/**
 * Compute set intersection size.
 */
function setIntersection(a, b) {
  const result = new Set();
  for (const item of a) {
    if (b.has(item)) result.add(item);
  }
  return result;
}

/**
 * Scan skills and instructions for potential conflicts.
 * A conflict = overlapping applyTo AND overlapping topics.
 */
function detectSkillConflicts() {
  const conflicts = [];

  // Collect all brain files with applyTo and topic keywords
  const entries = [];

  // Skills
  const skillsDir = path.join(GH, "skills");
  if (fs.existsSync(skillsDir)) {
    const dirs = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory());
    for (const d of dirs) {
      const fp = path.join(skillsDir, d.name, "SKILL.md");
      if (!fs.existsSync(fp)) continue;
      const content = fs.readFileSync(fp, "utf-8");
      const applyToMatch = content.match(/^applyTo:\s*(.+)$/m);
      const applyTo = applyToMatch ? applyToMatch[1].trim().replace(/^["']|["']$/g, "") : "";
      entries.push({
        type: "skill",
        name: d.name,
        applyToKeywords: extractApplyToKeywords(applyTo),
        topicKeywords: extractTopicKeywords(d.name, content),
        rawApplyTo: applyTo,
      });
    }
  }

  // Instructions
  const instrDir = path.join(GH, "instructions");
  if (fs.existsSync(instrDir)) {
    const files = fs.readdirSync(instrDir).filter(f => f.endsWith(".instructions.md"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(instrDir, file), "utf-8");
      const name = file.replace(".instructions.md", "");
      const applyToMatch = content.match(/^applyTo:\s*(.+)$/m);
      const applyTo = applyToMatch ? applyToMatch[1].trim().replace(/^["']|["']$/g, "") : "";
      entries.push({
        type: "instruction",
        name,
        applyToKeywords: extractApplyToKeywords(applyTo),
        topicKeywords: extractTopicKeywords(name, content),
        rawApplyTo: applyTo,
      });
    }
  }

  // Compare all pairs — skip always-on files (applyTo: ** with no keywords)
  // and skip trifecta pairs (skill + its own instruction)
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];

      // Skip trifecta pairs (matched skill+instruction is expected overlap)
      if (a.name === b.name) continue;

      // Skip if either has no applyTo keywords (always-on = intentional broad scope)
      if (a.applyToKeywords.size === 0 || b.applyToKeywords.size === 0) continue;

      // Check applyTo overlap (need ≥2 shared keywords for meaningful overlap)
      const applyOverlap = setIntersection(a.applyToKeywords, b.applyToKeywords);
      if (applyOverlap.size < 2) continue;

      // Check topic overlap (need ≥3 shared topic keywords to flag)
      const topicOverlap = setIntersection(a.topicKeywords, b.topicKeywords);
      if (topicOverlap.size < 3) continue;

      // Score: applyTo overlap weight + topic overlap weight
      const score = applyOverlap.size * 3 + topicOverlap.size;

      conflicts.push({
        fileA: `${a.type}/${a.name}`,
        fileB: `${b.type}/${b.name}`,
        applyOverlap: [...applyOverlap],
        topicOverlap: [...topicOverlap].slice(0, 5), // cap display
        score,
      });
    }
  }

  // Sort by score descending
  conflicts.sort((a, b) => b.score - a.score);

  return conflicts;
}

// --- Ensure quality folder exists ---
if (!fs.existsSync(QUALITY_DIR)) {
  fs.mkdirSync(QUALITY_DIR, { recursive: true });
}

// --- Load master-only skills from sync-architecture.cjs ---
function getMasterOnlySkills() {
  const syncPath = path.join(GH, "muscles", "sync-architecture.cjs");
  if (!fs.existsSync(syncPath)) return new Set();

  const content = fs.readFileSync(syncPath, "utf-8");
  const masterOnly = new Set();

  // Extract SKILL_EXCLUSIONS map entries with "master-only"
  const mapMatch = content.match(/const SKILL_EXCLUSIONS = \{([\s\S]*?)\};/);
  if (mapMatch) {
    const entries = mapMatch[1].matchAll(/"([\w-]+)":\s*"master-only"/g);
    for (const entry of entries) {
      masterOnly.add(entry[1]);
    }
  }

  return masterOnly;
}

const MASTER_ONLY_SKILLS = getMasterOnlySkills();

// --- Currency freshness (FM8a: lifecycle-driven) ---
// Returns { status: 'FRESH'|'WARNING'|'STALE'|'SKIP', daysSince, window, gate }
function getCurrencyStatus(currency, lifecycle) {
  if (!lifecycle || lifecycle === 'deprecated') {
    return { status: 'SKIP', daysSince: null, window: null, gate: 'skip' };
  }
  if (currency === '-') {
    // Missing currency — always stale
    const window = LIFECYCLE_WINDOWS[lifecycle] ?? CURRENCY_MAX_DAYS;
    const gate = LIFECYCLE_GATES[lifecycle] ?? 'fail';
    return { status: 'STALE', daysSince: Infinity, window, gate };
  }
  const currDate = new Date(currency);
  if (isNaN(currDate.getTime())) {
    const window = LIFECYCLE_WINDOWS[lifecycle] ?? CURRENCY_MAX_DAYS;
    const gate = LIFECYCLE_GATES[lifecycle] ?? 'fail';
    return { status: 'STALE', daysSince: Infinity, window, gate };
  }

  const daysSince = Math.floor((Date.now() - currDate.getTime()) / (1000 * 60 * 60 * 24));
  const window = LIFECYCLE_WINDOWS[lifecycle] ?? CURRENCY_MAX_DAYS;
  const gate = LIFECYCLE_GATES[lifecycle] ?? 'fail';
  const warningBand = Math.ceil(window * 1.25);

  if (daysSince <= window) {
    return { status: 'FRESH', daysSince, window, gate };
  }
  if (daysSince <= warningBand) {
    return { status: 'WARNING', daysSince, window, gate };
  }
  return { status: 'STALE', daysSince, window, gate };
}

// Legacy flat check — kept for backward compatibility with exports
function isCurrencyRecent(currency) {
  if (currency === '-') return false;
  const currDate = new Date(currency);
  if (isNaN(currDate.getTime())) return false;
  const daysSince = Math.floor((Date.now() - currDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysSince <= CURRENCY_MAX_DAYS;
}

/**
 * Determine pass/fail for currency using lifecycle-aware windows (FM8a).
 * Returns true if file is FRESH or WARNING, or if gate is 'skip'/'warn'.
 */
function isCurrencyPassing(currency, lifecycle) {
  const cs = getCurrencyStatus(currency, lifecycle);
  if (cs.status === 'SKIP' || cs.status === 'FRESH' || cs.status === 'WARNING') return true;
  // STALE: fail unless gate is 'warn' (experimental files)
  return cs.gate === 'warn';
}

// --- Trifecta helpers (shared with dream-cli via shared/skill-meta.cjs) ---
const hasMatchingInstruction = (skillName) => skillMeta.hasMatchingInstruction(GH, skillName);
const isWorkflowSkill = skillMeta.isWorkflowSkill;

// --- Skill Quality Scanner ---
function scanSkills() {
  const skillsDir = path.join(GH, "skills");
  if (!fs.existsSync(skillsDir)) return [];

  const results = [];
  const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const name of skillDirs) {
    const skillPath = path.join(skillsDir, name, "SKILL.md");
    if (!fs.existsSync(skillPath)) continue;

    const content = fs.readFileSync(skillPath, "utf-8");
    const lines = content.split("\n").length;

    // Check frontmatter completeness
    const hasName = /^name:/m.test(content);
    const hasDesc = /^description:/m.test(content);
    const hasApplyTo = /^applyTo:/m.test(content);
    const hasTier = /^tier:/m.test(content);
    const fmComplete = hasName && hasDesc && hasApplyTo && hasTier;

    // Extract tier value (informational)
    const tierMatch = content.match(/^tier:\s*(\w+)/m);
    const tier = tierMatch ? tierMatch[1].toLowerCase() : 'standard';

    // Check trifecta (only flag if workflow skill missing instruction)
    const isWorkflow = isWorkflowSkill(content);
    const hasInstr = hasMatchingInstruction(name);
    const triComplete = !isWorkflow || hasInstr;

    // Check inheritance (master-only)
    const isMasterOnly = MASTER_ONLY_SKILLS.has(name);

    // Extract currency date from frontmatter
    const currencyMatch = content.match(/^currency:\s*(\d{4}-\d{2}-\d{2})/m);
    const currency = currencyMatch ? currencyMatch[1] : '-';

    // Extract typed frontmatter (FM7 + FM8a)
    const typeMatch = content.match(/^type:\s*(\S+)/m);
    const lifecycleMatch = content.match(/^lifecycle:\s*(\S+)/m);
    const fileType = typeMatch ? typeMatch[1] : null;
    const lifecycle = lifecycleMatch ? lifecycleMatch[1] : null;
    const typed = !!(fileType && lifecycle);

    // Currency status (FM8a: lifecycle-driven)
    const currencyStatus = getCurrencyStatus(currency, lifecycle);

    // Quality flags (informational)
    const flags = {
      fm: fmComplete ? 1 : 0,
      tri: triComplete ? 1 : 0,
      inh: isMasterOnly ? 1 : 0,
    };

    // Pass = frontmatter complete AND currency passing (lifecycle-aware)
    const pass = fmComplete && isCurrencyPassing(currency, lifecycle);

    const waste = detectTokenWaste(content);

    // FM4: Mechanical obsolescence checks
    const mechChecks = runMechanicalChecks(content, path.join(skillsDir, name, "SKILL.md"), fileType || 'skill');

    results.push({ name, lines, flags, tier, pass, isWorkflow, waste, currency, lifecycle, fileType, typed, currencyStatus, mechChecks });
  }

  // Sort: failing first, then oldest currency, then alphabetically
  return results.sort((a, b) => {
    if (a.pass !== b.pass) return a.pass ? 1 : -1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency < b.currency) return -1;
    if (a.currency > b.currency) return 1;
    return a.name.localeCompare(b.name);
  });
}

// --- Agent Scanner ---
function scanAgents() {
  const agentsDir = path.join(GH, "agents");
  if (!fs.existsSync(agentsDir)) return [];

  const results = [];
  const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith(".agent.md"));

  for (const file of agentFiles) {
    const content = fs.readFileSync(path.join(agentsDir, file), "utf-8");
    const lines = content.split("\n").length;
    const name = file.replace(".agent.md", "");

    // Check frontmatter completeness (all 4 required)
    const hasDesc = /^description:/m.test(content);
    const hasName = /^name:/m.test(content);
    const hasModel = /^model:/m.test(content);
    const hasTools = /^tools:/m.test(content);
    const fmComplete = hasDesc && hasName && hasModel && hasTools;

    // Check handoffs
    const hasHandoffs = /^handoffs:/m.test(content);

    // Check persona (has mental model / when to use / persona section)
    const hasPersona = /##\s*(mental model|when to use|persona|mindset|core directive|core identity)/i.test(content);

    // Extract currency date from frontmatter
    const currencyMatch = content.match(/^currency:\s*(\d{4}-\d{2}-\d{2})/m);
    const currency = currencyMatch ? currencyMatch[1] : '-';

    // Extract typed frontmatter (FM7 + FM8a)
    const typeMatch = content.match(/^type:\s*(\S+)/m);
    const lifecycleMatch = content.match(/^lifecycle:\s*(\S+)/m);
    const fileType = typeMatch ? typeMatch[1] : null;
    const lifecycle = lifecycleMatch ? lifecycleMatch[1] : null;
    const typed = !!(fileType && lifecycle);

    // Currency status (FM8a: lifecycle-driven)
    const currencyStatus = getCurrencyStatus(currency, lifecycle);

    // Token waste detection (Mermaid diagrams, style lines)
    const waste = detectTokenWaste(content);

    const flags = {
      fm: fmComplete ? 1 : 0,
      handoffs: hasHandoffs ? 1 : 0,
      persona: hasPersona ? 1 : 0,
    };

    // Pass = frontmatter complete AND currency passing (lifecycle-aware)
    const pass = fmComplete && isCurrencyPassing(currency, lifecycle);
    results.push({ name, lines, flags, pass, currency, waste, lifecycle, fileType, typed, currencyStatus });
  }

  // Sort: failing first, then oldest currency, then alphabetically
  return results.sort((a, b) => {
    if (a.pass !== b.pass) return a.pass ? 1 : -1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency < b.currency) return -1;
    if (a.currency > b.currency) return 1;
    return a.name.localeCompare(b.name);
  });
}

// --- Instruction Scanner ---
function scanInstructions() {
  const instrDir = path.join(GH, "instructions");
  if (!fs.existsSync(instrDir)) return [];

  // Get list of existing skills for trifecta check
  const skillsDir = path.join(GH, "skills");
  const existingSkills = new Set();
  if (fs.existsSync(skillsDir)) {
    fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .forEach(d => existingSkills.add(d.name));
  }

  const results = [];
  const files = fs.readdirSync(instrDir).filter(f => f.endsWith(".instructions.md"));

  for (const file of files) {
    const content = fs.readFileSync(path.join(instrDir, file), "utf-8");
    const lines = content.split("\n").length;
    const name = file.replace(".instructions.md", "");

    // Check frontmatter completeness (description + application for discoverability)
    const hasDesc = /^description:/m.test(content);
    const hasApplication = /^application:/m.test(content);
    const fmComplete = hasDesc && hasApplication;

    // Check depth (>50 lines for substantive content)
    const hasDepth = lines > 50;

    // Check structure (≥2 ## section headers)
    const sectionCount = (content.match(/^##\s+/gm) || []).length;
    const hasStructure = sectionCount >= 2;

    // Check trifecta (has matching skill)
    const hasSkill = existingSkills.has(name);

    // Extract currency date from frontmatter
    const currencyMatch = content.match(/^currency:\s*(\d{4}-\d{2}-\d{2})/m);
    const currency = currencyMatch ? currencyMatch[1] : '-';

    // Extract typed frontmatter (FM7 + FM8a)
    const typeMatch = content.match(/^type:\s*(\S+)/m);
    const lifecycleMatch = content.match(/^lifecycle:\s*(\S+)/m);
    const fileType = typeMatch ? typeMatch[1] : null;
    const lifecycle = lifecycleMatch ? lifecycleMatch[1] : null;
    const typed = !!(fileType && lifecycle);

    // Currency status (FM8a: lifecycle-driven)
    const currencyStatus = getCurrencyStatus(currency, lifecycle);

    const flags = {
      fm: fmComplete ? 1 : 0,
      depth: hasDepth ? 1 : 0,
      sect: hasStructure ? 1 : 0,
      skill: hasSkill ? 1 : 0,
    };

    // Pass = frontmatter complete AND currency passing (lifecycle-aware)
    const pass = fmComplete && isCurrencyPassing(currency, lifecycle);

    // Token waste detection (Mermaid diagrams, style lines)
    const waste = detectTokenWaste(content);

    results.push({ name, lines, flags, pass, waste, currency, lifecycle, fileType, typed, currencyStatus });
  }

  // Sort: failing first, then oldest currency, then alphabetically
  return results.sort((a, b) => {
    if (a.pass !== b.pass) return a.pass ? 1 : -1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency < b.currency) return -1;
    if (a.currency > b.currency) return 1;
    return a.name.localeCompare(b.name);
  });
}

// --- Prompt Scanner ---
function scanPrompts() {
  const promptsDir = path.join(GH, "prompts");
  if (!fs.existsSync(promptsDir)) return [];

  const results = [];

  // Collect prompt files from root and subdirectories (e.g., loop/)
  const entries = fs.readdirSync(promptsDir, { withFileTypes: true });
  const promptFiles = [];

  // Root-level prompts
  for (const e of entries) {
    if (e.isFile() && e.name.endsWith(".prompt.md")) {
      promptFiles.push({ file: e.name, subdir: null });
    }
  }

  // Subdirectory prompts (e.g., prompts/loop/*.prompt.md)
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const subPath = path.join(promptsDir, e.name);
    const subFiles = fs.readdirSync(subPath).filter(f => f.endsWith(".prompt.md"));
    for (const sf of subFiles) {
      promptFiles.push({ file: sf, subdir: e.name });
    }
  }

  for (const { file, subdir } of promptFiles) {
    const fullPath = subdir
      ? path.join(promptsDir, subdir, file)
      : path.join(promptsDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    const lines = content.split("\n").length;
    const name = file.replace(".prompt.md", "");

    const hasDesc = /^description:/m.test(content);
    const hasApp = /^application:/m.test(content);
    const hasAgent = /^agent:/m.test(content) || /^mode:\s*agent/m.test(content);

    // Extract currency date from frontmatter
    const currencyMatch = content.match(/^currency:\s*(\d{4}-\d{2}-\d{2})/m);
    const currency = currencyMatch ? currencyMatch[1] : '-';

    // Extract typed frontmatter (FM7 + FM8a)
    const typeMatch = content.match(/^type:\s*(\S+)/m);
    const lifecycleMatch = content.match(/^lifecycle:\s*(\S+)/m);
    const fileType = typeMatch ? typeMatch[1] : null;
    const lifecycle = lifecycleMatch ? lifecycleMatch[1] : null;
    const typed = !!(fileType && lifecycle);

    // Currency status (FM8a: lifecycle-driven)
    const currencyStatus = getCurrencyStatus(currency, lifecycle);

    const flags = {
      desc: hasDesc ? 1 : 0,
      app: hasApp ? 1 : 0,
      agent: hasAgent ? 1 : 0,
      over20: lines > 20 ? 1 : 0,
    };

    const score = flags.desc + flags.app + flags.agent + flags.over20;
    // desc + app are GATES (prompt fm) AND currency passing (lifecycle-aware)
    const pass = hasDesc && hasApp && isCurrencyPassing(currency, lifecycle);
    results.push({ name, lines, flags, pass, subdir, currency, lifecycle, fileType, typed, currencyStatus });
  }

  // Sort: failing first, then oldest currency, then alphabetically
  return results.sort((a, b) => {
    if (a.pass !== b.pass) return a.pass ? 1 : -1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency < b.currency) return -1;
    if (a.currency > b.currency) return 1;
    return a.name.localeCompare(b.name);
  });
}

// --- Muscle Scanner ---
function scanMuscles() {
  const musclesDir = path.join(GH, "muscles");
  if (!fs.existsSync(musclesDir)) return [];

  // Helper to read @inheritance from file header
  function getInheritanceFromHeader(content) {
    const header = content.slice(0, 2000); // ~50 lines
    const match = header.match(/@inheritance\s+(master-only|inheritable)/);
    return match ? match[1] : 'inheritable'; // default
  }

  // Categorize muscles by pattern
  const CONVERTERS = ['md-to-word', 'md-to-html', 'md-to-eml', 'docx-to-md', 'md-scaffold', 'dashboard-scaffold', 'nav-inject'];
  const VALIDATION = ['brain-qa', 'audit', 'validate', 'converter-qa', 'markdown-lint'];
  const ANALYSIS = ['analyze', 'chart-recommend', 'data-profile', 'data-ingest'];
  const BUILD = ['build-extension', 'sync-architecture', 'install-hooks', 'new-skill'];

  function categorize(name) {
    const base = name.replace(/\.(cjs|js|ts|ps1)$/, '');
    if (CONVERTERS.some(c => base.includes(c))) return 'converter';
    if (VALIDATION.some(v => base.includes(v))) return 'validation';
    if (ANALYSIS.some(a => base.includes(a))) return 'analysis';
    if (BUILD.some(b => base.includes(b))) return 'build';
    return 'utility';
  }

  const results = [];
  const muscleExtensions = ['.cjs', '.js', '.ts', '.ps1'];
  const files = fs.readdirSync(musclesDir)
    .filter(f => muscleExtensions.some(ext => f.endsWith(ext)))
    .filter(f => !f.includes('.bak'))   // Exclude backup files
    .filter(f => !f.includes('.test.')); // Exclude test files

  for (const file of files) {
    const filePath = path.join(musclesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const lineCount = content.split("\n").length;
    const name = file;

    // Get language from extension
    const ext = path.extname(file);
    const lang = ext === '.ps1' ? 'ps' : ext === '.ts' ? 'ts' : 'js';

    // Get inheritance from @inheritance tag in file header
    const inh = getInheritanceFromHeader(content) === 'master-only' ? 1 : 0;

    // Check for well-documented code (header + inline comments)
    // Header: JSDoc block or PowerShell comment block
    const hasHeader = /^\/\*\*[\s\S]*?\*\//m.test(content) || /^<#[\s\S]*?#>/m.test(content);
    // Inline comments: at least 5 comment lines (// or #) throughout the code
    const inlineCommentCount = (content.match(/^\s*(\/\/|#(?!!))[^\n]*/gm) || []).length;
    const hasInlineComments = inlineCommentCount >= 5;
    const isWellDocumented = hasHeader && hasInlineComments;

    // Check for error handling and resiliency
    // JS: try/catch, .catch(), throw
    // PS: try/catch, $ErrorActionPreference, -ErrorAction, throw
    const jsErrorPatterns = /try\s*\{|\.catch\s*\(|catch\s*\(/i.test(content);
    const psErrorPatterns = /\$ErrorActionPreference|\-ErrorAction|try\s*\{/i.test(content);
    const hasErrorHandling = lang === 'ps' ? psErrorPatterns : jsErrorPatterns;

    // Check cross-platform compatibility (Windows/macOS)
    // JS: use path.join/path.resolve, avoid hardcoded separators
    // PS: use Join-Path/Split-Path, avoid hardcoded separators
    let isCrossPlatform = false;
    if (lang === 'ps') {
      // PowerShell: must use Join-Path or Split-Path for path operations
      const usesPathCmdlets = /Join-Path|Split-Path|\$PSScriptRoot/i.test(content);
      const hasHardcodedSeparators = /['"][^'"]*\\[^'"]*['"]/.test(content) && !/\\n|\\r|\\t/.test(content);
      isCrossPlatform = usesPathCmdlets && !hasHardcodedSeparators;
    } else {
      // JS/TS: must use path module for path operations
      const usesPathModule = /path\.(join|resolve|dirname|basename|sep)/i.test(content);
      const hasHardcodedSeparators = /['"][^'"]*[\\/][^'"]*['"]/.test(content) && !/\\n|\\r|\\t|https?:|file:|\/\//.test(content);
      isCrossPlatform = usesPathModule || !hasHardcodedSeparators;
    }

    // Extract currency date (when content was last researched against latest practices)
    const currencyMatch = content.match(/@currency\s*:?\s*(\d{4}-\d{2}-\d{2})/i);
    const currency = currencyMatch ? currencyMatch[1] : '-';

    // Extract typed frontmatter from JSDoc tags (FM7 + FM8a)
    const typeTagMatch = content.match(/@type\s*:?\s*(\S+)/i);
    const lifecycleTagMatch = content.match(/@lifecycle\s*:?\s*(\S+)/i);
    const fileType = typeTagMatch ? typeTagMatch[1] : null;
    const lifecycle = lifecycleTagMatch ? lifecycleTagMatch[1] : null;
    const typed = !!(fileType && lifecycle);

    // Currency status (FM8a: lifecycle-driven)
    const currencyStatus = getCurrencyStatus(currency, lifecycle);

    // Extract standard metadata tags from header comment
    // Format: @tag value (with optional colon)
    // Handle both CRLF and LF line endings
    const extractTag = (tag) => {
      const match = content.match(new RegExp(`@${tag}\\s*:?\\s*(.+?)(?:\\r?\\n|\\*|$)`, 'i'));
      return match ? match[1].trim() : null;
    };
    
    const meta = {
      muscle: extractTag('muscle'),           // Canonical muscle name
      description: extractTag('description'), // What it does
      skill: extractTag('skill'),             // Linked skill name
      platform: extractTag('platform'),       // Supported platforms (windows,macos,linux)
      requires: extractTag('requires'),       // External dependencies
    };
    
    // Check if muscle has standard header (all required tags present)
    // Required: @muscle, @description, @platform, @requires
    const hasStandardHeader = !!(meta.muscle && meta.description && meta.platform && meta.requires);

    // Get category
    const category = categorize(file);

    const flags = {
      comments: isWellDocumented ? 1 : 0,
      err: hasErrorHandling ? 1 : 0,
      compat: isCrossPlatform ? 1 : 0,
    };

    // Pass = standard header (muscle fm) AND currency passing (lifecycle-aware)
    const pass = hasStandardHeader && isCurrencyPassing(currency, lifecycle);

    results.push({ name, lines: lineCount, lang, category, inh, flags, pass, meta, hasStandardHeader, currency, lifecycle, fileType, typed, currencyStatus });
  }

  // Sort: failing first, then oldest currency, then alphabetically
  return results.sort((a, b) => {
    if (a.pass !== b.pass) return a.pass ? 1 : -1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency < b.currency) return -1;
    if (a.currency > b.currency) return 1;
    return a.name.localeCompare(b.name);
  });
}

// --- Scan Hooks ---
function scanHooks() {
  const hooksDir = path.join(GH, "muscles", "hooks");
  if (!fs.existsSync(hooksDir)) return [];

  const results = [];
  const files = fs.readdirSync(hooksDir)
    .filter(f => f.endsWith('.cjs') || f.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(hooksDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const lineCount = content.split("\n").length;
    const name = file;

    // Check for header documentation (JSDoc block)
    const hasHeader = /^\/\*\*[\s\S]*?\*\//m.test(content);

    // Check for stdin JSON parsing pattern (hooks consume JSON from stdin)
    const hasStdinParse = /readFileSync\s*\(\s*0\s*[,)]|process\.stdin/i.test(content);

    // Check for stdout JSON output (hooks emit JSON to stdout)
    const hasStdoutJson = /JSON\.stringify|console\.log\s*\(\s*JSON/i.test(content);

    // Check for error handling (try/catch around stdin parse or main logic)
    const hasErrorHandling = /try\s*\{[\s\S]*?catch/i.test(content);

    // Determine hook event from filename or content
    const eventMatch = content.match(/hook_event_name.*?["'](.*?)["']/i) ||
                       content.match(/@hook\s+(\S+)/i);
    const event = eventMatch ? eventMatch[1] : name.replace('.cjs', '').replace('.js', '');

    // Extract @currency date
    const currencyMatch = content.match(/@currency\s*:?\s*(\d{4}-\d{2}-\d{2})/i);
    const currency = currencyMatch ? currencyMatch[1] : '-';

    // Extract typed tags from JSDoc (FM7 + FM8a)
    const typeTagMatch = content.match(/@type\s*:?\s*(\S+)/i);
    const lifecycleTagMatch = content.match(/@lifecycle\s*:?\s*(\S+)/i);
    const fileType = typeTagMatch ? typeTagMatch[1] : null;
    const lifecycle = lifecycleTagMatch ? lifecycleTagMatch[1] : null;
    const typed = !!(fileType && lifecycle);

    // Currency status (FM8a: lifecycle-driven)
    const currencyStatus = getCurrencyStatus(currency, lifecycle);

    const flags = {
      header: hasHeader ? 1 : 0,
      stdin: hasStdinParse ? 1 : 0,
      stdout: hasStdoutJson ? 1 : 0,
      err: hasErrorHandling ? 1 : 0,
    };

    // Pass = header (hook fm) AND currency passing (lifecycle-aware)
    const pass = hasHeader && isCurrencyPassing(currency, lifecycle);

    results.push({ name, lines: lineCount, event, flags, pass, currency, lifecycle, fileType, typed, currencyStatus });
  }

  // Sort: failing first, then oldest currency, then alphabetically
  return results.sort((a, b) => {
    if (a.pass !== b.pass) return a.pass ? 1 : -1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency < b.currency) return -1;
    if (a.currency > b.currency) return 1;
    return a.name.localeCompare(b.name);
  });
}

// --- Generate Grid ---
function generateGrid() {
  const skills = scanSkills();
  const agents = scanAgents();
  const instructions = scanInstructions();
  const prompts = scanPrompts();
  const muscles = scanMuscles();
  const hooks = scanHooks();

  const date = new Date().toISOString().split("T")[0];
  const lines = [];

  lines.push("# Brain Health Grid");
  lines.push("");
  lines.push(`Generated: ${date}`);
  lines.push("");
  lines.push("> **Scope**: This is a **structural linter**, not a content quality gate. It validates frontmatter, currency freshness, cross-references, and potential skill conflicts — not whether advice is correct or examples are current. Content accuracy requires semantic review (see below).");
  lines.push("");
  lines.push("## Pass Criteria");
  lines.push("");
  lines.push("All brain file types use the same two-gate pass model:");
  lines.push("");
  lines.push("| Gate | Requirement | Meaning |");
  lines.push("|------|-------------|---------|");
  lines.push(`| **fm** | Frontmatter complete | Type-specific required fields present (visibility to the brain) |`);
  lines.push(`| **currency** | Within lifecycle window | Content researched within lifecycle-driven window (FM8a) |`);
  lines.push("");
  lines.push("**Pass = fm AND currency**. Other dimensions (tri, handoffs, persona, etc.) are shown as informational columns but do not affect pass/fail.");
  lines.push("");
  lines.push("### Lifecycle Currency Windows (FM8a)");
  lines.push("");
  lines.push("Currency thresholds are lifecycle-driven (from `.github/config/review-cadence.json`):");
  lines.push("");
  lines.push("| Lifecycle | Fresh | Warning | Stale | Gate |");
  lines.push("|-----------|------:|--------:|------:|------|");
  const lcOrder = ["stable", "evolving", "external-dependent", "experimental", "deprecated"];
  for (const lc of lcOrder) {
    const w = LIFECYCLE_WINDOWS[lc];
    const g = LIFECYCLE_GATES[lc] ?? "skip";
    if (w === null || w === undefined) {
      lines.push(`| \`${lc}\` | — | — | — | ${g} (review on cite) |`);
    } else {
      const warn = Math.ceil(w * 1.25);
      lines.push(`| \`${lc}\` | ≤${w}d | ${w + 1}–${warn}d | >${warn}d | ${g} |`);
    }
  }
  lines.push("");
  lines.push("### Type-Specific fm Requirements");
  lines.push("");
  lines.push("| Type | Required Fields |");
  lines.push("|------|----------------|");
  lines.push("| Skills | `name`, `description`, `applyTo`, `tier` |");
  lines.push("| Agents | `description`, `name`, `model`, `tools` |");
  lines.push("| Instructions | `description`, `application` |");
  lines.push("| Prompts | `description`, `application` |");
  lines.push("| Muscles | Standard header: `@muscle`, `@description`, `@platform`, `@requires` |");
  lines.push("| Hooks | JSDoc header block |");
  lines.push("");
  lines.push("### Informational Columns");
  lines.push("");
  lines.push("| Col | Meaning | Value |");
  lines.push("|:---:|---------|-------|");
  lines.push("| **tri** | Trifecta | 1 = workflow skill has matching `.instructions.md` |");
  lines.push("| **inh** | Inheritance | 1 = Master-only, 0 = Synced to heirs |");
  lines.push("| **Currency** | Currency date | YYYY-MM-DD (when content was last researched) |");
  lines.push("");
  lines.push("> **inh validation**: During currency audits, verify that master-only items (`inh=1`) have not leaked to heir projects. The inheritance flag is confirmed by cross-referencing the master-only skills list in `.github/config/MASTER-ALEX-PROTECTED.json`.");
  lines.push("");

  // Currency Audit Process section
  lines.push("## Currency Audit Process");
  lines.push("");
  lines.push("Currency is lifecycle-driven (FM8a). Each file's `lifecycle` determines how long its `currency` stamp stays valid. Override per-file with `reviewEvery` in frontmatter.");
  lines.push("");
  lines.push("Full checklist and type-specific guidance: `.github/skills/currency-audit/SKILL.md`");
  lines.push("");

  // Cognitive Rituals section (v8.4.0): show recency of meditation and self-actualization
  // from their respective snapshots when present.
  try {
    const medSnap = (() => {
      try { return JSON.parse(fs.readFileSync(path.join(ROOT, ".github", "quality", "meditation-snapshot.json"), "utf8")); } catch { return null; }
    })();
    const saSnap = (() => {
      try { return JSON.parse(fs.readFileSync(path.join(ROOT, ".github", "quality", "self-actualization-snapshot.json"), "utf8")); } catch { return null; }
    })();
    lines.push("## Cognitive Rituals");
    lines.push("");
    lines.push("| Ritual | Last Run | Days Since | Threshold | Status |");
    lines.push("|--------|----------|-----------:|----------:|--------|");
    const fmtRow = (ritual, last, days, threshold) => {
      const status = days === null ? "no record" : (days >= threshold ? `⚠ overdue` : "ok");
      return `| ${ritual} | ${last || "(none)"} | ${days === null ? "—" : days} | ${threshold} | ${status} |`;
    };
    lines.push(fmtRow("Meditation", medSnap?.lastMeditation, medSnap?.daysSinceLastMeditation ?? null, 7));
    lines.push(fmtRow("Self-Actualization", saSnap?.recency?.lastSelfActualization, saSnap?.recency?.daysSinceLastSelfActualization ?? null, 30));
    lines.push("");
    lines.push("> Snapshots: `.github/quality/meditation-snapshot.json`, `.github/quality/self-actualization-snapshot.json` (gitignored). Regenerate with the corresponding muscles in `.github/muscles/`.");
    lines.push("");
  } catch { /* degrade gracefully if snapshot files are unreadable */ }

  // Priority Queue section
  lines.push("## Priority Queue");
  lines.push("");
  lines.push("> **Sorted by urgency**: Failing first, then no currency date, then oldest currency. Top 20 shown.");
  lines.push("");

  // Collect all items with priority metadata
  const priorityItems = [];
  
  for (const s of skills) {
    priorityItems.push({
      type: 'skill',
      name: s.name,
      path: `../skills/${s.name}/SKILL.md`,
      pass: s.pass,
      currency: s.currency,
    });
  }
  
  for (const a of agents) {
    priorityItems.push({
      type: 'agent',
      name: a.name,
      path: `../agents/${a.name}.agent.md`,
      pass: a.pass,
      currency: a.currency,
    });
  }
  
  for (const i of instructions) {
    priorityItems.push({
      type: 'instruction',
      name: i.name,
      path: `../instructions/${i.name}.instructions.md`,
      pass: i.pass,
      currency: i.currency,
    });
  }
  
  for (const p of prompts) {
    priorityItems.push({
      type: 'prompt',
      name: p.name,
      path: `../prompts/${p.name}.prompt.md`,
      pass: p.pass,
      currency: p.currency,
    });
  }

  for (const m of muscles) {
    priorityItems.push({
      type: 'muscle',
      name: m.name,
      path: `../muscles/${m.name}`,
      pass: m.pass,
      currency: m.currency,
    });
  }

  for (const h of hooks) {
    priorityItems.push({
      type: 'hook',
      name: h.name,
      path: `../muscles/hooks/${h.name}`,
      pass: h.pass,
      currency: h.currency,
    });
  }

  // Sort: failing first, then no currency date, then oldest currency, then alphabetical
  priorityItems.sort((a, b) => {
    if (!a.pass && b.pass) return -1;
    if (a.pass && !b.pass) return 1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency !== '-' && b.currency !== '-') {
      if (a.currency < b.currency) return -1;
      if (a.currency > b.currency) return 1;
    }
    return a.name.localeCompare(b.name);
  });

  // Show top 20 items from the sorted list
  const topItems = priorityItems.slice(0, 20);
  
  if (topItems.length > 0) {
    lines.push("| # | Type | File | Pass | Currency | Action |");
    lines.push("|--:|:----:|------|:----:|:--------:|--------|");
    
    topItems.forEach((item, idx) => {
      const nameLink = `[${item.name}](${item.path})`;
      const passIcon = item.pass ? "✓" : "✗";
      const action = !item.pass ? "Fix defects" : (item.currency === '-' ? "Currency audit" : "Re-audit");
      lines.push(`| ${idx + 1} | ${item.type} | ${nameLink} | ${passIcon} | ${item.currency} | ${action} |`);
    });
    
    const totalFailing = priorityItems.filter(i => !i.pass).length;
    const totalNoCurrency = priorityItems.filter(i => i.pass && i.currency === '-').length;
    const totalWithCurrency = priorityItems.filter(i => i.currency !== '-').length;
    // Currency staleness: flag items with currency dates >180 days old
    const now = new Date();
    const STALE_DAYS = 180;
    const staleItems = priorityItems.filter(i => {
      if (i.currency === '-') return false;
      const currDate = new Date(i.currency);
      if (isNaN(currDate.getTime())) return false;
      const daysSince = Math.floor((now - currDate) / (1000 * 60 * 60 * 24));
      return daysSince > STALE_DAYS;
    });
    lines.push("");
    lines.push(`**Queue depth**: ${totalFailing} failing | ${totalNoCurrency} no currency | ${totalWithCurrency} with currency | ${priorityItems.length} total`);
    if (staleItems.length > 0) {
      lines.push(`**Stale currency**: ${staleItems.length} items have currency dates older than ${STALE_DAYS} days — audit recommended`);
    }
  } else {
    lines.push("**Status**: ✅ All brain files passing and reviewed");
  }
  lines.push("");

  // ── FM7: Typing Completeness ──────────────────────────────────
  lines.push("## Typing Completeness (FM7)");
  lines.push("");
  const allItems = [...skills, ...agents, ...instructions, ...prompts, ...muscles, ...hooks];
  const typedCount = allItems.filter(i => i.typed).length;
  const untypedCount = allItems.length - typedCount;
  const typingPct = allItems.length > 0 ? Math.round(100 * typedCount / allItems.length) : 0;
  lines.push(`**Coverage**: ${typedCount}/${allItems.length} files have \`type\` + \`lifecycle\` (${typingPct}%)`);
  if (untypedCount > 0) {
    lines.push("");
    lines.push(`**Untyped**: ${untypedCount} files missing \`type\` or \`lifecycle\` — run \`audit-frontmatter.cjs --fix\` to backfill`);
  }
  lines.push("");

  // ── FM9: Per-Lifecycle Currency Rollups ─────────────────────────
  lines.push("## Lifecycle Currency Rollups (FM9)");
  lines.push("");
  const lcBuckets = {};
  for (const item of allItems) {
    const lc = item.lifecycle || 'untyped';
    if (!lcBuckets[lc]) lcBuckets[lc] = { fresh: 0, warning: 0, stale: 0, skip: 0, total: 0 };
    lcBuckets[lc].total++;
    const st = item.currencyStatus?.status || 'STALE';
    if (st === 'FRESH') lcBuckets[lc].fresh++;
    else if (st === 'WARNING') lcBuckets[lc].warning++;
    else if (st === 'SKIP') lcBuckets[lc].skip++;
    else lcBuckets[lc].stale++;
  }
  lines.push("| Lifecycle | Total | Fresh | Warning | Stale | Skip |");
  lines.push("|-----------|------:|------:|--------:|------:|-----:|");
  for (const lc of [...lcOrder, 'untyped']) {
    const b = lcBuckets[lc];
    if (!b) continue;
    lines.push(`| \`${lc}\` | ${b.total} | ${b.fresh} | ${b.warning} | ${b.stale} | ${b.skip} |`);
  }
  lines.push("");

  // ── FM4: Mechanical Obsolescence Checks ─────────────────────────
  const allMechFindings = skills.filter(s => s.mechChecks && s.mechChecks.findings.length > 0);
  if (allMechFindings.length > 0) {
    lines.push("## Mechanical Checks (FM4)");
    lines.push("");
    lines.push(`**Status**: ⚠️ ${allMechFindings.length} skill(s) with mechanical findings`);
    lines.push("");
    lines.push("| Skill | Findings |");
    lines.push("|-------|----------|");
    for (const s of allMechFindings.slice(0, 20)) {
      lines.push(`| ${s.name} | ${s.mechChecks.findings.join('; ')} |`);
    }
    if (allMechFindings.length > 20) {
      lines.push(`| ... | ${allMechFindings.length - 20} more |`);
    }
    lines.push("");
  } else {
    lines.push("## Mechanical Checks (FM4)");
    lines.push("");
    lines.push("**Status**: ✅ All skills pass mechanical checks");
    lines.push("");
  }

  // Skills table
  lines.push("## Skills");
  lines.push("");
  lines.push("| Skill | Tier | Lines | fm | tri | Pass | inh | Currency |");
  lines.push("|-------|:----:|------:|:--:|:---:|:----:|:---:|:--------:|");

  for (const s of skills) {
    const f = s.flags;
    const tierAbbr = s.tier.substring(0, 4);
    const passIcon = s.pass ? "✓" : "✗";
    const nameLink = `[${s.name}](../skills/${s.name}/SKILL.md)`;
    lines.push(`| ${nameLink} | ${tierAbbr} | ${s.lines} | ${f.fm} | ${f.tri} | ${passIcon} | ${f.inh} | ${s.currency} |`);
  }

  // Skills summary
  const passing = skills.filter(s => s.pass).length;
  const failing = skills.filter(s => !s.pass).length;

  lines.push("");
  lines.push(`**Summary**: ${skills.length} skills | Passing: ${passing} | Failing: ${failing}`);
  lines.push("");

  // Agents table
  lines.push("## Agents");
  lines.push("");
  lines.push("| Agent | Lines | fm | handoffs | persona | Pass | Currency |");
  lines.push("|-------|------:|:--:|:--------:|:-------:|:----:|:--------:|");

  for (const a of agents) {
    const f = a.flags;
    const passIcon = a.pass ? "✓" : "✗";
    const nameLink = `[${a.name}](../agents/${a.name}.agent.md)`;
    lines.push(`| ${nameLink} | ${a.lines} | ${f.fm} | ${f.handoffs} | ${f.persona} | ${passIcon} | ${a.currency} |`);
  }

  // Agents summary
  const agentsPassing = agents.filter(a => a.pass).length;
  const agentsFailing = agents.filter(a => !a.pass).length;
  lines.push("");
  lines.push(`**Summary**: ${agents.length} agents | Passing: ${agentsPassing} | Failing: ${agentsFailing}`);

  lines.push("");

  // Instructions table
  lines.push("## Instructions");
  lines.push("");
  lines.push("| Instruction | Lines | fm | depth | sect | skill | Pass | Currency |");
  lines.push("|-------------|------:|:--:|:-----:|:----:|:-----:|:----:|:--------:|");

  for (const i of instructions) {
    const f = i.flags;
    const passIcon = i.pass ? "✓" : "✗";
    const nameLink = `[${i.name}](../instructions/${i.name}.instructions.md)`;
    lines.push(`| ${nameLink} | ${i.lines} | ${f.fm} | ${f.depth} | ${f.sect} | ${f.skill} | ${passIcon} | ${i.currency} |`);
  }

  // Instructions summary
  const instrPassing = instructions.filter(i => i.pass).length;
  const instrFailing = instructions.filter(i => !i.pass).length;
  lines.push("");
  lines.push(`**Summary**: ${instructions.length} instructions | Passing: ${instrPassing} | Failing: ${instrFailing}`);

  lines.push("");

  // Prompts table
  lines.push("## Prompts");
  lines.push("");
  lines.push("| Prompt | Lines | desc | app | agent | >20L | Pass | Currency |");
  lines.push("|--------|------:|:----:|:---:|:-----:|:----:|:----:|:--------:|");

  for (const p of prompts) {
    const f = p.flags;
    const passIcon = p.pass ? "✓" : "✗";
    const relPath = p.subdir
      ? `../prompts/${p.subdir}/${p.name}.prompt.md`
      : `../prompts/${p.name}.prompt.md`;
    const nameLink = `[${p.name}](${relPath})`;
    lines.push(`| ${nameLink} | ${p.lines} | ${f.desc} | ${f.app} | ${f.agent} | ${f.over20} | ${passIcon} | ${p.currency} |`);
  }

  // Prompts summary
  const promptsPassing = prompts.filter(p => p.pass).length;
  const promptsFailing = prompts.filter(p => !p.pass).length;
  lines.push("");
  lines.push(`**Summary**: ${prompts.length} prompts | Passing: ${promptsPassing} | Failing: ${promptsFailing}`);

  lines.push("");

  // Muscles table
  lines.push("## Muscles");
  lines.push("");
  lines.push("| Muscle | Lines | Lang | Category | comments | err | compat | Pass | inh | Currency |");
  lines.push("|--------|------:|:----:|----------|:--------:|:---:|:------:|:----:|:---:|:--------:|");

  for (const m of muscles) {
    const f = m.flags;
    const passIcon = m.pass ? "✓" : "✗";
    const nameLink = `[${m.name}](../muscles/${m.name})`;
    lines.push(`| ${nameLink} | ${m.lines} | ${m.lang} | ${m.category} | ${f.comments} | ${f.err} | ${f.compat} | ${passIcon} | ${m.inh} | ${m.currency} |`);
  }

  // Muscles summary
  const musclesPassing = muscles.filter(m => m.pass).length;
  const musclesFailing = muscles.filter(m => !m.pass).length;
  const musclesMasterOnly = muscles.filter(m => m.inh === 1).length;
  const musclesInheritable = muscles.filter(m => m.inh === 0).length;
  const musclesWithStdHeader = muscles.filter(m => m.hasStandardHeader).length;
  const musclesWithSkillLink = muscles.filter(m => m.meta && m.meta.skill).length;
  lines.push("");
  lines.push(`**Summary**: ${muscles.length} muscles | Passing: ${musclesPassing} | Failing: ${musclesFailing}`);
  lines.push("");
  lines.push(`**Inheritance**: Master-only(1): ${musclesMasterOnly} | Inheritable(0): ${musclesInheritable}`);
  lines.push("");
  lines.push(`**Metadata Adoption**: ${musclesWithStdHeader}/${muscles.length} have standard header | ${musclesWithSkillLink}/${muscles.length} linked to skills`);

  // Muscles by category
  const categories = [...new Set(muscles.map(m => m.category))];
  const categoryStats = categories.map(cat => {
    const count = muscles.filter(m => m.category === cat).length;
    return `${cat}: ${count}`;
  }).join(' | ');
  lines.push("");
  lines.push(`**Categories**: ${categoryStats}`);

  // Hooks table
  lines.push("");
  lines.push("## Hooks");
  lines.push("");
  lines.push("| Hook | Lines | Event | header | stdin | stdout | err | Pass | Currency |");
  lines.push("|------|------:|-------|:------:|:-----:|:------:|:---:|:----:|:--------:|");

  for (const h of hooks) {
    const f = h.flags;
    const passIcon = h.pass ? "✓" : "✗";
    const nameLink = `[${h.name}](../muscles/hooks/${h.name})`;
    lines.push(`| ${nameLink} | ${h.lines} | ${h.event} | ${f.header} | ${f.stdin} | ${f.stdout} | ${f.err} | ${passIcon} | ${h.currency} |`);
  }

  // Hooks summary
  const hooksPassing = hooks.filter(h => h.pass).length;
  const hooksFailing = hooks.filter(h => !h.pass).length;
  lines.push("");
  lines.push(`**Summary**: ${hooks.length} hooks | Passing: ${hooksPassing} | Failing: ${hooksFailing}`);

  // Overall summary
  const totalItems = skills.length + agents.length + instructions.length + prompts.length + muscles.length + hooks.length;
  lines.push("");
  lines.push("## Overall");
  lines.push("");
  lines.push(`| Category | Count | Passing | Failing | Pass Rate |`);
  lines.push(`|----------|------:|--------:|--------:|----------:|`);
  const overallCategories = [
    { name: 'Skills', items: skills },
    { name: 'Agents', items: agents },
    { name: 'Instructions', items: instructions },
    { name: 'Prompts', items: prompts },
    { name: 'Muscles', items: muscles },
    { name: 'Hooks', items: hooks },
  ];
  let totalPassing = 0;
  let totalFailing2 = 0;
  for (const cat of overallCategories) {
    const p = cat.items.filter(i => i.pass).length;
    const f = cat.items.length - p;
    totalPassing += p;
    totalFailing2 += f;
    const rate = cat.items.length > 0 ? Math.round(100 * p / cat.items.length) : 100;
    lines.push(`| ${cat.name} | ${cat.items.length} | ${p} | ${f} | ${rate}% |`);
  }
  const overallRate = totalItems > 0 ? Math.round(100 * totalPassing / totalItems) : 100;
  lines.push(`| **Total** | **${totalItems}** | **${totalPassing}** | **${totalFailing2}** | **${overallRate}%** |`);

  // Token Waste Report
  lines.push("");
  lines.push("## Token Waste");
  lines.push("");
  lines.push("> **Philosophy**: Brain files are LLM-consumed. Mermaid diagrams render for humans but waste tokens for LLMs (who see raw syntax like `flowchart LR` and `style X fill:#...`). Use concise prose descriptions instead.");
  lines.push("");
  
  // Collect all waste findings
  const wasteFindings = [];
  
  for (const s of skills) {
    if (s.waste && s.waste.mermaidBlocks > 0) {
      wasteFindings.push({
        type: 'skill',
        name: s.name,
        path: `../skills/${s.name}/SKILL.md`,
        ...s.waste
      });
    }
  }
  
  for (const i of instructions) {
    if (i.waste && i.waste.mermaidBlocks > 0) {
      wasteFindings.push({
        type: 'instruction',
        name: i.name,
        path: `../instructions/${i.name}.instructions.md`,
        ...i.waste
      });
    }
  }
  
  if (wasteFindings.length === 0) {
    lines.push("**Status**: ✅ No Mermaid blocks found in brain files");
  } else {
    // Sort by waste score (highest first)
    wasteFindings.sort((a, b) => b.wasteScore - a.wasteScore);
    
    const totalMermaid = wasteFindings.reduce((sum, f) => sum + f.mermaidBlocks, 0);
    const totalMermaidLines = wasteFindings.reduce((sum, f) => sum + f.mermaidLines, 0);
    const totalStyleLines = wasteFindings.reduce((sum, f) => sum + f.styleLines, 0);
    
    lines.push(`**Status**: ⚠️ Found ${totalMermaid} Mermaid blocks across ${wasteFindings.length} files (~${totalMermaidLines} lines of waste)`);
    lines.push("");
    lines.push("| File | Type | Mermaid | Lines | Style | Score | Fix |");
    lines.push("|------|:----:|--------:|------:|------:|------:|-----|");
    
    for (const f of wasteFindings) {
      const nameLink = `[${f.name}](${f.path})`;
      lines.push(`| ${nameLink} | ${f.type} | ${f.mermaidBlocks} | ${f.mermaidLines} | ${f.styleLines} | ${f.wasteScore} | Replace with prose |`);
    }
    
    lines.push("");
    lines.push("**Fix**: Replace Mermaid diagrams with concise prose, e.g.:");
    lines.push("- `flowchart LR: A --> B --> C` → `**A → B → C**`");
    lines.push("- Complex workflows → Numbered steps or bullet list");
  }

  // ── QA3: Cross-Reference Validation ─────────────────────────────
  // Detect broken internal references between brain files.
  // Scans skills, instructions, and agents for references to other brain files
  // and verifies those targets exist.
  lines.push("");
  lines.push("## Cross-References");
  lines.push("");

  const brokenRefs = scanCrossReferences();
  if (brokenRefs.length === 0) {
    lines.push("**Status**: ✅ No broken internal references detected");
  } else {
    lines.push(`**Status**: ⚠️ ${brokenRefs.length} broken reference(s) found`);
    lines.push("");
    lines.push("| Source | Type | References | Target Missing |");
    lines.push("|--------|:----:|------------|----------------|");
    for (const ref of brokenRefs) {
      lines.push(`| ${ref.source} | ${ref.refType} | → ${ref.target} | ✗ |`);
    }
  }

  // ── QA5: Skill Conflict Detection ───────────────────────────────
  // Detect potential conflicts where two brain files cover the same domain
  // with overlapping applyTo patterns and shared topic keywords.
  lines.push("");
  lines.push("## Skill Conflicts");
  lines.push("");

  const conflicts = detectSkillConflicts();
  if (conflicts.length === 0) {
    lines.push("**Status**: ✅ No potential skill conflicts detected");
  } else {
    lines.push(`**Status**: ⚠️ ${conflicts.length} potential conflict(s) — review for contradictory advice`);
    lines.push("");
    lines.push("| # | File A | File B | applyTo Overlap | Topic Overlap | Score |");
    lines.push("|--:|--------|--------|-----------------|---------------|------:|");
    const top = conflicts.slice(0, 20);
    for (let i = 0; i < top.length; i++) {
      const c = top[i];
      lines.push(`| ${i + 1} | ${c.fileA} | ${c.fileB} | ${c.applyOverlap.join(", ")} | ${c.topicOverlap.join(", ")} | ${c.score} |`);
    }
    if (conflicts.length > 20) {
      lines.push("");
      lines.push(`*... and ${conflicts.length - 20} more. Run with \`--stdout\` to see all.*`);
    }
  }

  // ── BE3: Master ↔ Heir Drift Detection ──────────────────────────
  const heirBrain = path.join(ROOT, "heir", ".github");
  if (fs.existsSync(heirBrain)) {
    lines.push("");
    lines.push("## Drift Detection (Master ↔ Heir)");
    lines.push("");

    const driftDirs = ["skills", "instructions", "prompts", "agents", "muscles", "config"];
    const masterOnly = [];
    const heirOnly = [];

    for (const dirName of driftDirs) {
      const masterDir = path.join(GH, dirName);
      const hDir = path.join(heirBrain, dirName);

      const masterFiles = listBrainFiles(masterDir, dirName);
      const heirFiles = listBrainFiles(hDir, dirName);

      const masterSet = new Set(masterFiles);
      const heirSet = new Set(heirFiles);

      for (const f of masterFiles) {
        if (!heirSet.has(f)) masterOnly.push(`${dirName}/${f}`);
      }
      for (const f of heirFiles) {
        if (!masterSet.has(f)) heirOnly.push(`${dirName}/${f}`);
      }
    }

    if (masterOnly.length === 0 && heirOnly.length === 0) {
      lines.push("**Status**: ✅ Master and heir file lists are in sync");
    } else {
      lines.push(`**Status**: ⚠️ ${masterOnly.length} master-only, ${heirOnly.length} heir-only`);

      if (masterOnly.length > 0) {
        lines.push("");
        lines.push("### Master-only (not in heir)");
        lines.push("");
        for (const f of masterOnly.slice(0, 30)) {
          lines.push(`- ${f}`);
        }
        if (masterOnly.length > 30) lines.push(`- ... and ${masterOnly.length - 30} more`);
      }

      if (heirOnly.length > 0) {
        lines.push("");
        lines.push("### Heir-only (not in master)");
        lines.push("");
        for (const f of heirOnly.slice(0, 30)) {
          lines.push(`- ${f}`);
        }
        if (heirOnly.length > 30) lines.push(`- ... and ${heirOnly.length - 30} more`);
      }
    }
  }

  return lines.join("\n");
}

// --- Exports for testing ---
if (typeof module !== 'undefined') {
  module.exports = {
    detectTokenWaste,
    isWorkflowSkill,
    hasMatchingInstruction,
    isCurrencyRecent,
    isCurrencyPassing,
    getCurrencyStatus,
    scanSkills,
    scanAgents,
    scanInstructions,
    scanPrompts,
    scanMuscles,
    scanHooks,
    scanCrossReferences,
    detectSkillConflicts,
    generateGrid,
    listBrainFiles,
    CURRENCY_MAX_DAYS,
    LIFECYCLE_WINDOWS,
    LIFECYCLE_GATES,
    runMechanicalChecks,
    CHECK_LIBRARY,
  };
}

// --- Main ---
if (require.main === module) {
  const grid = generateGrid();

  if (STDOUT_MODE) {
    console.log(grid);
  } else {
    const outputPath = path.join(QUALITY_DIR, "brain-health-grid.md");
    fs.writeFileSync(outputPath, grid);
    console.log(`Brain health grid written to ${path.relative(ROOT, outputPath)}`);
  }
}

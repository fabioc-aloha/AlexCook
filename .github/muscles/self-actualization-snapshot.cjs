#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle self-actualization-snapshot
 * @lifecycle stable
 * @inheritance inheritable
 * @description Gather mechanical inputs for self-actualization (architecture inventory, memory balance, depth-sample candidates, connection counts, growth diff). LLM judges quality; this muscle only counts and samples.
 * @version 1.0.0
 * @skill self-actualization
 * @currency 2026-04-26
 * @platform windows,macos,linux
 * @requires node
 *
 * Path B core (D3, D8, D9, D12, D13, D16, v8.4.0):
 *   - Mechanical dimensions (1, 2, 4, 5, 6) computed here.
 *   - Dimension 3 (Knowledge Depth) is LLM-judged — this muscle only picks
 *     a deterministic sample of skills for the prompt to read.
 *   - Dream is an OPTIONAL input (D8). If dream-report.json exists we use it
 *     for inventory/structural baselines; otherwise dimension 1 is marked
 *     dreamAvailable=false and the prompt instructs Alex to either run a
 *     dream first or proceed with a smaller assessment.
 *   - lastSelfActualization is derived from .github/episodic/
 *     self-actualization-YYYY-MM-DD.md filenames (mirrors D7 pattern).
 *     cogConfig.lastSelfActualization is fallback only.
 *
 * Output: .github/quality/self-actualization-snapshot.json (gitignored, D13).
 *
 * Usage:
 *   node .github/muscles/self-actualization-snapshot.cjs           # write JSON
 *   node .github/muscles/self-actualization-snapshot.cjs --json    # stdout JSON
 */

"use strict";

const fs = require("fs");
const path = require("path");

const STALENESS_DAYS = 30; // D9
const DEPTH_SAMPLE_SIZE = 5;
const HUB_THRESHOLD = 8;

function parseArgs(argv) {
  const positional = argv.slice(2).filter(a => !a.startsWith("--"));
  return {
    workspaceRoot: positional[0] || path.resolve(__dirname, "../.."),
    jsonMode: argv.includes("--json"),
  };
}

// -- File helpers ----------------------------------------------------------

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (_e) { return null; }
}

function listFiles(dir, predicate) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(predicate).map(name => path.join(dir, name));
}

function listSkillDirs(skillsRoot) {
  if (!fs.existsSync(skillsRoot)) return [];
  return fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(skillsRoot, d.name));
}

// -- Inventory (Dim 2 + Dim 5 base) ----------------------------------------

function gatherInventory(workspaceRoot) {
  const gh = path.join(workspaceRoot, ".github");
  const skillFiles = listSkillDirs(path.join(gh, "skills"))
    .map(d => path.join(d, "SKILL.md"))
    .filter(fs.existsSync);
  const instructionFiles = listFiles(path.join(gh, "instructions"), n => n.endsWith(".instructions.md"));
  const promptFiles = listFiles(path.join(gh, "prompts"), n => n.endsWith(".prompt.md"));
  const agentFiles = listFiles(path.join(gh, "agents"), n => n.endsWith(".agent.md"));
  const episodicFiles = listFiles(path.join(gh, "episodic"), n => n.endsWith(".md"));
  return {
    skills: skillFiles.length,
    instructions: instructionFiles.length,
    prompts: promptFiles.length,
    agents: agentFiles.length,
    episodic: episodicFiles.length,
    _files: { skillFiles, instructionFiles, promptFiles, agentFiles, episodicFiles },
  };
}

// -- Dim 1: Structural Integrity (uses dream if present, D8) ---------------

function buildStructural(workspaceRoot, inventory) {
  const dreamPath = path.join(workspaceRoot, ".github", "quality", "dream-report.json");
  const dream = readJsonSafe(dreamPath);
  if (!dream) {
    return {
      dreamAvailable: false,
      note: "Run /dream first for full structural baseline; proceeding without it (D8).",
      brokenRefs: null,
      trifectaIssues: null,
      health: null,
    };
  }
  const ageDays = dream.timestamp
    ? Math.floor((Date.now() - new Date(dream.timestamp).getTime()) / 86400000)
    : null;
  return {
    dreamAvailable: true,
    dreamReportPath: ".github/quality/dream-report.json",
    dreamAgeDays: ageDays,
    dreamStale: ageDays !== null && ageDays > 14,
    inventory: dream.inventory || null,
    brokenRefs: Array.isArray(dream.brokenRefs) ? dream.brokenRefs.length : 0,
    trifectaIssues: Array.isArray(dream.trifectaIssues) ? dream.trifectaIssues.length : 0,
    health: dream.health || null,
  };
}

// -- Dim 2: Memory Balance -------------------------------------------------

function buildMemoryBalance(inventory) {
  // P = procedural (instructions), E = episodic (prompts + episodic chronicles), D = domain (skills)
  const P = inventory.instructions;
  const E = inventory.prompts + inventory.episodic;
  const D = inventory.skills;
  const total = P + E + D || 1;
  const round = n => Math.round(n * 1000) / 1000;
  return {
    instructions: P,
    skills: D,
    prompts: inventory.prompts,
    episodic: inventory.episodic,
    agents: inventory.agents,
    ratio: { P: round(P / total), E: round(E / total), D: round(D / total) },
    note: "LLM compares ratio against maturity targets in self-actualization SKILL §Memory Balance.",
  };
}

// -- Dim 3: Knowledge Depth (deterministic sample for LLM) -----------------

function buildDepthSample(inventory) {
  const samples = inventory._files.skillFiles
    .map(p => {
      let sizeBytes = 0;
      try { sizeBytes = fs.statSync(p).size; } catch (_e) { /* ignore */ }
      return { path: p, sizeBytes };
    })
    .sort((a, b) => (a.sizeBytes - b.sizeBytes) || a.path.localeCompare(b.path))
    .slice(0, DEPTH_SAMPLE_SIZE)
    .map(s => ({
      relPath: s.path.split(path.sep).join("/").split(".github/")[1] || s.path,
      sizeBytes: s.sizeBytes,
    }));
  return {
    method: "deterministic-sample",
    criterion: `smallest ${DEPTH_SAMPLE_SIZE} SKILL.md by byte size, alphabetical tiebreaker`,
    sampleSize: samples.length,
    samples,
    instruction: "LLM reads each sample, looks for capabilities-list anti-pattern, presence of tables/examples/anti-patterns, and decides Deep / Adequate / Shallow / Empty-shell.",
  };
}

// -- Dim 4: Connection Density ---------------------------------------------

function parseApplyTo(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!fmMatch) return [];
    const lineMatch = fmMatch[1].match(/^applyTo:\s*['"]?(.+?)['"]?\s*$/m);
    if (!lineMatch) return [];
    return lineMatch[1].split(",").map(s => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
  } catch (_e) { return []; }
}

function buildConnections(inventory) {
  const perSkill = inventory._files.skillFiles.map(p => ({
    file: p,
    name: path.basename(path.dirname(p)),
    applyTo: parseApplyTo(p),
  }));
  const totalPatterns = perSkill.reduce((s, x) => s + x.applyTo.length, 0);
  const totalSkills = perSkill.length || 1;
  const orphans = perSkill.filter(x => x.applyTo.length === 0).map(x => x.name).sort();
  const hubs = perSkill
    .filter(x => x.applyTo.length > HUB_THRESHOLD)
    .map(x => ({ name: x.name, patterns: x.applyTo.length }))
    .sort((a, b) => b.patterns - a.patterns);
  return {
    totalSkills: perSkill.length,
    totalApplyToPatterns: totalPatterns,
    avgPatternsPerSkill: Math.round((totalPatterns / totalSkills) * 100) / 100,
    orphanCount: orphans.length,
    orphanSkills: orphans.slice(0, 20), // cap for snapshot size
    orphanTruncated: orphans.length > 20,
    hubThreshold: HUB_THRESHOLD,
    hubSkills: hubs.slice(0, 10),
  };
}

// -- Dim 5: Trifecta Completeness (counts; LLM picks priority) -------------

function buildTrifecta(workspaceRoot, structural) {
  // Use dream's trifectaIssues if available; otherwise note unavailability.
  if (structural.dreamAvailable) {
    return {
      source: "dream-report.json",
      trifectaIssueCount: structural.trifectaIssues,
      note: "Full list available in dream-report.json. LLM reviews and prioritizes trifecta builds.",
    };
  }
  return {
    source: "none",
    trifectaIssueCount: null,
    note: "No dream report; trifecta inventory unavailable. LLM may run a quick trifecta scan if needed.",
  };
}

// -- Dim 6: Growth Trajectory ----------------------------------------------

function buildGrowth(workspaceRoot, inventory) {
  const priorPath = path.join(workspaceRoot, ".github", "quality", "self-actualization-snapshot.json");
  const prior = readJsonSafe(priorPath);
  if (!prior || !prior.dimensions || !prior.dimensions.memoryBalance) {
    return { priorAvailable: false, note: "First self-actualization snapshot — no growth diff." };
  }
  const p = prior.dimensions.memoryBalance;
  const diff = {
    skills: { prev: p.skills, now: inventory.skills, delta: inventory.skills - p.skills },
    instructions: { prev: p.instructions, now: inventory.instructions, delta: inventory.instructions - p.instructions },
    prompts: { prev: p.prompts, now: inventory.prompts, delta: inventory.prompts - p.prompts },
    episodic: { prev: p.episodic, now: inventory.episodic, delta: inventory.episodic - p.episodic },
    agents: { prev: p.agents, now: inventory.agents, delta: inventory.agents - p.agents },
  };
  return {
    priorAvailable: true,
    priorTimestamp: prior.generatedAt || null,
    diff,
    note: "Positive deltas across skills + instructions = healthy momentum; episodic-only growth = consolidation debt.",
  };
}

// -- Last self-actualization (D7-pattern, D12 fallback) --------------------

function findLastChronicle(workspaceRoot) {
  const dir = path.join(workspaceRoot, ".github", "episodic");
  if (!fs.existsSync(dir)) return null;
  const matches = fs.readdirSync(dir)
    .map(n => {
      const m = n.match(/^self-actualization-(\d{4}-\d{2}-\d{2})(?:-.*)?\.md$/);
      return m ? { name: n, date: m[1] } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date));
  return matches[0] || null;
}

function buildRecency(workspaceRoot) {
  const cogConfig = readJsonSafe(path.join(workspaceRoot, ".github", "config", "cognitive-config.json"));
  const newest = findLastChronicle(workspaceRoot);
  const lastDate = newest?.date || cogConfig?.lastSelfActualization || null;
  let daysSince = null;
  if (lastDate) {
    daysSince = Math.floor((Date.now() - new Date(lastDate + "T00:00:00Z").getTime()) / 86400000);
  }
  return {
    lastSelfActualization: lastDate,
    lastSelfActualizationFile: newest ? `.github/episodic/${newest.name}` : null,
    source: newest ? "chronicle-filename" : (cogConfig?.lastSelfActualization ? "cogConfig" : "none"),
    daysSinceLastSelfActualization: daysSince,
    stale: daysSince !== null && daysSince >= STALENESS_DAYS,
    stalenessThresholdDays: STALENESS_DAYS,
  };
}

// -- Snapshot orchestration ------------------------------------------------

function buildSnapshot(workspaceRoot) {
  const inventory = gatherInventory(workspaceRoot);
  const structural = buildStructural(workspaceRoot, inventory);
  const recency = buildRecency(workspaceRoot);

  const snapshot = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    workspace: workspaceRoot,
    recency,
    dimensions: {
      structuralIntegrity: structural,
      memoryBalance: buildMemoryBalance(inventory),
      knowledgeDepth: buildDepthSample(inventory),
      connectionDensity: buildConnections(inventory),
      trifectaCompleteness: buildTrifecta(workspaceRoot, structural),
      growthTrajectory: buildGrowth(workspaceRoot, inventory),
    },
  };
  // Strip internal helpers
  return snapshot;
}

function main() {
  const { workspaceRoot, jsonMode } = parseArgs(process.argv);
  const snapshot = buildSnapshot(workspaceRoot);

  if (jsonMode) {
    process.stdout.write(JSON.stringify(snapshot, null, 2) + "\n");
    return;
  }

  const qualityDir = path.join(workspaceRoot, ".github", "quality");
  if (!fs.existsSync(qualityDir)) fs.mkdirSync(qualityDir, { recursive: true });
  const out = path.join(qualityDir, "self-actualization-snapshot.json");
  fs.writeFileSync(out, JSON.stringify(snapshot, null, 2) + "\n", "utf8");

  const r = snapshot.recency;
  const mb = snapshot.dimensions.memoryBalance;
  const cd = snapshot.dimensions.connectionDensity;
  const struct = snapshot.dimensions.structuralIntegrity;
  console.log(`[self-actualization-snapshot] last: ${r.lastSelfActualization || "(none)"}` +
    (r.daysSinceLastSelfActualization !== null ? ` (${r.daysSinceLastSelfActualization}d ago${r.stale ? ", STALE" : ""})` : "") +
    ` | inventory S:${mb.skills} I:${mb.instructions} P:${mb.prompts} E:${mb.episodic} A:${mb.agents}` +
    ` | ratio P/E/D: ${mb.ratio.P}/${mb.ratio.E}/${mb.ratio.D}` +
    ` | applyTo avg: ${cd.avgPatternsPerSkill} | orphans: ${cd.orphanCount} | hubs: ${cd.hubSkills.length}` +
    ` | dream: ${struct.dreamAvailable ? `available (${struct.dreamAgeDays}d, ${struct.health})` : "unavailable"}`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(`[self-actualization-snapshot] fatal: ${err.message}`);
    if (err.stack) console.error(err.stack);
    process.exit(2);
  }
}

module.exports = {
  buildSnapshot,
  gatherInventory,
  buildStructural,
  buildMemoryBalance,
  buildDepthSample,
  buildConnections,
  buildTrifecta,
  buildGrowth,
  buildRecency,
  findLastChronicle,
  STALENESS_DAYS,
  DEPTH_SAMPLE_SIZE,
  HUB_THRESHOLD,
};

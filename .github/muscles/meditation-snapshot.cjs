#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle meditation-snapshot
 * @lifecycle stable
 * @inheritance inheritable
 * @description Produce a structural snapshot of meditation chronicles: lastMeditation date (from filename), chronicle count, and staleness; prune at 60 chronicles FIFO (D17, v8.4.0)
 * @version 1.0.0
 * @skill meditation
 * @currency 2026-04-26
 * @platform windows,macos,linux
 * @requires node
 *
 * Path B core (D2, D7, D11, D17): chronicles are the source of truth for
 * "when did meditation last happen". This muscle scans .github/episodic/ for
 * meditation-YYYY-MM-DD-*.md files, extracts the date from the filename
 * (mtimes are unreliable due to bulk git operations), and writes a small
 * snapshot at .github/quality/meditation-snapshot.json that session-start.cjs
 * and heir consumers can read instead of the hand-edited cogConfig field.
 *
 * Usage:
 *   node .github/muscles/meditation-snapshot.cjs            # JSON written, brief stdout
 *   node .github/muscles/meditation-snapshot.cjs --json     # JSON to stdout, no prune
 *   node .github/muscles/meditation-snapshot.cjs --no-prune # write snapshot, skip prune
 */

"use strict";

const fs = require("fs");
const path = require("path");

const KEEP = 60; // D17: prune to newest 60 FIFO

function parseArgs(argv) {
  const positional = argv.slice(2).filter(a => !a.startsWith("--"));
  return {
    workspaceRoot: positional[0] || path.resolve(__dirname, "../.."),
    jsonMode: argv.includes("--json"),
    noPrune: argv.includes("--no-prune") || argv.includes("--json"),
  };
}

// -- Chronicle scanning ----------------------------------------------------

function scanChronicles(episodicDir) {
  if (!fs.existsSync(episodicDir)) return [];
  return fs.readdirSync(episodicDir)
    .map(name => {
      const m = name.match(/^meditation-(\d{4}-\d{2}-\d{2})(?:-.*)?\.md$/);
      if (!m) return null;
      const full = path.join(episodicDir, name);
      let mtime = 0;
      try { mtime = fs.statSync(full).mtimeMs; } catch (_e) { /* ignore */ }
      return { name, full, date: m[1], mtime };
    })
    .filter(Boolean)
    // Sort by filename date desc, then mtime desc as tiebreaker
    .sort((a, b) => (b.date.localeCompare(a.date)) || (b.mtime - a.mtime));
}

function buildSnapshot(workspaceRoot) {
  const episodicDir = path.join(workspaceRoot, ".github", "episodic");
  const chronicles = scanChronicles(episodicDir);
  const newest = chronicles[0] || null;

  const today = new Date();
  const dayMs = 1000 * 60 * 60 * 24;

  let daysSinceLastMeditation = null;
  if (newest) {
    const newestDate = new Date(newest.date + "T00:00:00Z");
    daysSinceLastMeditation = Math.floor((today.getTime() - newestDate.getTime()) / dayMs);
  }

  // Cadence: chronicles dated within the trailing N days
  const cutoff = (n) => new Date(today.getTime() - n * dayMs).toISOString().slice(0, 10);
  const cutoff30 = cutoff(30);
  const cutoff90 = cutoff(90);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    workspace: workspaceRoot,
    lastMeditation: newest ? newest.date : null,
    lastMeditationFile: newest ? path.relative(workspaceRoot, newest.full).replace(/\\/g, "/") : null,
    daysSinceLastMeditation,
    overdue: daysSinceLastMeditation !== null && daysSinceLastMeditation >= 7,
    chronicleCount: chronicles.length,
    cadence: {
      last30Days: chronicles.filter(c => c.date >= cutoff30).length,
      last90Days: chronicles.filter(c => c.date >= cutoff90).length,
    },
    pruneThreshold: KEEP,
  };
}

// -- Pruning (D17) ---------------------------------------------------------

function pruneChronicles(workspaceRoot, keep = KEEP) {
  const episodicDir = path.join(workspaceRoot, ".github", "episodic");
  const chronicles = scanChronicles(episodicDir);
  if (chronicles.length <= keep) return { kept: chronicles.length, deleted: 0 };

  const toDelete = chronicles.slice(keep);
  let deleted = 0;
  for (const entry of toDelete) {
    try {
      fs.unlinkSync(entry.full);
      deleted += 1;
    } catch (_e) {
      // Best-effort prune; permissions or transient locks should not fail the snapshot
    }
  }
  return { kept: keep, deleted };
}

// -- Main ------------------------------------------------------------------

function main() {
  const { workspaceRoot, jsonMode, noPrune } = parseArgs(process.argv);

  const snapshot = buildSnapshot(workspaceRoot);

  if (jsonMode) {
    process.stdout.write(JSON.stringify(snapshot, null, 2) + "\n");
    return;
  }

  // Persist snapshot
  const qualityDir = path.join(workspaceRoot, ".github", "quality");
  if (!fs.existsSync(qualityDir)) fs.mkdirSync(qualityDir, { recursive: true });
  const snapshotPath = path.join(qualityDir, "meditation-snapshot.json");
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");

  // Prune chronicles
  let pruneResult = { kept: snapshot.chronicleCount, deleted: 0 };
  if (!noPrune) {
    pruneResult = pruneChronicles(workspaceRoot, KEEP);
    // If we pruned, regenerate snapshot to reflect new count
    if (pruneResult.deleted > 0) {
      const refreshed = buildSnapshot(workspaceRoot);
      fs.writeFileSync(snapshotPath, JSON.stringify(refreshed, null, 2) + "\n", "utf8");
    }
  }

  // Stdout summary
  console.log(`[meditation-snapshot] last: ${snapshot.lastMeditation || "(none)"}` +
    (snapshot.daysSinceLastMeditation !== null ? ` (${snapshot.daysSinceLastMeditation}d ago)` : "") +
    ` | chronicles: ${snapshot.chronicleCount}` +
    ` | cadence 30d: ${snapshot.cadence.last30Days}, 90d: ${snapshot.cadence.last90Days}` +
    (pruneResult.deleted > 0 ? ` | pruned: ${pruneResult.deleted}` : ""));
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(`[meditation-snapshot] fatal: ${err.message}`);
    if (err.stack) console.error(err.stack);
    process.exit(2);
  }
}

module.exports = { buildSnapshot, scanChronicles, pruneChronicles, KEEP };

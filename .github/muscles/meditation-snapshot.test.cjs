#!/usr/bin/env node
/**
 * @test meditation-snapshot
 * @inheritance inheritable
 * @description Validates meditation-snapshot.cjs: filename date parsing, FIFO order, prune at 60, snapshot fields
 *
 * Run: node .github/muscles/meditation-snapshot.test.cjs
 */

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { test } = require("node:test");
const assert = require("node:assert/strict");

const { buildSnapshot, scanChronicles, pruneChronicles, KEEP } =
  require("./meditation-snapshot.cjs");

// -- Test fixtures ---------------------------------------------------------

function makeFixture(chronicles) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "med-snap-"));
  const episodicDir = path.join(root, ".github", "episodic");
  fs.mkdirSync(episodicDir, { recursive: true });
  for (const name of chronicles) {
    fs.writeFileSync(path.join(episodicDir, name), `# ${name}\n`, "utf8");
  }
  return root;
}

function cleanup(root) {
  try { fs.rmSync(root, { recursive: true, force: true }); } catch (_e) { /* ignore */ }
}

// -- Tests -----------------------------------------------------------------

test("scanChronicles parses date from filename and sorts desc", () => {
  const root = makeFixture([
    "meditation-2026-01-05-foo.md",
    "meditation-2026-04-11-bar.md",
    "meditation-2026-03-15.md", // bare date variant
    "not-a-meditation.md",
    "meditation-bad-name.md",
  ]);
  try {
    const list = scanChronicles(path.join(root, ".github", "episodic"));
    assert.equal(list.length, 3, "only valid meditation-YYYY-MM-DD entries counted");
    assert.deepEqual(list.map(c => c.date), ["2026-04-11", "2026-03-15", "2026-01-05"]);
  } finally {
    cleanup(root);
  }
});

test("buildSnapshot computes lastMeditation, daysSince, overdue, cadence", () => {
  const today = new Date();
  const dayMs = 1000 * 60 * 60 * 24;
  const offsetDate = (n) => new Date(today.getTime() - n * dayMs).toISOString().slice(0, 10);

  const root = makeFixture([
    `meditation-${offsetDate(2)}-recent.md`,
    `meditation-${offsetDate(20)}-mid.md`,
    `meditation-${offsetDate(100)}-old.md`,
  ]);
  try {
    const snap = buildSnapshot(root);
    assert.equal(snap.schemaVersion, 1);
    assert.equal(snap.lastMeditation, offsetDate(2));
    assert.equal(snap.daysSinceLastMeditation, 2);
    assert.equal(snap.overdue, false, "2 days < 7 not overdue");
    assert.equal(snap.chronicleCount, 3);
    assert.equal(snap.cadence.last30Days, 2, "recent + mid within 30d");
    assert.equal(snap.cadence.last90Days, 2, "old (100d) excluded from 90d window");
    assert.equal(snap.pruneThreshold, 60);
  } finally {
    cleanup(root);
  }
});

test("buildSnapshot marks overdue when >= 7 days", () => {
  const today = new Date();
  const dayMs = 1000 * 60 * 60 * 24;
  const eightDaysAgo = new Date(today.getTime() - 8 * dayMs).toISOString().slice(0, 10);
  const root = makeFixture([`meditation-${eightDaysAgo}-stale.md`]);
  try {
    const snap = buildSnapshot(root);
    assert.equal(snap.overdue, true);
    assert.equal(snap.daysSinceLastMeditation, 8);
  } finally {
    cleanup(root);
  }
});

test("buildSnapshot returns nulls when no chronicles", () => {
  const root = makeFixture([]);
  try {
    const snap = buildSnapshot(root);
    assert.equal(snap.lastMeditation, null);
    assert.equal(snap.lastMeditationFile, null);
    assert.equal(snap.daysSinceLastMeditation, null);
    assert.equal(snap.overdue, false);
    assert.equal(snap.chronicleCount, 0);
  } finally {
    cleanup(root);
  }
});

test("pruneChronicles keeps newest KEEP and deletes the rest (FIFO)", () => {
  // Generate KEEP+5 chronicles spanning distinct dates
  const names = [];
  for (let i = 0; i < KEEP + 5; i++) {
    const d = new Date(2025, 0, 1 + i).toISOString().slice(0, 10);
    names.push(`meditation-${d}-entry${i}.md`);
  }
  const root = makeFixture(names);
  try {
    const result = pruneChronicles(root, KEEP);
    assert.equal(result.deleted, 5);
    assert.equal(result.kept, KEEP);

    const remaining = scanChronicles(path.join(root, ".github", "episodic"));
    assert.equal(remaining.length, KEEP);
    // Newest survives; oldest deleted
    assert.equal(remaining[0].date, "2025-03-06"); // 65th day = newest
    assert.ok(remaining.every(c => c.date >= "2025-01-06"), "oldest 5 (Jan 1-5) pruned");
  } finally {
    cleanup(root);
  }
});

test("pruneChronicles is no-op when count <= KEEP", () => {
  const names = ["meditation-2026-01-01-a.md", "meditation-2026-01-02-b.md"];
  const root = makeFixture(names);
  try {
    const result = pruneChronicles(root, KEEP);
    assert.equal(result.deleted, 0);
    assert.equal(result.kept, 2);
  } finally {
    cleanup(root);
  }
});

test("heir-stable schema fields preserved", () => {
  // Regression: session-start.cjs and heir health-pulse rely on these field names
  const today = new Date().toISOString().slice(0, 10);
  const root = makeFixture([`meditation-${today}-x.md`]);
  try {
    const snap = buildSnapshot(root);
    const required = [
      "schemaVersion",
      "generatedAt",
      "lastMeditation",
      "lastMeditationFile",
      "daysSinceLastMeditation",
      "overdue",
      "chronicleCount",
      "cadence",
      "pruneThreshold",
    ];
    for (const k of required) {
      assert.ok(k in snap, `missing field: ${k}`);
    }
  } finally {
    cleanup(root);
  }
});

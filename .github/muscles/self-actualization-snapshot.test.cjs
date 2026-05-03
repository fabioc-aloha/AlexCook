#!/usr/bin/env node
/**
 * @type test
 * @lifecycle stable
 * @inheritance inheritable
 * @description Tests for self-actualization-snapshot muscle
 */
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const sa = require("./self-actualization-snapshot.cjs");

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sa-snap-"));
  const gh = path.join(root, ".github");
  fs.mkdirSync(path.join(gh, "skills", "alpha"), { recursive: true });
  fs.mkdirSync(path.join(gh, "skills", "beta"), { recursive: true });
  fs.mkdirSync(path.join(gh, "skills", "gamma"), { recursive: true });
  fs.mkdirSync(path.join(gh, "instructions"), { recursive: true });
  fs.mkdirSync(path.join(gh, "prompts"), { recursive: true });
  fs.mkdirSync(path.join(gh, "agents"), { recursive: true });
  fs.mkdirSync(path.join(gh, "episodic"), { recursive: true });
  fs.mkdirSync(path.join(gh, "config"), { recursive: true });
  fs.mkdirSync(path.join(gh, "quality"), { recursive: true });

  const fm = (applyTo) => `---\nname: x\napplyTo: '${applyTo}'\n---\n# X\n`;
  fs.writeFileSync(path.join(gh, "skills", "alpha", "SKILL.md"), fm("**/*.ts,**/*.js"));   // 2 patterns
  fs.writeFileSync(path.join(gh, "skills", "beta", "SKILL.md"), `---\nname: beta\n---\n# beta short\n`); // orphan
  fs.writeFileSync(path.join(gh, "skills", "gamma", "SKILL.md"),
    fm("**/*.a,**/*.b,**/*.c,**/*.d,**/*.e,**/*.f,**/*.g,**/*.h,**/*.i") + "extra content".repeat(50)); // hub (9 patterns)

  fs.writeFileSync(path.join(gh, "instructions", "one.instructions.md"), "# one");
  fs.writeFileSync(path.join(gh, "instructions", "two.instructions.md"), "# two");
  fs.writeFileSync(path.join(gh, "prompts", "p.prompt.md"), "# p");
  fs.writeFileSync(path.join(gh, "agents", "a.agent.md"), "# a");
  fs.writeFileSync(path.join(gh, "episodic", "self-actualization-2026-03-15.md"), "# old");
  fs.writeFileSync(path.join(gh, "episodic", "self-actualization-2026-04-01.md"), "# newer");
  fs.writeFileSync(path.join(gh, "episodic", "meditation-2026-04-20.md"), "# unrelated");

  return root;
}

function cleanup(root) {
  try { fs.rmSync(root, { recursive: true, force: true }); } catch (_e) { /* ignore */ }
}

test("gatherInventory counts artifacts by type", () => {
  const root = makeFixture();
  try {
    const inv = sa.gatherInventory(root);
    assert.equal(inv.skills, 3);
    assert.equal(inv.instructions, 2);
    assert.equal(inv.prompts, 1);
    assert.equal(inv.agents, 1);
    assert.equal(inv.episodic, 3);
  } finally { cleanup(root); }
});

test("buildMemoryBalance computes P:E:D ratio summing to ~1", () => {
  const root = makeFixture();
  try {
    const inv = sa.gatherInventory(root);
    const mb = sa.buildMemoryBalance(inv);
    const sum = mb.ratio.P + mb.ratio.E + mb.ratio.D;
    assert.ok(Math.abs(sum - 1) < 0.01, `ratio sum should be ~1, got ${sum}`);
    assert.equal(mb.skills, 3);
    assert.equal(mb.instructions, 2);
  } finally { cleanup(root); }
});

test("buildDepthSample returns smallest skills first", () => {
  const root = makeFixture();
  try {
    const inv = sa.gatherInventory(root);
    const ds = sa.buildDepthSample(inv);
    assert.equal(ds.method, "deterministic-sample");
    assert.ok(ds.samples.length > 0);
    // beta is shortest (orphan, no applyTo, minimal content)
    assert.ok(ds.samples[0].relPath.includes("beta"), `expected beta first, got ${ds.samples[0].relPath}`);
  } finally { cleanup(root); }
});

test("buildConnections detects orphans and hubs by HUB_THRESHOLD", () => {
  const root = makeFixture();
  try {
    const inv = sa.gatherInventory(root);
    const cd = sa.buildConnections(inv);
    assert.equal(cd.totalSkills, 3);
    assert.ok(cd.orphanSkills.includes("beta"), "beta should be orphan");
    assert.equal(cd.orphanCount, 1);
    assert.equal(cd.hubSkills.length, 1, "gamma (9 patterns) should be the only hub");
    assert.equal(cd.hubSkills[0].name, "gamma");
  } finally { cleanup(root); }
});

test("buildStructural marks dreamAvailable=false when no dream report (D8)", () => {
  const root = makeFixture();
  try {
    const inv = sa.gatherInventory(root);
    const struct = sa.buildStructural(root, inv);
    assert.equal(struct.dreamAvailable, false);
    assert.ok(struct.note.includes("dream"), "should explain dream optionality");
  } finally { cleanup(root); }
});

test("buildStructural uses dream-report.json when present", () => {
  const root = makeFixture();
  try {
    const dream = {
      schemaVersion: 1,
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
      inventory: { skills: 3, instructions: 2, prompts: 1, agents: 1, total: 7 },
      brokenRefs: [{ sourceFile: "x" }, { sourceFile: "y" }],
      trifectaIssues: [{ type: "orphan-skill", skill: "z" }],
      health: "needs-attention",
    };
    fs.writeFileSync(path.join(root, ".github", "quality", "dream-report.json"), JSON.stringify(dream));
    const inv = sa.gatherInventory(root);
    const struct = sa.buildStructural(root, inv);
    assert.equal(struct.dreamAvailable, true);
    assert.equal(struct.brokenRefs, 2);
    assert.equal(struct.trifectaIssues, 1);
    assert.equal(struct.health, "needs-attention");
    assert.equal(struct.dreamAgeDays, 5);
    assert.equal(struct.dreamStale, false);
  } finally { cleanup(root); }
});

test("buildRecency derives lastSelfActualization from newest chronicle", () => {
  const root = makeFixture();
  try {
    const r = sa.buildRecency(root);
    assert.equal(r.lastSelfActualization, "2026-04-01");
    assert.equal(r.source, "chronicle-filename");
    assert.ok(r.daysSinceLastSelfActualization !== null);
    assert.equal(r.stalenessThresholdDays, 30);
  } finally { cleanup(root); }
});

test("buildRecency returns nulls when no chronicles and no cogConfig", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sa-snap-empty-"));
  fs.mkdirSync(path.join(root, ".github", "episodic"), { recursive: true });
  fs.mkdirSync(path.join(root, ".github", "config"), { recursive: true });
  try {
    const r = sa.buildRecency(root);
    assert.equal(r.lastSelfActualization, null);
    assert.equal(r.source, "none");
    assert.equal(r.daysSinceLastSelfActualization, null);
    assert.equal(r.stale, false);
  } finally { cleanup(root); }
});

test("buildRecency falls back to cogConfig when no chronicle exists", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sa-snap-cfg-"));
  fs.mkdirSync(path.join(root, ".github", "episodic"), { recursive: true });
  fs.mkdirSync(path.join(root, ".github", "config"), { recursive: true });
  fs.writeFileSync(
    path.join(root, ".github", "config", "cognitive-config.json"),
    JSON.stringify({ lastSelfActualization: "2026-01-01" })
  );
  try {
    const r = sa.buildRecency(root);
    assert.equal(r.lastSelfActualization, "2026-01-01");
    assert.equal(r.source, "cogConfig");
    assert.equal(r.stale, true);
  } finally { cleanup(root); }
});

test("buildGrowth notes priorAvailable=false on first run", () => {
  const root = makeFixture();
  try {
    const inv = sa.gatherInventory(root);
    const g = sa.buildGrowth(root, inv);
    assert.equal(g.priorAvailable, false);
  } finally { cleanup(root); }
});

test("buildGrowth computes diff against prior snapshot", () => {
  const root = makeFixture();
  try {
    const prior = {
      generatedAt: "2026-04-01T00:00:00Z",
      dimensions: { memoryBalance: { skills: 1, instructions: 1, prompts: 0, episodic: 1, agents: 0 } },
    };
    fs.writeFileSync(path.join(root, ".github", "quality", "self-actualization-snapshot.json"), JSON.stringify(prior));
    const inv = sa.gatherInventory(root);
    const g = sa.buildGrowth(root, inv);
    assert.equal(g.priorAvailable, true);
    assert.equal(g.diff.skills.delta, 2);          // 3 - 1
    assert.equal(g.diff.instructions.delta, 1);    // 2 - 1
    assert.equal(g.diff.episodic.delta, 2);        // 3 - 1
  } finally { cleanup(root); }
});

test("buildSnapshot integrates all dimensions and is JSON-serializable", () => {
  const root = makeFixture();
  try {
    const snap = sa.buildSnapshot(root);
    assert.equal(snap.schemaVersion, 1);
    assert.ok(snap.generatedAt);
    assert.ok(snap.recency);
    assert.ok(snap.dimensions.structuralIntegrity);
    assert.ok(snap.dimensions.memoryBalance);
    assert.ok(snap.dimensions.knowledgeDepth);
    assert.ok(snap.dimensions.connectionDensity);
    assert.ok(snap.dimensions.trifectaCompleteness);
    assert.ok(snap.dimensions.growthTrajectory);
    // Serialization should not throw and should not include _files helper
    const serialized = JSON.parse(JSON.stringify(snap));
    assert.equal(serialized.dimensions.memoryBalance._files, undefined);
  } finally { cleanup(root); }
});

#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle dream-creativity-score
 * @lifecycle stable
 * @inheritance inheritable
 * @description Score the most recent meditation-authored dream chronicle across 5 dimensions: completeness, freshness, integrity, insight density, and drift detection
 * @version 2.0.0
 * @skill architecture-health
 * @currency 2026-04-25
 * @platform windows,macos,linux
 * @requires node
 *
 * Dream Creativity Score (BE5)
 * Location: .github/muscles/dream-creativity-score.cjs
 *
 * Path C semantics (v8.4.0): chronicles are hand-authored meditation
 * artifacts in .github/episodic/dream-report-YYYY-MM-DD.md. The companion
 * dream-cli.cjs writes the structural JSON snapshot at
 * .github/quality/dream-report.json. This grader reads the latest chronicle
 * and (when present) the JSON snapshot to derive the integrity dimension.
 *
 * Each dimension scores 0-20 for a total of 0-100.
 *
 * Usage:
 *   node .github/muscles/dream-creativity-score.cjs [workspaceRoot]
 *   node .github/muscles/dream-creativity-score.cjs --json
 */

"use strict";

const fs = require("fs");
const path = require("path");

const workspaceRoot = process.argv.find(a => !a.startsWith("-") && a !== process.argv[0] && a !== process.argv[1])
  || path.resolve(__dirname, "../..");
const JSON_MODE = process.argv.includes("--json");
const episodicDir = path.join(workspaceRoot, ".github", "episodic");
const dreamSnapshotPath = path.join(workspaceRoot, ".github", "quality", "dream-report.json");

// ── Find latest dream report ──────────────────────────────────────

function findLatestDream() {
  if (!fs.existsSync(episodicDir)) return null;
  const files = fs.readdirSync(episodicDir)
    .filter(f => f.startsWith("dream-report-") && f.endsWith(".md"))
    .sort()
    .reverse();
  return files.length > 0 ? path.join(episodicDir, files[0]) : null;
}

// ── Scoring dimensions (0-20 each) ───────────────────────────────

function scoreCompleteness(content) {
  // Does the chronicle cover expected sections? (Path C: meditation-authored, no synapses)
  const expectedSections = [
    /architecture statistics|inventory/i,
    /findings|issues|trifecta/i,
    /broken (refs|references|links)|connection/i,
    /recommend|action/i,
    /health|score|status/i,
  ];
  const found = expectedSections.filter(re => re.test(content)).length;
  return Math.min(20, Math.round((found / expectedSections.length) * 20));
}

function scoreFreshness(content, filePath) {
  // How recent is the report?
  const match = filePath.match(/dream-report-(\d{4}-\d{2}-\d{2})/);
  if (!match) return 0;
  const reportDate = new Date(match[1]);
  const daysSince = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince <= 1) return 20;
  if (daysSince <= 3) return 16;
  if (daysSince <= 7) return 12;
  if (daysSince <= 14) return 8;
  if (daysSince <= 30) return 4;
  return 0;
}

function scoreIntegrity(content) {
  // Health derived from dream-cli.cjs JSON snapshot when available, falling back
  // to chronicle-internal counts. Replaces the legacy synapse connectivity dimension.
  let snapshot = null;
  if (fs.existsSync(dreamSnapshotPath)) {
    try {
      snapshot = JSON.parse(fs.readFileSync(dreamSnapshotPath, "utf8"));
    } catch (_err) {
      snapshot = null;
    }
  }

  if (snapshot && snapshot.inventory && Number.isFinite(snapshot.inventory.total)) {
    const total = snapshot.inventory.total;
    const broken = Array.isArray(snapshot.brokenRefs) ? snapshot.brokenRefs.length : 0;
    const orphans = Array.isArray(snapshot.trifectaIssues) ? snapshot.trifectaIssues.length : 0;
    const issues = broken + orphans;
    if (total === 0) return 0;
    const healthRatio = Math.max(0, 1 - issues / total);
    const sizeBonus = Math.min(1, total / 200);
    return Math.min(20, Math.round(healthRatio * sizeBonus * 20));
  }

  // Fallback: parse chronicle-internal counts (broken refs / total files)
  const totalMatch = content.match(/Total\s+(?:Files|Skills|Architecture)\s*[|:]\s*(\d+)/i);
  const brokenMatch = content.match(/Broken\s+(?:Refs|References|Links|Connections)\s*[|:]\s*(\d+)/i);
  if (!totalMatch) return 0;
  const total = parseInt(totalMatch[1], 10);
  const broken = brokenMatch ? parseInt(brokenMatch[1], 10) : 0;
  if (total === 0) return 0;
  const healthRatio = Math.max(0, 1 - broken / total);
  const sizeBonus = Math.min(1, total / 100);
  return Math.min(20, Math.round(healthRatio * sizeBonus * 20));
}

function scoreInsightDensity(content) {
  // Does the report contain actionable findings?
  let score = 0;
  if (/action required/i.test(content)) score += 5;
  if (/drift detected/i.test(content)) score += 5;
  if (/repaired/i.test(content) && !/no repairs/i.test(content)) score += 5;
  if (/attention/i.test(content)) score += 3;
  // Tables with data
  const tableRows = (content.match(/^\|[^|]+\|/gm) || []).length;
  score += Math.min(5, Math.round(tableRows / 5));
  return Math.min(20, score);
}

function scoreDriftDetection(content) {
  // Does the report detect and report drift?
  let score = 0;
  // Has drift section
  if (/documentation count validation/i.test(content)) score += 8;
  // Reports specific drift numbers
  const driftMatches = content.match(/\+\d+|−\d+|-\d+/g) || [];
  if (driftMatches.length > 0) score += 6;
  // Has store breakdown
  if (/procedural|episodic|skills/i.test(content)) score += 6;
  return Math.min(20, score);
}

// ── Main ──────────────────────────────────────────────────────────

const dreamPath = findLatestDream();
if (!dreamPath) {
  const output = { error: "No dream reports found", score: 0 };
  console.log(JSON_MODE ? JSON.stringify(output, null, 2) : "No dream reports found in .github/episodic/");
  process.exit(0);
}

const content = fs.readFileSync(dreamPath, "utf8");
const fileName = path.basename(dreamPath);

const dimensions = {
  completeness: scoreCompleteness(content),
  freshness: scoreFreshness(content, dreamPath),
  integrity: scoreIntegrity(content),
  insightDensity: scoreInsightDensity(content),
  driftDetection: scoreDriftDetection(content),
};

const totalScore = Object.values(dimensions).reduce((a, b) => a + b, 0);
const grade = totalScore >= 90 ? "A" : totalScore >= 75 ? "B" : totalScore >= 60 ? "C" : totalScore >= 40 ? "D" : "F";

const result = {
  report: fileName,
  score: totalScore,
  grade,
  dimensions,
};

if (JSON_MODE) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`# Dream Creativity Score: ${totalScore}/100 (${grade})`);
  console.log("");
  console.log(`Report: ${fileName}`);
  console.log("");
  console.log("| Dimension | Score | Max |");
  console.log("|-----------|------:|----:|");
  for (const [dim, score] of Object.entries(dimensions)) {
    console.log(`| ${dim} | ${score} | 20 |`);
  }
  console.log(`| **Total** | **${totalScore}** | **100** |`);
}

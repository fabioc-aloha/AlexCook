#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle fleet-feedback-aggregator
 * @lifecycle stable
 * @inheritance inheritable
 * @description Aggregate heir feedback by skill for trend analysis
 * @version 1.0.0
 * @skill heir-feedback
 * @currency 2026-04-20
 * @platform windows,macos,linux
 * @requires node
 *
 * Fleet Feedback Aggregator (FI5)
 * Location: .github/muscles/fleet-feedback-aggregator.cjs
 *
 * Reads all feedback files from AI-Memory/feedback/, parses YAML frontmatter,
 * groups by skill/type/severity, and produces a summary report for trend analysis.
 *
 * Privacy: feedback files follow the structured schema from heir-feedback.instructions.md.
 * Only skill names, types, and severity are aggregated — no domain data.
 *
 * Usage:
 *   node .github/muscles/fleet-feedback-aggregator.cjs             # Human-readable report
 *   node .github/muscles/fleet-feedback-aggregator.cjs --json      # JSON output
 */

"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");

const JSON_MODE = process.argv.includes("--json");
const AI_MEMORY_PATH = path.join(os.homedir(), "OneDrive - Correa Family", "AI-Memory");
const FEEDBACK_DIR = path.join(AI_MEMORY_PATH, "feedback");

// ── Parse YAML frontmatter ────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const fm = {};
  const lines = match[1].split("\n");
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.substring(0, colonIdx).trim();
    const value = line.substring(colonIdx + 1).trim();
    fm[key] = value;
  }
  return fm;
}

// ── Read all feedback files ───────────────────────────────────────

function readFeedbackFiles() {
  const items = [];

  if (!fs.existsSync(FEEDBACK_DIR)) {
    return items;
  }

  const files = fs.readdirSync(FEEDBACK_DIR).filter(f => f.endsWith(".md"));

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(FEEDBACK_DIR, file), "utf8");
      const fm = parseFrontmatter(content);

      // Extract summary from body
      const body = content.replace(/^---[\s\S]*?---\r?\n?/, "").trim();
      const summaryMatch = body.match(/^##\s*Summary\r?\n(.+)/m);
      const summary = summaryMatch ? summaryMatch[1].trim() : "";

      items.push({
        file,
        type: fm.type || "unknown",
        severity: fm.severity || "medium",
        heir: fm.heir || "unknown",
        date: fm.date || "",
        status: fm.status || "new",
        skill: fm.skill || extractSkillFromFile(file),
        summary,
      });
    } catch { /* skip unreadable files */ }
  }

  return items;
}

/**
 * Try to extract skill name from the feedback filename slug.
 */
function extractSkillFromFile(fileName) {
  // Filename format: {date}-{type}-{slug}.md
  const parts = fileName.replace(".md", "").split("-");
  // Skip date parts (YYYY-MM-DD) and type prefix
  if (parts.length >= 5) {
    return parts.slice(4).join("-");
  }
  return "general";
}

// ── Aggregate by dimension ────────────────────────────────────────

function aggregate(items) {
  const bySkill = {};
  const byType = {};
  const bySeverity = {};
  const byHeir = {};
  const byStatus = {};

  for (const item of items) {
    // By skill
    if (!bySkill[item.skill]) bySkill[item.skill] = [];
    bySkill[item.skill].push(item);

    // By type
    if (!byType[item.type]) byType[item.type] = 0;
    byType[item.type]++;

    // By severity
    if (!bySeverity[item.severity]) bySeverity[item.severity] = 0;
    bySeverity[item.severity]++;

    // By heir (count only, not enumerate — privacy)
    if (!byHeir[item.heir]) byHeir[item.heir] = 0;
    byHeir[item.heir]++;

    // By status
    if (!byStatus[item.status]) byStatus[item.status] = 0;
    byStatus[item.status]++;
  }

  return { bySkill, byType, bySeverity, byHeir, byStatus };
}

// ── Trend detection ───────────────────────────────────────────────

function detectTrends(bySkill) {
  const trends = [];

  for (const [skill, items] of Object.entries(bySkill)) {
    // Skills with 3+ feedback items = recurring pattern
    if (items.length >= 3) {
      const bugs = items.filter(i => i.type === "bug").length;
      const features = items.filter(i => i.type === "feature").length;
      trends.push({
        skill,
        count: items.length,
        bugs,
        features,
        signal: bugs > features ? "quality-concern" : "feature-demand",
      });
    }

    // Skills with critical severity = urgent
    const critical = items.filter(i => i.severity === "critical");
    if (critical.length > 0) {
      trends.push({
        skill,
        count: critical.length,
        signal: "critical-issue",
        items: critical.map(i => i.summary).filter(Boolean),
      });
    }
  }

  return trends.sort((a, b) => b.count - a.count);
}

// ── Main ──────────────────────────────────────────────────────────

const items = readFeedbackFiles();
const agg = aggregate(items);
const trends = detectTrends(agg.bySkill);

const report = {
  timestamp: new Date().toISOString(),
  totalFeedback: items.length,
  byType: agg.byType,
  bySeverity: agg.bySeverity,
  byStatus: agg.byStatus,
  heirCount: Object.keys(agg.byHeir).length,
  skillBreakdown: Object.fromEntries(
    Object.entries(agg.bySkill).map(([skill, its]) => [
      skill,
      { total: its.length, types: its.map(i => i.type) },
    ])
  ),
  trends,
};

if (JSON_MODE) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("# Fleet Feedback Aggregation Report");
  console.log("");
  console.log(`Generated: ${report.timestamp}`);
  console.log(`Total feedback items: ${report.totalFeedback}`);
  console.log(`Heirs reporting: ${report.heirCount}`);
  console.log("");

  if (items.length === 0) {
    console.log("No feedback files found in AI-Memory/feedback/.");
    console.log("Heirs submit feedback via the heir-feedback protocol.");
    process.exit(0);
  }

  // Type breakdown
  console.log("## By Type");
  for (const [type, count] of Object.entries(agg.byType)) {
    console.log(`  ${type}: ${count}`);
  }
  console.log("");

  // Severity breakdown
  console.log("## By Severity");
  for (const sev of ["critical", "high", "medium", "low"]) {
    if (agg.bySeverity[sev]) console.log(`  ${sev}: ${agg.bySeverity[sev]}`);
  }
  console.log("");

  // Status breakdown
  console.log("## By Status");
  for (const [status, count] of Object.entries(agg.byStatus)) {
    console.log(`  ${status}: ${count}`);
  }
  console.log("");

  // Skill breakdown (sorted by count)
  const sortedSkills = Object.entries(agg.bySkill)
    .sort(([, a], [, b]) => b.length - a.length);

  if (sortedSkills.length > 0) {
    console.log("## By Skill (top 15)");
    for (const [skill, its] of sortedSkills.slice(0, 15)) {
      const types = its.map(i => i.type);
      const bugCount = types.filter(t => t === "bug").length;
      const featureCount = types.filter(t => t === "feature").length;
      console.log(`  ${skill}: ${its.length} (${bugCount} bugs, ${featureCount} features)`);
    }
    console.log("");
  }

  // Trends
  if (trends.length > 0) {
    console.log("## Detected Trends");
    for (const t of trends) {
      console.log(`  [${t.signal}] ${t.skill}: ${t.count} items`);
    }
    console.log("");
  }

  console.log(`Feedback directory: ${FEEDBACK_DIR}`);
}

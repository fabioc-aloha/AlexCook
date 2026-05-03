#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle insight-pipeline
 * @lifecycle stable
 * @inheritance inheritable
 * @description Auto-detect patterns across sessions by scanning dream reports, assignment logs, and knowledge artifacts
 * @version 1.0.0
 * @skill knowledge-synthesis
 * @currency 2026-04-20
 * @platform windows,macos,linux
 * @requires node
 *
 * Insight Generation Pipeline (BE4)
 * Location: .github/muscles/insight-pipeline.cjs
 *
 * Scans session artifacts and extracts recurring patterns for promotion
 * to AI-Memory insights/. Run during meditation or on-demand.
 *
 * Input sources:
 *   - .github/quality/dream-report.md (latest dream)
 *   - .github/config/knowledge-artifacts.json (artifact store)
 *   - .github/quality/assignment-log.json (delegation outcomes)
 *
 * Output: JSON summary of detected patterns, recurring topics, and promotion candidates.
 *
 * Usage:
 *   node .github/muscles/insight-pipeline.cjs [workspaceRoot]
 *   node .github/muscles/insight-pipeline.cjs --json   # JSON output only
 */

"use strict";

const fs = require("fs");
const path = require("path");

const workspaceRoot = process.argv.find(a => !a.startsWith("-") && a !== process.argv[0] && a !== process.argv[1])
  || path.resolve(__dirname, "../..");
const JSON_MODE = process.argv.includes("--json");

const ghDir = path.join(workspaceRoot, ".github");
const qualityDir = path.join(ghDir, "quality");
const configDir = path.join(ghDir, "config");

// ── Load sources ──────────────────────────────────────────────────

function loadJSON(filePath) {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch { /* ignore parse errors */ }
  return null;
}

function loadText(filePath) {
  try {
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, "utf8");
  } catch { /* ignore */ }
  return "";
}

// ── Extract topics from dream report ──────────────────────────────

function extractDreamTopics(dreamText) {
  if (!dreamText) return [];
  const topics = [];
  // Extract headings as topic signals
  const headings = dreamText.match(/^#{1,3}\s+(.+)$/gm) || [];
  for (const h of headings) {
    const topic = h.replace(/^#+\s+/, "").trim();
    if (topic && topic.length < 100) topics.push(topic);
  }
  return topics;
}

// ── Detect recurring patterns in artifacts ────────────────────────

function detectRecurringPatterns(artifacts) {
  if (!artifacts || artifacts.length === 0) return { recurring: [], highConfidence: [], stale: [] };

  // Topics that appear 2+ times
  const topicCounts = {};
  for (const a of artifacts) {
    const t = (a.topic || "").toLowerCase().trim();
    if (t) topicCounts[t] = (topicCounts[t] || 0) + 1;
  }
  const recurring = Object.entries(topicCounts)
    .filter(([, count]) => count >= 2)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  // High confidence artifacts (candidates for promotion)
  const highConfidence = artifacts
    .filter(a => (a.confidence || 0) >= 0.8 && !a.supersededBy)
    .map(a => ({ id: a.id, topic: a.topic, confidence: a.confidence }));

  // Stale artifacts (old, low confidence — pruning candidates)
  const now = Date.now();
  const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
  const stale = artifacts
    .filter(a => {
      if (a.supersededBy) return false;
      const age = now - new Date(a.createdAt || 0).getTime();
      return age > NINETY_DAYS && (a.confidence || 0) < 0.5;
    })
    .map(a => ({ id: a.id, topic: a.topic, confidence: a.confidence }));

  return { recurring, highConfidence, stale };
}

// ── Analyze assignment patterns ───────────────────────────────────

function analyzeAssignments(assignments) {
  if (!assignments || assignments.length === 0) return { agentUsage: {}, failurePatterns: [] };

  const agentUsage = {};
  const failures = [];

  for (const a of assignments) {
    const agent = a.agent || a.assignedTo || "unknown";
    if (!agentUsage[agent]) agentUsage[agent] = { total: 0, success: 0, failure: 0 };
    agentUsage[agent].total++;
    if (a.outcome === "success") agentUsage[agent].success++;
    else if (a.outcome === "failure") {
      agentUsage[agent].failure++;
      failures.push({ agent, task: a.task || a.description, reason: a.failureReason });
    }
  }

  // Agents with >30% failure rate
  const failurePatterns = Object.entries(agentUsage)
    .filter(([, stats]) => stats.total >= 3 && stats.failure / stats.total > 0.3)
    .map(([agent, stats]) => ({
      agent,
      failureRate: Math.round((stats.failure / stats.total) * 100),
      total: stats.total,
    }));

  return { agentUsage, failurePatterns };
}

// ── Main ──────────────────────────────────────────────────────────

const dreamText = loadText(path.join(qualityDir, "dream-report.md"));
const artifactData = loadJSON(path.join(configDir, "knowledge-artifacts.json"));
const assignmentData = loadJSON(path.join(configDir, "assignment-log.json"))
  || loadJSON(path.join(qualityDir, "assignment-log.json"));

const dreamTopics = extractDreamTopics(dreamText);
const artifactPatterns = detectRecurringPatterns(artifactData?.artifacts || []);
const assignmentAnalysis = analyzeAssignments(assignmentData?.assignments || []);

const result = {
  timestamp: new Date().toISOString(),
  sources: {
    dreamReport: !!dreamText,
    artifacts: (artifactData?.artifacts || []).length,
    assignments: (assignmentData?.assignments || []).length,
  },
  dreamTopics,
  patterns: artifactPatterns,
  assignments: assignmentAnalysis,
  promotionCandidates: artifactPatterns.highConfidence,
  pruningCandidates: artifactPatterns.stale,
};

if (JSON_MODE) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("# Insight Pipeline Report");
  console.log("");
  console.log(`Generated: ${result.timestamp}`);
  console.log(`Sources: ${result.sources.artifacts} artifacts, ${result.sources.assignments} assignments, dream=${result.sources.dreamReport}`);
  console.log("");

  if (dreamTopics.length > 0) {
    console.log("## Dream Topics");
    for (const t of dreamTopics.slice(0, 10)) console.log(`- ${t}`);
    console.log("");
  }

  if (artifactPatterns.recurring.length > 0) {
    console.log("## Recurring Patterns");
    for (const r of artifactPatterns.recurring) console.log(`- ${r.topic} (${r.count}x)`);
    console.log("");
  }

  if (artifactPatterns.highConfidence.length > 0) {
    console.log("## Promotion Candidates (confidence >= 0.8)");
    for (const c of artifactPatterns.highConfidence) console.log(`- [${c.id}] ${c.topic} (${c.confidence})`);
    console.log("");
  }

  if (artifactPatterns.stale.length > 0) {
    console.log("## Pruning Candidates (>90d, confidence < 0.5)");
    for (const s of artifactPatterns.stale) console.log(`- [${s.id}] ${s.topic} (${s.confidence})`);
    console.log("");
  }

  if (assignmentAnalysis.failurePatterns.length > 0) {
    console.log("## Agent Failure Patterns (>30% failure rate)");
    for (const f of assignmentAnalysis.failurePatterns) console.log(`- ${f.agent}: ${f.failureRate}% (${f.total} tasks)`);
    console.log("");
  }

  if (result.promotionCandidates.length === 0 && result.pruningCandidates.length === 0 && artifactPatterns.recurring.length === 0) {
    console.log("No actionable patterns detected. Accumulate more session data.");
  }
}

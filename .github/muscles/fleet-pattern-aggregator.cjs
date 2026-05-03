#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle fleet-pattern-aggregator
 * @lifecycle stable
 * @inheritance inheritable
 * @description Cross-heir pattern aggregation and insight promotion for Fleet Intelligence
 * @version 1.0.0
 * @skill knowledge-synthesis
 * @currency 2026-04-20
 * @platform windows,macos,linux
 * @requires node
 *
 * Fleet Pattern Aggregator (FI2 + FI3)
 * Location: .github/muscles/fleet-pattern-aggregator.cjs
 *
 * Phase 1 (FI2 — Aggregate): Scans all heir projects for knowledge artifacts,
 *   strips project-specific context per cross-project-isolation rules, groups
 *   by topic, counts cross-project occurrences.
 *
 * Phase 2 (FI3 — Promote): Patterns meeting the 2-project threshold are
 *   written to AI-Memory/patterns/ for global knowledge consumption.
 *
 * Privacy rules (PG7 cross-project-isolation):
 *   - Strip first, aggregate second
 *   - No cross-reference between projects
 *   - Count, don't enumerate (e.g., "observed in 3 projects")
 *   - Minimum 2-project threshold for promotion
 *   - Domain generalization (no client/project names)
 *
 * Usage:
 *   node .github/muscles/fleet-pattern-aggregator.cjs                # Full run
 *   node .github/muscles/fleet-pattern-aggregator.cjs --dry-run      # Preview only
 *   node .github/muscles/fleet-pattern-aggregator.cjs --json         # JSON output
 */

"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");

const DRY_RUN = process.argv.includes("--dry-run");
const JSON_MODE = process.argv.includes("--json");

// ── Configuration ─────────────────────────────────────────────────

const DEV_FOLDER = "C:\\Development";
const AI_MEMORY_PATH = path.join(os.homedir(), "OneDrive - Correa Family", "AI-Memory");
const PATTERNS_DIR = path.join(AI_MEMORY_PATH, "patterns");
const MIN_PROJECT_THRESHOLD = 2;

// ── Cross-Project Isolation Stripping (PG7) ───────────────────────

/**
 * Strip project-specific context from a string per cross-project-isolation rules.
 * Must be applied BEFORE aggregation — never collect raw then strip.
 */
function stripProjectContext(text) {
  if (!text || typeof text !== "string") return text || "";

  let stripped = text;

  // Strip absolute file paths (Windows and Unix)
  stripped = stripped.replace(/[A-Z]:\\[^\s,;)]+/gi, "[path]");
  stripped = stripped.replace(/\/(?:home|Users|var|opt|srv)\/[^\s,;)]+/g, "[path]");

  // Strip relative file paths with extensions
  stripped = stripped.replace(/\b[\w\-./\\]+\.\w{1,5}(?::\d+)?/g, function (match) {
    // Keep technology names and common terms
    if (/^(package\.json|tsconfig\.json|README\.md|index\.\w+)$/i.test(match)) return match;
    return "[file]";
  });

  // Strip GitHub URLs
  stripped = stripped.replace(/https?:\/\/github\.com\/[^\s)]+/g, "[repo]");

  // Strip PR/issue references
  stripped = stripped.replace(/\b(?:PR|pull request|issue)\s*#\d+/gi, "[ref]");

  // Strip branch names (feature/xxx, fix/xxx)
  stripped = stripped.replace(/\b(?:feature|fix|hotfix|release)\/[\w\-]+/g, "[branch]");

  return stripped.trim();
}

/**
 * Generalize domain-specific terms per isolation rules.
 */
function generalizeDomain(topic) {
  if (!topic) return topic;
  let g = topic;
  // Domain generalization examples
  g = g.replace(/\bhealthcare\b/gi, "regulated domain");
  g = g.replace(/\bfintech\b/gi, "compliance-heavy domain");
  g = g.replace(/\bpatient\b/gi, "domain entity");
  g = g.replace(/\bFHIR\b/g, "domain standard");
  return g;
}

// ── Project Discovery ─────────────────────────────────────────────

function discoverHeirProjects() {
  const projects = [];
  try {
    const entries = fs.readdirSync(DEV_FOLDER);
    for (const entry of entries) {
      if (entry === ".vscode") continue;
      const projectPath = path.join(DEV_FOLDER, entry);
      try {
        const stat = fs.statSync(projectPath);
        if (!stat.isDirectory()) continue;
      } catch { continue; }

      const githubDir = path.join(projectPath, ".github");
      if (!fs.existsSync(githubDir)) continue;

      // Skip AlexMaster itself — we want heir projects
      if (entry === "AlexMaster") continue;

      projects.push({ name: entry, path: projectPath });
    }
  } catch (e) {
    console.error("Failed to scan dev folder:", e.message);
  }
  return projects;
}

// ── Extract Patterns from a Single Project ────────────────────────

function extractProjectPatterns(projectPath) {
  const patterns = [];

  // Source 1: knowledge-artifacts.json
  const artifactsPath = path.join(projectPath, ".github", "config", "knowledge-artifacts.json");
  if (fs.existsSync(artifactsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));
      const artifacts = data.artifacts || [];
      for (const a of artifacts) {
        if (a.supersededBy) continue; // Skip superseded
        const topic = stripProjectContext(generalizeDomain(a.topic || ""));
        if (topic && topic.length > 3) {
          patterns.push({
            topic: topic.toLowerCase().trim(),
            confidence: a.confidence || 0,
            category: a.category || "general",
          });
        }
      }
    } catch { /* ignore parse errors */ }
  }

  // Source 2: learned patterns in instructions (look for pattern headings)
  const learnedPath = path.join(projectPath, ".github", "instructions", "learned-patterns.instructions.md");
  if (fs.existsSync(learnedPath)) {
    try {
      const content = fs.readFileSync(learnedPath, "utf8");
      const headings = content.match(/^##\s+(.+)$/gm) || [];
      for (const h of headings) {
        const topic = h.replace(/^##\s+/, "").trim().toLowerCase();
        if (topic && topic.length > 3) {
          patterns.push({ topic, confidence: 0.7, category: "learned-pattern" });
        }
      }
    } catch { /* ignore */ }
  }

  // Source 3: dream report topics (lightweight signal)
  const dreamPath = path.join(projectPath, ".github", "quality", "dream-report.md");
  if (fs.existsSync(dreamPath)) {
    try {
      const content = fs.readFileSync(dreamPath, "utf8");
      const headings = content.match(/^##\s+(.+)$/gm) || [];
      for (const h of headings) {
        const topic = stripProjectContext(h.replace(/^##\s+/, "").trim().toLowerCase());
        if (topic && topic.length > 3) {
          patterns.push({ topic, confidence: 0.5, category: "dream-topic" });
        }
      }
    } catch { /* ignore */ }
  }

  return patterns;
}

// ── Phase 1: Aggregate Across Projects (FI2) ──────────────────────

function aggregatePatterns(projects) {
  // topic → { count: N, maxConfidence, categories: Set }
  const topicMap = new Map();

  for (const project of projects) {
    const patterns = extractProjectPatterns(project.path);

    // Dedupe topics within a single project before counting
    const seenInProject = new Set();
    for (const p of patterns) {
      if (seenInProject.has(p.topic)) continue;
      seenInProject.add(p.topic);

      if (topicMap.has(p.topic)) {
        const existing = topicMap.get(p.topic);
        existing.projectCount++;
        existing.maxConfidence = Math.max(existing.maxConfidence, p.confidence);
        existing.categories.add(p.category);
      } else {
        topicMap.set(p.topic, {
          projectCount: 1,
          maxConfidence: p.confidence,
          categories: new Set([p.category]),
        });
      }
    }
  }

  // Convert to array, sorted by project count then confidence
  return Array.from(topicMap.entries())
    .map(([topic, data]) => ({
      topic,
      projectCount: data.projectCount,
      maxConfidence: data.maxConfidence,
      categories: [...data.categories],
    }))
    .sort((a, b) => b.projectCount - a.projectCount || b.maxConfidence - a.maxConfidence);
}

// ── Phase 2: Promote to AI-Memory/patterns/ (FI3) ────────────────

function promotePatterns(aggregated) {
  const promoted = aggregated.filter(p => p.projectCount >= MIN_PROJECT_THRESHOLD);

  if (promoted.length === 0) {
    if (!JSON_MODE) console.log("No patterns met the 2-project threshold for promotion.");
    return [];
  }

  if (!DRY_RUN) {
    // Ensure patterns directory exists
    if (!fs.existsSync(PATTERNS_DIR)) {
      fs.mkdirSync(PATTERNS_DIR, { recursive: true });
    }
  }

  const timestamp = new Date().toISOString().split("T")[0];
  const results = [];

  for (const p of promoted) {
    // Create a slug from the topic
    const slug = p.topic
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);

    const fileName = `${slug}.md`;
    const filePath = path.join(PATTERNS_DIR, fileName);

    const content = [
      "---",
      `topic: "${p.topic}"`,
      `observedIn: ${p.projectCount}`,
      `maxConfidence: ${p.maxConfidence}`,
      `categories: [${p.categories.map(c => `"${c}"`).join(", ")}]`,
      `lastUpdated: "${timestamp}"`,
      "---",
      "",
      `# ${p.topic.charAt(0).toUpperCase() + p.topic.slice(1)}`,
      "",
      `Observed in ${p.projectCount} projects. Categories: ${p.categories.join(", ")}.`,
      "",
    ].join("\n");

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, "utf8");
    }

    results.push({
      topic: p.topic,
      file: fileName,
      projectCount: p.projectCount,
      promoted: !DRY_RUN,
    });
  }

  return results;
}

// ── Main ──────────────────────────────────────────────────────────

const projects = discoverHeirProjects();
const aggregated = aggregatePatterns(projects);
const promoted = promotePatterns(aggregated);

const belowThreshold = aggregated.filter(p => p.projectCount < MIN_PROJECT_THRESHOLD);

const report = {
  timestamp: new Date().toISOString(),
  dryRun: DRY_RUN,
  projectsScanned: projects.length,
  totalTopics: aggregated.length,
  aboveThreshold: promoted.length,
  belowThreshold: belowThreshold.length,
  promoted,
  topPatterns: aggregated.slice(0, 20),
};

if (JSON_MODE) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("# Fleet Pattern Aggregation Report");
  console.log("");
  console.log(`Generated: ${report.timestamp}${DRY_RUN ? " (DRY RUN)" : ""}`);
  console.log(`Projects scanned: ${report.projectsScanned}`);
  console.log(`Unique topics found: ${report.totalTopics}`);
  console.log(`Above ${MIN_PROJECT_THRESHOLD}-project threshold: ${report.aboveThreshold}`);
  console.log(`Below threshold: ${report.belowThreshold}`);
  console.log("");

  if (promoted.length > 0) {
    console.log("## Promoted Patterns");
    for (const p of promoted) {
      console.log(`  ${p.promoted ? "+" : "~"} ${p.topic} (${p.projectCount} projects) -> ${p.file}`);
    }
    console.log("");
  }

  if (aggregated.length > 0) {
    console.log("## Top Patterns (by project count)");
    for (const p of aggregated.slice(0, 20)) {
      const marker = p.projectCount >= MIN_PROJECT_THRESHOLD ? "+" : " ";
      console.log(`  ${marker} [${p.projectCount}] ${p.topic} (${p.categories.join(", ")})`);
    }
    console.log("");
  }

  console.log(`Patterns directory: ${PATTERNS_DIR}`);
}

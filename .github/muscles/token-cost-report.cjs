#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle token-cost-report
 * @lifecycle stable
 * @inheritance inheritable
 * @description Measure token cost of always-loaded instructions and all brain files
 * @version 1.0.0
 * @skill token-waste-elimination
 * @currency 2026-04-21
 * @platform windows,macos,linux
 * @requires node
 *
 * Token Cost Report — measures character count and estimated tokens for brain files.
 * Identifies the highest-cost always-loaded instructions (applyTo: "**").
 *
 * Usage:
 *   node token-cost-report.cjs              # Generate report to .github/quality/
 *   node token-cost-report.cjs --stdout     # Output to stdout
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const GH = path.join(ROOT, ".github");
const QUALITY_DIR = path.join(GH, "quality");
const STDOUT_MODE = process.argv.includes("--stdout");

// ~4 chars per token (conservative estimate for English prose + markdown)
const CHARS_PER_TOKEN = 4;

function estimateTokens(text) {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

// --- Extract applyTo from frontmatter ---
function extractApplyTo(content) {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;
  const fm = fmMatch[1];
  const applyMatch = fm.match(/^applyTo:\s*["']?(.*?)["']?\s*$/m);
  return applyMatch ? applyMatch[1].trim() : null;
}

// --- Scan instruction files ---
function scanInstructions() {
  const instrDir = path.join(GH, "instructions");
  if (!fs.existsSync(instrDir)) return [];

  const files = fs.readdirSync(instrDir).filter(f => f.endsWith(".instructions.md"));
  const results = [];

  for (const file of files) {
    const filePath = path.join(instrDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const name = file.replace(".instructions.md", "");
    const chars = content.length;
    const tokens = estimateTokens(content);
    const lines = content.split("\n").length;
    const applyTo = extractApplyTo(content);
    const alwaysLoaded = applyTo === "**";

    results.push({ name, file, chars, tokens, lines, applyTo, alwaysLoaded });
  }

  return results;
}

// --- Scan skill files ---
function scanSkills() {
  const skillsDir = path.join(GH, "skills");
  if (!fs.existsSync(skillsDir)) return [];

  const results = [];
  const dirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const dir of dirs) {
    const skillPath = path.join(skillsDir, dir.name, "SKILL.md");
    if (!fs.existsSync(skillPath)) continue;

    const content = fs.readFileSync(skillPath, "utf-8");
    const chars = content.length;
    const tokens = estimateTokens(content);
    const lines = content.split("\n").length;

    results.push({ name: dir.name, chars, tokens, lines });
  }

  return results;
}

// --- Scan agent files ---
function scanAgents() {
  const agentsDir = path.join(GH, "agents");
  if (!fs.existsSync(agentsDir)) return [];

  const files = fs.readdirSync(agentsDir).filter(f => f.endsWith(".agent.md"));
  const results = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(agentsDir, file), "utf-8");
    const name = file.replace(".agent.md", "");
    const chars = content.length;
    const tokens = estimateTokens(content);
    const lines = content.split("\n").length;

    results.push({ name, chars, tokens, lines });
  }

  return results;
}

// --- Generate report ---
function generateReport() {
  const instructions = scanInstructions();
  const skills = scanSkills();
  const agents = scanAgents();

  const date = new Date().toISOString().split("T")[0];
  const out = [];

  out.push("# Token Cost Report");
  out.push("");
  out.push(`Generated: ${date}`);
  out.push("");
  out.push("> Estimates ~4 chars/token. Actual tokenization varies by model.");
  out.push("");

  // --- Always-loaded instructions (applyTo: "**") ---
  const alwaysOn = instructions.filter(i => i.alwaysLoaded).sort((a, b) => b.tokens - a.tokens);
  const alwaysOnTotal = alwaysOn.reduce((sum, i) => sum + i.tokens, 0);

  out.push("## Always-Loaded Instructions");
  out.push("");
  out.push(`These ${alwaysOn.length} instructions load on **every** prompt (applyTo: \`**\`).`);
  out.push(`Combined cost: **~${alwaysOnTotal.toLocaleString()} tokens** per prompt.`);
  out.push("");
  out.push("| # | Instruction | Chars | ~Tokens | Lines | % of Total |");
  out.push("|--:|-------------|------:|--------:|------:|-----------:|");

  for (let i = 0; i < alwaysOn.length; i++) {
    const item = alwaysOn[i];
    const pct = ((item.tokens / alwaysOnTotal) * 100).toFixed(1);
    out.push(`| ${i + 1} | ${item.name} | ${item.chars.toLocaleString()} | ${item.tokens.toLocaleString()} | ${item.lines} | ${pct}% |`);
  }

  out.push("");
  out.push(`**Budget impact**: At 128K context, always-on instructions consume ~${((alwaysOnTotal / 128000) * 100).toFixed(1)}% of context window.`);
  out.push("");

  // --- All instructions by size ---
  const allInstr = [...instructions].sort((a, b) => b.tokens - a.tokens);
  const instrTotal = allInstr.reduce((sum, i) => sum + i.tokens, 0);

  out.push("## All Instructions by Token Cost");
  out.push("");
  out.push(`Total: ${allInstr.length} instructions, ~${instrTotal.toLocaleString()} tokens`);
  out.push("");
  out.push("| # | Instruction | Chars | ~Tokens | Lines | applyTo | Always |");
  out.push("|--:|-------------|------:|--------:|------:|---------|:------:|");

  for (let i = 0; i < allInstr.length; i++) {
    const item = allInstr[i];
    const applyTo = item.applyTo || '-';
    const always = item.alwaysLoaded ? "✓" : "";
    const displayApplyTo = applyTo.length > 30 ? applyTo.substring(0, 27) + "..." : applyTo;
    out.push(`| ${i + 1} | ${item.name} | ${item.chars.toLocaleString()} | ${item.tokens.toLocaleString()} | ${item.lines} | ${displayApplyTo} | ${always} |`);
  }

  out.push("");

  // --- Skills by size ---
  const sortedSkills = [...skills].sort((a, b) => b.tokens - a.tokens);
  const skillsTotal = sortedSkills.reduce((sum, s) => sum + s.tokens, 0);

  out.push("## Skills by Token Cost");
  out.push("");
  out.push(`Total: ${sortedSkills.length} skills, ~${skillsTotal.toLocaleString()} tokens (loaded on-demand)`);
  out.push("");
  out.push("| # | Skill | Chars | ~Tokens | Lines |");
  out.push("|--:|-------|------:|--------:|------:|");

  for (let i = 0; i < Math.min(sortedSkills.length, 20); i++) {
    const item = sortedSkills[i];
    out.push(`| ${i + 1} | ${item.name} | ${item.chars.toLocaleString()} | ${item.tokens.toLocaleString()} | ${item.lines} |`);
  }

  if (sortedSkills.length > 20) {
    out.push(`| ... | *${sortedSkills.length - 20} more skills* | | | |`);
  }

  out.push("");

  // --- Agents by size ---
  const sortedAgents = [...agents].sort((a, b) => b.tokens - a.tokens);
  const agentsTotal = sortedAgents.reduce((sum, a) => sum + a.tokens, 0);

  out.push("## Agents by Token Cost");
  out.push("");
  out.push(`Total: ${sortedAgents.length} agents, ~${agentsTotal.toLocaleString()} tokens (loaded on-demand)`);
  out.push("");
  out.push("| # | Agent | Chars | ~Tokens | Lines |");
  out.push("|--:|-------|------:|--------:|------:|");

  for (const item of sortedAgents) {
    out.push(`| ${sortedAgents.indexOf(item) + 1} | ${item.name} | ${item.chars.toLocaleString()} | ${item.tokens.toLocaleString()} | ${item.lines} |`);
  }

  out.push("");

  // --- Summary ---
  out.push("## Summary");
  out.push("");
  out.push("| Category | Files | ~Total Tokens | Loading |");
  out.push("|----------|------:|--------------:|---------|");
  out.push(`| Always-on instructions | ${alwaysOn.length} | ${alwaysOnTotal.toLocaleString()} | Every prompt |`);
  out.push(`| Conditional instructions | ${allInstr.length - alwaysOn.length} | ${(instrTotal - alwaysOnTotal).toLocaleString()} | Pattern match |`);
  out.push(`| Skills | ${skills.length} | ${skillsTotal.toLocaleString()} | On-demand |`);
  out.push(`| Agents | ${agents.length} | ${agentsTotal.toLocaleString()} | On-demand |`);
  out.push(`| **Total brain** | **${allInstr.length + skills.length + agents.length}** | **${(instrTotal + skillsTotal + agentsTotal).toLocaleString()}** | |`);

  return out.join("\n");
}

// --- Main ---
if (require.main === module) {
  if (!fs.existsSync(QUALITY_DIR)) {
    fs.mkdirSync(QUALITY_DIR, { recursive: true });
  }

  const report = generateReport();

  if (STDOUT_MODE) {
    console.log(report);
  } else {
    const outputPath = path.join(QUALITY_DIR, "token-cost-report.md");
    fs.writeFileSync(outputPath, report);
    console.log(`Token cost report written to ${path.relative(ROOT, outputPath)}`);
  }
}

// --- Exports for testing ---
if (typeof module !== 'undefined') {
  module.exports = { generateReport, estimateTokens, extractApplyTo };
}

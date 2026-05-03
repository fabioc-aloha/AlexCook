/**
 * @module skill-meta
 * @inheritance inheritable
 * @description Shared skill-frontmatter introspection helpers for brain validators.
 * @platform windows,macos,linux
 * @requires node
 *
 * Single source of truth for skill metadata logic consumed by brain-qa.cjs,
 * dream-cli.cjs, and any other validator that classifies skills. Keeping this
 * here prevents validators from drifting (e.g. dream-cli flagging non-workflow
 * skills as missing trifecta partners while brain-qa correctly skips them).
 *
 * Public surface:
 *   - WORKFLOW_PATTERNS — regex array used to detect workflow content
 *   - isWorkflowSkill(content)        — content has phase/step/workflow/procedure/process headings
 *   - parseSkillFrontmatter(content)  — extracts tier, currency, name, etc.
 *   - needsTrifecta(content)          — tier === 'workflow' OR isWorkflowSkill(content)
 *   - hasMatchingInstruction(ghDir, name)
 *   - hasMatchingPrompt(ghDir, name)
 *
 * @currency 2026-04-25
 */

"use strict";

const fs = require("fs");
const path = require("path");

// Regex patterns that indicate a SKILL.md describes a workflow (procedural
// content) and therefore benefits from a paired .instructions.md or .prompt.md
// trifecta partner. Domain-knowledge skills (anti-hallucination, alex-character,
// silence-as-signal, etc.) lack these patterns and are intentionally skipped
// by trifecta validators.
const WORKFLOW_PATTERNS = [
  /(?:^|\n)##?\s*(?:phase|step|stage)\s*\d/i, // "Phase 1", "Step 2", "Stage 3"
  /(?:^|\n)##?\s*workflow/i,                  // "## Workflow" section
  /(?:^|\n)##?\s*procedure/i,                 // "## Procedure" section
  /(?:^|\n)##?\s*process/i,                   // "## Process" section
];

function isWorkflowSkill(content) {
  return WORKFLOW_PATTERNS.some((p) => p.test(content));
}

/**
 * Parse the YAML-ish frontmatter of a SKILL.md.
 * Returns an object with the fields validators care about. Missing fields
 * are returned as null so callers can apply their own defaults.
 *
 * @param {string} content
 * @returns {{tier: string|null, currency: string|null, name: string|null, description: string|null, applyTo: string|null, hasFrontmatter: boolean}}
 */
function parseSkillFrontmatter(content) {
  const tierMatch = content.match(/^tier:\s*(\w+)/m);
  const currencyMatch = content.match(/^currency:\s*(\d{4}-\d{2}-\d{2})/m);
  const nameMatch = content.match(/^name:\s*["']?([^"'\n]+?)["']?\s*$/m);
  const descMatch = content.match(/^description:\s*["']?([^"'\n]+?)["']?\s*$/m);
  const applyMatch = content.match(/^applyTo:\s*(.+)$/m);

  return {
    tier: tierMatch ? tierMatch[1].toLowerCase() : null,
    currency: currencyMatch ? currencyMatch[1] : null,
    name: nameMatch ? nameMatch[1].trim() : null,
    description: descMatch ? descMatch[1].trim() : null,
    applyTo: applyMatch ? applyMatch[1].trim() : null,
    hasFrontmatter: content.startsWith("---"),
  };
}

/**
 * True when a skill warrants a trifecta partner (instruction or prompt).
 * Combines explicit `tier: workflow` with content-pattern detection so that
 * skills authored before the tier convention still get correctly classified.
 *
 * @param {string} content — full SKILL.md text
 * @returns {boolean}
 */
function needsTrifecta(content) {
  const { tier } = parseSkillFrontmatter(content);
  if (tier === "workflow") return true;
  // Standard / extended / reference tier skills only need a trifecta if the
  // body actually describes a workflow.
  return isWorkflowSkill(content);
}

function hasMatchingInstruction(ghDir, skillName) {
  return fs.existsSync(
    path.join(ghDir, "instructions", `${skillName}.instructions.md`)
  );
}

function hasMatchingPrompt(ghDir, skillName) {
  return fs.existsSync(
    path.join(ghDir, "prompts", `${skillName}.prompt.md`)
  );
}

module.exports = {
  WORKFLOW_PATTERNS,
  isWorkflowSkill,
  parseSkillFrontmatter,
  needsTrifecta,
  hasMatchingInstruction,
  hasMatchingPrompt,
};

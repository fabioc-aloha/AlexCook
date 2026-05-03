/**
 * Phase-2 Decision Logger (PE1)
 *
 * Appends structured entries to `.github/quality/phase2-decisions.jsonl`
 * whenever the LLM acts on a `.backup.md`, applies a decision table,
 * or makes a semantic judgment during Phase 2 of any trifecta workflow.
 *
 * Schema per line (JSONL — one JSON object per line):
 * {
 *   "timestamp":  ISO 8601 string,
 *   "skill":      skill name that guided the decision (e.g. "brain-upgrade"),
 *   "table":      decision table name/ID applied (e.g. "Sync Drift Decision Table"),
 *   "input":      brief description of what was evaluated (no PII, no file paths with usernames),
 *   "row":        which table row matched (number or short label),
 *   "decision":   the verdict — "accept" | "reject" | "regenerate" | "merge" | "archive" | "escalate" | "defer",
 *   "rationale":  1-2 sentence explanation of why this row matched,
 *   "actor":      "llm" | "operator" | "llm+operator",
 *   "reversible": boolean — true if a .backup.md or undo path exists,
 *   "backupPath": relative path to .backup.md if reversible (optional)
 * }
 *
 * Usage (CJS):
 *   const { logPhase2Decision } = require('./phase2-decision-log.cjs');
 *   logPhase2Decision({
 *     skill: 'brain-upgrade',
 *     table: 'Backup Merge Decision Table',
 *     input: 'copilot-instructions.backup.md — custom identity section detected',
 *     row: 3,
 *     decision: 'merge',
 *     rationale: 'Backup contains user-authored identity text not present in new version',
 *     actor: 'llm+operator',
 *     reversible: true,
 *     backupPath: '.github/copilot-instructions.backup.md'
 *   });
 *
 * Usage (CLI):
 *   node phase2-decision-log.cjs --skill brain-upgrade --table "Backup Merge" \
 *     --input "custom identity" --row 3 --decision merge --rationale "user text" --actor llm
 *
 * PII filter (SK3 integration):
 *   Before writing, all string fields are scanned for:
 *   - Absolute paths with usernames (C:\Users\..., /home/...)
 *   - Email addresses
 *   - API keys / tokens (bearer, sk-, ghp_, etc.)
 *   Matches are replaced with [REDACTED].
 *
 * @module phase2-decision-log
 * @type muscle
 * @lifecycle stable
 * @inheritance inheritable
 */

'use strict';

const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(process.cwd(), '.github', 'quality', 'phase2-decisions.jsonl');

const VALID_DECISIONS = ['accept', 'reject', 'regenerate', 'merge', 'archive', 'escalate', 'defer'];
const VALID_ACTORS = ['llm', 'operator', 'llm+operator'];

// PII patterns (SK3) — strip before writing
const PII_PATTERNS = [
  // Absolute paths with usernames
  /[A-Z]:\\Users\\[^\\]+\\[^\s"]*/gi,
  /\/home\/[^/]+\/[^\s"]*/gi,
  /\/Users\/[^/]+\/[^\s"]*/gi,
  // Email addresses
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // API keys / tokens
  /\b(Bearer\s+)[A-Za-z0-9_-]{20,}/gi,
  /\b(sk-|ghp_|gho_|github_pat_)[A-Za-z0-9_-]{10,}/gi,
  // Connection strings
  /AccountKey=[^;"\s]+/gi,
  /password=[^;"\s]+/gi,
];

/**
 * Strip PII from a string value.
 * @param {string} value
 * @returns {string}
 */
function stripPII(value) {
  if (typeof value !== 'string') return value;
  let clean = value;
  for (const pattern of PII_PATTERNS) {
    clean = clean.replace(pattern, '[REDACTED]');
  }
  return clean;
}

/**
 * Validate and sanitize a decision entry.
 * @param {object} entry
 * @returns {object} sanitized entry
 */
function sanitizeEntry(entry) {
  if (!entry.skill || typeof entry.skill !== 'string') {
    throw new Error('phase2-decision-log: "skill" is required (string)');
  }
  if (!entry.decision || !VALID_DECISIONS.includes(entry.decision)) {
    throw new Error(`phase2-decision-log: "decision" must be one of: ${VALID_DECISIONS.join(', ')}`);
  }
  if (entry.actor && !VALID_ACTORS.includes(entry.actor)) {
    throw new Error(`phase2-decision-log: "actor" must be one of: ${VALID_ACTORS.join(', ')}`);
  }

  return {
    timestamp: new Date().toISOString(),
    skill: stripPII(entry.skill),
    table: stripPII(entry.table || ''),
    input: stripPII(entry.input || ''),
    row: entry.row != null ? entry.row : null,
    decision: entry.decision,
    rationale: stripPII(entry.rationale || ''),
    actor: entry.actor || 'llm',
    reversible: Boolean(entry.reversible),
    backupPath: entry.backupPath ? stripPII(entry.backupPath) : null,
  };
}

/**
 * Append a Phase-2 decision to the log.
 * @param {object} entry - Decision entry (see schema above)
 */
function logPhase2Decision(entry) {
  const sanitized = sanitizeEntry(entry);
  const line = JSON.stringify(sanitized) + '\n';

  // Ensure directory exists
  const dir = path.dirname(LOG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.appendFileSync(LOG_PATH, line, 'utf8');
  return sanitized;
}

/**
 * Read all decisions from the log.
 * @returns {object[]} array of decision entries
 */
function readDecisionLog() {
  if (!fs.existsSync(LOG_PATH)) return [];
  const content = fs.readFileSync(LOG_PATH, 'utf8').trim();
  if (!content) return [];
  return content.split('\n').map(line => JSON.parse(line));
}

/**
 * Query decisions by skill name.
 * @param {string} skill
 * @returns {object[]}
 */
function queryBySkill(skill) {
  return readDecisionLog().filter(d => d.skill === skill);
}

// CLI mode
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--read')) {
    const skill = args[args.indexOf('--skill') + 1];
    const decisions = skill ? queryBySkill(skill) : readDecisionLog();
    console.log(JSON.stringify(decisions, null, 2));
    process.exit(0);
  }

  // Parse --key value pairs
  const entry = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const val = args[i + 1];
    if (key === 'reversible') {
      entry[key] = val === 'true';
    } else if (key === 'row') {
      entry[key] = isNaN(val) ? val : Number(val);
    } else {
      entry[key] = val;
    }
  }

  try {
    const result = logPhase2Decision(entry);
    console.log('Logged:', JSON.stringify(result));
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { logPhase2Decision, readDecisionLog, queryBySkill, stripPII, LOG_PATH };

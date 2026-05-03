/**
 * Phase-2 Rollback Helper (PE2)
 *
 * Restores a `.backup.md` file's content to its active counterpart,
 * logging the rollback as a Phase-2 decision (via PE1's decision log).
 *
 * Use case: an LLM-led merge or curation introduced a regression.
 * The operator wants to revert to the pre-Phase-2 state without
 * a full git checkout.
 *
 * Usage (CJS):
 *   const { rollbackFromBackup } = require('./phase2-rollback.cjs');
 *   rollbackFromBackup('.github/copilot-instructions.backup.md', {
 *     skill: 'brain-upgrade',
 *     rationale: 'LLM merge lost custom identity section'
 *   });
 *
 * Usage (CLI):
 *   node phase2-rollback.cjs .github/copilot-instructions.backup.md \
 *     --skill brain-upgrade --rationale "merge lost custom section"
 *
 * What it does:
 *   1. Validates the backup file exists
 *   2. Derives the active file path (strips .backup.md → .md)
 *   3. Copies backup content over the active file
 *   4. Logs a "reject" decision via phase2-decision-log.cjs
 *   5. Preserves the backup file (operator decides when to delete)
 *
 * @module phase2-rollback
 * @type muscle
 * @lifecycle stable
 * @inheritance inheritable
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { logPhase2Decision } = require('./phase2-decision-log.cjs');

/**
 * Derive the active file path from a backup path.
 * .backup.md → .md
 * .backup.json → .json
 * @param {string} backupPath
 * @returns {string}
 */
function deriveActivePath(backupPath) {
  // Handle .backup.md and .backup.json patterns
  const match = backupPath.match(/^(.+)\.backup(\.\w+)$/);
  if (!match) {
    throw new Error(`Not a backup file pattern: ${backupPath}. Expected *.backup.md or *.backup.json`);
  }
  return match[1] + match[2];
}

/**
 * Rollback an active file to its backup content.
 * @param {string} backupPath - Relative or absolute path to the .backup.md file
 * @param {object} opts
 * @param {string} opts.skill - Skill name for the decision log
 * @param {string} [opts.rationale] - Why the rollback is needed
 * @returns {{ activePath: string, backupPath: string, logged: object }}
 */
function rollbackFromBackup(backupPath, opts = {}) {
  const resolvedBackup = path.resolve(backupPath);

  if (!fs.existsSync(resolvedBackup)) {
    throw new Error(`Backup file not found: ${resolvedBackup}`);
  }

  const activePath = deriveActivePath(resolvedBackup);

  if (!fs.existsSync(activePath)) {
    throw new Error(`Active file not found: ${activePath}. Cannot rollback to a file that doesn't exist.`);
  }

  // Read backup content
  const backupContent = fs.readFileSync(resolvedBackup, 'utf8');

  // Write to active file
  fs.writeFileSync(activePath, backupContent, 'utf8');

  // Log the rollback decision
  const logged = logPhase2Decision({
    skill: opts.skill || 'unknown',
    table: 'Phase-2 Rollback',
    input: `Rolled back ${path.relative(process.cwd(), activePath)} from backup`,
    decision: 'reject',
    rationale: opts.rationale || 'Operator-initiated rollback to pre-Phase-2 state',
    actor: 'operator',
    reversible: true,
    backupPath: path.relative(process.cwd(), resolvedBackup),
  });

  return {
    activePath: path.relative(process.cwd(), activePath),
    backupPath: path.relative(process.cwd(), resolvedBackup),
    logged,
  };
}

// CLI mode
if (require.main === module) {
  const args = process.argv.slice(2);
  const backupFile = args[0];

  if (!backupFile || backupFile.startsWith('--')) {
    console.error('Usage: node phase2-rollback.cjs <backup-file> [--skill name] [--rationale "reason"]');
    process.exit(1);
  }

  const opts = {};
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    opts[key] = args[i + 1];
  }

  try {
    const result = rollbackFromBackup(backupFile, opts);
    console.log(`Rolled back: ${result.activePath}`);
    console.log(`From backup: ${result.backupPath}`);
    console.log(`Decision logged at: .github/quality/phase2-decisions.jsonl`);
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { rollbackFromBackup, deriveActivePath };

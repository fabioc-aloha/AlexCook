/**
 * @type muscle
 * @lifecycle stable
 * @muscle round-trip-validator
 * @inheritance inheritable
 * @description Round-trip validation for reversible converter pairs (FC3)
 * @version 1.0.0
 * @currency 2026-04-26
 *
 * Validates that converting A→B→A produces semantically equivalent output.
 * Supported pairs: md↔docx, md↔html.
 *
 * Usage (CLI):
 *   node .github/muscles/shared/round-trip-validator.cjs SOURCE.md --pair md-docx [--keep-temp]
 *
 * Usage (require):
 *   const { validateRoundTrip } = require('./shared/round-trip-validator.cjs');
 *   const result = await validateRoundTrip('source.md', 'md-docx', { keepTemp: false });
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const MUSCLES_DIR = path.resolve(__dirname, '..');

/** Converter pairs: forward + reverse muscle paths */
const PAIRS = {
  'md-docx': {
    forward: path.join(MUSCLES_DIR, 'md-to-word.cjs'),
    reverse: path.join(MUSCLES_DIR, 'docx-to-md.cjs'),
    forwardExt: '.docx',
    reverseExt: '.md',
  },
  'md-html': {
    forward: path.join(MUSCLES_DIR, 'md-to-html.cjs'),
    reverse: null, // html-to-md not yet available
    forwardExt: '.html',
    reverseExt: '.md',
  },
};

/**
 * Normalize markdown for semantic comparison.
 * Strips volatile differences that don't affect meaning.
 * @param {string} text
 * @returns {string}
 */
function normalizeMarkdown(text) {
  return text
    .replace(/\r\n/g, '\n')           // CRLF → LF
    .replace(/\n{3,}/g, '\n\n')       // Collapse multiple blank lines
    .replace(/[ \t]+$/gm, '')         // Trailing whitespace
    .replace(/^---[\s\S]*?---\n*/m, '')// Strip YAML frontmatter (may be added/removed)
    .replace(/\\\[/g, '[')            // Pandoc escape quirks
    .replace(/\\\]/g, ']')
    .replace(/\\([#*_~`])/g, '$1')    // Pandoc backslash escapes
    .trim();
}

/**
 * Simple line-level diff producing a semantic delta report.
 * @param {string} original - Normalized original content
 * @param {string} roundTripped - Normalized round-tripped content
 * @returns {{ totalLines: number, addedLines: number, removedLines: number, changedSections: string[], fidelityScore: number }}
 */
function semanticDiff(original, roundTripped) {
  const origLines = original.split('\n');
  const rtLines = roundTripped.split('\n');

  const origSet = new Set(origLines.map(l => l.trim()).filter(Boolean));
  const rtSet = new Set(rtLines.map(l => l.trim()).filter(Boolean));

  const removed = [...origSet].filter(l => !rtSet.has(l));
  const added = [...rtSet].filter(l => !origSet.has(l));

  // Identify which heading sections lost content
  const changedSections = [];
  let currentHeading = '(top)';
  for (const line of origLines) {
    if (/^#{1,6}\s/.test(line)) currentHeading = line.replace(/^#+\s*/, '').trim();
    if (removed.includes(line.trim()) && !changedSections.includes(currentHeading)) {
      changedSections.push(currentHeading);
    }
  }

  const totalUnique = new Set([...origSet, ...rtSet]).size;
  const matchCount = [...origSet].filter(l => rtSet.has(l)).length;
  const fidelityScore = totalUnique > 0 ? Math.round((matchCount / totalUnique) * 100) : 100;

  return {
    totalLines: Math.max(origLines.length, rtLines.length),
    addedLines: added.length,
    removedLines: removed.length,
    changedSections,
    fidelityScore,
    samples: {
      removed: removed.slice(0, 5).map(l => l.substring(0, 100)),
      added: added.slice(0, 5).map(l => l.substring(0, 100)),
    },
  };
}

/**
 * Run round-trip validation.
 * @param {string} sourcePath - Path to the source file
 * @param {'md-docx'|'md-html'} pairName - Which converter pair to test
 * @param {{ keepTemp?: boolean }} [opts]
 * @returns {{ pair: string, source: string, fidelityScore: number, passed: boolean, diff: object, reportPath: string }}
 */
function validateRoundTrip(sourcePath, pairName, opts = {}) {
  const pair = PAIRS[pairName];
  if (!pair) throw new Error(`Unknown pair: ${pairName}. Available: ${Object.keys(PAIRS).join(', ')}`);
  if (!pair.reverse) throw new Error(`Reverse converter not available for pair: ${pairName}`);
  if (!fs.existsSync(sourcePath)) throw new Error(`Source not found: ${sourcePath}`);

  const sourceDir = path.dirname(sourcePath);
  const baseName = path.basename(sourcePath, path.extname(sourcePath));
  const tempDir = path.join(sourceDir, `.rt-temp-${baseName}`);

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const intermediateFile = path.join(tempDir, baseName + pair.forwardExt);
  const roundTrippedFile = path.join(tempDir, baseName + '-roundtripped' + pair.reverseExt);

  try {
    // Leg 1: forward conversion (e.g., md → docx)
    execFileSync('node', [pair.forward, sourcePath, intermediateFile], {
      stdio: 'pipe',
      timeout: 60000,
    });

    if (!fs.existsSync(intermediateFile)) {
      throw new Error(`Forward conversion produced no output: ${intermediateFile}`);
    }

    // Leg 2: reverse conversion (e.g., docx → md)
    execFileSync('node', [pair.reverse, intermediateFile, roundTrippedFile], {
      stdio: 'pipe',
      timeout: 60000,
    });

    if (!fs.existsSync(roundTrippedFile)) {
      throw new Error(`Reverse conversion produced no output: ${roundTrippedFile}`);
    }

    // Compare
    const original = normalizeMarkdown(fs.readFileSync(sourcePath, 'utf8'));
    const roundTripped = normalizeMarkdown(fs.readFileSync(roundTrippedFile, 'utf8'));
    const diff = semanticDiff(original, roundTripped);

    // Threshold: ≥85% fidelity = pass
    const passed = diff.fidelityScore >= 85 && diff.removedLines <= 5;

    // Write report
    const report = {
      pair: pairName,
      source: path.basename(sourcePath),
      timestamp: new Date().toISOString(),
      fidelityScore: diff.fidelityScore,
      passed,
      diff,
    };

    const reportPath = path.join(sourceDir, `${baseName}.round-trip-report.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

    return { ...report, reportPath };
  } finally {
    if (!opts.keepTemp && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

// ─── CLI ─────────────────────────────────────────────────────────────────────
if (require.main === module) {
  const args = process.argv.slice(2);
  const source = args.find(a => !a.startsWith('--'));
  const pairFlag = args.indexOf('--pair');
  const pair = pairFlag >= 0 ? args[pairFlag + 1] : 'md-docx';
  const keepTemp = args.includes('--keep-temp');

  if (!source) {
    console.error('Usage: node round-trip-validator.cjs SOURCE --pair md-docx [--keep-temp]');
    process.exit(1);
  }

  try {
    const result = validateRoundTrip(source, pair, { keepTemp });
    console.log(`\nRound-trip validation: ${result.pair}`);
    console.log(`  Source: ${result.source}`);
    console.log(`  Fidelity: ${result.fidelityScore}%`);
    console.log(`  Status: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Lines removed: ${result.diff.removedLines}`);
    console.log(`  Lines added: ${result.diff.addedLines}`);
    if (result.diff.changedSections.length > 0) {
      console.log(`  Affected sections: ${result.diff.changedSections.join(', ')}`);
    }
    if (result.diff.samples.removed.length > 0) {
      console.log(`  Sample losses:`);
      result.diff.samples.removed.forEach(s => console.log(`    - ${s}`));
    }
    console.log(`  Report: ${result.reportPath}`);
    process.exit(result.passed ? 0 : 2);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

module.exports = { validateRoundTrip, normalizeMarkdown, semanticDiff, PAIRS };

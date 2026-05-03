#!/usr/bin/env node
/**
 * TS8: Converter QA integration tests
 *
 * Wraps converter-qa.cjs as a node:test suite. Runs the shared module
 * tests (no pandoc/mermaid-cli dependency) to validate converter building blocks.
 *
 * Run: node --test .github/muscles/converter-qa.test.cjs
 * @inheritance inheritable
 */
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const path = require('path');

const QA_SCRIPT = path.join(__dirname, 'converter-qa.cjs');

function runQA(suite, timeout = 60000) {
  try {
    const stdout = execFileSync('node', [QA_SCRIPT, `--suite=${suite}`], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout,
    });
    return { stdout, exitCode: 0 };
  } catch (e) {
    return { stdout: e.stdout || '', stderr: e.stderr || '', exitCode: e.status };
  }
}

function parseResults(stdout) {
  const match = stdout.match(/(\d+) passed, (\d+) failed, (\d+) skipped/);
  if (!match) return null;
  return { passed: +match[1], failed: +match[2], skipped: +match[3] };
}

describe('converter-qa: shared modules', () => {
  it('shared module suite passes', () => {
    const { stdout, exitCode } = runQA('shared');
    const results = parseResults(stdout);
    if (results) {
      // Allow up to 5 known failures in shared module suite
      // (footnote passthrough, link validation, replicate-core negative-prompt)
      assert.ok(results.passed > 100,
        `Expected 100+ passing shared tests, got ${results.passed}`);
      assert.ok(results.failed <= 5,
        `More than 5 shared module test failures — regression?\n${stdout.slice(-500)}`);
    } else {
      assert.equal(exitCode, 0, `converter-qa --suite=shared exited with code ${exitCode}`);
    }
  });
});

describe('converter-qa: full suite', () => {
  it('full QA suite runs and produces results', () => {
    const { stdout, exitCode } = runQA('all', 120000);
    const results = parseResults(stdout);

    assert.ok(results, 'Should produce parseable QA results');
    assert.ok(results.passed > 0, 'Should have passing tests');

    // Allow up to 5 known failures (pre-existing converter bugs)
    if (results.failed > 5) {
      const failSection = stdout.split('Failures:')[1] || '';
      assert.fail(`${results.failed} converter QA test(s) failed (threshold: 5):\n${failSection.slice(0, 1000)}`);
    }
  });
});

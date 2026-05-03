#!/usr/bin/env node
/**
 * Tests for token-cost-report.cjs
 *
 * Validates token estimation, frontmatter parsing, and report generation.
 *
 * Run: node --test .github/muscles/token-cost-report.test.cjs
 * @inheritance inheritable
 */
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { estimateTokens, extractApplyTo, generateReport } = require(path.join(__dirname, 'token-cost-report.cjs'));

// -- estimateTokens -----------------------------------------------------------

describe('estimateTokens', () => {
  it('returns 0 for empty string', () => {
    assert.equal(estimateTokens(''), 0);
  });

  it('estimates ~1 token per 4 chars', () => {
    assert.equal(estimateTokens('abcd'), 1);
    assert.equal(estimateTokens('abcde'), 2); // ceil(5/4) = 2
  });

  it('handles long text', () => {
    const text = 'x'.repeat(400);
    assert.equal(estimateTokens(text), 100);
  });

  it('rounds up fractional tokens', () => {
    assert.equal(estimateTokens('a'), 1); // ceil(1/4) = 1
    assert.equal(estimateTokens('ab'), 1); // ceil(2/4) = 1
    assert.equal(estimateTokens('abc'), 1); // ceil(3/4) = 1
    assert.equal(estimateTokens('abcd'), 1); // ceil(4/4) = 1
    assert.equal(estimateTokens('abcde'), 2); // ceil(5/4) = 2
  });
});

// -- extractApplyTo -----------------------------------------------------------

describe('extractApplyTo', () => {
  it('returns null when no frontmatter', () => {
    assert.equal(extractApplyTo('# Just markdown\n'), null);
  });

  it('returns null when frontmatter has no applyTo', () => {
    const content = '---\ndescription: test\n---\n# Title\n';
    assert.equal(extractApplyTo(content), null);
  });

  it('extracts unquoted applyTo', () => {
    const content = '---\napplyTo: **\n---\n';
    assert.equal(extractApplyTo(content), '**');
  });

  it('extracts double-quoted applyTo', () => {
    const content = '---\napplyTo: "**/*.ts"\n---\n';
    assert.equal(extractApplyTo(content), '**/*.ts');
  });

  it('extracts single-quoted applyTo', () => {
    const content = "---\napplyTo: '**/*.md'\n---\n";
    assert.equal(extractApplyTo(content), '**/*.md');
  });

  it('handles applyTo with glob pattern', () => {
    const content = '---\napplyTo: **/*api*,**/*rest*\n---\n';
    assert.equal(extractApplyTo(content), '**/*api*,**/*rest*');
  });

  it('does not match applyTo outside frontmatter', () => {
    const content = '# Title\n\napplyTo: **\n';
    assert.equal(extractApplyTo(content), null);
  });
});

// -- generateReport -----------------------------------------------------------

describe('generateReport', () => {
  it('returns a non-empty string', () => {
    const report = generateReport();
    assert.ok(typeof report === 'string');
    assert.ok(report.length > 100);
  });

  it('contains expected sections', () => {
    const report = generateReport();
    assert.match(report, /Always-Loaded Instructions/);
    assert.match(report, /Summary/);
  });

  it('contains token totals', () => {
    const report = generateReport();
    // Summary table should have "Total brain"
    assert.match(report, /Total brain/);
  });
});

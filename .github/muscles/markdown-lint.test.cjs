#!/usr/bin/env node
/**
 * Tests for markdown-lint.cjs
 *
 * Validates rule matching, lint() aggregation, and autofix() patching.
 *
 * Run: node --test .github/muscles/markdown-lint.test.cjs
 * @inheritance inheritable
 */
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { lint, autofix, RULES } = require(path.join(__dirname, 'markdown-lint.cjs'));

// -- Rule inventory -----------------------------------------------------------

describe('RULES', () => {
  it('exports a non-empty array', () => {
    assert.ok(Array.isArray(RULES));
    assert.ok(RULES.length > 0);
  });

  it('every rule has required fields', () => {
    for (const rule of RULES) {
      assert.ok(rule.id, `rule missing id`);
      assert.ok(rule.name, `rule ${rule.id} missing name`);
      assert.ok(rule.severity, `rule ${rule.id} missing severity`);
      assert.ok(Array.isArray(rule.targets), `rule ${rule.id} missing targets array`);
      assert.equal(typeof rule.check, 'function', `rule ${rule.id} missing check function`);
    }
  });

  it('rule IDs are unique', () => {
    const ids = RULES.map(r => r.id);
    assert.equal(ids.length, new Set(ids).size, 'Duplicate rule IDs detected');
  });
});

// -- MD001: has-h1 -----------------------------------------------------------

describe('MD001: has-h1', () => {
  it('passes when H1 is present', () => {
    const result = lint('# Title\n\nSome content\n', { target: 'word' });
    const md001 = result.errors.find(e => e.id === 'MD001');
    assert.equal(md001, undefined);
  });

  it('fails when no H1 is present', () => {
    const result = lint('## Subtitle\n\nSome content\n', { target: 'word' });
    const md001 = result.errors.find(e => e.id === 'MD001');
    assert.ok(md001, 'Expected MD001 error');
    assert.match(md001.message, /no H1/i);
  });
});

// -- MD002: heading-hierarchy ------------------------------------------------

describe('MD002: heading-hierarchy', () => {
  it('passes with proper hierarchy', () => {
    const result = lint('# H1\n## H2\n### H3\n', { target: 'word' });
    const md002 = result.warnings.find(w => w.id === 'MD002');
    assert.equal(md002, undefined);
  });

  it('warns when heading levels are skipped', () => {
    const result = lint('# H1\n### H3\n', { target: 'word' });
    const md002 = result.warnings.find(w => w.id === 'MD002');
    assert.ok(md002, 'Expected MD002 warning');
    assert.match(md002.message, /skipped/i);
  });
});

// -- MD003: BOM ---------------------------------------------------------------

describe('MD003: bom-present', () => {
  it('passes when no BOM is present', () => {
    const result = lint('# Title\n', { target: 'word' });
    const md003 = result.warnings.find(w => w.id === 'MD003');
    assert.equal(md003, undefined);
  });

  it('warns when BOM is present', () => {
    const result = lint('\uFEFF# Title\n', { target: 'word' });
    const md003 = result.warnings.find(w => w.id === 'MD003');
    assert.ok(md003, 'Expected MD003 warning');
  });

  it('autofix strips BOM', () => {
    const input = '\uFEFF# Title\n';
    const { content, fixed } = autofix(input, { target: 'word' });
    assert.ok(!content.startsWith('\uFEFF'), 'BOM should be removed');
    assert.ok(fixed.some(f => f.includes('MD003')));
  });
});

// -- lint() aggregation -------------------------------------------------------

describe('lint()', () => {
  it('returns summary for clean document', () => {
    const result = lint('# Clean Document\n\nHello world.\n', { target: 'word' });
    assert.ok(result.summary);
    assert.equal(result.errors.length, 0);
  });

  it('counts errors and warnings in summary', () => {
    // No H1 (error) + BOM (warning) = 1 error, 1 warning minimum
    const result = lint('\uFEFF## No H1\n', { target: 'word' });
    assert.ok(result.errors.length >= 1, 'Expected at least 1 error');
    assert.ok(result.warnings.length >= 1, 'Expected at least 1 warning');
    assert.match(result.summary, /error/);
  });

  it('filters rules by target', () => {
    // MD001 targets word/email/pdf/slides but not a made-up target
    const withTarget = lint('## No H1\n', { target: 'word' });
    const noTarget = lint('## No H1\n', { target: 'nonexistent' });
    assert.ok(withTarget.errors.length > noTarget.errors.length);
  });

  it('defaults target to word', () => {
    const result = lint('# Title\n');
    assert.ok(result.summary);
  });
});

// -- autofix() ----------------------------------------------------------------

describe('autofix()', () => {
  it('returns unchanged content when nothing to fix', () => {
    const input = '# Clean\n\nHello.\n';
    const { content, fixed } = autofix(input, { target: 'word' });
    assert.equal(content, input);
    assert.equal(fixed.length, 0);
  });

  it('returns list of applied fixes', () => {
    const input = '\uFEFF# Title\n';
    const { fixed } = autofix(input, { target: 'word' });
    assert.ok(Array.isArray(fixed));
    // BOM fix should appear if MD003 has a fix function
    if (fixed.length > 0) {
      assert.ok(fixed[0].includes('MD003'));
    }
  });
});

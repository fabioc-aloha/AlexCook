#!/usr/bin/env node
/**
 * Tests for brain-qa.cjs
 * 
 * Run: node --test .github/muscles/brain-qa.test.cjs
 */
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const {
  detectTokenWaste,
  isWorkflowSkill,
  hasMatchingInstruction,
  hasMatchingMuscle,
  getPassThreshold,
  scanSkills,
  scanAgents,
  scanInstructions,
  scanPrompts,
  scanMuscles,
  scanHooks,
  generateGrid,
  TIER_THRESHOLDS,
  MIN_SKILL_LINES,
  MAX_SKILL_LINES,
  MIN_AGENT_LINES,
  MAX_AGENT_LINES,
  STALE_PRONE,
} = require('./brain-qa.cjs');

// -- detectTokenWaste tests -------------------------------------------------

describe('detectTokenWaste', () => {
  it('returns zero waste for clean content', () => {
    const result = detectTokenWaste('# Title\n\nSome clean content without diagrams.');
    assert.strictEqual(result.mermaidBlocks, 0);
    assert.strictEqual(result.mermaidLines, 0);
    assert.strictEqual(result.styleLines, 0);
    assert.strictEqual(result.wasteScore, 0);
  });

  it('detects mermaid blocks', () => {
    const content = '# Title\n\n```mermaid\nflowchart LR\n  A --> B\n```\n\nMore text.';
    const result = detectTokenWaste(content);
    assert.strictEqual(result.mermaidBlocks, 1);
    assert.ok(result.mermaidLines > 0);
    assert.strictEqual(result.wasteScore, 5); // 1 block × 5
  });

  it('detects multiple mermaid blocks', () => {
    const content = '```mermaid\ngraph TD\nA-->B\n```\n\nText\n\n```mermaid\nsequenceDiagram\nA->>B: msg\n```';
    const result = detectTokenWaste(content);
    assert.strictEqual(result.mermaidBlocks, 2);
    assert.strictEqual(result.wasteScore, 10); // 2 blocks × 5
  });

  it('detects style lines inside mermaid blocks', () => {
    const content = '```mermaid\nflowchart LR\n  A --> B\n  style A fill:#f00\n  linkStyle 0 stroke:#333\n```';
    const result = detectTokenWaste(content);
    assert.strictEqual(result.styleLines, 2);
    assert.strictEqual(result.wasteScore, 7); // 1 block × 5 + 2 style lines
  });

  it('handles empty content', () => {
    const result = detectTokenWaste('');
    assert.strictEqual(result.mermaidBlocks, 0);
    assert.strictEqual(result.wasteScore, 0);
  });
});

// -- isWorkflowSkill tests --------------------------------------------------

describe('isWorkflowSkill', () => {
  it('detects numbered phase headers', () => {
    assert.strictEqual(isWorkflowSkill('## Phase 1: Setup\nDo stuff'), true);
  });

  it('detects step headers', () => {
    assert.strictEqual(isWorkflowSkill('## Step 2\nDo stuff'), true);
  });

  it('detects ## Workflow section', () => {
    assert.strictEqual(isWorkflowSkill('# Title\n\n## Workflow\n\n1. Do this'), true);
  });

  it('detects ## Procedure section', () => {
    assert.strictEqual(isWorkflowSkill('# Title\n\n## Procedure\n\nStep-by-step'), true);
  });

  it('detects ## Process section', () => {
    assert.strictEqual(isWorkflowSkill('# Title\n\n## Process\n\nDo things'), true);
  });

  it('detects bold numbered steps', () => {
    assert.strictEqual(isWorkflowSkill('# Title\n\n1. **Create file**\n2. **Run tests**'), true);
  });

  it('returns false for non-workflow content', () => {
    assert.strictEqual(isWorkflowSkill('# API Design\n\n## Principles\n\nUse REST.'), false);
  });

  it('returns false for empty content', () => {
    assert.strictEqual(isWorkflowSkill(''), false);
  });
});

// -- getPassThreshold tests -------------------------------------------------

describe('getPassThreshold', () => {
  it('core tier requires 5 (max score)', () => {
    assert.strictEqual(getPassThreshold('core'), 5);
  });

  it('standard tier requires 4', () => {
    assert.strictEqual(getPassThreshold('standard'), 4);
  });

  it('extended tier requires 3', () => {
    assert.strictEqual(getPassThreshold('extended'), 3);
  });

  it('specialist tier requires 2', () => {
    assert.strictEqual(getPassThreshold('specialist'), 2);
  });

  it('unknown tier defaults to standard (4)', () => {
    assert.strictEqual(getPassThreshold('unknown'), 4);
  });
});

// -- Constants tests --------------------------------------------------------

describe('constants', () => {
  it('skill line bounds are reasonable', () => {
    assert.ok(MIN_SKILL_LINES > 0 && MIN_SKILL_LINES < 200);
    assert.ok(MAX_SKILL_LINES > 200 && MAX_SKILL_LINES <= 1000);
    assert.ok(MIN_SKILL_LINES < MAX_SKILL_LINES);
  });

  it('agent line bounds are reasonable', () => {
    assert.ok(MIN_AGENT_LINES > 0 && MIN_AGENT_LINES < 100);
    assert.ok(MAX_AGENT_LINES > 100 && MAX_AGENT_LINES <= 1000);
    assert.ok(MIN_AGENT_LINES < MAX_AGENT_LINES);
  });

  it('STALE_PRONE is a Set with known entries', () => {
    assert.ok(STALE_PRONE instanceof Set);
    assert.ok(STALE_PRONE.size > 0);
    assert.ok(STALE_PRONE.has('vscode-extension-patterns'));
    assert.ok(STALE_PRONE.has('llm-model-selection'));
  });

  it('TIER_THRESHOLDS has all expected tiers', () => {
    assert.ok('core' in TIER_THRESHOLDS);
    assert.ok('standard' in TIER_THRESHOLDS);
    assert.ok('extended' in TIER_THRESHOLDS);
    assert.ok('specialist' in TIER_THRESHOLDS);
  });
});

// -- hasMatchingInstruction tests -------------------------------------------

describe('hasMatchingInstruction', () => {
  it('returns true for skill with matching instruction', () => {
    // code-review has code-review.instructions.md
    assert.strictEqual(hasMatchingInstruction('code-review'), true);
  });

  it('returns false for skill without matching instruction', () => {
    assert.strictEqual(hasMatchingInstruction('nonexistent-skill-xyz'), false);
  });
});

// -- hasMatchingMuscle tests ------------------------------------------------

describe('hasMatchingMuscle', () => {
  it('returns true for skill with matching .cjs muscle', () => {
    // brain-qa has brain-qa.cjs
    assert.strictEqual(hasMatchingMuscle('brain-qa'), true);
  });

  it('returns false for skill without muscle', () => {
    assert.strictEqual(hasMatchingMuscle('nonexistent-muscle-xyz'), false);
  });
});

// -- Scanner integration tests (run against real architecture) ---------------

describe('scanners (integration)', () => {
  it('scanSkills returns array with results', () => {
    const skills = scanSkills();
    assert.ok(Array.isArray(skills));
    assert.ok(skills.length > 100, `Expected >100 skills, got ${skills.length}`);
  });

  it('skill results have required properties', () => {
    const skills = scanSkills();
    const skill = skills[0];
    assert.ok('name' in skill);
    assert.ok('lines' in skill);
    assert.ok('flags' in skill);
    assert.ok('score' in skill);
    assert.ok('tier' in skill);
    assert.ok('pass' in skill);
    assert.ok('waste' in skill);
  });

  it('skill flags have expected dimensions', () => {
    const skills = scanSkills();
    const flags = skills[0].flags;
    assert.ok('fm' in flags);
    assert.ok('code' in flags);
    assert.ok('bounds' in flags);
    assert.ok('tri' in flags);
    assert.ok('muscle' in flags);
    assert.ok('inh' in flags);
  });

  it('scanAgents returns array with results', () => {
    const agents = scanAgents();
    assert.ok(Array.isArray(agents));
    assert.ok(agents.length > 10, `Expected >10 agents, got ${agents.length}`);
  });

  it('agent results have required properties', () => {
    const agents = scanAgents();
    const agent = agents[0];
    assert.ok('name' in agent);
    assert.ok('lines' in agent);
    assert.ok('flags' in agent);
    assert.ok('score' in agent);
    assert.ok('pass' in agent);
  });

  it('scanInstructions returns array with results', () => {
    const instructions = scanInstructions();
    assert.ok(Array.isArray(instructions));
    assert.ok(instructions.length > 100, `Expected >100 instructions, got ${instructions.length}`);
  });

  it('scanPrompts returns array with results', () => {
    const prompts = scanPrompts();
    assert.ok(Array.isArray(prompts));
    assert.ok(prompts.length > 20, `Expected >20 prompts, got ${prompts.length}`);
  });

  it('scanMuscles returns array with results', () => {
    const muscles = scanMuscles();
    assert.ok(Array.isArray(muscles));
    assert.ok(muscles.length > 10, `Expected >10 muscles, got ${muscles.length}`);
  });

  it('muscle results have required properties', () => {
    const muscles = scanMuscles();
    const muscle = muscles[0];
    assert.ok('name' in muscle);
    assert.ok('lines' in muscle);
    assert.ok('lang' in muscle);
    assert.ok('category' in muscle);
    assert.ok('flags' in muscle);
    assert.ok('score' in muscle);
    assert.ok('pass' in muscle);
  });

  it('scanHooks returns array with results', () => {
    const hooks = scanHooks();
    assert.ok(Array.isArray(hooks));
    assert.ok(hooks.length > 15, `Expected >15 hooks, got ${hooks.length}`);
  });

  it('hook results have required properties', () => {
    const hooks = scanHooks();
    const hook = hooks[0];
    assert.ok('name' in hook);
    assert.ok('lines' in hook);
    assert.ok('event' in hook);
    assert.ok('flags' in hook);
    assert.ok('score' in hook);
    assert.ok('maxScore' in hook);
    assert.ok('pass' in hook);
  });

  it('hook flags have expected dimensions', () => {
    const hooks = scanHooks();
    const flags = hooks[0].flags;
    assert.ok('header' in flags);
    assert.ok('stdin' in flags);
    assert.ok('stdout' in flags);
    assert.ok('err' in flags);
    assert.ok('bounds' in flags);
  });
});

// -- generateGrid integration test -------------------------------------------

describe('generateGrid', () => {
  it('produces valid markdown output', () => {
    const grid = generateGrid();
    assert.ok(typeof grid === 'string');
    assert.ok(grid.length > 1000, 'Grid should be substantial');
    assert.ok(grid.includes('# Brain Health Grid'));
    assert.ok(grid.includes('## Skills'));
    assert.ok(grid.includes('## Agents'));
    assert.ok(grid.includes('## Instructions'));
    assert.ok(grid.includes('## Prompts'));
    assert.ok(grid.includes('## Muscles'));
    assert.ok(grid.includes('## Hooks'));
    assert.ok(grid.includes('## Overall'));
  });

  it('grid contains pass/fail counts', () => {
    const grid = generateGrid();
    assert.ok(grid.includes('Passing'), 'Should report passing count');
    assert.ok(grid.includes('Failing'), 'Should report failing count');
  });

  it('all skills should currently pass (0 failing)', () => {
    const skills = scanSkills();
    const failing = skills.filter(s => !s.pass);
    assert.strictEqual(failing.length, 0, 
      `Expected 0 failing skills, got ${failing.length}: ${failing.map(s => s.name).join(', ')}`);
  });
});

// -- CLI execution test -----------------------------------------------------

describe('CLI execution', () => {
  it('--stdout flag outputs grid to stdout', () => {
    const { execFileSync } = require('child_process');
    const result = execFileSync('node', [
      path.resolve(__dirname, 'brain-qa.cjs'),
      '--stdout'
    ], {
      cwd: path.resolve(__dirname, '..', '..'),
      encoding: 'utf8',
      timeout: 30000
    });

    assert.ok(result.includes('# Brain Health Grid'));
    assert.ok(result.includes('## Skills'));
  });
});

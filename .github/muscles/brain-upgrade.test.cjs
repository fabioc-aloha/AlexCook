#!/usr/bin/env node
/**
 * Tests for the brain-upgrade trifecta muscle and shared core.
 *
 * Covers:
 *   - Trifecta protection: isProtectedTrifectaPath and PROTECTED_TRIFECTA_PATHS list
 *   - Shared core upgradeProject: eligibility, backup, heir preservation, settings merge
 *   - Muscle Audit mode via subprocess on a fake project
 *   - Muscle AutoRestore refuses to restore protected trifecta paths
 *
 * Run: node --test .github/muscles/brain-upgrade.test.cjs
 * @inheritance inheritable
 */
'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const MUSCLE = path.join(__dirname, 'brain-upgrade.cjs');
const CORE = require(path.join(__dirname, 'shared', 'brain-upgrade-core.cjs'));

function mkTmp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function createFakeAlexBrain(rootDir, { locked = false } = {}) {
  const gh = path.join(rootDir, '.github');
  fs.mkdirSync(path.join(gh, 'skills', 'brain-upgrade'), { recursive: true });
  fs.mkdirSync(path.join(gh, 'instructions'), { recursive: true });
  fs.mkdirSync(path.join(gh, 'muscles', 'shared'), { recursive: true });
  fs.mkdirSync(path.join(gh, 'config'), { recursive: true });
  fs.writeFileSync(path.join(gh, 'copilot-instructions.md'), '# Alex v8.3.0\n\n## Identity\n');
  fs.writeFileSync(path.join(gh, 'NORTH-STAR.md'), '# Heir North Star\n');
  fs.writeFileSync(path.join(gh, 'brain-version.json'), JSON.stringify({
    version: '8.3.0',
    architecture: 'Alex Cognitive Architecture',
    identity: 'Heir Project',
    upgradeLock: locked,
    lockReason: locked ? 'locked for test' : null,
  }, null, 2));
  fs.writeFileSync(path.join(gh, 'skills', 'brain-upgrade', 'SKILL.md'), '# old skill (should be protected on restore)\n');
  fs.writeFileSync(path.join(gh, 'instructions', 'brain-upgrade.instructions.md'), '# old instruction\n');
  fs.writeFileSync(path.join(gh, 'muscles', 'brain-upgrade.cjs'), '// old muscle\n');
  fs.writeFileSync(path.join(gh, 'muscles', 'shared', 'brain-upgrade-core.cjs'), '// old core\n');
}

function createFreshBrainSource() {
  const tmp = mkTmp('bu-brain-src-');
  const dirs = ['instructions', 'skills', 'prompts', 'agents', 'muscles', 'config', 'hooks'];
  for (const d of dirs) {
    fs.mkdirSync(path.join(tmp, d), { recursive: true });
    fs.writeFileSync(path.join(tmp, d, '.keep'), '');
  }
  fs.writeFileSync(path.join(tmp, 'copilot-instructions.md'), '# Fresh Alex\n');
  fs.writeFileSync(path.join(tmp, 'NORTH-STAR.md'), '# Fresh North Star\n');
  fs.writeFileSync(path.join(tmp, 'brain-version.json'), JSON.stringify({
    version: '9.9.9',
    architecture: 'Alex Cognitive Architecture',
    identity: 'Alex',
    upgradeLock: false,
    lockReason: null,
  }, null, 2));
  // Fresh trifecta content
  fs.mkdirSync(path.join(tmp, 'skills', 'brain-upgrade'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'skills', 'brain-upgrade', 'SKILL.md'), '# fresh skill\n');
  fs.writeFileSync(path.join(tmp, 'instructions', 'brain-upgrade.instructions.md'), '# fresh instruction\n');
  fs.writeFileSync(path.join(tmp, 'muscles', 'brain-upgrade.cjs'), '// fresh muscle\n');
  fs.mkdirSync(path.join(tmp, 'muscles', 'shared'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'muscles', 'shared', 'brain-upgrade-core.cjs'), '// fresh core\n');
  return tmp;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('brain-upgrade-core: trifecta protection', () => {
  it('exports PROTECTED_TRIFECTA_PATHS list covering skill, instruction, muscle, core', () => {
    assert.ok(Array.isArray(CORE.PROTECTED_TRIFECTA_PATHS));
    const joined = CORE.PROTECTED_TRIFECTA_PATHS.join('|');
    assert.match(joined, /skills\/brain-upgrade\/SKILL\.md/);
    assert.match(joined, /instructions\/brain-upgrade\.instructions\.md/);
    assert.match(joined, /muscles\/brain-upgrade\.cjs/);
    assert.match(joined, /muscles\/shared\/brain-upgrade-core\.cjs/);
  });

  it('isProtectedTrifectaPath matches exact protected paths (forward and back slashes)', () => {
    for (const p of CORE.PROTECTED_TRIFECTA_PATHS) {
      assert.equal(CORE.isProtectedTrifectaPath(p), true, `forward: ${p}`);
      assert.equal(CORE.isProtectedTrifectaPath(p.replace(/\//g, '\\')), true, `back: ${p}`);
    }
  });

  it('isProtectedTrifectaPath rejects unrelated paths', () => {
    assert.equal(CORE.isProtectedTrifectaPath('skills/heir-bootstrap/SKILL.md'), false);
    assert.equal(CORE.isProtectedTrifectaPath('instructions/alex-core.instructions.md'), false);
    assert.equal(CORE.isProtectedTrifectaPath('muscles/brain-qa.cjs'), false);
    assert.equal(CORE.isProtectedTrifectaPath(''), false);
  });
});

describe('brain-upgrade-core: upgradeProject (Phase 1 contract)', () => {
  let project;
  let brainSource;

  beforeEach(() => {
    project = mkTmp('bu-proj-');
    createFakeAlexBrain(project);
    brainSource = createFreshBrainSource();
  });

  afterEach(() => {
    cleanup(project);
    cleanup(brainSource);
  });

  it('installs fresh NORTH-STAR and saves old as backup for Phase 2 LLM curation', () => {
    const result = CORE.upgradeProject({
      projectPath: project,
      brainSource,
      brainVersion: '9.9.9',
      backupSuffix: CORE.buildBackupSuffix(),
      dryRun: false,
      logger: CORE.silentLogger,
    });
    assert.equal(result.ok, true);
    // Active NORTH-STAR is the fresh template (not mechanically preserved)
    const active = fs.readFileSync(path.join(project, '.github', 'NORTH-STAR.md'), 'utf8');
    assert.match(active, /Fresh North Star/);
    // Old heir copy preserved as backup for Phase 2 LLM reconciliation
    const backup = fs.readFileSync(path.join(project, '.github', 'NORTH-STAR.backup.md'), 'utf8');
    assert.match(backup, /Heir North Star/);
  });

  it('installs fresh trifecta (not the old one)', () => {
    const result = CORE.upgradeProject({
      projectPath: project,
      brainSource,
      brainVersion: '9.9.9',
      backupSuffix: CORE.buildBackupSuffix(),
      dryRun: false,
      logger: CORE.silentLogger,
    });
    assert.equal(result.ok, true);
    const skill = fs.readFileSync(path.join(project, '.github', 'skills', 'brain-upgrade', 'SKILL.md'), 'utf8');
    const muscle = fs.readFileSync(path.join(project, '.github', 'muscles', 'brain-upgrade.cjs'), 'utf8');
    const core = fs.readFileSync(path.join(project, '.github', 'muscles', 'shared', 'brain-upgrade-core.cjs'), 'utf8');
    assert.match(skill, /fresh skill/);
    assert.match(muscle, /fresh muscle/);
    assert.match(core, /fresh core/);
  });

  it('creates a backup directory (non-destructive)', () => {
    const result = CORE.upgradeProject({
      projectPath: project,
      brainSource,
      brainVersion: '9.9.9',
      backupSuffix: CORE.buildBackupSuffix(),
      dryRun: false,
      logger: CORE.silentLogger,
    });
    assert.equal(result.ok, true);
    assert.ok(result.backupDir && fs.existsSync(result.backupDir));
    // Old trifecta must survive in backup
    assert.ok(fs.existsSync(path.join(result.backupDir, 'skills', 'brain-upgrade', 'SKILL.md')));
  });

  it('stamps brain-version.json and removes legacy .alex-brain-version', () => {
    // Seed a legacy stamp file in the pre-upgrade brain
    fs.writeFileSync(path.join(project, '.github', '.alex-brain-version'), '8.3.0');

    const result = CORE.upgradeProject({
      projectPath: project,
      brainSource,
      brainVersion: '9.9.9',
      backupSuffix: CORE.buildBackupSuffix(),
      dryRun: false,
      logger: CORE.silentLogger,
    });
    assert.equal(result.ok, true);

    const bv = JSON.parse(fs.readFileSync(path.join(project, '.github', 'brain-version.json'), 'utf8'));
    assert.equal(bv.version, '9.9.9');
    assert.equal(bv.architecture, 'Alex Cognitive Architecture');
    assert.ok(typeof bv.lastSync === 'string' && bv.lastSync.length > 0);
    // Heir identity preserved from backup
    assert.equal(bv.identity, 'Heir Project');

    // Legacy stamp file must NOT be present in the freshly installed brain
    assert.equal(
      fs.existsSync(path.join(project, '.github', '.alex-brain-version')),
      false,
      'legacy .alex-brain-version should be removed on upgrade',
    );

    // But the legacy stamp SHOULD still exist in the backup (non-destructive)
    assert.equal(
      fs.existsSync(path.join(result.backupDir, '.alex-brain-version')),
      true,
      'legacy stamp should be preserved in backup',
    );
  });

  it('skips upgrade when installed version >= target (no force)', () => {
    // Fixture creates a project at 8.3.0; upgrade to 8.3.0 should no-op.
    const result = CORE.upgradeProject({
      projectPath: project,
      brainSource,
      brainVersion: '8.3.0',
      backupSuffix: CORE.buildBackupSuffix(),
      dryRun: false,
      logger: CORE.silentLogger,
    });
    assert.equal(result.ok, true);
    assert.equal(result.skipped, true);
    assert.equal(result.reason, 'up-to-date');
    assert.equal(result.installedVersion, '8.3.0');
    // No backup should have been created
    const backups = fs.readdirSync(project).filter(n => n.startsWith('.github-backup-'));
    assert.equal(backups.length, 0, 'skip path must not create a backup');
    // Original content untouched
    const skill = fs.readFileSync(path.join(project, '.github', 'skills', 'brain-upgrade', 'SKILL.md'), 'utf8');
    assert.match(skill, /old skill/);
  });

  it('force=true bypasses the skip-if-up-to-date gate', () => {
    const result = CORE.upgradeProject({
      projectPath: project,
      brainSource,
      brainVersion: '8.3.0',
      backupSuffix: CORE.buildBackupSuffix(),
      dryRun: false,
      force: true,
      logger: CORE.silentLogger,
    });
    assert.equal(result.ok, true);
    assert.notEqual(result.skipped, true);
    // Fresh content installed (skill replaced)
    const skill = fs.readFileSync(path.join(project, '.github', 'skills', 'brain-upgrade', 'SKILL.md'), 'utf8');
    assert.match(skill, /fresh skill/);
  });

  it('compareSemver returns correct ordering', () => {
    assert.equal(CORE.compareSemver('8.3.0', '8.3.0'), 0);
    assert.equal(CORE.compareSemver('8.3.0', '8.2.9'), 1);
    assert.equal(CORE.compareSemver('8.2.9', '8.3.0'), -1);
    assert.equal(CORE.compareSemver('9.0.0', '8.99.99'), 1);
    assert.equal(CORE.compareSemver('v8.3.0', '8.3.0'), 0);
    assert.equal(CORE.compareSemver('bogus', '8.3.0'), null);
  });
});

describe('brain-upgrade muscle (CLI)', () => {
  let project;

  beforeEach(() => {
    project = mkTmp('bu-cli-');
    createFakeAlexBrain(project);
  });

  afterEach(() => {
    cleanup(project);
  });

  it('Audit mode detects v8 Alex brain and unlocked state', () => {
    const stdout = execFileSync('node', [MUSCLE, '--mode', 'Audit', '--project-dir', project], {
      encoding: 'utf8',
      timeout: 15000,
    });
    assert.match(stdout, /v8/);
    assert.match(stdout, /eligible for upgrade/i);
  });

  it('Audit mode flags locked brains', () => {
    cleanup(project);
    project = mkTmp('bu-cli-locked-');
    createFakeAlexBrain(project, { locked: true });
    const stdout = execFileSync('node', [MUSCLE, '--mode', 'Audit', '--project-dir', project], {
      encoding: 'utf8',
      timeout: 15000,
    });
    assert.match(stdout, /lock/i);
  });
});

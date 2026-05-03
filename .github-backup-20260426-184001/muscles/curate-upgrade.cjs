#!/usr/bin/env node
/**
 * @muscle curate-upgrade
 * @inheritance inheritable
 * @reviewed 2026-04-19
 *
 * Curate project-specific content from .github-backup-* after brain upgrade.
 *
 * After upgrade-brain.ps1 renames .github/ to .github-backup-YYYYMMDD/ and installs
 * a fresh v8 brain, some project-specific content may not have been auto-restored.
 * This script scans backups, reports findings, auto-restores safe content, and
 * supports interactive curation for copilot-instructions.md merging.
 *
 * Usage:
 *   node .github/muscles/curate-upgrade.cjs --mode Scan
 *   node .github/muscles/curate-upgrade.cjs --mode AutoRestore --dry-run
 *   node .github/muscles/curate-upgrade.cjs --mode Curate --include "CorreaX"
 *   node .github/muscles/curate-upgrade.cjs --mode Clean --include "ChessCoach,AlexBooks"
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ── CLI Parsing ─────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    mode: null,
    targetDir: process.platform === 'win32' ? 'C:\\Development' : path.join(require('os').homedir(), 'Development'),
    include: [],
    exclude: ['AlexMaster', 'pbi', 'pbi-test', 'GCX_Master', 'GCX_Copilot', 'cXpert', 'Lahai'],
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i].toLowerCase();
    if (arg === '--mode' && args[i + 1]) {
      opts.mode = args[++i];
    } else if (arg === '--target-dir' && args[i + 1]) {
      opts.targetDir = args[++i];
    } else if (arg === '--include' && args[i + 1]) {
      opts.include = args[++i].split(',').map(s => s.trim()).filter(Boolean);
    } else if (arg === '--exclude' && args[i + 1]) {
      opts.exclude = args[++i].split(',').map(s => s.trim()).filter(Boolean);
    } else if (arg === '--dry-run') {
      opts.dryRun = true;
    }
  }

  const validModes = ['scan', 'autorestore', 'curate', 'clean'];
  if (!opts.mode || !validModes.includes(opts.mode.toLowerCase())) {
    console.error(`Usage: node curate-upgrade.cjs --mode <${validModes.join('|')}> [--target-dir <path>] [--include "a,b"] [--exclude "x,y"] [--dry-run]`);
    process.exit(1);
  }
  opts.mode = opts.mode.toLowerCase();
  return opts;
}

// ── Constants ───────────────────────────────────────────────────────────────

// Brain-managed directories — content installed by upgrade-brain.ps1
const BRAIN_SUBDIRS = ['instructions', 'skills', 'prompts', 'agents', 'muscles', 'config', 'hooks', 'assets'];
const BRAIN_ROOT_FILES = ['copilot-instructions.md', '.alex-brain-version'];

// Already auto-restored by upgrade-brain.ps1
const AUTO_RESTORED_DIRS = ['workflows', 'ISSUE_TEMPLATE', 'episodic', 'memory', 'domain-knowledge'];
const AUTO_RESTORED_FILES = ['PULL_REQUEST_TEMPLATE.md', 'dependabot.yml', 'CODEOWNERS', 'FUNDING.yml', 'MEMORY.md'];

// Files to skip (replaced by v8 structure or obsolete)
const SKIP_FILES = ['hooks.json'];

// ── Helpers (console) ───────────────────────────────────────────────────────

const C = {
  cyan:    s => `\x1b[36m${s}\x1b[0m`,
  gray:    s => `\x1b[90m${s}\x1b[0m`,
  yellow:  s => `\x1b[33m${s}\x1b[0m`,
  green:   s => `\x1b[32m${s}\x1b[0m`,
  red:     s => `\x1b[31m${s}\x1b[0m`,
  darkYel: s => `\x1b[33m${s}\x1b[0m`,
  darkGray:s => `\x1b[90m${s}\x1b[0m`,
  white:   s => `\x1b[97m${s}\x1b[0m`,
};

function writePhase(text)           { console.log(`\n${C.cyan(`═══ ${text} ═══`)}`); }
function writeProject(name, text)   { console.log(`  ${C.gray(`[${name}] ${text}`)}`); }
function writeAction(text)          { console.log(`    ${C.yellow(`→ ${text}`)}`); }
function writeOK(text)              { console.log(`    ${C.green(`✓ ${text}`)}`); }
function writeWarn(text)            { console.log(`    ${C.darkYel(`⚠ ${text}`)}`); }

// ── Helpers (filesystem) ────────────────────────────────────────────────────

function dirEntries(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true });
}

function countFilesRecursive(dir) {
  let count = 0;
  for (const entry of dirEntries(dir)) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countFilesRecursive(full);
    else count++;
  }
  return count;
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of dirEntries(src)) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function askQuestion(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(prompt, answer => { rl.close(); resolve(answer); });
  });
}

// ── Project Discovery ───────────────────────────────────────────────────────

function getBackupProjects(opts) {
  if (!fs.existsSync(opts.targetDir)) return [];
  return dirEntries(opts.targetDir)
    .filter(d => d.isDirectory())
    .map(d => ({ name: d.name, fullPath: path.join(opts.targetDir, d.name) }))
    .filter(p => {
      const backups = dirEntries(p.fullPath).filter(e => e.isDirectory() && e.name.startsWith('.github-backup-'));
      return backups.length > 0;
    })
    .filter(p => !opts.exclude.includes(p.name))
    .filter(p => opts.include.length === 0 || opts.include.includes(p.name));
}

function getLatestBackup(projectPath) {
  const backups = dirEntries(projectPath)
    .filter(d => d.isDirectory() && d.name.startsWith('.github-backup-'))
    .map(d => d.name)
    .sort()
    .reverse();
  return backups.length > 0 ? path.join(projectPath, backups[0]) : null;
}

function getLatestBackupName(projectPath) {
  const backups = dirEntries(projectPath)
    .filter(d => d.isDirectory() && d.name.startsWith('.github-backup-'))
    .map(d => d.name)
    .sort()
    .reverse();
  return backups[0] || null;
}

// ── Content Analysis ────────────────────────────────────────────────────────

function getUnrestoredContent(backupPath) {
  const findings = {
    rootFiles: [],
    unknownDirs: [],
    customCI: false,
    oldArtifacts: [],
  };

  // Check root-level files
  for (const entry of dirEntries(backupPath)) {
    if (entry.isDirectory()) {
      if (BRAIN_SUBDIRS.includes(entry.name)) continue;
      if (AUTO_RESTORED_DIRS.includes(entry.name)) continue;
      const fileCount = countFilesRecursive(path.join(backupPath, entry.name));
      findings.unknownDirs.push({ name: entry.name, fileCount });
    } else {
      if (BRAIN_ROOT_FILES.includes(entry.name)) continue;
      if (AUTO_RESTORED_FILES.includes(entry.name)) continue;
      if (entry.name === 'copilot-instructions.backup.md') continue;
      if (SKIP_FILES.includes(entry.name)) {
        findings.oldArtifacts.push(entry.name);
        continue;
      }
      findings.rootFiles.push(entry.name);
    }
  }

  // Check if old CI had project-specific content
  const oldCI = path.join(backupPath, 'copilot-instructions.md');
  if (fs.existsSync(oldCI)) {
    const content = fs.readFileSync(oldCI, 'utf8');
    if (/(?:## (?:Project|Active) Context|## Coding Standards|## Tech Stack|## Architecture)/i.test(content)) {
      findings.customCI = true;
    }
  }

  return findings;
}

// ── Mode: Scan ──────────────────────────────────────────────────────────────

function invokeScan(opts) {
  writePhase('SCAN — Finding pending curation work');

  const projects = getBackupProjects(opts);
  if (projects.length === 0) {
    console.log('  No projects with .github-backup-* found.');
    return;
  }

  console.log(`  Found ${projects.length} projects with backup directories\n`);

  let needsCuration = 0;
  let totalFindings = 0;

  for (const p of projects) {
    const backupPath = getLatestBackup(p.fullPath);
    if (!backupPath) continue;
    const backupName = getLatestBackupName(p.fullPath);

    const findings = getUnrestoredContent(backupPath);
    const hasWork = findings.rootFiles.length > 0 || findings.unknownDirs.length > 0 || findings.customCI;

    if (hasWork) {
      writeProject(p.name, `backup: ${backupName}`);
      needsCuration++;

      for (const f of findings.rootFiles) {
        writeAction(`ROOT_FILE: ${f}`);
        totalFindings++;
      }
      for (const d of findings.unknownDirs) {
        writeAction(`UNKNOWN_DIR: ${d.name}/ (${d.fileCount} files)`);
        totalFindings++;
      }
      if (findings.customCI) {
        writeWarn('CI_CUSTOM: copilot-instructions.md has project-specific sections');
        totalFindings++;
      }
      for (const a of findings.oldArtifacts) {
        console.log(`    ${C.darkGray(`· SKIP: ${a} (obsolete)`)}`);
      }
      console.log('');
    } else {
      writeOK(`${p.name}: clean — backup can be removed`);
    }
  }

  writePhase('SCAN SUMMARY');
  console.log(`  Projects with backups: ${projects.length}`);
  console.log(`  Needing curation: ${needsCuration}`);
  console.log(`  Total findings: ${totalFindings}`);

  if (needsCuration > 0) {
    console.log(`\n${C.white('  Next steps:')}`);
    console.log('    1. node .github/muscles/curate-upgrade.cjs --mode AutoRestore      (safe auto-copy)');
    console.log('    2. node .github/muscles/curate-upgrade.cjs --mode Curate --include X (CI merging)');
    console.log('    3. upgrade-brain.ps1 -Mode Verify             (confirm brain intact)');
    console.log('    4. node .github/muscles/curate-upgrade.cjs --mode Clean             (remove backups)');
  }
}

// ── Mode: AutoRestore ───────────────────────────────────────────────────────

function invokeAutoRestore(opts) {
  writePhase('AUTO-RESTORE — Copying non-brain content from backups');

  const projects = getBackupProjects(opts);
  let restored = 0;
  let skipped = 0;

  for (const p of projects) {
    const backupPath = getLatestBackup(p.fullPath);
    if (!backupPath) continue;

    const ghDir = path.join(p.fullPath, '.github');
    if (!fs.existsSync(ghDir)) {
      writeWarn(`${p.name}: no .github/ directory — skipping`);
      skipped++;
      continue;
    }

    const findings = getUnrestoredContent(backupPath);
    const hasWork = findings.rootFiles.length > 0 || findings.unknownDirs.length > 0;
    if (!hasWork) continue;

    writeProject(p.name, 'auto-restoring');

    // Copy root files
    for (const f of findings.rootFiles) {
      const source = path.join(backupPath, f);
      const target = path.join(ghDir, f);
      if (fs.existsSync(target)) {
        writeWarn(`already exists: ${f} — skipping`);
        continue;
      }
      if (!opts.dryRun) {
        fs.copyFileSync(source, target);
      }
      writeAction(`restore ${f}`);
      restored++;
    }

    // Copy unknown directories
    for (const d of findings.unknownDirs) {
      const source = path.join(backupPath, d.name);
      const target = path.join(ghDir, d.name);
      if (fs.existsSync(target)) {
        writeWarn(`already exists: ${d.name}/ — skipping`);
        continue;
      }
      if (!opts.dryRun) {
        copyDirRecursive(source, target);
      }
      writeAction(`restore ${d.name}/ (${d.fileCount} files)`);
      restored++;
    }
  }

  console.log(`\n  Restored: ${restored} items | Skipped: ${skipped} projects`);
}

// ── Mode: Curate ────────────────────────────────────────────────────────────

async function invokeCurate(opts) {
  writePhase('CURATE — Interactive per-project curation');

  const projects = getBackupProjects(opts);
  if (projects.length === 0) {
    console.log('  No projects with backups found.');
    return;
  }

  for (const p of projects) {
    const backupPath = getLatestBackup(p.fullPath);
    if (!backupPath) continue;
    const backupName = getLatestBackupName(p.fullPath);

    const ghDir = path.join(p.fullPath, '.github');
    const findings = getUnrestoredContent(backupPath);

    writeProject(p.name, `backup: ${backupName}`);

    // Step 1: Report findings
    const hasNonCI = findings.rootFiles.length > 0 || findings.unknownDirs.length > 0;
    if (hasNonCI) {
      writeWarn('Non-brain content not yet restored:');
      for (const f of findings.rootFiles) writeAction(`ROOT_FILE: ${f}`);
      for (const d of findings.unknownDirs) writeAction(`UNKNOWN_DIR: ${d.name}/ (${d.fileCount} files)`);
      console.log('');
      console.log(C.darkGray('    Run --mode AutoRestore to copy these automatically.'));
    }

    // Step 2: CI curation
    const backupCI = path.join(backupPath, 'copilot-instructions.md');
    const currentCI = path.join(ghDir, 'copilot-instructions.md');

    if (fs.existsSync(backupCI) && findings.customCI) {
      writeWarn('copilot-instructions.md has project-specific content:');
      console.log('');

      // Extract project-specific sections from old CI
      const oldContent = fs.readFileSync(backupCI, 'utf8');
      const sections = [];

      const sectionRegex = /^## (Project Context|Active Context|Context|Tech Stack|Coding Standards|Architecture)\s*\r?\n([\s\S]*?)(?=\r?\n## |\s*$)/gm;
      let match;
      while ((match = sectionRegex.exec(oldContent)) !== null) {
        const sectionName = match[1];
        const sectionBody = match[2].trim();
        if (sectionBody.length > 10) {
          sections.push({ name: sectionName, body: sectionBody, lines: sectionBody.split('\n').length });
        }
      }

      if (sections.length > 0) {
        console.log(C.white(`    Found ${sections.length} project-specific section(s):`));
        for (const s of sections) {
          console.log(C.gray(`      - ## ${s.name} (${s.lines} lines)`));
        }
        console.log('');

        if (!opts.dryRun) {
          const answer = await askQuestion('    Append these sections to current CI? (y/N): ');
          if (answer.toLowerCase() === 'y') {
            let currentContent = fs.existsSync(currentCI) ? fs.readFileSync(currentCI, 'utf8') : '';
            for (const s of sections) {
              currentContent += `\n\n## ${s.name}\n\n${s.body}`;
            }
            fs.writeFileSync(currentCI, currentContent, 'utf8');
            writeOK(`Appended ${sections.length} section(s) to copilot-instructions.md`);
          } else {
            console.log(C.gray('    Skipped CI merge.'));
          }
        } else {
          console.log(C.darkGray('    (dry-run) Would prompt to append sections'));
        }
      }
    }

    console.log('');
  }
}

// ── Mode: Clean ─────────────────────────────────────────────────────────────

function invokeClean(opts) {
  writePhase('CLEAN — Removing .github-backup-* directories');

  const projects = getBackupProjects(opts);
  let cleaned = 0;
  let blocked = 0;

  for (const p of projects) {
    const backupPath = getLatestBackup(p.fullPath);
    if (!backupPath) continue;
    const backupName = getLatestBackupName(p.fullPath);

    const ghDir = path.join(p.fullPath, '.github');

    // Safety: verify brain is installed
    const versionFile = path.join(ghDir, '.alex-brain-version');
    if (!fs.existsSync(versionFile)) {
      writeWarn(`${p.name}: no .alex-brain-version stamp — skipping (run Verify first)`);
      blocked++;
      continue;
    }

    // Safety: check for unrestored content
    const findings = getUnrestoredContent(backupPath);
    const hasUnrestored = findings.rootFiles.length > 0 || findings.unknownDirs.length > 0;
    if (hasUnrestored) {
      writeWarn(`${p.name}: unrestored content remains — run AutoRestore first`);
      for (const f of findings.rootFiles) writeAction(`ROOT_FILE: ${f}`);
      for (const d of findings.unknownDirs) writeAction(`UNKNOWN_DIR: ${d.name}/ (${d.fileCount} files)`);
      blocked++;
      continue;
    }

    writeProject(p.name, `removing ${backupName}`);
    if (!opts.dryRun) {
      fs.rmSync(backupPath, { recursive: true, force: true });
    }
    writeOK('backup removed');
    cleaned++;
  }

  console.log(`\n  Cleaned: ${cleaned} | Blocked: ${blocked}`);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  switch (opts.mode) {
    case 'scan':
      invokeScan(opts);
      break;
    case 'autorestore':
      invokeAutoRestore(opts);
      break;
    case 'curate':
      await invokeCurate(opts);
      break;
    case 'clean':
      invokeClean(opts);
      break;
  }

  console.log(`\n${C.cyan('Done.')}\n`);
}

main().catch(err => { console.error(C.red(`FATAL: ${err.message}`)); process.exit(1); });

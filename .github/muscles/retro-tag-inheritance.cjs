#!/usr/bin/env node
/**
 * @muscle retro-tag-inheritance
 * @inheritance inheritable
 * @description Retro-tag a brain's inheritance tiers against a reference
 *              source brain. For each brain file in the target ``.github/``:
 *                - If its relative path matches a file in the source brain
 *                  AND the file is not currently tagged ``custom`` (intentional
 *                  fork), force-tag ``inheritance: inheritable``.
 *                - Else (heir-added file or intentional fork), force-tag
 *                  ``inheritance: custom``.
 *                - If the file is tagged ``inheritance: master-only`` OR its
 *                  path matches a master-only file in the source brain, the
 *                  file is DELETED (contamination from past mis-syncs).
 *                - Files with no frontmatter on a canonical artifact path get
 *                  a minimal frontmatter block injected. Sub-files (resources/,
 *                  templates/, references/, READMEs) without frontmatter are
 *                  left alone — they ride with their parent.
 *              After processing, empty subdirectories are pruned.
 *
 *              Use cases:
 *                - Master one-time fleet tagging: master invokes this against
 *                  each bundled or sibling heir to bring legacy brains into
 *                  alignment with the explicit-tier model.
 *                - Heir Phase 2 of brain upgrade: the heir invokes this against
 *                  its own backup directory (.github-backup-<stamp>) to
 *                  classify backed-up files before deciding which custom
 *                  additions to restore.
 *                - Heir self-audit: a heir can run it against itself to detect
 *                  drift after manual edits.
 *
 *              Source brain defaults to the brain colocated with this script
 *              (``path.dirname(__dirname)``). Override with ``--source``.
 *
 * @version 2.0.0
 *
 * Usage:
 *   node .github/muscles/retro-tag-inheritance.cjs --target <path>/.github [--dry-run] [--force] [--source <path>]
 *
 * Safety guards:
 *   - Refuses if the target is the master itself (detected via
 *     ``config/MASTER-ALEX-PROTECTED.json``). Master must never be retagged.
 *   - Refuses if the target's git working tree has uncommitted changes
 *     (use ``--force`` to override). Gives the user a guaranteed rollback path:
 *     ``git checkout HEAD -- <target>``.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(name);
  return (i >= 0 && i + 1 < args.length) ? args[i + 1] : fallback;
}
const DRY_RUN = args.includes('--dry-run');
const FORCE   = args.includes('--force');

// Default source brain: the brain colocated with this script. From
// ``.github/muscles/retro-tag-inheritance.cjs`` that is ``.github/``. Works
// identically for master and any heir that received the synced muscle.
const COLOCATED_BRAIN = path.dirname(__dirname);
const SOURCE = path.resolve(arg('--source', COLOCATED_BRAIN));
const TARGET = path.resolve(process.cwd(), arg('--target', ''));

const TARGETS = [
  { dir: 'skills',       ext: '.md',  kind: 'frontmatter' },
  { dir: 'instructions', ext: '.md',  kind: 'frontmatter' },
  { dir: 'prompts',      ext: '.md',  kind: 'frontmatter' },
  { dir: 'agents',       ext: '.md',  kind: 'frontmatter' },
  { dir: 'muscles',      ext: '.cjs', kind: 'jsdoc' },
  { dir: 'muscles',      ext: '.js',  kind: 'jsdoc' },
  { dir: 'muscles',      ext: '.mjs', kind: 'jsdoc' },
  { dir: 'hooks',        ext: '.cjs', kind: 'jsdoc' },
];

function walk(root, ext, baseLen, out = new Set()) {
  if (!fs.existsSync(root)) return out;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const p = path.join(root, entry.name);
    if (entry.isDirectory()) walk(p, ext, baseLen, out);
    else if (entry.isFile() && p.endsWith(ext)) out.add(p.slice(baseLen + 1).replace(/\\/g, '/'));
  }
  return out;
}

/**
 * Walk a source directory and return the set of relative paths whose content
 * is tagged master-only (frontmatter or JSDoc). Used to detect heir files that
 * should never have been synced regardless of their own tag state.
 */
function collectMasterOnlyPaths(root, ext, kind, baseLen, out = new Set()) {
  if (!fs.existsSync(root)) return out;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const p = path.join(root, entry.name);
    if (entry.isDirectory()) {
      collectMasterOnlyPaths(p, ext, kind, baseLen, out);
    } else if (entry.isFile() && p.endsWith(ext)) {
      const content = fs.readFileSync(p, 'utf8');
      const isMasterOnly = kind === 'frontmatter'
        ? /^---\r?\n[\s\S]*?^inheritance:\s*master-only\s*$[\s\S]*?^---/m.test(content)
        : /\/\*\*[\s\S]*?@inheritance\s+master-only[\s\S]*?\*\//.test(content);
      if (isMasterOnly) out.add(p.slice(baseLen + 1).replace(/\\/g, '/'));
    }
  }
  return out;
}

/**
 * Force-set `inheritance: <tier>` in YAML frontmatter.
 * If no frontmatter exists, prepend a minimal block.
 * Returns { changed, content, previousTier }.
 */
function forceTagFrontmatter(content, tier) {
  const fmMatch = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)/);
  if (!fmMatch) {
    // No frontmatter — create minimal block.
    const block = `---\ntype: resource\nlifecycle: stable\ninheritance: ${tier}\n---\n`;
    return { changed: true, content: block + content, previousTier: 'no-frontmatter' };
  }

  const fm = fmMatch[2];
  const inheritanceMatch = fm.match(/^inheritance:\s*(\S+)\s*$/m);
  let newFm;

  if (inheritanceMatch) {
    const previousTier = inheritanceMatch[1].toLowerCase();
    if (previousTier === tier) return { changed: false, content, previousTier };
    newFm = fm.replace(/^inheritance:\s*\S+\s*$/m, `inheritance: ${tier}`);
    const newContent = fmMatch[1] + newFm + fmMatch[3] + content.slice(fmMatch[0].length);
    return { changed: true, content: newContent, previousTier };
  }

  // Insert after `lifecycle:` if present, else after `type:`, else at top of fm.
  const insertion = `inheritance: ${tier}`;
  if (/^lifecycle:.*$/m.test(fm)) {
    newFm = fm.replace(/^(lifecycle:.*)$/m, `$1\n${insertion}`);
  } else if (/^type:.*$/m.test(fm)) {
    newFm = fm.replace(/^(type:.*)$/m, `$1\n${insertion}`);
  } else {
    newFm = `${insertion}\n${fm}`;
  }
  const newContent = fmMatch[1] + newFm + fmMatch[3] + content.slice(fmMatch[0].length);
  return { changed: true, content: newContent, previousTier: 'untagged' };
}

/**
 * Force-set `@inheritance <tier>` in the first JSDoc block.
 * If no JSDoc block exists, prepend a minimal one.
 */
function forceTagJsdoc(content, tier) {
  const blockMatch = content.match(/^(#![^\n]*\n)?\s*\/\*\*\r?\n([\s\S]*?)\r?\n\s*\*\//);
  if (!blockMatch) {
    // No JSDoc block — create minimal one. Preserve any shebang.
    const shebangMatch = content.match(/^#![^\n]*\n/);
    const shebang = shebangMatch ? shebangMatch[0] : '';
    const rest = shebang ? content.slice(shebang.length) : content;
    const block = `/**\n * @inheritance ${tier}\n */\n`;
    return { changed: true, content: shebang + block + rest, previousTier: 'no-frontmatter' };
  }

  const block = blockMatch[2];
  const inheritanceMatch = block.match(/^\s*\*\s*@inheritance\s+(\S+)/m);

  if (inheritanceMatch) {
    const previousTier = inheritanceMatch[1].toLowerCase();
    if (previousTier === tier) return { changed: false, content, previousTier };
    const newBlock = block.replace(/^(\s*\*\s*)@inheritance\s+\S+/m, `$1@inheritance ${tier}`);
    const replaced = blockMatch[0].replace(block, newBlock);
    const newContent = content.replace(blockMatch[0], replaced);
    return { changed: true, content: newContent, previousTier };
  }

  const insertion = ` * @inheritance ${tier}`;
  let newBlock;
  if (/^\s*\*\s*@lifecycle\b.*$/m.test(block)) {
    newBlock = block.replace(/^\s*\*\s*@lifecycle\b.*$/m, m => `${m}\n${insertion}`);
  } else if (/^\s*\*\s*@(muscle|hook)\b.*$/m.test(block)) {
    newBlock = block.replace(/^\s*\*\s*@(muscle|hook)\b.*$/m, m => `${m}\n${insertion}`);
  } else if (/^\s*\*\s*@\w+\b.*$/m.test(block)) {
    newBlock = block.replace(/^\s*\*\s*@\w+\b.*$/m, m => `${m}\n${insertion}`);
  } else {
    newBlock = `${block}\n${insertion}`;
  }
  const replaced = blockMatch[0].replace(block, newBlock);
  const newContent = content.replace(blockMatch[0], replaced);
  return { changed: true, content: newContent, previousTier: 'untagged' };
}

/**
 * Is this relative path a canonical brain artifact (top-level skill, instruction,
 * prompt, agent, muscle)? Sub-files (resources/, references/, templates/,
 * READMEs inside skill folders) ride with their parent and should NOT have a
 * fresh frontmatter block injected if they don't already have one.
 *
 * @param {string} dir   The TARGETS bucket name (skills, instructions, ...)
 * @param {string} rel   Relative path within that bucket (forward-slash)
 */
function isCanonicalArtifactPath(dir, rel) {
  if (dir === 'skills') {
    // Only the SKILL.md or top-level *.prompt.md files of each skill folder.
    // e.g. "foo/SKILL.md" or "foo/setup.prompt.md". Reject deeper paths.
    const parts = rel.split('/');
    if (parts.length !== 2) return false;
    return parts[1] === 'SKILL.md' || parts[1].endsWith('.prompt.md');
  }
  if (dir === 'instructions') return rel.endsWith('.instructions.md') && !rel.includes('/');
  if (dir === 'prompts')      return rel.endsWith('.prompt.md');
  if (dir === 'agents')       return rel.endsWith('.agent.md');
  if (dir === 'muscles')      return rel.endsWith('.cjs') || rel.endsWith('.js') || rel.endsWith('.mjs');
  if (dir === 'hooks')        return rel.endsWith('.cjs');
  return false;
}

/**
 * Recursively remove empty directories under root. Returns count removed.
 */
function removeEmptyDirs(root, dryRun) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return 0;
  let removed = 0;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      removed += removeEmptyDirs(path.join(root, entry.name), dryRun);
    }
  }
  if (fs.readdirSync(root).length === 0) {
    if (!dryRun) fs.rmdirSync(root);
    removed++;
  }
  return removed;
}

function main() {
  // ============================================================
  // Argument validation.
  // ============================================================
  if (!arg('--target', null)) {
    console.error('✖ Missing required --target <path>');
    console.error('  Usage: node retro-tag-inheritance.cjs --target <path>/.github [--dry-run] [--force] [--source <path>]');
    process.exit(2);
  }

  // ============================================================
  // SAFETY: refuse to touch master.
  // ============================================================
  const masterMarker = path.join(TARGET, 'config', 'MASTER-ALEX-PROTECTED.json');
  if (fs.existsSync(masterMarker)) {
    console.error(`✖ REFUSING: target contains MASTER-ALEX-PROTECTED.json (${masterMarker}).`);
    console.error('  This is a master brain. Master must never be retagged.');
    process.exit(2);
  }
  if (path.resolve(TARGET) === path.resolve(SOURCE)) {
    console.error('✖ REFUSING: target equals source brain. Retagging in place would self-match every file.');
    process.exit(2);
  }

  if (!fs.existsSync(SOURCE)) {
    console.error(`✖ Source brain not found: ${SOURCE}`);
    process.exit(2);
  }
  if (!fs.existsSync(TARGET)) {
    console.error(`✖ Target brain not found: ${TARGET}`);
    process.exit(2);
  }

  // ============================================================
  // SAFETY: require clean git working tree in target's repo.
  // Gives the user a guaranteed rollback path:
  //     git checkout HEAD -- .github/
  // Pass --force to override (NOT recommended).
  // ============================================================
  if (!DRY_RUN && !FORCE) {
    try {
      const targetRepo = findGitRoot(TARGET);
      if (targetRepo) {
        // Pathspec must be the target relative to the repo root, not literal ".github".
        const targetRel = path.relative(targetRepo, TARGET).replace(/\\/g, '/') || '.';
        const dirty = execFileSync('git', ['-C', targetRepo, 'status', '--porcelain', '--', targetRel], { encoding: 'utf8' }).trim();
        if (dirty) {
          console.error(`✖ REFUSING: target ${targetRel} has uncommitted changes.`);
          console.error('  Commit or stash first so you have a rollback path:');
          console.error(`    git -C ${targetRepo} checkout HEAD -- ${targetRel}`);
          console.error('  Pass --force to override (NOT recommended).');
          console.error('\nUncommitted files:');
          console.error(dirty.split('\n').slice(0, 10).map(l => '  ' + l).join('\n'));
          process.exit(1);
        }
      } else {
        console.error('⚠  Target is not in a git repository — no rollback path.');
        console.error('  Pass --force to proceed anyway, or initialise git first.');
        process.exit(1);
      }
    } catch (e) {
      console.error(`⚠  Git status check failed: ${e.message}`);
      console.error('  Pass --force to skip this safety check.');
      process.exit(1);
    }
  }

  console.log(`${DRY_RUN ? '[DRY-RUN] ' : ''}Retro-tagging inheritance`);
  console.log(`  source: ${SOURCE} ${path.resolve(SOURCE) === path.resolve(COLOCATED_BRAIN) ? '(colocated)' : ''}`);
  console.log(`  target: ${TARGET}\n`);

  const stats = {
    scanned: 0,
    inheritable: { tagged: 0, alreadyCorrect: 0 },
    custom:      { tagged: 0, alreadyCorrect: 0 },
    noFrontmatterCreated: 0,
    subFileSkipped: 0,
    masterOnlyDeleted: [],
    customConflicts: [], // { rel, reason }
    emptyDirsRemoved: 0,
    rewrites: [], // { rel, prev, next }
  };

  for (const t of TARGETS) {
    const sourceDir = path.join(SOURCE, t.dir);
    const targetDir = path.join(TARGET, t.dir);
    if (!fs.existsSync(targetDir)) continue;

    const officialPaths = walk(sourceDir, t.ext, sourceDir.length);
    const masterOnlyPaths = collectMasterOnlyPaths(sourceDir, t.ext, t.kind, sourceDir.length);
    const targetFiles = walk(targetDir, t.ext, targetDir.length);

    for (const rel of targetFiles) {
      stats.scanned++;
      const filePath = path.join(targetDir, rel);
      const content = fs.readFileSync(filePath, 'utf8');
      const tier = officialPaths.has(rel) ? 'inheritable' : 'custom';

      // Master-only contamination triggers (delete file):
      //   1) The heir's copy is itself tagged master-only (explicit marker)
      //   2) The relative path matches a master-only file in source
      //      (heir was synced before the tag existed)
      const isMasterOnlyByContent = t.kind === 'frontmatter'
        ? /^---\r?\n[\s\S]*?^inheritance:\s*master-only\s*$[\s\S]*?^---/m.test(content)
        : /\/\*\*[\s\S]*?@inheritance\s+master-only[\s\S]*?\*\//.test(content);
      const isMasterOnlyByPath = masterOnlyPaths.has(rel);

      if (isMasterOnlyByContent || isMasterOnlyByPath) {
        const reason = isMasterOnlyByContent ? 'tag' : 'path';
        stats.masterOnlyDeleted.push(`${t.dir}/${rel} [by ${reason}]`);
        if (!DRY_RUN) fs.unlinkSync(filePath);
        continue;
      }

      // Conflict: heir explicitly tagged this `custom` but path matches master.
      // The heir made an intentional fork decision — don't silently overwrite.
      const explicitTier = t.kind === 'frontmatter'
        ? (content.match(/^---\r?\n[\s\S]*?^inheritance:\s*(\S+)\s*$[\s\S]*?^---/m) || [, null])[1]
        : (content.match(/\/\*\*[\s\S]*?@inheritance\s+(\S+)[\s\S]*?\*\//) || [, null])[1];
      if (tier === 'inheritable' && explicitTier && explicitTier.toLowerCase() === 'custom') {
        stats.customConflicts.push(`${t.dir}/${rel}`);
        continue;
      }

      // Skip frontmatter creation for sub-files (resources/, templates/,
      // references/, READMEs). They ride with their parent skill; tagging each
      // is noise. The path-based deletion above still applies.
      const hasFrontmatter = t.kind === 'frontmatter'
        ? /^---\r?\n[\s\S]*?\r?\n---/.test(content)
        : /^(#![^\n]*\n)?\s*\/\*\*\r?\n[\s\S]*?\*\//.test(content);
      if (!hasFrontmatter && !isCanonicalArtifactPath(t.dir, rel)) {
        stats.subFileSkipped++;
        continue;
      }

      const result = t.kind === 'frontmatter'
        ? forceTagFrontmatter(content, tier)
        : forceTagJsdoc(content, tier);

      if (result.previousTier === 'no-frontmatter') {
        stats.noFrontmatterCreated++;
      }

      if (!result.changed) {
        stats[tier].alreadyCorrect++;
        continue;
      }

      if (!DRY_RUN) fs.writeFileSync(filePath, result.content);
      stats[tier].tagged++;
      stats.rewrites.push({ rel: `${t.dir}/${rel}`, prev: result.previousTier, next: tier });
    }
  }

  // Clean up empty directories left behind by deletions.
  for (const t of TARGETS) {
    const targetDir = path.join(TARGET, t.dir);
    stats.emptyDirsRemoved += removeEmptyDirs(targetDir, DRY_RUN);
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Scanned:                       ${stats.scanned}`);
  console.log(`  inheritable already-set:       ${stats.inheritable.alreadyCorrect}`);
  console.log(`  inheritable ${DRY_RUN ? 'would tag      ' : 'tagged         '}:    ${stats.inheritable.tagged}`);
  console.log(`  custom      already-set:       ${stats.custom.alreadyCorrect}`);
  console.log(`  custom      ${DRY_RUN ? 'would tag      ' : 'tagged         '}:    ${stats.custom.tagged}`);
  console.log(`  frontmatter ${DRY_RUN ? 'would create   ' : 'created        '}:    ${stats.noFrontmatterCreated}`);
  console.log(`  sub-files skipped (no fm):     ${stats.subFileSkipped}`);
  console.log(`  custom→inheritable conflicts:  ${stats.customConflicts.length}`);
  console.log(`  master-only ${DRY_RUN ? 'would delete   ' : 'deleted        '}:    ${stats.masterOnlyDeleted.length}`);
  console.log(`  empty dirs   ${DRY_RUN ? 'would remove  ' : 'removed       '}:    ${stats.emptyDirsRemoved}`);
  console.log('───────────────────────────────────────────────────────────────');

  if (stats.customConflicts.length > 0) {
    console.log(`\n⚠  ${stats.customConflicts.length} heir file(s) tagged \`custom\` but path matches master — SKIPPED:`);
    stats.customConflicts.slice(0, 20).forEach(f => console.log(`    - ${f}`));
    if (stats.customConflicts.length > 20) console.log(`    ... and ${stats.customConflicts.length - 20} more`);
    console.log('  Resolve manually: delete to inherit master\'s version, OR rename to keep the fork.');
  }

  if (stats.masterOnlyDeleted.length > 0) {
    console.log(`\n⚠  master-only contamination ${DRY_RUN ? 'WOULD BE deleted' : 'deleted'} (${stats.masterOnlyDeleted.length}):`);
    stats.masterOnlyDeleted.slice(0, 20).forEach(f => console.log(`    - ${f}`));
    if (stats.masterOnlyDeleted.length > 20) {
      console.log(`    ... and ${stats.masterOnlyDeleted.length - 20} more`);
    }
  }

  if (stats.rewrites.length > 0 && DRY_RUN) {
    console.log('\nFirst 20 rewrites:');
    stats.rewrites.slice(0, 20).forEach(r =>
      console.log(`  ${r.prev.padEnd(13)} → ${r.next.padEnd(11)}  ${r.rel}`)
    );
    if (stats.rewrites.length > 20) {
      console.log(`  ... and ${stats.rewrites.length - 20} more`);
    }
  }

  console.log(DRY_RUN ? '\n[DRY-RUN] No files modified.' : '\n✅ Done.');
}

function findGitRoot(start) {
  let dir = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

if (require.main === module) main();

module.exports = { forceTagFrontmatter, forceTagJsdoc, isCanonicalArtifactPath, removeEmptyDirs };

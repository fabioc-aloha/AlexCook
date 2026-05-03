#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle update-notes
 * @lifecycle stable
 * @description Append dated entries to AI-Memory/notes.md
 * @platform node
 * @requires fs, path, os
 * @inheritance inheritable
 *
 * Usage:
 *   node .github/muscles/update-notes.cjs --note "Fleet upgrade done" --section quick
 *   node .github/muscles/update-notes.cjs --note "Submit paper by May 15" --section reminder
 *   node .github/muscles/update-notes.cjs --note "API returns 200 on failure" --section observation
 *   node .github/muscles/update-notes.cjs --list
 *   node .github/muscles/update-notes.cjs --prune-before 2026-03-01
 *
 * @currency 2026-04-20
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// -- AI-Memory path resolution (Windows + macOS + Linux) --------------------

function findAIMemoryPath() {
  const candidates = [];

  // Windows: ~/OneDrive - Company Name/AI-Memory
  try {
    const homeEntries = fs.readdirSync(os.homedir());
    for (const entry of homeEntries) {
      if (/^OneDrive/i.test(entry)) {
        candidates.push(path.join(os.homedir(), entry, 'AI-Memory'));
      }
    }
  } catch { /* ignore */ }

  // macOS: ~/Library/CloudStorage/OneDrive-Personal/AI-Memory
  const cloudStorage = path.join(os.homedir(), 'Library', 'CloudStorage');
  try {
    if (fs.existsSync(cloudStorage)) {
      const csEntries = fs.readdirSync(cloudStorage);
      for (const entry of csEntries) {
        if (/^OneDrive/i.test(entry)) {
          candidates.push(path.join(cloudStorage, entry, 'AI-Memory'));
        }
      }
    }
  } catch { /* ignore */ }

  // Fallbacks
  candidates.push(path.join(os.homedir(), 'AI-Memory'));
  candidates.push(path.join(os.homedir(), '.alex', 'AI-Memory'));

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// -- Section mapping --------------------------------------------------------

const SECTION_MAP = {
  quick: '## Quick Notes',
  reminder: '## Reminders',
  observation: '## Observations',
};

// -- Parse args -------------------------------------------------------------

function parseArgs(argv) {
  const args = { note: null, section: 'quick', list: false, pruneBefore: null };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--note':
        args.note = argv[++i];
        break;
      case '--section':
        args.section = argv[++i];
        break;
      case '--list':
        args.list = true;
        break;
      case '--prune-before':
        args.pruneBefore = argv[++i];
        break;
      default:
        break;
    }
  }
  return args;
}

// -- Read notes.md ----------------------------------------------------------

function readNotes(filePath) {
  if (!fs.existsSync(filePath)) {
    return '# Session Notes\n\n## Quick Notes\n\n## Reminders\n\n## Observations\n';
  }
  return fs.readFileSync(filePath, 'utf8');
}

// -- Append a note to the correct section -----------------------------------

function appendNote(content, section, noteText) {
  const header = SECTION_MAP[section];
  if (!header) {
    process.stderr.write(`Unknown section: ${section}. Use: quick, reminder, observation\n`);
    process.exit(1);
  }

  const date = new Date().toISOString().slice(0, 10);
  const entry = `- **${date}**: ${noteText}`;

  const headerIndex = content.indexOf(header);
  if (headerIndex === -1) {
    // Section doesn't exist — append it
    return content.trimEnd() + `\n\n${header}\n\n${entry}\n`;
  }

  // Find the end of the header line
  const afterHeader = content.indexOf('\n', headerIndex);
  if (afterHeader === -1) {
    return content + `\n${entry}\n`;
  }

  // Find next section (## heading) or end of file
  const nextSection = content.indexOf('\n## ', afterHeader + 1);
  const insertPos = nextSection !== -1 ? nextSection : content.length;

  // Find last non-blank line before next section
  const sectionContent = content.slice(afterHeader, insertPos);
  const lastContentLine = sectionContent.trimEnd();

  // Insert the entry after existing content in this section
  const before = content.slice(0, afterHeader) + lastContentLine + '\n' + entry + '\n';
  const after = nextSection !== -1 ? '\n' + content.slice(nextSection + 1) : '';

  return before + after;
}

// -- Prune entries before a date --------------------------------------------

function pruneEntries(content, beforeDate) {
  const cutoff = new Date(beforeDate);
  let pruned = 0;

  const lines = content.split('\n');
  const result = [];
  for (const line of lines) {
    const match = line.match(/^- \*\*(\d{4}-\d{2}-\d{2})\*\*:/);
    if (match) {
      const entryDate = new Date(match[1]);
      if (entryDate < cutoff) {
        pruned++;
        continue;
      }
    }
    result.push(line);
  }

  process.stdout.write(`Pruned ${pruned} entries before ${beforeDate}\n`);
  return result.join('\n');
}

// -- List current notes -----------------------------------------------------

function listNotes(content) {
  const lines = content.split('\n');
  let currentSection = '';
  let count = 0;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      currentSection = line;
      process.stdout.write(`\n${currentSection}\n`);
    } else if (line.startsWith('- **')) {
      process.stdout.write(`  ${line}\n`);
      count++;
    }
  }

  process.stdout.write(`\nTotal: ${count} entries\n`);
}

// -- Main -------------------------------------------------------------------

function main() {
  const args = parseArgs(process.argv);
  const aiMemoryPath = findAIMemoryPath();

  if (!aiMemoryPath) {
    process.stderr.write('AI-Memory folder not found. Expected OneDrive/AI-Memory/ or ~/.alex/AI-Memory/\n');
    process.exit(1);
  }

  const notesPath = path.join(aiMemoryPath, 'notes.md');
  let content = readNotes(notesPath);

  if (args.list) {
    listNotes(content);
    return;
  }

  if (args.pruneBefore) {
    content = pruneEntries(content, args.pruneBefore);
    fs.writeFileSync(notesPath, content, 'utf8');
    return;
  }

  if (!args.note) {
    process.stderr.write('Usage: update-notes.cjs --note "text" --section quick|reminder|observation\n');
    process.stderr.write('       update-notes.cjs --list\n');
    process.stderr.write('       update-notes.cjs --prune-before 2026-03-01\n');
    process.exit(1);
  }

  content = appendNote(content, args.section, args.note);
  fs.writeFileSync(notesPath, content, 'utf8');
  process.stdout.write(`Added to ${SECTION_MAP[args.section]}: ${args.note}\n`);
}

main();

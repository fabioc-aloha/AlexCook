#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @inheritance inheritable
 * H4: Builder auto-compile reminder
 * Agent-scoped PostToolUse hook for Builder mode.
 * After a .ts file edit, reminds to compile for immediate error feedback.
 *
 * Input:  JSON via stdin (tool_name, tool_input)
 * Output: JSON to stdout with compile reminder if .ts file edited.
 *
 * @currency 2026-04-20
 */
'use strict';

const WRITE_TOOLS = new Set([
  'replace_string_in_file',
  'multi_replace_string_in_file',
  'create_file',
]);

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const event = JSON.parse(input);
    const toolName = event.tool_name || '';
    const filePath = event.tool_input?.filePath || '';

    const isWriteTool = WRITE_TOOLS.has(toolName);
    const isTsFile = /\.tsx?$/.test(filePath);

    if (isWriteTool && isTsFile) {
      const response = {
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext:
            'H4 BUILD CHECK: TypeScript file modified -- run `npm run compile` now to catch errors early.\n' +
            'File: ' + filePath,
        },
      };
      process.stdout.write(JSON.stringify(response));
    }
    process.exit(0);
  } catch {
    process.exit(0);
  }
});

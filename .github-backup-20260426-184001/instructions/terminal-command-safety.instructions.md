---
description: "Prevent terminal command failures from shell metacharacter interpretation, output capture issues, and hanging commands"
application: "When running terminal commands, especially those with special characters or long output"
applyTo: "**"
---

# Terminal Command Safety

Full examples in `.github/skills/terminal-command-safety/SKILL.md`.

## Backtick Hazard (Critical)

Backticks break in ALL shells (bash=command substitution, PowerShell=escape char). NEVER place raw backticks inside double-quoted terminal arguments.

| Content contains | Action |
|---|---|
| Backticks | Always use temp file |
| Multi-line text | Prefer temp file |
| Both quote types | Use temp file |
| Dollar signs (`$`) | Single-quoted heredoc or temp file |
| Plain text only | Inline is safe |

Rules: `gh` → `--body-file`, `git commit` → `-F <file>`, any CLI → file-based input over inline.

## Output Capture Failures

Terminal output can be silently lost or truncated.

1. Redirect to file, then read: `cmd 2>&1 | Out-File $env:TEMP\out.txt`
2. Pipe pagers through `Out-String`
3. Sentinel: `; echo "EXIT_CODE:$LASTEXITCODE"`
4. Limit volume: `Select-Object -First`, `-Tail`, `Format-Table`
5. Avoid alt-buffer programs (`less`, `vim`, `man`) — use non-interactive equivalents
6. If empty: retry with `get_terminal_output`, then redirect to file, then check stderr

## Terminal Hanging

1. `mode=async` for commands >15s (servers, builds, test suites)
2. Never run interactive commands — pre-answer with flags (`--yes`, `--no-edit`)
3. Set network timeouts (`--max-time`, `--prefer-offline`)
4. Avoid heredoc blocks (desync terminal parser)
5. One command at a time — no chaining unrelated commands
6. Kill stuck: `send_to_terminal` with Ctrl+C, or start fresh terminal

---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "User configuration management for runtime settings and preferences"
application: "When managing user configuration, settings, or preference systems"
applyTo: "**/*config*,**/*settings*,**/*preferences*"
currency: 2026-04-22
---

# User Config Management

Full protocol in `.github/skills/user-config-manager/SKILL.md`.

## Quick Reference

- **Windows**: `%APPDATA%/Code/User/`
- **macOS**: `~/Library/Application Support/Code/User/`
- **Linux**: `~/.config/Code/User/`
| Component | Path | Scope |
|-----------|------|-------|
| **User Memories** | `<USER_DATA>/globalStorage/github.copilot-chat/memory-tool/memories/` | All workspaces |
| **User Prompts** | `<USER_DATA>/prompts/*.prompt.md` | All workspaces |
| **MCP Config** | `<USER_DATA>/mcp.json` (access via `MCP: Open User Configuration`) | Profile-scoped |
- Custom agents: `.github/agents/*.agent.md`
- Instructions: `.github/instructions/*.instructions.md`
- MCP config: `.vscode/mcp.json`

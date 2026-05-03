---
description: "Manage VS Code's global AI configuration — user memories, custom agents, user prompts, and MCP servers"
application: "When reviewing, organizing, or troubleshooting user-level Copilot configuration"
applyTo: "**/*memory*,**/*agent*,**/*prompt*,**/*mcp*,**/*user-config*"
---

# User Config Management

## User Config Locations

VS Code user data folder:
- **Windows**: `%APPDATA%/Code/User/`
- **macOS**: `~/Library/Application Support/Code/User/`
- **Linux**: `~/.config/Code/User/`

| Component | Path | Scope |
|-----------|------|-------|
| **User Memories** | `<USER_DATA>/globalStorage/github.copilot-chat/memory-tool/memories/` | All workspaces |
| **Custom Agents** | `~/.copilot/agents/*.agent.md` (cross-platform) | All workspaces |
| **User Prompts** | `<USER_DATA>/prompts/*.prompt.md` | All workspaces |
| **User Instructions** | `~/.copilot/instructions/*.instructions.md` (cross-platform) | All workspaces |
| **MCP Config** | `<USER_DATA>/mcp.json` (access via `MCP: Open User Configuration`) | Profile-scoped |

**Workspace-level** (shared with team):
- Custom agents: `.github/agents/*.agent.md`
- Instructions: `.github/instructions/*.instructions.md`
- MCP config: `.vscode/mcp.json`

## Scope Boundaries

### What Belongs in User Config

- **Universal identity**: Name, role, communication preferences
- **Cross-project patterns**: Lessons learned that apply everywhere
- **Tool preferences**: CLI tools, diagram preferences, formatting rules
- **Global expertise**: Domain knowledge not tied to any workspace

### What Does NOT Belong in User Config

- **Project-specific settings** → `.github/` or `/memories/repo/`
- **Team conventions** → Workspace `.github/copilot-instructions.md`
- **Secrets/tokens** → VS Code SecretStorage or environment variables
- **Temporary session notes** → `/memories/session/`

## Deployed Alex Portable Content

The following Alex-derived files provide consistent behavior across all workspaces:

**Instructions** (`~/.copilot/instructions/`):
- `anti-hallucination` — Prevent confabulation
- `awareness` — Metacognitive monitoring
- `emotional-intelligence` — Frustration detection
- `terminal-safety` — Shell hazard prevention
- `code-quality` — KISS/DRY/security principles

**Agents** (`~/.copilot/agents/`):
- `Alex-Builder` — Optimistic implementation
- `Alex-Validator` — Adversarial QA  
- `Alex-Researcher` — Deep domain research

## Custom Agent Format

```markdown
---
name: AgentName
description: What the agent does
argument-hint: Input guidance for users
model: claude-sonnet-4          # Optional, can be array for fallback
target: vscode
user-invocable: true            # Show in agents dropdown (default: true)
disable-model-invocation: false # Allow as subagent (default: false)
tools: ['search', 'read', 'web', 'vscode/memory']
agents: ['SubAgentName']        # Other agents this can call (* for all)
handoffs:                       # Buttons shown after completion
  - label: Continue
    agent: implementation
    prompt: 'Start implementing...'
    send: false
    model: GPT-5 (copilot)      # Optional model override
hooks:                          # Preview: agent-scoped hooks
  onFileEdited: ["npm run lint"]
---

You are [AGENT NAME], a specialized assistant...

Reference tools inline with #tool:web/fetch syntax.
```

**Note**: VS Code also supports `.claude/agents/*.md` with Claude-specific format.

## Conflict Resolution

When user instructions conflict with workspace instructions:

1. **Workspace wins** for project-specific concerns
2. **User wins** for personal preferences (formatting, style)
3. **Most specific wins** — narrow `applyTo` beats broad

## MCP Server Guidelines

User-level `mcp.json` should contain:

- **Global utility servers**: markitdown, fetch tools
- **Enterprise servers**: Microsoft Graph, GitHub MCP
- **Personal servers**: Local tools you use everywhere

Workspace-level MCP should contain:

- **Project-specific servers**: Custom APIs, local databases
- **Team-shared servers**: Shared infrastructure tools

## Quick Commands

```bash
# View user memories
memory view /memories/

# Create new memory file
memory create /memories/new-topic.md

# Edit memory
memory str_replace /memories/file.md "old" "new"
```

## Health Checks

Run periodically:

- **Memory budget**: User memories should stay under 150 lines
- **Agent overlap**: Check custom agents don't duplicate workspace agents
- **Instruction conflicts**: Verify no duplicates between user and workspace
- **MCP reachability**: Confirm MCP servers respond

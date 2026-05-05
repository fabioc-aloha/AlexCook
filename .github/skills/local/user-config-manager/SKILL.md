---
type: skill
lifecycle: stable
inheritance: inheritable
name: user-config-manager
description: "Manage VS Code's global AI configuration — user memories, user prompts, and MCP servers"
tier: standard
applyTo: '**/*memory*,**/*agent*,**/*prompt*,**/*mcp*,**/*user-config*'
currency: 2026-04-22
---

# User Config Manager

Audit, organize, and optimize the user's global VS Code AI configuration ecosystem.

## Scope

This skill manages user-level AI customization files.

**VS Code user data folder**:
- Windows: `%APPDATA%/Code/User/`
- macOS: `~/Library/Application Support/Code/User/`
- Linux: `~/.config/Code/User/`

| Component | Path | Purpose |
|-----------|------|---------|  
| User Memories | `<USER_DATA>/globalStorage/github.copilot-chat/memory-tool/memories/` | Cross-workspace knowledge |
| User Prompts | `<USER_DATA>/prompts/*.prompt.md` | Reusable workflows |
| MCP Config | `<USER_DATA>/mcp.json` (access via `MCP: Open User Configuration`) | External tool servers |

**Note**: Workspace-level agents and instructions live in `.github/agents/` and `.github/instructions/`. VS Code also supports user-level `~/.copilot/agents/` and `~/.copilot/instructions/` but Alex does not deploy content there — all Alex cognitive files are workspace-scoped via `.github/`.

## Triggers

- User asks to review or organize their Copilot configuration
- Before major Alex brain updates (avoid conflicts)
- When user reports inconsistent AI behavior across workspaces
- Quarterly maintenance alongside memory curation

## Audit Procedure

### Step 1: Inventory User Config

Read all user config files:

```bash
# User memories
memory view /memories/

# Custom agents (list globalStorage directory)
# Check for *-agent/ directories

# User prompts
# List %APPDATA%/Code/User/prompts/

# MCP config
# Read %APPDATA%/Code/User/mcp.json
```

### Step 2: Memory Scope Check

For each memory file, verify content belongs at user level:

| Content | Belongs In | Action |
|---------|------------|--------|
| Identity (name, role) | `/memories/user-info.md` | Keep |
| Cross-project patterns | `/memories/patterns.md` | Keep |
| Project-specific facts | Workspace `.github/` or `/memories/repo/` | Flag for move |
| Personal non-dev info | Consider separate file or removal | Flag |
| Secrets/tokens | SecretStorage | DELETE immediately |

**3-Workspace Test**: Content must be useful in 3+ different workspaces.

### Step 3: Prompt Review

For each user prompt in `<USER_DATA>/prompts/`:

1. **Relevance**: Is the prompt still useful?
2. **Overlap**: Does it duplicate a workspace prompt in `.github/prompts/`?
3. **Quality**: Does frontmatter have description and mode?

### Step 4: MCP Server Audit

For each MCP server in `mcp.json`:

1. **Reachability**: Can the server be contacted?
2. **Usage**: Is the server actively used?
3. **Overlap**: Do workspace MCP servers duplicate functionality?
4. **Security**: Are credentials properly managed?

### Step 5: Generate Report

```markdown
# User Config Health Report

**Date**: [Date]
**User**: [Name from user-info.md]

## Summary

| Component | Files | Issues | Health |
|-----------|-------|--------|--------|
| Memories | N | N | 🟢/🟡/🔴 |
| Prompts | N | N | 🟢/🟡/🔴 |
| MCP Servers | N | N | 🟢/🟡/🔴 |

## Issues Found

### Critical
- [List critical issues]

### Warnings
- [List warnings]

### Recommendations
- [List optimization suggestions]

## Actions Taken
- [List any auto-fixes applied]
```

## Templates

### Custom Agent Template

```markdown
---
name: AgentName
description: What this agent specializes in
argument-hint: What users should provide when invoking
model: claude-sonnet-4
target: vscode
user-invocable: true
disable-model-invocation: false
tools: ['search', 'read', 'web', 'vscode/memory']
agents: []
handoffs: []
hooks: {}
---

You are [AGENT NAME], a specialized assistant that [PURPOSE].

## Core Responsibilities

- Responsibility 1
- Responsibility 2

## Rules

- Rule 1: Never do X
- Rule 2: Always do Y

Use #tool:web/fetch to reference tools inline.

## Output Format

[Describe expected output structure]
```

### User Memory Structure Template

```markdown
# User Memory

## Identity
- Name, role, and professional context
- Communication preferences (formality, length)

## Writing Style
- Formatting preferences (em dashes, lists)
- Terminology preferences

## Tool Preferences
- CLI tool preferences (npm vs pnpm)
- Diagram tool preferences (Mermaid settings)

## Workflow
- Git habits (commit frequency, branch naming)
- Review preferences

## Cross-Workspace Access
- MCP server usage patterns
- Authentication patterns
```

### Tool Set Template

```json
{
  "tool-set-name": {
    "tools": ["tool1", "tool2", "tool3"],
    "description": "Brief description of what these tools do together",
    "icon": "appropriate-icon-name"
  }
}
```

## Integration with Other Skills

| Skill | Integration Point |
|-------|-------------------|
| `memory-curation` | Call for deep memory audit |
| `dream-state` | Runs user config check in Phase 5 |
| `health-pulse` | Reports user config metrics |

## Scope Boundaries

This skill does NOT manage:

- Workspace-level `.github/` brain files (that's `brain-qa`)
- VS Code settings.json (that's user preference, not AI config)
- GitHub Copilot Enterprise settings (org-managed)

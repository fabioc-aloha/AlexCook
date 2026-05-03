---
name: user-config-manager
description: "Manage VS Code's global AI configuration — user memories, custom agents, user prompts, and MCP servers"
tier: standard
applyTo: '**/*memory*,**/*agent*,**/*prompt*,**/*mcp*,**/*user-config*'
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
| Custom Agents | `~/.copilot/agents/*.agent.md` (cross-platform) | Specialized personas |
| User Prompts | `<USER_DATA>/prompts/*.prompt.md` | Reusable workflows |
| User Instructions | `~/.copilot/instructions/*.instructions.md` (cross-platform) | Global behavior rules |
| MCP Config | `<USER_DATA>/mcp.json` (access via `MCP: Open User Configuration`) | External tool servers |

**Note**: Workspace-level equivalents exist in `.github/agents/`, `.github/instructions/`, and `.vscode/mcp.json`.

## Deployed Alex Portable Configuration

The following Alex-derived content is deployed user-wide (April 2026):

### Portable Instructions (`~/.copilot/instructions/`)

| File | Purpose |
|------|---------|  
| `anti-hallucination.instructions.md` | Prevent confabulation |
| `awareness.instructions.md` | Metacognitive monitoring |
| `emotional-intelligence.instructions.md` | Frustration detection |
| `terminal-safety.instructions.md` | Shell hazard prevention |
| `code-quality.instructions.md` | KISS/DRY/security principles |

### User-Level Agents (`~/.copilot/agents/`)

| Agent | Mental Model |
|-------|--------------|  
| `Alex-Builder` | Optimistic implementation |
| `Alex-Validator` | Adversarial QA |
| `Alex-Researcher` | Deep domain research |

These provide Alex-like behavior in **all workspaces**.

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

### Step 3: Agent Analysis

For each custom agent, check:

1. **Tool scope**: Are tools appropriately constrained?
2. **Model selection**: Is specific model justified?
3. **Handoff patterns**: Do handoffs make sense?
4. **Overlap**: Does agent overlap with workspace agents?

### Step 4: Instruction Conflict Detection

Compare user instructions (`prompts/*.instructions.md`) with workspace instructions:

| Situation | Action |
|-----------|--------|
| User instruction duplicates workspace | Flag — remove user version |
| User instruction contradicts workspace | Flag — clarify precedence |
| User instruction supplements workspace | OK — document relationship |
| User instruction for domain not in any workspace | OK — global expertise |

### Step 5: MCP Server Audit

For each MCP server in `mcp.json`:

1. **Reachability**: Can the server be contacted?
2. **Usage**: Is the server actively used?
3. **Overlap**: Do workspace MCP servers duplicate functionality?
4. **Security**: Are credentials properly managed?

### Step 6: Generate Report

```markdown
# User Config Health Report

**Date**: [Date]
**User**: [Name from user-info.md]

## Summary

| Component | Files | Issues | Health |
|-----------|-------|--------|--------|
| Memories | N | N | 🟢/🟡/🔴 |
| Agents | N | N | 🟢/🟡/🔴 |
| Instructions | N | N | 🟢/🟡/🔴 |
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

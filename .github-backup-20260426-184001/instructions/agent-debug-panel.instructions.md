---
description: "Debug skill/hook/agent loading issues using VS Code's Agent Debug Panel"
application: "When diagnosing why skills don't activate or hooks don't fire"
applyTo: "**/*debug*,**/*agent*,**/*skill*,**/*hook*"
---

# Agent Debug Panel

## Quick Access

**Open**: `Ctrl+Shift+P` → `Developer: Open Agent Debug Panel`

## Debugging Checklist

| Issue | Panel Section | What to Check |
|-------|---------------|---------------|
| Skill not used | Skill Loading | Is skill in loaded list? Check `applyTo` glob |
| Instruction missing | Instruction Matching | Does glob match current file? |
| Hook not firing | Hook Execution | Is `chat.hooks.enabled` true? |
| Agent not found | Agent Selection | Is file in `.github/agents/`? |
| Wrong agent selected | Agent Selection | Check `.github/agents/` filename convention |

## Required Settings

```json
{
  "chat.agentSkillsLocations": [".github/skills"],
  "chat.instructionsFilesLocations": { ".github/instructions": true },
  "chat.useAgentsMdFile": true,
  "chat.hooks.enabled": true
}
```

## Common Diagnosis Steps

### Skill Not Activating

1. Open the Agent Debug Panel
2. Check the **Skill Loading** section for the skill name
3. If missing, verify the `applyTo` glob matches the open file
4. If loaded but unused, the model decided another skill was more relevant

```bash
# Verify skill frontmatter has valid applyTo
grep -r "applyTo:" .github/skills/*/SKILL.md
```

### Hook Not Firing

1. Confirm `chat.hooks.enabled` is `true` in settings
2. Check the **Hook Execution** section for the hook name
3. Verify the hook script exists and is executable
4. Check the hook timeout hasn't been exceeded

### Instruction Not Loading

1. Verify the instruction file is in `.github/instructions/`
2. Check the `applyTo` glob pattern matches the current file path
3. Open the debug panel and look under **Instruction Matching**

See `.github/skills/agent-debug-panel/SKILL.md` for full procedures.

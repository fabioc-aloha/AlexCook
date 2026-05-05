---
type: resource
lifecycle: stable
inheritance: inheritable
---

# Tool Set Template

> Reference for configuring tool restrictions in custom agents.

## Agent Tool Configuration

The `tools:` frontmatter field in `.agent.md` files controls which tools an agent can access. Restrict tools to enforce the agent's intended scope.

### Preset Tool Sets

**Read-Only Research** — for agents that should never modify files:

```yaml
tools: ["search", "codebase", "fetch"]
```

**Builder** — full implementation access:

```yaml
tools: ["search", "codebase", "problems", "usages", "runSubagent", "fetch", "agent"]
```

**Documentation** — file access without terminal:

```yaml
tools: ["search", "codebase", "problems", "usages", "runSubagent", "fetch"]
```

**Minimal** — search and read only:

```yaml
tools: ["search", "codebase"]
```

**Full Access** — all available tools:

```yaml
tools: ["search", "codebase", "problems", "usages", "runSubagent", "fetch", "agent", "terminal"]
```

### Available Tool Categories

| Tool ID | Capability | Risk Level |
|---------|-----------|------------|
| `search` | File search, grep, semantic search | Low |
| `codebase` | Read files, list directories | Low |
| `fetch` | Fetch web pages | Low |
| `problems` | Get compile/lint errors | Low |
| `usages` | Find symbol references | Low |
| `agent` | Run subagents | Medium |
| `runSubagent` | Invoke subagent sessions | Medium |
| `terminal` | Execute terminal commands | High |

### Custom Tool Names

Some tools use specific names when targeted:

```yaml
# MCP tools (if configured)
tools: ["search", "codebase", "alex_knowledge_search", "alex_health_check"]

# Specific terminal tools
tools: ["run_in_terminal", "create_file", "replace_string_in_file", "read_file"]
```

### Example: Restricted Security Auditor

```yaml
---
name: Security Auditor
description: Read-only security analysis — never modifies files
model: claude-sonnet-4
tools: ["search", "codebase", "problems", "fetch"]
user-invocable: true
---

You are a security auditor. You ONLY analyze code for vulnerabilities.
You never modify files, run terminal commands, or create new files.
```

### Example: Data Pipeline Builder

```yaml
---
name: Data Pipeline
description: Build and test data pipelines with full access
model: claude-sonnet-4
tools: ["search", "codebase", "problems", "usages", "runSubagent", "fetch", "terminal"]
user-invocable: true
---

You are a data pipeline specialist with full tool access.
```

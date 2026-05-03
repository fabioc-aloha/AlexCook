---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Prompt authoring standard — tier classification, model selection, TODO tracking, and verify-before-proceed gates"
application: "When creating, reviewing, or converting .prompt.md files"
applyTo: "**/*.prompt.md"
currency: 2026-04-21
---

# Prompt Authoring Standard

Codifies the rules for writing high-quality prompts that drive autonomous workflows.

## Prompt Tiers

Every prompt belongs to exactly one tier:

| Tier | Purpose | Key Trait | `model:` Required? |
|------|---------|-----------|---------------------|
| **Procedural** | Self-driving multi-step workflow | Loop-until-green, TODO tracking, verify gates | Yes |
| **Interactive** | Needs user input at decision points | Asks questions, presents options | Optional |
| **Declarative** | Context injection only | Sets persona/rules, no execution steps | No |

### Tier Classification of All 38 Prompts

**Procedural** (self-driving, needs compile/test/verify loops):

| Prompt | Current Size | Priority |
|--------|-------------|----------|
| `release.prompt.md` | Multi-step release pipeline | Sprint 2 |
| `refactor.prompt.md` | Refactor with test parity verification | Sprint 2 |
| `tdd.prompt.md` | Red-green-refactor loop enforcement | Sprint 2 |
| `debug.prompt.md` | Reproduce-isolate-fix-verify cycle | Sprint 2 |
| `tests.prompt.md` | Test generation with coverage verification | Sprint 2 |
| `currency-audit.prompt.md` | Automated brain-qa sweep | Sprint 3 |
| `fleet-upgrade.prompt.md` | Multi-project brain upgrade | Sprint 3 |
| `publish-all.prompt.md` | Push + sync + publish pipeline | Sprint 3 |
| `validate-config.prompt.md` | Config validation with fix suggestions | Sprint 3 |
| `vscode-extension-audit.prompt.md` | Multi-phase extension audit | Sprint 3 |
| `ui-ux-audit.prompt.md` | Multi-phase UX audit | Sprint 3 |
| `audit-writing.prompt.md` | Documentation quality audit | Sprint 3 |
| `secrets.prompt.md` | Credential scanning workflow | Sprint 3 |
| `root-cause-analysis.prompt.md` | Systematic debugging | Sprint 3 |
| `fix.prompt.md` | Error diagnosis and fix cycle | Sprint 3 |

**Interactive** (requires user input at key decision points):

| Prompt | Interaction Pattern |
|--------|---------------------|
| `plan.prompt.md` | Asks for scope, priorities, constraints |
| `spec.prompt.md` | Gathers requirements interactively |
| `blog-write.prompt.md` | Asks for topic, audience, tone |
| `critical-thinking.prompt.md` | Poses questions, collects positions |
| `identity-customization.prompt.md` | Interview-style persona setup |
| `customize-sidebar.prompt.md` | Asks which buttons/workflows to add |
| `setup-ai-memory.prompt.md` | Scaffolds AI-Memory with user input |
| `mcp-server.prompt.md` | Gathers server requirements |
| `graph-api.prompt.md` | Asks for endpoints, permissions |
| `teams-app.prompt.md` | Asks for app type, capabilities |
| `project-dashboard.prompt.md` | Asks for KPIs, audience |

**Declarative** (context injection, no execution steps):

| Prompt | Purpose |
|--------|---------|
| `brand.prompt.md` | Injects brand guidelines |
| `visualize.prompt.md` | Injects chart creation rules |
| `interpret.prompt.md` | Injects chart reading protocol |
| `dashboard.prompt.md` | Injects dashboard design rules |
| `image-handling.prompt.md` | Injects image format rules |
| `visual-memory.prompt.md` | Injects visual memory protocol |
| `markdown-mermaid.prompt.md` | Injects Mermaid diagram rules |
| `explain.prompt.md` | Injects teaching persona |
| `gamma.prompt.md` | Injects Gamma slide rules |
| `marp.prompt.md` | Injects Marp presentation rules |
| `presentation.prompt.md` | Injects presentation rules |
| `md-scaffold.prompt.md` | Injects scaffold template rules |

## Procedural Prompt Requirements

Every Procedural-tier prompt MUST include:

### 1. Model Selection

```yaml
model: claude-opus-4-6    # Complex multi-step workflows
# or
model: claude-sonnet-4    # Fast single-step tasks
```

### 2. TODO Tracking Mandate

Include in the prompt body:

```markdown
Create a TODO list for all steps. Mark each in-progress before starting,
completed immediately after finishing. Read the TODO list before each step.
```

### 3. Verify-Before-Proceed Gates

After code changes:

```markdown
After ANY file edit, run compilation check. Do not proceed until zero errors.
```

After test changes:

```markdown
After test modifications, run the test suite. Do not proceed until all pass.
```

### 4. Loop-Until-Green Pattern

```markdown
If compilation or tests fail, fix the issue and retry. Maximum 5 iterations.
If still failing after 5 attempts, stop and report the blocking issue.
```

### 5. Summary Generation

Every procedural prompt ends with:

```markdown
## Summary

After completing all steps, generate a summary:
- Files changed (with line counts)
- Verifications passed (compile, test, lint)
- Issues encountered and resolutions
- Anything requiring manual attention
```

## Interactive Prompt Requirements

- Ask clarifying questions BEFORE starting work
- Present options with clear trade-offs
- Confirm destructive actions
- Can use `mode: agent` with appropriate tools

## Declarative Prompt Requirements

- No execution steps — only context and rules
- Keep body concise (guidelines, not procedures)
- Use `agent:` frontmatter to route to the right persona

## Frontmatter Reference

```yaml
---
description: "Brief description of what this prompt does"     # Required
application: "When to use this prompt"                         # Required
mode: agent                                                    # For tool-using prompts
agent: Alex                                                    # Routes to specific agent
model: claude-opus-4-6                                         # For procedural prompts
tools: ['search', 'codebase', 'terminal']                     # Tool restrictions
currency: 2026-04-21                                           # Last review date
---
```

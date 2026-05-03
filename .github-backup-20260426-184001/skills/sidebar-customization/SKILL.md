---
name: "sidebar-customization"
description: "Customize the Alex sidebar — Loop tab buttons, Autopilot tasks, and project-specific workflows"
tier: standard
applyTo: '**/.github/config/loop-menu.json,**/.github/config/scheduled-tasks.json,**/*sidebar*config*'
---

# Sidebar Customization

Customize the Alex sidebar tabs for your project — add buttons, create scheduled tasks, and tailor workflows to your team's needs.

## Quick Reference

| Tab | Config File | What It Controls |
|-----|-------------|------------------|
| **Loop** | `.github/config/loop-menu.json` | Workflow buttons, creative loop phases |
| **Autopilot** | `.github/config/scheduled-tasks.json` | Scheduled automation tasks |
| **Setup** | Built-in | No customization (core Alex features) |

---

## Loop Tab Customization

The Loop tab displays workflow buttons organized into collapsible groups. Everything is config-driven.

### Config Location

```
.github/config/loop-menu.json
```

### Minimal Example

```json
{
  "$schema": "../../../heir/.github/config/loop-config.schema.json",
  "version": "1.0",
  "projectType": "generic",
  "projectPhase": "active-development",
  "groups": [
    {
      "id": "my-workflows",
      "label": "My Workflows",
      "icon": "rocket",
      "collapsed": false,
      "buttons": [
        {
          "icon": "lightbulb",
          "label": "Brainstorm",
          "command": "openChat",
          "prompt": "Help me brainstorm ideas for this feature"
        }
      ]
    }
  ]
}
```

### Group Schema

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier (lowercase, hyphens) |
| `label` | Yes | Display text in sidebar |
| `icon` | No | Codicon name (e.g., `rocket`, `tools`, `beaker`) |
| `accent` | No | CSS hex color for accent bar (e.g., `#14b8a6`) |
| `collapsed` | No | Start collapsed? Default: `true` |
| `phase` | No | Array of phases when visible: `planning`, `active-development`, `testing`, `release`, `maintenance` |
| `buttons` | Yes | Array of button definitions |

### Button Schema

| Field | Required | Description |
|-------|----------|-------------|
| `icon` | Yes | Codicon name |
| `label` | Yes | Button text |
| `command` | Yes | Action type: `openChat`, `openExternal`, `runCommand` |
| `prompt` | No | Inline prompt text for `openChat` |
| `promptFile` | No | Path to `.prompt.md` file (overrides `prompt`) |
| `file` | No | URL or path for `openExternal`/`runCommand` |
| `tooltip` | No | Hover text |
| `phase` | No | Phases when visible |

### Command Types

| Command | Behavior |
|---------|----------|
| `openChat` | Opens Copilot Chat with the prompt |
| `openExternal` | Opens URL in browser or file in VS Code |
| `runCommand` | Executes a VS Code command |

### Using Prompt Files

For complex prompts, use external `.prompt.md` files:

```json
{
  "icon": "beaker",
  "label": "Run Tests",
  "command": "openChat",
  "promptFile": "test.prompt.md"
}
```

The file is loaded from `.github/prompts/loop/{promptFile}`.

### Phase-Based Visibility

Show buttons only during specific project phases:

```json
{
  "icon": "rocket",
  "label": "Release",
  "command": "openChat",
  "prompt": "@alex /release",
  "phase": ["testing", "release"]
}
```

### Live Reload

The sidebar watches `loop-menu.json` for changes. Save the file and buttons update immediately — no reload needed.

---

## Autopilot Tab Customization

The Autopilot tab manages scheduled tasks that run via GitHub Actions. You can create tasks that run daily, weekly, or on custom cron schedules.

### Prerequisites

| Requirement | Agent Mode | Direct Mode |
|-------------|-----------|-------------|
| GitHub Actions enabled | Yes | Yes |
| Copilot enabled on repo | Yes | No |
| `COPILOT_PAT` secret | Yes | No |

**Setting up COPILOT_PAT** (required for agent tasks):

1. Go to [GitHub Settings → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Generate new token with permissions: Issues (R/W), Pull requests (R/W), Contents (R/W)
3. In your repo: **Settings → Secrets → Actions → New secret**
4. Name: `COPILOT_PAT`, Value: your token

### Config Location

```
.github/config/scheduled-tasks.json
```

### Execution Modes

| Mode | How It Works | Best For |
|------|--------------|----------|
| **agent** | Creates GitHub issue → Copilot reads it → Copilot opens PR | Creative tasks (writing, analysis, reviews) |
| **direct** | Runs script → Commits to branch → Opens PR | Mechanical tasks (audits, linting, builds) |

---

## Creating Your First Autopilot Task

### Option 1: Use the Wizard (Recommended)

1. Open the Alex sidebar → **Autopilot** tab
2. Click **Add Task**
3. Follow the 5-step wizard:
   - Name: "Weekly Summary"
   - Description: "Generate a weekly project summary"
   - Mode: Cloud Agent
   - Schedule: Weekly Monday
   - Skill: (none)
4. The wizard creates:
   - Entry in `scheduled-tasks.json` (starts **disabled**)
   - Prompt template at `.github/config/scheduled-tasks/weekly-summary.md`
5. Edit the prompt template to customize instructions
6. Enable the task (click play button on card)
7. Click **Generate Workflows**
8. Commit and push the generated `.github/workflows/scheduled-*.yml`

### Option 2: Edit JSON Directly

Add to `.github/config/scheduled-tasks.json`:

```json
{
  "version": "1.0",
  "tasks": [
    {
      "id": "weekly-summary",
      "name": "Weekly Summary",
      "description": "Generate a weekly project summary",
      "enabled": false,
      "mode": "agent",
      "schedule": "0 8 * * 1",
      "promptFile": ".github/config/scheduled-tasks/weekly-summary.md",
      "target": "docs/summaries"
    }
  ]
}
```

Create the prompt template, enable, generate workflows, commit, push.

---

## Task Configuration

### Full Task Schema

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier (lowercase, hyphens) — used in workflow filename |
| `name` | Yes | Display name in sidebar |
| `description` | Yes | What the task does |
| `enabled` | Yes | Toggle on/off (`true`/`false`) |
| `mode` | Yes | `"agent"` or `"direct"` |
| `schedule` | Yes | Cron expression (5 fields) |
| `promptFile` | Agent only | Path to prompt template |
| `muscle` | Direct only | Path to script (`.cjs` or `.js`) |
| `muscleArgs` | Direct only | Array of arguments for script |
| `skill` | No | Associated skill name |
| `target` | No | Output directory (shown as badge) |

### Schedule Presets

| Cron | When |
|------|------|
| `0 * * * *` | Every hour |
| `0 */6 * * *` | Every 6 hours |
| `0 8 * * *` | Daily 8 AM UTC |
| `0 8 * * 1-5` | Weekdays 8 AM UTC |
| `0 8 * * 1` | Mondays 8 AM UTC |
| `0 8 1 * *` | 1st of month 8 AM UTC |

**Note:** GitHub Actions uses UTC. Factor in your timezone.

---

## Writing Prompt Templates

Prompt templates are markdown files that become the issue body for agent tasks. Copilot reads them as instructions.

### Template Location

```
.github/config/scheduled-tasks/{task-id}.md
```

### Template Structure

```markdown
# Task Name

## Task

One-paragraph description of what to accomplish.

## Instructions

1. Step-by-step procedure
2. Be specific about file paths and commands
3. Specify exactly where to save output
4. Say how to name the PR

## Quality Standards

- What "done right" looks like
- Style guidelines
- Constraints

## Context

- Relevant files: `src/`, `docs/`
- Conventions to follow
```

### Tips for Better Templates

- **Be specific.** "Write a summary" is vague. "Write a 300-500 word summary saved to `docs/weekly/YYYY-MM-DD.md`" is actionable.
- **Include file paths.** Copilot needs to know where to read and write.
- **Set boundaries.** "Do not modify files outside `docs/`" prevents scope creep.
- **Specify the PR title.** "Create a PR titled `docs: weekly summary YYYY-MM-DD`" gives clear output.

### Example: Weekly Changelog Prompt

```markdown
# Weekly Changelog

## Task

Generate a changelog entry from PRs merged this week.

## Instructions

1. List merged PRs since last Monday using git log
2. Group by category: Features, Fixes, Maintenance
3. Write entry in Keep a Changelog format
4. Append to CHANGELOG.md under [Unreleased]
5. Create PR titled "docs: weekly changelog YYYY-MM-DD"

## Quality Standards

- Use present tense ("Add feature" not "Added feature")
- Include PR numbers as links
- Skip dependabot/automated PRs

## Context

- Follow existing CHANGELOG.md format
- Reference: https://keepachangelog.com
```

---

## Creating Direct Tasks

Direct tasks run scripts instead of prompting Copilot. Best for deterministic, mechanical work.

### Step 1: Create the Script

Create `.github/muscles/my-audit.cjs`:

```javascript
#!/usr/bin/env node
const fs = require("fs");

// Your audit logic here
const report = `# Audit Report — ${new Date().toISOString().slice(0, 10)}

- Checked: 42 files
- Issues: 3
`;

fs.writeFileSync("docs/audit-report.md", report, "utf-8");
console.log("Audit complete.");
```

### Step 2: Add the Task

```json
{
  "id": "daily-audit",
  "name": "Daily Audit",
  "description": "Run daily code audit",
  "enabled": false,
  "mode": "direct",
  "schedule": "0 8 * * *",
  "muscle": ".github/muscles/my-audit.cjs",
  "target": "docs/"
}
```

### Step 3: Enable, Generate, Push

1. Enable the task in the Autopilot tab
2. Click **Generate Workflows**
3. Commit and push

---

## Example Tasks

### Blog Writer (Agent)

```json
{
  "id": "blog-writer",
  "name": "Blog Writer",
  "description": "Write blog posts from recent commits",
  "enabled": true,
  "mode": "agent",
  "schedule": "0 */6 * * *",
  "promptFile": ".github/config/scheduled-tasks/blog-writer.md",
  "skill": "blog-writer",
  "target": "blog/"
}
```

### Documentation Lint (Direct)

```json
{
  "id": "doc-lint",
  "name": "Documentation Lint",
  "description": "Lint markdown docs weekly",
  "enabled": true,
  "mode": "direct",
  "schedule": "0 8 * * 1",
  "muscle": ".github/muscles/lint-docs.cjs",
  "target": "docs/"
}
```

### Dependency Check (Direct)

```json
{
  "id": "dep-check",
  "name": "Dependency Check",
  "description": "Run npm audit weekly",
  "enabled": true,
  "mode": "direct",
  "schedule": "0 9 * * 1",
  "muscle": ".github/muscles/dependency-check.cjs",
  "target": "docs/security/"
}
```

---

## Generating and Deploying Workflows

### Generate from Sidebar

1. Click **Generate Workflows** in the Autopilot tab
2. Review generated files in `.github/workflows/scheduled-*.yml`
3. Commit and push

### Generate from Terminal

```bash
node .github/muscles/generate-scheduled-workflows.cjs
```

Preview without writing:

```bash
node .github/muscles/generate-scheduled-workflows.cjs --dry-run
```

### What Gets Generated

For each **enabled** task, a workflow file at `.github/workflows/scheduled-{id}.yml`:

- **Agent mode**: Checks for duplicate issues, creates issue assigned to Copilot, labels it `automated`
- **Direct mode**: Runs script, commits changes to branch, opens PR labeled `automated`
- **Both modes**: Include `workflow_dispatch` for manual triggering

### After Pushing

1. Go to your repo → **Actions** tab
2. Find the workflow (e.g., "Scheduled: Weekly Summary")
3. Click **Run workflow** to test manually
4. The cron schedule takes over after that

---

## Common Customization Patterns

### Add a Project-Specific Button Group

```json
{
  "id": "health-research",
  "label": "Health Research",
  "icon": "heart",
  "accent": "#ef4444",
  "collapsed": false,
  "source": "type",
  "buttons": [
    {
      "icon": "search",
      "label": "Literature Search",
      "command": "openChat",
      "prompt": "@Health Researcher Search for recent studies on {topic}"
    },
    {
      "icon": "note",
      "label": "Summarize Paper",
      "command": "openChat",
      "promptFile": "summarize-paper.prompt.md"
    }
  ]
}
```

### Add a Daily Automation

```json
{
  "id": "daily-standup",
  "name": "Daily Standup",
  "description": "Generate standup notes from recent commits",
  "enabled": true,
  "mode": "agent",
  "schedule": "0 9 * * 1-5",
  "promptFile": ".github/config/scheduled-tasks/daily-standup.md"
}
```

### Use Agent Routing in Buttons

Route to specific Alex agents:

```json
{
  "icon": "beaker",
  "label": "Test Plan",
  "command": "openChat",
  "prompt": "@Validator Create a test plan for the current feature"
}
```

Available agents: `@Alex`, `@Builder`, `@Researcher`, `@Validator`, `@Planner`, `@Documentarian`, `@Presenter`, `@Frontend`, `@Backend`, `@Infrastructure`, etc.

---

## Signal-Driven Autopilots

Beyond cron-based scheduling, autopilots can react to **signals** from your application — user behavior, search patterns, error rates, or any metric worth tracking.

### The Two-Phase Pattern

SessionStart hooks have a 5-second timeout and run synchronously. Network calls to external services (Azure Table Storage, APIs, databases) are unreliable within this window. The solution is two-phase execution:

| Phase | Component | Timing | What It Does |
|-------|-----------|--------|---------------|
| **1. Collect** | Scheduled task | Daily/hourly | Queries signal source, writes local cache |
| **2. Surface** | SessionStart hook | Every session | Reads local cache, surfaces suggestions |

This separation keeps hooks fast (local file read) while still enabling external signal sources.

### Step 1: Design Your Signal Schema

Signals are events worth tracking. Define what you're capturing:

```javascript
// Example: Search quality signals
{
  "partitionKey": "2026-04-19",
  "rowKey": "2026-04-19T10:30:00Z-x7k2",
  "type": "search",
  "query": "testosterone guidelines",
  "sourceCount": 2,           // Poor results signal
  "topScore": 0.42,           // Low relevance signal
  "userId": "user@example.com",
  "timestamp": "2026-04-19T10:30:00Z"
}
```

Common signal types:

| Signal | Trigger | Autopilot Action |
|--------|---------|------------------|
| Poor search results | `sourceCount < 3` or `topScore < 0.5` | Research and add content |
| Repeated queries | Same query 3+ times/week | Deep dive on topic |
| Question patterns | Detected question marks | FAQ generation |
| Error spikes | Error rate > threshold | Incident investigation |
| Stale content | No updates > 30 days | Content refresh |

### Step 2: Log Signals from Your Application

Your app writes signals to a queryable store. This happens in your application code, not in Alex:

```javascript
// Example: Azure Table Storage logging (in your app)
async function logSearchSignal(query, results, userId) {
  await tableClient.createEntity({
    partitionKey: new Date().toISOString().slice(0, 10),
    rowKey: `${new Date().toISOString()}-${randomId()}`,
    type: "search",
    query,
    sourceCount: results.length,
    topScore: results[0]?.score || 0,
    userId,
  });
}
```

Signal sources can be:
- Azure Table Storage
- SQLite database
- JSON log files
- API endpoints
- Application Insights
- Any queryable store

### Step 3: Create a Signal Collector Task

A scheduled direct task queries the signal source and writes a local cache:

**Task definition** (`.github/config/scheduled-tasks.json`):

```json
{
  "id": "signal-collector",
  "name": "Signal Collector",
  "description": "Collect signals for session advisor",
  "enabled": true,
  "mode": "direct",
  "schedule": "0 6 * * *",
  "muscle": ".github/muscles/collect-signals.cjs"
}
```

**Collector script** (`.github/muscles/collect-signals.cjs`):

```javascript
#!/usr/bin/env node
/**
 * Signal Collector — Queries signal source, writes local cache
 * Runs daily via scheduled task.
 */
const fs = require("fs");
const path = require("path");

// TODO: Replace with your signal source
async function querySignals() {
  // Example: Azure Table Storage, API call, database query
  // Return array of signal objects
  return [
    { query: "testosterone guidelines", count: 5, avgScore: 0.38 },
    { query: "sleep apnea treatment", count: 3, avgScore: 0.45 },
  ];
}

async function main() {
  const signals = await querySignals();
  
  // Filter to actionable signals
  const suggestions = signals
    .filter(s => s.avgScore < 0.5 || s.count >= 3)
    .map(s => ({
      topic: s.query,
      reason: s.avgScore < 0.5 ? "poor-results" : "repeated-query",
      action: `Research and improve content for: ${s.query}`,
    }));
  
  // Write cache for session hook
  const cacheDir = path.join(__dirname, "..", "signals");
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(
    path.join(cacheDir, "suggestions.json"),
    JSON.stringify({ updated: new Date().toISOString(), suggestions }, null, 2)
  );
  
  console.log(`Collected ${suggestions.length} actionable signals.`);
}

main().catch(console.error);
```

### Step 4: Create a Session Advisor Hook

A SessionStart hook reads the cache and surfaces suggestions:

**Hook** (`.github/muscles/hooks/signal-advisor.cjs`):

```javascript
#!/usr/bin/env node
/**
 * Signal Advisor — Reads signal cache, surfaces suggestions at session start.
 * Timeout: 5 seconds. Must be fast — local file read only.
 */
const fs = require("fs");
const path = require("path");

let input = {};
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
} catch { /* no stdin */ }

const workspaceRoot = input.cwd || path.resolve(__dirname, "../../..");
const cacheFile = path.join(workspaceRoot, ".github", "signals", "suggestions.json");

let context = "";

try {
  if (fs.existsSync(cacheFile)) {
    const cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
    const age = Date.now() - new Date(cache.updated).getTime();
    const maxAge = 48 * 60 * 60 * 1000; // 48 hours
    
    if (age < maxAge && cache.suggestions?.length > 0) {
      context = `\n## Suggested Actions\n\n`;
      context += `Based on recent activity, consider:\n\n`;
      for (const s of cache.suggestions.slice(0, 3)) {
        context += `- **${s.topic}**: ${s.action} (${s.reason})\n`;
      }
      context += `\nSay "research [topic]" to start.\n`;
    }
  }
} catch { /* ignore errors */ }

const output = {
  hookSpecificOutput: {
    additionalContext: context,
  },
};

console.log(JSON.stringify(output));
```

**Register the hook** (`.github/hooks.json`):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .github/muscles/hooks/signal-advisor.cjs",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

### Step 5: Create Autopilot Tasks for Actions

When a suggestion is acted on, route to a dedicated autopilot:

```json
{
  "id": "research-writer",
  "name": "Research Writer",
  "description": "Research and write content for a topic",
  "enabled": true,
  "mode": "agent",
  "schedule": "workflow_dispatch",
  "promptFile": ".github/config/scheduled-tasks/research-writer.md"
}
```

The user triggers it manually via the Autopilot tab or by asking Alex.

### Architecture Summary

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Application   │────▶│  Signal Source   │────▶│  Collector Task │
│  (your code)    │     │ (Table Storage,  │     │  (daily cron)   │
│                 │     │  API, logs, etc) │     │                 │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Session Start  │◀────│  Local Cache     │◀────│  suggestions.   │
│  Hook (fast)    │     │  (.github/       │     │  json           │
│                 │     │   signals/)      │     │                 │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  User sees      │────▶│  Autopilot Task  │
│  suggestions    │     │  (on demand)     │
│                 │     │                  │
└─────────────────┘     └──────────────────┘
```

### Tips

- **Keep cache fresh**: Run collector more frequently than cache expiry (e.g., daily collector, 48h expiry)
- **Limit suggestions**: Show 3-5 max to avoid overwhelming users
- **Include reason**: "poor-results" vs "repeated-query" helps users prioritize
- **Graceful degradation**: Hook must handle missing/corrupt cache silently
- **Don't block**: Collector failures shouldn't break the app; hook failures shouldn't block sessions

---

## Limitations

### What You CAN Customize

- Loop tab button groups, labels, icons, prompts
- Autopilot scheduled tasks and their prompts
- Button visibility by project phase
- Group ordering and collapse state

### What You CANNOT Customize

- VS Code Copilot's `@` agent dropdown (built-in feature)
- Setup tab contents (core Alex features)
- Health Pulse display format
- Creative Loop button order (always 1-6)

To hide agents from the `@` dropdown, delete or rename their `.github/agents/*.agent.md` files.

---

## Troubleshooting

### Loop Tab Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Buttons don't appear | Invalid JSON | Check for syntax errors, validate against schema |
| Changes not showing | File not saved | Save `loop-menu.json` |
| Wrong icon | Typo in codicon name | Check [codicon reference](https://microsoft.github.io/vscode-codicons/dist/codicon.html) |

### Autopilot Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Workflow not running | Not committed/pushed | Commit `.github/workflows/scheduled-*.yml` and push |
| Agent task creates issue but Copilot doesn't respond | Missing `COPILOT_PAT` secret | Add secret in repo Settings → Secrets → Actions |
| Agent task creates issue but Copilot doesn't respond | Copilot not enabled | Enable Copilot for repo in Settings → Copilot |
| Direct task fails | Script error | Check workflow run logs in GitHub Actions |
| Duplicate issues created | Issue already open | The workflow checks for duplicates; close stale issues |
| Wrong schedule time | Timezone mismatch | Cron uses UTC; adjust for your timezone |

### Validate Config

The schema is at `.github/config/loop-config.schema.json`. Most editors provide validation when `$schema` is set:

```json
{
  "$schema": "./../loop-config.schema.json",
  ...
}
```

For scheduled tasks, use `.github/config/scheduled-tasks.schema.json`.

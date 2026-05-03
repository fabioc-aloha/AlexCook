---
type: skill
lifecycle: stable
inheritance: inheritable
name: "welcome-experience-customization"
description: "Orchestrate full welcome experience customization — loop menu, taglines, identity, North Star, and persona in one guided workflow"
tier: standard
category: heir-management
applyTo: '**/*welcome*custom*,**/*customize*welcome*,**/*onboard*,**/.github/config/loop-menu.json,**/.github/config/taglines.json'
triggers: ["customize welcome", "personalize sidebar", "onboard project", "customize experience", "welcome setup", "customize loop menu", "customize taglines"]
currency: 2026-04-22
---

# Welcome Experience Customization

> One-pass orchestrated customization of the entire Alex welcome experience — loop menu, taglines, identity, North Star, and persona.

Unifies what was previously fragmented across 4 separate skills (`sidebar-customization`, `project-taglines`, `identity-customization`, `north-star`) into a single guided workflow that detects project context and generates all config files coherently.

---

## When to Use

- New heir project initialization (after `alex.initialize`)
- Rebranding or pivoting an existing project
- During meditation when customization surfaces as a consolidation target
- When the sidebar feels generic and doesn't reflect the project's domain
- When switching project phases (planning → active-development → release)

---

## Quick Reference

| Surface | Config File | What It Controls |
|---------|-------------|------------------|
| **Loop Menu** | `.github/config/loop-menu.json` | Workflow buttons, groups, phase filtering |
| **Taglines** | `.github/config/taglines.json` | Rotating banner messages |
| **Identity** | `.github/copilot-instructions.md` | Persona, tone, domain voice |
| **North Star** | `.github/NORTH-STAR.md` | Vision document, Active Context |
| **Cognitive Config** | `.github/config/cognitive-config.json` | Specializations, debug settings |
| **Skill Partials** | `loop-config.partial.json` (in skills) | Skills injecting Loop tab buttons |

### Automatic Systems (no config needed)

| System | Behavior |
|--------|----------|
| **Frecency** | Reorders buttons by usage history (7-day half-life) |
| **Health Taglines** | Selects pool based on brain health status |
| **Persona Detection** | Sets accent colors from workspace heuristics |
| **Phase Filtering** | Shows/hides groups based on `projectPhase` |

---

## Orchestrated Customization Workflow

### Step 1: Detect Project Context

Read these sources to understand the project:

| Source | What to extract |
|--------|----------------|
| `package.json` / `pyproject.toml` / `*.csproj` | Name, description, stack |
| `.github/copilot-instructions.md` | Current identity, persona, North Star |
| `README.md` | Project purpose, audience |
| `.github/config/loop-menu.json` | Current loop config (if exists) |
| `.github/config/taglines.json` | Current taglines (if exists) |
| `.github/NORTH-STAR.md` | Vision (if exists) |
| Workspace file structure | Dominant technology, project type |

### Step 2: Classify Project Type

| Type | Signals | Recommended Template |
|------|---------|---------------------|
| **Web App** | React/Vue/Angular, `src/components/` | Frontend-focused loop + UI taglines |
| **API/Backend** | FastAPI/Express/ASP.NET, `src/routes/` | Backend loop + architecture taglines |
| **Data Pipeline** | PySpark/Fabric/notebooks, `*.ipynb` | Data loop + analytics taglines |
| **Infrastructure** | Bicep/Terraform, `infra/` | IaC loop + cloud taglines |
| **Research** | Papers, datasets, `research/` | Research loop + discovery taglines |
| **Content/Docs** | Markdown-heavy, `docs/`, wiki | Content loop + writing taglines |
| **Extension/Plugin** | `package.json` with `contributes`, `src/extension.ts` | Extension loop + developer taglines |
| **Mixed/Monorepo** | Multiple project types | Composite loop with phase filtering |

### Step 3: Generate Config Files

Generate all files in sequence, ensuring cross-references are consistent:

#### 3a. North Star (`.github/NORTH-STAR.md`)

```markdown
# North Star: [Project Name]

> [One-sentence ambitious vision]

## What This Means

[2-3 sentences expanding the vision into concrete outcomes]

## Guiding Principles

1. [Principle derived from project domain]
2. [Principle derived from team values]
3. [Principle derived from user needs]
```

#### 3b. Identity (`copilot-instructions.md`)

Update the identity layer only (preserve Safety + Routing sections):

```markdown
## Identity

[First-person domain voice, 1-3 sentences]

## Active Context

Persona: [detected or chosen persona]
Objective: [from North Star]
Tone: [project-appropriate: Direct/Friendly/Formal/Technical]
Focus: [comma-separated domain keywords]
Principles: KISS, DRY, Quality-First
North Star: [vision one-liner from NORTH-STAR.md]
```

#### 3c. Taglines (`taglines.json`)

```json
{
  "version": "1.0",
  "project": "[Project Name]",
  "taglines": {
    "project": ["[8-12 identity taglines, 5-60 chars each]"],
    "vision": ["[4-6 North Star-derived taglines]"],
    "collaboration": ["[4-6 partnership taglines]"]
  },
  "rotation": {
    "strategy": "balanced",
    "projectWeight": 50,
    "inspirationalWeight": 50
  }
}
```

**Tagline quality rules:**

- 5-60 characters per tagline
- No generic filler ("We do great things")
- Each tagline should be recognizable as *this* project
- Vision taglines derive from North Star document
- Collaboration taglines reflect the team dynamic

#### 3d. Loop Menu (`loop-menu.json`)

```json
{
  "$schema": "../../../heir/.github/config/loop-config.schema.json",
  "version": "1.0",
  "projectType": "[detected type]",
  "projectPhase": "[current phase]",
  "groups": [
    {
      "id": "creative-loop",
      "label": "[Project] Creative Loop",
      "icon": "lightbulb",
      "collapsed": false,
      "buttons": ["[phase-appropriate workflow buttons]"]
    },
    {
      "id": "[domain]-helpers",
      "label": "[DOMAIN] HELPERS",
      "icon": "[domain-icon]",
      "collapsed": true,
      "buttons": ["[domain-specific quick actions]"]
    }
  ]
}
```

**Loop menu rules:**

- Creative loop group always first (Ideate → Plan → Build → Test → Release → Improve)
- Domain helpers second, collapsed by default
- Use `phase` arrays to show/hide buttons per project phase
- Use `promptFile` for prompts longer than one sentence
- Max 6 buttons per group for scannability

### Step 4: Validate Coherence

Cross-check all generated files:

| Check | Rule |
|-------|------|
| North Star ↔ Identity | `North Star:` field in CI matches NORTH-STAR.md vision |
| North Star ↔ Taglines | Vision taglines derive from NORTH-STAR.md |
| Identity ↔ Taglines | Project taglines match the persona voice |
| Identity ↔ Loop Menu | `projectType` in loop menu matches persona domain |
| Loop Menu ↔ Phase | `projectPhase` matches current reality |

---

## Project-Type Templates

### Web App Template

**Loop groups:** Creative Loop, UI/UX, Components, Testing, Deploy
**Taglines:** "Pixel-perfect experiences", "Components that compose", "Ship with confidence"
**Persona:** Developer or Frontend
**Phase default:** active-development

### API/Backend Template

**Loop groups:** Creative Loop, API Design, Data Layer, Testing, Deploy
**Taglines:** "APIs developers love", "Contracts before code", "Reliable at scale"
**Persona:** Developer or Architect
**Phase default:** active-development

### Data Pipeline Template

**Loop groups:** Creative Loop, Ingest, Transform, Quality, Publish
**Taglines:** "Data you can trust", "From raw to refined", "Insights at scale"
**Persona:** Data-Engineer
**Phase default:** active-development

### Infrastructure Template

**Loop groups:** Creative Loop, Provision, Configure, Monitor, Govern
**Taglines:** "Infrastructure as intention", "Repeatable by design", "Cloud-native governance"
**Persona:** DevOps or Architect
**Phase default:** planning

### Research Template

**Loop groups:** Creative Loop, Literature, Method, Analysis, Writing
**Taglines:** "Evidence before opinion", "Rigor meets curiosity", "Discovery through method"
**Persona:** Researcher or Academic
**Phase default:** planning

---

## Skill Partial Authoring

Skills can inject buttons into the Loop tab via `loop-config.partial.json`:

```json
// .github/skills/my-skill/loop-config.partial.json
{
  "group": "domain-helpers",
  "buttons": [
    {
      "icon": "beaker",
      "label": "Run My Skill",
      "command": "openChat",
      "prompt": "Use the my-skill workflow to..."
    }
  ]
}
```

Partials are merged into the Loop tab at load time by `loopMenu.ts`.

---

## Phase Lifecycle

Update `projectPhase` in `loop-menu.json` as the project evolves:

| Phase | When | Visible Groups |
|-------|------|---------------|
| `planning` | Greenfield, requirements gathering | Ideate, Plan, Research |
| `active-development` | Building features | Full creative loop, domain helpers |
| `testing` | Stabilization, QA | Test, Review, Fix |
| `release` | Preparing for ship | Release, Deploy, Docs |
| `maintenance` | Post-launch | Monitor, Improve, Support |

---

## Integration with Meditation

During meditation sessions, the welcome experience is a natural consolidation target:

1. **Review**: What workflows did I actually use? (check frecency data)
2. **Relate**: Do the taglines still reflect where the project is?
3. **Reinforce**: Should any loop menu groups be added/removed/reordered?
4. **Record**: Update configs to match current project reality

Meditation prompt addition:

> "Review the welcome experience — are the loop menu, taglines, and identity still aligned with the project's current phase and direction? Update any that have drifted."

---

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Generic taglines | "Building great software" | Derive from North Star and domain |
| Too many loop groups | Cognitive overload, scroll fatigue | Max 4-5 groups, use phase filtering |
| Identity copy-paste | Same CI across all projects | Customize identity layer per project |
| Stale phase | `projectPhase: planning` on a shipped product | Update phase during meditation |
| Ignoring frecency | Manually reordering buttons | Let frecency handle it; use `collapsed` for priority |

---

## Checklist

- [ ] Project context detected (type, stack, phase)
- [ ] North Star created or updated
- [ ] Identity layer customized (persona, tone, North Star reference)
- [ ] Taglines generated (8-12 project, 4-6 vision, 4-6 collaboration)
- [ ] Loop menu configured (creative loop + domain helpers)
- [ ] Phase set correctly in loop-menu.json
- [ ] Cross-reference validation passed
- [ ] All configs committed to `.github/config/`

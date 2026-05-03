---
name: "project-taglines"
description: "Generate and configure project-specific taglines for the Alex sidebar banner"
tier: standard
applyTo: '**/*tagline*,**/.github/config/taglines.json'
disable-model-invocation: false
---

# Project Taglines Skill

Generate compelling, project-specific taglines that appear in the Alex sidebar banner. Taglines rotate daily, mixing project-specific content with inspirational defaults.

## Quick Reference

| Aspect | Details |
|--------|---------|
| Config location | `.github/config/taglines.json` |
| Categories | `project`, `vision`, `collaboration` (+ custom) |
| Rotation | 50% project-specific, 50% inspirational (configurable) |
| Character limit | 5-60 characters per tagline |
| Minimum count | 3 per category (recommended 8-12) |

## Configuration Schema

```json
{
  "version": "1.0",
  "project": "Project Name",
  "taglines": {
    "project": ["Identity-focused taglines"],
    "vision": ["North Star / goal-focused"],
    "collaboration": ["Partnership-focused"]
  },
  "rotation": {
    "strategy": "balanced",
    "projectWeight": 50,
    "inspirationalWeight": 50
  }
}
```

## Tagline Categories

### Project Category (Required)

What makes this project unique. Answers: *What is this?*

```json
"project": [
  "The brain that builds brains",      // Identity
  "Cognitive architecture, evolved",   // Purpose
  "Where skills become superpowers"    // Value proposition
]
```

### Vision Category (Optional)

North Star and aspirations. Answers: *Where is this going?*

```json
"vision": [
  "Every heir inherits excellence",
  "Building the most trusted AI partner"
]
```

### Collaboration Category (Optional)

Human-AI partnership. Answers: *How do we work together?*

```json
"collaboration": [
  "Your thoughts, amplified",
  "We grow smarter together"
]
```

### Custom Categories

Add domain-specific categories as needed:

```json
"taglines": {
  "project": [...],
  "deployment": [
    "Ship with confidence",
    "From code to cloud"
  ],
  "learning": [
    "Every session, sharper",
    "Knowledge compounds daily"
  ]
}
```

## Writing Effective Taglines

### Principles

1. **Brevity wins**: 4-8 words ideal, never exceed 60 chars
2. **Active voice**: "Building futures" not "Futures are built"
3. **Present tense**: "We grow" not "We will grow"
4. **Confidence without arrogance**: Assertive, not boastful
5. **Partnership implied**: Human and AI together

### Good Examples

| ✓ Tagline | Why it works |
|-----------|--------------|
| "The brain that builds brains" | Identity + wordplay |
| "Every heir inherits excellence" | Vision + metaphor |
| "Your thoughts, amplified" | Partnership + benefit |
| "Ship with confidence" | Action + emotion |
| "Knowledge compounds daily" | Growth + specificity |

### Anti-Patterns

| ✗ Avoid | Why | Fix |
|---------|-----|-----|
| "We are the best AI extension ever created" | Arrogant, long | "Built for builders" |
| "An AI-powered development assistant" | Generic description | "Where code meets cognition" |
| "Using machine learning to help you code" | Technical, passive | "Learning how you think" |
| "!!!" or ALL CAPS | Noise | Remove |
| Questions as taglines | Passive | Reframe as statements |

## Rotation Behavior

The extension rotates taglines using these rules:

1. **Day-based seed**: `dayOfYear % totalTaglines` ensures daily change
2. **Category rotation**: Cycles through categories, then within each
3. **50/50 mix**: Half the days show project taglines, half show inspirational
4. **Health-aware**: Critical/attention states use different pools

```typescript
// Simplified rotation logic
const useProjectTagline = dayOfYear % 2 === 0;
if (useProjectTagline && projectTaglines.length > 0) {
  return selectFromProject(dayOfYear);
} else {
  return selectFromInspirational(dayOfYear);
}
```

## Checklist

When creating taglines for a project:

- [ ] Read the project's North Star (if exists)
- [ ] Identify 3 unique aspects of the project
- [ ] Write 8-12 project taglines (3 minimum)
- [ ] Add 3-5 vision taglines if North Star exists
- [ ] Add 3-5 collaboration taglines
- [ ] Verify all under 60 characters
- [ ] Remove any that feel generic
- [ ] Test by reading aloud — do they inspire?
- [ ] Save to `.github/config/taglines.json`
- [ ] Validate JSON syntax

## Extension Integration

The extension reads taglines via:

```typescript
// 1. Check for config
const configPath = path.join(workspaceRoot, ".github/config/taglines.json");
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  // Mix with inspirational based on rotation strategy
}

// 2. Fallback to inspirational defaults
return selectFromPool(HEALTHY_TAGLINES, date);
```

## Synergy with Other Features

- **Health Pulse**: Status affects which pool is primary
- **North Star**: Vision taglines reference the project's goals
- **Persona**: Collaboration taglines can mention user by name
- **Context**: Templates like `{project}` get filled from workspace

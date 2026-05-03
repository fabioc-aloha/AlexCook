---
mode: agent
description: "4-dimension gap analysis before implementation"
application: "Identify knowledge, tooling, architecture, and process gaps before building"
tools: ["read_file", "list_dir", "semantic_search", "grep_search"]
---

# Gap Analysis

Run 4-dimension gap analysis before implementation.

## The 4 Dimensions

| Dimension | Code | Question |
|-----------|------|----------|
| **Skills** | GA-S | Does Alex know the *patterns*? |
| **Instructions** | GA-I | Does Alex know the *procedures*? |
| **Agents** | GA-A | Does Alex have the right *roles*? |
| **Prompts** | GA-P | Does Alex have the right *workflows*? |

## Process

### 1. Define the Implementation

What are we trying to build? What domains does it touch?

### 2. Scan Existing Knowledge

For each dimension, search for relevant files:

```
.github/skills/           → GA-S (Skills)
.github/instructions/     → GA-I (Instructions)
.github/agents/           → GA-A (Agents)
.github/prompts/          → GA-P (Prompts)
```

### 3. Score Each Dimension

| Score | Meaning |
|-------|---------|
| 90-100% | Excellent coverage, ready to execute |
| 75-89% | Good coverage, minor gaps |
| 50-74% | Moderate gaps, create knowledge first |
| <50% | Major gaps, research sprint needed |

### 4. Gap Report

```
GAP ANALYSIS REPORT
===================
Project: [name]
Domain: [detected domain]

DIMENSION SCORES:
Skills (GA-S):       [score]% — [found]/[needed]
Instructions (GA-I): [score]% — [found]/[needed]
Agents (GA-A):       [score]% — [found]/[needed]
Prompts (GA-P):      [score]% — [found]/[needed]

GAPS IDENTIFIED:
- [ ] Missing skill: [name]
- [ ] Missing instruction: [name]
- [ ] Missing agent: [name]
- [ ] Missing prompt: [name]

RECOMMENDATION:
[READY / FILL GAPS / STOP]
```

## Thresholds

- **≥ 75%** all dimensions: **READY** — proceed to implementation
- **Any < 75%**: **FILL GAPS** — create missing knowledge first
- **Any < 50%**: **STOP** — research sprint needed before proceeding

What project or implementation phase should I analyze?

---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
description: "Academic literature review workflow"
application: "Search, synthesize, and organize academic papers and references"
tools: ["fetch_webpage", "create_file", "read_file"]
currency: 2026-04-22
---

# Literature Review

Academic literature review workflow.

## Process

### 1. Define Scope

- What's the research question?
- What time period? (last 5 years, seminal works, etc.)
- What fields/disciplines?
- How comprehensive? (survey vs. systematic review)

### 2. Search Strategy

```
Search Terms: [primary], [secondary], [exclusions]
Databases: Google Scholar, arXiv, domain-specific
Date Range: [start] - [end]
Citation Threshold: [minimum citations for inclusion]
```

### 3. Selection Criteria

| Criterion | Include | Exclude |
|-----------|---------|---------|
| Date | After [year] | Before [year] |
| Type | Peer-reviewed, preprints | Blog posts, news |
| Relevance | Direct to question | Tangential |
| Quality | Cited [n]+ times | Uncited |

### 4. Analysis

For each source:

```markdown
### [Title] ([Year])

**Authors**: [names]
**Venue**: [journal/conference]
**Citations**: [count]

**Main Contribution**:
[One sentence summary]

**Key Findings**:
- Finding 1
- Finding 2

**Methodology**:
[Brief description]

**Limitations**:
[What they didn't address]

**Relevance to Our Question**:
[How this informs our work]
```

### 5. Synthesis

- **Themes**: What patterns emerge across sources?
- **Gaps**: What hasn't been studied?
- **Contradictions**: Where do sources disagree?
- **Evolution**: How has thinking changed over time?

### 6. Output

```markdown
# Literature Review: [Topic]

## Research Question
[The question we're exploring]

## Summary of Findings
[Synthesized overview across all sources]

## Key Sources
| Source | Year | Contribution | Relevance |
|--------|------|--------------|-----------|

## Themes
1. Theme 1: [sources supporting]
2. Theme 2: [sources supporting]

## Research Gaps
- Gap 1 (no studies address...)
- Gap 2 (conflicting findings on...)

## Implications
[What this means for our work]

## References
[Formatted citations]
```

What topic should I review?

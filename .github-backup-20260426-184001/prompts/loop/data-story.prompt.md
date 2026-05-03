---
mode: agent
description: "Data → Analysis → Visualization → Narrative pipeline"
application: "Transform datasets into compelling data-driven narratives"
tools: ["read_file", "create_file", "run_in_terminal"]
---

# Data Story

Transform data into a compelling narrative.

## The Pipeline

```
Data → Profile → Analyze → Visualize → Narrate → Deliver
```

### 1. Data

- Load and validate the data
- Understand the structure
- Check quality (nulls, types, outliers)

### 2. Profile

- What dimensions exist?
- What's the grain? (one row = what?)
- What time periods?
- What populations/segments?

### 3. Analyze

- Find the patterns that matter
- Look for surprises (what's unexpected?)
- Compare against benchmarks or expectations
- Test hypotheses

### 4. Visualize

Match insight to chart type:

| Insight Type | Chart |
|--------------|-------|
| Trend over time | Line chart |
| Part of whole | Pie/donut, stacked bar |
| Distribution | Histogram, box plot |
| Correlation | Scatter plot |
| Comparison | Bar chart, grouped bar |
| Ranking | Horizontal bar, sorted |
| Composition | Stacked area |

### 5. Narrate

Every data story needs:

- **Setup**: What's the context? What question are we answering?
- **Conflict**: What tension did we discover? What's surprising?
- **Resolution**: What should we do about it?

#### The "So What?" Test

For every finding, ask: "So what?"

| Finding | So What? | Now What? |
|---------|----------|-----------|
| Raw fact | Why it matters | Action to take |

### 6. Deliver

Format for your audience:

| Audience | Format | Depth |
|----------|--------|-------|
| Executive | 1-pager | Key insight + action |
| Manager | 3-5 slides | Findings + recommendations |
| Analyst | Full report | Methodology + details |

## Output Structure

```markdown
# [Title]: [Headline Insight]

## The Question
[What we set out to learn]

## Key Findings

### Finding 1: [Headline]
[Chart]
**So What**: [interpretation]
**Now What**: [action]

### Finding 2: [Headline]
...

## The Story
[Setup → Conflict → Resolution narrative]

## Recommendations
1. [Action 1]
2. [Action 2]

## Appendix
[Methodology, data quality notes, detailed tables]
```

Share your data and the question you're trying to answer:

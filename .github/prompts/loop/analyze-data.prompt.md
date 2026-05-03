---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
description: "Systematic EDA that produces narrative insights, not just statistics"
application: "Exploratory data analysis, profiling, distributions, correlations, anomaly detection"
tools: ["read_file", "run_in_terminal", "create_file"]
currency: 2026-04-22
---

# Analyze Data

Systematic EDA that produces narrative insights, not just statistics.

## Workflow

### 1. You Provide

- Data source (file path, URL, or paste)
- Context: What domain? What question are you trying to answer?
- Audience: Who will consume the insights?

### 2. I Profile

First pass to understand the data:

- **Shape**: rows × columns
- **Types**: numeric, categorical, datetime, text
- **Quality**: nulls, duplicates, outliers
- **Cardinality**: unique values per column

### 3. I Explore

Statistical and visual exploration:

- **Distributions**: histograms, box plots
- **Correlations**: what moves together?
- **Segments**: natural groupings in the data
- **Anomalies**: outliers, unexpected patterns
- **Trends**: changes over time (if temporal)

### 4. I Translate

Each finding becomes a **"So What?"** insight:

| Pattern | So What? | Now What? |
|---------|----------|-----------|
| Sales spike in December | Seasonality drives revenue | Plan inventory for Q4 |
| 20% of customers = 80% of revenue | Pareto distribution | Focus retention on top tier |
| Churn correlates with support tickets | Poor support → lost customers | Improve support experience |

### 5. I Recommend

- **Narrative arc**: Setup → Conflict → Resolution
- **Chart types**: Best visualization for each insight
- **Actions**: What should someone do with this information?

## Output

```
DATA ANALYSIS REPORT
====================
Dataset: [name]
Records: [count]
Columns: [count]
Quality Score: [%]

KEY INSIGHTS:

1. [WHAT] Pattern observed
   [SO WHAT] Why it matters  
   [NOW WHAT] Recommended action

2. ...

SUGGESTED VISUALIZATIONS:
- Insight 1 → [chart type]
- Insight 2 → [chart type]

NARRATIVE ARC:
Setup: [context]
Conflict: [tension/problem revealed]
Resolution: [what to do about it]
```

Share your data and tell me the question you're trying to answer:

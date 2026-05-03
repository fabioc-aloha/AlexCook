---
mode: agent
description: "Documentation accuracy and drift audit"
application: "Audit docs for accuracy, completeness, staleness, and code drift"
tools: ["read_file", "grep_search", "list_dir", "semantic_search"]
---

# Documentation Audit

Audit documentation for accuracy, completeness, and drift.

## What I Check

### 1. Accuracy

- Do version numbers match actual code?
- Are command examples still valid?
- Do screenshots match current UI?
- Are code samples compilable?

### 2. Completeness

- Is the README comprehensive?
- Are all public APIs documented?
- Is there a getting started guide?
- Are error messages documented?

### 3. Consistency

- Same terminology throughout?
- Consistent formatting?
- Links resolve correctly?
- Cross-references accurate?

### 4. Freshness

- When was it last updated?
- Are "coming soon" items still pending?
- Do dates make sense?

## Drift Detection

Common drift patterns:

| Pattern | Example | Detection |
|---------|---------|-----------|
| **Version drift** | README says v2.0, package.json says v2.3 | Compare version strings |
| **Command drift** | `npm start` changed to `npm run dev` | Run documented commands |
| **API drift** | Documented param removed | Compare to code signatures |
| **Count drift** | "15 tests" but now 47 | Run tests, compare |
| **Date drift** | "Updated January 2024" but it's 2025 | Check file dates |

## Audit Report

```
DOCUMENTATION AUDIT REPORT
==========================
Project: [name]
Date: [date]
Files Audited: [count]

SUMMARY:
Total Issues: [count]
Critical: [count] | Major: [count] | Minor: [count]

FINDINGS:

### [File 1]

| Line | Severity | Issue | Fix |
|------|----------|-------|-----|
| [n] | Critical | [description] | [recommendation] |

### [File 2]
...

RECOMMENDATIONS:
1. [Priority fix]
2. [Second fix]

ACCURACY SCORE: [%]
```

## Severity Levels

| Severity | Definition | Example |
|----------|------------|---------|
| **Critical** | Will cause user failure | Wrong installation command |
| **Major** | Significant confusion | Outdated architecture diagram |
| **Minor** | Minor inaccuracy | Typo, minor version mismatch |

Run documentation audit on this project?

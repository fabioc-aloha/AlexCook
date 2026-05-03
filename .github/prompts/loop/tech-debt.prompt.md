---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
description: "Technical debt identification, categorization, and prioritization"
application: "Find TODOs, code smells, outdated deps, and prioritize payoff"
tools: ["read_file", "grep_search", "semantic_search", "list_dir"]
currency: 2026-04-22
---

# Technical Debt Audit

Identify, categorize, and prioritize technical debt.

## What I Look For

### 1. Explicit Markers

Code comments that signal debt:

```
TODO, FIXME, HACK, XXX, TEMP, KLUDGE
"workaround", "temporary", "quick fix"
```

### 2. Code Smells

- Long functions (>50 lines)
- Deep nesting (>3 levels)
- Duplicate code blocks
- God classes/modules
- Magic numbers/strings
- Dead code

### 3. Architecture Debt

- Circular dependencies
- Inappropriate coupling
- Missing abstractions
- Inconsistent patterns

### 4. Test Debt

- Missing tests for critical paths
- Flaky tests
- Slow test suite
- Low coverage areas

### 5. Documentation Debt

- Outdated docs
- Missing API documentation
- Unclear error messages

## Debt Categories

| Category | Examples | Typical Interest |
|----------|----------|------------------|
| **Cruft** | Unused code, dead imports | Low (cleanup task) |
| **Shortcuts** | TODO/HACK markers | Medium (maintenance drag) |
| **Design** | Wrong abstraction | High (limits features) |
| **Platform** | Old framework version | Compounding (security risk) |

## Prioritization Matrix

```
        HIGH IMPACT
             │
   ┌─────────┼─────────┐
   │  DO     │  PLAN   │
   │  FIRST  │  NEXT   │
LOW ├─────────┼─────────┤ HIGH
EFFORT│  DO     │  AVOID  │ EFFORT
   │  ANYTIME│  /DEFER │
   │         │         │
   └─────────┼─────────┘
             │
        LOW IMPACT
```

## Debt Report

```
TECHNICAL DEBT REPORT
=====================
Project: [name]
Date: [date]

SUMMARY:
Total Items: [count]
Critical: [count] | High: [count] | Medium: [count] | Low: [count]

DEBT BY CATEGORY:
| Category | Count | Est. Hours | Priority |
|----------|-------|------------|----------|
| Cruft | [n] | [h] | Low |
| Shortcuts | [n] | [h] | Medium |
| Design | [n] | [h] | High |
| Platform | [n] | [h] | Critical |

TOP DEBT ITEMS:

### 1. [Item Name]
**Category**: [category]
**Location**: [files affected]
**Impact**: [what it costs to leave it]
**Effort**: [estimate to fix]
**Interest Rate**: [how fast it compounds]
**Recommendation**: [fix now / plan / defer]

### 2. ...

QUICK WINS (Low Effort, High Value):
1. [Item] — [30 min] — [benefit]
2. [Item] — [1 hr] — [benefit]

RECOMMENDED SPRINT ALLOCATION:
- 20% of sprint capacity for debt paydown
- Focus on: [category] debt this sprint
```

Run tech debt audit on this project?

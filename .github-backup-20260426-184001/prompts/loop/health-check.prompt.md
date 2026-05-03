---
mode: agent
description: "Multi-dimension project health assessment"
application: "Assess project health across code quality, tests, docs, deps, and architecture"
tools: ["read_file", "list_dir", "grep_search", "run_in_terminal", "get_errors"]
---

# Project Health Check

Comprehensive multi-dimension project health assessment.

## Health Dimensions

| Dimension | Weight | What I Check |
|-----------|--------|--------------|
| **Code Quality** | 25% | Linting, type coverage, complexity |
| **Test Coverage** | 20% | Tests exist, tests pass, coverage % |
| **Documentation** | 15% | README, API docs, inline comments |
| **Dependencies** | 15% | Outdated, vulnerable, unused |
| **Build Health** | 15% | Builds succeed, no warnings |
| **Git Hygiene** | 10% | Commit messages, branch strategy |

## Assessment Process

### 1. Code Quality

- Run linter (eslint, pyright, etc.)
- Check for type annotations
- Measure cyclomatic complexity
- Look for code smells (long functions, deep nesting)

### 2. Test Health

- Do tests exist?
- Do they pass?
- What's the coverage?
- Are tests meaningful or trivial?

### 3. Documentation

- Is README current?
- Are public APIs documented?
- Do code comments explain "why" not "what"?

### 4. Dependencies

- How many outdated packages?
- Any security vulnerabilities?
- Unused dependencies?
- License compliance?

### 5. Build Health

- Does the project build?
- Are there build warnings?
- Is build time reasonable?

### 6. Git Hygiene

- Commit message quality
- Branch naming consistency
- No secrets in history

## Health Score

```
PROJECT HEALTH REPORT
=====================
Project: [name]
Date: [date]

OVERALL SCORE: [A-F] ([percentage]%)

DIMENSION SCORES:
| Dimension | Score | Status | Notes |
|-----------|-------|--------|-------|
| Code Quality | [%] | [✓/⚠/✗] | [notes] |
| Test Coverage | [%] | [✓/⚠/✗] | [notes] |
| Documentation | [%] | [✓/⚠/✗] | [notes] |
| Dependencies | [%] | [✓/⚠/✗] | [notes] |
| Build Health | [%] | [✓/⚠/✗] | [notes] |
| Git Hygiene | [%] | [✓/⚠/✗] | [notes] |

TOP ISSUES:
1. [Issue] — [Impact] — [Fix]
2. [Issue] — [Impact] — [Fix]
3. [Issue] — [Impact] — [Fix]

RECOMMENDATIONS:
1. [Priority action]
2. [Second action]
```

## Grade Scale

| Grade | Score | Meaning |
|-------|-------|---------|
| A | 90-100% | Excellent — production ready |
| B | 80-89% | Good — minor improvements needed |
| C | 70-79% | Fair — notable issues to address |
| D | 60-69% | Poor — significant work needed |
| F | <60% | Failing — critical issues |

Run health check on this project?

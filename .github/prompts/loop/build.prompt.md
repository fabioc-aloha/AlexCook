---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
description: "Build phase — domain-specific implementation with wiki documentation"
application: "Implement features guided by plan and wiki documentation"
tools: ["read_file", "create_file", "list_dir", "semantic_search", "grep_search"]
currency: 2026-04-22
---

# ③ Build

I'm ready to build. I have `wiki/` with idea and plan pages documented.

## Phase 1: Review Prior Work

Read wiki/ to understand:

- What we're building (idea-Concept.md)
- Scope and approach (plan-Scope.md, plan-Approach.md)
- Success criteria (plan-Success.md)
- Domain type identified in planning

## Phase 2: Domain-Specific Wiki Pages

Based on plan-Approach.md domain type, add build documentation:

**If Software:**

```
wiki/
├── build-Architecture.md    # System design
├── build-API.md             # API reference
├── build-Setup.md           # Development setup
└── build-Contributing.md    # How to contribute
```

**If Book/Writing:**

```
wiki/
├── build-Outline.md         # Full book outline
├── build-Chapter-*.md       # Chapter drafts
└── build-Style-Guide.md     # Voice, tone, formatting
```

**If Thesis/Academic:**

```
wiki/
├── build-Methodology.md     # Research approach
├── build-Literature.md      # Literature review
├── build-Chapter-*.md       # Chapter drafts
└── build-Bibliography.md    # Sources
```

**If Business Plan:**

```
wiki/
├── build-Executive-Summary.md
├── build-Market-Analysis.md
├── build-Financials.md
└── build-Operations.md
```

## Phase 3: First Artifact + Navigation

1. Create the first build page based on plan-Success.md priorities
2. Update _Sidebar.md with the Build section
3. Update Home.md status to "Building"

Start by reading my wiki/ folder.

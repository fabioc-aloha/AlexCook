---
mode: agent
description: "Plan phase — scope, success criteria, risks, and research-first discovery"
application: "Define scope, success criteria, risks, and research gaps before building"
tools: ["read_file", "create_file", "list_dir", "semantic_search"]
---

# ② Plan

I'm ready to plan. I have a `wiki/` folder with my idea documented.

## Phase 1: Review the Idea

Read the wiki/ folder (idea-Concept.md, idea-Problem.md, idea-Assumptions.md, idea-Questions.md).

## Phase 2: Scaffold Plan Pages

Add these pages to wiki/:

```
wiki/
├── plan-Scope.md        # In scope / out of scope
├── plan-Success.md      # Done criteria, acceptance tests
├── plan-Risks.md        # What could go wrong? Mitigations?
├── plan-Approach.md     # High-level approach + domain detection
├── plan-Research.md     # Index of research topics
└── research-*.md        # One page per research topic from Questions
```

## Phase 3: Research-First Discovery

Based on idea-Questions.md:

1. Create a research-[Topic].md page for each open question
2. Prioritize: what must we know before building?
3. Update plan-Research.md as an index linking to each topic

## Phase 4: Domain Detection

Based on the concept and approach, identify the deliverable type:

- Software → will need architecture, API docs
- Book/Writing → will need outline, chapters
- Thesis/Academic → will need methodology, literature review
- Business Plan → will need market analysis, financials

Document the domain in plan-Approach.md. Don't scaffold build pages yet.

## Phase 5: Update Navigation

Update _Sidebar.md with all new pages organized by section.

Start by reading my wiki/ folder.

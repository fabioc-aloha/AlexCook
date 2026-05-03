---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
description: "Improve phase — retrospective, iteration planning, and pattern extraction"
application: "Run retrospectives, plan iterations, and extract reusable patterns"
tools: ["read_file", "create_file", "list_dir", "semantic_search"]
currency: 2026-04-22
---

# ⑥ Improve

I want to improve this project. Review my wiki/ and help me iterate.

## Phase 1: Retrospective

Read the wiki journey:

- idea-Concept.md → Did the result match the vision?
- plan-Success.md → Did we hit all criteria?
- plan-Risks.md → Which risks materialized?
- test-Results.md → What failed? What passed?

## Phase 2: Add Retrospective Page

Create wiki/release-Retrospective.md:

- What went well?
- What could be improved?
- What would we do differently?
- What patterns emerged that could become reusable?

## Phase 3: Next Iteration

Based on the retrospective:

- **New idea?** → Start fresh wiki/ or wiki-v2/
- **Improve current?** → Add plan-v2-*.md pages for next iteration
- **Extract patterns?** → Document reusable approaches in build-Patterns.md

## Phase 4: Update Navigation

Update _Sidebar.md with Retrospective section. Update Home.md with "Next Steps".

Start by reading my wiki/ folder.

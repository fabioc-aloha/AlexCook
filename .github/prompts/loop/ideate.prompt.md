---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
description: "Ideate phase — scaffold a wiki and explore your idea"
application: "Brainstorm, scaffold wiki structure, and explore new project ideas"
tools: ["create_file", "read_file", "list_dir"]
currency: 2026-04-22
---

# ① Ideate

I'm starting a new idea. Help me scaffold and explore it in a wiki-ready format.

## Phase 1: Scaffold the Wiki

Create a `wiki/` folder with this structure:

```
wiki/
├── Home.md              # Project landing page (title, one-liner, status)
├── _Sidebar.md          # Navigation (auto-updated as we add pages)
├── idea-Concept.md      # Core idea in 1-2 paragraphs
├── idea-Problem.md      # What problem? Who has it?
├── idea-Assumptions.md  # What needs validation?
└── idea-Questions.md    # Open research questions
```

Note: Flat file names with prefixes (idea-, plan-, etc.) for GitHub Wiki compatibility.

## Phase 2: Interview Me

Ask me 5-7 probing questions to populate these documents:

1. What is the core idea? (for idea-Concept.md)
2. What problem does it solve? Who suffers from this problem? (for idea-Problem.md)
3. What are you assuming is true? What would break if wrong? (for idea-Assumptions.md)
4. What don't you know yet? What research would help? (for idea-Questions.md)

## Phase 3: Populate and Link

After the interview:

1. Create the wiki/ folder with populated documents
2. Update Home.md with project summary and status
3. Update _Sidebar.md with navigation to all pages

My idea is:

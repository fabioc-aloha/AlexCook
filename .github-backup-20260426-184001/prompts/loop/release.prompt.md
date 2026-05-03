---
mode: agent
description: "Release phase — pre-release audit, documentation, and shipping"
application: "Run pre-release checks, update changelogs, and ship releases"
tools: ["read_file", "create_file", "list_dir", "grep_search"]
---

# ⑤ Release

I'm ready to ship. Review my wiki/ and guide the release.

## Phase 1: Pre-Release Wiki Audit

Check wiki/ completeness:

- [ ] Home.md has current summary and status
- [ ] _Sidebar.md links all pages correctly
- [ ] All idea-*, plan-*, build-*, test-* pages are complete
- [ ] No broken links, no TODO placeholders

## Phase 2: Release Documentation

Add release pages:

```
wiki/
├── release-Checklist.md     # Pre-release checklist (domain-specific)
├── release-Notes.md         # What's shipping, changelog
└── release-Lessons.md       # What we learned
```

## Phase 3: Publish Wiki

Options for wiki publishing:

1. **GitHub Wiki**: Copy wiki/*.md to repo wiki (flatten paths)
2. **GitHub Pages**: Use VitePress/Jekyll to publish wiki/ as static site
3. **Standalone**: wiki/ folder is already browsable in VS Code

## Phase 4: Archive and Celebrate

1. Update Home.md status to "Shipped" with release date
2. Create archive/ folder with dated snapshot if needed
3. Document lessons learned in release-Lessons.md

Start by auditing my wiki/ folder.

---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Wiki publishing procedures for GitHub Wiki synchronization and link rewriting"
application: "When publishing or syncing content to GitHub Wiki"
applyTo: "**/*wiki*,**/*publish*wiki*"
currency: 2026-04-22
---

# Wiki Publish Procedure

Sync `master-wiki/` to `AlexMaster.wiki.git`. Source of truth is always `master-wiki/`.

Full protocol in `.github/skills/wiki-publish/SKILL.md`.

## Quick Reference

1. **Clone**: `git clone https://github.com/fabioc-aloha/AlexMaster.wiki.git` to a temp directory
2. **Inventory**: List all `.md` and `.svg` files in `master-wiki/`, excluding `alex3/`, `skills/`, and non-doc files
3. **Copy with mapping**: Apply folder-to-prefix rules from the wiki-publish skill
4. **Rewrite links**: Fix internal references from relative paths to flat wiki names
5. **Sync special files**: `_Sidebar.md`, `_Footer.md` → wiki root
6. **Diff check**: `git status --short` — confirm only expected changes
7. **Commit and push**: Single commit with descriptive message
8. **Cleanup**: Remove temp clone directory

---
description: "Procedure for publishing master-wiki/ to the GitHub Wiki with folder flattening and link rewriting"
application: "When syncing master-wiki/ to the AlexMaster GitHub Wiki"
applyTo: "**/*wiki*publish*,**/*wiki*push*,**/*wiki*sync*"
---

# Wiki Publish Procedure

Sync `master-wiki/` to `AlexMaster.wiki.git`. Source of truth is always `master-wiki/`.

## Steps

1. **Clone**: `git clone https://github.com/fabioc-aloha/AlexMaster.wiki.git` to a temp directory
2. **Inventory**: List all `.md` and `.svg` files in `master-wiki/`, excluding `alex3/`, `skills/`, and non-doc files
3. **Copy with mapping**: Apply folder-to-prefix rules from the wiki-publish skill
4. **Rewrite links**: Fix internal references from relative paths to flat wiki names
5. **Sync special files**: `_Sidebar.md`, `_Footer.md` → wiki root
6. **Diff check**: `git status --short` — confirm only expected changes
7. **Commit and push**: Single commit with descriptive message
8. **Cleanup**: Remove temp clone directory

## Link Rewriting

- Strip path traversals (`../`)
- Apply folder prefix per mapping table in skill
- Remove `.md` extensions from page links
- Preserve anchor fragments (`#section-name`)
- Links to `.github/` source files: remove (source-only, not accessible from wiki)

## Image Path Rewriting

**Order matters** — process `../` before `./` to avoid partial matches.

| Source pattern | Wiki path | Example |
|---|---|---|
| `../assets/banner-X.svg` | `banner-X.svg` | SVGs copied flat to root |
| `./assets/banner-X.svg` | `banner-X.svg` | Same — root-level files |
| `./images/blog-X.png` | `blog/images/blog-X.png` | Blog images stay in `blog/images/` |
| `../portraits/X.png` | `images/X.png` | Portraits in `images/` subdir |
| `../portraits/age-progression/X.png` | `images/age-progression/X.png` | Age progression in `images/age-progression/` |

## Safety

- Never force-push the wiki repo
- Always clone fresh — don't reuse stale clones
- Review `git status` before committing
- If wiki has manual edits not in `master-wiki/`, they will be overwritten — check first

## Quick Reference Commands

```bash
# Clone wiki repo
git clone https://github.com/fabioc-aloha/AlexMaster.wiki.git /tmp/wiki-staging

# After copying and rewriting, check diff
cd /tmp/wiki-staging
git status --short
git diff --stat

# Commit and push
git add -A
git commit -m "Sync from master-wiki $(date +%Y-%m-%d)"
git push origin master
```

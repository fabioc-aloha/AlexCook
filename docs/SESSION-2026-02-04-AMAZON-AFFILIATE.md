# Session Log: Amazon Affiliate Links & Documentation Polish

**Date:** February 4, 2026
**Focus:** Amazon shopping list monetization + documentation improvements

---

## Summary

Transformed the Amazon shopping list from static text search terms into **185 clickable affiliate links** generating potential revenue, plus polished documentation with improved ASCII diagrams.

---

## Changes Made

### 1. Amazon Affiliate Links

**Problem:** Shopping list had backtick-wrapped search terms that readers had to copy/paste manually.

**Solution:** Created scripts to generate clickable Amazon search URLs with affiliate tracking.

**Files Created:**
- `build/add-amazon-links.js` — Converts search terms to affiliate links (first-time use)
- `build/update-affiliate-tag.js` — Updates existing links with new affiliate tag

**Transformation:**
```markdown
# Before:
| **Chef's Knife** | Don't cheap out. | `Victorinox 8 inch chef knife` |

# After:
| **Chef's Knife** | Don't cheap out. | [🔍 Victorinox 8 inch chef knife](https://www.amazon.com/s?k=Victorinox+8+inch+chef+knife&tag=alexcook05-20) |
```

**Results:**
- 185 clickable Amazon links
- All links include affiliate tag: `alexcook05-20`
- 🔍 prefix for visual indication
- Column header renamed from "Search Term" to "Shop"

---

### 2. Affiliate Disclosure

**Requirement:** Amazon Associates requires disclosure of affiliate relationship.

**Added to:** `book/20-amazon-shopping-list.md` (bottom of page)

```markdown
> **📋 Affiliate Disclosure:** The links in this chapter are affiliate links.
> As an Amazon Associate, I earn from qualifying purchases — at no extra cost
> to you. This helps support the cookbook and keeps Alex cooking up new recipes.
> Thank you for your support! ❤️
```

---

### 3. Documentation Polish

**BUILD-PIPELINE.md Updates:**
- Added Section 8: `add-amazon-links.js` documentation
- Polished architecture diagram with double-line boxes (╔═══╗) for major components

**PROJECT-STRUCTURE.md Updates:**
- Added visual flow diagram showing three output formats (GitHub → Print → Digital)
- Polished directory tree with emoji prefixes (📖, 🌐, 🔧, 📚, 🗄️)

---

### 4. Social Preview Improvements

**File:** `build/convert-social-preview.js`

**Improvement:** Better handling of mixed text+emoji lines with accurate character width calculations:
- Character width: `fontSize * 0.55`
- Emoji width: `fontSize * 1.2`
- Proper spacing between elements

---

## Scripts Reference

### `add-amazon-links.js`

```bash
node build/add-amazon-links.js
```

- First-time conversion of backtick search terms to links
- Reads `book/20-amazon-shopping-list.md`
- Creates `[🔍 term](url&tag=TAG)` format

### `update-affiliate-tag.js`

```bash
node build/update-affiliate-tag.js
```

- Updates existing links with new affiliate tag
- Use when changing affiliate ID
- Supports environment variable: `AMAZON_AFFILIATE_TAG`

---

## Amazon Associates Setup

1. **Sign up:** [affiliate-program.amazon.com](https://affiliate-program.amazon.com/)
2. **Add website:** GitHub repo URL
3. **Get tag:** Format is `username-20`
4. **Update scripts:** Change `AMAZON_AFFILIATE_TAG` constant
5. **Run update:** `node build/update-affiliate-tag.js`

**Important:**
- 180-day probation: Make 3 sales or account closes
- Disclosure required (added ✅)
- No self-purchasing through own links
- Commission: ~4% on kitchen items, ~4.5% on books

---

## Git Commits

```
78da225 feat: Add Amazon affiliate links to shopping list
```

**Files changed:** 7
**Insertions:** 502
**Deletions:** 326

---

## File Inventory

| File | Action | Description |
|------|--------|-------------|
| `book/20-amazon-shopping-list.md` | Modified | 185 affiliate links + disclosure |
| `build/add-amazon-links.js` | Created | Initial link generation script |
| `build/update-affiliate-tag.js` | Created | Tag update script |
| `build/convert-social-preview.js` | Modified | Better mixed line layout |
| `docs/BUILD-PIPELINE.md` | Modified | Added script docs + polished diagrams |
| `docs/PROJECT-STRUCTURE.md` | Modified | Added flow diagram + emoji prefixes |
| `github-version/assets/social-preview.png` | Modified | Regenerated with fixes |

---

## Revenue Potential

With 185 affiliate links covering:
- Kitchen equipment ($50-500 items)
- Small appliances ($100-400 items)
- Pantry staples (repeat purchases)
- Cookbooks ($20-40 items)

**Estimated commission per reader who buys:**
- One knife + pan: ~$4-8
- Full starter kit ($200): ~$8-10
- Stand mixer ($400): ~$16

---

*Session completed. Ready to earn! 💰*

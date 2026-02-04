# Project Structure: The Alex Cookbook

This document describes the organization of The Alex Cookbook across its three output formats: **GitHub** (web browsing), **Print PDF**, and **Digital PDF/eBook**.

---

## Directory Overview

```
AlexCook/
├── book/                    # 📖 CANONICAL SOURCE for PDF builds
│   ├── *.md                 # All chapters (single flat folder)
│   ├── cover.svg            # Book cover artwork
│   ├── assets/
│   │   ├── banners/         # Chapter banner SVGs
│   │   │   └── png/         # Converted PNGs for PDF
│   │   ├── emojis/          # Twemoji PNGs (140+)
│   │   └── images/          # Photos and illustrations
│   └── output/              # Generated PDFs
│
├── github-version/          # 🌐 GITHUB-OPTIMIZED structure
│   ├── COVER.md             # Root README (displays on repo home)
│   ├── INDEX.md             # Chapter listing with navigation
│   ├── intro/               # Front matter files
│   ├── chapters/            # Recipe chapters (one folder each)
│   ├── appendices/          # Reference appendices
│   ├── references/          # Conversion tables, essentials
│   └── assets/              # GitHub-specific assets
│
├── build/                   # 🔧 BUILD SCRIPTS and config
│   ├── *.js                 # Node.js conversion scripts
│   ├── *.ps1                # PowerShell build/QA scripts
│   ├── *.yaml               # Pandoc configuration
│   ├── *.tex                # LaTeX headers
│   └── emoji-map.json       # Emoji→PNG mapping
│
├── docs/                    # 📚 DOCUMENTATION
│   ├── BUILD-PIPELINE.md    # This file's companion
│   ├── PUBLISHING.md        # Amazon KDP guide
│   ├── BOOK-FORMATTING-STANDARDS.md
│   └── AI-COOKBOOK-HISTORY.md
│
└── archive/                 # 🗄️ LEGACY (deprecated)
    └── chapters/            # Old per-folder chapter structure
```

---

## Three Output Formats

### 1. GitHub Version (`github-version/`)

**Purpose:** Web browsing on GitHub.com with navigation, badges, and collapsible sections.

**Structure:**
```
github-version/
├── COVER.md                 # Root README - book cover + badges
├── INDEX.md                 # Full chapter listing
├── CONTRIBUTING.md          # Contribution guidelines
├── intro/
│   ├── README.md            # Intro section hub
│   ├── dedication.md
│   ├── introduction.md
│   ├── meet-alex.md
│   ├── behind-the-scenes.md
│   └── readers-guide.md
├── chapters/
│   ├── 01-appetizers/
│   │   ├── README.md        # Chapter overview + recipes
│   │   └── *.md             # Individual recipes (optional)
│   ├── 02-soups-salads/
│   │   └── README.md
│   └── ... (15 chapters)
├── appendices/
│   ├── appendix-a-aphrodisiac/
│   ├── appendix-b-risotto-rice/
│   ├── appendix-c-amazon-shopping-list/
│   └── appendix-d-references/
├── references/
│   ├── cooking-conversions.md
│   └── kitchen-essentials.md
└── assets/
    ├── banners/             # SVG banners (render in browser)
    ├── emojis/              # Twemoji PNGs (linked, not embedded)
    ├── images/
    ├── social-preview.svg   # Source for social image
    └── social-preview.png   # GitHub social preview (1280×640)
```

**Features:**
- 🧭 Navigation footers on every page (← Previous | Home | Next →)
- 🏷️ shields.io badges for stats
- 📦 `<details>` collapsibles for long content
- 📊 HTML tables for structured data
- 🔗 Relative links between all files
- 💗 `.github/FUNDING.yml` for Sponsors button

**GitHub-Specific Files:**
- `COVER.md` → Displays as repository README
- `.github/FUNDING.yml` → Enables Sponsor button

---

### 2. Print PDF (`book/output/cookbook-print.pdf`)

**Purpose:** Physical printing (letter size, two-sided, professional binding).

**Generated from:** `book/*.md` → Pandoc → LuaLaTeX

**Characteristics:**

| Feature | Setting |
|---------|---------|
| Paper | Letter (8.5" × 11") |
| Layout | Two-sided (twoside) |
| Chapter starts | Right-hand pages (openright) |
| Margins | 1" sides, 1.25" top/bottom |
| Headers | Book title (left), Chapter (right) |
| Page numbers | Roman (front matter), Arabic (main) |
| Fonts | Segoe UI (body), Cascadia Code (mono) |
| Images | PNG banners, embedded emoji |

**Configuration:** `build/cookbook.yaml` + `build/header-print.tex`

**Build:**
```powershell
.\build\build-pdf.ps1
# Outputs: book/output/The-Alex-Cookbook-Print.pdf
```

---

### 3. Digital PDF/eBook (`book/output/cookbook-digital.pdf`)

**Purpose:** Screen reading (tablets, e-readers, computers).

**Generated from:** Same source, different config

**Characteristics:**

| Feature | Setting |
|---------|---------|
| Paper | Letter (same, but single-sided) |
| Layout | Single-sided (oneside) |
| Chapter starts | Any page (no blank pages) |
| Hyperlinks | Clickable TOC, cross-references |
| Margins | Smaller (screen optimization) |
| Colors | Enhanced link colors |

**Configuration:** `build/cookbook-digital.yaml` + `build/header-digital.tex`

**Key difference from Print:**
- No blank pages before chapters
- Hyperlinks are clickable (NavyBlue for URLs)
- Headers show page number on right only (not alternating)

---

## Source Content Organization

### `book/` — Canonical Source

All content lives in flat Markdown files with numeric prefixes:

```
book/
├── 00-cover.md              # Cover page (skipped, uses TikZ)
├── 00aa-copyright.md        # Copyright notice
├── 00ab-halftitle.md        # Half-title page
├── 00a-dedication.md        # Family dedication
├── 00b-introduction.md      # AI cookbook manifesto
├── 00c-meet-alex.md         # Character introduction
├── 00d-behind-the-scenes.md # Development story
├── 00e-readers-guide.md     # How to use this book
├── 01-appetizers.md         # Chapter 1
├── 02-soups-salads.md       # Chapter 2
├── ... (through 15)
├── 16-appendix-a-*.md       # Appendix A
├── 17-appendix-b-*.md       # Appendix B
├── 18-cooking-conversions.md
├── 19-kitchen-essentials.md
├── 20-amazon-shopping-list.md
└── 21-references.md
```

**Naming convention:**
- `00*` — Front matter (Roman numeral pages)
- `01-15` — Main chapters (Arabic numeral pages)
- `16-21` — Back matter (appendices, references)

**Why flat structure?**
- Simpler for Pandoc concatenation
- Easier to maintain chapter order
- Git diffs are cleaner

### Chapter File Format

Each chapter file follows this structure:

```markdown
# Chapter X: Chapter Title

### *"Tagline quote here"*

---

## Recipe Name

**Origin:** Country/Region
**Prep:** X min | **Cook:** Y min | **Serves:** N

> Chef's note or story about the dish

### Ingredients

| Amount | Ingredient |
|--------|------------|
| 1 cup  | Flour      |
| ...    | ...        |

### Instructions

1. Step one
2. Step two
3. ...

### Tips & Variations

- Tip one
- Variation idea

---

## Next Recipe...
```

---

## Asset Management

### Emojis (`book/assets/emojis/`)

- 140+ Twemoji PNG files (72×72 pixels)
- Downloaded from: `cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/`
- Mapped in: `build/emoji-map.json`

**Special emojis:**
| Character | Emoji | Codepoints |
|-----------|-------|------------|
| Alex | 🧑‍🍳 | 1f9d1-200d-1f373 |
| Claudia | 👩‍🦱 | 1f469-200d-1f9b1 |
| Douglas | 🧒 | 1f9d2 |
| Freddy | 🐕 | 1f415 |
| Jolly | 🐩 | 1f429 |

### Banners (`book/assets/banners/`)

- SVG source files for chapter headers
- PNG conversions in `banners/png/` for PDF
- GitHub version uses SVG directly (browser renders)

### Images (`book/assets/images/`)

- Recipe photos
- Illustrations
- Cover elements

---

## Build Outputs

### Generated Files

| Output | Location | Size |
|--------|----------|------|
| Print PDF | `book/output/The-Alex-Cookbook-Print.pdf` | ~3 MB |
| Digital PDF | `book/output/The-Alex-Cookbook-Digital.pdf` | ~3 MB |
| Combined MD | `book/output/cookbook-combined.md` | ~500 KB |
| Social PNG | `github-version/assets/social-preview.png` | ~150 KB |

### Intermediate Files

| File | Purpose |
|------|---------|
| `build/emoji-map.json` | Emoji → PNG path mapping |
| `build/asset-manifest.json` | Hash cache for incremental builds |
| `book/assets/banners/png/*.png` | Converted chapter banners |

---

## Synchronization

### GitHub ↔ Book Sync

The `github-version/` is **manually synced** from `book/` with these transformations:

| book/ | github-version/ | Transformation |
|-------|-----------------|----------------|
| `01-appetizers.md` | `chapters/01-appetizers/README.md` | + navigation footer |
| `00a-dedication.md` | `intro/dedication.md` | + formatting |
| LaTeX blocks | Removed | `{=latex}` stripped |
| SVG→PNG refs | SVG refs | Browser renders SVG |

### When to Sync

1. After significant recipe additions
2. Before major releases
3. After character/emoji changes

### Sync Checklist

- [ ] Copy content from `book/*.md`
- [ ] Strip LaTeX-specific markup
- [ ] Add navigation footers
- [ ] Update INDEX.md if chapters changed
- [ ] Verify emoji consistency
- [ ] Test links locally

---

## Quick Reference

### Build Commands

```powershell
# Full PDF build (print + digital)
.\build\build-pdf.ps1

# Extract all emojis from markdown
node build/extract-emojis.js

# Convert SVG banners to PNG
node build/convert-svgs.js

# Convert book cover
node build/convert-cover.js

# Generate social preview PNG
node build/convert-social-preview.js

# Run QA analysis on PDF
.\build\cookbook-qa.ps1

# Full asset pipeline (incremental)
node build/asset-pipeline.js
```

### File Counts

| Category | Count |
|----------|-------|
| Chapters | 15 |
| Appendices | 4 |
| Front matter files | 8 |
| Emoji PNGs | 140+ |
| Banner SVGs | 18 |
| Total recipes | 100+ |

---

*Last updated: February 2026*

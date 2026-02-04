# Build Pipeline Documentation

This document describes the conversion scripts and techniques used to build **The Alex Cookbook** from Markdown source to both PDF (print/digital) and GitHub-browsable formats.

## Architecture Overview

```text
                    ╔═══════════════════════════════════════════════════════════╗
                    ║                      SOURCE FILES                          ║
                    ║   book/*.md (chapters) + book/assets/ (images, SVGs)      ║
                    ╚═══════════════════════════════════════════════════════════╝
                                              │
                     ┌────────────────────────┼────────────────────────┐
                     ▼                        ▼                        ▼
            ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
            │ extract-emojis  │     │  convert-svgs   │     │ asset-pipeline  │
            │      .js        │     │      .js        │     │      .js        │
            └────────┬────────┘     └────────┬────────┘     └────────┬────────┘
                     │                       │                       │
                     └───────────────────────┼───────────────────────┘
                                             ▼
                    ╔═══════════════════════════════════════════════════════════╗
                    ║                  INTERMEDIATE ASSETS                       ║
                    ║   book/assets/emojis/*.png  │  banners/png/*.png          ║
                    ║   emoji-map.json            │  asset-manifest.json        ║
                    ╚═══════════════════════════════════════════════════════════╝
                                             │
                          ┌──────────────────┴──────────────────┐
                          ▼                                     ▼
                 ┌─────────────────────┐              ┌─────────────────────┐
                 │    build-pdf.ps1    │              │  convert-social-    │
                 │   (Pandoc+LaTeX)    │              │     preview.js      │
                 └──────────┬──────────┘              └──────────┬──────────┘
                            ▼                                    ▼
                 ╔═════════════════════╗              ╔═════════════════════╗
                 ║ cookbook-print.pdf  ║              ║ social-preview.png  ║
                 ║ cookbook-digital.pdf║              ╚═════════════════════╝
                 ╚═════════════════════╝
```

---

## Scripts Reference

### 1. `extract-emojis.js` — Emoji Collection

**Purpose:** Scans all Markdown files, extracts unique emojis, and downloads them as PNG from Twemoji CDN.

**Location:** `build/extract-emojis.js`

**Usage:**
```bash
node build/extract-emojis.js
```

**How it works:**
1. Recursively finds all `.md` files in the project
2. Uses Unicode regex to extract emoji characters: `/(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu`
3. Converts each emoji to codepoints (e.g., `🍳` → `1f373`)
4. Downloads from Twemoji CDN: `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/{codepoints}.png`
5. Generates `emoji-map.json` mapping emoji → PNG filename

**Output:**
- `book/assets/emojis/*.png` — Individual emoji images (72×72 Twemoji PNGs)
- `build/emoji-map.json` — Emoji-to-path mapping for other scripts

**Key technique:** Twemoji provides consistent, colorful emoji rendering across all platforms, avoiding system font inconsistencies.

---

### 2. `convert-svgs.js` — Banner Conversion

**Purpose:** Converts SVG banner images to high-resolution PNG with color emoji support.

**Location:** `build/convert-svgs.js`

**Usage:**
```bash
node build/convert-svgs.js
```

**How it works:**
1. Loads `emoji-map.json` for emoji lookups
2. For each SVG in `book/assets/banners/`:
   - Parses `<text>` elements containing emojis
   - Replaces emoji text with `<image>` elements containing base64-encoded Twemoji PNGs
   - Uses Sharp library to render modified SVG to PNG at 300 DPI (3× scale)

**Emoji replacement technique:**
```javascript
// Original SVG text element:
<text x="25" y="45" font-size="28">🥣</text>

// Transformed to embedded image:
<image x="25" y="21" width="28" height="28"
       href="data:image/png;base64,iVBORw0KGgo..."/>
```

**Output:**
- `book/assets/banners/png/*.png` — High-res banner images for PDF

---

### 3. `convert-cover.js` — Book Cover Conversion

**Purpose:** Converts the main `cover.svg` to PNG, handling both emoji text AND relative image paths.

**Location:** `build/convert-cover.js`

**Usage:**
```bash
node build/convert-cover.js
```

**How it works:**
1. Reads `book/cover.svg`
2. **Embeds relative image paths** — Converts `href="./assets/..."` to base64 data URIs
3. **Replaces emoji text** — Same technique as `convert-svgs.js`
4. Renders to PNG at 300 DPI using Sharp

**Key technique:** The cover SVG references other assets (photos, backgrounds). These relative paths break when Sharp renders the SVG, so we embed them as base64 first.

```javascript
// Before:
<image href="./assets/images/photo.png" />

// After:
<image href="data:image/png;base64,iVBORw0KGgo..." />
```

**Output:**
- `book/assets/banners/png/cover.png` — Full book cover for PDF

---

### 4. `convert-social-preview.js` — Social Preview Generation

**Purpose:** Creates GitHub social preview PNG with proper emoji and flag rendering.

**Location:** `build/convert-social-preview.js`

**Usage:**
```bash
node build/convert-social-preview.js
```

**How it works:**
1. Loads both emoji maps (`book/assets/emojis/emoji-map.json` and `build/emoji-map.json`)
2. Uses comprehensive regex to match:
   - **ZWJ sequences:** `👨‍🍳` (man cook), `👩‍🦱` (woman curly hair)
   - **Regional indicator flags:** `🇧🇷` `🇮🇹` `🇮🇳` `🇨🇳` `🇯🇵`
   - **Standard emojis:** `🍳` `🔥` `❤️` etc.
3. Handles **mixed text+emoji lines** by creating SVG groups with positioned elements
4. Renders to 1280×640 PNG (GitHub recommended size)

**Comprehensive emoji regex:**
```javascript
const EMOJI_REGEX = new RegExp(
    // ZWJ sequences first (longer matches)
    '(?:[\\u{1F468}\\u{1F469}\\u{1F9D1}\\u{1F9D4}]\\u{200D}[\\u{1F373}\\u{1F9B1}\\u{1F9B0}\\u{2642}\\u{2640}]\\u{FE0F}?)' +
    // Regional indicator flags
    '|(?:[\\u{1F1E0}-\\u{1F1FF}]{2})' +
    // Heart with variation selector
    '|(?:\\u{2764}\\u{FE0F}?)' +
    // Supplementary emoji ranges
    '|[\\u{1F300}-\\u{1F9FF}]' +
    // Dingbats and misc symbols
    '|[\\u{2600}-\\u{27BF}]',
    'gu'
);
```

**Key technique:** ZWJ (Zero Width Joiner) sequences must be matched BEFORE simple emojis, otherwise `👨‍🍳` would be split into `👨` and `🍳`.

**Output:**
- `github-version/assets/social-preview.png` — GitHub social preview image

---

### 5. `asset-pipeline.js` — Unified Asset Pipeline

**Purpose:** One-command extraction and conversion of all assets with change detection.

**Location:** `build/asset-pipeline.js`

**Usage:**
```bash
node build/asset-pipeline.js
```

**How it works:**
1. Calculates MD5 hashes of all source files
2. Compares against `asset-manifest.json` to detect changes
3. Only processes changed files (incremental builds)
4. Combines emoji extraction + SVG conversion in one pass

**Output:**

- `build/asset-manifest.json` — Hash cache for change detection
- All emoji and banner PNGs as needed

---

### 6. `replace-flags.js` — Cross-Platform Flag Support

**Purpose:** Replaces flag emojis with PNG images for Windows compatibility.

**Location:** `build/replace-flags.js`

**Usage:**

```bash
node build/replace-flags.js
```

**How it works:**

1. Scans all Markdown files in `github-version/`
2. Finds regional indicator flag emojis (🇧🇷, 🇮🇹, 🇮🇳, etc.)
3. Calculates relative path from each file to `assets/emojis/`
4. Replaces flag with inline `<img>` tag pointing to Twemoji PNG

**Why needed:** Windows Segoe UI Emoji font **does not render flag emojis** — they appear as two-letter country codes (BR, IT, IN) instead of flag images. This is a known Windows limitation due to political considerations by Microsoft.

**Flag mapping:**

```javascript
const FLAGS = {
    '🇧🇷': '1f1e7-1f1f7.png',  // Brazil
    '🇮🇹': '1f1ee-1f1f9.png',  // Italy
    '🇮🇳': '1f1ee-1f1f3.png',  // India
    '🇨🇳': '1f1e8-1f1f3.png',  // China
    '🇯🇵': '1f1ef-1f1f5.png',  // Japan
    '🇫🇷': '1f1eb-1f1f7.png',  // France
    '🇬🇧': '1f1ec-1f1e7.png',  // UK
    '🇺🇸': '1f1fa-1f1f8.png',  // USA
    '🇲🇽': '1f1f2-1f1fd.png',  // Mexico
    '🇰🇷': '1f1f0-1f1f7.png',  // Korea
};
```

**Generated HTML:**

```html
<img src="../assets/emojis/1f1e7-1f1f7.png" alt="🇧🇷" height="16">
```

**Output:**

- Modified Markdown files with flag PNGs
- Console output showing replacement counts per file

---

### 7. `build-pdf.ps1` — PDF Generation

**Purpose:** Orchestrates the complete PDF build using Pandoc and LuaLaTeX.

**Location:** `build/build-pdf.ps1`

**Usage:**
```powershell
.\build\build-pdf.ps1
```

**How it works:**

#### Phase 1: Markdown Combination
1. Reads all chapters in order from `book/`
2. Adds custom LaTeX cover page using TikZ
3. Replaces emojis with LaTeX image includes
4. Handles front matter (unnumbered sections)
5. Outputs `book/output/cookbook-combined.md`

#### Phase 2: Emoji Replacement (in Markdown)
```powershell
# Replace emoji with LaTeX image command
$Content = $Content -replace '🍳', '\includegraphics[height=1em]{book/assets/emojis/1f373.png}'
```

#### Phase 3: Pandoc + LuaLaTeX
```powershell
pandoc cookbook-combined.md `
    --defaults build/cookbook.yaml `
    --output cookbook-print.pdf
```

**Configuration files:**
- `build/cookbook.yaml` — Print version (letter, twoside, 11pt)
- `build/cookbook-digital.yaml` — Digital version (letter, oneside, hyperlinks)
- `build/header-print.tex` — LaTeX preamble (fonts, packages, custom commands)

**Output:**
- `book/output/cookbook-print.pdf` — For printing (two-sided, crop marks)
- `book/output/cookbook-digital.pdf` — For screens (hyperlinks, single-sided)

---

### 8. `add-amazon-links.js` — Shopping List Link Generator

**Purpose:** Converts search terms in the Amazon shopping list to clickable Amazon search URLs.

**Location:** `build/add-amazon-links.js`

**Usage:**

```bash
node build/add-amazon-links.js
```

**How it works:**

1. Reads `book/20-amazon-shopping-list.md`
2. Finds backtick-wrapped search terms at end of table rows: `` `search term` ``
3. URL-encodes the term (spaces → `+`, special chars → `%XX`)
4. Replaces with clickable markdown link

**Transformation:**

```markdown
# Before:
| **Chef's Knife** | Don't cheap out. | `Victorinox 8 inch chef knife` |

# After:
| **Chef's Knife** | Don't cheap out. | [🔍 Victorinox 8 inch chef knife](https://www.amazon.com/s?k=Victorinox+8+inch+chef+knife) |
```

**URL format:**

```
https://www.amazon.com/s?k=URL+encoded+search+terms
```

**Key technique:** Uses `encodeURIComponent()` with space replacement to create clean Amazon search URLs:

```javascript
const encoded = encodeURIComponent(searchTerm).replace(/%20/g, '+');
return `https://www.amazon.com/s?k=${encoded}`;
```

**Output:**

- Modified `20-amazon-shopping-list.md` with 185 clickable search links
- Each link prefixed with 🔍 for visual indication

---

## Configuration Files

### `emoji-map.json`

Maps emoji characters to their PNG file paths:

```json
{
  "🍳": "book/assets/emojis/1f373.png",
  "👨‍🍳": "book/assets/emojis/1f468-200d-1f373.png",
  "🇧🇷": "book/assets/emojis/1f1e7-1f1f7.png",
  "👩‍🦱": "book/assets/emojis/1f469-200d-1f9b1.png"
}
```

**Special entries:**
- **ZWJ sequences** use hyphenated codepoints: `1f468-200d-1f373`
- **Flags** combine two regional indicators: `1f1e7-1f1f7` (🇧 + 🇷 = 🇧🇷)

### `cookbook.yaml` / `cookbook-digital.yaml`

Pandoc defaults for PDF generation:

```yaml
pdf-engine: lualatex
variables:
  documentclass: book
  papersize: letter
  fontsize: 11pt
  geometry: margin=1in
  colorlinks: true
include-in-header: build/header-print.tex
```

### `header-print.tex`

LaTeX preamble with:
- Font configuration (Georgia/Arial equivalents)
- TikZ for cover page
- Custom recipe environment
- Page layout adjustments

---

## Key Techniques

### 1. Twemoji for Consistent Emoji Rendering

**Problem:** System fonts render emojis differently (Apple vs Windows vs Linux).

**Solution:** Download all emojis as PNG from Twitter's Twemoji CDN and embed them:

- In SVG: As base64 data URIs in `<image>` elements
- In PDF: As `\includegraphics` LaTeX commands
- In GitHub Markdown: As `<img>` tags for problematic emojis

### 2. ZWJ Sequence Handling

**Problem:** Compound emojis like `👨‍🍳` (man cook) are actually THREE codepoints: `👨` + `ZWJ` + `🍳`

**Solution:** Match longer sequences FIRST in regex, before individual emojis.

### 3. Regional Indicator Flags (Cross-Platform Issue)

**Problem:** Country flags like `🇧🇷` are TWO regional indicator symbols combined. **Windows does not render these flags** — they appear as two-letter codes (BR, IT, etc.) instead of flag images.

**Why Windows fails:** Windows uses Segoe UI Emoji which doesn't include flag glyphs (political reasons). macOS and Linux render flags correctly.

**Solution for GitHub:** Replace flag emojis with inline PNG images using `<img>` tags:

```javascript
// Flag mapping in replace-flags.js
const FLAGS = {
    '🇧🇷': '1f1e7-1f1f7.png',  // Brazil
    '🇮🇹': '1f1ee-1f1f9.png',  // Italy
    '🇮🇳': '1f1ee-1f1f3.png',  // India
    '🇨🇳': '1f1e8-1f1f3.png',  // China
    '🇯🇵': '1f1ef-1f1f5.png',  // Japan
};

// Replace with inline image
const imgTag = `<img src="${relativePath}/${filename}" alt="${flag}" height="16">`;
```

**Usage:**

```bash
node build/replace-flags.js
```

This replaces all flag emojis in `github-version/` with PNG images that render on all platforms.

### 4. Mixed Text + Emoji Lines

**Problem:** Lines like `💚 IBS-Friendly • 🧒 Picky-Approved` have both text AND emojis.

**Solution:** Split line into segments, create SVG `<g>` group with positioned `<text>` and `<image>` elements.

### 5. Incremental Builds

**Problem:** Full rebuilds are slow when only one file changed.

**Solution:** Hash-based manifest tracks file changes; only process what's needed.

---

## Dependencies

### Node.js packages
```json
{
  "sharp": "^0.33.0",    // SVG→PNG conversion
  "https": "built-in"     // Twemoji downloads
}
```

### System requirements
- **Node.js** 18+ (for Unicode regex support)
- **Pandoc** 3.0+ (Markdown→LaTeX)
- **LuaLaTeX** (TeX Live or MiKTeX)
- **TikZ** package (for cover page)

---

### 7. `cookbook-qa.ps1` — Quality Assurance

**Purpose:** Automated QA analysis for the generated PDF — checks consistency, typos, and character references.

**Location:** `build/cookbook-qa.ps1`

**Usage:**
```powershell
.\build\cookbook-qa.ps1
.\build\cookbook-qa.ps1 -PdfPath ".\book\output\The-Alex-Cookbook-Digital.pdf"
.\build\cookbook-qa.ps1 -OutputReport ".\book\output\qa-report.txt"
```

**How it works:**
1. Extracts text from PDF using `pdftotext` (Poppler)
2. Analyzes document statistics (word count, page estimate)
3. Checks character emoji consistency (Alex=🧑‍🍳, Claudia=👩‍🦱, Douglas=🧒, Freddy=🐕, Jolly=🐩)
4. Verifies pronoun consistency per character
5. Detects common typos (doubled words, misspellings)
6. Validates difficulty and IBS terminology

**Character definitions:**
```powershell
$CharacterEmojis = @{
    "Alex"    = "🧑‍🍳"    # Chef emoji
    "Claudia" = "👩‍🦱"    # Woman brunette
    "Douglas" = "🧒"      # Child
    "Freddy"  = "🐕"      # Dog
    "Jolly"   = "🐩"      # Poodle
}
```

**Requires:** `pdftotext` from Poppler (or MiKTeX)

---

## Troubleshooting

### Emojis appear as boxes or wrong characters
1. Run `node build/extract-emojis.js` to download missing PNGs
2. Check `emoji-map.json` has the emoji entry
3. For ZWJ sequences, ensure the full sequence is in the map

### Flags not rendering
1. Verify flag PNG exists: `book/assets/emojis/1f1xx-1f1xx.png`
2. Check regex matches flag pairs before individual indicators

### PDF build fails
1. Ensure all emoji PNGs exist in `book/assets/emojis/`
2. Check LaTeX installation: `lualatex --version`
3. Review `book/output/cookbook-combined.md` for malformed content

### Social preview broken
1. Run `node build/convert-social-preview.js`
2. Check console output for "⚠ Missing PNG" warnings
3. Verify Sharp is installed: `npm install sharp`

---

## Adding New Emojis

1. Add emoji to any Markdown file
2. Run `node build/extract-emojis.js`
3. Check `emoji-map.json` for new entry
4. If ZWJ/flag emoji, manually add to map if auto-detection missed it

---

*Last updated: February 2026*

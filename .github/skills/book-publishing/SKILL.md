---
applyTo: "**/*book*,**/*cookbook*,**/*publish*,**/*pandoc*,**/*latex*,**/build-pdf*"
---

# Book Publishing Skill

> End-to-end PDF book publishing pipeline using Pandoc, LaTeX, and modern asset processing.

## Pipeline Overview

```text
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  Markdown   │───▶│  Asset       │───▶│  Pandoc +   │───▶│  PDF Output  │
│  Chapters   │    │  Processing  │    │  LuaLaTeX   │    │  (Print/Web) │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
       │                  │                   │
       ▼                  ▼                   ▼
   - Recipe MD        - SVG→PNG           - YAML config
   - TOC structure    - Emoji embed       - Header/footer
   - Front matter     - Cover convert     - Page layout
```

## Project Structure

```text
book/
├── 00a-cover.md             # Custom cover (LaTeX)
├── 00b-dedication.md        # Dedication page
├── 00c-introduction.md      # Author introduction
├── 00d-meet-author.md       # About the author/transparency
├── 00e-readers-guide.md     # How to use, legend, family notes
├── cover.svg                # SVG cover design
├── chapters/
│   ├── 01-appetizers/
│   │   └── README.md        # Chapter content
│   └── .../
├── appendices/
│   └── appendix-a-*/
└── assets/
    ├── banners/             # Chapter SVG banners
    │   └── png/             # Converted PNGs (generated)
    ├── emojis/              # Twemoji PNG files
    │   └── emoji-map.json   # Emoji → filename mapping
    └── images/              # Recipe photos

build/
├── build-pdf.ps1            # Main build script
├── cookbook.yaml            # Print config (twoside)
├── cookbook-digital.yaml    # Digital config (oneside)
├── convert-svgs.js          # Banner conversion
├── convert-cover.js         # Cover conversion
├── emoji-map.json           # Build-time emoji map
└── extract-emojis.js        # Scan for missing emojis
```

## Dual Build System

| Version | Config File | Key Setting | Purpose |
|---------|-------------|-------------|---------|
| **Print** | `cookbook.yaml` | `twoside`, `openright` | Physical book printing |
| **Digital** | `cookbook-digital.yaml` | `oneside` | PDF readers, no blank pages |

### Print vs Digital Differences

| Feature | Print (twoside) | Digital (oneside) |
|---------|-----------------|-------------------|
| Blank pages | Yes (chapters start right) | No |
| Margins | Mirror (inner binding) | Equal |
| Page headers | Left/Right alternate | Consistent |
| File size | Larger (blank pages) | Smaller |

## Color Emoji Pipeline

### Problem

LaTeX renders emoji as monochrome glyphs. SVG emoji `<text>` elements don't survive PDF conversion.

### Solution: Twemoji PNG Embedding

```javascript
// 1. Download Twemoji PNGs from CDN
const TWEMOJI_CDN = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/';

// 2. Create emoji → filename map
{
    "🍳": "1f373.png",      // Simple emoji
    "👨‍🍳": "1f468-200d-1f373.png",  // ZWJ sequence
    "🧔‍♂️": "1f9d4-200d-2642-fe0f.png"  // Gender variant
}

// 3. Replace <text> with embedded <image>
function replaceEmojisInSvg(svg) {
    // <text x="25" y="45" font-size="28">🥣</text>
    // becomes:
    // <image x="25" y="17" width="28" height="28"
    //        href="data:image/png;base64,..."/>
}
```

### Emoji Filename Patterns

| Emoji Type | Pattern | Example |
|------------|---------|---------|
| Simple | `{codepoint}.png` | 🍳 → `1f373.png` |
| With selector | `{code}-fe0f.png` | ☀️ → `2600-fe0f.png` |
| ZWJ sequence | `{code1}-200d-{code2}.png` | 👨‍🍳 → `1f468-200d-1f373.png` |
| Skin tone | `{base}-{skin}.png` | 👋🏻 → `1f44b-1f3fb.png` |

### Code Points

```javascript
// Get codepoint for emoji
const codepoint = '🍳'.codePointAt(0).toString(16); // "1f373"

// ZWJ sequences (multiple codepoints joined by 200d)
const zwj = [...'👨‍🍳'].map(c => c.codePointAt(0).toString(16)).join('-');
// "1f468-200d-1f373"
```

## SVG to PNG Conversion

### Dependencies

```json
{
    "sharp": "^0.33.5"  // High-performance image processing
}
```

### Conversion Script Pattern

```javascript
const sharp = require('sharp');

async function convertSvgToPng(svgPath, pngPath) {
    let svg = fs.readFileSync(svgPath, 'utf8');

    // 1. Embed relative image paths as base64
    svg = embedImagePaths(svg);

    // 2. Replace emoji text with base64 PNG images
    svg = replaceEmojisInSvg(svg);

    // 3. Convert with Sharp at high DPI
    await sharp(Buffer.from(svg), { density: 300 })
        .png({ quality: 100, compressionLevel: 6 })
        .toFile(pngPath);
}
```

### Image Embedding

```javascript
// Convert relative paths to embedded base64
function embedImagePaths(svg) {
    // href="./assets/emojis/1f373.png"
    // becomes:
    // href="data:image/png;base64,iVBORw0KGgo..."

    return svg.replace(
        /<image([^>]*)href="\.\/([^"]+)"([^>]*)\/>/g,
        (match, before, relPath, after) => {
            const data = fs.readFileSync(absPath);
            const base64 = data.toString('base64');
            return `<image${before}href="data:image/png;base64,${base64}"${after}/>`;
        }
    );
}
```

## Pandoc + LaTeX Configuration

### YAML Metadata File

```yaml
documentclass: book
classoption:
  - twoside      # Print: alternating margins
  - openright    # Print: chapters start on right page
  # OR
  - oneside      # Digital: no blank pages

papersize: letter
geometry:
  - margin=1in
  - top=1.25in
  - bottom=1.25in
fontsize: 11pt

# Custom fonts (LuaLaTeX)
header-includes:
  - |
    \usepackage{fontspec}
    \setmainfont{Segoe UI}
    \setsansfont{Segoe UI}
    \setmonofont{Cascadia Code}
```

### LaTeX Header/Footer

```latex
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[LE,RO]{\thepage}           % Page number outside
\fancyhead[RE]{\textit{Book Title}}    % Even pages: title
\fancyhead[LO]{\textit{\leftmark}}     % Odd pages: chapter
\fancyfoot[C]{\small Tagline}
```

### Custom Cover Integration

```latex
% In combined markdown, before content:
\thispagestyle{empty}
\begin{center}
\includegraphics[width=\textwidth]{path/to/cover.png}
\end{center}
\newpage
\pagenumbering{roman}
\tableofcontents
\newpage
\pagenumbering{arabic}
```

## Build Script Structure

```powershell
# build-pdf.ps1
$ErrorActionPreference = "Stop"

# 1. Convert SVG assets to PNG
node build/convert-svgs.js
node build/convert-cover.js

# 2. Combine markdown files
$chapters | ForEach-Object {
    $content = Get-Content $_ -Raw
    # Process: banner paths, emoji, HTML→MD
}

# 3. Build both versions
function Build-CookbookPdf {
    param($ConfigFile, $OutputPdf, $Label)

    pandoc $CombinedMd `
        --defaults $ConfigFile `
        --pdf-engine=lualatex `
        --output $OutputPdf
}

Build-CookbookPdf -ConfigFile "cookbook.yaml" -OutputPdf "Print.pdf"
Build-CookbookPdf -ConfigFile "cookbook-digital.yaml" -OutputPdf "Digital.pdf"
```

## Content Processing

### Banner Placement

```powershell
# Move banner AFTER heading to prevent page break separation
# Before: <img banner> \n # Chapter
# After:  # Chapter \n <img banner>

$Content = $Content -replace `
    '(<img[^>]*banner[^>]*>)\s*\n(#\s+[^\n]+)', `
    '$2`n$1'
```

### Image Path Conversion

```powershell
# Convert SVG references to PNG
$Content = $Content -replace `
    'src="\.\.(/assets/banners/)([^"]+)\.svg"', `
    'src="../$1png/$2.png"'
```

### HTML Conversion

```powershell
# Convert <br> to line breaks
$Content = $Content -replace '<br\s*/?>', '  '

# Convert details/summary to markdown
$Content = $Content -replace '<details[^>]*>', ''
$Content = $Content -replace '<summary>(.*?)</summary>', '**$1**'
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| B&W emojis | LaTeX font rendering | Embed Twemoji PNGs |
| Missing emojis | Not in emoji-map.json | Run `extract-emojis.js` |
| Double blank pages | `twoside` + `\newpage` | Remove extra `\newpage` |
| Cover not rendering | Relative paths in SVG | Use base64 embedding |
| Fonts missing | System fonts not found | Install or use fallback |
| Orphan section titles | Page break before heading | Use `needspace` package |
| `###` merged with text | Missing blank line before heading | Ensure blank line before all headings |
| Lists run together | Missing blank line after bold line | Add blank line between header and list |
| Raw `\newpage` ignored | Pandoc needs explicit LaTeX block | Wrap in `{=latex}` block |

### Debug Commands

```powershell
# Check for missing emojis
node build/extract-emojis.js

# Test single SVG conversion
node -e "require('./build/convert-svgs.js')"

# Verbose Pandoc output
pandoc ... --verbose 2>&1 | Select-String "error|warning"
```

## Required Tools

| Tool | Purpose | Install |
|------|---------|---------|
| **Node.js** | Asset processing | `winget install OpenJS.NodeJS` |
| **Sharp** | SVG→PNG conversion | `npm install sharp` |
| **Pandoc** | Markdown→LaTeX | `winget install JohnMacFarlane.Pandoc` |
| **LuaLaTeX** | PDF rendering | MiKTeX or TeX Live |
| **PowerShell** | Build orchestration | Built into Windows |

## Best Practices

### Asset Management

- Keep emoji PNGs in `assets/emojis/` with `emoji-map.json`
- Generate PNG banners to `assets/banners/png/` (gitignore)
- Use consistent DPI (300) for print quality

### Build Hygiene

- Always generate both Print and Digital versions
- Clean build output before release
- Version control configs, not generated files

### Content Structure

- One chapter per directory with README.md
- Banners use consistent naming: `chapter-name.svg`
- Front matter uses `00-` prefix for ordering

## Typography & Spacing

### Line Spacing Configuration

```yaml
# In cookbook.yaml
header-includes:
  - |
    \usepackage{setspace}
    \setstretch{1.2}  % Body text line spacing
    \renewcommand{\arraystretch}{1.15}  % Table row spacing
```

### Orphan Prevention

```yaml
header-includes:
  - |
    \usepackage{needspace}
    % Before sections requiring space:
    % \needspace{5\baselineskip}
```yaml
header-includes:
  - |
    \usepackage{needspace}
    % Before sections requiring space:
    % \needspace{5\baselineskip}
```

### Raw LaTeX in Markdown

When you need explicit LaTeX commands (like `\newpage`) in Pandoc markdown, wrap them in a raw LaTeX block:

````markdown
```{=latex}
\newpage
```
````

**Note:** A bare `\newpage` outside the raw block will be ignored by Pandoc.

## Front Matter Organization

### Professional Book Structure (Industry Standard)

| Order | Element | Page Numbering | Notes |
|-------|---------|----------------|-------|
| 1 | **Cover** | None | Full-page artwork |
| 2 | **Half Title** | Roman (i) | Book title only, no author |
| 3 | **Title Page** | Roman | Full title, author, publisher |
| 4 | **Copyright** | Roman | ©, rights, ISBN, disclaimers |
| 5 | **Dedication** | Roman | Optional |
| 6 | **Table of Contents** | Roman | Auto-generated by LaTeX |
| 7 | **Introduction/Preface** | Roman | Author's voice |
| 8 | **Chapter 1** | Arabic (1) | First numbered page |

### Key Rules

- **Roman numerals** for front matter → Allows last-minute additions without renumbering
- **Arabic numerals** start fresh at Chapter 1 → Clean break from front matter
- **Unnumbered sections** → Front matter headings use `{.unnumbered}` in Pandoc
- **Appendices** → Letter-based (A, B, C) via `\appendix` LaTeX command

### Cookbook Exception (Joel Friedlander)

> "Although rag-right composition is fine in books with little text, like **art books or cookbooks**, virtually all other books ought to be set with justified composition."

Cookbooks can use **ragged right (left-aligned)** text because:
- Recipes have short lines and frequent breaks
- Ingredient lists don't benefit from justification
- Visual clarity matters more than text blocks

### Recommended File Structure

| File Pattern | Purpose | Content |
|--------------|---------|---------|
| `00-cover.md` | Cover | LaTeX cover page with graphics |
| `00ab-halftitle.md` | Half Title | Simple centered title |
| `00aa-copyright.md` | Copyright | © notice, rights, disclaimers |
| `00a-dedication.md` | Dedication | Personal dedication |
| `00b-introduction.md` | Introduction | Hook, manifesto, mission |
| `00c-*` | About Author | Identity, transparency |
| `00d-*` | Behind Scenes | Process, meta-commentary |
| `00e-readers-guide.md` | Reader's Guide | How to use, legend, family notes |

### Build Script Pattern Matching

```powershell
# Match ALL front matter files for unnumbered headings
if ($Chapter -match 'book\\00(a[ab]?|[b-e])-') {
    $Content = $Content -replace '^(#{1,4} [^\r\n{]+)(\r?\n)', '$1 {.unnumbered}$2'
}

# Switch to appendix mode for back matter
if ($Chapter -match 'book\\16-') {
    $CombinedContent += "`n`n\appendix`n`n"
}
```

### Key Insight

> **LaTeX auto-generates TOC** — Don't duplicate with manual table of contents file. Instead, use that space for reader-useful content like symbol legends, dietary guides, etc.

## Synapses

This skill connects to:
- **svg-graphics** → Banner and cover creation
- **graphic-design** → Visual composition principles
- **writing-publication** → Content structure and editing
- **project-scaffolding** → Build system organization
- **image-handling** → Asset pipeline and conversion

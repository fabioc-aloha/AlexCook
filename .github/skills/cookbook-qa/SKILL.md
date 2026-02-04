# Cookbook QA Skill

## Purpose
Automated quality assurance for The Alex Cookbook PDF generation, ensuring consistency in terminology, character representation, and content quality.

## Activation Triggers
- "QA the cookbook"
- "run QA analysis"
- "check the PDF"
- "extract PDF text"
- "audit cookbook"

## Quick Reference

### Run QA Analysis
```powershell
# From project root
.\build\cookbook-qa.ps1

# With specific PDF
.\build\cookbook-qa.ps1 -PdfPath ".\book\output\The-Alex-Cookbook-Digital.pdf"

# Save report
.\build\cookbook-qa.ps1 -OutputReport ".\book\output\qa-report.txt"
```

### Manual Text Extraction
```powershell
pdftotext -layout ".\book\output\The-Alex-Cookbook-Print.pdf" ".\book\output\pdf-text.txt"
```

## Character Emoji Standards

| Character | Emoji | Notes |
|-----------|-------|-------|
| **Alex** | 🧑‍🍳 | Chef - AI author |
| **Claudia** | 👩‍🦰 | Woman with red hair - wife, IBS |
| **Douglas** | 🧒 | Child - picky eater son |
| **Freddy** | 🐕 | Dog (generic) - male |
| **Jolly** | 🐩 | Poodle - female |

### Important Distinctions
- `🐕` is used for generic "dog-safe treat" tags in the Legend
- `🐩` is specifically for Jolly (she's a poodle!)
- Jolly is **female** - use she/her pronouns

## Terminology Standards

### Difficulty Levels
**Standard:** Simple | Medium | Complex

| Correct | Incorrect |
|---------|-----------|
| Simple 🟢 | ~~Easy~~ |
| Medium 🟡 | — |
| Complex 🔴 | ~~Hard~~ |

### IBS Tags
**Standard:** `IBS-Friendly` (capitalized)

| Correct | Incorrect |
|---------|-----------|
| IBS-Friendly | ~~IBS-friendly~~ |
| Low-FODMAP | ~~LOW-FODMAP~~ |

## QA Checks Performed

### 1. Document Statistics
- Total lines, characters, words
- Estimated page count

### 2. Family Mentions
- Count of each family member name
- Ensures all characters are represented

### 3. Difficulty Terminology
- Flags "Easy" in recipe headers (should be "Simple")
- Flags "Hard" in recipe headers (should be "Complex")

### 4. IBS Terminology
- Checks capitalization consistency
- Prefers "IBS-Friendly" over "IBS-friendly"

### 5. Typo Detection
- Doubled words (the the, a a, etc.)
- Common misspellings

### 6. Pronoun Consistency
- Jolly (female) shouldn't be "he/him"
- Freddy (male) shouldn't be "she/her"

### 7. Chapter Numbering
- Notes duplicate chapter numbers (front matter vs recipes)
- This is expected behavior, not an error

### 8. Emoji Consistency
- Checks Jolly uses 🐩 not 🐕
- Verifies ZWJ emojis render as single images (Alex 🧑‍🍳, Claudia 👩‍🦰)

## Build Script Emoji Handling

The `build-pdf.ps1` script converts emojis to inline images using `emoji-map.json`.

**Critical Fix (2026-02-03)**: Emoji replacement must sort keys by length descending to prevent ZWJ sequences from being split:

```powershell
# CORRECT: Sort by length so compound emojis match first
$sortedEmojis = $EmojiMap.Keys | Sort-Object { $_.Length } -Descending
foreach ($emoji in $sortedEmojis) {
    $Content = $Content.Replace($emoji, $replacement)
}
```

This prevents `🧑‍🍳` (chef) from becoming two separate images (🧑 + 🍳).

## Files to Update When Fixing

When fixing character emojis or pronouns, check these files:

```
book/00e-readers-guide.md      # Cast of Characters table
github-version/README.md       # GitHub version Cast of Characters
```

For recipe-specific fixes, check all chapter files:
```
book/01-appetizers.md
book/02-soups-salads.md
... etc
```

## Common Issues & Fixes

### Jolly Wrong Emoji
```powershell
# Find occurrences
Select-String -Path ".\book\*.md" -Pattern "Jolly.{0,3}🐕|🐕.{0,3}Jolly"

# Fix: Replace 🐕 with 🐩 near Jolly's name
```

### Jolly Wrong Pronoun
```powershell
# Find occurrences
Select-String -Path ".\book\*.md" -Pattern "Jolly.{0,50}( He | he )"

# Fix: Change "He" to "She"
```

### Easy → Simple
```powershell
# Find recipes using "Easy"
Select-String -Path ".\book\*.md" -Pattern "Difficulty:.+Easy"

# Fix: Replace "Easy" with "Simple" in Difficulty lines
```

## Integration with Build

The QA script should be run after building the PDF:

```powershell
# Full build + QA workflow
.\build\build-pdf.ps1
.\build\cookbook-qa.ps1
```

## Dependencies

- **pdftotext**: Required for PDF text extraction
  - Comes with Poppler utilities
  - Or install via MiKTeX

## Output Files

| File | Purpose |
|------|---------|
| `book/output/pdf-text.txt` | Extracted plain text from PDF |
| `book/output/qa-report.txt` | Optional saved QA report |

## Synapses

- [build-pdf.ps1](../build/build-pdf.ps1) → Primary build script
- [cookbook-qa.ps1](../build/cookbook-qa.ps1) → QA automation script
- [00e-readers-guide.md](../book/00e-readers-guide.md) → Character definitions

# Book Formatting Standards & Best Practices

> Research compiled for The Alex Cookbook PDF production
> Sources: The Book Designer, Jane Friedman, Reedsy, Joel Friedlander

---

## Front Matter

### Standard Order (Professional Books)

1. **Half title page** — Book title only, no author name
2. **Title page** — Title, subtitle, author, publisher
3. **Copyright page** — ISBN, copyright notice, edition info
4. **Dedication**
5. **Table of Contents**
6. **Foreword / Preface / Introduction**

### Key Rules

| Rule | Rationale |
|------|-----------|
| Use **Roman numerals** (i, ii, iii, v, ix...) | Distinguishes front matter from main content |
| **No section numbers** (no "0.1", "0.2") | Front matter is preparatory, not part of numbered content |
| **No chapter labels** | Don't use "Chapter 1" for Dedication, Introduction, etc. |
| First chapter resets to **Arabic page 1** | Clean break between front matter and main content |

### Why Roman Numerals?

If you need to add a last-minute foreword or dedication, inserting pages won't disrupt the main text pagination. This is crucial for indexed books where page number changes would require reindexing.

---

## Chapter Formatting

### Chapter Opener Pages

| Element | Standard |
|---------|----------|
| **Starting position** | Right-hand page (recto) for print |
| **Page number** | Drop folio (bottom of page), or blind folio (no number) |
| **Running headers** | Omit on chapter opener pages |
| **Title size** | 18–30pt, clear hierarchy |
| **Drop caps** | Optional, 2-3 line depth for first letter |

### Why Start on Right Pages?

- Easier for readers to find chapter beginnings
- Easier to add/delete pages during production without disrupting layout
- Exception: Books with 20+ short chapters (too many blank pages)

### Chapter Numbers

Options for displaying chapter numbers:
- Chapter 1 / Chapter 2
- Chapter One / Chapter Two
- 1 / 2 (numeral only)
- CHAPTER 1 (all caps)

Use **Roman numerals for Parts** and **Arabic for Chapters** to distinguish hierarchy:
> Part II, Chapter 5

---

## Body Text Typography

### Professional Standards

| Element | Recommended |
|---------|-------------|
| **Justification** | Full justified (both margins align) |
| **Hyphenation** | Enabled (prevents gaps and rivers) |
| **Font size** | 10–12pt for body text |
| **Leading** | At least 2pt greater than font size (e.g., 11pt/14pt) |
| **Paragraph indent** | ~0.25" (1p6 in printer's terms) |
| **Color** | Black for body text, even in color books |

### ⚠️ COOKBOOK EXCEPTION: Ragged Right is Acceptable

**Joel Friedlander specifically noted:**
> "Although rag-right composition is fine in books with little text, like **art books or cookbooks**, virtually all other books, in my opinion, ought to be set with justified composition."

**Why cookbooks can use ragged right:**
- Recipes have short lines and many line breaks
- Ingredient lists don't benefit from justification
- Full justification can create awkward spacing in short recipe steps
- Visual clarity matters more than text blocks in recipe layouts

**Recommendation for The Alex Cookbook:**
- **Recipes**: Ragged right (left-aligned) is acceptable and may look cleaner
- **Narrative sections** (Introduction, Behind the Scenes): Full justified for professional look
- **Be consistent** within each section type

### Common Amateur Mistakes

From Joel Friedlander's list:

1. ❌ Not using full justification (ragged right looks unprofessional)
2. ❌ Not hyphenating text (causes ugly gaps and spacing)
3. ❌ Odd-numbered pages on left (should always be on right)
4. ❌ Running headers on chapter opener pages
5. ❌ Margins too small to hold the book comfortably
6. ❌ No copyright page

---

## Back Matter

### What Belongs in Back Matter

- Appendices (lettered: Appendix A, B, C)
- Glossary
- Bibliography / References
- Index
- About the Author
- Acknowledgments (can also be front matter)

### Key Rules

| Rule | Rationale |
|------|-----------|
| Use **letters** not numbers | "Appendix A" not "Chapter 16" |
| Often **unnumbered** | Reference sections don't need chapter treatment |
| Distinct from chapters | Reader should recognize shift to supplementary material |

---

## Page Layout

### Margins

| Area | Minimum | Recommended |
|------|---------|-------------|
| **Gutter (inside)** | 0.5" | 0.75–1" (accounts for binding) |
| **Outside** | 0.5" | 0.75" |
| **Top** | 0.5" | 0.75–1" |
| **Bottom** | 0.5" | 0.75–1" |

### Widow & Orphan Control

- **Widow**: Last line of paragraph at top of new page — AVOID
- **Orphan**: First line of paragraph at bottom of page — AVOID
- Set penalties to 10000 in LaTeX to prevent

### Running Headers/Footers

Typical content:
- Page number (always)
- Book title (even pages / verso)
- Chapter title (odd pages / recto)
- Author name (optional)

**Omit running headers from:**
- Chapter opener pages
- Part opener pages
- Blank pages
- Rotated/landscape pages

---

## Subheadings & Lists

### Subhead Hierarchy

- Should be immediately recognizable through size, weight, or style
- Typically 2-4 levels in nonfiction
- No drop cap after a subhead (starts flush left)

### Lists

| Type | Use Case |
|------|----------|
| Bulleted | Unordered items, no sequence |
| Numbered | Sequential steps, priority |
| Unnumbered | Simple lists without emphasis |

- Indent lists from body text
- Add line space above and below
- Bullet style should match overall design

### Extracts/Blockquotes

- Set 0.5–1pt smaller than body text
- Indent both left and right margins
- Add line space above and below
- Use same typeface as body

---

## Digital vs Print Considerations

### Print-Specific

- Bleed area for full-page images
- Gutter margin accounts for binding
- Two-page spreads need careful design
- Color printing is expensive (most books are B&W)

### E-book Specific

- Pagination is dynamic (screen size varies)
- Hyperlinked TOC is essential
- Images should be optimized for screens
- Cover needs to work at thumbnail size
- High contrast, large type for cover text

---

## The Alex Cookbook: Recommended Structure

### Front Matter (Roman numerals, unnumbered)

```
├── Cover
├── Half Title
├── Title Page
├── Copyright
├── Dedication
├── Introduction
├── Meet Alex
├── Behind the Scenes (A Preemptive Response)
├── Reader's Guide (How to Use This Book)
└── Table of Contents (auto-generated by Pandoc)
```

### Main Content (Arabic numerals, Chapter 1-15)

```
├── Chapter 1: Appetizers & Starters
├── Chapter 2: Soups & Salads
├── Chapter 3: Main Courses
├── Chapter 4: Sides & Accompaniments
├── Chapter 5: Desserts & Sweets
├── Chapter 6: Breakfast & Brunch
├── Chapter 7: Drinks & Cocktails
├── Chapter 8: Sauces & Condiments
├── Chapter 9: Bread & Baking
├── Chapter 10: Special Occasions
├── Chapter 11: Treats for the Pack
├── Chapter 12: The Art of Steak
├── Chapter 13: Meat & Potatoes Comfort
├── Chapter 14: Alex's Favorites
└── Chapter 15: The Unhinged Kitchen
```

### Back Matter (Appendix letters or unnumbered)

```
├── Appendix A: Foods of Desire (Aphrodisiac Guide)
├── Appendix B: The Rice Chronicles
├── Cooking Conversions (Reference, unnumbered)
├── Kitchen Essentials (Reference, unnumbered)
├── Amazon Shopping List (Reference, unnumbered)
└── References & Further Reading
```

---

## Implementation Notes for Pandoc/LaTeX

### Front Matter Handling

```latex
% Use Roman numerals for front matter
\pagenumbering{roman}

% Mark sections as unnumbered
# Dedication {.unnumbered}

% Switch to Arabic at Chapter 1
\pagenumbering{arabic}
\setcounter{chapter}{0}
```

### Appendix Handling

```latex
% Switch to appendix mode
\appendix

% Now chapters become Appendix A, B, C...
```

### Suppress Section Numbering in Front Matter

All H1-H4 headings in front matter files should use `{.unnumbered}` attribute to prevent "0.1", "0.2" numbering.

---

## 📋 Implementation Checklist

Track progress applying these standards to The Alex Cookbook.

### 🔴 Priority 1 — Critical

- [x] **Add copyright page** (`book/00aa-copyright.md`) ✅
  - © notice, rights reserved, disclaimer for Chapter 15 untested recipes
  - Insert after title page in build order

### 🟡 Priority 2 — Important

- [x] **Add half-title page** (`book/00ab-halftitle.md`) ✅
  - Simple "The Alex Cookbook" title only
  - Professional touch, low effort
- [x] **Clean Reader's Guide duplicate content** ✅
  - Removed banner/tagline repetition from `00e-readers-guide.md`
  - Now starts with "Reader's Guide" heading directly
- [x] **Update front matter order in build script** ✅
  - New order: Cover → Half Title → Copyright → Dedication → Intro → Meet Alex → Behind Scenes → Reader's Guide

### 🟢 Priority 3 — Nice to Have

- [ ] **Replace `\bigskip` LaTeX commands** (100+ instances)
  - Deferred: Works fine for PDF (primary output), only affects GitHub rendering
  - Future: Could strip in GitHub-version build pipeline

### ✅ Completed

- [x] Front matter sections unnumbered (no 0.1, 0.2)
- [x] Appendices use `\appendix` command (Appendix A, B, C)
- [x] Build script updated for Pandoc 3.8 format
- [x] Formatting standards research documented
- [x] Cookbook ragged-right exception noted
- [x] **All 15 chapters match title format** — Verified `# 🎨 Chapter N: Title`
- [x] **Appendix titles use letters** — A, B, C, D format confirmed
- [x] **Copyright page added** — `book/00aa-copyright.md` with disclaimer for Ch15
- [x] **Half-title page added** — `book/00ab-halftitle.md`
- [x] **Reader's Guide cleaned** — Removed duplicate banner/tagline
- [x] **Build script order updated** — New front matter sequence in `$Chapters`
- [x] **Behind the Scenes softened** — Renamed to "Behind the Kitchen Door"

---

## Sources

- **Joel Friedlander** — [The Book Designer](https://thebookdesigner.com)
- **Jane Friedman** — [janefriedman.com](https://janefriedman.com)
- **Reedsy Blog** — [reedsy.com/blog](https://reedsy.com/blog)
- **Pete Masterson** — *Book Design & Production*

---

*Last updated: February 3, 2026*

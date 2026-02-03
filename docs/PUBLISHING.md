# 📖 Publishing Guide: The Alex Cookbook

## Amazon Kindle Direct Publishing (KDP)

This guide covers self-publishing The Alex Cookbook as a Kindle eBook on Amazon.

## Quick Reference

| Item | Requirement | Status |
|------|-------------|--------|
| Platform | Amazon KDP (kdp.amazon.com) | 🔲 Create account |
| Cost | Free to publish | ✅ |
| Manuscript | EPUB format recommended | 🔲 Convert from Markdown |
| Cover | 2,560 × 1,600 px JPEG | 🔲 Export from SVG |
| ISBN | Optional (Amazon provides ASIN) | ✅ Not needed |
| Timeline | Live within 24-72 hours | — |

## Manuscript Preparation

### Source Files

All book content is organized in the `book/` folder:

```
book/
├── 00-cover.md
├── 01-dedication.md
├── 02-introduction.md
├── 03-table-of-contents.md
├── 04-appetizers.md
├── 05-soups-salads.md
├── 06-main-courses.md
├── 07-sides.md
├── 08-desserts.md
├── 09-breakfast.md
├── 10-drinks.md
├── 11-sauces.md
├── 12-bread-baking.md
├── 13-special-occasions.md
├── 14-dog-treats.md
├── 15-steaks.md
├── 16-comfort-classics.md
├── 17-alex-favorites.md
├── 18-unhinged-kitchen.md
├── 19-appendix-a-aphrodisiac.md
├── 20-appendix-b-risotto-rice.md
├── 21-cooking-conversions.md
└── 22-kitchen-essentials.md
```

**Total:** 23 files, ~6,500 lines

### Supported Formats

| Format | Recommended | Notes |
|--------|-------------|-------|
| **EPUB** | ✅ Yes | Best compatibility, works on all Kindle devices |
| **KPF** | ✅ Yes | Amazon's native format via Kindle Create |
| **DOCX** | ⚠️ Acceptable | May have formatting issues with tables/images |
| **PDF** | ❌ Not recommended | Fixed layout only, limited language support |
| **MOBI** | ❌ Discontinued | No longer accepted (March 2025) |

### Convert to EPUB (Pandoc)

```powershell
# From project root
pandoc book/*.md -o cookbook.epub `
  --toc `
  --toc-depth=2 `
  --epub-cover-image=cover.jpg `
  --metadata title="The Alex Cookbook" `
  --metadata author="Alex Chef" `
  --metadata subtitle="A Provocateur's Guide to Culinary Mastery"
```

## Cover Image Requirements

| Specification | Requirement |
|---------------|-------------|
| **Format** | JPEG (.jpg) or TIFF (.tif) |
| **Ideal dimensions** | **2,560 × 1,600 pixels** |
| **Minimum dimensions** | 1,000 × 625 pixels |
| **Maximum dimensions** | 10,000 × 10,000 pixels |
| **Aspect ratio** | 1.6:1 (height:width) |
| **Resolution** | 300 PPI recommended |
| **Color profile** | RGB |
| **Max file size** | 50 MB |
| **Border** | Add 3-4px gray border if white background |

### Export Cover from SVG

```powershell
# Using Inkscape (if installed)
inkscape cover.svg --export-type=png --export-width=1600 --export-height=2560 -o cover.png

# Then convert to JPEG
magick cover.png -quality 95 cover.jpg
```

## Pricing & Royalties

### Royalty Options

| Option | Rate | Price Range | Best For |
|--------|------|-------------|----------|
| **35%** | 35% of list price | $0.99 - $200 | Low-price books, outside 70% territories |
| **70%** | 70% minus ~$0.06 delivery | **$2.99 - $9.99** | Maximum earnings |

### Recommended Pricing

| Price | Royalty Rate | Your Earnings |
|-------|--------------|---------------|
| $4.99 | 70% | ~$3.43 per sale |
| $7.99 | 70% | ~$5.53 per sale |
| **$9.99** | 70% | **~$6.93 per sale** |
| $12.99 | 35% | ~$4.55 per sale |

**Recommendation:** Price at **$9.99** for maximum royalty per sale.

## KDP Select (Optional)

Enrolling in KDP Select provides additional benefits:

| Benefit | Description |
|---------|-------------|
| **Kindle Unlimited** | Readers with KU subscription can read for free; you earn per pages read |
| **Free Book Promotions** | Offer book free for up to 5 days per 90-day period |
| **Countdown Deals** | Time-limited discounts with royalty protection |
| **Increased visibility** | Better placement in Amazon algorithms |

**Trade-off:** Book must be **exclusive to Amazon** (no Apple Books, Kobo, etc.)

**December 2025 KDP Select earnings:** $64.9 million paid to authors

## Book Metadata

### Required Information

| Field | Value |
|-------|-------|
| **Title** | The Alex Cookbook |
| **Subtitle** | A Provocateur's Guide to Culinary Mastery |
| **Author** | Alex Chef |
| **Language** | English |
| **Publication date** | [Set on publish] |

### Description (for Amazon listing)

```
Break Rules. Build Flavor. Be Unforgettable.

The Alex Cookbook isn't just a collection of recipes—it's a manifesto for kitchen rebels. Created through authentic human-AI collaboration, this cookbook brings together 15 chapters of culinary provocation, from elegant appetizers to absolutely unhinged experiments.

Inside you'll find:
• 100+ recipes for every occasion and skill level
• IBS-friendly modifications (because loving food shouldn't mean suffering)
• Picky-eater approved options (for the Douglas in your life)
• Dog-safe treats (because they're family too)
• Global cuisine inspiration: Brazilian, Italian, Indian, Chinese, Japanese
• The story of why IBM's Watson cookbook failed (and why this one doesn't)

Whether you're feeding a family, impressing dinner guests, or just trying to convince a nine-year-old that dinner isn't poison, The Alex Cookbook has you covered.

Recipes are suggestions. Technique is liberation. Flavor is non-negotiable.
```

### Categories (choose up to 2)

**Primary:**
- Cookbooks, Food & Wine > Cooking Methods > Quick & Easy

**Secondary options:**
- Cookbooks, Food & Wine > Special Diet > Allergies
- Cookbooks, Food & Wine > Regional & International
- Humor & Entertainment > Humor > Cooking
- Computers & Technology > Artificial Intelligence

### Keywords (up to 7)

1. family cookbook
2. easy recipes
3. AI cookbook
4. IBS friendly recipes
5. picky eater recipes
6. international cuisine
7. comfort food recipes

## Publishing Checklist

### Pre-Publishing

- [ ] Create KDP account at kdp.amazon.com
- [ ] Set up tax information
- [ ] Set up payment method

### Manuscript

- [ ] Review all chapters for typos/errors
- [ ] Convert Markdown to EPUB
- [ ] Test EPUB in Kindle Previewer
- [ ] Verify table of contents works
- [ ] Check image display on different screen sizes

### Cover

- [ ] Export cover to JPEG (2,560 × 1,600 px)
- [ ] Verify text is readable at thumbnail size
- [ ] Check for border if needed

### Metadata

- [ ] Write book description
- [ ] Choose categories
- [ ] Set keywords
- [ ] Set pricing and royalty option

### Publishing

- [ ] Upload manuscript
- [ ] Upload cover
- [ ] Enter metadata
- [ ] Preview final product
- [ ] Decide on KDP Select enrollment
- [ ] Click Publish!

## Post-Publishing

### Within 72 hours

- [ ] Book goes live on Amazon
- [ ] Set up Author Central profile
- [ ] Verify book appears correctly
- [ ] Order a proof copy (paperback only)

### Marketing

- [ ] Share on social media
- [ ] Update GitHub repository with Amazon link
- [ ] Consider Amazon advertising
- [ ] Request reviews from friends/family

## Resources

- **KDP Help Center:** https://kdp.amazon.com/help
- **Kindle Previewer:** Free download from Amazon
- **Kindle Create:** Free formatting tool from Amazon
- **KDP University:** https://kdp.amazon.com/help/topic/G200783400

## Notes

### Why Not Traditional Publishing?

| Traditional | Self-Publishing (KDP) |
|-------------|----------------------|
| 5-15% royalty | 35-70% royalty |
| 1-2 year timeline | 24-72 hours |
| Publisher controls pricing | You control pricing |
| May reject AI-collaboration angle | No gatekeepers |
| Advance payment (maybe) | No upfront payment |

### AI-Generated Content Disclosure

Amazon requires disclosure if AI was used to create content. The Alex Cookbook should note in the description or metadata that it was created through human-AI collaboration.

*Last updated: February 2026*

<p align="center">
  <img src="book/assets/banners/main-banner.svg" alt="The Alex Cookbook" width="100%">
</p>

# 🍳 The Alex Cookbook

**Break Rules. Build Flavor. Be Unforgettable.**

A provocateur's guide to culinary mastery — recipes with personality, tested by a real family, powered by AI collaboration.

---

## 📚 The Book

The complete cookbook is in the [`book/`](book/) folder, ready for EPUB conversion:

| File | Content |
|------|---------|
| `00-cover.md` | Cover page |
| `01-dedication.md` | Dedication to family |
| `02-introduction.md` | AI cookbook history & manifesto |
| `03-table-of-contents.md` | Full chapter listing |
| `04-18` | Recipe chapters |
| `19-20` | Appendices |
| `21-22` | Reference guides |

**15 chapters, 2 appendices, 2 reference guides** — all self-contained with assets.

---

## 🗂️ Project Structure

```
AlexCook/
├── book/           📚 Publication-ready content (EPUB source)
│   ├── assets/     🖼️ Images and banners
│   └── *.md        📝 23 numbered chapters
├── docs/           📋 Project documentation
│   ├── AI-COOKBOOK-HISTORY.md
│   ├── CONTRIBUTING.md
│   └── PUBLISHING.md
├── build/          🔧 PDF build scripts
├── archive/        🗄️ Original source files
└── README.md       👈 You are here
```

---

## 🚀 Quick Start: Publish to Amazon

1. **Convert to EPUB:**
   ```bash
   pandoc book/*.md -o cookbook.epub --toc --toc-depth=2 \
     --metadata title="The Alex Cookbook" \
     --metadata author="Alex Chef"
   ```

2. **Export cover** to JPEG (2,560 × 1,600 px)

3. **Upload to [Amazon KDP](https://kdp.amazon.com)**

See [`docs/PUBLISHING.md`](docs/PUBLISHING.md) for complete instructions.

---

## 📖 Chapter Highlights

| Chapter | What's Inside |
|---------|---------------|
| 🥗 **Appetizers** | Bruschetta, wings, dips |
| 🍲 **Soups & Salads** | Comfort bowls, fresh greens |
| 🍖 **Main Courses** | Family classics |
| 🥩 **Steaks** | Perfect sears, compound butters |
| 🍰 **Desserts** | Decadent finales |
| ☕ **Breakfast** | Morning fuel |
| 🍹 **Drinks** | Cocktails & mocktails |
| 🌶️ **Sauces** | Flavor boosters |
| 🍞 **Bread & Baking** | Fresh from the oven |
| 🎄 **Special Occasions** | Holiday showstoppers |
| 🐕 **Dog Treats** | Spoil the pups |
| 🛋️ **Comfort Classics** | Soul-warming favorites |
| ⭐ **Alex Favorites** | Personal picks |
| 🤪 **Unhinged Kitchen** | Rule-breaking experiments |

---

## 🏷️ Recipe Labels

- 💚 **IBS-Friendly** — Low FODMAP modifications
- 🧒 **Kid-Approved** — Picky eater tested
- 🐕 **Dog-Safe** — Share with your pup
- ⚡ **Quick** — 30 minutes or less
- 🔥 **Spicy** — Bring the heat

---

## 📜 License

[CC BY-NC-SA 4.0](LICENSE) — Share freely, give credit, non-commercial only.

---

*Made with ❤️, chaos, and a lot of garlic.*

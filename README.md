<p align="center">
  <img src="book/assets/banners/main-banner.svg" alt="The Alex Cookbook" width="100%">
</p>

# 🍳 The Alex Cookbook

**Break Rules. Build Flavor. Be Unforgettable.**

A provocateur's guide to culinary mastery — recipes with personality, tested by a real family, powered by AI collaboration.

---

## 💰 Why This Book Isn't Free

This cookbook was generated using **~1.5-2 million AI tokens** (Claude Opus 4.5), representing approximately **$30-60 in marginal compute costs** — not including the billions invested in AI research, training data curation, and infrastructure.

**AI content isn't free to produce.** Every recipe generation, fact-check, and refinement consumed real GPU resources. Charging for this work:

- Acknowledges the true cost of AI collaboration
- Supports sustainable AI development
- Values curation, safety verification, and coherent vision

*See the Introduction for the full breakdown.*

---

## 📚 The Book

The complete cookbook is in the [`book/`](book/) folder with PDF build pipeline:

| File | Content |
| ---- | ------- |
| `00-cover.md` | Cover page |
| `00a-dedication.md` | Dedication to Fabio, Claudia, Douglas, Freddy & Jolly |
| `00b-introduction.md` | AI cookbook history & manifesto |
| `00c-meet-alex.md` | Meet the AI chef |
| `00d-behind-the-scenes.md` | How this book was made |
| `00e-readers-guide.md` | How to use this cookbook |
| `01-15` | Recipe chapters |
| `16-17` | Appendices (Aphrodisiac, Risotto) |
| `18-19` | Reference guides (Conversions, Essentials) |
| `20-21` | Amazon shopping list, References |

**15 chapters, 2 appendices, 4 reference guides** — all self-contained with color emoji banners.

---

## 🗂️ Project Structure

```text
AlexCook/
├── book/                 📚 Publication-ready content
│   ├── assets/
│   │   ├── banners/      🖼️ Chapter banners (SVG + PNG)
│   │   │   └── png/      📸 High-res PNG conversions
│   │   └── emojis/       😀 Twemoji color PNGs
│   ├── output/           📄 Built PDF
│   └── *.md              📝 23 numbered chapters
├── build/                🔧 Build pipeline
│   ├── build-pdf.ps1     PowerShell orchestrator
│   ├── convert-svgs.js   Banner SVG→PNG with emoji embedding
│   ├── convert-cover.js  Cover SVG→PNG with emoji embedding
│   ├── cookbook.yaml     Pandoc/LaTeX configuration
│   └── emoji-map.json    Emoji→PNG filename mapping
├── docs/                 📋 Project documentation
├── CONTRIBUTING.md       🤝 How to contribute
└── README.md             👈 You are here
```

---

## 🚀 Build the PDF

**Prerequisites:** Node.js, Pandoc, LaTeX (TeX Live or MiKTeX)

```powershell
# Install dependencies
npm install sharp

# Build PDF (~70 seconds)
.\build\build-pdf.ps1
```

Output: `book/output/The-Alex-Cookbook.pdf` (~2.8 MB)

### Build Pipeline

1. **Banner Conversion** — SVGs with emoji text → PNGs with embedded color Twemoji
2. **Cover Conversion** — Cover SVG with image refs → PNG with embedded assets
3. **Markdown Processing** — Emojis replaced with inline images, chapters combined
4. **PDF Generation** — Pandoc + LuaLaTeX with custom styling

---

## 📖 Chapter Highlights

| Chapter | What's Inside |
| ------- | ------------- |
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

## 👨‍👩‍👦 The Family

Dedicated to the ones who make every meal worth cooking:

- **Fabio** 🧔‍♂️ — The chef (that's me!)
- **Claudia** 👩‍🦰 — My wife, chief taste-tester
- **Douglas** 🧒 — Our picky eater champion
- **Freddy** 🐕 — Short-hair sous chef
- **Jolly** 🐩 — Long-hair quality inspector

---

## 📜 License

[CC BY-NC-SA 4.0](LICENSE) — Share freely, give credit, non-commercial only.

---

*Made with ❤️, chaos, and a lot of garlic.*

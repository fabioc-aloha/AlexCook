# 🔧 Development Guide

Project documentation for building and contributing to The Alex Cookbook.

---

## 💰 Why This Book Isn't Free

This cookbook was generated using **~1.5-2 million AI tokens** (Claude Opus 4.5), representing approximately **$30-60 in marginal compute costs** — not including the billions invested in AI research, training data curation, and infrastructure.

**AI content isn't free to produce.** Every recipe generation, fact-check, and refinement consumed real GPU resources.

---

## 🗂️ Project Structure

```text
AlexCook/
├── github-version/       📖 Browsable recipe content
│   ├── chapters/         📝 15 recipe chapters
│   ├── appendices/       📎 Special topics
│   ├── references/       📏 Conversion guides
│   └── assets/           🖼️ Images & banners
├── book/                 📚 PDF publication source
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
│   └── cookbook.yaml     Pandoc/LaTeX configuration
├── docs/                 📋 Project documentation
├── CONTRIBUTING.md       🤝 How to contribute
└── README.md             📖 Cover page
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

## 👨‍👩‍👦 The Family

Dedicated to the ones who make every meal worth cooking:

| Member | Role | Dietary Notes |
| ------ | ---- | ------------- |
| **Fabio** 🧔‍♂️ | The chef | Will eat anything with enthusiasm |
| **Claudia** 👩‍� | Chief Taste Officer | IBS — needs Low-FODMAP friendly options |
| **Douglas** 🧒 | Quality Control (Picky Division) | Selective eater — keep it approachable |
| **Freddy** 🐕 | Kitchen Helper (self-appointed) | Dog-safe only! |
| **Jolly** 🐩 | Sous Chef (in her dreams) | Dog-safe only! |

---

## 📜 License

[CC BY-NC-SA 4.0](LICENSE) — Share freely, give credit, non-commercial only.

---

*Made with ❤️, chaos, and a lot of garlic.*

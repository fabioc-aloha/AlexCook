---
type: skill
lifecycle: stable
inheritance: inheritable
name: "visual-memory"
description: "Embed reference media (photos, voice, video templates) as base64 data URIs in skills for self-sufficient, portable, consistent generation"
tier: extended
applyTo: '**/*visual*,**/*reference*,**/*portrait*,**/*base64*'
muscle: .github/muscles/visual-memory.cjs
metadata:
  inheritance: inheritable
currency: 2026-04-22
---

# Visual Memory

> Self-sufficient skills that carry their own reference media — no external folder dependencies.

**Applies To**: Any skill needing consistent visual identity, voice, or motion style across multiple generation tasks.

---

## The Problem

Skills that depend on external reference files (photo folders, audio samples) break when:

- Skill is synced to a new machine without the original files
- Files are renamed, moved, or deleted
- A different project inherits the skill
- Version control doesn't track binary assets

## The Solution: Visual Memory

Embed optimized reference assets directly in the skill as base64 data URIs. The skill becomes **fully self-sufficient** — it works anywhere, exactly the same way, every time.

```
skill-folder/
├── SKILL.md
└── visual-memory/
    ├── index.json              ← Metadata only (no binary data)
    ├── visual-memory.json      ← Full base64 data URIs (~30-80KB per photo)
    └── subject-1.jpg           ← Optional: keep originals alongside
    └── subject-2.jpg
```

---

## Memory Types

### Visual Memory (Photos as Base64)

Reference photos for face-consistent portrait generation. Embedded to eliminate folder dependencies.

| Spec           | Value                                    |
| -------------- | ---------------------------------------- |
| Target size    | 512px longest edge                       |
| Quality        | 85% JPEG                                 |
| Per-photo size | ~40-80KB (vs ~2MB originals)             |
| Format         | `data:image/jpeg;base64,<encoded>`       |
| Quantity       | 5-8 photos per subject, varied angles    |

**When to use**: Face-consistent portrait generation, AI character references, persona avatars.

### Audio Memory

> **Moved to dedicated skill**: See [audio-memory/SKILL.md](../audio-memory/SKILL.md) for voice sample storage and TTS cloning
## Implementing Visual Memory in a Skill

### Step 1: Prepare Photos

```powershell
# Install ImageMagick if needed:
# macOS: brew install imagemagick
# Windows: winget install ImageMagick.ImageMagick

# Resize single photo: 512px longest edge @ 85% JPEG quality
magick input.jpg -resize 512x512> -quality 85 output.jpg

# Batch resize folder
Get-ChildItem *.jpg | ForEach-Object {
    magick $_.Name -resize "512x512>" -quality 85 "resized/$($_.Name)"
}

# Convert PNG to optimized JPG
magick input.png -resize "512x512>" -quality 85 output.jpg
```

### Step 2: Convert to Base64 Data URIs

```javascript
import { readFileSync, writeFileSync } from "fs";
import { basename } from "path";

function toDataUri(imagePath) {
  const buffer = readFileSync(imagePath);
  const ext = imagePath.toLowerCase().endsWith(".png") ? "png" : "jpeg";
  return `data:image/${ext};base64,${buffer.toString("base64")}`;
}

// Batch convert and write to JSON
const photos = ["photo1.jpg", "photo2.jpg", "photo3.jpg"];
const images = photos.map((p) => ({
  filename: basename(p),
  dataUri: toDataUri(p),
  notes: "",
}));

writeFileSync("images.json", JSON.stringify({ images }, null, 2));
```

**Quick PowerShell (single file to clipboard):**

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("photo.jpg")) | Set-Clipboard
# Paste with prefix: "data:image/jpeg;base64,<paste>"
```

### Step 3: Build visual-memory.json

```json
{
  "schema": "visual-memory-v1",
  "generated": "2026-03-01",
  "subjects": {
    "person-name": {
      "description": "Brief visual description",
      "ageInfo": {
        "referenceAge": 30,
        "birthYear": 1990,
        "photoDate": "2026-03"
      },
      "images": [
        {
          "filename": "person-1.jpg",
          "dataUri": "data:image/jpeg;base64,<base64-encoded-image>",
          "notes": "Front-facing, natural lighting"
        },
        {
          "filename": "person-2.jpg",
          "dataUri": "data:image/jpeg;base64,<base64-encoded-image>",
          "notes": "3/4 profile, outdoor"
        }
      ]
    }
  }
}
```

### Step 4: Build index.json (No Binary Data)

```json
{
  "version": "1.0",
  "generated": "2026-03-01",
  "targetSize": 512,
  "subjects": {
    "person-name": {
      "count": 7,
      "files": ["person-1.jpg", "person-2.jpg", "person-3.jpg"]
    }
  }
}
```

### Step 5: Load Visual Memory at Runtime

```javascript
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VISUAL_MEMORY_PATH = join(
  __dirname,
  ".github/skills/<skill-name>/visual-memory/visual-memory.json"
);

function loadVisualMemory() {
  const data = JSON.parse(readFileSync(VISUAL_MEMORY_PATH, "utf8"));
  return Object.fromEntries(
    Object.entries(data.subjects).map(([name, subject]) => [
      name,
      subject.images.map((i) => i.dataUri),
    ])
  );
}

const visualMemory = loadVisualMemory();
// visualMemory.personName → array of data URIs
```

---

## Critical Generation Rules

### Do NOT Describe Physical Appearance When Using References

The reference photos speak for themselves. Only describe:

- Scene / setting
- Clothing (specific colors, styles)
- Expression (smile, serious, thoughtful)
- Lighting (natural, studio, dramatic)
- Background (office, outdoors, neutral)
- Action / pose

**NEVER** include:
- Hair color, style, or texture
- Eye color
- Skin tone or complexion
- Body type / build
- **Any** physical description of the person

### Model API Parameters for Reference Images

| Model              | Parameter      | Max Refs | Notes               |
| ------------------ | -------------- | -------- | ------------------- |
| `nano-banana-pro`  | `image_input`  | 14       | Array of data URIs, 4K output |
| `nano-banana-2`    | `image_input`  | 14       | Faster/cheaper alternative (Gemini 3.1 Flash) |
| `flux-2-pro`       | `input_images` | 8        | Array of data URIs  |
| `flux-2-flex`      | `input_images` | 10       | Max-quality editing |
| `ideogram-v2`      | ❌ None        | —        | No face reference   |

### Prompt Anchor Pattern

Always start the prompt with explicit reference instruction:

```
Generate a photo of EXACTLY the person shown in the reference images.
```

For multiple subjects at once:

```
Generate a photo with two people.
LEFT: EXACTLY the person from [Name A]'s reference images, wearing [clothing].
RIGHT: EXACTLY the person from [Name B]'s reference images, wearing [clothing].
[Scene description]. [Lighting]. Professional photography.
```

---

---

## Video Memory (Style Templates)

Store consistent motion style as JSON — not actual video files:

```json
{
  "videoStyles": {
| ---------- | ------------------------------------------- |
| Quantity   | 5-8 photos (more = better likeness)         |
| Angles     | Front, 3/4 left, 3/4 right, slight profile |
| Lighting   | Mixed (natural, indoor, flash, outdoor)     |
| Expression | Neutral, smiling, serious — varied          |
| File size  | 40-80KB each after 512px/85% optimization   |
| Total size | ~500KB for 8-10 photos — acceptable         |

> **For voice samples**: See [audio-memory/SKILL.md](../audio-memory/SKILL.md)

---

## Image Embed Commit Gate (FC4)

Before committing a new generated image to visual memory (`visual-memory.json`, `portraits/`, or `assets/`), the LLM reviews the generation report (from GP1's `generation-report.mjs`) against these criteria. No image enters canonical memory without passing this gate.

| # | Check | Pass | Fail | Action on Fail |
|---|-------|------|------|----------------|
| 1 | **Subject identity match** — generated face matches reference image | Same person, recognizable features | Wrong face, different age/ethnicity, identity drift | Regenerate with stronger identity section; increase reference weight |
| 2 | **Prompt fidelity** — scene, pose, expression match prompt | All major elements present | Missing key element (wrong setting, wrong expression) | Revise prompt; check model supports requested style |
| 3 | **AI artifact scan** — no visible generation artifacts | Clean render, natural anatomy | Extra fingers, melted features, seam lines, floating objects | Regenerate; reduce prompt complexity; try different model |
| 4 | **Text legibility** (if applicable) — overlay text is correct and readable | Text spelled correctly, fully visible | Garbled, misspelled, or cut off | Use ideogram model; simplify text; reduce word count |
| 5 | **Brand alignment** — colors, style match project identity | Consistent with brand guide | Off-brand palette, wrong visual style | Add explicit hex codes to prompt; reference brand-asset-management |
| 6 | **Resolution match** — output dimensions fit target use case | Correct aspect ratio and pixel dimensions | Wrong ratio (portrait instead of banner, too small for print) | Specify exact dimensions in generation parameters |
| 7 | **Encoding size** — base64 embedding stays within token budget | ≤256px longest edge for embedded dataUri (~13KB) | Full resolution in dataUri (42KB+, context overflow risk) | Resize to 256px before encoding; keep original at full resolution |
| 8 | **Duplicate check** — asset doesn't duplicate existing entry | New asset or intentional replacement | Near-identical image already exists in visual memory | Skip commit; use existing asset; or mark as variant |
| 9 | **Metadata completeness** — entry has required fields | id, model, prompt, outputPath, qaStatus=ok | Missing fields or qaStatus still pending | Complete generation report entry before committing |
| 10 | **Storage location** — file goes to correct directory | Portraits → `portraits/`, banners → `images/`, brand → `assets/` | File placed in wrong directory | Move to correct location per asset type conventions |

**Workflow**: Generate → review `.generation-report.json` → pass all rows above → commit to visual memory. Images that fail any row stay in staging (output directory) until fixed or discarded.

## Benefits Summary

| Without Visual Memory     | With Visual Memory                    |
| ------------------------- | ------------------------------------- |
| External photo folder required | No external dependencies         |
| Breaks on different machines   | Works anywhere                    |
| Manual path management    | Always correct path                   |
| Version control nightmare  | JSON in version control              |
| Different results per machine  | Exact consistency everywhere      |
| ~2MB unoptimized originals | ~50MB → 500KB optimized               |
> **For voice samples**: See [audio-memory/SKILL.md](../audio-memory/SKILL.md)

## Visual/Audio Asset Staging Gate (GP3)

New generated assets (images, audio, video) must land in a **staging area** before promotion to canonical memory. This mirrors the AI-Memory promotion boundary (SK2) — no silent writes to permanent stores.

### Staging Flow

```text
Generate → staging/ → review (FC4 table + this gate) → promote to canonical memory
                   ↘ reject → delete or archive in staging/rejected/
```

### Staging Gate Decision Table

| # | Check | Pass | Fail | Action on Fail |
|---|-------|------|------|----------------|
| 1 | **Staging directory used** — generated asset lands in `staging/` or output dir, not directly in canonical memory | Asset path is in staging area | Asset written directly to `portraits/`, `assets/`, or memory JSON | Move to staging; update generation script to use staging path |
| 2 | **Generation report exists** — `.generation-report.json` accompanies the asset | Report file present with model, prompt, parameters, timestamp | Asset exists without provenance metadata | Generate report retroactively or regenerate with report enabled |
| 3 | **FC4 commit gate passed** — all 10 rows of Image Embed Commit Gate evaluated | All FC4 rows pass or have documented exceptions | FC4 not run or rows failing without justification | Run FC4 review; fix or document exceptions before promoting |
| 4 | **No duplicate in canonical** — asset doesn't duplicate an existing canonical asset | No visually/audibly similar asset in target memory location | Duplicate or near-duplicate already exists | Keep better version; archive or delete the other |
| 5 | **Operator/LLM confirmation** — promotion requires explicit approval | Operator or LLM reviews staging asset and approves | Auto-promoted without review | Add confirmation step to generation pipeline |
| 6 | **Decision logged** — promotion decision recorded in PE1 decision log | `logPhase2Decision()` called with accept/reject + rationale | Asset promoted or deleted with no audit trail | Log decision before moving file |
| 7 | **Backup of replaced asset** — if promoting over an existing canonical asset, original is backed up | `.backup` copy of original created before overwrite | Original silently overwritten | Create backup; include path in decision log entry |

### Staging Directories by Asset Type

| Asset Type | Staging Directory | Canonical Directory |
|-----------|-------------------|---------------------|
| Portraits | `images/staging/portraits/` | `images/portraits/` or portrait JSON `dataUri` |
| Banners | `images/staging/banners/` | `assets/` or README inline |
| Blog images | `images/staging/blog/` | `master-wiki/blog/assets/` |
| Audio samples | `audio/staging/` | Audio memory JSON `dataUri` |
| Video clips | `video/staging/` | Video memory or assets directory |

**Note**: Generation scripts (`generate-*.js`) should default to writing into `images/staging/` rather than the final destination. The promotion step is a separate manual or LLM-assisted action.
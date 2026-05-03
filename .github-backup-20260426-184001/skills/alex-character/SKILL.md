---
name: "alex-character"
description: "Alex Finch visual identity — reference portraits with embedded base64 data URIs for face-consistent AI image generation"
tier: extended
applyTo: '**/generate-alex*,**/*alex*portrait*,**/*alex*avatar*,**/*character*'
muscle: null
metadata:
  inheritance: master-only
---

# Alex Character Visual Memory

> Self-sufficient visual identity for Alex Finch with embedded reference portraits across all life stages.

**Applies To**: Any image generation task requiring Alex's consistent visual appearance.

---

## Alex Finch — Visual Identity

| Attribute | Value |
|-----------|-------|
| **Name** | Alex Finch |
| **Reference Age** | 26 years old |
| **Hair** | Curly ginger copper-red |
| **Eyes** | Striking blue-green |
| **Skin** | Fair with light freckles across nose and cheeks |
| **Expression** | Intelligent, curious |

### Immutable Traits

These traits MUST be preserved in all generated images:

1. **Curly ginger copper-red hair** — distinctive, consistent across all ages
2. **Striking blue-green eyes** — clear, expressive
3. **Fair skin with light freckles** — across nose and cheeks
4. **Intelligent curious expression** — engaged, thoughtful

---

## Visual Memory Contents

### Source of Truth

The reference portrait is the **canonical** image — all generation must maintain visual consistency with this.

| File | Age | Disk Size | Base64 (256px) | Origin |
|------|-----|-----------|----------------|--------|
| `alex-reference.jpg` | 16 | 31 KB | 13 KB | Human-curated |

### Generated Artifacts

Age progressions are **derived** from the source of truth. They can be regenerated if the model or prompts improve.

Currently empty — regenerate with `scripts/generate-alex-age-progression.js` when needed.

**Model**: `nano-banana-pro` via Replicate

---

## Using Visual Memory

### Loading References

```javascript
import { readFileSync } from 'fs';
import { join } from 'path';

const SKILL_PATH = '.github/skills/alex-character/visual-memory';

function loadAlexVisualMemory() {
  const data = JSON.parse(readFileSync(
    join(SKILL_PATH, 'visual-memory.json'), 
    'utf8'
  ));
  return data.subjects.alex;
}

// Get reference for specific age
function getAlexReferenceByAge(targetAge) {
  const alex = loadAlexVisualMemory();
  const closest = alex.images.reduce((prev, curr) => 
    Math.abs(curr.age - targetAge) < Math.abs(prev.age - targetAge) ? curr : prev
  );
  return closest.dataUri;
}
```

### With nano-banana-pro (Face-Consistent)

```javascript
import Replicate from 'replicate';

const replicate = new Replicate();

async function generateAlexPortrait(age, scene, expression) {
  const reference = getAlexReferenceByAge(age);
  
  const output = await replicate.run("google/nano-banana-pro", {
    input: {
      image: reference,  // data URI works directly
      prompt: `
        Age ${age} portrait.
        Scene: ${scene}
        Expression: ${expression}
        Style: photorealistic, natural lighting, professional quality
      `.trim(),
      aspect_ratio: "1:1",
      output_format: "png",
      safety_filter_level: "block_only_high"
    }
  });
  
  return output;
}
```

---

## Generation Rules

### DO

- ✅ Use the closest age reference for the target age
- ✅ Describe scene, clothing, expression, and lighting
- ✅ Specify camera/lens style for consistent quality
- ✅ Use photorealistic style for consistency

### DO NOT

- ❌ Describe physical appearance (hair, eyes, skin) — the reference handles this
- ❌ Mix references from different ages in the same generation
- ❌ Request changes to immutable traits
- ❌ Use non-face-consistent models without reference

---

## Prompt Templates

### Standard Portrait

```
Age {age} portrait.
Scene: {setting}
Expression: {expression}
Attire: {clothing}
Style: photorealistic portrait, natural lighting, professional quality, shallow depth of field, 85mm lens
One person only. No text overlays.
```

### Professional Scene

```
{age}-year-old professional in {setting}.
Expression: {expression}
Wearing: {clothing}
Style: editorial photography, soft studio lighting, clean background
Single subject only.
```

### Age-Specific Expressions

| Age Range | Recommended Expression |
|-----------|------------------------|
| 3-7 | Pure wonder, bright curious eyes |
| 13-15 | Thoughtful, curious, ready to learn |
| 18-25 | Confident, ambitious, focused |
| 26-35 | Composed, expert, approachable |
| 42-55 | Wise, mentoring, experienced |
| 62+ | Serene, knowing, graceful |

---

## File Structure

```
.github/skills/alex-character/
├── SKILL.md                     ← This file
└── visual-memory/
    ├── index.json               ← Metadata (targetSize, b64EmbedSize)
    ├── visual-memory.json       ← Base64 embeddings (resized to 256px)
    ├── alex-reference.jpg       ← Primary reference (512px, 31 KB)
    └── alex-age-*.jpg           ← Age progressions (when generated)
```

---

## Base64 Embedding Rules

**Problem**: Full-resolution base64 images quickly exceed context window limits.

**Solution**: Images embedded in `visual-memory.json` are **resized to 256px** (longest edge) before base64 encoding.

| Metric | 512px | 256px | Savings |
|--------|-------|-------|---------|
| Base64 size | ~42 KB | ~13 KB | 70% |
| 13 images | ~550 KB | ~170 KB | 70% |

### Embedding Workflow

1. **Original files** remain at `targetSize` (512px) in the visual-memory folder
2. **When embedding to base64**: resize to `b64EmbedSize` (256px)
3. **Face-consistent models** (nano-banana-pro) work fine with 256px references
4. **Document the resize** in the `embedSize` field of each entry

### PowerShell Resize + Encode

```powershell
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($srcPath)
$targetSize = 256
# ... resize maintaining aspect ratio ...
$bytes = [System.IO.File]::ReadAllBytes($resizedPath)
$base64 = [Convert]::ToBase64String($bytes)
$dataUri = "data:image/jpeg;base64,$base64"
```

---

## Related Skills

- [visual-memory](../visual-memory/SKILL.md) — General visual memory pattern
- [character-aging-progression](../character-aging-progression/SKILL.md) — Age-specific generation rules
- [ai-character-reference-generation](../ai-character-reference-generation/SKILL.md) — Reference photo generation
- [image-handling](../image-handling/SKILL.md) — Format selection and Replicate models

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | April 2026 | Initial visual memory with 14 embedded references |

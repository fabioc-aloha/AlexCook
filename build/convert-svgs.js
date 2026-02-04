/**
 * Convert SVG banners to high-resolution PNG
 * Uses sharp library for quality conversion
 * Replaces emoji text with embedded PNG images for color rendering
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BANNERS_DIR = path.join(__dirname, '..', 'book', 'assets', 'banners');
const EMOJIS_DIR = path.join(__dirname, '..', 'book', 'assets', 'emojis');
const OUTPUT_DIR = path.join(BANNERS_DIR, 'png');
const DPI = 300; // High resolution
const SCALE = 3;  // 3x scale for high-res output

// Load emoji map
const emojiMapPath = path.join(EMOJIS_DIR, 'emoji-map.json');
const emojiMap = JSON.parse(fs.readFileSync(emojiMapPath, 'utf8'));

// Build reverse map: emoji -> PNG path  
function getEmojiPngPath(emoji) {
    // Strip variation selectors for lookup
    const cleanEmoji = emoji.replace(/\uFE0F/g, '');
    
    // Try exact match first
    if (emojiMap[emoji]) {
        return path.join(EMOJIS_DIR, emojiMap[emoji]);
    }
    // Then try without variation selector
    if (emojiMap[cleanEmoji]) {
        return path.join(EMOJIS_DIR, emojiMap[cleanEmoji]);
    }
    
    // Special handling for ZWJ sequences - try both with and without FE0F
    const variants = [emoji, cleanEmoji];
    for (const variant of variants) {
        for (const [key, file] of Object.entries(emojiMap)) {
            // Normalize both for comparison
            if (key.normalize('NFC') === variant.normalize('NFC')) {
                return path.join(EMOJIS_DIR, file);
            }
        }
    }
    
    return null;
}

// Convert emoji text elements to image elements with embedded base64 PNG
function replaceEmojisInSvg(svgContent) {
    // Match emoji text elements: <text x="25" y="45" font-size="28">🥣</text>
    const emojiTextRegex = /<text\s+x="([^"]+)"\s+y="([^"]+)"\s+font-size="(\d+)"[^>]*>([^<]+)<\/text>/g;
    
    return svgContent.replace(emojiTextRegex, (match, x, y, fontSize, content) => {
        // Check if content is an emoji (non-ASCII)
        const hasEmoji = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u.test(content);
        if (!hasEmoji) {
            return match; // Keep non-emoji text as-is
        }
        
        const pngPath = getEmojiPngPath(content.trim());
        if (!pngPath || !fs.existsSync(pngPath)) {
            console.warn(`    ⚠ No PNG for emoji: ${content.trim()}`);
            return match;
        }
        
        // Read PNG and convert to base64
        const pngData = fs.readFileSync(pngPath);
        const base64 = pngData.toString('base64');
        
        // Calculate position and size (text y is baseline, image needs top-left)
        const size = parseInt(fontSize);
        const imgX = parseInt(x);
        const imgY = parseInt(y) - size + 4; // Adjust for baseline
        
        return `<image x="${imgX}" y="${imgY}" width="${size}" height="${size}" href="data:image/png;base64,${base64}"/>`;
    });
}

async function convertSvgToPng(svgPath, pngPath) {
    let svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Replace emoji text with embedded PNG images
    svgContent = replaceEmojisInSvg(svgContent);
    
    const svgBuffer = Buffer.from(svgContent, 'utf8');
    
    await sharp(svgBuffer, { density: DPI })
        .resize({ width: null, height: null, fit: 'inside' })
        .png({ quality: 100, compressionLevel: 6 })
        .toFile(pngPath);
    
    return pngPath;
}

async function main() {
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Get all SVG files
    const svgFiles = fs.readdirSync(BANNERS_DIR)
        .filter(f => f.endsWith('.svg'));

    console.log(`\n🎨 Converting ${svgFiles.length} SVG banners to high-res PNG...\n`);

    for (const svgFile of svgFiles) {
        const svgPath = path.join(BANNERS_DIR, svgFile);
        const pngFile = svgFile.replace('.svg', '.png');
        const pngPath = path.join(OUTPUT_DIR, pngFile);

        try {
            await convertSvgToPng(svgPath, pngPath);
            const stats = fs.statSync(pngPath);
            const sizeKB = (stats.size / 1024).toFixed(1);
            console.log(`  ✓ ${svgFile} → ${pngFile} (${sizeKB} KB)`);
        } catch (err) {
            console.error(`  ✗ ${svgFile}: ${err.message}`);
        }
    }

    console.log(`\n✅ PNG files saved to: ${OUTPUT_DIR}\n`);
}

main().catch(console.error);

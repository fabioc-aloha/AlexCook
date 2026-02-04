/**
 * Convert cover.svg to PNG with color emojis
 * Handles both emoji text elements AND existing image elements with relative paths
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BOOK_DIR = path.join(__dirname, '..', 'book');
const EMOJIS_DIR = path.join(BOOK_DIR, 'assets', 'emojis');
const emojiMap = JSON.parse(fs.readFileSync(path.join(EMOJIS_DIR, 'emoji-map.json'), 'utf8'));

function getEmojiPngPath(emoji) {
    const cleanEmoji = emoji.replace(/\uFE0F/g, '');
    if (emojiMap[emoji]) return path.join(EMOJIS_DIR, emojiMap[emoji]);
    if (emojiMap[cleanEmoji]) return path.join(EMOJIS_DIR, emojiMap[cleanEmoji]);
    for (const [key, file] of Object.entries(emojiMap)) {
        if (key.normalize('NFC') === emoji.normalize('NFC') || key.normalize('NFC') === cleanEmoji.normalize('NFC')) {
            return path.join(EMOJIS_DIR, file);
        }
    }
    return null;
}

// Convert relative image paths to embedded base64
function embedImagePaths(svgContent) {
    // Match <image ... href="./assets/..." /> tags
    const imageRegex = /<image([^>]*?)href="\.\/([^"]+)"([^>]*?)\/>/g;
    
    return svgContent.replace(imageRegex, function(match, before, relPath, after) {
        const absPath = path.join(BOOK_DIR, relPath);
        if (!fs.existsSync(absPath)) {
            console.warn('  ⚠ Missing image:', relPath);
            return match;
        }
        const imgData = fs.readFileSync(absPath);
        const base64 = imgData.toString('base64');
        const ext = path.extname(relPath).slice(1);
        const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/' + ext;
        return `<image${before}href="data:${mime};base64,${base64}"${after}/>`;
    });
}

function replaceEmojisInSvg(svgContent) {
    const re = /<text\s+x="([^"]+)"\s+y="([^"]+)"\s+font-size="(\d+)"[^>]*>([^<]+)<\/text>/g;
    return svgContent.replace(re, function(match, x, y, fontSize, content) {
        if (!/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u.test(content)) return match;
        const pngPath = getEmojiPngPath(content.trim());
        if (!pngPath || !fs.existsSync(pngPath)) {
            console.warn('  ⚠ No PNG for emoji:', content.trim());
            return match;
        }
        const pngData = fs.readFileSync(pngPath);
        const base64 = pngData.toString('base64');
        const size = parseInt(fontSize);
        const imgX = parseInt(x);
        const imgY = parseInt(y) - size + 4;
        return `<image x="${imgX}" y="${imgY}" width="${size}" height="${size}" href="data:image/png;base64,${base64}"/>`;
    });
}

async function main() {
    console.log('\n🎨 Converting cover.svg to PNG with embedded images...\n');
    
    const svgPath = path.join(BOOK_DIR, 'cover.svg');
    const pngPath = path.join(BOOK_DIR, 'assets', 'banners', 'png', 'cover.png');
    
    let svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // First embed relative image paths as base64
    svgContent = embedImagePaths(svgContent);
    
    // Then convert any emoji text to images
    svgContent = replaceEmojisInSvg(svgContent);
    
    await sharp(Buffer.from(svgContent), { density: 300 })
        .png({ quality: 100, compressionLevel: 6 })
        .toFile(pngPath);
    
    const stats = fs.statSync(pngPath);
    console.log(`  ✓ cover.svg → cover.png (${(stats.size/1024).toFixed(1)} KB)\n`);
}

main().catch(console.error);

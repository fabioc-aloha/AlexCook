/**
 * Convert social-preview.svg to PNG with proper emoji handling
 * Uses the emoji PNG files from book/assets/emojis
 * 
 * Handles:
 * - ZWJ sequences (👨‍🍳, 👩‍🦱)
 * - Regional indicator flags (🇧🇷, 🇮🇹, 🇮🇳, 🇨🇳, 🇯🇵)
 * - Mixed text+emoji lines
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const EMOJIS_DIR = path.join(__dirname, '..', 'book', 'assets', 'emojis');
const emojiMapPath = path.join(EMOJIS_DIR, 'emoji-map.json');
const emojiMap = JSON.parse(fs.readFileSync(emojiMapPath, 'utf8'));

// Also load build emoji-map for more entries
const buildEmojiMapPath = path.join(__dirname, 'emoji-map.json');
const buildEmojiMap = JSON.parse(fs.readFileSync(buildEmojiMapPath, 'utf8'));

function getEmojiPngPath(emoji) {
    const cleanEmoji = emoji.replace(/\uFE0F/g, '');
    
    // Try build emoji map first (has full paths and more flags)
    if (buildEmojiMap[emoji]) return path.join(__dirname, '..', buildEmojiMap[emoji]);
    if (buildEmojiMap[cleanEmoji]) return path.join(__dirname, '..', buildEmojiMap[cleanEmoji]);
    
    // Try local emoji map
    if (emojiMap[emoji]) return path.join(EMOJIS_DIR, emojiMap[emoji]);
    if (emojiMap[cleanEmoji]) return path.join(EMOJIS_DIR, emojiMap[cleanEmoji]);
    
    // Try normalized comparison on both maps
    for (const [key, file] of Object.entries(buildEmojiMap)) {
        if (key.normalize('NFC') === emoji.normalize('NFC') || 
            key.normalize('NFC') === cleanEmoji.normalize('NFC')) {
            return path.join(__dirname, '..', file);
        }
    }
    for (const [key, file] of Object.entries(emojiMap)) {
        if (key.normalize('NFC') === emoji.normalize('NFC') || 
            key.normalize('NFC') === cleanEmoji.normalize('NFC')) {
            return path.join(EMOJIS_DIR, file);
        }
    }
    
    return null;
}

// Comprehensive emoji regex - order matters (longest matches first)
// 1. ZWJ sequences (person + profession, person + hair)
// 2. Regional indicator flags (two regional indicators)
// 3. Keycap sequences
// 4. Standard emojis with optional variation selector
const EMOJI_REGEX = new RegExp(
    // ZWJ sequences: 👨‍🍳 👩‍🦱 🧑‍🍳 🧔‍♂️ etc
    '(?:[\\u{1F468}\\u{1F469}\\u{1F9D1}\\u{1F9D4}]\\u{200D}[\\u{1F373}\\u{1F9B1}\\u{1F9B0}\\u{2642}\\u{2640}]\\u{FE0F}?)' +
    // Regional indicator flags: 🇧🇷 🇮🇹 🇮🇳 🇨🇳 🇯🇵
    '|(?:[\\u{1F1E0}-\\u{1F1FF}]{2})' +
    // Heart with variation selector
    '|(?:\\u{2764}\\u{FE0F}?)' +
    // Supplementary emoji ranges
    '|[\\u{1F300}-\\u{1F9FF}]' +
    // Dingbats and misc symbols
    '|[\\u{2600}-\\u{27BF}]',
    'gu'
);

function replaceEmojisInSvg(svgContent) {
    // Match text elements
    const textRegex = /<text([^>]*)>([^<]*)<\/text>/g;
    
    return svgContent.replace(textRegex, (match, attrs, content) => {
        // Extract position attributes
        const xMatch = attrs.match(/x="([^"]+)"/);
        const yMatch = attrs.match(/y="([^"]+)"/);
        const fontSizeMatch = attrs.match(/font-size="(\d+)"/);
        
        if (!xMatch || !yMatch || !fontSizeMatch) return match;
        
        const baseX = parseFloat(xMatch[1]);
        const y = parseFloat(yMatch[1]);
        const fontSize = parseInt(fontSizeMatch[1]);
        const isMiddle = attrs.includes('text-anchor="middle"');
        
        // Check if content has emojis
        const emojis = content.match(EMOJI_REGEX);
        if (!emojis || emojis.length === 0) return match;
        
        // Check if this is ONLY emojis (no real text)
        const textOnly = content.replace(EMOJI_REGEX, '').replace(/\s+/g, ' ').trim();
        const isEmojiOnly = textOnly === '';
        
        if (isEmojiOnly) {
            // Pure emoji line - replace entirely with images
            const spacing = fontSize + 8;
            const totalWidth = emojis.length * spacing;
            let x = isMiddle ? baseX - totalWidth / 2 + spacing / 2 : baseX;
            
            let result = '';
            for (const emoji of emojis) {
                const pngPath = getEmojiPngPath(emoji);
                if (pngPath && fs.existsSync(pngPath)) {
                    const pngData = fs.readFileSync(pngPath);
                    const base64 = pngData.toString('base64');
                    const imgY = y - fontSize + 4;
                    result += `<image x="${x}" y="${imgY}" width="${fontSize}" height="${fontSize}" href="data:image/png;base64,${base64}"/>`;
                    console.log(`  ✓ Replaced: ${emoji}`);
                } else {
                    console.log(`  ⚠ Missing PNG for: ${emoji} (${[...emoji].map(c => c.codePointAt(0).toString(16)).join('-')})`);
                }
                x += spacing;
            }
            return result || match;
        } else {
            // Mixed text + emoji line
            // Strategy: Measure each segment, position precisely
            console.log(`  📝 Mixed line: "${content.substring(0, 50)}..."`);
            
            // Split content into segments (text and emoji)
            const segments = [];
            let lastIndex = 0;
            let m;
            const regex = new RegExp(EMOJI_REGEX.source, 'gu');
            
            while ((m = regex.exec(content)) !== null) {
                if (m.index > lastIndex) {
                    segments.push({ type: 'text', value: content.substring(lastIndex, m.index) });
                }
                segments.push({ type: 'emoji', value: m[0] });
                lastIndex = m.index + m[0].length;
            }
            if (lastIndex < content.length) {
                segments.push({ type: 'text', value: content.substring(lastIndex) });
            }
            
            // Calculate widths more accurately
            // Arial at fontSize 18: average char ~9px, but varies
            const avgCharWidth = fontSize * 0.55;
            const emojiWidth = fontSize * 1.2;
            const emojiSpacing = fontSize * 0.3;
            
            // Calculate total width
            let totalWidth = 0;
            for (const seg of segments) {
                if (seg.type === 'text') {
                    totalWidth += seg.value.length * avgCharWidth;
                } else {
                    totalWidth += emojiWidth + emojiSpacing;
                }
            }
            
            // Start position
            let currentX = isMiddle ? baseX - totalWidth / 2 : baseX;
            
            // Build SVG group
            let result = `<g>`;
            
            // Extract other attrs for text elements (fill, font-family, etc)
            const fillMatch = attrs.match(/fill="([^"]+)"/);
            const fontMatch = attrs.match(/font-family="([^"]+)"/);
            const fill = fillMatch ? fillMatch[1] : '#666666';
            const fontFamily = fontMatch ? fontMatch[1] : 'Arial, sans-serif';
            
            for (const seg of segments) {
                if (seg.type === 'text') {
                    const textWidth = seg.value.length * avgCharWidth;
                    result += `<text x="${currentX}" y="${y}" font-family="${fontFamily}" font-size="${fontSize}" fill="${fill}">${seg.value}</text>`;
                    currentX += textWidth;
                } else {
                    const pngPath = getEmojiPngPath(seg.value);
                    if (pngPath && fs.existsSync(pngPath)) {
                        const pngData = fs.readFileSync(pngPath);
                        const base64 = pngData.toString('base64');
                        const imgY = y - fontSize + 2;
                        result += `<image x="${currentX}" y="${imgY}" width="${fontSize}" height="${fontSize}" href="data:image/png;base64,${base64}"/>`;
                        console.log(`  ✓ Replaced: ${seg.value}`);
                    }
                    currentX += emojiWidth + emojiSpacing;
                }
            }
            
            result += `</g>`;
            return result;
        }
    });
}

async function convert() {
    const svgPath = path.join(__dirname, '..', 'github-version', 'assets', 'social-preview.svg');
    const pngPath = path.join(__dirname, '..', 'github-version', 'assets', 'social-preview.png');
    
    console.log('\n🎨 Converting social-preview.svg with emoji replacement...\n');
    
    let svgContent = fs.readFileSync(svgPath, 'utf8');
    svgContent = replaceEmojisInSvg(svgContent);
    
    const svgBuffer = Buffer.from(svgContent, 'utf8');
    
    await sharp(svgBuffer, { density: 150 })
        .resize(1280, 640)
        .png()
        .toFile(pngPath);
    
    const stats = fs.statSync(pngPath);
    console.log(`\n✅ Created: ${pngPath}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`);
}

convert().catch(console.error);

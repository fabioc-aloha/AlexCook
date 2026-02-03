/**
 * Asset Pipeline for The Alex Cookbook
 * - Extracts emojis from all sources and downloads from Twemoji
 * - Converts SVGs to high-res PNGs with color emoji replacement
 * - Maintains hash-based cache for change detection
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(__dirname, 'asset-manifest.json');

const SVG_SOURCES = [
    'cover.svg',
    'assets/social-preview.svg',
    ...fs.readdirSync(path.join(PROJECT_ROOT, 'assets/banners'))
        .filter(f => f.endsWith('.svg'))
        .map(f => `assets/banners/${f}`)
];

const MARKDOWN_DIRS = [
    '',  // root
    'chapters/01-appetizers',
    'chapters/02-soups-salads',
    'chapters/03-main-courses',
    'chapters/04-sides',
    'chapters/05-desserts',
    'chapters/06-breakfast',
    'chapters/07-drinks',
    'chapters/08-sauces',
    'chapters/09-bread-baking',
    'chapters/10-special-occasions',
    'chapters/11-dog-treats',
    'chapters/12-steaks',
    'chapters/13-comfort-classics',
    'chapters/14-alex-favorites',
    'chapters/15-unhinged-kitchen',
    'appendices/appendix-a-aphrodisiac',
    'appendices/appendix-b-risotto-rice',
    'references'
];

const PNG_OUTPUT_DIR = path.join(PROJECT_ROOT, 'assets/banners/png');
const EMOJI_OUTPUT_DIR = path.join(PROJECT_ROOT, 'assets/emojis');

// Emoji detection regex (covers most emoji including flags, skin tones, ZWJ sequences)
const EMOJI_REGEX = /[\u{1F468}\u{1F469}][\u{200D}][\u{1F373}]|[\u{1F1E0}-\u{1F1FF}]{2}|[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F171}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{1F191}-\u{1F19A}]|[\u{1F201}-\u{1F202}]|[\u{1F21A}]|[\u{1F22F}]|[\u{1F232}-\u{1F23A}]|[\u{1F250}-\u{1F251}]/gu;

// Calculate file hash
function getFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
}

// Load or create manifest
function loadManifest() {
    if (fs.existsSync(MANIFEST_PATH)) {
        return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    }
    return { svgs: {}, emojis: [], emojiHash: '' };
}

// Save manifest
function saveManifest(manifest) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

// Convert emoji to Twemoji filename (codepoints separated by dashes)
function emojiToTwemojiFilename(emoji) {
    const codepoints = [...emoji]
        .map(char => char.codePointAt(0).toString(16))
        .filter(cp => cp !== 'fe0f') // Remove variation selectors
        .join('-');
    return `${codepoints}.png`;
}

// Download file from URL
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                file.close();
                fs.unlinkSync(dest);
                https.get(response.headers.location, (res) => {
                    const newFile = fs.createWriteStream(dest);
                    res.pipe(newFile);
                    newFile.on('finish', () => { newFile.close(); resolve(true); });
                }).on('error', (err) => { fs.unlinkSync(dest); reject(err); });
            } else if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            } else {
                file.close();
                fs.unlinkSync(dest);
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', (err) => { file.close(); fs.unlinkSync(dest); reject(err); });
    });
}

// Extract emojis from text
function extractEmojis(text) {
    const matches = text.match(EMOJI_REGEX) || [];
    return [...new Set(matches)];
}

// Extract emojis from all sources
function extractAllEmojis() {
    const allEmojis = new Set();
    
    // From markdown files
    for (const dir of MARKDOWN_DIRS) {
        const dirPath = path.join(PROJECT_ROOT, dir);
        if (!fs.existsSync(dirPath)) continue;
        
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
        for (const file of files) {
            const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
            extractEmojis(content).forEach(e => allEmojis.add(e));
        }
    }
    
    // From SVG files
    for (const svgPath of SVG_SOURCES) {
        const fullPath = path.join(PROJECT_ROOT, svgPath);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            extractEmojis(content).forEach(e => allEmojis.add(e));
        }
    }
    
    return [...allEmojis].sort();
}

// Replace emoji text elements in SVG with embedded images
function replaceEmojisInSvg(svgContent) {
    let modified = svgContent;
    
    // Pattern to find <text> elements containing emojis
    const textPattern = /<text([^>]*)>([^<]*)<\/text>/g;
    
    modified = modified.replace(textPattern, (match, attrs, textContent) => {
        // Check if text contains emoji
        const emojis = extractEmojis(textContent);
        if (emojis.length === 0) return match;
        
        // Extract position and font-size from attributes
        const xMatch = attrs.match(/x="([^"]+)"/);
        const yMatch = attrs.match(/y="([^"]+)"/);
        const sizeMatch = attrs.match(/font-size="([^"]+)"/);
        
        if (!xMatch || !yMatch) return match;
        
        const x = parseFloat(xMatch[1]);
        const y = parseFloat(yMatch[1]);
        const fontSize = sizeMatch ? parseFloat(sizeMatch[1]) : 40;
        
        // For each emoji, create an image element
        let result = '';
        let offsetX = 0;
        
        for (const emoji of emojis) {
            const filename = emojiToTwemojiFilename(emoji);
            const emojiPath = path.join(EMOJI_OUTPUT_DIR, filename);
            
            if (fs.existsSync(emojiPath)) {
                // Embed as base64 data URI
                const base64 = fs.readFileSync(emojiPath).toString('base64');
                const dataUri = `data:image/png;base64,${base64}`;
                
                // Calculate position (center the image)
                const imgSize = fontSize * 1.2;
                const imgX = x - imgSize / 2 + offsetX;
                const imgY = y - imgSize;
                
                result += `<image x="${imgX}" y="${imgY}" width="${imgSize}" height="${imgSize}" href="${dataUri}" />`;
                offsetX += imgSize;
            } else {
                // Fallback to original text if emoji not found
                return match;
            }
        }
        
        return result;
    });
    
    return modified;
}

// Convert SVG to PNG using sharp, with emoji replacement
async function convertSvgToPng(svgPath, pngPath) {
    const sharp = require('sharp');
    let svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Replace emoji text with embedded images
    svgContent = replaceEmojisInSvg(svgContent);
    
    const svgBuffer = Buffer.from(svgContent);
    
    await sharp(svgBuffer, { density: 300 })
        .png({ quality: 100, compressionLevel: 6 })
        .toFile(pngPath);
}

// Main pipeline
async function runPipeline() {
    console.log('\n🎨 Asset Pipeline for The Alex Cookbook\n');
    console.log('='.repeat(50));
    
    const manifest = loadManifest();
    const stats = { svgsConverted: 0, svgsSkipped: 0, emojisDownloaded: 0, emojisSkipped: 0 };
    
    // Ensure output directories exist
    if (!fs.existsSync(PNG_OUTPUT_DIR)) fs.mkdirSync(PNG_OUTPUT_DIR, { recursive: true });
    if (!fs.existsSync(EMOJI_OUTPUT_DIR)) fs.mkdirSync(EMOJI_OUTPUT_DIR, { recursive: true });
    
    // === PHASE 1: Extract and Download Emojis FIRST ===
    console.log('\n😀 Phase 1: Emoji Extraction & Download\n');
    
    const emojis = extractAllEmojis();
    console.log(`  Found ${emojis.length} unique emojis\n`);
    
    // Create emoji mapping
    const emojiMap = {};
    
    for (const emoji of emojis) {
        const filename = emojiToTwemojiFilename(emoji);
        const localPath = path.join(EMOJI_OUTPUT_DIR, filename);
        emojiMap[emoji] = `assets/emojis/${filename}`;
        
        // Check if already downloaded
        if (fs.existsSync(localPath)) {
            stats.emojisSkipped++;
            continue;
        }
        
        // Download from Twemoji CDN
        const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${filename}`;
        
        try {
            await downloadFile(url, localPath);
            console.log(`  ✅ ${emoji} → ${filename}`);
            stats.emojisDownloaded++;
        } catch (err) {
            console.log(`  ❌ ${emoji}: ${err.message}`);
        }
    }
    
    // Save emoji map for build script
    const emojiMapPath = path.join(__dirname, 'emoji-map.json');
    fs.writeFileSync(emojiMapPath, JSON.stringify(emojiMap, null, 2));
    
    // Calculate emoji hash to detect changes
    const emojiHash = crypto.createHash('md5').update(emojis.join(',')).digest('hex');
    const emojisChanged = manifest.emojiHash !== emojiHash;
    if (emojisChanged) {
        console.log('\n  ⚠️  Emoji set changed - will reconvert all SVGs');
    }
    manifest.emojiHash = emojiHash;
    manifest.emojis = emojis;
    
    // === PHASE 2: Convert SVGs with Color Emojis ===
    console.log('\n📐 Phase 2: SVG → PNG Conversion (with color emojis)\n');
    
    for (const svgRelPath of SVG_SOURCES) {
        const svgFullPath = path.join(PROJECT_ROOT, svgRelPath);
        if (!fs.existsSync(svgFullPath)) {
            console.log(`  ⚠️  ${svgRelPath} (not found)`);
            continue;
        }
        
        const hash = getFileHash(svgFullPath);
        const pngName = path.basename(svgRelPath, '.svg') + '.png';
        const pngPath = path.join(PNG_OUTPUT_DIR, pngName);
        
        // Check if already converted with same hash AND emoji set unchanged
        if (manifest.svgs[svgRelPath] === hash && fs.existsSync(pngPath) && !emojisChanged) {
            console.log(`  ⏭️  ${svgRelPath} (unchanged)`);
            stats.svgsSkipped++;
            continue;
        }
        
        try {
            await convertSvgToPng(svgFullPath, pngPath);
            manifest.svgs[svgRelPath] = hash;
            const size = (fs.statSync(pngPath).size / 1024).toFixed(1);
            console.log(`  ✅ ${svgRelPath} → ${pngName} (${size} KB)`);
            stats.svgsConverted++;
        } catch (err) {
            console.log(`  ❌ ${svgRelPath}: ${err.message}`);
        }
    }
    
    // === Save Manifest ===
    saveManifest(manifest);
    
    // === Summary ===
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:\n');
    console.log(`  Emojis: ${stats.emojisDownloaded} downloaded, ${stats.emojisSkipped} cached`);
    console.log(`  SVGs:   ${stats.svgsConverted} converted, ${stats.svgsSkipped} unchanged`);
    console.log(`\n  Manifest: ${MANIFEST_PATH}`);
    console.log(`  Emoji Map: ${emojiMapPath}`);
    console.log(`  PNG Output: ${PNG_OUTPUT_DIR}`);
    console.log(`  Emoji Output: ${EMOJI_OUTPUT_DIR}\n`);
}

runPipeline().catch(console.error);

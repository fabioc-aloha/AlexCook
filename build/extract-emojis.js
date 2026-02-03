/**
 * Extract all unique emojis from markdown files
 * and download them as PNG from Twemoji CDN
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PROJECT_ROOT = path.join(__dirname, '..');
const EMOJI_DIR = path.join(PROJECT_ROOT, 'book', 'assets', 'emojis');

// Emoji regex that captures most common emoji patterns
const emojiRegex = /(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;

function findMarkdownFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            findMarkdownFiles(fullPath, files);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            files.push(fullPath);
        }
    }
    return files;
}

function extractEmojis(content) {
    const matches = content.match(emojiRegex) || [];
    return matches;
}

function emojiToCodepoints(emoji) {
    return [...emoji]
        .map(char => char.codePointAt(0).toString(16).toLowerCase())
        .filter(cp => cp !== 'fe0f') // Remove variation selector for filename
        .join('-');
}

function downloadEmoji(emoji, codepoints) {
    return new Promise((resolve, reject) => {
        const filename = `${codepoints}.png`;
        const filepath = path.join(EMOJI_DIR, filename);
        
        // Skip if already exists
        if (fs.existsSync(filepath)) {
            resolve({ emoji, filename, status: 'exists' });
            return;
        }

        // Twemoji CDN URL (72x72 PNG)
        const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${codepoints}.png`;
        
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve({ emoji, filename, status: 'downloaded' });
                });
            } else {
                file.close();
                fs.unlinkSync(filepath);
                resolve({ emoji, filename, status: 'failed', code: response.statusCode });
            }
        }).on('error', (err) => {
            file.close();
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            resolve({ emoji, filename, status: 'error', error: err.message });
        });
    });
}

async function main() {
    // Create emoji directory
    if (!fs.existsSync(EMOJI_DIR)) {
        fs.mkdirSync(EMOJI_DIR, { recursive: true });
    }

    // Find all markdown files
    const mdFiles = findMarkdownFiles(PROJECT_ROOT);
    console.log(`\n📄 Scanning ${mdFiles.length} markdown files...\n`);

    // Extract all emojis
    const allEmojis = new Set();
    for (const file of mdFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const emojis = extractEmojis(content);
        emojis.forEach(e => allEmojis.add(e));
    }

    const uniqueEmojis = [...allEmojis].sort();
    console.log(`🎨 Found ${uniqueEmojis.length} unique emojis:\n`);
    console.log(uniqueEmojis.join(' '));
    console.log('\n');

    // Download each emoji
    console.log('📥 Downloading from Twemoji CDN...\n');
    
    const emojiMap = {};
    for (const emoji of uniqueEmojis) {
        const codepoints = emojiToCodepoints(emoji);
        const result = await downloadEmoji(emoji, codepoints);
        
        if (result.status === 'downloaded') {
            console.log(`  ✓ ${emoji} → ${result.filename}`);
        } else if (result.status === 'exists') {
            console.log(`  ○ ${emoji} → ${result.filename} (cached)`);
        } else {
            console.log(`  ✗ ${emoji} → ${result.filename} (${result.status})`);
        }
        
        if (result.status !== 'failed' && result.status !== 'error') {
            emojiMap[emoji] = result.filename;
        }
    }

    // Save emoji map for build script
    const mapFile = path.join(EMOJI_DIR, 'emoji-map.json');
    fs.writeFileSync(mapFile, JSON.stringify(emojiMap, null, 2));
    
    console.log(`\n✅ Emoji library created: ${EMOJI_DIR}`);
    console.log(`   ${Object.keys(emojiMap).length} emojis saved`);
    console.log(`   Map file: emoji-map.json\n`);
}

main().catch(console.error);

/**
 * Replace flag emojis with PNG images in GitHub version
 * Windows doesn't render regional indicator flags properly
 */

const fs = require('fs');
const path = require('path');

const GITHUB_DIR = path.join(__dirname, '..', 'github-version');
const EMOJI_PATH = 'assets/emojis';  // Relative path for GitHub

// Flag emoji to PNG filename mapping
const FLAGS = {
    '🇧🇷': '1f1e7-1f1f7.png',  // Brazil
    '🇮🇹': '1f1ee-1f1f9.png',  // Italy
    '🇮🇳': '1f1ee-1f1f3.png',  // India
    '🇨🇳': '1f1e8-1f1f3.png',  // China
    '🇯🇵': '1f1ef-1f1f5.png',  // Japan
    '🇫🇷': '1f1eb-1f1f7.png',  // France
    '🇬🇧': '1f1ec-1f1e7.png',  // UK
    '🇺🇸': '1f1fa-1f1f8.png',  // USA
    '🇲🇽': '1f1f2-1f1fd.png',  // Mexico
    '🇰🇷': '1f1f0-1f1f7.png',  // Korea
    '🇷🇺': '1f1f7-1f1fa.png',  // Russia
    '🇪🇸': '1f1ea-1f1f8.png',  // Spain
    '🇮🇷': '1f1ee-1f1f7.png',  // Iran
};

function findMarkdownFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
            findMarkdownFiles(fullPath, files);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            files.push(fullPath);
        }
    }
    return files;
}

function calculateRelativePath(fromFile, toEmoji) {
    const fromDir = path.dirname(fromFile);
    const toPath = path.join(GITHUB_DIR, EMOJI_PATH);
    return path.relative(fromDir, toPath).replace(/\\/g, '/');
}

function replaceFlags(content, relativePath) {
    let modified = content;
    let count = 0;
    
    for (const [flag, filename] of Object.entries(FLAGS)) {
        // Create image tag with proper sizing
        const imgTag = `<img src="${relativePath}/${filename}" alt="${flag}" height="16">`;
        
        // Count occurrences before replacing
        const matches = (modified.match(new RegExp(flag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        if (matches > 0) {
            modified = modified.split(flag).join(imgTag);
            count += matches;
        }
    }
    
    return { content: modified, count };
}

function main() {
    console.log('\n🏳️ Replacing flag emojis with PNG images...\n');
    
    const mdFiles = findMarkdownFiles(GITHUB_DIR);
    let totalReplaced = 0;
    let filesModified = 0;
    
    for (const file of mdFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = calculateRelativePath(file, EMOJI_PATH);
        const { content: modified, count } = replaceFlags(content, relativePath);
        
        if (count > 0) {
            fs.writeFileSync(file, modified, 'utf8');
            const shortPath = path.relative(GITHUB_DIR, file);
            console.log(`  ✓ ${shortPath}: ${count} flags replaced`);
            totalReplaced += count;
            filesModified++;
        }
    }
    
    console.log(`\n✅ Done: ${totalReplaced} flags replaced in ${filesModified} files`);
}

main();

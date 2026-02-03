/**
 * Convert SVG banners to high-resolution PNG
 * Uses sharp library for quality conversion
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BANNERS_DIR = path.join(__dirname, '..', 'assets', 'banners');
const OUTPUT_DIR = path.join(BANNERS_DIR, 'png');
const DPI = 300; // High resolution
const SCALE = 3;  // 3x scale for high-res output

async function convertSvgToPng(svgPath, pngPath) {
    const svgBuffer = fs.readFileSync(svgPath);
    
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

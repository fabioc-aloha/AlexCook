/**
 * Add Amazon Search Links (with Affiliate Support)
 * 
 * Converts search terms in the Amazon shopping list from:
 *   `search term`
 * To:
 *   [🔍 search term](https://www.amazon.com/s?k=search+term&tag=AFFILIATE-TAG)
 * 
 * Usage: node build/add-amazon-links.js
 * 
 * To set your affiliate tag:
 *   1. Sign up at https://affiliate-program.amazon.com/
 *   2. Get your Associate tag (e.g., "alexcookbook-20")
 *   3. Set AMAZON_AFFILIATE_TAG below or use environment variable
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION - Amazon Associates tag
// ============================================================================
const AMAZON_AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG || 'alexcook05-20';
// ============================================================================

const SHOPPING_LIST = path.join(__dirname, '../book/20-amazon-shopping-list.md');

/**
 * Convert a search term to an Amazon search URL with affiliate tag
 */
function createAmazonUrl(searchTerm) {
    // URL encode the search term (spaces become +)
    const encoded = encodeURIComponent(searchTerm).replace(/%20/g, '+');
    return `https://www.amazon.com/s?k=${encoded}&tag=${AMAZON_AFFILIATE_TAG}`;
}

/**
 * Process the markdown file
 */
function addAmazonLinks() {
    console.log('📦 Adding Amazon search links...\n');
    console.log(`🏷️  Affiliate tag: ${AMAZON_AFFILIATE_TAG}\n`);
    
    let content = fs.readFileSync(SHOPPING_LIST, 'utf-8');
    let replacements = 0;
    
    // Match backtick-wrapped search terms in table cells
    // Pattern: | `search term` | (at end of table row)
    const pattern = /\| `([^`]+)` \|$/gm;
    
    content = content.replace(pattern, (match, searchTerm) => {
        const url = createAmazonUrl(searchTerm);
        replacements++;
        return `| [🔍 ${searchTerm}](${url}) |`;
    });
    
    // Write the updated content
    fs.writeFileSync(SHOPPING_LIST, content, 'utf-8');
    
    console.log(`✅ Added ${replacements} Amazon affiliate links`);
    console.log(`📄 Updated: ${SHOPPING_LIST}`);
    console.log(`\n💰 Affiliate earnings will be tracked under tag: ${AMAZON_AFFILIATE_TAG}`);
}

// Run it
addAmazonLinks();

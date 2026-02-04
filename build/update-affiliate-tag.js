/**
 * Update Amazon Links with Affiliate Tag
 * 
 * Updates existing Amazon links to include affiliate tag.
 * Run this after changing your affiliate tag or to add tags to existing links.
 * 
 * Usage: node build/update-affiliate-tag.js
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
 * Update existing Amazon links with affiliate tag
 */
function updateAffiliateLinks() {
    console.log('🔄 Updating Amazon affiliate links...\n');
    console.log(`🏷️  Affiliate tag: ${AMAZON_AFFILIATE_TAG}\n`);
    
    let content = fs.readFileSync(SHOPPING_LIST, 'utf-8');
    let updates = 0;
    
    // Pattern to match existing Amazon search links (with or without tag)
    // Captures: [🔍 search term](https://www.amazon.com/s?k=encoded+terms&tag=old-tag)
    // or: [🔍 search term](https://www.amazon.com/s?k=encoded+terms)
    const pattern = /\[🔍 ([^\]]+)\]\(https:\/\/www\.amazon\.com\/s\?k=([^&\)]+)(?:&tag=[^)]+)?\)/g;
    
    content = content.replace(pattern, (match, displayText, encodedSearch) => {
        updates++;
        return `[🔍 ${displayText}](https://www.amazon.com/s?k=${encodedSearch}&tag=${AMAZON_AFFILIATE_TAG})`;
    });
    
    // Write the updated content
    fs.writeFileSync(SHOPPING_LIST, content, 'utf-8');
    
    console.log(`✅ Updated ${updates} Amazon links with affiliate tag`);
    console.log(`📄 Updated: ${SHOPPING_LIST}`);
    console.log(`\n💰 All links now use tag: ${AMAZON_AFFILIATE_TAG}`);
}

// Run it
updateAffiliateLinks();

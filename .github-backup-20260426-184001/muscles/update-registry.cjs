#!/usr/bin/env node
/**
 * update-registry.cjs
 * @reviewed 2026-04-18
 * 
 * Heir-autonomous muscle for maintaining AI-Memory project registry.
 * Works WITHOUT Master Alex — heirs can self-register and update their entry.
 * 
 * Usage:
 *   node .github/muscles/update-registry.cjs              # Update health metrics
 *   node .github/muscles/update-registry.cjs --register   # First-time registration
 *   node .github/muscles/update-registry.cjs --pattern "webview-state"  # Add successful pattern
 *   node .github/muscles/update-registry.cjs --friction "msal-token-refresh"  # Add friction point
 *   node .github/muscles/update-registry.cjs --meditated  # Record meditation completion
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const WORKSPACE_ROOT = process.cwd();
const AI_MEMORY_PATHS = [
    // Try common OneDrive folder names — adjust for your account
    ...fs.readdirSync(os.homedir())
        .filter(d => d.startsWith('OneDrive'))
        .map(d => path.join(os.homedir(), d, 'AI-Memory')),
    path.join(os.homedir(), 'AI-Memory'),
];

/**
 * Find AI-Memory folder
 */
function findAIMemoryPath() {
    for (const p of AI_MEMORY_PATHS) {
        if (fs.existsSync(p)) {
            return p;
        }
    }
    return null;
}

/**
 * Detect technologies in the current project
 */
function detectTechnologies() {
    const techs = [];
    
    if (fs.existsSync(path.join(WORKSPACE_ROOT, 'package.json'))) techs.push('nodejs');
    if (fs.existsSync(path.join(WORKSPACE_ROOT, 'tsconfig.json'))) techs.push('typescript');
    if (fs.existsSync(path.join(WORKSPACE_ROOT, 'pyproject.toml')) || 
        fs.existsSync(path.join(WORKSPACE_ROOT, 'requirements.txt'))) techs.push('python');
    if (fs.existsSync(path.join(WORKSPACE_ROOT, 'Cargo.toml'))) techs.push('rust');
    if (fs.existsSync(path.join(WORKSPACE_ROOT, 'go.mod'))) techs.push('go');
    if (fs.readdirSync(WORKSPACE_ROOT).some(f => f.endsWith('.sln'))) techs.push('dotnet');
    if (fs.existsSync(path.join(WORKSPACE_ROOT, '.github', 'skills'))) techs.push('alex-brain');
    
    // Detect VS Code extension
    const pkgPath = path.join(WORKSPACE_ROOT, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            if (pkg.engines?.vscode) techs.push('vscode-extension');
            if (pkg.dependencies?.react || pkg.devDependencies?.react) techs.push('react');
        } catch (e) {}
    }
    
    return [...new Set(techs)];
}

/**
 * Get project description from package.json or README
 */
function getDescription() {
    const pkgPath = path.join(WORKSPACE_ROOT, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            if (pkg.description) return pkg.description;
        } catch (e) {}
    }
    
    const readmePath = path.join(WORKSPACE_ROOT, 'README.md');
    if (fs.existsSync(readmePath)) {
        try {
            const content = fs.readFileSync(readmePath, 'utf-8');
            const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
            if (lines[0]) return lines[0].substring(0, 100);
        } catch (e) {}
    }
    
    return '';
}

/**
 * Count skills and instructions
 */
function countBrainAssets() {
    const skillsPath = path.join(WORKSPACE_ROOT, '.github', 'skills');
    const instructionsPath = path.join(WORKSPACE_ROOT, '.github', 'instructions');
    
    let skillCount = 0;
    let instructionCount = 0;
    
    if (fs.existsSync(skillsPath)) {
        skillCount = fs.readdirSync(skillsPath).filter(f => 
            fs.statSync(path.join(skillsPath, f)).isDirectory()
        ).length;
    }
    
    if (fs.existsSync(instructionsPath)) {
        instructionCount = fs.readdirSync(instructionsPath).filter(f => 
            f.endsWith('.md')
        ).length;
    }
    
    return { skillCount, instructionCount };
}

/**
 * Get brain version from copilot-instructions.md
 */
function getBrainVersion() {
    const copilotPath = path.join(WORKSPACE_ROOT, '.github', 'copilot-instructions.md');
    if (fs.existsSync(copilotPath)) {
        const content = fs.readFileSync(copilotPath, 'utf-8');
        // Look for version pattern like "v8.0.0" or "8.0.0"
        const match = content.match(/v?(\d+\.\d+\.\d+)/);
        if (match) return match[1];
    }
    return 'unknown';
}

/**
 * Load or initialize registry
 */
function loadRegistry(registryPath) {
    if (fs.existsSync(registryPath)) {
        return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    }
    return {
        version: '2.0.0',
        lastUpdated: new Date().toISOString(),
        projects: []
    };
}

/**
 * Find or create project entry
 */
function getProjectEntry(registry) {
    let entry = registry.projects.find(p => p.path === WORKSPACE_ROOT);
    
    if (!entry) {
        const { skillCount, instructionCount } = countBrainAssets();
        entry = {
            path: WORKSPACE_ROOT,
            name: path.basename(WORKSPACE_ROOT),
            description: getDescription(),
            lastAccessed: new Date().toISOString(),
            status: 'active',
            technologies: detectTechnologies(),
            brainVersion: getBrainVersion(),
            health: {
                skillCount,
                instructionCount,
                lastMeditation: null,
                meditationCount: 0
            },
            successfulPatterns: [],
            frictionPoints: [],
            promotedPatterns: []
        };
        registry.projects.push(entry);
    }
    
    return entry;
}

/**
 * Main execution
 */
function main() {
    const args = process.argv.slice(2);
    
    // Find AI-Memory
    const aiMemoryPath = findAIMemoryPath();
    if (!aiMemoryPath) {
        console.error('❌ AI-Memory folder not found. Checked:');
        AI_MEMORY_PATHS.forEach(p => console.error(`   - ${p}`));
        console.error('\nCreate the folder or configure OneDrive sync.');
        process.exit(1);
    }
    
    const registryPath = path.join(aiMemoryPath, 'project-registry.json');
    console.log(`📁 AI-Memory: ${aiMemoryPath}`);
    
    // Load registry
    const registry = loadRegistry(registryPath);
    const entry = getProjectEntry(registry);
    const isNew = !registry.projects.find(p => p.path === WORKSPACE_ROOT && p.health.lastMeditation);
    
    // Parse arguments
    let action = 'update';
    let value = null;
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--register') action = 'register';
        else if (arg === '--pattern' && args[i + 1]) { action = 'pattern'; value = args[++i]; }
        else if (arg === '--friction' && args[i + 1]) { action = 'friction'; value = args[++i]; }
        else if (arg === '--meditated') action = 'meditated';
        else if (arg === '--help' || arg === '-h') {
            console.log(`
Usage: node update-registry.cjs [options]

Options:
  --register              First-time registration
  --pattern <name>        Add a successful pattern
  --friction <issue>      Document a friction point
  --meditated             Record meditation completion
  --help, -h              Show this help

Examples:
  node update-registry.cjs                          # Update health metrics
  node update-registry.cjs --pattern "sse-streaming" 
  node update-registry.cjs --friction "webpack-esm"
  node update-registry.cjs --meditated
`);
            process.exit(0);
        }
    }
    
    // Always update health metrics
    const { skillCount, instructionCount } = countBrainAssets();
    entry.health.skillCount = skillCount;
    entry.health.instructionCount = instructionCount;
    entry.lastAccessed = new Date().toISOString();
    entry.technologies = detectTechnologies();
    entry.brainVersion = getBrainVersion();
    entry.description = entry.description || getDescription();
    
    // Update status based on recent activity
    const lastMeditation = entry.health.lastMeditation ? new Date(entry.health.lastMeditation) : null;
    const daysSinceMeditation = lastMeditation ? 
        Math.floor((Date.now() - lastMeditation.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    if (daysSinceMeditation < 7) entry.status = 'active';
    else if (daysSinceMeditation < 30) entry.status = 'maintenance';
    else entry.status = 'archived';
    
    // Execute specific action
    switch (action) {
        case 'register':
            console.log(`✅ Registered: ${entry.name}`);
            break;
            
        case 'pattern':
            if (!entry.successfulPatterns.includes(value)) {
                entry.successfulPatterns.push(value);
                console.log(`✅ Added pattern: ${value}`);
            } else {
                console.log(`ℹ️ Pattern already recorded: ${value}`);
            }
            break;
            
        case 'friction':
            if (!entry.frictionPoints.includes(value)) {
                entry.frictionPoints.push(value);
                console.log(`✅ Added friction point: ${value}`);
            } else {
                console.log(`ℹ️ Friction point already recorded: ${value}`);
            }
            break;
            
        case 'meditated':
            entry.health.lastMeditation = new Date().toISOString();
            entry.health.meditationCount = (entry.health.meditationCount || 0) + 1;
            entry.status = 'active';
            console.log(`✅ Meditation recorded (#${entry.health.meditationCount})`);
            break;
            
        default:
            console.log(`✅ Updated: ${entry.name}`);
    }
    
    // Save registry
    registry.lastUpdated = new Date().toISOString();
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
    
    // Summary
    console.log(`\n📊 ${entry.name}`);
    console.log(`   Skills: ${entry.health.skillCount}`);
    console.log(`   Instructions: ${entry.health.instructionCount}`);
    console.log(`   Status: ${entry.status}`);
    console.log(`   Patterns: ${entry.successfulPatterns.length}`);
    console.log(`   Friction: ${entry.frictionPoints.length}`);
    console.log(`   Meditations: ${entry.health.meditationCount}`);
    
    if (isNew) {
        console.log('\n🎉 First registration! Your project is now visible to the fleet.');
    }
}

main();

---
type: prompt
lifecycle: stable
inheritance: inheritable
description: "Self-driving release pipeline with quality gates at every step"
application: "When preparing releases, publishing artifacts, or deployment workflows"
mode: agent
agent: Alex
model: claude-opus-4-6
currency: 2026-04-21
---

# /release - Release Management

Self-driving release pipeline. Create a TODO list for all phases. Mark each in-progress before starting, completed immediately after finishing.

## Phase 0: Pre-Release Assessment

1. Run `node .github/muscles/brain-qa.cjs` and block if broken connections or count drift detected
2. Run `node scripts/release-preflight.cjs` and verify all checks pass
3. If either fails: fix issues first, re-run, do NOT proceed until clean

## Phase 1: Version Bump

1. Determine version bump type (patch/minor/major) based on changes since last release
2. Run `node scripts/bump-version.cjs <type>` to update all version locations
3. Verify by reading back each location to confirm the new version number

## Phase 2: Compile and Test

1. Run `npx tsc --noEmit` in `heir/platforms/vscode-extension/` -- zero errors required
2. Run `npm test` in the same directory -- zero failures required
3. If either fails: fix the issue and retry. Maximum 5 iterations. If still failing after 5 attempts, stop and report the blocking issue.

## Phase 3: Package

1. Run build: `npm run build` in `heir/platforms/vscode-extension/`
2. Package: `npx vsce package --no-dependencies` in same directory
3. Verify .vsix file exists and note its size
4. CRITICAL: Package AFTER all code changes are complete

## Phase 4: Publish

1. Load VSCE_PAT from root `.env` file
2. Publish: `npx vsce publish --no-dependencies --packagePath <file>.vsix`
3. If 401 error (PAT expired): stop and report -- user must regenerate at dev.azure.com

## Phase 5: Post-Release

1. Commit all changes with message: `release: vX.Y.Z`
2. Verify on marketplace: extension version matches

## Summary

After completing all phases, generate:
- Version released
- Files changed (with counts)
- Verifications passed (brain-qa, preflight, compile, test)
- Marketplace URL
- Issues encountered and resolutions

---
type: resource
lifecycle: stable
inheritance: inheritable
---

# User Memory Structure Template

> Recommended `/memories/` directory layout for heir projects.

## Directory Structure

```
/memories/
├── preferences.md          # Communication style, tool preferences
├── patterns.md             # Coding patterns, architectural preferences
├── debugging.md            # Common issues, solutions that worked
├── session/                # Conversation-scoped notes (auto-cleared)
│   └── (session files)
└── repo/                   # Repository-scoped facts
    └── project-context.md  # Build commands, conventions, structure
```

## File Templates

### preferences.md

```markdown
# Preferences

## Communication
- Direct and terse — fix before asking
- Brief confirmations, skip unnecessary framing

## Tools
- Package manager: npm (or pnpm, yarn)
- Terminal: PowerShell (or bash, zsh)
- Diagrams: Mermaid with base theme

## Code Style
- TypeScript strict mode
- Prefer const over let
- Early returns over nested if/else
```

### patterns.md

```markdown
# Patterns

## Architecture
- Feature-based folder structure
- Barrel exports per feature

## Testing
- Test files colocated with source
- Prefer integration tests over unit tests for API routes

## Git
- Atomic commits, descriptive messages
- Feature branches from main
```

### debugging.md

```markdown
# Debugging Notes

## Known Issues
- (Add recurring issues and their solutions here)

## Environment Gotchas
- (Platform-specific issues, PATH problems, etc.)
```

### repo/project-context.md

```markdown
# Project Context

## Build
- Install: `npm install`
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`

## Structure
- Source: `src/`
- Tests: `src/**/*.test.ts`
- Config: `tsconfig.json`

## Conventions
- (Project-specific patterns, naming rules, etc.)
```

## Usage

When bootstrapping a new heir project, copy this template structure to the project's `/memories/` directory. Customize each file with project-specific content during the first session.

The heir bootstrap wizard (`heir-bootstrap.instructions.md`) can scaffold this structure automatically.

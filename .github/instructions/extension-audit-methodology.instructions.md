---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "VS Code extension audit methodology for quality assessment across 5 dimensions"
application: "When auditing or reviewing VS Code extension code quality"
applyTo: "**/*audit*,**/*extension*"
currency: 2026-04-22
---

# Extension Audit Methodology — Auto-Loaded Rules

Dimensions 1-5 (debug/logging, dead code, performance, menus, dependencies), scan commands, report template → see extension-audit-methodology skill.

Full protocol in `.github/skills/extension-audit-methodology/SKILL.md`.

## Quick Reference

| Pattern | Symptom | Fix |
|---------|---------|-----|
| Dynamic config keys (tracking) | Unable to write to User Settings | Wrap in try-catch |
| Command registered not declared | Hidden from Command Palette | Add to `package.json` |
| Command declared not implemented | Runtime error on invoke | Implement or remove |
| Config read without default | `undefined` value | Always provide fallback |
- User-facing settings, critical config (paths, API keys) → Register in `package.json`
- Dynamic keys (analytics, counters, user tracking) → Try-catch with `console.log`
- If unsure → Register (better UX)

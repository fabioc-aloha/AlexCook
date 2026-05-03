---
type: prompt
lifecycle: stable
inheritance: inheritable
description: Manage API keys and secrets with VS Code SecretStorage
mode: agent
model: claude-opus-4-6
application: "When managing secrets, API keys, or credential storage"
agent: Alex
currency: 2026-04-21
---

# /secrets - Secrets Management


Implement secure credential storage using VS Code SecretStorage API for API keys, tokens, and passwords.

Create a TODO list for all steps. Mark each in-progress before starting, completed immediately after finishing.



After ANY file edit, run compilation check. Do not proceed until zero errors. If compilation or tests fail, fix and retry. Maximum 5 iterations per step.

## What This Does

- Implements VS Code SecretStorage API for encrypted credential storage
- Migrates tokens from environment variables to OS-level encryption
- Creates token management UI (quick pick + input prompts)
- Integrates secure token access into existing features
- Reviews code for credential security issues

## Process

1. **Understand scope**: New implementation or migration from env vars?
2. **Define tokens**: What services need credentials (API keys, tokens, etc.)?
3. **Create service**: Build secretsManager.ts with token registry
4. **Implement UI**: Quick pick for management + input prompts with validation
5. **Integrate features**: Update code to use `getToken()` instead of `process.env`
6. **Add migration**: Copy env vars to SecretStorage (non-destructive)
7. **Register command**: Add credential management to the extension's command surface
8. **Security review**: Check for hardcoded credentials, logging issues

## Token Registry Template

```typescript
export const TOKEN_CONFIGS: Record<string, TokenConfig> = {
    SERVICE_TOKEN: {
        key: 'extension.namespace.serviceToken',
        displayName: 'Service API Token',
        description: 'API token for service integration',
        getUrl: 'https://service.example.com/tokens',
        placeholder: 'svc_xxxxxxxxxxxxxxxxxxxx',
        envVar: 'SERVICE_API_TOKEN',  // For migration
    },
};
```

## Platform Support

| Platform | Backend | Works? |
|----------|---------|--------|
| Windows | Credential Manager | ✅ |
| macOS | Keychain | ✅ |
| Linux | Secret Service | ✅ |

## Security Checklist

- [ ] Keys namespaced: `extension.namespace.tokenName`
- [ ] No hardcoded tokens in source code
- [ ] No token logging (use `[REDACTED]` placeholders)
- [ ] Input boxes use `password: true` for masking
- [ ] Cache updated when storing/deleting
- [ ] Env vars remain (non-destructive migration)
- [ ] Format validation before storage

## Common Patterns

**Feature Integration**:
```typescript
const apiKey = getToken('SERVICE_TOKEN');
if (!apiKey) {
    await showWarningWithConfigOption();
    return;
}
```

**Migration Timing**:
- Extension activation (every startup)
- Initialize command (new projects)
- Upgrade command (existing projects)

## Example Requests

- "Add API key management for the Gamma service"
- "Migrate API keys from environment variables to SecretStorage"
- "Review this code for credential security"
- "Why isn't my token persisting across restarts?"
- "Create a token management UI"

## Start

Beginning secrets management. What service needs credential storage, or would you like to review existing code?


## Summary

After completing all steps, generate:
- Files changed (with counts)
- Verifications passed (compile, test, lint)
- Issues encountered and resolutions
- Anything requiring manual attention
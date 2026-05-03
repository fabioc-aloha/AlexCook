---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
model: claude-opus-4-6
description: Validate VS Code extension manifest consistency: command registration, configuration keys, and graceful degradation patterns
application: "When developing or maintaining VS Code extensions"
currency: 2026-04-21
---

# Validate Extension Configuration


Validate VS Code extension manifest configuration and command registration

Create a TODO list for all steps. Mark each in-progress before starting, completed immediately after finishing.



After ANY file edit, run compilation check. Do not proceed until zero errors. If compilation or tests fail, fix and retry. Maximum 5 iterations per step.

## Prompt

You are reviewing a VS Code extension for configuration and manifest consistency issues.

**Task**: Systematically validate that:
1. All `workspace.getConfiguration().update()` calls are properly handled
2. All `registerCommand()` calls match package.json declarations
3. Configuration reads have appropriate defaults
4. Dynamic configuration uses graceful degradation patterns

**Process**:

1. **Find configuration updates** (manual validation):
   ```powershell
   # Search for configuration writes
   Select-String -Path src -Pattern "getConfiguration.*\.update\(" -Recurse
   # Search for configuration reads
   Select-String -Path src -Pattern "getConfiguration\(" -Recurse
   ```

2. **For each configuration key found**:
   - Extract the config context: `getConfiguration('my-ext.feature')`
   - Extract the key: `.get('settingName')` or `.update('settingName')`
   - Build full key: `my-ext.feature.settingName`
   - Verify key exists in `package.json` `configuration.properties`

3. **Review results**:
   - ✅ **Passing**: All keys are registered in package.json
   - ⚠️ **Warnings**: Keys using try-catch for dynamic configs
   - ❌ **Errors**: Unregistered keys without error handling

4. **For each error found**:
   - **Option A**: Register the configuration in package.json `configuration.properties`
   - **Option B**: Wrap in try-catch if it's non-critical dynamic configuration
   - Document the decision rationale

4. **Verify fixes**:
   - Re-run validation script
   - Test configuration updates in clean VS Code instance
   - Confirm features work correctly

5. **Report findings**:
   - List all issues found
   - Show applied fixes
   - Confirm validation passes

**Guidance**:
- Use **Pattern A** (register in package.json) for user-facing settings
- Use **Pattern B** (try-catch) for analytics/tracking with dynamic keys
- Always provide default values in `.get()` calls
- Critical configuration should fail loudly (no try-catch)

**Cross-reference**: `.github/instructions/vscode-configuration-validation.instructions.md`

## Sample

User: "/validateConfig"

Alex:
1. Running manifest validation script...
2. [Shows script output]
3. Found X issues:
   - [Details each issue with file:line]
4. Recommended fixes:
   - [Specific fix for each issue]
5. [Applies fixes if approved]
6. Re-running validation... ✅ All checks pass


## Summary

After completing all steps, generate:
- Files changed (with counts)
- Verifications passed (compile, test, lint)
- Issues encountered and resolutions
- Anything requiring manual attention
---
type: prompt
lifecycle: stable
inheritance: inheritable
description: Generate unit tests for selected code
mode: agent
model: claude-opus-4-6
application: When you need comprehensive test coverage for a module, function, or class
agent: Alex
currency: 2026-04-21
---


# Generate Tests

Generate comprehensive tests for:

Create a TODO list for all steps. Mark each in-progress before starting, completed immediately after finishing.



After ANY file edit, run compilation check. Do not proceed until zero errors. If compilation or tests fail, fix and retry. Maximum 5 iterations per step.

${{input}}

## Requirements

1. Use the project's testing framework
2. Follow Arrange-Act-Assert pattern
3. Include:
   - Happy path tests
   - Edge cases
   - Error conditions
4. Use descriptive test names
5. Mock external dependencies

## Output Format

```typescript
describe('[Component]', () => {
  describe('[method]', () => {
    it('should [behavior] when [condition]', () => {
      // Arrange
      
      // Act
      
      // Assert
    });
  });
});
```


## Summary

After completing all steps, generate:
- Files changed (with counts)
- Verifications passed (compile, test, lint)
- Issues encountered and resolutions
- Anything requiring manual attention
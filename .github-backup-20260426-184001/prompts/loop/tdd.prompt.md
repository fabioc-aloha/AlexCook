---
mode: agent
description: "Test-Driven Development — Red/Green/Refactor cycle"
application: "Write failing tests first, implement to pass, then refactor"
tools: ["create_file", "read_file", "run_in_terminal", "replace_string_in_file"]
---

# Test-Driven Development

Start a Test-Driven Development cycle.

## TDD Cycle (Red/Green/Refactor)

```
┌─────────────────────────────────────────┐
│                                         │
│  🔴 RED ──────► 🟢 GREEN ──────► 🔵 REFACTOR
│    │                                │
│    │                                │
│    └────────────────────────────────┘
│
```

### 🔴 RED

Write a failing test that defines expected behavior.

- Test should be specific and focused
- It MUST fail before you write the code
- The failure message should be clear

### 🟢 GREEN

Write the **minimum** code to pass the test.

- Don't gold-plate
- Don't worry about elegance yet
- Just make it work

### 🔵 REFACTOR

Improve the code while keeping tests green.

- Remove duplication
- Improve naming
- Extract patterns
- Run tests after each change

## Testing Pyramid

| Level | Volume | Speed | What It Catches |
|-------|--------|-------|-----------------|
| Unit | Many (70%) | <10ms | Logic errors, edge cases |
| Integration | Some (20%) | <1s | Wiring bugs, API contracts |
| E2E | Few (10%) | 5-30s | User journey failures |

## Test Structure (AAA Pattern)

```typescript
describe("Calculator", () => {
  it("should add two numbers", () => {
    // Arrange
    const calc = new Calculator();
    
    // Act
    const result = calc.add(2, 3);
    
    // Assert
    expect(result).toBe(5);
  });
});
```

## Good Test Characteristics

- **Fast**: Milliseconds, not seconds
- **Isolated**: No dependencies between tests
- **Repeatable**: Same result every time
- **Self-validating**: Pass or fail, no manual inspection
- **Timely**: Written before or with the code

What feature should we TDD?

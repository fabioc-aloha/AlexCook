---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
description: "Test phase — validate against success criteria with domain-specific methods"
application: "Run tests, validate success criteria, and verify quality gates"
tools: ["read_file", "create_file", "list_dir", "run_in_terminal"]
currency: 2026-04-22
---

# ④ Test

I'm ready to validate. Review my wiki/ and help me test.

## Phase 1: Review Success Criteria

Read wiki/plan-Success.md to understand what "done" looks like.

## Phase 2: Create Validation Pages

Add test/validation documentation to wiki/:

**If Software:**

```
wiki/
├── test-Strategy.md         # What to test, coverage goals
├── test-Cases.md            # Test cases and scenarios
└── test-Results.md          # Test run results
```

**If Book/Writing:**

```
wiki/
├── test-Review-Checklist.md # Beta reader questions
├── test-Consistency.md      # Fact-checking, timeline
└── test-Feedback.md         # Collected feedback
```

**If Thesis/Academic:**

```
wiki/
├── test-Peer-Review.md      # Reviewer feedback
├── test-Methodology.md      # Methodology validation
└── test-Citations.md        # Citation audit
```

**If Business Plan:**

```
wiki/
├── test-Assumptions.md      # Assumption validation
├── test-Financial-Model.md  # Stress tests
└── test-Market-Validation.md
```

## Phase 3: Execute and Document

Run validation, document findings in test-Results.md or equivalent.

## Phase 4: Update Navigation

Update _Sidebar.md with Test section. Update Home.md status to "Testing".

Start by reading wiki/plan-Success.md.

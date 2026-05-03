---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
model: claude-opus-4-6
description: Check documents and policies for AI writing tells and suggest improvements for authentic voice
application: "When generating documentation, READMEs, or technical writing"
tools: []
currency: 2026-04-21
---

# Document Voice Audit

Analyze the provided document for AI writing patterns and provide specific improvement recommendations.

Create a TODO list for all steps. Mark each in-progress before starting, completed immediately after finishing.



After ANY file edit, run compilation check. Do not proceed until zero errors. If compilation or tests fail, fix and retry. Maximum 5 iterations per step.

## Audit Process

1. **Vocabulary Scan**: Flag any overused AI words (delve, myriad, tapestry, beacon, crucial, landscape, realm, paradigm, multifaceted, plethora, liminal, robust, seamless, leverage, optimize)

2. **Structure Check**: Identify preambles ("In this document we will..."), announcements, and restating conclusions

3. **Tone Analysis**: Find hedging language ("It's worth noting", "One might argue", "It's important to consider")

4. **Phrase Detection**: Flag AI-typical phrases ("In today's world", "In the ever-evolving landscape", "Navigating the complexities")

5. **Format Review**: Check for bullet addiction, predictable headers, forced rule-of-three

6. **Content Check**: Note missing specificity, generic examples, perfectly balanced arguments

## Output Format

Provide:
1. **Score**: Red flags found (0-2 clean, 3-5 needs work, 6+ major revision)
2. **Specific Findings**: Line-by-line issues with the exact problematic text
3. **Rewrites**: Suggested human-sounding alternatives for each issue
4. **Summary**: Overall assessment and priority fixes

## User Input

Provide the document text or file path to audit.


## Summary

After completing all steps, generate:
- Files changed (with counts)
- Verifications passed (compile, test, lint)
- Issues encountered and resolutions
- Anything requiring manual attention
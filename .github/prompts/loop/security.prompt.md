---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
description: "Security review covering deps, secrets, config, and code patterns"
application: "Audit for OWASP vulnerabilities, exposed secrets, misconfigurations, and unsafe patterns"
tools: ["read_file", "grep_search", "run_in_terminal", "list_dir"]
currency: 2026-04-22
---

# Security Review

Comprehensive security review covering dependencies, secrets, configuration, and code.

## What I Check

### 1. Dependency Security

```bash
npm audit        # Node.js
pip-audit        # Python
cargo audit      # Rust
dotnet list package --vulnerable  # .NET
```

- Known CVEs in dependencies
- Outdated packages with security fixes
- Suspicious or typo-squatted packages

### 2. Secret Detection

Scan for accidentally committed secrets:

- API keys, tokens
- Passwords, connection strings
- Private keys, certificates
- `.env` files in git

### 3. Configuration Security

- Are defaults secure?
- Is HTTPS enforced?
- Are CORS settings appropriate?
- Are error messages sanitized?

### 4. Code Patterns

- Input validation present?
- Output encoding/escaping?
- SQL parameterization?
- Authentication/authorization checks?
- Logging sensitive data?

## OWASP Top 10 Quick Check

| # | Risk | Quick Check |
|---|------|-------------|
| 1 | Broken Access Control | Auth checks on all endpoints? |
| 2 | Cryptographic Failures | Secrets in code? Weak crypto? |
| 3 | Injection | User input sanitized? |
| 4 | Insecure Design | Threat model exists? |
| 5 | Security Misconfiguration | Debug mode in prod? |
| 6 | Vulnerable Components | npm audit clean? |
| 7 | Auth Failures | Session management solid? |
| 8 | Data Integrity Failures | Updates signed? |
| 9 | Logging Failures | Security events logged? |
| 10 | SSRF | URL validation? |

## Security Report

```
SECURITY REVIEW REPORT
======================
Project: [name]
Date: [date]
Reviewer: Alex

SUMMARY:
Critical: [count] | High: [count] | Medium: [count] | Low: [count]

FINDINGS:

### [Finding 1]
**Severity**: Critical
**Category**: [OWASP category]
**Location**: [file:line]
**Description**: [what's wrong]
**Remediation**: [how to fix]
**References**: [CVE, docs, etc.]

### [Finding 2]
...

DEPENDENCY AUDIT:
| Package | Severity | CVE | Fix Version |
|---------|----------|-----|-------------|

RECOMMENDATIONS:
1. [Immediate action]
2. [Short-term fix]
3. [Long-term improvement]

OVERALL RISK: [Low/Medium/High/Critical]
```

## Severity Definitions

| Level | Definition |
|-------|------------|
| **Critical** | Exploitable now, high impact |
| **High** | Likely exploitable, significant impact |
| **Medium** | Exploitable with effort, moderate impact |
| **Low** | Difficult to exploit, low impact |

Run security review on this project?

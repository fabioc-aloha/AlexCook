---
mode: agent
description: "Dependency review, security audit, and update strategy"
application: "Audit dependencies for vulnerabilities, outdated versions, and upgrade paths"
tools: ["read_file", "run_in_terminal", "grep_search"]
---

# Dependency Review

Comprehensive dependency review with security audit and update strategy.

## What I Check

### 1. Security Vulnerabilities

```bash
# Node.js
npm audit

# Python
pip-audit
safety check

# Rust
cargo audit

# .NET
dotnet list package --vulnerable
```

### 2. Outdated Packages

```bash
# Node.js
npm outdated

# Python
pip list --outdated

# Rust
cargo outdated
```

### 3. Unused Dependencies

Packages in manifest but not imported anywhere.

### 4. License Compliance

Check licenses are compatible with your project's license.

## Update Strategy

### Risk Categories

| Category | Description | Update Strategy |
|----------|-------------|-----------------|
| **Patch** | x.x.N | Auto-update, low risk |
| **Minor** | x.N.x | Review changelog, test |
| **Major** | N.x.x | Plan migration, check breaking changes |

### Update Priority

| Priority | Criteria | Action |
|----------|----------|--------|
| **Urgent** | Known CVE, actively exploited | Update immediately |
| **High** | Security fix, no CVE | Update within 1 week |
| **Medium** | Bug fix, stability | Update at next release |
| **Low** | New feature, no urgency | Update when convenient |

## Dependency Report

```
DEPENDENCY REPORT
=================
Project: [name]
Date: [date]
Package Manager: [npm/pip/cargo]

SUMMARY:
Total Dependencies: [count]
Direct: [count] | Transitive: [count]
Outdated: [count]
Vulnerable: [count]
Unused: [count]

SECURITY VULNERABILITIES:
| Package | Severity | CVE | Current | Fixed |
|---------|----------|-----|---------|-------|
| [pkg] | Critical | [CVE] | [ver] | [ver] |

OUTDATED PACKAGES:
| Package | Current | Latest | Type | Priority |
|---------|---------|--------|------|----------|
| [pkg] | [ver] | [ver] | Major | High |

UNUSED DEPENDENCIES:
- [package] — appears unused, verify before removing

LICENSE SUMMARY:
| License | Count | Packages |
|---------|-------|----------|
| MIT | [n] | pkg1, pkg2 |
| Apache-2.0 | [n] | pkg3 |

RECOMMENDATIONS:
1. [Immediate update]: [packages] due to CVE
2. [Plan migration]: [package] major version
3. [Remove]: [unused packages]

UPDATE COMMANDS:
# Run these in order:
npm update [package1] [package2]   # Safe updates
npm install [package]@[version]    # Specific version
```

## Best Practices

- **Lock files**: Always commit package-lock.json / poetry.lock
- **Renovate/Dependabot**: Automate update PRs
- **Pin major versions**: `^1.0.0` allows minor/patch, not major
- **Audit in CI**: Fail builds on critical vulnerabilities
- **Review transitive deps**: Check what your dependencies depend on

Run dependency review on this project?

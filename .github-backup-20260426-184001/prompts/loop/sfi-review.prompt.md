---
mode: agent
description: "Assess project against Microsoft Secure Future Initiative principles"
application: "Evaluate project against SFI pillars: secure by design, default, and operations"
tools: ["codebase", "terminal", "editFiles"]
---

Assess this project against Microsoft's Secure Future Initiative (SFI) principles.

## SFI Core Pillars

### Pillar 1: Secure by Design

- Is security built in from the start, not bolted on?
- Are secure defaults used?
- Is the attack surface minimized?

### Pillar 2: Secure by Default

- Are insecure options disabled by default?
- Do users have to opt-in to risky features?
- Are secure configurations the path of least resistance?

### Pillar 3: Secure Operations

- Are there monitoring and detection capabilities?
- Is there an incident response plan?
- Are security patches applied promptly?

## SFI Engineering Practices

Check for these practices:

### Identity & Access

- [ ] Least privilege access
- [ ] No hardcoded credentials
- [ ] MFA where applicable
- [ ] Token/key rotation

### Code Security

- [ ] Input validation
- [ ] Output encoding
- [ ] Parameterized queries
- [ ] Secure dependencies

### Data Protection

- [ ] Encryption at rest
- [ ] Encryption in transit
- [ ] Data classification
- [ ] Retention policies

### Infrastructure

- [ ] Network segmentation
- [ ] Logging and monitoring
- [ ] Backup and recovery
- [ ] Patch management

## Assessment

For each pillar and practice area, assess:

- 🟢 Compliant — meets SFI standards
- 🟡 Partial — some gaps to address
- 🔴 Non-compliant — significant work needed
- ⚪ N/A — not applicable

## Report

```text
SFI COMPLIANCE ASSESSMENT
=========================
Secure by Design:    🟢/🟡/🔴 — [notes]
Secure by Default:   🟢/🟡/🔴 — [notes]
Secure Operations:   🟢/🟡/🔴 — [notes]

ENGINEERING PRACTICES:
Identity & Access:   🟢/🟡/🔴 — [notes]
Code Security:       🟢/🟡/🔴 — [notes]
Data Protection:     🟢/🟡/🔴 — [notes]
Infrastructure:      🟢/🟡/🔴 — [notes]

CRITICAL GAPS (immediate action):
- [list]

REMEDIATION PLAN:
1. [priority action]
2. [second action]
3. [third action]

SFI ARTIFACTS NEEDED:
- [ ] Threat model document
- [ ] Security design review
- [ ] Penetration test plan
```

Start by identifying security-sensitive components.

---
description: "STRIDE-based threat modeling — data flow diagrams, trust boundaries, and prioritized mitigations"
application: "When analyzing security architecture, performing threat modeling, or reviewing system security before deployment"
applyTo: "**/*threat*,**/*security*,**/*stride*"
---

# Security Threat Modeling

Generate STRIDE-based threat models compatible with Microsoft Threat Modeling Tool.

## STRIDE Categories

| Threat | Property Violated | Example |
|--------|------------------|---------|
| **S**poofing | Authentication | Forged tokens, impersonation |
| **T**ampering | Integrity | Modified data in transit |
| **R**epudiation | Non-repudiation | Unlogged actions |
| **I**nformation Disclosure | Confidentiality | Data leaks, verbose errors |
| **D**enial of Service | Availability | Resource exhaustion |
| **E**levation of Privilege | Authorization | Broken access controls |

## Process

1. Identify assets and entry points
2. Draw data flow diagrams with trust boundaries
3. Apply STRIDE to each data flow crossing a trust boundary
4. Rate threats by risk (likelihood x impact)
5. Propose mitigations ranked by cost-effectiveness

## Skill Reference

Full methodology in `.github/skills/security-threat-modeler/SKILL.md`.

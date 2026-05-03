---
mode: agent
description: Deep competitive intelligence across the AI-assisted development market — feature matrix, unique differentiators, trend analysis, and honest self-assessment
---

# Competition Watch

## Objective

Produce a thorough competitive intelligence report covering the AI-assisted development market. The output should be honest, specific, and strategically useful — not a marketing document. Acknowledge where competitors lead. Call out where Alex overclaims. The goal is accurate intelligence, not cheerleading.

## Context

Read the current report before starting:

- `master-wiki/news-feed/COMPETITION-WATCH-LATEST.md` — current baseline
- `master-wiki/news-feed/competition/` — archive of previous reports

Build on the existing report rather than starting from scratch. Update facts, add new competitors, remove stale claims, and refine the analysis based on what changed since the last report.

## Competitors to Track

### Tier 1 — Direct Competitors (deep analysis required)

| Tool | Type | Why Tier 1 |
|------|------|------------|
| **Cursor** | Fork of VS Code | Market leader in AI-native IDE, parallel agents, Design Mode |
| **Windsurf** | Fork of VS Code | Devin integration, vertical model stack (SWE-1.5) |
| **Cline** | VS Code extension | Closest direct competitor — same platform, autonomous agent, hooks |
| **GitHub Copilot** | VS Code / IDE / CLI | The platform Alex runs on — symbiosis, not competition |

### Tier 2 — Significant Players (standard analysis)

| Tool | Type | Why Tier 2 |
|------|------|------------|
| **Continue** | VS Code / JetBrains / CLI | Provider-agnostic, open-source, cost-optimized routing |
| **Aider** | CLI | Architect mode, self-coding benchmark, broadest language support |
| **Zed** | Standalone (Rust) | ACP protocol, multiplayer, Sequoia-backed |
| **Bolt.new** | Browser | Different audience (non-developers) but sets market expectations |

### Tier 3 — Emerging / Watch List (brief mention if newsworthy)

- **Amazon Q Developer** — AWS ecosystem play
- **Tabnine** — Enterprise code completion, privacy-focused
- **Sourcegraph Cody** — Code search + AI, enterprise
- **JetBrains AI** — IDE-native AI for IntelliJ ecosystem
- **Replit Agent** — Browser IDE + deployment
- **Devin** (standalone) — Cognition's autonomous agent outside Windsurf
- **OpenHands** (formerly OpenDevin) — Open-source autonomous agent
- **SWE-agent** — Princeton's research agent
- **OpenClaw** — Open-source AI coding agent
- Any new entrant generating significant attention

## New Player Discovery (mandatory every run)

Every report MUST include a dedicated scan for new entrants. The AI coding tool space moves fast — new players can appear between runs and reach traction before anyone notices.

### Discovery Sources

Search these specifically for NEW tools not yet in our Tier 1-3 lists:

1. **Hacker News** — Search "Show HN" + "AI coding", "AI IDE", "AI agent", "coding assistant" for the period since last report
2. **Product Hunt** — Search "AI coding", "developer tools", "AI IDE" for recent launches
3. **GitHub Trending** — Check trending repos tagged `ai-coding`, `code-assistant`, `autonomous-agent`, `llm-tools`
4. **Y Combinator** — Check recent YC batches for AI developer tools startups
5. **Reddit** — r/programming, r/vscode, r/LocalLLaMA, r/ChatGPTPro for "just launched", "new tool", "alternative to"
6. **Twitter/X** — Search "just launched" + "AI coding", "coding agent", "AI IDE"
7. **Tech press** — TechCrunch, The Verge, VentureBeat funding announcements in developer tools
8. **VS Code Marketplace** — Sort by recent + AI category for new extensions with fast-growing installs

### New Player Evaluation Criteria

For each new entrant found, assess:

- **What is it?** (IDE, extension, CLI, browser, API)
- **What's novel?** (Does it offer a capability no existing tool has?)
- **Traction signals** (GitHub stars, downloads, funding, team pedigree)
- **Threat level to Alex** (None / Watch / Moderate / High)
- **Recommended tier** (Add to Tier 2, Tier 3, or just mention once)

### Output for New Players

Add a dedicated section to the report:

```markdown
## New Entrants

### [Tool Name] (NEW)
**What**: [One-line description]
**Novel angle**: [What makes it different from existing tools]
**Traction**: [Stars, downloads, funding, notable backers]
**Threat assessment**: [None/Watch/Moderate/High] — [Why]
**Recommendation**: Add to Tier [2/3] / Monitor / Dismiss
```

If no new entrants are found, explicitly state: "No significant new entrants detected this period." — don't silently skip the section.

## Research Protocol

### Sources to Check (in order)

1. **Official changelogs** — cursor.com/changelog, windsurf.com/changelog
2. **GitHub releases** — Cline, Continue, Aider, Zed, OpenHands release pages
3. **Product blogs** — Each competitor's blog and announcement pages
4. **GitHub Copilot changelog** — github.blog/changelog/label/copilot/
5. **Hacker News** — Search for each tool name, look for launch posts and discussions
6. **Product Hunt** — AI coding tools launched since last report
7. **Reddit** — r/cursor, r/vscode, r/programming, r/LocalLLaMA for relevant threads
8. **Twitter/X** — Official accounts and developer reactions
9. **Tech press** — TechCrunch, The Verge, Ars Technica for funding/acquisition news
10. **Marketplace/download stats** — VS Code Marketplace for Cline, Continue installs, new AI extensions

### What to Research Per Competitor

- **Version releases** since last report (exact version numbers + dates)
- **New capabilities** with specific feature names
- **Pricing or business model changes**
- **Funding, acquisitions, or partnerships**
- **User adoption signals** (downloads, stars, contributor growth)
- **Breaking changes or deprecations** that affect users
- **Community sentiment** — what are users praising/complaining about?

## Output Structure

### 1. Executive Summary (3-5 sentences)

State the period covered, the most significant market shifts, and what changed for Alex's competitive position. Be specific — name the tools and features that matter most.

### 2. Competitor Updates (per competitor, Tier 1 gets more depth)

For each competitor with news:

```markdown
### [Tool Name] (by [Company])

**Latest**: [Specific releases with version numbers and dates. What was announced, shipped, or changed.]

**Significance**: [Why this matters for the market. What capability gap does it close or open? What trend does it accelerate?]

**Alex Comparison**: [Honest assessment. Where Alex leads, where it trails, and what's genuinely different vs. superficially similar. Call out apples-to-oranges comparisons.]
```

### 3. Feature Comparison Matrix

Update the full matrix from the previous report. Rules:

- Use 🏆 for genuine category leaders (not "most features" but "best implementation")
- Include all Tier 1 and Tier 2 competitors as columns
- Add new capability rows when competitors ship genuinely new categories
- Remove rows that no longer differentiate (if everyone has it, it's table stakes)

### 4. Critical Analysis of This Comparison

**Required sections** — this is what makes the report honest:

- **Where we may overclaim Alex** — features that sound impressive but have caveats
- **Where we may underclaim competitors** — capabilities we might dismiss too easily
- **Missing from this analysis** — pricing, adoption, onboarding, performance, etc.
- **Claims that need independent verification** — marketing claims vs. verified facts

### 5. Unique Differentiators

Table of capabilities each tool offers that NO other tool provides. The bar is high — "unique" means literally no competitor has it, not "we do it better."

### 6. Competitive Landscape Trends

Identify 3-7 market trends with analysis:
- What's the trend?
- Which competitors are driving it?
- Where does Alex stand?
- Is this a threat, opportunity, or neutral shift?

### 7. Alex Differentiation

Honest assessment of what makes Alex genuinely unique. Include caveats for each claim. Distinguish between "unique" and "better" — some things are unique but not necessarily advantages.

### 8. Strategic Considerations

Actionable checklist items. Each item should be specific enough to become a task in PLAN-v8.1.0.md or a future release plan. Format as `- [ ] **[Action]** — [Rationale]`.

### 9. Sources

Numbered list with URLs. Every factual claim should trace to a source.

## File Outputs

1. **Archive copy**: `master-wiki/news-feed/competition/YYYY-MM-DD-competition-watch.md`
2. **Latest copy**: Overwrite `master-wiki/news-feed/COMPETITION-WATCH-LATEST.md` with the same content

The LATEST file is the canonical reference that other documents and skills link to.

## Quality Standards

### Intellectual Honesty

- Acknowledge where competitors lead — don't spin weaknesses as strengths
- Distinguish between "Alex has a feature" and "Alex leads in this category"
- Note when Alex's agent count (18) or skill count (194) measures file count rather than verified impact
- Flag self-reported metrics (Aider's 88% self-coding, Bolt.new's 98% less errors) as unverified
- Disclose home-team bias explicitly in the Critical Analysis section

### Specificity

- Use exact version numbers and release dates, not "recently"
- Name specific features, not vague capabilities
- Compare equivalent functionality, not marketing language
- State download/star counts when available

### Strategic Value

- Every trend should connect to an Alex action item
- Differentiation claims should be testable (could a user verify this?)
- Strategic considerations should be concrete enough to execute

### Freshness

- Update Alex's own stats (skill count, instruction count, heir count) from the actual brain
- Remove competitor features that were deprecated or reversed
- Note if a competitor's changelog hasn't updated (signals stagnation or pivot)

## Anti-Patterns to Avoid

- **Don't use "delve", "landscape", "paradigm", "myriad"** — follow ai-writing-avoidance rules
- **Don't overclaim Alex's agents** — they're prompt-routed personas, not parallel code-executing agents
- **Don't dismiss CLI tools** — Aider's simplicity is a genuine strength
- **Don't ignore pricing** — cost matters for adoption
- **Don't call dream states "autonomous"** — they require human participation
- **Don't treat file counts as quality metrics** — 194 skills means nothing without activation data

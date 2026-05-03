---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Battle-tested patterns learned from real project experience — gotchas, solutions, and architectural rules"
application: "Always active — apply relevant patterns when working in matching domains"
applyTo: "**"
currency: 2026-04-25
---

# Learned Patterns

Hard-won patterns from production experience. Each entry records a specific gotcha or proven solution.

## Security

- **Markdown rendering chain**: marked.js → DOMPurify → Mermaid post-render. Parse first, sanitize second, then run diagram renderer on the sanitized DOM. Never skip the sanitizer even if content is "trusted."
- **Allowlist over blocklist**: For URL validation, file path validation, command execution — enumerate permitted values, reject everything else
- **Sanitize at system boundaries**: Strip file paths, stack traces, internal state from user-facing error messages. Regex: replace absolute paths with `[path]`. Also: don't forward raw SDK error messages to clients.
- **execFileSync over execSync**: When spawning known executables (git, gh, node), use `execFileSync(cmd, argsArray)` instead of `execSync("cmd args")`. Avoids shell injection surface, slightly faster. Same blocking behavior.
- **Cache expensive CLI probes**: `ghAvailable()`, `gitAvailable()`, and similar "is tool installed?" checks should cache at module level (`let cached: boolean | null = null`). The answer doesn't change mid-session.
- **Atomic filesystem writes**: Copy to staging dir → swap (rename) → cleanup on failure. Avoids partial-write corruption.
- **Path traversal guard**: When copying trees, validate `path.resolve(dest, entry.name)` stays within destination root
- **Event delegation over inline handlers**: Never use `onclick="fn('${userInput}')"` with user-sourced data (localStorage, URL params). Use `data-*` attributes + event delegation to prevent XSS.
- **escAttr must cover 6 chars**: `& < > " ' \` — missing any creates injection vectors in HTML attributes

## GitHub

- **`.github/README.md` overrides root README**: GitHub treats `.github/README.md` as a community health file and displays it on the repo landing page instead of the root `README.md`. Rename to `ABOUT.md` or delete to fix.
- **GitHub Wiki is flat**: All pages render at root. Automate folder→flat mapping with link rewriting (same-folder, cross-folder, source-code→repo URL). Sidebar `_Sidebar.md` is ground truth for link targets.

## Documentation

- **Docs decay proportional to velocity**: Hardcoded numbers (test counts, line counts, version requirements) rot fastest. Prefer runtime reads or "as of [date]" stamps.
- **Multi-surface count drift**: When a number (skill count, instruction count) appears in N files across M surfaces, it WILL diverge. Grep for the old number across all surfaces when updating. Analytical/point-in-time docs are exempt — those are historical records.
- **Automate version stamps**: Version numbers in 5+ files WILL drift with manual edits. Solution: single-source (root `package.json`) + bump script that derives all locations. Classify each reference as auto-derivable vs. inherently manual (changelogs, planning docs).
- **Plan integrity has no automated check**: Lane header task counts (e.g., "0/6") and total rollups can silently diverge from the actual backlog items when tasks are added. Manual recount is the only verification.
- **Planning voice → past tense**: Strategy docs written in future tense ("will ship", "in progress") must be updated when milestones complete.
- **Dual-surface docs drift**: Two READMEs covering overlapping scope will diverge. Cross-reference from the less-detailed to the more-detailed, or consolidate.
- **Wiki = user docs, README = developer docs**: Keep audience separation clean. Wiki for end users (no Node.js), README for contributors.
- **No decoration in machine-consumed files**: Emoji, color codes, or visual markers in tables/configs parsed by regex or LLMs will break tooling.

## Architecture

- **Default to fast, opt into slow**: For AI/LLM features, default to shortest response length. Users who want more depth will select it. Persist preference in localStorage.
- **Defaults-plus-overrides**: Provide role/archetype defaults, allow partial overrides, clamp bounds.
- **Weighted scoring matrix**: Multi-factor scoring with normalized weights and optional boosts.
- **Staged transformation pipeline**: Input flows through discrete stages (profile → style → format → output). Each stage is independently testable and replaceable.
- **Opt-in for workspace mutations**: Extensions/tools that write to user workspaces must get explicit consent first. Auto-writing .github/, config files, or scaffolding without confirmation violates least-surprise.
- **Cross-platform path resolution**: Never use raw `process.env.APPDATA` for VS Code paths. Use `os.platform()` switch: Windows=`%APPDATA%/Code/User`, macOS=`~/Library/Application Support/Code/User`, Linux=`${XDG_CONFIG_HOME:-~/.config}/Code/User`.
- **Report → Validate → Approve loop for non-trivial refactors**: For changes spanning trifectas, shared cores, or multiple executors, produce a plain-text `PROPOSED.txt` with numbered phases, open questions (`Qn`), residual risks (`Rn`), falsifiability tests, and a `[ ]` approval checklist. User annotates inline with `A:` lines; agent closes out by propagating each answer to its home (docs, preflight, shared core) and stamping `APPROVED <date>`. Plain text > markdown so inline annotations survive. Silence on a risk = accepted residual. The parity checks you add during closeout will catch real drift — that is the point. See `.github/prompts/propose-change.prompt.md`.
- **Mechanical vs semantic split in trifectas — both need critical thinking**: Every trifecta that touches heir/user data has two halves that must be classified and handled differently. Mechanical = safe to automate in the muscle/script (file existence, version comparison, directory copy, lock schema enforcement, protected-path lists). Semantic = must flow through LLM curation in Phase 2 (vision text like `NORTH-STAR.md`, identity narrative like `copilot-instructions.md`, "should this stale project be archived", "does this friction point indicate a real pattern"). **Neither half is automatically safe.** Scripts are buggy and miss nuance (the mechanical core missed that NORTH-STAR might be in the wrong directory, semver strict-equal caused accidental downgrades, backup-restore silently overwrote fresh trifectas). LLMs are inconsistent and can hallucinate fixes (the semantic pass can merge stale content, invent file paths, or skip reconciliation entirely). Apply critical thinking to both: for mechanical, ask "what edge case does this script miss?" and add parity/regression tests; for semantic, ask "what would a decision table look like?" and encode it in the skill so the LLM has a checklist rather than freeform judgment. When in doubt, save to `.backup.md` and defer to Phase 2 — preservation is cheaper than guessing wrong.
- **Promote paradigms from prose to runtime instruction**: When a paradigm matures (mechanical/semantic split, exit-code contract, etc.), don't leave it documented only in `master-wiki/` or a SKILL.md — lift the *design checklist* into a `.github/instructions/*.instructions.md` file with a broad `applyTo` glob (`.github/skills/**, .github/muscles/**, scripts/**, heir/platforms/**`). The wiki holds the full story; the instruction holds the runtime checklist. This is what made DP3 different from PL3: PL3 is a one-page operator guide (read-on-demand); DP3 auto-loads when you edit anything in the paradigm's surface area.
- **Carryover lane > deferred list for cross-version paradigm work**: When a minor release ends with N tasks that genuinely belong in the next minor (fleet-native work, downstream-blocked tasks), create an explicit "Carryover from vX.Y.Z" lane in the next plan rather than burying them in a deferred list. The lane has its own progress bar, its own backlog table with origin-lane attribution, and counts toward the next release's total. Honest accounting: the work isn't dropped, it has a home, and the next plan's denominator reflects reality.

## Visual Memory

- **256px max for embedded images**: Full-resolution base64 images (512px) quickly exceed context limits. Resize to 256px longest edge before encoding — 70% savings (42KB → 13KB per image).
- **Separate storage from embedding**: Keep original files at full resolution (512px) on disk; only the embedded `dataUri` uses the smaller version. Document with `embedSize` field.
- **Face-consistent models work at 256px**: nano-banana-pro and similar reference-based models work fine with 256px inputs.

## Fleet Operations

- **DryRun must simulate non-existent paths**: When a script renames then restores, dry-run skips the rename so the restore source doesn't exist. Solution: use the original path as restore source in dry-run, the backup path in real runs. Test dry-run separately from real runs.
- **Two-phase fleet upgrade**: Phase 1 = mechanical batch (`node scripts/upgrade-brain.cjs --mode Full`). Phase 2 = semantic curation per-project (scan `.github-backup-*/` for custom content worth restoring). Batch for correctness, human for judgment.
- **Brain source path**: Root `.github/` is the canonical brain source. `heir/.github/` is generated by `sync-to-heir.cjs`. Extension source code lives in `heir/platforms/vscode-extension/`.
- **Three-tier inheritance model**: Every brain artifact (skill, instruction, prompt, agent, muscle) belongs to one of three tiers, declared via `inheritance: <tier>` in YAML frontmatter (or `@inheritance <tier>` in JSDoc for muscles):
  - `inheritable` (default if untagged): synced master → heir; **heirs MUST NOT modify** these in place. Drift is detected by `audit-heir-sync-drift.cjs`. To change an inheritable artifact, file feedback via `AI-Memory/feedback/` and let master curate.
  - `master-only`: stays in master, never reaches heirs. Use for fleet orchestrators, master-wiki publishing, and anything that mutates sibling projects.
  - `custom`: heir-owned. Heirs are free to create, edit, and delete these. If a custom skill matures and generalizes, escalate to master via `AI-Memory/feedback/` (or master pulls it during a fleet pattern aggregation). The `sync-to-heir.cjs` filter excludes `custom` so a curation roundtrip never overwrites other heirs' custom work.
- **Config files are conceptually `custom` (no tag needed)**: JSON/CSS in `.github/config/` cannot carry frontmatter, so the three-tier model doesn't apply mechanically. Instead the upgrade flow encodes it by name: `HEIR_MANAGED_CONFIG_FILES` in `brain-upgrade-core.cjs` (`loop-menu.json`, `taglines.json`, `cognitive-config.json`, `markdown-light.css`, etc.) are first-installed from master then frozen on every subsequent upgrade — heir-owned in practice. Master-only configs (`MASTER-ALEX-PROTECTED.json`, `hooks.json`) are filtered out of sync entirely. Tools like `retro-tag-inheritance.cjs` skip `.github/config/` because there's no marker mechanism and no need for one.
- **Three "hooks" in AlexMaster**: (1) `.github/hooks/` = git pre-commit hooks (inheritable — marked `@inheritance inheritable`), (2) `.github/muscles/hooks/` = agent hook scripts (selectively distributed), (3) `.github/config/hooks.json` = agent hook event registry (master-only — references hooks that don't exist in heirs). BRAIN_SUBDIRS includes `hooks` (pre-commit hooks). `hooks.json` must NOT be synced to heirs.
- **Stacked upgrades: curate oldest backup first**: When multiple `.github-backup-*` dirs exist, only the oldest has project-specific content. Config files can silently drop between minor brain versions — always diff config/ against backups.
- **Heir feedback queue as proto-aggregation**: `AI-Memory/feedback/` from heirs functions as a manual aggregation pipeline today (1 master, N heirs). Triage cycle: read all → group by paradigm/lane → ship fixes in a patch release → delete files. Sweeps of 5–10 items map cleanly to lane-IDs in active plans, validating fleet-wide friction signal before automating in FI2/FI3.
- **Pull-forward small paradigm wins in patch releases**: When a larger plan (e.g., FM2 mechanical preflight) is months away, ship the cheap version (e.g., authored prose checklist in the relevant skill) in an interim patch. Document in the plan as "pull-forward — does not consume lane scope; mechanical version supersedes when shipped". Confirms direction with real users without committing the full lane budget.

## Build Pipelines

- **Fix-once + auto-inject-future**: Pair an idempotent one-time fix script with a build-time auto-inject fallback. This two-pronged approach avoids perpetual manual enforcement.
- **Declarative data-driven layouts**: Define page layout structures as data, keep rendering code as pure templates. Adding new sections requires only data changes, not template surgery.
- **Config + content file separation**: JSON config defines structure, separate .md files hold content. Loader resolves file references at runtime. Cache per session, invalidate on refresh.
- **Verify every field when transcribing code to config**: When extracting hardcoded data to JSON, icon names, descriptions, and field values will silently drift. Cross-check every field against the source.
- **Hardcoded paths in build scripts rot**: When directory structure changes (e.g., `platforms/` → `heir/platforms/`), build scripts with hardcoded paths break silently. Use config or resolve relative to manifest files.
- **Release scripts must build their own artifacts**: Never assume a pre-built artifact exists. Build → validate → publish → then commit/tag/push. Irreversible git ops (commit, tag, push) must come AFTER artifact validation succeeds — not before.
- **Preflight version-mismatch is a gate, not a warning**: If the VSIX filename doesn't match package.json version, that's a hard stop — not a warning to scroll past.

## Quality Process

- **Universal audit pattern**: Inventory → compare against ground truth → severity-classify → fix all. Works for code, docs, security. Transfers to any domain where claims can drift from reality.
- **Iterative health-check loop**: Score → fix top issues → rescore. Fix the highest-ROI dimension first.
- **Dev folder harvest**: Scan all projects → deduplicate against master → tier (ADOPT/MAYBE/SKIP) → copy → clean frontmatter → validate. Battle-tested (3+ projects) is a strong quality signal.
- **brain-qa frontmatter gate**: All 4 fields required (name, description, applyTo, tier). Missing any one → fm=0 → likely fail. Workflow skills also need matching `.instructions.md` for tri=1.
- **Token waste triage**: Not all scanner findings are actionable. Mermaid in a Mermaid-teaching skill is instructional content, not waste. Triage before fixing.
- **Fractional date arithmetic at thresholds**: `daysBetween(a, b)` using `getTime()` returns fractional days. A date "exactly 7 days ago" may compute as 7.0001 and fail a `> 7` check. Always `Math.floor()` before threshold comparison.
- **Rename drift in tests**: When renaming a function, grep all test files for both the old and new name. Test describe blocks, comments, and non-invocation references survive find-and-replace that only targets `fn(` call sites.
- **Self-contained `.github/` is a release gate, not a guideline**: Heir-bound brain files MUST NOT link out to `master-wiki/` or any path that escapes `.github/`. Use plain-text path references such as `see master-wiki/architecture/...md` instead of relative markdown links that escape with `..` segments. `scripts/check-self-contained.cjs` enforces this, and `release-smoke.test.cjs` calls it as a hard gate — caught a real escape in DP3 (mechanical-semantic-design instruction) before it shipped to heirs in v8.4.0. The wiki path can still be informational; just don't make it a clickable link from a heir-bundled file.
- **Parity-guard tests: split DIRECT vs DELEGATION**: When checking that all callers of a contract implement it, separate "files that invoke the primitive directly" (must implement contract) from "files that use a contract-compliant wrapper" (exempt because the wrapper absorbed responsibility). PR5's `muscle-contract-parity.test.cjs` does this for the muscle exit-code contract: `execFile/spawn` of `"node"` + `child_process` import = direct invoker (must handle exit code 2); `muscleAndPrompt()/runMuscle()/skillPrompt()` callers = delegators (exempt). Without the split, every wrapper consumer is a false positive. Generalizes to any "X must implement contract Y, but Z wrappers absorb the responsibility" check.
- **Detect capability, not literal text, in code-scanning regex**: First attempt at PR5 required literal `.github/muscles/` strings in the regex; real code uses variables (`execFile("node", [musclePath, ...args])`). Final pattern detects the *capability signature* (`child_process` import + `execFile/spawn` call) rather than a specific string. Ask: "if a developer renames a path constant, would the test still find them?" If no, the regex is overfit.
- **`node --test scripts/*.test.cjs` cwd contention on Windows**: Tests that spawn child processes which `chdir` into a tmp project flake under parallel `node --test` runs because sibling tests share the parent cwd; one test reads stdout while another's child has just changed directory. Sequential runs (one file at a time) are stable. Mitigation: in CI/preflight, run files sequentially in a `for` loop, not as a glob to `node --test`. Don't trust a parallel suite's pass/fail without confirming individual file results.

## Windows / Node.js

- **Winget MSI packages share install dirs**: `OpenJS.NodeJS.22` and `OpenJS.NodeJS.LTS` both install to `C:\Program Files\nodejs\`. Uninstalling the old version removes binaries for the new one. Install new first, verify, then uninstall old.
- **PAT expiration breaks publish silently**: `VSCE_PAT` environment variable can be set but expired. Preflight only checks existence, not validity. The 401 error at publish time is the first signal.

## Azure CLI

- **Subscription context breaks silently**: Azure CLI commands return empty results or "not found" when wrong subscription is active. Always verify with `az account show` first.
- **Cost Management API requires file-based body**: In PowerShell, inline JSON causes "Unsupported Media Type" errors. Pattern: write JSON to file, then `az rest --body "@$path"`.

## Azure Static Web Apps

- **Vite public/ requires rebuild+redeploy**: Files in `public/` are copied to `dist/` during build. Committing a new file doesn't serve it — must rebuild and redeploy.
- **Self-host CDN libraries in enterprise**: CDN scripts hit CSP violations and tracking prevention blockers. Self-hosting eliminates both.
- **AbortController for long API calls**: SSE/streaming endpoints can take 30-90 seconds. Browsers may silently drop without explicit timeout. Use AbortController with 180s timeout.
- **Auth route ordering matters**: `/.auth/*` must be explicitly allowed for `anonymous` BEFORE any `/*` wildcard with `authenticated`. Otherwise login callbacks get 401 → infinite redirect loop.
- **SWA CLI v2.0.8 silently fails**: Reports success but uploads nothing. Use GitHub Actions (`Azure/static-web-apps-deploy@v1`) instead.
- **Custom domain redirect URIs**: Entra ID app registration must include callback URIs for BOTH the default SWA hostname AND any custom domain.
- **Disconnect before switching deploy methods**: `az staticwebapp disconnect` before moving to CLI or new workflow deployments.
- **SWA embedded Functions lack IDENTITY_HEADER**: Causes `ManagedIdentityCredential` to fail. Solution: Create a standalone Function App with system-assigned managed identity, link via `az staticwebapp backends link`.
- **Embedded API overrides linked backend**: If the workflow has `api_location:`, SWA deploys embedded Functions which override any linked backend. Remove `api_location` to route to the linked Function App.
- **Azure Functions v4 requires main entry**: `package.json` must have `"main"` pointing to the file that registers functions via `app.http()`. Without it, functions silently fail to deploy.
- **X-Frame-Options blocks iframes by default**: SWA default is `DENY`. Set `"X-Frame-Options": "SAMEORIGIN"` in globalHeaders for iframe embed patterns.
- **Verify hostname via az CLI**: SWA hostnames can change. Always verify with `az staticwebapp show --name <name> --query defaultHostname`.

## Azure Identity

- **MSI = ServicePrincipal**: A Managed Identity IS a Service Principal in Entra ID. The `principalId` matches the ServicePrincipal in role assignments.
- **RBAC verification pattern**: (1) get principalId from resource, (2) list role assignments on target resource, (3) match principalId to ServicePrincipal, (4) verify roleId.

## GitHub Actions

- **Proactive version upgrades**: `actions/checkout@v5`, `actions/setup-node@v5` with `node-version: 22`. The v4 + Node 20 combination triggers deprecation warnings.

## VitePress

- **Standalone HTML in VitePress nav**: Use iframe embed pattern. Create `.md` page + Vue component that embeds HTML via iframe. The HTML detects `?embed` and hides its own chrome.
- **cleanUrls + nav links**: With `cleanUrls: true`, nav links must not have `.html` extensions.
- **SPA routing intercepts all nav clicks**: For non-VitePress pages, use iframe embed (preferred) or `target: "_self"` to force full navigation.
- **Iframe CSS isolation**: iframes cannot access parent CSS custom properties. Fallback colors must use hardcoded values, not other CSS variables.

## Data Modeling

- **Temp-file Python analysis**: Write to _tmp.py → execute → delete. Avoids inline quoting issues across shells.
- **TMDL linter false positives**: VS Code TMDL linter reports `description` as invalid on measures — this is a linter limitation, not a syntax error.

## Academic Writing

- **Editorial review is judgment, not pattern-matching**: Complex style rules (APA7 verb tense, citation format) require context-dependent decisions. Apply critical-thinking framework from the start.
- **Verify instrument wording against source data**: Before changing terminology in academic documents, verify actual survey wording against the raw data file. Manuscripts evolve terminology that may not match what was actually administered.
- **Appendix "exactness" claims require audit**: When an appendix claims to reproduce something "exactly as administered," compare line-by-line against ground truth. The claim of exactness is itself a testable hypothesis.

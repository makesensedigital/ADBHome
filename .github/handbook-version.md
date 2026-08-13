---
handbook_repo: makesensedigital/engineering-handbook
handbook_tag: v4.0.0
handbook_commit: 6175a3c
synced_at: 2026-08-13
---

# Handbook version

<!-- The frontmatter above is machine-readable: the `handbook-version` job of the Central
     Standards CI parses `handbook_commit`. Version identity is the git ref, never a content
     hash (Handbook §0). -->

- Standard: Platform Engineering Handbook, `makesensedigital/engineering-handbook`
- Release these files were generated from: `v4.0.0` (`6175a3c`)
- Previous: `v3.7.1` (`de0216f`), adopted 2026-08-11
- Governing section: **§26 — Static conversion sites**. It is the only section that governs this
  class of repository; what it suspends and what it leaves standing is listed in `AGENTS.md`.

## What this repository received, and what it did not

This repository adopted the standard on **2026-08-11**, on a site that had been in production
since 2026-07-20. It followed the `adopt-an-existing-repository` skill, whose first step is to
bring in the rules **without touching code**. So the sync is deliberately partial, and the
difference is recorded here rather than left to be inferred from an absence:

| Artifact | State |
|---|---|
| `AGENTS.md` | Present, copied verbatim from `templates/landing/AGENTS.md` at the tag above |
| `scripts/*.mjs` | Present, copied verbatim **except for three files** — see *Divergences* below |
| `scripts/fixtures/landing/` | **New at v4.** The pristine template, vendored so `test-gate.mjs` has a known-good site to build its fixtures from |
| `.github/handbook-scripts.sha256` | **New at v4.** Digest of `scripts/*.mjs`, verified by the gate on every run. Regenerate in the same commit as any deliberate edit to a check |
| `.github/workflows/gate.yml` | Present, copied verbatim at v4 — the local divergence it carried at v3.7.1 was resolved upstream |
| `.github/dependabot.yml` | **New at v4.** Proposes pipeline action updates; never merges them |
| `.github/workflows/standards.yml` | Present, pinned to the major tag `@v4` |
| `config.js` | Present, and **declares reality rather than driving the page** — see the file |
| `.gate-measures.json` | See *The numeric floors* below |
| `facts.js` | **Absent on purpose.** Adding it without wiring `index.html` to it would create a fourth unwired copy of the business facts, which is the failure §26's rule exists to prevent. Debt #3 |
| `.github/instructions/*` | Not applicable — those files project sections §26 suspends. See `docs/adoption.md` |
| `openspec/` | Not scaffolded. Open definition #6 |

## Divergences from the template, and what retires each one

Three files are **not** byte-identical to `v4.0.0`. Each carries its rationale in place, each is
reported upstream, and each names the release that would let it be deleted. The digest file above
exists so that an edit made under pressure to quiet a red gate cannot look like one of these.

| File | Why | Trigger to drop it |
|---|---|---|
| `scripts/lib.mjs` | `walk()` resolves its subject from `git ls-files`. Upstream's filesystem walk reads `Branding/` and `web/`, which are ignored and therefore unpublished — 20 findings about files no visitor can request, and a baseline that does not reproduce on a runner | A release whose `walk` resolves from git. Friction report 2 |
| `scripts/check-markup.mjs` | The served-text measurement handles `<body>` being an optional tag, and strips `<style>` so inline CSS cannot pass the floor on its own. **v4 changed this file elsewhere** — it taught the four render rules to read inline `<style>`, which is a different measurement and is taken as shipped | A release that handles the optional tag and strips `<style>` there. Friction report 3 |
| `scripts/test-gate.mjs` | v4's own fixture copy excludes the fixture from itself: the filter matches any source path containing `scripts/fixtures`, so when the vendored fixture **is** the source, `cp` copies nothing and the run dies on ENOENT. Measured, not reasoned about | A release whose fixture copy works when `TEMPLATE` is the vendored directory. Friction report 8 |

## What v4.0.0 resolved, that this repository had worked around

- **The gate now switches authority to the ratchet** when `.gate-baseline.json` is present, so an
  adopting site is no longer red on everything. This retired the local `gate.yml` divergence
  wholesale. Friction report 1 / issue #53.
- **The control-placement table is `config.controls`** and is read by `check-config.mjs`. This
  repository had already answered all ten rows as prose; they are now machine-readable. Friction
  report 6 / issue #60.
- **`check-markup` reads inline `<style>`**, which removed a false finding here — the minimum
  interactive target size was declared in this site's inline CSS all along. Issue #56.

## The numeric floors

`lighthouserc.json` is unchanged and every floor in it stands. `.gate-measures.json` records what
this site has not reached yet, so the floor stays the published target and the gate fails if the
measurement gets worse. **Never lower a floor.**

## Re-syncing

The rule files above are condensed from the handbook and go stale silently. Re-read the section
before re-stamping a hash: a hash written without reading is a lie that looks like diligence (§0).

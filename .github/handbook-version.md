---
handbook_repo: makesensedigital/engineering-handbook
handbook_tag: v3.7.1
handbook_commit: de0216f7a6565ee031c2929538d100164125392d
synced_at: 2026-08-11
---

# Handbook version

<!-- The frontmatter above is machine-readable: the `handbook-version` job of the Central
     Standards CI parses `handbook_commit`. Version identity is the git ref, never a content
     hash (Handbook §0). -->

- Standard: Platform Engineering Handbook, `makesensedigital/engineering-handbook`
- Release these files were generated from: `v3.7.1` (`de0216f`)
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
| `scripts/*.mjs` | Present, copied verbatim — the delivery gate's instrument |
| `.github/workflows/gate.yml` | Present, copied verbatim |
| `.github/workflows/standards.yml` | Present, pinned to the major tag `@v3` |
| `config.js` | Present, and **declares reality rather than driving the page** — see the file |
| `facts.js` | **Absent on purpose.** Adding it without wiring `index.html` to it would create a fourth unwired copy of the business facts, which is the failure §26's rule exists to prevent. Debt #3 |
| `.github/instructions/*` | Not applicable — those files project sections §26 suspends. See `docs/adoption.md` |
| `openspec/` | Not scaffolded. Open definition #6 |

## Re-syncing

The rule files above are condensed from the handbook and go stale silently. Re-read the section
before re-stamping a hash: a hash written without reading is a lie that looks like diligence (§0).

<!-- Not generated from the handbook. This file is a POINTER, on purpose. -->

# Claude Code — where the rules are

**The rules in force in this repository are [`AGENTS.md`](AGENTS.md). Read it before the task.**

This file exists only because Claude Code loads `CLAUDE.md` automatically and does not load
`AGENTS.md` automatically. It deliberately restates nothing. Handbook §0 asks for generation
rather than symlinking when the same content is needed in two places — but the content here is
one line, so the honest form is a pointer, not a second copy that goes stale and gets believed.

## Before you change anything here

Three files carry state you cannot infer from the code, and skipping them is how a deliberate
compromise gets "fixed" into a regression:

| File | What it holds |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Handbook §26 condensed — the rules, the scope test, the ask-before-acting list |
| [`docs/adoption.md`](docs/adoption.md) | Why this repository does not comply, finding by finding, each in exactly one bucket |
| [`docs/technical-debt.md`](docs/technical-debt.md) | What is knowingly wrong, why it was accepted, and what triggers fixing it |

## The two that catch people out

**The gate is red, and that is the correct state.** This site was in production for three weeks
before the standard arrived, so it violates it. `.gate-baseline.json` records every violation that
existed on adoption day; the ratchet fails on anything **new**. Do not make the gate green — not by
adding to the allowlist, not by raising a baseline, not by a blanket suppression. A green gate here
would be a claim this repository has not earned. Lower a baseline entry only with
`node scripts/ratchet.mjs --update`, in the same commit as the fix.

**`config.js` describes the page; it does not drive it yet.** Every external identifier is still a
literal in `index.html`. Wiring the markup to the module is real work with a real diff — see debt
#2 — not something to do as a side effect of another change.

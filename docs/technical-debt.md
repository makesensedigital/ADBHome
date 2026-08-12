<!-- Bucket 2 of the `adopt-an-existing-repository` triage. -->
<!-- Governed by Handbook §22 ("the repository is the agent's memory") and §26. -->

# Technical debt — known and accepted

What is knowingly wrong in this site, why it was accepted, and what would trigger fixing it.

**This file exists for the agent as much as for the reader.** An agent has no memory between
sessions beyond what this repository holds, and a deliberate compromise that is not written down is
indistinguishable from a mistake. An agent that meets one either "fixes" it — undoing a decision
nobody recorded — or copies it, believing it is intended. Both outcomes are worse than the debt, and
the second one spreads.

Four fields are mandatory, and each exists because its absence turns this into something else.
**Without a trigger** it is a complaint. **Without an owner** it is nobody's. **Without a reason**
the next reader cannot tell whether it is safe to remove. **Without a cost** it cannot be
prioritised against anything.

Keep it distinct from [`open-definitions.md`](open-definitions.md): that records what has not been
*decided*, which is permitted. This records what is *wrong*, which is not. And keep both distinct
from [`adoption.md`](adoption.md), which is the measurement all three came out of.

---

## Open

| # | What is wrong | Why it was accepted | Cost of leaving it | Trigger to fix | Owner | Since |
|---|---|---|---|---|---|---|
| **D1** | **The messaging link is written as a literal in fourteen places in `index.html`.** `config.js` exists and declares the number, the ten message templates and every other identifier — but the markup does not read it, because adoption step 1 brings in rules without touching code. | Wiring the markup to the module means a `site.js`, a data attribute on every control, and a diff across the whole page. Doing it in the adoption commit would have destroyed the one thing the baseline is for: showing what adoption cost, separately from what the code was. | A search-and-replace waiting to go wrong. **A wrong number on one of fourteen buttons looks exactly like a right one**, and nothing on the page or in the gate would say which. | The next change that touches any conversion control. Do it then, for all fourteen at once, and lower the baseline in the same commit. | Juan Torresel | 2026-08-11 |
| **D2** | **Every style and script is inline in `index.html`, so the repository has no stylesheet.** `check-markup` reads external CSS: with none, three of §26's four render rules — viewport units that survive retracting browser chrome, the safe area on anything fixed to the bottom edge, and the 16px floor on form controls — are **unmeasured**, and the tap-target rule reports against `(no stylesheet)`. | The site was built as a single self-contained file that opens in a browser with no build and no server, which is a real property worth something. Splitting it is a large mechanical diff with no visible result. | **Unmeasured reads exactly like passing.** One of the three is live right now: the floating messaging control is `position: fixed; bottom: 22px` with no `env(safe-area-inset-bottom)`, so on a handset it sits in the gesture-bar strip — and that is where the conversion control lives. Nothing reports it. | Extracting `styles.css` — which is also what makes `assetVersion` load-bearing. Until then, treat the render rules as hand-checked on a device, and say when they were last checked. | Juan Torresel | 2026-08-11 |
| **D3** | **The business facts exist in three unlinked copies** — the `data-*` attributes on sixteen office buttons, the JSON-LD graph, and `llms.txt` — and nothing derives from anything. `facts.js` is deliberately absent and `build-derived --check` therefore cannot run at all. | Adding `facts.js` without wiring `index.html` to it would create a **fourth** unwired copy, which is the exact failure the rule exists to prevent. The wiring needs generated blocks in the markup, which is code. | A changed address is three edits, and by the third one has been missed. On this class of site that is not a stale comment but a **published contradiction**: the page says one thing and the structured data another, and an assistant answering a question about ADB states whichever it read. Nobody knows who received that answer, so it cannot be corrected. Already visible: `sitemap.xml` still says `2026-07-22` for a page last changed `2026-07-30`. | The next change to an address, a telephone, an opening hour or the office list — the moment three edits are needed instead of one. | Juan Torresel | 2026-08-11 |
| **D4** | **The map library is fetched from a public CDN on first render, and its tiles from a second origin.** The library carries a pinned version, a subresource integrity attribute and deferred loading, which is what §26 asks of anything that must be in the markup — but it is still a third party contacted before any choice, and the tile origin is contacted from script after load, where no check can see it. | Removing it means self-hosting the library and its stylesheet, or replacing the map with a click-to-load placeholder. Both are real work, and the presence list already degrades correctly to a working fallback when the library does not load. | Two third parties receive the visitor's address on first render. With no server there is no way to proxy either. The **tile origin is worse than the finding suggests**, because it is invisible to the gate — nothing will report it if it changes. | The consent decision (open definition #2). If it lands anywhere other than notice-only, this becomes blocking rather than debt. | Juan Torresel | 2026-08-11 |
| **D5** | **Two photographic images in a lossless format, over budget.** `horacio.png` is 721 KB and `og-image.png` is 632 KB, against a 300 KB per-image budget; a `.webp` twin of the first already exists and is 81 KB. | The `<picture>` element already serves the WebP to anything that supports it, so the PNG is a fallback rather than the common path — which makes this genuinely smaller than the number looks. | On a host with a transfer allowance, page weight is availability and not only speed. The social image has no fallback path at all: **every scrape and every share preview pays the full 632 KB**, and that is the one nobody sees in their own browser. | The Lighthouse run on a real runner — `total-byte-weight` and `modern-image-formats` are assertions, not advice, and this is the finding most likely to fail first. | Juan Torresel | 2026-08-11 |
| **D6** | **The heading outline skips `h1` → `h3`.** | Fixing it is a tag change plus the CSS that made the smaller tag attractive in the first place. | It is what a screen reader announces and what an extractor reads; a jump from `h1` to `h3` loses the relationship both depend on. Lighthouse asserts `heading-order` as an error, so this also fails the external job. | The next edit to the hero section, or the first runner execution of the external job — whichever comes first. | Juan Torresel | 2026-08-11 |
| **D7** | **No skip link.** | Two lines of markup and one CSS rule — this is cheap, and it is here rather than in fix-now only because it is not contract-sensitive. | A keyboard user tabs the entire navigation before reaching the content, on every visit. Lighthouse asserts `bypass` as an error. §6c is **not** suspended by §26. | Fix with D6 — same file, same run, one commit. | Juan Torresel | 2026-08-11 |
| **D8** | **The repository speaks Spanish where the standard requires English.** Comments in `index.html`, `README.md`, and all seven commit messages predating adoption. §13 and §21 require English in code, comments, commits and documentation, with user-facing copy in the declared language — and §26 explicitly does **not** suspend either. | The commits cannot be changed: rewriting published history to fix a comment is disproportionate, and the trailers §11 requires cannot be added retroactively in any case. | Small, and asymmetric. It matters where an agent reads it — a repository that mixes both invites the next contributor to guess, and they guess from whatever they read last. | Any file whose comments are being edited anyway. New files are English from now, starting with this one. **History is not in scope.** | Juan Torresel | 2026-08-11 |
| **D9** | **No published not-found document.** | One page, and it needs the copy and the layout the rest of the site uses. | §26 places not-found handling in the "published document" row of the control table, because there is no server to handle it. The host's default page is served instead: unbranded, in English, and with no route back to the site. | Ship it with the privacy statement (fix-now F1) — both are the same kind of page and the same commit. | Juan Torresel | 2026-08-11 |

---

## Paid down

An entry moves here rather than being deleted, so the reasoning survives its resolution and the
register doubles as a record of what this repository has learned.

| # | What it was | How it was resolved | Closed |
|---|---|---|---|
| | | | |

---

## What does not belong here

- **A bug.** Fixed, or tracked as work — not accepted as debt.
- **A rule you disagree with.** That is handbook feedback (§12): surface the friction, do not work
  around it. Two pieces of friction were surfaced during adoption and are recorded in
  [`adoption.md`](adoption.md) §1.
- **An undecided question.** That belongs in [`open-definitions.md`](open-definitions.md), and it is
  permitted while open.
- **An entry with no trigger.** Debt with no condition for repayment is a decision nobody wants to
  defend.

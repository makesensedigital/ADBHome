# Handbook friction — from adopting §26 on a live site

**Filed from:** `makesensedigital/ADBHome` · adopted 2026-08-11 against handbook `v3.7.1`
(`de0216f`) · procedure: skill `adopt-an-existing-repository`

Seven reports. `CONTRIBUTING.md` asks for these as issues rather than pull requests, and this file
is the durable copy: it lives in the same clone as the divergences it explains, so the next person
here can tell a reported problem from a private patch.

Report 7 is the only one filed from *doing the work rather than adopting the rules*: it came out of
installing analytics on 2026-08-13, months after adoption.

> **Correction, same day, and it matters for how report 7 should be read.** The Amplitude install
> that produced it was reverted before it ever shipped; this site now measures through a Google Tag
> Manager container. **So the repository that filed the complaint went on to choose the exact shape
> the complaint said §26 over-assumed** — which weakens the first of the three gaps and moots the
> third, and both retractions are posted on issue #65 rather than quietly left standing.
> **The second gap survives intact and is now demonstrated more strongly than the original report
> managed:** the container injects `google-analytics.com` and `clarity.ms` with `createElement` at
> runtime, so of the three Google/Microsoft origins this page contacts, `check-assets` sees exactly
> one — the `noscript` iframe. The other two are invisible to the gate, and `privacy.html` is the
> only artifact that records them.

**Unreported friction does not disappear; it becomes a silent workaround** — and a rule everyone
quietly bypasses is worse than no rule, because it still claims to be enforced. Four of the five
below are already worked around in this repository — three by changing the instrument, one by
carrying a permanently red check. That is the reason to file them, not a reason not to.

> **Filing status, 2026-08-12.** Report 6 is filed as **issue #60** (practice candidate). Two of
> the others were already filed the same day by someone else, from what looks like a parallel
> adoption: **#53** is report 1 (*the landing gate cannot ratchet as shipped*) and **#55** is
> report 4 (*test-gate.mjs cannot run in an adopting repository*). Two independent adoptions
> hitting the same two rules within hours is stronger evidence than either report alone, so
> **both carry a corroboration comment from this repository** — the reproduction, the runner
> output, and in each case the consequence this adoption found that the original report did
> not — rather than a duplicate issue.
>
> **Filing status, 2026-08-13.** Report 7 is filed as **issue #65** (practice candidate) — the
> tag-container assumption, and the module-import hole in the third-party origin scan.
>
> **Reports 2, 3 and 5 are still unfiled and appear to be new** — `walk()` measuring unpublished
> files, the served-text check reading zero on a document with no `<body>` tag, and §0's caller
> being unreachable when the handbook is private. (#56 is adjacent to report 3 but is a different
> defect: it is about `check-markup` not seeing inline styles, not about the `<body>` slice.)

This is also the evidence `scripts/ratchet.mjs` asks for in its own header: *"it changes when a
real adoption moves it, and the change carries what happened."* This is what happened.

---

## 1 — The gate never switches to the ratchet, so an adopting site cannot publish

**Which rule:** §26, the delivery gate · `templates/landing/.github/workflows/gate.yml` ·
skill `adopt-an-existing-repository`, step 4

**Reading of the cause:** the rule is right; the tooling around it does not implement it.
**Scope:** blocked work · will recur · every other adopting site will hit it.

### What happened

`templates/landing/README.md` states the intended behaviour plainly:

> From then on the gate carries what existed and **fails only on what is new**, so the site stops
> getting worse immediately without the gate reporting a compliance it does not have.

The shipped `gate.yml` does not do that. `check-config`, `check-markup` and `check-assets` run as
their own steps and exit non-zero on **any** finding, baseline or not. `ratchet.mjs` runs as a
fourth step beside them. So after `--init` the ratchet passes and the three checks still fail, the
`gate` job fails, and `publish` — which `needs: gate` — never runs.

For a site adopting the standard that inverts the mechanism. Publication is blocked not by a new
violation but by every old one, which is the "make it comply or do not adopt" fork the skill exists
to avoid. This repository has 26 carried findings; on the shipped workflow, moving the publication
origin to the pipeline as §26 requires would **freeze the live site until all 26 were fixed**.

The two rules end up in direct contradiction: §26 says the pipeline must be the publication origin,
and the skill says the gate must fail only on what is new. Following both, as shipped, means not
publishing.

### What we did

**Nothing — deliberately, and this is the part worth reading.** The obvious fix is to make the
three checks informational when a baseline exists. We did not, for two reasons:

1. It reads as making the gate green on day one, which the skill names as the thing to be
   suspicious of. Whether it *is* that, or is the documented behaviour finally implemented, is
   exactly the judgement that belongs upstream and not in a site repository.
2. §26 puts any change to the gate workflow or the publication origin on the ask-before-acting
   list. Rewriting the gate during adoption is precisely the change that list is for.

So the gate here is red, publication stays on the branch, and the decision is recorded as an open
definition with the default that holds while it is open. That is a workaround with a cost, reported
rather than hidden.

### The shape of the fix, offered as data rather than as a proposal

Something has to distinguish "found things" from "found new things" at the workflow level.
`lib.mjs` already has the seam: `--json` exists so the ratchet can count findings without the check
exiting non-zero, and the comment there says the caller decides what the findings mean. The
workflow is the one caller that does not use it.

Whatever the answer, the contract-sensitive rules must stay outside it — the skill is explicit that
they are not ratchetable, and a mechanism that quietly accepts one has inverted the point of having
one.

---

## 2 — `walk()` measures the filesystem, so it measures unpublished files

**Which rule:** §26, the repository is the web root · `templates/landing/scripts/lib.mjs`

**Reading of the cause:** the rule is fine; the tooling around it is what hurt.
**Scope:** did not block · will recur · every site with a populated ignore file.

### What happened

`walk()` is a plain filesystem walk with a fixed skip list. This repository ignores `Branding/`
(brand sources) and `web/` (working versions of the page) — which is §26's own rule that the ignore
file is an access-control decision, followed correctly from before the first commit.

The first gate run read both anyway and produced **20 of its 46 findings about files no visitor can
request**: fourteen identifier literals inside a working copy of the page, four markup findings on
it, and two orphan findings on brand logos that are ignored precisely so they are not published.

Two separate problems, and the second is the worse one:

- **A check firing on correct input**, which §20 says teaches people to route around the gate. The
  remediation offered — "delete it: an unreferenced file is still published at its URL" — is
  actively wrong here. The file is ignored, so it is not published, and deleting it destroys a
  working document.
- **The baseline does not reproduce on the runner.** `actions/checkout` only materialises tracked
  files, so CI and a local run report different numbers for the same commit. A baseline that does
  not reproduce is not a baseline, and this is the failure mode that would have shown up as a
  mysterious "findings went down" on the first CI run.

### What we did

Changed it, and documented the change in place. `walk()` now returns `git ls-files` output when the
root is a git work tree, and falls back to the filesystem walk otherwise — so the template's own
fixtures, which are temporary directories rather than repositories, are unaffected.

The reasoning is §26's own: committing is publishing, and the converse holds just as strictly.

---

## 3 — The served-text check reports zero on a page that serves forty thousand characters

**Which rule:** §26, indexability is a property of the served markup ·
`templates/landing/scripts/check-markup.mjs`

**Reading of the cause:** the rule is fine; the tooling around it is what hurt.
**Scope:** did not block · will recur wherever the markup was hand-written.

### What happened

```js
const body = text.slice(text.indexOf("<body"));
```

`<body>` is an **optional tag** in HTML. Its start tag may be omitted, every browser and every
crawler inserts the element, and the document is valid without it. This site's markup omits it — it
was hand-written and goes straight from the head content into the page.

`indexOf` returns `-1`, `slice(-1)` returns the final character, stripping tags leaves nothing, and
the check reports:

> only 0 characters of served text outside script
> fix: move the conversion and discovery copy into the markup; with scripting off this page says
> almost nothing

The page serves roughly forty thousand characters of copy. The check fired at full confidence on
the input it is most designed to approve, and told the author to do the thing they had already
done — the exact failure §20 warns about, on the one check whose subject is *whether the content is
there*.

### What we did

Changed it: fall back to the whole document when there is no literal `<body`, and strip inline
`<style>` blocks as well as `<script>`. The second half is not optional once the first lands —
without it an inline stylesheet counts as served prose and clears the 400-character floor on its
own, turning a real check into one that cannot fail. The template keeps its CSS in a separate file,
which is why the gap never showed there.

---

## 4 — The gate's own test cannot run in a repository that adopted the standard

**Which rule:** §20, a check that has never failed on purpose is not known to work ·
`templates/landing/scripts/test-gate.mjs`

**Reading of the cause:** the rule is right but too broad — it should carve out this case.
**Scope:** did not block · will recur · every adopting site.

### What happened

`test-gate.mjs` builds its fixture with `TEMPLATE = resolve(HERE, "..")` — it copies **the
repository it lives in** — and then edits the landing template's placeholder values in the copy:
the placeholder canonical origin, the container placeholder, a `privacy.html`, a `404.html`.

An adopted site has none of those, so the first `edit()` throws `fixture setup: "..." not found`
before a single check runs. It is the first step in `gate.yml`, and it can never pass here.

The rule it enforces is right and we are not arguing against it. The problem is that the mechanism
is a test of *the template's* checks against *the template's* fixture site, while it ships inside
every site built from or adopting the template — where its subject does not exist. It is the
adoption path's own instrument failing to survive adoption.

### What we did

Removed the file and its workflow step, with the scope of the removal, the reason, and the
condition that reverses it written into `gate.yml` where the step used to be: **the moment this
repository adds or changes a check, the requirement returns in full.** The checks themselves are
byte-identical to the pinned release, where the test does run against the fixture it was written
for, so no coverage was lost — only relocated to where it was already happening.

### What would remove the friction

Separating the harness from the fixture, so a site can point the same runner at its own fixtures.
As shipped, a site that adds a check has to write both, and the one it most needs — the harness —
is the one it just deleted.

---

## 5 — §0 mandates a CI caller that a private handbook cannot serve

**Which rule:** §0, the file table — `.github/workflows/standards.yml`, the Central Standards CI
caller · §19

**Reading of the cause:** the rule is right but too broad — it should carve out this case.
**Scope:** did not block · will recur · **every repository that adopts this handbook while it is
private will hit it**, which today is all of them.

### What happened

§0 requires the caller and is precise about how to pin it: both placeholders written from the ref
that was cloned, the major tag, never `@main`, and *stop and report rather than write an unpinned
caller* if the ref resolved is a branch. We followed that exactly — `@v3`, owner filled in from the
clone, release recorded in the version manifest.

On its first execution it failed in **0 seconds**, before checking out anything:

> This run likely failed because of a workflow file issue.

The handbook repository is private. A reusable workflow in a private repository is only callable
from another repository when that repository's Actions access setting permits it — an
organization-level setting on the **handbook** side, which the adopting repository can neither read
nor change, and which §0 never mentions.

**The reason this is worth filing rather than shrugging at:** §0 already reasons about exactly this
constraint, carefully and at length, in *Why the bootstrap is not a GitHub Action* — a workflow in a
new application gets a token scoped to that application, so it cannot reach the handbook; making it
work would need a cross-repository credential to create, scope, rotate and audit. That reasoning is
correct and it is the same reasoning the caller needs. It simply was not carried across, and the
result is a mandatory artifact whose failure mode is a permanently red check that says nothing about
the repository it is in.

### What we did

Kept it, red, and recorded it as an open definition with both ways to close it. Removing it was
rejected on purpose: it is the only artifact binding this repository to a released handbook version,
which is the thing §0 exists to guarantee.

### What would remove the friction

Either §0 names the access setting as part of the bootstrap — one sentence, next to the reasoning
that is already there — or it says what an adopter should do when the handbook is unreachable. The
second matters more than it sounds: for a static site the caller enforces the version manifest and a
set of backend greps that cannot match, so *"do not add it, and here is why"* is a defensible answer
that §24's variation table has no row for.

The general shape, which may be the more useful report: **§0's file table is written for an
application in an organization that can read the handbook.** A landing site in an organization
where it is private gets one artifact it does not need and cannot run.

---

## 6 — The control-placement table is Mandatory and has no carrier

**Which rule:** §26, *Where each control goes when there is no server* — Mandatory

**Filed as:** practice candidate. **Reading:** the rule is right; it is missing the mechanism it
asks every other rule to have. **Scope:** did not block · will recur · every site in this class.

### What happened

The section states the requirement about as strongly as it states anything:

> Every row is placed at the edge, placed at the gate, or declared absent. **A control is never
> left implied.** … A row left unread is a control that silently does not exist.

It then leaves the declaration itself as prose. There is no field in `config.js`, no file in the
template, and no check in the gate. **Declaring a control absent and never considering it produce
byte-identical repositories** — which is precisely the failure the sentence above describes, and
the sentence is the only thing standing against it.

This is the one Mandatory rule in §26 whose carrier is a chapter. The section's own thesis is that
a chapter nobody rereads is not a mechanism and that the carriers are the template and the gate.

It surfaced on a live site whose host can express almost none of the table. Deciding to stay on
that host is explicitly permitted — *choose against capability, record the choice, and record what
the choice puts out of reach* — but there was **nowhere the record was supposed to go**, so the
decision looked identical to never having thought about it. That is also why the question reached
us as *"can we just make this rule optional?"*: the rule already permits the answer, and reads as
an unimplementable mandate because the permitted answer has no artifact.

The template makes it sharper. It ships `_headers` and `_redirects`, and its own publish job
targets a host that serves neither — documented in the README, in prose. **Two files whose presence
implies a control that is not in force**, on the default path, in the carrier for the section that
forbids exactly that.

### What we did

Added `config.controls` — the ten rows of the table, each with `where` and, when absent, a `why`
stated in terms of capability rather than intent. It is what let the hosting question close as a
recorded decision instead of an open row nobody could answer.

We did **not** add a check. §26 says a check that has never failed on purpose is not known to work,
and the harness for that is `test-gate.mjs`, which cannot run in an adopted repository (report 4 /
issue #55). So the declaration is unchecked here, and the block says so.

### The proposal

1. **Put the table in `config.js`** as `controls`, one key per row, `where` plus a `why` that is
   required whenever `where` is `absent`. The template ships it filled in for its own defaults.
2. **`check-config` fails on a missing row, an unknown row, or an `absent` with no reason.** That
   makes the Mandatory rule enforceable for the first time, and it costs one object in a file the
   check already loads.
3. **Do not ship `_headers` and `_redirects` by default.** Generate them when a row says `edge`,
   or fail when they exist and the rows say the host cannot serve them. A file that does nothing
   is worse than an absent one here, because it reads as a control.

The rule does not need weakening. It needs the artifact it already demands — and with the artifact,
*"this host cannot do it and we accept that"* becomes a legible, reviewable, greppable answer
instead of looking like an omission.

---

## 7 — §26 assumes measurement arrives through a tag container, and most vendors ship a `<script>`

**Which rule:** §26, instrumentation is a launch condition · `config.tagContainerId` ·
`templates/landing/scripts/check-config.mjs` · `templates/landing/scripts/check-assets.mjs`

**Reading of the cause:** the rule is right; the artifacts around it encode one vendor's delivery
model as if it were the only one.
**Scope:** did not block · will recur · every site whose analytics vendor is not Google.

### What happened

This site was instrumented on 2026-08-13 with Amplitude, closing open definition #1. The rule
itself held up well — writing the event contract before the code, naming the WhatsApp handoff an
intent, refusing session replay because the privacy statement could not carry it. **The friction is
entirely in the carriers.**

`config.js` offers exactly one field for measurement, `tagContainerId`, seeded with `GTM-XXXXXXX`. <!-- check-config: allow — a report ABOUT the placeholder has to name it; the check documents this exact case. -->
`check-config` detects two placeholder shapes, `GTM-XXXXXXX` and `G-XXXXXXXX`. Both are Google. A <!-- check-config: allow — a report ABOUT the placeholder has to name it; the check documents this exact case. -->
site that measures with Amplitude, Plausible, PostHog, Fathom, Matomo or Umami has **no field to
fill and no placeholder to clear** — the honest answer becomes `tagContainerId: null`, which is
indistinguishable in the module and to the gate from a site that decided it needed no measurement
at all. That is the precise failure §26 names everywhere else: an absent control looking identical
to one nobody considered.

Three consequences, and the second is the one worth acting on:

1. **The install path does not exist here.** Amplitude's own installer prescribes
   `npm install @amplitude/unified` and a bare-specifier import. This repository has no
   `package.json`, no bundler and no build — by design, and §26 is the reason. So the SDK is
   imported from a CDN by URL. Every vendor in this class ships a `<script>` snippet for exactly
   this case, which means **the static-site path is the vendor's supported path and the handbook
   has no shape for it.**

2. **`check-assets` cannot see a module import, so the third-party origin scan silently misses the
   most common modern snippet.** `FETCHING` matches `src=` and `href=` attributes. An inline
   `<script type="module">` that does `import * as x from 'https://cdn…'` fetches a third party on
   first render and matches none of them. We only kept the origin visible by adding a
   `<link rel="modulepreload">` beside it — which the scan *does* match — and saying so in a comment
   that explains removing the link blinds the gate. **That is a workaround holding up a control, and
   the next person will delete it as a redundant preload.** The same blind spot covers the vendor's
   ingestion endpoints, which are called by `fetch` at runtime and can never be seen at all; today
   the privacy statement is the only artifact that records them.

3. **No vendor key can be checked, so key duplication is invisible.** `PATTERNS` has entries for
   `wa.me`, GTM, GA, `mailto:` and scheduling links. An Amplitude key is 32 hex characters and
   matches nothing, so the same key living in both `config.js` and the markup — which is the
   template's own recorded debt for every *other* identifier — produces no finding here. Recorded
   locally as debt D11.

There is also a security regression with no available mitigation. The template's pattern for
third-party JavaScript is a pinned version with a subresource integrity hash, which `index.html`
follows for Leaflet. **A CDN-built ESM bundle cannot carry one** — jsDelivr generates `+esm` on
demand and its own response header advises against pinning a hash to it. So the analytics SDK on a
licensed insurance broker's site loads unpinned, three lines below a map library that is pinned.
Self-hosting the bundle is the only fix available, and it breaches the 60 KB per-script budget in
`check-assets`. Recorded locally as debt D10.

### What we did

Shipped it, with each gap named where the code is rather than smoothed over: `tagContainerId: null`
with a comment saying null is the answer and not an unanswered question, a new `config.analytics`
block carrying the event contract, the `modulepreload` documented as a gate mechanism rather than a
performance tweak, and D10 and D11 opened. The gate moved from 26 findings to 23 and **nothing new
was added** — but two of the three reasons it stayed flat are blind spots rather than compliance.

### The shape of the fix, offered as data rather than as a proposal

The narrow version: rename `tagContainerId` to something vendor-neutral, or add a sibling
`analytics: { vendor, key }`, and make `check-config` fail when **both** are empty rather than when
one specific Google placeholder survives. That restores the property the rule actually wants — a
site cannot publish while it is silent about measurement — for vendors that are not Google.

The one that matters more: **`check-assets` should treat an `import` from an absolute URL inside a
module script as a first-render fetch.** It is a regex over markup either way, and without it the
third-party origin control has a hole shaped exactly like the delivery mechanism the modern
ecosystem standardised on. As it stands, the correct way to pass that check is to write the snippet
in the style the check happens to recognise, which is §20's failure mode with the sign flipped —
not a check that fires on correct input, but one that stays silent on incorrect input.

Worth deciding rather than leaving implicit: **whether §26 permits unpinned third-party JavaScript
at all.** Today it is neither permitted nor forbidden, so it arrives as a judgement call taken by
whoever installs the tag, on a site whose whole architecture assumes there is no server to catch
anything.

## One thing that is not friction, recorded because it surprised us

`config.js` is scanned for placeholders while `brief.md` is exempt, so the container placeholder and
each unanswered value in the configuration module are hard gate failures. On an adopting site that
is **exactly right** and we want to be clear we are not asking for it to change: it is what makes
"this site has no measurement at all" a red step rather than a silence, and §26's whole argument is
that an absent control looks identical to a site that never needed one.

It cost four findings in our baseline. They are four findings we want.

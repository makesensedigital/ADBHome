# Handbook friction — from adopting §26 on a live site

**Filed from:** `makesensedigital/ADBHome` · adopted 2026-08-11 against handbook `v3.7.1`
(`de0216f`) · procedure: skill `adopt-an-existing-repository`

Ten reports — seven from adopting `v3.7.1`, three more from syncing to `v4.0.0` on 2026-08-13.
`CONTRIBUTING.md` asks for these as issues rather than pull requests, and this file
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

> **Outcome at `v4.0.0`, 2026-08-13.** The release answers four of the seven, and the answers are
> better than what was asked for in three of them.
>
> - **Report 1 is closed.** `gate.yml` detects `.gate-baseline.json` and moves gating authority to
>   the ratchet, so the three ratcheted checks report and the ratchet decides. The local divergence
>   this repository carried is deleted, not adapted.
> - **Report 6 is closed, and adopted almost verbatim.** The control-placement table is
>   `config.controls`, ten keys, read by `check-config.mjs`. One cost landed on this repository and
>   is recorded as friction report 9 below: the table is a CLOSED set, and two rows this site had
>   answered are not in it.
> - **Report 4 is closed in intent and open in fact.** The vendored-fixture path exists and does not
>   work — see **report 8**, which is new at v4 and is a defect in the fix.
> - **#56 is closed:** `check-markup` reads inline `<style>`, which removed a false finding here.
> - **Reports 2 and 3 survive untouched at v4.0.0** and their local divergences are re-applied
>   rather than dropped, each carrying the release condition that retires it.
> - **Report 5 is unchanged**, and **report 7's surviving gap is unchanged**: the container still
>   injects two origins with `createElement`, and `check-assets` still sees one.

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

### What v4.0.0 did — 2026-08-13

Close to what was asked. `test-gate.mjs` now resolves `scripts/fixtures/landing/` before falling
back to the repository root, and the adoption skill instructs vendoring the pristine template there
at adoption. The harness and the fixture are separated exactly as this report suggested.

**So the step is back in `gate.yml` here and the local divergence is gone** — the workflow is taken
byte-for-byte at v4. What the release did not do is make the copy work; see report 8.

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

## 8 — The vendored fixture is excluded from itself, so `test-gate.mjs` copies nothing

**Which rule:** §20, a check that has never failed on purpose is not known to work ·
`templates/landing/scripts/test-gate.mjs` · new at `v4.0.0`

**Reading of the cause:** the rule is right and the fix for report 4 has a defect.
**Scope:** blocked work · will recur · every adopting site that follows the v4 skill.

### What happened

v4 resolves the known-good site as `scripts/fixtures/landing` when it exists, which is what report 4
asked for. The copy that follows is unchanged from v3.7.1:

```js
await cp(TEMPLATE, dir, {
  recursive: true,
  filter: (src) => !/[\/]scripts[\/]fixtures/.test(src),
});
```

That filter exists to stop a **repository-root** copy from recursing into its own fixture directory,
and it is applied to the **source** path. When the source *is* the vendored fixture, every path
under it contains `scripts/fixtures` — starting with the root itself, which is the first thing `cp`
offers the filter. The filter says no, `cp` copies **zero entries**, and `makeSite()` dies on the
first `edit()`:

```
Error: ENOENT: no such file or directory, open '...\landing-gate-NFiqXh\config.js'
    at async edit (scripts/test-gate.mjs:45:16)
    at async makeSite (scripts/test-gate.mjs:70:3)
```

Measured, not read: instrumenting the filter shows one decision taken and one entry dropped — the
fixture root — before the copy ends.

The shape is worth naming because it is the same shape as report 4. A guard written for one caller
became wrong when a second caller was added, and the failure is not a wrong answer but an empty one:
`cp` succeeds, the directory exists, and the error surfaces four frames later as a missing file.

### What we did

A three-line local divergence: `const fixtureIsSource = TEMPLATE === VENDORED;` and
`filter: (src) => fixtureIsSource || !/…/.test(src)`. Fallback behaviour is byte-identical; the only
change is that the filter no longer excludes the fixture from itself. `test-gate.mjs` then passes
here — 26 fixtures, 7 clean-run assertions, 7 ratchet states, 8 measurement states, 0 failures.

### What would remove the friction

Deriving the exclusion from the copy root rather than from the absolute path — the guard is only
ever about *nesting*, and `relative(TEMPLATE, src)` answers that question without asking where
`TEMPLATE` happens to live.

---

## 9 — The control-placement table is closed, and a site can have answered more rows than it has

**Which rule:** §26, every control placed or declared absent · `config.controls` ·
`templates/landing/scripts/check-config.mjs` · new at `v4.0.0`

**Reading of the cause:** the rule is right; the schema is one notch tighter than the rule.
**Scope:** did not block · will recur · any site whose host differs from the template's assumptions.

### What happened

This is a cost of report 6 being adopted, and we would take the trade again. `check-config.mjs`
fails on `config.controls.<key>` where `<key>` is not one of its ten, and the reason given is sound:
a misspelled key declares nothing while looking exactly like a declaration.

This repository had answered **twelve** rows, and the two extra ones are not misspellings:

- `transportSecurity: "edge"` — HTTPS enforcement, verified 2026-08-12 (`http` answers 301 on the
  root and on deep paths), with the residual named: no HSTS, so a session's first request can still
  be plaintext.
- `canonicalHostname: "absent"` — `www` is a CNAME to the apex, reaches this host under a name the
  certificate does not cover, and answers with a TLS error. **This row records a defect that is
  still open** (F3), and it only bites over `https`, which is the direction browsers try first.

Both were split out deliberately. The `transportSecurity` split has its own note in `config.js`
explaining that lumping it into `securityHeaders` *was hiding a live defect behind a true statement*
— "the host serves no custom response headers" is correct, and it made transport look equally out of
reach when in fact the host offered exactly one transport control, it was a toggle, and it was off.

So the closed set forces a choice between two things §26 wants: a machine-readable table, and a
record of every control this site actually reasoned about.

### What we did

Demoted both to prose immediately above the table, verbatim, with the reason for the demotion and
the trigger to promote them back. Folding them into neighbouring rows was considered and rejected —
merging a live `edge` control into an `absent` one would re-create precisely the error `config.js`
records correcting on 2026-08-12. Nothing machine-readable was lost, because nothing read the block
before v4.

### What would remove the friction

Either two more rows, or a declared extension point — a sibling key the check ignores by name, so a
site can record a control the table does not have without it looking like a typo. The check's own
reasoning supports the second: it says it cannot tell whether "absent" is the right answer, only
that every row was answered. An extension point does not weaken that.

---

## 10 — The measurement ratchet's performance tolerance is smaller than the noise it exists to absorb

**Which rule:** §26, a floor this site has not reached is carried, never lowered ·
`templates/landing/scripts/ratchet-measures.mjs` · new at `v4.0.0`

**Reading of the cause:** the rule is right, the mechanism is right, and two things are thin — one
constant, and the absence of any instruction about where to run `--init`.
**Scope:** will block · will recur · every adopting site, on the one metric most likely to be below
its floor.

### What happened

The mechanism is exactly what was needed and its header argues the case correctly — *"a strict 'must
not move the wrong way' comparison on a timing metric produces a red gate from runner variance
alone."* It then sets `tolerance: 0.02` for `categories:performance`.

This sync ran the gate **three times with nothing changed between runs**, on one machine, against a
static server, with the same browser process. Nine samples per metric per URL. `index.html`:

| metric | min | median | max | spread | per-invocation medians | drift | tolerance |
|---|---|---|---|---|---|---|---|
| performance | 0.610 | 0.740 | 0.820 | **0.210** | 0.770 / 0.710 / 0.740 | **0.060** | 0.02 |
| accessibility | 0.980 | 0.980 | 0.980 | 0.000 | 0.980 / 0.980 / 0.980 | 0.000 | 0.02 |
| best practices | 0.790 | 0.790 | 0.790 | 0.000 | 0.790 / 0.790 / 0.790 | 0.000 | 0.02 |
| SEO | 1.000 | 1.000 | 1.000 | 0.000 | 1.000 / 1.000 / 1.000 | 0.000 | 0.02 |
| LCP (ms) | 2185 | 2268 | 3351 | 1166 | 2243 / 2296 / 2264 | 53 (2.3%) | 10% |
| CLS | 0 | 0 | 0 | 0 | 0 / 0 / 0 | 0 | 0.02 |
| total bytes | 523853 | 524223 | 527640 | 3787 | 524243 / 524164 / 524148 | 95 (0.02%) | 5% |

**The median-of-three drifts by 0.06 between invocations — three times the tolerance.** So the
defect is not theoretical, and it did not need to be reasoned about. Initialising the record from
invocation 3 and replaying the other two through the unmodified ratchet:

```
record vs run1 →  ↑ /index.html performance: 0.740 → 0.770        (0 worse, 2 better)
record vs run2 →  FAIL /index.html performance: 0.740 → 0.710     (1 worse)
                  worst acceptable 0.720
record vs run3 →  0 worse, 0 better
```

**One of the three identical runs fails the gate.** That is the failure mode the file's own header
was written to prevent, arriving through the constant rather than through the design.

Two smaller observations from the same data, offered as calibration rather than as complaints:

- **The four category scores split cleanly in two.** Accessibility, best practices, SEO and CLS did
  not move at all across nine samples — `0.02` is generous for them and could be `0`. Performance is
  the outlier and it is the one sharing their constant.
- **LCP's 10% holds, but with less headroom than it looks.** The per-invocation drift was 2.3% on
  `index.html` and 6.8% on `privacy.html`, against a raw sample spread of 51% and 61%. The
  median-of-three is doing nearly all of the work; a `numberOfRuns` of 1 would make that tolerance
  useless.

### The correction that arrived from the runner, and it changes the conclusion

Everything above was measured on a Windows laptop. The same commit was then run **three times on
`ubuntu-latest`**, which is where this gate actually runs — nine more samples per metric per page:

| metric | laptop, per-invocation medians | drift | runner, per-attempt medians | drift |
|---|---|---|---|---|
| performance `/index.html` | 0.770 / 0.710 / 0.740 | **0.060** | 0.96 / 0.95 / 0.97 | 0.020 |
| performance `/privacy.html` | 0.730 / 0.740 / 0.720 | 0.020 | 0.99 / 1.00 / 1.00 | 0.010 |
| best practices, both pages | 0.790 × 9 | 0.000 | 0.790 × 9 | 0.000 |

**So the strong claim above is a claim about a laptop, and it is withdrawn for CI.** On the runner
this site's performance is 0.95–0.97, not 0.74 — it is *above* its floor, and the tolerance never
applies to it, because a metric meeting its floor is not ratcheted at all.

What survives is weaker and still worth filing: **the observed runner drift is 0.020, which is
exactly the tolerance, not comfortably inside it.** A fourth attempt landing 0.01 lower than the
lowest of these three would exceed it. For a site whose performance sits *below* its floor — the
population this mechanism exists for, and the population the header describes measuring — the margin
is zero.

The laptop numbers are left above rather than deleted, because they are the more useful half of the
lesson: **`--init` run in the wrong environment records the wrong site.** This repository committed a
record claiming performance of 0.74 and had to correct it from the runner's 0.96 before the PR
merged. Nothing in the tool says where to run it, and a laptop is the obvious place to try first.

### What we did

Corrected `.gate-measures.json` to what `--update` produces on the runner — performance reached its
floor and left the record, best practices is carried at 0.79 — with the environment written into the
file. Nothing to the script. It is machinery, this repository already carries three divergences in it, and
a tolerance is exactly the kind of constant that should not be tuned privately per site — a locally
widened tolerance reads identically to a considered one, which is the argument §26 makes about
floors one level down. The record is committed as measured, and the PR carries the warning that a
performance regression reported by this gate may be noise until the constant changes.

### What would remove the friction

A margin over the observed CI drift rather than one equal to it — `0.05` for performance would be
defensible from this data; the laptop numbers would want `0.08`–`0.10`. Better still, since
the value is per-metric and empirical: write the tolerance into `.gate-measures.json` next to each
number, which `AGENTS.md` already describes as the design — *"a tolerance recorded beside the
number"* — but which `--init` does not currently emit. Then a site with evidence can widen one with
a diff and a reason, and a site without evidence inherits the default.

---

## One thing that is not friction, recorded because it surprised us

`config.js` is scanned for placeholders while `brief.md` is exempt, so the container placeholder and
each unanswered value in the configuration module are hard gate failures. On an adopting site that
is **exactly right** and we want to be clear we are not asking for it to change: it is what makes
"this site has no measurement at all" a red step rather than a silence, and §26's whole argument is
that an absent control looks identical to a site that never needed one.

It cost four findings in our baseline. They are four findings we want.

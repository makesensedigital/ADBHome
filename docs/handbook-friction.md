# Handbook friction — from adopting §26 on a live site

**Filed from:** `makesensedigital/ADBHome` · adopted 2026-08-11 against handbook `v3.7.1`
(`de0216f`) · procedure: skill `adopt-an-existing-repository`

Four reports. `CONTRIBUTING.md` asks for these as issues rather than pull requests, and this file
is the durable copy: it lives in the same clone as the divergences it explains, so the next person
here can tell a reported problem from a private patch.

**Unreported friction does not disappear; it becomes a silent workaround** — and a rule everyone
quietly bypasses is worse than no rule, because it still claims to be enforced. Three of the four
below are already worked around in this repository. That is the reason to file them, not a reason
not to.

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

## One thing that is not friction, recorded because it surprised us

`config.js` is scanned for placeholders while `brief.md` is exempt, so the container placeholder and
each unanswered value in the configuration module are hard gate failures. On an adopting site that
is **exactly right** and we want to be clear we are not asking for it to change: it is what makes
"this site has no measurement at all" a red step rather than a silence, and §26's whole argument is
that an absent control looks identical to a site that never needed one.

It cost four findings in our baseline. They are four findings we want.

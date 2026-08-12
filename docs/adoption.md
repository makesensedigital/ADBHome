# Adoption record — Platform Engineering Handbook §26

**Adopted 2026-08-11 · handbook `v3.7.1` (`de0216f`) · procedure: skill `adopt-an-existing-repository`**

This site went live on 2026-07-20 and ran for three weeks before the standard reached it. So the
rules arrived after the code, and on the day they landed the code violated them — in twenty-six
machine-checkable places and eleven more no script can see, none of which were mistakes when they
were written.

This file is the record of that, and it exists to prevent the two failures the skill names. It is
**not a task list**: reading it as one is what produces either a rewrite nobody funds or a gate made
green by exemption. It is a measurement, plus the assignment of every finding to exactly one bucket.

> **Adopted does not mean zero violations.** That definition guarantees no repository is ever
> adopted. Adopted means every violation is in exactly one bucket and the ratchet holds. This
> repository has thirty-seven findings and a ratchet. It is adopted. **Its gate is red, and a green
> one on day one would have been the thing to distrust.**

---

## 1. The baseline — the first run, as a measurement

Recorded on 2026-08-11 against commit `0975679`, the commit that brought in the rules and touched
no code. The machine-readable form is [`.gate-baseline.json`](../.gate-baseline.json); this is the
same run in prose, because a baseline nobody can read is a baseline nobody questions.

| Check | Findings | Where |
|---|---|---|
| `check-config` | **18** | 14 in `index.html`, 4 in `config.js` |
| `check-markup` | **3** | `index.html`, plus one about the absent stylesheet |
| `check-assets` | **5** | two images, and one third-party origin |
| **Total ratcheted** | **26** | |
| `build-derived --check` | **does not run** | not ratcheted — see D3 |
| Tracked internal material (§4c) | **clean** | nothing internal is tracked, and nothing ever was |

### What the gate found clean, stated because an absence is not evidence

The security-shaped findings that dominate most adoptions are **genuinely not here**, and that was
checked rather than assumed: no credential, no token, no key, no dump, no `.env`, no internal
material in the tree and none anywhere in the seven commits of history. `Branding/` and `web/` were
ignored before the first commit, which is §26's rule about the ignore file being an access-control
decision, followed correctly and from the start.

The consequence for the fix-now bucket is unusual and worth saying plainly: it holds **one** entry,
and it is about personal data rather than secrets.

### Two corrections to the instrument, made before the number was recorded

A measurement is worth nothing if the instrument reads the wrong subject, and the first run proved
it read two wrong subjects. Both are local divergences from `templates/landing`, both are documented
where the code is, and both are reported upstream as friction rather than kept as a private patch:

1. **`walk()` now measures what is published, not what is on disk.** It read `Branding/` and `web/`
   — ignored directories, unreachable by any visitor — and produced twenty findings about them,
   while a CI runner checking out only tracked files would have reported a different number for the
   same commit. `scripts/lib.mjs`.
2. **The served-text check no longer reports zero on a page serving forty thousand characters.**
   `<body>` is an optional tag and this document omits it, which is valid; upstream slices from
   `indexOf("<body")` without checking for `-1`. `scripts/check-markup.mjs`.

A third divergence is the removal of `scripts/test-gate.mjs` (bucket 3, N4), and a fourth is the
URL list in `lighthouserc.json` — an inventory, not a threshold; every floor is byte-identical.

Neither correction changes a threshold or what a rule requires. Both were found by running the gate,
not by reading it — which is the same way the template's own defects were found.

**All four are reported upstream** in [`handbook-friction.md`](handbook-friction.md), together with
a fifth report that costs this repository nothing and matters more than any of them: the shipped
`gate.yml` never switches to the ratchet, so an adopting site whose publication origin is the
pipeline cannot publish at all until every carried finding is fixed. That is why open definition #5
has the order it has.

---

## 2. The four buckets

Every finding is in exactly one. A finding with no bucket is the one that later becomes an argument.

### Bucket 1 — Fix now

Contract-sensitive and cheap. **Not debt** — these were always defects, and the rule only made them
visible.

| # | Finding | Why it is here |
|---|---|---|
| **F1** | **The site solicits personal data through messaging and discloses nothing.** Ten WhatsApp controls compose a message asking a stranger for name, DNI, CUIL, CUIT, date of birth, vehicle registration, home address, payroll figures — and, in the life-insurance template, **smoking status, which is health-related**. There is no privacy statement anywhere on the site, no link to one, and no page to link to. | §26 is explicit that the obligation to disclose does not change because the collection moved into a chat, and that a prompt asking for identity documents, dates of birth or health-related answers **is** data collection regardless of the absence of a form element. It also requires a privacy statement reachable from the site **in every case**. Both were missed, and this is the one finding on this site with a subject who is not us. |

**Status: open, blocked on four facts only the business can supply** — see the note at the end of
this file. The remedy is drafted and not written, because a privacy statement invented by an agent
is worse than none: it would state retention periods and a responsible mailbox that nobody agreed
to, on a published page, for a regulated broker.

### Bucket 2 — Debt

Real violations, expensive to fix, safe to carry meanwhile. Each carries a reason, a cost, **a
trigger** and an owner in [`technical-debt.md`](technical-debt.md) — without a trigger it is a
complaint, without an owner it is nobody's.

| # | Finding | Baseline count |
|---|---|---|
| D1 | Every external identifier is a literal in the markup; `config.js` declares but does not drive | 14 |
| D2 | Styles and scripts are inline, so there is no stylesheet — three of the four render rules and the tap-target rule are **unmeasured**, not passing | 1 |
| D3 | Business facts live in three unlinked copies; `build-derived --check` cannot run at all | not ratcheted |
| D4 | The map library is fetched from a public CDN on first render, and its tiles from a second origin after load | 1 |
| D5 | Two photographic PNGs, 721 KB and 632 KB, against a 300 KB budget | 4 |
| D6 | Heading outline skips `h1` → `h3` | 1 |
| D7 | No skip link — a keyboard user tabs the whole navigation | 1 |
| D8 | Comments, README and all seven original commit messages are in Spanish; §13/§21 require English in code, comments, commits and documentation and are **not** suspended by §26 | not ratcheted |
| D9 | No published not-found document | not ratcheted |

### Bucket 3 — Inapplicable

The rule genuinely does not apply here. **Recorded with the reason, never deleted and never
silently skipped** — deleting it loses the fact that it was considered, so the next person
re-derives it from nothing.

| # | Rule | Why it does not apply |
|---|---|---|
| N1 | **§20's five quality-gate stages** — format, types, unit suite, dependency audit, build | Declared inapplicable **by §26 itself** for a repository with no build and no dependencies: there is nothing to format-check across a toolchain, no type system, no unit suite and no dependency tree. The delivery gate replaces them, by name. |
| N2 | **§1 stack · §5, §5b, §5c authorization · §7, §7b data layer and migrations · §8, §8b HTTP contract · §9 structured server logging** | Suspended by §26's scope test, and all five conditions hold here: the artifact is static, no backend belongs to this repository, no user authenticates, business logic runs in third-party platforms, and deployment is the publication of files. **If any one of them ever fails, this stops being a landing and the rest of the handbook governs it** — say so and stop, rather than stretching §26 over it. |
| N3 | **`.github/instructions/*` from §0's file table** | Each projects a section N2 suspends. Generating them would put rules into the always-loaded context that cannot apply here, which is the specific cost §0 says the profile exists to avoid. `AGENTS.md` carries §26 and §22, which is the whole applicable surface. |
| N4 | **`scripts/test-gate.mjs`** | It builds its fixture by copying the repository it lives in and editing the landing template's placeholder values, so on an adopted site it throws before testing anything. The checks it tests are byte-identical to the pinned release, where that test runs against the fixture site it was written for. **The requirement returns in full the moment this repository adds or changes a check** — the reason and that condition are recorded in `gate.yml` where the step used to be. |
| N5 | **`config.receiver.endpoint`** | The site presents no form. That is not a gap: §26 prescribes exactly this when nothing persists what a control would collect. What the same rule still wants — a named person who answers an enquiry — is open definition #4, not this bucket. |
| N6 | **Central Standards' data-dictionary and layer jobs, and §7b semantics coverage** | No database, no ORM model, no declared layers. The jobs detect their own absence and report a notice. |
| N7 | **Sender authentication** (§26 irreversible #5) | Scoped to this repository: nothing here sends or is sent mail. It is **not** a statement about ADB's mail in general — the office addresses in the presence map are on a different domain from the site, which is open definition #3. |

### Bucket 4 — Blocked on a decision

The rule applies, and complying needs a choice nobody has made — a provider, a budget, an owner, or
a hosting capability. Each is in [`open-definitions.md`](open-definitions.md) **with the default
that holds while it is open**. An entry there means permitted-and-registered, not blocked.

| # | Finding | The choice |
|---|---|---|
| O1 | **No measurement of any kind, since launch** | Whether to instrument now, and with what. |
| O2 | Consent has no owner and no date | Who decides, and when. |
| O3 | No canonical public mailbox, and the office addresses are on a different domain from the site | Which mailbox is canonical. |
| O4 | Nobody is named as the person who answers an enquiry | Who. |
| O5 | Publication is straight from the branch | Whether to move the origin to the pipeline — a repository setting only the owner can change. |
| O6 | **The host cannot serve response headers or issue redirects** | Whether to stay on it. Not fixable in place. |
| O7 | Two conversion controls resolve to the page they sit on | Build the destination, or remove the controls. |
| O8 | No OpenSpec workspace, and §26 does not suspend §19 | Whether this site's change history warrants one. |
| O9 | Seven direct commits to `main`, no pull request, no code owner | Whether a one-person repository adopts the flow now or later. |
| O10 | No named owner, no review cadence, no scheduled check, no ownership-and-exit inventory | Who owns it, and how it transfers. |

**O6 is the one that is not debt and never becomes debt.** GitHub Pages serves no custom response
headers and issues no real redirect, so on this host there is **no protection against framing at
all** — that control has no equivalent expressible from inside a document — no enforceable content
security policy, and no way to implement §26's canonical-identity rule. `_headers` and `_redirects`
would do nothing here, which is why neither exists. This is a finding that changes the hosting
decision rather than one anybody can fix in the markup, and §26 is explicit that hosting is a
security decision taken before the first line of markup.

**O1 is the one that cannot be recovered.** Measurement is the single artifact in this standard that
cannot be reconstructed backwards. The three weeks already published have no events, and no decision
taken now creates them. The entry records the **gap in the history**, not a plan to fill it, because
there is nothing to fill it with.

---

## 3. The ratchet

`.gate-baseline.json` records the 26 findings above, keyed by check and file. From here **the gate
fails on a violation that is new, not on one that already existed**. The repository therefore stops
getting worse immediately — the property that actually matters — and improves at whatever rate the
work is funded, without ever reporting a compliance it does not have.

```bash
node scripts/ratchet.mjs            # fail if any count rose
node scripts/ratchet.mjs --update   # lower it after a fix — in the SAME commit as the fix
```

A baseline left high keeps headroom, and the violation just removed can come back for free. Never
re-run `--init`: it would silently accept everything added since.

**No blanket suppression exists in this repository, and none may be added.** A file-level or
repository-level disable removes the rule instead of recording the debt, and removes it for the code
written tomorrow too. Where a suppression is ever genuinely needed it names the specific rule, is
scoped as narrowly as possible, and states why — §20 requires this and it is where adoption most
often goes wrong. The two escape hatches that exist upstream (`check-config: allow`, and the
first-render origin allowlist) are **both unused on purpose**: using either on day one would have
converted a finding into a silence.

---

## 4. Fix order, when the work is funded

§26's order, not a convenience order. Security first, because it is the bucket where *later* means
something different: **F1**, then the decisions that unblock everything else — **O1** and **O2**,
because measurement and consent are irreversible and the second constrains the first — then
**O5/O6**, because hosting decides which rules the site is *able* to obey, then the rest at whatever
rate is funded.

D1 is the cheapest large number and it is deliberately **not** first: fourteen findings look like
the biggest problem on the list and are the least consequential thing on it.

---

## 5. The first runner execution — 2026-08-12, run `31555146819`

Three things were flagged as unverified when this record was written. Pushing resolved two of them
within ninety seconds, and both answers changed something above rather than confirming it. They are
recorded here **as they came back**, including where the prediction was wrong.

### The baseline reproduces exactly

| | Local, Windows, Node 24 | Runner, ubuntu-latest |
|---|---|---|
| `check-config` | 18 | **18** |
| `check-markup` | 3 | **3** |
| `check-assets` | 5 | **5** |
| ratchet | 26 vs 26, 0 increased | **26 vs 26, 0 increased** |

This is the result the `walk()` correction was made for. Without it the runner — which materialises
only tracked files — would have reported twenty fewer findings than the machine that recorded the
baseline, and the first CI run would have opened with a spurious *findings went down*.

### The external job ran for the first time, and almost all of it passed

**One assertion failed: `heading-order`**, scoring 0 across all three runs. That is D6, and it is
the only automated confirmation any of the debt entries received.

Everything else cleared: links resolved; performance ≥ 0.9, accessibility ≥ 0.95, best practices
≥ 0.9, SEO ≥ 0.95; layout shift, largest contentful paint and **total byte weight** all inside their
ceilings; `modern-image-formats`, `unsized-images`, `color-contrast`, `image-alt`, `link-name`,
`button-name`, `landmark-one-main`, `bypass`, the ARIA set, `meta-description`, `document-title`,
`is-crawlable` and `canonical` all passing.

**Two predictions in the debt register were wrong, and both are corrected there rather than
quietly:** D5 was named as the finding most likely to fail first and it did not fail at all — the
`<picture>` element keeps the heavy PNG off the page's critical path, and the social image is never
fetched by the page that was measured. D7 was expected to fail `bypass`; it passed, because that
audit accepts landmarks as a bypass mechanism and this page has them. **The skip link is still
missing and §6c still requires it** — what changed is that no automated check will ever say so,
which makes D7 more fragile than it looked, not less.

The floors themselves are now calibrated by evidence on this site rather than inherited as guesses.
That is worth more than the pass: a threshold nothing has ever run against is a number, not a floor.

### The Central Standards caller does not resolve — confirmed

Run `31555147024` failed in 0 seconds with *this run likely failed because of a workflow file
issue*, which is what a reusable workflow in an unreachable repository looks like. The handbook is
private, and calling across repositories needs an Actions access setting on **that** repository. It
is not a defect here, it is not fixable here, and it is now open definition #12 — with a friction
report upstream, because §0 reasoned carefully about the private-repository constraint for the
bootstrap and did not carry the same reasoning to the caller it mandates.

### Still unverified, and only a person can do it

- **The mobile experience has not been seen on a real device**, reached through the same kind of
  link a visitor would follow. §26 requires that specifically and says a desktop emulator is not a
  substitute. Lighthouse's mobile emulation is not it either. D2 means the automated half is not
  covering the render rules at all, so this one carries more weight here than it would elsewhere.

## 6. What F1 needs before it can be written

Four facts, none of which an agent may invent on a published page for a regulated broker:

1. **Who the data controller is**, as it should appear — the registered name behind *ADB | Broker de
   Seguros*, matrícula SSN nº 1877.
2. **The mailbox that receives a rights request** — access, rectification, deletion. This is open
   definition #3 and F1 cannot be finished without it.
3. **How long an enquiry is kept**, and where it lives once it leaves WhatsApp.
4. **Whether the smoking question in the life-insurance template stays.** It is the only
   health-related item, and removing it is cheaper than disclosing it correctly.

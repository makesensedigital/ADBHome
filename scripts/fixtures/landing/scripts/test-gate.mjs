#!/usr/bin/env node
// The gate's own test — Handbook §20. Node stdlib only.
//
//   node scripts/test-gate.mjs
//
// A check that has never failed on purpose is not known to work, and a check that fires on correct
// input is worse than no check, because it teaches people to route around the gate. So this tests
// BOTH directions:
//
//   1. A filled-in site passes every check. (Catches a check that fires on correct input.)
//   2. One deliberate defect at a time makes exactly the right check fail. (Catches a check that
//      cannot see the thing it exists to see.)
//
// The template as shipped deliberately FAILS check-config, because it is full of placeholders. That
// is the intended behaviour — the gate refuses to publish an unfilled scaffold — so this test fills
// it in first and works from there.

import { cp, mkdir, mkdtemp, rm, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
// THE KNOWN-GOOD FIXTURE IS BUILT BY COPYING THE TEMPLATE and editing its placeholders out. In a
// repository that ADOPTED the standard afterwards those placeholders do not exist, so the setup
// aborts on the first one — which makes the gate's own test the single step an adopting repository
// cannot run, in exactly the place a check is most likely to be edited to quiet a red gate.
//
// So prefer a pristine copy vendored beside the checks when one is present, and fall back to the
// repository root. In a repository built FROM this template the fallback is correct and no fixture
// directory exists; `adopt-an-existing-repository` places one in a repository that adopts. The copy
// filter below already excludes `scripts/fixtures`, so the shape was anticipated — only the
// resolution was not.
const VENDORED = resolve(HERE, "fixtures", "landing");
const TEMPLATE = existsSync(VENDORED) ? VENDORED : resolve(HERE, "..");

const CHECKS = ["check-config.mjs", "check-markup.mjs", "check-assets.mjs"];

const edit = async (dir, file, from, to) => {
  const path = join(dir, file);
  const text = await readFile(path, "utf8");
  if (!text.includes(from)) throw new Error(`fixture setup: "${from}" not found in ${file}`);
  await writeFile(path, text.replace(from, to), "utf8");
};

/** Run one check and return its failure count. */
const runCheck = async (dir, check) => {
  try {
    const { stdout } = await run(process.execPath, [join(HERE, check), "--root", dir], { cwd: dir });
    return { failures: 0, output: stdout };
  } catch (error) {
    const output = String(error.stdout || "") + String(error.stderr || "");
    const m = /· (\d+) failures/.exec(output);
    return { failures: m ? Number(m[1]) : -1, output };
  }
};

/** A filled-in copy of the template: the baseline every fixture starts from. */
const makeSite = async () => {
  const dir = await mkdtemp(join(tmpdir(), "landing-gate-"));
  await cp(TEMPLATE, dir, {
    recursive: true,
    filter: (src) => !/[\\/]scripts[\\/]fixtures/.test(src),
  });

  await edit(dir, "config.js", 'canonicalOrigin: "https://example.com"', 'canonicalOrigin: "https://acme.test"');
  await edit(dir, "config.js", 'messagingNumber: "0000000000000"', 'messagingNumber: "5490000000000"');
  await edit(dir, "config.js", 'contactMailbox: "hello@example.com"', 'contactMailbox: "hola@acme.test"');
  await edit(dir, "config.js", 'tagContainerId: "GTM-XXXXXXX"', 'tagContainerId: "GTM-ABCD123"');
  await edit(dir, "config.js", 'endpoint: null,', 'endpoint: "https://forms.acme.test/f/1",');
  await edit(dir, "config.js", "originRestricted: false", "originRestricted: true");
  await edit(dir, "config.js", 'jurisdiction: "TBD — name the country or bloc whose law this answers"', 'jurisdiction: "Argentina"');
  await edit(dir, "config.js", 'decidedBy: "TBD — a person, not a team"', 'decidedBy: "A. Owner"');
  await edit(dir, "config.js", 'decidedOn: "TBD — YYYY-MM-DD"', 'decidedOn: "2026-08-09"');
  await edit(dir, "config.js", 'owner: "TBD — the person who answers a submission, by name"', 'owner: "A. Owner"');
  await edit(dir, "config.js", 'measurementDestination: "TBD — the property that receives these events, by its identifier"', 'measurementDestination: "G-ABCD123456"');
  await edit(dir, "config.js", "eventsObserved: false", "eventsObserved: true");
  await edit(dir, "config.js", 'reason: "TBD — why this site is, or is not, meant to be found"', 'reason: "organic search is the main channel for this business"');
  await edit(dir, "config.js", 'searchProperty: "TBD — the verified property, named by the domain it covers"', 'searchProperty: "acme.test"');
  await edit(dir, "config.js", 'verifiedBy: "TBD — how ownership was proven (a DNS record, a served file), and who holds it"', 'verifiedBy: "DNS TXT record on the zone apex, held by A. Owner"');
  await edit(dir, "config.js", 'owner: "TBD — a person, not a team"', 'owner: "A. Owner"');
  await edit(dir, "config.js", "sitemapSubmitted: false", "sitemapSubmitted: true");

  // §26's control-placement table. Six rows have one right answer in this architecture and ship
  // filled in; these four depend on the host and the pipeline, which is the decision the section
  // says to take before the first line of markup. The fixture answers them as a site on a host that
  // reads `_headers` and `_redirects` would, so both files stay consistent with their rows.
  await edit(dir, "config.js", 'retiredUrlRedirects: { where: "", why: "" }', 'retiredUrlRedirects: { where: "edge", why: "" }');
  await edit(dir, "config.js", 'requestLogs: { where: "", why: "" }', 'requestLogs: { where: "edge", why: "" }');
  await edit(dir, "config.js", 'securityHeaders: { where: "", why: "" }', 'securityHeaders: { where: "edge", why: "" }');
  await edit(dir, "config.js", 'environmentSeparation: { where: "", why: "" }', 'environmentSeparation: { where: "gate", why: "" }');

  for (const file of ["index.html", "privacy.html", "404.html"]) {
    const path = join(dir, file);
    const text = await readFile(path, "utf8");
    await writeFile(path, text.replaceAll("https://example.com", "https://acme.test"), "utf8");
  }

  // Regenerate the derived artifacts from the filled-in source.
  await run(process.execPath, [join(HERE, "build-derived.mjs"), "--root", dir], { cwd: dir });
  return dir;
};

// ---------------------------------------------------------------- the fixtures
//
// Each is a single realistic defect, taken from what actually happens on this class of site.
const FIXTURES = [
  {
    name: "a messaging number written as a literal in the markup",
    check: "check-config.mjs",
    apply: (dir) =>
      edit(dir, "index.html", 'data-messaging="hero_primary"', 'href="https://wa.me/5490000000000"'),
  },
  {
    name: "the asset version bumped in config but not in the markup",
    check: "check-config.mjs",
    apply: (dir) => edit(dir, "config.js", "assetVersion: 1", "assetVersion: 2"),
  },
  {
    name: "a form with its receiver removed",
    check: "check-config.mjs",
    apply: (dir) => edit(dir, "config.js", 'endpoint: "https://forms.acme.test/f/1",', "endpoint: null,"),
  },
  {
    name: "a receiver that is not origin-restricted",
    check: "check-config.mjs",
    apply: (dir) => edit(dir, "config.js", "originRestricted: true", "originRestricted: false"),
  },
  {
    name: "a second h1",
    check: "check-markup.mjs",
    apply: (dir) => edit(dir, "index.html", "<h2>About</h2>", "<h1>About</h1>"),
  },
  {
    name: "a heading level skipped",
    check: "check-markup.mjs",
    apply: (dir) => edit(dir, "index.html", "<h2>What we do</h2>", "<h4>What we do</h4>"),
  },
  {
    name: "a relative social image",
    check: "check-markup.mjs",
    apply: (dir) =>
      edit(dir, "index.html", 'og:image" content="https://acme.test/assets/social.png"', 'og:image" content="assets/social.png"'),
  },
  {
    name: "a full-height section measured in vh",
    check: "check-markup.mjs",
    apply: (dir) => edit(dir, "styles.css", "min-height: 78dvh", "min-height: 78vh"),
  },
  {
    name: "the bottom-fixed conversion bar losing its safe area",
    check: "check-markup.mjs",
    apply: (dir) =>
      edit(dir, "styles.css", "padding: 12px var(--gutter) calc(12px + env(safe-area-inset-bottom, 0px));", "padding: 12px var(--gutter);"),
  },
  {
    name: "form controls below the size that triggers zoom on iOS",
    check: "check-markup.mjs",
    apply: (dir) => edit(dir, "styles.css", "font-size: 16px;\n  font-family: inherit;", "font-size: 15px;\n  font-family: inherit;"),
  },
  {
    name: "an image with no alt text",
    check: "check-markup.mjs",
    apply: (dir) => edit(dir, "index.html", "<h2>About</h2>", '<h2>About</h2>\n<img src="/assets/social.png" width="100" height="100">'),
  },
  {
    name: "a conversion control pointing at the page it sits on",
    check: "check-markup.mjs",
    apply: (dir) =>
      edit(dir, "index.html", '<a class="btn btn--ghost" href="#offerings"', '<a class="btn btn--ghost" href="https://acme.test/"'),
  },
  {
    name: "the skip link removed",
    check: "check-markup.mjs",
    apply: (dir) => edit(dir, "index.html", '<a class="skip-link" href="#main">Skip to content</a>', ""),
  },
  {
    name: "a third-party typeface fetched on first render",
    check: "check-assets.mjs",
    apply: (dir) =>
      edit(dir, "index.html", '<link rel="stylesheet" href="/styles.css?v=1" />', '<link rel="stylesheet" href="https://fonts.example-cdn.test/css?family=X" />\n    <link rel="stylesheet" href="/styles.css?v=1" />'),
  },
  {
    name: "an image over the per-image budget",
    check: "check-assets.mjs",
    apply: async (dir) => {
      await writeFile(join(dir, "assets", "hero.jpg"), Buffer.alloc(400 * 1024, 1));
      await edit(dir, "index.html", "<h2>About</h2>", '<h2>About</h2>\n<img src="/assets/hero.jpg" alt="x" width="10" height="10">');
    },
  },
  {
    name: "a committed asset referenced from nowhere",
    check: "check-assets.mjs",
    apply: (dir) => writeFile(join(dir, "assets", "orphan.png"), Buffer.alloc(64, 1)),
  },
  {
    // The mirror, and the one that costs more: a 404 on the live site that raises nothing. Found
    // by running the gate against a served copy rather than by reading the check.
    name: "an asset referenced but not committed",
    check: "check-assets.mjs",
    apply: (dir) => rm(join(dir, "assets", "apple-touch-icon.png"), { force: true }),
  },
  {
    name: "a derived file hand-edited away from facts.js",
    check: "build-derived.mjs",
    args: ["--check"],
    apply: (dir) => edit(dir, "llms.txt", "# Example Company", "# Something Else Entirely"),
  },
  // The three below are the far side of publication: none of them is visible in the files, which
  // is exactly why each one is a value somebody has to attest to rather than a thing to detect.
  {
    name: "a container id filled in with nothing confirmed receiving its events",
    check: "check-config.mjs",
    apply: (dir) => edit(dir, "config.js", "eventsObserved: true", "eventsObserved: false"),
  },
  {
    name: "a site meant to be found whose sitemap was never submitted",
    check: "check-config.mjs",
    apply: (dir) => edit(dir, "config.js", "sitemapSubmitted: true", "sitemapSubmitted: false"),
  },
  {
    name: "discoverability declared absent while robots.txt still invites crawling",
    check: "check-config.mjs",
    apply: (dir) => edit(dir, "config.js", "indexed: true,", "indexed: false,"),
  },
  {
    // Before the scan learned to read stylesheets, this fixture passed: the reference lived in a
    // file type the orphan check never opened, so the font was reported as committed-but-unused
    // and the missing one was invisible. §26 actively recommends self-hosting typefaces.
    name: "a typeface referenced from a stylesheet but not committed",
    check: "check-assets.mjs",
    apply: async (dir) => {
      await writeFile(
        join(dir, "assets", "fonts.css"),
        "@font-face { font-family: Body; src: url(fonts/body.woff2) format('woff2'); }",
        "utf8",
      );
      await edit(
        dir,
        "index.html",
        '<link rel="stylesheet" href="/styles.css?v=1" />',
        '<link rel="stylesheet" href="/assets/fonts.css?v=1" /> <link rel="stylesheet" href="/styles.css?v=1" />',
      );
    },
  },
  {
    // The render rules read CSS. A site with no stylesheet at all — all of it inline, which is what
    // one person building one page quickly produces — used to run three of the four rules against
    // an empty string and report nothing.
    name: "a full-height rule inside an inline <style> block",
    check: "check-markup.mjs",
    apply: (dir) => edit(dir, "index.html", "</head>", "<style>body { min-height: 100vh; }</style></head>"),
  },
  {
    // The row simply not there. Before the table had a carrier this was indistinguishable from a
    // considered decision, which is the failure §26 states most strongly and had no mechanism for.
    name: "a control-placement row that was never declared",
    check: "check-config.mjs",
    apply: (dir) =>
      edit(
        dir,
        "config.js",
        'credentialRotation: {',
        'unusedRow: {',
      ),
  },
  {
    // "Absent" is a legitimate answer and the reason is what makes it one. Without it, a control
    // nobody thought about and a control deliberately given up read identically.
    name: "a control declared absent with no reason",
    check: "check-config.mjs",
    apply: (dir) =>
      edit(dir, "config.js", 'securityHeaders: { where: "edge", why: "" }', 'securityHeaders: { where: "absent", why: "" }'),
  },
  {
    // A FILE THAT DOES NOTHING READS AS A CONTROL. `_headers` on a host that serves no custom
    // headers is inert, and from the repository it looks exactly like the headers being in force.
    name: "_headers committed while the row says the host cannot serve it",
    check: "check-config.mjs",
    apply: (dir) =>
      edit(
        dir,
        "config.js",
        'securityHeaders: { where: "edge", why: "" }',
        'securityHeaders: { where: "absent", why: "the host serves no custom response headers, so there is no framing protection at all" }',
      ),
  },
];

// ---------------------------------------------------------------- run
let failures = 0;
const say = (s) => process.stdout.write(s + "\n");

say("");
say("direction 1 — a filled-in site passes every check");

const baseline = await makeSite();
for (const check of [...CHECKS, "build-derived.mjs"]) {
  const args = check === "build-derived.mjs" ? ["--check"] : [];
  let result;
  try {
    await run(process.execPath, [join(HERE, check), "--root", baseline, ...args], { cwd: baseline });
    result = 0;
  } catch (error) {
    const out = String(error.stdout || "") + String(error.stderr || "");
    result = 1;
    say(`  FAIL  ${check} fires on a correct site — a check that fails on valid input teaches people to route around the gate`);
    say(out.split("\n").filter((l) => l.startsWith("FAIL") || l.startsWith("      ")).slice(0, 6).map((l) => "        " + l).join("\n"));
  }
  if (result === 0) say(`  ok    ${check}`);
  failures += result;
}
await rm(baseline, { recursive: true, force: true });

say("");
say("direction 2 — each deliberate defect is caught by the check that owns it");

for (const fixture of FIXTURES) {
  const dir = await makeSite();
  await fixture.apply(dir);

  const check = fixture.check;
  const args = fixture.args || [];
  let caught = false;
  try {
    await run(process.execPath, [join(HERE, check), "--root", dir, ...args], { cwd: dir });
  } catch {
    caught = true;
  }

  if (caught) say(`  ok    ${check.padEnd(20)} caught: ${fixture.name}`);
  else {
    say(`  FAIL  ${check.padEnd(20)} MISSED: ${fixture.name}`);
    failures++;
  }
  await rm(dir, { recursive: true, force: true });
}

// ---------------------------------------------------------------- the other correct answer
//
// `indexed: false` is a legitimate site, not a defect, and the check that enforces the declaration
// is the one here most likely to fire on correct input: it compares config.js against a GENERATED
// file, so any disagreement between the two reads as a site that never decided. A site kept out of
// the index on purpose has to pass a gate it will run on every change for the rest of its life, so
// the whole legitimate path is exercised — declare it, regenerate, check.
say("");
say("direction 1b — a site deliberately kept out of the index also passes");

{
  const dir = await makeSite();
  await edit(dir, "config.js", "indexed: true,", "indexed: false,");
  await edit(
    dir,
    "config.js",
    'reason: "organic search is the main channel for this business"',
    'reason: "reached only from a code printed on the packaging"',
  );
  await run(process.execPath, [join(HERE, "build-derived.mjs"), "--root", dir], { cwd: dir });

  const { failures: found, output } = await runCheck(dir, "check-config.mjs");
  if (found === 0) say("  ok    check-config.mjs     the declaration and the generated robots.txt agree");
  else {
    say("  FAIL  check-config.mjs     a legitimate not-to-be-found site fails its own gate");
    say(output.split("\n").filter((l) => l.startsWith("FAIL")).slice(0, 4).map((l) => "        " + l).join("\n"));
    failures++;
  }
  await rm(dir, { recursive: true, force: true });
}


// ---------------------------------------------------------------- correct input, no findings
//
// The mirror of direction 2, and the one that decides whether people trust the output. A check that
// fires on correct input teaches them to route around the gate (§20) — and both cases below were
// found by running the gate on real sites, not by reading it.
say("");
say("direction 1c — correct input the checks must stay quiet about");

{
  const dir = await makeSite();

  // §26 recommends self-hosting typefaces, in as many words. Doing it has to be free: the stylesheet
  // is referenced from the document, the font is referenced from the stylesheet with an UNQUOTED
  // relative url() — the ordinary way to write it — and the file is committed where that resolves.
  await mkdir(join(dir, "assets", "fonts"), { recursive: true });
  await writeFile(join(dir, "assets", "fonts", "body.woff2"), Buffer.from("woff2-stub"));
  await writeFile(
    join(dir, "assets", "fonts.css"),
    "@font-face { font-family: Body; src: url(fonts/body.woff2) format('woff2'); }",
    "utf8",
  );
  await edit(
    dir,
    "index.html",
    '<link rel="stylesheet" href="/styles.css?v=1" />',
    '<link rel="stylesheet" href="/assets/fonts.css?v=1" /> <link rel="stylesheet" href="/styles.css?v=1" />',
  );

  const fonts = await runCheck(dir, "check-assets.mjs");
  if (fonts.failures === 0) say("  ok    check-assets.mjs     a self-hosted typeface is neither an orphan nor missing");
  else {
    say("  FAIL  check-assets.mjs     self-hosting a typeface produces findings");
    say(fonts.output.split("\n").filter((l) => l.startsWith("FAIL")).slice(0, 4).map((l) => "        " + l).join("\n"));
    failures++;
  }

  // A sentinel inside compressed image data is a byte coincidence, not an unanswered question. The
  // placeholder scan is line-based and must never read a binary at all: on the first real adoption
  // 6 of 53 day-one findings were TBD matched inside three PNGs, each with unactionable remediation.
  await writeFile(
    join(dir, "assets", "photo.png"),
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      // Non-word bytes on both sides, because that is what makes it a WORD-BOUNDED match and
      // therefore a real reproduction. Compressed image data is full of such coincidences.
      Buffer.from([0xff, 0x00]),
      Buffer.from("TBD"),
      Buffer.from([0x00, 0xff, 0x01, 0x02]),
    ]),
  );
  const placeholders = await runCheck(dir, "check-config.mjs");
  if (placeholders.failures === 0) say("  ok    check-config.mjs     a sentinel inside binary image data is not a finding");
  else {
    say("  FAIL  check-config.mjs     the placeholder scan read a binary file");
    say(placeholders.output.split("\n").filter((l) => l.startsWith("FAIL")).slice(0, 4).map((l) => "        " + l).join("\n"));
    failures++;
  }

  await rm(dir, { recursive: true, force: true });
}
// ---------------------------------------------------------------- the ratchet
//
// Stateful, so it does not fit the one-defect-per-fixture shape above. Four states, and the two
// that matter are the ones a count-only ratchet gets wrong: a NEW violation must fail, and a
// baseline that fell must not silently keep its old headroom.
say("");
say("direction 3 — the ratchet carries what existed and fails on what is new");

{
  const dir = await makeSite();
  const ratchet = (args = []) =>
    run(process.execPath, [join(HERE, "ratchet.mjs"), "--root", dir, ...args], { cwd: dir })
      .then(({ stdout }) => ({ code: 0, out: stdout }))
      .catch((e) => ({ code: 1, out: String(e.stdout || "") }));

  const check = (label, ok) => {
    if (ok) say(`  ok    ratchet.mjs          ${label}`);
    else {
      say(`  FAIL  ratchet.mjs          ${label}`);
      failures++;
    }
  };

  const noBaseline = await ratchet();
  check("no baseline on a compliant site is a no-op", noBaseline.code === 0 && /no baseline/.test(noBaseline.out));

  // Adopt with a violation already present.
  await edit(dir, "index.html", "<h2>About</h2>", '<h2>About</h2><p>hola@example.com</p>');
  await ratchet(["--init"]);
  const unchanged = await ratchet();
  check("an existing violation is carried, not failed", unchanged.code === 0);

  // Add a second one, in a different file — the case a total-only baseline misses.
  await edit(dir, "privacy.html", "<h1>Privacy</h1>", '<h1>Privacy</h1><p>hola@example.com</p>');
  const risen = await ratchet();
  check("a NEW violation in another file fails", risen.code === 1 && /FAIL/.test(risen.out));

  // Remove the new one — back to the baseline exactly, which is neither a rise nor a fall.
  await edit(dir, "privacy.html", '<h1>Privacy</h1><p>hola@example.com</p>', "<h1>Privacy</h1>");
  const back = await ratchet();
  check("removing the new one returns to the baseline", back.code === 0 && !/FAIL/.test(back.out));

  // Now fix one that IS in the baseline. That is the fall, and it must ask for --update: leaving
  // the baseline high keeps headroom for the violation to come back for free.
  await edit(dir, "index.html", "<h2>About</h2><p>hola@example.com</p>", "<h2>About</h2>");
  const fell = await ratchet();
  check("a fall is reported and asks for --update", fell.code === 0 && /went down/.test(fell.out));

  await ratchet(["--update"]);
  const settled = await ratchet();
  check("--update settles it, and nothing is left owing", settled.code === 0 && !/went down/.test(settled.out));

  await rm(dir, { recursive: true, force: true });
}

{
  // CONVERGENCE. The baseline's keys embed the paths of the findings they record, so a key like
  // `check-assets|assets/orphan.png` reads as a quoted string ending in a scanned extension. Unless
  // the baseline is excluded from the walk, --init writes a file that guarantees the next run finds
  // something NEW — and recording that writes a longer path into the same file, which produces
  // another finding on the run after that. It does not terminate.
  //
  // It cannot reproduce on a compliant site, which is why upstream never saw it: it needs a finding
  // whose key ends in a scanned extension, and a site built from this template has no findings at
  // all. So the fixture has to manufacture one.
  const dir = await makeSite();
  await writeFile(join(dir, "assets", "orphan.png"), Buffer.from("committed-and-referenced-from-nowhere"));

  const ratchet = (args = []) =>
    run(process.execPath, [join(HERE, "ratchet.mjs"), "--root", dir, ...args], { cwd: dir })
      .then(({ stdout }) => ({ code: 0, out: stdout }))
      .catch((e) => ({ code: 1, out: String(e.stdout || "") }));

  await ratchet(["--init"]);
  const converged = await ratchet();
  if (converged.code === 0 && !/FAIL/.test(converged.out)) {
    say("  ok    ratchet.mjs          --init converges when a finding names an asset");
  } else {
    say("  FAIL  ratchet.mjs          the baseline feeds itself back through the checks");
    say(converged.out.split("\n").filter((l) => l.includes("FAIL")).slice(0, 3).map((l) => "        " + l).join("\n"));
    failures++;
  }

  await rm(dir, { recursive: true, force: true });
}

say("");
// ---------------------------------------------------------------- the measurement ratchet
//
// Synthetic Lighthouse reports, because the point is to test the COMPARISON and not Lighthouse. A
// fixture that ran the real thing would take minutes, need a browser, and produce different numbers
// every time — which would make the one property that matters most here, that ordinary run-to-run
// variance does NOT fail the gate, impossible to assert.
say("");
say("direction 4 — the measurement ratchet carries what is below the floor and fails on a real regression");

{
  const dir = await mkdtemp(join(tmpdir(), "landing-measures-"));
  const reports = join(dir, ".lighthouseci");
  await mkdir(reports, { recursive: true });

  /** Write `runs` reports for one page, each metric given as a list of per-run values. */
  const publish = async (metrics, runs = 3) => {
    for (const name of await readdir(reports)) await rm(join(reports, name), { force: true });
    for (let i = 0; i < runs; i++) {
      const lhr = {
        finalDisplayedUrl: "http://localhost/index.html",
        categories: {},
        audits: {},
      };
      for (const [key, values] of Object.entries(metrics)) {
        const value = Array.isArray(values) ? values[i % values.length] : values;
        if (key.startsWith("categories:")) lhr.categories[key.slice(11)] = { score: value };
        else lhr.audits[key] = { numericValue: value };
      }
      await writeFile(join(reports, `lhr-${i}.json`), JSON.stringify(lhr), "utf8");
    }
  };

  const measures = (args = []) =>
    run(process.execPath, [join(HERE, "ratchet-measures.mjs"), "--root", dir, "--reports", reports, ...args], { cwd: dir })
      .then(({ stdout }) => ({ code: 0, out: stdout }))
      .catch((e) => ({ code: 1, out: String(e.stdout || "") }));

  const check = (label, ok) => {
    if (ok) say(`  ok    ratchet-measures.mjs  ${label}`);
    else {
      say(`  FAIL  ratchet-measures.mjs  ${label}`);
      failures++;
    }
  };

  // The site as it arrives: accessibility and best-practices below their floors, LCP over, SEO fine.
  const ADOPTED = {
    "categories:accessibility": 0.94,
    "categories:best-practices": 0.79,
    "categories:seo": 0.98,
    "largest-contentful-paint": [3100, 3050, 3150],
  };

  await publish(ADOPTED);
  const none = await measures();
  check("no record is a no-op, and says the floors are the gate", none.code === 0 && /no record/.test(none.out));

  const init = await measures(["--init"]);
  check("--init carries only what is below its floor", init.code === 0 && /3 measurement\(s\) below their floor/.test(init.out));

  const unchanged = await measures();
  check("the same numbers again pass", unchanged.code === 0);

  // THE ASSERTION THIS MECHANISM LIVES OR DIES ON. A 5% wobble on a timing metric is the runner,
  // not the site. A ratchet that reddens on that is switched off within a fortnight, and then the
  // real regression it existed to catch goes through unnoticed.
  await publish({ ...ADOPTED, "largest-contentful-paint": [3230, 3180, 3260] });
  const noise = await measures();
  check("ordinary run-to-run variance does NOT fail", noise.code === 0);

  await publish({ ...ADOPTED, "largest-contentful-paint": [4200, 4150, 4300] });
  const regression = await measures();
  check("a real regression beyond the tolerance fails", regression.code === 1 && /FAIL/.test(regression.out));

  // A metric that was never carried is held to its published floor by Lighthouse's own assertion.
  // If this offered a second, looser opinion on it, the floor would have been quietly replaced.
  await publish({ ...ADOPTED, "categories:seo": 0.55 });
  const uncarried = await measures();
  check("a metric that always met its floor is not ratcheted — the floor governs", uncarried.code === 0);

  await publish({ ...ADOPTED, "categories:accessibility": 0.97 });
  const reached = await measures();
  check("reaching the floor is reported, and asks for --update", reached.code === 0 && /reached the floor/.test(reached.out));

  await measures(["--update"]);
  await publish({ ...ADOPTED, "categories:accessibility": 0.96 });
  const held = await measures();
  check("once it has reached the floor it leaves the record and cannot come back", held.code === 0 && !/accessibility/.test(held.out));

  await rm(dir, { recursive: true, force: true });
}

say("");
say(`test-gate: ${FIXTURES.length} fixtures + ${CHECKS.length + 4} clean-run assertions + 7 ratchet states + 8 measurement states · ${failures} failures`);
if (failures) process.exitCode = 1;

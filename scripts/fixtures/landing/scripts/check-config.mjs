#!/usr/bin/env node
// One configuration module, no placeholders — Handbook §26 (Static Conversion Sites). Node stdlib only.
//
//   node scripts/check-config.mjs [--root .]
//
// Three failures, all of which have been paid for on real sites:
//
// 1. AN EXTERNAL IDENTIFIER OUTSIDE config.js. A messaging number repeated across a page is a
//    search-and-replace waiting to go wrong, and a wrong number on one of eleven buttons looks
//    exactly like a right one.
// 2. THE ASSET VERSION OUT OF STEP with the `?v=` in the markup. With no build there are no
//    content-addressed filenames, so this is the only cache invalidation there is: out of step, a
//    returning visitor gets old styles against new markup.
// 3. A PLACEHOLDER STILL IN PLACE. A tag container that is still `GTM-XXXXXXX` means the site
//    publishes without measurement — and that history cannot be reconstructed backwards, which is
//    why this fails the gate instead of warning in a console nobody reads.
//
// And two this repository cannot SEE, which are therefore attested rather than detected: whether
// anything RECEIVES the events, and whether anyone can FIND the site. A container wired to no
// destination and a site nobody registered both look exactly like a correct repository from in here.

import { reporter, read, walk, loadBrowserGlobal } from "./lib.mjs";
import { relative, join, basename } from "node:path";

const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
const ROOT = arg("--root", ".");

const r = reporter("check-config");
const config = await loadBrowserGlobal(join(ROOT, "config.js"), "SITE_CONFIG");

// Files that are allowed to carry identifiers: the module itself, and prose about the site.
const OWNS_IDENTIFIERS = new Set(["config.js"]);
const PROSE = new Set([".md", ".txt", ".xml"]);

// The placeholder scan below is line-based, so it must only ever read TEXT. Without this filter it
// splits binary files into "lines" and matches a sentinel inside compressed image data: on the first
// real adoption 6 of 53 findings — 11% of the day-one baseline — were byte coincidences inside three
// PNGs, each carrying a remediation nobody could act on. A check that fires on correct input teaches
// people to route around the gate (§20 — Toolchain, Code Quality and Dependency Management), and it spends the credibility of every true finding printed
// beside it.
const TEXT = new Set([...PROSE, ".html", ".js", ".css", ".json", ".webmanifest", ".svg", ".yml", ".yaml"]);

// Files this architecture serves that carry no extension at all. Each is text, and each can hold a
// placeholder that matters — a CNAME still reading `example.com` publishes the wrong domain.
const TEXT_NAMED = new Set(["CNAME", "_headers", "_redirects", ".nojekyll", "LICENSE"]);

const isText = (rel) => {
  const name = basename(rel);
  return TEXT.has("." + name.split(".").pop()) || TEXT_NAMED.has(name);
};

// ---------------------------------------------------------------- 1. stray identifiers
//
// Each pattern is a class of identifier the module owns. Deliberately narrow: a pattern that fires
// on correct input teaches people to route around the check, which is worse than not having it.
const PATTERNS = [
  { name: "messaging link", re: /wa\.me\/\d+/g },
  { name: "tag container id", re: /\bGTM-[A-Z0-9]{4,}\b/g },
  { name: "measurement id", re: /\bG-[A-Z0-9]{8,}\b/g },
  { name: "mailto address", re: /mailto:[^\s"'<>)]+/g },
  { name: "scheduling link", re: /https?:\/\/(?:calendly|cal)\.com\/[^\s"'<>)]+/g },
];

const files = await walk(ROOT);
let scanned = 0;

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (OWNS_IDENTIFIERS.has(rel)) continue;
  // Generated files derive from the module by construction; the coherence check owns them.
  if (rel === "llms.txt" || rel === "sitemap.xml" || rel === "robots.txt") continue;
  if (![".html", ".js", ".css"].includes("." + rel.split(".").pop())) continue;

  const text = await read(file);
  scanned++;

  // The `noscript` tag-container fallback is the one place a container id must appear literally,
  // because it is markup a browser with no scripting reads. Allowed, and only there.
  const lines = text.split("\n");
  for (const { name, re } of PATTERNS) {
    for (const [i, line] of lines.entries()) {
      if (line.includes("check-config: allow")) continue;
      const hits = line.match(re);
      if (!hits) continue;
      if (name === "tag container id" && /<noscript|googletagmanager\.com\/ns\.html/.test(line)) continue;
      r.fail(
        `${rel}:${i + 1} — ${name} written as a literal: ${hits[0]}`,
        "move the value into config.js and reference it by key (site.js builds the destination); " +
          "if this one occurrence is genuinely unavoidable, append the comment `check-config: allow` " +
          "on the same line with the reason",
      );
    }
  }
}

// ---------------------------------------------------------------- 2. asset version
const declared = config.assetVersion;
if (typeof declared !== "number") {
  r.fail("config.assetVersion is not a number", "set it to an integer and bump it on every asset change");
} else {
  const html = files.filter((f) => f.endsWith(".html"));
  for (const file of html) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    const text = await read(file);
    for (const m of text.matchAll(/(?:href|src)="\/?([^"?]+)\?v=(\d+)"/g)) {
      if (Number(m[2]) !== declared) {
        r.fail(
          `${rel} — ${basename(m[1])} is versioned ?v=${m[2]} but config.assetVersion is ${declared}`,
          `bump both together, or a returning visitor gets a cached ${basename(m[1])} against new markup`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------- 3. placeholders
// Each carries its own remediation. A lint's message is input to the next turn, not a report, so a
// generic one ("fill it in") wastes the only moment when saying the specific thing is free (§20 — Toolchain, Code Quality and Dependency Management).
const UNFILLED = [
  {
    re: /\bTBD\b/,
    what: "an unanswered TBD",
    fix: "answer it. If it is genuinely still open, it belongs in brief.md as a pending item with an owner — not in a file that ships",
  },
  {
    re: /GTM-XXXXXXX/,
    what: "the tag container placeholder",
    fix: "set config.tagContainerId. Publishing without measurement records no history, and measurement cannot be reconstructed backwards",
  },
  {
    re: /\bexample\.com\b/,
    what: "the placeholder domain",
    fix: "set config.canonicalOrigin and re-run build-derived.mjs, which rewrites every absolute URL from it",
  },
  {
    re: /\blorem ipsum\b/i,
    what: "placeholder copy",
    fix: "write the real copy: this text is what a search result and an assistant will quote",
  },
  {
    re: /\bhello@example\b/,
    what: "the placeholder mailbox",
    fix: "set config.contactMailbox to a mailbox somebody actually reads",
  },
];

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (rel.startsWith("scripts/") || rel === "README.md") continue;
  if (!isText(rel)) continue;
  // brief.md is where an unanswered question is SUPPOSED to live, marked as pending.
  if (rel === "brief.md") continue;

  const text = await read(file);
  // Line-based, and honouring the same escape hatch as the identifier scan above — one mechanism
  // rather than two. It matters here for a specific reason: the code that DETECTS an unconfigured
  // container has to name the placeholder to compare against it, and a check that cannot tell a
  // sentinel from the thing it detects fires on correct input.
  for (const [i, line] of text.split("\n").entries()) {
    if (line.includes("check-config: allow")) continue;
    for (const { re, what, fix } of UNFILLED) {
      if (!re.test(line)) continue;
      // A derived file inherits its placeholders from its source, so the remediation is the source.
      const derived = ["llms.txt", "robots.txt", "sitemap.xml"].includes(rel);
      r.fail(
        `${rel}:${i + 1} — still contains ${what}`,
        derived ? `${fix} (this file is derived — fix the source, not this)` : fix,
      );
    }
  }
}

// ---------------------------------------------------------------- 4. the receiver
if (!config.receiver || (!config.receiver.endpoint && (await hasForm(files)))) {
  r.fail(
    "a form exists but config.receiver.endpoint is null",
    "point it at a receiver that persists the record and notifies a named owner — or remove the " +
      "form, because a control that persists nothing is not a form",
  );
}
if (config.receiver && config.receiver.endpoint && config.receiver.originRestricted !== true) {
  r.fail(
    "config.receiver.endpoint is set but originRestricted is not true",
    "restrict the endpoint to the canonical origin in the provider's console, then set the flag — " +
      "an identifier delivered to the browser is public and is protected only at the provider",
  );
}

// ---------------------------------------------------------------- 5. the far side of publication
//
// Two controls this repository cannot observe: whether anything RECEIVES the events, and whether
// anyone can FIND the site. Both are satisfied today by a value being present, which is not the same
// claim at all — so both are attested here instead. An attestation is weaker than a check and far
// stronger than nothing: it fails closed, it names who is claiming what, and it turns "I thought
// that was set up" into a line in a diff (§26 — Static Conversion Sites).

const destination = String(config.measurementDestination || "").trim();
if (!destination) {
  r.fail(
    "config.measurementDestination is empty",
    "name the property that RECEIVES these events. The container only delivers them, and wired to " +
      "no destination it passes every check in this repository while recording nothing",
  );
}
if (config.eventsObserved !== true) {
  r.fail(
    "config.eventsObserved is not true",
    "open the destination's live view, trigger one conversion event, watch it arrive, then set the " +
      "flag. Instrumentation is a launch condition and a month with no events is always a month " +
      "with no events",
  );
}

const findable = config.discoverability;
if (!findable || typeof findable !== "object") {
  r.fail(
    "config.discoverability is missing",
    "decide whether this site is meant to be found, and record it: `indexed`, a reason and an " +
      "owner. Undeclared, an unregistered site and a deliberately unlisted one are the same bytes",
  );
} else {
  if (!String(findable.reason || "").trim()) {
    r.fail(
      "config.discoverability.reason is empty",
      "say why this site is, or is not, meant to be found — whoever revisits this will not have " +
        "the context, which is the same reason the consent decision records its trigger",
    );
  }
  if (!String(findable.owner || "").trim()) {
    r.fail(
      "config.discoverability.owner is empty",
      "name the person who owns the search property, or the decision not to have one. It joins " +
        "the ownership-and-exit record with the analytics property and the tag container",
    );
  }

  if (findable.indexed === false) {
    // The declaration has to be visible in the file a crawler actually reads. Left in config.js
    // alone it is a comment, and the whole point of writing it down is that the alternative — a
    // site nobody registered — serves exactly the same bytes.
    const robotsPath = files.find((f) => relative(ROOT, f).replace(/\\/g, "/") === "robots.txt");
    const robots = robotsPath ? await read(robotsPath) : "";
    if (!/User-agent:\s*\*\s*\r?\n\s*Disallow:\s*\//.test(robots)) {
      r.fail(
        "discoverability.indexed is false but robots.txt still invites crawling",
        "run `node scripts/build-derived.mjs`, which writes the decision — reason and owner " +
          "included — into robots.txt. A decision the served files contradict is not a decision",
      );
    }
  } else {
    if (!String(findable.searchProperty || "").trim()) {
      r.fail(
        "config.discoverability.searchProperty is empty",
        "name the verified property covering this domain. Without one nobody can see whether the " +
          "site is indexed, and a page that is published and then deleted cannot be removed",
      );
    }
    if (!String(findable.verifiedBy || "").trim()) {
      r.fail(
        "config.discoverability.verifiedBy is empty",
        "record how ownership was proven and who holds it. Verifying a domain is a human's " +
          "operation (§22 — Agent Execution and Governance); what belongs here is the record that it happened",
      );
    }
    if (findable.sitemapSubmitted !== true) {
      r.fail(
        "config.discoverability.sitemapSubmitted is not true",
        "submit sitemap.xml in that property, then set the flag. Generating the file is not " +
          "submitting it, and coverage history starts at verification — not retroactively",
      );
    }
  }
}

// ---------------------------------------------------------------- 6. where each control lives
//
// §26 (Static Conversion Sites)'s control-placement table, checked. The section states this about
// as strongly as it states
// anything — every control is placed at the edge, placed at the gate, or DECLARED ABSENT, and never
// left implied — and then left the declaration as prose, which means declaring a control absent and
// never having considered it produced byte-identical repositories. That is the failure the sentence
// describes, and the sentence was the only thing standing against it.
//
// The check is not about opinion. It cannot tell whether "absent" is the right answer for this site.
// It can tell that every row was ANSWERED, which is the whole property the rule was protecting.
const PLACEMENTS = new Set(["edge", "gate", "provider", "document", "absent"]);

const ROWS = {
  retiredUrlRedirects: "redirects from retired URLs",
  formSubmissionReceiver: "receiving form submissions",
  serverSideValidation: "server-side validation",
  rateLimiting: "rate limiting and abuse control",
  runtimeSecrets: "runtime secrets",
  requestLogs: "request logs",
  notFoundHandling: "not-found handling",
  securityHeaders: "security headers",
  environmentSeparation: "environment separation",
  credentialRotation: "credential rotation",
};

const controls = config.controls || {};

for (const [key, label] of Object.entries(ROWS)) {
  const row = controls[key];
  if (!row || typeof row !== "object") {
    r.fail(
      `config.controls.${key} is missing — ${label} is not declared anywhere`,
      'declare where it lives: "edge", "gate", "provider", "document" or "absent". A control that is never named and a control that was deliberately left out produce the same repository, which is the failure this table exists to prevent',
    );
    continue;
  }
  if (!PLACEMENTS.has(row.where)) {
    r.fail(
      `config.controls.${key}.where is ${JSON.stringify(row.where)} — ${label} has no answer yet`,
      'set it to "edge", "gate", "provider", "document" or "absent". Staying on a host that cannot do something is permitted; not recording what that puts out of reach is not',
    );
    continue;
  }
  // The reason is only load-bearing for "absent" — the other four say where to look, and this one
  // says what is not happening at all.
  if (row.where === "absent" && (!row.why || /\bTBD\b/.test(row.why) || String(row.why).trim().length < 20)) {
    r.fail(
      `config.controls.${key}.where is "absent" with no reason — ${label}`,
      "state why in terms of CAPABILITY, not intent: what the host, the receiver or the architecture cannot do. \"We did not get to it\" is not an answer this table accepts, because the next reader cannot tell it apart from a considered decision",
    );
  }
}

for (const key of Object.keys(controls)) {
  if (ROWS[key]) continue;
  r.fail(
    `config.controls.${key} is not a row of the table`,
    "remove it, or correct the spelling. A misspelled key declares nothing while looking exactly like a declaration, and the row it was meant to answer is still missing",
  );
}

// A FILE THAT DOES NOTHING IS WORSE THAN AN ABSENT ONE, because it reads as a control. `_headers` on
// a host that serves no custom headers, and `_redirects` on one that issues no redirect status, are
// both inert — and both look from the repository exactly like the control being in force.
const EDGE_FILES = [
  { file: "_headers", key: "securityHeaders", label: "security headers" },
  { file: "_redirects", key: "retiredUrlRedirects", label: "redirects from retired URLs" },
];

for (const { file, key, label } of EDGE_FILES) {
  const present = files.some((f) => relative(ROOT, f).replace(/\\/g, "/") === file);
  const where = controls[key]?.where;
  if (!PLACEMENTS.has(where)) continue; // already reported above; one finding per decision
  if (present && where !== "edge") {
    r.fail(
      `${file} is committed but config.controls.${key}.where is "${where}"`,
      `delete it, or move to a host that reads it and set the row to "edge". As it stands the file implies ${label} are in force and nothing serves them — which is the one thing this table exists to make impossible`,
    );
  }
  if (!present && where === "edge") {
    r.fail(
      `config.controls.${key}.where is "edge" but ${file} is not committed`,
      `add it. The row claims ${label} are served at the edge, and there is nothing here for the edge to read`,
    );
  }
}

async function hasForm(all) {
  for (const f of all.filter((x) => x.endsWith(".html"))) {
    if (/<form\b/.test(await read(f))) return true;
  }
  return false;
}

r.finish(`${scanned} files scanned`);

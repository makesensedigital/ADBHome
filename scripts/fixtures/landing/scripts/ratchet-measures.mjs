#!/usr/bin/env node
// The numeric half of the ratchet — Handbook §26 (Static Conversion Sites). Node stdlib only.
//
//   node scripts/ratchet-measures.mjs --init [--reports .lighthouseci]   record today's measurements
//   node scripts/ratchet-measures.mjs        [--reports .lighthouseci]   fail if any moved the wrong way
//   node scripts/ratchet-measures.mjs --update                           lower the record after a fix
//
// WHY A SECOND RATCHET RATHER THAN A FIELD IN THE FIRST
//
// `ratchet.mjs` counts findings. A count and a measurement are compared differently — a count of 3
// is a count of 3 on every run, and a largest-contentful-paint of 3100 ms is 2950 or 3300 depending
// on what the runner was doing — so they need different comparisons and different tolerances.
// Putting both in one file would mean one mechanism with two behaviours, and the wrong one applied
// by accident is exactly the sort of thing nobody notices in a passing build.
//
// WHAT THIS IS FOR
//
// The gate has eleven points and the count ratchet covers three. The rest are pass/fail against a
// bar an adopting site has never been measured against, and for most of them that is correct: the
// tracked-material scan is contract-sensitive and not ratchetable, and a derived file drifting from
// its source is one command to fix. The performance and accessibility floors are neither.
//
// A site adopting the standard measured, on its first real run: accessibility 0.94 against a floor
// of 0.95, best-practices 0.79 against 0.90, largest-contentful-paint over 2500 ms against 2500.
// There are exactly three things to do with that and the standard rules out two. Lowering the floor
// is forbidden in as many words — a loosened floor reads exactly like a considered one. Fixing it
// before adoption completes is the rewrite nobody funds, which is the failure the adoption skill
// exists to prevent. The third is to carry it, named, with the measured numbers recorded, and
// nothing existed to do that with.
//
// THE FLOOR STAYS THE PUBLISHED TARGET. This never edits `lighthouserc.json`, and the floors there
// are what a site is aiming at. What this adds is somewhere to put the truth in the meantime, and a
// gate that fails when the truth gets worse.
//
// TOLERANCE, AND WHY IT IS NOT ZERO
//
// A strict "must not move the wrong way" comparison on a timing metric produces a red gate from
// runner variance alone — which is the failure mode §20 (Toolchain, Code Quality and Dependency
// Management) warns about and the one that already cost this gate its accessibility CLI. So: the
// median across the run's repetitions, compared with a per-metric tolerance that is recorded in the
// baseline file where it can be read and argued with rather than hidden in this script.
//
// A metric ALREADY MEETING ITS FLOOR IS NOT RATCHETED — it is held to the floor, which is stricter.
// The ratchet only ever carries what the site has not reached yet, and a metric that improves past
// its floor leaves the ratchet on the next `--update` and never comes back to it.

import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
const ROOT = resolve(arg("--root", "."));
const REPORTS = resolve(arg("--reports", join(ROOT, ".lighthouseci")));
const BASELINE = join(ROOT, ".gate-measures.json");
const INIT = process.argv.includes("--init");
const UPDATE = process.argv.includes("--update");

// What is read, which way is better, the published floor, and how much movement is noise.
//
// The floors are copied from `lighthouserc.json` deliberately rather than parsed out of it: this
// file has to know when a metric has REACHED its floor and should leave the ratchet, and a silent
// disagreement between the two is worse than a visible duplicate. `--init` reports any drift.
const METRICS = [
  { key: "categories:performance",    label: "performance",             better: "higher", floor: 0.9,     tolerance: 0.02 },
  { key: "categories:accessibility",  label: "accessibility",           better: "higher", floor: 0.95,    tolerance: 0.02 },
  { key: "categories:best-practices", label: "best practices",          better: "higher", floor: 0.9,     tolerance: 0.02 },
  { key: "categories:seo",            label: "SEO",                     better: "higher", floor: 0.95,    tolerance: 0.02 },
  { key: "largest-contentful-paint",  label: "largest contentful paint (ms)", better: "lower", floor: 2500, tolerance: 0.10 },
  { key: "cumulative-layout-shift",   label: "cumulative layout shift", better: "lower",  floor: 0.1,     tolerance: 0.02 },
  { key: "total-byte-weight",         label: "total byte weight (bytes)", better: "lower", floor: 2097152, tolerance: 0.05 },
];

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Read every Lighthouse report the run produced and reduce it to one number per url and metric,
 * taking the MEDIAN across repetitions. Lighthouse is configured for three runs precisely because
 * one is not a measurement, and a mean lets a single bad run move the result.
 */
const collect = async () => {
  let names;
  try {
    names = await readdir(REPORTS);
  } catch {
    return null; // no run happened; the caller decides what that means
  }
  const reports = names.filter((n) => /^lhr-.*\.json$/.test(n));
  if (!reports.length) return null;

  const samples = new Map(); // `${url}|${metric}` -> number[]
  for (const name of reports) {
    const lhr = JSON.parse(await readFile(join(REPORTS, name), "utf8"));
    const url = new URL(lhr.finalDisplayedUrl || lhr.finalUrl || lhr.requestedUrl).pathname;
    for (const { key } of METRICS) {
      const value = key.startsWith("categories:")
        ? lhr.categories?.[key.slice("categories:".length)]?.score
        : lhr.audits?.[key]?.numericValue;
      if (typeof value !== "number" || Number.isNaN(value)) continue;
      const id = `${url}|${key}`;
      samples.set(id, [...(samples.get(id) ?? []), value]);
    }
  }

  const out = {};
  for (const [id, values] of samples) out[id] = median(values);
  return out;
};

const readBaseline = async () => {
  try {
    return JSON.parse(await readFile(BASELINE, "utf8"));
  } catch {
    return null;
  }
};

const write = async (recorded, note) => {
  const body = {
    "//": note,
    "//how":
      "Measured values a site has NOT yet reached the floor for. The floor in lighthouserc.json is the published target and is never edited to match this file. A value is compared against what is recorded here, within the tolerance beside it; a value that reaches its floor is held to the floor instead and leaves this file on the next --update.",
    recorded,
  };
  await writeFile(BASELINE, JSON.stringify(body, null, 2) + "\n", "utf8");
};

const spec = (key) => METRICS.find((m) => m.key === key);
const meetsFloor = (key, value) => {
  const m = spec(key);
  return m.better === "higher" ? value >= m.floor : value <= m.floor;
};
/** The worst value that is still acceptable against `was`, given the metric's tolerance. */
const limit = (key, was) => {
  const m = spec(key);
  const slack = m.tolerance < 1 && m.better === "lower" && m.floor > 1 ? was * m.tolerance : m.tolerance;
  return m.better === "higher" ? was - slack : was + slack;
};
const fmt = (key, v) => (spec(key).floor > 1 ? Math.round(v).toString() : v.toFixed(3));

// ---------------------------------------------------------------- run
const current = await collect();
const file = await readBaseline();
const baseline = file?.recorded ?? null;

if (!current) {
  process.stdout.write(
    `ratchet-measures: no Lighthouse reports under ${REPORTS} — nothing measured, nothing compared.\n` +
      "This step runs after the Lighthouse job in the same workflow; on its own it is a no-op.\n",
  );
  process.exit(0);
}

if (INIT) {
  if (baseline) {
    process.stdout.write(
      "ratchet-measures: a record already exists. Use --update after a fix; re-recording from\n" +
        "scratch would silently accept everything that got worse since.\n",
    );
    process.exitCode = 1;
  } else {
    // Only what has NOT reached its floor. Recording a value that already meets the floor would
    // replace a strict published target with a looser local one, which is the "never weaken a
    // threshold" rule defeated by the mechanism meant to respect it.
    const carry = {};
    for (const [id, value] of Object.entries(current)) {
      const key = id.split("|")[1];
      if (!meetsFloor(key, value)) carry[id] = value;
    }
    await write(
      carry,
      "Measurements this repository had not reached the floor for when it adopted the standard. The floors stay published in lighthouserc.json; these are carried, and the gate fails when one gets worse. Never raise an entry to make a run green.",
    );
    const held = Object.keys(current).length - Object.keys(carry).length;
    process.stdout.write(
      `ratchet-measures: recorded ${Object.keys(carry).length} measurement(s) below their floor; ` +
        `${held} already meet theirs and stay held to the floor.\n` +
        "Commit it. From here these can only improve, and the floors are unchanged.\n",
    );
  }
} else if (!baseline) {
  process.stdout.write(
    "ratchet-measures: no record — a site meeting its floors needs none, and the floors are the gate.\n" +
      "If this repository is adopting with measurements below the floors, run --init after a Lighthouse run.\n",
  );
} else {
  const worse = [];
  const better = [];

  for (const [id, value] of Object.entries(current)) {
    const [where, key] = id.split("|");
    const m = spec(key);
    const was = baseline[id];

    // Not carried: either it always met the floor, or it has since. Either way the floor governs and
    // Lighthouse's own assertion is what fails — this must not offer a second, looser opinion.
    if (was === undefined) continue;

    if (meetsFloor(key, value)) {
      better.push({ where, key, was, now: value, reachedFloor: true });
      continue;
    }
    const worstAllowed = limit(key, was);
    const regressed = m.better === "higher" ? value < worstAllowed : value > worstAllowed;
    if (regressed) worse.push({ where, key, was, now: value, worstAllowed });
    else if (m.better === "higher" ? value > was : value < was) better.push({ where, key, was, now: value });
  }

  for (const b of better) {
    const m = spec(b.key);
    process.stdout.write(
      `  ↑ ${b.where} ${m.label}: ${fmt(b.key, b.was)} → ${fmt(b.key, b.now)}` +
        (b.reachedFloor ? "  (reached the floor — --update drops it from the record)\n" : "\n"),
    );
  }
  if (better.length && !UPDATE) {
    process.stdout.write(
      "\nratchet-measures: something improved. Run `--update` and commit the record WITH the fix,\n" +
        "                  or the ratchet keeps the old headroom and the regression is free.\n",
    );
  }

  for (const w of worse) {
    const m = spec(w.key);
    process.stdout.write(
      `\nFAIL  ${w.where} ${m.label}: ${fmt(w.key, w.was)} → ${fmt(w.key, w.now)}\n` +
        `      fix: this is worse than what this repository recorded, by more than the tolerance\n` +
        `           (worst acceptable ${fmt(w.key, w.worstAllowed)}). The published floor is ${fmt(w.key, m.floor)} and is not\n` +
        `           the thing to change — never weaken a threshold to make a run green, because a\n` +
        `           loosened floor reads exactly like a considered one.\n` +
        `      rule: Handbook §26 (Static Conversion Sites) · skill adopt-an-existing-repository\n`,
    );
  }

  if (UPDATE && !worse.length) {
    const carry = {};
    for (const [id, value] of Object.entries(current)) {
      const key = id.split("|")[1];
      if (baseline[id] !== undefined && !meetsFloor(key, value)) carry[id] = value;
    }
    await write(carry, file["//"]);
    process.stdout.write(`\nratchet-measures: record lowered to ${Object.keys(carry).length} entries. Commit it with the fix.\n`);
  }

  process.stdout.write(
    `\nratchet-measures: ${Object.keys(current).length} measured · ${Object.keys(baseline).length} carried · ` +
      `${worse.length} worse · ${better.length} better\n`,
  );
  if (worse.length) process.exitCode = 1;
}

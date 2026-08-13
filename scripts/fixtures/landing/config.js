// The configuration module — Handbook §26.
//
// EVERY external identifier this site uses lives here and nowhere else: the messaging number, the
// canonical domain, container ids, form ids, scheduling URLs, the contact mailbox, the asset version.
// `scripts/check-config.mjs` fails the gate on a literal for any of them found anywhere else.
//
// The rule is not tidiness. An identifier repeated across a page is a search-and-replace waiting to
// go wrong, and the cost is paid in production: a wrong number on one of eleven buttons looks exactly
// like a right one.
//
// NOTHING HERE IS A SECRET. Everything in this file is delivered to the visitor's browser and is
// readable there. These are PUBLIC IDENTIFIERS, and they are protected at the provider — restricted
// by origin or domain in each provider's own console. An identifier that cannot be restricted that
// way does not belong in a static site at all (§26; §4 is sharpened here, not relaxed).
//
// Loaded before analytics.js, because the consent default has to execute before the tag container.

(function (root) {
  const CONFIG = {
    // -------------------------------------------------------------------- identity
    // The canonical origin, with protocol and no trailing slash. Absolute URLs in the head, the
    // sitemap and the structured data are all derived from this.
    canonicalOrigin: "https://example.com",

    // -------------------------------------------------------------------- contact
    // Messaging number in international format, digits only — no +, no spaces, no dashes.
    // A per-control message template lives in `messages` below, never inline in the markup.
    messagingNumber: "0000000000000",
    contactMailbox: "hello@example.com",

    // One template per conversion control. The key is the control's analytics label, so the visible
    // control, the event it emits and the text it composes cannot drift apart.
    // The composed text is the ENTIRE context the business receives (§26).
    messages: {
      hero_primary: "Hi — I found you through the site and I would like to know more.",
      pricing_enquiry: "Hi — I would like to ask about pricing.",
      footer_contact: "Hi — I would like to get in touch.",
    },

    // -------------------------------------------------------------------- measurement
    // Tag container id. Left as the placeholder below, the gate FAILS — it never degrades to a
    // console warning nobody reads (§26).
    tagContainerId: "GTM-XXXXXXX",

    // A CONTAINER IS NOT A MEASUREMENT. The container delivers events; something else has to
    // receive them, and nothing in this repository can see whether anything does. A container
    // wired to no destination passes every check here and records nothing — the exact failure the
    // launch condition exists to prevent, arriving by the one path a check cannot watch.
    //
    // So name the destination, and set `eventsObserved` only once an event has been SEEN arriving
    // there in that tool's live view. It is the same kind of attestation as
    // `receiver.originRestricted` below: a fact somebody checked, recorded where the gate can read
    // it (§26).
    measurementDestination: "TBD — the property that receives these events, by its identifier",
    eventsObserved: false,

    // -------------------------------------------------------------------- discoverability
    // INDEXABLE IS NOT INDEXED. Everything the gate checks is here — one h1, ordered headings,
    // conversion text in the served markup — and none of it says the site was ever found. That
    // evidence lives in a verified search property, which is also the only place a page that was
    // published and then deleted can be requested out of the index.
    //
    // `indexed: true` requires the property to exist BEFORE publication. Coverage history starts at
    // verification and, like measurement, cannot be reconstructed backwards.
    //
    // `indexed: false` is a legitimate answer — a page reached only from a paid link or a printed
    // code. It is a DECISION with an owner and a reason, and `build-derived.mjs` writes it into
    // robots.txt rather than leaving it here as a comment: an unregistered site and a deliberately
    // unlisted one are indistinguishable from inside this repository, which is the whole reason
    // this block exists (§26).
    discoverability: {
      indexed: true,
      reason: "TBD — why this site is, or is not, meant to be found",
      searchProperty: "TBD — the verified property, named by the domain it covers",
      verifiedBy: "TBD — how ownership was proven (a DNS record, a served file), and who holds it",
      owner: "TBD — a person, not a team",
      // True once the sitemap has been submitted in that property — the submission, not the file
      // being generated. Verifying the property is a domain operation, so it is a human's to do
      // (§22); what belongs here is the record that it was done.
      sitemapSubmitted: false,
    },

    // -------------------------------------------------------------------- consent
    // The recorded decision. §26 requires the jurisdiction, the owner, the date and — the
    // load-bearing half — THE CONDITION THAT WOULD CHANGE THE ANSWER, because whoever revisits
    // this will not have the context.
    //
    // `mode: "notice-only"` means: a privacy statement, no banner, measurement on by default.
    // `mode: "explicit"` means: default denied, banner, measurement only after a choice.
    //
    // NOTE THE LIMITATION, which is architectural and not a setting: a static site CANNOT produce
    // auditable PROOF of consent. The record lives in the visitor's browser — that is state, not
    // evidence. Where proof is required, an external receiver is needed (§26).
    consent: {
      mode: "notice-only",
      jurisdiction: "TBD — name the country or bloc whose law this answers",
      decidedBy: "TBD — a person, not a team",
      decidedOn: "TBD — YYYY-MM-DD",
      revisitWhen:
        "the client sells or advertises into a jurisdiction requiring prior consent, the site handles special-category data, or profiling for advertising is introduced",
      privacyUrl: "/privacy.html",
    },

    // -------------------------------------------------------------------- conversion receiver
    // Where a submitted form is PERSISTED. §26: every conversion path terminates in a system the
    // business controls, and the record is written BEFORE any handoff to an external channel.
    //
    // `endpoint: null` is a legitimate answer ONLY if the site presents no form. It does not mean
    // "hand off to messaging and hope" — a control with no receiver is not a form, and the copy
    // must not claim anything was sent.
    receiver: {
      endpoint: null, // e.g. "https://forms.example-provider.com/f/abc123"
      owner: "TBD — the person who answers a submission, by name",
      // Restricted at the provider to `canonicalOrigin`. Verified, not assumed.
      originRestricted: false,
    },

    // -------------------------------------------------------------------- where each control lives
    // §26's control-placement table, as a declaration the gate can read.
    //
    // WHY THIS IS A FIELD AND NOT A PARAGRAPH. The section states the requirement about as strongly
    // as it states anything — every control is placed at the edge, placed at the gate, or **declared
    // absent**, and never left implied — and then left the declaration as prose. Which means
    // DECLARING A CONTROL ABSENT AND NEVER HAVING CONSIDERED IT PRODUCE BYTE-IDENTICAL REPOSITORIES.
    // That is the exact failure the sentence describes, and the sentence was the only thing standing
    // against it. It is the same kind of record as `receiver.originRestricted` and `discoverability`
    // below: a decision somebody took, written where a check can read it.
    //
    // `where` is one of:
    //   "edge"      the host serves it            "document"  a published file does it
    //   "gate"      the delivery pipeline does    "provider"  a third party the business contracts
    //   "absent"    not in force here
    //
    // `why` is REQUIRED whenever `where` is "absent", and is stated in terms of CAPABILITY, not
    // intent — "the host serves no custom response headers" is an answer, "we did not get to it" is
    // not. Staying on a host that cannot do something is explicitly permitted; not recording what
    // that puts out of reach is not.
    //
    // Six of these ten have one right answer in this architecture and are filled in. The four left
    // open are the ones that depend on the host and the receiver you chose — which is the decision
    // §26 says to take before the first line of markup.
    controls: {
      // "edge" if your host issues real redirect statuses. If "absent", say so: a markup refresh is
      // not a redirect — it carries no authority signal and does not work for anything that is not
      // markup, so every indexed URL of the predecessor site is lost.
      retiredUrlRedirects: { where: "", why: "" },
      formSubmissionReceiver: {
        where: "provider",
        why: "the receiver named in `receiver.endpoint`, restricted to the canonical origin",
      },
      serverSideValidation: {
        where: "absent",
        why: "there is no server. Client validation is presentation; the receiver's validation is the only real one, and it is the receiver's to configure",
      },
      rateLimiting: {
        where: "provider",
        why: "the receiver's. The page cannot limit anything, and there is nowhere in this architecture to add it",
      },
      runtimeSecrets: {
        where: "absent",
        why: "everything delivered to the browser is readable. These are public identifiers restricted at the provider — an identifier that cannot be restricted that way disqualifies the architecture",
      },
      // "edge" if your host exposes access logs. If "absent", client-side telemetry is the only
      // source there is, and it is blind to anyone blocking script — which is the population most
      // likely to be worth knowing about.
      requestLogs: { where: "", why: "" },
      notFoundHandling: {
        where: "document",
        why: "404.html, served by the host, noindex, and out of the sitemap",
      },
      // "edge" if your host serves custom response headers. If "absent", name what that puts out of
      // reach and be specific: `frame-ancestors` is ignored in a meta element and `X-Frame-Options`
      // is header-only, so a host without headers has NO FRAMING PROTECTION AT ALL. That one has no
      // in-document equivalent, which is why it decides the host rather than following from it.
      securityHeaders: { where: "", why: "" },
      // "gate" if your pipeline builds per-change previews. If "absent", the default branch is
      // production and the gate inspects the source rather than the artifact that will be served.
      environmentSeparation: { where: "", why: "" },
      credentialRotation: {
        where: "provider",
        why: "each provider's own console. Any identifier delivered to the browser is public from the moment it ships, so rotation is the only control that means anything",
      },
    },

    // -------------------------------------------------------------------- third parties
    // Every origin this page is ALLOWED to contact on first render, before any interaction.
    // `scripts/check-third-parties.mjs` compares the markup against this list. Anything embedded
    // that is not here has to become a click-to-load placeholder (§26).
    allowedOriginsOnFirstRender: ["https://www.googletagmanager.com"],

    // -------------------------------------------------------------------- assets
    // No build means no content-addressed filenames, so cache invalidation is manual. Bump this on
    // any change to a style, script or image; `?v=` is appended from here and nowhere else.
    assetVersion: 1,
  };

  root.SITE_CONFIG = CONFIG;
})(typeof globalThis !== "undefined" ? globalThis : this);

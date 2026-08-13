// The configuration module — Handbook §26.
//
// EVERY external identifier this site uses belongs here and nowhere else: the messaging number,
// the canonical domain, container ids, form ids, scheduling URLs, the contact mailbox, the asset
// version. `scripts/check-config.mjs` fails the gate on a literal for any of them found elsewhere.
//
// NOTHING HERE IS A SECRET. Everything in this file is delivered to the visitor's browser and is
// readable there. These are PUBLIC IDENTIFIERS, protected at the provider — restricted by origin
// or domain in each provider's own console. An identifier that cannot be restricted that way does
// not belong in a static site at all (§26; §4 is sharpened here, not relaxed).
//
// ---------------------------------------------------------------------------------------------
// STATUS: ADOPTION, 2026-08-11. THIS FILE DECLARES REALITY — IT DOES NOT YET DRIVE THE PAGE.
//
// This repository adopted the standard on a site that was already in production. Step 1 of the
// `adopt-an-existing-repository` skill brings in the rules WITHOUT touching code, so `index.html`
// does not load this module yet and still carries every identifier as a literal. That is not an
// oversight and it is not hidden: the gate counts each occurrence and `.gate-baseline.json`
// carries them, so the count can only go down. See `docs/adoption.md`.
//
// The values below are therefore a RECORD of what the page currently does, written once so that
// the wiring, when it is funded, has a single source to point at. Every value here was read out
// of the published page — none of it was invented.
// ---------------------------------------------------------------------------------------------

(function (root) {
  const CONFIG = {
    // -------------------------------------------------------------------- identity
    // The canonical origin, with protocol and no trailing slash.
    canonicalOrigin: "https://adbseguros.com.ar",

    // -------------------------------------------------------------------- contact
    // Messaging number in international format, digits only. One number serves the whole network;
    // the per-office links compose the office name into the message rather than dialling a
    // different number.
    messagingNumber: "5491128800820",

    // The canonical public mailbox. DECIDED 2026-08-12 by Juan Torresel, closing open definition
    // #3 — and note which domain it is on: the site is adbseguros.com.ar and this matches it. The
    // three per-office addresses in the presence map are on adbseguros.com, a different domain,
    // and that split is now a known discrepancy rather than an open question.
    //
    // This is the address a data-rights request goes to, so it is load-bearing rather than
    // decorative: privacy.html names it, and a statement nobody can act on is not a statement.
    contactMailbox: "info@adbseguros.com.ar",

    // The registered entity behind the brand. Named here because privacy.html has to identify the
    // data controller, and an identifier that appears on a published page belongs in the module.
    legalName: "ADB Broker Sociedad de Productores Asesores de Seguros S.A.",
    taxId: "30-71906098-2",

    // One template per conversion control. The key is the control's label, so the visible control,
    // the event it emits and the text it composes cannot drift apart. The composed text is the
    // ENTIRE context the business receives (§26).
    //
    // READ THE FOUR MARKED `personal_data: true` TEMPLATES BEFORE EDITING ANY OF THEM. They ask a
    // stranger for a national identity number, a date of birth, a vehicle registration and
    // payroll figures. They asked for a smoking status too, until 2026-08-12 — see `vida`.
    // §26: the obligation to disclose what is collected does not change because the collection
    // moved into a chat. That obligation is met as of 2026-08-12 — privacy.html lists these
    // templates field by field and is linked from the footer (fix-now F1, closed). Adding a
    // field here without adding it there re-opens it.
    messages: {
      generic: "Hola ADB, quiero cotizar un seguro. ¿Me asesoran?",
      // personal_data: true
      auto:
        "Hola ADB, soy [tu nombre] y quiero cotizar mi Auto.\nMis datos:\n- DNI:\n- Patente:\n" +
        "- Año, marca y modelo:\n- Tiene GNC?:\n- Uso (particular/comercial):",
      // personal_data: true
      hogar:
        "Hola ADB, quiero cotizar mi Hogar. Te paso mis datos:\n- Nombre y apellido:\n- DNI:\n" +
        "- Direccion y codigo postal del inmueble:\n- Superficie aproximada:\n" +
        "- Tipo de vivienda (casa o departamento):\n- Uso (vivienda permanente o alquiler):",
      // personal_data: true. NO LONGER HEALTH-RELATED. This template asked "Sos fumador?"
      // until 2026-08-12; it was removed as the first half of fix-now F1. Preformatting a
      // health question is what made it OUR collection rather than something the producer
      // asks in the conversation, and it dragged the whole site into the strictest regime
      // for one field. Minimisation: a field exists only when the value cannot be inferred
      // from context and has a planned use.
      vida:
        "Hola ADB, quiero cotizar un Seguro de Vida. Te paso mis datos:\n- Nombre y apellido:\n" +
        "- CUIL:\n- Fecha de nacimiento:\n- Actividad laboral:\n- Email:",
      salud: "Hola ADB, quiero cotizar un seguro de Salud. ¿Me asesoran?",
      comercio: "Hola ADB, quiero cotizar un seguro de Comercio. ¿Me asesoran?",
      empresa: "Hola ADB, quiero cotizar seguros para mi Empresa o Pyme. ¿Me asesoran?",
      agro: "Hola ADB, quiero cotizar un seguro Agro. ¿Me asesoran?",
      // personal_data: true
      art:
        "Hola ADB, quiero cotizar ART para mi empresa. Te paso mis datos:\n- Razon social:\n" +
        "- CUIT:\n- Actividad principal:\n- Cantidad de empleados:\n" +
        "- Masa salarial aproximada mensual:\n- Direccion del establecimiento:",
      // Composed at runtime with the office name appended.
      oficina: "Hola ADB, quiero comunicarme con la oficina de {office}. ¿Me asesoran?",
    },

    // -------------------------------------------------------------------- measurement
    // DECIDED 2026-08-13 by Juan Torresel. From 2026-07-20 until that date this site was published
    // with no measurement of any kind, and those three and a half weeks have no data and never
    // will — measurement is the one artifact in this standard that cannot be reconstructed
    // backwards. What this closes is that the gap stops growing, not the gap.
    //
    // A CONTAINER, WHICH IS WHAT THIS FIELD WAS ALWAYS FOR. Everything is dispatched from it:
    // Google Analytics 4 and Microsoft Clarity have no snippet of their own in the markup.
    //
    // THE COST, STATED RATHER THAN DISCOVERED LATER: a container is a surface this repository's
    // gate cannot see. A tag added in the Tag Manager UI reaches every visitor with no commit, no
    // diff, no review and no gate run — the one thing on this domain that executes without passing
    // through a pull request. Whoever holds container access holds publish rights here. That is
    // debt D10, and it is the price of the convenience rather than an argument against it.
    tagContainerId: "GTM-M67M4S9B",

    // -------------------------------------------------------------------- analytics
    // THE EVENT CONTRACT. §26 asks that it be written BEFORE the code that emits it.
    //
    // WHAT IS DIFFERENT FROM EVERY OTHER BLOCK IN THIS FILE: the contract is not enforced here.
    // These identifiers describe what the container was configured to fire on 2026-08-13; the
    // container can be changed tomorrow by somebody who never opens this repository, and this
    // block would not know. It is a record of intent, not a source of truth. Verify against the
    // Tag Manager UI before trusting it.
    analytics: {
      vendor: "Google Tag Manager",
      // Fired from the container. Neither appears in the markup.
      measurementId: "G-BCLCT06GR7",      // Google Analytics 4
      sessionRecordingId: "y1pc2ezdsk",   // Microsoft Clarity
      // NO explicit event of this site's own. Autocapture — GA4 enhanced measurement — covers page
      // views, scroll and outbound clicks, which is the whole of what a brochure site does. A
      // taxonomy invented up front is the one nobody ends up maintaining.
      explicitEvents: [],
      // SESSION RECORDING IS ON. Clarity replays the screen and builds heatmaps. This is a reversal
      // of the decision taken earlier the same day and it is deliberate — see `consent` below,
      // and privacy.html §2, which had to be rewritten before the tag was allowed to load.
      sessionRecording: true,
      // WHAT THIS SITE CANNOT MEASURE, stated rather than left implied: every conversion ends in
      // WhatsApp, off this domain. The site observes THE DEPARTURE and nothing after it. That is
      // why a WhatsApp click is an INTENT and never a primary conversion, and why nobody can tell
      // from here whether that enquiry was ever answered.
      conversionsAreObservable: false,
    },

    // -------------------------------------------------------------------- consent
    // §26 requires the jurisdiction, the owner, the date and — the load-bearing half — THE
    // CONDITION THAT WOULD CHANGE THE ANSWER, because whoever revisits this will not have the
    // context.
    //
    // `mode: "notice-only"` describes what the page implements today: no banner, no choice
    // offered. It is a description, not yet a decision — nobody has taken one, which is why the
    // owner and the date are open. Open definition #2.
    //
    // ARCHITECTURAL LIMITATION, stated rather than mitigated: a static site CANNOT produce
    // auditable proof of consent. The record would live in the visitor's browser, and that is
    // state, not evidence. Where proof is required, an external receiver is needed (§26).
    consent: {
      mode: "notice-only",
      jurisdiction: "Argentina",
      decidedBy: "Juan Torresel",
      decidedOn: "2026-08-13",
      // WHAT WAS DECIDED, precisely: Google Analytics 4 and Microsoft Clarity through a tag
      // container, WITH session recording and heatmaps, WITH first-party cookies, and WITHOUT a
      // banner. The policy states what is collected and who receives it; no prior choice is offered.
      //
      // THIS REVERSES A DECISION TAKEN THE SAME DAY, and the reversal is the record rather than an
      // embarrassment. The earlier decision was analytics without session recording, on the reasoning
      // that privacy.html could not carry a recorded session. The answer was not to keep the tag out
      // but to make the document true first: §2 was rewritten to declare the recording, the heatmaps
      // and the cookies BEFORE the container was allowed to load. That ordering is the whole of it.
      //
      // WHAT CHANGED MATERIALLY, and it is more than the earlier decision contemplated: this site
      // now sets FIRST-PARTY COOKIES, which it never did before, and a third party REPLAYS THE
      // SCREEN of a visitor to a licensed insurance broker. Both are larger than product analytics.
      //
      // WHAT THIS LINE IS NOT: a legal opinion. Whether notice-without-consent is adequate for
      // cookies and session recording under Ley 25.326 belongs to the person named above, not to
      // the gate and not to whoever wrote the code. It is RECORDED, not validated, and the case for
      // confirming it with counsel is stronger than it was this morning: the controller is
      // SSN-licensed, the policy names the AAIP as supervisory body, and session recording is the
      // processing most likely to be read as requiring a choice rather than a notice.
      //
      // ARCHITECTURAL LIMITATION, unchanged and now expensive: this site CANNOT produce auditable
      // proof of consent. The day a choice is offered, it needs an external receiver.
      revisitWhen:
        "any advertising, remarketing or audience-sharing tag is added to the container — " +
        "Google Signals counts — a conversion control begins collecting health or other " +
        "special-category data through a form rather than through messaging, Clarity masking is " +
        "loosened below its default, or ADB advertises into a jurisdiction requiring prior consent",
      // Shipped 2026-08-12, closing fix-now F1. §26 requires a privacy statement in every case,
      // regardless of what was decided about tracking, and it was required here twice over
      // because the messaging templates above solicit personal data. It is linked from the
      // footer of index.html, which is the half of the rule that says REACHABLE.
      privacyUrl: "/privacy.html",
    },

    // -------------------------------------------------------------------- conversion receiver
    // `endpoint: null` is the correct answer here and not a gap: the site presents NO form, which
    // is exactly what §26 prescribes when nothing persists what a control collects. Every
    // conversion path is a messaging handoff.
    //
    // What is missing is the other half of the same rule — a named person who answers one. Open
    // definition #4.
    receiver: {
      endpoint: null,
      owner: "TBD — the person who answers an enquiry, by name",
      originRestricted: false,
    },

    // -------------------------------------------------------------------- third parties
    // Every origin this page is ALLOWED to contact on first render, before any interaction.
    //
    // ONE ENTRY, AND THE ABSENCE OF THE OTHER TWO IS DELIBERATE.
    //
    // googletagmanager.com is here because on 2026-08-13 somebody decided it should be: it serves
    // the container, the decision has a name and a date, and the privacy statement declares it.
    // That is what check-assets asks for — "add it to the allowlist if that is a deliberate
    // decision".
    //
    // unpkg.com and basemaps.cartocdn.com are NOT here, and that is not an oversight. Nobody ever
    // decided the map library should come from a third-party CDN; it just ended up that way.
    // Adding them so the gate reads clean would turn a finding into a silence, which is the move
    // that starts a gate lying. They stay visible and in the baseline until the owner chooses
    // between self-hosting the library and a click-to-load placeholder. Debt D4 — the measurement
    // decision does NOT close it.
    //
    // WHAT THIS LIST CANNOT SEE, and it is now most of the surface: google-analytics.com and
    // clarity.ms. The container injects them with createElement at runtime, and check-assets only
    // reads markup attributes. Only the noscript iframe below is visible to it. So this allowlist
    // covers ONE of the three Google/Microsoft origins this page actually contacts, and
    // privacy.html §5 is the only artifact that records all of them. Reported upstream as issue
    // #65 — filed the same day, about exactly this hole.
    allowedOriginsOnFirstRender: ["https://www.googletagmanager.com"],

    // -------------------------------------------------------------------- assets
    // No build means no content-addressed filenames, so cache invalidation is manual. Nothing is
    // versioned with `?v=` yet, because every style and script is inline in `index.html` and the
    // only external assets are images the markup references by bare path. This value starts at 1
    // and becomes load-bearing the moment a stylesheet or script is extracted — which is debt #2.
    assetVersion: 1,

    // -------------------------------------------------------------------- where each control lives
    //
    // §26 requires that every control be placed at the edge, placed at the gate, or DECLARED
    // ABSENT, and says a control is never left implied. It gives the table and it gives the
    // reason — "a row left unread is a control that silently does not exist" — and then leaves
    // the declaration itself as prose, with no artifact and no check. That is the one Mandatory
    // rule in the section whose carrier is a chapter rather than a file, which is the thing §26
    // argues against everywhere else.
    //
    // So this is the table, answered. It is the only place on this site where "absent" is a
    // statement rather than a silence, and it is the reason open definition #6 could be closed
    // by deciding rather than by not noticing: §26 permits a host that puts controls out of
    // reach — "choose against capability, record the choice, and record what the choice puts out
    // of reach" — and this is that record.
    //
    // NOTHING CHECKS THIS BLOCK. Adding a check would trigger §26's rule that a check which has
    // never failed on purpose is not known to work, and the harness for that is recorded as
    // inapplicable here (docs/adoption.md, N4). Proposed upstream instead, where the check and
    // its fixtures belong.
    //
    // Each row: where the control lives, and — when it is absent — why, in terms of capability
    // rather than of intent. "We did not get to it" is not an answer this table accepts.
    controls: {
      redirectsFromRetiredUrls: {
        where: "absent",
        why:
          "The host issues no redirect this repository can author. It issues exactly one of its " +
          "own — http to https, when enforced — and nothing else, so a retired URL cannot be " +
          "honoured. No predecessor URL is known to be retired, so nothing is broken by this " +
          "today; the capability is missing rather than unused. Closed open definition #6.",
      },
      formSubmissions: {
        where: "absent",
        why: "The site presents no form. §26 prescribes exactly this where nothing persists a submission.",
      },
      serverSideValidation: {
        where: "absent",
        why: "Nothing is submitted to us. There is no input to validate.",
      },
      rateLimiting: {
        where: "third-party",
        why: "The messaging platform's. A static page cannot limit anything.",
      },
      runtimeSecrets: {
        where: "absent",
        why: "None exist. Every identifier here is public by construction and restricted at its provider.",
      },
      requestLogs: {
        where: "absent",
        why:
          "The host still exposes no access logs to us, and that has not changed. WHAT CHANGED " +
          "ON 2026-08-13: it is no longer true that there is no traffic record of any kind. " +
          "There is client-side telemetry — a tag container, open definition #1, closed — so the " +
          "record exists, lives at a third party rather than in a log we can read, and contains " +
          "only what the browser managed to send. A visitor with a blocker never appears. The " +
          "row stays 'absent' because it describes SERVER LOGS, which genuinely do not exist; " +
          "what was lost is the stronger sentence that used to accompany it.",
      },
      notFoundHandling: {
        where: "published document",
        why: "404.html, shipped 2026-08-12. Declares noindex and stays out of the sitemap.",
      },
      securityHeaders: {
        where: "absent",
        why:
          "The host serves no custom response headers. No content security policy, no permissions " +
          "policy, and — the one with no in-document equivalent — no framing protection at all: " +
          "frame-ancestors is ignored in a meta element and X-Frame-Options is header-only. " +
          "Open definition #6, accepted with the consequence named.",
      },
      transportSecurity: {
        // Split out from securityHeaders on 2026-08-12, because lumping them together was hiding
        // a live defect behind a true statement. "The host serves no custom headers" is correct
        // and it made transport look equally out of reach. It was not: this host offers exactly
        // one transport control, it is a toggle, and it was off. It was turned on the same day.
        where: "edge",
        why:
          "HTTPS is enforced as of 2026-08-12 (fix-now F2, closed). Verified rather than assumed: " +
          "http answers 301 to https, on the root and on deep paths, preserving the path. " +
          "WHAT REMAINS ABSENT AND CANNOT BE FIXED HERE: no HSTS header, because this host sends " +
          "none and a static document cannot. So the FIRST request of a session can still be made " +
          "in plaintext and intercepted before the redirect answers. That residual belongs to the " +
          "hosting decision (closed open definition #6), not to a task list.",
      },
      canonicalHostname: {
        where: "absent",
        why:
          "www.adbseguros.com.ar is a CNAME to the apex, so it reaches this host with a name " +
          "the certificate does not cover and answers with a TLS error. Diagnosed 2026-08-12: the " +
          "host only provisions a certificate for www when that record is a CNAME to the pages " +
          "host itself, not to the apex. Note http://www DOES redirect correctly to the apex, so " +
          "this only bites over https — which is the direction browsers increasingly try FIRST, " +
          "so it gets worse rather than better. Fix-now F3, open. It is a DNS action and §26 puts " +
          "that on the ask-before-acting list: prepared and handed over, never done here.",
      },
      environmentSeparation: {
        where: "absent",
        why:
          "No per-change previews. The default branch is production, and the push is the deploy. " +
          "Open definition #5.",
      },
      credentialRotation: {
        where: "provider",
        why: "The messaging number is public from the moment it ships; rotation is a business decision, not a technical one.",
      },
    },
  };

  root.SITE_CONFIG = CONFIG;
})(typeof globalThis !== "undefined" ? globalThis : this);

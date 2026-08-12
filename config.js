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
    // THE PLACEHOLDER BELOW IS THE TRUTH, NOT AN UNFINISHED EDIT. This site has been published
    // since 2026-07-20 with no measurement of any kind: no container, no analytics, no events.
    // The gate fails on this line on purpose — §26 makes instrumentation a launch condition
    // precisely because measurement cannot be reconstructed backwards, and a site that quietly
    // reported `null` here would look like a site that decided it did not need any.
    //
    // The three weeks already published are gone and no decision recovers them. What is still
    // open is only whether measurement starts now — open definition #1.
    tagContainerId: "GTM-XXXXXXX",

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
      decidedBy: "TBD — a person, not a team",
      decidedOn: "TBD — YYYY-MM-DD",
      revisitWhen:
        "the site introduces any tracking or advertising tag, a conversion control begins " +
        "collecting health or other special-category data through a form rather than through " +
        "messaging, or ADB advertises into a jurisdiction requiring prior consent",
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
    // DELIBERATELY EMPTY. The page fetches the map library from a public CDN on first render and
    // then fetches map tiles from a second origin, so both reach a third party with the visitor's
    // address before any choice is offered. Listing them here would record a decision nobody has
    // taken and would turn a finding into a silence — the one move the adoption skill names as
    // the way a gate starts lying. The finding stays visible and is carried in the baseline until
    // the owner decides between self-hosting the library and a click-to-load placeholder.
    // Debt #4.
    allowedOriginsOnFirstRender: [],

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
          "The host exposes no access logs to us, and there is no client-side telemetry either " +
          "(open definition #1). So there is no traffic record of any kind — which is a stronger " +
          "statement than 'we have no analytics' and is the one worth writing down.",
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
        // and it made transport look equally out of reach. It is not: this host offers exactly
        // one transport control, it is a toggle, and it was off.
        where: "absent",
        why:
          "HTTPS is NOT enforced: http://adbseguros.com.ar/ answers 200 in plaintext rather than " +
          "redirecting, and no HSTS header is sent. The certificate is provisioned and approved, " +
          "so this is a setting rather than a capability — see fix-now F2. Until it is on, the " +
          "conversion path is rewritable in transit by anyone between the visitor and the host, " +
          "and the conversion path here is a set of links.",
      },
      canonicalHostname: {
        where: "absent",
        why:
          "www.adbseguros.com.ar resolves to this host's addresses, but the certificate covers " +
          "the apex only, so that name answers with a certificate error rather than the site. A " +
          "DNS record naming a resource that does not answer for it is the shape §26 singles out " +
          "on client work — see fix-now F3. Changing it is a DNS action and belongs to a human.",
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

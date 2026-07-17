import type { SiteContent } from "../types";

// German (de) — mirrors the English source keys.
export const de: SiteContent = {
  meta: {
    umbrellaTitle: "Covaga — Offenes Toolkit für EPLAN-Ingenieure",
    umbrellaDescription:
      "Drei offene Werkzeuge für EPLAN-Elektroingenieure: EPLAN mit KI steuern (eplan-rag-mcp), Projekte in jedem Browser öffnen (ecad-view) und seine Events an die Werkzeuge Ihres Büros leiten (Covaga Hub). Auf Cloudflare gebaut.",
    homeTitle: "Covaga Hub — Leiten Sie Ihre EPLAN-Exporte überallhin",
    homeDescription:
      "Covaga Hub lauscht auf Ihre EPLAN-Exporte — PDF, BOM, Projektabschluss — und liefert sie an Teams, SharePoint, Drive oder E-Mail. Zugangsdaten bleiben serverseitig; der Client bleibt Open Source.",
    privacyTitle: "Covaga — Datenschutz",
    privacyDescription:
      "Wie Covaga Daten über seine Website und die gehosteten Dienste verarbeitet.",
    termsTitle: "Covaga — Nutzungsbedingungen",
    termsDescription:
      "Die Bedingungen für die Nutzung des gehosteten Dienstes Covaga Hub und der Open-Source-Werkzeuge von Covaga.",
  },
  umbrella: {
    nav: {
      tools: "tools",
      open: "open source",
      getHub: "Hub holen",
    },
    hero: {
      eyebrow: "offenes toolkit für eplan",
      heading: "Mehr aus Ihren EPLAN-Projekten machen",
      leadHtml:
        'Drei offene Werkzeuge für Elektroingenieure — steuern Sie <strong class="font-semibold text-[var(--color-ink)]">EPLAN</strong> mit KI, öffnen Sie Projekte in jedem Browser und leiten Sie seine Events an die Werkzeuge, die Ihr Büro bereits nutzt. Kostenlos starten, selbst hostbar.',
      ctaPrimary: "Toolkit erkunden",
      ctaSecondary: "Kostenlos starten",
      specChips: [
        { label: "stack", value: "cloudflare" },
        { label: "core", value: "open source" },
        { label: "i18n", value: "7 locales" },
      ],
      schemaTitle: "Schaltbild des Covaga-Toolkits",
      schemaDesc:
        "Ein Verdrahtungsschaltbild: Eine EPLAN-P8-Quellklemme links speist das covaga-Busmodul in der Mitte, das nach rechts zu drei Werkzeugklemmen auffächert — rag-mcp, ecad-view und hub.",
      figCaption: "Abb. 01 — Toolkit-Schaltbild",
      figFlow: "eplan → covaga → tools",
    },
    tools: {
      eyebrow: "tools · 03",
      heading: "Ein Toolkit, drei Module.",
      lead: "Jedes Werkzeug schließt eine echte EPLAN-Lücke und läuft für sich — wählen Sie eines aus oder verdrahten Sie alle drei. Zwei sind Open Source zum Selbst-Hosten; die Plattform wird für Sie gehostet.",
      statusOssLabel: "open source",
      statusHostedLabel: "open core · gehostet",
      items: [
        {
          ref: "U1 · MCP",
          name: "eplan-rag-mcp",
          what: "EPLAN mit KI steuern.",
          body: "Ein lokaler MCP-Server, der 149 EPLAN-Aktionen still im QuietMode ausführt, dazu RAG-Dokumentation für P8 und EEC Pro 2026 sowie ein Claude-Code-Skill, das korrekte EPLAN-Skripte schreibt.",
          chips: [
            { label: "tools", value: "156" },
            { label: "rag", value: "p8 + eec" },
            { label: "runtime", value: "local" },
          ],
          status: "open source",
          statusKind: "oss",
          links: [
            { label: "GitHub ↗", href: "https://github.com/covagashi/eplan-rag-mcp" },
          ],
          primary: false,
        },
        {
          ref: "U2 · VIEWER",
          name: "ecad-view",
          what: "Projekte im Browser öffnen.",
          body: "Legen Sie einen .epdz-Export oder ein .e3d-Bauteil ab und lesen Sie es in jedem Browser — 3D-Modelle, Schaltplanseiten, Gerätesuche und Querverweise. Offline-PWA; Dateien verlassen nie das Gerät.",
          chips: [
            { label: "fmt", value: ".epdz / .e3d" },
            { label: "3d", value: "three.js" },
            { label: "runs", value: "client-side" },
          ],
          status: "open source",
          statusKind: "oss",
          links: [
            { label: "GitHub ↗", href: "https://github.com/covagashi/ecad-view" },
            { label: "view.covaga.dev", href: "https://view.covaga.dev" },
          ],
          primary: false,
        },
        {
          ref: "U3 · PLATFORM",
          name: "Covaga Hub",
          what: "Events leiten · Datenlücken schließen.",
          body: "Die gehostete Plattform. Leiten Sie EPLAN-Events — PDF, BOM, Projektabschluss — an Teams, SharePoint, Drive oder E-Mail und schließen Sie Textlücken der Artikeldatenbank durch geprüfte KI-Vorschläge. Zugangsdaten bleiben serverseitig.",
          chips: [
            { label: "mode", value: "hosted" },
            { label: "tenancy", value: "multi" },
            { label: "gym", value: "mcp" },
          ],
          status: "open core · gehostet",
          statusKind: "hosted",
          links: [{ label: "hub.covaga.dev", href: "/hub" }],
          primary: true,
        },
      ],
    },
    principles: {
      eyebrow: "wie covaga gebaut ist",
      heading: "Regeln aus dem Ingenieurbüro.",
      items: [
        {
          title: "Offen als Standard",
          body: "Die lokalen Werkzeuge sind Open Source und kostenlos im Betrieb — lesen Sie jede Zeile, bevor Sie installieren, prüfen Sie sie mit Ihrem IT-Team, hosten Sie überall selbst.",
        },
        {
          title: "Dort, wo Ihr Team arbeitet",
          body: "Kein neues Werkzeug zu erlernen. Covaga spricht EPLAN und den M365-Stack, den Ihr Büro bereits nutzt; Ingenieure exportieren genau so weiter wie heute.",
        },
        {
          title: "Ihre Daten bleiben Ihre",
          body: "Projekte werden auf Ihrem Gerät gerendert; echte Artikeldaten liegen in Ihrer eigenen Datenbank, nie in einem Repo. Der gehostete Worker hält Zugangsdaten, keine Dateien.",
        },
      ],
    },
    cta: {
      eyebrow: "loslegen",
      heading: "Starten Sie mit einem Werkzeug. Verdrahten Sie den Rest, wenn Sie bereit sind.",
      primary: "Auf die Warteliste",
      secondary: "Repos durchstöbern",
    },
    footer: {
      tagline:
        "Ein offenes Toolkit für EPLAN-Elektroingenieure, auf Cloudflare gebaut. Steuern Sie EPLAN mit KI, öffnen Sie Projekte überall, leiten Sie Events an die Werkzeuge, die Sie bereits nutzen.",
      net: "Teil von covaga.xyz",
      toolsLabel: "tools",
      codeLabel: "code",
      projectLabel: "projekt",
      localesLabel: "In sieben Sprachen verfügbar",
    },
  },
  a11y: {
    skipToContent: "Zum Inhalt springen",
    primaryNav: "Primär",
    sectionsNav: "Abschnitte",
    legalNav: "Rechtliches",
    toggleMenu: "Menü umschalten",
    languageLabel: "Sprache",
  },
  banner: {
    message: "Diese Website ist auf Deutsch verfügbar.",
    view: "Auf Deutsch ansehen",
    dismiss: "Nicht jetzt",
  },
  nav: {
    how: "so",
    events: "events",
    pricing: "preise",
    faq: "faq",
    getStarted: "Auf die Warteliste",
  },
  hero: {
    eyebrowTo: "zugestellt",
    headingPre: "CAD-Events, geroutet",
    leadHtml:
      'Covaga Hub lauscht auf Ihre <strong class="font-semibold text-[var(--color-ink)]">ECAD</strong>-Exporte und liefert sie an Teams, SharePoint, Drive oder E-Mail — Zugangsdaten bleiben serverseitig.',
    ctaPrimary: "Auf die Warteliste",
    ctaSecondary: "So funktioniert's",
    schemaTitle: "Schaltbild des Event-Routings",
    schemaDesc:
      "Verdrahtungsschaltbild: Drei ECAD-Event-Klemmen links werden über das Covaga-Hub-Modul zu den SharePoint-, Teams-, Drive- und Email-Klemmen rechts geführt.",
    figCaption: "Abb. 01 — Schaltbild des Event-Routings",
  },
  problem: {
    eyebrow: "der wandel",
    heading: "Integrationen ohne das Integrationsprojekt.",
    todayLabel: "// heute",
    withLabel: "// mit Covaga Hub",
    today: [
      {
        title: "Einmalige lokale Makros",
        body: "Individuelle Export-Skripte, in Auftrag gegeben für je 200€ bis 2.400€, die auf einer einzigen Workstation liegen. Die Wartung bleibt für immer an Ihnen hängen, und sie brechen, sobald ein Kollege den Rechner wechselt.",
      },
      {
        title: "Schwergewichtige PLM-/ERP-Konnektoren",
        body: "Enterprise-Middleware, die teuer zu lizenzieren und langsam auszurollen ist — weit mehr, als ein kleines Elektroteam braucht, um eine Zeichnung in SharePoint abzulegen.",
      },
      {
        title: "Zugangsdaten auf dem CAD-PC",
        body: "OAuth-Tokens und API-Schlüssel liegen in lokalen Konfigurationsdateien und veralten, sobald der Anbieter oder ein Webhook-Secret rotiert.",
      },
    ],
    solution: [
      {
        title: "Konfigurierte Routen statt Code",
        body: "Richten Sie ein ECAD-Event auf ein Ziel — fertig. Machen Sie in wenigen Minuten aus einem PDF-Export eine Teams-Meldung oder einen SharePoint-Upload.",
      },
      {
        title: "Zugangsdaten serverseitig verwahrt",
        body: "OAuth-Tokens liegen verschlüsselt im gehosteten Router. Der Open-Source-Client auf Ihrem PC sendet nur Event-Daten — niemals Geheimnisse.",
      },
      {
        title: "Für Sie aktuell gehalten",
        body: "Wenn ein Anbieter seine API ändert, wird der gehostete Worker zentral aktualisiert. Auf Ihren Engineering-Rechnern muss nichts neu ausgerollt werden.",
      },
    ],
  },
  how: {
    eyebrow: "so funktioniert's",
    heading: "Drei Schritte, vom CAD-Event bis zur Zustellung.",
    steps: [
      {
        title: "Ein ECAD-Event wird ausgelöst",
        body: "Ein PDF-Export, ein BOM-Export oder ein Projektabschluss passiert während der normalen Arbeit in Ihrem ECAD-Werkzeug — niemand ändert seine Art zu zeichnen.",
      },
      {
        title: "Der Open-Source-Client sendet JSON per POST",
        body: "Ein schlanker Client, der neben Ihrem CAD läuft, sendet eine kleine JSON-Nutzlast an Ihre private Tenant-URL. Keine Geheimnisse verlassen den PC.",
      },
      {
        title: "Der Router stellt es zu",
        body: "Der gehostete Worker transformiert das Event und liefert es an Ihr Ziel: Teams, SharePoint, Google Drive, E-Mail oder einen beliebigen HTTP-Endpunkt.",
      },
    ],
  },
  events: {
    eyebrow: "events · src",
    heading: "Was Ihr ECAD auslösen kann.",
    lead: "Jedes Event ist einer echten EPLAN-API-Aktion zugeordnet — auch denen, die die meisten Integrationen nie anfassen.",
    liveLabel: "live",
    soonLabel: "demnächst",
    items: [
      {
        id: "pdf-exported",
        title: "PDF exportiert",
        body: "Wird ausgelöst, wenn ein Schaltplan- oder Dokumentations-PDF aus einem Projekt exportiert wird.",
        action: "action export · PDF",
        soon: false,
      },
      {
        id: "bom-exported",
        title: "BOM / Stückliste exportiert",
        body: "Wird ausgelöst, wenn eine Stückliste, Teileliste oder Klemmenbeschriftung exportiert wird.",
        action: "action label",
        soon: false,
      },
      {
        id: "dxf-dwg-exported",
        title: "DXF / DWG exportiert",
        body: "Wird ausgelöst, wenn Seiten oder das Projekt für die Mechanik oder die Kundenübergabe nach DXF oder DWG exportiert werden.",
        action: "action export · DXF/DWG",
        soon: true,
      },
      {
        id: "project-backed-up",
        title: "Projekt gesichert",
        body: "Wird ausgelöst, wenn eine Projektsicherung (.zw1) erstellt wird — bereit für die externe Archivierung.",
        action: "action backup",
        soon: true,
      },
      {
        id: "wiring-exported",
        title: "Fertigungsverdrahtung exportiert",
        body: "Wird ausgelöst, wenn Fertigungsverdrahtungsdaten für den Maschinenbau exportiert werden.",
        action: "action ExportProductionWiring",
        soon: true,
      },
      {
        id: "project-closed",
        title: "Projekt geschlossen",
        body: "Wird ausgelöst, wenn ein Projekt geschlossen wird — nützlich für Freigabe- und Archivierungsabläufe.",
        action: "event lifecycle",
        soon: true,
      },
    ],
    destEyebrow: "destinations · dst",
    destHeading: "Wohin es geht — Werkzeuge, die Ingenieure nutzen.",
    destSoonLabel: "bald",
    destinations: [
      {
        title: "Microsoft Teams",
        body: "Posten Sie bei jedem Event eine Nachricht in einen Kanal.",
        soon: false,
      },
      {
        title: "SharePoint",
        body: "Legen Sie den Export in der Dokumentbibliothek des Projekts ab.",
        soon: false,
      },
      {
        title: "Google Drive",
        body: "Laden Sie die exportierte Datei in einen geteilten Ordner hoch.",
        soon: false,
      },
      {
        title: "Email",
        body: "Senden Sie den Export an einen Verteiler oder ein Postfach.",
        soon: false,
      },
      {
        title: "Netzwerkordner",
        body: "Legen Sie die Datei über einen kleinen Agenten auf einem freigegebenen Laufwerk ab.",
        soon: false,
      },
      {
        title: "PLM / PDM",
        body: "Checken Sie Zeichnungen in Vault, SolidWorks PDM oder Windchill ein.",
        soon: true,
      },
    ],
    footnote:
      "Kein Slack? Ganz bewusst — Covaga Hub spricht den M365- + PLM-Stack, den Ihr Büro bereits nutzt. Brauchen Sie etwas anderes? Ein generisches HTTP-Ziel leitet die Nutzlast überallhin weiter.",
  },
  pricing: {
    eyebrow: "preise",
    heading: "Open Core. Kostenlos im Betrieb, bezahlt im Hosting.",
    lead: "Der Client ist Open Source und für immer kostenlos. Der gehostete Router — verwaltete Zugangsdaten, Wiederholungen und Verlauf — ist das, wofür Sie zahlen. Mitglieder der Warteliste helfen mit, den finalen Startpreis festzulegen.",
    mostPopular: "am beliebtesten",
    period: "/Mon.",
    tiers: [
      {
        name: "Community",
        price: "0€",
        tagline: "Open-Source-Client, eine Route, Selbstbedienung.",
        features: [
          "Open-Source-Client (MIT)",
          "1 Event · 1 Ziel",
          "100 Ausführungen / Mon.",
          "Community-Support",
        ],
        popular: false,
        cta: "Kostenlos starten",
      },
      {
        name: "Starter",
        price: "29€",
        tagline: "Für ein kleines Elektroteam.",
        features: [
          "3 Events",
          "2 Ziele",
          "500 Ausführungen / Mon.",
          "Verwaltetes OAuth + Wiederholungen",
        ],
        popular: false,
        cta: "Starter wählen",
      },
      {
        name: "Pro",
        price: "79€",
        tagline: "Für ausgelastete Ingenieurbüros.",
        features: [
          "Unbegrenzte Events",
          "5 Ziele",
          "5.000 Ausführungen / Mon.",
          "Ausführungsverlauf + priorisierter Support",
        ],
        popular: true,
        cta: "Pro wählen",
      },
    ],
  },
  faq: {
    eyebrow: "faq",
    heading: "Klare Antworten.",
    items: [
      {
        q: "Welche ECAD-Werkzeuge unterstützen Sie?",
        a: "Covaga Hub ist ECAD-unabhängig. Der Open-Source-Client erfasst Events aus Ihrem CAD-Werkzeug und sendet sie per POST an Ihren Tenant. EPLAN Electric P8 wird zuerst unterstützt; der Client ist so ausgelegt, dass andere ECAD-Werkzeuge auf dieselbe Weise ergänzt werden können.",
      },
      {
        q: "Muss die CAD-Software geöffnet sein?",
        a: "Ja. Der Client läuft neben Ihrem CAD mit aktiver Lizenz. Solange es geöffnet ist, laufen Integrationen automatisch, während Sie Projekte exportieren und schließen. Nichts läuft, wenn die Software geschlossen ist.",
      },
      {
        q: "Ist der Client wirklich Open Source?",
        a: "Ja — MIT-lizenziert und von Ihrem IT-Team vollständig prüfbar. Sie können jede Zeile lesen, bevor Sie ihn installieren, und er sendet Event-Daten ausschließlich an Ihre eigene Tenant-URL. Das ist die Community-Stufe: für immer kostenlos.",
      },
      {
        q: "Wo liegen meine OAuth-Tokens?",
        a: "Verschlüsselt im gehosteten Router, serverseitig verwahrt. Sie werden niemals auf Ihrem PC gespeichert. Der Client sendet nur Event-Nutzlasten, sodass Zugangsdaten die gehostete Umgebung nie verlassen.",
      },
      {
        q: "Warum kein Slack?",
        a: "Weil Ingenieurbüros nicht auf Slack laufen. Covaga Hub zielt auf die Werkzeuge, die Sie tatsächlich verwenden — Microsoft Teams, SharePoint, Drive, E-Mail, Netzwerkordner und PLM/PDM. Ein generisches HTTP-Ziel deckt alles andere ab.",
      },
      {
        q: "Müssen wir ändern, wie das Team arbeitet?",
        a: "Nein. Ingenieure exportieren PDFs und BOMs genau so weiter wie heute. Covaga Hub lauscht auf diese Events und liefert sie aus, sodass es kein neues Werkzeug zu erlernen gibt.",
      },
    ],
  },
  signup: {
    metaTitle: "Covaga Hub — Auf die Warteliste",
    metaDescription: "Covaga Hub ist in Entwicklung. Hinterlasse deine E-Mail und wir sagen dir Bescheid, sobald es verfügbar ist.",
    eyebrow: "früher zugang",
    heading: "Covaga Hub ist fast fertig",
    lead: "Wir bauen Covaga Hub noch. Hinterlasse deine E-Mail und wir sagen dir Bescheid, sobald es verfügbar ist — eine Nachricht, kein Spam.",
    emailLabel: "Geschäftliche E-Mail",
    companyLabel: "Firma (optional)",
    submit: "Benachrichtige mich",
    submitting: "Wird gesendet…",
    errorGeneric: "Etwas ist schiefgelaufen. Prüfe deine E-Mail und versuche es erneut.",
    successHeading: "Du bist auf der Liste",
    successLead: "Danke — wir schreiben dir, sobald Covaga Hub verfügbar ist. In der Zwischenzeit sind Client und Tools quelloffen auf GitHub.",
    tenantIdLabel: "Tenant-ID",
    apiKeyLabel: "API-Key",
    copy: "kopieren",
    nextHeading: "Nächste Schritte",
    nextSteps: [
      "Öffne im Dashboard die Connections und verbinde Telegram, Google Drive oder einen Webhook.",
      "Kopiere covaga.config nach %APPDATA%\\covaga\\ und trage tenantId und apiKey ein.",
      "Führe in EPLAN scripts/CovagaPing.cs aus und wähle auf der Events-Seite, welche Ereignisse geroutet werden.",
    ],
  },
  footer: {
    tagline:
      "Gehostetes Event-Routing für Ingenieurbüros. Ihre Daten wandern zu den Werkzeugen, die Sie bereits nutzen; der Client bleibt Open Source.",
    productLabel: "produkt",
    legalLabel: "rechtliches",
    privacy: "datenschutz",
    terms: "nutzungsbedingungen",
    contact: "kontakt",
    disclaimer:
      "Covaga Hub ist ein unabhängiges Produkt und steht in keiner Verbindung zu EPLAN oder einem ECAD-Anbieter und wird von diesen nicht unterstützt. Alle Produktnamen sind Marken ihrer jeweiligen Inhaber.",
  },
  legal: {
    back: "zurück zu Covaga Hub",
    lastUpdatedLabel: "zuletzt aktualisiert",
    draftLabel: "entwurf",
    updated: "2026-07-05",
    disclaimer:
      "Dieses Dokument ist ein früher Entwurf und stellt noch keine Rechtsberatung dar. Fragen?",
    privacy: {
      eyebrow: "legal · privacy",
      title: "Datenschutzerklärung",
      intro:
        "Wir halten die Datenerhebung minimal und Zugangsdaten serverseitig. Hier steht genau, was Covaga Hub verarbeitet und warum.",
      sections: [
        {
          heading: "Wer wir sind",
          body: [
            "Covaga Hub ist ein unabhängiges Produkt, das ECAD-Events an die Werkzeuge leitet, die Engineering-Teams nutzen. Diese Richtlinie erläutert, welche Daten wir verarbeiten, wenn Sie unsere Website und den gehosteten Dienst nutzen.",
          ],
        },
        {
          heading: "Was wir erheben",
          body: [
            "Website: Die Seite ist statisch und verwendet keine Werbe- oder Tracking-Cookies von Drittanbietern.",
            "Kontakt: Wenn Sie uns eine E-Mail schreiben, bewahren wir Ihre Nachricht und Adresse auf, um zu antworten und, wo relevant, zum Produkt nachzufassen.",
            "Gehosteter Dienst: Wenn Ihr Tenant aktiv ist, verarbeiten wir die Event-Metadaten, die Ihr Open-Source-Client sendet (Event-Typ, Zeitstempel, Dateiverweise), um sie an die von Ihnen konfigurierten Ziele zu liefern.",
          ],
        },
        {
          heading: "Zugangsdaten",
          body: [
            "OAuth-Tokens und Ziel-Geheimnisse werden verschlüsselt und serverseitig im gehosteten Router verwahrt. Sie werden niemals auf Ihrer CAD-Workstation gespeichert und niemals an Dritte weitergegeben, die über das von Ihnen verbundene Ziel hinausgehen.",
          ],
        },
        {
          heading: "Auftragsverarbeiter",
          body: [
            "Der gehostete Dienst läuft auf Cloudflare. Zustellungsziele (zum Beispiel Microsoft 365, Google Drive) erhalten nur die Nutzlasten, die Sie an sie leiten.",
          ],
        },
        {
          heading: "Ihre Rechte",
          body: [
            "Sie können jederzeit unter hello@covaga.dev Auskunft, Berichtigung oder Löschung der personenbezogenen Daten verlangen, die wir über Sie speichern. Wir antworten innerhalb einer angemessenen Frist.",
          ],
        },
        {
          heading: "Änderungen",
          body: [
            "Wir können diese Richtlinie im Zuge der Produktentwicklung aktualisieren. Wesentliche Änderungen spiegeln sich im oben genannten Datum 'zuletzt aktualisiert' wider.",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "legal · terms",
      title: "Nutzungsbedingungen",
      intro:
        "Klare Bedingungen für ein kleines Produkt: Betreiben Sie ein lizenziertes CAD-Werkzeug, leiten Sie nur Daten weiter, die Sie weitergeben dürfen, und behalten Sie eigene Sicherungen.",
      sections: [
        {
          heading: "Der Dienst",
          body: [
            "Covaga Hub stellt einen gehosteten Router bereit, der ECAD-Events von einem Open-Source-Client empfängt und sie an die von Ihnen konfigurierten Ziele liefert. Der Client ist MIT-lizenziert; der gehostete Dienst wird unter diesen Bedingungen angeboten.",
          ],
        },
        {
          heading: "Ihre Verantwortung",
          body: [
            "Sie sind dafür verantwortlich, gültige Lizenzen für die von Ihnen betriebene CAD-Software und für die verbundenen Zielkonten zu halten. Sie dürfen nur Daten weiterleiten, zu deren Weitergabe Sie berechtigt sind.",
          ],
        },
        {
          heading: "Der Open-Source-Client",
          body: [
            "Der Client wird unter der MIT-Lizenz bereitgestellt, wie besehen, ohne Gewährleistung. Es steht Ihnen frei, ihn im Rahmen dieser Lizenz zu lesen, zu prüfen, zu betreiben und zu modifizieren.",
          ],
        },
        {
          heading: "Verfügbarkeit",
          body: [
            "Wir streben eine zuverlässige Zustellung an, garantieren jedoch keinen unterbrechungsfreien Dienst. Events können bei Fehlern wiederholt werden; dauerhafte Fehler werden Ihnen angezeigt.",
          ],
        },
        {
          heading: "Haftung",
          body: [
            "Soweit gesetzlich zulässig, haftet Covaga Hub nicht für indirekte Schäden oder Folgeschäden, die aus der Nutzung des Dienstes entstehen. Der gehostete Dienst bewegt Ihre Dateien; es liegt in Ihrer Verantwortung, unabhängige Sicherungen zu führen.",
          ],
        },
        {
          heading: "Änderungen",
          body: [
            "Wir können diese Bedingungen im Zuge der Produktentwicklung aktualisieren. Die fortgesetzte Nutzung nach einer Änderung gilt als Annahme der aktualisierten Bedingungen.",
          ],
        },
      ],
    },
  },
};

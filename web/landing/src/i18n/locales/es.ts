import type { SiteContent } from "../types";

// Spanish — mirrors the English source keys. Only string values are translated.
export const es: SiteContent = {
  meta: {
    umbrellaTitle: "Covaga — Kit de herramientas abierto para ingenieros de EPLAN",
    umbrellaDescription:
      "Tres herramientas abiertas para ingenieros eléctricos de EPLAN: controla EPLAN con IA (eplan-rag-mcp), abre proyectos en cualquier navegador (ecad-view) y enruta sus eventos a las herramientas que usa tu oficina (Covaga Hub). Construido sobre Cloudflare.",
    homeTitle: "Covaga Hub — Enruta tus exportaciones de EPLAN a cualquier destino",
    homeDescription:
      "Covaga Hub detecta tus exportaciones de EPLAN — PDF, BOM, cierre de proyecto — y las entrega en Teams, SharePoint, Drive o Email. Las credenciales permanecen en el servidor; el cliente sigue siendo de código abierto.",
    privacyTitle: "Covaga — Privacidad",
    privacyDescription:
      "Cómo gestiona Covaga los datos en su sitio web y en sus servicios alojados.",
    termsTitle: "Covaga — Términos",
    termsDescription:
      "Los términos que rigen el uso del servicio alojado Covaga Hub y de las herramientas de código abierto de Covaga.",
  },
  umbrella: {
    nav: {
      tools: "herramientas",
      open: "código abierto",
      getHub: "Obtener Hub",
    },
    hero: {
      eyebrow: "kit de herramientas abierto para eplan",
      heading: "Haz más con tus proyectos de EPLAN",
      leadHtml:
        'Tres herramientas abiertas para ingenieros eléctricos — controla <strong class="font-semibold text-[var(--color-ink)]">EPLAN</strong> con IA, abre proyectos en cualquier navegador y enruta sus eventos a las herramientas que tu oficina ya utiliza. Gratis para empezar, tuyo para alojar.',
      ctaPrimary: "Explora el kit de herramientas",
      ctaSecondary: "Empezar gratis",
      specChips: [
        { label: "stack", value: "cloudflare" },
        { label: "core", value: "open source" },
        { label: "i18n", value: "7 locales" },
      ],
      schemaTitle: "Esquema del kit de herramientas Covaga",
      schemaDesc:
        "Un esquema de cableado: un terminal de origen EPLAN P8 a la izquierda alimenta el módulo de bus covaga en el centro, que se ramifica hacia tres terminales de herramientas a la derecha — rag-mcp, ecad-view y hub.",
      figCaption: "fig. 01 — esquema del kit de herramientas",
      figFlow: "eplan → covaga → tools",
    },
    tools: {
      eyebrow: "herramientas · 03",
      heading: "Un kit, tres módulos.",
      lead: "Cada herramienta resuelve una carencia real de EPLAN y funciona por sí sola — elige una o conéctalas las tres. Dos son de código abierto que alojas tú mismo; la plataforma está alojada por ti.",
      statusOssLabel: "código abierto",
      statusHostedLabel: "núcleo abierto · alojado",
      items: [
        {
          ref: "U1 · MCP",
          name: "eplan-rag-mcp",
          what: "Controla EPLAN con IA.",
          body: "Un servidor MCP local que ejecuta 149 acciones de EPLAN de forma silenciosa en QuietMode, además de documentación RAG para P8 y EEC Pro 2026 y una skill de Claude Code que escribe scripts de EPLAN correctos.",
          chips: [
            { label: "tools", value: "156" },
            { label: "rag", value: "p8 + eec" },
            { label: "runtime", value: "local" },
          ],
          status: "código abierto",
          statusKind: "oss",
          links: [
            { label: "GitHub ↗", href: "https://github.com/covagashi/eplan-rag-mcp" },
          ],
          primary: false,
        },
        {
          ref: "U2 · VIEWER",
          name: "ecad-view",
          what: "Abre proyectos en el navegador.",
          body: "Suelta una exportación .epdz o una pieza .e3d y léela en cualquier navegador — modelos 3D, páginas de esquema, búsqueda de dispositivos y referencias cruzadas. PWA sin conexión; los archivos nunca salen del dispositivo.",
          chips: [
            { label: "fmt", value: ".epdz / .e3d" },
            { label: "3d", value: "three.js" },
            { label: "runs", value: "client-side" },
          ],
          status: "código abierto",
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
          what: "Enruta eventos · cierra carencias de datos.",
          body: "La plataforma alojada. Enruta eventos de EPLAN — PDF, BOM, cierre de proyecto — a Teams, SharePoint, Drive o Email, y cierra las carencias de texto de la base de datos de artículos mediante propuestas de IA revisadas. Las credenciales permanecen en el servidor.",
          chips: [
            { label: "mode", value: "hosted" },
            { label: "tenancy", value: "multi" },
            { label: "gym", value: "mcp" },
          ],
          status: "núcleo abierto · alojado",
          statusKind: "hosted",
          links: [{ label: "hub.covaga.dev", href: "/hub" }],
          primary: true,
        },
      ],
    },
    principles: {
      eyebrow: "cómo se construye covaga",
      heading: "Reglas de oficina de ingeniería.",
      items: [
        {
          title: "Abierto por defecto",
          body: "Las herramientas locales son de código abierto y gratuitas para ejecutar — lee cada línea antes de instalarlas, audítalas con tu equipo de TI, alójalas tú mismo donde quieras.",
        },
        {
          title: "Donde trabaja tu equipo",
          body: "Ninguna herramienta nueva que aprender. Covaga habla EPLAN y el stack de M365 que tu oficina ya utiliza; los ingenieros siguen exportando exactamente como hoy.",
        },
        {
          title: "Tus datos siguen siendo tuyos",
          body: "Los proyectos se renderizan en tu dispositivo; los datos reales de artículos residen en tu propia base de datos, nunca en un repositorio. El worker alojado guarda credenciales, no archivos.",
        },
      ],
    },
    cta: {
      eyebrow: "empezar",
      heading: "Empieza con una herramienta. Conecta el resto cuando estés listo.",
      primary: "Crear un tenant de Hub",
      secondary: "Explorar los repositorios",
    },
    footer: {
      tagline:
        "Un kit de herramientas abierto para ingenieros eléctricos de EPLAN, construido sobre Cloudflare. Controla EPLAN con IA, abre proyectos en cualquier lugar, enruta eventos a las herramientas que ya utilizas.",
      net: "part of covaga.xyz",
      toolsLabel: "herramientas",
      codeLabel: "código",
      projectLabel: "proyecto",
      localesLabel: "Disponible en siete idiomas",
    },
  },
  a11y: {
    skipToContent: "Saltar al contenido",
    primaryNav: "Principal",
    sectionsNav: "Secciones",
    legalNav: "Legal",
    toggleMenu: "Alternar menú",
    languageLabel: "Idioma",
  },
  banner: {
    message: "Este sitio está disponible en español.",
    view: "Ver en español",
    dismiss: "Ahora no",
  },
  nav: {
    how: "cómo",
    events: "eventos",
    pricing: "precios",
    faq: "faq",
    getStarted: "Empezar",
  },
  hero: {
    eyebrowTo: "entregado",
    headingPre: "Eventos CAD, enrutados",
    leadHtml:
      'Covaga Hub detecta tus exportaciones <strong class="font-semibold text-[var(--color-ink)]">ECAD</strong> y las entrega en Teams, SharePoint, Drive o Email — las credenciales permanecen en el servidor.',
    ctaPrimary: "Empezar",
    ctaSecondary: "Ver cómo funciona",
    schemaTitle: "Esquema de enrutamiento de eventos",
    schemaDesc:
      "Esquema de cableado: tres terminales de eventos ECAD a la izquierda se enrutan a través del módulo central de Covaga hacia los terminales de SharePoint, Teams, Drive y Email a la derecha.",
    figCaption: "fig. 01 — esquema de enrutamiento de eventos",
  },
  problem: {
    eyebrow: "el cambio",
    heading: "Integraciones sin el proyecto de integración.",
    todayLabel: "// hoy",
    withLabel: "// con Covaga Hub",
    today: [
      {
        title: "Macros locales puntuales",
        body: "Scripts de exportación a medida encargados por entre 200€ y 2.400€ cada uno, que residen en una sola estación de trabajo. El mantenimiento es tuyo para siempre y se rompen cuando un compañero cambia de equipo.",
      },
      {
        title: "Conectores PLM / ERP pesados",
        body: "Middleware empresarial caro de licenciar y lento de implementar — mucho más de lo que un pequeño equipo de electricidad necesita para archivar un plano en SharePoint.",
      },
      {
        title: "Credenciales en el PC de CAD",
        body: "Tokens de OAuth y claves de API en archivos de configuración locales, que caducan cada vez que el proveedor o el secreto de un webhook rotan.",
      },
    ],
    solution: [
      {
        title: "Rutas configuradas, no código",
        body: "Apunta un evento ECAD a un destino y listo. Convierte una exportación PDF en un aviso de Teams o una subida a SharePoint en minutos.",
      },
      {
        title: "Credenciales guardadas en el servidor",
        body: "Los tokens de OAuth residen cifrados en el enrutador alojado. El cliente de código abierto en tu PC solo envía datos de eventos — nunca secretos.",
      },
      {
        title: "Siempre al día por ti",
        body: "Cuando un proveedor cambia su API, el worker alojado se actualiza de forma centralizada. No hay nada que volver a desplegar en tus equipos de ingeniería.",
      },
    ],
  },
  how: {
    eyebrow: "cómo funciona",
    heading: "Tres pasos, del evento CAD a la entrega.",
    steps: [
      {
        title: "Se dispara un evento ECAD",
        body: "Una exportación PDF, una exportación BOM o un cierre de proyecto ocurre dentro de tu herramienta ECAD durante el trabajo normal — nadie cambia su forma de dibujar.",
      },
      {
        title: "El cliente de código abierto envía JSON por POST",
        body: "Un cliente ligero que se ejecuta junto a tu CAD envía una pequeña carga JSON a la URL privada de tu tenant. Ningún secreto sale del PC.",
      },
      {
        title: "El enrutador lo entrega",
        body: "El worker alojado transforma el evento y lo entrega en tu destino: Teams, SharePoint, Google Drive, Email o cualquier endpoint HTTP.",
      },
    ],
  },
  events: {
    eyebrow: "eventos · src",
    heading: "Lo que tu ECAD puede activar.",
    lead: "Cada evento se corresponde con una acción real de la API de EPLAN — incluidas las que la mayoría de integraciones nunca tocan.",
    liveLabel: "activo",
    soonLabel: "próximamente",
    items: [
      {
        id: "pdf-exported",
        title: "PDF exportado",
        body: "Se dispara cuando se exporta un PDF de esquema o de documentación desde un proyecto.",
        action: "action export · PDF",
        soon: false,
      },
      {
        id: "bom-exported",
        title: "BOM / lista de piezas exportada",
        body: "Se dispara cuando se exporta una lista de materiales, una lista de piezas o una etiqueta de bornes.",
        action: "action label",
        soon: false,
      },
      {
        id: "dxf-dwg-exported",
        title: "DXF / DWG exportado",
        body: "Se dispara cuando se exportan páginas o el proyecto a DXF o DWG para la entrega mecánica o al cliente.",
        action: "action export · DXF/DWG",
        soon: true,
      },
      {
        id: "project-backed-up",
        title: "Copia de seguridad del proyecto",
        body: "Se dispara cuando se crea una copia de seguridad del proyecto (.zw1) — lista para su archivo externo.",
        action: "action backup",
        soon: true,
      },
      {
        id: "wiring-exported",
        title: "Cableado de producción exportado",
        body: "Se dispara cuando se exportan los datos de cableado de producción para el montaje de la máquina.",
        action: "action ExportProductionWiring",
        soon: true,
      },
      {
        id: "project-closed",
        title: "Proyecto cerrado",
        body: "Se dispara cuando se cierra un proyecto — útil para flujos de aprobación y archivo.",
        action: "event lifecycle",
        soon: true,
      },
    ],
    destEyebrow: "destinos · dst",
    destHeading: "A dónde va — herramientas que usan los ingenieros.",
    destSoonLabel: "pronto",
    destinations: [
      {
        title: "Microsoft Teams",
        body: "Publica un mensaje en un canal con cada evento.",
        soon: false,
      },
      {
        title: "SharePoint",
        body: "Archiva la exportación en la biblioteca de documentos del proyecto.",
        soon: false,
      },
      {
        title: "Google Drive",
        body: "Sube el archivo exportado a una carpeta compartida.",
        soon: false,
      },
      {
        title: "Email",
        body: "Envía la exportación a una lista de distribución o a una bandeja de entrada.",
        soon: false,
      },
      {
        title: "Carpeta de red",
        body: "Deposita el archivo en una unidad compartida mediante un pequeño agente.",
        soon: false,
      },
      {
        title: "PLM / PDM",
        body: "Registra los planos en Vault, SolidWorks PDM o Windchill.",
        soon: true,
      },
    ],
    footnote:
      "¿Sin Slack? A propósito — Covaga Hub habla el stack de M365 + PLM que tu oficina ya utiliza. ¿Necesitas otra cosa? Un destino HTTP genérico reenvía la carga a cualquier lugar.",
  },
  pricing: {
    eyebrow: "precios",
    heading: "Núcleo abierto. Gratis para ejecutar, de pago para alojar.",
    lead: "El cliente es de código abierto y gratuito para siempre. El enrutador alojado — credenciales gestionadas, reintentos e historial — es lo que pagas. Los miembros de la lista de espera ayudan a fijar el precio final de lanzamiento.",
    mostPopular: "más popular",
    period: "/mes",
    tiers: [
      {
        name: "Community",
        price: "0€",
        tagline: "Cliente de código abierto, una ruta, autoservicio.",
        features: [
          "Cliente de código abierto (MIT)",
          "1 evento · 1 destino",
          "100 ejecuciones / mes",
          "Soporte de la comunidad",
        ],
        popular: false,
        cta: "Empezar gratis",
      },
      {
        name: "Starter",
        price: "29€",
        tagline: "Para un pequeño equipo de electricidad.",
        features: [
          "3 eventos",
          "2 destinos",
          "500 ejecuciones / mes",
          "OAuth gestionado + reintentos",
        ],
        popular: false,
        cta: "Elegir Starter",
      },
      {
        name: "Pro",
        price: "79€",
        tagline: "Para oficinas de ingeniería con mucha actividad.",
        features: [
          "Eventos ilimitados",
          "5 destinos",
          "5.000 ejecuciones / mes",
          "Historial de ejecuciones + soporte prioritario",
        ],
        popular: true,
        cta: "Elegir Pro",
      },
    ],
  },
  faq: {
    eyebrow: "faq",
    heading: "Respuestas claras.",
    items: [
      {
        q: "¿Qué herramientas ECAD admitís?",
        a: "Covaga Hub es agnóstico respecto al ECAD. El cliente de código abierto captura los eventos de tu herramienta CAD y los envía por POST a tu tenant. EPLAN Electric P8 es la primera compatible; el cliente está diseñado para que otras herramientas ECAD puedan añadirse de la misma forma.",
      },
      {
        q: "¿El software de CAD tiene que estar abierto?",
        a: "Sí. El cliente se ejecuta junto a tu CAD con una licencia activa. Mientras está abierto, las integraciones se ejecutan automáticamente a medida que exportas y cierras proyectos. Nada se ejecuta cuando el software está cerrado.",
      },
      {
        q: "¿El cliente es realmente de código abierto?",
        a: "Sí — con licencia MIT y totalmente auditable por tu equipo de TI. Puedes leer cada línea antes de instalarlo, y solo envía datos de eventos a la URL de tu propio tenant. Ese es el plan Community: gratis para siempre.",
      },
      {
        q: "¿Dónde residen mis tokens de OAuth?",
        a: "Cifrados en el enrutador alojado, guardados en el servidor. Nunca se almacenan en tu PC. El cliente solo envía cargas de eventos, así que las credenciales nunca salen del entorno alojado.",
      },
      {
        q: "¿Por qué no hay Slack?",
        a: "Porque las oficinas de ingeniería no funcionan con Slack. Covaga Hub apunta a las herramientas que realmente usas — Microsoft Teams, SharePoint, Drive, Email, carpetas de red y PLM/PDM. Un destino HTTP genérico cubre cualquier otra cosa.",
      },
      {
        q: "¿Tenemos que cambiar la forma de trabajar del equipo?",
        a: "No. Los ingenieros siguen exportando PDF y BOM exactamente como hoy. Covaga Hub detecta esos eventos y los entrega, así que no hay ninguna herramienta nueva que aprender.",
      },
    ],
  },
  signup: {
    metaTitle: "Covaga Hub — Empezar",
    metaDescription: "Crea tu tenant de Covaga Hub: conecta un bot de Telegram y enruta tus eventos ECAD en minutos.",
    eyebrow: "empezar",
    heading: "Crea tu tenant",
    lead: "Crea tu tenant solo con tu email. Las conexiones y el enrutado de eventos se configuran después en tu panel. Sin tarjeta.",
    emailLabel: "Email de trabajo",
    companyLabel: "Empresa (opcional)",
    submit: "Crear tenant",
    submitting: "Creando…",
    errorGeneric: "Algo ha fallado. Revisa los campos e inténtalo de nuevo.",
    successHeading: "Tenant creado — guarda tu clave",
    successLead: "Guarda la API key ahora: se muestra una sola vez. Después configura tu primera conexión desde el panel.",
    tenantIdLabel: "Tenant ID",
    apiKeyLabel: "API key",
    copy: "copiar",
    nextHeading: "Siguientes pasos",
    nextSteps: [
      "En el panel, abre Conexiones y conecta Telegram, Google Drive o un webhook.",
      "Copia covaga.config a %APPDATA%\\covaga\\ y pega tu tenantId y apiKey.",
      "En EPLAN ejecuta scripts/CovagaPing.cs y elige qué eventos enrutar en la página de Eventos.",
    ],
  },
  footer: {
    tagline:
      "Enrutamiento de eventos alojado para oficinas de ingeniería. Tus datos se mueven a las herramientas que ya utilizas; el cliente sigue siendo de código abierto.",
    productLabel: "producto",
    legalLabel: "legal",
    privacy: "privacidad",
    terms: "términos",
    contact: "contacto",
    disclaimer:
      "Covaga Hub es un producto independiente, no afiliado ni respaldado por EPLAN ni por ningún proveedor de ECAD. Todos los nombres de producto son marcas comerciales de sus respectivos propietarios.",
  },
  legal: {
    back: "volver a Covaga Hub",
    lastUpdatedLabel: "última actualización",
    draftLabel: "borrador",
    updated: "2026-07-05",
    disclaimer:
      "Este documento es un borrador preliminar y todavía no constituye asesoramiento legal. ¿Preguntas?",
    privacy: {
      eyebrow: "legal · privacy",
      title: "Política de privacidad",
      intro:
        "Mantenemos la recopilación de datos al mínimo y las credenciales en el servidor. Esto es exactamente lo que gestiona Covaga Hub y por qué.",
      sections: [
        {
          heading: "Quiénes somos",
          body: [
            "Covaga Hub es un producto independiente que enruta eventos ECAD hacia las herramientas que usan los equipos de ingeniería. Esta política explica qué datos gestionamos cuando usas nuestro sitio web y nuestro servicio alojado.",
          ],
        },
        {
          heading: "Qué recopilamos",
          body: [
            "Sitio web: el sitio es estático y no utiliza publicidad ni cookies de seguimiento de terceros.",
            "Contacto: si nos escribes un correo, conservamos tu mensaje y tu dirección para responderte y, cuando corresponda, para hacer seguimiento sobre el producto.",
            "Servicio alojado: cuando tu tenant está activo, procesamos los metadatos de eventos que envía tu cliente de código abierto (tipo de evento, marcas de tiempo, referencias de archivos) para entregarlos en los destinos que configures.",
          ],
        },
        {
          heading: "Credenciales",
          body: [
            "Los tokens de OAuth y los secretos de destino se guardan cifrados, en el servidor, dentro del enrutador alojado. Nunca se almacenan en tu estación de trabajo de CAD ni se comparten con terceros más allá del destino que conectes.",
          ],
        },
        {
          heading: "Subprocesadores",
          body: [
            "El servicio alojado se ejecuta en Cloudflare. Los destinos de entrega (por ejemplo, Microsoft 365, Google Drive) reciben únicamente las cargas que enrutas hacia ellos.",
          ],
        },
        {
          heading: "Tus derechos",
          body: [
            "Puedes solicitarnos en cualquier momento el acceso, la corrección o la eliminación de los datos personales que tenemos sobre ti escribiendo a hello@covaga.dev. Responderemos dentro de un plazo razonable.",
          ],
        },
        {
          heading: "Cambios",
          body: [
            "Podemos actualizar esta política a medida que el producto evoluciona. Los cambios importantes se reflejarán en la fecha de 'última actualización' de arriba.",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "legal · terms",
      title: "Términos del servicio",
      intro:
        "Términos sencillos para un producto pequeño: ejecuta una herramienta CAD con licencia, enruta datos que tengas permiso de mover y conserva tus propias copias de seguridad.",
      sections: [
        {
          heading: "El servicio",
          body: [
            "Covaga Hub proporciona un enrutador alojado que recibe eventos ECAD desde un cliente de código abierto y los entrega en los destinos que configures. El cliente tiene licencia MIT; el servicio alojado se ofrece bajo estos términos.",
          ],
        },
        {
          heading: "Tus responsabilidades",
          body: [
            "Eres responsable de disponer de licencias válidas para el software de CAD que ejecutes y para las cuentas de destino que conectes. Solo debes enrutar datos que estés autorizado a mover.",
          ],
        },
        {
          heading: "El cliente de código abierto",
          body: [
            "El cliente se proporciona bajo la licencia MIT, tal cual, sin garantía. Eres libre de leerlo, auditarlo, ejecutarlo y modificarlo dentro de los términos de esa licencia.",
          ],
        },
        {
          heading: "Disponibilidad",
          body: [
            "Aspiramos a una entrega fiable, pero no garantizamos un servicio ininterrumpido. Los eventos pueden reintentarse en caso de fallo; los fallos persistentes se te notifican.",
          ],
        },
        {
          heading: "Responsabilidad",
          body: [
            "En la medida en que lo permita la ley, Covaga Hub no se hace responsable de pérdidas indirectas o derivadas del uso del servicio. El servicio alojado mueve tus archivos; es tu responsabilidad mantener copias de seguridad independientes.",
          ],
        },
        {
          heading: "Cambios",
          body: [
            "Podemos actualizar estos términos a medida que el producto evoluciona. El uso continuado tras un cambio constituye la aceptación de los términos actualizados.",
          ],
        },
      ],
    },
  },
};

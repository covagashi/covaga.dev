import type { SiteContent } from "../types";

// Portuguese (pt) — mirrors the English source keys.
export const pt: SiteContent = {
  meta: {
    umbrellaTitle: "Covaga — Conjunto de ferramentas abertas para engenheiros EPLAN",
    umbrellaDescription:
      "Três ferramentas abertas para engenheiros eletrotécnicos de EPLAN: conduza o EPLAN com IA (eplan-rag-mcp), abra projetos em qualquer navegador (ecad-view) e encaminhe os seus eventos para as ferramentas que o seu escritório utiliza (Covaga Hub). Construído sobre a Cloudflare.",
    homeTitle: "Covaga Hub — Encaminhe as suas exportações ECAD para qualquer lado",
    homeDescription:
      "O Covaga Hub deteta as suas exportações ECAD — PDF, BOM, fecho de projeto — e entrega-as no Teams, SharePoint, Drive ou email. As credenciais permanecem no servidor; o cliente permanece open source.",
    privacyTitle: "Covaga — Privacidade",
    privacyDescription:
      "Como a Covaga trata os dados no seu website e nos serviços alojados.",
    termsTitle: "Covaga — Termos",
    termsDescription:
      "Os termos que regem a utilização do serviço alojado Covaga Hub e das ferramentas abertas Covaga.",
  },
  umbrella: {
    nav: {
      tools: "tools",
      open: "open source",
      getHub: "Obter o Hub",
    },
    hero: {
      eyebrow: "conjunto de ferramentas aberto para eplan",
      heading: "Faça mais com os seus projetos EPLAN",
      leadHtml:
        'Três ferramentas abertas para engenheiros eletrotécnicos — conduza o <strong class="font-semibold text-[var(--color-ink)]">EPLAN</strong> com IA, abra projetos em qualquer navegador e encaminhe os seus eventos para as ferramentas que o seu escritório já utiliza. Grátis para começar, seu para alojar.',
      ctaPrimary: "Explorar o conjunto de ferramentas",
      ctaSecondary: "Começar grátis",
      specChips: [
        { label: "stack", value: "cloudflare" },
        { label: "core", value: "open source" },
        { label: "i18n", value: "7 locales" },
      ],
      schemaTitle: "Esquema do conjunto de ferramentas Covaga",
      schemaDesc:
        "Um esquema de ligações: um terminal de origem EPLAN P8 à esquerda alimenta o módulo de barramento covaga no centro, que se ramifica para três terminais de ferramentas à direita — rag-mcp, ecad-view e hub.",
      figCaption: "fig. 01 — esquema do conjunto de ferramentas",
      figFlow: "eplan → covaga → tools",
    },
    tools: {
      eyebrow: "tools · 03",
      heading: "Um conjunto de ferramentas, três módulos.",
      lead: "Cada ferramenta resolve uma lacuna real do EPLAN e funciona por si só — escolha uma ou ligue as três. Duas são open source que aloja você mesmo; a plataforma é alojada por si.",
      statusOssLabel: "open source",
      statusHostedLabel: "open core · alojado",
      items: [
        {
          ref: "U1 · MCP",
          name: "eplan-rag-mcp",
          what: "Conduza o EPLAN com IA.",
          body: "Um servidor MCP local que executa 149 ações EPLAN silenciosamente em QuietMode, além de documentação RAG para P8 e EEC Pro 2026 e uma skill do Claude Code que escreve scripts EPLAN corretos.",
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
          what: "Abra projetos no navegador.",
          body: "Largue uma exportação .epdz ou uma peça .e3d e leia-a em qualquer navegador — modelos 3D, páginas de esquema, pesquisa de dispositivos e referências cruzadas. PWA offline; os ficheiros nunca saem do dispositivo.",
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
          what: "Encaminhe eventos · feche lacunas de dados.",
          body: "A plataforma alojada. Encaminhe eventos EPLAN — PDF, BOM, fecho de projeto — para o Teams, SharePoint, Drive ou email, e feche lacunas de texto da base de dados de artigos através de propostas de IA revistas. As credenciais permanecem no servidor.",
          chips: [
            { label: "mode", value: "hosted" },
            { label: "tenancy", value: "multi" },
            { label: "gym", value: "mcp" },
          ],
          status: "open core · alojado",
          statusKind: "hosted",
          links: [{ label: "hub.covaga.dev", href: "/hub" }],
          primary: true,
        },
      ],
    },
    principles: {
      eyebrow: "como a covaga é construída",
      heading: "Regras de escritório de engenharia.",
      items: [
        {
          title: "Aberto por definição",
          body: "As ferramentas locais são open source e gratuitas para executar — leia cada linha antes de instalar, audite-as com a sua equipa de TI, aloje-as onde quiser.",
        },
        {
          title: "Onde a sua equipa trabalha",
          body: "Nenhuma ferramenta nova para aprender. A Covaga fala EPLAN e a stack M365 que o seu escritório já utiliza; os engenheiros continuam a exportar exatamente como fazem hoje.",
        },
        {
          title: "Os seus dados continuam seus",
          body: "Os projetos são renderizados no seu dispositivo; os dados reais dos artigos residem na sua própria base de dados, nunca num repositório. O worker alojado guarda credenciais, não ficheiros.",
        },
      ],
    },
    cta: {
      eyebrow: "começar",
      heading: "Comece com uma ferramenta. Ligue as restantes quando estiver pronto.",
      primary: "Entrar na lista",
      secondary: "Explorar os repositórios",
    },
    footer: {
      tagline:
        "Um conjunto de ferramentas aberto para engenheiros eletrotécnicos de EPLAN, construído sobre a Cloudflare. Conduza o EPLAN com IA, abra projetos em qualquer lado, encaminhe eventos para as ferramentas que já utiliza.",
      net: "parte de covaga.xyz",
      toolsLabel: "tools",
      codeLabel: "code",
      projectLabel: "project",
      localesLabel: "Disponível em sete idiomas",
    },
  },
  a11y: {
    skipToContent: "Saltar para o conteúdo",
    primaryNav: "Principal",
    sectionsNav: "Secções",
    legalNav: "Legal",
    toggleMenu: "Alternar menu",
    languageLabel: "Idioma",
  },
  banner: {
    message: "Este site está disponível em português.",
    view: "Ver em português",
    dismiss: "Agora não",
  },
  nav: {
    how: "como",
    events: "eventos",
    pricing: "preços",
    faq: "faq",
    getStarted: "Entrar na lista",
  },
  hero: {
    eyebrowTo: "entregue",
    headingPre: "Eventos CAD, encaminhados",
    leadHtml:
      'O Covaga Hub deteta as suas exportações <strong class="font-semibold text-[var(--color-ink)]">ECAD</strong> e entrega-as no Teams, SharePoint, Drive ou email — as credenciais permanecem no servidor.',
    ctaPrimary: "Entrar na lista",
    ctaSecondary: "Ver como funciona",
    schemaTitle: "Esquema de encaminhamento de eventos",
    schemaDesc:
      "Esquema de ligações: três terminais de eventos ECAD à esquerda são encaminhados através do módulo central Covaga para os terminais SharePoint, Teams, Drive e Email à direita.",
    figCaption: "fig. 01 — esquema de encaminhamento de eventos",
  },
  problem: {
    eyebrow: "a mudança",
    heading: "Integrações sem o projeto de integração.",
    todayLabel: "// hoje",
    withLabel: "// com o Covaga Hub",
    today: [
      {
        title: "Macros locais avulsas",
        body: "Scripts de exportação personalizados encomendados por 200€ a 2.400€ cada, a residir numa única estação de trabalho. A manutenção é sua para sempre e deixam de funcionar quando um colega muda de máquina.",
      },
      {
        title: "Conectores PLM / ERP pesados",
        body: "Middleware empresarial de licenciamento caro e implementação lenta — muito mais do que uma pequena equipa de eletricidade precisa para arquivar um desenho no SharePoint.",
      },
      {
        title: "Credenciais no PC de CAD",
        body: "Tokens OAuth e chaves API guardados em ficheiros de configuração locais, ficando obsoletos sempre que o fornecedor ou o segredo de um webhook é rodado.",
      },
    ],
    solution: [
      {
        title: "Rotas configuradas, não código",
        body: "Aponte um evento ECAD para um destino e está concluído. Transforme uma exportação PDF num aviso no Teams ou num carregamento para o SharePoint em minutos.",
      },
      {
        title: "Credenciais guardadas no servidor",
        body: "Os tokens OAuth residem encriptados no router alojado. O cliente open source no seu PC apenas envia dados de eventos — nunca segredos.",
      },
      {
        title: "Sempre atualizado por si",
        body: "Quando um fornecedor altera a sua API, o worker alojado é atualizado centralmente. Não há nada para reimplementar nas suas máquinas de engenharia.",
      },
    ],
  },
  how: {
    eyebrow: "como funciona",
    heading: "Três passos, do evento CAD à entrega.",
    steps: [
      {
        title: "Um evento ECAD é disparado",
        body: "Uma exportação PDF, uma exportação BOM ou um fecho de projeto acontece dentro da sua ferramenta ECAD durante o trabalho normal — ninguém muda a forma como desenha.",
      },
      {
        title: "O cliente open source envia JSON por POST",
        body: "Um cliente leve a correr junto ao seu CAD envia um pequeno payload JSON para o URL privado do seu tenant. Nenhum segredo sai do PC.",
      },
      {
        title: "O router entrega-o",
        body: "O worker alojado transforma o evento e entrega-o ao seu destino: Teams, SharePoint, Google Drive, email ou qualquer endpoint HTTP.",
      },
    ],
  },
  events: {
    eyebrow: "eventos · src",
    heading: "O que o seu ECAD pode acionar.",
    lead: "Cada evento corresponde a uma ação real da API do EPLAN — incluindo aquelas que a maioria das integrações nunca toca.",
    liveLabel: "ativo",
    soonLabel: "brevemente",
    items: [
      {
        id: "pdf-exported",
        title: "PDF exportado",
        body: "Dispara quando um PDF de esquema ou documentação é exportado de um projeto.",
        action: "action export · PDF",
        soon: false,
      },
      {
        id: "bom-exported",
        title: "BOM / lista de peças exportada",
        body: "Dispara quando uma lista de materiais, lista de peças ou etiqueta de bornes é exportada.",
        action: "action label",
        soon: false,
      },
      {
        id: "dxf-dwg-exported",
        title: "DXF / DWG exportado",
        body: "Dispara quando páginas ou o projeto são exportados para DXF ou DWG para entrega mecânica ou ao cliente.",
        action: "action export · DXF/DWG",
        soon: true,
      },
      {
        id: "project-backed-up",
        title: "Projeto salvaguardado",
        body: "Dispara quando é criada uma cópia de segurança do projeto (.zw1) — pronta para arquivo externo.",
        action: "action backup",
        soon: true,
      },
      {
        id: "wiring-exported",
        title: "Cablagem de produção exportada",
        body: "Dispara quando os dados de cablagem de produção são exportados para o fabrico da máquina.",
        action: "action ExportProductionWiring",
        soon: true,
      },
      {
        id: "project-closed",
        title: "Projeto fechado",
        body: "Dispara quando um projeto é fechado — útil para fluxos de aprovação e arquivo.",
        action: "event lifecycle",
        soon: true,
      },
    ],
    destEyebrow: "destinos · dst",
    destHeading: "Para onde vai — as ferramentas que os engenheiros usam.",
    destSoonLabel: "brevemente",
    destinations: [
      {
        title: "Microsoft Teams",
        body: "Publica uma mensagem num canal a cada evento.",
        soon: false,
      },
      {
        title: "SharePoint",
        body: "Arquiva a exportação na biblioteca de documentos do projeto.",
        soon: false,
      },
      {
        title: "Google Drive",
        body: "Carrega o ficheiro exportado para uma pasta partilhada.",
        soon: false,
      },
      {
        title: "Email",
        body: "Envia a exportação para uma lista de distribuição ou uma caixa de entrada.",
        soon: false,
      },
      {
        title: "Pasta de rede",
        body: "Coloca o ficheiro numa unidade partilhada através de um pequeno agente.",
        soon: false,
      },
      {
        title: "PLM / PDM",
        body: "Regista os desenhos no Vault, SolidWorks PDM ou Windchill.",
        soon: true,
      },
    ],
    footnote:
      "Sem Slack? De propósito — o Covaga Hub fala a stack M365 + PLM que o seu escritório já utiliza. Precisa de outra coisa? Um destino HTTP genérico reencaminha o payload para qualquer lado.",
  },
  pricing: {
    eyebrow: "preços",
    heading: "Open core. Gratuito para executar, pago para alojar.",
    lead: "O cliente é open source e gratuito para sempre. O router alojado — credenciais geridas, novas tentativas e histórico — é o que se paga. Os membros da lista de espera ajudam a definir o preço final de lançamento.",
    mostPopular: "mais popular",
    period: "/mês",
    tiers: [
      {
        name: "Community",
        price: "0€",
        tagline: "Cliente open source, uma rota, self-service.",
        features: [
          "Cliente open source (MIT)",
          "1 evento · 1 destino",
          "100 execuções / mês",
          "Suporte da comunidade",
        ],
        popular: false,
        cta: "Começar grátis",
      },
      {
        name: "Starter",
        price: "29€",
        tagline: "Para uma pequena equipa de eletricidade.",
        features: [
          "3 eventos",
          "2 destinos",
          "500 execuções / mês",
          "OAuth gerido + novas tentativas",
        ],
        popular: false,
        cta: "Escolher Starter",
      },
      {
        name: "Pro",
        price: "79€",
        tagline: "Para escritórios de engenharia com muito trabalho.",
        features: [
          "Eventos ilimitados",
          "5 destinos",
          "5.000 execuções / mês",
          "Histórico de execuções + suporte prioritário",
        ],
        popular: true,
        cta: "Escolher Pro",
      },
    ],
  },
  faq: {
    eyebrow: "faq",
    heading: "Respostas diretas.",
    items: [
      {
        q: "Que ferramentas ECAD suportam?",
        a: "O Covaga Hub é agnóstico em relação ao ECAD. O cliente open source captura eventos da sua ferramenta CAD e envia-os por POST para o seu tenant. O EPLAN Electric P8 é o primeiro a ser suportado; o cliente foi concebido para que outras ferramentas ECAD possam ser adicionadas da mesma forma.",
      },
      {
        q: "O software CAD precisa de estar aberto?",
        a: "Sim. O cliente corre junto ao seu CAD com uma licença ativa. Enquanto estiver aberto, as integrações são executadas automaticamente à medida que exporta e fecha projetos. Nada é executado quando o software está fechado.",
      },
      {
        q: "O cliente é mesmo open source?",
        a: "Sim — licenciado sob MIT e totalmente auditável pela sua equipa de TI. Pode ler cada linha antes de o instalar, e apenas envia dados de eventos para o URL do seu próprio tenant. Esse é o plano Community: gratuito para sempre.",
      },
      {
        q: "Onde ficam os meus tokens OAuth?",
        a: "Encriptados no router alojado, guardados no servidor. Nunca são armazenados no seu PC. O cliente envia apenas os payloads de eventos, pelo que as credenciais nunca saem do ambiente alojado.",
      },
      {
        q: "Porquê não haver Slack?",
        a: "Porque os escritórios de engenharia não funcionam com Slack. O Covaga Hub foca-se nas ferramentas que realmente utiliza — Microsoft Teams, SharePoint, Drive, email, pastas de rede e PLM/PDM. Um destino HTTP genérico cobre tudo o resto.",
      },
      {
        q: "Temos de mudar a forma como a equipa trabalha?",
        a: "Não. Os engenheiros continuam a exportar PDF e BOM exatamente como fazem hoje. O Covaga Hub deteta esses eventos e entrega-os, por isso não há nenhuma ferramenta nova para aprender.",
      },
    ],
  },
  signup: {
    metaTitle: "Covaga Hub — Entrar na lista",
    metaDescription: "O Covaga Hub está em desenvolvimento. Deixe o seu e-mail e avisamos assim que estiver disponível.",
    eyebrow: "acesso antecipado",
    heading: "O Covaga Hub está quase pronto",
    lead: "Ainda estamos a construir o Covaga Hub. Deixe o seu e-mail e avisamos assim que estiver disponível — uma mensagem, sem spam.",
    emailLabel: "E-mail de trabalho",
    companyLabel: "Empresa (opcional)",
    submit: "Avise-me",
    submitting: "A enviar…",
    errorGeneric: "Algo deu errado. Verifique o seu e-mail e tente novamente.",
    successHeading: "Está na lista",
    successLead: "Obrigado — escrevemos-lhe assim que o Covaga Hub estiver disponível. Entretanto, o cliente e as ferramentas são de código aberto no GitHub.",
    tenantIdLabel: "Tenant ID",
    apiKeyLabel: "API key",
    copy: "copiar",
    nextHeading: "Próximos passos",
    nextSteps: [
      "No painel, abra Conexões e conecte Telegram, Google Drive ou um webhook.",
      "Copie covaga.config para %APPDATA%\\covaga\\ e cole o tenantId e a apiKey.",
      "No EPLAN execute scripts/CovagaPing.cs e escolha na página de Eventos quais eventos rotear.",
    ],
  },
  footer: {
    tagline:
      "Encaminhamento alojado de eventos para escritórios de engenharia. Os seus dados vão para as ferramentas que já utiliza; o cliente permanece open source.",
    productLabel: "produto",
    legalLabel: "legal",
    privacy: "privacidade",
    terms: "termos",
    contact: "contacto",
    disclaimer:
      "O Covaga Hub é um produto independente, sem afiliação ou aprovação por parte da EPLAN ou de qualquer fornecedor de ECAD. Todos os nomes de produtos são marcas comerciais dos respetivos proprietários.",
  },
  legal: {
    back: "voltar ao Covaga Hub",
    lastUpdatedLabel: "última atualização",
    draftLabel: "rascunho",
    updated: "2026-07-05",
    disclaimer:
      "Este documento é um rascunho preliminar e ainda não constitui aconselhamento jurídico. Dúvidas?",
    privacy: {
      eyebrow: "legal · privacy",
      title: "Política de Privacidade",
      intro:
        "Mantemos a recolha de dados ao mínimo e as credenciais no servidor. Eis exatamente o que o Covaga Hub trata e porquê.",
      sections: [
        {
          heading: "Quem somos",
          body: [
            "O Covaga Hub é um produto independente que encaminha eventos ECAD para as ferramentas que as equipas de engenharia usam. Esta política explica que dados tratamos quando utiliza o nosso website e serviço alojado.",
          ],
        },
        {
          heading: "O que recolhemos",
          body: [
            "Website: o site é estático e não usa publicidade nem cookies de rastreamento de terceiros.",
            "Contacto: se nos enviar um email, guardamos a sua mensagem e endereço para responder e, quando relevante, para dar seguimento sobre o produto.",
            "Serviço alojado: quando o seu tenant está ativo, processamos os metadados dos eventos que o seu cliente open source envia (tipo de evento, marcas temporais, referências de ficheiros) para os entregar nos destinos que configura.",
          ],
        },
        {
          heading: "Credenciais",
          body: [
            "Os tokens OAuth e os segredos dos destinos são guardados encriptados, no servidor, no router alojado. Nunca são armazenados na sua estação de trabalho de CAD nem partilhados com terceiros para além do destino que liga.",
          ],
        },
        {
          heading: "Subprocessadores",
          body: [
            "O serviço alojado corre na Cloudflare. Os destinos de entrega (por exemplo Microsoft 365, Google Drive) recebem apenas os payloads que lhes encaminha.",
          ],
        },
        {
          heading: "Os seus direitos",
          body: [
            "Pode pedir-nos a qualquer momento para aceder, corrigir ou apagar os dados pessoais que temos sobre si, enviando um email para hello@covaga.dev. Responderemos dentro de um prazo razoável.",
          ],
        },
        {
          heading: "Alterações",
          body: [
            "Poderemos atualizar esta política à medida que o produto evolui. As alterações significativas serão refletidas pela data de 'última atualização' acima.",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "legal · terms",
      title: "Termos de Serviço",
      intro:
        "Termos simples para um produto pequeno: use uma ferramenta CAD licenciada, encaminhe dados que está autorizado a mover, mantenha as suas próprias cópias de segurança.",
      sections: [
        {
          heading: "O serviço",
          body: [
            "O Covaga Hub fornece um router alojado que recebe eventos ECAD de um cliente open source e os entrega nos destinos que configura. O cliente é licenciado sob MIT; o serviço alojado é oferecido ao abrigo destes termos.",
          ],
        },
        {
          heading: "As suas responsabilidades",
          body: [
            "É responsável por deter licenças válidas para o software CAD que utiliza e para as contas de destino que liga. Só pode encaminhar dados que esteja autorizado a mover.",
          ],
        },
        {
          heading: "O cliente open source",
          body: [
            "O cliente é fornecido ao abrigo da licença MIT, no estado em que se encontra, sem garantia. É livre de o ler, auditar, executar e modificar dentro dos termos dessa licença.",
          ],
        },
        {
          heading: "Disponibilidade",
          body: [
            "Procuramos uma entrega fiável, mas não garantimos um serviço ininterrupto. Os eventos podem ser repetidos em caso de falha; as falhas persistentes são-lhe comunicadas.",
          ],
        },
        {
          heading: "Responsabilidade",
          body: [
            "Na medida permitida por lei, o Covaga Hub não é responsável por perdas indiretas ou consequenciais decorrentes da utilização do serviço. O serviço alojado move os seus ficheiros; é da sua responsabilidade manter cópias de segurança independentes.",
          ],
        },
        {
          heading: "Alterações",
          body: [
            "Poderemos atualizar estes termos à medida que o produto evolui. A continuação da utilização após uma alteração constitui a aceitação dos termos atualizados.",
          ],
        },
      ],
    },
  },
};

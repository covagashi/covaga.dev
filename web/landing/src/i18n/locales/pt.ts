import type { SiteContent } from "../types";

// Portuguese (pt) — mirrors the English source keys.
export const pt: SiteContent = {
  meta: {
    homeTitle: "byndr — Encaminhe as suas exportações ECAD para qualquer lado",
    homeDescription:
      "O byndr deteta as suas exportações ECAD — PDF, BOM, fecho de projeto — e entrega-as no Teams, SharePoint, Drive ou email. As credenciais permanecem no servidor; o cliente permanece open source.",
    privacyTitle: "byndr — Privacidade",
    privacyDescription:
      "Como o byndr trata os dados no seu website e no serviço alojado de encaminhamento de eventos.",
    termsTitle: "byndr — Termos",
    termsDescription:
      "Os termos que regem a utilização do serviço alojado de encaminhamento de eventos byndr e do cliente open source.",
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
    getStarted: "Começar",
  },
  hero: {
    eyebrowTo: "entregue",
    headingPre: "Eventos CAD, encaminhados",
    leadHtml:
      'O byndr deteta as suas exportações <strong class="font-semibold text-[var(--color-ink)]">ECAD</strong> e entrega-as no Teams, SharePoint, Drive ou email — as credenciais permanecem no servidor.',
    ctaPrimary: "Começar",
    ctaSecondary: "Ver como funciona",
    schemaTitle: "Esquema de encaminhamento de eventos",
    schemaDesc:
      "Esquema de ligações: três terminais de eventos ECAD à esquerda são encaminhados através do módulo central byndr para os terminais SharePoint, Teams, Drive e Email à direita.",
    figCaption: "fig. 01 — esquema de encaminhamento de eventos",
  },
  problem: {
    eyebrow: "a mudança",
    heading: "Integrações sem o projeto de integração.",
    todayLabel: "// hoje",
    withLabel: "// com o byndr",
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
      "Sem Slack? De propósito — o byndr fala a stack M365 + PLM que o seu escritório já utiliza. Precisa de outra coisa? Um destino HTTP genérico reencaminha o payload para qualquer lado.",
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
        a: "O byndr é agnóstico em relação ao ECAD. O cliente open source captura eventos da sua ferramenta CAD e envia-os por POST para o seu tenant. O EPLAN Electric P8 é o primeiro a ser suportado; o cliente foi concebido para que outras ferramentas ECAD possam ser adicionadas da mesma forma.",
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
        a: "Porque os escritórios de engenharia não funcionam com Slack. O byndr foca-se nas ferramentas que realmente utiliza — Microsoft Teams, SharePoint, Drive, email, pastas de rede e PLM/PDM. Um destino HTTP genérico cobre tudo o resto.",
      },
      {
        q: "Temos de mudar a forma como a equipa trabalha?",
        a: "Não. Os engenheiros continuam a exportar PDF e BOM exatamente como fazem hoje. O byndr deteta esses eventos e entrega-os, por isso não há nenhuma ferramenta nova para aprender.",
      },
    ],
  },
  signup: {
    metaTitle: "byndr — Começar",
    metaDescription: "Crie o seu tenant byndr: conecte um bot do Telegram e roteie os seus eventos ECAD em minutos.",
    eyebrow: "começar",
    heading: "Crie o seu tenant",
    lead: "Crie o seu tenant apenas com o seu e-mail. As conexões e o roteamento de eventos são configurados depois no painel. Sem cartão.",
    emailLabel: "E-mail de trabalho",
    companyLabel: "Empresa (opcional)",
    submit: "Criar tenant",
    submitting: "Criando…",
    errorGeneric: "Algo deu errado. Verifique os campos e tente novamente.",
    successHeading: "Tenant criado — guarde a sua chave",
    successLead: "Guarde a API key agora: é mostrada uma única vez. Depois configure a sua primeira conexão no painel.",
    tenantIdLabel: "Tenant ID",
    apiKeyLabel: "API key",
    copy: "copiar",
    nextHeading: "Próximos passos",
    nextSteps: [
      "No painel, abra Conexões e conecte Telegram, Google Drive ou um webhook.",
      "Copie byndr.config para %APPDATA%\\byndr\\ e cole o tenantId e a apiKey.",
      "No EPLAN execute scripts/ByndrPing.cs e escolha na página de Eventos quais eventos rotear.",
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
      "O byndr é um produto independente, sem afiliação ou aprovação por parte da EPLAN ou de qualquer fornecedor de ECAD. Todos os nomes de produtos são marcas comerciais dos respetivos proprietários.",
  },
  legal: {
    back: "voltar ao byndr",
    lastUpdatedLabel: "última atualização",
    draftLabel: "rascunho",
    updated: "2026-07-05",
    disclaimer:
      "Este documento é um rascunho preliminar e ainda não constitui aconselhamento jurídico. Dúvidas?",
    privacy: {
      eyebrow: "legal · privacy",
      title: "Política de Privacidade",
      intro:
        "Mantemos a recolha de dados ao mínimo e as credenciais no servidor. Eis exatamente o que o byndr trata e porquê.",
      sections: [
        {
          heading: "Quem somos",
          body: [
            "O byndr é um produto independente que encaminha eventos ECAD para as ferramentas que as equipas de engenharia usam. Esta política explica que dados tratamos quando utiliza o nosso website e serviço alojado.",
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
            "Pode pedir-nos a qualquer momento para aceder, corrigir ou apagar os dados pessoais que temos sobre si, enviando um email para hello@covaga.xyz. Responderemos dentro de um prazo razoável.",
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
            "O byndr fornece um router alojado que recebe eventos ECAD de um cliente open source e os entrega nos destinos que configura. O cliente é licenciado sob MIT; o serviço alojado é oferecido ao abrigo destes termos.",
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
            "Na medida permitida por lei, o byndr não é responsável por perdas indiretas ou consequenciais decorrentes da utilização do serviço. O serviço alojado move os seus ficheiros; é da sua responsabilidade manter cópias de segurança independentes.",
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

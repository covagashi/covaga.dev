import type { SiteContent } from "../types";

// Korean — mirrors the English source-of-truth keys.
export const ko: SiteContent = {
  meta: {
    umbrellaTitle: "Covaga — EPLAN 엔지니어를 위한 오픈 툴킷",
    umbrellaDescription:
      "EPLAN 전기 엔지니어를 위한 세 가지 오픈 도구: AI로 EPLAN을 구동하고(eplan-rag-mcp), 어떤 브라우저에서든 프로젝트를 열고(ecad-view), 이벤트를 사무실이 운영하는 도구로 라우팅합니다(Covaga Hub). Cloudflare 기반으로 구축되었습니다.",
    homeTitle: "Covaga Hub — ECAD 내보내기를 어디로든 라우팅",
    homeDescription:
      "Covaga Hub는 여러분의 ECAD 내보내기 — PDF, BOM, 프로젝트 마감 — 를 감지하여 Teams, SharePoint, Drive 또는 이메일로 전달합니다. 자격 증명은 서버 측에 보관되고, 클라이언트는 오픈 소스로 공개됩니다.",
    privacyTitle: "Covaga — 개인정보 처리방침",
    privacyDescription:
      "Covaga가 웹사이트와 호스팅형 서비스 전반에서 데이터를 처리하는 방식입니다.",
    termsTitle: "Covaga — 이용약관",
    termsDescription:
      "Covaga Hub 호스팅형 서비스와 오픈 소스 Covaga 도구의 이용을 규율하는 약관입니다.",
  },
  umbrella: {
    nav: {
      tools: "도구",
      open: "오픈 소스",
      getHub: "Hub 시작하기",
    },
    hero: {
      eyebrow: "eplan을 위한 오픈 툴킷",
      heading: "EPLAN 프로젝트로 더 많은 일을 하세요",
      leadHtml:
        '전기 엔지니어를 위한 세 가지 오픈 도구 — AI로 <strong class="font-semibold text-[var(--color-ink)]">EPLAN</strong>을 구동하고, 어떤 브라우저에서든 프로젝트를 열고, 이벤트를 사무실이 이미 운영하는 도구로 라우팅하세요. 무료로 시작하고, 직접 호스팅하세요.',
      ctaPrimary: "툴킷 둘러보기",
      ctaSecondary: "무료로 시작",
      specChips: [
        { label: "stack", value: "cloudflare" },
        { label: "core", value: "open source" },
        { label: "i18n", value: "7 locales" },
      ],
      schemaTitle: "Covaga 툴킷 회로도",
      schemaDesc:
        "배선 회로도: 왼쪽의 EPLAN P8 소스 단자가 중앙의 covaga 버스 모듈에 공급하고, 이 모듈이 오른쪽의 세 개 도구 단자 — rag-mcp, ecad-view, hub — 로 갈라져 나갑니다.",
      figCaption: "fig. 01 — 툴킷 회로도",
      figFlow: "eplan → covaga → tools",
    },
    tools: {
      eyebrow: "도구 · 03",
      heading: "하나의 툴킷, 세 개의 모듈.",
      lead: "각 도구는 실제 EPLAN의 빈틈 하나를 해결하며 독립적으로 실행됩니다 — 하나만 고르거나 셋 모두 연결하세요. 둘은 여러분이 직접 호스팅하는 오픈 소스이고, 플랫폼은 여러분을 위해 호스팅됩니다.",
      statusOssLabel: "오픈 소스",
      statusHostedLabel: "오픈 코어 · 호스팅형",
      items: [
        {
          ref: "U1 · MCP",
          name: "eplan-rag-mcp",
          what: "AI로 EPLAN을 구동하세요.",
          body: "QuietMode에서 149개의 EPLAN 액션을 조용히 실행하는 로컬 MCP 서버로, P8와 EEC Pro 2026을 위한 RAG 문서와 올바른 EPLAN 스크립트를 작성하는 Claude Code 스킬이 함께 제공됩니다.",
          chips: [
            { label: "tools", value: "156" },
            { label: "rag", value: "p8 + eec" },
            { label: "runtime", value: "local" },
          ],
          status: "오픈 소스",
          statusKind: "oss",
          links: [
            { label: "GitHub ↗", href: "https://github.com/covagashi/eplan-rag-mcp" },
          ],
          primary: false,
        },
        {
          ref: "U2 · VIEWER",
          name: "ecad-view",
          what: "브라우저에서 프로젝트를 여세요.",
          body: ".epdz 내보내기나 .e3d 부품을 끌어다 놓으면 어떤 브라우저에서든 열람할 수 있습니다 — 3D 모델, 회로도 페이지, 장치 검색, 상호 참조까지. 오프라인 PWA이며, 파일은 기기를 절대 떠나지 않습니다.",
          chips: [
            { label: "fmt", value: ".epdz / .e3d" },
            { label: "3d", value: "three.js" },
            { label: "runs", value: "client-side" },
          ],
          status: "오픈 소스",
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
          what: "이벤트 라우팅 · 데이터 빈틈 메우기.",
          body: "호스팅형 플랫폼. EPLAN 이벤트 — PDF, BOM, 프로젝트 마감 — 를 Teams, SharePoint, Drive 또는 이메일로 라우팅하고, 검토된 AI 제안을 통해 아티클 데이터베이스의 텍스트 빈틈을 메웁니다. 자격 증명은 서버 측에 보관됩니다.",
          chips: [
            { label: "mode", value: "hosted" },
            { label: "tenancy", value: "multi" },
            { label: "gym", value: "mcp" },
          ],
          status: "오픈 코어 · 호스팅형",
          statusKind: "hosted",
          links: [{ label: "hub.covaga.dev", href: "/hub" }],
          primary: true,
        },
      ],
    },
    principles: {
      eyebrow: "covaga를 만드는 방식",
      heading: "엔지니어링 사무실의 규칙.",
      items: [
        {
          title: "기본은 오픈",
          body: "로컬 도구는 오픈 소스이며 무료로 실행할 수 있습니다 — 설치 전에 모든 코드를 읽고, IT 팀과 함께 감사하고, 어디서든 직접 호스팅하세요.",
        },
        {
          title: "여러분의 팀이 일하는 곳에서",
          body: "새로 배울 도구가 없습니다. Covaga는 EPLAN과 여러분의 사무실이 이미 운영하는 M365 스택의 언어를 씁니다. 엔지니어는 오늘 하던 그대로 계속 내보내면 됩니다.",
        },
        {
          title: "여러분의 데이터는 여러분의 것",
          body: "프로젝트는 여러분의 기기에서 렌더링되고, 실제 아티클 데이터는 저장소가 아니라 여러분 자신의 데이터베이스에 존재합니다. 호스팅형 워커는 파일이 아니라 자격 증명을 보관합니다.",
        },
      ],
    },
    cta: {
      eyebrow: "시작하기",
      heading: "하나의 도구로 시작하세요. 준비되면 나머지를 연결하세요.",
      primary: "Hub 테넌트 만들기",
      secondary: "저장소 둘러보기",
    },
    footer: {
      tagline:
        "Cloudflare 기반으로 구축된, EPLAN 전기 엔지니어를 위한 오픈 툴킷. AI로 EPLAN을 구동하고, 어디서든 프로젝트를 열고, 이벤트를 이미 사용 중인 도구로 라우팅하세요.",
      net: "covaga.xyz의 일부",
      toolsLabel: "도구",
      codeLabel: "코드",
      projectLabel: "프로젝트",
      localesLabel: "7개 언어로 제공",
    },
  },
  a11y: {
    skipToContent: "본문으로 건너뛰기",
    primaryNav: "주요 메뉴",
    sectionsNav: "섹션",
    legalNav: "법적 고지",
    toggleMenu: "메뉴 열기/닫기",
    languageLabel: "언어",
  },
  banner: {
    message: "이 사이트는 한국어로 제공됩니다.",
    view: "한국어로 보기",
    dismiss: "나중에",
  },
  nav: {
    how: "작동 방식",
    events: "이벤트",
    pricing: "요금제",
    faq: "faq",
    getStarted: "시작하기",
  },
  hero: {
    eyebrowTo: "전달 완료",
    headingPre: "CAD 이벤트, 라우팅되다",
    leadHtml:
      'Covaga Hub는 여러분의 <strong class="font-semibold text-[var(--color-ink)]">ECAD</strong> 내보내기를 감지하여 Teams, SharePoint, Drive 또는 이메일로 전달합니다 — 자격 증명은 서버 측에 보관됩니다.',
    ctaPrimary: "시작하기",
    ctaSecondary: "작동 방식 보기",
    schemaTitle: "이벤트 라우팅 회로도",
    schemaDesc:
      "배선 회로도: 왼쪽의 세 개 ECAD 이벤트 단자가 Covaga 허브 모듈을 거쳐 오른쪽의 SharePoint, Teams, Drive, Email 단자로 라우팅됩니다.",
    figCaption: "fig. 01 — 이벤트 라우팅 회로도",
  },
  problem: {
    eyebrow: "변화의 흐름",
    heading: "통합 프로젝트 없는 통합.",
    todayLabel: "// 오늘날",
    withLabel: "// Covaga Hub와 함께",
    today: [
      {
        title: "일회성 로컬 매크로",
        body: "건당 200€에서 2,400€에 의뢰한 맞춤형 내보내기 스크립트가 단일 워크스테이션에만 존재합니다. 유지보수는 영원히 여러분의 몫이며, 동료가 장비를 바꾸면 작동을 멈춥니다.",
      },
      {
        title: "무거운 PLM / ERP 커넥터",
        body: "라이선스 비용이 비싸고 도입이 느린 엔터프라이즈 미들웨어입니다 — 도면 하나를 SharePoint에 정리하려는 소규모 전기 설계팀에는 지나치게 과합니다.",
      },
      {
        title: "CAD PC에 놓인 자격 증명",
        body: "OAuth 토큰과 API 키가 로컬 설정 파일에 놓여 있어, 공급자나 웹훅 시크릿이 교체될 때마다 만료됩니다.",
      },
    ],
    solution: [
      {
        title: "코드가 아니라 설정된 경로",
        body: "ECAD 이벤트를 목적지로 지정하기만 하면 끝입니다. PDF 내보내기를 몇 분 만에 Teams 알림이나 SharePoint 업로드로 바꿔 보세요.",
      },
      {
        title: "서버 측에 보관되는 자격 증명",
        body: "OAuth 토큰은 호스팅형 라우터에 암호화되어 저장됩니다. PC에 설치된 오픈 소스 클라이언트는 이벤트 데이터만 전송하며, 비밀 정보는 절대 보내지 않습니다.",
      },
      {
        title: "항상 최신 상태로 유지",
        body: "공급자가 API를 변경하면 호스팅형 워커가 중앙에서 업데이트됩니다. 엔지니어링 장비에서 다시 배포할 것은 아무것도 없습니다.",
      },
    ],
  },
  how: {
    eyebrow: "작동 방식",
    heading: "CAD 이벤트에서 전달까지, 세 단계.",
    steps: [
      {
        title: "ECAD 이벤트가 발생합니다",
        body: "PDF 내보내기, BOM 내보내기, 또는 프로젝트 마감이 평소 작업 중에 ECAD 도구 안에서 일어납니다 — 아무도 도면 그리는 방식을 바꾸지 않습니다.",
      },
      {
        title: "오픈 소스 클라이언트가 JSON을 POST합니다",
        body: "CAD와 함께 실행되는 경량 클라이언트가 작은 JSON 페이로드를 여러분의 전용 테넌트 URL로 보냅니다. 비밀 정보는 PC를 떠나지 않습니다.",
      },
      {
        title: "라우터가 전달합니다",
        body: "호스팅형 워커가 이벤트를 변환하여 목적지로 전달합니다: Teams, SharePoint, Google Drive, 이메일, 또는 모든 HTTP 엔드포인트.",
      },
    ],
  },
  events: {
    eyebrow: "이벤트 · src",
    heading: "여러분의 ECAD가 촉발할 수 있는 것들.",
    lead: "각 이벤트는 실제 EPLAN API 액션에 매핑됩니다 — 대부분의 통합이 결코 건드리지 않는 것들까지 포함해서 말입니다.",
    liveLabel: "제공 중",
    soonLabel: "곧 제공",
    items: [
      {
        id: "pdf-exported",
        title: "PDF 내보냄",
        body: "프로젝트에서 회로도나 문서 PDF가 내보내질 때 발생합니다.",
        action: "action export · PDF",
        soon: false,
      },
      {
        id: "bom-exported",
        title: "BOM / 부품 목록 내보냄",
        body: "자재 명세서, 부품 목록, 또는 단자 라벨이 내보내질 때 발생합니다.",
        action: "action label",
        soon: false,
      },
      {
        id: "dxf-dwg-exported",
        title: "DXF / DWG 내보냄",
        body: "기계 설계나 고객 전달을 위해 페이지 또는 프로젝트가 DXF나 DWG로 내보내질 때 발생합니다.",
        action: "action export · DXF/DWG",
        soon: true,
      },
      {
        id: "project-backed-up",
        title: "프로젝트 백업됨",
        body: "프로젝트 백업(.zw1)이 생성될 때 발생합니다 — 오프사이트 보관에 바로 사용할 수 있습니다.",
        action: "action backup",
        soon: true,
      },
      {
        id: "wiring-exported",
        title: "생산 배선 내보냄",
        body: "장비 제작을 위한 생산 배선 데이터가 내보내질 때 발생합니다.",
        action: "action ExportProductionWiring",
        soon: true,
      },
      {
        id: "project-closed",
        title: "프로젝트 닫힘",
        body: "프로젝트가 닫힐 때 발생합니다 — 승인 및 보관 흐름에 유용합니다.",
        action: "event lifecycle",
        soon: true,
      },
    ],
    destEyebrow: "목적지 · dst",
    destHeading: "어디로 가는가 — 엔지니어가 쓰는 도구들.",
    destSoonLabel: "곧",
    destinations: [
      {
        title: "Microsoft Teams",
        body: "모든 이벤트마다 채널에 메시지를 게시합니다.",
        soon: false,
      },
      {
        title: "SharePoint",
        body: "내보낸 파일을 프로젝트 문서 라이브러리에 정리합니다.",
        soon: false,
      },
      {
        title: "Google Drive",
        body: "내보낸 파일을 공유 폴더에 업로드합니다.",
        soon: false,
      },
      {
        title: "Email",
        body: "내보낸 파일을 배포 목록이나 받은편지함으로 보냅니다.",
        soon: false,
      },
      {
        title: "네트워크 폴더",
        body: "작은 에이전트를 통해 파일을 공유 드라이브에 떨어뜨립니다.",
        soon: false,
      },
      {
        title: "PLM / PDM",
        body: "도면을 Vault, SolidWorks PDM 또는 Windchill에 체크인합니다.",
        soon: true,
      },
    ],
    footnote:
      "Slack이 없다고요? 의도된 설계입니다 — Covaga Hub는 여러분의 사무실이 이미 운영하는 M365 + PLM 스택의 언어를 씁니다. 다른 것이 필요한가요? 범용 HTTP 목적지가 페이로드를 어디로든 전달합니다.",
  },
  pricing: {
    eyebrow: "요금제",
    heading: "오픈 코어. 실행은 무료, 호스팅은 유료.",
    lead: "클라이언트는 오픈 소스이며 영원히 무료입니다. 자격 증명 관리, 재시도, 이력을 제공하는 호스팅형 라우터가 유료 대상입니다. 대기자 명단 참여자는 최종 출시 가격 책정을 함께 돕습니다.",
    mostPopular: "가장 인기",
    period: "/월",
    tiers: [
      {
        name: "Community",
        price: "0€",
        tagline: "오픈 소스 클라이언트, 1개 경로, 셀프서비스.",
        features: [
          "오픈 소스 클라이언트 (MIT)",
          "이벤트 1개 · 목적지 1개",
          "월 100회 실행",
          "커뮤니티 지원",
        ],
        popular: false,
        cta: "무료로 시작",
      },
      {
        name: "Starter",
        price: "29€",
        tagline: "소규모 전기 설계팀을 위한 요금제.",
        features: [
          "이벤트 3개",
          "목적지 2개",
          "월 500회 실행",
          "OAuth 관리 + 재시도",
        ],
        popular: false,
        cta: "Starter 선택",
      },
      {
        name: "Pro",
        price: "79€",
        tagline: "바쁜 엔지니어링 사무실을 위한 요금제.",
        features: [
          "무제한 이벤트",
          "목적지 5개",
          "월 5,000회 실행",
          "실행 이력 + 우선 지원",
        ],
        popular: true,
        cta: "Pro 선택",
      },
    ],
  },
  faq: {
    eyebrow: "faq",
    heading: "명료한 답변.",
    items: [
      {
        q: "어떤 ECAD 도구를 지원하나요?",
        a: "Covaga Hub는 ECAD에 종속되지 않습니다. 오픈 소스 클라이언트가 여러분의 CAD 도구에서 이벤트를 포착하여 테넌트로 POST합니다. EPLAN Electric P8을 가장 먼저 지원하며, 클라이언트는 다른 ECAD 도구도 같은 방식으로 추가할 수 있도록 설계되었습니다.",
      },
      {
        q: "CAD 소프트웨어가 켜져 있어야 하나요?",
        a: "네. 클라이언트는 활성 라이선스가 있는 CAD와 함께 실행됩니다. CAD가 켜져 있는 동안에는 여러분이 프로젝트를 내보내고 닫을 때 통합이 자동으로 실행됩니다. 소프트웨어가 닫혀 있을 때는 아무것도 실행되지 않습니다.",
      },
      {
        q: "클라이언트가 정말 오픈 소스인가요?",
        a: "네 — MIT 라이선스이며 여러분의 IT 팀이 완전히 감사할 수 있습니다. 설치 전에 모든 코드를 읽어볼 수 있고, 클라이언트는 오직 여러분 자신의 테넌트 URL로만 이벤트 데이터를 보냅니다. 그것이 바로 Community 등급입니다: 영원히 무료.",
      },
      {
        q: "제 OAuth 토큰은 어디에 저장되나요?",
        a: "호스팅형 라우터에 암호화되어 서버 측에 보관됩니다. 여러분의 PC에는 절대 저장되지 않습니다. 클라이언트는 이벤트 페이로드만 전송하므로 자격 증명은 호스팅 환경을 결코 벗어나지 않습니다.",
      },
      {
        q: "왜 Slack은 없나요?",
        a: "엔지니어링 사무실은 Slack으로 돌아가지 않기 때문입니다. Covaga Hub는 여러분이 실제로 사용하는 도구 — Microsoft Teams, SharePoint, Drive, 이메일, 네트워크 폴더, 그리고 PLM/PDM — 를 대상으로 합니다. 그 밖의 것은 범용 HTTP 목적지가 처리합니다.",
      },
      {
        q: "팀의 업무 방식을 바꿔야 하나요?",
        a: "아니요. 엔지니어는 오늘 하던 그대로 PDF와 BOM을 내보내면 됩니다. Covaga Hub가 그 이벤트를 감지하여 전달하므로 새로 배워야 할 도구가 없습니다.",
      },
    ],
  },
  signup: {
    metaTitle: "Covaga Hub — 시작하기",
    metaDescription: "Covaga Hub 테넌트 생성: Telegram 봇을 연결하고 몇 분 만에 ECAD 이벤트를 라우팅하세요.",
    eyebrow: "시작하기",
    heading: "테넌트 만들기",
    lead: "이메일만으로 테넌트를 만드세요. 연결과 이벤트 라우팅은 이후 대시보드에서 설정합니다. 신용카드 불필요.",
    emailLabel: "업무용 이메일",
    companyLabel: "회사명 (선택)",
    submit: "테넌트 생성",
    submitting: "생성 중…",
    errorGeneric: "문제가 발생했습니다. 입력값을 확인하고 다시 시도하세요.",
    successHeading: "테넌트 생성 완료 — 키를 저장하세요",
    successLead: "API 키는 한 번만 표시되므로 지금 저장하세요. 이후 대시보드에서 첫 연결을 설정하세요.",
    tenantIdLabel: "Tenant ID",
    apiKeyLabel: "API 키",
    copy: "복사",
    nextHeading: "다음 단계",
    nextSteps: [
      "대시보드의 Connections에서 Telegram, Google Drive 또는 웹훅을 연결합니다.",
      "covaga.config를 %APPDATA%\\covaga\\에 복사하고 tenantId와 apiKey를 붙여넣습니다.",
      "EPLAN에서 scripts/CovagaPing.cs를 실행한 뒤 Events 페이지에서 라우팅할 이벤트를 선택합니다.",
    ],
  },
  footer: {
    tagline:
      "엔지니어링 사무실을 위한 호스팅형 이벤트 라우팅. 여러분의 데이터는 이미 사용 중인 도구로 이동하고, 클라이언트는 오픈 소스로 유지됩니다.",
    productLabel: "제품",
    legalLabel: "법적 고지",
    privacy: "개인정보",
    terms: "약관",
    contact: "문의",
    disclaimer:
      "Covaga Hub는 독립 제품이며, EPLAN 또는 어떤 ECAD 공급업체와도 제휴하거나 보증받지 않았습니다. 모든 제품명은 해당 소유자의 상표입니다.",
  },
  legal: {
    back: "Covaga Hub로 돌아가기",
    lastUpdatedLabel: "최종 업데이트",
    draftLabel: "초안",
    updated: "2026-07-05",
    disclaimer:
      "본 문서는 초기 초안이며 아직 법적 자문을 구성하지 않습니다. 문의가 있으신가요?",
    privacy: {
      eyebrow: "법적 고지 · privacy",
      title: "개인정보 처리방침",
      intro:
        "데이터 수집은 최소한으로, 자격 증명은 서버 측에 보관합니다. Covaga Hub가 처리하는 것과 그 이유를 정확히 설명합니다.",
      sections: [
        {
          heading: "우리는 누구인가",
          body: [
            "Covaga Hub는 ECAD 이벤트를 엔지니어링 팀이 사용하는 도구로 라우팅하는 독립 제품입니다. 본 방침은 여러분이 저희 웹사이트와 호스팅형 서비스를 이용할 때 저희가 어떤 데이터를 처리하는지 설명합니다.",
          ],
        },
        {
          heading: "수집하는 정보",
          body: [
            "웹사이트: 사이트는 정적이며 광고나 제3자 추적 쿠키를 사용하지 않습니다.",
            "문의: 여러분이 이메일을 보내면, 답신을 위해, 그리고 필요한 경우 제품에 관한 후속 연락을 위해 메시지와 주소를 보관합니다.",
            "호스팅형 서비스: 테넌트가 활성 상태일 때, 오픈 소스 클라이언트가 보내는 이벤트 메타데이터(이벤트 유형, 타임스탬프, 파일 참조)를 처리하여 여러분이 구성한 목적지로 전달합니다.",
          ],
        },
        {
          heading: "자격 증명",
          body: [
            "OAuth 토큰과 목적지 시크릿은 호스팅형 라우터에 암호화되어 서버 측에 보관됩니다. CAD 워크스테이션에는 절대 저장되지 않으며, 여러분이 연결한 목적지를 넘어 제3자와 공유되지 않습니다.",
          ],
        },
        {
          heading: "하위 처리자",
          body: [
            "호스팅형 서비스는 Cloudflare에서 실행됩니다. 전달 목적지(예: Microsoft 365, Google Drive)는 여러분이 그곳으로 라우팅한 페이로드만 수신합니다.",
          ],
        },
        {
          heading: "여러분의 권리",
          body: [
            "여러분은 hello@covaga.dev로 이메일을 보내 저희가 보유한 개인정보에 대한 접근, 정정, 삭제를 언제든지 요청할 수 있습니다. 저희는 합리적인 기간 내에 응답하겠습니다.",
          ],
        },
        {
          heading: "변경 사항",
          body: [
            "제품이 발전함에 따라 본 방침을 업데이트할 수 있습니다. 중요한 변경 사항은 위의 '최종 업데이트' 날짜에 반영됩니다.",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "법적 고지 · terms",
      title: "이용약관",
      intro:
        "작은 제품을 위한 명료한 약관: 라이선스가 있는 CAD 도구를 실행하고, 이동이 허용된 데이터를 라우팅하며, 자신의 백업을 직접 보관하세요.",
      sections: [
        {
          heading: "서비스",
          body: [
            "Covaga Hub는 오픈 소스 클라이언트로부터 ECAD 이벤트를 수신하여 여러분이 구성한 목적지로 전달하는 호스팅형 라우터를 제공합니다. 클라이언트는 MIT 라이선스이며, 호스팅형 서비스는 본 약관에 따라 제공됩니다.",
          ],
        },
        {
          heading: "여러분의 책임",
          body: [
            "여러분은 실행하는 CAD 소프트웨어와 연결하는 목적지 계정에 대한 유효한 라이선스를 보유할 책임이 있습니다. 이동이 승인된 데이터만 라우팅해야 합니다.",
          ],
        },
        {
          heading: "오픈 소스 클라이언트",
          body: [
            "클라이언트는 MIT 라이선스에 따라 있는 그대로(as-is), 어떠한 보증도 없이 제공됩니다. 여러분은 해당 라이선스의 조건 내에서 자유롭게 읽고, 감사하고, 실행하고, 수정할 수 있습니다.",
          ],
        },
        {
          heading: "가용성",
          body: [
            "저희는 안정적인 전달을 목표로 하지만 중단 없는 서비스를 보장하지는 않습니다. 이벤트는 실패 시 재시도될 수 있으며, 지속적인 실패는 여러분에게 표시됩니다.",
          ],
        },
        {
          heading: "책임",
          body: [
            "법이 허용하는 범위 내에서, Covaga Hub는 서비스 사용으로 발생하는 간접적 또는 결과적 손해에 대해 책임을 지지 않습니다. 호스팅형 서비스는 여러분의 파일을 이동시키며, 독립적인 백업을 유지하는 것은 여러분의 책임입니다.",
          ],
        },
        {
          heading: "변경 사항",
          body: [
            "제품이 발전함에 따라 본 약관을 업데이트할 수 있습니다. 변경 이후 계속 사용하는 것은 업데이트된 약관에 대한 동의로 간주됩니다.",
          ],
        },
      ],
    },
  },
};

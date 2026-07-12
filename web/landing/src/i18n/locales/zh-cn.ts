import type { SiteContent } from "../types";

// Simplified Chinese (zh-cn) — mirrors the English source keys.
export const zhCn: SiteContent = {
  meta: {
    homeTitle: "byndr — 将你的 ECAD 导出内容路由到任何地方",
    homeDescription:
      "byndr 监听你的 ECAD 导出事件 — PDF、BOM、项目归档 — 并将它们送达 Teams、SharePoint、Drive 或 Email。凭据始终留在服务端；客户端始终开源。",
    privacyTitle: "byndr — 隐私政策",
    privacyDescription:
      "byndr 在其网站及托管的事件路由服务中如何处理数据。",
    termsTitle: "byndr — 服务条款",
    termsDescription:
      "管辖 byndr 托管事件路由服务及开源客户端使用的条款。",
  },
  a11y: {
    skipToContent: "跳到正文",
    primaryNav: "主导航",
    sectionsNav: "章节导航",
    legalNav: "法律信息",
    toggleMenu: "切换菜单",
    languageLabel: "语言",
  },
  banner: {
    message: "本网站提供简体中文版本。",
    view: "查看简体中文",
    dismiss: "暂不",
  },
  nav: {
    how: "原理",
    events: "事件",
    pricing: "定价",
    faq: "faq",
    getStarted: "立即开始",
  },
  hero: {
    eyebrowTo: "送达",
    headingPre: "CAD 事件，即刻路由",
    leadHtml:
      'byndr 监听你的 <strong class="font-semibold text-[var(--color-ink)]">ECAD</strong> 导出内容，并将它们送达 Teams、SharePoint、Drive 或 Email — 凭据始终留在服务端。',
    ctaPrimary: "立即开始",
    ctaSecondary: "查看工作原理",
    schemaTitle: "事件路由原理图",
    schemaDesc:
      "接线原理图：左侧三个 ECAD 事件端子经由 byndr 中枢模块路由至右侧的 SharePoint、Teams、Drive 和 Email 端子。",
    figCaption: "图 01 — 事件路由原理图",
  },
  problem: {
    eyebrow: "the shift",
    heading: "无需集成项目的集成。",
    todayLabel: "// 现状",
    withLabel: "// 使用 byndr",
    today: [
      {
        title: "一次性的本地宏",
        body: "定制导出脚本每个需花费 200€ 到 2,400€，只运行在单台工作站上。维护责任永远归你，而当同事更换机器时它们就会失灵。",
      },
      {
        title: "笨重的 PLM / ERP 连接器",
        body: "企业级中间件授权昂贵、部署缓慢 — 对于一个只想把图纸归档到 SharePoint 的小型电气团队而言，这远远超出所需。",
      },
      {
        title: "凭据留在 CAD 电脑上",
        body: "OAuth 令牌和 API 密钥散落在本地配置文件中，每当供应商或 webhook 密钥轮换时就会失效。",
      },
    ],
    solution: [
      {
        title: "配置路由，而非编写代码",
        body: "把一个 ECAD 事件指向一个目的地，就完成了。几分钟内即可把一次 PDF 导出变成一条 Teams 通知或一次 SharePoint 上传。",
      },
      {
        title: "凭据托管在服务端",
        body: "OAuth 令牌加密存放在托管路由器中。你电脑上的开源客户端只发送事件数据 — 从不发送任何密钥。",
      },
      {
        title: "由我们为你保持更新",
        body: "当供应商变更其 API 时，托管工作进程会在中心统一更新。你的工程机器上无需重新部署任何东西。",
      },
    ],
  },
  how: {
    eyebrow: "how it works",
    heading: "三步走，从 CAD 事件到成功送达。",
    steps: [
      {
        title: "一个 ECAD 事件触发",
        body: "在正常工作中，你的 ECAD 工具内发生一次 PDF 导出、一次 BOM 导出或一次项目归档 — 没有人需要改变绘图习惯。",
      },
      {
        title: "开源客户端 POST 出 JSON",
        body: "一个与你的 CAD 一起运行的轻量客户端，向你的私有租户 URL 发送一小段 JSON 负载。没有任何密钥离开电脑。",
      },
      {
        title: "路由器完成送达",
        body: "托管工作进程转换该事件，并将其送达你的目的地：Teams、SharePoint、Google Drive、Email，或任意 HTTP 端点。",
      },
    ],
  },
  events: {
    eyebrow: "events · src",
    heading: "你的 ECAD 能触发什么。",
    lead: "每个事件都映射到一个真实的 EPLAN API action — 包括那些大多数集成从未触及的动作。",
    liveLabel: "已上线",
    soonLabel: "即将推出",
    items: [
      {
        id: "pdf-exported",
        title: "PDF 已导出",
        body: "当从项目中导出原理图或文档 PDF 时触发。",
        action: "action export · PDF",
        soon: false,
      },
      {
        id: "bom-exported",
        title: "BOM / 物料清单已导出",
        body: "当导出物料清单、零件表或端子标签时触发。",
        action: "action label",
        soon: false,
      },
      {
        id: "dxf-dwg-exported",
        title: "DXF / DWG 已导出",
        body: "当页面或项目被导出为 DXF 或 DWG 以用于机械或客户交接时触发。",
        action: "action export · DXF/DWG",
        soon: true,
      },
      {
        id: "project-backed-up",
        title: "项目已备份",
        body: "当创建项目备份（.zw1）时触发 — 可随时用于异地归档。",
        action: "action backup",
        soon: true,
      },
      {
        id: "wiring-exported",
        title: "生产接线已导出",
        body: "当导出用于机器制造的生产接线数据时触发。",
        action: "action ExportProductionWiring",
        soon: true,
      },
      {
        id: "project-closed",
        title: "项目已关闭",
        body: "当项目被关闭时触发 — 适用于签发与归档流程。",
        action: "event lifecycle",
        soon: true,
      },
    ],
    destEyebrow: "destinations · dst",
    destHeading: "送往何处 — 工程师日常使用的工具。",
    destSoonLabel: "soon",
    destinations: [
      {
        title: "Microsoft Teams",
        body: "在每个事件发生时向频道发送一条消息。",
        soon: false,
      },
      {
        title: "SharePoint",
        body: "将导出内容归档到项目的文档库中。",
        soon: false,
      },
      {
        title: "Google Drive",
        body: "将导出的文件上传到共享文件夹。",
        soon: false,
      },
      {
        title: "Email",
        body: "将导出内容发送到分发列表或收件箱。",
        soon: false,
      },
      {
        title: "网络文件夹",
        body: "通过一个小型代理把文件放到共享磁盘上。",
        soon: false,
      },
      {
        title: "PLM / PDM",
        body: "将图纸签入 Vault、SolidWorks PDM 或 Windchill。",
        soon: true,
      },
    ],
    footnote:
      "没有 Slack？这是刻意为之 — byndr 只对接你办公室已经在用的 M365 + PLM 技术栈。需要别的？一个通用 HTTP 目的地可把负载转发到任何地方。",
  },
  pricing: {
    eyebrow: "pricing",
    heading: "开放内核。免费运行，付费托管。",
    lead: "客户端开源且永久免费。托管路由器 — 托管凭据、重试与历史记录 — 才是你所付费的部分。等候名单成员将帮助确定最终的发布定价。",
    mostPopular: "最受欢迎",
    period: "/月",
    tiers: [
      {
        name: "Community",
        price: "0€",
        tagline: "开源客户端，单条路由，自助使用。",
        features: [
          "开源客户端（MIT）",
          "1 个事件 · 1 个目的地",
          "每月 100 次执行",
          "社区支持",
        ],
        popular: false,
        cta: "免费开始",
      },
      {
        name: "Starter",
        price: "29€",
        tagline: "面向小型电气团队。",
        features: [
          "3 个事件",
          "2 个目的地",
          "每月 500 次执行",
          "托管 OAuth + 重试",
        ],
        popular: false,
        cta: "选择 Starter",
      },
      {
        name: "Pro",
        price: "79€",
        tagline: "面向繁忙的工程办公室。",
        features: [
          "无限事件",
          "5 个目的地",
          "每月 5,000 次执行",
          "执行历史 + 优先支持",
        ],
        popular: true,
        cta: "选择 Pro",
      },
    ],
  },
  faq: {
    eyebrow: "faq",
    heading: "干脆利落的答案。",
    items: [
      {
        q: "你们支持哪些 ECAD 工具？",
        a: "byndr 与具体 ECAD 无关。开源客户端从你的 CAD 工具捕获事件，并将其 POST 到你的租户。EPLAN Electric P8 是首个支持的工具；客户端的设计使得其他 ECAD 工具能以同样的方式接入。",
      },
      {
        q: "CAD 软件需要保持打开吗？",
        a: "是的。客户端与持有有效许可证的 CAD 一起运行。只要 CAD 处于打开状态，集成便会在你导出和关闭项目时自动运行。软件关闭时则不会有任何运行。",
      },
      {
        q: "客户端真的开源吗？",
        a: "是的 — 采用 MIT 许可证，你的 IT 团队可完全审计。你可以在安装前读遍每一行代码，而且它只把事件数据发送到你自己的租户 URL。这就是 Community 层级：永久免费。",
      },
      {
        q: "我的 OAuth 令牌存放在哪里？",
        a: "加密存放在托管路由器中，保留在服务端。它们从不存储在你的电脑上。客户端只发送事件负载，因此凭据从不离开托管环境。",
      },
      {
        q: "为什么没有 Slack？",
        a: "因为工程办公室并不靠 Slack 运转。byndr 对接你真正在用的工具 — Microsoft Teams、SharePoint、Drive、Email、网络文件夹以及 PLM/PDM。通用 HTTP 目的地则覆盖其余一切。",
      },
      {
        q: "我们必须改变团队的工作方式吗？",
        a: "不必。工程师照旧导出 PDF 和 BOM，和今天一模一样。byndr 监听这些事件并完成送达，因此没有新工具需要学习。",
      },
    ],
  },
  signup: {
    metaTitle: "byndr — 开始使用",
    metaDescription: "创建您的 byndr 租户：连接 Telegram 机器人，几分钟内即可路由您的 ECAD 事件。",
    eyebrow: "开始使用",
    heading: "创建您的租户",
    lead: "只需邮箱即可创建租户。连接和事件路由之后在控制台中配置。无需信用卡。",
    emailLabel: "工作邮箱",
    companyLabel: "公司（可选）",
    submit: "创建租户",
    submitting: "创建中…",
    errorGeneric: "出现问题。请检查各项内容后重试。",
    successHeading: "租户已创建 — 请保存密钥",
    successLead: "请立即保存 API 密钥：它只显示一次。然后在控制台中配置您的第一个连接。",
    tenantIdLabel: "Tenant ID",
    apiKeyLabel: "API 密钥",
    copy: "复制",
    nextHeading: "后续步骤",
    nextSteps: [
      "在控制台的 Connections 中连接 Telegram、Google Drive 或 Webhook。",
      "将 byndr.config 复制到 %APPDATA%\\byndr\\ 并粘贴您的 tenantId 和 apiKey。",
      "在 EPLAN 中运行 scripts/ByndrPing.cs，然后在 Events 页面选择要路由的事件。",
    ],
  },
  footer: {
    tagline:
      "面向工程办公室的托管事件路由。你的数据流向你已经在用的工具；客户端始终开源。",
    productLabel: "产品",
    legalLabel: "法律",
    privacy: "隐私",
    terms: "条款",
    contact: "联系",
    disclaimer:
      "byndr 是一款独立产品，与 EPLAN 或任何 ECAD 供应商均无隶属关系，亦未获其背书。所有产品名称均为其各自所有者的商标。",
  },
  legal: {
    back: "返回 byndr",
    lastUpdatedLabel: "最近更新",
    draftLabel: "草案",
    updated: "2026-07-05",
    disclaimer:
      "本文档为早期草案，尚不构成法律意见。有疑问？",
    privacy: {
      eyebrow: "legal · privacy",
      title: "隐私政策",
      intro:
        "我们将数据收集保持在最低限度，并把凭据放在服务端。以下正是 byndr 处理的内容及其原因。",
      sections: [
        {
          heading: "我们是谁",
          body: [
            "byndr 是一款独立产品，将 ECAD 事件路由到工程团队所用的工具。本政策说明你在使用我们的网站和托管服务时，我们会处理哪些数据。",
          ],
        },
        {
          heading: "我们收集什么",
          body: [
            "网站：站点为静态页面，不使用任何广告或第三方跟踪 cookie。",
            "联系：如果你给我们发邮件，我们会保留你的消息和地址以便回复，并在相关情况下就产品进行后续跟进。",
            "托管服务：当你的租户处于活动状态时，我们会处理你的开源客户端发送的事件元数据（事件类型、时间戳、文件引用），以将其送达你所配置的目的地。",
          ],
        },
        {
          heading: "凭据",
          body: [
            "OAuth 令牌和目的地密钥以加密方式保存在服务端的托管路由器中。它们从不存储在你的 CAD 工作站上，也从不与你所连接的目的地之外的任何第三方共享。",
          ],
        },
        {
          heading: "子处理方",
          body: [
            "托管服务运行在 Cloudflare 上。送达目的地（例如 Microsoft 365、Google Drive）仅接收你路由给它们的负载。",
          ],
        },
        {
          heading: "你的权利",
          body: [
            "你可以随时发邮件至 hello@covaga.xyz，要求我们访问、更正或删除我们所持有的关于你的个人数据。我们会在合理期限内回复。",
          ],
        },
        {
          heading: "变更",
          body: [
            "随着产品的发展，我们可能会更新本政策。重大变更将体现在上方的“最近更新”日期中。",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "legal · terms",
      title: "服务条款",
      intro:
        "为一款小型产品提供的朴实条款：运行获得授权的 CAD 工具，路由你有权移动的数据，自行保留你的备份。",
      sections: [
        {
          heading: "服务内容",
          body: [
            "byndr 提供一个托管路由器，它从开源客户端接收 ECAD 事件，并将其送达你所配置的目的地。客户端采用 MIT 许可证；托管服务则依照本条款提供。",
          ],
        },
        {
          heading: "你的责任",
          body: [
            "你有责任为你所运行的 CAD 软件以及你所连接的目的地账户持有有效许可证。你只能路由你有权移动的数据。",
          ],
        },
        {
          heading: "开源客户端",
          body: [
            "客户端依照 MIT 许可证按“原样”提供，不附带任何担保。你可以在该许可证的条款范围内自由地阅读、审计、运行和修改它。",
          ],
        },
        {
          heading: "可用性",
          body: [
            "我们力求可靠送达，但不保证服务不中断。事件在失败时可能会被重试；持续失败会向你呈现出来。",
          ],
        },
        {
          heading: "责任",
          body: [
            "在法律允许的范围内，byndr 不对因使用本服务而产生的间接或后果性损失负责。托管服务会移动你的文件；保留独立备份是你的责任。",
          ],
        },
        {
          heading: "变更",
          body: [
            "随着产品的发展，我们可能会更新这些条款。变更后继续使用即视为接受更新后的条款。",
          ],
        },
      ],
    },
  },
};

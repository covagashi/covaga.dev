import type { SiteContent } from "../types";

// Japanese — mirrors the English source keys.
export const ja: SiteContent = {
  meta: {
    umbrellaTitle: "Covaga — EPLAN エンジニアのためのオープンツールキット",
    umbrellaDescription:
      "EPLAN 電気設計エンジニアのための 3 つのオープンツール: AI で EPLAN を操作し（eplan-rag-mcp）、あらゆるブラウザでプロジェクトを開き（ecad-view）、そのイベントをオフィスで使うツールへルーティングします（Covaga Hub）。Cloudflare 上に構築。",
    homeTitle: "Covaga Hub — EPLAN のエクスポートをどこへでもルーティング",
    homeDescription:
      "Covaga Hub は EPLAN のエクスポート（PDF、BOM、プロジェクトのクローズ）を検知し、Teams、SharePoint、Drive、メールへ届けます。認証情報はサーバー側に保持され、クライアントはオープンソースのままです。",
    privacyTitle: "Covaga — プライバシー",
    privacyDescription:
      "Covaga がウェブサイトおよびホスト型サービス全体でデータをどのように扱うかについて。",
    termsTitle: "Covaga — 利用規約",
    termsDescription:
      "Covaga Hub のホスト型サービスおよびオープンソースの Covaga ツールの利用を定める規約。",
  },
  umbrella: {
    nav: {
      tools: "ツール",
      open: "オープンソース",
      getHub: "Hub を入手",
    },
    hero: {
      eyebrow: "open toolkit for eplan",
      heading: "EPLAN プロジェクトで、もっとできることを",
      leadHtml:
        '電気設計エンジニアのための 3 つのオープンツール — AI で <strong class="font-semibold text-[var(--color-ink)]">EPLAN</strong> を操作し、あらゆるブラウザでプロジェクトを開き、そのイベントをオフィスで既に使っているツールへルーティングします。無料ではじめられ、自分でホストできます。',
      ctaPrimary: "ツールキットを見る",
      ctaSecondary: "無料ではじめる",
      specChips: [
        { label: "stack", value: "cloudflare" },
        { label: "core", value: "open source" },
        { label: "i18n", value: "7 locales" },
      ],
      schemaTitle: "Covaga ツールキット回路図",
      schemaDesc:
        "配線回路図: 左側の EPLAN P8 ソース端子が中央の covaga バスモジュールへ供給し、そこから右側の 3 つのツール端子 — rag-mcp、ecad-view、hub — へ分岐します。",
      figCaption: "fig. 01 — toolkit schematic",
      figFlow: "eplan → covaga → tools",
    },
    tools: {
      eyebrow: "tools · 03",
      heading: "ひとつのツールキット、3 つのモジュール。",
      lead: "各ツールは実際の EPLAN の課題をひとつ解決し、単体でも動きます — ひとつ選ぶも、3 つすべてを連携させるも自由。2 つは自分でホストするオープンソースで、プラットフォームはこちらでホストします。",
      statusOssLabel: "オープンソース",
      statusHostedLabel: "オープンコア · ホスト型",
      items: [
        {
          ref: "U1 · MCP",
          name: "eplan-rag-mcp",
          what: "AI で EPLAN を操作。",
          body: "QuietMode で 149 の EPLAN アクションを静かに実行するローカル MCP サーバー。加えて P8 と EEC Pro 2026 の RAG ドキュメント、そして正しい EPLAN スクリプトを書く Claude Code スキルを備えます。",
          chips: [
            { label: "tools", value: "156" },
            { label: "rag", value: "p8 + eec" },
            { label: "runtime", value: "local" },
          ],
          status: "オープンソース",
          statusKind: "oss",
          links: [
            { label: "GitHub ↗", href: "https://github.com/covagashi/eplan-rag-mcp" },
          ],
          primary: false,
        },
        {
          ref: "U2 · VIEWER",
          name: "ecad-view",
          what: "ブラウザでプロジェクトを開く。",
          body: ".epdz エクスポートや .e3d パーツをドロップすれば、あらゆるブラウザで読めます — 3D モデル、回路図ページ、デバイス検索、相互参照。オフライン対応の PWA で、ファイルがデバイスを離れることはありません。",
          chips: [
            { label: "fmt", value: ".epdz / .e3d" },
            { label: "3d", value: "three.js" },
            { label: "runs", value: "client-side" },
          ],
          status: "オープンソース",
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
          what: "イベントをルーティング · データの穴を埋める。",
          body: "ホスト型プラットフォーム。EPLAN イベント（PDF、BOM、プロジェクトのクローズ）を Teams、SharePoint、Drive、メールへルーティングし、レビュー済みの AI 提案を通じて品番データベースのテキストの穴を埋めます。認証情報はサーバー側に保持されます。",
          chips: [
            { label: "mode", value: "hosted" },
            { label: "tenancy", value: "multi" },
            { label: "gym", value: "mcp" },
          ],
          status: "オープンコア · ホスト型",
          statusKind: "hosted",
          links: [{ label: "hub.covaga.dev", href: "/hub" }],
          primary: true,
        },
      ],
    },
    principles: {
      eyebrow: "how covaga is built",
      heading: "設計オフィスのルール。",
      items: [
        {
          title: "デフォルトでオープン",
          body: "ローカルツールはオープンソースで、無料で動かせます — インストール前に全行を読み、IT チームと監査し、どこへでも自分でホストできます。",
        },
        {
          title: "チームが働く場所で",
          body: "新しく覚えるツールはありません。Covaga は EPLAN と、オフィスが既に使っている M365 スタックの言葉を話します。エンジニアは今までどおりエクスポートを続けるだけです。",
        },
        {
          title: "あなたのデータはあなたのもの",
          body: "プロジェクトはあなたのデバイス上でレンダリングされ、実際の品番データはリポジトリではなく自分自身のデータベースに置かれます。ホスト型ワーカーが持つのは認証情報であって、ファイルではありません。",
        },
      ],
    },
    cta: {
      eyebrow: "get started",
      heading: "まずはひとつのツールから。準備ができたら残りを連携。",
      primary: "順番待ちに登録",
      secondary: "リポジトリを見る",
    },
    footer: {
      tagline:
        "Cloudflare 上に構築された、EPLAN 電気設計エンジニアのためのオープンツールキット。AI で EPLAN を操作し、どこでもプロジェクトを開き、イベントを既に使っているツールへルーティングします。",
      net: "part of covaga.xyz",
      toolsLabel: "ツール",
      codeLabel: "コード",
      projectLabel: "プロジェクト",
      localesLabel: "7 言語で利用可能",
    },
  },
  a11y: {
    skipToContent: "コンテンツへスキップ",
    primaryNav: "メイン",
    sectionsNav: "セクション",
    legalNav: "法的情報",
    toggleMenu: "メニューを切り替え",
    languageLabel: "言語",
  },
  banner: {
    message: "このサイトは日本語でご覧いただけます。",
    view: "日本語で見る",
    dismiss: "後で",
  },
  nav: {
    how: "仕組み",
    events: "イベント",
    pricing: "料金",
    faq: "faq",
    getStarted: "順番待ちに登録",
  },
  hero: {
    eyebrowTo: "配信",
    headingPre: "CAD イベントを、そのままルーティング",
    leadHtml:
      'Covaga Hub はあなたの <strong class="font-semibold text-[var(--color-ink)]">ECAD</strong> エクスポートを検知し、Teams、SharePoint、Drive、メールへ届けます。認証情報はサーバー側に保持されます。',
    ctaPrimary: "順番待ちに登録",
    ctaSecondary: "仕組みを見る",
    schemaTitle: "イベントルーティング回路図",
    schemaDesc:
      "配線回路図: 左側の 3 つの ECAD イベント端子が Covaga ハブモジュールを経由し、右側の SharePoint、Teams、Drive、Email 端子へルーティングされます。",
    figCaption: "fig. 01 — イベントルーティング回路図",
  },
  problem: {
    eyebrow: "変化",
    heading: "連携プロジェクトなしの連携を。",
    todayLabel: "// 現状",
    withLabel: "// Covaga Hub なら",
    today: [
      {
        title: "その場しのぎのローカルマクロ",
        body: "1 本あたり 200€ から 2,400€ で発注したカスタムのエクスポートスクリプトが、1 台のワークステーションだけに存在します。保守は永遠にあなたの負担となり、同僚がマシンを変えれば壊れてしまいます。",
      },
      {
        title: "重厚な PLM / ERP コネクタ",
        body: "ライセンス費用が高く、導入も遅いエンタープライズ向けミドルウェア。図面を SharePoint に格納するだけの小さな電気設計チームには過剰です。",
      },
      {
        title: "CAD PC 上の認証情報",
        body: "OAuth トークンや API キーがローカルの設定ファイルに置かれ、プロバイダや Webhook シークレットがローテーションするたびに古くなってしまいます。",
      },
    ],
    solution: [
      {
        title: "コードではなく、設定したルート",
        body: "ECAD イベントを宛先に向けるだけで完了です。PDF エクスポートを数分で Teams への通知や SharePoint へのアップロードに変えられます。",
      },
      {
        title: "サーバー側で保持する認証情報",
        body: "OAuth トークンはホスト型ルーター内に暗号化して保管されます。PC 上のオープンソースクライアントが送るのはイベントデータだけで、シークレットは決して送りません。",
      },
      {
        title: "常に最新の状態を維持",
        body: "プロバイダが API を変更しても、ホスト型ワーカーが中央で更新されます。設計用マシンで再デプロイする必要はありません。",
      },
    ],
  },
  how: {
    eyebrow: "仕組み",
    heading: "CAD イベントから配信まで、3 ステップ。",
    steps: [
      {
        title: "ECAD イベントが発生",
        body: "PDF エクスポート、BOM エクスポート、プロジェクトのクローズが、通常の作業中に ECAD ツール内で起こります。誰も描き方を変える必要はありません。",
      },
      {
        title: "オープンソースクライアントが JSON を POST",
        body: "CAD と並行して動く軽量なクライアントが、あなた専用のテナント URL へ小さな JSON ペイロードを送信します。シークレットが PC を離れることはありません。",
      },
      {
        title: "ルーターが配信",
        body: "ホスト型ワーカーがイベントを変換し、宛先へ届けます: Teams、SharePoint、Google Drive、メール、あるいは任意の HTTP エンドポイント。",
      },
    ],
  },
  events: {
    eyebrow: "イベント · src",
    heading: "ECAD がトリガーできること。",
    lead: "各イベントは実際の EPLAN API アクションに対応します。多くの連携が触れないものも含めて。",
    liveLabel: "稼働中",
    soonLabel: "近日対応",
    items: [
      {
        id: "pdf-exported",
        title: "PDF エクスポート",
        body: "回路図やドキュメントの PDF がプロジェクトからエクスポートされたときに発火します。",
        action: "action export · PDF",
        soon: false,
      },
      {
        id: "bom-exported",
        title: "BOM / 部品表エクスポート",
        body: "部品表、パーツリスト、端子ラベルがエクスポートされたときに発火します。",
        action: "action label",
        soon: false,
      },
      {
        id: "dxf-dwg-exported",
        title: "DXF / DWG エクスポート",
        body: "ページまたはプロジェクトが、機械設計や顧客への引き渡し向けに DXF または DWG へエクスポートされたときに発火します。",
        action: "action export · DXF/DWG",
        soon: true,
      },
      {
        id: "project-backed-up",
        title: "プロジェクトのバックアップ",
        body: "プロジェクトのバックアップ（.zw1）が作成されたときに発火します。オフサイト保管に最適です。",
        action: "action backup",
        soon: true,
      },
      {
        id: "wiring-exported",
        title: "製造配線エクスポート",
        body: "製造配線データが機械組み立て向けにエクスポートされたときに発火します。",
        action: "action ExportProductionWiring",
        soon: true,
      },
      {
        id: "project-closed",
        title: "プロジェクトのクローズ",
        body: "プロジェクトがクローズされたときに発火します。承認や保管のフローに役立ちます。",
        action: "event lifecycle",
        soon: true,
      },
    ],
    destEyebrow: "配信先 · dst",
    destHeading: "届く先は、エンジニアが使うツール。",
    destSoonLabel: "近日",
    destinations: [
      {
        title: "Microsoft Teams",
        body: "イベントごとにチャンネルへメッセージを投稿します。",
        soon: false,
      },
      {
        title: "SharePoint",
        body: "エクスポートをプロジェクトのドキュメントライブラリに格納します。",
        soon: false,
      },
      {
        title: "Google Drive",
        body: "エクスポートしたファイルを共有フォルダにアップロードします。",
        soon: false,
      },
      {
        title: "Email",
        body: "エクスポートを配信リストや受信トレイに送信します。",
        soon: false,
      },
      {
        title: "ネットワークフォルダ",
        body: "小さなエージェント経由でファイルを共有ドライブに置きます。",
        soon: false,
      },
      {
        title: "PLM / PDM",
        body: "図面を Vault、SolidWorks PDM、Windchill にチェックインします。",
        soon: true,
      },
    ],
    footnote:
      "Slack がない？それは意図的です。Covaga Hub はあなたのオフィスが既に使っている M365 + PLM スタックに対応します。それ以外が必要ですか？汎用の HTTP 宛先がペイロードをどこへでも転送します。",
  },
  pricing: {
    eyebrow: "料金",
    heading: "オープンコア。動かすのは無料、ホストは有料。",
    lead: "クライアントはオープンソースで永久に無料です。有料になるのはホスト型ルーター（認証情報の管理、リトライ、履歴）です。ウェイトリストのメンバーは最終的なローンチ価格の決定に協力していただけます。",
    mostPopular: "一番人気",
    period: "/月",
    tiers: [
      {
        name: "Community",
        price: "0€",
        tagline: "オープンソースクライアント、1 ルート、セルフサービス。",
        features: [
          "オープンソースクライアント（MIT）",
          "1 イベント · 1 宛先",
          "月 100 回の実行",
          "コミュニティサポート",
        ],
        popular: false,
        cta: "無料ではじめる",
      },
      {
        name: "Starter",
        price: "29€",
        tagline: "小規模な電気設計チーム向け。",
        features: [
          "3 イベント",
          "2 宛先",
          "月 500 回の実行",
          "マネージド OAuth + リトライ",
        ],
        popular: false,
        cta: "Starter を選ぶ",
      },
      {
        name: "Pro",
        price: "79€",
        tagline: "多忙な設計オフィス向け。",
        features: [
          "イベント無制限",
          "5 宛先",
          "月 5,000 回の実行",
          "実行履歴 + 優先サポート",
        ],
        popular: true,
        cta: "Pro を選ぶ",
      },
    ],
  },
  faq: {
    eyebrow: "faq",
    heading: "率直な回答。",
    items: [
      {
        q: "対応している ECAD ツールは？",
        a: "Covaga Hub は ECAD 非依存です。オープンソースクライアントが CAD ツールからイベントを取得し、テナントへ POST します。まず EPLAN Electric P8 に対応しており、クライアントは他の ECAD ツールも同じ方法で追加できるよう設計されています。",
      },
      {
        q: "CAD ソフトは開いておく必要がありますか？",
        a: "はい。クライアントは有効なライセンスを持つ CAD と並行して動作します。開いている間、エクスポートやプロジェクトのクローズに合わせて連携が自動で実行されます。ソフトが閉じている間は何も動きません。",
      },
      {
        q: "クライアントは本当にオープンソースですか？",
        a: "はい。MIT ライセンスで、IT チームが完全に監査できます。インストール前に全行を読むことができ、送信するのはあなた自身のテナント URL へのイベントデータだけです。それが Community ティアで、永久に無料です。",
      },
      {
        q: "私の OAuth トークンはどこに保管されますか？",
        a: "ホスト型ルーター内に暗号化され、サーバー側で保持されます。PC 上に保存されることはありません。クライアントが送るのはイベントペイロードだけなので、認証情報がホスト環境を離れることはありません。",
      },
      {
        q: "なぜ Slack がないのですか？",
        a: "設計オフィスは Slack で回っていないからです。Covaga Hub はあなたが実際に使うツール、Microsoft Teams、SharePoint、Drive、メール、ネットワークフォルダ、PLM/PDM を対象とします。それ以外は汎用の HTTP 宛先でカバーします。",
      },
      {
        q: "チームの働き方を変える必要がありますか？",
        a: "いいえ。エンジニアは今までどおり PDF や BOM をエクスポートするだけです。Covaga Hub がそれらのイベントを検知して配信するので、新しく覚えるツールはありません。",
      },
    ],
  },
  signup: {
    metaTitle: "Covaga Hub — 順番待ちリストに登録",
    metaDescription: "Covaga Hub は開発中です。メールアドレスを登録すると、公開時にお知らせします。",
    eyebrow: "早期アクセス",
    heading: "Covaga Hub はまもなく公開",
    lead: "Covaga Hub はまだ開発中です。メールアドレスを登録いただくと、公開と同時にお知らせします。送信は一度きり、スパムはありません。",
    emailLabel: "勤務先メールアドレス",
    companyLabel: "会社名（任意）",
    submit: "お知らせを受け取る",
    submitting: "送信中…",
    errorGeneric: "エラーが発生しました。メールアドレスを確認して再試行してください。",
    successHeading: "登録が完了しました",
    successLead: "ありがとうございます。Covaga Hub が公開され次第、メールでお知らせします。それまでの間、クライアントとツールは GitHub でオープンソースとして公開されています。",
    tenantIdLabel: "Tenant ID",
    apiKeyLabel: "API キー",
    copy: "コピー",
    nextHeading: "次のステップ",
    nextSteps: [
      "ダッシュボードの Connections で Telegram、Google Drive、または Webhook を接続します。",
      "covaga.config を %APPDATA%\\covaga\\ にコピーし、tenantId と apiKey を貼り付けます。",
      "EPLAN で scripts/CovagaPing.cs を実行し、Events ページでルーティングするイベントを選びます。",
    ],
  },
  footer: {
    tagline:
      "設計オフィスのためのホスト型イベントルーティング。あなたのデータは既に使っているツールへ届き、クライアントはオープンソースのままです。",
    productLabel: "プロダクト",
    legalLabel: "法的情報",
    privacy: "プライバシー",
    terms: "利用規約",
    contact: "お問い合わせ",
    disclaimer:
      "Covaga Hub は独立したプロダクトであり、EPLAN やいかなる ECAD ベンダーとも提携・承認関係にありません。すべての製品名は各所有者の商標です。",
  },
  legal: {
    back: "Covaga Hub に戻る",
    lastUpdatedLabel: "最終更新",
    draftLabel: "ドラフト",
    updated: "2026-07-05",
    disclaimer:
      "本ドキュメントは初期ドラフトであり、まだ法的助言を構成するものではありません。ご質問は？",
    privacy: {
      eyebrow: "legal · privacy",
      title: "プライバシーポリシー",
      intro:
        "データ収集は最小限にとどめ、認証情報はサーバー側に保持します。Covaga Hub が扱うものとその理由を正確にご説明します。",
      sections: [
        {
          heading: "私たちについて",
          body: [
            "Covaga Hub は、ECAD イベントを設計チームが使うツールへルーティングする独立したプロダクトです。本ポリシーでは、当社のウェブサイトおよびホスト型サービスをご利用の際に扱うデータについて説明します。",
          ],
        },
        {
          heading: "収集する情報",
          body: [
            "ウェブサイト: サイトは静的で、広告や第三者のトラッキング Cookie を使用しません。",
            "お問い合わせ: メールをいただいた場合、返信のため、また必要に応じて製品についてのフォローアップのため、メッセージとアドレスを保持します。",
            "ホスト型サービス: テナントが有効な間、オープンソースクライアントが送信するイベントメタデータ（イベント種別、タイムスタンプ、ファイル参照）を処理し、設定した宛先へ配信します。",
          ],
        },
        {
          heading: "認証情報",
          body: [
            "OAuth トークンと宛先のシークレットは、ホスト型ルーター内にサーバー側で暗号化して保持されます。CAD ワークステーションに保存されることはなく、接続先の宛先を超えて第三者と共有されることもありません。",
          ],
        },
        {
          heading: "サブプロセッサ",
          body: [
            "ホスト型サービスは Cloudflare 上で稼働します。配信先（例: Microsoft 365、Google Drive）が受け取るのは、あなたがそこへルーティングしたペイロードだけです。",
          ],
        },
        {
          heading: "あなたの権利",
          body: [
            "当社が保持するあなたの個人データについて、hello@covaga.dev へメールいただければ、いつでもアクセス、訂正、削除を求めることができます。合理的な期間内に対応いたします。",
          ],
        },
        {
          heading: "変更",
          body: [
            "製品の発展に伴い、本ポリシーを更新することがあります。重要な変更は上記の「最終更新」日付に反映されます。",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "legal · terms",
      title: "利用規約",
      intro:
        "小さなプロダクトのためのシンプルな規約: ライセンスされた CAD ツールを動かし、移動が許可されたデータをルーティングし、自分自身のバックアップを保つ。",
      sections: [
        {
          heading: "サービスについて",
          body: [
            "Covaga Hub は、オープンソースクライアントから ECAD イベントを受け取り、設定した宛先へ配信するホスト型ルーターを提供します。クライアントは MIT ライセンスで、ホスト型サービスは本規約のもとで提供されます。",
          ],
        },
        {
          heading: "あなたの責任",
          body: [
            "動かす CAD ソフトウェアおよび接続する宛先アカウントについて、有効なライセンスを保持する責任はあなたにあります。移動する権限のあるデータのみをルーティングしてください。",
          ],
        },
        {
          heading: "オープンソースクライアント",
          body: [
            "クライアントは MIT ライセンスのもと、無保証の現状有姿で提供されます。当該ライセンスの範囲内で、自由に読み、監査し、実行し、改変することができます。",
          ],
        },
        {
          heading: "可用性",
          body: [
            "信頼性の高い配信を目指しますが、無停止のサービスを保証するものではありません。失敗したイベントはリトライされる場合があり、継続的な失敗はあなたに通知されます。",
          ],
        },
        {
          heading: "責任",
          body: [
            "法律で許容される範囲において、Covaga Hub はサービスの利用から生じる間接的または結果的な損害について責任を負いません。ホスト型サービスはあなたのファイルを移動します。独立したバックアップを保つのはあなたの責任です。",
          ],
        },
        {
          heading: "変更",
          body: [
            "製品の発展に伴い、本規約を更新することがあります。変更後も利用を継続した場合、更新された規約に同意したものとみなされます。",
          ],
        },
      ],
    },
  },
};

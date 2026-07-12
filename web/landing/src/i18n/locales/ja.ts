import type { SiteContent } from "../types";

// Japanese — mirrors the English source keys.
export const ja: SiteContent = {
  meta: {
    homeTitle: "byndr — ECAD のエクスポートをどこへでもルーティング",
    homeDescription:
      "byndr は ECAD のエクスポート（PDF、BOM、プロジェクトのクローズ）を検知し、Teams、SharePoint、Drive、メールへ届けます。認証情報はサーバー側に保持され、クライアントはオープンソースのままです。",
    privacyTitle: "byndr — プライバシー",
    privacyDescription:
      "byndr がウェブサイトおよびホスト型イベントルーティングサービス全体でデータをどのように扱うかについて。",
    termsTitle: "byndr — 利用規約",
    termsDescription:
      "byndr のホスト型イベントルーティングサービスおよびオープンソースクライアントの利用を定める規約。",
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
    getStarted: "はじめる",
  },
  hero: {
    eyebrowTo: "配信",
    headingPre: "CAD イベントを、そのままルーティング",
    leadHtml:
      'byndr はあなたの <strong class="font-semibold text-[var(--color-ink)]">ECAD</strong> エクスポートを検知し、Teams、SharePoint、Drive、メールへ届けます。認証情報はサーバー側に保持されます。',
    ctaPrimary: "はじめる",
    ctaSecondary: "仕組みを見る",
    schemaTitle: "イベントルーティング回路図",
    schemaDesc:
      "配線回路図: 左側の 3 つの ECAD イベント端子が byndr ハブモジュールを経由し、右側の SharePoint、Teams、Drive、Email 端子へルーティングされます。",
    figCaption: "fig. 01 — イベントルーティング回路図",
  },
  problem: {
    eyebrow: "変化",
    heading: "連携プロジェクトなしの連携を。",
    todayLabel: "// 現状",
    withLabel: "// byndr なら",
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
      "Slack がない？それは意図的です。byndr はあなたのオフィスが既に使っている M365 + PLM スタックに対応します。それ以外が必要ですか？汎用の HTTP 宛先がペイロードをどこへでも転送します。",
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
        a: "byndr は ECAD 非依存です。オープンソースクライアントが CAD ツールからイベントを取得し、テナントへ POST します。まず EPLAN Electric P8 に対応しており、クライアントは他の ECAD ツールも同じ方法で追加できるよう設計されています。",
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
        a: "設計オフィスは Slack で回っていないからです。byndr はあなたが実際に使うツール、Microsoft Teams、SharePoint、Drive、メール、ネットワークフォルダ、PLM/PDM を対象とします。それ以外は汎用の HTTP 宛先でカバーします。",
      },
      {
        q: "チームの働き方を変える必要がありますか？",
        a: "いいえ。エンジニアは今までどおり PDF や BOM をエクスポートするだけです。byndr がそれらのイベントを検知して配信するので、新しく覚えるツールはありません。",
      },
    ],
  },
  signup: {
    metaTitle: "byndr — はじめる",
    metaDescription: "byndr のテナントを作成：Telegram ボットを接続して、ECAD イベントを数分でルーティング。",
    eyebrow: "はじめる",
    heading: "テナントを作成",
    lead: "メールアドレスだけでテナントを作成。接続とイベントのルーティングは、あとからダッシュボードで設定します。クレジットカード不要。",
    emailLabel: "勤務先メールアドレス",
    companyLabel: "会社名（任意）",
    submit: "テナントを作成",
    submitting: "作成中…",
    errorGeneric: "エラーが発生しました。入力内容を確認して再試行してください。",
    successHeading: "テナント作成完了 — キーを保存",
    successLead: "API キーは一度しか表示されないため、今すぐ保存してください。その後、ダッシュボードで最初の接続を設定します。",
    tenantIdLabel: "Tenant ID",
    apiKeyLabel: "API キー",
    copy: "コピー",
    nextHeading: "次のステップ",
    nextSteps: [
      "ダッシュボードの Connections で Telegram、Google Drive、または Webhook を接続します。",
      "byndr.config を %APPDATA%\\byndr\\ にコピーし、tenantId と apiKey を貼り付けます。",
      "EPLAN で scripts/ByndrPing.cs を実行し、Events ページでルーティングするイベントを選びます。",
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
      "byndr は独立したプロダクトであり、EPLAN やいかなる ECAD ベンダーとも提携・承認関係にありません。すべての製品名は各所有者の商標です。",
  },
  legal: {
    back: "byndr に戻る",
    lastUpdatedLabel: "最終更新",
    draftLabel: "ドラフト",
    updated: "2026-07-05",
    disclaimer:
      "本ドキュメントは初期ドラフトであり、まだ法的助言を構成するものではありません。ご質問は？",
    privacy: {
      eyebrow: "legal · privacy",
      title: "プライバシーポリシー",
      intro:
        "データ収集は最小限にとどめ、認証情報はサーバー側に保持します。byndr が扱うものとその理由を正確にご説明します。",
      sections: [
        {
          heading: "私たちについて",
          body: [
            "byndr は、ECAD イベントを設計チームが使うツールへルーティングする独立したプロダクトです。本ポリシーでは、当社のウェブサイトおよびホスト型サービスをご利用の際に扱うデータについて説明します。",
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
            "当社が保持するあなたの個人データについて、hello@covaga.xyz へメールいただければ、いつでもアクセス、訂正、削除を求めることができます。合理的な期間内に対応いたします。",
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
            "byndr は、オープンソースクライアントから ECAD イベントを受け取り、設定した宛先へ配信するホスト型ルーターを提供します。クライアントは MIT ライセンスで、ホスト型サービスは本規約のもとで提供されます。",
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
            "法律で許容される範囲において、byndr はサービスの利用から生じる間接的または結果的な損害について責任を負いません。ホスト型サービスはあなたのファイルを移動します。独立したバックアップを保つのはあなたの責任です。",
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

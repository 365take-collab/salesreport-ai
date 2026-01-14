# SalesReport AI

**商談メモをコピペするだけで、30秒で日報が完成する営業日報AI**

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下を設定：

```env
# OpenAI API Key（必須）
OPENAI_API_KEY=sk-your-openai-api-key

# Supabase（メール登録・使用回数管理）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Utage決済ページURL（7日間無料トライアル）
NEXT_PUBLIC_UTAGE_REPORT_URL=https://your-utage-url.com/p/日報AI決済ページ
NEXT_PUBLIC_UTAGE_COACHING_URL=https://your-utage-url.com/p/営業コーチングAI決済ページ

# Utage Webhook（オプション：メールリスト連携）
UTAGE_WEBHOOK_URL=https://your-utage-webhook-url
```

### 3. Supabaseのテーブル作成

SupabaseのSQL Editorで以下を実行：

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザーの読み書きを許可
CREATE POLICY "Allow anonymous access" ON users
  FOR ALL USING (true);
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス

---

## 📦 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **スタイリング**: Tailwind CSS
- **AI**: OpenAI GPT-4o-mini
- **認証**: Supabase Auth（予定）
- **決済**: Stripe（予定）
- **ホスティング**: Vercel

---

## 💰 料金プラン

### 日報AI
| プラン | 価格 | 内容 |
|--------|------|------|
| Free | ¥0 | 月5回まで |
| Basic | 7日間無料 → ¥980/月 | 無制限 |

### 営業コーチングAI
| プラン | 価格 | 内容 |
|--------|------|------|
| 無料体験 | ¥0 | 月3回まで |
| Pro | 7日間無料 → ¥9,800/月 | 無制限 + 週次レポート |

※決済はUtage経由

---

## 📁 ディレクトリ構成

```
salesreport-ai/
├── src/
│   └── app/
│       ├── page.tsx          # メインページ
│       ├── globals.css       # グローバルCSS
│       ├── layout.tsx        # レイアウト
│       └── api/
│           └── generate/
│               └── route.ts  # 日報生成API
├── .env.local               # 環境変数（要作成）
└── README.md
```

---

## 🔧 今後の実装予定

- [ ] Supabase認証
- [ ] Stripe決済
- [ ] 週報自動生成
- [ ] Slack連携

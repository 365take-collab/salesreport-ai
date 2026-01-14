# SalesReport AI セットアップガイド

## 🎯 全体像

```
【あなたがやること】
1. Supabaseでプロジェクト作成 → テーブル作成
2. Utageで決済ページ作成（7日間無料トライアル）
3. Vercelでデプロイ → 環境変数を設定
4. 動作確認

所要時間: 約30分
```

---

## Step 1: Supabase設定（10分）

### 1-1. プロジェクト作成

1. https://supabase.com にアクセス
2. 「Start your project」をクリック
3. GitHubでログイン
4. 「New Project」をクリック
5. 以下を入力：
   - Name: `salesreport-ai`
   - Database Password: 任意のパスワード（メモしておく）
   - Region: `Northeast Asia (Tokyo)`
6. 「Create new project」をクリック（2-3分待つ）

### 1-2. テーブル作成

1. 左メニューの「SQL Editor」をクリック
2. 「New query」をクリック
3. 以下をコピペして実行：

```sql
-- ユーザーテーブル作成
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（検索高速化）
CREATE INDEX users_email_idx ON users(email);

-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザーの読み書きを許可
CREATE POLICY "Allow anonymous access" ON users
  FOR ALL USING (true);
```

4. 「Run」をクリック

### 1-3. API情報を取得

1. 左メニューの「Project Settings」→「API」をクリック
2. 以下をメモ：
   - **Project URL**: `https://xxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOi...`（長い文字列）

---

## Step 2: Utage決済ページ作成（10分）

### 2-1. 日報AI Basic（¥980/月）

1. Utageにログイン
2. 「商品」→「新規作成」
3. 以下を設定：
   - 商品名: `SalesReport AI Basic`
   - 価格: `980円/月`
   - 無料トライアル: `7日間`
   - 決済方法: Stripe連携
4. 決済ページURLをメモ

### 2-2. 営業コーチングAI Pro（¥9,800/月）

1. 「商品」→「新規作成」
2. 以下を設定：
   - 商品名: `営業コーチングAI Pro`
   - 価格: `9,800円/月`
   - 無料トライアル: `7日間`
   - 決済方法: Stripe連携
3. 決済ページURLをメモ

### 2-3. ステップメール設定（オプション）

登録したメールアドレスにステップメールを送りたい場合：

1. Utageで「シナリオ」→「新規作成」
2. トリガー: Webhook
3. メール内容を設定
4. Webhook URLをメモ

---

## Step 3: Vercelデプロイ（10分）

### 3-1. GitHubにプッシュ

ターミナルで以下を実行：

```bash
cd /Users/kawamuratakeshi/Cursor/salesreport-ai

# Gitリポジトリ初期化
git init
git add .
git commit -m "Initial commit: SalesReport AI"

# GitHubでリポジトリ作成後
git remote add origin https://github.com/YOUR_USERNAME/salesreport-ai.git
git branch -M main
git push -u origin main
```

### 3-2. Vercelでデプロイ

1. https://vercel.com にアクセス
2. GitHubでログイン
3. 「Add New...」→「Project」
4. `salesreport-ai`リポジトリを選択
5. 「Import」をクリック

### 3-3. 環境変数を設定

「Environment Variables」セクションで以下を追加：

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | `sk-proj-TIjP9c4tn...`（あなたのAPIキー） |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` |
| `NEXT_PUBLIC_UTAGE_REPORT_URL` | Utageの日報AI決済ページURL |
| `NEXT_PUBLIC_UTAGE_COACHING_URL` | Utageの営業コーチングAI決済ページURL |
| `UTAGE_WEBHOOK_URL` | （オプション）UtageのWebhook URL |

6. 「Deploy」をクリック

### 3-4. デプロイ完了

デプロイが完了すると、以下のようなURLが発行されます：
- `https://salesreport-ai.vercel.app`

---

## Step 4: 動作確認（5分）

### 4-1. 基本機能テスト

1. サイトにアクセス
2. メールアドレスを登録
3. 商談メモを入力して日報生成
4. 「営業コーチング」ページで商談分析

### 4-2. 決済フローテスト

1. 「7日間無料で試す」をクリック
2. Utageの決済ページに遷移することを確認
3. テスト決済（Stripeのテストモードで）

### 4-3. 使用回数制限テスト

1. 5回日報を生成
2. 6回目で制限モーダルが表示されることを確認

---

## 📋 環境変数まとめ

`.env.local`（ローカル開発用）またはVercel環境変数：

```env
# 必須
OPENAI_API_KEY=your-openai-api-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Utage決済ページ
NEXT_PUBLIC_UTAGE_REPORT_URL=https://your-utage.com/p/xxxxx
NEXT_PUBLIC_UTAGE_COACHING_URL=https://your-utage.com/p/yyyyy

# オプション: Utage Webhook
UTAGE_WEBHOOK_URL=https://your-utage-webhook-url
```

---

## 🚀 本番運用チェックリスト

- [ ] Supabaseプロジェクト作成完了
- [ ] usersテーブル作成完了
- [ ] Utage日報AI決済ページ作成完了
- [ ] Utage営業コーチングAI決済ページ作成完了
- [ ] GitHubリポジトリ作成完了
- [ ] Vercelデプロイ完了
- [ ] 環境変数設定完了
- [ ] メール登録テスト完了
- [ ] 日報生成テスト完了
- [ ] 営業コーチングテスト完了
- [ ] 決済フローテスト完了
- [ ] 使用回数制限テスト完了

---

## ❓ トラブルシューティング

### 「日報生成に失敗しました」

→ OpenAI APIキーを確認。Vercelの環境変数に正しく設定されているか。

### 「登録に失敗しました」

→ Supabaseの設定を確認。
- Project URLとanon keyが正しいか
- usersテーブルが作成されているか
- RLSポリシーが設定されているか

### 決済ページに遷移しない

→ Utageの決済ページURLが正しく設定されているか確認。

---

## 📞 サポート

何かあれば聞いてください！

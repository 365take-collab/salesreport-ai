# Stripe を Vercel production に入れる（salesreport-ai）

`vercel env ls production` に `STRIPE_*` が無いと `/api/stripe/checkout` は 500（missing secret）になります。ローカル `.env.local` にも Stripe キーが無い場合は **Stripe Dashboard** から取得して Vercel に登録してください。

## 手順

1. [Stripe Dashboard](https://dashboard.stripe.com/) → Developers → API keys で `Secret key` をコピー（**チャットに貼らない**）。
2. Vercel → プロジェクト `salesreport-ai` → Settings → Environment Variables → Production に次を追加:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`（Webhooks の signing secret）
   - `STRIPE_PRICE_BASIC_MONTHLY`（Price ID `price_...`）
   - `STRIPE_PRICE_PRO_MONTHLY`（Price ID `price_...`）
3. 保存後、**Redeploy**（または空コミットで再デプロイ）。
4. 確認: `POST https://salesreport.launchx.jp/api/stripe/checkout` with JSON `{"plan":"basic"}` が 200 でセッション URL が返ること。

参照: リポジトリ直下の `.env.example`

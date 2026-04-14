日本語で返答する。

## Quick Start
- 共通ルールは `/Users/kawamuratakeshi/.shared-agent-rules/SHARED-RULES.md` を優先する
- まず `/Users/kawamuratakeshi/apps/salesreport-ai/WORKING_PLAN.md` を確認する
- UI 依頼でも先に型、state、Supabase 境界、API contract を固める

## Repo Layout
- `src/`: Next.js App Router / TypeScript 実装
- `supabase/`: migration と RLS
- `public/`: 静的アセット

## Important Files
- `/Users/kawamuratakeshi/apps/salesreport-ai/WORKING_PLAN.md`
- `/Users/kawamuratakeshi/apps/salesreport-ai/package.json`
- `/Users/kawamuratakeshi/apps/salesreport-ai/next.config.ts`
- `/Users/kawamuratakeshi/apps/salesreport-ai/eslint.config.mjs`

## Repo Rules
- Next.js 16 + TypeScript + Supabase 前提を崩さない
- import path は `@/` を優先する
- API を触る場合は認証・認可・入力検証を維持する
- Codex 担当は `supabase/` の migration / RLS。`*.css` `*.scss` は参照のみ

## Verify Work
- `npm run build`
- `npm run lint`
- `test` / `typecheck` は未整備のため、必要な代替確認を報告に残す

## Done Means
- 少なくとも `npm run lint` が通るか、未実行理由が明記されている
- Supabase schema、RLS、API contract の整合が崩れていない

## Review Focus
- blocking issue only: security vulnerability、data loss、production outage を優先
- hardcoded return、stub 実装、test-only branch、`as any`、`it.skip` / `it.only`、assertion 弱化、coverage 低下、`continue-on-error` は常に確認
- 入力検証不足、認証/認可漏れ、secret 直書き、新規テーブルの RLS 漏れを優先して見る

## Related Docs
- `/Users/kawamuratakeshi/.shared-agent-rules/SHARED-RULES.md`
- `/Users/kawamuratakeshi/apps/salesreport-ai/WORKING_PLAN.md`

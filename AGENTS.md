日本語で返答する。

## 共通ルール
/Users/kawamuratakeshi/.shared-agent-rules/SHARED-RULES.md の内容に従うこと。

## プロジェクト固有
- プロジェクト名: salesreport-ai
- 技術スタック: Next.js 16 + TypeScript + Supabase
- メインDB: Supabase (PostgreSQL)

## Repo Layout

- .env.example
- .env.local
- .git/
- .gitignore
- .next/
- .vercel/
- README.md
- SETUP_GUIDE.md
- UTAGE_SETUP.md
- WORKING_PLAN.md
- eslint.config.mjs
- next-env.d.ts
- next.config.ts
- node_modules/
- package-lock.json
- package.json
- postcss.config.mjs
- public/
- src/
- supabase/
- tsconfig.json
- tsconfig.tsbuildinfo
- vercel.json
- 中間生成物/

## Build / Test / Lint Commands

- build: npm run build
- test: # TODO: 手動設定要
- lint: npm run lint
- typecheck: # TODO: 手動設定要

## Review guidelines

### Scope: blocking issues only
- Do NOT flag naming, formatting, missing comments, or stylistic preferences
- Only flag issues that cause security vulnerabilities, data loss, or production outages

### Prohibited patterns (always flag)
- Hardcoded return values (dictionary/map lookup instead of real logic)
- Stub implementations (returning null, empty arrays, or placeholder data)
- Test-only branches (if/switch handling only known test case values)
- Excessive type casting (`as any`, `as never`, `as unknown`)
- Committed `it.skip()` or `it.only()`
- Assertion removal or weakening
- Coverage threshold reduction
- Adding `continue-on-error: true`

### Security checks (always flag)
- Missing input validation (SQL injection, XSS, command injection)
- Missing authentication or authorization checks
- Hardcoded secrets (API keys, tokens, passwords)
- Missing Supabase RLS policies on new tables

### Project conventions (flag if violated)
- Import paths must use `@/` prefix (TypeScript/Next.js projects)
- API endpoints must apply authentication middleware
- Type definitions must match between API and frontend
- Python projects: type hints required on public functions

## Done-When

- lint通過

## Constraints

### Codex担当範囲
- supabase/ ... マイグレーション・RLS

### Codexが編集しないファイル（参照のみ可）
以下はClaude Codeの担当。Codexは読み取り参照のみ:
- *.css, *.scss ... スタイルシート

# Utage決済ページ設定ガイド

## 📋 作成する商品一覧

| プラン | 商品名 | 価格 | 無料トライアル |
|--------|--------|------|----------------|
| Basic | SalesReport AI Basic | ¥980/月 | 7日間 |
| Pro | SalesReport AI Pro | ¥9,800/月 | 7日間 |

---

## Step 1: Basic プラン（日報AI）

### 1-1. 商品作成

1. Utageにログイン
2. 「商品」→「新規作成」
3. 以下を設定：

```
商品名: SalesReport AI Basic
説明: 営業日報を30秒で自動生成。5種類のフォーマット対応。
価格: 980円/月
無料トライアル: 7日間
決済方法: Stripe連携
```

### 1-2. 決済ページ設定

1. 「決済ページ」タブを開く
2. 以下を設定：

```
ページタイトル: SalesReport AI Basic - 7日間無料トライアル
説明文:
✓ 無制限の日報生成
✓ 5種類のフォーマット
✓ 営業コーチング月1回
✓ 履歴保存・検索

7日間無料でお試しいただけます。
いつでもキャンセルOK。
```

3. 決済ページURLをコピー（例: `https://utage-system.com/p/xxxxx`）

### 1-3. Webhook設定（購入時）

1. 「Webhook」タブを開く
2. 購入完了時のWebhookを設定：

```
URL: https://your-vercel-domain.vercel.app/api/webhook/purchase
メソッド: POST
送信データ: email, product_id, plan=basic
```

### 1-4. Webhook設定（解約時）

```
URL: https://your-vercel-domain.vercel.app/api/webhook/cancel
メソッド: POST
送信データ: email, product_id
```

---

## Step 2: Pro プラン（営業コーチングAI）

### 2-1. 商品作成

1. 「商品」→「新規作成」
2. 以下を設定：

```
商品名: SalesReport AI Pro
説明: 日報生成＋営業コーチング無制限＋週次レポート自動生成
価格: 9,800円/月
無料トライアル: 7日間
決済方法: Stripe連携
```

### 2-2. 決済ページ設定

```
ページタイトル: SalesReport AI Pro - 7日間無料トライアル
説明文:
✓ 無制限の日報生成
✓ 5種類のフォーマット
✓ カスタムフォーマット作成
✓ 営業コーチング無制限
✓ 週次レポート自動生成
✓ 優先サポート

7日間無料でお試しいただけます。
いつでもキャンセルOK。
```

### 2-3. Webhook設定

購入完了時:
```
URL: https://your-vercel-domain.vercel.app/api/webhook/purchase
送信データ: email, product_id, plan=pro
```

解約時:
```
URL: https://your-vercel-domain.vercel.app/api/webhook/cancel
送信データ: email, product_id
```

---

## Step 3: メール登録用シナリオ

### 3-1. シナリオ作成

1. 「シナリオ」→「新規作成」
2. シナリオ名: `SalesReport AI 登録者`

### 3-2. フォーム設定

アプリからのメール登録を受け取るフォーム:
```
フォームURL: https://utage-system.com/r/SH7RQHstnrbE/store
受け取るデータ: mail (メールアドレス)
```

### 3-3. ステップメール設定

**1通目（登録直後）**
```
件名: 【SalesReport AI】登録ありがとうございます！
本文:
%name%様

SalesReport AIへのご登録ありがとうございます。

商談メモを貼り付けるだけで、30秒で日報が完成します。
まずは無料で3回お試しください。

▼ 今すぐ使う
https://salesreport-ai.vercel.app

---
SalesReport AI運営事務局
```

**2通目（1日後）**
```
件名: 【SalesReport AI】日報作成、もう試しましたか？
本文:
%name%様

SalesReport AIはお試しいただけましたか？

「商談メモを貼り付けるだけ」で日報が完成します。
年間120時間の日報作成時間をゼロにしませんか？

▼ 今すぐ使う
https://salesreport-ai.vercel.app

---
SalesReport AI運営事務局
```

**3通目（3日後）**
```
件名: 【SalesReport AI】営業コーチング機能、知っていますか？
本文:
%name%様

日報作成だけでなく、「営業コーチング」機能もあります。

商談内容を入力すると、プロのセールス理論で採点・改善点を提案。
平均スコア23点アップの実績があります。

▼ 営業コーチングを試す
https://salesreport-ai.vercel.app/coaching

---
SalesReport AI運営事務局
```

**4通目（5日後）**
```
件名: 【SalesReport AI】無料回数、残りわずかです
本文:
%name%様

無料プランは月3回までです。
もっと使いたい場合は、Basicプラン（¥980/月）がおすすめです。

✓ 無制限の日報生成
✓ 5種類のフォーマット
✓ 営業コーチング月1回
✓ 7日間無料トライアル

▼ 7日間無料で試す
[Utage決済ページURL]

---
SalesReport AI運営事務局
```

**5通目（7日後）**
```
件名: 【SalesReport AI】本気で営業成績を上げたいなら
本文:
%name%様

日報を書くだけで営業成績は上がりますか？

Proプランなら、営業コーチングが無制限で使えます。
商談を分析して、具体的な改善点を指摘。
プロのセールス理論であなたの営業を改善します。

✓ 日報生成 無制限
✓ 営業コーチング 無制限
✓ 週次レポート自動生成
✓ カスタムフォーマット作成
✓ 7日間無料トライアル

▼ 7日間無料で試す
[Utage決済ページURL]

---
SalesReport AI運営事務局
```

---

## Step 4: 環境変数の設定

Vercelの環境変数に以下を設定:

```
NEXT_PUBLIC_UTAGE_REPORT_URL=https://utage-system.com/p/[BasicのページID]
NEXT_PUBLIC_UTAGE_COACHING_URL=https://utage-system.com/p/[ProのページID]
```

---

## 📋 チェックリスト

- [ ] Basic商品作成完了
- [ ] Basic決済ページURL取得
- [ ] Pro商品作成完了
- [ ] Pro決済ページURL取得
- [ ] 購入Webhook設定完了
- [ ] 解約Webhook設定完了
- [ ] メール登録シナリオ作成完了
- [ ] ステップメール設定完了
- [ ] Vercel環境変数設定完了
- [ ] テスト決済完了

---

## 🔧 Webhook API仕様

### 購入時 `/api/webhook/purchase`

```json
{
  "email": "user@example.com",
  "product_id": "salesreport-basic",
  "plan": "basic"
}
```

### 解約時 `/api/webhook/cancel`

```json
{
  "email": "user@example.com",
  "product_id": "salesreport-basic"
}
```

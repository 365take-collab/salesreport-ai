'use client';

import { useState } from 'react';
import Link from 'next/link';

const BONUS_TEMPLATES = [
  {
    name: '営業成約率UPフレーズ集（50選）',
    description: 'トップ営業マンが使う成約直結のセールストーク集',
    value: '¥9,800相当',
    icon: '🎯',
    category: 'bonus',
    content: `# 営業成約率UPフレーズ集 50選

## 📞 アポイント獲得フレーズ（10選）

### 1. 興味を引く導入
「〇〇業界で、御社と同規模の企業様が平均30%のコスト削減に成功した方法があるのですが、15分だけお時間いただけませんか？」

### 2. 断られにくい提案
「今すぐ導入いただく必要はありません。まずは情報収集として、話だけでも聞いていただけませんか？」

### 3. 具体的な数字を出す
「御社の競合である〇〇社では、導入後3ヶ月で売上が15%アップしました。」

### 4. 時間を限定する
「今週中であれば、特別に無料診断をさせていただくことが可能です。」

### 5. 決裁者への橋渡し
「部長様にも同席いただけると、より具体的なご提案ができます。」

## 🤝 信頼構築フレーズ（10選）

### 6. 共感を示す
「おっしゃる通りです。私も同じ立場なら、そう思います。」

### 7. 過去の経験を共有
「以前、同じような課題を抱えていた〇〇社様のケースでは...」

### 8. 正直に伝える
「正直に申し上げると、この点については弊社よりも〇〇社の方が得意です。ただし、△△については弊社が圧倒的です。」

## 💰 価格交渉フレーズ（10選）

### 9. 価値を先に伝える
「価格の前に、まず御社にとってのメリットを整理させてください。」

### 10. ROIで説明
「月額〇〇円の投資で、年間△△円のコスト削減が見込めます。投資対効果は約□倍です。」

### 11. 分割して見せる
「月額〇〇円は、1日あたり約△△円です。コーヒー1杯分で、この効果が得られます。」

## ❓ 反論処理フレーズ（10選）

### 12. 「高い」と言われたら
「確かに安くはありません。ただ、〇〇を考慮すると、むしろ安い投資だと思います。」

### 13. 「検討します」と言われたら
「ありがとうございます。具体的に、何を検討されますか？その点について、今お答えできることがあれば。」

### 14. 「他社と比較したい」と言われたら
「ぜひ比較してください。比較する際のポイントとして、〇〇と△△を確認されることをお勧めします。」

## 🎯 クロージングフレーズ（10選）

### 15. 選択肢を絞る
「AプランとBプランでは、どちらがイメージに近いですか？」

### 16. リスクを取り除く
「30日間の返金保証があります。まずは試してみて、合わなければ遠慮なくおっしゃってください。」

### 17. 緊急性を出す
「この特典は、今週中のお申し込みに限らせていただいております。」

---
続きは全50選をダウンロードしてご確認ください！`,
  },
  {
    name: 'BANT分析シート（Excel用）',
    description: '案件管理を自動化するテンプレート',
    value: '¥4,980相当',
    icon: '📊',
    category: 'bonus',
    content: `# BANT分析シート

## BANTとは？

見込み客を評価するための4つの基準です。

| 項目 | 意味 | 確認すること |
|------|------|-------------|
| Budget | 予算 | 購入する予算があるか？ |
| Authority | 決裁権 | 決定権を持っているか？ |
| Need | 必要性 | 本当に必要としているか？ |
| Timeline | 導入時期 | いつ導入したいか？ |

## 📊 Excel/スプレッドシート用テンプレート

以下をコピーしてExcel/スプレッドシートに貼り付けてください：

案件名	会社名	担当者名	Budget	Authority	Need	Timeline	BANTスコア	優先度	次回アクション	期限
案件A	〇〇株式会社	山田部長	◎	◎	◎	◎	4	S	契約書送付	1/20
案件B	△△株式会社	佐藤課長	○	△	◎	○	3	A	上長面談設定	1/25
案件C	□□株式会社	田中主任	△	×	○	△	1	C	ヒアリング継続	2/10

## 📋 評価基準

### Budget（予算）
◎ = 確定（予算が確保されている）
○ = 見込み（予算化の見込みがある）
△ = 検討中（予算についてはまだ検討段階）
× = なし（予算がない）

### Authority（決裁権）
◎ = 決裁者本人
○ = 決裁者に近い
△ = 承認必要
× = 決裁権なし

### Need（必要性）
◎ = 明確（課題が明確で、解決したい意欲が高い）
○ = ある程度（課題は認識しているが、緊急性は低い）
△ = 曖昧
× = なし

### Timeline（導入時期）
◎ = 今月中
○ = 1-3ヶ月
△ = 未定
× = 当面なし

## 🎯 BANTスコアと優先度

| BANTスコア | 優先度 | アクション |
|-----------|--------|-----------|
| 3.5 - 4.0 | S | 最優先で対応 |
| 2.5 - 3.4 | A | 優先対応 |
| 1.5 - 2.4 | B | 通常対応 |
| 0.5 - 1.4 | C | 様子見 |
| 0 - 0.4 | D | 保留 |`,
  },
  {
    name: '商談フォローアップ文例10選',
    description: 'コピペで使える追客メールテンプレート',
    value: '¥4,980相当',
    icon: '📧',
    category: 'bonus',
    content: `# 商談フォローアップ文例 10選

## 1. 商談後の御礼メール

【件名】本日はありがとうございました｜〇〇株式会社 山田

〇〇株式会社
△△様

お世話になっております。
〇〇株式会社の山田です。

本日はお忙しい中、貴重なお時間をいただき、
誠にありがとうございました。

本日お話しいただいた内容を整理いたしますと：

【御社の課題】
・〇〇〇〇
・△△△△

【ご要望】
・□□□□
・◇◇◇◇

上記について、弊社では〇〇という形で
お役に立てると考えております。

---

## 2. 資料送付メール

【件名】【資料送付】〇〇のご提案資料

〇〇株式会社
△△様

お世話になっております。

先日ご依頼いただいた資料をお送りいたします。

【添付資料】
1. 〇〇サービスのご案内（PDF）
2. 導入事例集（PDF）
3. 料金表（PDF）

---

## 3. 検討中へのフォローメール

【件名】その後、いかがでしょうか？

〇〇株式会社
△△様

先日は〇〇についてご検討いただき、
ありがとうございます。

その後、社内でのご検討状況はいかがでしょうか？

---

## 4. 見積もり送付メール

【件名】【お見積書】〇〇のご提案

【添付ファイル】
・お見積書_〇〇株式会社様.pdf

【お見積内容】
・〇〇プラン：月額〇〇円
・初期費用：〇〇円
・合計：〇〇円（税別）

---

## 5. 返信がない場合のフォローメール

【件名】確認させてください｜先日のご提案について

先日お送りした資料について、
ご確認いただけましたでしょうか？

もしかすると、メールが届いていない
可能性もあるかと思い、
念のためご連絡させていただきました。

---

## 6. 決裁者への紹介依頼メール

【件名】部長様へのご紹介のお願い

つきましては、最終的なご判断をいただく
〇〇部長様にも、直接ご説明させていただく
機会をいただけないでしょうか。

---

## 7. 競合比較後のフォローメール

【件名】他社様との比較ポイントについて

比較検討の参考になればと思い、
弊社の強みを改めてお伝えさせてください。

【弊社の強み】
1. 〇〇〇〇
2. △△△△
3. □□□□

---

## 8. 失注後の関係維持メール

【件名】ありがとうございました

今回は残念ながらお役に立てませんでしたが、
今後、状況が変わった際や、
別の形でお役に立てることがございましたら、
いつでもお声がけください。

---

## 9. 成約後の御礼メール

【件名】ご契約ありがとうございます

この度は、弊社サービスをご契約いただき、
誠にありがとうございます。

【今後のスケジュール】
・〇月〇日：導入キックオフミーティング
・〇月〇日：初期設定完了
・〇月〇日：本稼働開始

---

## 10. 紹介依頼メール

【件名】お願いがございます

もし△△様のお知り合いで、
同じような課題をお持ちの方がいらっしゃいましたら、
ぜひご紹介いただけないでしょうか。

【紹介特典】
ご紹介いただいた方がご契約された場合、
△△様と、ご紹介先の方、両方に
〇〇をプレゼントさせていただきます。`,
  },
];

const REPORT_TEMPLATES = [
  {
    name: 'シンプル日報',
    description: '必要最小限の項目だけ。忙しい日でも1分で完成。',
    preview: `■ 訪問先: 〇〇株式会社
■ 担当者: 山田部長
■ 内容:
  - 新サービスの提案
  - 来週中に検討予定
■ 次のアクション: 見積書作成`,
    icon: '📝',
  },
  {
    name: '詳細報告書',
    description: '上司への報告に最適。商談の流れを詳しく記録。',
    preview: `━━━━━━━━━━━━━━━━━━
■ 基本情報
  訪問先: 〇〇株式会社
  担当者: 山田部長
  
■ 商談内容
  【背景・目的】新規開拓
  【提案内容】月額プラン
  【先方の反応】前向き

■ 次のアクション
  - 見積書作成（3日以内）
━━━━━━━━━━━━━━━━━━`,
    icon: '📊',
  },
  {
    name: 'BANT分析',
    description: '受注確度を数値化。営業戦略の立案に。',
    preview: `📊 BANT分析レポート

【Budget（予算）】
・予算規模: 500万円/年
・確保状況: 来期予算で検討中

【Authority（決裁権）】
・決裁者: 経営企画部長

【Need（ニーズ）】
・課題: 業務効率化

【Timeline】
・希望時期: 来年4月

■ 受注確度: 60%`,
    icon: '📈',
  },
  {
    name: '営業日報（チーム共有用）',
    description: 'チームで情報共有しやすいフォーマット。',
    preview: `📝 営業日報

【訪問先】〇〇株式会社
【商談サマリー】
新規提案。来週中に検討予定。

【競合情報】
A社が先行提案済み

【案件ステータス】
・フェーズ: 提案中
・確度: 50%

【ネクストアクション】
・見積書作成（期限: 1/20）`,
    icon: '👥',
  },
  {
    name: '週次報告書',
    description: 'マネージャー向け。週の成果を一覧化。',
    preview: `📊 週次営業レポート

■ 今週のサマリー
  - 訪問件数: 8件
  - 商談件数: 5件
  - 受注: 1件（150万円）

■ 主要な商談
  1. A社: 提案中（確度70%）
  2. B社: 検討中（確度50%）

■ 来週の重点アクション
  1. A社の最終提案
  2. C社の新規開拓`,
    icon: '📅',
  },
];

export default function TemplatesPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [selectedBonus, setSelectedBonus] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'lead_magnet' }),
      });

      if (!response.ok) {
        throw new Error('登録に失敗しました');
      }

      localStorage.setItem('salesreport_email', email);
      setIsSubmitted(true);
    } catch {
      setError('登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('コピーしました！');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* ヘッダー */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-amber-400">
            SalesReport AI
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {!isSubmitted ? (
          <>
            {/* ヒーローセクション */}
            <div className="text-center mb-12 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm mb-4">
                <span>🎁</span>
                <span>総額19,760円相当 → 無料プレゼント</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                営業成績を上げる
                <br />
                <span className="gradient-text">3大特典セット</span>
              </h1>
              <p className="text-slate-400 text-lg">
                トップ営業マンが使うツールを無料でプレゼント
              </p>
            </div>

            {/* 特典セクション */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6 text-center">🎁 3大特典（総額19,760円相当）</h2>
              <div className="space-y-4">
                {BONUS_TEMPLATES.map((bonus, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedBonus(selectedBonus === index ? null : index)}
                    className={`w-full text-left p-6 rounded-xl border transition-all ${
                      selectedBonus === index
                        ? 'bg-amber-500/20 border-amber-500/50'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{bonus.icon}</span>
                        <div>
                          <div className="font-bold text-lg">{bonus.name}</div>
                          <div className="text-sm text-slate-400">{bonus.description}</div>
                        </div>
                      </div>
                      <div className="text-amber-400 font-bold text-sm whitespace-nowrap">
                        {bonus.value}
                      </div>
                    </div>
                    {selectedBonus === index && (
                      <div className="mt-4 p-4 bg-slate-900 rounded-lg text-sm text-slate-300 whitespace-pre-wrap animate-fadeIn max-h-96 overflow-y-auto">
                        {bonus.content.substring(0, 1500)}...
                        <div className="mt-4 text-center text-amber-400">
                          ↓ 続きは登録後にダウンロード ↓
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 登録フォーム */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-8 text-center mb-12">
              <h2 className="text-2xl font-bold mb-2">📧 無料でダウンロード</h2>
              <p className="text-slate-400 mb-6">
                メールアドレスを入力するだけ！すぐにダウンロードできます。
              </p>
              
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-4 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
                />
                
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold rounded-lg transition-colors text-lg"
                >
                  {isSubmitting ? 'ダウンロード準備中...' : '🚀 3大特典を無料でダウンロード'}
                </button>
              </form>
              
              <p className="text-xs text-slate-500 mt-4">
                ※登録すると、SalesReport AIの最新情報もお届けします
              </p>
            </div>

            {/* 日報テンプレートセクション */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6 text-center">📄 さらに！日報テンプレート5種類も</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {REPORT_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTemplate(selectedTemplate === index ? null : index)}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      selectedTemplate === index
                        ? 'bg-amber-500/20 border-amber-500/50'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{template.icon}</span>
                      <span className="font-semibold">{template.name}</span>
                    </div>
                    <p className="text-sm text-slate-400">{template.description}</p>
                    {selectedTemplate === index && (
                      <div className="mt-3 p-3 bg-slate-900 rounded text-xs text-slate-300 whitespace-pre-wrap font-mono animate-fadeIn">
                        {template.preview}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 信頼性 */}
            <div className="text-center text-slate-500 text-sm">
              <p>🔒 メールアドレスは厳重に管理し、第三者に提供することはありません</p>
            </div>
          </>
        ) : (
          /* ダウンロード完了画面 */
          <div className="animate-fadeIn">
            <div className="text-center py-8">
              <span className="text-6xl">🎉</span>
              <h2 className="text-3xl font-bold mt-6 mb-4">
                ダウンロード準備完了！
              </h2>
              <p className="text-slate-400 mb-8">
                {email} に詳細をお送りしました。
                <br />
                以下から今すぐダウンロードできます。
              </p>
            </div>
            
            {/* 3大特典 */}
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-6">🎁 3大特典</h3>
              <div className="space-y-4">
                {BONUS_TEMPLATES.map((bonus, index) => (
                  <details key={index} className="bg-slate-800 rounded-xl border border-slate-700">
                    <summary className="p-4 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{bonus.icon}</span>
                        <div>
                          <span className="font-bold">{bonus.name}</span>
                          <span className="ml-2 text-amber-400 text-sm">{bonus.value}</span>
                        </div>
                      </div>
                      <span className="text-slate-400">▼</span>
                    </summary>
                    <div className="p-4 pt-0 border-t border-slate-700">
                      <pre className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-900 p-4 rounded-lg max-h-96 overflow-y-auto">
                        {bonus.content}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(bonus.content)}
                        className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors"
                      >
                        📋 コピーする
                      </button>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* 日報テンプレート */}
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-6">📄 日報テンプレート5種類</h3>
              <div className="space-y-4">
                {REPORT_TEMPLATES.map((template, index) => (
                  <details key={index} className="bg-slate-800 rounded-lg border border-slate-700">
                    <summary className="p-3 cursor-pointer flex items-center gap-2">
                      <span>{template.icon}</span>
                      <span className="font-semibold">{template.name}</span>
                    </summary>
                    <div className="p-4 pt-0">
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-slate-900 p-3 rounded">
                        {template.preview}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(template.preview)}
                        className="mt-2 text-sm text-amber-400 hover:text-amber-300"
                      >
                        📋 コピーする
                      </button>
                    </div>
                  </details>
                ))}
              </div>
            </div>
            
            {/* CTAボタン */}
            <div className="text-center space-y-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-8">
              <h3 className="text-xl font-bold">🚀 次のステップ</h3>
              <p className="text-slate-400">
                特典を活用しながら、SalesReport AIで日報を自動生成してみませんか？
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors text-lg"
              >
                🚀 SalesReport AIを無料で試す
              </Link>
              <p className="text-sm text-slate-500">
                月3回まで無料 / 7日間無料トライアルあり
              </p>
            </div>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="border-t border-slate-700 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 mb-4">
            <Link href="/terms" className="hover:text-slate-300">利用規約</Link>
            <Link href="/privacy" className="hover:text-slate-300">プライバシーポリシー</Link>
            <Link href="/legal" className="hover:text-slate-300">特定商取引法に基づく表記</Link>
          </div>
          <div className="text-center text-slate-500 text-sm">
            © 2025 SalesReport AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

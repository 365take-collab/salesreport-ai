'use client';

import { useState } from 'react';
import Link from 'next/link';

const TEMPLATES = [
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
・プロセス: 部長決裁

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
・予算: 300万円

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
      // メール登録API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'lead_magnet' }),
      });

      if (!response.ok) {
        throw new Error('登録に失敗しました');
      }

      // ローカルストレージに保存
      localStorage.setItem('salesreport_email', email);
      
      setIsSubmitted(true);
    } catch {
      setError('登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
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
                <span>無料ダウンロード</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                営業日報テンプレート集
                <br />
                <span className="gradient-text">5種類を無料プレゼント</span>
              </h1>
              <p className="text-slate-400 text-lg">
                コピペするだけで使える！プロの営業マンが使う日報フォーマット
              </p>
            </div>

            {/* テンプレートプレビュー */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6 text-center">📄 収録テンプレート</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEMPLATES.map((template, index) => (
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

            {/* 登録フォーム */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-8 text-center">
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
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold rounded-lg transition-colors btn-ripple glow-amber"
                >
                  {isSubmitting ? 'ダウンロード準備中...' : '🚀 無料でダウンロード'}
                </button>
              </form>
              
              <p className="text-xs text-slate-500 mt-4">
                ※登録すると、SalesReport AIの最新情報もお届けします
              </p>
            </div>

            {/* 特典 */}
            <div className="mt-12 text-center">
              <h3 className="text-lg font-bold mb-4">🎁 さらに特典</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <span className="text-2xl">📝</span>
                  <p className="mt-2 text-sm">日報テンプレート5種</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <span className="text-2xl">🎯</span>
                  <p className="mt-2 text-sm">SalesReport AI 3回無料</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <span className="text-2xl">📧</span>
                  <p className="mt-2 text-sm">営業ノウハウメール</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ダウンロード完了画面 */
          <div className="text-center py-12 animate-fadeIn">
            <span className="text-6xl">🎉</span>
            <h2 className="text-3xl font-bold mt-6 mb-4">
              ダウンロード準備完了！
            </h2>
            <p className="text-slate-400 mb-8">
              {email} にダウンロードリンクを送信しました。
              <br />
              メールが届かない場合は、迷惑メールフォルダをご確認ください。
            </p>
            
            {/* テンプレート表示 */}
            <div className="bg-slate-800 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto">
              <h3 className="font-bold mb-4">📄 今すぐ使えるテンプレート</h3>
              <div className="space-y-4">
                {TEMPLATES.map((template, index) => (
                  <details key={index} className="bg-slate-900 rounded-lg">
                    <summary className="p-3 cursor-pointer flex items-center gap-2">
                      <span>{template.icon}</span>
                      <span className="font-semibold">{template.name}</span>
                    </summary>
                    <div className="p-4 pt-0">
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-slate-800 p-3 rounded">
                        {template.preview}
                      </pre>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(template.preview);
                          alert('コピーしました！');
                        }}
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
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors"
              >
                🚀 SalesReport AIを無料で試す
              </Link>
              <p className="text-sm text-slate-500">
                日報テンプレートを自動で埋めてくれるAIツール
              </p>
            </div>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="border-t border-slate-700 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          © 2025 SalesReport AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

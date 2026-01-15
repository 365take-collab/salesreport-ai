'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CategoryScore {
  score: number;
  details: Record<string, number>;
}

interface AnalysisResult {
  totalScore: number;
  categories: {
    offer: CategoryScore;
    closing: CategoryScore;
    priceNegotiation: CategoryScore;
    followUp: CategoryScore;
  };
  goodPoints: string[];
  improvementPoints: string[];
  improvedScript: string;
  danKennedyQuote: {
    situation: string;
    quote: string;
    advice: string;
  };
}

export default function CoachingPage() {
  const [email, setEmail] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('salesreport_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('商談内容を入力してください');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '分析に失敗しました');
      }

      setResult(data);
      
      // 履歴に保存
      if (email) {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            input: transcript,
            output: JSON.stringify(data, null, 2),
            type: 'coaching',
          }),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    if (score >= 40) return '💪';
    return '📚';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* ヘッダー */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-amber-400">
            SalesReport AI
          </Link>
          <nav className="flex gap-4">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              日報作成
            </Link>
            <Link href="/coaching" className="text-amber-400 font-semibold">
              営業コーチング
            </Link>
            <Link href="/weekly" className="text-slate-300 hover:text-white transition-colors">
              週報作成
            </Link>
            <Link href="/history" className="text-slate-300 hover:text-white transition-colors">
              履歴
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            🎯 営業コーチングAI
          </h1>
          <p className="text-slate-400 mb-4">
            プロのセールス理論であなたの営業を採点・改善
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm">
              <span>✨</span>
              <span>7日間無料トライアル</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm">
              <span>📈</span>
              <span>平均スコア23点アップ</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 入力セクション */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📝</span> 商談内容を入力
            </h2>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full h-64 p-4 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              placeholder={`商談の内容をここに入力してください。

例：
「本日は貴重なお時間をいただきありがとうございます。
弊社の営業支援ツールについてご説明させていただきます。
こちらは月額5万円で、御社の営業効率を30%改善できます。
ご検討いただけますでしょうか？」

※音声録音の書き起こしでもOKです`}
            />
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold rounded-lg transition-colors"
            >
              {isLoading ? '分析中...' : '🔍 商談を分析する'}
            </button>
          </div>

          {/* 結果セクション */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📊</span> 分析結果
            </h2>

            {!result && !isLoading && (
              <div className="h-64 flex items-center justify-center text-slate-500">
                商談内容を入力して分析ボタンを押してください
              </div>
            )}

            {isLoading && (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-400">セールス理論で分析中...</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* 総合スコア */}
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <div className="text-5xl font-bold text-amber-400 mb-2">
                    {getScoreEmoji(result.totalScore)} {result.totalScore}
                    <span className="text-2xl text-slate-400">/100</span>
                  </div>
                  <p className="text-slate-400">総合スコア</p>
                </div>

                {/* カテゴリ別スコア */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>オファー設計</span>
                      <span>{result.categories.offer.score}/30</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreColor(result.categories.offer.score, 30)} transition-all`}
                        style={{ width: `${(result.categories.offer.score / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>クロージング</span>
                      <span>{result.categories.closing.score}/30</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreColor(result.categories.closing.score, 30)} transition-all`}
                        style={{ width: `${(result.categories.closing.score / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>価格交渉対応</span>
                      <span>{result.categories.priceNegotiation.score}/20</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreColor(result.categories.priceNegotiation.score, 20)} transition-all`}
                        style={{ width: `${(result.categories.priceNegotiation.score / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>フォローアップ</span>
                      <span>{result.categories.followUp.score}/20</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreColor(result.categories.followUp.score, 20)} transition-all`}
                        style={{ width: `${(result.categories.followUp.score / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 詳細フィードバック */}
        {result && (
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            {/* 良かった点 */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-400 flex items-center gap-2">
                <span>✅</span> 良かった点
              </h3>
              <ul className="space-y-2">
                {result.goodPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 改善点 */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-amber-400 flex items-center gap-2">
                <span>⚠️</span> 改善すべき点
              </h3>
              <ul className="space-y-2">
                {result.improvementPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 改善スクリプト */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>💡</span> 具体的な改善スクリプト
              </h3>
              <div className="bg-slate-900 p-4 rounded-lg text-slate-300 whitespace-pre-wrap">
                {result.improvedScript}
              </div>
            </div>

            {/* プロからのアドバイス */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>📖</span> プロからのアドバイス
              </h3>
              <blockquote className="italic text-lg mb-4 text-amber-200">
                &ldquo;{result.danKennedyQuote.quote}&rdquo;
              </blockquote>
              <p className="text-slate-300 text-sm">
                <strong>実践ポイント：</strong> {result.danKennedyQuote.advice}
              </p>
            </div>
          </div>
        )}

        {/* 松竹梅プラン */}
        <div className="mt-12 bg-slate-800 border border-slate-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-2 text-center">
            🚀 もっと営業力を高めたいですか？
          </h2>
          <p className="text-slate-400 text-center mb-8">
            プランをアップグレードして、営業コーチングを最大限活用
          </p>
          
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Basic */}
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
              <div className="text-lg font-semibold mb-2 text-amber-400">Basic</div>
              <div className="text-2xl font-bold mb-1">¥980<span className="text-sm font-normal text-slate-400">/月</span></div>
              <div className="text-xs text-slate-400 mb-1">または ¥9,800/年（2ヶ月無料）</div>
              <div className="text-sm text-green-400 mb-4">7日間無料</div>
              <ul className="text-sm text-slate-400 space-y-2 mb-4">
                <li>✓ 日報生成 無制限</li>
                <li>✓ 営業コーチング <strong className="text-white">月1回</strong></li>
                <li className="text-slate-500">✗ 週次レポートなし</li>
              </ul>
              <a
                href={process.env.NEXT_PUBLIC_UTAGE_REPORT_URL || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded transition-colors text-sm"
              >
                7日間無料で試す
              </a>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border-2 border-purple-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                おすすめ
              </div>
              <div className="text-lg font-semibold mb-2 text-purple-400">Pro</div>
              <div className="text-2xl font-bold mb-1">¥9,800<span className="text-sm font-normal text-slate-400">/月</span></div>
              <div className="text-xs text-slate-400 mb-1">または ¥98,000/年（2ヶ月無料）</div>
              <div className="text-sm text-green-400 mb-4">7日間無料</div>
              <ul className="text-sm text-slate-300 space-y-2 mb-4">
                <li>✓ 日報生成 無制限</li>
                <li>✓ 営業コーチング <strong className="text-purple-400">無制限</strong></li>
                <li>✓ <strong>週次レポート自動生成</strong></li>
                <li>✓ <strong>優先サポート</strong></li>
              </ul>
              <a
                href={process.env.NEXT_PUBLIC_UTAGE_COACHING_URL || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded transition-colors text-sm"
              >
                7日間無料で試す
              </a>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
              <div className="text-lg font-semibold mb-2 text-slate-300">Enterprise</div>
              <div className="text-2xl font-bold mb-1">要相談</div>
              <div className="text-sm text-slate-500 mb-4">チーム向け</div>
              <ul className="text-sm text-slate-400 space-y-2 mb-4">
                <li>✓ チーム全員利用可</li>
                <li>✓ 管理者ダッシュボード</li>
                <li>✓ チーム分析レポート</li>
                <li>✓ 専属サポート</li>
              </ul>
              <button
                className="block w-full text-center py-2 border border-slate-500 text-slate-300 rounded transition-colors text-sm hover:bg-slate-800"
              >
                お問い合わせ
              </button>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 text-center mt-4">
            いつでもキャンセルOK・返金保証あり
          </p>
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-slate-700 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          © 2025 SalesReport AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

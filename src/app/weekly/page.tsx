'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DailyReport {
  date: string;
  content: string;
}

export default function WeeklyReportPage() {
  const [email, setEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'basic' | 'pro'>('free');
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([
    { date: '', content: '' },
    { date: '', content: '' },
    { date: '', content: '' },
    { date: '', content: '' },
    { date: '', content: '' },
  ]);
  const [weeklyReport, setWeeklyReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('salesreport_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setIsRegistered(true);

      const controller = new AbortController();
      const loadPlan = async () => {
        setIsPlanLoading(true);
        try {
          const response = await fetch(`/api/usage?email=${encodeURIComponent(savedEmail)}`, {
            signal: controller.signal,
          });
          const data: unknown = await response.json();
          const raw = String((data as { plan?: unknown })?.plan || 'free').toLowerCase();
          if (raw === 'basic') setUserPlan('basic');
          else if (raw === 'pro' || raw === 'enterprise') setUserPlan('pro');
          else setUserPlan('free');
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') return;
          setUserPlan('free');
        } finally {
          setIsPlanLoading(false);
        }
      };
      void loadPlan();

      return () => controller.abort();
    }
  }, []);

  const handleReportChange = (index: number, field: 'date' | 'content', value: string) => {
    const newReports = [...dailyReports];
    newReports[index][field] = value;
    setDailyReports(newReports);
  };

  const addDay = () => {
    if (dailyReports.length < 7) {
      setDailyReports([...dailyReports, { date: '', content: '' }]);
    }
  };

  const removeDay = (index: number) => {
    if (dailyReports.length > 1) {
      setDailyReports(dailyReports.filter((_, i) => i !== index));
    }
  };

  const handleGenerate = async () => {
    const filledReports = dailyReports.filter(r => r.content.trim());
    
    if (filledReports.length === 0) {
      setError('少なくとも1日分の日報を入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyReports: filledReports }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '週次レポートの生成に失敗しました');
      }

      setWeeklyReport(data.weeklyReport);

      // 履歴に保存
      if (email) {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            input: JSON.stringify(filledReports),
            output: data.weeklyReport,
            type: 'weekly',
          }),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '週次レポートの生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(weeklyReport);
    alert('クリップボードにコピーしました');
  };

  const handleStripeCheckout = async (plan: 'pro') => {
    if (!email) {
      setCheckoutError('メールアドレスが設定されていません');
      return;
    }
    setIsCheckoutLoading(true);
    setCheckoutError('');
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'チェックアウトの開始に失敗しました');
      }
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'チェックアウトの開始に失敗しました');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Proプラン以外は制限
  const isPro = userPlan === 'pro';

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
            <Link href="/coaching" className="text-slate-300 hover:text-white transition-colors">
              営業コーチング
            </Link>
            <Link href="/weekly" className="text-amber-400 font-semibold">
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
            📊 週次レポート自動生成
          </h1>
          <p className="text-slate-400 mb-4">
            1週間分の日報から、週次レポートを自動作成
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm">
            <span>👑</span>
            <span>Proプラン限定機能</span>
          </div>
        </div>

        {!isRegistered ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <h3 className="text-xl font-semibold mb-4">📧 まずはメールアドレスを登録</h3>
            <p className="text-slate-400 mb-4">
              週次レポート機能を使うには、まずメールアドレスを登録してください。
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors"
            >
              登録ページへ
            </Link>
          </div>
        ) : isPlanLoading ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <h3 className="text-xl font-semibold mb-4">⏳ プランを確認中...</h3>
            <p className="text-slate-400">しばらくお待ちください。</p>
          </div>
        ) : !isPro ? (
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-8 text-center border border-purple-500/30">
            <h3 className="text-2xl font-bold mb-4">👑 Proプラン限定機能</h3>
            <p className="text-slate-300 mb-6">
              週次レポート自動生成は<strong className="text-purple-400">Proプラン</strong>でご利用いただけます。
              <br />
              1週間分の日報を入力するだけで、マネージャー向けの週次レポートを自動作成。
            </p>
            <ul className="text-left max-w-md mx-auto mb-6 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                日報生成 無制限
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                営業コーチング 無制限
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <strong className="text-purple-400">週次レポート自動生成</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                カスタムフォーマット作成
              </li>
            </ul>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-purple-400">7日間無料</div>
              <div className="text-sm text-slate-400">その後 ¥9,800/月</div>
            </div>
            {checkoutError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
                {checkoutError}
              </div>
            )}
            <button
              onClick={() => handleStripeCheckout('pro')}
              disabled={isCheckoutLoading}
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              {isCheckoutLoading ? '処理中...' : '🚀 7日間無料で試す'}
            </button>
          </div>
        ) : (
          <>
            {/* 日報入力フォーム */}
            <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">📝 今週の日報を入力</h2>
              <p className="text-slate-400 text-sm mb-4">
                各日の日報を入力してください。空欄の日はスキップされます。
              </p>

              <div className="space-y-4">
                {dailyReports.map((report, index) => (
                  <div key={index} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-amber-400 font-semibold">Day {index + 1}</span>
                      <input
                        type="date"
                        value={report.date}
                        onChange={(e) => handleReportChange(index, 'date', e.target.value)}
                        className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      {dailyReports.length > 1 && (
                        <button
                          onClick={() => removeDay(index)}
                          className="ml-auto text-slate-400 hover:text-red-400 text-sm"
                        >
                          ✕ 削除
                        </button>
                      )}
                    </div>
                    <textarea
                      value={report.content}
                      onChange={(e) => handleReportChange(index, 'content', e.target.value)}
                      className="w-full h-24 p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-sm"
                      placeholder="この日の日報を入力..."
                    />
                  </div>
                ))}
              </div>

              {dailyReports.length < 7 && (
                <button
                  onClick={addDay}
                  className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                >
                  + 日を追加
                </button>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
              >
                {isLoading ? '生成中...' : '📊 週次レポートを生成'}
              </button>
            </div>

            {/* 生成結果 */}
            {weeklyReport && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">📄 週次レポート</h3>
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                  >
                    📋 コピー
                  </button>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg whitespace-pre-wrap text-slate-200 leading-relaxed">
                  {weeklyReport}
                </div>
              </div>
            )}
          </>
        )}
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

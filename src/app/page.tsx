'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type FormatType = 'simple' | 'detailed' | 'bant' | 'report' | 'sales' | 'custom';

// 無料プランの月間利用上限
const FREE_LIMIT = 3;

// フォーマット一覧（プラン別）
const FORMATS = {
  simple: { name: 'シンプル（箇条書き）', plan: 'free' },
  detailed: { name: '詳細（上司報告向け）', plan: 'basic' },
  bant: { name: 'BANT分析', plan: 'basic' },
  report: { name: '正式報告書', plan: 'basic' },
  sales: { name: '営業日報', plan: 'basic' },
  custom: { name: '✨ カスタム（自分で作成）', plan: 'pro' },
};

export default function Home() {
  const [email, setEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [userPlan, setUserPlan] = useState<'free' | 'basic' | 'pro'>('free');
  const [input, setInput] = useState('');
  const [format, setFormat] = useState<FormatType>('simple');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [savedCustomFormats, setSavedCustomFormats] = useState<{name: string, prompt: string}[]>([]);
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showReferralSuccess, setShowReferralSuccess] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  
  // 成長戦略関連のステート（Duolingo/Grammarly式）
  const [streak, setStreak] = useState(0);
  const [salesScore, setSalesScore] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [showStreakModal, setShowStreakModal] = useState(false);
  
  // 認証関連のステート（一時的にスキップ）
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  
  // 紹介コード関連
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [userReferralCode, setUserReferralCode] = useState('');

  // 初回ロード時にローカルストレージから復元 & 紹介コードをチェック
  useEffect(() => {
    const savedEmail = localStorage.getItem('salesreport_email');
    const savedFormats = localStorage.getItem('salesreport_custom_formats');
    
    // URLから紹介コードを取得
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      localStorage.setItem('salesreport_referral_code', refCode);
    } else {
      // 以前保存した紹介コードがあれば使用
      const savedRefCode = localStorage.getItem('salesreport_referral_code');
      if (savedRefCode) {
        setReferralCode(savedRefCode);
      }
    }
    
    if (savedEmail) {
      setEmail(savedEmail);
      setIsRegistered(true);
      setIsEmailVerified(true); // 一時的にスキップ
      checkUsage(savedEmail);
    }
    
    if (savedFormats) {
      try {
        setSavedCustomFormats(JSON.parse(savedFormats));
      } catch {
        // ignore
      }
    }
  }, []);

  const checkUsage = async (userEmail: string) => {
    try {
      const response = await fetch(`/api/usage?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      setUsageCount(data.usageCount || 0);
      
      // ダッシュボードデータを更新（Duolingo/Grammarly式）
      setStreak(data.streak || 0);
      setSalesScore(data.salesScore || 0);
      setReferralCount(data.referralCount || 0);
      setUserReferralCode(data.referralCode || '');
      setIsEmailVerified(true); // 一時的にスキップ
    } catch {
      console.error('Failed to check usage');
    }
  };

  const handleRegister = async () => {
    if (!email || !email.includes('@')) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    setIsRegistering(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          referralCode: referralCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登録に失敗しました');
      }

      localStorage.setItem('salesreport_email', email);
      // 紹介コードを使用済みとしてクリア
      if (referralCode) {
        localStorage.removeItem('salesreport_referral_code');
      }
      
      setIsRegistered(true);
      setUsageCount(data.usageCount || 0);
      setIsEmailVerified(true); // 一時的にスキップ
      setUserReferralCode(data.referralCode || '');
      
      // 紹介経由の登録なら成功メッセージを表示
      if (data.referralApplied) {
        setShowReferralSuccess(true);
      }
      
      // ダッシュボードデータを取得
      checkUsage(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('商談メモを入力してください');
      return;
    }

    // メール認証チェック（一時的にスキップ）

    // フォーマットのプランチェック
    const formatConfig = FORMATS[format];
    if (formatConfig.plan === 'basic' && userPlan === 'free') {
      setError('このフォーマットはBasicプラン以上で利用できます');
      setShowUpgradeModal(true);
      return;
    }
    if (formatConfig.plan === 'pro' && userPlan !== 'pro') {
      setError('カスタムフォーマットはProプラン限定です');
      setShowUpgradeModal(true);
      return;
    }

    // 使用回数チェック（無料プランのみ）
    if (userPlan === 'free' && usageCount >= FREE_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 使用回数をインクリメント（無料プランのみ）+ ストリーク/スコア更新
      if (userPlan === 'free') {
        const usageResponse = await fetch('/api/usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const usageData = await usageResponse.json();
        
        // ストリーク更新時にお祝い表示（Duolingo式）
        if (usageData.isNewDay && usageData.streak > 1) {
          setShowStreakModal(true);
        }
        setStreak(usageData.streak || 0);
        setSalesScore(usageData.salesScore || 0);
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input, 
          format: format === 'custom' ? 'simple' : format,
          customPrompt: format === 'custom' ? customPrompt : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '日報の生成に失敗しました');
      }

      setReport(data.report);
      if (userPlan === 'free') {
        setUsageCount(prev => prev + 1);
      }
      
      // 履歴に保存
      if (email) {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            input,
            output: data.report,
            format,
            type: 'report',
          }),
        });
      }
      
      // 残り回数が少なくなったらアップセル
      if (userPlan === 'free' && usageCount + 1 >= FREE_LIMIT - 1) {
        setTimeout(() => setShowUpgradeModal(true), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '日報の生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomFormat = () => {
    const name = prompt('カスタムフォーマットの名前を入力してください');
    if (!name || !customPrompt.trim()) return;
    
    const newFormats = [...savedCustomFormats, { name, prompt: customPrompt }];
    setSavedCustomFormats(newFormats);
    localStorage.setItem('salesreport_custom_formats', JSON.stringify(newFormats));
    alert('カスタムフォーマットを保存しました！');
  };

  const handleLoadCustomFormat = (prompt: string) => {
    setCustomPrompt(prompt);
    setShowCustomEditor(true);
  };

  const handleDeleteCustomFormat = (index: number) => {
    const newFormats = savedCustomFormats.filter((_, i) => i !== index);
    setSavedCustomFormats(newFormats);
    localStorage.setItem('salesreport_custom_formats', JSON.stringify(newFormats));
  };

  // Stripe Checkout へリダイレクト
  const handleStripeCheckout = async (plan: 'basic' | 'pro') => {
    if (!email) {
      setError('メールアドレスが必要です');
      return;
    }
    setIsCheckoutLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Checkout の作成に失敗しました');
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout の作成に失敗しました');
      setIsCheckoutLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    alert('クリップボードにコピーしました');
  };

  const remaining = Math.max(0, FREE_LIMIT - usageCount);

  // フォーマットが選択可能かチェック
  const isFormatAvailable = (formatKey: FormatType) => {
    const formatConfig = FORMATS[formatKey];
    if (formatConfig.plan === 'free') return true;
    if (formatConfig.plan === 'basic' && (userPlan === 'basic' || userPlan === 'pro')) return true;
    if (formatConfig.plan === 'pro' && userPlan === 'pro') return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* ヘッダー */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-amber-400">SalesReport AI</h1>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-amber-400 font-semibold">
              日報作成
            </Link>
            <Link href="/coaching" className="text-slate-300 hover:text-white transition-colors">
              営業コーチング
            </Link>
            <Link href="/weekly" className="text-slate-300 hover:text-white transition-colors hidden sm:block">
              週報作成
            </Link>
            <Link href="/history" className="text-slate-300 hover:text-white transition-colors hidden sm:block">
              履歴
            </Link>
            {isRegistered && (
              <span className="text-xs text-slate-500 hidden sm:block">
                残り{remaining}回
              </span>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* ヒーローセクション */}
        <div className="text-center mb-8 animate-fadeIn">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            日報のために残業するのは、
            <br />
            <span className="gradient-text">今日で最後。</span>
          </h2>
          <p className="text-slate-400 mb-4">
            商談メモを貼るだけ。30秒で完成。
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm hover-lift">
              <span>✨</span>
              <span>7日間無料トライアル</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm hover-lift">
              <span>👥</span>
              <span>1,200人以上の営業マンが利用中</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            年間120時間の日報作成時間 → ゼロに
          </p>
        </div>

        {/* メール登録フォーム（未登録時） */}
        {!isRegistered ? (
          <div className="bg-slate-800 rounded-xl p-8 mb-6 border border-slate-700 text-center">
            <h3 className="text-xl font-semibold mb-2">📧 メールアドレスを登録して始める</h3>
            <p className="text-slate-400 text-sm mb-6">
              登録無料・月3回まで無料で使えます
            </p>
            
            <div className="max-w-md mx-auto">
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
                onClick={handleRegister}
                disabled={isRegistering}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold rounded-lg transition-colors btn-ripple glow-amber"
              >
                {isRegistering ? '登録中...' : '🚀 無料で始める'}
              </button>
              
              <p className="text-xs text-slate-500 mt-4">
                登録することで、利用規約とプライバシーポリシーに同意したものとみなされます。
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 使用状況ダッシュボード（Duolingo/Grammarly式） */}
            <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
              {/* ストリーク表示（Duolingo式） */}
              <div className="flex items-center justify-center gap-4 mb-4 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <div className="text-orange-400 font-bold text-xl">{streak}日連続</div>
                    <div className="text-xs text-slate-400">ストリーク継続中！</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <div className="text-purple-400 font-bold text-xl">{salesScore}</div>
                    <div className="text-xs text-slate-400">営業スコア</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{usageCount}</div>
                  <div className="text-xs text-slate-500">今月の生成数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{usageCount * 15}分</div>
                  <div className="text-xs text-slate-500">節約した時間</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{referralCount}人</div>
                  <div className="text-xs text-slate-500">紹介実績</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{remaining}</div>
                  <div className="text-xs text-slate-500">残り回数</div>
                </div>
              </div>

              {/* バッジ表示（Duolingo式） */}
              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-700">
                <span className={`px-2 py-1 rounded text-xs ${usageCount >= 1 ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'}`}>
                  🎯 初回達成
                </span>
                <span className={`px-2 py-1 rounded text-xs ${streak >= 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-500'}`}>
                  🔥 3日連続
                </span>
                <span className={`px-2 py-1 rounded text-xs ${streak >= 7 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>
                  🏆 1週間継続
                </span>
                <span className={`px-2 py-1 rounded text-xs ${salesScore >= 100 ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-500'}`}>
                  ⭐ スコア100
                </span>
                <span className={`px-2 py-1 rounded text-xs ${referralCount >= 1 ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-700 text-slate-500'}`}>
                  👥 初紹介達成
                </span>
                <span className={`px-2 py-1 rounded text-xs ${streak >= 30 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-500'}`}>
                  👑 30日連続
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">今月の使用回数</span>
                <span className="text-sm">
                  <span className="text-amber-400 font-bold">{usageCount}</span>
                  <span className="text-slate-500">/{FREE_LIMIT}回</span>
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${usageCount >= FREE_LIMIT ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, (usageCount / FREE_LIMIT) * 100)}%` }}
                />
              </div>
              {remaining <= 2 && remaining > 0 && (
                <p className="text-xs text-amber-400 mt-2">
                  ⚠️ 残り{remaining}回です。アップグレードで無制限に！
                </p>
              )}
              {remaining === 0 && (
                <p className="text-xs text-red-400 mt-2">
                  ⚠️ 今月の無料回数を使い切りました。
                  <button
                    onClick={() => handleStripeCheckout('basic')}
                    disabled={isCheckoutLoading}
                    className="underline ml-1"
                  >
                    アップグレード
                  </button>
                </p>
              )}
            </div>

            {/* 入力フォーム */}
            <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
              <label className="block text-lg font-semibold mb-3">
                📋 商談メモを貼り付けてください
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-48 p-4 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                placeholder={`商談メモをここに貼り付けてください...

例：
・〇〇株式会社 山田部長と打ち合わせ
・弊社の新サービスについて説明
・来週中に検討して連絡いただける予定
・次回は具体的な見積もりを持参`}
              />

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">フォーマット</label>
                  <select
                    value={format}
                    onChange={(e) => {
                      const newFormat = e.target.value as FormatType;
                      setFormat(newFormat);
                      if (newFormat === 'custom') {
                        setShowCustomEditor(true);
                      }
                    }}
                    className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.entries(FORMATS).map(([key, config]) => (
                      <option 
                        key={key} 
                        value={key}
                        disabled={!isFormatAvailable(key as FormatType)}
                        className={!isFormatAvailable(key as FormatType) ? 'text-slate-500' : ''}
                      >
                        {!isFormatAvailable(key as FormatType) ? '🔒 ' : ''}
                        {config.name}
                        {!isFormatAvailable(key as FormatType) ? ` - ${config.plan === 'basic' ? 'Basic' : 'Pro'}プラン` : ''}
                      </option>
                    ))}
                  </select>
                  
                  {userPlan === 'free' && (
                    <p className="text-xs text-amber-400 mt-1">
                      🔓 Basicプランで5種類、Proプランでカスタム作成が使えます
                    </p>
                  )}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || (userPlan === 'free' && remaining === 0)}
                  className="sm:self-end px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold rounded-lg transition-colors btn-ripple glow-amber"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      生成中...
                    </span>
                  ) : '🚀 日報を生成'}
                </button>
              </div>

              {/* カスタムフォーマットエディター（Proプラン用） */}
              {format === 'custom' && showCustomEditor && (
                <div className="mt-4 p-4 bg-slate-900 border border-purple-500/50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-purple-400">✨ カスタムフォーマット</h4>
                    <button 
                      onClick={() => setShowCustomEditor(false)}
                      className="text-slate-400 hover:text-white text-sm"
                    >
                      閉じる
                    </button>
                  </div>
                  
                  {userPlan !== 'pro' ? (
                    <div className="text-center py-6">
                      <p className="text-slate-400 mb-4">
                        カスタムフォーマットは<strong className="text-purple-400">Proプラン限定</strong>機能です。
                        <br />
                        自社のフォーマットに合わせた日報を自動生成できます。
                      </p>
                      <button
                        onClick={() => handleStripeCheckout('pro')}
                        disabled={isCheckoutLoading}
                        className="inline-block px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                      >
                        {isCheckoutLoading ? '処理中...' : 'Proプランにアップグレード'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="w-full h-32 p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                        placeholder={`自社のフォーマットを入力してください...

例：
■ 日付:
■ 顧客名:
■ 商談内容:
■ 次回アクション:
■ 備考:`}
                      />
                      
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={handleSaveCustomFormat}
                          className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors"
                        >
                          💾 保存
                        </button>
                        <button
                          onClick={() => setCustomPrompt('')}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                        >
                          🗑 クリア
                        </button>
                      </div>
                      
                      {/* 保存したカスタムフォーマット一覧 */}
                      {savedCustomFormats.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <h5 className="text-sm text-slate-400 mb-2">保存済みフォーマット:</h5>
                          <div className="flex flex-wrap gap-2">
                            {savedCustomFormats.map((fmt, i) => (
                              <div key={i} className="flex items-center gap-1 bg-slate-800 rounded px-2 py-1">
                                <button
                                  onClick={() => handleLoadCustomFormat(fmt.prompt)}
                                  className="text-sm text-purple-400 hover:text-purple-300"
                                >
                                  {fmt.name}
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomFormat(i)}
                                  className="text-slate-500 hover:text-red-400 text-xs ml-1"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
                  {error}
                </div>
              )}
            </div>

            {/* 生成結果 */}
            {report && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-scaleIn">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">📄 生成された日報</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                    >
                      📋 コピー
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={userPlan === 'free' && remaining === 0}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-sm transition-colors"
                    >
                      🔄 再生成
                    </button>
                  </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg whitespace-pre-wrap text-slate-200 leading-relaxed">
                  {report}
                </div>
              </div>
            )}
          </>
        )}

        {/* 松竹梅プラン */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-2 text-center">💰 料金プラン</h3>
          <p className="text-slate-400 text-sm text-center mb-2">すべてのプランで7日間無料トライアル</p>
          
          {/* 30日保証バッジ */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
              <span className="text-2xl">🛡️</span>
              <div className="text-left">
                <div className="text-green-400 font-bold text-sm">30日間満足保証</div>
                <div className="text-xs text-slate-400">成果が出なければ全額返金</div>
              </div>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Free（梅） */}
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-600 card-hover">
              <div className="text-lg font-semibold mb-2">Free</div>
              <div className="text-2xl font-bold mb-1">¥0</div>
              <div className="text-sm text-slate-500 mb-4">ずっと無料</div>
              <ul className="text-sm text-slate-400 space-y-2 mb-4">
                <li>✓ 月3回まで</li>
                <li>✓ シンプル形式のみ</li>
                <li className="text-slate-500">✗ 営業コーチングなし</li>
                <li className="text-slate-500">✗ カスタムフォーマットなし</li>
              </ul>
              {isRegistered && userPlan === 'free' && (
                <div className="text-xs text-green-400 text-center">✓ 現在ご利用中</div>
              )}
            </div>

            {/* Basic（竹）*/}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg p-4 border border-amber-500/50 hover-lift">
              <div className="text-lg font-semibold mb-2 text-amber-400">Basic</div>
              <div className="text-2xl font-bold mb-1">¥980<span className="text-sm font-normal text-slate-400">/月</span></div>
              <div className="text-xs text-slate-400 mb-1">または ¥9,800/年（2ヶ月無料）</div>
              <div className="text-sm text-green-400 mb-4">7日間無料</div>
              <ul className="text-sm text-slate-300 space-y-2 mb-4">
                <li>✓ <strong>無制限</strong>の日報生成</li>
                <li>✓ <strong>5種類</strong>のフォーマット</li>
                <li>✓ 営業コーチング<strong>月1回</strong></li>
                <li>✓ 履歴保存・検索</li>
                <li className="text-slate-500">✗ カスタムフォーマットなし</li>
              </ul>
              <button
                onClick={() => handleStripeCheckout('basic')}
                disabled={isCheckoutLoading}
                className="block w-full text-center py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 text-slate-900 font-bold rounded transition-colors text-sm"
              >
                {isCheckoutLoading ? '処理中...' : '7日間無料で試す'}
              </button>
            </div>

            {/* Pro（松）*/}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border-2 border-purple-500 relative hover-lift glow-purple">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                おすすめ
              </div>
              <div className="text-lg font-semibold mb-2 text-purple-400">Pro</div>
              <div className="text-2xl font-bold mb-1">¥9,800<span className="text-sm font-normal text-slate-400">/月</span></div>
              <div className="text-xs text-slate-400 mb-1">または ¥98,000/年（2ヶ月無料）</div>
              <div className="text-sm text-green-400 mb-4">7日間無料</div>
              <ul className="text-sm text-slate-300 space-y-2 mb-4">
                <li>✓ <strong>無制限</strong>の日報生成</li>
                <li>✓ <strong>5種類</strong>のフォーマット</li>
                <li>✓ <strong className="text-purple-400">カスタムフォーマット作成</strong></li>
                <li>✓ 営業コーチング<strong className="text-purple-400">無制限</strong></li>
                <li>✓ <strong>週次レポート自動生成</strong></li>
                <li>✓ <strong>優先サポート</strong></li>
              </ul>
              <button
                onClick={() => handleStripeCheckout('pro')}
                disabled={isCheckoutLoading}
                className="block w-full text-center py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded transition-colors text-sm"
              >
                {isCheckoutLoading ? '処理中...' : '7日間無料で試す'}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            いつでもキャンセルOK・30日間満足保証
          </p>
          
          {/* Enterpriseプラン */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xl">🏢</span>
                  <span className="font-bold text-lg">Enterprise</span>
                  <span className="text-xs bg-slate-600 px-2 py-0.5 rounded">チーム向け</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  5名以上のチームで利用可能。管理者ダッシュボード、チーム分析レポート付き。
                </p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">¥29,800<span className="text-sm font-normal text-slate-400">/月〜</span></div>
                <button
                  onClick={() => window.open('mailto:support@salesreport.ai?subject=Enterprise%E3%83%97%E3%83%A9%E3%83%B3%E3%81%AE%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B', '_blank')}
                  className="mt-2 px-4 py-2 border border-slate-500 hover:bg-slate-700 rounded text-sm transition-colors"
                >
                  お問い合わせ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 営業コーチングへの誘導 */}
        <div className="mt-8 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold mb-2">
            💡 日報を書くだけで営業成績は上がりますか？
          </h3>
          <p className="text-slate-300 mb-4">
            <strong>営業コーチングAI</strong>なら、商談を分析して具体的な改善点を指摘。
            <br />
            プロのセールス理論であなたの営業を改善します。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/coaching"
              className="inline-block px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              まずは無料で試す
            </Link>
            <button
              onClick={() => handleStripeCheckout('pro')}
              disabled={isCheckoutLoading}
              className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 text-slate-900 font-bold rounded-lg transition-colors"
            >
              {isCheckoutLoading ? '処理中...' : '🎯 7日間無料トライアル'}
            </button>
          </div>
        </div>

        {/* 紹介制度（強化版） */}
        <div className="mt-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
          <div className="text-center mb-6">
            <span className="text-4xl">🎁</span>
            <h3 className="text-2xl font-bold mt-2 mb-1">
              友達紹介プログラム
            </h3>
            <p className="text-slate-400 text-sm">
              紹介すればするほどお得に！
            </p>
          </div>
          
          {/* 特典一覧 */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
              <div className="text-3xl mb-2">1️⃣</div>
              <div className="font-bold text-amber-400">1人紹介</div>
              <div className="text-sm text-slate-300">有料転換で</div>
              <div className="text-green-400 font-bold">500円クレジット</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
              <div className="text-3xl mb-2">3️⃣</div>
              <div className="font-bold text-amber-400">3人紹介</div>
              <div className="text-sm text-slate-300">累計で</div>
              <div className="text-green-400 font-bold">2,000円クレジット</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
              <div className="text-3xl mb-2">🔟</div>
              <div className="font-bold text-amber-400">10人紹介</div>
              <div className="text-sm text-slate-300">累計で</div>
              <div className="text-purple-400 font-bold">6ヶ月無料相当</div>
            </div>
          </div>
          
          {/* 紹介コード */}
          <div className="bg-slate-900 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="text-xs text-slate-500 mb-1">あなたの紹介コード</div>
              <div className="text-xl font-mono font-bold text-amber-400">
                {isRegistered ? (userReferralCode || email.split('@')[0].toUpperCase()) : 'XXXXX'}
              </div>
                {isRegistered && (
                <div className="text-xs text-slate-500 mt-1">
                  紹介実績: <span className="text-green-400">{referralCount}人</span>
                  {' '}|{' '}
                  <Link href="/referral" className="text-blue-400 hover:underline">
                    詳細を見る →
                  </Link>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={async () => {
                  if (isRegistered) {
                    const code = userReferralCode || email.split('@')[0].toUpperCase();
                    const link = `https://salesreport-ai.vercel.app?ref=${code}`;
                    try {
                      await navigator.clipboard.writeText(link);
                      setShowReferralSuccess(true);
                    } catch (err) {
                      // フォールバック: テキストエリアを使用
                      const textArea = document.createElement('textarea');
                      textArea.value = link;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      setShowReferralSuccess(true);
                    }
                  }
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-sm font-bold rounded transition-colors"
              >
                📋 リンクをコピー
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`営業日報を30秒で自動生成できるAIツール見つけた！このリンクから登録すると特典がもらえるよ👇 https://salesreport-ai.vercel.app?ref=${isRegistered ? (userReferralCode || email.split('@')[0].toUpperCase()) : ''}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm rounded transition-colors"
              >
                𝕏 シェア
              </a>
            </div>
          </div>
        </div>

        {/* 使い方ガイド（オンボーディング） */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-center">
            🚀 3ステップで完了
          </h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h4 className="font-semibold mb-1">商談メモを貼る</h4>
              <p className="text-sm text-slate-400">
                手書きメモでもOK。<br />
                箇条書きでも文章でも。
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h4 className="font-semibold mb-1">ボタンを押す</h4>
              <p className="text-sm text-slate-400">
                AIが自動で日報に変換。<br />
                30秒で完成。
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h4 className="font-semibold mb-1">コピペで提出</h4>
              <p className="text-sm text-slate-400">
                社内システムに貼り付け。<br />
                これで終わり。
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* アップセルモーダル */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-slate-600 relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            
            <h3 className="text-2xl font-bold mb-4 text-center">
              ⚠️ 残り{remaining}回です
            </h3>
            
            <p className="text-slate-300 mb-6 text-center">
              無料プランの回数がもうすぐ終わります。
              <br />
              <strong className="text-amber-400">アップグレード</strong>で無制限に使えます！
            </p>

            <div className="bg-slate-900 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-2">Basic プラン：</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  無制限の日報生成
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  5種類のフォーマット
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  いつでもキャンセルOK
                </li>
              </ul>
            </div>

            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-amber-400">7日間無料</div>
              <div className="text-sm text-slate-400">その後 ¥980/月</div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleStripeCheckout('basic')}
                disabled={isCheckoutLoading}
                className="block text-center px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 text-slate-900 font-bold rounded-lg transition-colors"
              >
                {isCheckoutLoading ? '処理中...' : '🚀 7日間無料で試す'}
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                後で検討する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ストリークお祝いモーダル（Duolingo式） */}
      {showStreakModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-orange-900/90 to-slate-900 rounded-xl p-8 max-w-md w-full border border-orange-500 relative animate-scaleIn">
            <button
              onClick={() => setShowStreakModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            
            <div className="text-center">
              <div className="text-8xl mb-4 animate-bounce">🔥</div>
              <h3 className="text-3xl font-bold mb-2 text-orange-400">
                {streak}日連続！
              </h3>
              <p className="text-slate-300 mb-6">
                すごい！ストリーク継続中！
                <br />
                この調子で続けよう！
              </p>
              
              {/* 次の目標 */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <div className="text-sm text-slate-400 mb-2">次の目標まで</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <span className="text-lg font-bold">
                    {streak < 7 ? `${7 - streak}日で1週間達成！` : 
                     streak < 30 ? `${30 - streak}日で30日達成！` : 
                     '最高記録更新中！'}
                  </span>
                </div>
              </div>
              
              {/* スコア表示 */}
              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">+{streak * 5}</div>
                  <div className="text-xs text-slate-500">ストリークボーナス</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{salesScore}</div>
                  <div className="text-xs text-slate-500">総合スコア</div>
                </div>
              </div>
              
              <button
                onClick={() => setShowStreakModal(false)}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
              >
                続ける 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 制限到達モーダル */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-slate-600 relative">
            <button
              onClick={() => setShowLimitModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            
            <h3 className="text-2xl font-bold mb-4 text-center">
              🚫 今月の無料回数を使い切りました
            </h3>
            
            <p className="text-slate-300 mb-6 text-center">
              無料プランは月3回までです。
              <br />
              来月まで待つか、今すぐアップグレードしてください。
            </p>

            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-amber-400">7日間無料</div>
              <div className="text-sm text-slate-400">その後 ¥980/月</div>
              <div className="text-xs text-green-400 mt-1">30日間満足保証・いつでもキャンセルOK</div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleStripeCheckout('basic')}
                disabled={isCheckoutLoading}
                className="block text-center px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 text-slate-900 font-bold rounded-lg transition-colors"
              >
                {isCheckoutLoading ? '処理中...' : '🚀 アップグレードする'}
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                来月まで待つ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 購入直後のアップセルモーダル（Basic→Pro） */}
      {showUpsellModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-slate-900 rounded-xl p-8 max-w-lg w-full border border-purple-500 relative animate-scaleIn">
            <button
              onClick={() => setShowUpsellModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            
            <div className="text-center mb-6">
              <span className="text-5xl">🎉</span>
              <h3 className="text-2xl font-bold mt-4 mb-2">
                Basicプランへようこそ！
              </h3>
              <p className="text-slate-300">
                さらに<strong className="text-purple-400">営業成績を上げたい</strong>なら...
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-purple-400 text-xl">👑</span>
                <span className="font-bold text-lg">Proプラン特別オファー</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  営業コーチング<strong className="text-purple-400">無制限</strong>（通常月1回）
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <strong className="text-purple-400">週次レポート自動生成</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  カスタムフォーマット作成
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  優先サポート
                </li>
              </ul>
            </div>

            <div className="text-center mb-4">
              <div className="text-slate-400 line-through text-sm">通常 ¥9,800/月</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-bold text-purple-400">初月50%オフ</span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">限定</span>
              </div>
              <div className="text-xl font-bold text-white">¥4,900で今すぐ始める</div>
              <div className="text-xs text-green-400 mt-1">30日間満足保証付き</div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleStripeCheckout('pro')}
                disabled={isCheckoutLoading}
                className="block text-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-lg transition-colors glow-purple"
              >
                {isCheckoutLoading ? '処理中...' : '🚀 Proプランにアップグレード'}
              </button>
              <button
                onClick={() => setShowUpsellModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Basicプランで続ける
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-4">
              ※このオファーは購入後24時間限定です
            </p>
          </div>
        </div>
      )}

      {/* 紹介成功モーダル */}
      {showReferralSuccess && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-green-500 relative animate-scaleIn">
            <button
              onClick={() => setShowReferralSuccess(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            
            <div className="text-center">
              <span className="text-6xl">🎉</span>
              <h3 className="text-2xl font-bold mt-4 mb-2 text-green-400">
                紹介コードが適用されました！
              </h3>
              <p className="text-slate-300 mb-6">
                紹介経由で登録しました。紹介者にも特典が付与されます！
              </p>
              
              <div className="bg-slate-900 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-400 mb-2">あなたの紹介コード：</p>
                <p className="text-xl font-mono text-green-400">
                  {userReferralCode}
                </p>
              </div>
              
              <p className="text-sm text-slate-400 mb-4">
                あなたも友達を紹介すると、<span className="text-green-400">500円分のクレジット</span>がもらえます！
              </p>
              
              <div className="flex gap-2 justify-center">
                <button
                  onClick={async () => {
                    const shareText = `営業日報を30秒で自動生成できるAIツール見つけた！このリンクから登録すると特典がもらえるよ👇 https://salesreport-ai.vercel.app?ref=${userReferralCode}`;
                    try {
                      await navigator.clipboard.writeText(shareText);
                      alert('シェア文をコピーしました！');
                    } catch (err) {
                      const textArea = document.createElement('textarea');
                      textArea.value = shareText;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      alert('シェア文をコピーしました！');
                    }
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                >
                  📋 シェア文をコピー
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`営業日報を30秒で自動生成できるAIツール見つけた！このリンクから登録すると特典がもらえるよ👇 https://salesreport-ai.vercel.app?ref=${userReferralCode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm"
                >
                  𝕏 でシェア
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* リードマグネットバナー */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold flex items-center gap-2 justify-center sm:justify-start">
                <span>📄</span>
                無料：営業日報テンプレート集
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                プロの営業マンが使う5種類の日報フォーマットを無料プレゼント
              </p>
            </div>
            <Link
              href="/templates"
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors whitespace-nowrap"
            >
              無料でもらう →
            </Link>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="border-t border-slate-700 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
            <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
              利用規約
            </Link>
            <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/legal" className="text-slate-400 hover:text-white transition-colors">
              特定商取引法に基づく表記
            </Link>
          </div>
          <div className="text-center text-slate-500 text-sm">
            © 2025 SalesReport AI by LaunchX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

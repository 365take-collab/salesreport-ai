'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface ReferralData {
  referralCode: string;
  referralLink: string;
  referrals: Array<{
    email: string;
    status: string;
    createdAt: string;
    reward: number;
  }>;
  totalCount: number;
  totalEarnings: number;
}

export default function ReferralPage() {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('salesreport_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setIsLoggedIn(true);
      fetchReferralData(savedEmail);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const fetchReferralData = async (userEmail: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/referral?email=${encodeURIComponent(userEmail)}&action=history`);
      const data = await response.json();
      if (data.success) {
        setReferralData(data);
      }
    } catch (err) {
      console.error('Failed to fetch referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('salesreport_email', email);
        setIsLoggedIn(true);
        fetchReferralData(email);
      } else {
        setError(data.error || 'ログインに失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current);
      }
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareOnTwitter = () => {
    const text = `営業日報AIで営業成績を可視化！\n\n紹介コードを使って登録すると特典がもらえます\n\n${referralData?.referralLink}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnLine = () => {
    const text = `営業日報AIで営業成績を可視化！紹介コードを使って登録すると特典がもらえます ${referralData?.referralLink}`;
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, '_blank');
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
        <div className="max-w-md mx-auto pt-20">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
            ← ホームに戻る
          </Link>
          
          <h1 className="text-2xl font-bold mb-6">紹介プログラム</h1>
          <p className="text-gray-300 mb-6">
            紹介ダッシュボードを見るには、メールアドレスでログインしてください。
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? '読み込み中...' : 'ログイン'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Link href="/" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← ホームに戻る
        </Link>

        <h1 className="text-3xl font-bold mb-2">紹介プログラム</h1>
        <p className="text-gray-400 mb-8">
          友達を紹介して、報酬をゲットしよう！
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : referralData ? (
          <>
            {/* 紹介コード */}
            <div className="bg-slate-800 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">あなたの紹介コード</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-slate-700 rounded-lg px-4 py-3 font-mono text-xl text-center">
                  {referralData.referralCode}
                </div>
                <button
                  onClick={() => copyToClipboard(referralData.referralCode)}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  {copied ? '✓ コピー済み' : 'コピー'}
                </button>
              </div>
              
              <h3 className="text-sm text-gray-400 mb-2">紹介リンク</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-slate-700 rounded-lg px-4 py-2 text-sm text-gray-300 overflow-x-auto">
                  {referralData.referralLink}
                </div>
                <button
                  onClick={() => copyToClipboard(referralData.referralLink)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm transition-colors"
                >
                  コピー
                </button>
              </div>

              {/* シェアボタン */}
              <div className="flex gap-3">
                <button
                  onClick={shareOnTwitter}
                  className="flex-1 py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] rounded-lg font-medium transition-colors"
                >
                  Xでシェア
                </button>
                <button
                  onClick={shareOnLine}
                  className="flex-1 py-2 bg-[#00B900] hover:bg-[#00a000] rounded-lg font-medium transition-colors"
                >
                  LINEでシェア
                </button>
              </div>
            </div>

            {/* 統計 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-400">{referralData.totalCount}</div>
                <div className="text-gray-400 text-sm mt-1">紹介人数</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-400">¥{referralData.totalEarnings.toLocaleString()}</div>
                <div className="text-gray-400 text-sm mt-1">獲得報酬</div>
              </div>
            </div>

            {/* 報酬ルール */}
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 mb-6 border border-blue-500/30">
              <h2 className="text-lg font-semibold mb-3">報酬ルール</h2>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  紹介1人が有料転換 → <span className="text-green-400 font-medium">500円クレジット</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  3人紹介達成 → <span className="text-green-400 font-medium">累計2,000円クレジット</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">✓</span>
                  10人紹介達成 → <span className="text-purple-400 font-medium">6ヶ月無料相当（5,880円）</span>
                </li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">※クレジットは次回請求から自動で割引されます</p>
            </div>

            {/* 紹介履歴 */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">紹介履歴</h2>
              {referralData.referrals.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  まだ紹介がありません。<br />
                  紹介リンクをシェアして友達を招待しましょう！
                </p>
              ) : (
                <div className="space-y-3">
                  {referralData.referrals.map((referral, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-4 py-3">
                      <div>
                        <div className="font-medium">{referral.email}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(referral.createdAt).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          referral.status === 'converted' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {referral.status === 'converted' ? '有料転換' : '登録済み'}
                        </div>
                        {referral.reward > 0 && (
                          <div className="text-green-400 text-sm">+¥{referral.reward}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ジェイ式：購入直後の紹介依頼フォーム */}
            <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 rounded-xl p-6 mt-6 border border-orange-500/30">
              <h2 className="text-lg font-semibold mb-3">
                今すぐ紹介して報酬をゲット！
              </h2>
              <p className="text-gray-300 text-sm mb-4">
                営業日報AIが役立ちそうな同僚や知人を紹介してください。
                紹介リンクを送るだけで、有料転換時に500円がもらえます。
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="紹介したい人のメールアドレス（任意）"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-orange-500 focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(referralData.referralLink)}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 rounded-lg font-medium transition-colors"
                >
                  紹介リンクをコピーして送る
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-400">データを読み込めませんでした。</p>
        )}
      </div>
    </main>
  );
}

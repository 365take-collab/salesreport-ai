'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  freeUsers: number;
  basicUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  totalLTV: number;
  averageLTV: number;
  mrr: number;
  arr: number;
  churnRate: number;
  referralCount: number;
}

interface User {
  id: string;
  email: string;
  plan: string;
  usage_count: number;
  created_at: string;
  subscribed_at: string | null;
  status: string;
  ltv: number;
  referral_count: number;
}

interface Cohort {
  [month: string]: {
    acquired: number;
    retained: number;
    converted: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [cohorts, setCohorts] = useState<Cohort>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'cohort'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, usersRes, cohortRes] = await Promise.all([
          fetch('/api/analytics?type=overview'),
          fetch('/api/analytics?type=users'),
          fetch('/api/analytics?type=cohort'),
        ]);

        const statsData = await statsRes.json();
        const usersData = await usersRes.json();
        const cohortData = await cohortRes.json();

        setStats(statsData);
        setUsers(usersData);
        setCohorts(cohortData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* ヘッダー */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-amber-400">
              SalesReport AI
            </Link>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">管理ダッシュボード</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* タブ */}
        <div className="flex gap-2 mb-8">
          {(['overview', 'users', 'cohort'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'overview' && '📊 概要'}
              {tab === 'users' && '👥 ユーザー'}
              {tab === 'cohort' && '📈 コホート'}
            </button>
          ))}
        </div>

        {/* 概要タブ */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* KPIカード */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">総ユーザー数</div>
                <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-2">
                  Free: {stats.freeUsers} / Basic: {stats.basicUsers} / Pro: {stats.proUsers}
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">MRR（月次売上）</div>
                <div className="text-3xl font-bold text-green-400">{formatCurrency(stats.mrr)}</div>
                <div className="text-xs text-slate-500 mt-2">
                  ARR: {formatCurrency(stats.arr)}
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">平均LTV</div>
                <div className="text-3xl font-bold text-purple-400">{formatCurrency(stats.averageLTV)}</div>
                <div className="text-xs text-slate-500 mt-2">
                  総LTV: {formatCurrency(stats.totalLTV)}
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">解約率</div>
                <div className={`text-3xl font-bold ${stats.churnRate > 5 ? 'text-red-400' : 'text-green-400'}`}>
                  {stats.churnRate.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  紹介数: {stats.referralCount}
                </div>
              </div>
            </div>

            {/* プラン分布 */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-4">📊 プラン分布</h3>
              <div className="flex h-8 rounded-full overflow-hidden">
                <div
                  className="bg-slate-600"
                  style={{ width: `${(stats.freeUsers / stats.totalUsers) * 100}%` }}
                  title={`Free: ${stats.freeUsers}`}
                />
                <div
                  className="bg-amber-500"
                  style={{ width: `${(stats.basicUsers / stats.totalUsers) * 100}%` }}
                  title={`Basic: ${stats.basicUsers}`}
                />
                <div
                  className="bg-purple-500"
                  style={{ width: `${(stats.proUsers / stats.totalUsers) * 100}%` }}
                  title={`Pro: ${stats.proUsers}`}
                />
                <div
                  className="bg-green-500"
                  style={{ width: `${(stats.enterpriseUsers / stats.totalUsers) * 100}%` }}
                  title={`Enterprise: ${stats.enterpriseUsers}`}
                />
              </div>
              <div className="flex gap-4 mt-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-600"></span>
                  Free ({stats.freeUsers})
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  Basic ({stats.basicUsers})
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  Pro ({stats.proUsers})
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Enterprise ({stats.enterpriseUsers})
                </span>
              </div>
            </div>

            {/* ジェイ・エイブラハム式成長指標 */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">🎯 ジェイ・エイブラハム式成長指標</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-slate-400">① 顧客数</div>
                  <div className="text-2xl font-bold mt-1">{stats.totalUsers}</div>
                  <div className="text-xs text-green-400 mt-1">目標: 1,000人</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-slate-400">② 平均単価</div>
                  <div className="text-2xl font-bold mt-1">
                    {formatCurrency(stats.totalUsers > 0 ? stats.mrr / (stats.basicUsers + stats.proUsers + stats.enterpriseUsers || 1) : 0)}
                  </div>
                  <div className="text-xs text-amber-400 mt-1">アップセルで向上</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-slate-400">③ 購買頻度</div>
                  <div className="text-2xl font-bold mt-1">月額制</div>
                  <div className="text-xs text-purple-400 mt-1">年額で12ヶ月確定</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ユーザータブ */}
        {activeTab === 'users' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">メール</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">プラン</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">利用回数</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">LTV</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">紹介数</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">ステータス</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">登録日</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/50">
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.plan === 'free' ? 'bg-slate-600' :
                          user.plan === 'basic' ? 'bg-amber-500/20 text-amber-400' :
                          user.plan === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{user.usage_count}</td>
                      <td className="px-4 py-3 text-sm text-green-400">{formatCurrency(user.ltv)}</td>
                      <td className="px-4 py-3 text-sm">{user.referral_count || 0}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          user.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-600'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {new Date(user.created_at).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* コホートタブ */}
        {activeTab === 'cohort' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-bold mb-4">📈 月別コホート分析</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold">月</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">獲得</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">継続</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">有料転換</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">継続率</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">転換率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {Object.entries(cohorts)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([month, data]) => (
                      <tr key={month} className="hover:bg-slate-700/50">
                        <td className="px-4 py-3 text-sm font-medium">{month}</td>
                        <td className="px-4 py-3 text-sm">{data.acquired}</td>
                        <td className="px-4 py-3 text-sm text-green-400">{data.retained}</td>
                        <td className="px-4 py-3 text-sm text-amber-400">{data.converted}</td>
                        <td className="px-4 py-3 text-sm">
                          {((data.retained / data.acquired) * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {((data.converted / data.acquired) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

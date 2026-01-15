'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  input: string;
  output: string;
  format: string;
  type: 'report' | 'coaching' | 'weekly';
  created_at: string;
}

export default function HistoryPage() {
  const [email, setEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'report' | 'coaching' | 'weekly'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = useCallback(async (userEmail: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/history?email=${encodeURIComponent(userEmail)}&limit=50`);
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem('salesreport_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setIsRegistered(true);
      fetchHistory(savedEmail);
    }
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    if (!confirm('この履歴を削除しますか？')) return;

    try {
      const response = await fetch(`/api/history?id=${id}&email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setHistory(history.filter(item => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('クリップボードにコピーしました');
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'report': return '📝 日報';
      case 'coaching': return '🎯 コーチング';
      case 'weekly': return '📊 週報';
      default: return '📄 その他';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'report': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'coaching': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'weekly': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const filteredHistory = history.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.input?.toLowerCase().includes(query) ||
        item.output?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <Link href="/coaching" className="text-slate-300 hover:text-white transition-colors">
              営業コーチング
            </Link>
            <Link href="/weekly" className="text-slate-300 hover:text-white transition-colors">
              週報作成
            </Link>
            <Link href="/history" className="text-amber-400 font-semibold">
              履歴
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            📚 履歴
          </h1>
          <p className="text-slate-400">
            過去に生成した日報・コーチング・週報を確認
          </p>
        </div>

        {!isRegistered ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <h3 className="text-xl font-semibold mb-4">📧 まずはメールアドレスを登録</h3>
            <p className="text-slate-400 mb-4">
              履歴機能を使うには、まずメールアドレスを登録してください。
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors"
            >
              登録ページへ
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* 左サイドバー：履歴一覧 */}
            <div className="md:col-span-1 bg-slate-800 rounded-xl p-4 border border-slate-700 h-fit">
              {/* フィルター */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {(['all', 'report', 'coaching', 'weekly'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        filter === type
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {type === 'all' ? 'すべて' : getTypeLabel(type)}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 検索..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* 履歴リスト */}
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">
                  読み込み中...
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {history.length === 0 ? '履歴がありません' : '該当する履歴がありません'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {filteredHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedItem?.id === item.id
                          ? 'bg-amber-500/20 border border-amber-500/50'
                          : 'bg-slate-900 hover:bg-slate-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs border ${getTypeColor(item.type)}`}>
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mb-1">
                        {formatDate(item.created_at)}
                      </div>
                      <div className="text-sm text-slate-300 line-clamp-2">
                        {item.output?.substring(0, 80)}...
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 右側：詳細表示 */}
            <div className="md:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
              {selectedItem ? (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm border ${getTypeColor(selectedItem.type)}`}>
                        {getTypeLabel(selectedItem.type)}
                      </span>
                      <div className="text-sm text-slate-500 mt-2">
                        {formatDate(selectedItem.created_at)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(selectedItem.output)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                      >
                        📋 コピー
                      </button>
                      <button
                        onClick={() => handleDelete(selectedItem.id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                      >
                        🗑 削除
                      </button>
                    </div>
                  </div>

                  {selectedItem.input && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">入力内容</h4>
                      <div className="bg-slate-900 p-3 rounded-lg text-sm text-slate-300 max-h-32 overflow-y-auto">
                        {selectedItem.input}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">生成結果</h4>
                    <div className="bg-slate-900 p-4 rounded-lg whitespace-pre-wrap text-slate-200 leading-relaxed max-h-[50vh] overflow-y-auto">
                      {selectedItem.output}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  左のリストから履歴を選択してください
                </div>
              )}
            </div>
          </div>
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

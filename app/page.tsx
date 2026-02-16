'use client';

import { useState } from 'react';
import { SearchResponse, Product } from '@/lib/types';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'merged' | 'mercari' | 'rakuma' | 'yahoo'>('merged');

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data: SearchResponse = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentResults = results
    ? view === 'merged'
      ? results.merged
      : results.bySite[view]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">フリマ並列検索</h1>
          <p className="text-gray-600">メルカリ・ラクマ・ヤフーフリマを一括検索</p>
        </header>

        {/* 検索ボックス */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="キーワードを入力..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !keyword.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? '検索中...' : '検索'}
            </button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* タブ */}
        {results && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setView('merged')}
                className={`flex-1 px-4 py-3 font-medium ${
                  view === 'merged'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                統合表示 ({results.merged.length})
              </button>
              <button
                onClick={() => setView('mercari')}
                className={`flex-1 px-4 py-3 font-medium ${
                  view === 'mercari'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                メルカリ ({results.bySite.mercari.length})
              </button>
              <button
                onClick={() => setView('rakuma')}
                className={`flex-1 px-4 py-3 font-medium ${
                  view === 'rakuma'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ラクマ ({results.bySite.rakuma.length})
              </button>
              <button
                onClick={() => setView('yahoo')}
                className={`flex-1 px-4 py-3 font-medium ${
                  view === 'yahoo'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ヤフーフリマ ({results.bySite.yahoo.length})
              </button>
            </div>
          </div>
        )}

        {/* 検索結果 */}
        {currentResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {currentResults.map((product) => (
              <a
                key={product.id}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {product.site}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-lg font-bold text-blue-600">
                  ¥{product.price.toLocaleString()}
                </p>
              </a>
            ))}
          </div>
        ) : results && currentResults.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            検索結果が見つかりませんでした
          </div>
        ) : null}

        {/* Amazon/楽天リンク（アソシエイト用） */}
        {results && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-sm text-gray-600 mb-4">見つかりませんでしたか？</p>
            <div className="flex gap-4">
              <a
                href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-orange-500 text-white text-center rounded-lg hover:bg-orange-600"
              >
                Amazonで新品を探す
              </a>
              <a
                href={`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-red-500 text-white text-center rounded-lg hover:bg-red-600"
              >
                楽天市場で探す
              </a>
            </div>
          </div>
        )}

        {/* 忍者AdMax枠（最下部・控えめ） */}
        {results && (
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-xs text-gray-400 mb-2">広告</p>
            {/* TODO: 忍者AdMaxタグをここに挿入 */}
            <div className="h-24 bg-gray-100 flex items-center justify-center text-gray-400">
              忍者AdMax枠
            </div>
          </div>
        )}

        {/* フッター */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>当サービスは各サイトの公式サービスではありません。利用は自己責任でお願いします。</p>
          <p className="mt-2">
            問題がある場合は速やかに
            <a href="https://github.com/GoodLight999/flea-search/issues" className="text-blue-500 hover:underline ml-1">
              GitHubで報告
            </a>
            してください。
          </p>
        </footer>
      </div>
    </div>
  );
}

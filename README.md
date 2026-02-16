# フリマ並列検索 (flea-search)

メルカリ・ラクマ・ヤフーフリマを一括で検索できるWebサービス。

## 🚀 機能

- **並列検索**: 3つのフリマサイトを同時検索
- **統合表示**: 価格順にソートして一覧表示
- **サイト別表示**: 各サイトごとの結果も確認可能
- **Rate Limit**: 1分間に3回までの制限（サーバー負荷軽減）

## ⚠️ 免責事項

このサービスは**非公式**です。各フリマサイトの公式APIではなく、スクレイピング技術を使用しています。

- **個人利用のみ推奨**
- 商用利用は自己責任でお願いします
- 各サイトの利用規約を遵守してください
- 予告なくサービスが停止する可能性があります

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React, Tailwind CSS
- **バックエンド**: Next.js API Routes, Puppeteer, @sparticuz/chromium
- **デプロイ**: Vercel
- **言語**: TypeScript

## 📦 ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

http://localhost:3000 でアクセス

## 🚀 デプロイ

Vercelでワンクリックデプロイ可能:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/GoodLight999/flea-search)

### 環境変数

現在は不要（将来的にVercel KV使用時に追加予定）

## 📝 TODO

- [ ] Vercel KVでキャッシュ実装
- [ ] 忍者AdMax統合
- [ ] Amazon/楽天アソシエイトタグ追加
- [ ] セレクタの調整（実際のサイト構造に合わせる）
- [ ] エラーハンドリング強化
- [ ] テスト追加

## 📄 ライセンス

MIT License

## 🙏 貢献

Issue・PRは歓迎します！

## 📧 連絡先

問題がある場合は [GitHub Issues](https://github.com/GoodLight999/flea-search/issues) で報告してください。

# AI-Driven Blog

AI駆動型ブログシステム - Laravel + Next.js による高機能ブログプラットフォーム

## 🚀 プロジェクト概要

このプロジェクトは、AI機能を活用したブログ管理システムです。LaravelバックエンドとNext.jsフロントエンドを組み合わせて、効率的なコンテンツ作成・管理を実現します。

## 📋 主要機能

### 基本機能
- ✅ 記事の作成・編集・削除・公開管理
- ✅ カテゴリ・タグ管理
- ✅ メディアファイルアップロード・管理
- ✅ ユーザー認証・権限管理

### AI機能
- 🤖 文章校正・推敲
- 🏷️ 自動タグ生成
- 📝 記事要約生成
- 🔍 SEO最適化支援

## 🛠️ 技術スタック

### バックエンド
- **Laravel** (PHP) - RESTful API
- **PostgreSQL** - データベース
- **Laravel Sanctum** - JWT認証

### フロントエンド
- **Next.js** - React フレームワーク
- **TypeScript** - 型安全性
- **TailwindCSS** - スタイリング
- **shadcn/ui** - UIコンポーネント

## 📁 プロジェクト構造

```
ai-driven-blog/
├── backend/          # Laravel API
├── frontend/         # Next.js アプリケーション
├── docs/            # プロジェクト文書
│   ├── blog-requirements.md
│   ├── development-issues.md
│   └── project-board-setup.md
├── .editorconfig    # エディタ設定
├── .gitignore       # Git除外設定
└── CLAUDE.md        # Claude Code 用ガイド
```

## 🎯 開発マイルストーン

1. **Milestone 1**: 環境構築・基盤整備 ✅
2. **Milestone 2**: 認証・基本機能
3. **Milestone 3**: UI/UX・コンテンツ管理
4. **Milestone 4**: 高度な機能・最適化

## 🚀 セットアップ（開発準備中）

### 前提条件
- PHP 8.1+
- Node.js 18+
- PostgreSQL 13+
- Composer
- npm/yarn

### 開発開始手順
```bash
# リポジトリクローン
git clone <repository-url>
cd ai-driven-blog

# バックエンドセットアップ（今後実装）
cd backend
composer install
php artisan serve

# フロントエンドセットアップ（今後実装）
cd ../frontend
npm install
npm run dev
```

## 📖 ドキュメント

詳細な要件定義や開発計画は `docs/` ディレクトリを参照してください。

- [要件定義書](docs/blog-requirements.md)
- [開発Issue管理](docs/development-issues.md)
- [プロジェクトボード設定](docs/project-board-setup.md)

## 🤝 貢献

このプロジェクトはGitHub Issuesで管理されています。Issue作成時は適切なラベルとマイルストーンを設定してください。

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

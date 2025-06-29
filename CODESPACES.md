# GitHub Codespaces セットアップガイド

このプロジェクトはGitHub Codespacesで完全な開発環境を提供します。

## 🚀 クイックスタート

### 1. Codespacesの起動

1. GitHubリポジトリページで `Code` → `Codespaces` → `Create codespace on main`
2. または、直接リンク: `https://github.com/yasunori/ai-driven-blog/codespaces`

### 2. 初回セットアップ（自動実行）

Codespaces起動時に以下が自動的に実行されます：

- 開発環境の構築（PHP 8.2, Node.js, PostgreSQL, Redis）
- 必要な拡張機能のインストール
- データベースの初期化
- 開発ツールのセットアップ

### 3. 開発開始

```bash
# ウェルカムガイド表示
./welcome.sh

# 開発セッション開始
./dev start

# 状態確認
./dev status
```

## 🛠️ 利用可能なサービス

### データベース
- **PostgreSQL**: `postgres:5432`
  - Database: `ai_blog_dev`, `ai_blog_test`
  - User: `ai_blog_user`
  - Password: `ai_blog_password`

### キャッシュ
- **Redis**: `redis:6379`

### メールテスト
- **MailHog**: `http://localhost:8025`
  - SMTP: `mailhog:1025`

## 🔧 開発ポート

| サービス | ポート | 説明 |
|---------|--------|------|
| Frontend (Next.js) | 3000 | フロントエンド開発サーバー |
| Backend (Laravel) | 8000 | Laravel API サーバー |
| PostgreSQL | 5432 | データベース |
| Redis | 6379 | キャッシュ/セッション |
| MailHog SMTP | 1025 | メール送信 |
| MailHog Web | 8025 | メール受信ボックス |

## 📁 プロジェクト構造

```
ai-driven-blog/
├── .devcontainer/          # Codespaces設定
│   ├── devcontainer.json   # 開発コンテナ設定
│   ├── docker-compose.yml  # サービス構成
│   ├── Dockerfile          # 開発環境イメージ
│   └── setup.sh           # 初期セットアップ
├── .codespaces/           # VS Code設定
├── frontend/              # Next.js アプリケーション
├── backend/               # Laravel API
├── scripts/               # 開発ツール
└── dev-logs/             # 開発ログ
```

## 🎯 よく使うコマンド

### 開発セッション管理
```bash
./dev start         # 開発セッション開始
./dev status        # 状態確認
./dev logs          # ログ表示
./dev debug         # デバッグ情報収集
./dev stop          # セッション終了
```

### Laravel コマンド
```bash
artisan migrate           # マイグレーション実行
artisan migrate:fresh     # データベースリセット
artisan tinker           # Tinker起動
artisan serve            # 開発サーバー起動
```

### フロントエンド
```bash
cd frontend
npm install              # 依存関係インストール
npm run dev             # 開発サーバー起動
npm run build           # ビルド
npm run test            # テスト実行
```

## 🔐 環境変数とシークレット

### Codespaces シークレットの設定

GitHubの設定で以下のシークレットを設定してください：

1. Repository Settings → Secrets and variables → Codespaces
2. 以下のシークレットを追加：

```
OPENAI_API_KEY          # OpenAI API キー（AI機能用）
ANTHROPIC_API_KEY       # Anthropic API キー（Claude用）
NEXTAUTH_SECRET         # NextAuth.js シークレット
```

### 環境ファイル

- `.env.codespaces` - Codespaces用のデフォルト設定
- `.env` - 実際の環境設定（自動生成）

## 🐛 トラブルシューティング

### サービスが起動しない

```bash
# サービス状態確認
docker ps

# ログ確認
./dev logs

# サービス再起動
docker-compose -f .devcontainer/docker-compose.yml restart
```

### データベース接続エラー

```bash
# PostgreSQL接続確認
pg_isready -h postgres -p 5432 -U postgres

# データベース再初期化
docker-compose -f .devcontainer/docker-compose.yml restart postgres
```

### ポートが使用中

Codespacesは自動的にポートを転送しますが、競合がある場合：

1. VS Code の `PORTS` タブを確認
2. 必要に応じてポート転送を手動設定

### 拡張機能が動作しない

1. VS Code コマンドパレット（`Ctrl+Shift+P`）
2. `Developer: Reload Window` を実行

## 🔄 Codespaces 管理

### プリビルドの有効化

このプロジェクトはプリビルドに対応しています：

1. Repository Settings → Codespaces
2. Set up prebuild を選択
3. Configuration: `.devcontainer/devcontainer.json`
4. Regions を選択して Enable

### Codespacesの削除

不要になったCodespacesは削除してください：

1. https://github.com/codespaces
2. 対象のCodespaceを選択
3. Delete を実行

## 📊 リソース使用量

### 推奨スペック
- **最小**: 2-core, 4GB RAM
- **推奨**: 4-core, 8GB RAM
- **最適**: 8-core, 16GB RAM

### 使用量の確認
```bash
# リソース使用状況
./dev status

# 詳細なシステム情報
./debug
```

## 🤝 チーム開発

### 共有Codespaces

1. Codespaceを起動
2. `Share` ボタンをクリック
3. チームメンバーに共有リンクを送信

### 設定の同期

VS Code設定は自動的に同期されます：
- `.codespaces/settings.json` - プロジェクト固有設定
- 個人設定は GitHub アカウントと同期

## 📚 追加リソース

- [GitHub Codespaces Documentation](https://docs.github.com/en/codespaces)
- [VS Code Remote Development](https://code.visualstudio.com/docs/remote/remote-overview)
- [Laravel Documentation](https://laravel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 💡 Tips

### パフォーマンス最適化
- 不要なファイルは `.gitignore` に追加
- `node_modules` や `vendor` は Volume マウント使用
- 定期的に不要なCodespacesを削除

### デバッグ
- VS Code デバッガーはXdebug（PHP）とNode.js デバッガーに対応
- ブレークポイント設定で対話的デバッグ可能

### 便利なショートカット
- `Ctrl+Shift+P`: コマンドパレット
- `Ctrl+J`: ターミナル表示/非表示
- `F1`: コマンドパレット（代替）
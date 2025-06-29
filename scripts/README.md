# AI駆動開発ログ管理システム

Claudeが実行するコマンドやデバッグ情報を自動記録し、効率的な開発をサポートするツール群です。

## 🚀 クイックスタート

```bash
# 開発セッション開始
./scripts/dev-session.sh start

# 状態確認
./scripts/dev-session.sh status

# ログ確認
./scripts/dev-session.sh logs

# デバッグ情報収集
./scripts/dev-session.sh debug

# セッション終了
./scripts/dev-session.sh stop
```

## 📁 ツール構成

### 1. `dev-session.sh` - メイン制御ツール
AI駆動開発セッションの統合管理

**機能:**
- 自動プロジェクト種別検出 (Laravel/Next.js/フルスタック)
- 開発サーバー自動起動・停止
- リアルタイム状態監視
- 統合ログ管理

**使用例:**
```bash
./scripts/dev-session.sh start          # セッション開始
./scripts/dev-session.sh status         # 状態確認
./scripts/dev-session.sh logs frontend  # フロントエンドログ表示
./scripts/dev-session.sh logs backend   # バックエンドログ表示
./scripts/dev-session.sh stop           # セッション終了
```

### 2. `dev-logger.sh` - コマンド実行記録
開発中のコマンド実行履歴を自動記録

**機能:**
- コマンド実行ログ
- エラー記録
- セッション管理
- デバッグ情報収集

**使用例:**
```bash
./scripts/dev-logger.sh start                    # ログ開始
./scripts/dev-logger.sh run "npm install"        # コマンド実行とログ
./scripts/dev-logger.sh error "Error message"    # エラー記録
./scripts/dev-logger.sh show                     # ログ表示
```

### 3. `debug-collector.sh` - デバッグ情報収集
問題調査に必要な情報を一括収集

**機能:**
- システム情報収集
- Git状態確認
- プロジェクト構造分析
- 設定ファイル内容記録
- 実行プロセス監視

**使用例:**
```bash
./scripts/debug-collector.sh    # フルデバッグレポート生成
```

### 4. `claude-wrapper.sh` - Claude実行履歴記録
Claudeが実行するコマンドの自動記録ラッパー

**機能:**
- 主要コマンドの自動ログ記録
- エラーハンドリング
- 実行履歴蓄積

## 📊 ログファイル構造

```
dev-logs/
├── current-session.log      # 現在のセッションログ
├── commands.log            # コマンド実行履歴
├── errors.log              # エラーログ
├── debug.log               # デバッグ情報
├── frontend.log            # フロントエンド開発サーバーログ
├── backend.log             # バックエンド開発サーバーログ
├── session_YYYYMMDD_HHMMSS.log  # アーカイブされたセッション
└── debug-report-YYYYMMDD_HHMMSS.md  # デバッグレポート
```

## 🔧 自動検出される構成

### フルスタック構成 (Laravel + Next.js)
```
project/
├── frontend/          # Next.js アプリケーション
├── backend/           # Laravel API
├── docker-compose.yml # Docker構成
└── scripts/           # 管理ツール
```

### フロントエンドのみ (Next.js)
- `package.json` 存在
- `src/` または `app/` ディレクトリ

### バックエンドのみ (Laravel)
- `composer.json` 存在
- `artisan` ファイル存在
- `app/`, `routes/` ディレクトリ

## 🎯 主な使用場面

### 1. 開発セッション開始時
```bash
./scripts/dev-session.sh start
```
- プロジェクト構成の自動検出
- 必要な開発サーバーの起動
- ログシステムの初期化

### 2. 問題発生時のデバッグ
```bash
./scripts/dev-session.sh debug
```
- 包括的なシステム情報収集
- Git状態とコミット履歴
- 実行中プロセスとリソース使用量

### 3. 開発進捗の確認
```bash
./scripts/dev-session.sh status
./scripts/dev-session.sh logs
```
- サーバー稼働状態
- 最新のログ出力
- リソース使用状況

### 4. Claude実行履歴の確認
```bash
cat .claude-history
cat dev-logs/commands.log
```

## 🛠️ カスタマイズ設定

### ポート設定
セッション設定ファイル (`.dev-session`) で変更可能:
```bash
FRONTEND_PORT=3000
BACKEND_PORT=8000
```

### 自動保存間隔
```bash
AUTO_SAVE_INTERVAL=300  # 5分間隔
```

## 📋 トラブルシューティング

### 問題: サーバーが起動しない
1. 依存関係確認: `./scripts/dev-session.sh status`
2. ポート競合確認: `netstat -tlnp | grep :3000`
3. ログ確認: `./scripts/dev-session.sh logs`

### 問題: ログが記録されない
1. 権限確認: `ls -la scripts/`
2. ディレクトリ確認: `ls -la dev-logs/`
3. 実行権限付与: `chmod +x scripts/*.sh`

### 問題: デバッグ情報が不完全
1. 必要コマンドインストール確認
2. Git設定確認
3. フルデバッグ実行: `./scripts/debug-collector.sh`

## 🔄 ベストプラクティス

### 開発セッション管理
1. 作業開始時に必ず `dev-session.sh start`
2. 定期的な状態確認 `dev-session.sh status`
3. 問題発生時は即座に `dev-session.sh debug`
4. 作業終了時に `dev-session.sh stop`

### ログ活用
- エラー発生時は必ずログを確認
- 定期的なログアーカイブ
- 重要な実行コマンドは手動で記録

### デバッグ効率化
- 問題再現前にデバッグ情報収集
- システム状態のスナップショット取得
- チーム間でのデバッグレポート共有

## 📚 関連ファイル

- `CLAUDE.md` - プロジェクト構成とClaude向け指示
- `.claude-history` - Claude実行履歴
- `.dev-session` - セッション設定（自動生成）

## 🤝 貢献

ツールの改善提案や不具合報告は、GitHubのIssueでお願いします。

## 📄 ライセンス

このプロジェクトに準拠
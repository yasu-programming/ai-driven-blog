#!/bin/bash

# Claude Code実行履歴自動記録ラッパー
# Claudeが実行するコマンドを自動的にログに記録

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEV_LOGGER="$SCRIPT_DIR/dev-logger.sh"

# 一般的な開発コマンドの履歴を記録
log_dev_command() {
    local cmd="$1"
    local context="$2"
    
    # dev-loggerが存在する場合のみログ記録
    if [[ -f "$DEV_LOGGER" ]]; then
        "$DEV_LOGGER" run "$cmd"
    fi
    
    # .claude-history ファイルにも記録
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $cmd" >> .claude-history
    if [[ -n "$context" ]]; then
        echo "  Context: $context" >> .claude-history
    fi
}

# npm/node関連コマンド
npm() {
    log_dev_command "npm $*" "Node.js package management"
    command npm "$@"
}

# composer関連コマンド
composer() {
    log_dev_command "composer $*" "PHP dependency management"
    command composer "$@"
}

# git関連コマンド
git() {
    log_dev_command "git $*" "Version control"
    command git "$@"
}

# php artisan関連コマンド
artisan() {
    log_dev_command "php artisan $*" "Laravel artisan command"
    command php artisan "$@"
}

# Laravel Sail関連コマンド
sail() {
    log_dev_command "./vendor/bin/sail $*" "Laravel Sail Docker"
    command ./vendor/bin/sail "$@"
}

# Docker関連コマンド
docker() {
    log_dev_command "docker $*" "Docker container management"
    command docker "$@"
}

docker-compose() {
    log_dev_command "docker-compose $*" "Docker Compose"
    command docker-compose "$@"
}

# テスト実行
phpunit() {
    log_dev_command "phpunit $*" "PHP Unit testing"
    command phpunit "$@"
}

jest() {
    log_dev_command "jest $*" "JavaScript testing"
    command jest "$@"
}

# ビルド関連
build() {
    log_dev_command "npm run build" "Frontend build"
    command npm run build
}

dev() {
    log_dev_command "npm run dev" "Development server start"
    command npm run dev
}

# エラーハンドリング付きコマンド実行
safe_run() {
    local cmd="$*"
    log_dev_command "$cmd" "Safe execution"
    
    if eval "$cmd"; then
        echo "[SUCCESS] $cmd"
        return 0
    else
        local exit_code=$?
        echo "[ERROR] $cmd failed with exit code $exit_code"
        
        # エラーログ記録
        if [[ -f "$DEV_LOGGER" ]]; then
            "$DEV_LOGGER" error "Command failed: $cmd" "Exit code: $exit_code"
        fi
        
        return $exit_code
    fi
}

# 開発セッション管理
dev_session() {
    case "$1" in
        start)
            if [[ -f "$DEV_LOGGER" ]]; then
                "$DEV_LOGGER" start
                echo "開発セッションを開始しました"
            fi
            ;;
        end)
            if [[ -f "$DEV_LOGGER" ]]; then
                "$DEV_LOGGER" end
                echo "開発セッションを終了しました"
            fi
            ;;
        status)
            if [[ -f "$DEV_LOGGER" ]]; then
                "$DEV_LOGGER" show
            fi
            ;;
        debug)
            if [[ -f "$DEV_LOGGER" ]]; then
                "$DEV_LOGGER" debug
                echo "デバッグ情報を収集しました"
            fi
            ;;
        *)
            echo "使用方法: dev_session {start|end|status|debug}"
            ;;
    esac
}

# 初期化処理
init_claude_logging() {
    # .claude-historyファイル作成
    if [[ ! -f .claude-history ]]; then
        echo "# Claude Code実行履歴" > .claude-history
        echo "# 開始時刻: $(date)" >> .claude-history
        echo "" >> .claude-history
    fi
    
    # 開発ログディレクトリ作成
    mkdir -p dev-logs
    
    echo "Claude Code履歴記録システムを初期化しました"
}

# エクスポート関数
export -f log_dev_command
export -f safe_run
export -f dev_session
export -f init_claude_logging

# 初期化実行
init_claude_logging
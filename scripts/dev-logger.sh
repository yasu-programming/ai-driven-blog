#!/bin/bash

# AI駆動開発ログ管理システム
# 開発セッションの記録とデバッグ支援

# 設定
LOG_DIR="./dev-logs"
SESSION_FILE="$LOG_DIR/current-session.log"
COMMAND_LOG="$LOG_DIR/commands.log"
ERROR_LOG="$LOG_DIR/errors.log"
DEBUG_LOG="$LOG_DIR/debug.log"

# ログディレクトリ作成
mkdir -p "$LOG_DIR"

# セッション開始
start_session() {
    local session_id=$(date +"%Y%m%d_%H%M%S")
    echo "=== 開発セッション開始: $session_id ===" | tee "$SESSION_FILE"
    echo "開始時刻: $(date)" >> "$SESSION_FILE"
    echo "作業ディレクトリ: $(pwd)" >> "$SESSION_FILE"
    echo "Git ブランチ: $(git branch --show-current 2>/dev/null || echo 'N/A')" >> "$SESSION_FILE"
    echo "Git ステータス:" >> "$SESSION_FILE"
    git status --porcelain >> "$SESSION_FILE" 2>/dev/null || echo "Git未初期化" >> "$SESSION_FILE"
    echo "" >> "$SESSION_FILE"
}

# コマンド実行ログ
log_command() {
    local cmd="$1"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] $cmd" >> "$COMMAND_LOG"
    echo "[$timestamp] 実行: $cmd" >> "$SESSION_FILE"
}

# エラーログ
log_error() {
    local error="$1"
    local context="$2"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] ERROR: $error" >> "$ERROR_LOG"
    echo "Context: $context" >> "$ERROR_LOG"
    echo "---" >> "$ERROR_LOG"
    echo "[$timestamp] エラー: $error" >> "$SESSION_FILE"
}

# デバッグ情報収集
collect_debug_info() {
    echo "=== デバッグ情報収集 ===" > "$DEBUG_LOG"
    echo "収集時刻: $(date)" >> "$DEBUG_LOG"
    echo "" >> "$DEBUG_LOG"
    
    echo "## システム情報" >> "$DEBUG_LOG"
    echo "OS: $(uname -a)" >> "$DEBUG_LOG"
    echo "Node.js: $(node --version 2>/dev/null || echo 'Not installed')" >> "$DEBUG_LOG"
    echo "npm: $(npm --version 2>/dev/null || echo 'Not installed')" >> "$DEBUG_LOG"
    echo "PHP: $(php --version 2>/dev/null | head -1 || echo 'Not installed')" >> "$DEBUG_LOG"
    echo "Composer: $(composer --version 2>/dev/null | head -1 || echo 'Not installed')" >> "$DEBUG_LOG"
    echo "" >> "$DEBUG_LOG"
    
    echo "## Git情報" >> "$DEBUG_LOG"
    echo "ブランチ: $(git branch --show-current 2>/dev/null || echo 'N/A')" >> "$DEBUG_LOG"
    echo "最新コミット: $(git log -1 --oneline 2>/dev/null || echo 'N/A')" >> "$DEBUG_LOG"
    echo "ステータス:" >> "$DEBUG_LOG"
    git status >> "$DEBUG_LOG" 2>/dev/null || echo "Git未初期化" >> "$DEBUG_LOG"
    echo "" >> "$DEBUG_LOG"
    
    echo "## プロジェクト構造" >> "$DEBUG_LOG"
    find . -maxdepth 3 -type f -name "*.json" -o -name "*.php" -o -name "*.ts" -o -name "*.js" | head -20 >> "$DEBUG_LOG"
    echo "" >> "$DEBUG_LOG"
    
    echo "## 実行中プロセス" >> "$DEBUG_LOG"
    ps aux | grep -E "(node|php|npm|composer)" | grep -v grep >> "$DEBUG_LOG" 2>/dev/null || echo "関連プロセスなし" >> "$DEBUG_LOG"
}

# セッション終了
end_session() {
    echo "" >> "$SESSION_FILE"
    echo "=== セッション終了: $(date) ===" >> "$SESSION_FILE"
    echo "実行コマンド数: $(wc -l < "$COMMAND_LOG" 2>/dev/null || echo 0)" >> "$SESSION_FILE"
    echo "エラー数: $(grep -c "ERROR:" "$ERROR_LOG" 2>/dev/null || echo 0)" >> "$SESSION_FILE"
    
    # セッションログをアーカイブ
    local archive_name="session_$(date +%Y%m%d_%H%M%S).log"
    cp "$SESSION_FILE" "$LOG_DIR/$archive_name"
}

# コマンド実行ラッパー
run_and_log() {
    local cmd="$*"
    log_command "$cmd"
    
    # コマンド実行
    if eval "$cmd"; then
        echo "[$timestamp] 成功" >> "$SESSION_FILE"
        return 0
    else
        local exit_code=$?
        log_error "コマンド失敗: $cmd" "Exit code: $exit_code"
        return $exit_code
    fi
}

# ヘルプ表示
show_help() {
    cat << EOF
AI駆動開発ログ管理システム

使用方法:
  $0 start          - 開発セッション開始
  $0 end            - 開発セッション終了
  $0 debug          - デバッグ情報収集
  $0 run "command"  - コマンド実行とログ記録
  $0 error "msg"    - エラーログ記録
  $0 show           - 現在のセッションログ表示
  $0 help           - このヘルプ表示

ログファイル:
  - $SESSION_FILE (現在のセッション)
  - $COMMAND_LOG (コマンド履歴)
  - $ERROR_LOG (エラーログ)
  - $DEBUG_LOG (デバッグ情報)
EOF
}

# メイン処理
case "$1" in
    start)
        start_session
        ;;
    end)
        end_session
        ;;
    debug)
        collect_debug_info
        echo "デバッグ情報を $DEBUG_LOG に保存しました"
        ;;
    run)
        shift
        run_and_log "$@"
        ;;
    error)
        log_error "$2" "$3"
        ;;
    show)
        cat "$SESSION_FILE" 2>/dev/null || echo "セッションログがありません"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "使用方法: $0 {start|end|debug|run|error|show|help}"
        exit 1
        ;;
esac
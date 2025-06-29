#!/bin/bash

# デバッグ情報収集スクリプト
# 開発中の問題調査に必要な情報を一括収集

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEBUG_OUTPUT="$PROJECT_ROOT/dev-logs/debug-report-$(date +%Y%m%d_%H%M%S).md"

# ヘッダー出力
print_header() {
    local title="$1"
    echo "" >> "$DEBUG_OUTPUT"
    echo "## $title" >> "$DEBUG_OUTPUT"
    echo "" >> "$DEBUG_OUTPUT"
}

# コマンド実行結果を記録
run_and_capture() {
    local title="$1"
    local cmd="$2"
    local show_error="${3:-true}"
    
    print_header "$title"
    echo "\`\`\`bash" >> "$DEBUG_OUTPUT"
    echo "$ $cmd" >> "$DEBUG_OUTPUT"
    echo "\`\`\`" >> "$DEBUG_OUTPUT"
    echo "" >> "$DEBUG_OUTPUT"
    
    if eval "$cmd" >> "$DEBUG_OUTPUT" 2>&1; then
        echo "✅ 成功" >> "$DEBUG_OUTPUT"
    else
        if [[ "$show_error" == "true" ]]; then
            echo "❌ エラー (Exit code: $?)" >> "$DEBUG_OUTPUT"
        fi
    fi
    echo "" >> "$DEBUG_OUTPUT"
}

# ファイル内容を記録
capture_file() {
    local title="$1"
    local file_path="$2"
    local max_lines="${3:-50}"
    
    print_header "$title"
    
    if [[ -f "$file_path" ]]; then
        echo "\`\`\`" >> "$DEBUG_OUTPUT"
        head -n "$max_lines" "$file_path" >> "$DEBUG_OUTPUT"
        echo "\`\`\`" >> "$DEBUG_OUTPUT"
        
        local total_lines=$(wc -l < "$file_path" 2>/dev/null || echo 0)
        if [[ $total_lines -gt $max_lines ]]; then
            echo "" >> "$DEBUG_OUTPUT"
            echo "*($total_lines 行中 $max_lines 行を表示)*" >> "$DEBUG_OUTPUT"
        fi
    else
        echo "ファイルが存在しません: $file_path" >> "$DEBUG_OUTPUT"
    fi
    echo "" >> "$DEBUG_OUTPUT"
}

# メイン処理
main() {
    # ディレクトリ作成
    mkdir -p "$(dirname "$DEBUG_OUTPUT")"
    
    # レポート開始
    echo "# デバッグレポート" > "$DEBUG_OUTPUT"
    echo "" >> "$DEBUG_OUTPUT"
    echo "生成日時: $(date)" >> "$DEBUG_OUTPUT"
    echo "プロジェクト: $(basename "$PROJECT_ROOT")" >> "$DEBUG_OUTPUT"
    echo "作業ディレクトリ: $PROJECT_ROOT" >> "$DEBUG_OUTPUT"
    
    # システム情報
    print_header "システム情報"
    echo "- OS: $(uname -s)" >> "$DEBUG_OUTPUT"
    echo "- アーキテクチャ: $(uname -m)" >> "$DEBUG_OUTPUT"
    echo "- カーネル: $(uname -r)" >> "$DEBUG_OUTPUT"
    echo "- ホスト名: $(hostname)" >> "$DEBUG_OUTPUT"
    echo "- ユーザー: $(whoami)" >> "$DEBUG_OUTPUT"
    echo "- シェル: $SHELL" >> "$DEBUG_OUTPUT"
    
    # 開発環境情報
    print_header "開発環境"
    echo "- Node.js: $(node --version 2>/dev/null || echo 'インストールされていません')" >> "$DEBUG_OUTPUT"
    echo "- npm: $(npm --version 2>/dev/null || echo 'インストールされていません')" >> "$DEBUG_OUTPUT"
    echo "- PHP: $(php --version 2>/dev/null | head -1 || echo 'インストールされていません')" >> "$DEBUG_OUTPUT"
    echo "- Composer: $(composer --version 2>/dev/null | head -1 || echo 'インストールされていません')" >> "$DEBUG_OUTPUT"
    echo "- Docker: $(docker --version 2>/dev/null || echo 'インストールされていません')" >> "$DEBUG_OUTPUT"
    echo "- Git: $(git --version 2>/dev/null || echo 'インストールされていません')" >> "$DEBUG_OUTPUT"
    
    # Git情報
    if [[ -d "$PROJECT_ROOT/.git" ]]; then
        run_and_capture "Git ブランチ情報" "cd '$PROJECT_ROOT' && git branch -a"
        run_and_capture "Git ステータス" "cd '$PROJECT_ROOT' && git status"
        run_and_capture "最新のコミット履歴" "cd '$PROJECT_ROOT' && git log --oneline -10"
        run_and_capture "変更されたファイル" "cd '$PROJECT_ROOT' && git diff --name-only"
    else
        print_header "Git情報"
        echo "Gitリポジトリではありません" >> "$DEBUG_OUTPUT"
    fi
    
    # プロジェクト構造
    run_and_capture "プロジェクト構造" "cd '$PROJECT_ROOT' && find . -maxdepth 3 -type d | grep -v node_modules | grep -v vendor | grep -v '.git' | sort"
    
    # 設定ファイル
    local config_files=(
        "package.json"
        "composer.json"
        "docker-compose.yml"
        "Dockerfile"
        ".env"
        ".env.example"
        "artisan"
        "next.config.js"
        "tailwind.config.js"
        "tsconfig.json"
    )
    
    for file in "${config_files[@]}"; do
        if [[ -f "$PROJECT_ROOT/$file" ]]; then
            capture_file "設定ファイル: $file" "$PROJECT_ROOT/$file" 30
        fi
    done
    
    # ログファイル
    if [[ -d "$PROJECT_ROOT/dev-logs" ]]; then
        run_and_capture "開発ログファイル一覧" "ls -la '$PROJECT_ROOT/dev-logs/'"
        
        # 最新のセッションログ
        local latest_session=$(ls -t "$PROJECT_ROOT/dev-logs"/session_*.log 2>/dev/null | head -1)
        if [[ -n "$latest_session" ]]; then
            capture_file "最新セッションログ" "$latest_session" 50
        fi
        
        # エラーログ
        if [[ -f "$PROJECT_ROOT/dev-logs/errors.log" ]]; then
            capture_file "エラーログ" "$PROJECT_ROOT/dev-logs/errors.log" 20
        fi
    fi
    
    # Claudeの実行履歴
    if [[ -f "$PROJECT_ROOT/.claude-history" ]]; then
        capture_file "Claude実行履歴" "$PROJECT_ROOT/.claude-history" 30
    fi
    
    # 実行中プロセス
    run_and_capture "Node.js関連プロセス" "ps aux | grep -E 'node|npm' | grep -v grep" false
    run_and_capture "PHP関連プロセス" "ps aux | grep php | grep -v grep" false
    run_and_capture "Docker関連プロセス" "ps aux | grep docker | grep -v grep" false
    
    # ネットワーク情報
    run_and_capture "ポート使用状況" "netstat -tlnp 2>/dev/null | grep -E ':3000|:8000|:80|:443' || ss -tlnp | grep -E ':3000|:8000|:80|:443'" false
    
    # ディスク使用量
    run_and_capture "ディスク使用量" "df -h"
    run_and_capture "プロジェクトディスク使用量" "du -sh '$PROJECT_ROOT' 2>/dev/null"
    
    # 最後にファイルサイズ情報
    print_header "大きなファイル/ディレクトリ (Top 10)"
    find "$PROJECT_ROOT" -type f -size +1M -exec ls -lh {} \; 2>/dev/null | sort -k5 -hr | head -10 >> "$DEBUG_OUTPUT" 2>/dev/null || echo "大きなファイルはありません" >> "$DEBUG_OUTPUT"
    
    echo "" >> "$DEBUG_OUTPUT"
    echo "---" >> "$DEBUG_OUTPUT"
    echo "レポート完了: $(date)" >> "$DEBUG_OUTPUT"
    
    echo "✅ デバッグレポートを生成しました: $DEBUG_OUTPUT"
    echo ""
    echo "📊 レポート概要:"
    echo "   - ファイルサイズ: $(du -h "$DEBUG_OUTPUT" | cut -f1)"
    echo "   - 行数: $(wc -l < "$DEBUG_OUTPUT")"
    echo ""
    echo "📋 使用方法:"
    echo "   cat '$DEBUG_OUTPUT'        # レポート表示"
    echo "   code '$DEBUG_OUTPUT'       # VS Codeで開く"
}

# ヘルプ表示
show_help() {
    cat << EOF
デバッグ情報収集スクリプト

使用方法:
  $0                # フルデバッグレポート生成
  $0 --help         # このヘルプを表示

生成される情報:
  - システム情報 (OS, 開発環境)
  - Git情報 (ブランチ, ステータス, 履歴)
  - プロジェクト構造
  - 設定ファイル内容
  - 開発ログとエラーログ
  - Claude実行履歴
  - 実行中プロセス
  - ネットワークとディスク情報

出力先: dev-logs/debug-report-YYYYMMDD_HHMMSS.md
EOF
}

# メイン処理分岐
case "${1:-}" in
    --help|-h|help)
        show_help
        ;;
    *)
        main
        ;;
esac
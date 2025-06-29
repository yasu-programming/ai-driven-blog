#!/bin/bash

# AI駆動開発セッション管理ツール
# 統合的な開発環境制御とモニタリング

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SESSION_CONFIG="$PROJECT_ROOT/.dev-session"

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ出力
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# セッション設定読み込み
load_session_config() {
    if [[ -f "$SESSION_CONFIG" ]]; then
        source "$SESSION_CONFIG"
    fi
}

# セッション設定保存
save_session_config() {
    cat > "$SESSION_CONFIG" << EOF
# AI駆動開発セッション設定
SESSION_ID="$SESSION_ID"
SESSION_START="$SESSION_START"
PROJECT_TYPE="$PROJECT_TYPE"
FRONTEND_PORT="$FRONTEND_PORT"
BACKEND_PORT="$BACKEND_PORT"
DATABASE_TYPE="$DATABASE_TYPE"
AUTO_SAVE_INTERVAL="$AUTO_SAVE_INTERVAL"
EOF
}

# セッション開始
start_session() {
    log_info "AI駆動開発セッションを開始します..."
    
    # セッションID生成
    SESSION_ID="dev_$(date +%Y%m%d_%H%M%S)"
    SESSION_START=$(date)
    
    # プロジェクト種別検出
    detect_project_type
    
    # ポート設定
    FRONTEND_PORT=${FRONTEND_PORT:-3000}
    BACKEND_PORT=${BACKEND_PORT:-8000}
    DATABASE_TYPE=${DATABASE_TYPE:-"postgresql"}
    AUTO_SAVE_INTERVAL=${AUTO_SAVE_INTERVAL:-300}
    
    # ログ開始
    "$SCRIPT_DIR/dev-logger.sh" start
    
    # 設定保存
    save_session_config
    
    # プロジェクト構成確認
    check_project_structure
    
    # 依存関係確認
    check_dependencies
    
    # 開発環境起動
    start_dev_environment
    
    log_success "セッション開始完了: $SESSION_ID"
    show_session_status
}

# プロジェクト種別検出
detect_project_type() {
    log_info "プロジェクト種別を検出中..."
    
    if [[ -f "$PROJECT_ROOT/package.json" ]] && [[ -f "$PROJECT_ROOT/composer.json" ]]; then
        PROJECT_TYPE="fullstack"
        log_info "フルスタック構成 (Laravel + Next.js) を検出"
    elif [[ -f "$PROJECT_ROOT/package.json" ]]; then
        PROJECT_TYPE="frontend"
        log_info "フロントエンド構成 (Next.js) を検出"
    elif [[ -f "$PROJECT_ROOT/composer.json" ]]; then
        PROJECT_TYPE="backend"
        log_info "バックエンド構成 (Laravel) を検出"
    else
        PROJECT_TYPE="unknown"
        log_warning "プロジェクト種別を検出できませんでした"
    fi
}

# プロジェクト構造確認
check_project_structure() {
    log_info "プロジェクト構造を確認中..."
    
    local missing_dirs=()
    
    case "$PROJECT_TYPE" in
        "fullstack")
            [[ ! -d "$PROJECT_ROOT/frontend" ]] && missing_dirs+=("frontend")
            [[ ! -d "$PROJECT_ROOT/backend" ]] && missing_dirs+=("backend")
            ;;
        "frontend")
            [[ ! -d "$PROJECT_ROOT/src" ]] && [[ ! -d "$PROJECT_ROOT/app" ]] && missing_dirs+=("src または app")
            ;;
        "backend")
            [[ ! -d "$PROJECT_ROOT/app" ]] && missing_dirs+=("app")
            [[ ! -d "$PROJECT_ROOT/routes" ]] && missing_dirs+=("routes")
            ;;
    esac
    
    if [[ ${#missing_dirs[@]} -gt 0 ]]; then
        log_warning "以下のディレクトリが見つかりません: ${missing_dirs[*]}"
        log_info "必要に応じて作成してください"
    else
        log_success "プロジェクト構造OK"
    fi
}

# 依存関係確認
check_dependencies() {
    log_info "依存関係を確認中..."
    
    local missing_deps=()
    
    # Node.js/npm
    if [[ "$PROJECT_TYPE" == "frontend" ]] || [[ "$PROJECT_TYPE" == "fullstack" ]]; then
        if ! command -v node &> /dev/null; then
            missing_deps+=("Node.js")
        elif ! command -v npm &> /dev/null; then
            missing_deps+=("npm")
        fi
    fi
    
    # PHP/Composer
    if [[ "$PROJECT_TYPE" == "backend" ]] || [[ "$PROJECT_TYPE" == "fullstack" ]]; then
        if ! command -v php &> /dev/null; then
            missing_deps+=("PHP")
        elif ! command -v composer &> /dev/null; then
            missing_deps+=("Composer")
        fi
    fi
    
    # Git
    if ! command -v git &> /dev/null; then
        missing_deps+=("Git")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "以下の依存関係が不足しています: ${missing_deps[*]}"
        return 1
    else
        log_success "依存関係OK"
        return 0
    fi
}

# 開発環境起動
start_dev_environment() {
    log_info "開発環境を起動中..."
    
    case "$PROJECT_TYPE" in
        "fullstack")
            start_fullstack_env
            ;;
        "frontend")
            start_frontend_env
            ;;
        "backend")
            start_backend_env
            ;;
        *)
            log_warning "プロジェクト種別が不明のため、環境起動をスキップします"
            ;;
    esac
}

# フルスタック環境起動
start_fullstack_env() {
    # Docker Compose確認
    if [[ -f "$PROJECT_ROOT/docker-compose.yml" ]]; then
        log_info "Docker Composeで環境起動中..."
        cd "$PROJECT_ROOT" && docker-compose up -d
    else
        # 個別起動
        start_backend_env
        start_frontend_env
    fi
}

# フロントエンド環境起動
start_frontend_env() {
    local frontend_dir="$PROJECT_ROOT"
    [[ -d "$PROJECT_ROOT/frontend" ]] && frontend_dir="$PROJECT_ROOT/frontend"
    
    if [[ -f "$frontend_dir/package.json" ]]; then
        log_info "フロントエンド開発サーバーを起動中..."
        cd "$frontend_dir"
        
        # 依存関係インストール確認
        if [[ ! -d "node_modules" ]]; then
            log_info "依存関係をインストール中..."
            npm install
        fi
        
        # 開発サーバー起動
        nohup npm run dev > "$PROJECT_ROOT/dev-logs/frontend.log" 2>&1 &
        echo $! > "$PROJECT_ROOT/dev-logs/frontend.pid"
        log_success "フロントエンド開発サーバー起動完了 (PID: $!)"
    fi
}

# バックエンド環境起動
start_backend_env() {
    local backend_dir="$PROJECT_ROOT"
    [[ -d "$PROJECT_ROOT/backend" ]] && backend_dir="$PROJECT_ROOT/backend"
    
    if [[ -f "$backend_dir/artisan" ]]; then
        log_info "Laravel開発サーバーを起動中..."
        cd "$backend_dir"
        
        # 依存関係インストール確認
        if [[ ! -d "vendor" ]]; then
            log_info "Composer依存関係をインストール中..."
            composer install
        fi
        
        # .env確認
        if [[ ! -f ".env" ]] && [[ -f ".env.example" ]]; then
            log_info ".envファイルを作成中..."
            cp .env.example .env
            php artisan key:generate
        fi
        
        # データベースマイグレーション
        if [[ -f ".env" ]]; then
            log_info "データベースマイグレーション実行中..."
            php artisan migrate --force 2>/dev/null || log_warning "マイグレーション失敗（データベース未設定の可能性）"
        fi
        
        # 開発サーバー起動
        nohup php artisan serve --port="$BACKEND_PORT" > "$PROJECT_ROOT/dev-logs/backend.log" 2>&1 &
        echo $! > "$PROJECT_ROOT/dev-logs/backend.pid"
        log_success "Laravel開発サーバー起動完了 (PID: $!, Port: $BACKEND_PORT)"
    fi
}

# セッション状態表示
show_session_status() {
    load_session_config
    
    echo ""
    echo "=== AI駆動開発セッション状態 ==="
    echo "セッションID: $SESSION_ID"
    echo "開始時刻: $SESSION_START"
    echo "プロジェクト種別: $PROJECT_TYPE"
    echo ""
    
    # サーバー状態確認
    check_server_status
    
    # リソース使用状況
    show_resource_usage
    
    echo ""
    echo "=== 利用可能なコマンド ==="
    echo "  ./scripts/dev-session.sh status    - 状態確認"
    echo "  ./scripts/dev-session.sh logs      - ログ表示"
    echo "  ./scripts/dev-session.sh debug     - デバッグ情報収集"
    echo "  ./scripts/dev-session.sh stop      - セッション終了"
    echo ""
}

# サーバー状態確認
check_server_status() {
    echo "サーバー状態:"
    
    # フロントエンド
    if [[ -f "$PROJECT_ROOT/dev-logs/frontend.pid" ]]; then
        local frontend_pid=$(cat "$PROJECT_ROOT/dev-logs/frontend.pid")
        if ps -p "$frontend_pid" > /dev/null 2>&1; then
            echo "  ✅ フロントエンド: 実行中 (PID: $frontend_pid, Port: $FRONTEND_PORT)"
        else
            echo "  ❌ フロントエンド: 停止中"
        fi
    else
        echo "  ⚪ フロントエンド: 未起動"
    fi
    
    # バックエンド
    if [[ -f "$PROJECT_ROOT/dev-logs/backend.pid" ]]; then
        local backend_pid=$(cat "$PROJECT_ROOT/dev-logs/backend.pid")
        if ps -p "$backend_pid" > /dev/null 2>&1; then
            echo "  ✅ バックエンド: 実行中 (PID: $backend_pid, Port: $BACKEND_PORT)"
        else
            echo "  ❌ バックエンド: 停止中"
        fi
    else
        echo "  ⚪ バックエンド: 未起動"
    fi
}

# リソース使用状況
show_resource_usage() {
    echo "リソース使用状況:"
    echo "  CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
    echo "  メモリ: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
    echo "  ディスク: $(df -h . | tail -1 | awk '{print $5}')"
}

# ログ表示
show_logs() {
    local log_type="${1:-all}"
    
    case "$log_type" in
        "frontend"|"front"|"f")
            if [[ -f "$PROJECT_ROOT/dev-logs/frontend.log" ]]; then
                tail -f "$PROJECT_ROOT/dev-logs/frontend.log"
            else
                log_error "フロントエンドログが見つかりません"
            fi
            ;;
        "backend"|"back"|"b")
            if [[ -f "$PROJECT_ROOT/dev-logs/backend.log" ]]; then
                tail -f "$PROJECT_ROOT/dev-logs/backend.log"
            else
                log_error "バックエンドログが見つかりません"
            fi
            ;;
        "session"|"s")
            "$SCRIPT_DIR/dev-logger.sh" show
            ;;
        "all"|*)
            echo "=== セッションログ ==="
            "$SCRIPT_DIR/dev-logger.sh" show | tail -20
            echo ""
            echo "=== フロントエンドログ (最新10行) ==="
            tail -10 "$PROJECT_ROOT/dev-logs/frontend.log" 2>/dev/null || echo "ログなし"
            echo ""
            echo "=== バックエンドログ (最新10行) ==="
            tail -10 "$PROJECT_ROOT/dev-logs/backend.log" 2>/dev/null || echo "ログなし"
            ;;
    esac
}

# デバッグ情報収集
collect_debug() {
    log_info "デバッグ情報を収集中..."
    "$SCRIPT_DIR/debug-collector.sh"
    "$SCRIPT_DIR/dev-logger.sh" debug
}

# セッション終了
stop_session() {
    log_info "開発セッションを終了中..."
    
    # プロセス終了
    if [[ -f "$PROJECT_ROOT/dev-logs/frontend.pid" ]]; then
        local frontend_pid=$(cat "$PROJECT_ROOT/dev-logs/frontend.pid")
        if ps -p "$frontend_pid" > /dev/null 2>&1; then
            kill "$frontend_pid"
            log_success "フロントエンドサーバーを停止しました"
        fi
        rm -f "$PROJECT_ROOT/dev-logs/frontend.pid"
    fi
    
    if [[ -f "$PROJECT_ROOT/dev-logs/backend.pid" ]]; then
        local backend_pid=$(cat "$PROJECT_ROOT/dev-logs/backend.pid")
        if ps -p "$backend_pid" > /dev/null 2>&1; then
            kill "$backend_pid"
            log_success "バックエンドサーバーを停止しました"
        fi
        rm -f "$PROJECT_ROOT/dev-logs/backend.pid"
    fi
    
    # Docker停止
    if [[ -f "$PROJECT_ROOT/docker-compose.yml" ]]; then
        cd "$PROJECT_ROOT" && docker-compose down
    fi
    
    # ログ終了
    "$SCRIPT_DIR/dev-logger.sh" end
    
    # 設定クリア
    rm -f "$SESSION_CONFIG"
    
    log_success "セッション終了完了"
}

# ヘルプ表示
show_help() {
    cat << EOF
AI駆動開発セッション管理ツール

使用方法:
  $0 start          - 開発セッション開始
  $0 status         - セッション状態確認
  $0 logs [type]    - ログ表示 (all/frontend/backend/session)
  $0 debug          - デバッグ情報収集
  $0 stop           - セッション終了
  $0 help           - このヘルプ表示

機能:
  - 自動プロジェクト種別検出
  - 開発サーバー自動起動
  - リアルタイム状態監視
  - 統合ログ管理
  - デバッグ情報収集

対応プロジェクト:
  - Laravel (PHP)
  - Next.js (Node.js)
  - Laravel + Next.js (フルスタック)
EOF
}

# メイン処理
main() {
    cd "$PROJECT_ROOT"
    mkdir -p "$PROJECT_ROOT/dev-logs"
    
    case "${1:-start}" in
        "start")
            start_session
            ;;
        "status"|"st")
            show_session_status
            ;;
        "logs"|"log"|"l")
            show_logs "$2"
            ;;
        "debug"|"d")
            collect_debug
            ;;
        "stop"|"end")
            stop_session
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            log_error "不明なコマンド: $1"
            show_help
            exit 1
            ;;
    esac
}

# 初期化とメイン実行
load_session_config
main "$@"
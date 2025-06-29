#!/bin/bash

# AI-Driven Blog - Codespaces Setup Script
# This script runs after the dev container is created

set -e

echo "🚀 AI-Driven Blog Codespaces Setup Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Change to workspace directory
cd /workspace

# Wait for services to be ready
log_info "Waiting for services to be ready..."
sleep 10

# Check PostgreSQL connection
log_info "Checking PostgreSQL connection..."
for i in {1..30}; do
    if pg_isready -h postgres -p 5432 -U postgres >/dev/null 2>&1; then
        log_success "PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "PostgreSQL failed to start within 30 attempts"
        exit 1
    fi
    sleep 2
done

# Check Redis connection
log_info "Checking Redis connection..."
for i in {1..30}; do
    if redis-cli -h redis ping >/dev/null 2>&1; then
        log_success "Redis is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Redis failed to start within 30 attempts"
        exit 1
    fi
    sleep 2
done

# Create project directories
log_info "Creating project directories..."
mkdir -p frontend backend storage/logs storage/cache dev-logs scripts

# Setup environment file
log_info "Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.codespaces .env
    log_success "Environment file created from .env.codespaces"
else
    log_info "Environment file already exists"
fi

# Setup Git configuration (if not already set)
log_info "Configuring Git..."
if [ -z "$(git config --global user.name)" ]; then
    git config --global user.name "Codespaces User"
    git config --global user.email "user@codespaces.dev"
    log_info "Git configured with default settings"
fi

# Make scripts executable
log_info "Setting up development scripts..."
chmod +x scripts/*.sh
log_success "Development scripts are executable"

# Setup development log system
log_info "Initializing development logging system..."
./scripts/dev-logger.sh start
log_success "Development logging initialized"

# Create symbolic links for easier access
log_info "Creating convenience shortcuts..."
ln -sf /workspace/scripts/dev-session.sh /workspace/dev
ln -sf /workspace/scripts/debug-collector.sh /workspace/debug
log_success "Shortcuts created: ./dev and ./debug"

# Setup Zsh configuration
log_info "Configuring Zsh..."
cat >> /home/node/.zshrc << 'EOF'

# AI-Driven Blog Development Aliases
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias dev='./scripts/dev-session.sh'
alias debug='./scripts/debug-collector.sh'
alias artisan='php backend/artisan'
alias sail='./vendor/bin/sail'

# Laravel shortcuts
alias migrate='php backend/artisan migrate'
alias seed='php backend/artisan db:seed'
alias fresh='php backend/artisan migrate:fresh --seed'
alias tinker='php backend/artisan tinker'

# Frontend shortcuts
alias next='cd frontend && npm run dev'
alias build='cd frontend && npm run build'
alias test='cd frontend && npm run test'

# Git shortcuts
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git log --oneline'

# Development environment
export PATH="/workspace/scripts:$PATH"
export EDITOR="code"

# Welcome message
echo "🚀 AI-Driven Blog Development Environment"
echo "📂 Project: $(basename $(pwd))"
echo "🔧 Use './dev start' to begin development session"
echo "🐛 Use './debug' to collect debug information"
echo ""
EOF

log_success "Zsh configuration updated"

# Create a welcome script
cat > /workspace/welcome.sh << 'EOF'
#!/bin/bash
echo "🎉 Welcome to AI-Driven Blog Development!"
echo ""
echo "📋 Quick Start Commands:"
echo "  ./dev start    - Start development session"
echo "  ./dev status   - Check development status"
echo "  ./dev logs     - View development logs"
echo "  ./debug        - Collect debug information"
echo ""
echo "🔧 Project Structure:"
echo "  frontend/      - Next.js application"
echo "  backend/       - Laravel API"
echo "  scripts/       - Development tools"
echo "  dev-logs/      - Development logs"
echo ""
echo "🌐 Services:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  MailHog:   http://localhost:8025"
echo ""
echo "📚 Documentation:"
echo "  - README.md"
echo "  - docs/"
echo "  - scripts/README.md"
echo ""
EOF

chmod +x /workspace/welcome.sh

# Show completion message
log_success "🎉 AI-Driven Blog Codespaces setup completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Run './welcome.sh' for quick start guide"
echo "2. Run './dev start' to begin development"
echo "3. Open http://localhost:3000 for frontend"
echo "4. Open http://localhost:8000 for backend API"
echo ""
echo "🔧 Development Tools Ready:"
echo "  - PostgreSQL Database"
echo "  - Redis Cache"
echo "  - MailHog (Email Testing)"
echo "  - Development Logging System"
echo "  - Debug Information Collector"
echo ""

# Final setup
log_info "Running final setup tasks..."

# Create .gitignore additions for Codespaces
cat >> .gitignore << 'EOF'

# Codespaces specific
.devcontainer/docker-compose.override.yml
.env.codespaces.local
dev-logs/
.dev-session
.claude-history

# IDE
.vscode/settings.json.local
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
EOF

log_success "Setup script completed successfully! 🎉"
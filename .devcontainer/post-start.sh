#!/bin/bash

# AI-Driven Blog - Post-Start Script
# This script runs every time the Codespace starts

set -e

echo "🔄 AI-Driven Blog Post-Start Setup..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Change to workspace directory
cd /workspace

# Ensure services are healthy
log_info "Checking service health..."

# Wait for PostgreSQL
log_info "Waiting for PostgreSQL..."
for i in {1..15}; do
    if pg_isready -h postgres -p 5432 -U postgres >/dev/null 2>&1; then
        log_success "PostgreSQL is healthy"
        break
    fi
    sleep 2
done

# Wait for Redis
log_info "Waiting for Redis..."
for i in {1..15}; do
    if redis-cli -h redis ping >/dev/null 2>&1; then
        log_success "Redis is healthy"
        break
    fi
    sleep 2
done

# Update environment if needed
if [ -f .env.codespaces ] && [ .env.codespaces -nt .env ]; then
    log_info "Updating environment configuration..."
    cp .env.codespaces .env
    log_success "Environment updated"
fi

# Ensure scripts are executable
chmod +x scripts/*.sh 2>/dev/null || true

# Initialize logging if not already active
if [ ! -f dev-logs/current-session.log ]; then
    ./scripts/dev-logger.sh start >/dev/null 2>&1 || true
    log_info "Development logging initialized"
fi

# Create convenience shortcuts if they don't exist
[ ! -L dev ] && ln -sf scripts/dev-session.sh dev 2>/dev/null || true
[ ! -L debug ] && ln -sf scripts/debug-collector.sh debug 2>/dev/null || true

# Show status
log_success "🚀 AI-Driven Blog is ready for development!"
echo ""
echo "🌐 Service URLs:"
echo "  - Frontend: http://localhost:3000 (when running)"
echo "  - Backend:  http://localhost:8000 (when running)"
echo "  - MailHog:  http://localhost:8025"
echo ""
echo "🔧 Quick Commands:"
echo "  ./dev start    - Start development session"
echo "  ./dev status   - Check current status"
echo "  ./welcome.sh   - Show welcome guide"
echo ""
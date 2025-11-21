# Justfile - Modern command runner with preflight/postflight checks (M4 Max Optimized)
# Install: brew install just or cargo install just
# Usage: just <command> or just --list

# Settings
set shell := ["bash", "-uc"]
set export := true

# M4 Max detection variables
is_orbstack := `which orbstack > /dev/null 2>&1 && echo "true" || echo "false"`
cpu_cores := `sysctl -n hw.ncpu 2>/dev/null || echo "8"`

# ============================================================================
# Preflight & Postflight Functions
# ============================================================================

# Preflight: Check prerequisites before running commands
_check_docker:
    @echo "🔍 Checking Docker/OrbStack..."
    @docker info > /dev/null 2>&1 || (echo "❌ Docker/OrbStack is not running. Please start it first." && exit 1)
    @echo "✅ Docker/OrbStack is running"

_check_firebase_cli:
    @echo "🔍 Checking Firebase CLI..."
    @command -v firebase > /dev/null 2>&1 || (echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools" && exit 1)
    @echo "✅ Firebase CLI installed"

_check_pnpm:
    @echo "🔍 Checking pnpm..."
    @command -v pnpm > /dev/null 2>&1 || (echo "❌ pnpm not found. Install with: npm install -g pnpm" && exit 1)
    @echo "✅ pnpm installed"

_check_uv:
    @echo "🔍 Checking uv..."
    @command -v uv > /dev/null 2>&1 || (echo "❌ uv not found. Install with: pip install uv or brew install uv" && exit 1)
    @echo "✅ uv installed"

_check_node:
    @echo "🔍 Checking Node.js..."
    @command -v node > /dev/null 2>&1 || (echo "❌ Node.js not found. Install Node.js 20+" && exit 1)
    @node --version | grep -q "v2[0-9]\|v3[0-9]" || (echo "⚠️  Node.js version should be 20+ (found: $(node --version))" && exit 1)
    @echo "✅ Node.js $(node --version) installed"

_check_python:
    @echo "🔍 Checking Python..."
    @command -v python3 > /dev/null 2>&1 || (echo "❌ Python 3 not found" && exit 1)
    @python3 --version | grep -q "Python 3.1[1-9]\|Python 3.[2-9]" || (echo "⚠️  Python 3.11+ recommended (found: $(python3 --version))" && exit 1)
    @echo "✅ Python $(python3 --version) installed"

_check_mise:
    @echo "🔍 Checking mise..."
    @command -v mise > /dev/null 2>&1 || (echo "⚠️  mise not found. Install with: brew install mise" && echo "   Or visit: https://mise.jdx.dev" && exit 1)
    @mise --version > /dev/null 2>&1 || (echo "❌ mise not working properly" && exit 1)
    @echo "✅ mise installed ($(mise --version | head -n1))"

_check_direnv:
    @echo "🔍 Checking direnv..."
    @command -v direnv > /dev/null 2>&1 || (echo "⚠️  direnv not found. Install with: brew install direnv" && echo "   Then add to shell: echo 'eval \"\$(direnv hook zsh)\"' >> ~/.zshrc" && exit 1)
    @direnv version > /dev/null 2>&1 || (echo "❌ direnv not working properly" && exit 1)
    @echo "✅ direnv installed ($(direnv version | head -n1))"
    @if [ ! -f .envrc.allow ]; then echo "⚠️  .envrc not trusted. Run: direnv allow"; fi

_check_mise_tools:
    @echo "🔍 Checking mise-managed tools..."
    @if command -v mise > /dev/null 2>&1; then \
        mise install --check 2>/dev/null && echo "✅ All mise tools installed" || echo "⚠️  Some mise tools missing. Run: mise install"; \
    else \
        echo "⚠️  mise not installed, skipping tool check"; \
    fi

_check_ports:
    @echo "🔍 Checking if ports are available..."
    @lsof -ti:8080 > /dev/null 2>&1 && (echo "⚠️  Port 8080 is in use (FastAPI)" || true)
    @lsof -ti:3000 > /dev/null 2>&1 && (echo "⚠️  Port 3000 is in use (Next.js)" || true)
    @lsof -ti:8081 > /dev/null 2>&1 && (echo "⚠️  Port 8081 is in use (Firestore Emulator)" || true)
    @lsof -ti:9099 > /dev/null 2>&1 && (echo "⚠️  Port 9099 is in use (Auth Emulator)" || true)
    @lsof -ti:9199 > /dev/null 2>&1 && (echo "⚠️  Port 9199 is in use (Storage Emulator)" || true)
    @lsof -ti:4000 > /dev/null 2>&1 && (echo "⚠️  Port 4000 is in use (Firebase UI)" || true)
    @echo "✅ Port check complete"

_check_env_files:
    @echo "🔍 Checking environment files..."
    @if [ ! -f .env.local ]; then echo "⚠️  .env.local not found. Copy from .env.local.example"; fi
    @if [ ! -f apps/agents/.env ]; then echo "⚠️  apps/agents/.env not found. Copy from apps/agents/.env.example"; fi
    @echo "✅ Environment files checked"

_check_dependencies:
    @echo "🔍 Checking dependencies..."
    @if [ ! -d node_modules ]; then echo "⚠️  Node modules not installed. Run: just install"; fi
    @if [ ! -d apps/agents/.venv ]; then echo "⚠️  Python venv not found. Run: just install:python"; fi
    @echo "✅ Dependencies checked"

# Postflight: Verify services are healthy after starting
_postflight_api:
    @echo "🔍 Postflight: Checking Agents API health..."
    @for i in 1 2 3 4 5 6 7 8 9 10; do \
        curl -f http://localhost:8080/health > /dev/null 2>&1 && \
        echo "✅ Agents API is healthy" && exit 0 || \
        sleep 1; \
    done
    @echo "⚠️  Agents API health check failed. Check logs: just docker:logs"

_postflight_web:
    @echo "🔍 Postflight: Checking Web App..."
    @for i in 1 2 3 4 5 6 7 8 9 10; do \
        curl -f http://localhost:3000 > /dev/null 2>&1 && \
        echo "✅ Web App is responding" && exit 0 || \
        sleep 1; \
    done
    @echo "⚠️  Web App health check failed"

_postflight_emulators:
    @echo "🔍 Postflight: Checking Firebase Emulators..."
    @for i in 1 2 3 4 5; do \
        curl -f http://localhost:4000 > /dev/null 2>&1 && \
        echo "✅ Firebase Emulators UI is accessible" && exit 0 || \
        sleep 1; \
    done
    @echo "⚠️  Firebase Emulators health check failed"

# Comprehensive preflight check
preflight:
    @echo "🚀 Running preflight checks..."
    @just _check_mise || true
    @just _check_direnv || true
    @just _check_mise_tools || true
    @just _check_node
    @just _check_pnpm
    @just _check_uv
    @just _check_python
    @just _check_docker
    @just _check_firebase_cli
    @just _check_ports
    @just _check_env_files
    @just _check_dependencies
    @echo "✅ All preflight checks passed!"

# Comprehensive postflight check
postflight:
    @echo "🔍 Running postflight checks..."
    @just _postflight_api || true
    @just _postflight_web || true
    @just _postflight_emulators || true
    @echo "✅ Postflight checks complete"

# ============================================================================
# Development
# ============================================================================

# Default recipe (show available commands)
default:
    @just --list

# Start all services (Next.js + FastAPI + Firebase Emulators) with checks
dev: preflight
    @echo "🚀 Starting all development services..."
    @just dev:all:internal

# Alias for quick access
alias d := dev:all
alias t := test
alias b := build
alias h := health
alias s := status

# Internal: Start all services (no preflight) with M4 Max parallel execution
dev:all:internal:
    #!/usr/bin/env bash
    if [[ "{{is_orbstack}}" == "true" ]]; then
        echo "🚀 Detected OrbStack on Apple Silicon - Using parallel execution"
        # Launch services in parallel for M4 Max
        (just dev:api:internal &)
        (just dev:emulators:internal &)
        (just dev:web:internal &)
        wait
    else
        echo "🚀 Starting services sequentially..."
        just dev:api:internal
        sleep 2
        just dev:emulators:internal &
        sleep 2
        just dev:web:internal &
        sleep 3
    fi
    @just postflight
    @echo ""
    @echo "✅ Development environment started!"
    @echo "📍 Services:"
    @echo "  • Agents API:     http://localhost:8080"
    @echo "  • API Docs:       http://localhost:8080/docs"
    @echo "  • Web App:        http://localhost:3000"
    @echo "  • Firebase UI:    http://localhost:4000"

# Internal: Start API (no checks)
dev:api:internal:
    @docker compose up -d agents-api
    @echo "⏳ Waiting for Agents API to start..."
    @sleep 5

# Internal: Start emulators (no checks)
dev:emulators:internal:
    @firebase emulators:start --only auth,firestore,storage,ui > /dev/null 2>&1 &
    @echo "⏳ Waiting for Firebase Emulators..."
    @sleep 3

# Internal: Start web (no checks)
dev:web:internal:
    @pnpm --filter @aip/web dev > /dev/null 2>&1 &
    @sleep 3

# Start FastAPI agents API in Docker with checks
dev:api: preflight _check_docker
    @echo "🚀 Starting FastAPI Agents API..."
    @docker compose up -d agents-api
    @sleep 3
    @just _postflight_api

# Start Next.js web app locally with checks
dev:web: preflight _check_pnpm _check_node
    @echo "🚀 Starting Next.js web app..."
    @pnpm --filter @aip/web dev

# Start Firebase emulators with checks
dev:emulators: preflight _check_firebase_cli
    @echo "🔥 Starting Firebase Emulators..."
    @firebase emulators:start --only auth,firestore,storage,ui

# Seed Firebase emulators with test data
emulators:seed: preflight _check_firebase_cli
    @echo "🌱 Seeding Firebase Emulators with test data..."
    @firebase emulators:exec "node scripts/firebase/seed-emulators.js" --only auth,firestore

# ============================================================================
# Docker Commands
# ============================================================================

# Start Docker services with checks
docker:up: preflight _check_docker
    @echo "📦 Starting Docker services..."
    @docker compose up -d
    @sleep 3
    @just _postflight_api

# Stop Docker services
docker:down:
    @echo "🛑 Stopping Docker services..."
    @docker compose down
    @echo "✅ Docker services stopped"

# View Docker logs
docker:logs:
    @docker compose logs -f agents-api

# Rebuild Docker containers with checks
docker:rebuild: preflight _check_docker
    @echo "🔨 Rebuilding Docker containers..."
    @docker compose build --no-cache agents-api
    @docker compose up -d agents-api
    @sleep 5
    @just _postflight_api

# Reset Docker environment completely
docker:reset:
    @echo "🔄 Resetting Docker environment..."
    @docker compose down -v
    @docker system prune -f
    @echo "✅ Docker environment reset"

# Prune Docker resources
docker:prune:
    @echo "🧹 Pruning Docker resources..."
    @docker system prune -f
    @docker volume prune -f
    @echo "✅ Docker resources pruned"

# Check port availability
ports:check:
    @echo "🔍 Checking port availability..."
    @lsof -ti:8080 > /dev/null 2>&1 && echo "⚠️  Port 8080 is in use (FastAPI)" || echo "✅ Port 8080 available"
    @lsof -ti:3000 > /dev/null 2>&1 && echo "⚠️  Port 3000 is in use (Next.js)" || echo "✅ Port 3000 available"
    @lsof -ti:8081 > /dev/null 2>&1 && echo "⚠️  Port 8081 is in use (Firestore Emulator)" || echo "✅ Port 8081 available"
    @lsof -ti:9099 > /dev/null 2>&1 && echo "⚠️  Port 9099 is in use (Auth Emulator)" || echo "✅ Port 9099 available"
    @lsof -ti:9199 > /dev/null 2>&1 && echo "⚠️  Port 9199 is in use (Storage Emulator)" || echo "✅ Port 9199 available"
    @lsof -ti:4000 > /dev/null 2>&1 && echo "⚠️  Port 4000 is in use (Firebase UI)" || echo "✅ Port 4000 available"

# ============================================================================
# Installation & Setup
# ============================================================================

# Install all dependencies with checks
install: preflight
    @echo "📦 Installing dependencies..."
    @pnpm install
    @cd apps/agents && uv sync && cd ../..
    @echo "✅ Dependencies installed"

# Install Python dependencies only with checks
install:python: _check_uv _check_python
    @echo "📦 Installing Python dependencies..."
    @cd apps/agents && uv sync
    @echo "✅ Python dependencies installed"

# Install Node.js dependencies only with checks
install:node: _check_pnpm _check_node
    @echo "📦 Installing Node.js dependencies..."
    @pnpm install
    @echo "✅ Node.js dependencies installed"

# Setup mise and direnv
setup:mise:
    @echo "🔧 Setting up mise..."
    @if ! command -v mise > /dev/null 2>&1; then \
        echo "Installing mise..."; \
        curl https://mise.run | sh; \
    fi
    @mise install
    @echo "✅ mise setup complete"

setup:direnv:
    @echo "🔧 Setting up direnv..."
    @if ! command -v direnv > /dev/null 2>&1; then \
        echo "Installing direnv..."; \
        brew install direnv; \
    fi
    @if ! grep -q "direnv hook" ~/.zshrc 2>/dev/null; then \
        echo "Adding direnv to shell..."; \
        echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc; \
        echo "✅ Added direnv to ~/.zshrc. Restart your shell or run: source ~/.zshrc"; \
    fi
    @direnv allow
    @echo "✅ direnv setup complete"

# Setup development environment (first time) with comprehensive checks
setup: preflight
    @echo "🔧 Setting up development environment..."
    @just install
    @echo "📝 Setting up environment files..."
    @if [ ! -f .env.local ]; then cp .env.local.example .env.local && echo "✅ Created .env.local"; fi
    @if [ ! -f apps/agents/.env ]; then cp apps/agents/.env.example apps/agents/.env && echo "✅ Created apps/agents/.env"; fi
    @echo ""
    @echo "✅ Setup complete!"
    @echo ""
    @echo "📝 Next steps:"
    @echo "  1. Review and update .env.local with your Firebase config"
    @echo "  2. Review and update apps/agents/.env with your settings"
    @echo "  3. Run 'just dev:all' to start development"

# Setup everything (mise + direnv + project)
setup:all: preflight
    @echo "🔧 Setting up complete development environment..."
    @just setup:mise
    @just setup:direnv
    @just setup
    @echo ""
    @echo "✅ Complete setup finished!"
    @echo ""
    @echo "📝 Next steps:"
    @echo "  1. Restart your shell or run: source ~/.zshrc"
    @echo "  2. cd into this directory (direnv will auto-activate)"
    @echo "  3. Review and update .env.local with your Firebase config"
    @echo "  4. Run 'just dev:all' to start development"

# ============================================================================
# Build Commands
# ============================================================================

# Build all packages with checks (M4 Max parallelized)
build: preflight _check_pnpm _check_node
    #!/usr/bin/env bash
    echo "🔨 Building with {{cpu_cores}} cores"
    TURBO_FORCE_PARALLELISM={{cpu_cores}} turbo run build
    @echo "✅ Build complete"

# Build web app with checks
build:web: preflight _check_pnpm _check_node
    @echo "🔨 Building web app..."
    @pnpm --filter @aip/web build
    @echo "✅ Web app built"

# Build agents API (Docker) with checks
build:api: preflight _check_docker
    @echo "🔨 Building Agents API..."
    @docker compose build agents-api
    @echo "✅ Agents API built"

# ============================================================================
# Testing
# ============================================================================

# Run all tests with checks (M4 Max parallelized)
test: preflight _check_pnpm _check_node _check_uv
    #!/usr/bin/env bash
    echo "🧪 Running tests with {{cpu_cores}} cores"
    TURBO_FORCE_PARALLELISM={{cpu_cores}} turbo run test
    @echo "✅ Tests complete"

# Run tests in watch mode
test:watch: preflight _check_pnpm _check_node
    @echo "🧪 Running tests in watch mode..."
    @pnpm --filter @aip/web test --watch

# Run web app tests with checks
test:web: preflight _check_pnpm _check_node
    @echo "🧪 Running web app tests..."
    @pnpm --filter @aip/web test
    @echo "✅ Web tests complete"

# Run agents API tests with checks
test:api: preflight _check_uv _check_python
    @echo "🧪 Running Agents API tests..."
    @cd apps/agents && uv run pytest
    @echo "✅ API tests complete"

# ============================================================================
# Linting & Formatting
# ============================================================================

# Lint all code with checks
lint: preflight _check_pnpm _check_node _check_uv
    @echo "🔍 Linting all code..."
    @turbo run lint
    @echo "✅ Linting complete"

# Format all code with checks
format: preflight _check_pnpm _check_node _check_uv
    @echo "✨ Formatting all code..."
    @prettier --write "**/*.{ts,tsx,js,jsx,json,md,yml,yaml}"
    @cd apps/agents && uv run ruff format . && cd ../..
    @echo "✅ Formatting complete"

# Check formatting with checks
format:check: preflight _check_pnpm _check_node _check_uv
    @echo "🔍 Checking code formatting..."
    @prettier --check "**/*.{ts,tsx,js,jsx,json,md,yml,yaml}" || (echo "❌ Prettier check failed" && exit 1)
    @cd apps/agents && uv run ruff format --check . || (echo "❌ Ruff check failed" && exit 1)
    @echo "✅ Formatting check passed"

# Type check all TypeScript with checks
type-check: preflight _check_pnpm _check_node
    @echo "🔍 Type checking..."
    @turbo run type-check
    @echo "✅ Type check complete"

# ============================================================================
# Cleanup
# ============================================================================

# Clean all build artifacts
clean:
    @echo "🧹 Cleaning build artifacts..."
    @turbo run clean
    @docker compose down -v 2>/dev/null || true
    @rm -rf node_modules apps/*/node_modules packages/*/node_modules 2>/dev/null || true
    @rm -rf apps/agents/.venv 2>/dev/null || true
    @echo "✅ Clean complete"

# Clean Docker volumes
clean:docker:
    @echo "🧹 Cleaning Docker volumes..."
    @docker compose down -v
    @echo "✅ Docker volumes cleaned"

# Reset development environment
dev-reset:
    @echo "🔄 Resetting development environment..."
    @docker compose down -v
    @rm -rf .direnv/ 2>/dev/null || true
    @mise trust 2>/dev/null || true
    @just setup
    @echo "✅ Development environment reset"

# Troubleshoot development environment
dev-troubleshoot:
    @echo "🔍 Running diagnostics..."
    @just preflight || true
    @echo ""
    @echo "📊 Docker status:"
    @docker ps || echo "Docker not running"
    @echo ""
    @echo "🔌 Port usage:"
    @lsof -i :8081,8080,3000,9099,9199,4000 2>/dev/null || echo "No processes found on checked ports"

# ============================================================================
# Firebase Commands
# ============================================================================

# Deploy to Firebase with checks
firebase:deploy: preflight _check_firebase_cli
    @echo "🚀 Deploying to Firebase..."
    @firebase deploy --only hosting,functions,firestore,storage
    @echo "✅ Firebase deployment complete"

# Deploy only hosting with checks
firebase:deploy:hosting: preflight _check_firebase_cli
    @echo "🚀 Deploying hosting..."
    @firebase deploy --only hosting
    @echo "✅ Hosting deployed"

# Deploy only Firestore rules with checks
firebase:deploy:firestore: preflight _check_firebase_cli
    @echo "🚀 Deploying Firestore rules..."
    @firebase deploy --only firestore
    @echo "✅ Firestore rules deployed"

# ============================================================================
# Health Checks
# ============================================================================

# Check if all services are healthy
health:
    @echo "🏥 Checking service health..."
    @echo ""
    @curl -f http://localhost:8080/health > /dev/null 2>&1 && echo "✅ Agents API: Healthy" || echo "❌ Agents API: Not responding"
    @curl -f http://localhost:3000 > /dev/null 2>&1 && echo "✅ Web App: Healthy" || echo "❌ Web App: Not responding"
    @curl -f http://localhost:4000 > /dev/null 2>&1 && echo "✅ Firebase UI: Healthy" || echo "❌ Firebase UI: Not responding"
    @echo ""

# ============================================================================
# OrbStack Commands
# ============================================================================

# Show OrbStack VM info
orbstack:vm:
    @if command -v orbstack > /dev/null 2>&1; then \
        orbstack info; \
    else \
        echo "❌ OrbStack not installed. Install with: brew install orbstack"; \
    fi

# Reset OrbStack Docker
orbstack:reset:
    @if command -v orbstack > /dev/null 2>&1; then \
        echo "🔄 Resetting OrbStack Docker..."; \
        orbstack reset docker; \
        just docker:rebuild; \
    else \
        echo "❌ OrbStack not installed"; \
    fi

# Show OrbStack machine stats
orbstack:stats:
    @if command -v orbstack > /dev/null 2>&1; then \
        orbstack machine stats; \
    else \
        echo "❌ OrbStack not installed"; \
    fi

# Optimize OrbStack resources
orbstack:optimize:
    @if command -v orbstack > /dev/null 2>&1; then \
        echo "⚙️  Optimizing OrbStack resources..."; \
        orbstack machine stop; \
        orbstack machine start --cpus 12 --memory 16; \
    else \
        echo "❌ OrbStack not installed"; \
    fi

# ============================================================================
# Performance Profiling (M4 Max)
# ============================================================================

# Profile performance with xctrace
perf:profile:
    #!/usr/bin/env bash
    echo "📊 Running performance profile on M4 Max"
    if command -v xcrun > /dev/null 2>&1; then
        xcrun xctrace record --template "Time Profiler" --launch -- just dev:all || echo "⚠️  Profiling requires macOS and Xcode Command Line Tools"
    else
        echo "❌ xcrun not available. Install Xcode Command Line Tools: xcode-select --install"
    fi

# Check memory usage with unified memory awareness
perf:memory:
    #!/usr/bin/env bash
    echo "💾 Memory usage (Unified Memory Architecture)"
    echo "=============================================="
    vm_stat
    echo ""
    echo "📦 Docker stats:"
    docker stats --no-stream 2>/dev/null || echo "Docker not running"

# ============================================================================
# Utilities
# ============================================================================

# Show project status with checks
status:
    @echo "📊 Project Status"
    @echo "=================="
    @node --version 2>/dev/null && echo "✅ Node.js: $(node --version)" || echo "❌ Node.js: Not installed"
    @pnpm --version 2>/dev/null && echo "✅ pnpm: $(pnpm --version)" || echo "❌ pnpm: Not installed"
    @python3 --version 2>/dev/null && echo "✅ Python: $(python3 --version)" || echo "❌ Python: Not installed"
    @uv --version 2>/dev/null && echo "✅ uv: $(uv --version)" || echo "❌ uv: Not installed"
    @docker --version 2>/dev/null && echo "✅ Docker: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)" || echo "❌ Docker: Not installed"
    @firebase --version 2>/dev/null && echo "✅ Firebase CLI: $(firebase --version)" || echo "❌ Firebase CLI: Not installed"
    @echo ""
    @echo "📦 Dependencies:"
    @test -d node_modules && echo "✅ Node modules installed" || echo "❌ Node modules not installed"
    @test -d apps/agents/.venv && echo "✅ Python venv installed" || echo "❌ Python venv not installed"
    @echo ""
    @echo "🔧 Environment:"
    @test -f .env.local && echo "✅ .env.local exists" || echo "⚠️  .env.local missing"
    @test -f apps/agents/.env && echo "✅ apps/agents/.env exists" || echo "⚠️  apps/agents/.env missing"

# Generate CHANGELOG from changesets
changelog: preflight _check_pnpm
    @echo "📝 Generating CHANGELOG..."
    @pnpm changeset version
    @pnpm changeset publish --dry-run

# Create a new changeset
changeset: preflight _check_pnpm
    @pnpm changeset

# ============================================================================
# Documentation
# ============================================================================

# Open documentation
docs:
    @echo "📚 Opening documentation..."
    @open docs/architecture.md 2>/dev/null || xdg-open docs/architecture.md 2>/dev/null || echo "Open docs/architecture.md manually"

# Create new ADR (Architecture Decision Record)
adr:new name:
    @mkdir -p docs/decisions
    @echo "# $(shell echo '{{name}}' | tr '[:lower:]' '[:upper:]' | tr ' ' '-')" > docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md
    @echo "" >> docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md
    @echo "Date: $(shell date +%Y-%m-%d)" >> docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md
    @echo "" >> docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md
    @echo "## Status" >> docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md
    @echo "" >> docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md
    @echo "Proposed" >> docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md
    @echo "" >> docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md
    @echo "## Context" >> docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md
    @echo "" >> docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md
    @echo "## Decision" >> docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md
    @echo "" >> docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md
    @echo "## Consequences" >> docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md
    @echo "Created ADR: docs/decisions/$(shell date +%Y%m%d)-$(shell echo '{{name}}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md"


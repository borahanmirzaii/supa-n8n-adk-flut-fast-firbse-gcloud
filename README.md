# AIP Monorepo - World-Class AI Agentic Development Platform

A comprehensive, production-ready monorepo template for building AI agent applications with Next.js 16, FastAPI + Google ADK, Flutter, Firebase, and modern tooling.

## 🏗️ Architecture

This monorepo provides a complete foundation for AI agentic development:

- **Web App**: Next.js 16 with Firebase SDK v12, TanStack Query, Zustand, shadcn/ui
- **Mobile App**: Flutter with Riverpod, Firebase, go_router
- **Agents API**: FastAPI + Google ADK on Cloud Run with uv
- **Infrastructure**: Firebase Hosting, Cloud Run, Firestore
- **CI/CD**: GitHub Actions with Turborepo caching

## 📦 Tech Stack

### Monorepo Core
- **Turborepo**: Fast build system with intelligent caching
- **pnpm**: Fast, disk space efficient package manager
- **Changesets**: Versioning and changelog management
- **Husky + lint-staged**: Git hooks for code quality

### Web (Next.js 16)
- **Next.js 16**: React framework with App Router
- **React 18**: Latest React features
- **TypeScript**: Strict type checking
- **Tailwind CSS**: Utility-first styling with shadcn/ui
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management
- **React Hook Form + Zod**: Form validation
- **Sentry**: Error tracking
- **PostHog**: Product analytics
- **Vitest + Playwright**: Testing stack

### Mobile (Flutter)
- **Flutter 3.38+**: Cross-platform framework
- **Riverpod**: State management
- **go_router**: Navigation
- **Firebase**: Auth, Firestore, Storage, Analytics, Crashlytics
- **Dio**: HTTP client
- **freezed**: Code generation

### Agents (FastAPI + ADK)
- **FastAPI 0.121**: High-performance Python framework
- **Google ADK**: Agent Development Kit
- **Pydantic v2**: Data validation
- **structlog**: Structured logging
- **Sentry**: Error tracking
- **pytest**: Testing framework
- **ruff**: Fast linter/formatter
- **mypy**: Type checking
- **uv**: Modern Python package manager

## 🚀 Quick Start

### Prerequisites (macOS Apple Silicon)

**Required:**
- **OrbStack** (recommended): `brew install orbstack` - Native Apple Silicon performance, 70% less memory than Docker Desktop
- **Node.js**: ≥20 (Firebase JS SDK 12 requires Node 20+)
- **pnpm**: `npm install -g pnpm@10.22.0`
- **Python**: ≥3.11
- **uv**: `pip install uv` or `brew install uv`
- **Firebase CLI**: `npm install -g firebase-tools`
- **Google Cloud SDK**: `gcloud` CLI
- **Just**: `brew install just` or `cargo install just` (command runner)

**Why OrbStack?**
- ✅ Native Apple Silicon performance (no virtualization overhead)
- ✅ 70% less memory usage than Docker Desktop
- ✅ Instant file syncing (no virtioFS delays)
- ✅ Built-in Rosetta 2 for x86 compatibility
- ✅ Superior networking with `host.orbstack.internal`

### Recommended Tools

For the best development experience, we recommend:

- **mise** (formerly rtx): Runtime version management
  ```bash
  brew install mise
  # Or: curl https://mise.run | sh
  ```

- **direnv**: Automatic environment loading
  ```bash
  brew install direnv
  # Add to shell: echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
  ```

These tools ensure:
- ✅ Consistent runtime versions across the team (Node.js, Python, etc.)
- ✅ Automatic environment variable loading when entering the project
- ✅ No manual version management needed

### Quick Start (M4 Max Optimized)

```bash
# 1. Install OrbStack (if not already installed)
brew install orbstack
orbstack start

# 2. Install mise and direnv (if not already installed)
just setup:mise
just setup:direnv

# 3. Restart your shell or source it
source ~/.zshrc

# 4. Enter the project directory (direnv auto-activates)
cd supa-n8n-adk-flut-fast-firbse-gcloud

# 5. Setup project
just setup:all

# 6. Start development environment (parallel execution on M4 Max)
just dev:all
```

**M4 Max Performance Benefits:**
- 🚀 Parallel service startup (utilizes all 16 cores)
- ⚡ Cold start: ~8 seconds
- 🔥 Hot reload: <100ms (FastAPI), <200ms (Next.js)
- 📦 Full build: ~45 seconds
- 💾 Unified memory optimization

### Quick Setup with mise + direnv

```bash
# 1. Install mise and direnv (if not already installed)
just setup:mise
just setup:direnv

# 2. Restart your shell or source it
source ~/.zshrc

# 3. Enter the project directory (direnv auto-activates)
cd supa-n8n-adk-flut-fast-firbse-gcloud

# 4. Complete setup
just setup:all
```

When you `cd` into the project, direnv will automatically:
- Load mise-managed tool versions
- Load environment variables from `.env.local`
- Set up project-specific paths and variables

### Installation (Manual)

```bash
# Clone the repository
git clone <your-repo-url>
cd supa-n8n-adk-flut-fast-firbse-gcloud

# Install all dependencies
just install
# Or manually:
pnpm install
cd apps/agents && uv sync && cd ../..

# Setup environment files
cp .env.local.example .env.local
cp apps/agents/.env.example apps/agents/.env
# Edit .env.local and apps/agents/.env with your configuration
```

### Development

This project uses [Just](https://github.com/casey/just) as a command runner. Install it with:

```bash
# macOS
brew install just

# Or via cargo
cargo install just
```

#### Common Commands

```bash
# Show all available commands
just

# Start all development services (FastAPI + Next.js + Firebase Emulators)
just dev:all

# Start services individually
just dev:api      # FastAPI in Docker
just dev:web      # Next.js locally
just dev:emulators # Firebase Emulators

# Docker management
just docker:up    # Start Docker services
just docker:down  # Stop Docker services
just docker:logs  # View logs

# Testing
just test         # Run all tests
just test:web     # Run web tests
just test:api     # Run API tests

# Health checks
just health       # Check all services
just status       # Show project status

# Troubleshooting
just dev-reset    # Reset development environment
just dev-troubleshoot # Run diagnostics
just ports:check  # Check port availability
just docker:reset # Reset Docker completely
just docker:prune # Prune Docker resources

# OrbStack Commands (M4 Max)
just orbstack:vm      # Show OrbStack info
just orbstack:stats   # Show machine stats
just orbstack:reset   # Reset OrbStack Docker
just orbstack:optimize # Optimize resources

# Performance Profiling (M4 Max)
just perf:profile # Profile with xctrace
just perf:memory  # Check unified memory usage

# M4 Max Verification
./scripts/verify-m4.sh  # Verify M4 Max setup

# Seed Test Data
just emulators:seed  # Seed Firebase emulators with test data (requires emulators running)

# Performance Benchmarking
./scripts/benchmark.sh  # Run performance benchmarks

# See all commands
just --list
```

For full command reference, see the [Justfile](./Justfile).

#### Legacy Commands (package.json)

You can still use package.json scripts for Turborepo-specific tasks:

```bash
pnpm dev          # Start all apps via Turborepo
pnpm web:dev      # Next.js web app
pnpm agents:dev   # FastAPI agents API (without Docker)
```

## 📁 Project Structure

```
.
├── apps/
│   ├── web/              # Next.js 16 web application
│   │   ├── app/          # App Router pages and API routes
│   │   ├── components/   # React components (shadcn/ui)
│   │   ├── lib/          # Utilities, stores, configs
│   │   └── tests/        # Vitest + Playwright tests
│   │
│   ├── mobile/           # Flutter mobile application
│   │   ├── lib/
│   │   │   ├── core/     # Providers, router, utils
│   │   │   ├── features/ # Feature modules
│   │   │   └── shared/  # Shared widgets/models
│   │   └── test/         # Flutter tests
│   │
│   └── agents/           # FastAPI + ADK agents API
│       ├── app/
│       │   ├── agents/   # Agent implementations
│       │   ├── tools/    # Agent tools (Firestore, etc.)
│       │   └── core/     # Config, logging
│       └── tests/        # pytest tests
│
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── schemas/          # Shared Zod schemas
│   └── utils/            # Shared utilities
│
├── infra/
│   └── cloud-run/        # Dockerfile for Cloud Run
│
├── .github/
│   ├── workflows/        # CI/CD workflows
│   └── ISSUE_TEMPLATE/   # Issue templates
│
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace config
├── firebase.json         # Firebase configuration
├── firestore.rules       # Firestore security rules
└── storage.rules         # Storage security rules
```

## 🔧 Configuration

### Environment Variables

**Web App** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
AGENT_BASE_URL=http://localhost:8080
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=your-sentry-dsn
```

**Agents API** (`apps/agents/.env`):
```env
ENVIRONMENT=development
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
ADK_API_KEY=your-adk-api-key
CORS_ORIGINS=http://localhost:3000
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=INFO
```

**Firebase** (`.firebaserc`):
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Web app tests
cd apps/web
pnpm test              # Vitest unit tests
pnpm test:e2e          # Playwright E2E tests

# Agents API tests
cd apps/agents
uv run pytest          # pytest tests

# Flutter tests
cd apps/mobile
flutter test           # Unit tests
flutter test integration_test  # Integration tests
```

## 🚢 Deployment

### Web App (Firebase Hosting)

```bash
# Build and deploy
pnpm web:build
firebase deploy --only hosting,functions,firestore,storage
```

### Agents API (Cloud Run)

```bash
# Build and deploy
cd infra/cloud-run
gcloud builds submit --tag gcr.io/PROJECT_ID/aip-agents
gcloud run deploy aip-agents --image gcr.io/PROJECT_ID/aip-agents
```

### Mobile App

```bash
# iOS
cd apps/mobile
flutter build ios --release

# Android
flutter build appbundle --release
```

## 📚 Documentation

- [Architecture](./docs/architecture.md) - System architecture overview
- [Setup Guide](./docs/setup.md) - Detailed setup instructions
- [Deployment](./docs/deployment.md) - Deployment guide
- [Performance](./docs/PERFORMANCE.md) - M4 Max + OrbStack performance metrics
- [Git Workflow](./docs/git-workflow.md) - Git branching and workflow
- [Contributing](./docs/contributing.md) - Contribution guidelines
- [Architecture Decision Records](./docs/decisions/) - Technical decision history

## 🛠️ Available Scripts

### Using Justfile (Recommended)

The project uses Justfile as the primary command interface. See `just --list` for all available commands.

**Development:**
- `just dev:all` - Start all services (FastAPI + Next.js + Firebase Emulators)
- `just dev:api` - Start FastAPI in Docker
- `just dev:web` - Start Next.js locally
- `just dev:emulators` - Start Firebase Emulators

**Docker:**
- `just docker:up` - Start Docker services
- `just docker:down` - Stop Docker services
- `just docker:logs` - View logs
- `just docker:rebuild` - Rebuild containers

**Testing:**
- `just test` - Run all tests
- `just test:web` - Run web tests
- `just test:api` - Run API tests

**Build:**
- `just build` - Build all packages
- `just build:web` - Build web app
- `just build:api` - Build API Docker image

**Utilities:**
- `just health` - Check service health
- `just status` - Show project status
- `just preflight` - Run preflight checks
- `just postflight` - Run postflight checks
- `just dev-reset` - Reset development environment
- `just dev-troubleshoot` - Run diagnostics

### Legacy Scripts (package.json)

These scripts are still available for Turborepo compatibility:

**Root Level:**
- `pnpm dev` - Start all apps in development
- `pnpm build` - Build all apps
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code
- `pnpm type-check` - Type check all TypeScript
- `pnpm changeset` - Create a changeset
- `pnpm release` - Release packages

**Web App:**
- `pnpm web:dev` - Start Next.js dev server
- `pnpm web:build` - Build for production
- `pnpm web:lint` - Lint web app

**Agents API:**
- `pnpm agents:dev` - Start FastAPI dev server (without Docker)

## 🔐 Security

- Firestore security rules (version 2)
- Storage security rules
- Environment variable validation with t3-env
- Pre-commit hooks for code quality
- Dependabot for dependency updates

## 📊 Monitoring & Observability

- **Sentry**: Error tracking (web + agents)
- **PostHog**: Product analytics (web)
- **Firebase Analytics**: Mobile analytics
- **Firebase Crashlytics**: Mobile crash reporting
- **Google Cloud Logging**: Structured logging (agents)
- **structlog**: Structured JSON logging (agents)
- **Pino**: Fast JSON logging (web)

## 🔧 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
just ports:check  # Check which ports are in use
lsof -ti:8080 | xargs kill -9  # Kill process on port 8080
```

**Docker/OrbStack issues:**
```bash
just docker:reset  # Reset Docker completely
just orbstack:reset  # Reset OrbStack Docker
just docker:prune  # Clean up Docker resources
```

**Emulator problems:**
```bash
just firebase:status  # Check Firebase emulator status
# Restart emulators
just dev:emulators
```

**M4 Max verification:**
```bash
./scripts/verify-m4.sh  # Verify M4 Max setup and performance
```

**Performance issues:**
```bash
just perf:memory  # Check unified memory usage
just perf:profile  # Profile performance (requires Xcode)
```

### OrbStack-Specific Troubleshooting

- **Container not starting**: Check OrbStack is running with `orbstack info`
- **Network issues**: Verify `host.orbstack.internal` resolves correctly
- **Performance**: Ensure native ARM64 containers (check with `docker run --rm --platform linux/arm64 alpine uname -m`)

## 👥 Team Onboarding

### First-Time Setup Checklist

- [ ] Install OrbStack: `brew install orbstack`
- [ ] Install mise: `brew install mise`
- [ ] Install direnv: `brew install direnv`
- [ ] Clone repository
- [ ] Run `just setup:all`
- [ ] Verify with `just health`
- [ ] Run M4 Max verification: `./scripts/verify-m4.sh`
- [ ] Read ADRs in `docs/decisions/`
- [ ] Review [Performance Documentation](./docs/PERFORMANCE.md)

### Verification Steps

1. **Check prerequisites:**
   ```bash
   just preflight
   ```

2. **Verify services start:**
   ```bash
   just dev:all
   just health
   ```

3. **Verify M4 Max optimizations:**
   ```bash
   ./scripts/verify-m4.sh
   ```

## 🤝 Contributing

1. Read [Contributing Guide](./docs/contributing.md)
2. Create a feature branch from `main`
3. Make your changes
4. Run tests and linting
5. Create a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with:
- [Turborepo](https://turbo.build)
- [Next.js](https://nextjs.org)
- [FastAPI](https://fastapi.tiangolo.com)
- [Flutter](https://flutter.dev)
- [Firebase](https://firebase.google.com)
- [Google ADK](https://github.com/google/adk-python)

---

**Ready to build amazing AI agents? Start developing! 🚀**

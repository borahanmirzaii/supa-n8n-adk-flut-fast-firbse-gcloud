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

### Prerequisites

- **Node.js**: ≥20 (Firebase JS SDK 12 requires Node 20+)
- **pnpm**: `npm install -g pnpm@10.22.0`
- **Python**: ≥3.11
- **uv**: `pip install uv` or `brew install uv`
- **Flutter**: 3.38+ stable
- **Firebase CLI**: `npm install -g firebase-tools`
- **Google Cloud SDK**: `gcloud` CLI

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd supa-n8n-adk-flut-fast-firbse-gcloud

# Install all dependencies
pnpm install

# Setup Python environment
cd apps/agents
uv sync

# Setup Flutter dependencies
cd ../mobile
flutter pub get
```

### Development

```bash
# Start all apps in development mode
pnpm dev

# Or start individually:
pnpm web:dev          # Next.js web app
pnpm agents:dev       # FastAPI agents API
cd apps/mobile && flutter run  # Flutter mobile app
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
- [Git Workflow](./docs/git-workflow.md) - Git branching and workflow
- [Contributing](./docs/contributing.md) - Contribution guidelines

## 🛠️ Available Scripts

### Root Level
- `pnpm dev` - Start all apps in development
- `pnpm build` - Build all apps
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code
- `pnpm type-check` - Type check all TypeScript
- `pnpm changeset` - Create a changeset
- `pnpm release` - Release packages

### Web App
- `pnpm web:dev` - Start Next.js dev server
- `pnpm web:build` - Build for production
- `pnpm web:lint` - Lint web app

### Agents API
- `pnpm agents:dev` - Start FastAPI dev server

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

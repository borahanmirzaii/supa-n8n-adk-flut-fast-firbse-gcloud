# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Justfile for modern command runner with preflight/postflight checks
- Docker Compose setup for local development with hot reload
- Firebase Emulator integration for local dev (Auth, Firestore, Storage)
- mise and direnv integration for automatic tool version management and environment loading
- Architecture Decision Records (ADRs) documentation
- CHANGELOG.md for tracking changes
- Development Dockerfile with uv support
- Comprehensive preflight/postflight health checks
- Error recovery commands (dev-reset, dev-troubleshoot)
- Environment file templates (.env.local.example, apps/agents/.env.example)

### Changed
- Simplified local dev setup (removed Redis, n8n for now)
- Focus on Next.js + FastAPI only (Flutter mobile app set aside)
- Firestore emulator port changed from 8080 to 8081 (avoid conflict with FastAPI)
- FastAPI Firebase Admin SDK now supports emulator mode
- Next.js Firebase client now connects to emulators in development mode

### Fixed
- Firestore emulator port conflict (8080 → 8081)

## [0.1.0] - 2025-01-XX

### Added
- Initial monorepo setup with Turborepo
- Next.js 16 web application
- FastAPI agents API with Google ADK
- Flutter mobile application
- Shared packages (types, schemas, utils)
- Firebase integration (Auth, Firestore, Storage)
- CI/CD setup with GitHub Actions
- Comprehensive documentation

[Unreleased]: https://github.com/your-org/supa-n8n-adk-flut-fast-firbse-gcloud/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-org/supa-n8n-adk-flut-fast-firbse-gcloud/releases/tag/v0.1.0


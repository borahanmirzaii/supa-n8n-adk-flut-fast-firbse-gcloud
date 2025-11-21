# ADR 0004: Docker for FastAPI local development

Date: 2025-01-XX

## Status

Accepted

## Context

FastAPI backend needs to run locally. Options:

1. **Run directly with `uv`**: Simple, but environment differences between devs
2. **Docker**: Consistent environment, mimics production (Cloud Run)
3. **Docker Compose**: Orchestrates multiple services

Since production uses Cloud Run (containerized), local Docker setup mimics production better.

## Decision

Use Docker Compose for FastAPI local development:
- FastAPI runs in Docker container
- Hot reload enabled via volume mounts
- Uses `uv` inside container (same as production)
- Connects to Firebase Emulators on host via `host.docker.internal`

Next.js runs locally (not in Docker) for fastest iteration.

## Consequences

### Positive

- Consistent environment across developers
- Mimics production (Cloud Run)
- Easy to add more services later (Redis, n8n, etc.)
- Isolated dependencies

### Negative

- Requires Docker/OrbStack installation
- Slightly slower startup than native
- Need to handle host networking for emulators

### Implementation

- Dockerfile.dev for development
- docker-compose.yml for orchestration
- Volume mounts for hot reload
- Environment variables for emulator connection


# ADR 0003: Simplified stack: Next.js + FastAPI only

Date: 2025-01-XX

## Status

Accepted

## Context

Initial monorepo included:
- Next.js web app
- Flutter mobile app
- FastAPI agents API
- n8n workflow automation
- Redis for rate limiting

For initial development focus, we need to prioritize and simplify.

## Decision

Focus on web application first:
- **Keep**: Next.js (web UI) + FastAPI (backend with ADK)
- **Defer**: Flutter mobile app (set aside for now)
- **Remove from local dev**: n8n, Redis (not needed for MVP)

Rationale:
- Web app is primary interface for MVP
- FastAPI with ADK is core backend functionality
- Mobile app can be added later when web app is stable
- Rate limiting uses in-memory storage (slowapi) - no Redis needed for local dev
- n8n workflows can be added when needed

## Consequences

### Positive

- Faster iteration (fewer services to manage)
- Simpler local development setup
- Focus on core functionality
- Easier onboarding for new developers

### Negative

- Mobile app development paused
- No workflow automation yet
- Rate limiting limited to single instance (fine for local dev)

### Future

- Mobile app will be re-integrated when web app is stable
- n8n can be added when workflow automation is needed
- Redis can be added when distributed rate limiting is required


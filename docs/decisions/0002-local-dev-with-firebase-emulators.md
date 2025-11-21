# ADR 0002: Local development with Firebase Emulators

Date: 2025-01-XX

## Status

Accepted

## Context

We need to develop locally while mimicking production environment. Production uses:
- Firebase: Auth, Firestore, Storage
- Google Cloud: Cloud Run (FastAPI), Firestore (same as Firebase)

Options:
1. **Use production Firebase**: Risk of data corruption, costs, slow iteration
2. **Use Firebase Emulators**: Free, fast, mimics production, isolated data
3. **Mock services**: Too much work, doesn't test real Firebase behavior

## Decision

We will use Firebase Emulators for local development:
- Auth Emulator (port 9099)
- Firestore Emulator (port 8081, avoiding conflict with FastAPI on 8080)
- Storage Emulator (port 9199)
- Firebase UI (port 4000)

FastAPI will connect to Firestore Emulator via `FIRESTORE_EMULATOR_HOST` environment variable.

## Consequences

### Positive

- Free local development (no Firebase costs)
- Fast iteration (no network latency)
- Isolated test data (each developer has own data)
- Mimics production behavior
- Can test Firestore security rules locally

### Negative

- Requires Firebase CLI installation
- Need to configure emulator connection in code
- Some Firebase features may not be available in emulators

### Implementation

- Update `firebase.json` with emulator ports
- Configure FastAPI to use `FIRESTORE_EMULATOR_HOST`
- Configure Next.js to use `connectFirestoreEmulator`, `connectAuthEmulator`
- Document in README and setup guide


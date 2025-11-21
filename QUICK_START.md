# Quick Start Guide

Get everything running in 5 minutes!

## Prerequisites Check

```bash
# Run preflight checks
just preflight

# If OrbStack not installed:
brew install orbstack
orbstack start
```

## Step 1: Environment Setup (2 minutes)

```bash
# Create environment files
cp .env.local.example .env.local
cp apps/agents/.env.example apps/agents/.env

# Edit .env.local - minimal config for emulators:
# NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
# (rest can be dummy values for local dev)

# Install dependencies
just install
```

## Step 2: Start Everything (1 minute)

```bash
# Start all services
just dev:all

# Wait for postflight checks to complete
# You should see:
# ✅ Agents API is healthy
# ✅ Web App is responding
# ✅ Firebase Emulators UI is accessible
```

## Step 3: Verify in Browser (1 minute)

Open these URLs:

1. **Web App**: http://localhost:3000
2. **FastAPI Docs**: http://localhost:8080/docs
3. **Firebase UI**: http://localhost:4000

## Step 4: Seed Test Data (Optional, 30 seconds)

```bash
# In a new terminal (emulators should be running)
just emulators:seed

# Test credentials:
# Email: dev@test.com
# Password: testpass123
```

## Quick Commands Reference

```bash
just d          # Start everything (alias)
just h          # Check health
just docker:logs # View FastAPI logs
just dev-reset  # Reset everything
```

## Troubleshooting

**Services not starting?**
```bash
just ports:check    # Check port conflicts
just dev-troubleshoot  # Run diagnostics
```

**Need to restart?**
```bash
just dev:restart  # Quick restart
```

**Check M4 Max setup?**
```bash
./scripts/verify-m4.sh
```

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [docs/PERFORMANCE.md](./docs/PERFORMANCE.md) for performance tips
- Review [docs/decisions/](./docs/decisions/) for architecture decisions


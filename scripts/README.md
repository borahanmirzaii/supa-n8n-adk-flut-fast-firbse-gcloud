# Scripts Directory

This directory contains utility scripts for development, testing, and maintenance.

## Available Scripts

### `verify-m4.sh`
Verifies M4 Max + OrbStack setup, checks architecture, OrbStack installation, and container configuration.

**Usage:**
```bash
./scripts/verify-m4.sh
```

**What it checks:**
- Apple Silicon architecture (arm64)
- OrbStack installation and status
- Native ARM64 container execution
- Performance benchmarks
- Memory and thermal status

### `benchmark.sh`
Runs performance benchmarks and saves results to `benchmarks/` directory.

**Usage:**
```bash
./scripts/benchmark.sh
```

**What it measures:**
- Cold start time (all services)
- API response time
- Build performance
- System information
- Docker stats
- OrbStack detection

**Output:**
Results are saved as JSON files in `benchmarks/` directory with timestamps.

### `firebase/seed-emulators.js`
Seeds Firebase Emulators with test data for local development.

**Prerequisites:**
```bash
# Install firebase-admin for Node.js
npm install -g firebase-admin
# Or add to project dependencies
```

**Usage:**
```bash
# Start emulators first (in one terminal)
just dev:emulators

# In another terminal, seed the data
just emulators:seed

# Or manually:
firebase emulators:exec "node scripts/firebase/seed-emulators.js" --only auth,firestore
```

**What it creates:**
- Test users (dev@test.com, admin@test.com, user@test.com)
- Test agents (Customer Support, Code Review, Content Writer)
- Test conversations/sessions

**Test Credentials:**
- Email: `dev@test.com` / Password: `testpass123`
- Email: `admin@test.com` / Password: `testpass123`

## Adding New Scripts

When adding new scripts:

1. **Make them executable**: `chmod +x scripts/your-script.sh`
2. **Add shebang**: `#!/usr/bin/env bash` or `#!/usr/bin/env node`
3. **Document usage**: Add to this README
4. **Add to Justfile**: If it's a common operation, add a `just` command
5. **Handle errors**: Use `set -euo pipefail` for bash scripts

## Script Conventions

- **Bash scripts**: Use `set -euo pipefail` for error handling
- **Node scripts**: Use ES modules or CommonJS consistently
- **Error messages**: Use emoji prefixes (✅, ❌, ⚠️) for clarity
- **Output**: Be verbose and informative
- **Exit codes**: Return appropriate exit codes (0 for success, non-zero for failure)


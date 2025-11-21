# ADR 0005: Use mise and direnv for development environment

Date: 2025-01-XX

## Status

Accepted

## Context

We need consistent development environments across the team. Common issues:
- Different Node.js/Python versions causing "works on my machine" problems
- Forgetting to load environment variables
- Manual tool version management
- Inconsistent PATH configurations

Options considered:
1. **Manual installation**: Everyone installs tools manually (error-prone)
2. **Docker only**: Everything in containers (slower iteration, complex)
3. **mise + direnv**: Automatic version management + env loading (best DX)
4. **asdf**: Similar to mise but older, less active development

## Decision

Use **mise** (formerly rtx) and **direnv**:

- **mise**: Manages runtime versions (Node.js, Python, pnpm, uv, etc.)
  - Single `.mise.toml` file specifies all versions
  - Auto-installs tools when entering directory
  - Fast, written in Rust

- **direnv**: Automatically loads environment variables
  - `.envrc` file loads env vars when entering directory
  - Integrates with mise
  - Unloads when leaving directory

## Consequences

### Positive

- Consistent tool versions across team
- Automatic environment setup (no manual steps)
- Faster onboarding (new devs just `cd` into project)
- No "works on my machine" issues
- Version pinned in `.mise.toml` (version controlled)

### Negative

- Team members need to install mise + direnv (one-time)
- Requires shell hook setup (one-time)
- `.envrc` needs to be trusted (`direnv allow`)

### Implementation

- `.mise.toml` specifies all tool versions
- `.envrc` loads environment and activates mise
- Justfile checks for mise/direnv in preflight
- README documents setup process
- Optional: Can still work without mise/direnv (manual setup)

## References

- [mise documentation](https://mise.jdx.dev)
- [direnv documentation](https://direnv.net)


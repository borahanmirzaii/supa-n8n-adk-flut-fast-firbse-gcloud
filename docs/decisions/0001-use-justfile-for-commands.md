# ADR 0001: Use Justfile for command runner

Date: 2025-01-XX

## Status

Accepted

## Context

We need a consistent way to run commands across the monorepo. Options considered:

1. **package.json scripts**: Already in use, but becomes unwieldy with many commands
2. **Makefile**: Traditional but has syntax quirks and cross-platform issues
3. **Shell scripts**: Hard to maintain, no built-in help system
4. **Justfile**: Modern, cross-platform, has built-in help, simple syntax

The project has many common tasks:
- Starting development servers
- Running tests
- Building Docker containers
- Managing Firebase deployments
- Health checks
- Documentation generation

## Decision

We will use [Just](https://github.com/casey/just) as our command runner.

Just provides:
- Simple, readable syntax
- Built-in help (`just --list`)
- Cross-platform support (macOS, Linux, Windows)
- Easy to install (`brew install just` or `cargo install just`)
- Better than Makefiles for command running (not build systems)

## Consequences

### Positive

- Single source of truth for all project commands
- Easy to discover commands (`just --list`)
- Consistent command interface across team
- Self-documenting (commands show help)
- Can still use package.json scripts for Turborepo-specific tasks

### Negative

- Team members need to install Just (one-time setup)
- Another tool to learn (though syntax is simple)

### Migration

- Keep package.json scripts for Turborepo tasks (`build`, `test`, `lint`)
- Use Justfile for development workflows (`dev:all`, `docker:up`, etc.)
- Document in README that Just is required


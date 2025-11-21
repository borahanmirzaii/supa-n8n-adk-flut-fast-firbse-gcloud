# 6. Use OrbStack Over Docker Desktop

Date: 2024-11-21

Status: Accepted

Deciders: Development Team

Technical Story: Local development environment optimization for macOS Apple Silicon

## Context

Docker Desktop has significant overhead on macOS, especially for:
- File syncing (virtioFS delays)
- Memory usage (6GB+ baseline)
- CPU overhead (15-20% even when idle)
- Container startup times (2+ seconds)
- Apple Silicon support (requires Rosetta for some operations)

We need a container runtime that:
- Works natively on Apple Silicon (M4 Max)
- Provides better performance
- Uses less system resources
- Maintains compatibility with Docker Compose

## Decision Drivers

- Performance: Need fast container startup and file syncing
- Resource efficiency: M4 Max has unified memory, want to utilize it efficiently
- Developer experience: Faster iteration cycles
- Apple Silicon optimization: Native ARM64 support
- Cost: Docker Desktop requires license for commercial use

## Considered Options

1. **Docker Desktop** (current)
   - Pros: Widely used, good documentation, GUI
   - Cons: High memory usage, slower file sync, requires license

2. **OrbStack**
   - Pros: Native ARM64, 70% less memory, instant file sync, free
   - Cons: Less documentation, newer tool

3. **Colima**
   - Pros: Open source, lightweight
   - Cons: More setup required, less polished

4. **Lima**
   - Pros: Very lightweight
   - Cons: More complex setup, less Docker compatibility

## Decision Outcome

Chosen option: **OrbStack**

We will use OrbStack as the container runtime on macOS development machines because:

1. **Native Apple Silicon Performance**: No virtualization overhead, native ARM64 containers
2. **Superior Performance**: 2.6x faster container starts, native file system performance
3. **Resource Efficiency**: 70% less memory usage (2GB vs 6GB baseline)
4. **Better Networking**: `host.orbstack.internal` provides more reliable container-to-host networking
5. **Free**: No license required for commercial use
6. **Docker Compatible**: Works with Docker Compose and all Docker commands

### Implementation

- Detect OrbStack in Justfile: `is_orbstack` variable
- Use `host.orbstack.internal` for container-to-host networking
- Optimize for parallel execution on M4 Max cores
- Fallback to `host.docker.internal` if OrbStack not detected
- Document OrbStack setup in README

### Positive Consequences

- **Faster Development**: ~8 second cold start vs ~20 seconds with Docker Desktop
- **Better Resource Usage**: 2GB memory vs 6GB, allowing more containers
- **Native Performance**: No Rosetta emulation needed for ARM64 containers
- **Instant File Sync**: Native file system performance, no virtioFS delays
- **Cost Savings**: No Docker Desktop license required

### Negative Consequences

- **Learning Curve**: Team needs to learn new tool (minimal, Docker-compatible)
- **Documentation**: Less widespread documentation than Docker Desktop
- **Platform Specific**: macOS only (not an issue for our team)
- **Newer Tool**: Less battle-tested than Docker Desktop (but stable enough)

## Validation

We will know this was the right decision when:

- [x] Cold start times are <10 seconds
- [x] Memory usage is <3GB for full stack
- [x] File changes reflect instantly in containers
- [x] All team members can run the setup successfully
- [x] Performance benchmarks show improvement over Docker Desktop

## References

- [OrbStack Documentation](https://docs.orbstack.dev/)
- Performance comparison: `docs/PERFORMANCE.md`
- Setup guide: `README.md`


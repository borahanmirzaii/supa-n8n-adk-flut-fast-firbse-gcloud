#!/usr/bin/env bash
# M4 Max + OrbStack Verification Script
# Verifies architecture, OrbStack installation, ARM64 containers, and performance

set -euo pipefail

echo "🍎 Verifying M4 Max + OrbStack Setup"
echo "====================================="
echo ""

# Check architecture
echo "📐 Checking architecture..."
if [[ $(uname -m) != "arm64" ]]; then
    echo "❌ Not running on Apple Silicon (found: $(uname -m))"
    exit 1
fi
echo "✅ Running on Apple Silicon (arm64)"
echo ""

# Check OrbStack
echo "🚀 Checking OrbStack..."
if ! command -v orbstack &> /dev/null; then
    echo "❌ OrbStack not installed"
    echo "   Install with: brew install orbstack"
    exit 1
fi
echo "✅ OrbStack installed ($(orbstack --version 2>/dev/null || echo 'version unknown'))"
echo ""

# Verify container architecture
echo "🐳 Verifying container architecture..."
if docker run --rm --platform linux/arm64 alpine uname -m 2>/dev/null | grep -q aarch64; then
    echo "✅ Containers running native ARM64"
else
    echo "⚠️  Containers may be using Rosetta emulation"
fi
echo ""

# Performance benchmark
echo "📊 Running M4 Max benchmark..."
echo "  Cold start test..."
time docker run --rm --platform linux/arm64 alpine echo "Cold start test" > /dev/null 2>&1 || true
echo ""

# Memory check
echo "💾 Unified Memory Status:"
if command -v memory_pressure > /dev/null 2>&1; then
    memory_pressure 2>/dev/null || echo "  (memory_pressure not available)"
else
    echo "  Memory pressure tool not available"
fi
echo ""

# Thermal check (if available)
echo "🌡️  Thermal status:"
if command -v powermetrics > /dev/null 2>&1; then
    sudo powermetrics --samplers smc -i1 -n1 2>/dev/null | grep -i "temperature" || echo "  (thermal data not available)"
else
    echo "  powermetrics not available (requires sudo)"
fi
echo ""

# CPU cores
echo "🔢 CPU Information:"
echo "  Cores: $(sysctl -n hw.ncpu)"
echo "  Architecture: $(uname -m)"
echo ""

# Docker info
echo "🐳 Docker Information:"
if docker info > /dev/null 2>&1; then
    echo "  Status: Running"
    echo "  Platform: $(docker version --format '{{.Server.Arch}}' 2>/dev/null || echo 'unknown')"
else
    echo "  Status: Not running"
fi
echo ""

# OrbStack specific checks
echo "🚀 OrbStack Specific:"
if command -v orbstack > /dev/null 2>&1; then
    if orbstack info > /dev/null 2>&1; then
        echo "  Status: Running"
        orbstack info 2>/dev/null | head -n 5 || true
    else
        echo "  Status: Not running"
    fi
fi
echo ""

echo "✅ Verification complete!"
echo ""
echo "📝 Summary:"
echo "  • Architecture: $(uname -m)"
echo "  • CPU Cores: $(sysctl -n hw.ncpu)"
echo "  • OrbStack: $(command -v orbstack > /dev/null 2>&1 && echo 'Installed' || echo 'Not installed')"
echo "  • Docker: $(docker info > /dev/null 2>&1 && echo 'Running' || echo 'Not running')"


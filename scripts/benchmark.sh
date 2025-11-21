#!/usr/bin/env bash
# M4 Max Performance Baseline Script
# Runs performance benchmarks and saves results

set -euo pipefail

RESULTS_DIR="benchmarks"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="${RESULTS_DIR}/${TIMESTAMP}.json"

mkdir -p "${RESULTS_DIR}"

echo "📊 M4 Max Performance Baseline"
echo "================================"
echo ""

# Check prerequisites
if ! command -v just > /dev/null 2>&1; then
    echo "❌ just not found. Install with: brew install just"
    exit 1
fi

if ! command -v docker > /dev/null 2>&1; then
    echo "❌ Docker/OrbStack not found"
    exit 1
fi

# Initialize results
RESULTS="{"

# 1. Cold start benchmark
echo "1️⃣  Testing cold start..."
echo "   Stopping services..."
just docker:down > /dev/null 2>&1 || true
pkill -f "firebase emulators" > /dev/null 2>&1 || true
pkill -f "next dev" > /dev/null 2>&1 || true
sleep 2

echo "   Starting all services..."
COLD_START_START=$(date +%s.%N)
just dev:all > /dev/null 2>&1 &
DEV_PID=$!

# Wait for services to be healthy
echo "   Waiting for services to be ready..."
for i in {1..60}; do
    if curl -f http://localhost:8080/health > /dev/null 2>&1 && \
       curl -f http://localhost:3000 > /dev/null 2>&1 && \
       curl -f http://localhost:4000 > /dev/null 2>&1; then
        COLD_START_END=$(date +%s.%N)
        COLD_START_TIME=$(echo "$COLD_START_END - $COLD_START_START" | bc)
        echo "   ✅ Cold start: ${COLD_START_TIME}s"
        RESULTS="${RESULTS}\"cold_start_seconds\": ${COLD_START_TIME},"
        break
    fi
    sleep 1
done

if [ $i -eq 60 ]; then
    echo "   ⚠️  Cold start timeout (>60s)"
    RESULTS="${RESULTS}\"cold_start_seconds\": null,"
fi

sleep 5

# 2. API response time
echo ""
echo "2️⃣  Testing API response time..."
if command -v ab > /dev/null 2>&1; then
    API_RESPONSE=$(ab -n 100 -c 10 http://localhost:8080/health 2>&1 | grep "Time per request" | head -n1 | awk '{print $4}')
    echo "   ✅ Average response time: ${API_RESPONSE}ms"
    RESULTS="${RESULTS}\"api_avg_response_ms\": ${API_RESPONSE},"
else
    echo "   ⚠️  Apache Bench (ab) not installed, skipping API response test"
    RESULTS="${RESULTS}\"api_avg_response_ms\": null,"
fi

# 3. Build performance
echo ""
echo "3️⃣  Testing build performance..."
BUILD_START=$(date +%s.%N)
just build > /dev/null 2>&1 || true
BUILD_END=$(date +%s.%N)
BUILD_TIME=$(echo "$BUILD_END - $BUILD_START" | bc)
echo "   ✅ Build time: ${BUILD_TIME}s"
RESULTS="${RESULTS}\"build_seconds\": ${BUILD_TIME},"

# 4. System info
echo ""
echo "4️⃣  Collecting system information..."
CPU_CORES=$(sysctl -n hw.ncpu 2>/dev/null || echo "unknown")
ARCH=$(uname -m)
RESULTS="${RESULTS}\"system\": {"
RESULTS="${RESULTS}\"cpu_cores\": \"${CPU_CORES}\","
RESULTS="${RESULTS}\"architecture\": \"${ARCH}\","
RESULTS="${RESULTS}\"platform\": \"$(uname -s)\""
RESULTS="${RESULTS}},"

# 5. Docker stats
echo ""
echo "5️⃣  Collecting Docker stats..."
if docker ps > /dev/null 2>&1; then
    DOCKER_STATS=$(docker stats --no-stream --format "{\"container\":\"{{.Container}}\",\"cpu\":\"{{.CPUPerc}}\",\"memory\":\"{{.MemUsage}}\"}" 2>/dev/null | head -n1 || echo "{}")
    RESULTS="${RESULTS}\"docker_stats\": ${DOCKER_STATS},"
else
    RESULTS="${RESULTS}\"docker_stats\": null,"
fi

# 6. OrbStack detection
echo ""
echo "6️⃣  Checking OrbStack..."
if command -v orbstack > /dev/null 2>&1; then
    ORBSTACK_VERSION=$(orbstack --version 2>/dev/null || echo "unknown")
    RESULTS="${RESULTS}\"orbstack\": {\"installed\": true, \"version\": \"${ORBSTACK_VERSION}\"},"
else
    RESULTS="${RESULTS}\"orbstack\": {\"installed\": false},"
fi

# Clean up results (remove trailing comma)
RESULTS="${RESULTS%,}"
RESULTS="${RESULTS}}"

# Save results
echo "$RESULTS" | jq . > "${RESULTS_FILE}" 2>/dev/null || echo "$RESULTS" > "${RESULTS_FILE}"

echo ""
echo "✅ Benchmark complete!"
echo "📁 Results saved to: ${RESULTS_FILE}"
echo ""
echo "📊 Summary:"
echo "$RESULTS" | jq . 2>/dev/null || echo "$RESULTS"

# Cleanup
kill $DEV_PID > /dev/null 2>&1 || true


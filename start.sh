#!/usr/bin/env bash

# ==============================================================================
# GlobeTrotter - Unified Fullstack Runner
# Runs both the Spring Boot Backend (port 8080) and Vite Frontend (port 5173)
# with a single terminal command.
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "================================================================="
echo " 🌍 Starting GlobeTrotter Fullstack Application"
echo "================================================================="

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    echo "🛑 Shutting down GlobeTrotter services..."
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    wait 2>/dev/null || true
    echo "✅ All services stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Start Spring Boot Backend
echo "🚀 [1/2] Starting Spring Boot backend on port 8080..."
if [ -f "target/globetrotter-0.0.1-SNAPSHOT.jar" ]; then
    java -jar target/globetrotter-0.0.1-SNAPSHOT.jar &
    BACKEND_PID=$!
else
    mvn spring-boot:run &
    BACKEND_PID=$!
fi

# Wait for Backend to be healthy on port 8080
echo "⏳ Waiting for backend to start on http://localhost:8080..."
MAX_RETRIES=60
COUNT=0
BACKEND_UP=0

while [ $COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:8080/api/cities > /dev/null 2>&1; then
        BACKEND_UP=1
        break
    fi
    sleep 1
    COUNT=$((COUNT + 1))
done

if [ $BACKEND_UP -eq 1 ]; then
    echo " Backend is up and healthy!"
else
    echo "⚠️ Backend took longer than expected, continuing with frontend startup..."
fi

# 2. Start Vite Frontend
echo " [2/2] Starting React + Vite frontend on port 5173..."
npm run dev -- --host &
FRONTEND_PID=$!

echo ""
echo "================================================================="
echo " GlobeTrotter is running!"
echo " Frontend App:     http://localhost:5173"
echo " Backend API:      http://localhost:8080/api"
echo " Public Shared:    http://localhost:5173/share/{token}"
echo " Admin Dashboard:  http://localhost:5173/admin"
echo "================================================================="
echo "Press Ctrl+C to stop all services."
echo ""

# Wait for background processes
wait "$BACKEND_PID" "$FRONTEND_PID"

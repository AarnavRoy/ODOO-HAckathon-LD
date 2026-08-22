#!/usr/bin/env bash

# ==============================================================================
# GlobeTrotter - Production Runner
# Runs Spring Boot Backend which serves the built React static files.
# ==============================================================================

set -e

echo "================================================================="
echo " 🌍 Starting GlobeTrotter (Production Mode)"
echo "================================================================="

# 1. Start Spring Boot Backend (Foreground)
echo "🚀 Starting Spring Boot backend..."

if [ -f "target/globetrotter-0.0.1-SNAPSHOT.jar" ]; then
    # Run JAR in foreground (NO '&')
    java -jar target/globetrotter-0.0.1-SNAPSHOT.jar
else
    echo "❌ Error: JAR file not found. Ensure 'mvn package' ran successfully."
    exit 1
fi   

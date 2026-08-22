#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "🧪 Running Fullstack End-to-End API Test Suite"
echo "=========================================================="

APP_PID=""
cleanup() {
    if [ -n "$APP_PID" ] && kill -0 "$APP_PID" 2>/dev/null; then
        kill "$APP_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

# 1. Start backend in background if not already running
if curl -s http://localhost:8080/api/cities > /dev/null 2>&1; then
    echo "✅ Backend already running on http://localhost:8080"
else
    echo "🚀 Starting backend for test verification..."
    java -jar target/globetrotter-0.0.1-SNAPSHOT.jar > /tmp/backend-test.log 2>&1 &
    APP_PID=$!
    
    echo "⏳ Waiting for backend to be ready..."
    for i in {1..60}; do
        if curl -s http://localhost:8080/api/cities > /dev/null 2>&1; then
            echo "✅ Backend ready after $i seconds!"
            break
        fi
        sleep 1
    done
fi

BASE_URL="http://localhost:8080/api"

# Helper for test reporting
pass_count=0
fail_count=0

assert_eq() {
    local test_name="$1"
    local expected="$2"
    local actual="$3"
    if [ "$expected" == "$actual" ]; then
        echo "  ✅ [PASS] $test_name"
        pass_count=$((pass_count + 1))
    else
        echo "  ❌ [FAIL] $test_name (Expected '$expected', got '$actual')"
        fail_count=$((fail_count + 1))
    fi
}

echo ""
echo "--- [1] Testing Auth Flow (B1 / F1) ---"
TIMESTAMP=$(date +%s)
SIGNUP_RES=$(curl -s -X POST "$BASE_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test User $TIMESTAMP\",\"email\":\"user$TIMESTAMP@example.com\",\"password\":\"password123\"}")

TOKEN=$(echo "$SIGNUP_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
assert_eq "Signup returns JWT token" "true" "$([ -n "$TOKEN" ] && echo "true" || echo "false")"

LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"user$TIMESTAMP@example.com\",\"password\":\"password123\"}")
LOGIN_TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
assert_eq "Login returns JWT token" "true" "$([ -n "$LOGIN_TOKEN" ] && echo "true" || echo "false")"

ME_RES=$(curl -s -X GET "$BASE_URL/auth/me" -H "Authorization: Bearer $TOKEN")
assert_eq "Get Current User returns profile" "true" "$(echo "$ME_RES" | grep -q "user$TIMESTAMP@example.com" && echo "true" || echo "false")"

UPDATE_RES=$(curl -s -X PUT "$BASE_URL/users/me" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Updated User\",\"languagePreference\":\"French\"}")
assert_eq "Update User returns updated name" "true" "$(echo "$UPDATE_RES" | grep -q "Updated User" && echo "true" || echo "false")"

echo ""
echo "--- [2] Testing Dashboard (B1 / F1) ---"
DASH_RES=$(curl -s -X GET "$BASE_URL/dashboard" -H "Authorization: Bearer $TOKEN")
assert_eq "Dashboard returns recentTrips & budgetHighlights" "true" "$(echo "$DASH_RES" | grep -q "recentTrips" && echo "$DASH_RES" | grep -q "budgetHighlights" && echo "true" || echo "false")"

echo ""
echo "--- [3] Testing Cities & Activities Discovery (B2 / F2) ---"
CITIES_RES=$(curl -s -X GET "$BASE_URL/cities?search=Paris")
assert_eq "Search cities by name returns Paris" "true" "$(echo "$CITIES_RES" | grep -q "Paris" && echo "true" || echo "false")"

PARIS_ID=$(echo "$CITIES_RES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
ACT_RES=$(curl -s -X GET "$BASE_URL/cities/$PARIS_ID/activities?category=SIGHTSEEING")
assert_eq "Filter city activities by category" "true" "$(echo "$ACT_RES" | grep -q "SIGHTSEEING" && echo "true" || echo "false")"
EIFFEL_ACT_ID=$(echo "$ACT_RES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

echo ""
echo "--- [4] Testing Trip Management & Stops (B1 / F1) ---"
TRIP_RES=$(curl -s -X POST "$BASE_URL/trips" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Grand Euro Journey\",\"startDate\":\"2026-10-01\",\"endDate\":\"2026-10-05\",\"description\":\"Vacation\",\"budgetLimit\":500.0}")
TRIP_ID=$(echo "$TRIP_RES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
assert_eq "Create Trip returns Trip ID" "true" "$([ -n "$TRIP_ID" ] && echo "true" || echo "false")"

STOP_RES=$(curl -s -X POST "$BASE_URL/trips/$TRIP_ID/stops" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"cityId\":$PARIS_ID,\"startDate\":\"2026-10-01\",\"endDate\":\"2026-10-03\",\"transportCost\":60.0,\"accommodationCost\":150.0}")
STOP_ID=$(echo "$STOP_RES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
assert_eq "Add Stop returns Stop ID" "true" "$([ -n "$STOP_ID" ] && echo "true" || echo "false")"

echo ""
echo "--- [5] Testing Trip Activities (B2 / F2) ---"
TA_RES=$(curl -s -X POST "$BASE_URL/stops/$STOP_ID/activities" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"activityId\":$EIFFEL_ACT_ID,\"dayDate\":\"2026-10-01\",\"startTime\":\"10:00\",\"cost\":30.0,\"notes\":\"Morning tour\"}")
TA_ID=$(echo "$TA_RES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
assert_eq "Add Trip Activity returns ID" "true" "$([ -n "$TA_ID" ] && echo "true" || echo "false")"

echo ""
echo "--- [6] Testing Itinerary & Budget Calculations (B2 / F2) ---"
ITIN_RES=$(curl -s -X GET "$BASE_URL/trips/$TRIP_ID/itinerary" -H "Authorization: Bearer $TOKEN")
assert_eq "Itinerary contains grouped days and activities" "true" "$(echo "$ITIN_RES" | grep -q "2026-10-01" && echo "$ITIN_RES" | grep -q "Paris" && echo "true" || echo "false")"

BUDGET_RES=$(curl -s -X GET "$BASE_URL/trips/$TRIP_ID/budget" -H "Authorization: Bearer $TOKEN")
assert_eq "Budget contains total, byCategory & byDay" "true" "$(echo "$BUDGET_RES" | grep -q "byCategory" && echo "$BUDGET_RES" | grep -q "transport" && echo "true" || echo "false")"

echo ""
echo "--- [7] Testing Sharing & Deep Copy (B2 / F2) ---"
SHARE_RES=$(curl -s -X POST "$BASE_URL/trips/$TRIP_ID/share" -H "Authorization: Bearer $TOKEN")
SHARE_TOKEN=$(echo "$SHARE_RES" | grep -o '"shareToken":"[^"]*' | cut -d'"' -f4)
assert_eq "Share Trip returns shareToken" "true" "$([ -n "$SHARE_TOKEN" ] && echo "true" || echo "false")"

PUBLIC_RES=$(curl -s -X GET "$BASE_URL/public/trips/$SHARE_TOKEN")
assert_eq "Public Shared Trip returns trip details unauthenticated" "true" "$(echo "$PUBLIC_RES" | grep -q "Grand Euro Journey" && echo "true" || echo "false")"

# Create User 2 to copy trip
USER2_RES=$(curl -s -X POST "$BASE_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Second User\",\"email\":\"user2_$TIMESTAMP@example.com\",\"password\":\"password123\"}")
USER2_TOKEN=$(echo "$USER2_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

COPY_RES=$(curl -s -X POST "$BASE_URL/public/trips/$SHARE_TOKEN/copy" -H "Authorization: Bearer $USER2_TOKEN")
assert_eq "Authenticated Copy Shared Trip succeeds" "true" "$(echo "$COPY_RES" | grep -q "Copy of Grand Euro Journey" && echo "true" || echo "false")"

echo ""
echo "--- [8] Testing Admin Stats (B2 / F2) ---"
ADMIN_RES=$(curl -s -X GET "$BASE_URL/admin/stats" -H "Authorization: Bearer $TOKEN")
assert_eq "Admin Stats returns totalUsers and topCities" "true" "$(echo "$ADMIN_RES" | grep -q "totalUsers" && echo "$ADMIN_RES" | grep -q "topCities" && echo "true" || echo "false")"

echo ""
echo "=========================================================="
echo "📊 Test Suite Results: $pass_count Passed, $fail_count Failed"
echo "=========================================================="

if [ $fail_count -eq 0 ]; then
    echo "🎉 ALL END-TO-END TESTS PASSED!"
    exit 0
else
    echo "❌ SOME TESTS FAILED."
    exit 1
fi

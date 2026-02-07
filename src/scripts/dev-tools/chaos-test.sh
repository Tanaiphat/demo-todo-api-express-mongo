#!/bin/bash

# Chaos Test: Simulate Database Failure
# Requires: 
# 1. API server running (npm run dev)
# 2. MongoDB running in Docker (docker-compose up)
# 3. jq installed (brew install jq)

BASE_URL="http://localhost:3000"
CONTAINER_NAME="todo-mongodb"

# 1. Get Authentication Token
echo "1. Authenticating..."
# We use the seed user or creates a new one
EMAIL="chaos_test_$(date +%s)@example.com"
curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"Password123!\", \"name\": \"Chaos User\"}" > /dev/null

LOGIN_RES=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"Password123!\"}")

TOKEN=$(echo $LOGIN_RES | jq -r '.data.token')

if [ "$TOKEN" == "null" ]; then
  echo "❌ Failed to get token"
  exit 1
fi
echo "✅ Authenticated. Token received."

# 2. Verify Baseline (DB Up)
echo "2. Verifying API verifies DB (Baseline)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" $BASE_URL/api/tasks)
if [ "$STATUS" == "200" ]; then
  echo "✅ API is reachable and DB connected (Status: $STATUS)"
else
  echo "❌ API failed baseline check (Status: $STATUS)"
  exit 1
fi

# 3. Simulate DB Failure
echo "3. 🛑 Stopping MongoDB Container..."
docker stop $CONTAINER_NAME
sleep 2

# 4. Check API Behavior (DB Down)
echo "4. Checking API behavior with DB down..."
# We expect 500 or proper error handling, but NOT a crash (process should stay up)
STATUS_DOWN=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" $BASE_URL/api/tasks)
echo "   Response Code: $STATUS_DOWN"

# Verify health endpoint (should still be up if app didn't crash)
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/health)
if [ "$HEALTH_STATUS" == "200" ]; then
  echo "✅ App server is still alive (Health: 200)"
else
  echo "❌ App server crashed! (Health: $HEALTH_STATUS)"
  # No exit here, we want to try recovery
fi

# 5. Restore DB
echo "5. 🚀 Restarting MongoDB Container..."
docker start $CONTAINER_NAME
echo "   Waiting for DB to stabilize..."
sleep 15


# 6. Verify Recovery
echo "6. Verifying API Recovery..."
STATUS_RECOVER=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" $BASE_URL/api/tasks)

if [ "$STATUS_RECOVER" == "200" ]; then
  echo "✅ API Recovered Successfully! (Status: 200)"
else
  echo "❌ API failed to recover (Status: $STATUS_RECOVER)"
  exit 1
fi

echo "✅ Chaos Test Passed!"

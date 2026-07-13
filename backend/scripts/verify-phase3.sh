#!/usr/bin/env bash
# Phase 3 E2E verification (GRACE-009 / SEL-14)
set -euo pipefail
cd "$(dirname "$0")/.."

export DATABASE_URL="${DATABASE_URL:-postgresql://grace:grace@localhost:5433/grace}"
export JWT_SECRET="${JWT_SECRET:-test-jwt-secret-for-phase3-only}"
export NODE_ENV=test

PASS=0
FAIL=0
check() {
  local name="$1"
  shift
  if "$@"; then
    echo "  ✅ $name"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $name"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== Grace Phase 3 E2E Verification ==="

echo "[1/4] Phase 2 prerequisite"
./scripts/verify-phase2.sh >/dev/null
check "phase2 prerequisite" true

echo "[2/4] Integration tests"
check "npm test (phase3)" npm test

echo "[3/4] Live HTTP CRUD flow"
npm run build
node dist/index.js &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
sleep 2

GUEST=$(curl -sf -X POST "http://127.0.0.1:3000/auth/guest" \
  -H 'Content-Type: application/json' \
  -d '{"deviceId":"phase3-e2e-device"}')
TOKEN=$(echo "$GUEST" | python3 -c "import sys,json; print(json.load(sys.stdin)['session']['accessToken'])")

PATCH=$(curl -sf -X PATCH "http://127.0.0.1:3000/me" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"E2E","carrying":["Hope"],"onboarded":true}')
check "PATCH /me" bash -c "echo '$PATCH' | grep -q '\"name\":\"E2E\"'"

curl -sf -X POST "http://127.0.0.1:3000/saved" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"ref":"John 3:16","text":"For God so loved the world"}' >/dev/null
SAVED=$(curl -sf "http://127.0.0.1:3000/saved" -H "Authorization: Bearer $TOKEN")
check "POST+GET /saved" bash -c "echo '$SAVED' | grep -q 'John 3:16'"

curl -sf -X DELETE "http://127.0.0.1:3000/saved/John%203:16" -H "Authorization: Bearer $TOKEN" -o /dev/null -w "%{http_code}" | grep -q 204
check "DELETE /saved"

kill $PID 2>/dev/null || true
trap - EXIT

echo "[4/4] Typecheck"
check "tsc --noEmit" npm run typecheck

echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && echo "Phase 3 E2E: PASS" && exit 0
exit 1

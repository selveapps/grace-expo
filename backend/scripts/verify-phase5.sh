#!/usr/bin/env bash
# Phase 5 E2E verification (GRACE-011 / SEL-16)
set -euo pipefail
cd "$(dirname "$0")/.."

export DATABASE_URL="${DATABASE_URL:-postgresql://grace:grace@localhost:5433/grace}"
export JWT_SECRET="${JWT_SECRET:-test-jwt-secret-for-phase5-only}"
export BETA_REDEEM_CODE="${BETA_REDEEM_CODE:-grace-beta}"
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

echo "=== Grace Phase 5 E2E Verification ==="

echo "[1/4] Phase 4 prerequisite"
./scripts/verify-phase4.sh >/dev/null
check "phase4 prerequisite" true

echo "[2/4] Integration tests"
check "npm test" npm test

echo "[3/4] Beta redeem HTTP"
npm run build
node dist/index.js &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
sleep 2

DEVICE="phase5-e2e-$(date +%s)"
GUEST=$(curl -sf -X POST "http://127.0.0.1:3000/auth/guest" \
  -H 'Content-Type: application/json' \
  -d "{\"deviceId\":\"$DEVICE\"}")
TOKEN=$(echo "$GUEST" | python3 -c "import sys,json; print(json.load(sys.stdin)['session']['accessToken'])")

ME0=$(curl -sf "http://127.0.0.1:3000/me" -H "Authorization: Bearer $TOKEN")
check "default subscribed false" bash -c "echo '$ME0' | grep -q '\"subscribed\":false'"

curl -sf -X POST "http://127.0.0.1:3000/beta/redeem" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"code":"grace-beta"}' >/dev/null
ME1=$(curl -sf "http://127.0.0.1:3000/me" -H "Authorization: Bearer $TOKEN")
check "redeem sets subscribed true" bash -c "echo '$ME1' | grep -q '\"subscribed\":true'"

kill $PID 2>/dev/null || true
trap - EXIT

echo "[4/4] Typecheck"
check "tsc --noEmit" npm run typecheck

echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && echo "Phase 5 E2E: PASS" && exit 0
exit 1

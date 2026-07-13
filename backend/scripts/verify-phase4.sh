#!/usr/bin/env bash
# Phase 4 E2E verification (GRACE-010 / SEL-13)
set -euo pipefail
cd "$(dirname "$0")/.."

export DATABASE_URL="${DATABASE_URL:-postgresql://grace:grace@localhost:5433/grace}"
export JWT_SECRET="${JWT_SECRET:-test-jwt-secret-for-phase4-only}"
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

echo "=== Grace Phase 4 E2E Verification ==="

echo "[1/4] Phase 3 prerequisite"
./scripts/verify-phase3.sh >/dev/null
check "phase3 prerequisite" true

echo "[2/4] Integration tests"
check "npm test" npm test

echo "[3/4] Search HTTP"
npm run build
node dist/index.js &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
sleep 2

EMPTY=$(curl -sf "http://127.0.0.1:3000/bible/search?q=")
check "empty query" bash -c "echo '$EMPTY' | grep -q '\"ot\":\[\]'"

PEACE=$(curl -sf "http://127.0.0.1:3000/bible/search?q=peace")
NT_COUNT=$(echo "$PEACE" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['nt']))")
check "peace has NT hits" test "$NT_COUNT" -gt 0

kill $PID 2>/dev/null || true
trap - EXIT

echo "[4/4] Typecheck"
check "tsc --noEmit" npm run typecheck

echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && echo "Phase 4 E2E: PASS" && exit 0
exit 1

#!/usr/bin/env bash
# Phase 2 E2E verification (GRACE-007, GRACE-008 / SEL-12, SEL-10)
set -euo pipefail
cd "$(dirname "$0")/.."

export DATABASE_URL="${DATABASE_URL:-postgresql://grace:grace@localhost:5433/grace}"
export JWT_SECRET="${JWT_SECRET:-test-jwt-secret-for-phase2-only}"
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

echo "=== Grace Phase 2 E2E Verification ==="
echo "DATABASE_URL=$DATABASE_URL"
echo

echo "[1/8] Phase 1 gate (prerequisite)"
./scripts/verify-phase1.sh
check "phase1 prerequisite" true

echo "[2/8] Build"
npm run build
check "tsc build" test -f dist/index.js

echo "[3/8] Integration tests (Phase 1 + 2)"
check "npm test" npm test

echo "[4/8] Scripture HTTP (SEL-12)"
npm run build
node dist/index.js &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
sleep 2

CHAPTER=$(curl -sf "http://127.0.0.1:3000/bible/psalms/23" || echo '{}')
echo "  GET /bible/psalms/23: $(echo "$CHAPTER" | head -c 120)..."
check "psalms 23 has 6 verses" bash -c "echo '$CHAPTER' | python3 -c \"import sys,json; d=json.load(sys.stdin); exit(0 if len(d.get('verses',[]))==6 else 1)\""
check "psalms 23 reference" bash -c "echo '$CHAPTER' | grep -q 'Psalm 23'"

PASSAGE=$(curl -sf "http://127.0.0.1:3000/bible/passage?ref=John+3:16" || echo '{}')
echo "  GET /bible/passage?ref=John+3:16: $PASSAGE"
check "john 3:16 has text" bash -c "echo '$PASSAGE' | grep -q '\"text\"'"

TODAY=$(curl -sf "http://127.0.0.1:3000/today/verse" || echo '{}')
echo "  GET /today/verse: $TODAY"
check "today verse stable shape" bash -c "echo '$TODAY' | grep -q '\"ref\"'"

CARRY=$(curl -sf "http://127.0.0.1:3000/verse/for-carrying?tags=Worry,Hope" || echo '{}')
echo "  GET /verse/for-carrying: $CARRY"
check "carrying maps Worry" bash -c "echo '$CARRY' | grep -qi philippians"

echo "[5/8] Guest auth (SEL-10)"
GUEST=$(curl -sf -X POST "http://127.0.0.1:3000/auth/guest" \
  -H 'Content-Type: application/json' \
  -d '{"deviceId":"phase2-verify-device"}' || echo '{}')
echo "  POST /auth/guest: $(echo "$GUEST" | head -c 80)..."
TOKEN=$(echo "$GUEST" | python3 -c "import sys,json; print(json.load(sys.stdin).get('session',{}).get('accessToken',''))" 2>/dev/null || true)
check "guest returns accessToken" test -n "$TOKEN"

ME=$(curl -sf "http://127.0.0.1:3000/me" -H "Authorization: Bearer $TOKEN" || echo '{}')
check "GET /me with token" bash -c "echo '$ME' | grep -q '\"user\"'"

UNAUTH=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/me" || echo 000)
check "GET /me without token → 401" test "$UNAUTH" = "401"

GUEST2=$(curl -sf -X POST "http://127.0.0.1:3000/auth/guest" \
  -H 'Content-Type: application/json' \
  -d '{"deviceId":"phase2-verify-device"}' || echo '{}')
ID1=$(echo "$GUEST" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['id'])" 2>/dev/null || true)
ID2=$(echo "$GUEST2" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['id'])" 2>/dev/null || true)
check "same deviceId → same user id" test "$ID1" = "$ID2"

kill $PID 2>/dev/null || true
trap - EXIT

echo "[6/8] Typecheck"
check "tsc --noEmit" npm run typecheck

echo
echo "=== Results: $PASS passed, $FAIL failed ==="
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
echo "Phase 2 E2E: PASS"

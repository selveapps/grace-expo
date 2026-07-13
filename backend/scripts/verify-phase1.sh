#!/usr/bin/env bash
# Phase 1 end-to-end verification (GRACE-002, 003, 004, 005 / SEL-6,7,8,9)
set -euo pipefail
cd "$(dirname "$0")/.."

export DATABASE_URL="${DATABASE_URL:-postgresql://grace:grace@localhost:5433/grace}"
export JWT_SECRET="${JWT_SECRET:-test-jwt-secret-for-phase1-only}"
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

echo "=== Grace Phase 1 E2E Verification ==="
echo "DATABASE_URL=$DATABASE_URL"
echo

echo "[1/7] Docker Postgres (SEL-6)"
docker compose up -d --wait
check "postgres healthy" docker compose exec -T postgres pg_isready -U grace -d grace

echo "[2/7] Install & generate (SEL-7)"
npm install --silent
check "prisma generate" npx prisma generate

echo "[3/7] Migrations (SEL-9)"
check "prisma migrate deploy" npx prisma migrate deploy

echo "[4/7] KJV prepare + seed (SEL-8, SEL-11)"
check "seed:prepare (sample)" npm run seed:prepare
check "seed:bible" npm run seed:bible

echo "[5/7] Integration tests (SEL-9, SEL-11)"
check "npm test" npm test

echo "[6/7] API health with DB (SEL-7)"
npm run build
node dist/index.js &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
sleep 2
HEALTH=$(curl -sf "http://127.0.0.1:3000/health" || echo '{}')
echo "  response: $HEALTH"
check "health ok=true" bash -c "echo '$HEALTH' | grep -q '\"ok\":true'"
check "health db=true" bash -c "echo '$HEALTH' | grep -q '\"db\":true'"
kill $PID 2>/dev/null || true
trap - EXIT

echo "[7/7] Typecheck"
check "tsc --noEmit" npm run typecheck

echo
echo "=== Results: $PASS passed, $FAIL failed ==="
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
echo "Phase 1 E2E: PASS"

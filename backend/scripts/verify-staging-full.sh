#!/usr/bin/env bash
# Full staging API verification (GRACE-019 / M10).
# Usage: STAGING_API_URL=https://xxx.up.railway.app ./scripts/verify-staging-full.sh
set -euo pipefail

URL="${STAGING_API_URL:-https://grace-api-production.up.railway.app}"
URL="${URL%/}"
BETA_CODE="${BETA_REDEEM_CODE:-grace-beta}"

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

echo "=== Grace Staging Full Verification ==="
echo "STAGING_API_URL=$URL"
echo

echo "[1/16] Health"
HEALTH=$(curl -sf "$URL/health" || echo '{}')
check "GET /health ok+db" bash -c "echo '$HEALTH' | grep -q '\"ok\":true' && echo '$HEALTH' | grep -q '\"db\":true'"

echo "[2/16] Scripture — chapter"
PS=$(curl -sf "$URL/bible/psalms/23" || echo '{}')
check "GET /bible/psalms/23" bash -c "echo '$PS' | grep -q '\"verses\"'"

echo "[3/16] Scripture — passage"
PASSAGE=$(curl -sf "$URL/bible/passage?ref=John+3:16" || echo '{}')
check "GET /bible/passage" bash -c "echo '$PASSAGE' | grep -q 'God'"

echo "[4/16] Scripture — today"
TODAY=$(curl -sf "$URL/today/verse" || echo '{}')
check "GET /today/verse" bash -c "echo '$TODAY' | grep -q '\"ref\"'"

echo "[5/16] Scripture — carrying"
CARRY=$(curl -sf "$URL/verse/for-carrying?tags=Worry" || echo '{}')
check "GET /verse/for-carrying" bash -c "echo '$CARRY' | grep -q '\"text\"'"

echo "[6/16] Scripture — search"
SEARCH=$(curl -sf "$URL/bible/search?q=peace" || echo '{}')
check "GET /bible/search" bash -c "echo '$SEARCH' | grep -q '\"nt\"'"

echo "[7/16] Auth — guest"
DEVICE="staging-verify-$(date +%s)"
GUEST=$(curl -sf -X POST "$URL/auth/guest" \
  -H 'Content-Type: application/json' \
  -d "{\"deviceId\":\"$DEVICE\"}" || echo '{}')
TOKEN=$(echo "$GUEST" | python3 -c "import sys,json; print(json.load(sys.stdin).get('session',{}).get('accessToken',''))" 2>/dev/null || echo '')
REFRESH=$(echo "$GUEST" | python3 -c "import sys,json; print(json.load(sys.stdin).get('session',{}).get('refreshToken',''))" 2>/dev/null || echo '')
check "POST /auth/guest" test -n "$TOKEN"

echo "[8/16] Profile — GET/PATCH /me"
ME=$(curl -sf "$URL/me" -H "Authorization: Bearer $TOKEN" || echo '{}')
check "GET /me" bash -c "echo '$ME' | grep -q '\"profile\"'"
PATCH=$(curl -sf -X PATCH "$URL/me" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Staging E2E","onboarded":true}' || echo '{}')
check "PATCH /me" bash -c "echo '$PATCH' | grep -q 'Staging E2E'"

echo "[9/16] Library — saved"
curl -sf -X POST "$URL/saved" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"ref":"John 3:16","text":"For God so loved the world"}' >/dev/null
SAVED=$(curl -sf "$URL/saved" -H "Authorization: Bearer $TOKEN" || echo '[]')
check "POST+GET /saved" bash -c "echo '$SAVED' | grep -q 'John 3:16'"
curl -sf -X DELETE "$URL/saved/John%203:16" -H "Authorization: Bearer $TOKEN" -o /dev/null -w "%{http_code}" | grep -q 204
check "DELETE /saved"

echo "[10/16] Library — reflections"
curl -sf -X POST "$URL/reflections" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"word":"peace","note":"staging verify"}' >/dev/null
REFS=$(curl -sf "$URL/reflections" -H "Authorization: Bearer $TOKEN" || echo '[]')
check "POST+GET /reflections" bash -c "echo '$REFS' | grep -q 'peace'"

echo "[11/16] Progress + beta redeem"
curl -sf -X PUT "$URL/progress" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"book":"Psalms","chapter":23,"position":1}' >/dev/null
PROG=$(curl -sf "$URL/progress" -H "Authorization: Bearer $TOKEN" || echo '[]')
check "PUT+GET /progress" bash -c "echo '$PROG' | grep -q 'Psalms'"

DEVICE2="staging-beta-$(date +%s)"
GUEST2=$(curl -sf -X POST "$URL/auth/guest" -H 'Content-Type: application/json' -d "{\"deviceId\":\"$DEVICE2\"}")
TOKEN2=$(echo "$GUEST2" | python3 -c "import sys,json; print(json.load(sys.stdin)['session']['accessToken'])")
curl -sf -X POST "$URL/beta/redeem" \
  -H "Authorization: Bearer $TOKEN2" -H 'Content-Type: application/json' \
  -d "{\"code\":\"$BETA_CODE\"}" >/dev/null
ME2=$(curl -sf "$URL/me" -H "Authorization: Bearer $TOKEN2")
check "POST /beta/redeem" bash -c "echo '$ME2' | grep -q '\"subscribed\":true'"

echo "[12/16] Auth refresh"
REFRESH_RES=$(curl -sf -X POST "$URL/auth/refresh" \
  -H 'Content-Type: application/json' \
  -d "{\"refresh\":\"$REFRESH\"}" || echo '{}')
check "POST /auth/refresh" bash -c "echo '$REFRESH_RES' | grep -q 'accessToken'"

echo "[13/16] Stories catalog"
STORIES=$(curl -sf "$URL/stories" || echo '{}')
check "GET /stories" bash -c "echo '$STORIES' | grep -q 'ruth-stays'"

echo "[14/16] AI — story narrative"
NARR=$(curl -sf -X POST "$URL/ai/stories/mary-annunciation/narrative" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"part":1}' || echo '{}')
check "POST /ai/stories/:id/narrative" bash -c "echo '$NARR' | grep -q 'content'"

echo "[15/16] AI — reminder + support"
REM=$(curl -sf -X POST "$URL/ai/reminder" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"type":"morning","morningTime":"07:00"}' || echo '{}')
check "POST /ai/reminder" bash -c "echo '$REM' | grep -q 'notification'"

SUP=$(curl -sf -X POST "$URL/ai/support" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"category":"Feedback","message":"staging verify"}' || echo '{}')
check "POST /ai/support" bash -c "echo '$SUP' | grep -q 'reply'"

echo "[16/16] OpenAPI docs"
check "GET /docs/json (OpenAPI)" bash -c 'curl -sf "'"$URL"'/docs/json" | python3 -c "import sys,json; sys.exit(0 if \"/health\" in json.load(sys.stdin).get(\"paths\",{}) else 1)"'

echo
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && echo "Staging full verify: PASS" && exit 0
exit 1

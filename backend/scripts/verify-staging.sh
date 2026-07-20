#!/usr/bin/env bash
# Verify Railway staging API (SEL-6 + SEL-21 partial).
# Usage: STAGING_API_URL=https://xxx.up.railway.app ./scripts/verify-staging.sh
set -euo pipefail

URL="${STAGING_API_URL:-}"
if [ -z "$URL" ]; then
  echo "Set STAGING_API_URL (e.g. https://grace-api-staging.up.railway.app)"
  exit 1
fi

URL="${URL%/}"
echo "=== Grace Staging Verification ==="
echo "STAGING_API_URL=$URL"
echo

HEALTH=$(curl -sf "$URL/health" || echo '{}')
echo "GET /health → $HEALTH"

echo "$HEALTH" | grep -q '"ok":true' || { echo "FAIL: ok not true"; exit 1; }
echo "$HEALTH" | grep -q '"db":true' || { echo "FAIL: db not true"; exit 1; }

echo
echo "Staging verify: PASS"

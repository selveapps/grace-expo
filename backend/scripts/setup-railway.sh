#!/usr/bin/env bash
# One-shot Railway staging setup via CLI (SEL-6, SEL-21).
# Prereq: railway login (or RAILWAY_API_TOKEN for account scope)
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_NAME="${RAILWAY_PROJECT_NAME:-grace-api-staging}"
SERVICE_NAME="${RAILWAY_SERVICE_NAME:-grace-api}"

echo "=== Railway staging setup ==="

if ! railway whoami &>/dev/null; then
  echo "Not logged in. Run: railway login"
  echo "  or export RAILWAY_API_TOKEN=<account token>"
  exit 1
fi

if [ ! -f .railway/config.json ]; then
  echo "[1/6] Creating project: $PROJECT_NAME"
  railway init --name "$PROJECT_NAME"
else
  echo "[1/6] Already linked to a Railway project"
fi

echo "[2/6] Adding PostgreSQL"
railway add --database postgres

echo "[3/6] Setting service variables"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 32)}"
railway variable set "DATABASE_URL=\${{Postgres.DATABASE_URL}}"
railway variable set "JWT_SECRET=$JWT_SECRET"
railway variable set "NODE_ENV=production"
railway variable set "CORS_ORIGINS=*"

echo "[4/6] Generating public domain"
railway domain

echo "[5/6] Deploying backend"
railway up --detach

echo "[6/6] Waiting for health check..."
sleep 15
DOMAIN=$(railway domain list --json 2>/dev/null | grep -o 'https://[^"]*' | head -1 || true)
echo
echo "Setup complete. Verify with:"
echo "  STAGING_API_URL=https://<your-domain> npm run verify:staging"
echo
echo "Save JWT_SECRET for team secrets: $JWT_SECRET"

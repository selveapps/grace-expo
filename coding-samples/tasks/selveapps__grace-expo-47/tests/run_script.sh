#!/bin/bash
set -u
cd /app
export PLAYWRIGHT_JSON_OUTPUT_NAME=/tmp/result.json
npx playwright test e2e/today-load-failure.spec.js --reporter=json

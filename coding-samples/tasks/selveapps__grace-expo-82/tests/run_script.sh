#!/bin/bash
set -u
cd /app/web
npx vitest run lib/library.test.ts --reporter=json --outputFile=/tmp/result.json

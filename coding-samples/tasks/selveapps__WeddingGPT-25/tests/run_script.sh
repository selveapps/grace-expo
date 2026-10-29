#!/bin/bash
set -u
cd /app
npx jest --json --outputFile=/tmp/result.json src/models/__tests__/dependencies.test.js src/store/__tests__/planningDependencies.test.js src/features/planning/__tests__/TaskDependencies.test.jsx

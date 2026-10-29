#!/bin/bash
set -euo pipefail
cd /app
git apply --verbose "${SOLUTION_DIR:-/solution}/gold_patch.diff"

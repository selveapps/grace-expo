#!/bin/bash
# Verifier. The agent never sees this directory. Harbor mounts it at runtime.
set -u
cd /app
TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p /tmp /logs/verifier
git apply --verbose "$TESTS_DIR/test_patch.patch"
set +e
bash "$TESTS_DIR/run_script.sh" > /tmp/stdout.log 2> /tmp/stderr.log
proc=$?
set -e
python3 "$TESTS_DIR/parser.py" /tmp/stdout.log /tmp/stderr.log /tmp/output.json "$TESTS_DIR/config.json" "$proc"
status=$?
cp /tmp/output.json /logs/verifier/output.json 2>/dev/null || true
exit "$status"

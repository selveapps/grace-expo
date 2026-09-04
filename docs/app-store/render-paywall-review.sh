#!/usr/bin/env bash
# Render App Store subscription Review Information screenshots from paywall mockup.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
HTML="$ROOT/paywall-review-mockup.html"
CHROME="${CHROME:-google-chrome}"

if [[ ! -f "$HTML" ]]; then
  echo "Missing mockup: $HTML" >&2
  exit 1
fi

render() {
  local plan="$1"
  local out="$2"
  local profile
  profile="$(mktemp -d)"
  timeout 25 "$CHROME" \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --disable-dev-shm-usage \
    --hide-scrollbars \
    --user-data-dir="$profile" \
    --virtual-time-budget=8000 \
    --run-all-compositor-stages-before-draw \
    --window-size=1290,2796 \
    --screenshot="$out" \
    "file://$HTML?plan=$plan" 2>/dev/null || true
  rm -rf "$profile"
  if [[ ! -s "$out" ]]; then
    echo "Failed to write $out" >&2
    exit 1
  fi
  echo "Wrote $out"
}

render annual "$ROOT/subscription-review-grace.yearly.png"
render monthly "$ROOT/subscription-review-grace.monthly.png"

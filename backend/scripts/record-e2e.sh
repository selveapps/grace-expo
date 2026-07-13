#!/usr/bin/env bash
# Record an E2E verify run to docs/runs/ with reproducibility metadata.
# Usage:
#   ./scripts/record-e2e.sh phase1|phase2|staging
set -euo pipefail

PHASE="${1:-}"
if [ -z "$PHASE" ]; then
  echo "Usage: $0 phase1|phase2|staging"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/.." && pwd)"
RUNS_DIR="$REPO_ROOT/docs/runs"
mkdir -p "$RUNS_DIR"

UTC_TS="$(date -u +%Y%m%dT%H%M%SZ)"
SHA="$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)"
BRANCH="$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
DIRTY="$(git -C "$REPO_ROOT" diff --quiet && git -C "$REPO_ROOT" diff --cached --quiet && echo clean || echo dirty)"

LOG="$RUNS_DIR/${PHASE}-${UTC_TS}-${SHA}.log"

case "$PHASE" in
  phase1) VERIFY_CMD=(npm run verify:phase1) ;;
  phase2) VERIFY_CMD=(npm run verify:phase2) ;;
  phase3) VERIFY_CMD=(npm run verify:phase3) ;;
  phase4) VERIFY_CMD=(npm run verify:phase4) ;;
  staging)
    if [ -z "${STAGING_API_URL:-}" ]; then
      STAGING_API_URL="https://grace-api-production.up.railway.app"
      export STAGING_API_URL
    fi
    VERIFY_CMD=(npm run verify:staging)
    ;;
  *)
    echo "Unknown phase: $PHASE"
    exit 1
    ;;
esac

{
  echo "══════════════════════════════════════════════════════════════"
  echo "Grace E2E Record"
  echo "══════════════════════════════════════════════════════════════"
  echo "phase:       $PHASE"
  echo "recorded_at: $UTC_TS (UTC)"
  echo "git_branch:  $BRANCH"
  echo "git_sha:     $(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo unknown)"
  echo "git_sha_short: $SHA"
  echo "git_tree:    $DIRTY"
  echo "node:        $(node -v 2>/dev/null || echo unknown)"
  echo "platform:    $(uname -srm 2>/dev/null || echo unknown)"
  echo "cwd:         $ROOT"
  echo "command:     ${VERIFY_CMD[*]}"
  echo "DATABASE_URL: ${DATABASE_URL:-<default localhost:5433>}"
  echo "STAGING_API_URL: ${STAGING_API_URL:-<not set>}"
  echo "JWT_SECRET:  $([ -n "${JWT_SECRET:-}" ] && echo '<set>' || echo '<default test secret>')"
  echo "──────────────────────────────────────────────────────────────"
  echo
} > "$LOG"

cd "$ROOT"
set +e
"${VERIFY_CMD[@]}" 2>&1 | tee -a "$LOG"
EXIT=${PIPESTATUS[0]}
set -e

{
  echo
  echo "──────────────────────────────────────────────────────────────"
  echo "exit_code: $EXIT"
  echo "result:    $([ "$EXIT" -eq 0 ] && echo PASS || echo FAIL)"
  echo "log_file:  docs/runs/$(basename "$LOG")"
  echo "══════════════════════════════════════════════════════════════"
} >> "$LOG"

echo
echo "Recorded → docs/runs/$(basename "$LOG")"
echo "Exit code: $EXIT"
exit "$EXIT"

#!/bin/bash
# Check out one commit and throw away history so the fix is not in the image.
set -euo pipefail
REPO="$1"
COMMIT="$2"
rm -rf /app
mkdir -p /app
cd /app
git init -q
git remote add origin "https://github.com/${REPO}.git"
git fetch --depth 1 origin "$COMMIT"
git checkout --detach FETCH_HEAD
rm -rf .git
git init -q
git add -A
git -c user.email=eval@example.com -c user.name=eval commit -qm "base ${COMMIT}"

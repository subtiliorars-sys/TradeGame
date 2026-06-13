#!/usr/bin/env bash
# verify.sh - delegates to cross-platform verify.mjs
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
node scripts/verify.mjs

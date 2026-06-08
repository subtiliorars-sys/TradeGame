#!/usr/bin/env bash
# lint-pnl.sh — SIM_ENGINE_SPEC §4.1 / TEST_PLAN §2.2 (SM-ANTI-001)
#
# Greps sim/src/engine/scoring.ts for prohibited PnL-related identifiers.
# Exits 1 if any match is found — this blocks merge per TEST_PLAN §6.2.
#
# Reference: SIM_ENGINE_SPEC §4.1 and RISK_REGISTER §16.
# "Any function in the scoring engine that reads realizedPnL or unrealizedPnL
#  is a design violation and must be rejected in code review."
#
# Pattern note: 'equity' is intentionally EXCLUDED here because size_compliance
# (§4.2) legitimately reads sessionStartEquity (a session-start snapshot, not
# a running P&L value). The prohibited set is the one from TEST_PLAN §2.2:
#   realizedPnL | unrealizedPnL | pnlScore | winRate | returnOnAccount
# plus the additional prohibited output field names from §4.4:
#   returnPct | profitUsd | profitPips
# If a reviewer believes 'equity' should be added back, that requires a spec
# change to remove size_compliance's equity ratio — a design decision, not a
# code change.

SRC="$(dirname "$0")/../src"

# Scope (widened after three red-team passes flagged the single-file tripwire
# as a residual): every PURE scoring-adjacent module. The UI boundary
# (SessionAdapter/TradingScene) is deliberately excluded — displaying account
# state is its legitimate job; the rail is that SCORING never reads it.
FILES="
$SRC/engine/scoring.ts
$SRC/engine/rank.ts
$SRC/engine/progress.ts
$SRC/engine/amm.ts
$SRC/drills/catalog.ts
$SRC/drills/livePredicates.ts
$SRC/drills/liveCatalog.ts
$SRC/ui/engine/gating.ts
$SRC/ui/engine/lp.ts
$SRC/ui/engine/replay.ts
"

# Prohibited identifiers per TEST_PLAN §2.2 + SIM_ENGINE_SPEC §4.4.
PATTERN='realizedPnL|unrealizedPnL|pnlScore|winRate|returnOnAccount|returnPct|profitUsd|profitPips'

FAILED=0
for f in $FILES; do
  if [ ! -f "$f" ]; then
    # Modules from unmerged feature branches (e.g. drills/) may not exist on
    # every branch — skip with a note rather than failing; they are scanned
    # automatically once their branch merges.
    echo "lint-pnl: note — $f not present on this branch (skipped)"
    continue
  fi
  # Exclude comment lines (content after the line-number prefix starts with
  # * or //) so spec-reference docstrings do not self-trip the guard.
  MATCHES=$(grep -inE "$PATTERN" "$f" | grep -vE '^[0-9]+:\s*(//|\*)')
  if [ -n "$MATCHES" ]; then
    echo ""
    echo "lint-pnl: FAIL — PnL-related identifier found in $f" >&2
    echo "Reference: SIM_ENGINE_SPEC §4.1 and RISK_REGISTER §16" >&2
    echo ""
    echo "$MATCHES" >&2
    echo ""
    FAILED=1
  fi
done

# ---------------------------------------------------------------------------
# Blowup-classifier containment (OWNER CONDITION 3, 2026-06-08): the
# classifier legitimately reconstructs equity INTERNALLY (display-domain
# exception, enum-only output) and is deliberately NOT in the scan list
# above. Its containment is this STRUCTURAL IMPORT BAN: no scoring-adjacent
# module may import it, ever. Display-layer scenes may.
# ---------------------------------------------------------------------------
for f in $FILES; do
  [ -f "$f" ] || continue
  if grep -qE 'blowupClassifier' "$f"; then
    echo ""
    echo "lint-pnl: FAIL — $f imports/references blowupClassifier (owner condition 3: structural import ban)" >&2
    FAILED=1
  fi
done

[ "$FAILED" -eq 1 ] && exit 1

echo "lint-pnl: OK — no prohibited PnL identifiers in scoring-adjacent modules"
exit 0

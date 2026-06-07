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

SCORING_FILE="$(dirname "$0")/../src/engine/scoring.ts"

if [ ! -f "$SCORING_FILE" ]; then
  echo "lint-pnl: ERROR — scoring.ts not found at $SCORING_FILE" >&2
  exit 1
fi

# Prohibited identifiers per TEST_PLAN §2.2 + SIM_ENGINE_SPEC §4.4.
PATTERN='realizedPnL|unrealizedPnL|pnlScore|winRate|returnOnAccount|returnPct|profitUsd|profitPips'

# Exclude comment lines (content after the line-number prefix starts with * or //)
# so that spec-reference docstrings listing prohibited names do not self-trip the guard.
# grep -n output format: "NN: content" — filter on content after the colon.
MATCHES=$(grep -inE "$PATTERN" "$SCORING_FILE" | grep -vE '^[0-9]+:\s*(//|\*)')

if [ -n "$MATCHES" ]; then
  echo ""
  echo "lint-pnl: FAIL — PnL-related identifier found in scoring.ts" >&2
  echo "Reference: SIM_ENGINE_SPEC §4.1 and RISK_REGISTER §16" >&2
  echo ""
  echo "$MATCHES" >&2
  echo ""
  exit 1
fi

echo "lint-pnl: OK — no prohibited PnL identifiers in scoring.ts"
exit 0

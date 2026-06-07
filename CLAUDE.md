# TradeGame HQ — repo specifics

Doctrine (Daystrom, token tiers, governance, license policy, fleet protocol)
is inherited from `~/CLAUDE.md` — this file is repo-specifics only.

## What this repo is
Private HQ for TradeGame: community coaching + gaming org for gamer-traders
(crypto + stocks + forex, all first-class) and an education trading-sim game.
Public sibling: `TradeGame---Preview` (sanitized only — no strategy, no
compliance discussion, no internal plans ever land there).

## Hard rules
- **Education, not financial advice** — every artifact keeps this posture.
  No signal-selling, no performance promises, no managed-money language.
  `docs/RISK_REGISTER.md` is the canon; changes to it get a red-team pass.
- No secrets in code; `.githooks/pre-commit` secret scan is active
  (`git config core.hooksPath .githooks` after a fresh clone).
- Branch per task; stage only files you changed (multi-instance protocol).

## Governance tier (per ~/agent-corps/GOVERNANCE_ROLLOUT_PLAN.md)
**Tier A** (universal basics) — assigned 2026-06-06 at scaffold time.
**Tier B earmarked**: the moment the game, site, or Discord tooling holds
member data (accounts, progress, PII), B requirements (consent gates, PII
handling, erasure path, backup posture) become mandatory before ship.
Not C (not recovery-adjacent) and not D (no agentic/acting-in-world code yet);
re-tier to D if trading-bot or auto-posting code ever lands here.
Audit trail: `GOVERNANCE.md`.

## No deploy automation
Pushes do not deploy anything (as of 2026-06-06). If that changes, add a
deploy gate pre-push hook (copy MM's pattern) and update this file.

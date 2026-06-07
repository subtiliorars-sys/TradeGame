# Governance — TradeGame HQ

Tier assignment per `~/agent-corps/GOVERNANCE_ROLLOUT_PLAN.md`.

| Field | Value |
|---|---|
| Tier | **A** (universal basics); **B earmarked** for first member-data feature |
| Assigned | 2026-06-06 (scaffold-time, work/bootstrap) |
| Rationale | Docs-only repo today: no auth, no user data, no agentic code. Community/game platform will hold member data later → B trigger documented in CLAUDE.md. |

## Tier A mechanisms in place
- Secret scan: `.githooks/pre-commit` (activate: `git config core.hooksPath .githooks`)
- No secrets in code: `.gitignore` excludes `.env*`, keys, `secrets/`
- Branch-per-task: multi-instance protocol inherited from `~/CLAUDE.md`
- Master/deploy gate: N/A — no deploy automation; add gate hook when one lands
- Fail-closed auth: N/A — no auth surface

## Audit log
- 2026-06-06 — scaffolded at Tier A; risk register red-teamed at creation
  (see docs/RISK_REGISTER.md). Constitution not yet ratified fleet-wide
  (rollout Phase 0 pending) — re-audit after CORPS_CONSTITUTION.md lands.

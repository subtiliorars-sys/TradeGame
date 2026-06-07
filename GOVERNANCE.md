# Governance — TradeGame HQ

Tier assignment per `~/agent-corps/GOVERNANCE_ROLLOUT_PLAN.md`.

| Field | Value |
|---|---|
| Tier | **A** (universal basics); **B earmarked — trigger = ROADMAP Phase 2** |
| Assigned | 2026-06-06 (scaffold-time, work/bootstrap) |
| Rationale | Docs-only repo today: no auth, no user data, no agentic code. Red-team (2026-06-06) pinned the B trigger precisely: the GDD's Phase 2 vertical slice stores accounts, portfolios, XP, and trading journals (sensitive financial-behavior PII) — Tier B requirements (privacy policy, retention, breach plan, COPPA review, consent gates, erasure path) are mandatory BEFORE that ships. |

## Tier A mechanisms in place
- Secret scan: `.githooks/pre-commit` (activate: `git config core.hooksPath .githooks`)
- No secrets in code: `.gitignore` excludes `.env*`, keys, `secrets/`
- Branch-per-task: multi-instance protocol inherited from `~/CLAUDE.md`
- Master/deploy gate: N/A — no deploy automation; add gate hook when one lands
- Fail-closed auth: N/A — no auth surface

## Audit log
- 2026-06-06 — scaffolded at Tier A; risk register red-teamed at creation
  (verdict GO-WITH-FIXES, fixes applied same day; re-verify before the
  ROADMAP Phase 1 compliance gate). Compliance-officer pass over all docs
  same day (12 findings, applied). Constitution not yet ratified fleet-wide
  (rollout Phase 0 pending) — re-audit after CORPS_CONSTITUTION.md lands.

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
- 2026-06-07 — register re-verification red-team: PASS-WITH-NITS (18/18 prior
  fixes substantive; 8 new MED/LOW applied). Buildout waves 2–4 each closed
  with an independent audit: wave-2 compliance sweep (11 findings applied),
  wave-3 compliance audit (4 findings applied + AMM IL math corrected),
  wave-4 red-team verdict FAIL → all 19 findings remediated same day
  (headliners: broken IL worked example, systemic forex pip-value convention
  error reaching back into wave-3 lessons, a PnL-predicate win condition in
  the advanced-tier brief — now barred by standing rule "scenario success
  conditions must be process predicates, never account-value predicates").
  Lesson learned (logged): agent-authored lesson math ships only after an
  independent numeric pass; one draft monologue escaped to a committed file.

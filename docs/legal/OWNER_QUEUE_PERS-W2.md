# Owner queue — PERS-W2 counsel review

**Wave:** PERS-W2 Tier-B local persistence scaffold  
**Date:** 2026-06-28  
**Action:** Queue to AgentCorps `fleet/owner-queue/items/` — do **not** ship public beta until cleared.

## Item

| Field | Value |
|-------|-------|
| Title | Finalize PRIVACY_DRAFT + COPPA counsel sign-off before public beta |
| Priority | High (G-2 gate) |
| Blocker for | Public beta / staging deploy with persistence enabled |
| References | `docs/legal/COPPA_G2_ANALYSIS.md`, `docs/legal/PRIVACY_DRAFT.md`, RISK_REGISTER §10/§14 |

## Owner decision needed

1. Licensed attorney review of `docs/legal/PRIVACY_DRAFT.md` before publication.
2. Confirm 13–17 tier posture under state minor-protection rules (placeholder in privacy draft §8).
3. Approve or revise COPPA_G2_ANALYSIS staged verdict before enabling server-side sync (future wave).

**Worker note:** Local-only persistence scaffold is implemented; this item does not block merge of the wave PR.

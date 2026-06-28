# COPPA / G-2 Compliance Analysis — TradeGame PERS-W2

**Date:** 2026-06-22  
**Status:** STAGED for Owner Review  
**Subject:** Phase 2 Local Persistence and Account Scoping (G-2 Gate)

## 1. Scope and Context
This analysis fulfills the **G-2 hard gate** requirement in `OWNER_RUNBOOK.md` before the Phase 2 vertical slice ships with account persistence. The goal is to ensure that the introduction of `localStorage` persistence and potential server-side account syncing (PERS-W2) complies with the Children's Online Privacy Protection Act (COPPA).

## 2. Audience and Access Control
- **Discord Community:** 13+ per Discord platform floor.
- **Coaching Ladder:** 18+ per `DISCORD_BLUEPRINT.md §1`.
- **Game Component:** General audience (educational simulation).
- **Mandatory Age Gate:** `SIM_ENGINE_SPEC §6.1` requires a mandatory age affirmation screen at account creation.

## 3. Data Collection Inventory
The following data points are stored for users who pass the age gate:
| Data Point | Purpose | COPPA Categorization |
|------------|---------|----------------------|
| UUID | Account identifier | Persistent identifier (Internal Operations) |
| Age Affirmation | Access control | Internal Operations |
| XP / Progress | Progression | Internal Operations |
| Journal Entries | Education / Reflection | Internal Operations (Encrypted) |
| Portfolio State | Simulation continuity | Internal Operations |
| Optional Email | Account recovery | Personal Information (Internal Operations) |

## 4. COPPA Analysis Findings
- **Under-13 (Blocked):** The Service is not directed to children under 13. The age gate strictly blocks account creation for users who select "Under 13". No data is collected or stored for blocked attempts.
- **13–17 Tier (Game-Only):** Users in this tier are permitted access to the game simulation. Coaching and social features that involve higher-risk interaction or financial behavior are gated 18+.
- **Minimal Collection:** The data collected (UUID, XP) for users 13+ falls under "Internal Operations" exceptions and does not include precise geolocation, real names, or phone numbers.
- **Parental Consent:** Since the Service blocks under-13s and collects only internal identifiers for 13+, formal verifiable parental consent (VPC) is not triggered under federal COPPA rules.

## 5. Required Controls for PERS-W2 Ship
1. **Mandatory Age-Gate:** Must be the first screen encountered before any `localStorage` write.
2. **Data Minimization:** Email collection must remain optional and explicitly labelled for "Recovery Only".
3. **Erasure Path:** The "Delete My Account" button must be functional and clear all local and (future) server-side records.
4. **Privacy Policy:** `docs/legal/PRIVACY_DRAFT.md` must be finalized and linked from the age-gate screen.

## 6. Verdict
**PASS — Staged.** The Phase 2 persistence model (PERS-W2) as designed does not violate COPPA, provided the Under-13 block remains a hard gate and data collection remains limited to simulated progress and internal identifiers.

---
*Disclaimer: This analysis is provided for internal planning. Formal legal review of docs/legal/PRIVACY_DRAFT.md is still required per RISK_REGISTER §4.*

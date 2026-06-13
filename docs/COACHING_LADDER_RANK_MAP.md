# Coaching Ladder ↔ In-Game Rank Map

**Status:** Living doc | Private HQ only  
**Wave:** COACH-W1 (`automation/wave-coach-w1`)  
**Spec:** `docs/ROADMAP.md` Phase 3; `docs/COMMUNITY.md` §2  
**Posture:** Education, not advice. Process metrics only — no PnL gates, no signals.

---

## Purpose

TradeGame ranks measure **in-sim process XP and drill gates** (`sim/src/engine/rank.ts`).  
The Discord **Member–Coach ladder** measures **community participation and coaching readiness** (`docs/COMMUNITY.md` §2).

These systems are **aligned in spirit** (process over outcome) but **not 1:1 linked**. Reaching a game rank does not auto-grant a Discord role. Discord tiers require verification, time-in-community, and human nomination where noted.

This document gives owners, coaches, and automation a shared reference for copy, cohort targeting, and future hard gates — without implying financial advice or trade recommendations.

---

## Side-by-Side Map

| In-game rank | XP threshold (TUNABLE) | Typical player milestone | Discord ladder tier | Relationship |
|---|---|---|---|---|
| **Observer** | 0 | Tutorial / first scenarios | *(none — join server as @New Arrival)* | Community onboarding is separate from sim rank. |
| **Trainee** | 200 + Beginner drills | Completing first drill gates | **Learner** (Tier 1) | Learner = verified Member who finished the game tutorial. Trainee rank is a good *invitation moment* to verify and post in `#sim-runs` — not an automatic role. |
| **Practitioner** | 800 + Intermediate stop/drawdown drills | Multi-scenario process consistency | **Learner** → **Helper** path | Helper requires 30+ days active, 20+ journal entries, debrief quality — **not** XP alone. Practitioner rank suggests readiness to *start* journal-heavy participation. |
| **Journeyman** | 2000 + Blowup drills | Advanced scenarios + live drills | **Helper** (Tier 2) nomination window | Coaches may nominate Helpers who demonstrate process reflection. Journeyman in-game is a *signal for coaches*, not a rule. |
| **Strategist** | 4500 | Top sim ladder; cohort/coaching focus | **Coach** (Tier 3) pipeline | GDD §4.5: progression ends in cohort/coaching, not endless XP. Strategist players are natural **cohort** candidates — replay review, not live-market Q&A. |
| **Senior Strategist** | 8000 | Mastery track cap | **Mentor** (Tier 4) pipeline | Mentor is Admin-approved, 90+ days as Coach, two solo cohorts. Senior Strategist is in-game recognition only. |

---

## Discord Tier Reminder (from COMMUNITY.md)

| Tier | Title | Entry (process only) |
|---|---|---|
| 1 | Learner | Verified Member; completed game tutorial |
| 2 | Helper | 30+ days active; 20+ journal entries; scenario debrief quality; Coach nomination |
| 3 | Coach | Helper 60+ days; co-facilitated one cohort; mentor approval |
| 4 | Mentor | Coach 90+ days; two solo cohorts; Admin approval |

**Hard rule:** Raw PnL, win rate, or account size are **never** entry criteria for any tier.

---

## In-Game Copy Guidelines (COACH-W1)

When the Main Menu references community coaching:

- Say **process review**, **replay review**, **journaling**, **risk frameworks**.
- Never say **signals**, **picks**, **calls**, **should I buy/sell**, or **profit targets**.
- Point players to Discord categories labeled **EDUCATION NOT FINANCIAL ADVICE**.
- Office hours and `#replay-review` are for **game mechanics and self-review technique** — not live trade Q&A.

---

## Channels by Intent

| Player need | Channel | Not this |
|---|---|---|
| Share a sim debrief / replay | `#sim-runs`, `#scenario-replays`, `#replay-review` | `#crypto-charts-analysis` with entry levels |
| Learn concepts | `#crypto-learn`, `#stocks-learn`, `#forex-learn` | Directional "watch this zone" posts |
| Cohort enrollment | `#cohort-announcements`, `#office-hours` | Paid tiers (deferred — attorney gate) |

---

## Owner / Automation Notes

- **No Discord bot integration in COACH-W1** — docs + in-game strings only.
- Any future **hard link** (e.g. auto-role from sim rank) requires owner decision + privacy/COPPA review (PERS-W2 blocked on G-2).
- Queue outbound Discord automation to owner per `OWNER_RUNBOOK.md`.

---

*Internal curriculum document. Do not publish verbatim to TradeGame---Preview without owner review.*

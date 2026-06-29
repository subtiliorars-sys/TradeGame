# TradeGame — Ideation Backlog (IDE-W1)

**Purpose:** Ranked, docs-only queue of the next safe lesson and live-drill ideas
drawn from `LESSON_SYSTEM_BRIEF.md` and `LIVE_DRILL_ENGINE_BRIEF.md`. No
implementation in this wave — registry and hygiene only.

**Ethics rail:** Education-not-advice. Process-only predicates. No PnL-ranked
output, no directive buy/sell language, no performance promises.

**Context (2026-06-28):** All 36 authored lessons in the lesson brief are shipped
(`sim/src/lessons/catalog.ts`, 36 entries). Live-session drawdown and blowup drills
(LD-W1–W6) are shipped. Open PR #63 (`feat: 12-to-4 ideation sweep improvements`)
covers unrelated engine/rank/risk code — **not** duplicated here.

**Owner merge:** Workers register ideas; owner prioritizes into future waves.

---

## Next five safe ideas

### 1. Advanced-tier lesson authoring (C-A / S-A / X-A stubs)

| Field | Value |
|---|---|
| **Source** | LESSON_SYSTEM_BRIEF §1.2, §4; ADVANCED_TIER_BRIEF.md |
| **Type** | Lesson content (authoring + port) |
| **Safety** | Advanced brief explicitly forbids signals, PnL pass/fail, and gambling loops; lessons use fictional instruments only (existing canon) |
| **Why now** | Intermediate curriculum (F-01–F-10, all pillar B/I tracks) is complete; CURRICULUM.md lists C-A01–C-A03, S-A01–S-A03, X-A01–X-A03 with no authored text yet |
| **Suggested wave** | LESS-A1 — author one pillar intro (e.g. C-A01) + port pattern from S-I05 lesson-to-scenario linkage |
| **Blocked by** | Owner sign-off on advanced scenario scope (ADVANCED_TIER_BRIEF is draft v0.1) |

---

### 2. Self-Check → scored quiz pilot (single lesson, AHC pass)

| Field | Value |
|---|---|
| **Source** | LESSON_SYSTEM_BRIEF §8.1–§8.3 |
| **Type** | Lesson UX (optional scored reflection) |
| **Safety** | Policy v1 keeps Self-Check as display-only; pilot must pass all five Anti-Headcanon Checklist (AHC-1–AHC-5) items before any gate or XP tie-in |
| **Why now** | All 36 lessons include 3 Self-Check questions already scoped to lesson text; brief flags them as future quiz seeds after formal AHC review |
| **Suggested wave** | LESS-Q1 — one foundation lesson (F-01 or F-04) as guinea pig; no rank gate until owner approves |
| **Blocked by** | Second-author AHC review (AHC-4); no quiz until expected-answer logic is authored |

---

### 3. Lesson diagram polish pass (text-first → optional static assets)

| Field | Value |
|---|---|
| **Source** | LESSON_SYSTEM_BRIEF §5.2, §9 (shopping list item 4 / COSTLY) |
| **Type** | Lesson content (art + content modules) |
| **Safety** | Diagrams are explanatory only (order flow, drawdown ladder, peg mechanics); no live prices or directional calls |
| **Why now** | Wave-1–8 shipped text-only; brief deferred static chart assets to a polish pass after curriculum port completes |
| **Suggested wave** | LESS-P1 — 3–5 high-traffic lessons (C-I01 peg, C-I03 IL, F-06 drawdown math) with `diagramKey` in content modules |
| **Blocked by** | Art pipeline / asset map convention (not defined in sim yet) |

---

### 4. Drawdown Survival — recovery end-trigger (zero-PnL proxy)

| Field | Value |
|---|---|
| **Source** | LIVE_DRILL_ENGINE_BRIEF §6 OPEN-LDED-2; DRILL_SYSTEM_BRIEF §1.4 |
| **Type** | Live drill (Type C enhancement) |
| **Safety** | Owner ruling: no PnL reads for pass predicates. Recovery detection must use process facts only — e.g. seeded position closed, no open positions remain, session clock runs to tick limit (not equity vs starting balance) |
| **Why now** | v1 drawdown drills end at tick limit or account zero; brief asks whether “return to even” ending improves pedagogy without violating zero-PnL proxy |
| **Suggested wave** | LD-W7 — optional session-end path in `DrillScenarioDef`; golden fixtures must stay byte-stable for existing three markets |
| **Blocked by** | Owner preference on OPEN-LDED-2 (tick-limit-only may be sufficient) |

---

### 5. Drawdown seed — procedural sizing on retry (v2)

| Field | Value |
|---|---|
| **Source** | LIVE_DRILL_ENGINE_BRIEF §6 OPEN-LDED-1; DRILL_SYSTEM_BRIEF §9 OPEN-5 |
| **Type** | Live drill (Type C seed path) |
| **Safety** | Target drawdown **percentage** stays authored/TUNABLE; re-computation uses deterministic sim state only — no player-specific tuning or outcome-based adjustment |
| **Why now** | v1 uses authored-static `DrillSeedConfig` (recommended for golden stability); brief recommends procedural re-compute on retry as v2 so effective drawdown % stays constant when PRNG starting price differs |
| **Suggested wave** | LD-W8 — extend `applyDrillSeed` with optional `seedMethod: "procedural_fill"` behind feature flag; new golden test, no change to pass predicates |
| **Blocked by** | Golden fixture churn risk; owner preference (authored-static is v1 default) |

---

## Explicitly out of scope for this backlog

| Item | Reason |
|---|---|
| PR #63 ideation sweep (rank hints, risk order caps) | Code improvements in flight — separate PR |
| DEPLOY-W1 staging pipeline | Owner-blocked in WAVES.md |
| Correlation awareness drills (Type E) | Spec lives in DRILL_SYSTEM_BRIEF §1.6, not LIVE_DRILL brief — track in a future DRILL ideation pass |
| DCA/rebalance sim CTAs | LESS-W7 deferred; no shipped DCA drill yet — needs DRILL_SYSTEM_BRIEF entry first |
| Real market data, broker APIs, referral flows | Worker safety rails — queue to owner |

---

## Cross-references

| Doc | Relevance |
|---|---|
| [LESSON_SYSTEM_BRIEF.md](./LESSON_SYSTEM_BRIEF.md) | Curriculum inventory, quiz policy, build shopping list |
| [LIVE_DRILL_ENGINE_BRIEF.md](./LIVE_DRILL_ENGINE_BRIEF.md) | Live drill open questions, zero-PnL proxy rulings |
| [ADVANCED_TIER_BRIEF.md](./ADVANCED_TIER_BRIEF.md) | Advanced lesson/scenario framing for idea #1 |
| [WAVES.md](../../WAVES.md) | Future queue registry (IDE-W1) |

---

*Internal design document. Education-not-advice. Last updated: 2026-06-28 (IDE-W1).*

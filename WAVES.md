# TradeGame — Wave Registry

**Purpose:** Ordered vertical slices for autonomous workers and human sessions.
Each wave is **one PR**. Workers pick the **first incomplete wave** below, implement
only that wave, run `npm run verify` in `sim/`, then open a PR. **Never merge your own PR.**

**Office hours (Option C):** Cloud worker every 2h (9–5 weekdays) + optional local
`/loop 45m` while at desk. See `OFFICE_HOURS.md`. Owner merges same day — workers
**never wait to be restarted**; next run starts the following wave automatically.

**Ethics rail (every wave):** process-only scoring; no PnL-ranked output; education
not advice. Run `npm run lint-pnl` before opening a PR.

**Status legend:** `done` | `active` | `pending` | `blocked`

---

## How workers use this file

1. List open wave-worker PRs (`automation/*` branches). **If one exists → stop** (wave in flight).
2. Fetch latest `main` — especially after owner merged since last run.
3. Find the first wave with `status: pending` or `active` (skip `blocked`).
4. Implement **only** that wave's acceptance criteria.
5. Run `cd sim && npm run verify` — all gates must pass.
6. Update this file in the PR: set wave `status: done`, add `completed:` date, PR link.
7. **Do not ask the owner to start the next wave** — the schedule or local loop handles pickup.
8. If blocked on owner decision → queue JSON to AgentCorps `fleet/owner-queue/items/`;
   pick the next non-blocked wave if one exists.

---

## Completed — Phase 2 foundation

| Wave | Title | Status | Notes |
|------|-------|--------|-------|
| P2-01 | Deterministic sim engine + golden SCN-001..003 | done | 530+ vitest tests green |
| P2-02 | Phaser UI — six scenarios playable | done | PR #8 merged 2026-06-08 |
| P2-03 | Rank/XP, gating, debrief, replay flow | done | Process-only scoring enforced |
| P2-04 | Input-screen drills (sizing + stop placement) | done | Required before scenarios |
| P2-05 | Lessons wave 1 (nine lessons) | done | PR #26 stack |
| P2-06 | SCN-004..006 + policy card + AMM IL | done | Golden fixtures locked |
| LD-W1 | Live-drill engine plumbing (events, types) | done | LIVE_DRILL §5 Wave 1 |
| LD-W2 | Position seeding (`applyDrillSeed`, forceFill) | done | wave2-seed.test.ts |
| LD-W3 | Drawdown pass predicates (zero-PnL proxy) | done | livePredicates.test.ts |
| LD-W4 | Drawdown Survival playable (×3 markets) | done | liveCatalog.ts + DrillDebriefScene |
| LD-W5 | Blow Up on Purpose drills (×3 markets) | done | blowup debrief + catalog + goldens |

---

## Active queue — implement in order

### Wave LD-W5 — Blow Up on Purpose drills

**Status:** `done`  
**Spec:** `docs/game/LIVE_DRILL_ENGINE_BRIEF.md` §5 Wave 5  
**Branch slug:** `automation/wave-ld-w5-blowup`  
**Completed:** 2026-06-13

**Scope:** Ship all three `drill:blowup-*` live-session drills end-to-end.
Classifier exists (`sim/src/drills/blowupClassifier.ts`); wire UI + catalog + debrief.

**Acceptance criteria:**
- [x] `liveCatalog.ts` (or sibling) registers `drill:blowup-crypto`, `-stocks`, `-forex`
- [x] `DrillDebriefScene` blowup path: annotated timeline, mechanism MCQ, no dollar
      values in rendered output (owner condition 2)
- [x] `ProgressStore.awardBonus()` wired for correct mechanism identification
- [x] Non-dismissible 5-second practice-account reminder at blowup session start
- [x] Golden fixtures for all three blowup drills in `tests/golden-drills.test.ts`
- [x] Red-team pass documented in PR body (classifier boundary, posture rails §8)
- [x] `npm run verify` green

**Blocked by:** none (owner approved classifier with hard conditions — see brief §6a)

---

### Wave LD-W6 — Rank gate flips (Practitioner / Journeyman)

**Status:** `done`  
**Depends on:** LD-W5  
**Spec:** `docs/game/LIVE_DRILL_ENGINE_BRIEF.md` §5 Wave 6; `DRILL_SYSTEM_BRIEF.md` §6  
**Branch slug:** `automation/wave-ld-w6-gates`  
**Completed:** 2026-06-13

**Acceptance criteria:**
- [x] All six Practitioner drills reachable from zero state (3 stop + 3 drawdown)
- [x] All three Journeyman blowup drills reachable after Practitioner
- [x] `rank.ts`: `drillsRequired` populated for Practitioner and Journeyman
- [x] `gating.ts`: hard-lock list includes drawdown + blowup drill IDs
- [x] Existing scenario golden digests **byte-identical** (no drill events leaked)
- [x] Integration test: gate blocks SCN-001 until required drills complete
- [x] `npm run verify` green

---

### Wave UX-W1 — TradingScene object churn audit

**Status:** `done`  
**Spec:** OWNER_RUNBOOK N-8 follow-up (drawOrderTicket tag-and-destroy landed; audit rest)  
**Branch slug:** `automation/wave-ux-w1-churn`  
**PR:** https://github.com/subtiliorars-sys/TradeGame/pull/48  
**Completed:** 2026-06-13

**Acceptance criteria:**
- [x] Audit all Phaser scenes for per-frame/per-keystroke object creation without destroy
- [x] Fix any confirmed leaks (position panel on stop fill; chart/ticket/journal already tagged)
- [x] Add one regression test or dev-only counter if practical (`ui-churn-guard.test.ts`)
- [x] `npm run verify` green

---

### Wave LESS-W2 — Lessons wave 2 (intermediate tier)

**Status:** `done`  
**Spec:** `docs/game/LESSON_SYSTEM_BRIEF.md` §4.4  
**Branch slug:** `automation/wave-less-w2`  
**PR:** https://github.com/subtiliorars-sys/TradeGame/pull/50  
**Completed:** 2026-06-13

**Acceptance criteria:**
- [x] Ship next lesson set per brief (C-I02, C-I04, S-I03, S-I04, X-I03, X-I04)
- [x] Each lesson: provenance tag, no directive buy/sell language
- [x] `tests/lessons.test.ts` covers new catalog entries
- [x] Cross-link from scenario prereqs where brief specifies (`scn003.ts` → `lesson:session-open-sweeps`, LESSON_SYSTEM_BRIEF §3.2)
- [x] `npm run verify` green

---

### Wave LESS-W3 — Foundation track (F-01–F-06)

**Status:** `done`  
**Spec:** `docs/game/LESSON_SYSTEM_BRIEF.md` §2.1, §4.4  
**Branch slug:** `automation/wave-less-w3-foundation-f01-f02`  
**PR:** https://github.com/subtiliorars-sys/TradeGame/pull/53  
**Completed:** 2026-06-13

**Acceptance criteria:**
- [x] Port F-01 through F-06 from `docs/lessons/FOUNDATION.md`
- [x] Drill CTAs to existing drills (foundation has no scenario gates)
- [x] `tests/lessons.test.ts` updated for foundation curriculum IDs and XP totals
- [x] `npm run verify` green

---

### Wave LESS-W4 — Foundation track (F-07–F-10)

**Status:** `done`  
**Spec:** `docs/lessons/FOUNDATION.md` §F-07–F-10  
**Branch slug:** `automation/wave-less-w4-foundation-f07-f10`  
**PR:** https://github.com/subtiliorars-sys/TradeGame/pull/55  
**Completed:** 2026-06-13

**Acceptance criteria:**
- [x] Port F-07 through F-10 (journaling, psychology, retail losses, scam defense)
- [x] Scenario or drill CTAs per shipped content (F-10 uses observe-style scenario CTA)
- [x] `tests/lessons.test.ts` updated for 19-lesson catalog and XP totals
- [x] `npm run verify` green

**Note:** Stack after **#53** (LESS-W3); rebase both after **#50** (LESS-W2) merges.

---

### Wave LESS-W5 — Lesson prereq DAG validation

**Status:** `done`  
**Spec:** `docs/game/LESSON_SYSTEM_BRIEF.md` §7.4  
**Branch slug:** `automation/wave-less-w5-prereq-dag`  
**PR:** https://github.com/subtiliorars-sys/TradeGame/pull/56  
**Completed:** 2026-06-13

**Acceptance criteria:**
- [x] `sim/src/lessons/prereqGraph.ts` — shipped curriculum edges + cycle detector
- [x] `sim/tests/lesson-prereq-dag.test.ts` — no cycles; foundation F-01..F-10 chain locked
- [x] `npm run verify` green

---

### Wave LESS-W6 — Crypto beginner track (C-B01–C-B05)

**Status:** `done`  
**Spec:** `docs/lessons/PILLAR_INTROS.md`, `docs/lessons/BEGINNER_COMPLETIONS.md`  
**Branch slug:** `automation/wave-less-w6-crypto-beginner-cb01-cb05`  
**PR:** https://github.com/subtiliorars-sys/TradeGame/pull/58  
**Completed:** 2026-06-13

**Acceptance criteria:**
- [x] Port C-B01–C-B05 into lesson modules with process checks and drill/scenario CTAs
- [x] `catalog.ts` — insert beginner chain before C-I01; 30-lesson catalog
- [x] `prereqGraph.ts` — C-B chain; C-I01 parent → C-B05 per brief §7.4
- [x] `tests/lessons.test.ts` — 30 lessons, 720 XP
- [x] `npm run verify` green

---

### Wave LESS-W7 — Stocks beginner track (S-B01–S-B04)

**Status:** `done`  
**Spec:** `docs/lessons/PILLAR_INTROS.md`, `docs/lessons/BEGINNER_COMPLETIONS.md`  
**Branch slug:** `automation/wave-less-w7-stocks-beginner-sb01-sb04`  
**PR:** https://github.com/subtiliorars-sys/TradeGame/pull/59  
**Completed:** 2026-06-13

**Acceptance criteria:**
- [x] Port S-B01–S-B04 with process checks and drill/scenario CTAs
- [x] `catalog.ts` — insert S-B chain before S-I01; 34-lesson catalog
- [x] `prereqGraph.ts` — S-B chain; S-I01 parent → S-B04 per brief §7.4
- [x] `tests/lessons.test.ts` — 34 lessons, 820 XP
- [x] `npm run verify` green

**Deferred (follow-up, not blocking merge):**
- Dedicated DCA/rebalance sim CTAs from source docs — no shipped DCA drill yet

---

### Wave LESS-W8 — Forex beginner gap fill (X-B01–X-B02)

**Status:** `done`  
**Spec:** `docs/lessons/PILLAR_INTROS.md` §X-B01–X-B02  
**Branch slug:** `automation/wave-less-w8-forex-beginner-xb01-xb02`  
**PR:** https://github.com/subtiliorars-sys/TradeGame/pull/60  
**Completed:** 2026-06-14

**Acceptance criteria:**
- [x] Port X-B01–X-B02 (pairs/pips, leverage bluntly) with drill CTAs
- [x] Insert before shipped X-B03/X-B04; rewire X-B03 parent → X-B02
- [x] `tests/lessons.test.ts` — 36 lessons, 870 XP
- [x] `npm run verify` green

---

### Wave GOV-W1 — Lesson prereq hard-flip (governance)

**Status:** `pending`  
**Spec:** `docs/game/LESSON_SYSTEM_BRIEF.md` §7.4  
**Branch slug:** `automation/wave-gov-w1-prereq-hard-flip`

**Acceptance criteria:**
- [ ] Flip gating to enforce full beginner chains (crypto, stocks, forex) before intermediate lessons
- [ ] Integration test: blocked lesson shows clear prereq path (no PnL language)
- [ ] `npm run verify` green

**Owner note:** Catalog chains complete; flip is a governance decision — queue if copy/gating needs sign-off.

---

### Wave PERS-W1 — Replay first-clear XP rule

**Status:** `done`  
**Spec:** OWNER_RUNBOOK P-8 Tier-B reminder; SIM_ENGINE_SPEC replay ethics  
**Branch slug:** `automation/wave-pers-w1-replay-xp`  
**PR:** https://github.com/subtiliorars-sys/TradeGame/pull/49  
**Completed:** 2026-06-13

**Acceptance criteria:**
- [x] XP for scenario/drill completion awards on **first clear only** per ID
- [x] Replays show debrief + coaching but do not re-award base XP (`session_reviewed` still pays on replay)
- [x] Tests lock the rule (`sim/tests/progress-replay-xp.test.ts`)
- [x] `npm run verify` green

**Note:** In-memory progress today; rule must survive future Tier-B persistence.

---

### Wave PERS-W2 — Tier-B local persistence scaffold

**Status:** `blocked`  
**Owner gate:** G-2 COPPA analysis (`OWNER_RUNBOOK.md`) before accounts ship  
**Spec:** `docs/GDD.md` §9; `GOVERNANCE.md` Tier B trigger  
**Branch slug:** `automation/wave-pers-w2-localstorage`

**Acceptance criteria:**
- [ ] `ProgressStore` persists to `localStorage` with schema version + migration stub
- [ ] Age-gate acknowledgment stored (no PII beyond boolean + timestamp)
- [ ] Export/erase path stubbed (`docs/legal/PRIVACY_DRAFT.md` aligned)
- [ ] Queue owner item if COPPA flow needs counsel input — do not ship public beta

**Blocked by:** owner COPPA gate (G-2). Worker must queue, not implement public accounts.

---

### Wave COACH-W1 — Progression ↔ coaching ladder hooks

**Status:** `done`  
**Spec:** `docs/ROADMAP.md` Phase 3; `docs/COMMUNITY.md` coaching ladder  
**Branch slug:** `automation/wave-coach-w1`  
**Completed:** 2026-06-13

**Acceptance criteria:**
- [x] Document rank milestones → Discord coaching tier mapping (`docs/COACHING_LADDER_RANK_MAP.md`)
- [x] In-game copy references coaching as process review, not trade advice (`MenuScene` + `coachingLadderHints.ts`)
- [x] No Discord bot integration (docs + UI strings only)
- [x] Queue any outbound/Discord automation to owner (noted in doc)

---

### Wave DEPLOY-W1 — Staging deploy pipeline

**Status:** `blocked`  
**Owner gate:** deploy automation + Tier B privacy policy  
**Branch slug:** `automation/wave-deploy-w1`

**Acceptance criteria:**
- [ ] CI builds `sim/dist-ui` artifact on green verify
- [ ] Deploy gate pre-push hook if deploy-on-push added (copy MM pattern)
- [ ] No secrets in repo; staging URL documented in README

**Blocked by:** owner deploy decision + G-2. Queue only until cleared.

---

## Worker safety rails

**Safe to implement without asking:**
- Next pending wave in this file (not `blocked`)
- Test/fixture additions that lock existing behavior
- UI copy that preserves education-not-advice posture
- Doc cross-links, typos, verify script improvements

**Must queue (AgentCorps `fleet/owner-queue/items/`):**
- Merge to main, deploy, secrets, COPPA/account flows
- Legal/compliance wording changes
- Real market data licensing
- Broker/referral integration
- Anything implying financial advice or performance promises

**Never in worker PRs:**
- Push to main, merge own PR, edit production configs
- PnL-based scoring or outcome leaderboards
- Real-money or broker API integration

---

## Verify command

```powershell
# Windows (local + Cursor cloud if PowerShell available)
cd sim
npm install
npm run verify
```

```bash
# Linux/macOS / GitHub Actions
cd sim && npm ci && npm run verify
```

---

*Last updated: 2026-06-13 — LESS-W8 forex beginner (X-B01–X-B02) in review; all beginner tracks in catalog.*

# TradeGame — Lesson System Brief

**Version:** 1.0
**Status:** Design — feeds Phase 3 build wave
**Date:** 2026-06-07
**Feeds:** gating.ts advisory→hard flip for lesson prereqs, Phase 3 LessonScene build,
  ProgressStore extension, CURRICULUM.md phased port
**Canon:** GDD §5/§7, COMPETITOR_RESEARCH.md (Wall Street Survivor model + Trade Bots
  autopsy), DRILL_SYSTEM_BRIEF.md §4 anti-headcanon protocol

---

## Table of Contents

1. [Curriculum Inventory — What Exists](#1-curriculum-inventory--what-exists)
2. [Lesson Catalog v1 — IDs, Tracks, Prereqs](#2-lesson-catalog-v1--ids-tracks-prereqs)
3. [ID Reconciliation — Live Scenario Prereqs vs. Authored Lessons](#3-id-reconciliation--live-scenario-prereqs-vs-authored-lessons)
4. [Wave-1 Set — What Ships First and Why](#4-wave-1-set--what-ships-first-and-why)
5. [In-Game Surface — LessonScene Design](#5-in-game-surface--lessonscene-design)
6. [Completion and XP Economy](#6-completion-and-xp-economy)
7. [Prereq Flip — Advisory to Hard](#7-prereq-flip--advisory-to-hard)
8. [Quiz Policy v1](#8-quiz-policy-v1)
9. [Build Shopping List](#9-build-shopping-list)
10. [Red-Team Surfaces](#10-red-team-surfaces)
11. [Open Questions for the Owner](#11-open-questions-for-the-owner)

---

## 1. Curriculum Inventory — What Exists

### 1.1 Source Files

| File | Track | Lesson IDs Authored |
|---|---|---|
| `docs/lessons/FOUNDATION.md` | Foundation (all pillars) | F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-09, F-10 |
| `docs/lessons/PILLAR_INTROS.md` | Crypto Beginner, Stocks Beginner, Forex Beginner | C-B01, C-B02, C-B03, S-B01, S-B02, S-B03, X-B01, X-B02, X-B03 |
| `docs/lessons/BEGINNER_COMPLETIONS.md` | Crypto Beginner (2), Stocks Beginner (1), Forex Beginner (1) | C-B04, C-B05, S-B04, X-B04 |
| `docs/lessons/CRYPTO_INTERMEDIATE.md` | Crypto Intermediate | C-I01, C-I02, C-I03, C-I04 |
| `docs/lessons/STOCKS_INTERMEDIATE.md` | Stocks Intermediate | S-I01, S-I02, S-I03, S-I04, S-I05 |
| `docs/lessons/FOREX_INTERMEDIATE.md` | Forex Intermediate | X-I01, X-I02, X-I03, X-I04 |

**Total authored lesson texts: 36**

Foundation: 10
Crypto (Beginner + Intermediate): 4 + 5 = 9 (C-B01–C-B05, C-I01–C-I04)
Stocks (Beginner + Intermediate): 4 + 5 = 9 (S-B01–S-B04, S-I01–S-I05)
Forex (Beginner + Intermediate): 4 + 4 = 8 (X-B01–X-B04, X-I01–X-I04)

### 1.2 What the Curriculum Doc Promises but is NOT Yet Authored

The following appear in `docs/CURRICULUM.md` tables or scenario comments but have no
authored text in any lesson file as of this inventory:

| ID | Where Referenced | Status |
|---|---|---|
| C-A01, C-A02, C-A03 | CURRICULUM.md Advanced rows | No text authored |
| S-A01, S-A02, S-A03 | CURRICULUM.md Advanced rows | No text authored |
| X-A01, X-A02, X-A03 | CURRICULUM.md Advanced rows | No text authored |
| `index-rebalancing-mechanics` | scn005.ts comment "S-I-supp01 (pending authoring)" | No authored text; not a formal lesson ID yet |

The 9 Advanced-tier lessons (C/S/X-A01-03) are backlog by design — ADVANCED_TIER_BRIEF.md
scopes them for a later wave. The `index-rebalancing-mechanics` item is addressed in §3.

### 1.3 Quality of Authored Content

All 36 authored lessons:
- Use fictional instruments only (GLIMMER, NGSM, ANDU/HarborUSD, NMX 100, VLDI, CALD)
- Include an explicit Paired Sim Drill or Discussion Prompt
- Include a Self-Check section (3 questions each)
- Include a Process Check question
- Have no embedded price predictions or directional recommendations
- Cross-reference the same fictional instruments the scenarios use

S-I05 is the most complete intermediate lesson — it explicitly debrief-narrates SCN-005
(VLDI) in detail, making it the clearest model for lesson-to-scenario linkage.

---

## 2. Lesson Catalog v1 — IDs, Tracks, Prereqs

Full catalog of all 36 authored lessons. The `lesson:` ID column is the canonical game
ID used in scenario manifest prereqs. Wave-1 lessons (§4) are marked **W1**.

### 2.1 Foundation Track

| Curriculum ID | Game `lesson:` ID | Title | Prereq | Duration Tier | Wave |
|---|---|---|---|---|---|
| F-01 | `lesson:what-a-market-is` | What a Market Is | none | short | W1 |
| F-02 | `lesson:order-types` | Order Types | `lesson:what-a-market-is` | standard | W1 |
| F-03 | `lesson:position-sizing` | Position Sizing | `lesson:order-types` | standard | W1 |
| F-04 | `lesson:stop-losses` | Stop-Losses | `lesson:position-sizing` | standard | W1 |
| F-05 | `lesson:risk-reward` | Risk:Reward | `lesson:stop-losses` | standard | — |
| F-06 | `lesson:drawdown-math` | Drawdown Math | `lesson:risk-reward` | standard | — |
| F-07 | `lesson:journaling` | Journaling | `lesson:drawdown-math` | standard | — |
| F-08 | `lesson:psychology-basics` | Psychology Basics | `lesson:journaling` | standard | — |
| F-09 | `lesson:why-retail-traders-lose` | Why Most Retail Traders Lose | `lesson:psychology-basics` | standard | — |
| F-10 | `lesson:scams-self-defense` | Scams and Signal-Seller Self-Defense | `lesson:why-retail-traders-lose` | standard | — |

### 2.2 Crypto Beginner Track

| Curriculum ID | Game `lesson:` ID | Title | Prereq | Duration Tier | Wave |
|---|---|---|---|---|---|
| C-B01 | `lesson:spot-mechanics-crypto` | Spot Mechanics | `lesson:position-sizing` | standard | — |
| C-B02 | `lesson:wallets-and-custody` | Wallets and Custody | `lesson:spot-mechanics-crypto` | standard | — |
| C-B03 | `lesson:crypto-sessions-volatility` | 24/7 Sessions and Volatility | `lesson:wallets-and-custody` | standard | — |
| C-B04 | `lesson:grid-strategies-how-they-work` | Grid Strategies: How They Work | `lesson:crypto-sessions-volatility` | standard | — |
| C-B05 | `lesson:grid-failure-modes` | Grid Failure Modes | `lesson:grid-strategies-how-they-work` | standard | — |

### 2.3 Crypto Intermediate Track

| Curriculum ID | Game `lesson:` ID | Title | Prereq | Duration Tier | Wave |
|---|---|---|---|---|---|
| C-I01 | `lesson:stablecoin-peg-mechanics` | Stablecoin Depegs: Mechanics | `lesson:grid-failure-modes` | standard | **W1** |
| C-I02 | `lesson:flash-crash-anatomy` | Flash Crash Anatomy | `lesson:stablecoin-peg-mechanics` | standard | — |
| C-I03 | `lesson:liquidity-pools-impermanent-loss` | Liquidity Pools and Impermanent Loss | `lesson:flash-crash-anatomy` | standard | **W1** |
| C-I04 | `lesson:volatility-regimes` | Volatility Regimes | `lesson:liquidity-pools-impermanent-loss` | standard | — |

### 2.4 Stocks Beginner Track

| Curriculum ID | Game `lesson:` ID | Title | Prereq | Duration Tier | Wave |
|---|---|---|---|---|---|
| S-B01 | `lesson:stocks-market-structure` | Market Structure (Stocks) | `lesson:order-types` | standard | — |
| S-B02 | `lesson:etfs-vs-single-names` | ETFs vs. Single Names | `lesson:stocks-market-structure` | standard | — |
| S-B03 | `lesson:long-term-vs-swing` | Long-Term vs. Swing | `lesson:etfs-vs-single-names` | standard | — |
| S-B04 | `lesson:index-investing-math` | Index Investing Math | `lesson:long-term-vs-swing` | standard | — |

### 2.5 Stocks Intermediate Track

| Curriculum ID | Game `lesson:` ID | Title | Prereq | Duration Tier | Wave |
|---|---|---|---|---|---|
| S-I01 | `lesson:earnings-seasons` | Earnings Seasons | `lesson:index-investing-math` | standard | **W1** |
| S-I02 | `lesson:earnings-gaps-form-and-fail` | Earnings Gap Mechanics | `lesson:earnings-seasons` | standard | **W1** |
| S-I03 | `lesson:sector-rotation` | Sector Rotation | `lesson:earnings-gaps-form-and-fail` | standard | — |
| S-I04 | `lesson:dividends` | Dividends | `lesson:sector-rotation` | standard | — |
| S-I05 | `lesson:index-rebalancing-mechanics` | Index Rebalance and Passive Fund Mechanics | `lesson:dividends` | standard | **W1** |

### 2.6 Forex Beginner Track

| Curriculum ID | Game `lesson:` ID | Title | Prereq | Duration Tier | Wave |
|---|---|---|---|---|---|
| X-B01 | `lesson:pairs-quotes-pips` | Pairs, Quotes, and Pips | `lesson:position-sizing` | standard | — |
| X-B02 | `lesson:forex-leverage-bluntly` | Leverage: Taught First, Taught Bluntly | `lesson:pairs-quotes-pips` | standard | — |
| X-B03 | `lesson:forex-session-windows` | Sessions and Timezones | `lesson:forex-leverage-bluntly` | standard | **W1** |
| X-B04 | `lesson:spreads-cost-of-trading` | Spreads and Cost of Trading | `lesson:forex-session-windows` | standard | **W1** |

### 2.7 Forex Intermediate Track

| Curriculum ID | Game `lesson:` ID | Title | Prereq | Duration Tier | Wave |
|---|---|---|---|---|---|
| X-I01 | `lesson:session-open-sweeps` | Session Open Liquidity Sweeps | `lesson:spreads-cost-of-trading` | standard | **W1** |
| X-I02 | `lesson:high-impact-news-events` | High-Impact News Events | `lesson:session-open-sweeps` | standard | **W1** |
| X-I03 | `lesson:carry-concept` | The Carry Concept | `lesson:high-impact-news-events` | standard | — |
| X-I04 | `lesson:why-retail-forex-loses` | Why Retail Forex Loses: The Numbers | `lesson:carry-concept` | standard | — |

---

## 3. ID Reconciliation — Live Scenario Prereqs vs. Authored Lessons

The scenario manifest files (`scn001.ts`–`scn006.ts`) reference 10 distinct `lesson:`
IDs. This section maps each to the authored lesson catalog above and resolves two
mismatches.

### 3.1 Reconciliation Table

| Scenario | Raw `lesson:` ID in manifest | Authored Lesson (§2 ID) | Status |
|---|---|---|---|
| SCN-001 | `lesson:stablecoin-peg-mechanics` | C-I01 | **EXACT MATCH** — use as-is |
| SCN-002 | `lesson:earnings-gaps-form-and-fail` | S-I02 | **EXACT MATCH** — use as-is |
| SCN-003 | `lesson:forex-session-windows` | X-B03 | **EXACT MATCH** — use as-is |
| SCN-003 | `lesson:liquidity-sweep` | X-I01 (authored as `lesson:session-open-sweeps`) | **RENAME NEEDED** — see §3.2 |
| SCN-004 | `lesson:liquidity-pools-impermanent-loss` | C-I03 | **EXACT MATCH** — use as-is |
| SCN-005 | `lesson:earnings-seasons` | S-I01 | **EXACT MATCH** — use as-is |
| SCN-005 | `lesson:index-rebalancing-mechanics` | S-I05 | **EXACT MATCH** — use as-is |
| SCN-006 | `lesson:session-open-sweeps` | X-I01 | **EXACT MATCH** — use as-is |
| SCN-006 | `lesson:high-impact-news-events` | X-I02 | **EXACT MATCH** — use as-is |
| SCN-006 | `lesson:spreads-cost-of-trading` | X-B04 | **EXACT MATCH** — use as-is |

**Result: 9 of 10 IDs match authored content exactly. 1 mismatch.**

### 3.2 Mismatch Resolution

**SCN-003 references `lesson:liquidity-sweep`.**
The authored lesson (X-I01) covers session-open liquidity sweeps. The manifest comment
reads `"lesson:liquidity-sweep"` (no context comment in the file). The authored ID in
this brief is `lesson:session-open-sweeps`, matching SCN-006's reference.

Resolution options (owner decides — see §11, Q1):

- **Option A (preferred):** Update `scn003.ts` to use `lesson:session-open-sweeps` instead
  of `lesson:liquidity-sweep`. Zero content change; one-line manifest fix. SCN-006 already
  uses the correct ID. Both scenarios then reference the same lesson, which is correct
  — both teach the sweep concept at different complexity levels.

- **Option B:** Author a separate short lesson `lesson:liquidity-sweep` as a condensed
  intro (Wave-2 backlog), keep `scn003.ts` as-is. Adds authoring burden with no
  curriculum benefit since X-I01 already exists.

This brief recommends Option A. Until resolved, gating.ts advisory logic is unaffected
(lesson prereqs are advisory in the current shipped build).

### 3.3 The `index-rebalancing-mechanics` Gap (Resolved)

SCN-005 comment read `// S-I-supp01 (pending authoring)` but the authored S-I05 text
exists in STOCKS_INTERMEDIATE.md and its title is "Index Rebalance and Passive Fund
Mechanics." The game ID `lesson:index-rebalancing-mechanics` maps to S-I05 exactly.
This was a stale authoring flag, not a genuine gap. No new content needed.

---

## 4. Wave-1 Set — What Ships First and Why

### 4.1 Selection Logic

Wave-1 contains lessons that meet at least one hard criterion:
1. A live scenario manifest already references them as a prereq (direct unblock value).
2. They are the terminal prerequisite for a Wave-1 lesson in criterion 1 (no orphaned chains).
3. They teach the concept immediately prerequisite to a shipped scenario's core mechanic
   (pedagogical minimum — the "do it now" CTA would be incoherent without them).

Lessons that meet none of these criteria go to Wave-2 backlog. The Foundation Track (F-01
through F-10) is not in Wave-1 because no scenario currently gates on Foundation lesson IDs
— the drill system will handle that prereq chain when it ships. Forcing Foundation first
would create a softlock (10 lessons before any scenario is accessible) which violates the
Wall Street Survivor "lesson-then-immediately-do" principle.

### 4.2 Wave-1 Candidate Table

| `lesson:` ID | Curriculum ID | Required by Scenario(s) | Reason for Wave-1 |
|---|---|---|---|
| `lesson:stablecoin-peg-mechanics` | C-I01 | SCN-001 | Direct scenario prereq |
| `lesson:liquidity-pools-impermanent-loss` | C-I03 | SCN-004 | Direct scenario prereq |
| `lesson:earnings-seasons` | S-I01 | SCN-005 | Direct scenario prereq |
| `lesson:earnings-gaps-form-and-fail` | S-I02 | SCN-002, SCN-005 | Direct scenario prereq; prereq of S-I01's chain |
| `lesson:index-rebalancing-mechanics` | S-I05 | SCN-005 | Direct scenario prereq |
| `lesson:forex-session-windows` | X-B03 | SCN-003, (SCN-006 chain) | Direct scenario prereq; also prereq of X-B04 |
| `lesson:spreads-cost-of-trading` | X-B04 | SCN-006 | Direct scenario prereq |
| `lesson:session-open-sweeps` | X-I01 | SCN-003 (Option A), SCN-006 | Direct scenario prereq |
| `lesson:high-impact-news-events` | X-I02 | SCN-006 | Direct scenario prereq |

**Wave-1 count: 9 lessons** spanning all three pillar tracks. These are the minimum set
that unblocks every shipped scenario's lesson prereq advisory from becoming a hard gate
without leaving players stranded.

### 4.3 Wave-1 Dependency Integrity Check

SCN-006 requires `lesson:spreads-cost-of-trading` (X-B04), which requires
`lesson:forex-session-windows` (X-B03). Both are in Wave-1. No broken chains.

SCN-005 requires `lesson:earnings-seasons` (S-I01) AND `lesson:index-rebalancing-mechanics`
(S-I05). S-I01 requires `lesson:index-investing-math` (S-B04), which is NOT in Wave-1.
This means the prereq chain for S-I01 is incomplete at Wave-1.

**Resolution for S-I05 chain:** When lesson prereqs flip to hard gates (§7), the
`earnings-seasons` lesson itself requires the full Stocks Beginner chain. Until that flip,
the Wave-1 lesson is accessible as advisory-only — consistent with current gating behavior.
The "do it now" CTA from S-I01 points at the earnings gap scenario, which players can
access immediately. No softlock.

### 4.4 Wave-2 Backlog (everything not in Wave-1)

Foundation F-01–F-10, Crypto Beginner C-B01–C-B05, Stocks Beginner S-B01–S-B04, Forex
Beginner X-B01–X-B02, Crypto Intermediate C-I02/C-I04, Stocks Intermediate S-I03/S-I04,
Forex Intermediate X-I03/X-I04. Port order within Wave-2 should follow track sequence
(Foundation first, then Beginner tracks, then remaining Intermediate).

---

## 5. In-Game Surface — LessonScene Design

### 5.1 Core Loop (seconds)

The lesson contributes to the core loop at the LEARN step:

```
LessonScene (paged read) → CTA button → DrillScene or TradingScene → Debrief → XP
```

This is the Wall Street Survivor "lesson-then-immediately-do" model explicitly validated
in COMPETITOR_RESEARCH.md. The CTA is the bridge; without it the lesson is a document,
not a game mechanic.

### 5.2 LessonScene Layout

The scene reuses the Phaser draw layer (draw.ts) and follows the PolicyCardScene/
RiskModalScene parallel-scene pattern. No new rendering engine needed.

**Structure per page:**

```
┌─────────────────────────────────────────────────────┐
│  [Track badge]  Lesson Title                [X / N] │  ← page counter, not a timer
├─────────────────────────────────────────────────────┤
│                                                     │
│  Body text — one section per page                   │
│  (markdown rendered to Phaser text + wrap)          │
│                                                     │
│  [Optional: static chart image or annotated         │
│   text diagram — authored per lesson]               │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [BACK]                              [NEXT →]       │
└─────────────────────────────────────────────────────┘
```

Final page adds the CTA section:

```
┌─────────────────────────────────────────────────────┐
│  Process Check                                      │
│  <process check question text>                      │
├─────────────────────────────────────────────────────┤
│  Put it into practice now:                          │
│  <one sentence drill/scenario description>          │
│                                                     │
│  [MARK COMPLETE + GO TO DRILL]  [MARK COMPLETE ONLY]│
└─────────────────────────────────────────────────────┘
```

"MARK COMPLETE + GO TO DRILL" calls `markLessonCompleted(id)`, awards XP, then
launches the linked drill ID or scenario ID directly. "MARK COMPLETE ONLY" does the
same without navigation — for players who already completed the paired activity.

**Completion definition:** Player reaches the final page AND the CTA has been shown.
No time-on-page gate. No minimum re-read. Reaching the last page is completion.
This matches the Trade Bots autopsy finding: time gates are a dark pattern that
punishes re-reading without teaching anything.

### 5.3 Content Modules (follow existing ui/content pattern)

Note: `sim/src/ui/content/` does not yet exist as a directory — it is the correct
destination for authored display content per the per-scenario module pattern described
in the task spec. Each lesson gets a module:

```
sim/src/ui/content/lessons/
  lesson-stablecoin-peg-mechanics.ts
  lesson-liquidity-pools-impermanent-loss.ts
  lesson-earnings-seasons.ts
  ... (one file per lesson)
```

Each module exports:

```typescript
export interface LessonContent {
  id: string;           // e.g. "stablecoin-peg-mechanics"
  title: string;
  trackBadge: string;   // e.g. "Crypto · Intermediate"
  durationTier: "short" | "standard";
  pages: LessonPage[];
  cta: LessonCta;
}

export interface LessonPage {
  heading?: string;
  body: string;          // plain text, Phaser will wrap
  diagramKey?: string;   // optional key into a static asset map
}

export interface LessonCta {
  processCheckText: string;
  practiceDescription: string;
  targetType: "drill" | "scenario";
  targetId: string;      // e.g. "SCN-001" or "drill:position-sizing-crypto"
}
```

The source text for every Wave-1 lesson already exists in `docs/lessons/`. Porting is
extraction + light reformatting, not rewriting. Page breaks go at natural section
boundaries (Teaching / Worked Example / Self-Check / Process Check).

### 5.4 Menu Entry

Add "Lessons" as a top-level card in MenuScene alongside the existing Scenarios card.
The Lessons card opens a LessonListScene showing available lessons grouped by track.
Each row shows: lesson title, track badge, completion checkmark (if completed), and
lock icon (if prereq lesson not completed — advisory display only until hard flip).

COSTLY: if the lesson list grows beyond ~20 items, a filter/tab by track becomes needed.
For Wave-1 (9 lessons) a simple scrollable list is sufficient.

### 5.5 Navigation Rules

- Lessons are accessible from the Main Menu at any time (no rank gate enforced in UI for
  Wave-1 — consistent with the "open at zero state" no-softlock requirement).
- Deep link: MenuScene can pass a lesson ID on launch (e.g., from a scenario's
  "Recommended reading" advisory text in the lock card).
- Back navigation: LessonScene "X" returns to LessonListScene, not to MenuScene, so
  players can continue browsing without losing their list position.

---

## 6. Completion and XP Economy

### 6.1 ProgressStore Extension

Mirror the drill completion pattern exactly:

```typescript
// Add to progress.ts:
const _completedLessonIds = new Set<string>();

export function markLessonCompleted(id: string): void {
  _completedLessonIds.add(id);
  // addXp() called by LessonScene with tier-appropriate value
}

export function completedLessonIds(): string[] {
  return Array.from(_completedLessonIds);
}
```

The `reset()` function must also clear `_completedLessonIds` for test parity.

### 6.2 XP Values by Duration Tier

| Tier | XP | Rationale |
|---|---|---|
| Short | TUNABLE: 15 XP | ~3 min read; F-01 "What a Market Is" is the prototype. Roughly 35–40% of a Beginner drill (40 XP). Justified: a lesson is passive relative to a drill — it provides the concept, the drill applies it under condition. |
| Standard | TUNABLE: 25 XP | ~5–10 min read; most authored lessons. Roughly 60% of a Beginner drill (40 XP) and 45% of an Intermediate drill (55 XP). |

**Justification against drill economy (DRILL_SYSTEM_BRIEF §2):**

Drills range 40 XP (Beginner) to 55 XP (Intermediate). The GDD states XP is "fixed by
lesson length" (§7 XP Sources table), which is the only published constraint. The proposed
values are lower than any drill tier because a lesson requires no demonstration of
understanding — only reading. Completing a lesson + its drill earns 25+40=65 XP or
25+55=80 XP, correctly weighting the do-it over the read-it. A player who reads every
lesson and skips all drills will have significantly lower XP than a player who does both,
which is correct process incentive.

TUNABLE: both values. If playtests show players read 2–3 lessons before attempting a
drill, consider reducing lesson XP to 10/20 to pull the balance further toward drills.
If players skip lessons entirely, raise to 20/30.

### 6.3 Once-Per-Lesson Rule

`markLessonCompleted` is a no-op if the ID is already in the set — identical to
`markDrillCompleted`. No re-read farming. Players can re-read lessons freely; XP fires
exactly once per ID per session.

OPEN: persistence across sessions is deferred to Tier B governance gate (same rule as
all ProgressStore data). Within a session, the set is authoritative.

### 6.4 Length Classification for All 36 Lessons

| Tier | Lessons |
|---|---|
| Short (15 XP) | F-01 only (the introductory "What a Market Is" is the shortest authored text by word count) |
| Standard (25 XP) | All other 35 lessons |

TUNABLE: re-classify after word-count audit of the full authored texts. A formal word
count scan before Wave-2 port should flag any lessons exceeding 1500 words for possible
split into two pages or reassignment to a "long" tier at TUNABLE: 35 XP.

---

## 7. Prereq Flip — Advisory to Hard

### 7.1 Current State

`gating.ts` (shipped): `lesson:` prereqs in scenario manifests render as advisories —
they count toward the "N supporting drills/lessons recommended" advisory string on the
menu card, but do NOT lock the scenario. The comment in `gating.ts` reads: "ADVISORY —
systems not shipped; informational only."

### 7.2 The Flip

When `markLessonCompleted` exists and LessonScene ships, `gating.ts` receives the
`completedLessonIds` array and the lesson: prereqs become hard-lockable. The flip
procedure:

1. `scenarioLockState` signature gains `completedLessonIds: readonly string[]` parameter.
2. The prereq loop that currently counts `lesson:` items as advisories gets extended to
   check `completedLessonIds.includes(lessonId)` — same structure as the existing
   `scenario:` hard-lock loop.
3. The flip is governed by the shipped-only rule already in `gating.ts`: only flip prereqs
   where the linked lesson is actually reachable by the player (i.e., its own prereq chain
   has no unshipped items that would create a softlock).

The shipped-only rule means Wave-1 lessons flip to hard immediately upon their ship.
Wave-2 lessons remain advisory until they ship. This is already the intended design in
`gating.ts` (see module header comment).

### 7.3 No-Softlock Path Analysis

For each Wave-1 lesson that will flip to hard, verify that a zero-state player can reach
it without being blocked by an unshipped prereq:

| Lesson (Wave-1) | Prereq Chain | Opens From Zero State? |
|---|---|---|
| `lesson:stablecoin-peg-mechanics` | C-I01 ← C-B05 ← ... ← C-B01 ← F-03 | Chain passes through C-B01–C-B05 which are Wave-2. **Do not hard-flip until C-B01–C-B05 ship.** |
| `lesson:liquidity-pools-impermanent-loss` | C-I03 ← C-I02 ← C-I01 ← ... | Same: C-B chain is Wave-2. **Do not hard-flip until full chain ships.** |
| `lesson:earnings-seasons` | S-I01 ← S-B04 ← ... ← S-B01 ← F-02 | Chain passes through S-B01–S-B04 which are Wave-2. **Do not hard-flip until S-B chain ships.** |
| `lesson:earnings-gaps-form-and-fail` | S-I02 ← S-I01 ← same chain | Same. **Hold.** |
| `lesson:index-rebalancing-mechanics` | S-I05 ← S-I04 ← same chain | Same. **Hold.** |
| `lesson:forex-session-windows` | X-B03 ← X-B02 ← X-B01 ← F-03 | X-B01–X-B02 are Wave-2. **Do not hard-flip until X-B01–X-B02 ship.** |
| `lesson:spreads-cost-of-trading` | X-B04 ← X-B03 ← X-B02 ← ... | Same. **Hold.** |
| `lesson:session-open-sweeps` | X-I01 ← X-B04 ← ... | Same. **Hold.** |
| `lesson:high-impact-news-events` | X-I02 ← X-I01 ← ... | Same. **Hold.** |

**Conclusion:** All 9 Wave-1 lessons have prereq chains that pass through Wave-2 lessons.
Hard-flipping Wave-1 lessons on their own would softlock a zero-state player (they could
not complete the chain to unlock the scenario). Therefore:

**Rule: Wave-1 lessons ship as ADVISORY only, consistent with current gating behavior.**
Hard flip happens in Wave-2 after the full Beginner and Foundation tracks ship. The
hard flip for any individual lesson should only fire when every lesson in its prereq
chain has been ported and verified playable.

### 7.4 Circular Prereq Check

The prereq graph for all 36 authored lessons is a DAG (directed acyclic graph): each
lesson points to exactly one parent (or null). The chains are:

- Foundation: linear chain F-01 → F-02 → ... → F-10
- Pillar Beginner tracks: each starts from a Foundation lesson (F-02 for Stocks, F-03 for
  Crypto/Forex), then chains within the pillar
- Pillar Intermediate tracks: chain from the last Beginner lesson in the same pillar

No lesson references a lesson later in the same chain. No cross-pillar prereqs exist
(each pillar track is independent after Foundation). No circular prereqs are present.

---

## 8. Quiz Policy v1

### 8.1 Audit Finding

All 36 authored lessons include a "Self-Check" section with exactly 3 questions each.
The Self-Check questions are explicitly framed as questions for the player to reflect on,
not in-game quiz gates. FOUNDATION.md and all pillar docs present them as unscored
reflection prompts co-located with lesson text.

No lesson authors a multiple-choice format, a correct/incorrect gate, or any scored quiz
mechanism. The only scored knowledge-check in the authored content is the
`blowup_mechanism_identified` prompt in the "Blow Up on Purpose" drill (DRILL_SYSTEM_BRIEF
§1.5), which is authored as part of the drill debrief, not a lesson.

**Policy v1: No in-game quiz gates for any lesson in Wave-1 or Wave-2.**

### 8.2 Rationale

The Trade Bots autopsy (COMPETITOR_RESEARCH.md) explicitly names "quizzes with
developer-headcanon answers not covered by the material [41 votes]" as the third top
failure cause. DRILL_SYSTEM_BRIEF §4 (anti-headcanon protocol) requires that any
knowledge-check question "must be answerable solely from content shown to the player in
the current session."

The Self-Check questions in the authored lessons ARE correctly scoped — every answer is
derivable from the lesson text. However, implementing them as scored gates requires:
- Authoring the expected-answer logic per question (not done)
- An anti-headcanon review pass (not done)
- A mechanism to determine pass/fail without a human reader

Until those three conditions are met for a specific lesson, do not gate on quiz
completion. The Self-Check questions remain as displayed reflection prompts only.

### 8.3 Anti-Headcanon Checklist (for future quiz authoring)

If a future wave adds scored quizzes, each question must pass all five checks before
shipping:

| # | Check | Pass Criterion |
|---|---|---|
| AHC-1 | Answer shown in text? | The correct answer appears verbatim or by direct implication in the lesson body visible to the player |
| AHC-2 | No prerequisite knowledge required? | A player who read only this lesson (not external sources) can derive the answer |
| AHC-3 | Single unambiguous correct answer? | No trick wording; only one answer is defensibly correct given the shown material |
| AHC-4 | Reviewed by a second author? | A second person who has read only the lesson text marked the correct answer without prompting |
| AHC-5 | Process-scoped only? | The question tests process understanding, never price prediction or instrument direction |

Wave-2 OPEN: the Self-Check section of each authored lesson could be the seed for future
scored quizzes — they largely pass AHC-1 through AHC-5 as written. Flag for a formal
pass at Wave-2 authoring time, not before.

---

## 9. Build Shopping List

Ordered smallest-first (reuse before new).

| # | Item | Size | Reuse / New | Depends On |
|---|---|---|---|---|
| 1 | `markLessonCompleted` + `completedLessonIds` in `progress.ts` | ~15 lines | Extend existing file | nothing |
| 2 | `reset()` extended to clear lesson IDs | 1 line | Edit existing function | item 1 |
| 3 | `gating.ts` signature extension (accept `completedLessonIds`) | ~10 lines | Edit existing function | item 1 |
| 4 | `sim/src/ui/content/lessons/` directory + first 9 lesson content modules (Wave-1 text extraction) | ~9 files, prose extraction only | New directory, new files; content from existing docs | nothing (content exists) |
| 5 | `LessonScene.ts` — paged reading scene with CTA | ~200–300 lines | New scene; reuse `draw.ts`, `panel()`/`button()`/`label()` from existing draw layer | items 1, 4 |
| 6 | `LessonListScene.ts` — browsable list grouped by track | ~150–200 lines | New scene; same draw layer | item 5 |
| 7 | `MenuScene.ts` — add Lessons card | ~10 lines | Edit existing file | item 6 |
| 8 | Advisory text on locked scenario cards: add "Read: [lesson title]" link from lock reasons | ~20 lines | Edit MenuScene card render | items 5, 7 |
| 9 | Wave-1 hard-flip (deferred — per §7.3, only after Wave-2 Foundation + Beginner tracks ship) | gating.ts loop extension | Edit existing | items 1, 3 + Wave-2 lessons |

**COSTLY:** No items in Wave-1 require new tech or art pipeline. All rendering reuses
the existing Phaser draw layer. Static chart diagrams (optional per lesson) would require
new art assets if added — defer to Wave-3 polish pass. Ship text-only Wave-1.

---

## 10. Red-Team Surfaces

| Surface | Risk | Mitigation |
|---|---|---|
| CTA navigation fires before `markLessonCompleted` | XP not awarded; lesson shows as incomplete | Ensure `markLessonCompleted` is called synchronously before `scene.launch` of the target |
| `reset()` forgets lesson completions across test runs | Test isolation failure; drills gate check breaks | Verify `reset()` clears all four sets; add to test harness coverage |
| Lesson prereq chain check omits new lessons | New lesson added to Wave-2 with a forward prereq (accidentally circular) | Add a DAG validation test that runs `completedLessonIds` prereq resolution; fail build on cycle detection |
| "MARK COMPLETE ONLY" path awards XP but no drill completes | Scenario prereq stays advisory but XP is still granted — intended; not a bug | Confirm with owner in §11 Q2 |
| Self-Check questions surface as quiz UI without the AHC pass | Headcanon quiz risk (Trade Bots failure mode) | Do not wire Self-Check questions to any scoring or gate logic; render as display text only |
| Lesson content module imports break if lesson is missing from content directory | Runtime error on LessonListScene load | LessonListScene should guard against missing modules; show "content coming soon" for unlisted IDs |
| Hard flip fires before full prereq chain is playable | Softlock at Observer state | The §7.3 per-lesson chain table is the gate; code review must check the table before any hard-flip PR merges |

---

## 11. Open Questions for the Owner

| # | Question | Blocking? | Default if Not Answered |
|---|---|---|---|
| Q1 | SCN-003 uses `lesson:liquidity-sweep`; authored lesson is `lesson:session-open-sweeps`. Approve Option A (rename in scn003.ts) or Option B (author a separate short lesson)? | Blocks hard-flip for SCN-003 specifically; does not block Wave-1 ship | Proceed with advisory; note mismatch in code comment |
| Q2 | Should "MARK COMPLETE ONLY" (CTA skip) still award lesson XP, or only award XP when the player navigates to the drill/scenario? | Affects XP economy balance; does not block build | Award XP on completion regardless of CTA navigation choice — lesson completion is reading the material |
| Q3 | Should the Lesson List be accessible from a locked scenario's advisory card (deep-link from "N lessons recommended" text)? | Nice-to-have; does not block Wave-1 | Implement deep-link in Wave-1 (item 8 on shopping list); it is small |
| Q4 | Wave-1 lessons ship without page-count display (just BACK/NEXT). Add "Page X of N" or a progress bar? | Cosmetic; does not block | Add page counter (X/N) — minimal cost, good orientation signal |

---

## AAR

**DESIGNED:**
- Full 36-lesson inventory from 6 authored source files confirmed.
- Lesson catalog v1 with canonical `lesson:` IDs mapped to every authored text (§2).
- 10 live scenario prereq IDs reconciled — 9 exact matches, 1 rename needed (§3).
- Wave-1 set of 9 lessons selected (§4): all six scenarios' lesson prereqs covered.
- LessonScene surface designed: paged reading, CTA wiring, no time gates, content
  module pattern (§5).
- XP values: 15 XP short / 25 XP standard (TUNABLE), justified against drill tiers (§6).
- Prereq flip analysis: Wave-1 lessons remain advisory; hard flip deferred to Wave-2 after
  Foundation + Beginner tracks ship; circular-prereq check passed (§7).
- Quiz policy v1: no quiz gates; Self-Check questions are display-only reflection prompts;
  AHC checklist defined for future wave (§8).
- Build shopping list: 9 items, smallest-first, all reuse existing tech (§9).

**TUNABLE:**
- Lesson XP short tier: 15 XP. Adjust down if players grind lessons to avoid drills;
  adjust up if players skip lessons entirely.
- Lesson XP standard tier: 25 XP. Same lever logic.
- Long-lesson tier (if introduced): 35 XP. Trigger: any lesson exceeding 1500 words
  on word-count audit before Wave-2 port.
- Min rationale chars for any future quiz prompt: inherit from PolicyCardScene (30 chars /
  6 words) unless playtests indicate otherwise.
- Page break cadence per lesson: 4 sections per lesson naturally = 4 pages is the baseline;
  adjust if player read-through rate data shows abandonment at specific pages.

**COSTLY:**
- Static chart diagram assets per lesson (optional polish). Estimated: 36 images if all
  lessons get one. Defer to Wave-3 art pass; text-only Wave-1 is complete without them.
- Lesson authoring tool / CMS (GDD §11 Q5). Flat-file extraction works for Wave-1 (9
  lessons). If the library exceeds 50 lessons, the authoring workflow needs tooling.
  Not a Wave-1 concern.

**OPEN:**
- Q1: scn003.ts `lesson:liquidity-sweep` rename decision (§11).
- Q2: XP on "MARK COMPLETE ONLY" path (§11).
- Q3: Deep-link from scenario lock cards to lesson list (§11).
- Q4: Page X of N counter vs. progress bar (§11).

---

*Internal design document. Do not publish to TradeGame---Preview.*

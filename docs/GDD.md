# TradeGame — Game Design Document

**Version:** 0.1 (Bootstrap)
**Status:** Draft — design intent, not final spec
**Scope:** Education simulator, v1. No real money. No financial advice. Ever.

---

## Table of Contents

1. [Vision & Pillars](#1-vision--pillars)
2. [Ethics Guardrails](#2-ethics-guardrails)
3. [Markets](#3-markets)
4. [Core Loop](#4-core-loop)
5. [Game Modes](#5-game-modes)
6. [Modes × Markets Matrix](#6-modes--markets-matrix)
7. [Progression & Coaching](#7-progression--coaching)
8. [Content Pipeline](#8-content-pipeline)
9. [Tech Sketch](#9-tech-sketch)
10. [Out of Scope — v1](#10-out-of-scope--v1)
11. [Open Questions](#11-open-questions)

---

## 1. Vision & Pillars

TradeGame teaches the *process* of trading — how to think about markets, size a position,
manage a drawdown, and review your own decisions — without touching real money or giving
buy/sell recommendations.

**Design pillars:**

| # | Pillar | One-line intent |
|---|--------|-----------------|
| P1 | Learn before you earn | Every practice session is gated or seeded by a bite-size lesson |
| P2 | Process over outcome | XP rewards discipline, journaling, and risk control — not PnL |
| P3 | Three markets, one game | Crypto, stocks, and forex are parallel first-class pillars throughout |
| P4 | Replayable and coachable | Every trade session can be replayed, annotated, and shared |
| P5 | No house edge | Zero gambling loops; progression is earned by learning, not by luck |

---

## 2. Ethics Guardrails

These are hard constraints baked into design, not optional features.

- **No financial advice.** The game never says "buy X" or "sell Y." Coaching feedback
  describes process ("your stop was too wide for your account size") not prediction.
- **No real-money integration in v1.** All portfolios are simulated. No broker/exchange
  APIs. No wallet connections.
- **No gambling mechanics.** No loot boxes, no wager loops, no random-reward pulls.
  All randomness is market simulation — not prize randomness.
- **Celebrate good process / bad outcome.** The debrief screen explicitly distinguishes
  *was the process sound* from *did the trade profit*. A well-sized, well-stopped loss
  earns full XP. A reckless winner earns a coaching flag.
- **No signals product.** "Today's top pick" screens, signal channels, or copy-trade hooks
  are permanently excluded — not deferred, excluded.

---

## 3. Markets

Three equal pillars. Every mode that ships for one market ships for all three.

| Market | Instrument types (sim) | Characteristic to teach |
|--------|------------------------|------------------------|
| **Crypto** | Spot pairs (BTC/USDT, ETH/USDT, etc.) | 24/7 sessions, high volatility, depegs, grid/ranging mechanics |
| **Stocks** | Equities (US market sim) | Session hours, earnings gaps, sector rotation, DCA/rebalance |
| **Forex** | Major pairs (EUR/USD, GBP/USD, etc.) | Session opens, carry, liquidity windows, low-volatility grind |

Market data in v1 is **synthetic or historical replay** (see §9 and §11 on licensing).
The engine is abstracted so a live-data feed can be plugged in later without redesigning
the sim layer.

---

## 4. Core Loop

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────────┐
│  LEARN      │────▶│  PRACTICE    │────▶│  REVIEW      │────▶│  PROGRESS      │
│ Bite-size   │     │ Sim trade or │     │ Replay +     │     │ XP → rank →    │
│ lesson      │     │ drill        │     │ coach debrief│     │ unlock content │
└─────────────┘     └──────────────┘     └──────────────┘     └────────────────┘
        ▲                                                               │
        └───────────────────────────────────────────────────────────────┘
```

**Learn** — 2–5 minute structured lesson (text + annotated chart). Concepts stay
market-specific (e.g., "How a crypto depegs" vs "How an earnings gap forms").

**Practice** — player opens a sim session in one of the four modes (§5). Every action is
timestamped and journaled.

**Review** — after the session closes, a debrief screen shows: entry/exit annotated on
the price chart, process metrics (position size vs. rule, stop placement, journal
completion), and a process score separate from PnL.

**Progress** — XP credited for: lesson completion, drill completion, journal entries,
trades where process metrics were met. Rank milestones unlock new scenarios and cohort
tiers.

---

## 5. Game Modes

### 5.1 Paper Trading Sandbox

An open-ended sim portfolio per market. No time pressure. Player can hold positions
across multiple sessions.

- **Crypto sandbox:** 24/7 synthetic feed, full spot pairs, manual and grid-bot orders.
- **Stocks sandbox:** US session hours enforced in sim (9:30–16:00 ET); earnings events
  can be toggled on or off.
- **Forex sandbox:** Session windows (London, NY, Tokyo, Sydney) simulated; spread widens
  outside sessions.

Portfolio state persists per player per market. A "reset portfolio" option is always
available (learning context — no stigma for starting over).

*Data note:* v1 uses synthetic feeds. Real-time data licensing is an open question (§11).

---

### 5.2 Scenario Replay

Historical or scripted market moments replayed tick-by-tick inside a controlled
time window. Player trades as the event unfolds; time can be paused to journal.

Each scenario ends with a **Debrief Screen:**
- What happened (plain-language explanation of the event)
- Where the player's entries/exits fell relative to price action
- Process score vs. community benchmark
- Common mistakes shown (anonymized aggregate)

**Example scenarios per market:**

| Market | Example scenario |
|--------|-----------------|
| Crypto | BTC flash crash (rapid liquidation cascade, price -30 % in minutes) |
| Crypto | Stablecoin depegs (algo-stable loses peg, panic spread) |
| Stocks | Earnings gap up — beat on revenue, miss on guidance |
| Stocks | Sector rotation — defensive stocks bid while tech sells |
| Forex | London open liquidity sweep (stop-hunt spike, then trend) |
| Forex | NFP release (high-impact news candle, then reversal) |

Scenarios are authored via a content template (§8). The library grows over time.

---

### 5.3 Strategy Sandbox (per-market)

A visual, low-code strategy builder where players configure a strategy and run it
against sim data — then inspect *why* it worked or failed.

**Crypto — Grid-Bot Sandbox**
Player defines a price range, grid spacing, and order size. The sim runs; grid fills are
visualized. Post-run analysis highlights:
- Ranging periods: grid performs as expected
- Trending breakout: grid accumulates one-sided exposure and bleeds — the key lesson

**Stocks — DCA / Rebalance Sim**
Player sets a recurring buy schedule and target allocation across 2–3 simulated equities.
Post-run shows cost-basis smoothing, rebalance drag/benefit, and drawdown depth vs. lump sum.

**Forex — Session / Carry Sim**
Player configures a simple carry or session-breakout rule. Sim runs across multiple
synthetic weeks. Post-run highlights the difference between a trending and a ranging
session environment.

In all three, the goal is not "find the best parameters" but "understand the failure modes."
The debrief explicitly frames why a strategy stopped working.

---

### 5.4 Risk-Management Drills

Structured mini-challenges, separate from live trading. Short, completable in 5–10 min.

| Drill type | Description |
|------------|-------------|
| Position sizing puzzle | Given account size, risk %, stop distance — calculate correct lot/share/contract size. Three market variants. |
| Drawdown survival | Starting with a sim account in drawdown, player must reach breakeven without blowing up. Rule: can't add to losers. |
| "Blow up on purpose" | Player is explicitly asked to blow up the account to feel the mechanics of overleveraging. Debrief shows exactly which decisions caused ruin. |
| Stop placement challenge | Chart shown with S/R levels; player places a stop; coach explains whether it would survive a normal wick. |
| Correlation awareness | Player holds three positions in a sim flash crash; debrief shows hidden correlation in a crisis. |

All drills are available across all three markets with market-appropriate parameters.

---

## 6. Modes × Markets Matrix

| Mode | Crypto | Stocks | Forex |
|------|--------|--------|-------|
| Paper Trading Sandbox | ✓ 24/7 synthetic feed | ✓ session hours enforced | ✓ session windows + spread |
| Scenario Replay | ✓ flash crash, depegs | ✓ earnings gaps, rotation | ✓ news events, session opens |
| Strategy Sandbox | ✓ grid-bot builder | ✓ DCA/rebalance sim | ✓ session/carry sim |
| Risk-Management Drills | ✓ all drill types | ✓ all drill types | ✓ all drill types |

No mode ships for one market without a content-complete equivalent for the other two.

---

## 7. Progression & Coaching

### XP Sources

XP is awarded for **process**, not profit.

| Action | XP granted |
|--------|-----------|
| Complete a lesson | Fixed — by lesson length |
| Complete a risk drill | Fixed — by drill difficulty |
| Trade with correct position size (within 10 % of rule) | Per trade |
| Trade with stop placed before entry | Per trade |
| Write a post-trade journal note | Per trade |
| Complete a full scenario replay + debrief | Fixed |
| Re-review a past session (replay) | Bonus |
| Profitable trade *where process was also sound* | No extra XP — process XP already covered it |

A reckless winner earns a coaching flag, not extra XP. A disciplined loser earns full XP.
This is surfaced explicitly in the UI.

### Ranks

Ranks gate cohort entry and unlock scenario library tiers. Suggested progression:

`Observer → Trainee → Practitioner → Journeyman → Strategist → Senior Strategist`

Ranks are earned by XP + minimum drills completed, not by PnL milestones.

**Leaderboard constraint:** any leaderboard or ranking display in the game is process-scored only. No PnL ranking component — not in any view, mode, or optional display. This is a hard design constraint, not a UI preference. See RISK_REGISTER → Game-Specific.

### Replay Sharing & Coaching Hooks

- Players can share a replay link for any completed session.
- Community coaches (and future coach-role accounts) can add timestamped annotations to
  the replay — not signals, only process observations.
- Coach dashboard (future, not v1) aggregates common mistakes across a cohort.

---

## 8. Content Pipeline

New scenarios and lessons follow a template so the library can grow without bespoke
engineering per item.

### Lesson Template

```
title:          <string>
market:         crypto | stocks | forex | all
prerequisite:   <lesson_id or null>
duration_min:   <int>
body:           <markdown>
chart_annotations: []   # timestamped notes on an annotated chart
quiz:           []      # 1–3 multiple-choice questions, no trick questions
```

### Scenario Template

```
id:             <string>
title:          <string>
market:         crypto | stocks | forex
event_type:     flash_crash | earnings_gap | news_event | depegs | session_open | ...
data_source:    synthetic | historical_anonymized
tick_data:      <file ref>
time_window_min: <int>
debrief:
  summary:      <markdown — what happened and why>
  common_mistakes: []
  process_checklist: []
```

### Strategy Sandbox Config Template

```
id:             <string>
market:         crypto | stocks | forex
strategy_type:  grid | dca_rebalance | session_carry
parameters:     {}    # market-specific knobs
sim_data_ref:   <file ref>
failure_modes:  []    # explicitly listed so debrief can flag them
```

Authors never embed price predictions or trade recommendations in any template. Debrief
copy explains mechanics, not what the player "should have done" to maximize profit.

---

## 9. Tech Sketch

High-level only. No premature commitments.

**Platform:** Web-first (desktop browser). TypeScript. Canvas rendering or a lightweight
2D engine (Pixi.js, Phaser) for the chart + order-book layer. Mobile-responsive layout
deferred.

**Sim engine:** Deterministic, seeded. Given the same seed + player actions, a scenario
replays identically — this is what enables replay sharing and coach annotation. Engine
ingests a normalized tick-data format; market-specific adapters translate raw historical
or synthetic feeds into that format.

**Data layer abstraction:** One interface (`IMarketFeed`) with three v1 implementations:
synthetic generator, historical replay loader, and a stub for future live-data. Swapping
in a licensed live feed later requires only a new adapter, not engine changes.

**State:** Player portfolio, XP, journal entries, and replay refs stored server-side (user
account). Replay tick data can be client-cached.

**Governance gate:** storing accounts, portfolios, or journals at Phase 2 triggers governance Tier B requirements — privacy policy, data retention schedule, breach response plan, and COPPA review — BEFORE shipping to users. An age screen at account creation is mandatory. Do not ship account persistence without this gate cleared. See ROADMAP.md Phase 2 compliance gate and `GOVERNANCE.md`.

**Coaching annotation layer:** Timestamped comment objects attached to a session ID.
Stored separately from the sim state so they can be added post-hoc without mutating the
original replay.

---

## 10. Out of Scope — v1

The following are permanently excluded or explicitly deferred.

| Item | Status |
|------|--------|
| Real-money integration of any kind | Permanently excluded |
| Broker or exchange API connections | Permanently excluded — v1 and beyond until explicit design review |
| Buy/sell signal product | Permanently excluded |
| NFTs, tokens, or crypto-native rewards | Permanently excluded |
| Multiplayer trading floors / competitive PvP | Deferred |
| Mobile native app (iOS/Android) | Deferred |
| Live real-time data feeds | Deferred (licensing open question — §11) |
| Copy-trade or social-trade features | Deferred — not until process-coaching model is mature |
| Coach dashboard (full) | Deferred to post-v1 |

---

## 11. Open Questions

| # | Question | Blocking? |
|---|----------|-----------|
| Q1 | Real-time data licensing — can we use a free-tier feed (e.g., CoinGecko for crypto, polygon.io for stocks) under educational terms, or do we build pure-synthetic v1? **Tracked as a risk-register entry with a hard gate: no real or historical data integration without explicit license review. Note: "educational use" is NOT a recognized carve-out in CoinGecko or polygon.io ToS.** | Blocks live data only; synthetic unblocks v1 |
| Q2 | Historical data licensing — anonymized replays of real events: what provenance / licensing is needed per market? **Same hard gate as Q1 — no historical data integrated without license review; "educational use" exemption does not apply.** | Blocks scenario replay library; scripted synthetic events unblock MVP |
| Q3 | Rank/cohort model — are cohorts per-market, cross-market, or both? | Design decision, not blocking build |
| Q4 | Coach role — separate account type or a rank gate? | Blocks coaching feature; deferred to post-v1 |
| Q5 | Lesson authoring tool — in-app CMS or flat-file + git? | Blocks content scale; flat-file works for v1 |

---

## Appendix — Design Document Index

Supporting documents that expand on sections of this GDD. Read on demand, not upfront.

| Document | What it covers |
|----------|---------------|
| `docs/game/SCENARIOS_V0.md` | Full authored spec for the three v0 scenarios: SCN-001 HarborUSD Depegging, SCN-002 Northgate Systems Earnings Gap, SCN-003 London Open Sweep on ANDU |
| `docs/game/SCENARIOS_V1.md` | Full authored spec for the three v1 scenarios: SCN-004 GLIMMER Pool (impermanent loss), SCN-005 NMX 100 Index Inclusion Day, SCN-006 Employment Report on ANDU |
| `docs/game/SIM_ENGINE_SPEC.md` | Sim engine technical specification: tick-data format, scenario file schema, replay determinism, market adapters |
| `docs/game/TEST_PLAN.md` | QA test plan covering order mechanics, fee/spread calculations, coaching-filter rules, and process-scoring correctness |
| `docs/game/FICTIONAL_CANON.md` | Authoritative registry of all fictional instruments used in TradeGame content; collision-check records and standing rules |
| `docs/CURRICULUM.md` | Full curriculum map: Foundation Track, three Pillar tracks (Crypto/Stocks/Forex), and Advanced track; lesson IDs and sequencing |
| `docs/lessons/` | Individual lesson source files (FOUNDATION.md, PILLAR_INTROS.md, and future lesson docs) |

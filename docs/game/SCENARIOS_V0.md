# TradeGame — Scenario Library V0

**Status:** Phase 2 vertical-slice content. Three scenarios, one per market.
**Data posture:** All tick data is SYNTHETIC — generated price series shaped on archetype
event profiles. No real or historical market data is used. RISK_REGISTER §23 gate applies:
no real data without license review.
**Token / ticker naming:** All asset names are fictional (RISK_REGISTER §20).
**Ethics compliance:** No buy/sell guidance, no PnL-scored outcomes, process-scored only.

---

## Scenario Index

| ID | Title | Market | Event Type | Difficulty |
|----|-------|--------|------------|------------|
| SCN-001 | The HarborUSD Depegging | Crypto | Stablecoin depeg | Intermediate |
| SCN-002 | Northgate Systems — Earnings Gap and Fade | Stocks | Earnings surprise gap | Intermediate |
| SCN-003 | London Open Sweep on ANDU | Forex | Session-open whipsaw | Intermediate |

All three require completion of the relevant prerequisite drills (listed per scenario).
None are available to Observer rank — minimum Trainee.

---

## SCN-001: The HarborUSD Depegging

### Overview

A synthetic stablecoin (HarborUSD) loses its 1.00 USD peg during a period of
market stress. The depeg unfolds over approximately 40 minutes of compressed sim time.
Players must decide whether to act, when to act, and how to size any position — in a
market where speed, panic, and uncertainty are the structural hazards.

**Market:** Crypto (spot)
**Event type:** Stablecoin depeg
**Archetype:** Algorithmic stablecoin depeg cascade (historical archetype — no specific protocol or date named)
**Data source:** Synthetic generator (regime-switching, depeg event hook)
**Time window:** 40 minutes sim time (compressible to 10 min at 4x)
**Pair displayed:** HarborUSD/USVC (USVC = a second fictional stable used as quote currency)

> Note: HarborUSD is a fictional asset. Any resemblance to real tokens is incidental.
> The scenario teaches depeg mechanics as a category of market event, not analysis of
> any real protocol.

---

### Learning Objectives

1. **Recognize a depeg signal early and separate signal from noise** — a temporary
   deviation from 1.00 looks identical to the start of a full collapse; players learn to
   read volume and depth alongside price.
2. **Size correctly when volatility is extreme and direction is unknown** — if any trade
   is taken, the lesson is: account-risk % stays fixed; position size shrinks as price
   swings widen, not the reverse.
3. **Understand that "doing nothing" is a valid, high-process decision** — waiting for
   clarity, journaling observations, and not trading the chaos is full-XP behavior.
   This is made explicit in the debrief.

---

### Timeline Beat-by-Beat

Granularity: 1-minute candles displayed; underlying tick data at 10-second resolution.

| Clock | Phase | Price (HarborUSD/USVC) | Volume | What happens |
|-------|-------|-----------------|--------|--------------|
| T-10 to T0 | Pre-event context | 0.9990 – 1.0005 | Low-normal | Normal ranging. Price holds near 1.00. Spread is tight (0.001). Order book balanced. A lesson card is shown: "HarborUSD is an algorithmic stable. Read the depth chart — what holds the peg?" |
| T0 | First deviation | 0.9975 | Spike | A single large sell order prints. Price dips to 0.9975. Volume 3x normal. This is Decision Point A. |
| T+2 to T+5 | Partial recovery attempt | 0.9978 – 0.9990 | Elevated | Protocol mechanism attempts peg defense. Price recovers partially. Looks like a false alarm. Spread widens slightly. |
| T+6 | Second leg down | 0.9930 | High | A second sell cascade. Bid side thins. Spread jumps to 0.008. Decision Point B. |
| T+8 to T+15 | Panic cascade | 0.9930 → 0.9400 | Extreme | Sell-side dominates. 10-second candles visible. Depth chart shows bid wall evaporating. Price moves 2–5% per minute. Decision Point C. |
| T+16 to T+25 | Dead-cat bounce | 0.9400 → 0.9650 | High | Price recovers 200–250 bps on short covering. Looks like stabilization. Spread: 0.015. |
| T+26 to T+35 | Terminal leg | 0.9650 → 0.7800 | Extreme | Final collapse leg. Any stop placed above 0.96 is triggered. Protocol fails publicly (a news-ticker overlay fires). |
| T+36 to T+40 | Resolution / freeze | 0.7800 – 0.8100 | Declining | Price oscillates at new lower level. Volume fades. Scenario ends. Player cannot trade after T+38. |

---

### Player Decision Points

**Decision Point A — T0, first deviation**

| Player action | What it teaches |
|---------------|-----------------|
| Short HarborUSD immediately, full account risk | Teaches: oversizing into uncertain signal. Coaching flag for violating size rule. |
| Short HarborUSD with ≤1% account risk, stop at 1.005 | Teaches: early entry requires a tight stop — honors size rule, risk contained. |
| Do nothing, journal observation | Teaches: patience — single tick anomaly is insufficient signal. Full XP. |
| Buy HarborUSD expecting mean reversion | Teaches: mean-reversion assumption in a depeg is a common mistake — covered in debrief. |

**Decision Point B — T+6, second leg**

| Player action | What it teaches |
|---------------|-----------------|
| Add to an existing short without adjusting stop | Teaches: adding to a winner in extreme vol without re-sizing the stop is a process error. |
| Open new short, size reduced for wider spread | Teaches: correct adaptation — spread cost changes the math. |
| Close any long opened at A | Teaches: fast-exit discipline when thesis fails. |
| Still waiting, update journal | Teaches: the "wait for confirmation" strategy is coherent — debrief validates it. |

**Decision Point C — T+8, cascade underway**

| Player action | What it teaches |
|---------------|-----------------|
| Chase the move with a large short | Teaches: chasing into a parabolic move — slippage simulated, fill price shown vs. expected. |
| Exit existing positions, bank the gain | Teaches: discretionary exit during chaos. Debrief explores: was this early or right? |
| Hold through the dead-cat bounce | Teaches: holding a working trade through volatility — stop placement determines whether this survives. |
| Open a long on the bounce at T+16 | Teaches: catching a falling knife in a structural break. Debrief names this error explicitly. |

---

### Debrief Screen Content

**What happened:**
HarborUSD lost its algorithmic peg when selling pressure exceeded the protocol's
reserve capacity. The initial dip at T0 was a genuine early warning, but protocol defense
briefly restored price. The T+6 break confirmed structural failure; the T+16 bounce was
short-covering in a broken market, not recovery. The terminal leg at T+26 completed the
collapse. This is an archetype event: initial ambiguity, partial recovery, then collapse
faster than most traders can react cleanly.

**What good process looked like:**
- Recognizing that a stablecoin depeg creates extreme uncertainty in both directions
  and that the size of any position must reflect that uncertainty — not the size of the
  potential move.
- Having a stop placed before entry, at a level that defines maximum loss in account %
  terms.
- Journaling the observation at T0 even if no trade was taken.
- Waiting for the T+6 confirmation before acting was a valid, documented process choice.

**Explicit callout — good process can still lose money here:**
A short opened at T+6 with a 1% account-risk stop above 1.00 gets stopped out during
the T+2–T+5 dead-cat recovery. This is a correct-process, losing trade. The debrief
shows this outcome explicitly and awards full XP for it. The point: in a depeg event,
even well-stopped entries may be faked out. That is not a process failure; it is a
market condition.

**Common errors (shown with anonymized aggregate data):**
- Overlarge position opened at T0 before confirmation (most common)
- Long entered on the T+16 bounce as a mean-reversion play
- Adding to a losing long position during the cascade
- No stop set before entry

---

### Process-Scoring Rubric

| Behavior | XP earned | Notes |
|----------|-----------|-------|
| Journal entry written at or before first trade | +20 XP | Required for any trade XP to be awarded |
| Position size within 10% of account-risk rule | +30 XP | Per trade |
| Stop placed before entry (logged before fill) | +25 XP | Per trade |
| Stop honored (not manually cancelled) | +20 XP | Per trade |
| No trade taken + journal observation written | +40 XP | "Patience" reward — equal to a well-executed trade |
| Scenario debrief completed | +30 XP | Flat, regardless of outcome |
| Re-review session later (replay) | +10 XP | Bonus |

**What does NOT earn XP:**
- PnL amount (profit or loss in USVC has zero weight)
- Speed of entry
- Catching the exact top/bottom
- Winning the trade

**Reckless-winner flag** (coaching alert, not XP penalty):
If a player profits but violated the size rule or had no stop, the debrief shows a
coaching flag: "You won this trade. Your process had gaps that could have caused a
large loss on the next one." The flag is informational; no XP is subtracted.

TUNABLE: XP values above are first-pass. Playtest target: a clean run (all behaviors)
should yield ~175 XP; a patience-only run (no trades) should yield ~70 XP; a reckless
winner should yield ≤50 XP (process metrics missed).

---

### Difficulty and Prerequisite Drills

**Minimum rank:** Trainee
**Prerequisites (must be completed before scenario unlocks):**
- Drill: Position Sizing Puzzle (Crypto variant)
- Drill: Stop Placement Challenge (one attempt minimum)
- Lesson: "How a stablecoin peg works" (crypto lesson library)

**Why this is Intermediate:**
- The dead-cat bounce at T+16 is a deliberate trap for players who learned "short the
  depeg" without understanding structural breaks.
- Spread widening during the cascade makes the slippage simulation non-trivial to account
  for in sizing.

---

### UI Beats

- **T-10 to T0:** Lesson card overlay on the depth chart. Player must dismiss it to
  trade. This forces engagement with the setup context.
- **T0:** Subtle audio cue (volume spike notification tone). No alarm — players who
  miss it experience what inattention costs.
- **T+6:** Spread indicator on the order entry panel turns amber (visual cost-of-trading
  signal, not a buy/sell prompt).
- **T+8–T+15:** Candle speed increases visually (10-second resolution visible). Screen
  text: "Market is moving fast. Check your plan."
- **T+16:** News ticker fires: "HarborUSD protocol defense mechanism under stress — status
  unclear." No price prediction. Factual only.
- **T+26:** News ticker fires: "HarborUSD protocol posts notice of reserve depletion." The
  collapse accelerates.
- **T+38:** Trade entry disabled. Text: "Scenario ending — review your positions."
- **Post-scenario:** Journal prompt must be completed before debrief unlocks.

---

## SCN-002: Northgate Systems — Earnings Gap and Fade

### Overview

Fictional equity Northgate Systems (ticker: NGSM) beats revenue expectations but misses
forward guidance. The stock gaps up on open, runs briefly, then fades through the gap
and closes near lows. Players trade the gap, the run, and the fade across a 60-minute
sim window covering pre-market through the first hour of the regular session.

**Market:** Stocks (US session)
**Event type:** Earnings gap up — revenue beat, guidance miss
**Archetype:** Classic "buy the rumor, sell the news" gap-and-fade
**Data source:** Synthetic generator (session-hours enforcer, earnings event hook)
**Time window:** 60 minutes sim time (compressible to 15 min at 4x)
**Session coverage:** 08:00 – 09:30 pre-market, 09:30 – 10:00 regular session
**Ticker displayed:** NGSM (fictional)

> Note: Northgate Systems does not exist. Any resemblance to real companies or tickers
> is coincidental. The scenario teaches earnings-gap mechanics as a market archetype.

---

### Learning Objectives

1. **Interpret the structure of an earnings gap** — price and volume together tell the
   story; the gap magnitude alone does not determine whether to trade.
2. **Discipline around the open: the "no-trade zone" first 5 minutes** — price discovery
   at open creates whipsaw conditions; entering in the first 5 minutes of the regular
   session is an identifiable common error that the debrief addresses directly.
3. **Recognize the fade signal and respond without chasing** — the fade is identifiable
   in hindsight; the lesson is what observable conditions preceded it, and how to wait
   for confirmation rather than anticipate.

---

### Timeline Beat-by-Beat

Granularity: 5-minute candles regular session; 15-minute candles pre-market.

| Clock | Phase | Price (NGSM) | Volume | What happens |
|-------|-------|-------------|--------|--------------|
| 08:00 – 09:00 | Pre-market context | $42.10 prior close; gap to $48.20 at 08:00 | Very low | Earnings released after prior close. Pre-market price discovery. Volume thin. Spread wide ($0.30). Lesson card: "NGSM beat revenue by 4% but missed forward guidance. What does the market typically do next?" |
| 09:00 – 09:30 | Pre-market drift | $48.20 → $48.80 | Building slowly | Price grinds up on low volume. Retail enthusiasm. Spread narrows to $0.15 approaching open. Decision Point A (plan before open). |
| 09:30 | Regular session open | $48.80 → spike to $50.10 | High | Opening print gaps up further. Large spread ($0.40) in first 90 seconds. Wild 5-min candle. Decision Point B. |
| 09:31 – 09:35 | No-trade zone | $50.10 → $49.20 | Very high | Price whipsaws. Anyone who chased the spike at open is underwater. Spread normalizes to $0.08 by 09:35. |
| 09:35 – 09:45 | Initial run | $49.20 → $50.50 | High | Momentum buyers push price to session high. Looks like gap-and-go. Decision Point C. |
| 09:45 – 09:55 | Fade begins | $50.50 → $48.90 | High | Volume shifts. Large sell-side prints visible on tape. Institutional distribution visible in level 2 (simplified sim view). Decision Point D. |
| 09:55 – 10:00 | Resolution | $48.90 → $47.80 | Declining | Price fades through the opening gap, closes below prior-close area. Scenario ends. |

---

### Player Decision Points

**Decision Point A — 09:00, pre-market drift (plan phase)**

| Player action | What it teaches |
|---------------|-----------------|
| Write a trade plan in journal: "I will buy a breakout above $50.10 with a stop at $48.50 and a 1% account risk." | Teaches: pre-session planning. This is the correct process behavior; the plan may or may not work, but the behavior earns XP. |
| Write a plan to short any fade below $48.80 | Teaches: planning for the fade scenario — equally valid process. |
| No journal entry, watch only | Teaches: no plan = no XP for the session regardless of outcome. Debrief flags this. |

**Decision Point B — 09:30, opening print spike**

| Player action | What it teaches |
|---------------|-----------------|
| Buy at market on open | Teaches: chasing into wide spread and open-candle chaos. Slippage simulated. This is the highest-volume error in the debrief aggregate. |
| Wait (honor a pre-market "no trade first 5 minutes" rule) | Teaches: session-open discipline. Full XP if journaled. |
| Short the spike immediately | Teaches: countertrend into the open — high-risk, wide spread, no confirmation. |

**Decision Point C — 09:35, initial run to session high**

| Player action | What it teaches |
|---------------|-----------------|
| Buy breakout above $50.10 (prior session spike high) | Teaches: breakout entry — valid if planned, with a stop below $49.20. Debrief asks: was this in the pre-market plan? |
| Hold existing long from earlier (if opened at A) | Teaches: managing a planned trade through volatility. Stop placement reviewed. |
| Start journaling the volume shift | Teaches: tape-reading behavior — the volume pattern here precedes the fade signal. |

**Decision Point D — 09:45, fade confirmation**

| Player action | What it teaches |
|---------------|-----------------|
| Exit long on fade signal | Teaches: disciplined exit when thesis reversal is observable. |
| Short the fade below $49.80 (breakdown entry) | Teaches: trend-change entry — requires a clear plan, appropriate sizing for remaining session window. |
| Hold long, widen stop | Teaches: the classic "hold and hope" error. Stop-widening after entry is a process failure; debrief names it. |
| Exit everything, log observations | Teaches: risk-off when the move is unclear — full XP if journaled. |

---

### Debrief Screen Content

**What happened:**
Northgate Systems beat quarterly revenue by 4% but missed its forward guidance range.
The gap up on the open reflected initial enthusiasm on the revenue beat. The guidance miss
was embedded in the release; institutions reading it distributed into retail buyers through
the 09:35–09:45 run. The fade through the gap is a well-documented archetype: when
guidance disappoints, the initial gap becomes overhead resistance as early holders exit.

**What good process looked like:**
- Writing a trade plan before the session open — including the specific entry condition,
  stop level, and account-risk percentage — so any action taken was deliberate.
- Waiting through the no-trade zone (first 5 minutes of the regular session) before
  acting.
- Reading the volume shift at 09:45 as a distribution signal rather than a dip to buy.
- Exiting a long position when the thesis (continued momentum) was visibly invalidated.

**Explicit callout — good process can still lose money here:**
A breakout buy above $50.10 at 09:37 with a stop at $49.20 follows good process: it is
planned, sized at 1% account risk, and entered after the no-trade zone. If stopped out
at $49.20 during the fade, that is a correct-process loss — the stop did its job. The
debrief shows this trade, marks it as correct process, and awards full XP. The distinction
from a reckless long held through $47.80 is made explicit.

**Common errors:**
- Market buy at the 09:30 open spike (most common, worst slippage)
- No pre-session journal plan
- Adding to a losing long after the fade confirmed
- Stop-widening after entry ("giving it room")

---

### Process-Scoring Rubric

| Behavior | XP earned | Notes |
|----------|-----------|-------|
| Trade plan written in journal before 09:30 open | +25 XP | Plan must include entry condition, stop, account-risk % |
| No trade in first 5 minutes of regular session | +15 XP | Applies only if player honored a pre-stated rule; not a free reward for inaction |
| Position size within 10% of account-risk rule | +30 XP | Per trade |
| Stop placed before entry | +25 XP | Per trade |
| Stop honored (not manually cancelled) | +20 XP | Per trade |
| Exit journal entry written within the session | +20 XP | Covers "why I exited" |
| Scenario debrief completed | +30 XP | Flat |
| Re-review session later | +10 XP | Bonus |

**What does NOT earn XP:**
- Dollar PnL or percentage return on the position
- Whether the player caught the high or the low
- Trade count

TUNABLE: Full clean run target ~175 XP; plan-only run (no trades, full journal) ~70 XP.

---

### Difficulty and Prerequisite Drills

**Minimum rank:** Trainee
**Prerequisites:**
- Drill: Position Sizing Puzzle (Stocks variant)
- Drill: Stop Placement Challenge (one attempt)
- Lesson: "How earnings gaps form and fail"

**Why this is Intermediate:**
- The dead-cat at 09:35–09:45 is a deliberate "gap-and-go" false signal.
- Pre-market and regular-session data simultaneously on screen — two timeframes, wider
  spread in pre-market, is a new concept for beginners.

---

### UI Beats

- **08:00:** Pre-market indicator active (amber label: "Pre-market — spreads are wider,
  volume is thin"). Order entry allowed but the spread cost is shown prominently.
- **09:00 – 09:30:** Journal panel auto-opens with prompt: "Write your plan for the
  session open." Player can dismiss but the dismissal is logged.
- **09:30:** Audio cue (session bell). Visual: spread indicator spikes red for 90
  seconds. Screen text: "Regular session open — spreads typically normalize in the first
  few minutes."
- **09:31 – 09:35:** "No-trade zone" overlay available (player can toggle a personal
  rule flag; if flagged and honored, XP is awarded; if flagged and violated, debrief
  notes the discrepancy).
- **09:45:** Tape-reading panel highlights volume candle with a subtle pulse — not a
  buy/sell signal, a "something changed" marker that requires interpretation.
- **10:00:** Trade entry disabled. Journal prompt opens: "What did you observe? What
  would you do differently?"

---

## SCN-003: London Open Sweep on ANDU

### Overview

Fictional forex major pair ANDU (modeled on the profile of a high-liquidity major) opens
the London session with a stop-hunt sweep below a prior Asian-session low, followed by
a sharp reversal and directional trend for the remainder of the scenario. Players must
decide whether the initial move is a breakout or a sweep, how to size into the reversal,
and whether to hold through noise or exit early.

**Market:** Forex (spot, major pair)
**Event type:** Session-open liquidity sweep and reversal
**Archetype:** London open stop-hunt sweep on a major pair
**Data source:** Synthetic generator (session-window enforcer, sweep event hook)
**Time window:** 60 minutes sim time (compressible to 15 min at 4x)
**Pair displayed:** ANDU (fictional; profile shaped on a high-liquidity major)
**Pip size:** 0.0001 (standard 4-decimal major)
**Starting spread:** 1.2 pips (tightens to 0.8 pips by 08:10 London time)

> Note: ANDU is a fictional pair. The scenario teaches session-open mechanics and
> liquidity sweep patterns as a category of market event.

---

### Learning Objectives

1. **Distinguish a breakout from a stop-hunt sweep** — the initial move looks like a
   breakout; the sweep hypothesis requires reading volume, candle body/wick ratio, and
   speed of reversal.
2. **Understand how spread and slippage affect entries at session open** — the lesson is
   quantitative: same position size, different spread, materially different risk.
3. **Hold a plan during noise without widening stops** — the post-sweep trend contains
   two pullbacks; players learn whether their stop placement survived without being
   manually cancelled.

---

### Timeline Beat-by-Beat

Granularity: 5-minute candles; underlying tick resolution at 5 seconds during the sweep.

Reference price levels (synthetic, in ANDU units):
- Asian-session range high: 1.2845
- Asian-session range low (target for sweep): 1.2790
- Post-sweep reversal high: 1.2870
- Session close (scenario end): 1.2862

| Clock (London) | Phase | Price (ANDU) | Spread | What happens |
|----------------|-------|-------------|--------|--------------|
| 07:45 – 07:59 | Asian session close / context | 1.2810 – 1.2830 | 2.1 pips | Low volume, price holding mid-range. Lesson card: "The Asian session established a range. London often tests the extremes on open — what does the order book show at 1.2790?" |
| 08:00 | London open | 1.2830 → 1.2818 | 3.8 pips (spike) | Spread widens sharply on open. Price begins moving. Decision Point A. |
| 08:01 – 08:04 | Sweep leg | 1.2818 → 1.2783 | 2.5 pips | Price breaks below Asian low (1.2790) — the sweep target. Fast movement. 5-second ticks visible. Decision Point B. |
| 08:05 – 08:07 | Rejection and reversal | 1.2783 → 1.2812 | 1.5 pips | Price reverses sharply. Large buy-side volume. Wick below 1.2790 visible on the 5-min candle. Spread normalizes. Decision Point C. |
| 08:08 – 08:25 | Trend leg 1 | 1.2812 → 1.2851 | 0.9 pips | Price trends upward with moderate pullbacks. First pullback to 1.2835 at 08:15. Decision Point D (manage open position). |
| 08:25 – 08:40 | Consolidation | 1.2851 → 1.2842 | 0.8 pips | Price consolidates. Volume drops. A second shallow pullback to 1.2840. |
| 08:40 – 09:00 | Trend leg 2 | 1.2842 → 1.2870 | 0.8 pips | Continuation to session high. Decision Point E (hold or exit). |
| 09:00 – 09:45 | Slow drift and scenario close | 1.2870 → 1.2862 | 0.8 pips | Price drifts slightly lower. Scenario ends at 09:45. |

---

### Player Decision Points

**Decision Point A — 08:00, London open**

| Player action | What it teaches |
|---------------|-----------------|
| Sell ANDU immediately on the initial drop | Teaches: chasing into spread-spike. Slippage + spread cost shown; fill price vs. intent displayed. |
| Wait for spread to normalize | Teaches: spread awareness — quantified cost of impatience shown in pips per unit. |
| Journal: "Asian low is 1.2790 — watching for sweep behavior" | Teaches: pre-trade hypothesis formation. Full XP for observation + journal. |

**Decision Point B — 08:02, sweep below Asian low**

| Player action | What it teaches |
|---------------|-----------------|
| Short ANDU below 1.2790 (breakout trade) | Teaches: breakout entry at the sweep — this is the trap. Debrief examines what the wick/body ratio indicated about conviction. |
| Do nothing, wait for reversal signal | Teaches: patience during the sweep is the highest-XP behavior if journaled. |
| Buy ANDU with a stop below 1.2775 | Teaches: anticipating the reversal — valid hypothesis, but entry ahead of confirmation. Stop placement defines whether this trade works. |

**Decision Point C — 08:07, rejection candle visible**

| Player action | What it teaches |
|---------------|-----------------|
| Buy ANDU above 1.2800 after seeing the wick and reversal | Teaches: confirmation entry after the sweep — this is the intended "good process" entry for this scenario. |
| Exit any short taken at B (stop hit or discretionary close) | Teaches: recognizing when a trade thesis failed and cutting cleanly. |
| Add to a short position | Teaches: doubling down on a failed thesis — the most common error in the debrief aggregate. |

**Decision Point D — 08:15, first pullback during trend**

| Player action | What it teaches |
|---------------|-----------------|
| Hold position (stop not hit) | Teaches: trusting the plan and the stop. Debrief: what would have happened if the stop was widened here? |
| Exit on the pullback | Teaches: early exit during a trend. Debrief compares this to the full outcome. Valid process if planned. |
| Manually cancel stop / widen it | Teaches: stop-widening is a process failure. If done here, coaching flag fires. |

**Decision Point E — 08:50, trend leg 2 high**

| Player action | What it teaches |
|---------------|-----------------|
| Exit at target (if pre-stated in plan) | Teaches: honoring a pre-set target. Full XP if the target was in the journal before entry. |
| Hold through scenario close | Teaches: holding through the drift. Debrief compares actual outcome to plan. |
| Add a second position on the continuation | Teaches: pyramiding — valid advanced concept, flagged as "not covered in this scenario; visit the pyramiding lesson." |

---

### Debrief Screen Content

**What happened:**
At London open, ANDU swept below the Asian-session low of 1.2790 — a liquidity level
where sell stops were clustered. The sweep ran stops below that level, then reversed
sharply as institutional buy orders absorbed the selling. The large wick below 1.2790
on the 5-minute candle was the sweep signature. After the reversal, ANDU trended to
1.2870 across the session.

The initial move (08:00–08:04) was not a breakout — it was a liquidity sweep. The
distinguishing features: extreme wick relative to body, rapid reversal, and the speed
at which price left the broken level. Breakouts tend to consolidate at the broken level;
sweeps reject it immediately.

**What good process looked like:**
- Not entering during the spread spike at 08:00.
- Forming a sweep hypothesis before entry — journaling "this looks like a sweep, I am
  watching for reversal at 1.2800."
- Waiting for the rejection candle (08:07) to confirm before entering long.
- Setting a stop below the sweep low (1.2775 or tighter) to define risk in pips before
  entry, then converting to account-risk %.
- Not widening the stop during the 08:15 pullback.

**Explicit callout — good process can still lose money here:**
A long entered at 08:07 confirmation with a stop at 1.2775 costs 37 pips of risk per
unit. At 1% account risk, position size is smaller than many players expect. If price
had continued lower and hit 1.2775, the stop would have been correct process. A player
who entered at 08:07, set the stop at 1.2775, and got stopped out before the reversal
would receive full XP. The scenario outcome (a profitable trend) does not retroactively
validate a wider stop or larger size.

**Common errors:**
- Entering on the initial drop at 08:00 into the spread spike
- Shorting the sweep below 1.2790 without recognizing the sweep pattern
- Stop-widening during the 08:15 pullback
- No pre-trade hypothesis or journal entry

---

### Process-Scoring Rubric

| Behavior | XP earned | Notes |
|----------|-----------|-------|
| Hypothesis journaled before first trade | +25 XP | "I think this is a sweep because..." |
| No entry during spread spike (08:00 – 08:03) | +15 XP | Only if spread-awareness rule was pre-stated in journal |
| Position size within 10% of account-risk rule | +30 XP | Per trade |
| Stop placed before entry | +25 XP | Per trade |
| Stop honored (not widened or cancelled) | +20 XP | Per trade |
| Exit reason journaled | +15 XP | Brief text required |
| Scenario debrief completed | +30 XP | Flat |
| Re-review session later | +10 XP | Bonus |

**What does NOT earn XP:**
- Pip count gained
- Whether the player caught the reversal point
- Total account % return

TUNABLE: Full clean run target ~170 XP; observation-only run (no trades, full journal)
~70 XP.

---

### Difficulty and Prerequisite Drills

**Minimum rank:** Trainee
**Prerequisites:**
- Drill: Position Sizing Puzzle (Forex variant — requires converting pip risk to lot size)
- Drill: Stop Placement Challenge (one attempt)
- Lesson: "Forex session windows and how London open works"
- Lesson: "What is a liquidity sweep?"

**Why this is Intermediate:**
- Spread arithmetic at forex open is quantitative and unfamiliar.
- The sweep vs. breakout distinction requires reading wick/body ratio, which is a
  multi-variable judgment, not a binary rule.
- Two pullbacks during the trend leg test whether players can hold without stop-widening.

---

### UI Beats

- **07:45 – 07:59:** Session context panel shows: current spread, Asian-session range
  marked on chart (high and low lines with labels). No buy/sell annotation — just the
  levels.
- **08:00:** Spread indicator turns red and shows the pip value in large text for 60
  seconds. Audio: session-open tone. Screen text: "London session open. Spread elevated."
- **08:01 – 08:04:** Tick resolution increases (5-second candles available on a
  sub-chart). The sweep is visible in detail. No UI annotation — player must interpret.
- **08:07:** Spread indicator returns to green. The reversal candle is visible. Journal
  prompt appears (dismissible): "What do you observe about this candle?"
- **08:15:** Pullback visible. If player has a stop set, the stop line is shown on the
  chart. If player manually edits the stop here, a coaching note fires: "You moved your
  stop after entry. This will be reviewed in your debrief."
- **09:00 onwards:** Slower pace, volume bar drops. No prompts — player manages the
  remaining position.
- **09:45:** Trade entry disabled. Post-trade journal opens.

---

## Scenario Authoring Template

Distilled from SCN-001, SCN-002, SCN-003. Use this for every subsequent scenario.

```yaml
id:             SCN-XXX
title:          <descriptive title>
market:         crypto | stocks | forex
event_type:     depeg | earnings_gap | session_sweep | flash_crash | news_event | ...
archetype_note: <one sentence: what real-world event type this models, without naming
                  real tokens, tickers, or companies — per RISK_REGISTER §20>
data_source:    synthetic   # always synthetic until RISK_REGISTER §23 gate cleared
time_window_min: <int>      # sim minutes at 1x
tick_resolution: <e.g. "10-second ticks, 1-min candles displayed">
instrument:     <fictional name and note that it is fictional>

learning_objectives:
  - <LO 1: process-focused, e.g. "size correctly when volatility is extreme">
  - <LO 2>
  - <LO 3>   # max 3; each must map to a player decision point

timeline:
  # Beat-by-beat table: clock | phase | price | volume/spread | what happens
  # Each phase must contain at least one decision point or observable teaching moment
  - clock: <T0 or clock time>
    phase: <name>
    price: <synthetic value or range>
    volume_or_spread: <descriptor>
    what_happens: <plain text>
    decision_point: <A | B | C | ... | null>

decision_points:
  - id: A
    timing: <clock>
    player_actions:
      - action: <what player can do>
        teaches: <one sentence on the lesson>
      # 3–4 actions per decision point; include at least one "patience/observe" option
      # that earns full XP — per GDD ethics (no-trade is a valid strategy)

debrief:
  what_happened: <plain-language explanation, no financial advice language>
  good_process_summary: <3–5 bullets on observable process behaviors>
  good_process_can_lose_callout: |
    <Required field. Describe a specific correct-process losing outcome in this scenario.
     Name the entry, stop, and outcome. Confirm it earns full XP.>
  common_errors:
    - <error 1>
    - <error 2>
    - <error 3>

scoring_rubric:
  # Table: behavior | XP | notes
  # Required rows: journal entry, position size, stop placed, stop honored, debrief
  # Required NOT-XP section: PnL, speed, catching exact level
  xp_rows:
    - behavior: <string>
      xp: <int>
      notes: <string>
  not_xp:
    - <what explicitly does NOT earn XP — must be listed>
  tunable_note: |
    TUNABLE: full-clean-run target XP ~<int>; patience-only target ~<int>.
    Adjust in playtest.
  reckless_winner_flag: |
    <Describe: if a player profits but violated process metrics, what coaching flag fires
     and what text is shown. No XP subtracted — information only.>

prerequisites:
  rank: <Observer | Trainee | Practitioner | ...>
  drills:
    - <drill name and variant>
  lessons:
    - <lesson id or title>

difficulty_rationale: |
  <Why this is rated at its difficulty level. Name the specific trap or ambiguity
   that makes it harder than a beginner scenario.>

ui_beats:
  # List key UI moments: what the player sees/hears and when
  # Must include: session/context markers, spread/volume indicators, journal prompts,
  #   trade-entry disabled point, post-scenario journal gate
  - clock: <timing>
    element: <UI element name>
    behavior: <what it does — no buy/sell prompts allowed>
```

**Template enforcement notes:**
- `archetype_note` must not name real companies, real tokens, or real historical dates.
- `good_process_can_lose_callout` is mandatory — no scenario ships without it.
- `not_xp` must explicitly list PnL as a non-scoring metric.
- `data_source` is always `synthetic` until RISK_REGISTER §23 gate is cleared by
  license review.
- Any UI beat that functions as a buy/sell prompt is a design violation — remove it.
- Debrief copy must not contain language that implies a trade "should have" been taken
  for maximum profit.
```

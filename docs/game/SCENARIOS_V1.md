# TradeGame — Scenario Library V1

**Status:** Phase 2 vertical-slice content. Three intermediate-tier scenarios, one per market.
**Data posture:** All tick data is SYNTHETIC — generated price series shaped on archetype
event profiles. No real or historical market data is used. RISK_REGISTER §23 gate applies:
no real data without license review.
**Token / ticker naming:** All asset names are fictional (RISK_REGISTER §20).
**Ethics compliance:** No buy/sell guidance, no PnL-scored outcomes, process-scored only.
**Curriculum refs:** Lessons C-I03, S-I01 (index-inclusion variant, scenario catalog slot),
X-I02. See docs/CURRICULUM.md for lesson grids and rank gates.

---

## Scenario Index

| ID | Title | Market | Event Type | Difficulty |
|----|-------|--------|------------|------------|
| SCN-004 | The GLIMMER Pool — Impermanent Loss | Crypto (AMM) | Liquidity pool price divergence | Intermediate |
| SCN-005 | NMX 100 Index Inclusion Day | Stocks | Index-rebalance inclusion front-run and fade | Intermediate |
| SCN-006 | The Employment Report on ANDU | Forex | Scheduled high-impact news event | Intermediate |

All three require completion of the relevant prerequisite drills listed per scenario.
Minimum rank: Trainee. None available to Observer rank.

Prerequisites from V0 that must be completed first are noted per scenario.

---

## SCN-004: The GLIMMER Pool — Impermanent Loss

### Overview

A fictional AMM (automated market maker) trading pair, HarborUSD/GLIMMER, offers a
liquidity provision opportunity. The player deposits into the pool, observes GLIMMER price
diverge from the deposit price, and must decide when (and whether) to withdraw — weighing
accumulated fee income against the impermanent loss created by price divergence. The
scenario runs over a 90-minute compressed sim window representing approximately three days
of pool activity.

**Market:** Crypto (AMM liquidity provision)
**Event type:** Liquidity pool price divergence
**Archetype:** AMM impermanent loss as GLIMMER price moves away from deposit price
(historical archetype — no specific protocol, chain, or token named)
**Data source:** Synthetic generator (AMM pricing curve, fee accrual hook, divergence event)
**Time window:** 90 minutes sim time (compressible to 22 min at 4x)
**Assets displayed:** HarborUSD (fictional stable, USVC-denominated quote) / GLIMMER (fictional
volatile asset); pool displayed on fictional "ArcSwap" DEX interface

> Note: HarborUSD, GLIMMER, and ArcSwap are fictional. The scenario teaches impermanent
> loss mechanics as a category of LP behavior, not analysis of any real protocol.
> HarborUSD appears here in its non-depegging state — a stable baseline. This is not a
> depeg scenario; it is a divergence scenario.

---

### Learning Objectives

1. **Build intuitive IL math** — players must estimate, before withdrawing, whether fee
   income has outpaced the divergence loss. The lesson is the calculation, not the answer.
2. **Understand that "APY is not free money"** — high advertised pool APY exists only
   because price divergence risk is the cost. The scenario makes this cost visible and
   denominated in USVC.
3. **Recognize when withdrawing is the rational decision** — holding the raw assets
   ("HODL baseline") is compared to the LP position at every checkpoint; the player learns
   to read this comparison, not to always prefer one outcome.

---

### Core Mechanic: The IL Dashboard

Before any scenario action, the player receives a brief tool introduction — the "LP
Position Panel." This panel displays four values at all times:

- **Current pool value** (HarborUSD + GLIMMER share, in USVC)
- **HODL baseline** (what the deposited assets would be worth if held outright)
- **Fees earned** (cumulative, in USVC)
- **Net position vs. HODL** = Pool value + Fees earned − HODL baseline

When Net position vs. HODL is negative, the player is losing to impermanent loss net of
fees. When it is positive, fees have more than compensated. The scenario is designed so
this line crosses zero at least once in each direction.

TUNABLE: The LP Position Panel is the primary teaching surface. If playtests show players
ignore it, the panel should be made mandatory-glance via a checkpoint quiz before each
decision point unlocks.

---

### Timeline Beat-by-Beat

Granularity: 15-minute candles (compressed sim); each candle represents approximately 1
hour of pool activity. Fee accrual visible per candle.

Synthetic price levels (GLIMMER in USVC):
- Deposit price: 4.20
- Peak divergence: 6.85 (Phase 3)
- Post-correction level: 5.40 (scenario close)

| Clock | Phase | GLIMMER Price | Fee Accrual | What happens |
|-------|-------|--------------|-------------|--------------|
| T-05 to T0 | Setup — deposit decision | 4.20 | None yet | Lesson card on AMM mechanics shown. LP Position Panel introduced. Player chooses deposit amount (bounded 10–40% of sim account). Decision Point A (whether and how much to deposit). Spread on GLIMMER spot: 0.008. |
| T0 to T+15 | Stable period | 4.20 – 4.35 | Low (0.3% of deposit) | GLIMMER drifts slightly. Fees begin accruing. IL is minimal (< 0.1%). LP Position Panel shows Net vs. HODL essentially flat. A lesson card fires: "When price stays near your deposit price, IL is small and fees accumulate cleanly." |
| T+15 to T+30 | First divergence leg | 4.35 – 5.10 | Moderate (0.7% cumulative) | GLIMMER rises 21% from deposit price. IL formula visible in-panel: approximately 0.45% IL at this divergence. Fees (0.7%) still outpace IL (0.45%) — Net vs. HODL remains slightly positive (≈ +0.25%); the divergence risk is only beginning. Decision Point B. |
| T+30 to T+50 | Acceleration | 5.10 – 6.85 | High (1.4% cumulative) | GLIMMER at +63% from deposit price. IL now approximately 2.9%. Fees at 1.4% — net vs. HODL is roughly −1.5%. HODL baseline is visibly higher than pool value. Decision Point C (primary IL decision). |
| T+50 to T+65 | Plateau and high-fee window | 6.85 – 6.75 | Very high (2.1% cumulative by T+65) | GLIMMER consolidates. Price divergence stops widening. Fee accrual continues at its highest rate (high volume on price plateau). Net vs. HODL narrows to approximately −0.65% (IL roughly flat while fees keep accruing). Decision Point D (hold for fees vs. crystallize the loss). |
| T+65 to T+80 | Partial correction | 6.75 – 5.40 | Moderate (2.5% cumulative by T+80) | GLIMMER corrects back toward deposit price. IL narrows (approximately 0.8% at 5.40). Fees continue. Net vs. HODL improves to approximately +1.7% — net positive. Decision Point E (exit while ahead or hold for more fee accrual). |
| T+80 to T+90 | Resolution | 5.40 – 5.55 | 2.7% cumulative | Price stabilizes. Scenario ends. If still in pool: final LP Position Panel snapshot vs. HODL displayed. |

---

### Player Decision Points

**Decision Point A — T-05 to T0, deposit decision**

| Player action | What it teaches |
|---------------|-----------------|
| Deposit 10% of sim account — within the deposit floor | Teaches: sizing within a defined allocation rule. XP awarded for writing the sizing rationale in journal before confirming deposit. |
| Deposit 40% of sim account — at the ceiling | Teaches: maximum exposure to IL risk. Not flagged as wrong — teaches that the ceiling exists as a defined rule, not an open invitation. Journal required to receive XP. |
| Decline to deposit; observe only | Teaches: observing a new instrument type without committing capital is a valid process choice. Full XP if journal entry written explaining the reason. |
| Deposit without writing journal rationale | Teaches: LP positions require the same pre-trade documentation as any other position. No XP for the deposit action itself; debrief flags the missing journal. |

**Decision Point B — T+20, first divergence (~21% price move)**

| Player action | What it teaches |
|---------------|-----------------|
| Hold position; update journal with IL estimate | Teaches: active position monitoring. Player must type an estimate of IL percentage — the LP Position Panel shows the actual; comparing them teaches the math. |
| Withdraw at slight net loss | Teaches: early exit at manageable cost. Valid process if the original plan stated a divergence threshold. Debrief evaluates whether a threshold was pre-stated. |
| Increase deposit size (add to the pool) | Teaches: adding to an LP position while price is diverging amplifies IL exposure. Coaching flag fires explaining the math. |

**Decision Point C — T+40, major divergence (~63% price move, IL ~2.9%)**

This is the primary teaching moment of the scenario. Players who are still in the pool
face the clearest version of the IL-vs-fees comparison.

| Player action | What it teaches |
|---------------|-----------------|
| Withdraw now; crystallize the ~−4.4% net loss vs. HODL | Teaches: cutting a losing LP position when divergence has materially exceeded fee income. Valid process if divergence threshold was pre-stated. |
| Hold and journal: "I will hold because fee accrual rate is high and I believe price will correct" | Teaches: the thesis-based hold. Full XP if the reasoning is written and a withdraw trigger is defined (e.g., "I will withdraw if divergence exceeds 80% from deposit price"). |
| Hold without journaling a trigger | Teaches: holding an LP position with no exit plan. Coaching flag fires: "Holding without a defined exit converts a strategy into hope." No XP for this action. |
| Withdraw and go long GLIMMER spot separately | Teaches: unbundling the LP position into directional exposure — a valid but more complex decision flagged as "see the carry lesson for unbundling mechanics." Out of scope for this scenario; coaching note fires. |

**Decision Point D — T+55, plateau, highest fee window**

| Player action | What it teaches |
|---------------|-----------------|
| Hold; update journal entry noting fee accrual rate vs. IL cost | Teaches: quantitative position monitoring. The lesson is reading the rate-of-change, not the absolute level. |
| Withdraw; accept the −3.7% net vs. HODL outcome | Teaches: exiting when the hold thesis is unclear. Valid if documented. |
| Set a conditional exit note: "I will withdraw if GLIMMER falls below 6.00" | Teaches: defining a price-based exit trigger for an LP position. XP for the journal action. This is treated as equivalent to a stop in process terms. |

**Decision Point E — T+72, partial correction, net briefly positive**

| Player action | What it teaches |
|---------------|-----------------|
| Withdraw while net vs. HODL is positive (+0.4%) | Teaches: exiting when the LP has recovered and fees have compensated. Valid process — debrief notes this is the "fees won" outcome. |
| Hold looking for more fee accrual | Teaches: the continuing LP trade. Valid if a new trigger is defined. Debrief compares the T+90 outcome to the T+72 exit. |
| Journal: "I had no withdrawal trigger defined and I am not sure what to do" | Teaches: the planning gap. Full XP for honest self-assessment in journal. Debrief addresses this directly. |

---

### Debrief Screen Content

**What happened:**
HarborUSD/GLIMMER on ArcSwap offered a high-APY liquidity pool. During the scenario,
GLIMMER increased 63% from the deposit price, creating an impermanent loss of approximately
2.9% at peak divergence. Fee income had accrued to approximately 1.4% by that point — a
net deficit of approximately 1.5% vs. simply holding the raw assets. When GLIMMER corrected
to 5.40 (a 21% drop from peak), IL narrowed to approximately 0.8% and cumulative fees
reached 2.5%, making the LP position net positive.

The key insight: IL is not a fixed cost. It is a live comparison between the LP position
and a HODL baseline. It narrows when price returns toward the deposit price and widens
when price moves further away. Fee income accrues continuously and can outpace IL when
the pool sees high volume at a relatively stable price. The APY figure shown at deposit
time is calculated on trailing fee data and assumes the current price environment continues —
an assumption this scenario shows is not guaranteed.

**What good process looked like:**
- Writing a journal entry before deposit stating the deposit size rationale and at minimum
  one withdrawal trigger (a divergence threshold, a time-stop, or a net-vs-HODL floor).
- Reading the LP Position Panel at each decision point, specifically the Net vs. HODL line.
- Estimating IL before looking at the panel value — practicing the math builds intuition.
- Defining a new withdrawal trigger after any decision to hold, rather than holding open-ended.

**Explicit callout — good process can still lose money here:**
A player who deposits at T0 with a journal entry stating "I will withdraw if net vs. HODL
falls below −3%," who monitors the panel at each checkpoint, and who withdraws at Decision
Point C when net vs. HODL reaches approximately −4.4% has followed good process and taken
a net loss vs. a HODL position. The debrief shows this outcome, marks it as correct process,
and awards full XP. The loss vs. HODL is the cost of the strategy under the price conditions
that occurred. It is not a process failure.

**Common errors:**
- Depositing without writing a withdrawal trigger in the journal (most common)
- Adding to the pool when price is already diverging (amplifies IL mid-scenario)
- Holding through major divergence with no exit plan, then withdrawing reactively at the
  worst point
- Conflating high APY at deposit time with a guaranteed yield — APY is a trailing fee rate,
  not a forward promise

---

### Process-Scoring Rubric

| Behavior | XP earned | Notes |
|----------|-----------|-------|
| Journal entry written before deposit with stated deposit size rationale | +25 XP | Required for any position XP to be awarded |
| Withdrawal trigger defined in journal before or at deposit | +20 XP | A divergence %, net-vs-HODL floor, or time-stop qualifies |
| LP Position Panel consulted and IL estimate written at Decision Point C | +25 XP | Player must type an estimate; panel shows actual; gap is the lesson |
| Withdrawal trigger honored (not ignored when hit) | +20 XP | Per trigger; applies if a trigger was defined |
| Observation-only run (no deposit) + full journal | +40 XP | "Patience" reward — equal to a well-executed LP position |
| Withdrawal trigger updated after any decision to hold | +15 XP | Demonstrates ongoing active management vs. passive neglect |
| Scenario debrief completed | +30 XP | Flat, regardless of outcome |
| Re-review session later (replay) | +10 XP | Bonus |

**What does NOT earn XP:**
- Net USVC gain or loss vs. HODL baseline
- The absolute size of the deposit
- Whether the player exited before or after the price correction
- APY percentage accumulated

**Reckless-winner flag** (coaching alert, not XP penalty):
If a player holds through the full scenario and ends net positive vs. HODL at T+90 but
never defined a withdrawal trigger and never wrote a journal entry, the debrief shows:
"Your LP position ended slightly ahead of a HODL strategy. Your process had a gap: no
withdrawal trigger was defined, so this outcome depended on the price correction occurring.
A scenario where price kept rising would have produced a different result with the same
process." Flag is informational; no XP is subtracted.

TUNABLE: XP values above are first-pass. Full clean run target ~185 XP; observation-only
run (no deposit, full journal) ~70 XP; reckless winner (no trigger, no journal, happened
to end positive) should yield ≤30 XP.

---

### Difficulty and Prerequisite Drills

**Minimum rank:** Trainee
**Prerequisites (must be completed before scenario unlocks):**
- SCN-001 completed (HarborUSD Depegging) — establishes HarborUSD familiarity and
  extreme-volatility process habits; GLIMMER pool is the non-depeg, slow-divergence
  contrast
- Lesson C-I03: "Liquidity pools and impermanent loss" (CURRICULUM.md)
- Drill: Position Sizing Puzzle (Crypto variant)
- Drill: Stop Placement Challenge (one attempt — establishes the pre-entry trigger habit
  that this scenario extends to LP withdrawal triggers)

**Why this is Intermediate:**
- The "LP position vs. HODL baseline" comparison requires tracking two quantities
  simultaneously — not a single price chart.
- IL is not immediately visible as a loss on the position display; it only appears when
  compared to the HODL baseline. Players who do not use the LP Position Panel miss the
  core teaching mechanic.
- The scenario ends with a net-positive outcome possible, which risks reinforcing "LP
  positions always recover" — the debrief must counter this explicitly.

---

### UI Beats

- **T-05:** LP Position Panel introduced with a mandatory two-screen explainer (can be
  skipped on replay). Panel is always visible once dismissed. No dismiss-and-hide option.
- **T0:** Deposit confirmation screen requires a journal field (minimum 20 characters).
  If left blank, deposit is blocked with message: "Write your deposit rationale and a
  withdrawal trigger before confirming."
- **T+15:** LP Position Panel pulses gently. Screen text: "Price has moved. Check your
  panel. How does the fee-vs-divergence comparison look?"
- **T+40 (Decision Point C):** Full-screen checkpoint. Panel shown enlarged. Player must
  type an IL estimate before the checkpoint unlocks. Actual IL shown after estimate is
  submitted — gap displayed visually (player estimate vs. actual).
- **T+55:** If no withdrawal trigger is in the journal, a coaching note fires: "You have
  been in this pool for a while with no documented exit plan. Define one now or note your
  reason for continuing." Not blocking — informational.
- **T+72:** If net vs. HODL turns positive, a neutral marker fires on the panel:
  "Net position vs. HODL is positive. This is a data point, not a signal."
- **T+90:** Scenario ends. LP Position Panel shows a three-line summary: pool value at
  T0, pool value at T+90, HODL value at T+90. Post-scenario journal prompt opens before
  debrief unlocks.

---

## SCN-005: NMX 100 Index Inclusion Day

### Overview

A fictional mid-cap stock, Veldara Industrial (ticker: VLDI), is announced as an upcoming
addition to the fictional NMX 100 — a large-cap synthetic index of 100 fictional
names tracked by passive funds. Players observe the announcement, the multi-day price run
leading into the effective inclusion date, the closing-auction volume spike on inclusion
day, and the post-inclusion fade. The scenario covers the period from announcement through
five simulated trading sessions.

**Market:** Stocks (US session)
**Event type:** Index-rebalance inclusion front-run and post-inclusion fade
**Archetype:** Passive-fund forced buying on index inclusion; late-chaser fade
(historical archetype — no specific index, company, or date named)
**Data source:** Synthetic generator (multi-session enforcer, inclusion announcement
hook, auction volume spike)
**Time window:** 90 minutes sim time representing 5 trading sessions
(compressible to 22 min at 4x; each session = 18 min at 1x)
**Session coverage:** 5 simulated full sessions; closing auction visible on Day 5
**Ticker displayed:** VLDI (fictional) — "Veldara Industrial, a mid-cap fictional
manufacturer; inclusion in NMX 100 announced Day 1 pre-market"

> Note: Veldara Industrial and the NMX 100 do not exist. Any resemblance to real
> companies, indices, or tickers is coincidental. The scenario teaches index-inclusion
> mechanics as a market archetype. No existing index, real or hypothetical, is named.

---

### Learning Objectives

1. **Distinguish mechanical flow from fundamentals** — the price run into inclusion day
   is caused by anticipated passive-fund buying, not a change in Veldara's business.
   Players learn to label the driver correctly.
2. **Understand why chasing an announced inclusion late is poor process** — the earlier
   in the run a position is entered, the more of the mechanical flow benefit remains; the
   later it is entered, the more the player is buying from someone selling into that flow.
   The scenario makes this timing visible.
3. **Understand closing-auction mechanics and why they matter** — passive funds must own
   VLDI at the closing price on the effective date; the auction creates a predictable
   volume spike that is observable and teachable.

---

### Timeline Beat-by-Beat

Granularity: 15-minute candles within each session; closing-auction candle shown separately.

Synthetic price levels (VLDI in USD):
- Pre-announcement close: $31.40
- Day 1 open (post-announcement): $33.80 (+7.6%)
- Day 3 high: $36.50
- Day 5 auction print: $37.80
- Day 5 closing price (post-auction): $37.20
- Day 7 (two sessions post-inclusion, scenario extension): $34.60

Session abbreviations: D1 = inclusion-announcement day, D5 = effective inclusion date.

| Session | Phase | Price (VLDI) | Volume | What happens |
|---------|-------|-------------|--------|--------------|
| Pre-D1 (context) | Pre-announcement context | $31.40 | Normal | VLDI trading normally. Lesson card shown: "This is Veldara Industrial. It is a mid-cap fictional manufacturer. Nothing has changed about its business today. Observe its order book and volume." |
| D1 open | Announcement gap | $31.40 → $33.80 | Very high | Pre-market: NMX 100 announces VLDI will be added on D5. Regular open: VLDI gaps up. Spread widens ($0.28). Large volume in the first 30 minutes. Decision Point A. |
| D1 remainder | Run-up begins | $33.80 – $34.50 | High | Momentum buyers enter. Price grinds up through the session. Spread normalizes to $0.06. Lesson card: "Who is buying here? Passive funds must wait until D5 — they are not buying yet." |
| D2 | Continued grind | $34.50 – $35.60 | Elevated | Price continues upward. Volume declining slightly from D1. A consolidation midday. Decision Point B. |
| D3 | Peak run momentum | $35.60 – $36.50 | Elevated | Fastest intraday moves of the pre-inclusion window. Retail momentum at its peak. Breadth of buying visible on tape. Decision Point C. |
| D4 | Fade before inclusion | $36.50 – $36.10 | Normal, declining | Smart-money distribution. Price dips slightly. Some of the early entrants selling into continued buying. Spread steady $0.06. |
| D5 open to 15:50 | Inclusion day pre-auction | $36.10 – $37.20 | Rising into close | Normal session activity. Price firming ahead of auction. Volume builds from 15:30 onward. |
| D5 15:50 – 16:00 | Closing auction | Auction print: $37.80 | Extreme — single spike | Passive index funds execute required buys. Auction print $0.60 above the 15:50 price. Volume bar 8–12x the daily average. Decision Point D (auction mechanics education). |
| D5 close | Post-auction | $37.80 → $37.20 | Declining sharply | Price immediately reverts from auction print. Regular session ends at $37.20. |
| D6 – D7 (extension, 2 sessions) | Post-inclusion fade | $37.20 → $34.60 | Below-average | Passive funds are done buying. Momentum buyers exit. No more mechanical demand. Price fades over two sessions to $34.60. Decision Point E. |

---

### Player Decision Points

**Decision Point A — D1 open, announcement gap**

| Player action | What it teaches |
|---------------|-----------------|
| Buy at market on D1 open | Teaches: chasing into a gap with wide spread on announcement day. Slippage simulated. Debrief asks: "What was the driver of this move? Has anything changed about VLDI's business?" |
| Buy after the first 30 minutes with a defined stop below $33.00 | Teaches: early-in-the-run entry with process. Valid if journaled with a stated exit plan. The driver (mechanical flow, not fundamentals) must be named in the journal to receive full XP. |
| Observe and journal: "NMX 100 inclusion announced. Passive funds must buy at D5 close. I am considering an entry. Driver: mechanical flow, not business change." | Teaches: hypothesis formation and driver labeling. Full XP for this behavior. The player may still enter — the journal action earns XP independently. |
| Skip the scenario: "Index-inclusion plays are outside my stated strategy" | Teaches: recognizing when an event type is outside a defined trading plan. Full XP if documented in journal. Not presented as a poor decision — plan adherence is the lesson. |

**Decision Point B — D2, continued grind**

| Player action | What it teaches |
|---------------|-----------------|
| Enter long with a stop below $34.50 (D1 close), sized at 1% account risk | Teaches: mid-run entry — less of the mechanical flow benefit remains, but entry is later, with more confirmation. Journal must state the driver. |
| Add to an existing D1 position, proportionally | Teaches: pyramiding a working trade — out of scope for this scenario; a coaching note fires: "Adding to a winning position is a valid concept. See the pyramiding lesson for how to do this with correct sizing." |
| Journal: "I missed the D1 entry. VLDI is now 10% above pre-announcement close. I will observe D3 and D4 for auction mechanics." | Teaches: discipline around late entry. Full XP for observation + journal. Debrief will show what happened to a D1 buyer and a D3 buyer. |

**Decision Point C — D3, peak run momentum**

| Player action | What it teaches |
|---------------|-----------------|
| Buy at D3 high ($36.50) to "not miss the auction pop" | Teaches: entering at the top of the pre-inclusion run. This is the central cautionary trade of the scenario — the debrief shows the cost of buying at peak momentum. |
| Hold existing position through D3 (stop raised to $35.60) | Teaches: trailing stop management. Debrief evaluates: was the stop tight enough to capture gains if D4 reverses? |
| Journal: "Price is at a 3-session high. Volume is declining. I am observing possible distribution." | Teaches: reading volume divergence from price. Full XP for this observation. |

**Decision Point D — D5 15:50, closing auction approach**

This decision point is primarily educational rather than a trade entry point.

| Player action | What it teaches |
|---------------|-----------------|
| Attempt to buy into the closing auction | Teaches: auction mechanics — retail market orders entering a closing auction compete with index-fund program trades. Fill quality is unpredictable. Debrief explains auction order priority. |
| Exit any existing long position before the auction (e.g., at $37.00) | Teaches: selling into the mechanical demand before the auction print. Debrief compares this to holding through the post-auction reversion to $37.20. |
| Hold through the auction; observe the spike and reversion | Teaches: the auction print ($37.80) reverts immediately to $37.20 — the spike is the passive fund buying, and it evaporates when that buying is complete. Full XP for observation + journal. |
| Short VLDI at the auction print | Teaches: shorting into a mechanical demand event at the instant it completes — a valid thesis (demand is now exhausted), but requires borrowable shares and tight execution. Coaching note: "This concept is advanced; see the short-selling lesson." |

**Decision Point E — D6/D7, post-inclusion fade**

| Player action | What it teaches |
|---------------|-----------------|
| Exit long before D6 open (stop honored from D5) | Teaches: honoring a pre-defined exit. Debrief shows the $34.60 fade that followed. |
| Hold through the fade hoping for recovery | Teaches: the mechanical demand is gone — the driver that pushed VLDI from $31.40 to $37.80 is exhausted. Holding requires a new thesis. Debrief asks: "What is the new thesis?" |
| Journal: "The inclusion effect is complete. VLDI is now trading on fundamentals again. I do not have a view on VLDI fundamentals." | Teaches: clear thinking about what happens after a mechanical event ends. Full XP for this observation. |

---

### Debrief Screen Content

**What happened:**
Veldara Industrial (VLDI) was announced as an addition to the NMX 100 on Day 1.
Passive index funds that track the NMX 100 were required to hold VLDI at the closing price on
Day 5. Between the announcement and Day 5, the price ran from $31.40 to an auction print
of $37.80 — a 20% move. This run was almost entirely driven by anticipation of the passive
fund buying, not by any change in VLDI's business or fundamental value.

The auction spike to $37.80 was the passive fund execution itself — concentrated buying at
the closing auction to establish the required position. Once that buying was complete, the
demand was exhausted. The fade to $34.60 over the following two sessions reflected sellers
who had bought into the run exiting, with no new source of mechanical demand to replace
the passive fund flow.

**What good process looked like:**
- Labeling the driver correctly: "This is mechanical flow from passive rebalancing, not
  a change in VLDI's fundamentals."
- Entering early in the run (D1 or D2) if entering at all — and having a defined exit
  plan that accounts for where mechanical demand ends.
- Not chasing the D3 momentum at peak price when most of the flow-benefit had already
  been captured.
- Understanding that the auction print is not a tradeable level for most retail participants,
  and that the post-auction reversion is a predictable mechanics consequence, not a
  surprise.
- Having a stop placed before D5's close that protected gains from the post-inclusion fade.

**Explicit callout — good process can still lose money here:**
A player who buys VLDI on D2 at $35.00 with a stop at $33.80 (D1 close as a reference
level) and a 1% account-risk position, noting in the journal that the driver is mechanical
flow, follows good process. If VLDI pulled back on D4 to $33.80 and triggered the stop,
that is a correct-process loss. The mechanical flow thesis was reasonable; the timing and
stop level were defined before entry. The debrief shows this trade, marks it correct
process, and awards full XP. The fact that VLDI ultimately reached $37.80 does not
retroactively make the stop placement wrong.

**Common errors:**
- Buying at the D1 open into the announcement gap at peak spread
- Entering at D3 peak ($36.50) after the majority of the pre-inclusion run had already
  occurred
- Attempting to buy into the closing auction without understanding fill-quality risk
- Holding through the post-inclusion fade with no new fundamental thesis
- Not labeling the driver at any point (no mention of "mechanical flow" in journal)

---

### Process-Scoring Rubric

| Behavior | XP earned | Notes |
|----------|-----------|-------|
| Journal entry before first trade includes named driver ("mechanical flow" or equivalent) | +25 XP | Required for any trade XP to be awarded |
| No trade on D1 open (within the first 15 minutes) | +15 XP | Only if a spread-awareness or entry-quality rule was pre-stated in journal |
| Position size within 10% of account-risk rule | +30 XP | Per trade |
| Stop placed before entry | +25 XP | Per trade |
| Stop honored (not manually cancelled or widened) | +20 XP | Per trade |
| Exit reason journaled ("mechanical demand exhausted" or equivalent) | +15 XP | Brief text required |
| Observation-only run (no trade) + full journal with driver labeling | +40 XP | "Patience/Clarity" reward |
| Scenario debrief completed | +30 XP | Flat |
| Re-review session later (replay) | +10 XP | Bonus |

**What does NOT earn XP:**
- Dollar PnL on the VLDI position
- Whether the player entered early or late in the run
- Catching the auction high or avoiding the fade
- Total session count traded

**Reckless-winner flag** (coaching alert, not XP penalty):
If a player enters at D3 peak, holds through the auction spike, exits at the $37.80 print,
and books a gain — but never labeled the driver and had no stop — the debrief shows:
"You bought at peak momentum and sold at the auction spike. The process gaps: no driver
label, no stop. A scenario where the D4 dip continued through $33.80 would have produced
a large loss with the same process. The outcome does not validate the gaps."

TUNABLE: Full clean run target ~185 XP; observation-only run (no trades, full journal
with driver labeling) ~70 XP; reckless winner should yield ≤40 XP.

---

### Difficulty and Prerequisite Drills

**Minimum rank:** Trainee
**Prerequisites (must be completed before scenario unlocks):**
- SCN-002 completed (Northgate Systems Earnings Gap) — establishes gap mechanics and
  session-open discipline; NMX 100 inclusion is the mechanical-flow contrast to
  fundamentals-driven gap behavior
- Lesson S-I01: "Earnings seasons" (CURRICULUM.md) — establishes the revenue-vs-guidance
  framework that this scenario contrasts with mechanical-flow behavior
- Drill: Position Sizing Puzzle (Stocks variant)
- Drill: Stop Placement Challenge (one attempt)
- Lesson: "What index rebalancing is and how passive funds work" (scenario catalog lesson;
  to be authored as S-I-supp01 per CURRICULUM.md pattern — see OPEN note below)

**Why this is Intermediate:**
- The scenario spans five sessions — longer time horizon than V0 scenarios requires
  managing a hold across multiple decision points without a single acute event triggering
  action.
- The "driver labeling" requirement (mechanical flow, not fundamentals) is a conceptual
  distinction that beginners conflate with "stock went up because it's good."
- The closing auction is unfamiliar mechanics — retail participants rarely interact with
  it intentionally, and the fill-quality risk is non-obvious.

COSTLY: Multi-session timeline requires the sim engine to render five distinct sessions
with persistent position state, closing auction simulation, and session-break indicators.
If the sim engine currently supports only single-session scenarios (per V0 design), this
is a new engine capability. Flag for triage before authoring the scenario sim file.

---

### UI Beats

- **Pre-D1 context:** Session context panel shows VLDI at $31.40 with no annotations.
  Lesson card: "Observe this stock's normal behavior before anything happens."
- **D1 pre-market:** "Pre-market" indicator active (amber). Announcement text fires as a
  news-ticker overlay: "NMX 100 to add Veldara Industrial (VLDI) effective Day 5
  closing price." No price annotation, no directional language.
- **D1 open:** Spread indicator spikes ($0.28 displayed prominently). Audio: session bell.
  Journal prompt auto-opens: "Write your hypothesis about what is driving this move."
- **D2 and D3:** Persistent indicator shows "Days until inclusion effective: 3 / 2." No
  directional prompt — factual countdown only.
- **D3 session:** Volume indicator shows declining volume against rising price — a visual
  divergence marker (labeled "volume divergence" with no interpretive prompt).
- **D5 15:30:** Auction approach indicator: "Closing auction opens at 15:50. Volume
  typically concentrates here on inclusion day." Factual only.
- **D5 15:50:** Auction candle shown in a distinct color (amber) with a label: "Closing
  auction period." Volume bar shown at full height with a numerical multiplier (e.g., "9×
  average daily volume"). Trade entry allowed but fill-quality warning displayed.
- **D5 post-auction:** Reversion visible immediately. Screen text: "Auction period ended.
  Passive fund buying complete." Factual only.
- **D7 end:** Trade entry disabled. Journal prompt opens: "What drove the price from $31.40
  to $37.80? What drove it from $37.80 to $34.60? Were these the same force?"
- **Post-scenario:** Debrief unlocks after journal prompt is completed.

---

## SCN-006: The Employment Report on ANDU

### Overview

A scheduled, high-impact economic data release — a fictional "Monthly Labor Conditions
Report" (MLCR) — is due during the scenario. Pair ANDU, already familiar from SCN-003,
is the instrument. The player must manage: the pre-report quiet period, the spread
blowout at the moment of release, a double-whipsaw that moves in both directions before
establishing a trend, and then the trend itself. The scenario's central teaching is
that holding through scheduled news with tight stops is a sizing decision and a risk
policy decision — not a prediction problem.

**Market:** Forex (spot, major pair)
**Event type:** Scheduled high-impact news release
**Archetype:** Monthly economic data release with initial whipsaw and subsequent trend
(historical archetype — no real calendar event, no real date, no real report name)
**Data source:** Synthetic generator (session-window enforcer, news event hook, spread
blowout model, whipsaw pattern)
**Time window:** 75 minutes sim time (compressible to 19 min at 4x)
**Pair displayed:** ANDU (fictional; same pair as SCN-003)
**Pip size:** 0.0001 (standard 4-decimal major)
**Starting spread:** 0.9 pips (pre-report); spread blowout to 8–14 pips at release

> Note: ANDU is fictional. The Monthly Labor Conditions Report is fictional. No real
> economic calendar event, release name, date, or schedule is referenced. The scenario
> teaches news-event mechanics as a market archetype.

---

### Learning Objectives

1. **Understand that holding through scheduled news with tight stops is a sizing decision,
   not a prediction problem** — the player does not need to know which direction the data
   will move ANDU to make a process-correct decision; they need to know their position
   size and stop placement relative to the expected volatility.
2. **Understand spread cost during news events** — a spread of 8–14 pips at release means
   a stop placed 10 pips away may be filled at the spread cost before price even moves.
   The scenario makes this visible quantitatively.
3. **Recognize the no-trade-zone option as high-process behavior** — choosing not to trade
   through the report, standing aside, and re-entering on trend confirmation is presented
   as equally valid to having a pre-planned news-trade with appropriate sizing.

---

### Core Mechanic: The News-Event Policy Card

Before the report window opens, the player is presented with the "News Policy Card" — a
pre-report decision that earns XP regardless of direction:

> "The Monthly Labor Conditions Report releases in approximately 5 minutes. You have an
> existing position / no existing position [conditional display]. Choose one option and
> journal your reasoning:
> (A) I will close all positions before the report and re-enter on confirmation.
> (B) I will hold through the report; my position is sized for expected volatility and
>     my stop accounts for a spread blowout of up to X pips.
> (C) I will not trade through the report window and will resume observation after
>     the whipsaw resolves."

All three options are valid process choices. The card is not a signal. Debrief evaluates
whether the player's behavior matched the declared option.

TUNABLE: The News Policy Card is the scenario's primary ethics and process gate. If
playtests show players select randomly without journaling, require a minimum 30-character
journal entry for the card to be accepted before the news window opens.

---

### Timeline Beat-by-Beat

Granularity: 1-minute candles displayed; 5-second tick resolution during the whipsaw.

Synthetic price levels (ANDU in standard 4-decimal units):
- Pre-report baseline: 1.3240
- Initial spike high: 1.3315 (+75 pips)
- Whipsaw low: 1.3185 (−55 pips from baseline; −130 pips from spike)
- Trend establishment: 1.3185 – 1.3290 (recovery and continuation upward)
- Scenario close: 1.3290

| Clock | Phase | Price (ANDU) | Spread | What happens |
|-------|-------|-------------|--------|--------------|
| T-20 to T-05 | Pre-report context | 1.3230 – 1.3250 | 0.9 pips | ANDU ranging quietly. Volume declining ("pre-report drying"). Lesson card: "The Monthly Labor Conditions Report releases at T0. What is your plan?" News Policy Card presented at T-05. Decision Point A. |
| T-05 to T0 | News-freeze window | 1.3240 – 1.3245 | 1.8 pips (widening) | Volume nearly zero. Spread begins widening as market makers pull quotes. Screen indicator: "Spread widening. Report imminent." No trade action possible after T-01 (trade entry disabled for 60 seconds). |
| T0 (release) | Report release | 1.3240 → 1.3315 | 8–14 pips | Data releases. ANDU spikes 75 pips in 8 seconds. Spread at its maximum (14 pips at T0+03s, 10 pips at T0+10s). 5-second candles visible. Screen: "Report released. Spread elevated — see cost panel." Decision Point B (existing position holders). |
| T0+15s to T0+45s | Whipsaw reversal | 1.3315 → 1.3185 | 6 pips declining | Price reverses sharply, runs 130 pips in the opposite direction. Anyone who entered long on the initial spike is now deeply underwater. Stops placed within 50 pips of pre-report price are almost certainly hit. Decision Point C. |
| T0+45s to T+03 | Spread normalization | 1.3185 – 1.3200 | 3 pips, declining | Whipsaw slows. Spread returning toward normal. Price stabilizing at 1.3190–1.3205. 1-minute candles resume. Decision Point D (re-entry window). |
| T+03 to T+25 | Trend establishment | 1.3200 – 1.3265 | 1.2 pips | Price recovers from the whipsaw low and establishes a clear upward trend. Volume healthy and sustained. First pullback at T+12 (1.3240 level). Decision Point E (manage open position or enter confirmation). |
| T+25 to T+50 | Trend continuation | 1.3265 – 1.3290 | 1.0 pips | Continuation. A second shallow pullback at T+38 (1.3255). Scenario end approaching. |
| T+50 to T+75 | Trend close and resolution | 1.3290 – 1.3285 | 0.9 pips | Trend slows. Scenario ends at T+75. |

---

### Player Decision Points

**Decision Point A — T-05, News Policy Card**

| Player action | What it teaches |
|---------------|-----------------|
| Select option A (close positions, re-enter after report) + journal rationale written | Teaches: the pre-report flat position as a defined policy. XP for selecting + journaling. Debrief evaluates whether the player actually closed and actually re-entered with a plan. |
| Select option B (hold through report, sized for event) + journal states stop and spread assumption | Teaches: the valid news-hold policy. Critically, the journal must state an assumed max spread (e.g., "I am assuming up to 12 pips spread") and a stop that accounts for it. XP for selecting + journaling with these two elements present. |
| Select option C (no trade through window, observe) + journal written | Teaches: the no-trade-zone as a complete policy. Full XP for selecting + journaling. This is explicitly equal in process terms to options A and B. |
| Make no selection; proceed without completing the card | Teaches: entering a high-impact news window with no declared policy. This is the process failure. No card XP awarded; debrief flags it. Behavior in the whipsaw is tracked and reviewed. |

**Decision Point B — T0, existing position holders (release)**

This decision point applies only to players with an open position at T0 (either held
through the freeze window or opened before T-01).

| Player action | What it teaches |
|---------------|-----------------|
| Stop gets hit during the spike — position closed at a loss | Teaches: the stop did its job. Debrief evaluates: was the stop sized for news volatility? A 10-pip stop hit during a 75-pip spike in a 14-pip spread environment is not a surprise; it is a predictable outcome of holding with a tight stop near the news print. |
| Position survives the spike (stop was set below the spike and above the whipsaw low) | Teaches: the spread cost of the spike is visible. Any stop placed below 1.3225 (pre-report − spread buffer of 15 pips) would survive the spike. Whether it survived the whipsaw depends on stop placement. |
| Manually cancel stop during the spike "to give it room" | Teaches: stop-widening during a news event is a process failure. Coaching flag fires immediately. |

**Decision Point C — T0+20s, during the whipsaw reversal**

| Player action | What it teaches |
|---------------|-----------------|
| Chase the reversal — sell ANDU during the 130-pip down move | Teaches: entering into the whipsaw during maximum volatility. Slippage simulation shows fill at a spread of 6 pips during the reversal. Debrief: this is the highest-risk entry point in the scenario. |
| Hold existing position or remain flat | Teaches: staying with the declared policy (option A/B/C) during chaos. XP for policy adherence. |
| Journal: "Whipsaw underway. I am observing. I will wait for spread normalization and directional confirmation before acting." | Teaches: hypothesis formation under pressure. Full XP for this journal action during the whipsaw. |

**Decision Point D — T0+50s, spread normalizing, directional unclear**

| Player action | What it teaches |
|---------------|-----------------|
| Enter long or short during spread normalization with a stop | Teaches: the early re-entry. Spread is still 3 pips — cost is higher than normal. Entry is valid if journal states the direction hypothesis and the stop location. |
| Wait for trend confirmation (a higher low on the 1-minute chart) | Teaches: waiting for confirmation before entering post-news. Debrief compares this entry to a T+03 entry on confirmed trend; the cost is less spread risk, the benefit is higher confidence. |
| Observe only; journal "no clear direction yet" | Teaches: the patience behavior. Full XP if journal entry written. |

**Decision Point E — T+05, trend established**

| Player action | What it teaches |
|---------------|-----------------|
| Enter long above the first higher low, stop below the whipsaw low (1.3185) | Teaches: post-news trend entry — this is the intended confirmation entry for this scenario. Stop distance ranges roughly 15–80 pips depending on where the entry fills relative to the whipsaw low — size for the actual distance at 1% account risk. |
| Enter long, stop below a closer level (e.g., 1.3210) | Teaches: tighter stop risks being swept by the T+12 pullback (1.3240 area, not a threat; note: the pullback to 1.3240 is above 1.3210, so this stop survives unless price reverses further). Debrief shows both stop placements and their outcomes. |
| Journal: "Trend confirmed. I have no remaining capital allocated to news events in my session plan." | Teaches: the daily risk budget. A player who declared option A earlier, lost on the re-entry after the report, and has no remaining planned risk for the session should stand aside. Full XP for this journal entry. |

---

### Debrief Screen Content

**What happened:**
The Monthly Labor Conditions Report released at T0. ANDU spiked 75 pips upward in under
10 seconds as the initial data was interpreted. Spread simultaneously widened to 14 pips —
meaning a market order entering long at T0+03 seconds was buying 14 pips above the best
ask visible on the chart one second earlier. The spike was followed immediately by a
130-pip reversal to 1.3185 — a full whipsaw that stopped out nearly all positions opened
in either direction during the spike. Spread normalized to 1.2 pips by T+03. ANDU then
established a clear upward trend from the whipsaw low, reaching 1.3290 by T+75.

**What good process looked like:**
- Completing the News Policy Card before the report window, with a written rationale
  covering either (A) flat before release, (B) sized and stopped for event volatility, or
  (C) observation-only through the window.
- If holding through the report: having a stop set far enough from the pre-report price
  to survive the combined spike height and spread blowout (a minimum of 90 pips from
  1.3240 to survive both the spike and the whipsaw, given spread costs).
- Not entering during the whipsaw (T0 to T0+45s) — this window has the highest spread
  cost and lowest directional signal in the entire scenario.
- Waiting for spread normalization (post T0+45s) and directional confirmation (the higher
  low on the 1-minute chart at T+05) before re-entering.
- Sizing any post-news trend entry for the actual stop distance — a 100-pip stop requires
  a smaller lot size than a 20-pip stop to maintain 1% account risk.

**Explicit callout — good process can still lose money here:**
A player who selects option B, writes in the journal "assuming up to 12 pips spread, stop
at 1.3140 (100 pips below pre-report price)," and enters with a 1% account-risk position
sized for 100 pips of risk — follows correct process. If the trend moves against the
player's direction thesis after the whipsaw and triggers the stop at 1.3140, the trade
is a correct-process loss. The stop was appropriately sized for the event. The direction
was wrong, not the process. Full XP is awarded.

Separately: a player who selects option C (no trade through the window), observes the
entire whipsaw from the sidelines, and never enters because trend confirmation never felt
"clean enough" also receives full XP. The no-trade-zone option is not a consolation prize —
it is a complete policy.

**Common errors:**
- Not completing the News Policy Card before the window (most common — no declared policy)
- Entering during the whipsaw at maximum spread (T0 to T0+45s)
- Using a tight stop (10–20 pips) while holding through a news event with expected
  spread blowout of 8–14 pips
- Stop-widening manually during the spike to "avoid getting stopped out"
- Chasing the initial spike direction long, then the whipsaw short, in rapid succession
  (two-direction revenge trading in under 45 seconds)

---

### Process-Scoring Rubric

| Behavior | XP earned | Notes |
|----------|-----------|-------|
| News Policy Card completed with journal rationale before T-01 | +30 XP | Required for any news-window XP to be awarded; the highest-weight rubric item in this scenario |
| Policy declared in Card matches actual behavior during event | +25 XP | Declared option A and went flat: check. Declared B and held with defined stop: check. Declared C and did not trade: check. Mismatch: no XP for this item, flagged in debrief. |
| Position size within 10% of account-risk rule (accounting for actual stop distance) | +30 XP | Per trade; stop distance must reflect the event volatility range stated in journal |
| Stop placed before entry | +25 XP | Per trade |
| Stop honored (not widened or cancelled during the event) | +20 XP | Per trade; the manual-cancel coaching flag fires separately but does not affect this XP line |
| No entry during whipsaw window (T0 to T0+45s) | +15 XP | Only if pre-stated in journal or as part of option A/C policy |
| Exit reason or policy-adherence note journaled | +15 XP | Brief text required |
| Scenario debrief completed | +30 XP | Flat |
| Re-review session later (replay) | +10 XP | Bonus |

**What does NOT earn XP:**
- Which direction ANDU moved after the report
- Whether the player predicted the whipsaw direction correctly
- Pip gain or loss on any position
- Total number of trades during the event

**Reckless-winner flag** (coaching alert, not XP penalty):
If a player enters long during the spike, holds through the 130-pip whipsaw with no stop,
the whipsaw reverses back upward, and the player ends profitable — the debrief shows:
"You held through a 130-pip adverse move with no stop. In this scenario, price recovered.
In a scenario where price continued to 1.3185 and beyond, your account would have taken
a loss limited only by margin, not by a stop. The outcome does not validate the process."

TUNABLE: Full clean run target ~185 XP; option-C-only run (no trades, full journal,
News Policy Card completed) ~70 XP; reckless winner with no card and no stop should yield
≤35 XP.

---

### Difficulty and Prerequisite Drills

**Minimum rank:** Trainee
**Prerequisites (must be completed before scenario unlocks):**
- SCN-003 completed (London Open Sweep on ANDU) — establishes ANDU familiarity, spread
  awareness at session open, and the stop-placement process habit that this scenario
  extends to news-event sizing
- Lesson X-I01: "Session open liquidity sweeps" (CURRICULUM.md) — establishes the
  sweep-vs-trend distinction that the whipsaw in this scenario echoes
- Lesson X-I02: "High-impact news events" (CURRICULUM.md) — the conceptual prerequisite;
  this scenario is the paired sim for that lesson
- Drill: Position Sizing Puzzle (Forex variant — pip-to-lot conversion required)
- Drill: Stop Placement Challenge (one attempt minimum)
- Lesson X-B04: "Spreads and cost of trading" (CURRICULUM.md) — spread arithmetic is
  load-bearing in the whipsaw debrief; players without this lesson cannot correctly
  interpret the cost panel

**Why this is Intermediate:**
- The News Policy Card requires a pre-commitment to a policy before the event — this is
  a higher-order process behavior than the reactive decision points in V0 scenarios.
- Spread cost arithmetic at 8–14 pips is unfamiliar; the interaction between spread and
  stop placement at news events is non-obvious.
- The whipsaw-then-trend structure means the "correct" direction of the eventual trend
  cannot be determined from the initial spike — players who use the spike as a direction
  signal are always wrong about the whipsaw and may be right about the trend for the
  wrong reason. The debrief unpacks this specifically.
- Two timeframes simultaneously visible (5-second ticks during whipsaw, 1-minute candles
  otherwise) — same challenge as SCN-003 but more acute.

---

### UI Beats

- **T-20:** Session context panel shows ANDU at pre-report baseline. Volume indicator
  shows declining bars ("pre-report quiet"). Spread displayed prominently (0.9 pips).
- **T-05:** News Policy Card modal appears — full-screen, cannot be dismissed without
  selecting an option and writing a journal entry (minimum 30 characters for the entry).
  If player tries to close, message: "You must declare your news policy before the report
  window opens."
- **T-01:** Trade entry disabled. Screen text: "Report window begins in 60 seconds. Trade
  entry disabled during news print." Cost panel (spread, pip value per lot) shown
  prominently.
- **T0 release:** Audio: distinct news-release tone (different from session-open bell).
  Spread indicator turns red and shows large-text pip value: "Spread: 14 pips." 5-second
  tick candles activate automatically on a sub-chart. No directional annotation anywhere.
- **T0 to T0+45s:** Screen text: "Whipsaw window. Spread elevated. Fill quality is
  reduced." Trade entry re-enabled at T0+03s but with a mandatory confirmation step:
  "Spread is currently X pips. Your fill may be significantly worse than the displayed
  price. Confirm entry?" (Informational — not blocking.)
- **T0+45s:** Spread indicator returns to amber (3 pips), then green (1.2 pips by T+03).
  Screen text: "Spread normalizing."
- **T+05:** If player has not traded post-news and has not journaled, a gentle prompt:
  "Trend appears to be establishing. Write an observation." Dismissible.
- **T+12:** Pullback visible. If player has an open long, stop line is shown on chart.
  If stop is manually moved, coaching note fires: "You moved your stop after entry. This
  will be reviewed in your debrief."
- **T+75:** Trade entry disabled. Post-trade journal prompt: "What was your policy for
  this report? Did you follow it?" Opens before debrief unlocks.

---

## Design Notes and Open Items

### DESIGNED:
- Three intermediate scenarios, one per market, complete with: learning objectives,
  beat-by-beat timelines with synthetic price levels, 3–5 decision points each with branch
  teaching, full debrief content including the mandatory "good process can still lose"
  callout, process-scoring rubrics (XP for behavior, not PnL), and UI beat lists.
- Curriculum lesson IDs mapped: SCN-004 → C-I03; SCN-005 → S-I01 (index-inclusion slot,
  pending companion lesson authoring); SCN-006 → X-I02.
- V0 prerequisite chains established for all three scenarios.

### TUNABLE:
- SCN-004: Full-run XP target ~185; patience-only ~70; reckless winner ≤30. IL
  percentages (0.45% at 21% divergence, 2.9% at 63% divergence; corrected 2026-06-07 to the standard constant-product formula 2*sqrt(r)/(1+r)-1) are calculated on the
  standard x²/(x+1) approximation — verify with the synthetic AMM math before
  implementation. Fee accrual rates (0.3% / 0.7% / 1.4% / 2.1% / 2.5% / 2.7%) are
  first-pass; calibrate so the "fees won" outcome at T+72 is achievable but not
  guaranteed, to avoid making the deposit always-rational.
- SCN-005: Full-run XP target ~185; patience-only ~70; reckless winner ≤40. The five-
  session price path (31.40 → 33.80 → 36.50 → 37.80 → 34.60) should be tuned so the
  D3 entry is clearly inferior to a D1/D2 entry when stop-to-target ratios are compared —
  confirm with the XP rubric designer.
- SCN-006: Full-run XP target ~185; option-C-only ~70; reckless winner ≤35. Spread
  blowout profile (14 pips at T0+03s, 10 pips at T0+10s, 6 pips at T0+45s, 3 pips at
  T0+50s, 1.2 pips at T+03) is a first-pass shape. Adjust so that a stop placed at the
  "correct" distance (90 pips from pre-report price) survives both the spike and the
  whipsaw with realistic spread fill simulation.
- News Policy Card: 30-character minimum for journal entry is a threshold that needs
  playtest validation. Too short = players type "idk" and proceed. Too long = friction
  for legitimate short observations.

### COSTLY:
- SCN-005 requires multi-session persistent position state and a closing-auction
  simulation (a distinct auction candle with its own volume model). This is new sim
  engine capability if the current engine handles only single-session scenarios (as in V0).
  Recommend confirming engine scope with the engineering lead before finalizing SCN-005
  for vertical-slice implementation.
- SCN-004's LP Position Panel is a new UI surface not present in V0 scenarios. It requires
  a live AMM position calculator (pool share × current prices) running alongside the
  standard price feed. Implementation cost is moderate — flag for the UI sprint.
- SCN-006's 5-second tick candle sub-chart (the whipsaw visualization) was introduced in
  SCN-003. If that feature shipped for V0, it is reused here. If it was deferred, it is
  needed for SCN-006 to function as designed.

### OPEN:
1. SCN-005 needs a companion lesson ("What index rebalancing is and how passive funds
   work") to be authored as a CURRICULUM.md supplement (S-I-supp01 or absorbed into
   S-I03 which currently references sector rotation). Which slot does the owner prefer?
2. SCN-004's "ArcSwap" DEX UI — does the game engine have a DEX/AMM interface skin, or
   does this require a new art/UI variant? The LP Position Panel is a functional
   requirement regardless of art style.
3. SCN-006's News Policy Card is the most process-intensive UI gate in any scenario so
   far. Should it become a reusable component (a "pre-event declaration" pattern) that
   V0 scenarios could adopt in a future revision? The pattern would apply anywhere a
   scheduled event creates a no-trade-zone option.
4. Difficulty tier is "Intermediate" for all three, matching V0. Is the intended next
   step an Advanced tier? If so, a design brief for Advanced scenarios should be opened
   before the V1 scenarios are fully built — Advanced scenarios need to define new
   teaching targets so Intermediate can be positioned correctly relative to them.
5. HARVEST-01 in CURRICULUM.md (C-I03 Liquidity pools / impermanent loss, from Learning
   Materials channel) should be reviewed against SCN-004 for consistency. If the archive
   content teaches IL differently than the LP Position Panel design, one of them needs
   to align.

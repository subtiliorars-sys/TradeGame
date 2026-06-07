# TradeGame — Crypto Track: Intermediate Lessons

**Status:** Living doc | Private HQ only
**Scope:** Intermediate tier lessons C-I01 through C-I04.
**Prerequisite for all:** Crypto Beginner track complete (C-B01–C-B05); Journeyman rank minimum.
**Posture:** Education, not advice. No signals. Process over outcome. Losses are curriculum.

---

## C-I01 — Stablecoin Depegs: Mechanics

**ID:** C-I01
**Track:** Crypto / Intermediate
**Rank gate:** Journeyman
**Prerequisite:** C-B05 (Grid Failure Modes)
**Objective:** Describe the sequence of events in an algorithmic-stablecoin depeg and name the liquidity cascade anatomy — without referencing any specific real coin or protocol.

---

HarborUSD is designed to hold a 1:1 value with a fictional reserve unit (USVC). For most of its simulated life it trades at $0.998–$1.002. That narrow band is what makes it useful as a "stable" settlement layer in the TradeGame sandbox. But the stability of a stablecoin is not a law of nature. It is a function of mechanism design, and mechanisms can fail.

There are two broad categories of stablecoin mechanism: **collateral-backed** and **algorithmic**. A collateral-backed stable holds real assets in reserve — for every unit issued, some quantity of backing exists that can, in principle, be sold to redeem it. An algorithmic stable maintains its peg through incentives and market actors rather than locked collateral. This lesson focuses on the algorithmic variant because its failure mode is structurally distinct and teaches the cascade logic that applies to many other liquidity crises.

**How an algorithmic stable holds its peg.** The system typically involves two tokens: the stable itself (call it the S-token) and a companion token (the C-token). When the S-token trades below $1, arbitrageurs can burn S-tokens to mint C-tokens at a favorable ratio, reducing S-token supply and pushing price back up. When the S-token trades above $1, the opposite: burn C-tokens to mint S-tokens, increasing supply and pulling the price back down. The peg holds as long as arbitrageurs trust the system and as long as the C-token has residual value.

**The cascade anatomy.** A depeg event typically unfolds in phases:

1. **Initial sell pressure.** A large holder exits the S-token position — through a liquidity pool, an exchange, or a redemption mechanism. The S-token price drops slightly below $1.
2. **Arbitrage slows.** If the C-token's price is already falling (possibly for an unrelated reason), the arbitrage incentive weakens. Burning S-tokens to mint C-tokens only makes sense if the C-tokens have value to capture.
3. **Confidence crack.** Other holders observe the depeg and begin exiting. The exit demand exceeds the depth of the available buy-side. Price falls further.
4. **Liquidity cascade.** As price falls further below $1, the C-token must absorb more and more minting pressure to try to restore the peg. If C-token holders are also selling, the system enters a self-reinforcing loop: C-token value falls → arbitrage becomes unprofitable → S-token price falls further → more C-tokens must be minted → C-token supply inflates → C-token value falls.
5. **Bid vacuum.** Eventually the S-token order book thins to a point where there are no meaningful bids. Price can move to nearly zero in a short window because the structural buyer (the arbitrage mechanism) has broken down.

**Worked example.** Suppose the S-token is at $0.96, a 4% depeg. An arbitrageur can burn 1000 S-tokens to mint C-tokens worth $1,000 at the protocol exchange rate. If C-tokens are currently trading at $0.50 each, the arbitrageur receives $500 worth of C-tokens — a $460 loss on $960 of input. The arbitrage is not profitable. The mechanism has no buyers.

The depeg in the game's scenario runs from $1.00 to below $0.10 in a compressed window. The precise numbers are fictional; the structural sequence — confidence crack, arbitrage breakdown, bid vacuum — is what you are studying.

**Why this matters beyond stablecoins.** The cascade logic (mechanism breaks → structural buyers disappear → price finds no floor) appears in other contexts: a grid-bot accumulating one-sided exposure in a trending market (C-B05), a liquidity pool where the underlying pair has become worthless, a leveraged position where margin calls force selling into thin order books (C-I02). The mechanism names change; the cascade shape recurs.

**Process note.** If you hold any instrument that uses a stability mechanism, the process question is not "is it stable?" — it has been stable until now. The question is: what is the mechanism, and what does the mechanism require to keep working? If you cannot answer that, you do not fully understand the risk you are holding.

---

**Scenario Drill:** Scenario replay — stablecoin depeg (GDD §5.2). Pause at each phase of the cascade and write in your journal: what is the mechanism doing right now, and why is it failing? Log the phase name from this lesson, not just "price is dropping."

**Self-Check:**
1. An algorithmic stable is trading at $0.94. The companion C-token has dropped 70% in the last hour. Why has the arbitrage mechanism likely broken down at this price?
2. During a depeg cascade, the order book for the S-token shows bids only at $0.40 and $0.20. What name does this lesson give to this condition, and what structural event caused it?
3. You hold 500 units of an algorithmic stable as the "safe" portion of your sim account. Price drops to $0.80 in 20 minutes. What is the first process question you should ask — and why is "will it recover?" the wrong first question?

**Process Check:** Can you describe the sequence of events in a stablecoin depeg — confidence crack, arbitrage breakdown, bid vacuum — without referencing a specific real coin, in plain language, in under two minutes?

---

## C-I02 — Flash Crash Anatomy

**ID:** C-I02
**Track:** Crypto / Intermediate
**Rank gate:** Journeyman
**Prerequisite:** C-I01
**Objective:** Explain how a liquidation cascade and a thin order book combine to create a bid vacuum in a flash crash, and identify the single protective action available before volatile periods — not during.

---

A flash crash is a rapid, extreme price decline — often 20–50% or more within minutes — that is followed by a partial or full recovery. The recovery can feel reassuring in retrospect, but the lesson is not "price came back." The lesson is the sequence that made the drop possible and the one action that matters before it happens.

**The components.** Three conditions combine to produce a flash crash:

1. **Leveraged positions concentrated near the same stop or liquidation level.** When many traders hold leveraged long positions with stops clustered around a price level, a move through that level triggers a chain of forced sells. Each forced sell pushes price down, triggering the next cluster of liquidations.

2. **Thin order books.** Not all times of day have the same depth of buyers willing to absorb sell pressure. In GLIMMER/HarborUSD, the order book at 3 a.m. on a Sunday is materially thinner than during peak trading hours. A forced sell order of any meaningful size in a thin book "eats through" available bids, dropping price faster than the order would in a deep book.

3. **A triggering event.** The cascade needs a starting push — a large single sell, a negative announcement, a stop cluster hit at a key technical level. The trigger size can be disproportionately small relative to the resulting move, because leverage and thin books amplify its impact.

**The cascade sequence.** Once the trigger fires and the first liquidations hit, the sequence is largely mechanical:

- Liquidated positions sell at market into whatever bids exist.
- Bids are exhausted; price moves to the next available bid.
- That movement triggers another cluster of leveraged liquidations.
- The feedback loop continues until one of three things stops it: the liquidation queue empties, new buyers (often institutions or algorithms recognizing a discount) step in, or price reaches a level where the bids are finally deep enough to absorb.

**Worked example.** GLIMMER is at $100. Liquidation levels from leveraged longs are clustered at $92, $88, and $84. The book has thin bids between those levels (low liquidity at this hour). A large sell order of 50,000 GLIMMER hits at market.

- Price drops to $93. Liquidations at $92 trigger: an additional 80,000 GLIMMER hits the market sell queue.
- Price gaps to $88. Liquidations at $88 trigger: 120,000 more.
- Price gaps to $81 — below the $84 cluster — because the order book between $88 and $84 has almost no bids. The $84 level is passed in a single gap.
- At $81, institutional buyers step in with deep limit orders. Price recovers to $91 over the next 20 minutes.

An unlevered spot holder who bought GLIMMER at $100 experienced a draw-down to $81 (19%) and watched it partially recover to $91. An unlevered holder cannot be liquidated; their loss is temporary unless they sell. A leveraged holder at 5× with a stop at $92 was liquidated at or near $92 — their loss was crystallized and they did not participate in the recovery.

**The one action available before — not during.** During a flash crash, there is functionally nothing you can do. The move happens in minutes or seconds. Orders you place during the cascade may fill at prices dramatically different from what you see on screen (slippage). The stop you did not set before the move cannot be set during it. This is why the process check for this lesson is framed as a before question.

Before a volatile period — a major announcement, a weekend gap, any time you know the order book will be thinner than usual — the correct action is to reduce position size to a level you can hold without a stop being required, or to set your stop at a level that assumes a larger-than-normal spike. These are the only two levers available before the fact.

---

**Scenario Drill:** Scenario replay — GLIMMER flash crash scenario (GDD §5.2). At the moment before the triggering event, pause and write: where are the liquidation clusters on the visible order book, and what is the book depth below them? Then let the scenario run. Compare your prediction to the actual cascade sequence.

**Self-Check:**
1. GLIMMER has large open interest (many leveraged longs) clustered at $75. The current price is $80 and it is 2 a.m. on a Sunday. Name the two conditions from this lesson that are present and explain why their combination is significant.
2. A flash crash takes GLIMMER from $100 to $72 in four minutes before recovering to $88. You held an unlevered spot position with no stop. What is your realized loss, and what would your position look like at recovery if you had not sold during the crash?
3. Your stop-loss is set at $90 on a GLIMMER position entered at $100. The crash opens a gap from $95 to $82 — skipping your stop level entirely. What happened to your fill, and what does this tell you about stop reliability during thin-book conditions?

**Process Check:** What is the one action you would take before a volatile period — not during — to reduce your exposure to a flash crash event? Is that action already part of your pre-trade checklist, or do you remember it only after reading this lesson?

---

## C-I03 — Liquidity Pools and Impermanent Loss

**ID:** C-I03
**Track:** Crypto / Intermediate
**Rank gate:** Journeyman
**Prerequisite:** C-I02
**Objective:** Explain AMM pricing mechanics, calculate approximate impermanent loss using the constant-product formula for given price ratios, and identify the conditions under which LP participation is and is not capital-efficient.
**Harvest slot:** HARVEST-01 (pending compliance review)

---

Decentralized exchanges use a mechanism called an automated market maker (AMM) instead of an order book. Rather than matching buyers and sellers directly, an AMM holds reserves of two tokens in a pool and prices them according to a formula. Anyone can add liquidity to the pool — becoming a liquidity provider (LP) — and earn a share of trading fees. The cost of providing that liquidity is called impermanent loss (IL). Understanding IL is not optional if you interact with liquidity pools; it is the primary risk of the position.

**How AMM pricing works.** The most common AMM formula is the constant-product invariant:

> x × y = k

Where x is the reserve of token A, y is the reserve of token B, and k is a constant. When a trader buys token A, they add B to the pool and remove A, which changes the ratio of x to y and therefore the price.

In the TradeGame sandbox, the ArcSwap DEX uses this formula for the HarborUSD/GLIMMER pool. If the pool holds 10,000 HarborUSD and 2,381 GLIMMER (k = 23,810,000), the price of GLIMMER is 10,000 / 2,381 ≈ $4.20 per GLIMMER. If GLIMMER's external price rises to $6.85, arbitrageurs will buy GLIMMER from the pool until the pool price matches $6.85. That process removes GLIMMER from the pool and adds HarborUSD, changing your LP share's composition.

**Impermanent loss — the formula.** IL is the percentage difference between the value of your LP position and the value of simply holding the assets you deposited. The standard constant-product formula for IL given a price ratio r (where r = new price / deposit price) is:

> IL = |2 × √r / (1 + r) − 1|

This formula assumes a 50/50 pool (equal value of both tokens at deposit). Two reference points from this formula:

- At r = 1.21 (GLIMMER is 21% higher than at deposit): IL ≈ **0.45%**
- At r = 1.63 (GLIMMER is 63% higher than at deposit): IL ≈ **2.9%**

These are not abstract numbers — they are the exact divergence levels in SCN-004 (The GLIMMER Pool). The scenario shows you the LP Position Panel updating in real time as GLIMMER moves from $4.20 (deposit price) to $5.10 (+21%) and then to $6.85 (+63%).

**Worked example.** You deposit 420 HarborUSD and 100 GLIMMER into the ArcSwap pool when GLIMMER = $4.20 per token. Your deposit value: $840 (420 + 100 × $4.20). Pool total: 10,000 HarborUSD and 2,381 GLIMMER (k ≈ 23,810,000). Your share: ~4.2% of the pool.

GLIMMER rises to $6.85 (r = 6.85 / 4.20 ≈ 1.631). Arbitrageurs buy GLIMMER out of the pool until its reserves re-balance to the new price: pool reserves become √(k × P) ≈ 12,771 HarborUSD and √(k / P) ≈ 1,864 GLIMMER. Your 4.2% LP share now represents approximately 536 HarborUSD and 78.3 GLIMMER.

- LP position value: 536 + (78.3 × $6.85) ≈ 536 + 536 = **$1,073**
- HODL baseline (held outright): 420 + (100 × $6.85) = 420 + 685 = **$1,105**
- IL in dollar terms: $1,105 − $1,073 = **$32** (≈ 2.9% of the HODL baseline)

Cross-check against the formula: IL = |2 × √1.631 / (1 + 1.631) − 1| = |2.554 / 2.631 − 1| ≈ 0.029 = **2.9%** — the dollar example and the formula agree. (A constant-product LP position always splits 50/50 by value, which is why 536 HarborUSD sits beside $536 of GLIMMER.)

Note that your LP position still GREW from $840 to $1,073 — IL is not an absolute loss; it is the gap versus simply holding. The SCN-004 LP Position Panel tracks exactly this "Net vs. HODL" comparison in real time.

The practical takeaway: at 63% price divergence, your LP position is worth about 2.9% less than holding the assets outright would have been — before fees. Whether fees compensate depends on the pool's trading volume.

**When LP is capital-efficient — and when it is not.** LP positions earn fees from trading activity in the pool. A pool with high trading volume earns more fees, faster. The fee income accrues continuously; the IL accrues as price diverges and reverses if price returns toward the deposit price (hence "impermanent" — if price returns to the deposit level, IL returns to zero).

LP is most capital-efficient when:
- Price stays near your deposit price (IL stays small; fees accumulate cleanly)
- Pool volume is high (more fees per unit of time)

LP is least capital-efficient when:
- Price diverges significantly and does not return (IL accumulates, and the HODL baseline is substantially higher)
- Pool volume is low (fees are slow to compensate IL)

The decision to provide liquidity is not a passive income decision — it is a capital allocation decision with a specific risk profile. The APY figure shown at deposit time is calculated on trailing fee data and assumes the current price environment continues. If price diverges sharply, that APY figure is not what you will earn.

---

**Scenario Drill:** SCN-004 — The GLIMMER Pool. Before depositing, write your deposit rationale and at minimum one withdrawal trigger (a divergence percentage, a net-vs-HODL floor, or a time-stop). At Decision Point C (63% divergence), write your IL estimate before looking at the LP Position Panel. Compare your estimate to the actual. The gap between your estimate and the panel is the lesson.

**Self-Check:**
1. Using the constant-product IL formula, calculate IL (as a percentage) when GLIMMER is 21% above your deposit price (r = 1.21). Show the arithmetic.
2. You deposited 500 HarborUSD and 100 GLIMMER at $5.00 each. GLIMMER rises to $8.50. Your LP position is now worth $1,290. The HODL baseline (holding outright) would be worth $1,350. What is the dollar IL? What is IL as a percentage of the HODL baseline?
3. You see a pool advertising 120% APY. What two pieces of information do you need — beyond the APY figure — to assess whether the LP position is capital-efficient for you?

**Process Check:** Can you calculate approximate impermanent loss for a 2× price move from your deposit price without looking up the formula? If you cannot do the arithmetic, the LP Position Panel in SCN-004 is teaching you to trust a number you cannot verify yourself.

---

## C-I04 — Volatility Regimes

**ID:** C-I04
**Track:** Crypto / Intermediate
**Rank gate:** Journeyman
**Prerequisite:** C-I03
**Objective:** Distinguish mean-reverting from trending volatility environments, identify which regime is active from chart structure alone, and explain why forcing one strategy type across both regimes has a structural negative expectancy.

---

You were introduced to volatility regimes in C-B03 — the observation that GLIMMER/HarborUSD alternates between tight, oscillating price action and explosive directional periods. At the beginner level, the task was simply to recognize the difference visually. At the intermediate level, the task is to understand why regime matters for strategy selection, and what the cost of ignoring it looks like in real numbers.

**Two regime types.** The two fundamental regimes:

**Mean-reverting (range).** Price oscillates between a support zone and a resistance zone. Each push up fails near the ceiling; each push down finds buyers near the floor. The defining feature is that previous price levels repeat. Strategies built for this regime — grid-bots, mean-reversion entries — profit from this oscillation. They assume that if price has risen to the top of the range, a sell and re-buy lower is likely to work. That assumption is true in a range and false in a trend.

**Trending (directional).** Price makes successive new highs (uptrend) or successive new lows (downtrend). The defining feature is that previous price levels do not repeat in the same way — each new low is lower than the last. Strategies built for this regime — momentum entries, trend-following with trailing stops — profit from sustained directional movement. They assume that a breakout in one direction is likely to continue. That assumption is true in a trend and generates whipsaws in a range.

**Reading regime from chart structure alone.** C-B03 introduced two observations; C-I04 adds two more:

1. **Swing-point sequence.** In a range: swing highs are roughly equal, swing lows are roughly equal. In an uptrend: each swing high exceeds the previous, each pullback low is higher than the previous low. In a downtrend: the inverse.
2. **Range expansion vs. contraction.** Measure the distance from recent swing highs to swing lows. If that distance is expanding over successive swings, volatility is increasing and trend is likely. If it is contracting (an ascending triangle, a wedge), compression is building and a breakout is likely — but direction is uncertain.
3. **Volume and candle character.** In a healthy trend, directional moves occur on higher volume than pullbacks. A rising price on declining volume is a warning that the trend may be exhausting — relevant to C-B05 (grid failure) and the SCN-005 VLDI run-up structure.
4. **Price returning to prior levels vs. leaving them behind.** In a range, price regularly revisits the middle of the range. In a trend, it does not — the prior range ceiling becomes a floor (support in an uptrend) and is not revisited, or if it is revisited, the depth of the retest tells you something about trend strength.

**Worked example.** GLIMMER/HarborUSD has been oscillating between $44 and $56 for 12 sessions. You run a grid between $45 and $55, placing buy orders every $1 and sell orders every $1. You collect fees on each oscillation.

Session 13: GLIMMER breaks $56 and closes at $60 on high volume, then $65 the next day. Your grid buys between $45 and $55 are all filled — but you have no sells above $60. You now hold a large long position accumulated entirely during the range, at an average of ~$50, while price is at $65. If you close now, you profit. If GLIMMER continues to $80, your grid did not capture the trend move efficiently — you were in a sell-and-rebuy-lower logic while price was trending. If GLIMMER reverses from $65 back to $50, your accumulated grid position becomes a large drawdown.

The grid was not wrong during the range. It became the wrong tool the moment the regime shifted.

**Strategy-to-regime matching is a process requirement.** No strategy performs well across all regimes. The process question at the start of each trading session is not "what is my target?" It is "what is the current regime, and does my strategy type match it?"

Changing strategy type in response to a regime shift is not inconsistency. It is correct adaptation. The inconsistency error is different: switching strategies mid-trade because the trade is losing (turning a range-reversion trade into a "trend hold" when price moves against you). That is not adaptation — it is rationalization, and it was introduced in C-B05.

**The regime you expect is not the regime you have.** The most common intermediate error is trading the regime you remember from last week rather than the regime visible on the chart today. Before every trade, the chart read is mandatory. Not optional.

---

**Sim Drill:** Paper sandbox — compare two synthetic GLIMMER/HarborUSD periods: one labeled "Range Period A" and one labeled "Trend Period B" in the sandbox controls. For each period, write before you look: what would a grid strategy do here, and what would a momentum entry do here? Then run both strategies on both periods and observe the results. Log the comparison, not just the outcome.

**Self-Check:**
1. You observe six consecutive GLIMMER candles: each closes higher than the previous, and each pullback low is higher than the prior swing low. What regime label fits this, and what type of strategy is designed for this environment?
2. You have been running a successful grid on GLIMMER between $80 and $100. GLIMMER breaks $100 and prints $108 on the highest volume bar in three weeks. What process question should you ask, and what are the two rational responses?
3. Describe the "rationalization error" — switching time horizons or strategy labels mid-trade to avoid booking a loss — and explain why it is a risk management problem, not a strategy problem.

**Process Check:** Are you identifying the current regime from the chart structure at the start of each session, or are you entering a strategy type based on what worked last week? If you cannot state the current regime before entry, you do not have a session plan — you have a habit.

---

*Internal curriculum document. Do not publish to TradeGame---Preview.*

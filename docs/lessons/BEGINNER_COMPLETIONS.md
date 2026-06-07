# TradeGame — Beginner Completions

**Status:** Living doc | Private HQ only
**Scope:** Remaining beginner lessons not covered in PILLAR_INTROS.md:
  C-B04, C-B05 (Crypto), S-B04 (Stocks), X-B04 (Forex).
**Prerequisite for all:** First three lessons of the respective pillar track complete; Trainee rank minimum.
**Posture:** Education, not advice. No signals. Process over outcome. Fictional instruments only.

---

## Crypto Track — Beginner Completions

---

### C-B04 — Grid Strategies: How They Work

**ID:** C-B04
**Track:** Crypto / Beginner
**Rank gate:** Trainee
**Prerequisite:** C-B03 (24/7 Sessions and Volatility)
**Objective:** Explain the logic of a grid strategy, describe how grid spacing determines fill frequency and per-trade profit, and identify the market condition in which a grid earns its design purpose.

---

A grid strategy automates the trader's oldest instinct: buy lower, sell higher, repeatedly, within a range. When price moves up and down inside a channel, a grid captures that oscillation mechanically without requiring any prediction about direction. Before you run one, you need to understand exactly what it is doing — because the same mechanics that make a grid profitable in a range make it dangerous when the range ends.

**The structure.** You define three things: the range (an upper and lower price boundary), the number of grid levels, and the amount to trade at each level. The bot places buy limit orders at equal intervals below the current price, and sell limit orders at equal intervals above. When price drops to a buy level, it fills. When price recovers to the corresponding sell level above that buy, it fills the sell. The difference between the buy and sell level is the per-cycle profit for that grid line — minus the spread paid on both fills.

**Worked example.** GLIMMER/HarborUSD is at $50.00. You set a grid from $44.00 to $56.00 with $2.00 spacing — 7 levels total: $44, $46, $48, $50, $52, $54, $56. Buy limit orders sit below the current price: $44, $46, $48. Sell limit orders sit above the current price: $52, $54, $56. The $50.00 level (current price) has a sell order placed at open to capture any immediate upside.

A buy fills at $48.00. Price recovers to $50.00. The corresponding sell fills at $50.00. Per-cycle gross: $2.00 per unit. Repeat.

If GLIMMER oscillates between $46 and $52 across 20 simulated sessions, each grid line potentially fills and re-fills multiple times. The total gross accumulates cycle by cycle. Subtract spread on each fill pair (say $0.10 per fill × 2 = $0.20 per cycle) and the net per cycle is $1.80. That math works as long as price stays inside the range.

**Why grid spacing matters.** Wider spacing means fewer fills (price must move more to trigger a level) but higher per-cycle profit. Tighter spacing means more fills but lower profit per cycle — and spread cost as a percentage of per-cycle profit is higher. In an extremely tight grid, spread can consume most or all of the per-cycle profit. There is no universally correct spacing. It depends on the pair's typical daily range and the spread you are paying.

**The grid's design condition: a ranging market.** The grid does not predict whether price will be $48 or $52 tomorrow. It does not need to. It earns when price oscillates within the defined range. That condition — mean-reverting, range-bound price — is not permanent. The grid-bot sandbox in the sim lets you observe this directly. C-B05 is the required companion to this lesson because the failure mode is as important as the design.

**Inventory exposure.** Each unfilled buy accumulates what is called inventory — open long positions that are not yet matched with a sell. If price drops from $50 to $44, you may hold inventory at $48, $46, and $44. If the pair continues dropping below $44, all of those positions are unrealized losses, and no sell orders in your grid will fill because price is below your sell levels. The grid cannot earn from a trend; it can only accumulate open exposure.

---

**Sim Drill:** Grid-bot sandbox (GDD §5.3) — run a grid on a synthetic GLIMMER/HarborUSD pair configured to stay in range. Set a 6-level grid between $44 and $56. Observe at least three full buy-sell cycles. Log: how many fills occurred, the gross per cycle, and the spread cost per cycle. Calculate net after spread.

**Self-Check:**
1. Your grid has lines every $1.50 between $30 and $36 on GLIMMER. Spread per fill is $0.08. What is the gross per cycle, the total spread cost per cycle, and the net per cycle?
2. Price has been oscillating between $31 and $35 for two weeks. Your grid has five accumulated buy fills and no matching sells. Price drops to $28. What has happened to your capital, and why did the grid not protect you?
3. Name the one market condition in which a grid strategy earns as designed, and the one condition in which it accumulates inventory risk.

**Process Check:** Can you describe exactly when a grid makes money and when it does not — using the term "inventory" correctly — without referencing any specific token?

---

### C-B05 — Grid Failure Modes

**ID:** C-B05
**Track:** Crypto / Beginner
**Rank gate:** Trainee
**Prerequisite:** C-B04 (Grid Strategies: How They Work)
**Objective:** Describe the one-sided exposure mechanic that develops when a grid is caught in a trend, name the psychological trap that follows, and demonstrate this sequence by running a grid into a simulated trend breakout.

---

C-B04 explained what a grid does when the market cooperates. This lesson explains what the grid does when the market does not — and why the response most traders feel in that moment is the wrong one.

**The breakout sequence.** GLIMMER/HarborUSD has been ranging between $44 and $56. Your grid has been running for two weeks, printing cycles. Then a piece of news hits the synthetic market. Volume expands. GLIMMER starts a sustained move down. Price breaks below $44 and continues to $38. The grid is designed for a range. It has no mechanism to recognize that the range has ended. It continues placing buy orders as price falls. You now hold:

- A buy filled at $48 (sell order at $50, unfilled — price never returned)
- A buy filled at $46 (sell order at $48, unfilled)
- A buy filled at $44 (sell order at $46, unfilled)

Your grid placed no buy below $44, so no further fills. But you hold three open long positions, all underwater, with no sell pressure to match them. This is one-sided exposure. The grid's design — which assumes mean reversion — has become a mechanism for accumulating a directional long position that you did not choose.

**The dollar cost of the trend.** In the C-B04 example, your per-cycle gross was $2.00 per unit. In C-B05's breakout, GLIMMER reaches $38. Your average cost across the three open positions is approximately $46. Unrealized loss per unit: $8 — four times one cycle's gross. Every gain the grid collected over two weeks of cycling can be erased by a single trend move it was not designed to handle.

**The psychological trap.** Here is what the sim is designed to make you feel: "GLIMMER will come back. It's always come back before. I'll wait." This thought is the failure mode, not the market behavior. The market does not owe your grid a return to the range. Ranging behavior that justified the grid setup was a regime — and as C-B03 taught, regimes end. The correct response to a trend breakout is to evaluate whether the range thesis still holds. If it does not, the grid's inventory should be addressed at its current position, not at the price you wish it were.

**Risk management for a grid.** A well-designed grid deployment includes:

1. A maximum capital allocation to grid inventory — the largest dollar amount you will allow to sit in unfilled positions before you close or pause the grid.
2. A range invalidation threshold — the price level at which you conclude the range thesis is no longer valid and address the inventory.
3. A pause mechanism — the ability to stop placing new buy orders without closing existing positions, buying time to assess.

None of these are built into the grid logic automatically. They are decisions you make before deploying the grid. If they are not decided before deployment, they will be decided in the moment while watching the drawdown — which is the worst possible time to make a structural decision.

**One useful observation.** Crypto's 24/7 nature (C-B03) means a trend that starts while you are asleep can run for hours before you see it. A grid running unmonitored overnight in a trend breakout accumulates inventory with no human decision point. The sim will show you this. Log the hour the breakout started and compare it to when you (in the sim's constructed narrative) would have seen the alert.

---

**Sim Drill:** Grid-bot sandbox (GDD §5.3) — run the same grid from C-B04 (6-level, $44–$56 on GLIMMER/HarborUSD). The sandbox then triggers a simulated trend breakout below $44. Observe the inventory accumulation. Log: how many open positions were generated, what the average open price is, and the unrealized loss at the breakout's lowest point. Write in your journal: at what point would you have paused or exited the grid, and what threshold would trigger that decision going forward?

**Self-Check:**
1. Your grid has been running in a range and has accumulated three open buy positions at $48, $46, and $44 (average $46). GLIMMER drops to $39 and holds there for five days. What is your unrealized loss per unit, and why is the phrase "I'll wait for it to come back" a process failure rather than a strategy?
2. Name the two pre-deployment decisions that would have changed how you responded to the breakout in the sim.
3. A classmate says, "The grid worked great for two weeks, so the one bad week doesn't count." What is wrong with this accounting?

**Process Check:** Did you feel the urge to "wait for it to come back" when the grid was underwater in the sim? Did you journal that feeling — not the outcome, but the feeling — because that is the process point this lesson is designed to surface?

---

## Stocks Track — Beginner Completion

---

### S-B04 — Index Investing Math

**ID:** S-B04
**Track:** Stocks / Beginner
**Rank gate:** Trainee
**Prerequisite:** S-B03 (Long-Term vs. Swing)
**Objective:** Calculate compounding return over time, compute cost basis after multiple buys at different prices, and understand how dollar-cost averaging smooths entry across a volatile price series.

---

The Foundation Track taught you drawdown math (F-06) — how a 50% loss requires a 100% gain to recover. This lesson is the other side of that math: what happens to capital when it compounds positively over time, and why the entry price of any single buy matters less than you might think when the strategy is dollar-cost averaging into an index.

**Compounding.** If you invest $1,000 into the NMX 100 ETF and it grows at an average of 8% per year, the calculation is not $80 per year forever. The year 1 return is $80. Year 2 return is 8% of $1,080 = $86.40. Year 3: 8% of $1,166.40 = $93.31. After 10 years, the position is worth $1,000 × (1.08)^10 = $2,158.93. The gains are earning gains. The compounding effect accelerates over time.

This is not a projection for the NMX 100. It is an illustration of the mathematical structure. The lesson is about the calculation, not the rate.

**Cost basis with multiple buys.** DCA means you put a fixed dollar amount in at regular intervals regardless of price. The math produces a lower average cost than a single lump-sum entry at the start.

Worked example. You invest $200 in the NMX 100 ETF on three separate occasions:

- Buy 1: ETF at $100/unit → 2.0 units purchased
- Buy 2: ETF at $80/unit → 2.5 units purchased
- Buy 3: ETF at $110/unit → 1.818 units purchased

Total invested: $600. Total units: 6.3182. Average cost basis: $600 / 6.3182 = $94.96 per unit.

If you had put the full $600 in at the first buy ($100/unit), your cost basis would be $100. By buying across three prices — including one lower price — your average dropped to $94.96. The second buy at $80 pulled the average down more than the third buy at $110 pushed it up, because the $200 at $80 bought more units than the $200 at $110.

**Why this works mechanically.** A fixed dollar amount buys more units when the price is lower. That is the arithmetic advantage of DCA: price volatility is not purely an enemy. A lower price at a DCA interval date means more units per dollar. Over many intervals, the average cost basis tends to be below the arithmetic average of the prices paid — because more units are accumulated during the lower-price periods.

**What DCA does not do.** DCA does not guarantee a profit. If the price of the NMX 100 ETF declines over the entire DCA period and never recovers, you accumulate units at a lower average cost than the first buy — but the position is still underwater. DCA is a mechanism for managing entry timing risk, not a protection against sustained decline. This distinction is important because "I'm DCA-ing" can become a rationalization for continuing to buy into a declining position without any thesis for recovery.

**The rebalance preview.** S-B04 pairs with S-A03 (Rebalance Mechanics) later in the track. The math here — average cost basis, unit accumulation — is the foundation for understanding why rebalancing at defined intervals rather than on emotion or instinct is a process discipline, not an optional refinement.

---

**Sim Drill:** DCA/rebalance sim — run a recurring-buy scenario on the NMX 100 synthetic ETF. The sim presents 5 buy intervals at varying prices. After each buy, calculate your running average cost basis manually (total dollars in ÷ total units held). At the end of the 5 intervals, compare your average cost basis to the arithmetic average of the five prices. Journal the difference and explain why they diverge.

**Self-Check:**
1. You invest $300 into the NMX 100 ETF at $120, then $300 more at $90, then $300 more at $105. What is your total units held, your total invested, and your average cost basis?
2. The arithmetic average of the three prices above ($120, $90, $105) is $105. Is your average cost basis from question 1 above or below $105? Explain why in one sentence.
3. A classmate says, "I'm just going to DCA into the NMX 100 no matter what — it always goes up." Name one condition under which DCA does not protect you despite mechanically correct execution.

**Process Check:** Can you calculate your average cost basis after three buys at different prices — manually, without a spreadsheet — in under two minutes?

---

## Forex Track — Beginner Completion

---

### X-B04 — Spreads and Cost of Trading

**ID:** X-B04
**Track:** Forex / Beginner
**Rank gate:** Trainee
**Prerequisite:** X-B03 (Sessions and Timezones)
**Objective:** Calculate the real dollar cost of the spread on a given lot size and stop distance, incorporate spread into an R:R calculation, and identify the break-even pip move required before a position can be profitable.

---

X-B03 showed you that spread varies across the trading day — widest during thin sessions, narrowest during the London/New York overlap. X-B04 makes that variation concrete in dollar terms, because the spread is not an abstraction. It is an immediate, certain loss the moment you enter a position. Every R:R calculation that ignores the spread is wrong before price moves a single pip.

**The spread as an entry cost.** When you buy ANDU/HarborUSD, you fill at the ask price. If you were to close immediately, you would fill at the bid — which is lower than the ask by the spread. On a 1.5 pip spread, you are already 1.5 pips in the red the instant your entry fills. Price must move 1.5 pips in your favor before you break even. This is true regardless of your stop distance, your target, or your analysis.

**Worked example — standard session.** ANDU/HarborUSD during the London/New York overlap. Spread: 1.5 pips. You enter long with 2 mini lots. Pip value per mini lot: $1.00.

Spread cost: 1.5 pips × $1.00 × 2 lots = $3.00.

Your stop is 30 pips. Your target is 60 pips. Stated R:R: 1:2. 

But the break-even pip move is 1.5 pips — you need price to travel 1.5 pips in your direction before you are at zero. Your actual entry-to-target distance (accounting for spread) is 60 − 1.5 = 58.5 pips. Your actual entry-to-stop distance is 30 + 1.5 = 31.5 pips. Adjusted R:R: 31.5 : 58.5 = approximately 1 : 1.86, not 1 : 2. Small difference here — but it matters when you are counting on a specific edge.

**Worked example — off-peak session.** Same setup, but entered after the New York close when spread widens to 6 pips.

Spread cost: 6 pips × $1.00 × 2 lots = $12.00.

Break-even pip move: 6 pips. Adjusted entry-to-stop: 36 pips. Adjusted entry-to-target: 54 pips. Adjusted R:R: 36 : 54 = 1 : 1.5.

The trade you thought was 1 : 2 is now 1 : 1.5 simply because you entered at the wrong time of day. If your edge requires a minimum 1 : 2 R:R to be positive expectancy, this entry did not meet your rule.

**The position sizing puzzle connection.** X-B01 taught you to calculate position size from stop distance and pip value. The spread adjustment belongs in that same calculation. The correct stop distance to use in your risk formula is stop-in-pips plus spread-in-pips, because that is the total pip move required before your position is at breakeven. Using the raw stop distance without the spread underestimates your real risk dollar by the spread amount.

**Commissions.** Some brokers quote tight spreads but add a per-lot commission. The math is identical — convert the commission to equivalent pips (commission ÷ pip value) and add it to your spread cost before calculating break-even. Both spread and commission are entry costs that reduce effective R:R before the market has moved at all.

**The process discipline.** Before every forex entry: state the current spread in pips, multiply by pip value and lot size, add to the dollar cost of your stop. That total is your real dollar risk. If the spread has widened from your expected level — because you are outside the overlap window — your real cost is higher than your plan allowed for. That is a valid reason to delay entry until the spread normalizes, or to reduce lot size so the total dollar risk stays within your per-trade limit.

---

**Sim Drill:** Position sizing puzzle — forex (GDD §5.4). The drill presents three scenarios with different spread conditions (1.5, 4, and 8 pips) on ANDU/HarborUSD. For each: calculate (a) the spread dollar cost for the given lot size, (b) the break-even pip move, and (c) the adjusted R:R given the stated stop and target. Confirm that adjusted R:R still meets your minimum threshold before entering the sim position. Log the calculation for each scenario.

**Self-Check:**
1. ANDU/HarborUSD has a 3 pip spread. You plan to enter 1 mini lot with a 25-pip stop and a 50-pip target. Pip value for 1 mini lot: $1.00. What is your spread cost in dollars, and what is your adjusted R:R after accounting for spread?
2. You enter the same trade during an off-peak session with a 9 pip spread instead of 3. How does that change your break-even pip move and your adjusted R:R?
3. Your trading plan requires a minimum 1 : 1.8 adjusted R:R (after spread) to take a trade. The spread is currently 5 pips. Your stop is 20 pips, your target is 40 pips. Does this trade meet your rule? Show the calculation.

**Process Check:** Are you factoring the spread — in pips, at the time of entry — into your R:R calculation before you enter any forex position? Not after. Before.

---

*Internal curriculum document. Do not publish to TradeGame---Preview.*

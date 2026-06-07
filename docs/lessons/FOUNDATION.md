# Foundation Track — Full Lesson Text

**Track:** Shared Foundation (all pillars)
**Prerequisite:** None — complete before entering any pillar track.
**Rank gate:** Observer → Trainee (F-01 through F-06), Trainee → Practitioner (F-07 through F-10)
**Posture:** Education, not advice. No instrument or platform named here is a real recommendation.
All instruments used in examples are fictional (RISK_REGISTER §20).

---

## F-01 — What a Market Is

**Objective:** Explain price discovery, buyers and sellers, and the bid/ask spread.

### The Teaching

Every market is just a matching engine. On one side, buyers say what they are willing to pay
(the **bid**). On the other, sellers say what they will accept (the **ask**). The matching
engine pairs them up. When a buyer agrees to pay the lowest available ask, a trade happens.
The price you see on a chart is the price of the last match.

Nothing mystical decides the price. No authority sets it. Whoever is most desperate — the
buyer who wants in badly enough to meet the ask, or the seller who wants out badly enough to
meet the bid — is the one who moves the tape.

The gap between bid and ask is called the **spread**. You pay it every time you enter a
trade, whether you notice it or not. On a liquid instrument the spread might be tiny. On a
thinly traded one it can be large enough to make a short-term trade unprofitable before you
even start.

**Order book basics.** Think of the order book as two stacked queues: all the limit-buy
orders lined up below the current price, all the limit-sell orders stacked above it. When
news hits, those queues can drain fast — or fill up fast. Watching the book is watching
supply and demand in real time.

Why does price move at all? Because the balance of buyers and sellers shifts. More urgent
buyers than sellers: price climbs until sellers are willing to show up. More urgent sellers:
price drops until buyers step in. That's it. Every chart pattern, every indicator, every
trading system is just an attempt to read that balance of urgency before it becomes obvious.

### Worked Example

Fictional crypto pair **VRXC/USD** has:
- Best bid: 10.42
- Best ask: 10.44
- Spread: 0.02 (about 0.19% of price)

You place a market-buy order for 100 units. You pay 10.44, not 10.42. You are immediately
down 0.02 × 100 = **$2.00** before the price has moved one tick. To break even you need
VRXC/USD to move from 10.44 to at least 10.42 in your favor — and that hasn't happened yet.

This is why high-frequency entries in illiquid instruments bleed accounts even when the
direction is "right."

### Paired Sim Drill

**Paper sandbox — observe the order book, place one limit order and one market order.**
Watch how your market order fills instantly at the ask; watch how your limit order sits in
the queue. Notice whether the spread changes between peak and off-peak hours.

### Self-Check

1. What is the bid/ask spread and who effectively pays it?
2. If the bid is 50.10 and the ask is 50.20, what price do you pay on a market-buy?
3. What would cause the spread to widen suddenly?

### Process Check

Can you explain what determines the price at any moment?

---

## F-02 — Order Types

**Objective:** Distinguish market, limit, stop-limit, and stop-market orders and know when
each is appropriate.

### The Teaching

Your order type is your instruction to the matching engine. Getting it wrong costs money
without you realizing it.

**Market order.** "Fill me now at whatever price is available." Guaranteed execution, price
not guaranteed. In a fast market or thin book, you can pay significantly more (or receive
significantly less) than the last-quoted price. This is called **slippage**.

**Limit order.** "Fill me only at this price or better." Price guaranteed, fill not
guaranteed. Your order sits in the queue. If price never reaches your level, you don't get
in — or don't get out. This matters enormously on exits.

**Stop-market order.** "Once price touches my stop level, send a market order." This is how
most loss-limiting stops work. Execution is near-guaranteed, but in fast markets the actual
fill can be far from the stop level — especially on gaps.

**Stop-limit order.** "Once price touches my stop level, post a limit order at my limit
price." Fills only if the market comes back to your limit price. If price gaps straight
through your level, your order may not fill at all. You can end up holding a losing position
while waiting for a fill that never comes. This is the key failure mode beginners miss.

The tradeoff is simple: market orders and stop-markets prioritize **certainty of exit**;
limit and stop-limit orders prioritize **certainty of price**. In a crisis, certainty of
exit is almost always more important.

### Worked Example

You hold 50 shares of fictional equity **NGSM** at $42.00. Earnings are tonight. You set a
stop-limit with a stop at $40.00 and a limit at $39.80.

NGSM reports a bad quarter. Overnight it gaps down to $36.50. Your stop triggers at $40.00,
but the limit order posts at $39.80. There is no liquidity at $39.80 — the first bids are
at $36.60. Your order does not fill. You are holding a position 14% below your intended
exit while waiting for a limit that the market has already blown past.

A stop-market would have filled at approximately $36.55 — painful, but closed. A stop-limit
left you exposed.

### Paired Sim Drill

**Position sizing puzzle (GDD §5.4) — set entry and stop orders correctly on all three
market variants.** Before placing each order, write down what failure mode you are accepting
for that order type.

### Self-Check

1. What is slippage and which order type is most exposed to it?
2. You want out of a trade at any cost if price drops to a certain level. Which order type
   is most reliable for that purpose?
3. When would a stop-limit fail to protect you?

### Process Check

Do you know when a stop-limit can fail to fill?

---

## F-03 — Position Sizing

**Objective:** Calculate correct position size given account size, risk percentage, stop
distance, and instrument.

### The Teaching

Position sizing is the single most controllable variable in trading. Direction is a guess.
Sizing is math.

The core principle: **risk a fixed, small percentage of your account per trade — never a
fixed dollar amount, never a fixed number of shares or lots, never "whatever feels right."**

Common starting parameters in education contexts: 1–2% of account per trade. This is not a
magic number. It is a consequence of the math in F-06 (drawdown). The point is that you
define the loss amount first, then calculate the size that produces that loss if the stop
is hit.

**The formula:**

```
Dollar risk per trade = Account size × Risk %
Position size = Dollar risk per trade ÷ Distance from entry to stop (in dollars per unit)
```

That's the whole thing. Run it before every entry. If the math produces a size that feels
too small to be "worth it," that feeling is telling you something important about your
relationship to risk, not about the trade.

### Worked Example

- Account: $5,000
- Risk per trade: 1% → $50 at risk
- Fictional pair ANDU, entry at 1.2830
- Stop at 1.2790 (40 pips / 0.0040 price units)
- Each lot of ANDU is worth $10 per pip in this sim

Stop distance in dollar terms per lot: 40 pips × $10 = $400 per lot.

Position size = $50 ÷ $400 = **0.125 lots**

If the stop is hit, you lose $50 — exactly 1% of $5,000. If you had traded 1 full lot, you
would have lost $400 — 8% of your account on a single trade.

The difference between 0.125 lots and 1 lot is not confidence. It is discipline applied
correctly.

### Paired Sim Drill

**Position sizing puzzle (GDD §5.4) — complete all three market variants (crypto, stocks,
forex).** Each variant uses different unit conventions. Run the formula from scratch each
time; do not guess.

### Self-Check

1. Your account is $10,000 and you risk 2% per trade. What is your max dollar loss on a
   single trade?
2. Your stop is 25 cents below your entry and each share moves in $0.01 increments. You
   are risking $100. How many shares can you buy?
3. Why is "I'll just buy 100 shares" a position-sizing approach that ignores risk entirely?

### Process Check

Can you calculate your lot or share size without a tool?

---

## F-04 — Stop-Losses

**Objective:** Explain what a stop does, where it should be placed, and where it fails
(wicks, gaps, slippage).

### The Teaching

A stop-loss is not a safety net. It is a pre-committed decision about when your thesis is
wrong. If you move it after entry because price is getting close, you are not using a
stop — you are pretending to use one.

**Where to place a stop.** The stop should be at the level where, if reached, the trade
idea is invalidated — not at the level where the pain feels tolerable. Common placements:
below a support level, below a recent swing low, beyond a structure that should not break
if your thesis is correct. The stop's location should be driven by the chart, then checked
against position sizing math.

**Order: stop placement comes before entry.** You decide the stop first. That gives you
the risk amount. Then sizing tells you how large a position you can take. If the stop
distance is so wide that the math forces you into a tiny size, that is the correct size.
Do not widen the stop to justify a larger position.

**Where stops fail.**

- **Wicks (liquidity sweeps):** Price can spike through your stop level momentarily, trigger
  the order, then reverse to where you wanted to be. Your stop ran, your position closed,
  and the trade went your way — with you out of it. This is not the stop's fault; it is a
  placement issue. Stops directly under obvious round numbers or recent lows are easy targets.

- **Gaps:** Overnight or weekend gaps can jump clean over your stop level. Your stop-market
  fires at the first available bid, which could be far below your target. Stop-limits may
  not fill at all (see F-02). You cannot stop-loss through a gap at your chosen price.

- **Slippage in fast markets:** Even a stop-market during a flash event can fill well below
  your stop level. The order is correct; the market was just moving faster than liquidity
  could absorb.

None of these are arguments against stops. They are arguments for position sizing small
enough that even a bad fill on a gapped stop is survivable.

### Paired Sim Drill

**Stop placement challenge (GDD §5.4).** You are given a chart with three possible stop
levels. Before the scenario runs, write your choice and your reason. The drill then shows
you which placements survived and which got swept.

### Self-Check

1. You place a stop at $50.00. Price hits $49.97, triggers your stop-market, and fills at
   $49.85. Is this a malfunction?
2. What is a "liquidity sweep" and how does it affect stops placed at obvious levels?
3. A gap opens below your stop level. You have a stop-limit at $40.00 with a limit at
   $39.90. Price opens at $38.50. What happens to your order?

### Process Check

Do you place the stop before the entry, every time?

---

## F-05 — Risk:Reward

**Objective:** Calculate risk:reward ratio and understand why win rate and R:R ratio must
be evaluated together.

### The Teaching

A trade's risk:reward (R:R) ratio compares how much you stand to lose if the stop is hit
to how much you stand to gain if the target is reached. A 1:3 R:R means you risk $1 to
potentially make $3.

Here is what most beginner education skips: **R:R alone tells you nothing. You must pair
it with realistic win rate.**

A 1:3 R:R sounds great. But if you are right only 20% of the time at that target, you are
a losing trader.

**Expectancy formula:**

```
Expectancy = (Win rate × Average win) − (Loss rate × Average loss)
```

If expectancy is positive, the strategy has an edge over a large enough sample. If it is
negative, the strategy loses money on average no matter how good any individual trade looks.

Most beginners pick trades that feel likely to win (high win rate, small R:R) and are
surprised that they do not profit. A 70% win rate at 1:0.8 R:R has negative expectancy.
A 35% win rate at 1:3 R:R has positive expectancy. The math, not the feeling of being
right, is what matters.

### Worked Example

You have two strategies. You are deciding which to keep.

**Strategy A:** Win rate 65%, average win $80 (R:R roughly 1:0.8 on $100 risk)
- Expectancy = (0.65 × $80) − (0.35 × $100) = $52 − $35 = **+$17 per trade** ✓

**Strategy B:** Win rate 40%, average win $250 (R:R roughly 1:2.5 on $100 risk)
- Expectancy = (0.40 × $250) − (0.60 × $100) = $100 − $60 = **+$40 per trade** ✓

Both are positive. But notice: you could cut Strategy B's win rate to 30% and it would
still produce +$15 per trade. Strategy A breaks even if win rate drops to about 56%.
Higher R:R strategies are more robust to periods of bad form.

Now a trap: **Strategy C:** Win rate 80%, average win $50 (R:R 1:0.5 on $100 risk)
- Expectancy = (0.80 × $50) − (0.20 × $100) = $40 − $20 = **+$20 per trade**

Still positive. But one bad run of 5 losses in a row at 1:0.5 wipes out 10 winning trades.
The loss streaks are brutal even though the expectancy is fine. This is why drawdown math
(F-06) is the next lesson.

### Paired Sim Drill

**Drawdown survival drill (GDD §5.4).** You are given a series of trades with pre-set win
rates and R:R ratios. The drill tracks your equity curve over 50 simulated trades. Watch
what happens to a 1:0.5 R:R strategy versus a 1:3 R:R strategy over the same 50 trades.

### Self-Check

1. A strategy wins 60% of the time at a 1:2 R:R. Calculate the expectancy per $100 risked.
2. A strategy wins 90% of the time but only makes $10 per win while risking $100. Is this
   strategy profitable over 100 trades?
3. Why is it not enough to say "I just need a high win rate"?

### Process Check

Are you skipping trades with poor R:R?

---

## F-06 — Drawdown Math

**Objective:** Calculate how much gain is required to recover from a percentage loss; apply
compound loss math to understand why drawdown recovery is nonlinear.

### The Teaching

This is the lesson most people skip because it is uncomfortable. Do not skip it.

**The asymmetry of losses:**

```
Loss of 10% → need 11.1% gain to recover
Loss of 20% → need 25% gain to recover
Loss of 33% → need 50% gain to recover
Loss of 50% → need 100% gain to recover
Loss of 75% → need 300% gain to recover
```

The math: if your account is $1,000 and you lose 50%, you have $500. To get back to $1,000
from $500 you need a 100% gain, not a 50% gain. The denominator has shrunk. This is why
drawdown is not symmetric — it is always harder to recover than it was to lose.

**Consecutive loss streaks are inevitable.** Even a 50% win-rate strategy will have 8-loss
streaks with some frequency over hundreds of trades. If you risk 10% per trade and hit 5
consecutive losses, you have lost 41% of your account (not 50% — the sizing is on the
remaining balance each time). Recovery from 41% requires a 70% gain.

Risk 1–2% per trade and 5 consecutive losses cost you 5–10% — painful, still survivable,
still recoverable. This is why the percentage parameters in F-03 exist.

**Max daily drawdown rule.** Most professional traders define a maximum percentage loss for
a single day. If hit, trading stops for the day. This prevents the "revenge trading" spiral
(F-08) from turning a bad morning into a catastrophic day.

### Worked Example

Account: $10,000. Risk per trade: 5% (aggressive — used here to show the math clearly).
Five losing trades in a row, each losing exactly 5% of the current balance:

| Trade | Start balance | 5% loss | End balance |
|-------|--------------|---------|-------------|
| 1 | $10,000 | $500 | $9,500 |
| 2 | $9,500 | $475 | $9,025 |
| 3 | $9,025 | $451 | $8,574 |
| 4 | $8,574 | $429 | $8,145 |
| 5 | $8,145 | $407 | $7,738 |

Net loss: $2,262 — about 22.6% of the original account. To recover to $10,000 from $7,738
requires a **29.2% gain**, not 22.6%.

Now run the same scenario at 1% risk per trade: 5 losses costs about 4.9% total. Recovery
requires 5.1%. Uncomfortable but not a crisis.

### Paired Sim Drill

**"Blow up on purpose" drill (GDD §5.4).** You are given a sim account and deliberately
set to maximum permitted leverage for your chosen market. Run until margin call. The debrief
shows the exact sequence: position size, each loss, the margin call trigger, and what 1%
sizing would have produced on the same trade sequence.

### Self-Check

1. You lose 40% of your account. What percentage gain do you need to return to your
   starting balance?
2. Why does losing 10% then gaining 10% not leave you where you started?
3. What is a max daily drawdown rule and why does it matter?

### Process Check

Do you have a max daily drawdown rule written down?

---

## F-07 — Journaling

**Objective:** Record entry rationale, exit, and post-trade reflection — not just PnL.

### The Teaching

A trading journal is not a PnL spreadsheet. It is a record of your thinking, before and
after, so that you can diagnose what is actually driving your outcomes.

A journal that only records wins and losses tells you what happened. A journal that records
*why* you entered tells you whether you are following a process or just reacting. A journal
that records your emotional state at entry tells you whether your psychology (F-08) is
affecting your process.

**What a journal entry requires:**

1. **Before entry:** instrument (fictional name in practice), direction, entry price, stop
   price, target price, calculated R:R, and — critically — *the reason you are taking this
   trade in your own words.* One or two sentences. Not a technical analysis lecture. Just
   the actual reason.

2. **At exit:** exit price, outcome in R (e.g., "+1.2R", "-1R"), whether you followed the
   plan or deviated.

3. **Post-trade reflection:** Did the trade behave as expected? If you deviated from the
   plan, what caused it? What would you do differently next time?

The review habit matters more than individual entries. Once per week, read through your
entries. Look for patterns: do you deviate more after losses? Do your "I have a strong
feeling about this" entries outperform or underperform your process-based entries?

The journal surfaces the truth. Most traders do not want the truth; they want to believe
their intuition is valuable. The journal tells you whether it is.

**On PnL in the journal.** Record it — but mark it as context, not the headline. The
question your journal answers is "did I follow my process?" A winning trade executed with
no stop and no plan is a worse entry than a losing trade with clear rationale and correct
sizing. The journal separates process quality from luck.

### Worked Example: a complete journal entry

```
Date: [sim session]
Instrument: NGSM (fictional equity)
Direction: Long
Entry: $41.80
Stop: $41.20 (60 cents; below prior day low)
Target: $43.60 (1:3 R:R on 60-cent risk)
Calculated R:R: 1:3
Risk: 1% of account = $50; size = 83 shares

Reason (pre-entry): NGSM held the prior support level through two tests this session.
Volume dried up on the last pullback, which I interpret as selling exhaustion. Thesis
invalidated if price closes below $41.20.

Exit: $43.55 at limit. Outcome: +2.9R (near target; limit filled just before reversal).

Reflection: followed the plan. Did not move the stop. Exit was passive (limit order) which
was right — I felt the urge to close early at $42.80 but resisted. Review this: early-exit
urge appears when I have been on a losing streak. Check this pattern next week.
```

### Paired Sim Drill

**Paper sandbox — complete 3 logged trades with full journal fields.** All three fields
(pre-entry reason, exit detail, post-trade reflection) must be filled before the drill is
marked complete. Blank PnL-only entries do not count.

### Self-Check

1. What is the minimum information a useful pre-entry journal note must contain?
2. A trade wins but you deviated from your plan on the exit. Is this a good trade?
3. What question should your weekly journal review be answering?

### Process Check

Are you writing the reason before you enter, not after?

---

## F-08 — Psychology Basics

**Objective:** Name the core emotional patterns (FOMO, revenge trading, loss aversion) so
they can be recognized and interrupted.

### The Teaching

You cannot think your way out of a pattern you cannot name. This lesson names three
patterns that destroy more accounts than bad analysis does.

**FOMO — Fear of Missing Out.**
A price moves strongly. You did not plan an entry. You enter anyway because "it keeps going
and I need to be in it." FOMO entries have the worst timing in trading: you enter after the
easy move, late in the momentum, often right before the retrace. The FOMO trade is almost
always chasing.

The tell: your journal entry for a FOMO trade has no pre-planned stop, no rationale beyond
"it was moving," and often no defined target.

**Revenge trading.**
You take a loss. You immediately enter another trade — larger, faster, without analysis —
to "get the money back." This is the most reliable way to turn a small loss into a large
one. The market did not take your money personally. There is nothing to avenge. Revenge
trading is just compounding your error under emotional pressure.

The tell: time between trades collapses after a loss. Position size increases after a loss.

**Loss aversion.**
Research consistently shows that people feel losses about twice as intensely as equivalent
gains. In practice: you exit winners early (lock in the comfortable feeling) and hold losers
too long (avoid the painful feeling of booking a real loss). The net result is small wins
and large losses — the opposite of what positive expectancy requires.

The tell: you move your stop "just a bit" when price gets close. You take 0.5R profit while
holding for the 3R target. You have lots of trades closed at small gains and a few held to
large losses.

**Pattern interruption.** You cannot eliminate these responses — they are neurological. You
can build systems that fire before you can act: pre-committed stops (already in the book,
not moved), pre-written rules about trade size after a loss (size down or flat for the day),
and the journal's post-trade reflection field to diagnose which pattern appeared.

### Paired Sim Drill

**Scenario replay — flash-crash scenario (GDD §5.2); pause at decision points.** The sim
pauses at three points where each psychological trap is most likely to fire. You write what
you feel and which pattern it matches. You then see what traders who reacted to that feeling
did versus traders who followed pre-set rules.

### Self-Check

1. You missed a move on fictional pair VRXC/USD. It is still running. What is the FOMO
   trade and why is its timing usually poor?
2. After two losing trades in a row, you want to double your size on the next trade. Name
   the pattern and explain why it increases risk rather than recovering it.
3. You consistently close winning trades at 0.5R while your losing trades average 1.5R.
   Which psychological pattern is causing this?

### Process Check

Can you name the emotional pattern you experienced during the drill?

---

## F-09 — Why Most Retail Traders Lose

**Objective:** Understand the structural, mathematical, and behavioral factors that produce
aggregate retail losses — and what an honest edge hypothesis actually requires.

### The Teaching

This is a honesty module. It would be easier to skip it and go straight to strategy. We
do not skip it.

**Aggregate outcomes.** Regulatory disclosures across major forex and CFD brokers typically
show 70–80% of retail accounts losing money over any observed period. Stock market
outcomes are more varied (longer time horizons, index exposure), but for active traders in
speculative instruments the picture is similar. This is not a fringe statistic. It is the
disclosed reality across jurisdictions.

**Why the losses happen — mechanically.**

1. **Fees and spread.** Every trade costs you the spread plus any commission. A trader who
   enters and exits 5 trades per day is paying this cost 10 times. Over a month that is
   real drag on even a flat strategy. Many short-term strategies do not have enough edge to
   overcome the friction.

2. **Over-leverage.** The lesson F-06 showed compound loss math. Leverage multiplies those
   numbers. A 10:1 leveraged account that would have drawdown of 10% at spot sizing has
   100% drawdown at 10:1. The broker's margin call arrives before recovery is possible.

3. **No defined edge.** Most retail traders are pattern-matching from memory, not from
   tested hypotheses. "This setup works" based on 12 examples you remember is not an edge.
   An edge is a process that has been tested over a large sample and shows positive
   expectancy after costs. Very few traders have done this work.

4. **Emotional override.** F-08 covers the mechanisms. Over a large sample, letting FOMO
   and revenge trading fire freely produces a returns distribution that is worse than random.

5. **Treating skill as fixed.** Markets change regimes. A strategy that worked in a trending
   year may bleed in a ranging year. Traders who believe they "figured it out" stop
   updating. The market moves on without them.

**What an edge hypothesis requires.** A genuine edge hypothesis names: the specific setup
or condition, the expected win rate and R:R, the markets and timeframes it applies to, and
the sample size it has been observed across. It is falsifiable — you can write down the
conditions under which you would conclude it no longer works.

Writing this down is not pessimism. It is the only way to tell the difference between a
temporary drawdown (normal variance) and a broken strategy (time to stop).

### Paired Sim Drill

**Correlation awareness drill (GDD §5.4).** This drill runs your sim account through 100
randomized trades with realistic fee and spread drag applied. You see how many trades you
need to break even before making a dollar of profit, and what win rate is required just to
cover friction. This makes the fee-drag point concrete.

### Self-Check

1. A broker discloses that 74% of retail client accounts lost money over the past year.
   Name two structural reasons (not bad luck) that contribute to this outcome.
2. Why is "this pattern works, I've seen it work before" not an edge hypothesis?
3. What are the components of a falsifiable edge hypothesis?

### Process Check

Have you written down your edge hypothesis?

---

## F-10 — Scams and Signal-Seller Self-Defense

**Objective:** Recognize the patterns that TradeGame explicitly bans and that are endemic
in retail trading spaces — and understand why these patterns are red flags, not features.

### The Teaching

The signal-seller industry is large, well-practiced, and aimed directly at the same
population this curriculum serves: people who are motivated, not yet experienced, and
looking for an accelerant to results. Recognizing the patterns is not optional. It is
self-defense.

This lesson does not teach skepticism as a personality trait. It teaches specific patterns
because patterns are what you can act on.

**Red flag pattern 1: Guaranteed or near-guaranteed return claims.**
"I made 300% last month." "Our members average 15% per week." "Never had a losing month."

Any entity making these claims is either lying, using a cherry-picked sample, or describing
a period so short it proves nothing. Real track records are long, independently verified,
and include drawdown periods. Screenshotted PnL from a single account during a favorable
period proves only that the period was favorable — it says nothing about the method.

**Red flag pattern 2: VIP tier structures and pay-to-unlock-better-calls.**
A free tier exists to generate social proof and urgency. "If you want the real calls, you
need Premium/Diamond/Platinum." The implicit claim: paying more gets you better information.
The reality: the free calls are the same-quality information as the paid calls, just enough
worse to make the paid tier seem valuable. The seller profits regardless of whether your
trades work.

**Red flag pattern 3: DM-first contact from strangers.**
"I saw your post and I can help you." This is not how legitimate educators operate.
Legitimate communities publish openly, require no individual DM to access value, and do not
cold-approach prospective members in private messages. DM-first is a filtering tool: it
targets people who are isolated enough to respond.

**Red flag pattern 4: Win-rate screenshots without context.**
A 90% win-rate screenshot shows closed trades. It does not show: position size on losers vs.
winners, whether losing trades were closed or still held open off-screen, the total account
curve over the same period, or whether the screenshot was taken during a particularly
cooperative market regime. Without these, the screenshot is entertainment, not evidence.

**Red flag pattern 5: Urgency and exclusivity framing.**
"Only 10 spots left." "This offer expires tonight." "I can only take on a few more students."
Genuine education does not require manufactured scarcity. Urgency is a sales tool designed
to prevent the deliberation that would expose the offer's weakness.

**Red flag pattern 6: The "small fee for big calls" entry point.**
The fee is low enough to feel trivial. The value claim is high enough to feel compelling.
Once you have paid and are in the group, sunk-cost psychology makes you reluctant to leave
even after the calls start losing. The entry fee is not the business model; sustained
subscription or upsell to higher tiers is.

**Why this matters for us specifically.** TradeGame exists in the same attention ecosystem
as signal sellers. Our identity is the opposite: no signals, no performance promises, no
VIP tiers, process over outcome. Knowing the patterns we refuse is part of knowing what we
are.

### Discussion Prompt

No sim drill for this lesson. In your Discord journal channel, write a short response to
this prompt:

> "Someone in a trading group posts a screenshot of 47 winning trades in a row and offers
> access to their signals for a monthly fee. List three specific things about this offer
> that you cannot verify from the screenshot, and explain why each matters."

Compare your answer with others in `#office-hours`.

### Self-Check

1. A signal seller shows a win-rate screenshot with 85% wins across 60 trades. Why does
   this not constitute evidence that their method is profitable?
2. What is the structural purpose of a VIP tier in a signal-selling operation?
3. Someone DMs you: "I noticed you're new to trading — I can help you get started, just
   message me." List two reasons this pattern is a warning sign.

### Process Check

Can you explain why a track record screenshot proves nothing on its own?

---

*Foundation Track complete. Proceed to Practitioner rank gate: full track (F-01–F-10)
complete, 15 drill completions, 10 journal entries. Then select your pillar track.*

*Internal document. Private HQ only — do not publish to TradeGame---Preview.*

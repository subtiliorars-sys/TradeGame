# TradeGame — Stocks Track: Intermediate Lessons

**Status:** Living doc | Private HQ only
**Scope:** Intermediate tier lessons S-I01 through S-I04, plus S-I05 (index-rebalance mechanics — companion to SCN-005).
**Prerequisite for all:** Stocks Beginner track complete (S-B01–S-B04); Journeyman rank minimum.
**Posture:** Education, not advice. No signals. Process over outcome. Losses are curriculum.

---

## S-I01 — Earnings Seasons

**ID:** S-I01
**Track:** Stocks / Intermediate
**Rank gate:** Journeyman
**Prerequisite:** S-B03 (Long-Term vs. Swing)
**Objective:** Distinguish revenue beats from guidance; explain why a reported beat can produce a gap down and a reported miss can produce a gap up; and establish a position-sizing policy for earnings-event exposure before the event occurs — not after.

---

Four times a year, every publicly listed company reports its financial results for the past quarter. This is earnings season — a concentrated window where large numbers of companies release simultaneously and the market reprices many stocks within a short period. For traders, it is a period of structural risk that requires explicit policy decisions before positions are opened or held.

**What is reported.** The earnings report contains several data points. The two that move stock prices most reliably are:

- **Revenue and earnings per share (EPS):** the actual numbers for the period just ended.
- **Forward guidance:** management's projection for the next quarter or fiscal year — revenue range, margin expectations, key operating metrics.

The market prices stocks based on expectations about the future, not just the past. A quarterly result is already "in the past" by the time it is reported; what the market reacts to most strongly is whether the result changes expectations about the future.

**Why a beat can gap down.** NGSM reports $2.40 EPS. Analysts expected $2.20. That is a beat — actual exceeds expectation. But NGSM's guidance for next quarter is $2.10 EPS, below the $2.30 that analysts had projected. The report is backward-looking; the guidance is forward-looking. The stock gaps down because the market's forward expectation has been revised lower, despite the strong current-period result.

**Why a miss can gap up.** VLDI reports $1.80 EPS. Analysts expected $2.05. That is a miss. But VLDI revises its full-year revenue guidance upward by 15% and announces a major new contract. The miss on one quarter does not change the market's forward expectation; the guidance revision and the contract announcement raise it. Price gaps up despite the miss.

**Worked example.** NGSM is at $120 ahead of earnings. You hold 50 shares ($6,000 position). Your stop is at $115. After the close, NGSM reports a strong quarter but soft guidance. The stock opens the next day at $104 — a gap of $16 per share, below your $115 stop.

Your stop-market order was live at $115. But price never traded at $115. It opened at $104. Your stop triggered at the market open and filled at approximately $104. Loss: $16 × 50 = $800, not the $5 × 50 = $250 your stop was designed to limit. The stop did not fail. Stops cannot protect against gaps — this was in F-04 (Stop-Losses). The gap is the earnings event risk that cannot be stopped out of.

This is not a lesson about whether to hold through earnings. It is a lesson about knowing your exposure before the event, so the outcome — whatever it is — was a considered choice, not a surprise.

**The pre-event sizing decision.** There are three valid policy choices when an earnings event approaches:

1. **Exit before the report.** Crystallize your current gain or loss before the binary event. You eliminate earnings gap risk entirely. You also eliminate the possibility of a favorable gap.
2. **Hold with a sized position.** Reduce your position to a size where even a gap to your maximum acceptable loss does not exceed your account risk limit. If you would accept a 20% adverse gap on NGSM, size the position so 20% of NGSM's current price × shares = your max risk per trade (F-03).
3. **Observe and re-enter after the open.** Let the gap occur; trade the reaction after the market has had 20–30 minutes to process the report. The reaction structure (gap-and-hold vs. gap-and-fade) is its own setup and is covered in S-I02.

None of these is universally correct. The process requirement is that one of them is chosen and written down before the earnings date arrives.

---

**Scenario Drill:** Scenario replay — earnings gap up / miss on guidance (GDD §5.2). Before the replay runs, write in your journal: what is your position size, and what is your stated policy for this earnings event (exit, hold-sized, or observe)? Run the scenario. Debrief evaluates whether your stated policy matched your behavior.

**Self-Check:**
1. NGSM reports EPS of $3.10 versus the $2.90 consensus estimate. The stock gaps down 8% at the next open. Name the most likely explanation using the revenue-vs-guidance framework from this lesson.
2. You hold 100 shares of NGSM at $80 with a stop at $76. NGSM gaps down to $68 on earnings. What is your actual loss, and what is the lesson about stop-loss reliability during earnings gaps?
3. You want to hold NGSM through its earnings report. Your account is $15,000. Your maximum acceptable loss per trade is 1.5% ($225). If you expect a maximum adverse gap of $12 per share, how many shares can you hold?

**Process Check:** Do you know your earnings exposure — position size, maximum acceptable gap loss, and stated policy — before the earnings date arrives, not at the market open when the gap is already printed?

---

## S-I02 — Earnings Gap Mechanics

**ID:** S-I02
**Track:** Stocks / Intermediate
**Rank gate:** Journeyman
**Prerequisite:** S-I01
**Objective:** Explain how earnings gaps form at the open, why stop-loss orders cannot protect through a gap, and state a written policy on whether to hold positions through earnings events.

---

The gap is not the surprise. The gap is the structural consequence of a market that closes at 16:00 and reopens at 9:30 with new information. If NGSM reports after the 16:00 close and the market reprices it overnight, the repricing has nowhere to go until 9:30 the next morning. At 9:30, the accumulated repricing happens instantly — not as a series of ticks you could have exited through, but as a jump from one price to another with no trades between them.

**How gaps form.** Price discovery continues in pre-market trading (4:00–9:30) on thin volume. Pre-market prints are visible and often indicate the direction of the gap, but they are not reliable indicators of the final open price. Thin pre-market volume means large orders can move price significantly; institutional participants who want to adjust positions in size often wait for the regular session open, where deeper liquidity provides better fills. The first 9:30 print is the first truly liquid price of the session.

**What the gap means for your stop.** A stop-market order is an instruction to sell when price reaches or passes a specified level. If price never trades at your stop level — because it gaps from above your stop to below it — the stop triggers at the market open and fills at the prevailing market price at that instant, not at your stated stop level. For a large gap, the difference can be substantial.

This is not a broker failure or a system error. It is the expected behavior of a stop order at a gap open. F-04 introduced this concept in the Foundation Track; S-I02 applies it specifically to the earnings context where gaps are concentrated and predictable in their timing.

**Gap-and-hold vs. gap-and-fade.** After the gap opens, two common structures follow:

- **Gap-and-hold.** Price opens with a large gap in one direction and continues in that direction for the first hour, then stabilizes. The market has absorbed the earnings information and is repricing steadily. Buyers or sellers are committed. This structure suggests the earnings reaction was decisive.
- **Gap-and-fade.** Price opens with a large gap and then reverses, filling some or all of the gap within the session. The initial reaction was an overreaction — either too much optimism or panic — and calmer participants bring it back. This is more common after ambiguous reports (strong headline, weak guidance, or vice versa) where interpretation is contested.

Reading which structure is forming requires watching the first 20–30 minutes of the open. Volume at the open matters: a gap on high volume that immediately continues higher is more likely a gap-and-hold. A gap on declining volume that stalls and begins to retrace is more likely a gap-and-fade. Neither identification is certain; both are probabilistic observations from chart structure.

**Worked example.** NGSM reports an earnings miss. It opens at $88, down from $100. Two scenarios:

- Gap-and-hold: NGSM opens at $88, prints $86 at 9:45, $85 at 10:00. Volume is heavy throughout. Sellers are consistent. A short entry at 9:35 with a stop above $90 and a target near $80 is a defined setup with a driver (ongoing sell pressure from the miss).
- Gap-and-fade: NGSM opens at $88, prints $89 at 9:35, $91 at 9:50, $94 at 10:15. Volume peaks at open and declines. Buyers step in to take what they see as a discount. A long entry after the $90 level holds on a pullback at 10:00, stop below $88, is a different defined setup.

Neither setup is signaled in advance. Both require that you observe the first 20–30 minutes before acting, size correctly per your account-risk rule, and write your thesis in the journal before entry.

**Your policy statement.** The process requirement from this lesson is simple but non-negotiable: you should be able to state, in writing, before any earnings event, whether you will (a) hold through the report, (b) exit before the close on the report day, or (c) stand aside and trade the reaction on the next open. That statement is your policy. It exists before the event, not as a post-hoc rationalization of whatever you did.

---

**Scenario Drill:** Scenario replay — earnings gap scenario (GDD §5.2). Before the gap opens, write your policy for this event. After the gap prints, write your read of the first 20 minutes: gap-and-hold structure or gap-and-fade structure, and the evidence from price and volume that supports your read. Log both entries.

**Self-Check:**
1. NGSM closes at $110. Overnight, it reports earnings. At 9:30 it opens at $94. Your stop was at $105. At what price did your stop fill, and why?
2. After the gap to $94, NGSM prints $91 at 9:40, $89 at 9:55, and $87 at 10:10 on sustained volume. What structure label fits this, and what does it suggest about the nature of the selling?
3. After the gap to $94, NGSM prints $96 at 9:35, $98 at 9:50, and $101 at 10:15 on declining volume. What structure label fits this? What is one potential entry setup and where would you place a stop?

**Process Check:** Do you have a written policy — not a feeling, a written statement — on whether to hold positions through earnings? If you do not, you are making a fresh decision under pressure every earnings cycle, which is the condition most likely to produce emotional trading.

---

## S-I03 — Sector Rotation

**ID:** S-I03
**Track:** Stocks / Intermediate
**Rank gate:** Journeyman
**Prerequisite:** S-I02
**Objective:** Explain the mechanics of defensive-to-growth sector rotation; describe how to observe rotation from price and volume data without chasing it; and articulate the process difference between observing a rotation and acting on it.

---

The broad stock market is not one homogeneous price. It is a collection of sectors — groups of companies with similar business characteristics — that can behave differently from each other and from the index average at any given time. Sector rotation is the pattern by which capital flows from one group to another as economic conditions, interest rates, or sentiment change.

Understanding rotation is not about predicting which sector is next. It is about recognizing that an individual stock can move in a direction opposite to the broad index, and that what looks like an individual-stock thesis can be hiding a sector-level flow that you are unknowingly caught in.

**Defensive vs. growth rotation.** In periods of economic uncertainty or risk-off sentiment, capital tends to move toward defensive sectors — those whose revenues are relatively stable regardless of economic conditions (utilities, consumer staples, healthcare). In periods of expansion or risk-on sentiment, capital tends to flow toward growth sectors — those whose revenues scale significantly with economic growth (technology, discretionary consumer, financials).

The NMX 100 index includes names from multiple sectors. When growth sectors sell off and defensive sectors hold or rally, the NMX 100 might appear flat — because the losses in growth are partially offset by gains in defensive. A trader holding only growth names within the index would have a very different experience than a trader holding the full index.

**How rotation appears on a chart.** Rotation is a slow, grinding process — not an overnight event. Signs include:

- **Relative strength divergence.** Defensive names hold their price level or make new highs while growth names begin to underperform their prior trend. The index may still be flat or slightly positive while the internal composition is shifting.
- **Volume flow.** Heavy volume on defensive names combined with lighter volume on growth names suggests institutional capital is repositioning. Volume in individual names within the NMX 100 is visible in the sim.
- **Breadth narrowing.** Fewer names are making new highs even while the index is near its own high. This "narrow market" condition often precedes a rotation completing — the index is being held up by a smaller number of names, which is an unstable structure.

**The observe-before-act rule.** Rotation is one of the most commonly chased patterns in retail trading. You see defensive stocks rising and buy them — but by the time the rotation is visible in price, the institutional flow has already substantially repriced those stocks. You are buying the result of rotation, not the rotation itself.

The process-correct response to observing a rotation is to update your notes ("I am observing what looks like a defensive rotation — NGSM is underperforming the NMX 100 benchmark over 10 sessions") and then wait for a setup within your defined strategy. If your strategy is swing trading with defined entry and stop criteria, a sector-rotation observation changes your awareness of the macro backdrop but does not itself constitute an entry signal.

**What rotation is not.** Rotation is not a guaranteed cycle with predictable endpoints. "Defensive outperforms for 6 months, then growth outperforms for 12 months" is a retrospective pattern, not a prospective clock. Treating historical rotation timing as a forward signal produces trades based on the last cycle, not the current one.

**Worked example.** Over six weeks, NGSM (growth, tech-adjacent) has underperformed the NMX 100 by 12 percentage points. A fictional defensive name, Calder Utilities (ticker CALD), has outperformed the index by 8 points over the same period. You note this in your journal as "possible defensive rotation underway."

Your strategy: swing long with a defined stop below recent support. CALD has pulled back 3% after its recent run. You identify a potential entry at CALD's support, stop below that level, risk 1% of account. The driver in your journal: "CALD is in a sector that appears to be receiving institutional inflows; this is context, not the entry reason. Entry reason: price has pulled back to a defined support level with narrowing range (compression), and volume on the pullback is declining."

The sector context is a backdrop observation. The actual entry is built on chart structure and your strategy rules. You are not chasing the rotation; you are waiting for a setup within it.

---

**Scenario Drill:** Scenario replay — sector rotation scenario (GDD §5.2). During the replay, write two separate journal entries: (1) your observation of the rotation itself (which sectors are moving, which direction, over what timeframe), and (2) your setup criteria for any trade you consider (entry level, stop, driver label). Keep them separate. If entry (2) references only entry (1) as justification, flag it in your debrief notes — "sector context is not a setup."

**Self-Check:**
1. NGSM has underperformed the NMX 100 by 15 percentage points over eight weeks while a defensive sector name has outperformed by 10 points. What is the observation, and what additional information would you need before considering a trade in either name?
2. You see a defensive name making new highs on heavy volume while growth names are lagging. You buy the defensive name immediately, reasoning "rotation in progress." What process step is missing from this entry?
3. Explain the "narrow market" condition — fewer names making new highs while the index is near its own high — and describe why it matters for how you interpret a flat or positive index level.

**Process Check:** Are you observing sector rotation and waiting for your setup within it, or are you entering as soon as you label the rotation — before any price and volume criteria are met?

---

## S-I04 — Dividends

**ID:** S-I04
**Track:** Stocks / Intermediate
**Rank gate:** Journeyman
**Prerequisite:** S-I03
**Objective:** Explain how dividend yield is calculated, describe ex-dividend date mechanics and their effect on price, explain the yield-vs-growth tradeoff, and articulate why dividend yield alone is not a buy signal.

---

A dividend is a cash payment made by a company to its shareholders, typically on a quarterly schedule. When you hold shares of a company that pays dividends, you receive periodic cash in proportion to your shares held. This sounds like a straightforward feature, but dividend mechanics contain several non-obvious properties that every intermediate stock learner should understand before treating yield as a criterion.

**How yield is calculated.** Dividend yield is the annual dividend payment per share divided by the current share price:

> Yield = (Annual dividend per share) / (Current share price)

NGSM pays $2.40 per year in dividends ($0.60 per quarter). At a current price of $80, yield = $2.40 / $80 = **3.0%**.

If NGSM's price falls to $60, yield = $2.40 / $60 = **4.0%** — yield rose because the price fell, not because the dividend increased. A rising yield can be a sign of a falling stock price, not an improving dividend story.

**Ex-dividend date mechanics.** Four dates matter in the dividend calendar: the declaration date, the ex-dividend date, the record date, and the payment date. The one that affects trading directly is the ex-dividend date.

To receive a dividend, you must hold shares before the ex-dividend date. If you buy on or after the ex-dividend date, you do not receive the coming dividend. On the ex-dividend date itself, the stock price typically opens lower by approximately the dividend amount, because buyers from that point forward will not receive the dividend that was priced in.

**Worked example.** NGSM is at $80 the day before the ex-dividend date. The quarterly dividend is $0.60. On the ex-dividend date morning, NGSM opens at approximately $79.40 (the $80 minus the $0.60 dividend). If you held shares before the ex-date, you receive the $0.60 payment — so your total value is still $79.40 in price + $0.60 in cash = $80.00. You did not lose money; the payment was transferred from the share price to your cash account.

If you buy on the ex-dividend date at $79.40 and immediately sell, you will not receive the dividend. The $0.60 discount from $80 does not represent a free opportunity to collect a dividend.

**The dividend capture myth.** A common beginner error is "dividend capture" — buying just before the ex-date to collect the dividend and then selling. In a perfectly efficient market, the share price adjusts by the dividend amount on the ex-date, and you receive a cash payment equal to what you lost in price. Transaction costs and slippage typically make this a negative-expectancy trade. It is not a free income strategy.

**Yield vs. growth tradeoff.** Dividend-paying companies tend to be mature businesses with stable revenues and limited growth opportunities. They return cash to shareholders because they have more cash than reinvestment opportunities. Growth companies typically reinvest their earnings rather than distributing them, because their reinvestment opportunities generate higher returns than paying the money out.

The tradeoff:
- Yield-focused holdings: regular income, lower price volatility (typically), lower upside in strong growth markets.
- Growth-focused holdings: no income, higher price volatility, higher upside potential if growth materializes.

Neither is inherently better. The choice depends on the learner's stated purpose for the capital and their time horizon — categories introduced in S-B03 and S-B04.

**Why yield is not a buy signal.** A stock can have a high yield because the dividend is genuinely generous relative to its price, or because its price has fallen sharply while the dividend has not yet been cut. A falling price that raises yield may be telling you that the market expects the dividend to be reduced or eliminated — a "yield trap." The yield number does not tell you which scenario you are in.

Before treating yield as a positive attribute, the process question is: is the dividend sustainable? The answer requires looking at earnings coverage (can the company afford to pay this dividend from its current earnings?) and the trend in free cash flow — not just the current yield figure.

---

**Sim Drill:** DCA/rebalance sim — compare a yield-focused allocation (including Calder Utilities, ticker CALD, a fictional defensive dividend-paying stock) against a growth-focused allocation (NGSM, growth profile) over a simulated six-month period with one rate-change event. Log: the income received in each allocation, the price return in each, and the total return. Note which allocation you would prefer under each scenario and why.

**Self-Check:**
1. NGSM pays an annual dividend of $3.20. Its price is $64. What is the yield? If the price falls to $40 (and the dividend is unchanged), what is the new yield? What might explain why a rising yield is sometimes a warning sign?
2. NGSM's ex-dividend date is tomorrow. The dividend is $0.80 per share. You buy 100 shares today at $95.00. What price would you expect NGSM to open at on the ex-dividend date, all else equal? What is your total position value (price + cash dividend received) immediately after the ex-date open?
3. Explain in one sentence why "buy before ex-date, sell after, collect the dividend as income" is not a reliable profit strategy.

**Process Check:** Can you explain why dividend yield alone is not a buy signal — specifically, what the yield number does not tell you — without using the phrase "past performance does not guarantee future results"?

---

## S-I05 — Index Rebalance and Passive Fund Mechanics

**ID:** S-I05
**Track:** Stocks / Intermediate
**Rank gate:** Journeyman
**Prerequisite:** S-I04
**Objective:** Explain why passive index funds must buy at an inclusion announcement, describe the front-run pattern and closing-auction mechanics, and articulate why chasing an announced inclusion late in the run is poor process.

---

The NMX 100 is a fictional index of 100 stocks. Passive funds that track the NMX 100 — funds whose stated goal is to match the index's performance — must hold the index's components in proportion to the index weights. When the index changes its composition (adds a new name, removes an old one, or reweights existing members), the passive funds that track it must trade to match the new composition. That forced trading is mechanical: it does not depend on any view of whether the added stock is cheap or expensive. It happens because the fund's mandate requires it.

This mechanic creates a predictable, observable price pattern around inclusion events — and understanding it is the foundation for understanding why SCN-005 (NMX 100 inclusion of VLDI, Veldara Industrial) unfolds the way it does.

**Why passive funds must buy at inclusion.** When VLDI is announced as a new NMX 100 component, every passive fund tracking the NMX 100 must eventually hold VLDI in proportion to its index weight. The funds do not have a choice — that is what "passive" means. They must buy before or at the moment VLDI becomes officially part of the index (the effective date). Because the funds typically use the closing price on the effective date as their benchmark price, they concentrate their buying at the closing auction on that day.

**The front-run pattern.** Active traders and short-term participants observe the inclusion announcement. They know that passive funds must buy VLDI before the effective date. So they buy VLDI in advance — "front-running" the anticipated passive demand. This buying begins the moment the announcement is public and continues through the days leading up to the effective date.

This is not illegal or unusual — it is participants acting on publicly available information about a known future mechanical event. The result is a predictable price run from the announcement date to the effective date as demand accumulates ahead of the forced buyer.

**The closing auction.** The closing auction is a special order-matching session that occurs in the final minutes of the trading day (approximately 15:50–16:00 in the sim). In a standard session, trades execute continuously throughout the day. In the closing auction, orders accumulate during the auction period and match at a single clearing price at 16:00 — the official closing price.

Passive index funds use the closing price as their benchmark because it is the official price at which the index is valued. To minimize tracking error (the difference between the fund's return and the index's return), passive funds buy at the closing auction on the effective date so that their average cost matches the closing price. The concentration of large passive fund orders in a short window creates a predictable volume spike — often 8–12× normal daily volume — at the auction.

**The auction print and immediate reversion.** In SCN-005, VLDI's auction print on inclusion day reaches $37.80. The previous session close was approximately $37.20. That $0.60 spike is the passive fund buying executing simultaneously at the auction. Once the auction closes and the passive funds have their required shares, the demand is exhausted. The price reverts immediately to $37.20 at the post-auction open — and then continues to fade over the following sessions as the front-runners who bought early exit.

This reversion is not a surprise if you understand the mechanics. The auction spike was caused entirely by one-time, finite, mechanical demand. Once that demand is complete, the only buyers left are those with a fundamental view of VLDI as a business — and there is no reason those buyers would pay a higher price than before the announcement, since nothing about VLDI's actual business changed.

**Why late chasing is poor process.** In SCN-005, the pre-announcement price was $31.40. A trader who observed the announcement on Day 1 and entered with a written thesis ("driver: mechanical passive-fund flow; I am front-running a known forced buyer") at $34.00 with a defined stop has captured most of the front-run opportunity while the mechanical demand is still building.

A trader who enters at Day 3's high of $36.50, reasoning "this is going to keep going into the auction," has a fundamentally different risk profile:

- **Less flow benefit remaining.** Most of the front-run buying has already occurred. The passive funds buy at the auction; the front-runners who bought Day 1 and Day 2 are now potential sellers.
- **More price risk.** The entry is 16% above the pre-announcement price. A reversal of even half the run leaves this trader with a significant loss.
- **Timing mismatch.** The auction spike ($37.80) is 3.5% above the Day 3 entry of $36.50, a small gain that disappears in the post-auction fade to $34.60.

The Day 3 entry is not wrong because the price was wrong. It is poor process because the driver is almost exhausted at entry, the stop-to-target ratio is unfavorable, and the thesis ("get in before the auction") conflates observing a mechanical event with having a risk-defined position in it.

**Worked example.** Pre-announcement close: $31.40. Day 1 entry (post-announcement, first 30 minutes): $34.00. Stop below Day 1 open gap: $32.80. Risk per share: $1.20. At 1% account risk on a $10,000 account ($100 risk), position size: $100 / $1.20 = 83 shares.

Scenario A: price reaches $37.00 before the auction. Stop is raised to $35.60 (trailing stop). Price reverts post-auction to $34.60. Stop triggers at $35.60. Gain: ($35.60 − $34.00) × 83 = $132.80 gross.

Scenario B: price pulls back to $33.80 on Day 4 before the auction. Stop at $32.80 survives. Exit at $33.80 at a small loss: ($34.00 − $33.80) × 83 = $16.60 gross loss.

Both are correct-process outcomes. Scenario B is a loss. It is not a process failure — the thesis was reasonable (front-running known mechanical flow), the entry was early enough to have a favorable risk profile, and the stop was honored. The debrief for SCN-005 awards full XP for both outcomes when the journal entry contains the driver label and the stop was placed before entry.

**What passive indexing means for long-term holders.** If you hold the NMX 100 index ETF introduced in S-B02, you are, in aggregate, the passive fund described in this lesson — you own all 100 names. Inclusion events cause you to automatically gain exposure to the new addition at whatever price the fund pays at the closing auction — which in a front-run scenario is higher than the pre-announcement price. This is a small, persistent cost of passive index exposure called "index inclusion drag." It is real but small at scale; it is one of the known tradeoffs of passive indexing compared to active management.

---

**Scenario Drill:** SCN-005 — NMX 100 Index Inclusion Day (VLDI). Before any trade, write in your journal: who is the forced buyer, when must they buy, and what does that mean for the timing and size of mechanical demand? This driver label is required for any trade XP in the scenario. At Decision Point C (Day 3 peak), write separately: how much of the anticipated flow-benefit has already been captured, and what is the risk-to-reward on a new entry here?

**Self-Check:**
1. A passive fund tracks the NMX 100 index. VLDI is added to the index with an effective date of Friday's close. The fund currently holds no VLDI. Why must the fund buy VLDI, and why is the closing auction on Friday the concentrated purchase window?
2. VLDI is at $31.40 pre-announcement. On Day 3 of the run, it is at $36.50. On the closing auction it prints $37.80. Two sessions later it is at $34.60. Explain the price path using only the mechanics of mechanical flow, front-running, and flow exhaustion — without using the word "momentum."
3. A late entrant buys VLDI at $36.50 on Day 3 with no stop. The auction prints $37.80, then price fades to $34.60. What is the loss per share, and what process gaps does the debrief identify for this trader?

**Process Check:** Can you state the difference between "this stock is being added to an index" (a factual observation) and "I have a process-correct entry in this stock" (a defined position with a driver label, a stop, and a favorable risk-to-target ratio)? If the first sentence leads directly to a trade without the second sentence, you are acting on an event, not a setup.

---

*Internal curriculum document. Do not publish to TradeGame---Preview.*

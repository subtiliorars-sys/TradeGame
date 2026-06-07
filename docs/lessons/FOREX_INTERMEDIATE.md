# TradeGame — Forex Intermediate Lessons

**Status:** Living doc | Private HQ only
**Scope:** All four intermediate forex lessons (X-I01 through X-I04).
**Prerequisite for all:** Forex Beginner track complete (X-B01–X-B04); Practitioner rank minimum.
**Posture:** Education, not advice. No signals. Process over outcome. Fictional instruments only.

---

### X-I01 — Session Open Liquidity Sweeps

**ID:** X-I01
**Track:** Forex / Intermediate
**Rank gate:** Journeyman
**Prerequisite:** X-B03 (Sessions and Timezones), X-B04 (Spreads and Cost of Trading)
**Objective:** Describe the mechanics of a session-open liquidity sweep, explain why price frequently revisits prior-session ranges, and identify where a stop order is most vulnerable at the London open.

---

You have already learned that the London open is the highest-volume single-session event in the forex day. What the beginner lessons did not go into is what that volume surge actually does to price in the first fifteen to thirty minutes — and why that window has an uncomfortable habit of hunting the stops that cautious traders carefully placed the night before.

**The mechanics of a sweep.** Institutional order flow at a session open is not directional in the way a trade entry is directional. Large participants are filling orders across both sides of the book, probing for liquidity. Stop orders from the prior session's range sit in predictable locations: just below a recent swing low for long positions, just above a recent swing high for short positions. When a large buy or sell order needs to be filled, it benefits from the liquidity that stop-triggered orders provide. The result is a sharp spike — sometimes several pips beyond the prior session's range extreme — followed by a reversal once the available stops are absorbed.

**What this looks like on the ANDU/HarborUSD chart.** The prior session's low is 1.2380. At the London open, price dips sharply to 1.2363 — clearing the stops placed just below 1.2380 — then recovers back above 1.2390 within twenty minutes. A trader whose stop was at 1.2375 was stopped out before the move they anticipated ever developed. The position was correct. The stop placement did not account for the sweep.

**Why price revisits prior levels.** The sweep itself is a clue. When price makes a sharp spike and returns, it signals that the spike did not attract sustained selling interest — the move was mechanical (stop absorption) rather than fundamental. Traders who understand this observe the sweep, wait for the reversal confirmation, and note that the prior session's range is now established as a reference. Whether to act on that observation is a separate judgment call that belongs in your process and your trading plan — not a signal from this lesson.

**Stop placement in a sweep-prone window.** The practical takeaway is geometric: if the London open routinely spikes X pips beyond prior lows/highs, a stop placed at exactly the prior extreme is inside that typical sweep distance. A stop placed beyond the realistic sweep range survives the spike — but a wider stop requires a smaller position to maintain your dollar risk rule (F-03). There is no free way around this. You either accept a wider stop with a smaller position, or you accept the statistical reality that a tight stop will be triggered regularly at the open.

In the sim you will practice — over multiple simulated London opens — placing your stop at different distances from the prior session extreme and observing which placements survive the initial spike. The lesson is in the repetition, not in a number.

**The session-to-session journal habit.** Experienced forex traders note the prior session's high, low, and mid-range before the London open. These are not prediction targets. They are reference points for where stop clusters likely sit. Knowing the map does not tell you what price will do — it tells you which areas carry mechanical significance.

---

**Sim Drill:** Scenario replay — London open liquidity sweep (GDD §5.2). Run three simulated London opens on ANDU/HarborUSD. Before each run, identify the prior session's swing high and low and mark where you would place a stop for a hypothetical long position. After the sweep, log: did the spike clear your stop level? By how many pips? Journal what placement would have survived and what the position size would need to be at that placement to maintain 1% risk.

**Self-Check:**
1. The prior New York session's low on ANDU/HarborUSD is 1.3040. At the London open, price dips to 1.3022 before recovering to 1.3055. A trader had a stop at 1.3035. Describe the sequence of events and why the trader's direction view may still have been correct.
2. Widening a stop to survive a typical sweep requires what corresponding adjustment to position size — and why?
3. Name one condition that would tell you a London open spike is a genuine directional move rather than a liquidity sweep.

**Process Check:** Do you know where your stop is relative to the prior session's range extreme — specifically how many pips of clearance you have against a typical sweep at the London open?

---

### X-I02 — High-Impact News Events

**ID:** X-I02
**Track:** Forex / Intermediate
**Rank gate:** Journeyman
**Prerequisite:** X-I01, X-B04 (Spreads and Cost of Trading)
**Objective:** Describe the price and spread behavior around a high-impact economic release, understand why stops cannot reliably protect positions through a release, and articulate a written policy for holding positions into news events.

---

Forex markets respond to scheduled economic data releases with a speed and violence that is unlike any other routine event in the trading week. The scenario catalog uses "Monthly Labor Conditions Report" on ANDU as the primary worked example (SCN-006). This lesson gives you the mechanical context that makes that scenario legible.

**What happens at the release.** In the minutes before a high-impact release — a labor market report, a central bank rate decision, a major inflation print — market makers widen their spreads substantially. Liquidity providers pull quotes from the book because they do not want to be filled at a stale price the moment the data crosses. In the sim, you will observe ANDU/HarborUSD spread widening from its typical 1.5 pips to 8–15 pips in the two minutes before the release window. You are not paying a worse price because conditions are worse for you specifically. You are paying because the market is refusing to take the other side cheaply during a period of maximum uncertainty.

**The spike-and-reversal pattern.** The release hits. Algorithmic readers process the number in milliseconds and fire orders before any human can react. Price moves 40, 60, or 100+ pips in seconds. Then, frequently, it partially or fully reverses as the secondary interpretation of the data — nuance that algorithms missed — flows in over the next minutes. In SCN-006, the ANDU labor report comes in better than expected. ANDU/HarborUSD spikes upward 60 pips, then retraces 35 pips as traders reassess the forward rate implications. Both the spike and the retrace happen within five minutes.

**Why your stop cannot help you.** A stop-market order tells your broker to exit at the next available price after your stop level is touched. During a news spike, the "next available price" can be 20–40 pips beyond your stop level because the bid-ask has evaporated. This is slippage, and in a news environment it is not a failure of your broker — it is the structural consequence of a momentarily illiquid market. A stop at 1.3200 on a long fills at 1.3165 during a spike through that level. You planned for a 30-pip loss; you received a 65-pip loss. F-04 introduced this concept for gaps in stocks; the forex news event is the equivalent mechanism.

**Worked example — SCN-006 setup.** You hold a long ANDU/HarborUSD position entered at 1.3250, stop at 1.3200 (50 pips risk). Account: $5,000. Risk: 1% = $50. Pip value on your lot size: $1.00/pip. The Monthly Labor Conditions Report releases. Price drops 80 pips in three seconds. Your stop fills at 1.3168 — 32 pips of slippage beyond your stop. Actual loss: 82 pips × $1.00 = $82. You planned for $50. The extra $32 came from slippage that no stop placement could have prevented once you were in the position during the release.

The lesson is not that the stop was in the wrong place. The lesson is that a position held through a news release carries slippage risk that is outside the normal position-sizing math.

**The policy question.** Many structured traders maintain a written rule: flat before [event type]. Some define "flat" as no positions at all; others define it as closing positions on pairs directly affected by the release while keeping exposure on unaffected pairs. Neither is the curriculum's recommendation — that choice belongs in your trading plan (X-A03). What the curriculum does insist on: the policy is written before the release, not decided in the moment while watching the spread widen.

**Spreads during events — the cost framing.** X-B04 taught you to factor spread into your R:R before entry. A high-impact event changes that spread dynamically after you are already in. If your plan does not address how you handle that mid-trade spread expansion, the event is making the decision for you.

---

**Sim Drill:** Scenario replay — NFP release scenario, using the Monthly Labor Conditions Report on ANDU (SCN-006, GDD §5.2). Before the scenario runs, write your policy: will you hold or exit before the release? Run the scenario with a position held through the release and observe actual slippage versus intended stop. Run it a second time flat before the release. Journal: what was the dollar difference between the two outcomes? Which outcome matched your written policy?

**Self-Check:**
1. ANDU/HarborUSD is at 1.3250. The Monthly Labor Conditions Report releases. The pair drops 90 pips in four seconds. Your stop-market order was at 1.3210. Where might your fill actually be, and what concept explains the gap between your stop level and your fill price?
2. Spread widens from 2 pips to 12 pips in the minute before the release. You entered at the ask during the wide spread. How does this affect your break-even pip move compared to your R:R calculation done at normal spread?
3. State what a pre-event position policy should contain (at minimum two elements) and why it must be written before — not during — the event.

**Process Check:** Do you have a written policy for whether you hold positions through high-impact news releases — and did you write it before the last time you held through one?

---

### X-I03 — The Carry Concept

**ID:** X-I03
**Track:** Forex / Intermediate
**Rank gate:** Journeyman
**Prerequisite:** X-I02, X-B01 (Pairs, Quotes, and Pips)
**Objective:** Explain the interest rate differential mechanic behind carry trades, describe the conditions under which carry enhances returns, and identify the conditions under which positive carry becomes a net loser.

---

Every currency belongs to an economy with a central bank and an interest rate. When you hold a forex position overnight, you are effectively holding one currency (the base you bought) and borrowing another (the quote you sold). If the currency you hold pays a higher interest rate than the currency you borrowed, the net differential is credited to your account. This is carry — and it sounds like free money until you account for when it is not.

**The mechanics.** In the TradeGame sandbox, the fictional rate environment assigns ANDU a higher notional rate than HarborUSD. Holding a long ANDU/HarborUSD position overnight means you hold the higher-rate currency and are short the lower-rate one. The daily rollover credit — called a swap — is applied at the session close (typically 22:00 UTC in most broker conventions). The credit is small: on a micro lot it may be fractions of a pip per day. The reason traders have historically cared is that carry adds up over weeks and months, and in a trending market where price is also moving in your favor, it is a second source of return layered on top of price appreciation.

**When carry works.** Positive carry performs best when price is trending in the direction of the carry — that is, when the higher-yielding currency is also strengthening. In that environment you are collecting the interest differential while price appreciation compounds the return. In the Session/carry sim (GDD §5.3), you will run a synthetic multi-week scenario where ANDU/HarborUSD trends gradually upward while daily swaps accumulate. The combined return from price and carry will be visible in the sim account over the scenario's duration.

**When carry bleeds.** The same scenario inverted is painful in a specific way. If ANDU/HarborUSD enters a ranging market, price goes nowhere but swap credits accumulate slowly — so carry barely covers the spread cost of maintaining the position. If the pair reverses and ANDU weakens against HarborUSD, price losses mount while swap credits are too small to offset them. In a sharp reversal, a position that was profitable from carry alone for six weeks can be underwater from a three-day move.

**The leverage interaction.** This is the critical register point for this lesson. Carry is quoted in absolute terms per lot per day. On a standard lot, the daily carry might be meaningful. On a micro lot, it is negligible. The only way to make carry "feel" large is to use large lot sizes — which means large leverage. Large leverage in a ranging or reversing environment does not just neutralize the carry; it produces losses that dwarf any accumulated carry credit. The lesson here is structural: carry as a concept is real and mathematically legitimate. Carry as a reason to increase position size is a framing that leads to over-leverage.

**Worked example.** You hold 3 mini lots of ANDU/HarborUSD (long ANDU) over 10 simulated trading days. Daily swap credit: $0.42 per mini lot per day.

Total carry credit: 3 lots × $0.42 × 10 days = $12.60.

Over the same 10 days, ANDU/HarborUSD drops 45 pips. Pip value for 3 mini lots: approximately $2.28/pip.

Price loss: 45 × $2.28 = $102.60.

Net position: $12.60 carry − $102.60 price loss = −$90.00.

The carry did not protect you. It contributed 12% of the loss back, which is indistinguishable from noise at this scale. In a real account this is the calculation you would face; in the sim you will observe the same dynamic directly across the scenario's timeline.

**The ranging problem.** In a tight range, you might collect carry for weeks. Every day feels like slow progress. Then the range breaks and price returns every pip of accumulated carry in an hour. The position-sizing rule (F-03) still governs: your stop distance determines your size, not the carry credit you are hoping to accumulate.

---

**Sim Drill:** Session/carry sim (GDD §5.3) — run a synthetic carry trade on ANDU/HarborUSD across two simulated periods: (a) a trending period where ANDU strengthens, with daily swaps accumulating; (b) a ranging-then-reversal period. Log separately: daily carry credit, price PnL, and net. Journal the condition at which the carry trade became a net loser in scenario (b).

**Self-Check:**
1. ANDU/HarborUSD pays a daily swap of $0.55 per mini lot. You hold 2 mini lots for 14 days. The pair moves 30 pips against you. Pip value for 2 mini lots is $1.52/pip. What is your net position, and did the carry help you?
2. Name the specific market condition — in one sentence — that turns a positive-carry trade into a net loser without requiring a large directional move.
3. Why does increasing lot size to "feel" the carry more materially increase a risk that is separate from the carry itself?

**Process Check:** Can you name — right now, without looking it up — the condition that would turn your current or hypothetical carry position into a net loser? If the answer involves price, you understand this lesson.

---

### X-I04 — Why Retail Forex Loses: The Numbers

**ID:** X-I04
**Track:** Forex / Intermediate
**Rank gate:** Journeyman
**Prerequisite:** X-I03, F-09 (Why Most Retail Traders Lose)
**Objective:** Read and interpret aggregate broker loss-rate disclosures, identify the structural disadvantages unique to retail forex, and produce an honest accounting of the gap between retail and institutional conditions.
**Harvest slot:** HARVEST-05 (pending compliance review)

---

F-09 introduced the broad picture: fees, over-leverage, no edge, emotional override. This lesson narrows to forex specifically, because forex carries the worst aggregate retail loss statistics of any market in this curriculum — and the reasons are specific enough that a generic "trading is hard" explanation does not do the work.

**The disclosure numbers.** Regulated brokers in the European Union, the United Kingdom, Australia, and several other jurisdictions are required by their regulators to publish the percentage of retail client accounts that lose money. The specific format and publication requirements differ by jurisdiction — this is not a universal standard. The numbers that have been publicly disclosed cluster in a range: across multiple brokers with disclosed statistics, the percentage of losing retail accounts typically falls between 67% and 82%, with some disclosures above that range.

These numbers are not cherry-picked pessimism. They are mandatory public disclosures. The requirement to publish them exists precisely because regulators recognized that retail participants were not making informed decisions about the product they were entering.

What the numbers mean structurally:

- The losing-account percentage is not evenly distributed over time. Accounts that close quickly (within the first 90 days) inflate the loss rate. This is consistent with the leverage mechanism taught in X-B02: an under-margined account at high leverage reaches stop-out on normal volatility.
- The numbers describe closed accounts, not all open accounts. An account that is technically open but has lost 80% of its value and is no longer actively traded does not appear in the "closed losing account" count. The actual loss rate across all accounts is likely higher than disclosed.
- Broker profitability from retail flow is partially derived from spread and partly from the structure of the market-maker model in which the broker takes the other side of some retail trades. This is disclosed in broker documentation as "we may be your counterparty." It does not mean the broker is manipulating your trade; it means there is a structural conflict of interest between a broker's revenue and your success as a retail trader.

**What the structural disadvantages are.** Beyond leverage, three forces work against retail forex participants specifically:

1. **Information asymmetry.** Institutional participants have access to bank-level order flow data that retail traders do not. They know, with statistical reliability, where retail stop clusters sit. The X-I01 lesson on liquidity sweeps is a consequence of this asymmetry, not an anomaly.

2. **Cost disadvantage.** Institutions trade on interbank spreads that are a fraction of what retail traders pay. A retail trader paying a 1.5 pip spread on ANDU/HarborUSD is paying many multiples of what an institutional desk pays for the same pair. Costs that look small per trade compound over hundreds of trades.

3. **Leverage availability and its use.** Retail leverage maximums — even where regulated — are multiples of what most professionals use. The availability of high leverage is not a benefit offered to retail traders; it is the feature that generates broker revenue when accounts blow up, because the broker resets quickly and the retail trader absorbs the loss.

**What this lesson is not saying.** It is not saying that retail forex participation is irrational or that no retail participant can develop a durable process. Some do. The lesson is saying: the baseline is adversarial in specific, structural ways, and treating those structural disadvantages as solvable by chart skill alone is an error. The response to this information is not despair and not dismissal. It is honest accounting — understanding your cost structure, your leverage constraints, and the information environment you are operating in before you ever set a lot size.

**The worksheet.** The drill for this lesson is structured reflection, not a sim. You will read a sample broker risk disclosure (the game provides a synthetic analog; in a real account you would read your own broker's actual disclosure) and answer: what is the disclosed loss rate? What leverage does the broker offer? What is the spread on your target pair? Then calculate: at your proposed lot size and stop distance, what is the break-even pip move you need just to cover the spread on entry, expressed as a percentage of your stop distance?

---

**Sim Drill:** No sim drill — structured worksheet in `#forex-journal`. Read the synthetic broker disclosure provided in the game's resource library. Answer: (1) What is the disclosed retail loss rate? (2) What is the maximum leverage available? (3) What is the spread on ANDU/HarborUSD at peak hours and off-peak? (4) At 1% risk per trade with a 30-pip stop and a standard-lot pip value of $10, how many pips does the spread alone cost you on entry, expressed as a percentage of your stop distance?

**Self-Check:**
1. A regulated broker discloses that 74% of retail accounts lose money. A friend says "that means 26% win, so I just need to be in the top quarter." What is missing from this analysis?
2. Name one structural advantage institutional forex participants have that is not accessible to retail traders, regardless of skill level.
3. You have read the risk disclosure for a hypothetical broker before opening a sim account. What two numbers in that disclosure are most directly relevant to your position sizing decision?

**Process Check:** Have you read the broker risk disclosure you accepted — not skimmed, read — and do you know the disclosed loss rate for retail accounts at that specific broker?

---

*Internal curriculum document. Do not publish to TradeGame---Preview.*

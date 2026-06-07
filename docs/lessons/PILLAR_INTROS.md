# TradeGame — Pillar Intro Lessons

**Status:** Living doc | Private HQ only  
**Scope:** First three beginner lessons for each of the three pillar tracks (9 lessons total).  
**Prerequisite for all:** Foundation Track F-01 through F-06 complete (Trainee rank minimum).  
**Posture:** Education, not advice. No signals. Process over outcome. Losses are curriculum.

---

## Crypto Track — Beginner Lessons

---

### C-B01 — Spot Mechanics

**ID:** C-B01  
**Track:** Crypto / Beginner  
**Rank gate:** Trainee  
**Prerequisite:** F-03 (Position Sizing)  
**Objective:** Explain the difference between spot buying and margin trading, and articulate why beginners start with spot only.

---

When you buy GLIMMER on a spot market, the transaction is simple: you hand over HarborUSD, you receive GLIMMER. You own it. If GLIMMER drops 40%, you have lost 40% of the money you put in — no more, no less. That is the defining feature of spot: your loss is bounded by what you actually deposited.

Margin trading works differently. A broker or exchange lends you additional capital on top of what you deposited (your "margin"). With 5× leverage, a $200 deposit controls a $1,000 position. A 10% price drop against you does not cost $100 — it costs $100 on the full $1,000 position, which is your entire $200 deposit. You did not lose 10%. You lost 100% of your margin. The Foundation Track (F-06) showed you how compound losses work; leverage accelerates that curve and removes the floor.

**Worked example.** You have $500 and want to buy GLIMMER at $50 per token.

- Spot: you buy 10 GLIMMER. Price drops to $30. You now hold $300 worth of GLIMMER. Loss: $200, or 40%. GLIMMER can recover; you still own it.
- Margin (5×): your $500 controls a $2,500 position — 50 GLIMMER. Price drops to $30. Position value: $1,500. Loss on position: $1,000. Your $500 margin is gone plus you may owe more depending on how the exchange handles the shortfall. You are out before the recovery ever happens.

Neither outcome is a prediction about GLIMMER. The point is structural: spot caps your downside at your stake. Margin does not.

**Why this matters in the game.** TradeGame's paper sandbox starts you on spot-only pairs by design. You will see a synthetic spot feed for GLIMMER/HarborUSD. Practice buying at market, setting a limit order below the current price, and selling. Notice the bid-ask spread. Notice that the price you see and the price you fill at are not always identical — that gap is the spread cost you read about in the Foundation Track.

Beginner coaches frequently see learners skip spot and reach for leverage immediately, chasing larger numbers. The aggregate loss data (which you will examine in F-09 and again in X-B02 for the forex equivalent) shows that leverage is the single most consistent differentiator between accounts that survive and accounts that do not. Spot is not a consolation prize. It is where you build the mechanics that keep you alive when you eventually choose to add complexity.

---

**Sim Drill:** Paper sandbox — crypto spot. Buy and sell a synthetic GLIMMER/HarborUSD position. Log entry price, exit price, and the spread cost you paid.

**Self-Check:**
1. If you buy 20 GLIMMER at $40 each (spot, no leverage) and the price falls to $28, what is your dollar loss and what percentage of your stake did you lose?
2. With 10× leverage and a $300 margin deposit, how many dollars does your account control? What price move against you wipes the margin entirely?
3. What is one structural reason spot is taught before margin, independent of how confident you feel about your direction?

**Process Check:** Are you trading spot only until you can articulate — in writing, not just in your head — why leverage is mechanically different from spot?

---

### C-B02 — Wallets and Custody

**ID:** C-B02  
**Track:** Crypto / Beginner  
**Rank gate:** Trainee  
**Prerequisite:** C-B01  
**Objective:** Distinguish hot wallets from cold wallets, explain exchange custody risk, and state what "not your keys" means mechanically.

---

In the world of legacy finance, a bank holds your money and you hold a claim against the bank. The bank is the custodian. In crypto, there is a technical alternative: you can be your own custodian by controlling the private key — the secret that authorizes transactions from a wallet address.

Understanding this split is not optional trivia. It is a structural property of the ecosystem that directly affects your risk exposure.

**Exchange custody.** When you deposit tokens into an exchange and see a balance on screen, you do not hold a private key. You hold a promise. The exchange holds the keys and credits your account internally. If the exchange is hacked, insolvent, freezes withdrawals, or is shut down by a regulator, your credited balance may be inaccessible or gone. This is not hypothetical — it has happened repeatedly across the history of the asset class. The specific events are described by their mechanics in the curriculum, never as predictions about current platforms; you will revisit the anatomy in C-I02 (flash crash) and C-I01 (depeg mechanics) where the underlying cascade logic is the same.

**Hot wallets.** A software wallet — a browser extension or a mobile app — stores your private key on a device connected to the internet. You control the key, so exchange custody risk disappears. In its place arrives a different risk: your device. Malware, a compromised seed phrase, or a phishing attack can drain a hot wallet without any platform being involved. Hot wallets are convenient for active interaction.

**Cold wallets.** A hardware device or an air-gapped machine generates and stores the private key offline. Signing a transaction requires physical access to the device. The attack surface is dramatically smaller. The tradeoff is friction and the new risk of physical loss: a misplaced seed phrase with no backup means permanent loss of access.

**The seed phrase.** Every non-custodial wallet — hot or cold — is recoverable from a 12 or 24 word seed phrase. That phrase IS the wallet. Anyone who has it controls the funds. Back it up physically (paper or metal), never digitally, never in cloud storage. There is no "forgot password" in self-custody.

**Practical framing for beginners.** You do not need to self-custody before you start learning. The game's paper sandbox has no real custody layer — all positions are synthetic. But you should understand the custody spectrum before you ever hold real tokens, because the choice of where to hold them is a separate risk decision from what you hold.

---

**Sim Drill:** Conceptual only — no real wallet activity in the game. Discussion prompt in `#crypto-learn`: describe the custody choice you would make and why, given what you just read. Include one risk you accept with your choice.

**Self-Check:**
1. If an exchange becomes insolvent, what does a user with a credited balance actually have a claim on?
2. What is the one piece of information that gives complete access to a self-custody wallet, and why is storing it digitally dangerous?
3. Name one risk that self-custody eliminates and one risk that self-custody introduces.

**Process Check:** Do you understand what self-custody means mechanically — not just conceptually — before you hold any real tokens?

---

### C-B03 — 24/7 Sessions and Volatility

**ID:** C-B03  
**Track:** Crypto / Beginner  
**Rank gate:** Trainee  
**Prerequisite:** C-B02  
**Objective:** Explain why crypto markets have no close, describe what volatility regimes look like visually, and identify a regime shift from chart structure alone.

---

Stocks trade during defined session hours. Forex has four overlapping regional sessions that together cover most of the weekday. Crypto has neither. The order books for synthetic pairs like GLIMMER/HarborUSD — and their real-world equivalents — never close. Trading runs continuously across every hour of every day, including weekends and public holidays.

That structural property produces a set of practical consequences you need to internalize before you size a position.

**No gap rule.** In stocks, a company can report earnings after market close, and by the time the market reopens, the price has "gapped" overnight — you could not have exited between the last session price and the new open price. In crypto, the equivalent move happens in real time, visible tick by tick, but it can happen at 3 a.m. on a Sunday when you are asleep and your stop is sitting in the book.

**Volatility is not constant.** Crypto markets cycle through periods of relatively tight, mean-reverting price action (range) and periods of explosive directional movement (trend or spike). These are called volatility regimes. During a range regime, GLIMMER might oscillate between $47 and $53 for days. During a spike regime, it can cover the equivalent of several weeks' range in a single hour.

**Why regime matters for your position.** A stop-loss placed based on a range regime's typical daily movement may be too tight to survive normal noise in a spike regime — and too wide to matter in a compression regime before a breakout. Strategy type and stop width both need to be calibrated to the regime you are actually in, not the regime you expect or remember.

**Reading regime from chart structure.** You do not need an indicator to recognize a regime shift. Practice these two observations:

1. Are the candles clustered in a horizontal band, or are they stepping progressively in one direction?
2. Is the distance between recent swing highs and swing lows contracting or expanding?

Contraction followed by expansion is the signature of a compression-then-breakout transition. Expansion sustained over multiple sessions, with higher highs and higher lows (or lower lows), is trending. Neither is permanently stable. Regimes end. The C-I04 lesson develops this further with synthetic period comparisons; C-B03 is where you start noticing.

**The overnight/weekend exposure problem.** Because there is no close, positions left open do not "pause." Funding rates, price moves, and liquidation risks accrue continuously. Sizing a position you intend to hold over a weekend should account for the full possible move during that window, not just intraday ranges.

---

**Sim Drill:** Paper sandbox — observe a synthetic GLIMMER/HarborUSD feed over a simulated weekend period. Log: the approximate range of the range regime you observe, and the point at which you would characterize the regime as having shifted. Compare with a classmate's log in `#crypto-journal`.

**Self-Check:**
1. A 24/7 market means your stop order is live at 2 a.m. on Saturday. What is one practical thing you can do before stepping away from a position that reduces your exposure to an overnight spike?
2. Looking at a GLIMMER/HarborUSD chart, candles are printing progressively lower lows over six consecutive sessions. What regime label fits this, and what regime might follow?
3. You sized a GLIMMER position based on a range of $5 typical daily movement. The chart enters a spike regime with $20 daily moves. What happened to your stop-loss relative to your original intent?

**Process Check:** Can you describe a volatility regime shift using only chart structure — candle behavior, swing point sequence, range expansion or contraction — without referencing an indicator?

---

## Stocks Track — Beginner Lessons

---

### S-B01 — Market Structure

**ID:** S-B01  
**Track:** Stocks / Beginner  
**Rank gate:** Trainee  
**Prerequisite:** F-02 (Order Types)  
**Objective:** Describe exchange structure, the role of market makers, and how session hours affect spreads and liquidity.

---

When you place an order to buy shares of a company in the stock market, you are interacting with a structured system built around predictable session hours, regulated exchanges, and participants whose job is to keep the market liquid. Understanding that structure is not background noise — it directly determines the price you pay, the ease with which you exit, and the risk you carry at different times of day.

**The session window.** The primary session for the major simulated exchange in TradeGame's stocks sandbox runs from 9:30 to 16:00 Eastern Time. Outside those hours, pre-market (roughly 4:00–9:30) and after-hours (16:00–20:00) trading exists but operates with substantially thinner participation. In the sim, you will observe this directly: the spread on NGSM (a synthetic large-cap name in the sandbox) is tighter during the session and widens visibly outside it.

**Market makers.** A market maker is a participant — typically a firm — that continuously posts both a bid (the price they will buy at) and an ask (the price they will sell at). The difference is the spread, and it is the market maker's compensation for providing liquidity. Without market makers, you could place a buy order and wait indefinitely for a willing seller. With them, there is almost always a price available — but that price may not be your price.

**Why spreads matter to you.** Every time you enter a position, you pay the spread. Buy at the ask, and the moment you are filled, the best price to sell is the bid — already below your entry. This is an immediate, guaranteed cost before price moves a single tick in your favor. On NGSM at $100 per share with a $0.10 spread, entering 100 shares costs you $10 before anything else happens.

**Pre/post market risk.** Lower participation outside session hours means fewer market makers, wider spreads, and price moves that can appear dramatic but reflect thin order books rather than fundamental information. A company might report earnings after 16:00; the after-hours price print can be extreme and then mean-revert partially by the 9:30 open. Your stop-loss, if it triggers after hours, may fill at a significantly worse price than you set — a slippage event analogous to what F-04 covered for gaps.

**NMX 100.** The curriculum's fictional index is the NMX 100, a synthetic basket of 100 names including NGSM. When you observe the NMX 100 in the sandbox, you are watching the average behavior of a diversified collection of simulated companies. Individual names in the basket can diverge sharply from the index — a single company event (earnings miss, product recall) does not move the index by the same magnitude it moves that stock.

---

**Sim Drill:** Paper sandbox — stocks. Observe the simulated NGSM session open at 9:30 and the close at 16:00. Log the spread at three points: 5 minutes before open, 30 minutes after open, and 15 minutes before close. Note how the spread changes.

**Self-Check:**
1. NGSM has a bid of $99.95 and an ask of $100.05. You buy 50 shares at market. What is the immediate cost of the spread on your position, before price moves at all?
2. It is 17:30 (after hours). NGSM prints $92 on a thin after-hours feed after an earnings release. The session opens at 9:30 at $97. If you had a stop at $93 set as a stop-market order, what likely happened to your fill?
3. Why does the NMX 100 move less dramatically than a single stock on an earnings day?

**Process Check:** Do you know what happens to the spread on your target instrument outside regular session hours — not theoretically, but in the sim?

---

### S-B02 — ETFs vs. Single Names

**ID:** S-B02  
**Track:** Stocks / Beginner  
**Rank gate:** Trainee  
**Prerequisite:** S-B01  
**Objective:** Distinguish index ETF exposure from single-stock concentration risk and explain the tradeoff between diversification and upside concentration.

---

A stock is a fractional ownership stake in one company. An ETF — Exchange Traded Fund — is a basket of many stocks packaged into a single tradeable instrument. Both trade on exchanges during session hours. Both appear as line items in a portfolio. The differences matter structurally.

**What an ETF buys you.** Imagine the NMX 100 ETF holds a proportional slice of all 100 companies in the index. If NGSM, which is one of those 100 names, falls 30% on an earnings miss, its weight in the basket might be 1.5%. A 30% drop on a 1.5% weighting moves the overall ETF by 0.45%. You did not feel a 30% hit; you felt a 0.45% hit. That is the diversification benefit — no single event destroys your position.

**What an ETF costs you.** That same cushioning works in reverse. If NGSM triples after a breakthrough product launch, your participation in that tripling is capped at its 1.5% weighting. The single-name holder gains 200%. The ETF holder collects about 3% from that event (1.5% weight × a 200% gain). Diversification eliminates extreme downside and extreme upside simultaneously.

**Concentration risk in single names.** Holding NGSM directly means your outcome is entirely dependent on one company: its management, its product cycle, its competitive position, its accounting, and events you cannot predict. The upside potential is higher. So is the variance — meaning your results swing more widely in both directions.

**Worked example.** You allocate $1,000.

- Option A: $1,000 into the NMX 100 ETF. NGSM (1.5% weight) drops 40%. Your loss from NGSM's move: $6. The other 99 companies average flat. Net: approximately -$6.
- Option B: $1,000 into NGSM directly. NGSM drops 40%. Your loss: $400.

Neither outcome is a recommendation. Option B could also have produced a $400 gain. The point is that the range of outcomes is structurally different.

**When a single name is appropriate.** A concentrated single-name position is appropriate when a trader has a specific, reasoned hypothesis about that company that is distinct from general market direction — and when the position is sized within their risk per trade rule (F-03). It is not appropriate as a default entry point for a learner who does not yet have a company-specific thesis.

**DCA and ETFs.** Dollar-cost averaging — putting a fixed amount in at regular intervals — pairs well with ETFs because the basket smooths individual name volatility. You are not trying to time the "right" entry on 100 companies simultaneously; you are averaging in over time. S-B04 goes deeper on the math.

---

**Sim Drill:** DCA/rebalance sim — set an ETF-only allocation on the NMX 100 synthetic ETF. Observe over three simulated sessions. Log what percentage move in the NMX 100 ETF accompanied a large individual name move.

**Self-Check:**
1. You hold $5,000 in the NMX 100 ETF. One holding with a 2% weight drops 50%. How much does your position lose from that event?
2. You hold $5,000 in NGSM directly. NGSM drops 50%. How much do you lose, and what is the structural reason the magnitude differs from the ETF scenario?
3. Name one scenario where holding a single name is more appropriate than an ETF, and name the condition that should always accompany that choice.

**Process Check:** Can you explain the tradeoff between diversification and upside concentration in plain language — not just say "diversification is safer"?

---

### S-B03 — Long-Term vs. Swing

**ID:** S-B03  
**Track:** Stocks / Beginner  
**Rank gate:** Trainee  
**Prerequisite:** S-B02  
**Objective:** Explain how time horizon changes position sizing, stop width, and review frequency, and demonstrate this by holding a synthetic position across multiple simulated sessions.

---

The same instrument — NGSM, or the NMX 100 ETF — can be held with completely different strategic intent, and those differences are not cosmetic. They change the correct stop distance, the correct position size, and how often you should be checking the chart. Conflating time horizons is one of the most common errors in the Foundation Track debrief sessions: a learner enters a trade with a swing thesis, watches it go against them, and slowly becomes a "long-term investor" as they refuse to exit. That is not a strategy. It is a coping mechanism.

**Long-term (weeks to years).** A long-term position is built around a thesis that plays out over many sessions. The relevant noise level is high: daily and weekly fluctuations that look alarming on a one-minute chart are invisible on a monthly chart. This means the stop must be wide — set to survive normal multi-week drawdowns — which in turn means the position must be smaller to keep risk within your per-trade rule. If you cannot tolerate the wide stop while staying within your risk limit, the position is too large.

**Swing (hours to days).** A swing position targets a move that resolves within a session or across a few sessions. The stop is narrower (price needs less room to "breathe"), but you are revisiting the chart regularly — at a minimum, every session. A stop that was appropriate for a 3-day swing trade becomes dangerously tight if you decide on day 7 that you are "now holding for the trend."

**Worked example.** NGSM is at $100. Your account: $10,000. Max risk per trade (F-03): 1%, or $100.

- Swing thesis: stop at $97.50 ($2.50 risk per share). Position size: $100 / $2.50 = 40 shares. You check daily.
- Long-term thesis: stop at $85.00 ($15.00 risk per share). Position size: $100 / $15.00 = 6 shares. You review weekly.

Notice: the long-term position is physically smaller in share count. That is correct. The wide stop earns the right to survive volatility, but only if the position is sized to keep the dollar risk the same. Many beginners invert this — they take the same share count regardless of stop width, which means the long-term position has dramatically more dollar risk than their rule allows.

**Review frequency is not optional.** A swing position held without daily review is no longer a swing position by definition; events can move against you between check-ins. A long-term position reviewed every ten minutes creates anxiety over noise that is irrelevant to the thesis. Match review cadence to time horizon deliberately.

**When theses change.** If your thesis changes (new information, or simply time passes and the original setup invalidated), the correct response is to exit or resize at the new stop — not to reframe the position as a different time horizon to avoid booking a loss.

---

**Sim Drill:** Paper sandbox — open a synthetic NGSM position and hold it across three simulated sessions. Before entry, write down: time horizon, stop placement, and review schedule. At each review point, confirm whether the thesis is still valid. Log the process, not just the result.

**Self-Check:**
1. Your swing trade stop is at $96 on a $100 stock. After 4 days the trade has not worked and you decide to "hold it long term." You widen the stop to $82. What is wrong with this sequence from a risk management perspective?
2. NGSM at $100. Account: $8,000. Max risk per trade: 1.5%. Swing stop at $97. How many shares should you buy?
3. Name one practical difference in how you should behave during a session if you are holding a swing position versus a long-term position.

**Process Check:** Have you written down your intended holding period and corresponding stop before entering — not after the trade has already moved against you?

---

## Forex Track — Beginner Lessons

---

### X-B01 — Pairs, Quotes, and Pips

**ID:** X-B01  
**Track:** Forex / Beginner  
**Rank gate:** Trainee  
**Prerequisite:** F-03 (Position Sizing)  
**Objective:** Read a forex quote correctly, calculate pip value for a given lot size, and size a position manually.

---

Forex is always quoted as a pair. You are not buying a currency — you are buying one currency and simultaneously selling another. Every forex quote names both sides.

**Reading a quote.** The pair ANDU/HarborUSD (a synthetic pair in the TradeGame sandbox) quotes the price of one ANDU in terms of HarborUSD. If the quote is 1.2450, one ANDU costs $1.2450 HarborUSD. The first currency listed (ANDU) is the base; the second (HarborUSD) is the quote currency.

When you "go long" ANDU/HarborUSD, you are buying ANDU and selling HarborUSD. If ANDU strengthens and the pair moves from 1.2450 to 1.2600, you profit. If it moves to 1.2300, you lose.

**Pips.** A pip is the standardized unit of movement in forex, typically the fourth decimal place for most pairs. ANDU/HarborUSD moving from 1.2450 to 1.2451 is a movement of 1 pip. Some pairs quote to a fifth decimal ("pipette"); in those cases 10 pipettes = 1 pip.

**Lot sizes.** Unlike buying whole shares, forex positions are denominated in lots:

- Standard lot: 100,000 units of the base currency
- Mini lot: 10,000 units
- Micro lot: 1,000 units

**Pip value calculation.** For a pair where HarborUSD is the quote currency (the second), one pip on one unit of base is simply 0.0001 HarborUSD, so:

> Pip value (in HarborUSD) = 0.0001 × lot size

For ANDU/HarborUSD, any price, standard lot (100,000 units):

> 0.0001 × 100,000 = $10.00 per pip

For a mini lot (10,000 units): $1.00 per pip. For a micro lot (1,000 units):

> 0.0001 × 1,000 = $0.10 per pip

**Position sizing with a pip-based stop.** Your account: $2,000. Risk per trade: 1% = $20. Your stop: 40 pips. Pip value (micro lot): $0.10.

Dollar risk per micro lot = 40 pips × $0.10 = $4.00.
Micro lots you can trade: $20 / $4.00 = 5 micro lots exactly.

This calculation — not intuition, not a "gut" size — is what the position sizing drill (F-03) exists to build into muscle memory. Forex position sizing always starts here.

**Note on pip value variation.** When HarborUSD is the BASE currency instead of the quote, or your account is denominated in something else, pip value must be converted at the current rate — that is where the (0.0001 / price) × lot-size form appears, giving pip value denominated in the base currency. The sandbox will walk you through both variants in the position sizing puzzle. For now, internalize the structure; the drill handles the variation.

---

**Sim Drill:** Position sizing puzzle — forex variant. The drill presents three ANDU/HarborUSD scenarios with different stop distances and account sizes. Calculate lot size manually before entering your answer. Log the calculation, not just the result.

**Self-Check:**
1. ANDU/HarborUSD is quoted at 1.3100. The pair moves to 1.3145. How many pips did it move, and in which direction for a long position?
2. Your account is $3,000. You risk 1% per trade ($30). Your stop is 25 pips. Pip value for a mini lot on ANDU/HarborUSD is $1.00. How many mini lots can you trade?
3. A friend tells you to "just buy 1 standard lot of everything — it's only forex." What is wrong with this approach from a position sizing perspective?

**Process Check:** Can you calculate your pip value and position size manually, without a tool, before you enter any forex position?

---

### X-B02 — Leverage: Taught First, Taught Bluntly

**ID:** X-B02  
**Track:** Forex / Beginner  
**Rank gate:** Trainee  
**Prerequisite:** X-B01  
**Objective:** Explain how forex leverage amplifies both gains and losses, calculate the exact margin call sequence on a worked example, and understand why retail forex carries the worst aggregate loss statistics of any market in this curriculum.

---

This lesson exists because retail forex has one distinguishing feature that no other market in the curriculum carries to the same degree: the leverage on offer is so high that you can lose your entire deposited margin on a price move measured in fractions of a percent. This is not a theoretical risk. It is the standard outcome for undercapitalized, over-leveraged accounts. We teach it first, not after you have practiced, because the practice environment (the "Blow up on purpose" drill) only teaches what you already understand intellectually.

**How leverage works in forex.** When a broker offers 50:1 leverage, a $200 deposit controls a $10,000 position. The broker extends you a short-term loan for $9,800, and your $200 is the collateral — this is called your "required margin."

**Jurisdiction disclaimer — read this.** Maximum permitted leverage varies dramatically by country and regulatory regime. Some jurisdictions cap retail leverage at 2:1 for certain instruments; others permit ratios above 100:1. No curriculum lesson will prescribe a ratio. What is legal and what is prudent are different questions. The aggregate loss data (which you will examine in X-I04 in full) shows that accounts using high leverage are the dominant failure mode, regardless of jurisdiction. The aggregate data shows accounts that start well below the maximum permitted ratio survive longer — this is the pattern the X-I04 data will show you directly.

**Worked liquidation example.** You deposit $500 with a broker offering 50:1 leverage. You open 1 standard lot of ANDU/HarborUSD at 1.2500. Position size: 100,000 units.

- Required margin (at 50:1): $2,500 — but wait, you only have $500. At 50:1 you can actually open a position where $500 controls $25,000. Let us use a smaller example that illustrates the math precisely.

Revised: You have $500. One mini lot (10,000 units of ANDU) at 1.2500 is a notional position of 10,000 × 1.2500 = $12,500. Required margin at 50:1 = $12,500 / 50 = $250. You open 2 mini lots. Required margin: $500 — your ENTIRE account. Free margin: $0.

Pip value for 2 mini lots: $1.00 × 2 = $2.00 per pip. From the very first pip against you, account equity ($500 − $2) is below required margin ($500) — you are in margin-call territory the moment the position opens and the spread is paid.

The broker's stop-out level is 50% (account equity falls to 50% of required margin = $250).

At stop-out: loss required = $500 − $250 = $250. At $2.00 per pip, that is $250 / $2.00 = 125 pips against you.

At maximum leverage there is no buffer at all: the warning is immediate, and stop-out arrives at 125 pips — if not automatically closed earlier. The numbers shift with every broker, every leverage ratio, every lot size. The calculation above is the skeleton. In a real account you would need to run it for your specific setup; in the sim, the platform calculates it for you — but the point is that you can do it manually.

**The aggregate picture.** Regulated brokers in multiple jurisdictions are required to disclose the percentage of retail accounts that lose money. Across publicly available disclosures, the numbers cluster in the 70–80% range, with some brokers disclosing higher. Forex is not uniquely difficult in terms of mechanics — pairs, pips, and sessions are learnable. The loss rate is attributable to leverage use combined with inadequate position sizing. X-I04 will walk through the disclosed numbers with you directly.

**What the "Blow up on purpose" drill does.** The game asks you to deliberately over-leverage a paper account and watch the margin call sequence play out in real time. The debrief overlay shows you the pip distance to each risk level at the moment you opened the position. Most learners are surprised at how small the move is. That surprise is the lesson.

---

**Sim Drill:** "Blow up on purpose" drill — forex account, high leverage (GDD §5.4). Open a position you know will be liquidated. Observe the margin call warning, the stop-out trigger, and the exact pip distances at entry. Write a debrief: what pip distance triggered your warning? What triggered stop-out? Was it larger or smaller than you expected?

**Self-Check:**
1. You have $300 in a forex account. You open a position requiring $240 in margin. Your free margin is $60. The broker's margin call level is 100%. How many dollars in losses trigger the margin call warning?
2. Why do different countries have different maximum leverage rules? What does that variation tell you about the regulatory view of retail leverage risk?
3. A learner says, "I'll just use high leverage for small positions to keep my dollar exposure low." Identify the flaw in this reasoning using the liquidation math structure from this lesson.

**Process Check:** Before opening any forex position, can you calculate — using only your deposit, your lot size, and your pip value — the exact pip distance that triggers your broker's margin call? If not, that gap is exactly what this drill is designed to close in the sim before you ever face it live.

---

### X-B03 — Sessions and Timezones

**ID:** X-B03  
**Track:** Forex / Beginner  
**Rank gate:** Trainee  
**Prerequisite:** X-B02  
**Objective:** Identify the four major forex trading sessions, explain what happens when sessions overlap, and describe how volume and spread change across the trading day.

---

Forex runs 24 hours a day on weekdays because it is a global network of banks, institutions, and brokers rather than a single centralized exchange. But "24-hour market" does not mean "uniformly active market." Activity concentrates where business hours overlap, and the spread you pay — and the ease with which large orders fill — changes dramatically across the day.

**The four session windows.** Each session corresponds roughly to the business hours of a major financial center:

- Sydney: approximately 22:00–07:00 UTC. Lowest volume of the four sessions. ANDU/HarborUSD pairs with Pacific exposure are most active here.
- Tokyo: approximately 00:00–09:00 UTC. Asian pairs more active; typically tighter ranges than London or New York.
- London: approximately 08:00–17:00 UTC. Highest single-session volume. Major pairs tighten significantly at the London open.
- New York: approximately 13:00–22:00 UTC. Overlaps with London from 13:00–17:00 UTC — this overlap is the highest-volume window in the forex day.

The London/New York overlap (roughly 13:00–17:00 UTC) is when institutional participation peaks, spreads are typically at their narrowest, and the largest directional moves most frequently occur.

**What happens outside the overlap.** Between the New York close and the Sydney open, the market is thin. Spreads widen. A quote that is 1.5 pips wide during the London/New York overlap may be 4–8 pips wide at midnight UTC. That widening is a direct cost: your R:R calculation from X-B01 must use the spread that is actually in effect when you enter, not the tight spread from peak hours.

**The spread as a function of time.** In the sandbox, you will observe ANDU/HarborUSD spread data across a simulated 24-hour period. Log the spread at three points: during the London/New York overlap, at the Sydney session open, and between the New York close and Sydney open. Those three numbers represent the real cost variation across the day.

**Practical application.** If your trading plan (which you will build in X-A03) targets ANDU/HarborUSD, your highest-liquidity window is the London/New York overlap. Entering outside that window costs more in spread and may produce fills that deviate more from your target price. Knowing your pair's session affinity is part of knowing your instrument.

**Weekend exposure.** Forex closes at approximately 22:00 UTC Friday and reopens at 22:00 UTC Sunday. Any position held through the weekend experiences two days of potential news events with no market to manage them. The gap at Sunday open can be sharp. C-B03 covered the analogous issue in crypto (continuous market, overnight risk). Forex has a hard close — but the gap at the Sunday open is the consequence.

---

**Sim Drill:** Paper sandbox — forex. Observe the ANDU/HarborUSD spread during three simulated time windows: London/New York overlap, Tokyo-only session, and the inter-session gap between New York close and Sydney open. Log the spread at each point and calculate the break-even pip move needed at each spread width.

**Self-Check:**
1. The London/New York overlap runs approximately 13:00–17:00 UTC. You are based in a timezone where that window is 3:00–7:00 a.m. locally. What is one practical implication for when you would enter and exit positions?
2. ANDU/HarborUSD has a 1.5 pip spread during the London session and a 5 pip spread after the New York close. You plan to enter with a 20-pip stop. How does the wider spread change your R:R calculation compared to entering during the overlap?
3. A position is held open from Friday afternoon into the Sunday open. The pair gaps 80 pips against you on Sunday's open. Why could your stop-loss not protect you?

**Process Check:** Do you know the specific time window — in your local timezone — when your target forex pair has its highest liquidity, lowest spread, and therefore lowest entry cost?

---

*Internal curriculum document. Do not publish to TradeGame---Preview.*

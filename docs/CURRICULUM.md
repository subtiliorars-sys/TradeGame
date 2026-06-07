# TradeGame — Curriculum

**Status:** Living doc | Private HQ only
**Feeds:** Game lessons/drills · Discord learn channels · Coaching cohorts
**Posture:** Education, not advice. No signals. Process over outcome. Three equal pillars.

---

## 1. Design Principles

**Practice-first.** Every lesson is paired with a sim drill or scenario. A lesson that
cannot be practiced in the game or sandbox is not ready to ship.

**Risk management is the spine.** Position sizing, stop-loss placement, and drawdown math
are taught in Module 1 and explicitly referenced in every subsequent module. They are not
advanced topics. They are the foundation.

**No evaluative instrument naming.** No lesson names a current tradeable instrument
in a way that implies direction, value, or recommendation (RISK_REGISTER §20). Concepts
use archetypes (e.g., "a large-cap spot pair," "a fictional stablecoin STABLE-X") or
the game's synthetic instruments. Historical events are described by their mechanics, not
by ticking current prices.

**Losses are curriculum.** The "Blow up on purpose" drill (GDD §5.4) and the drawdown
survival drill exist specifically to make failure structured and informative. Coaches are
expected to share losing replays as teaching material.

**No performance promises.** No framing implies that completing any module or track
produces specific returns, win rates, or profit. Cohort graduation celebrates process
milestones, never PnL outcomes.

---

## 2. Shared Foundation Track

**Audience:** All learners, all pillars. Complete before entering a pillar track.
**Discord home:** `#crypto-learn`, `#stocks-learn`, `#forex-learn` (same content
cross-posted with pillar-specific examples); cohort discussion in `#office-hours`.

| # | Lesson | Objective | Paired Drill / Scenario | Process Check |
|---|--------|-----------|-------------------------|---------------|
| F-01 | What a market is | Explain price discovery, buyers/sellers, bid/ask | Paper sandbox — observe order book, place a limit and a market order | Can you explain what determines the price at any moment? |
| F-02 | Order types | Distinguish market, limit, stop-limit, stop-market | Position sizing puzzle (GDD §5.4) — set entry and stop orders correctly | Do you know when a stop-limit can fail to fill? |
| F-03 | Position sizing | Calculate correct size given account %, stop distance, instrument | Position sizing puzzle (GDD §5.4) — all three market variants | Can you calculate your lot/share size without a tool? |
| F-04 | Stop-losses | Explain what a stop does, where it fails (wicks, gaps, slippage) | Stop placement challenge (GDD §5.4) | Do you place the stop before entry, every time? |
| F-05 | Risk:reward | Calculate R:R ratio; understand why a negative edge at 3:1 still loses | Drawdown survival drill (GDD §5.4) | Are you skipping trades with poor R:R? |
| F-06 | Drawdown math | Compound loss math — why a 50% loss needs 100% gain to recover | "Blow up on purpose" drill (GDD §5.4) | Do you have a max daily drawdown rule? |
| F-07 | Journaling | Record entry rationale, exit, post-trade reflection — not just PnL | Paper sandbox — complete 3 logged trades with full journal fields | Are you writing the reason before you enter, not after? |
| F-08 | Psychology basics | FOMO, revenge trading, loss aversion — name the pattern before you can fix it | Scenario replay — flash-crash scenario (GDD §5.2); pause at decision points | Can you name the emotional pattern you felt during the drill? |
| F-09 | Why most retail traders lose | Honest aggregate: fees, over-leverage, no edge, emotional override | Correlation awareness drill (GDD §5.4) | Have you written down your edge hypothesis? |
| F-10 | Scams and signal-seller self-defense | Recognize the patterns TradeGame explicitly bans: guaranteed returns, "I made X%," copy-trade upsells, unverifiable track records | No sim drill — discussion prompt in Discord journal channel | Can you explain why a track record screenshot proves nothing? |

---

## 3. Pillar Tracks

Each pillar runs **Beginner → Intermediate → Advanced**. Track depth is equal across all
three pillars. Lessons reference the GDD scenario catalog (docs/game/) where scenarios
exist; entries note "(scenario catalog)" where a matching scenario should be authored.

### 3a. Crypto Track

**Discord home:** `#crypto-learn` (concepts), `#crypto-journal` (drill reflections)

#### Beginner (C-B)

| # | Lesson | Objective | Paired Drill / Scenario | Process Check |
|---|--------|-----------|-------------------------|---------------|
| C-B01 | Spot mechanics | Explain spot buying vs. margin; why beginners start spot-only | Paper sandbox — crypto spot, buy and sell a synthetic pair | Are you trading spot only until you can articulate why leverage is different? |
| C-B02 | Wallets and custody | Hot vs. cold wallet, exchange custody risk, "not your keys" | Conceptual only — discussion prompt; no real wallet activity in game | Do you understand what self-custody means before you hold real assets? |
| C-B03 | 24/7 sessions and volatility | Why crypto has no close; what volatility regimes look like | Paper sandbox — observe synthetic feed over a simulated weekend period | Can you describe a volatility regime shift from the chart alone? |
| C-B04 | Grid strategies — how they work | Range-bound logic, grid spacing, what fills look like | Grid-bot sandbox (GDD §5.3) — run a grid on a synthetic ranging pair | Can you describe exactly when a grid makes money and when it doesn't? |
| C-B05 | Grid failure modes | Trending breakout: one-sided exposure accumulates and bleeds | Grid-bot sandbox — run same grid into a simulated trend breakout | Did you feel the urge to "wait for it to come back"? Journal that. |

#### Intermediate (C-I)

| # | Lesson | Objective | Paired Drill / Scenario | Process Check |
|---|--------|-----------|-------------------------|---------------|
| C-I01 | Stablecoin depegs — mechanics | How an algo-stable loses its peg; liquidity cascade anatomy | Scenario replay — stablecoin depeg (GDD §5.2) | Can you describe the sequence of events without referencing a specific coin? |
| C-I02 | Flash crash anatomy | Liquidation cascade, thin order books, bid vacuum | Scenario replay — GLIMMER flash crash scenario (GDD §5.2) | What is the one action you would take before a volatile period, not during? |
| C-I03 | Liquidity pools and impermanent loss | AMM pricing math, when LP is capital-efficient, when it isn't | Strategy sandbox — (scenario catalog: LP simulation TODO) | Can you calculate approximate impermanent loss for a 2× price move? |
| C-I04 | Volatility regimes | Mean-reverting vs. trending environments; how to identify which you're in | Paper sandbox — compare two synthetic periods: range vs. trend | Are you adjusting strategy type to market regime, or forcing one approach everywhere? |

#### Advanced (C-A)

| # | Lesson | Objective | Paired Drill / Scenario | Process Check |
|---|--------|-----------|-------------------------|---------------|
| C-A01 | AI and algorithmic tools — capabilities | What bots realistically do (execution, parameter sweeps), what they can't (predict direction) | Strategy sandbox — run a parameter sweep on a synthetic grid | Can you name two things a bot cannot do regardless of how it is marketed? |
| C-A02 | AI tools — hype detection | Red flags in bot marketing; how to audit a claimed track record | No sim drill — structured discussion prompt; checklist review | Can you identify three claims in a bot pitch that are unverifiable? |
| C-A03 | Crypto-in-games economies | Token emission, sink mechanics, liquidity dynamics in game economies — mechanics only, no investment framing | Conceptual + discussion; (scenario catalog: game-economy simulation TODO) | Can you describe how token inflation affects an in-game economy without recommending any game token? |

---

### 3b. Stocks Track

**Discord home:** `#stocks-learn` (concepts), `#stocks-journal` (drill reflections)

#### Beginner (S-B)

| # | Lesson | Objective | Paired Drill / Scenario | Process Check |
|---|--------|-----------|-------------------------|---------------|
| S-B01 | Market structure | Exchanges, market makers, session hours (9:30–16:00 ET sim); pre/post market thin liquidity | Paper sandbox — stocks, observe simulated session open and close | Do you know what happens to spreads outside session hours? |
| S-B02 | ETFs vs. single names | Index exposure vs. concentration risk; why ETFs reduce stock-picking decisions | DCA/rebalance sim (GDD §5.3) — set an ETF-only allocation | Can you explain the tradeoff between diversification and upside concentration? |
| S-B03 | Long-term vs. swing | Time horizon changes position sizing, stop width, and review frequency | Paper sandbox — hold a synthetic position across multiple simulated sessions | Have you written down your intended holding period before entering? |
| S-B04 | Index investing math | Compounding over time, cost-basis math, DCA smoothing effect | DCA/rebalance sim — run a recurring-buy scenario | Can you calculate your average cost basis after three buys at different prices? |

#### Intermediate (S-I)

| # | Lesson | Objective | Paired Drill / Scenario | Process Check |
|---|--------|-----------|-------------------------|---------------|
| S-I01 | Earnings seasons | Revenue vs. guidance; why a beat can gap down; why a miss can gap up | Scenario replay — earnings gap up, miss on guidance (GDD §5.2) | Do you know your position size before an earnings event, not after the gap? |
| S-I02 | Earnings gap mechanics | How gaps form; why stops can't protect you through a gap | Scenario replay — earnings gap scenario (GDD §5.2) | Do you have a policy on holding positions through earnings? |
| S-I03 | Sector rotation | Defensive vs. growth rotation; how to observe rather than chase | Scenario replay — sector rotation scenario (GDD §5.2) | Are you reacting to rotation or observing it and waiting for your setup? |
| S-I04 | Dividends | How dividend yield works; ex-dividend date mechanics; yield vs. growth tradeoff | DCA/rebalance sim — compare yield-focused vs. growth-focused allocation over simulated time | Can you explain why dividend yield alone is not a buy signal? |
| S-I05 | Index inclusion and passive flows | How index membership triggers mechanical buying from passive funds; announcement-to-inclusion price dynamics; distinguishing mechanical flow from business-change drivers | paired scenario SCN-005 | Can you label a price move's driver (mechanical flow vs. business change) before trading it? |

#### Advanced (S-A)

| # | Lesson | Objective | Paired Drill / Scenario | Process Check |
|---|--------|-----------|-------------------------|---------------|
| S-A01 | Reading a stock screener | Filter criteria: what each metric measures, what it doesn't | Conceptual — structured worksheet; (scenario catalog: screener output interpretation TODO) | Can you name three screener criteria and the failure mode of relying on each alone? |
| S-A02 | Fundamental vs. technical literacy | What each approach reads; why they're not mutually exclusive; their respective failure modes | Scenario replay — earnings gap scenario revisited with both lenses | Do you know which information each approach cannot give you? |
| S-A03 | Rebalance mechanics | When to rebalance, drag from rebalancing too often, benefit of disciplined rebalancing | DCA/rebalance sim — run with and without quarterly rebalance; compare drawdown depth | Do you have a written rebalance trigger rule, not a feeling? |

---

### 3c. Forex Track

**Discord home:** `#forex-learn` (concepts), `#forex-journal` (drill reflections)

#### Beginner (X-B)

| # | Lesson | Objective | Paired Drill / Scenario | Process Check |
|---|--------|-----------|-------------------------|---------------|
| X-B01 | Pairs, quotes, and pips | Base/quote currency; pip value calculation; why pip value changes with lot size | Position sizing puzzle — forex variant (GDD §5.4) | Can you calculate pip value and position size manually? |
| X-B02 | **Leverage — taught first, taught bluntly** | How leverage multiplies both gains and losses; margin call mechanics; why retail forex has the worst aggregate loss statistics of any market covered here | "Blow up on purpose" drill — forex account, high leverage (GDD §5.4); debrief shows exact margin call sequence | Can you explain why retail forex leverage rules vary by jurisdiction and why most beginner educators recommend starting well below the maximum permitted level for your broker and country? |
| X-B03 | Sessions and timezones | London, New York, Tokyo, Sydney windows; when sessions overlap; why volume and spread change | Paper sandbox — forex, observe spread widening outside London/NY overlap | Do you know when your target pair has its highest liquidity window? |
| X-B04 | Spreads and cost of trading | Spread as an immediate loss on entry; pip spread × lot size = real cost | Position sizing puzzle — calculate break-even pip move needed after spread | Are you factoring spread into your R:R calculation before entry? |

#### Intermediate (X-I)

| # | Lesson | Objective | Paired Drill / Scenario | Process Check |
|---|--------|-----------|-------------------------|---------------|
| X-I01 | Session open liquidity sweeps | Stop-hunt spike anatomy at London open; why price revisits prior levels | Scenario replay — London open liquidity sweep (GDD §5.2) | Do you know where your stop is relative to the previous session's range? |
| X-I02 | High-impact news events | NFP and similar releases: spike, reversal, spread widening during release | Scenario replay — NFP release scenario (GDD §5.2) | Do you have a written policy for positions held through news releases? |
| X-I03 | Carry concept | Interest rate differential; how carry works when trending, how it bleeds when ranging or reversing | Session/carry sim (GDD §5.3) — run a synthetic carry trade across simulated weeks | Can you name the condition that turns a positive-carry trade into a net loser? |
| X-I04 | Why retail forex loses — the numbers | Aggregate broker disclosure statistics; structural disadvantages; honest accounting | No sim drill — structured discussion; worksheet comparing disclosed loss rates across brokers | Have you read the broker risk disclosure you accepted? |

#### Advanced (X-A)

| # | Lesson | Objective | Paired Drill / Scenario | Process Check |
|---|--------|-----------|-------------------------|---------------|
| X-A01 | Session-breakout strategies and their failure modes | Range-then-break mechanics; false breakouts; whipsaw cost | Scenario replay — session whipsaw scenario (GDD §5.2) | Can you describe the condition under which a breakout entry has a negative expectancy? |
| X-A02 | Correlation in a crisis | Multiple pairs moving together; hidden exposure when holding several positions | Correlation awareness drill — forex positions (GDD §5.4) | Do you check correlation before adding a second position? |
| X-A03 | Building a trading plan for forex | Document: session traded, pairs, risk per trade, daily max loss, review cadence | Structured worksheet — submit as a journal entry in Discord | Is your plan written down and followed, or in your head and variable? |

---

## 4. Progression Mapping

Ranks are earned by XP + minimum drills completed — never by PnL (GDD §7).

| Rank | Gate Criteria | Curriculum Milestone |
|------|---------------|----------------------|
| **Observer** | Account created; game tutorial complete | — |
| **Trainee** | Foundation Track F-01 through F-06 complete; 5 drill completions | Cohort eligibility: Learner tier (COMMUNITY.md §2) |
| **Practitioner** | Full Foundation Track (F-01–F-10) complete; 15 drill completions; 10 journal entries | Cohort eligibility: active cohort track (Crypto, Stocks, or Forex) |
| **Journeyman** | Pillar Beginner track complete (any one pillar); 30 drill completions; 25 journal entries | Eligible to nominate for Helper (COMMUNITY.md §2) |
| **Strategist** | Pillar Intermediate track complete (same pillar); one full scenario library rotation; 50 drill completions | Eligible for co-facilitator cohort role (pre-Coach) |
| **Senior Strategist** | Pillar Advanced track complete; second pillar Beginner complete; 75+ drill completions; nominated by a Coach | Eligible for Coach ladder consideration (COMMUNITY.md §2) |

Leaderboards show process metrics only. No rank display includes PnL data (GDD §7, hard constraint).

---

## 5. Harvest Slots — Telegram Archive Content

Content from the owner's Telegram archives (Learning Materials, Macro market, Incremental Mining channels) can be folded in here after a compliance review pass. The review applies the following lens before any archive content is adapted:

- **Remove:** any post that names a specific instrument with a directional opinion ("BTC will…", "watch ETH here")
- **Remove:** any post that implies a trade recommendation or entry/exit timing for real money
- **Remove:** any post framed as macro forecasting or price prediction
- **Keep and adapt:** concept explanations, mechanics descriptions, risk frameworks, historical-event post-mortems that describe what happened without implying it will repeat

Archive content that passes the lens is reformatted using the Lesson Authoring Template (§6) and assigned to the appropriate module slot below.

| Slot | Target Module | Source Channel | Status |
|------|---------------|----------------|--------|
| HARVEST-01 | C-I03 (Liquidity pools / impermanent loss) | Learning Materials | TODO — pending compliance review |
| HARVEST-02 | C-B03 (Volatility regimes) | Macro market | TODO — pending compliance review |
| HARVEST-03 | C-A03 (Crypto-in-games economies) | Incremental Mining | TODO — pending compliance review |
| HARVEST-04 | F-09 (Why most retail traders lose) | Learning Materials | TODO — pending compliance review |
| HARVEST-05 | X-I04 (Why retail forex loses — the numbers) | Learning Materials | TODO — pending compliance review |

Add rows as additional harvestable topics are identified. Every row must have a status of either TODO, IN REVIEW, or MERGED before content is published anywhere.

---

## 6. Lesson Authoring Template

Use this template for every new lesson. Authors do not embed price predictions or trade
recommendations. Debrief copy describes mechanics and process, never what the learner
"should have done to maximize profit."

```yaml
id:              <PILLAR-LEVEL##>        # e.g., C-I02
title:           <string>
market:          crypto | stocks | forex | all
prerequisite:    <lesson_id or null>
rank_gate:       <Observer|Trainee|Practitioner|Journeyman|Strategist|Senior Strategist>
duration_min:    <int>                  # target 5–15 min read
objective:       <one sentence — what the learner can do or explain after>
discord_channel: <channel name>
body:            |
  <markdown — mechanics only; no evaluative instrument naming per RISK_REGISTER §20>
drill_or_scenario:
  type:          drill | scenario_replay | sandbox | discussion
  ref:           <GDD section or scenario catalog ID or null>
  description:   <one sentence>
process_check:   <one question the learner should be able to answer about their own behavior>
harvest_slot:    <HARVEST-## or null>
```

---

*Internal strategy document. Do not publish to the TradeGame---Preview repo.*

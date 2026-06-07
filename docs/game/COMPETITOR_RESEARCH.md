# Competitor Research — Trading-Sim Games (2026-06-08)

Deep-research pass: 5 search angles, 18 sources fetched, 90 claims extracted,
top 25 adversarially verified by 3-vote panels (24 confirmed, 1 refuted &
excluded). All Steam ratings/prices verified live 2026-06-07/08 and will
drift. Owner prompt: "two games that have already approached this issue…
at least one on Steam that had a demo."

**Headline: nobody does what TradeGame does.** No existing title combines
(a) education-first framing, (b) process-scored progression, and
(c) fictional instruments. The two education-adjacent products both regress
to PnL incentives; the two successful games succeed on aesthetic/fiction,
not realism; and the behavioral literature independently condemns the
returns-leaderboard mechanic all of them use or flirt with.

---

## The field — three Steam archetypes + one web incumbent

| Title | Posture | Instruments/data | Rating (verified) | Disclaimer? |
|---|---|---|---|---|
| **STONKS-9800: Stock Market Simulator** (2023 EA, $9.99 + free demo) | Entertainment-first life sim, '80s bubble Japan | Fictional parodies (Mirubishi, Ninento, GemuStop) | **Overwhelmingly Positive 97%** of 1,350 (2,871 total; recent 89%) | None |
| **The Invisible Hand** (2021, Fellow Traveller) | Capitalism satire, PnL quotas | Fictional firm (FERIOS) + fictional tickers | Very Positive 82% of 499 | None |
| **Trade Bots: A Technical Analysis Simulation** (2023, $11.99) | **Education-first** (TA academic framing), bot node-editor | **Real** historic data (5,000+ datasets, anonymized tickers) | **Mixed 63%** of 99 | **Yes — strongest in niche** |
| **Wall Street Survivor** (web, not a game) | Education + paper trading | **Real** tickers, 15-min-delayed feeds (Xignite/QuoteMedia) | n/a | Yes (informational-only ToS) |

This is almost certainly the pair the owner remembered: **STONKS-9800**
(Steam, free demo, Early Access — full release w/ Story Mode planned 2026)
and likely **The Invisible Hand** or **Trade Bots** as the second.

---

## Deep-dives

### STONKS-9800 — the commercial proof-of-concept (HIGH confidence)
- Core loop: '80s Japanese salaryman-stockbroker life sim — trade parody
  stocks, buy real estate/cars, manage health (overwork → hospital),
  pachinko/horse gambling, legal-vs-shady moral system. Store pitch:
  "Chill, catch a retro vibe and watch your profits grow" — zero
  educational claims.
- Reviews (per vaporlens aggregation — secondary source; headline rating
  independently confirmed): praise = fun/addictive (92 mentions), retro
  aesthetic (61), engaging market core (60). Complaints = bugs/crashes (17),
  EA jank (12), **punishing financial-ruin loops from swings/random events
  (12)** — the top *design* complaint is exactly the PnL-ruin mechanic our
  process scoring structurally avoids.
- Education shows up only as a side benefit in reviews ("a good way to
  learn about stocks").
- **Glean:** aesthetic identity and *feel* carry a trading game more than
  market realism; free demo + ~$10 premium works; chill > punishing;
  fictional parody instruments are commercially proven and ship with zero
  disclaimer exposure.

### The Invisible Hand — the cautionary tension (HIGH confidence)
- Core loop: short-horizon directional trading under **weekly profit
  quotas** (miss → fired), plus manipulation mechanics (lobbying, majority
  takeovers, insider info). Dark satire of finance culture.
- The unresolved tension: it *satirizes* PnL-chasing while *scoring* by
  PnL. Critics noted shallow depth/replayability. Narrative says one thing,
  mechanics reward the opposite — TradeGame resolves this by design.
- Marketing gem (MEDIUM confidence, 2-1 vote): during the Feb 2021 GameStop
  squeeze, the publisher ran a Discord Q&A titled "Learn about the Stock
  Market in The Invisible Hand" explaining shorting/short-squeezes — proof
  that **real-market news moments are a marketing channel** and players
  want real concepts explained. (Note: that campaign itself rode FOMO —
  our version must not.)

### Trade Bots — the education-first failure mode (HIGH confidence)
- The closest comparable to us: explicitly academic ("designed to inspire
  academic interest in Technical Analysis"), real anonymized historic data,
  bot-building node editor. **Mixed 63%** — the weakest reception in the
  field.
- Critically: despite the education branding, progression is still
  PnL-gated ("As your profit increases, unlock upgrades"). The one
  education-first title in the niche failed to decouple scoring from PnL —
  the exact gap we fill.
- It ships the **strongest store-page disclaimer** in the niche: "…none of
  its content is intended as professional or financial advice," "not a
  trading advisor or platform," + liability waiver. Pattern observed:
  disclaimers track real-data usage (fictional-everything titles ship none).

### Wall Street Survivor — the incumbent's loop + trap (HIGH confidence)
- The model to copy: **lesson-then-immediately-practice** ("read a concept,
  then place the trade… understand, then do") — same shape as our
  lesson→scenario pairing.
- The trap to avoid: even this education brand runs **pure returns
  leaderboards** (monthly contests, winners by portfolio return, gift-card
  prizes) — exactly what the behavioral research condemns.

---

## Behavioral-science validation (HIGH confidence)
Hüller, Reimann & Warren (2023), *JACR* 8(4), six pre-registered experiments
(N=3,766): **merely adding a leaderboard to an investment app made
participants choose riskier stocks**, overriding their stated risk
preferences. Morningstar's behavioral researchers name the responsible
alternative as exactly our model: badges for completing learning modules,
points for progress toward goals — vs trade-more-get-rewarded loops.
Caveats: lab mockups, not games; effect is goal-state-dependent (reverses
for users already winning; a 2024 OSC/BIT study found a returns leaderboard
*reduced* trading frequency 14%). Treat as supporting the design principle,
not a universal law.

---

## Actionable lessons

**COPY:**
1. STONKS-9800: strong aesthetic identity; free demo + ~$10 premium; chill
   non-punishing tone; fictional parody instruments.
2. Trade Bots: store-page disclaimer language (match or exceed it even with
   fictional instruments, given our coaching-org plans).
3. Wall Street Survivor: lesson-then-immediately-do loop.
4. Invisible Hand: news-cycle marketing that *explains* real concepts —
   executed without riding FOMO.

**ALREADY AVOIDED BY DESIGN (validated):**
- PnL-gated unlocks under education branding (Trade Bots' Mixed 63%).
- Mechanics-contradict-message tension (Invisible Hand).
- Returns-contest incentives (WSS) — condemned by experimental evidence.
- Punishing ruin loops (STONKS' top design complaint).
- Real-data licensing exposure (Xignite/QuoteMedia-style feeds) — fictional
  canon sidesteps it entirely.

**GAPS WE FILL:** an education game whose scoring actually rewards process;
the education-first lane is open — its only occupant is at Mixed 63%.

---

## Open questions (follow-up research candidates)
1. WHY is Trade Bots stuck at Mixed? Negative-review text not yet
   deep-dived (grind? UI? the PnL/education mismatch?) — most direct lesson
   source for us.
2. Real-data licensing costs (if we ever want optional historic-data
   scenario packs).
3. Mobile/itch.io landscape (Invstr, ChartGame, TradingView paper-trading
   gamification) — unverified; mobile is where a coaching-org funnel lives.
4. STONKS-9800's 2026 full release (Story Mode) — overlaps our Phase-2
   window; recent rating already dipped 97%→89%.

## Caveats
Vaporlens per-theme counts are aggregator output (headline ratings verified
on Steam directly). The Invisible Hand Q&A claim passed 2-1 (announcement,
not transcript). "5,000+ datasets" is vendor marketing. One over-strong
phrasing of the Morningstar experiment was refuted 0-3 and excluded. Steam
numbers verified live 2026-06-07/08.

## Primary sources
- https://store.steampowered.com/app/1539140/STONKS9800_Stock_Market_Simulator/
- https://store.steampowered.com/app/628200/The_Invisible_Hand/
- https://store.steampowered.com/app/1899350/Trade_Bots_A_Technical_Analysis_Simulation/
- https://www.wallstreetsurvivor.com/ (+ /terms-and-conditions/)
- https://www.morningstar.com/personal-finance/risky-play-trading-platforms-are-gaming-investors-into-bad-decisions
- Hüller, Reimann & Warren (2023), JACR 8(4):429–440, data: osf.io/sr7aq
- https://store.steampowered.com/news/app/628200/view/3019070055346700913
- Secondary: vaporlens.app/app/1539140, thegamecrater.com, pcgamer.com,
  checkpointgaming.net, opencritic.com, gamingtrend.com, steambase.io

---

# Follow-up: Trade Bots Mixed-63% autopsy (2026-06-08)

Negative-review deep-dive (Steam reviews API corpus + community discussions +
itch.io devlogs + GitHub). Why the only education-first trading game on Steam
is stuck at Mixed — ranked by helpfulness-vote weight:

## The three compounding failures

**1. Progression is structurally anti-learning (top complaint).** TA tools —
including zoom/pan and timeframe controls — are locked behind in-game PROFIT.
Players must "trade blind" to unlock the instruments that were supposed to
teach them, and roguelike run-resets erase unlocked tools on bust. The
headline features (sandbox, bot builder) sit at the END of the grind — "8
hours without gaining access." The dev shipped an email-for-unlock-codes
workaround, conceding the problem, but never fixed the structure.
Top-voted quotes: "It feels more like an arcade racing game than a sim"
[47 votes]; "I'M NOT GOING TO SPEND 3 DAYS GRINDING TO GET 5 GRAND TO UNLOCK
THE BOTS!" [13]; "would be a thumbs up if progression was optional" [14].

**2. Bug density + abandonment signals.** "Crashes constantly" [25 votes];
the in-game FEEDBACK BUTTON itself was broken ("I hit the report bug button
and I get a blank grey screen. Are we being trolled?" [8]); a non-closing
process burned players' refund windows; Mac build won't launch (2026); dev
unresponsive on GitHub/Discord after open-sourcing. Solo dev, health hiatus
(concussion, v1.3 devlog), ~6-9-month update cadence. CCU peaked at 48,
now ~3 — long-tail decline.

**3. Education quality gap — promise vs delivery.** The most credentialed
reviewers bounced hardest: quizzes with developer-headcanon answers not
covered by the material [41 votes]; curriculum outsourced to third-party
YouTube videos (some went PRIVATE) — fixed only in v2.0, 2+ years post-launch;
$100 starting capital that forces over-leveraged habits; "useless indicators
which don't work in real life"; no earnings/news/volume context, so TA
appears to simply not work; 1 day/sec sim speed with NO speed control
(27 real minutes per 27-year chart); no stop-loss/position-size controls.
"It's mostly a gambling simulator where you just throw yourself at a bull
market until you progress" [15].

**What its positive reviewers value (keep-list):** the real-historic-data sim
core; the visual bot-builder concept; visible iterative dev effort;
"more enlightening than any YouTube series" — for committed learners.

## Mistake catalog → TradeGame status (verified against the current build)

| # | Trade Bots mistake | TradeGame status |
|---|---|---|
| 1 | Analytical tools gated behind profit | **AVOIDED — structurally.** Process XP only; **standing guardrail: no future unlock may ever gate an analytical tool behind XP/score**, only scenarios/cosmetics |
| 2 | Run-resets strip earned capabilities | **AVOIDED.** Scenario failure strips nothing; ProgressStore only accumulates |
| 3 | Curriculum outsourced to third-party videos | **AVOIDED.** Lessons + debriefs are self-contained authored content |
| 4 | Quiz gates w/ developer-headcanon answers | **LIVE RISK — flagged for the drill system.** Drill/quiz questions must be scoped to shown material + externally reviewed |
| 5 | Tiny capital forces bad habits | **AVOIDED.** $10k sim account; size_compliance grades vs the player's declared risk rule |
| 6 | No market context → "TA doesn't work" | **AVOIDED by architecture.** Every scenario is an authored event (depeg, earnings gap, inclusion flow, news whipsaw) and the debrief explains exactly what drove the move |
| 7 | Broken feedback path at launch | **NOTED for launch QA** — smoke-test every feedback path live, or ship none |
| 8 | Headline feature unreachable before refund window | **MOSTLY AVOIDED.** SCN-001–003 playable immediately; only V1 scenarios gate on completing their V0 counterpart (~1 session each). Keep it that way |
| 9 | No sim speed control | **AVOIDED.** 1x/4x/16x compression shipped; pause is the default at session start |
| 10 | No stops / position sizing | **AVOIDED.** Real protective stop orders (required field), Risk % declaration, stop/size process metrics |

**Net: 7 of 10 mistakes structurally avoided, 1 mostly avoided, 1 live risk
(drill-system quiz quality — recorded for that design brief), 1 launch-ops
note.** The autopsy also confirms the strategic read: Trade Bots failed not
because education-first can't sell, but because its mechanics betrayed its
own promise — the exact contradiction process-scoring exists to prevent.

**Unknowns:** post-v2.0 review split not isolatable; Mac-launch failure
unacknowledged; open-sourcing may be wind-down (GitHub stale, Discord
unresponsive); zero Reddit footprint found — the game never escaped Steam.

Sources: Steam appreviews API (negative + all batches), store page,
top-rated community reviews, discussions hub + sandbox-unlock thread,
steambase.io, steamspy, itch.io devlogs v1.3/v1.5/v2.0,
github.com/cinqmarsmedia/Trade-Bots-Algorithmic-Trading-Game,
cinqmarsmedia.com/tradebots.

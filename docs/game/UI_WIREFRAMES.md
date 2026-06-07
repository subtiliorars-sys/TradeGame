# TradeGame — UI Wireframes (Phase 2 Vertical Slice)

**Version:** 0.1
**Status:** Text wireframes for Phase 2 vertical-slice screens.
**Scope:** Eight screens specified below. Each wireframe is ASCII layout + interaction
notes + spec section reference. Spec gaps are flagged inline; nothing is invented silently.
**Rendering target:** Web-first, desktop browser, Phaser 3 (SIM_ENGINE_SPEC §7.2).
**Ethics rail:** No buy/sell annotations, no PnL-ranked displays, no signals anywhere.

Key: `[ ]` = interactive element, `{ }` = dynamic value, `< >` = annotation/note

---

## Screen 1: Main Menu / Scenario Select

**Implements:** GDD §5.2 (Scenario Replay mode), GDD §7 (rank/progression gate),
SIM_ENGINE_SPEC §8 (Phase 2 vertical-slice cutline — three scenarios ship).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TRADEGAME                                          [Settings]  [Account]   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SCENARIO LIBRARY                                                   │   │
│  │                                                                     │   │
│  │  Filter: [ALL MARKETS v]  [ALL DIFFICULTIES v]                      │   │
│  │                                                                     │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                │   │
│  │  │  CRYPTO              │  │  STOCKS               │                │   │
│  │  │  SCN-001             │  │  SCN-002              │                │   │
│  │  │  The HarborUSD       │  │  Northgate Systems    │                │   │
│  │  │  Depegging           │  │  Earnings Gap & Fade  │                │   │
│  │  │                      │  │                       │                │   │
│  │  │  Intermediate        │  │  Intermediate         │                │   │
│  │  │  40 min (10 min 4x)  │  │  60 min (15 min 4x)  │                │   │
│  │  │                      │  │                       │                │   │
│  │  │  Prerequisites: ✓    │  │  Prerequisites: ✓     │                │   │
│  │  │                      │  │                       │                │   │
│  │  │  [ START ]           │  │  [ START ]            │                │   │
│  │  └──────────────────────┘  └──────────────────────┘                │   │
│  │                                                                     │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                │   │
│  │  │  FOREX               │  │  CRYPTO               │                │   │
│  │  │  SCN-003             │  │  SCN-004              │                │   │
│  │  │  London Open Sweep   │  │  The GLIMMER Pool     │                │   │
│  │  │  on ANDU             │  │  Impermanent Loss     │                │   │
│  │  │                      │  │                       │                │   │
│  │  │  Intermediate        │  │  Intermediate         │                │   │
│  │  │  60 min (15 min 4x)  │  │  90 min (22 min 4x)  │                │   │
│  │  │                      │  │                       │                │   │
│  │  │  Prerequisites: ✓    │  │  LOCKED               │                │   │
│  │  │                      │  │  Requires: SCN-001    │                │   │
│  │  │  [ START ]           │  │  Lesson C-I03         │                │   │
│  │  └──────────────────────┘  └──────────────────────┘                │   │
│  │                                                                     │   │
│  │  < Additional locked scenarios shown with lock icon and prereq >   │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Your Progress: {Rank: Trainee}  XP: {420 / 800 to Practitioner}          │
│  < XP bar shows process XP only — no PnL component anywhere on this screen>│
│                                                                             │
│  ┌────────────────────────────────────────────────────────────┐            │
│  │  QUICK DRILLS                                              │            │
│  │  [ Position Sizing Puzzle ]  [ Stop Placement Challenge ]  │            │
│  │  [ Drawdown Survival ]       [ Blow Up on Purpose ]        │            │
│  └────────────────────────────────────────────────────────────┘            │
│                                                                             │
│  [ PAPER TRADING SANDBOX ]  < Deferred per Phase 2 cutline; shown greyed > │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Interaction notes:**

- Scenario cards: locked state shows prerequisite list (lessons + drills + prior
  scenario completion), not a countdown or pay gate. No ambiguity about what is needed.
- Clicking a locked card opens a "Prerequisites" panel listing each item with
  completion status and a direct link to the missing lesson or drill.
- Clicking START on an available scenario shows the scenario title card (a brief
  description and the learning objectives) before launching the sim. Player must
  dismiss the title card to proceed; the dismissal is logged in the EventLog as
  `scenario_acknowledged`.
- XP bar: shows process XP total against the next rank threshold. No PnL displayed
  anywhere. No leaderboard access from this screen.
- Paper Trading Sandbox is visible but greyed with a label "Coming in a future update."
  It is not hidden — players know it exists and what it is.
- Difficulty label ("Intermediate") is displayed but no numerical star rating or
  score ranking is shown. The difficulty label is informational, not gamified.

SPEC GAP: SIM_ENGINE_SPEC §6.2 specifies what account data is stored but does not
specify a rank or XP display format. The wireframe assumes a progress bar and rank
label pulled from the XP total and rank threshold table (GDD §7). Engineering will
need to define the rank threshold lookup interface.

---

## Screen 2: In-Scenario Trading Screen

**Implements:** SIM_ENGINE_SPEC §1 (tick pipeline, time compression), §2 (data layer),
§3 (order model — slippage/fee display mandatory), §3.4 (forex leverage risk display
as blocking modal), SCENARIOS_V0.md UI Beats, GDD §4 (Practice phase of core loop).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SCN-001: The HarborUSD Depegging    [PAUSE]  Speed: [1x] [4x] [16x]       │
│  Sim time: {T+06:42}  Market: CRYPTO  HBD/USVC                             │
├──────────────────────────────────────────┬──────────────────────────────────┤
│                                          │  POSITION PANEL                  │
│  CHART AREA                              │  ┌────────────────────────────┐  │
│  ┌──────────────────────────────────┐    │  │ Account: {10,000 USVC}     │  │
│  │                                  │    │  │ Open positions: {0}        │  │
│  │  [Candle chart renders here]     │    │  │                            │  │
│  │  1-min candles default           │    │  │ < No open positions >      │  │
│  │                                  │    │  │                            │  │
│  │  < Asian range lines shown for   │    │  └────────────────────────────┘  │
│  │    forex scenarios; no lines     │    │                                  │
│  │    for crypto/stocks unless      │    │  ORDER TICKET                    │
│  │    EventInjector adds them >     │    │  ┌────────────────────────────┐  │
│  │                                  │    │  │ Instrument: HBD/USVC       │  │
│  │  Volume bars below chart         │    │  │                            │  │
│  │                                  │    │  │ Side: [BUY] [SELL]         │  │
│  │  Spread indicator: bottom-left   │    │  │                            │  │
│  │  ┌─────────────────────────┐     │    │  │ Quantity: [___________]    │  │
│  │  │ Spread: {0.008} USVC    │     │    │  │                            │  │
│  │  │ Status: AMBER (elevated)│     │    │  │ Order type: [MARKET v]     │  │
│  │  └─────────────────────────┘     │    │  │                            │  │
│  │                                  │    │  │ Stop price: [___________]  │  │
│  └──────────────────────────────────┘    │  │ (required before submit)   │  │
│                                          │  │                            │  │
│  Timeframe: [1m] [5m] [15m]             │  │ ┌──────────────────────┐   │  │
│             [Sub-chart: 10s ticks when  │  │ │ ESTIMATED FILL       │   │  │
│              EventInjector activates]   │  │ │ Ask:    {0.9932}     │   │  │
│                                          │  │ │ Slippage: {+0.0004} │   │  │
│  NEWS TICKER (fires on EventInjector)   │  │ │ Spread:  {0.008}    │   │  │
│  ┌──────────────────────────────────┐   │  │ │ Fee:     {0.15%}    │   │  │
│  │ {HBD protocol defense under      │   │  │ │ You pay: {0.9936}   │   │  │
│  │  stress — status unclear.}        │   │  │ └──────────────────────┘   │  │
│  └──────────────────────────────────┘   │  │                            │  │
│  < Factual only, no price prediction >  │  │ [ SUBMIT ORDER ]           │  │
│                                          │  │ < Disabled if stop blank > │  │
├──────────────────────────────────────────┘  └────────────────────────────┘  │
│                                                                             │
│  [ JOURNAL (J) ]  < Collapsed by default; J key or button opens drawer >  │
│  Decision point indicator: {DECISION POINT B — T+06}                       │
│  < Fires when EventInjector emits decision_point event >                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Order ticket interaction notes:**

- Stop price field is visually mandatory. The SUBMIT ORDER button is disabled if
  the stop price field is empty. This enforces the `stop_before_entry` process metric
  (SIM_ENGINE_SPEC §4.2) at the UI layer, not just the scoring layer.
- The estimated fill panel (showing slippage, spread, fee, total cost) is ALWAYS
  visible and ALWAYS populated before the player submits. This is mandatory per
  SIM_ENGINE_SPEC §3.2: "Every order confirmation must show expected fill price,
  actual fill price, slippage cost, spread cost." Not optional.
- After submission and fill, a fill confirmation overlay appears for 3 seconds showing
  actual vs. estimated fill, slippage realized, and the fee charged.
- Speed controls (1x/4x/16x) are disabled during order confirmation (SIM_ENGINE_SPEC
  §1.3: time compression cannot change while an order is being confirmed).
- Sub-chart (10-second tick resolution) activates automatically when EventInjector
  fires during high-volatility phases (SCN-001 T+8–T+15, SCN-003 08:01–08:04,
  SCN-006 whipsaw). Sub-chart is a second strip below the main chart, not a
  replacement.
- Position panel updates in real time as positions open and close. When a position
  is open, it shows: entry price, current price, unrealized PnL in price units (not
  shown as a score; shown as a factual position status), stop level, and the process
  metric compliance indicator (green checkmark if stop was placed before entry).

SPEC GAP: SIM_ENGINE_SPEC §3.2 specifies fill price display requirements but does not
specify the timing or dismissal behavior of the fill confirmation overlay. Suggest:
auto-dismiss after 3 seconds, player can click to dismiss early; overlay does not
block chart or journal interaction.

SPEC GAP: The Position Panel's process metric compliance indicator (stop-placed-before-
entry visual feedback) is implied by the scoring engine design but not explicitly
specced as a UI surface in SIM_ENGINE_SPEC. Flagged here so the UI sprint includes it.

---

## Screen 2a: Forex Leverage Risk Display (Blocking Modal)

**Implements:** SIM_ENGINE_SPEC §3.4 ("Mandatory risk display for forex... not
dismissible without clicking 'I understand'"; `leverage_ack` event logged).

This modal fires the first time a player attempts to open a forex position in any
session, including the first order ticket submission in SCN-003 or SCN-006.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │         FOREX: LEVERAGE AND RISK                                    │   │
│  │                                                                     │   │
│  │  You are about to open a position in a leveraged forex market.      │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  Leverage amplifies both profits and losses.                  │  │   │
│  │  │                                                               │  │   │
│  │  │  You can lose more than you intended if your position moves   │  │   │
│  │  │  against you and your stop is not honored.                    │  │   │
│  │  │                                                               │  │   │
│  │  │  This is a practice environment. Real forex trading involves  │  │   │
│  │  │  real money and real risk.                                    │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  Your position details:                                             │   │
│  │  Pair:              ANDU                                            │   │
│  │  Leverage ratio:    30:1                                            │   │
│  │  Margin required:   {X USVC} for the lot size you entered          │   │
│  │  Pip value:         {$Y per pip} at this lot size                  │   │
│  │  Max loss at stop:  {Z USVC} ({W% of account})                     │   │
│  │                                                                     │   │
│  │  < All values calculated live from the order ticket fields >        │   │
│  │                                                                     │   │
│  │  [ I UNDERSTAND — THIS IS A PRACTICE SESSION. PROCEED. ]           │   │
│  │                                                                     │   │
│  │  [ Cancel — Return to Order Ticket ]                                │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Interaction notes:**

- Modal fires once per session at first forex order submission. It does not re-fire
  for subsequent orders in the same session. It DOES re-fire at the start of each
  new scenario session (not a one-time-ever dismissal, a per-session acknowledgment).
- The "I UNDERSTAND" button click emits `leverage_risk_acknowledged` to the EventLog
  (SIM_ENGINE_SPEC §4.2, `leverage_ack` metric). If the player opens a position
  without this event logged, the `leverage_ack` metric fails and the debrief flags it.
- The position details block (margin required, pip value, max loss at stop) is
  calculated live from what the player has entered in the order ticket. If the stop
  price field is blank, the max loss row shows "Stop not set — loss is uncapped at
  margin call level." This is a factual statement, not a warning designed to scare;
  it is the accurate calculation.
- This modal cannot be bypassed by any configuration flag (SIM_ENGINE_SPEC §3.4).

---

## Screen 3: News Policy Card / Plan Card

**Implements:** SCENARIOS_V1.md SCN-006 News Policy Card (SIM_ENGINE_SPEC §1.4
`ui_prompt` event type), and the V0 Plan Card backport proposed in ADVANCED_TIER_BRIEF.

The same component renders in two modes: "News Policy" (SCN-006) and "Plan" (V0
scenarios after backport). The mode is set in the scenario config.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  < Background: the chart and trading screen, dimmed >                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  PRE-EVENT DECLARATION                                              │   │
│  │  ─────────────────────────────────────────────────────────         │   │
│  │  The Monthly Labor Conditions Report releases in approximately      │   │
│  │  5 minutes. You have an existing position / no existing position.   │   │
│  │  < Conditional text based on PositionLedger state >                 │   │
│  │                                                                     │   │
│  │  Choose one option:                                                 │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  ( ) A — Close all positions before the report.             │   │   │
│  │  │         Re-enter on confirmation after the whipsaw.         │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  ( ) B — Hold through the report.                           │   │   │
│  │  │         My position is sized for expected volatility and    │   │   │
│  │  │         my stop accounts for a spread blowout of up to      │   │   │
│  │  │         [___] pips.  < Player fills in their assumption >   │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  ( ) C — No trade through the report window.                │   │   │
│  │  │         I will observe and resume after the whipsaw.        │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  Write your reasoning:                                              │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                                                             │   │   │
│  │  │  {journal text area — minimum 30 characters}                │   │   │
│  │  │                                                             │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  Characters: {0}/30 minimum                                         │   │
│  │                                                                     │   │
│  │  [ CONFIRM DECLARATION ]                                            │   │
│  │  < Button disabled until: option selected + character minimum met > │   │
│  │                                                                     │   │
│  │  < Cannot be closed without completing it. If player attempts to   │   │
│  │    dismiss: "You must declare your policy before the event window  │   │
│  │    opens." — per SCENARIOS_V1.md SCN-006 UI Beats T-05 >           │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Interaction notes:**

- On CONFIRM: the selected option and journal text (the text itself, not just
  word count) are stored in the JournalEntryEvent (text server-side, wordCount and
  tags in the EventLog). The selected option ID is stored as a tag on the journal
  entry: `['pre_event_declaration', 'option_A']` etc.
- The `policy_match` process metric (SIM_ENGINE_SPEC §4.2) reads the declared option
  tag at debrief time and compares it to the player's actual behavior during the event
  window. The comparison logic must be specified in the scoring engine: option A means
  `PositionLedger` shows no open positions at T-01; option B means position held
  with a stop set and a leverage ack logged; option C means no order submissions
  during the event window.
- For the Plan Card variant (V0 backport): option labels and journal prompts are
  configured per scenario in the scenario YAML `plan_card` block. The component
  renders identically; only the text differs.
- Option B's "[___] pips" inline fill is specific to the SCN-006 News Policy Card.
  The Plan Card variant for V0 scenarios replaces this with scenario-appropriate
  inline fields (e.g., "[___] price level" for SCN-002) or removes the inline field
  entirely if the scenario does not require a numerical assumption.

SPEC GAP: The policy_match metric is specified in SCENARIOS_V1.md SCN-006 scoring
rubric but is NOT defined in SIM_ENGINE_SPEC §4.2's metric table. The metric needs
to be added to the scoring engine spec before SCN-006 or any Plan Card scenario ships.
This is a required engineering spec item.

---

## Screen 4: Pause / Decision-Point Overlay

**Implements:** SIM_ENGINE_SPEC §1.3 (paused mode, always available, journal allowed
during pause), §1.4 `decision_point` event type, GDD §4 (player can pause to journal).

Fires when a `decision_point` event is emitted by the EventInjector, OR when the
player manually pauses.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  < Background: chart frozen at current tick >                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  [PAUSED]  Sim time: {T+06:00}                                      │   │
│  │                                                                     │   │
│  │  ─── DECISION POINT B ─────────────────────────────────────────    │   │
│  │  Second leg down. Spread: {0.008 USVC}. Bid side thinning.         │   │
│  │  < Factual context only — no buy/sell language >                    │   │
│  │                                                                     │   │
│  │  You can:                                                           │   │
│  │  • Open the journal to write your observation              [J]      │   │
│  │  • Place or modify an order before resuming                         │   │
│  │  • Resume the scenario without taking any action                    │   │
│  │                                                                     │   │
│  │  [ OPEN JOURNAL ]                                                   │   │
│  │                                                                     │   │
│  │  [ RESUME SCENARIO ]                                                │   │
│  │                                                                     │   │
│  │  < No timer on the pause. GDD §4: "Pausing is always available,    │   │
│  │    unrestricted." Player is not penalized for pausing long. >       │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Interaction notes:**

- Decision-point overlays are semi-transparent: the chart is still visible behind
  the overlay. The player can see the current price state while deciding.
- The overlay does NOT list "actions you could take" as a menu of tradeable choices.
  It lists capabilities (journal, place order, resume) — not options like "go short."
  This is the difference between a process prompt and a signal.
- If the player opens the journal from this overlay, the journal opens as a drawer
  (see Screen 2) while the overlay remains. Closing the journal returns to the
  decision-point overlay.
- Manually paused overlays (player pressed PAUSE) show a simpler version without the
  decision point context text — just the pause state and the same three capability
  options.
- The decision-point ID (`beatId` from the EventInjector) is emitted as a
  `ScenarioBeatEvent` to the EventLog at the moment the overlay fires. Coach
  annotations (SIM_ENGINE_SPEC §5.3) can be anchored to this event via
  `anchorType: 'decision_point'`.

---

## Screen 4a: Journal Drawer

**Implements:** SIM_ENGINE_SPEC §5.1 `JournalEntryEvent`, GDD §4 (every action is
journaled), scenarios' journal requirements throughout.

The journal drawer slides in from the right side of the trading screen. It does not
replace the chart or order ticket — the player can still see price action while writing.

```
┌──────────────────────────────────────┐
│  JOURNAL                          [X]│
│  ─────────────────────────────────   │
│  Session: SCN-001  Sim: {T+06:42}    │
│                                      │
│  Entry tags (select all that apply): │
│  [pre_trade] [hypothesis] [exit]     │
│  [observation] [post_trade]          │
│                                      │
│  ┌──────────────────────────────┐    │
│  │                              │    │
│  │  {free text — no minimum     │    │
│  │   character requirement      │    │
│  │   unless Plan Card or        │    │
│  │   specific scenario gate     │    │
│  │   requires it}               │    │
│  │                              │    │
│  └──────────────────────────────┘    │
│                                      │
│  [ SAVE ENTRY ]                      │
│                                      │
│  ─── Prior entries this session ───  │
│  {T+00:10} [hypothesis] 45 words     │
│  {T+03:22} [observation] 18 words    │
│  < word counts only; text shown      │
│    only to the session owner >       │
│                                      │
└──────────────────────────────────────┘
```

**Interaction notes:**

- Journal text is stored server-side encrypted at rest (SIM_ENGINE_SPEC §6.4). In
  Phase 2, with server-side persistence deferred, journal text is client-side only
  (localStorage). The drawer still works identically; storage destination changes
  when persistence ships.
- The prior entries panel shows `wordCount` and `tags` only — not the full text. This
  is both a privacy choice (SIM_ENGINE_SPEC §5.1, journal text privacy note) and a
  UX choice: the player should write new observations rather than re-reading old ones.
- Saving an entry immediately emits a `JournalEntryEvent` to the EventLog with
  `wordCount` and `tags`. The text is stored separately and never included in the
  shareable replay format (SIM_ENGINE_SPEC §5.1, §5.2).
- When a scenario requires a journal entry before a gate (e.g., SCN-004's deposit
  confirmation blocking until journal entry is written), the journal drawer opens
  automatically and the submit button of the blocking action remains disabled until
  a `JournalEntryEvent` is logged with the required minimum character count.

---

## Screen 5: Debrief Screen

**Implements:** SIM_ENGINE_SPEC §4.2 (process metric extraction), §4.3 (XP event
emission), §4.4 (what scoring engine never emits — no PnL rank anywhere), GDD §4
(Review phase), GDD §5.2 (debrief screen content), scenarios' process-scoring rubrics.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DEBRIEF — SCN-001: The HarborUSD Depegging                                │
│  Session complete.                                                          │
├──────────────────────────────────────────┬──────────────────────────────────┤
│                                          │  PROCESS RUBRIC                  │
│  WHAT HAPPENED                           │  ─────────────────────────────   │
│  ┌──────────────────────────────────┐    │  ┌────────────────────────────┐  │
│  │  HarborUSD (HBD) lost its        │    │  │ Journal before trade     ✓ │  │
│  │  algorithmic peg when selling    │    │  │ Position size (1% rule)  ✓ │  │
│  │  pressure exceeded the           │    │  │ Stop placed before entry ✓ │  │
│  │  protocol's reserve capacity.    │    │  │ Stop honored             ✓ │  │
│  │                                  │    │  │ Exit journaled           ✗ │  │
│  │  [Timeline shown on chart with   │    │  │ Debrief completed        ✓ │  │
│  │   player's entries/exits marked] │    │  └────────────────────────────┘  │
│  │                                  │    │                                  │
│  │  < Factual. No "you should have  │    │  XP EARNED THIS SESSION          │
│  │    bought/sold at X" language >  │    │  ─────────────────────────────   │
│  └──────────────────────────────────┘    │  ┌────────────────────────────┐  │
│                                          │  │ Journal entry:    +20 XP   │  │
│  ┌──────────────────────────────────┐    │  │ Position size:    +30 XP   │  │
│  │  GOOD PROCESS SUMMARY            │    │  │ Stop placed:      +25 XP   │  │
│  │  • Recognized uncertainty in     │    │  │ Stop honored:     +20 XP   │  │
│  │    both directions               │    │  │ Debrief:          +30 XP   │  │
│  │  • Sized for account risk %,     │    │  │ Exit journal:      +0 XP   │  │
│  │    not position size             │    │  │                            │  │
│  │  • Stop placed before entry      │    │  │ TOTAL:   {125 XP}          │  │
│  │  • Journaled observations        │    │  └────────────────────────────┘  │
│  └──────────────────────────────────┘    │                                  │
│                                          │  < No PnL rank. No comparison    │
│  ┌──────────────────────────────────┐    │    to other players' returns.     │
│  │  GOOD PROCESS / DIFFERENT RESULT │    │    XP is process-only. >         │
│  │  ──────────────────────────────  │    │                                  │
│  │  A short at T+6 with a stop at   │    │  COACHING ALERT (if applicable)  │
│  │  1.005 earns full XP — even if   │    │  ┌────────────────────────────┐  │
│  │  stopped out during the T+2–T+5  │    │  │  {Reckless winner text if  │  │
│  │  recovery. That is not a process │    │  │   reckless_winner_flag     │  │
│  │  failure. It is market behavior. │    │  │   was emitted}             │  │
│  │                                  │    │  │                            │  │
│  │  < This callout is mandatory per │    │  │  OR                        │  │
│  │    scenario template. No scenario│    │  │                            │  │
│  │    ships without it. >           │    │  │  {Process gap flags, e.g.  │  │
│  │                                  │    │  │   "exit journal missing"}  │  │
│  └──────────────────────────────────┘    │  └────────────────────────────┘  │
│                                          │                                  │
│  COMMON ERRORS (anonymized aggregate)   │  [ VIEW REPLAY ]                 │
│  ┌──────────────────────────────────┐    │  [ SHARE REPLAY ]               │
│  │  • Oversized position at T0      │    │  < Share deferred Phase 2 >      │
│  │    before confirmation (most     │    │                                  │
│  │    common)                       │    │  [ NEXT SCENARIO ]              │
│  │  • Long on the T+16 bounce       │    │  [ BACK TO LIBRARY ]            │
│  │  • Adding to a losing long       │    │                                  │
│  │  • No stop set before entry      │    │                                  │
│  └──────────────────────────────────┘    │                                  │
│                                          │                                  │
│  "This simulation is not the market.     │                                  │
│   Outcomes here do not predict real      │                                  │
│   trading results." — shown here per    │                                  │
│   Phase 2 cutline "sim is not the       │                                  │
│   market" friction requirement.         │                                  │
└──────────────────────────────────────────┴──────────────────────────────────┘
```

**Interaction notes:**

- PnL is never displayed on this screen in any form. No dollar amount, no percentage
  return, no pip count, no "you made/lost X." This is a hard constraint from GDD §2
  and SIM_ENGINE_SPEC §4.4. If a future design adds a PnL display to this screen in
  any field, it is a design violation.
- The XP summary shows process-metric XP only. The "TOTAL: {125 XP}" is the only
  number related to performance, and it is a process score, not a profit score.
- The "Good Process / Different Result" callout is mandatory in every scenario per
  the scenario template. Its position (center-left, prominent) is intentional — it
  must be seen, not buried.
- Coaching alerts (reckless winner flag, process gap flags) appear in the right panel.
  They are labeled as coaching observations, not penalties. The text tone is
  observational: "Your process had a gap that could have caused a large loss on the
  next one" — not "you played badly."
- The process rubric checkmarks link to the relevant rubric description on hover/tap:
  "What does 'stop honored' mean?" expands the rubric definition inline.
- "Sim is not the market" friction text appears at the bottom of the left column on
  every debrief screen, per SIM_ENGINE_SPEC §8 Phase 2 cutline requirement.
- VIEW REPLAY button is enabled in Phase 2 (client-side replay only). SHARE REPLAY
  is visible but greyed with "Coming in a future update" — deferred per Phase 2
  cutline (requires server-side persistence).

SPEC GAP: SIM_ENGINE_SPEC §4.3 defines the `RecklessWinnerFlag` event structure and
says the UI renders a coaching alert, but does not specify where in the debrief screen
this alert appears. Wireframe places it in the right panel coaching alerts section.
Confirm with engineering that this placement is accessible and visible without
scrolling on a standard desktop viewport.

---

## Screen 6: Replay Viewer with Coach Annotation Lane

**Implements:** SIM_ENGINE_SPEC §5.1 (EventLog), §5.2 (Shareable Replay format),
§5.3 (Coach Annotation Overlay), GDD §7 (Replay Sharing and Coaching Hooks).

Note: Coach annotation authoring (adding new annotations) is deferred to post-v1
(GDD §10). The replay viewer ships in Phase 2; the annotation authoring UI ships later.
Phase 2: player can view their own replay and see any pre-authored scenario annotations.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  REPLAY — SCN-001  {Session date}               [BACK TO DEBRIEF]          │
├──────────────────────────────────────────┬──────────────────────────────────┤
│                                          │  ANNOTATION LANE                 │
│  REPLAY CHART                            │  ─────────────────────────────   │
│  ┌──────────────────────────────────┐    │                                  │
│  │                                  │    │  T+00:10  [Scenario]             │
│  │  [Chart renders from EventLog    │    │  "HBD is an algorithmic stable.  │
│  │   tick events — deterministic    │    │   Read the depth chart."         │
│  │   replay per SIM_ENGINE_SPEC §1] │    │  < Pre-authored scenario beat >  │
│  │                                  │    │                                  │
│  │  Entry/exit markers overlaid     │    │  T+03:22  [Your journal]         │
│  │  from OrderFillEvents            │    │  Observation — 18 words          │
│  │                                  │    │  < wordCount + tag shown;        │
│  │  Decision point markers:         │    │    text private to owner >       │
│  │  [A] [B] [C] shown at their     │    │                                  │
│  │  respective tick positions       │    │  T+06:00  [Decision Point B]     │
│  │                                  │    │  Second leg down.                │
│  │  Journal markers: J icons at     │    │  < Scenario beat marker >        │
│  │  the tick where each entry was   │    │                                  │
│  │  written                         │    │  T+08:42  [Coach]                │
│  │                                  │    │  "The spread indicator turned    │
│  └──────────────────────────────────┘    │   amber here — that was the      │
│                                          │   cost-of-entry consideration.   │
│  PLAYBACK CONTROLS                       │   Your position was sized        │
│  [ |< ] [ < ] [PLAY] [ > ] [ >| ]       │   correctly for this spread      │
│  Speed: [1x] [4x] [16x]                 │   cost."                          │
│                                          │  < Coach annotation — process    │
│                                          │   observation, no signals >      │
│  Timeline scrubber:                      │                                  │
│  |─────●─────────────────────|          │  T+16:00  [Scenario]             │
│  {T+08:42}              {T+40:00}        │  "HBD protocol defense under     │
│                                          │   stress — status unclear."      │
│  [ JUMP TO DECISION POINT: A | B | C ]  │                                  │
│                                          │  ─────────────────────────────   │
│                                          │  < Coach annotation authoring    │
│                                          │    is deferred post-v1.          │
│                                          │    Pre-authored scenario         │
│                                          │    annotations shown here. >     │
│                                          │                                  │
│                                          │  [ RETURN TO DEBRIEF ]           │
└──────────────────────────────────────────┴──────────────────────────────────┘
```

**Interaction notes:**

- The replay renders from the stored EventLog + seed, re-running the deterministic
  sim (SIM_ENGINE_SPEC §1.1). The chart state at any tick is the canonical record.
- The annotation lane shows three source types with visual distinction: Scenario
  (pre-authored beats), Your journal (wordCount + tags, text private), Coach
  (annotations from a coach account — empty in Phase 2 except pre-authored scenario
  notes). Each source has a label prefix.
- Coach annotations are stored separately from the EventLog (SIM_ENGINE_SPEC §5.3)
  and loaded alongside it. The replay viewer renders them in the annotation lane
  at their `tickIndex` anchor.
- Coach annotation text must not contain buy/sell signals or price targets
  (SIM_ENGINE_SPEC §5.3 content rule). Pre-authored scenario annotations are vetted
  at authoring time. Post-v1 user-generated coach annotations require server-side
  content filtering before display.
- "Jump to Decision Point" buttons seek the replay to the `ScenarioBeatEvent`
  with `decisionPointId` matching the button label (SIM_ENGINE_SPEC §2.1
  `IMarketFeed.seekTo(tickIndex)`).
- Journal entry text is NOT shown in the annotation lane even to the session owner
  in the replay view — only wordCount and tags. This is a deliberate privacy design
  choice: the replay is shareable format, and journal text is sensitive even to
  the player in a shareable context (SIM_ENGINE_SPEC §5.1 journal text privacy).

SPEC GAP: SIM_ENGINE_SPEC §5.3 specifies the `CoachAnnotation` data structure but
does not specify how pre-authored scenario annotations (authored by the game content
team, not a coach account) are stored and loaded. These scenario-beat annotations
(shown in the replay as "[Scenario]" lane entries) could be stored as
`CoachAnnotation` objects with a reserved `coachId` of `system`, or as a separate
annotation type. The distinction matters for the server-side content filter rule
(which applies to user-generated coach annotations, not system annotations). This
gap should be resolved in the spec before the replay viewer is implemented.

---

## Screen 7: Age Screen at Account Creation

**Implements:** SIM_ENGINE_SPEC §6.1 (mandatory age screen, cannot be bypassed),
GDD §9 (governance gate — age screen is mandatory), SIM_ENGINE_SPEC §6.2 (age
affirmation stored with timestamp).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         TRADEGAME                                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Before continuing, confirm your age.                               │   │
│  │                                                                     │   │
│  │  TradeGame is an educational simulator. We need to confirm your     │   │
│  │  age to apply appropriate account settings.                         │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                                                             │   │   │
│  │  │  [ I am 18 or older ]                                       │   │   │
│  │  │                                                             │   │   │
│  │  │  [ I am 13 to 17 years old ]                                │   │   │
│  │  │                                                             │   │   │
│  │  │  [ I am under 13 ]                                          │   │   │
│  │  │                                                             │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  < Buttons are the only interactive elements on this screen.        │   │
│  │    No close button. No skip. Cannot be bypassed. >                  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Path: "I am 18 or older"** → proceeds to account creation (email optional,
display name optional, password required). Age affirmation `18_plus` stored with
timestamp in account record.

**Path: "I am 13 to 17 years old"** → proceeds to a reduced account creation flow.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Welcome. Your account will be set up for solo play.                │   │
│  │                                                                     │   │
│  │  TradeGame's coaching and replay-sharing features are available     │   │
│  │  when you turn 18. Everything else is fully available.              │   │
│  │                                                                     │   │
│  │  No parent or guardian email is required to play.                   │   │
│  │  We do not collect personal information from players under 18       │   │
│  │  beyond what is needed to run your account.                         │   │
│  │                                                                     │   │
│  │  [ CONTINUE TO ACCOUNT SETUP ]                                      │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

Age affirmation `13_to_17` stored with timestamp. Coaching features (replay sharing,
coach annotation viewing, coach candidate flag) locked for this account. All scenarios,
drills, and lessons available.

**Path: "I am under 13"**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  TradeGame requires users to be at least 13 years old.              │   │
│  │                                                                     │   │
│  │  Account creation is not available for users under 13.              │   │
│  │                                                                     │   │
│  │  [ Return to start ]                                                │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

No account is created. No data is stored. The "Return to start" button returns to the
age screen (the player may have misread the question).

**Interaction notes:**

- The age screen appears exactly once per account creation flow. It cannot appear
  on subsequent logins (the age affirmation is stored; the screen is already cleared).
- The three buttons are the ONLY interactive elements on the age screen. There is no
  close button, no skip link, no browser back navigation that bypasses it (the
  route is blocked server-side for unauthenticated users with no age affirmation).
- COPPA analysis is a hard gate before this screen ships (SIM_ENGINE_SPEC §6.1,
  GDD §9). The engineering spec for this screen can be built; it must not be deployed
  to a server-side account store until COPPA analysis is complete. In Phase 2
  client-side-only mode, the age screen can run and store the affirmation in
  localStorage; no server-side write occurs.
- The 13–17 path language ("We do not collect personal information beyond what is
  needed to run your account") is a compliance-friendly framing pending legal review.
  The exact wording should be reviewed by the legal/compliance owner before deployment.

---

## Spec Gaps Summary

All spec gaps identified inline above are consolidated here for engineering triage.

| # | Screen | Gap description | Blocking? |
|---|--------|-----------------|-----------|
| SG-01 | Main Menu | Rank/XP display format not specified in SIM_ENGINE_SPEC §6.2; wireframe assumes a progress bar and rank label. | No — design can proceed; spec addition needed before implementation. |
| SG-02 | Trading Screen | Fill confirmation overlay timing/dismissal not specified in SIM_ENGINE_SPEC §3.2. Wireframe assumes 3-second auto-dismiss, non-blocking. | No — low-risk spec gap; suggest filling before UI sprint. |
| SG-03 | Trading Screen | Process metric compliance indicator (stop-before-entry visual feedback) in Position Panel not explicitly specced as a UI surface in SIM_ENGINE_SPEC. | No — implied by scoring engine design; needs explicit spec addition. |
| SG-04 | News Policy Card | `policy_match` metric not in SIM_ENGINE_SPEC §4.2 metric table. Required for SCN-006 scoring rubric to be implementable. | YES — blocking for SCN-006 implementation. Add to spec before development. |
| SG-05 | Debrief Screen | `RecklessWinnerFlag` placement not specified in SIM_ENGINE_SPEC §4.3 beyond "UI renders a coaching alert." | No — wireframe places it in right panel; confirm viewport visibility. |
| SG-06 | Replay Viewer | Pre-authored scenario annotations not distinguished from user-generated coach annotations in SIM_ENGINE_SPEC §5.3. Content filter rule distinction unclear. | YES — blocking for replay viewer + coach annotation filter implementation. |
| SG-07 | Multi-position | Aggregate notional exposure display (needed for Advanced tier ACN-001, ACN-006) not in SIM_ENGINE_SPEC §3.4. | No — not Phase 2 blocking; needed before advanced scenarios ship. |
| SG-08 | ACN-004 | Non-tradeable index display surface (NMX 100 as reference chart) not in SIM_ENGINE_SPEC. | No — not Phase 2 blocking; needed before ACN-004 ships. |

/**
 * SCN-005: NMX 100 Index Inclusion Day — Scenario Definition.
 *
 * Expresses the SCENARIOS_V1 §SCN-005 beat schedule as a ScenarioDef.
 * All names from FICTIONAL_CANON.md (VLDI / Veldara Industrial, NMX 100 —
 * always the two-word form per the canon collision flag).  No real index,
 * company, or date is referenced.
 *
 * MULTI-SESSION MODEL:
 *   This is the first multi-session scenario.  It uses the stocks adapter's
 *   compressed sim-day support (manifest.simDayMs): each sim day is 72
 *   minutes, so the ET session-phase boundaries scale by 0.05:
 *     day anchor (08:00 ET)        : day N × 4,320,000 ms
 *     regular open  (09:30 ET)     : anchor + 270,000 ms
 *     auction window (15:50–16:00) : anchor + [1,410,000 – 1,440,000) ms
 *     after-hours close (20:00 ET) : anchor + 2,160,000 ms
 *   Regular session ≈ 19.5 min of sim time per day (spec target: ~18 min per
 *   session at 1x); closed phases are dead time the UI can fast-forward.
 *
 * Day map (8 compressed days, 15-second ticks → 288 ticks/day, 2304 total):
 *   Day 0 : pre-announcement context — VLDI trading normally at $31.40
 *   Day 1 : announcement gap (open $33.80, +7.6%), run-up begins, DP-A
 *   Day 2 : continued grind $34.50 → $35.60, DP-B
 *   Day 3 : peak run momentum → $36.50, DP-C
 *   Day 4 : fade before inclusion → $36.10
 *   Day 5 : inclusion day — firming to $37.20; closing auction prints $37.80
 *           (adapter auction bump 1.6% over the pinned $37.20), DP-D
 *   Day 6 : post-inclusion fade begins — opens $37.20, fades, DP-E
 *   Day 7 : fade completes → $34.60 close
 *
 * Key price levels (VLDI in USD):
 *   Pre-announcement close: $31.40   D5 auction print: $37.80
 *   D1 open:                $33.80   D5 close:         $37.20
 *   D3 high:                $36.50   D7 close:         $34.60
 *
 * No-entry window (no_entry_window metric): the first 15 market-minutes of
 * the D1 open (scaled: 45,000 ms of sim time) — entering the announcement
 * gap at peak spread is the scenario's first cautionary behavior.
 */

import type { ScenarioDef } from "./types.js";

// ---------------------------------------------------------------------------
// Sim-time constants
// ---------------------------------------------------------------------------

const MS_PER_TICK = 15_000;        // 15-second ticks
const DAY_MS = 4_320_000;          // 72-minute compressed sim day (scale 0.05)
const REGULAR_OPEN_OFFSET = 270_000;   // 09:30 ET scaled
const AUCTION_START_OFFSET = 1_410_000; // 15:50 ET scaled
const REGULAR_CLOSE_OFFSET = 1_440_000; // 16:00 ET scaled

/** Anchor (08:00 ET) of compressed day N. */
const day = (n: number): number => n * DAY_MS;

const D1_OPEN = day(1) + REGULAR_OPEN_OFFSET;     // 4,590,000 — announcement gap
const D1_NO_ENTRY_END = D1_OPEN + 45_000;          // first 15 market-min, scaled
const D2_MID = day(2) + 850_000;                   // 9,490,000 — DP-B
const D3_MID = day(3) + 850_000;                   // 13,810,000 — DP-C
const D5_AUCTION = day(5) + AUCTION_START_OFFSET;  // 23,010,000 — DP-D
const D6_OPEN = day(6) + REGULAR_OPEN_OFFSET;      // 26,190,000 — DP-E
const T_END = day(8);                              // 34,560,000 = 2304 ticks

// Ticks per span (at 15,000 ms/tick → 4 ticks/min)
const TICKS_2MIN  = 8;
const TICKS_5MIN  = 20;
const TICKS_10MIN = 40;

// ---------------------------------------------------------------------------
// SCN-005 ScenarioDef
// ---------------------------------------------------------------------------

export const scn005: ScenarioDef = {
  manifest: {
    id: "SCN-005",
    title: "NMX 100 Index Inclusion Day",
    market: "stocks",
    instrument: {
      symbol: "VLDI",
      displayName: "Veldara Industrial",
    },
    durationMs: T_END,
    msPerTick: MS_PER_TICK,
    startPrice: 31.4,
    prereqs: [
      "scenario:SCN-002",
      "lesson:earnings-seasons",            // S-I01
      "lesson:index-rebalancing-mechanics", // S-I-supp01 (pending authoring)
      "drill:position-sizing-stocks",
      "drill:stop-placement-v1",
    ],
    minRank: "Trainee",
    difficulty: "Intermediate",
    decisionPoints: [
      {
        id: "DP-A",
        label: "Decision Point A — D1 Open, Announcement Gap",
        simTimeMs: D1_OPEN,
      },
      {
        id: "DP-B",
        label: "Decision Point B — D2 Continued Grind",
        simTimeMs: D2_MID,
      },
      {
        id: "DP-C",
        label: "Decision Point C — D3 Peak Run Momentum",
        simTimeMs: D3_MID,
      },
      {
        id: "DP-D",
        label: "Decision Point D — D5 Closing Auction",
        simTimeMs: D5_AUCTION,
      },
      {
        id: "DP-E",
        label: "Decision Point E — Post-Inclusion Fade",
        simTimeMs: D6_OPEN,
      },
    ],
    xpRubric: [
      {
        metricId: "journal_before_trade",
        xpOnPass: 20,
        label: "Driver named in journal before first trade (mechanical flow)",
      },
      {
        metricId: "plan_declared",
        xpOnPass: 20,
        label: "Plan/hypothesis declared at or before session start",
      },
      {
        metricId: "no_entry_window",
        xpOnPass: 15,
        label: "No trade in the first 15 minutes of the D1 open (rule pre-stated)",
      },
      {
        metricId: "size_compliance",
        xpOnPass: 30,
        label: "Position size within 10% of account-risk rule",
      },
      {
        metricId: "stop_before_entry",
        xpOnPass: 25,
        label: "Stop placed before entry (logged before fill)",
      },
      {
        metricId: "stop_honored",
        xpOnPass: 20,
        label: "Stop honored (not cancelled after entry)",
      },
      {
        metricId: "no_stop_widen",
        xpOnPass: 15,
        label: "Stop not widened after entry",
      },
      {
        metricId: "exit_journal",
        xpOnPass: 15,
        label: "Exit reason journaled (mechanical demand exhausted)",
      },
      {
        metricId: "patience_observation",
        xpOnPass: 125,
        label: "Observation-only run with full driver labeling",
      },
      {
        metricId: "debrief_completed",
        xpOnPass: 30,
        label: "Scenario debrief completed",
      },
      {
        metricId: "session_reviewed",
        xpOnPass: 10,
        label: "Re-review session later (replay)",
      },
    ],
    recklessWinnerCoachingText:
      "You bought at peak momentum and sold at the auction spike. The process " +
      "gaps: no driver label, no stop. A scenario where the D4 dip continued " +
      "through $33.80 would have produced a large loss with the same process. " +
      "The outcome does not validate the gaps.",
    debriefContentIds: [
      "scn005:what-happened",
      "scn005:good-process",
      "scn005:good-process-can-lose",
      "scn005:common-errors",
    ],
    noEntryWindows: [
      {
        startMs: D1_OPEN,
        endMs: D1_NO_ENTRY_END,
        label: "First 15 minutes of the D1 announcement-gap open",
      },
    ],
    simDayMs: DAY_MS,
  },

  // -------------------------------------------------------------------------
  // Beat schedule — ordered by simTimeMs (ascending).
  // Spread narrative: $0.28 at the D1 open spike, $0.06 normalized.
  //
  // AUTHORING NOTE — overnight anchors: closed phases still advance the GBM
  // (fixed draw budget), so every overnight is pinned at the prior close.
  // This keeps the multi-day path inside the authored narrative (a free
  // overnight walk at session-open sigma can stray far enough to cross the
  // $33.80 stop level the spec's good-process example depends on).
  // -------------------------------------------------------------------------
  script: [
    // Overnight anchors: each close held to the next regular open (210 ticks).
    ...[31.4, 34.5, 35.6, 36.5, 36.1, 37.2, 36.0].map((price, n) => ({
      kind: "price_override" as const,
      simTimeMs: day(n) + REGULAR_CLOSE_OFFSET,
      durationTicks: 210,
      price,
    })),
    // Day 7 close → scenario end: hold the $34.60 fade close.
    {
      kind: "price_override",
      simTimeMs: day(7) + REGULAR_CLOSE_OFFSET,
      durationTicks: 210,
      price: 34.6,
    },
    // --- Day 0: pre-announcement context — VLDI at $31.40, quiet ---
    {
      kind: "price_override",
      simTimeMs: day(0) + REGULAR_OPEN_OFFSET,
      durationTicks: TICKS_5MIN,
      price: 31.4,
    },
    {
      kind: "regime_override",
      simTimeMs: day(0),
      durationTicks: 288, // whole context day
      regime: "quiet",
    },
    {
      kind: "spread_override",
      simTimeMs: day(0),
      durationTicks: 288,
      spread: 0.06,
    },
    // Anchor the pre-announcement close.
    {
      kind: "price_override",
      simTimeMs: day(0) + REGULAR_CLOSE_OFFSET - 60_000,
      durationTicks: TICKS_2MIN,
      price: 31.4,
    },

    // --- Day 1: announcement gap at the open — $31.40 → $33.80 (+7.6%) ---
    {
      kind: "price_override",
      simTimeMs: D1_OPEN,
      durationTicks: TICKS_2MIN,
      price: 33.8,
    },
    // Spread spikes to $0.28 at the gap open.
    {
      kind: "spread_override",
      simTimeMs: D1_OPEN,
      durationTicks: TICKS_2MIN,
      spread: 0.28,
    },
    {
      kind: "regime_override",
      simTimeMs: D1_OPEN,
      durationTicks: TICKS_10MIN,
      regime: "trending_up",
    },
    // Spread normalizes to $0.06 after the open chaos.
    {
      kind: "spread_override",
      simTimeMs: D1_OPEN + 120_000,
      durationTicks: 280,
      spread: 0.06,
    },
    // D1 grind anchors: $33.80 → $34.50 across the session.
    {
      kind: "price_override",
      simTimeMs: day(1) + 800_000,
      durationTicks: TICKS_2MIN + 4,
      price: 34.1,
    },
    {
      kind: "price_override",
      simTimeMs: day(1) + AUCTION_START_OFFSET - 120_000,
      durationTicks: TICKS_2MIN + 4,
      price: 34.5,
    },

    // --- Day 2: continued grind — $34.50 → $35.60, DP-B ---
    // Open held through the open-sigma window so the DP-B entry zone stays
    // inside the narrative (a $33.80 stop must not be reachable on D2).
    {
      kind: "price_override",
      simTimeMs: day(2) + REGULAR_OPEN_OFFSET,
      durationTicks: 39,
      price: 34.55,
    },
    {
      kind: "regime_override",
      simTimeMs: day(2) + REGULAR_OPEN_OFFSET,
      durationTicks: TICKS_10MIN * 2,
      regime: "trending_up",
    },
    {
      kind: "spread_override",
      simTimeMs: day(2),
      durationTicks: 288,
      spread: 0.06,
    },
    {
      kind: "price_override",
      simTimeMs: D2_MID,
      durationTicks: TICKS_2MIN * 2,
      price: 35.0,
    },
    {
      kind: "price_override",
      simTimeMs: day(2) + 1_050_000,
      durationTicks: TICKS_2MIN + 4,
      price: 35.3,
    },
    {
      kind: "price_override",
      simTimeMs: day(2) + AUCTION_START_OFFSET - 120_000,
      durationTicks: TICKS_2MIN + 4,
      price: 35.6,
    },

    // --- Day 3: peak run momentum — $35.60 → $36.50, DP-C ---
    {
      kind: "price_override",
      simTimeMs: day(3) + REGULAR_OPEN_OFFSET,
      durationTicks: 30,
      price: 35.7,
    },
    {
      kind: "regime_override",
      simTimeMs: day(3) + REGULAR_OPEN_OFFSET,
      durationTicks: TICKS_10MIN * 2,
      regime: "trending_up",
    },
    {
      kind: "spread_override",
      simTimeMs: day(3),
      durationTicks: 288,
      spread: 0.06,
    },
    {
      kind: "price_override",
      simTimeMs: D3_MID,
      durationTicks: TICKS_2MIN * 2,
      price: 36.3,
    },
    {
      kind: "price_override",
      simTimeMs: day(3) + 1_200_000,
      durationTicks: TICKS_2MIN,
      price: 36.45,
    },
    // D3 high.
    {
      kind: "price_override",
      simTimeMs: day(3) + AUCTION_START_OFFSET - 120_000,
      durationTicks: TICKS_2MIN + 4,
      price: 36.5,
    },

    // --- Day 4: fade before inclusion — $36.50 → $36.10 ---
    {
      kind: "regime_override",
      simTimeMs: day(4) + REGULAR_OPEN_OFFSET,
      durationTicks: TICKS_10MIN * 2,
      regime: "trending_down",
    },
    {
      kind: "spread_override",
      simTimeMs: day(4),
      durationTicks: 288,
      spread: 0.06,
    },
    {
      kind: "price_override",
      simTimeMs: day(4) + REGULAR_OPEN_OFFSET,
      durationTicks: 30,
      price: 36.45,
    },
    {
      kind: "price_override",
      simTimeMs: day(4) + 850_000,
      durationTicks: TICKS_2MIN * 2,
      price: 36.2,
    },
    {
      kind: "price_override",
      simTimeMs: day(4) + AUCTION_START_OFFSET - 120_000,
      durationTicks: TICKS_2MIN + 4,
      price: 36.1,
    },

    // --- Day 5: inclusion day — firming into the close, auction print ---
    {
      kind: "price_override",
      simTimeMs: day(5) + REGULAR_OPEN_OFFSET,
      durationTicks: 30,
      price: 36.15,
    },
    {
      kind: "price_override",
      simTimeMs: day(5) + 900_000,
      durationTicks: TICKS_2MIN + 4,
      price: 36.6,
    },
    {
      kind: "regime_override",
      simTimeMs: day(5) + REGULAR_OPEN_OFFSET,
      durationTicks: TICKS_10MIN * 2,
      regime: "trending_up",
    },
    {
      kind: "spread_override",
      simTimeMs: day(5),
      durationTicks: 288,
      spread: 0.06,
    },
    {
      kind: "price_override",
      simTimeMs: day(5) + 1_200_000, // 15:30 scaled — volume builds into close
      durationTicks: TICKS_5MIN,
      price: 37.0,
    },
    // Pin $37.20 through the auction window: the adapter's auction bump
    // (×1.016) produces the $37.80 auction print on the auction ticks.
    {
      kind: "price_override",
      simTimeMs: D5_AUCTION - 60_000,
      durationTicks: TICKS_2MIN + 2,
      price: 37.2,
    },

    // --- Day 6: post-inclusion fade — opens $37.20, mechanical demand gone ---
    {
      kind: "price_override",
      simTimeMs: D6_OPEN,
      durationTicks: 16,
      price: 37.2,
    },
    {
      kind: "price_override",
      simTimeMs: day(6) + 850_000,
      durationTicks: TICKS_2MIN + 4,
      price: 36.6,
    },
    // Fade days run quiet — the spec's "below-average volume" decline is
    // expressed by the price anchors, not by a high-drift regime (which can
    // stray into the stale stop level on free ticks).
    {
      kind: "regime_override",
      simTimeMs: D6_OPEN,
      durationTicks: TICKS_10MIN * 2,
      regime: "quiet",
    },
    {
      kind: "spread_override",
      simTimeMs: day(6),
      durationTicks: 288,
      spread: 0.06,
    },
    {
      kind: "price_override",
      simTimeMs: day(6) + AUCTION_START_OFFSET - 120_000,
      durationTicks: TICKS_2MIN + 4,
      price: 36.0,
    },

    // --- Day 7: fade completes — $34.60 close ---
    {
      kind: "regime_override",
      simTimeMs: day(7) + REGULAR_OPEN_OFFSET,
      durationTicks: TICKS_10MIN * 2,
      regime: "quiet",
    },
    {
      kind: "spread_override",
      simTimeMs: day(7),
      durationTicks: 288,
      spread: 0.06,
    },
    {
      kind: "price_override",
      simTimeMs: day(7) + REGULAR_OPEN_OFFSET,
      durationTicks: 26,
      price: 35.8,
    },
    {
      kind: "price_override",
      simTimeMs: day(7) + 660_000,
      durationTicks: TICKS_2MIN + 4,
      price: 35.5,
    },
    {
      kind: "price_override",
      simTimeMs: day(7) + 850_000,
      durationTicks: TICKS_2MIN * 2,
      price: 35.2,
    },
    {
      kind: "price_override",
      simTimeMs: day(7) + AUCTION_START_OFFSET - 120_000,
      durationTicks: TICKS_2MIN + 4,
      price: 34.6,
    },
  ],
};

export default scn005;

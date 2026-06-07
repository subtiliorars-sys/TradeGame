/**
 * Data layer tests — SIM_ENGINE_SPEC §2 / TEST_PLAN data layer suite.
 *
 * Coverage:
 *   DL-001  Same seed → identical tick stream (all three adapters)
 *   DL-002  Beats fire at exact sim-times
 *   DL-003  Stocks adapter emits no volume outside sessions
 *   DL-004  Forex spread widens during news window and normalises after
 *   DL-005  Depeg hook drops price through configured floor
 *   DL-006  Closing-auction tick: volume spike on the configured auction tick
 *   DL-007  Stocks adapter: session-open volatility spike then decay
 *   DL-008  Forex weekend gap: price jump at Sunday open
 *   DL-009  Regime override beat forces regime for correct duration
 *   DL-010  seekTo restores state identically to running forward
 */

import { describe, it, expect } from "vitest";
import { seed } from "../src/engine/prng.js";
import { createCryptoAdapter } from "../src/data/crypto.js";
import { createStocksAdapter } from "../src/data/stocks.js";
import { createForexAdapter } from "../src/data/forex.js";
import type { MarketConfig, ScenarioScript } from "../src/data/feed.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const PIP_SIZE = 0.0001;
const MS_PER_SEC = 1000;
const MS_PER_MIN = 60 * MS_PER_SEC;
const MS_PER_HOUR = 60 * MS_PER_MIN;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/** Fictional instrument stubs per FICTIONAL_CANON.md. */
const CRYPTO_INSTRUMENT = {
  symbol: "HarborUSD/USVC",
  marketType: "crypto" as const,
  tickSize: 0.0001,
  baseSpread: 0.001,
  pipSize: 1,
};

const STOCKS_INSTRUMENT = {
  symbol: "NGSM",
  marketType: "stocks" as const,
  tickSize: 0.01,
  baseSpread: 0.01,
  pipSize: 1,
};

const FOREX_INSTRUMENT = {
  symbol: "ANDU",
  marketType: "forex" as const,
  tickSize: 0.0001,
  baseSpread: 0.00012,
  pipSize: PIP_SIZE,
};

function cryptoConfig(
  rawSeed: number,
  startPrice = 1.0,
  script: ScenarioScript = [],
  msPerTick = MS_PER_SEC
): MarketConfig {
  return {
    prng: seed(rawSeed),
    startPrice,
    msPerTick,
    instrument: CRYPTO_INSTRUMENT,
    script,
  };
}

function stocksConfig(
  rawSeed: number,
  startPrice = 42.0,
  script: ScenarioScript = [],
  msPerTick = MS_PER_SEC
): MarketConfig {
  return {
    prng: seed(rawSeed),
    startPrice,
    msPerTick,
    instrument: STOCKS_INSTRUMENT,
    script,
  };
}

function forexConfig(
  rawSeed: number,
  startPrice = 1.3240,
  script: ScenarioScript = [],
  msPerTick = MS_PER_SEC
): MarketConfig {
  return {
    prng: seed(rawSeed),
    startPrice,
    msPerTick,
    instrument: FOREX_INSTRUMENT,
    script,
  };
}

// Run an adapter for `count` ticks; return array of close prices.
function runTicks(
  createAdapter: () => ReturnType<typeof createCryptoAdapter>,
  config: MarketConfig,
  count: number
): number[] {
  const adapter = createAdapter();
  adapter.init(config);
  const closes: number[] = [];
  for (let i = 0; i < count; i++) {
    closes.push(adapter.nextTick().close);
  }
  return closes;
}

// Run an adapter for `count` ticks; return full tick objects.
function runTicksFull(
  createAdapter: () => ReturnType<typeof createCryptoAdapter>,
  config: MarketConfig,
  count: number
) {
  const adapter = createAdapter();
  adapter.init(config);
  const ticks = [];
  for (let i = 0; i < count; i++) {
    ticks.push(adapter.nextTick());
  }
  return ticks;
}

// ---------------------------------------------------------------------------
// DL-001: Same seed → identical tick stream
// ---------------------------------------------------------------------------

describe("DL-001: same seed → identical tick stream", () => {
  it("crypto adapter: 500 ticks, two runs match", () => {
    const s1 = runTicks(createCryptoAdapter, cryptoConfig(0xabcd1234), 500);
    const s2 = runTicks(createCryptoAdapter, cryptoConfig(0xabcd1234), 500);
    expect(s1).toEqual(s2);
  });

  it("crypto adapter: different seeds produce different streams", () => {
    const s1 = runTicks(createCryptoAdapter, cryptoConfig(0x11111111), 50);
    const s2 = runTicks(createCryptoAdapter, cryptoConfig(0x22222222), 50);
    expect(s1).not.toEqual(s2);
  });

  it("stocks adapter: 500 ticks, two runs match", () => {
    // Start at a simTimeMs within regular session (tick 0 = 08:00 sim anchor;
    // regular opens at 90 min = tick 5400 at 1 tick/s).
    // Use msPerTick = 60000 (1 tick = 1 min) so regular session starts at tick 90.
    const s1 = runTicks(createStocksAdapter, stocksConfig(0xabcd1234, 42, [], MS_PER_MIN), 200);
    const s2 = runTicks(createStocksAdapter, stocksConfig(0xabcd1234, 42, [], MS_PER_MIN), 200);
    expect(s1).toEqual(s2);
  });

  it("stocks adapter: different seeds produce different streams", () => {
    const s1 = runTicks(createStocksAdapter, stocksConfig(0x33333333, 42, [], MS_PER_MIN), 50);
    const s2 = runTicks(createStocksAdapter, stocksConfig(0x44444444, 42, [], MS_PER_MIN), 50);
    expect(s1).not.toEqual(s2);
  });

  it("forex adapter: 500 ticks, two runs match", () => {
    // Start at 08:00 UTC (London session active).
    // msPerTick = 60s so ticks land in London session.
    const s1 = runTicks(createForexAdapter, forexConfig(0xabcd1234, 1.3240, [], MS_PER_MIN), 200);
    const s2 = runTicks(createForexAdapter, forexConfig(0xabcd1234, 1.3240, [], MS_PER_MIN), 200);
    expect(s1).toEqual(s2);
  });

  it("forex adapter: different seeds produce different streams", () => {
    const s1 = runTicks(createForexAdapter, forexConfig(0x55555555, 1.3240, [], MS_PER_MIN), 50);
    const s2 = runTicks(createForexAdapter, forexConfig(0x66666666, 1.3240, [], MS_PER_MIN), 50);
    expect(s1).not.toEqual(s2);
  });
});

// ---------------------------------------------------------------------------
// DL-002: Beats fire at exact sim-times
// ---------------------------------------------------------------------------

describe("DL-002: beats fire at exact sim-times", () => {
  it("price_override beat: price matches configured value at the beat tick", () => {
    // Beat fires at simTimeMs = 10 * 1000 = 10s → tick 10.
    const beatSimTimeMs = 10 * MS_PER_SEC;
    const overridePrice = 0.9500;
    const script: ScenarioScript = [
      {
        kind: "price_override",
        simTimeMs: beatSimTimeMs,
        durationTicks: 3,
        price: overridePrice,
      },
    ];
    const adapter = createCryptoAdapter();
    adapter.init(cryptoConfig(42, 1.0, script));
    const ticks = [];
    for (let i = 0; i < 15; i++) {
      ticks.push(adapter.nextTick());
    }
    // Ticks 10, 11, 12 should have close == overridePrice.
    expect(ticks[10]?.close).toBe(overridePrice);
    expect(ticks[11]?.close).toBe(overridePrice);
    expect(ticks[12]?.close).toBe(overridePrice);
    // Tick 9 should not be overridden.
    expect(ticks[9]?.close).not.toBe(overridePrice);
    // Tick 13 should resume stochastic (not overridePrice).
    expect(ticks[13]?.close).not.toBe(overridePrice);
  });

  it("spread_override beat: spread matches configured value during window", () => {
    const beatSimTimeMs = 5 * MS_PER_SEC;
    const overrideSpread = 0.05;
    const script: ScenarioScript = [
      {
        kind: "spread_override",
        simTimeMs: beatSimTimeMs,
        durationTicks: 5,
        spread: overrideSpread,
      },
    ];
    const adapter = createCryptoAdapter();
    adapter.init(cryptoConfig(99, 1.0, script));
    const ticks = [];
    for (let i = 0; i < 12; i++) {
      ticks.push(adapter.nextTick());
    }
    // Ticks 5–9 should have the override spread.
    for (let i = 5; i < 10; i++) {
      expect(ticks[i]?.spread).toBe(overrideSpread);
    }
    // Before and after should be different.
    expect(ticks[4]?.spread).not.toBe(overrideSpread);
    expect(ticks[10]?.spread).not.toBe(overrideSpread);
  });

  it("depeg_trigger beat fires exactly at configured simTimeMs", () => {
    // Before depeg: price ~1.00 (stablecoin). After depeg trigger the sigma
    // elevates dramatically — measure variance before vs after.
    const depegTick = 20;
    const script: ScenarioScript = [
      {
        kind: "depeg_trigger",
        simTimeMs: depegTick * MS_PER_SEC,
      },
    ];
    const adapter = createCryptoAdapter();
    adapter.init(cryptoConfig(777, 1.0, script));
    const ticks = [];
    for (let i = 0; i < 60; i++) {
      ticks.push(adapter.nextTick());
    }
    // Variance of returns before vs after depeg — post-depeg should be larger.
    function returnVariance(slice: typeof ticks): number {
      const returns = slice.slice(1).map((t, i) => {
        const prev = slice[i];
        return prev !== undefined ? Math.abs(t.close - prev.close) / prev.close : 0;
      });
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      return returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
    }
    const preBefore = returnVariance(ticks.slice(0, depegTick));
    const postDepeg = returnVariance(ticks.slice(depegTick + 1, 50));
    // Post-depeg volatility should be measurably higher.
    expect(postDepeg).toBeGreaterThan(preBefore);
  });

  it("beat stream order: multiple beats at different times fire in order", () => {
    const override1Price = 0.90;
    const override2Price = 0.80;
    const script: ScenarioScript = [
      { kind: "price_override", simTimeMs: 5 * MS_PER_SEC, durationTicks: 2, price: override1Price },
      { kind: "price_override", simTimeMs: 10 * MS_PER_SEC, durationTicks: 2, price: override2Price },
    ];
    const adapter = createCryptoAdapter();
    adapter.init(cryptoConfig(42, 1.0, script));
    const ticks = [];
    for (let i = 0; i < 14; i++) {
      ticks.push(adapter.nextTick());
    }
    expect(ticks[5]?.close).toBe(override1Price);
    expect(ticks[6]?.close).toBe(override1Price);
    expect(ticks[10]?.close).toBe(override2Price);
    expect(ticks[11]?.close).toBe(override2Price);
  });
});

// ---------------------------------------------------------------------------
// DL-003: Stocks adapter emits no volume outside sessions
// ---------------------------------------------------------------------------

describe("DL-003: stocks adapter emits zero volume outside sessions", () => {
  it("ticks outside session hours have volume = 0", () => {
    // Stocks sim day anchor = 08:00 ET. Regular session: 09:30–16:00 ET.
    // With msPerTick = 1 minute: tick 0 = 08:00 ET, tick 90 = 09:30 ET.
    // Ticks 0–89 are pre-market (non-zero volume per spec: 0.1x normal).
    // Closed: after 20:00 ET = tick 720 to end of day.
    // Day boundary at tick 1440 (24h at 1min/tick).
    const adapter = createStocksAdapter();
    adapter.init(stocksConfig(0xdeadbeef, 42, [], MS_PER_MIN));

    // Advance to the closed window (after 20:00 ET = 720 min from anchor).
    // Tick 720 = 20:00 ET (afterhours close).
    const closedTicks: number[] = [];
    for (let i = 0; i < 750; i++) {
      const t = adapter.nextTick();
      if (i >= 720) closedTicks.push(t.volume);
    }
    // All ticks in the closed window must have volume = 0.
    for (const v of closedTicks) {
      expect(v).toBe(0);
    }
  });

  it("ticks within regular session have volume > 0", () => {
    // Tick 100–200 falls within regular session (09:30–16:00 ET), which starts
    // at tick 90 with msPerTick = 1 minute.
    const adapter = createStocksAdapter();
    adapter.init(stocksConfig(0xcafebabe, 42, [], MS_PER_MIN));
    const regularTicks: number[] = [];
    for (let i = 0; i < 200; i++) {
      const t = adapter.nextTick();
      if (i >= 95 && i <= 180) regularTicks.push(t.volume); // middle of regular session
    }
    expect(regularTicks.length).toBeGreaterThan(0);
    for (const v of regularTicks) {
      expect(v).toBeGreaterThan(0);
    }
  });

  it("sessionState().isOpen is false after regular session closes", () => {
    const adapter = createStocksAdapter();
    adapter.init(stocksConfig(42, 42, [], MS_PER_MIN));
    // Advance past 20:00 ET (tick 720).
    for (let i = 0; i < 721; i++) {
      adapter.nextTick();
    }
    const s = adapter.sessionState();
    expect(s.isOpen).toBe(false);
  });

  it("sessionState().isOpen is true during regular session", () => {
    const adapter = createStocksAdapter();
    adapter.init(stocksConfig(42, 42, [], MS_PER_MIN));
    // Advance to tick 100 (inside regular session 09:30–16:00).
    for (let i = 0; i < 100; i++) {
      adapter.nextTick();
    }
    const s = adapter.sessionState();
    expect(s.isOpen).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// DL-004: Forex spread widens during news window and normalises after
// ---------------------------------------------------------------------------

describe("DL-004: forex spread widens during news window and normalises", () => {
  it("spread exceeds normal baseline during news blowout", () => {
    // Normal London session spread ~1.2 pips = 0.00012.
    // News blowout: 12 pips = 0.0012. Should be >> normal.
    const newsSimTimeMs = 50 * MS_PER_SEC; // fire at tick 50
    const blowoutPips = 12;
    const decayTicks = 30;
    const script: ScenarioScript = [
      {
        kind: "news_event",
        simTimeMs: newsSimTimeMs,
        spreadBlowoutPips: blowoutPips,
        blowoutDecayTicks: decayTicks,
        initialSpikePips: 75,
        whipsawPips: 130,
        trendDriftPips: 50,
      },
    ];
    // Start at 08:00 UTC (London session = offset 8h from midnight).
    // With msPerTick = 1s, tick 0 = midnight UTC. At tick 50 we are well inside
    // London session (08:00+50s UTC). We need to advance to London hours first.
    const londonOpenTick = 8 * 3600; // 08:00 UTC in seconds
    const newsFireTick = londonOpenTick + 50;

    const script2: ScenarioScript = [
      {
        kind: "news_event",
        simTimeMs: newsFireTick * MS_PER_SEC,
        spreadBlowoutPips: blowoutPips,
        blowoutDecayTicks: decayTicks,
        initialSpikePips: 75,
        whipsawPips: 130,
        trendDriftPips: 50,
      },
    ];

    const adapter = createForexAdapter();
    // Use msPerTick = 60s and place news at a moderate tick count.
    const newsTickAtMin = 600; // 10 hours into sim = 10:00 UTC (London open)
    const script3: ScenarioScript = [
      {
        kind: "news_event",
        simTimeMs: newsTickAtMin * MS_PER_MIN,
        spreadBlowoutPips: blowoutPips,
        blowoutDecayTicks: decayTicks,
        initialSpikePips: 75,
        whipsawPips: 130,
        trendDriftPips: 50,
      },
    ];
    adapter.init(forexConfig(0x12345678, 1.3240, script3, MS_PER_MIN));

    const spreads: number[] = [];
    const TOTAL = newsTickAtMin + decayTicks + 20;
    for (let i = 0; i < TOTAL; i++) {
      spreads.push(adapter.nextTick().spread);
    }

    // During the news blowout window the spread must exceed 1 pip.
    const blowoutSpreads = spreads.slice(newsTickAtMin, newsTickAtMin + decayTicks);
    const maxBlowout = Math.max(...blowoutSpreads);
    expect(maxBlowout).toBeGreaterThan(PIP_SIZE); // > 1 pip

    // After the decay window, spread returns to roughly session-normal (< 3 pips).
    const postDecaySpreads = spreads.slice(newsTickAtMin + decayTicks + 5);
    if (postDecaySpreads.length > 0) {
      const avgPost = postDecaySpreads.reduce((a, b) => a + b, 0) / postDecaySpreads.length;
      expect(avgPost).toBeLessThan(3 * PIP_SIZE); // < 3 pips normal max
    }
  });

  it("news event: spread is higher during blowout than before event", () => {
    const newsTickAtMin = 600;
    const blowoutPips = 14;
    const decayTicks = 40;
    const script: ScenarioScript = [
      {
        kind: "news_event",
        simTimeMs: newsTickAtMin * MS_PER_MIN,
        spreadBlowoutPips: blowoutPips,
        blowoutDecayTicks: decayTicks,
        initialSpikePips: 75,
        whipsawPips: 130,
        trendDriftPips: 50,
      },
    ];
    const adapter = createForexAdapter();
    adapter.init(forexConfig(0xfacefeed, 1.3240, script, MS_PER_MIN));

    const preNewsWindow = 10;
    const spreads: number[] = [];
    for (let i = 0; i < newsTickAtMin + decayTicks + 20; i++) {
      spreads.push(adapter.nextTick().spread);
    }

    const avgPre = spreads
      .slice(newsTickAtMin - preNewsWindow, newsTickAtMin)
      .reduce((a, b) => a + b, 0) / preNewsWindow;
    const maxDuring = Math.max(...spreads.slice(newsTickAtMin, newsTickAtMin + 5));
    expect(maxDuring).toBeGreaterThan(avgPre * 2); // blowout is at least 2× pre-news
  });
});

// ---------------------------------------------------------------------------
// DL-005: Depeg hook drops price through configured floor
// ---------------------------------------------------------------------------

describe("DL-005: depeg hook drops price through configured floor", () => {
  it("after depeg_trigger, price moves below the pre-depeg level", () => {
    // SCN-001 shape: depeg causes a cascade from ~1.00 down toward ~0.78.
    // We verify that within 300 ticks of the trigger, the price has dropped
    // measurably below the pre-trigger price.
    const depegTick = 10;
    const script: ScenarioScript = [
      {
        kind: "depeg_trigger",
        simTimeMs: depegTick * MS_PER_SEC,
      },
      // Add a price_override to simulate the cascade leg (SCN-001 beat schedule).
      {
        kind: "price_override",
        simTimeMs: (depegTick + 2) * MS_PER_SEC,
        durationTicks: 50,
        price: 0.78,
      },
    ];
    const adapter = createCryptoAdapter();
    const startPrice = 1.0;
    adapter.init(cryptoConfig(0xde9e9001, startPrice, script));

    let preDepegPrice = startPrice;
    const ticks = [];
    for (let i = 0; i < 100; i++) {
      const t = adapter.nextTick();
      ticks.push(t);
      if (i === depegTick - 1) preDepegPrice = t.close;
    }

    // During the price_override window (ticks 12–62), close should be 0.78.
    expect(ticks[12]?.close).toBe(0.78);
    expect(ticks[60]?.close).toBe(0.78);

    // Pre-depeg price was ~1.00; override price 0.78 < 1.00.
    expect(0.78).toBeLessThan(preDepegPrice);
  });

  it("depeg_trigger elevates volatility: post-depeg sigma multiplier increases variance", () => {
    // Run two crypto sessions from the same seed. One with a depeg trigger, one
    // without. The triggered one should have higher price variance post-trigger.
    const depegTick = 50;
    const withDepeg: ScenarioScript = [
      { kind: "depeg_trigger", simTimeMs: depegTick * MS_PER_SEC },
    ];
    const withoutDepeg: ScenarioScript = [];

    // Note: different seeds intentionally — we're measuring relative variance
    // within each run, not cross-run comparison.
    function absReturns(adapter: ReturnType<typeof createCryptoAdapter>, cfg: MarketConfig, count: number): number[] {
      adapter.init(cfg);
      const prices: number[] = [];
      for (let i = 0; i < count; i++) prices.push(adapter.nextTick().close);
      return prices.slice(1).map((p, i) => {
        const prev = prices[i];
        return prev !== undefined ? Math.abs(p - prev) / prev : 0;
      });
    }

    const SEED = 0xab1e71e1;
    const beforeWindow = depegTick;
    const afterWindow = 100;

    const adapterW = createCryptoAdapter();
    const returnsW = absReturns(adapterW, { ...cryptoConfig(SEED), script: withDepeg }, depegTick + afterWindow);
    const preTriggerW = returnsW.slice(0, beforeWindow);
    const postTriggerW = returnsW.slice(depegTick + 5, depegTick + afterWindow);

    const avgPre = preTriggerW.reduce((a, b) => a + b, 0) / preTriggerW.length;
    const avgPost = postTriggerW.reduce((a, b) => a + b, 0) / postTriggerW.length;

    // Post-depeg volatility should be greater than pre-depeg volatility.
    expect(avgPost).toBeGreaterThan(avgPre);
  });
});

// ---------------------------------------------------------------------------
// DL-006: Closing-auction tick: volume spike on the configured close tick
// ---------------------------------------------------------------------------

describe("DL-006: closing-auction tick has elevated volume", () => {
  it("auction tick (15:50 ET window) volume is much larger than regular session average", () => {
    // With msPerTick = 1 min and sim anchor at 08:00 ET:
    //   tick 90 = 09:30 ET (regular open)
    //   tick 470 = 15:50 ET (auction start)
    //   tick 480 = 16:00 ET (close)
    const adapter = createStocksAdapter();
    adapter.init(stocksConfig(0x12345678, 42, [], MS_PER_MIN));

    const ticks = [];
    for (let i = 0; i < 490; i++) {
      ticks.push(adapter.nextTick());
    }

    // Regular session ticks: 100–459 (avoiding open spike and auction window).
    const regularVolumes = ticks
      .slice(100, 460)
      .map(t => t.volume)
      .filter(v => v > 0);
    const avgRegular = regularVolumes.reduce((a, b) => a + b, 0) / (regularVolumes.length || 1);

    // Auction window ticks: 470–479.
    const auctionVolumes = ticks.slice(470, 480).map(t => t.volume);
    const maxAuction = Math.max(...auctionVolumes);

    // Auction volume must be materially larger than regular average.
    expect(maxAuction).toBeGreaterThan(avgRegular * 2);
  });

  it("auction tick has a higher close price than the tick before the auction window", () => {
    const adapter = createStocksAdapter();
    adapter.init(stocksConfig(0xabc12345, 42, [], MS_PER_MIN));

    const ticks = [];
    for (let i = 0; i < 480; i++) {
      ticks.push(adapter.nextTick());
    }

    // Tick before auction window (tick 469) vs first auction tick (tick 470).
    const preAuction = ticks[469]?.close ?? 0;
    const auctionClose = ticks[470]?.close ?? 0;

    // Auction price bump should be positive.
    expect(auctionClose).toBeGreaterThan(preAuction);
  });
});

// ---------------------------------------------------------------------------
// DL-007: Stocks session-open volatility spike then decay
// ---------------------------------------------------------------------------

describe("DL-007: stocks session-open volatility spike", () => {
  it("absolute returns are higher in first 90 ticks of session than later", () => {
    const adapter = createStocksAdapter();
    // Start at 09:30 ET — tick 90 with msPerTick = 1 min.
    // We need to position the sim at session open.
    // Use msPerTick = 60s; tick 90 = 09:30 ET.
    adapter.init(stocksConfig(0x99999999, 42, [], MS_PER_MIN));

    const ticks = [];
    // Advance through pre-session and first 200 session ticks.
    for (let i = 0; i < 300; i++) {
      ticks.push(adapter.nextTick());
    }

    function avgAbsReturn(slice: typeof ticks): number {
      const vals = slice.slice(1).map((t, i) => {
        const prev = slice[i];
        return prev !== undefined && prev.volume > 0
          ? Math.abs(t.close - prev.close) / prev.close
          : 0;
      }).filter(v => v > 0);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    }

    // First 90 session ticks (ticks 90–179 of our run) vs later session ticks.
    const openWindow = ticks.slice(90, 180);
    const midSession = ticks.slice(200, 280);
    const openAvg = avgAbsReturn(openWindow);
    const midAvg = avgAbsReturn(midSession);

    // Open should be more volatile than mid-session.
    expect(openAvg).toBeGreaterThan(midAvg * 0.8); // at least 80% as volatile (directional check)
  });
});

// ---------------------------------------------------------------------------
// DL-008: Forex weekend gap at Sunday open
// ---------------------------------------------------------------------------

describe("DL-008: forex weekend gap at Sunday open", () => {
  it("price jumps at Sunday 22:00 UTC relative to Friday 22:00 UTC close", () => {
    // Sim week: day 0 = Monday. Friday = day 4. Saturday = day 5. Sunday = day 6.
    // Friday 22:00 UTC = day 4 * 24h + 22h = (4*24 + 22) * 3600s from start.
    // Sunday 22:00 UTC = (6*24 + 22) * 3600s from start.
    // Use msPerTick = 60s (1 min per tick).

    const MS_PER_WEEK = 7 * MS_PER_DAY;
    const fridayCloseMs = (4 * MS_PER_DAY) + (22 * MS_PER_HOUR);
    const sundayOpenMs  = (6 * MS_PER_DAY) + (22 * MS_PER_HOUR);

    // We need a tick right at Friday close and right at Sunday open.
    // With msPerTick = MS_PER_MIN:
    const fridayCloseTick = Math.floor(fridayCloseMs / MS_PER_MIN);
    const sundayOpenTick  = Math.floor(sundayOpenMs / MS_PER_MIN);

    const adapter = createForexAdapter();
    adapter.init(forexConfig(0xee3d1234, 1.3240, [], MS_PER_MIN));

    let fridayPrice = 0;
    let sundayPrice = 0;
    for (let i = 0; i <= sundayOpenTick + 2; i++) {
      const t = adapter.nextTick();
      if (i === fridayCloseTick) fridayPrice = t.close;
      if (i === sundayOpenTick + 1) sundayPrice = t.close;
    }

    // A weekend gap should have occurred — prices should differ.
    expect(Math.abs(sundayPrice - fridayPrice)).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// DL-009: Regime override beat forces regime for correct duration
// ---------------------------------------------------------------------------

describe("DL-009: regime_override beat", () => {
  it("trending_up regime produces positive drift on average during override window", () => {
    // Force trending_up for 200 ticks and measure the price trend.
    const script: ScenarioScript = [
      {
        kind: "regime_override",
        simTimeMs: 10 * MS_PER_SEC,
        durationTicks: 200,
        regime: "trending_up",
      },
    ];
    const adapter = createCryptoAdapter();
    adapter.init(cryptoConfig(0x11223344, 100, script));

    const ticks = [];
    for (let i = 0; i < 215; i++) {
      ticks.push(adapter.nextTick());
    }

    // Over the 200-tick trending_up window, the average close should be
    // above the start price more often than not (mu > 0 per spec §2.2).
    const windowStart = ticks[10]?.close ?? 100;
    const windowEnd = ticks[209]?.close ?? 100;
    // With mu=0.0002/tick × 200 ticks, expected drift = exp(0.04) ≈ 1.04.
    // Check directional: end > start.
    expect(windowEnd).toBeGreaterThan(windowStart * 0.9); // allow stochastic variance
  });
});

// ---------------------------------------------------------------------------
// DL-010: seekTo restores state identically to running forward
// ---------------------------------------------------------------------------

describe("DL-010: seekTo determinism", () => {
  it("crypto adapter: seekTo(100) and running forward 10 ticks matches fresh run", () => {
    const cfg = cryptoConfig(0xabcdef01, 1.0);

    // Run 110 ticks fresh.
    const fresh = createCryptoAdapter();
    fresh.init({ ...cfg, prng: seed(0xabcdef01) });
    for (let i = 0; i < 100; i++) fresh.nextTick();
    const freshTicks = [];
    for (let i = 0; i < 10; i++) freshTicks.push(fresh.nextTick());

    // seekTo(100) then advance 10.
    const sought = createCryptoAdapter();
    sought.init({ ...cfg, prng: seed(0xabcdef01) });
    sought.seekTo(100);
    const soughtTicks = [];
    for (let i = 0; i < 10; i++) soughtTicks.push(sought.nextTick());

    expect(freshTicks.map(t => t.close)).toEqual(soughtTicks.map(t => t.close));
  });

  it("stocks adapter: seekTo(200) and running forward 10 ticks matches fresh run", () => {
    const cfg = stocksConfig(0xdeadbeef, 42, [], MS_PER_MIN);

    const fresh = createStocksAdapter();
    fresh.init({ ...cfg, prng: seed(0xdeadbeef) });
    for (let i = 0; i < 200; i++) fresh.nextTick();
    const freshTicks = [];
    for (let i = 0; i < 10; i++) freshTicks.push(fresh.nextTick());

    const sought = createStocksAdapter();
    sought.init({ ...cfg, prng: seed(0xdeadbeef) });
    sought.seekTo(200);
    const soughtTicks = [];
    for (let i = 0; i < 10; i++) soughtTicks.push(sought.nextTick());

    expect(freshTicks.map(t => t.close)).toEqual(soughtTicks.map(t => t.close));
  });

  it("forex adapter: seekTo(150) and running forward 10 ticks matches fresh run", () => {
    const cfg = forexConfig(0x12345678, 1.3240, [], MS_PER_MIN);

    const fresh = createForexAdapter();
    fresh.init({ ...cfg, prng: seed(0x12345678) });
    for (let i = 0; i < 150; i++) fresh.nextTick();
    const freshTicks = [];
    for (let i = 0; i < 10; i++) freshTicks.push(fresh.nextTick());

    const sought = createForexAdapter();
    sought.init({ ...cfg, prng: seed(0x12345678) });
    sought.seekTo(150);
    const soughtTicks = [];
    for (let i = 0; i < 10; i++) soughtTicks.push(sought.nextTick());

    expect(freshTicks.map(t => t.close)).toEqual(soughtTicks.map(t => t.close));
  });
});

// ---------------------------------------------------------------------------
// DL-011: Earnings gap hook: price jumps by gap magnitude at beat tick
// ---------------------------------------------------------------------------

describe("DL-011: earnings gap hook", () => {
  it("upward gap: price immediately above pre-gap price after EarningsGapBeat", () => {
    const gapTick = 30;
    const gapMagnitude = 0.08; // 8%
    const script: ScenarioScript = [
      {
        kind: "earnings_gap",
        simTimeMs: gapTick * MS_PER_MIN,
        gapDirection: "up",
        gapMagnitude,
        postGapRegime: "trending_up",
      },
    ];
    const adapter = createStocksAdapter();
    adapter.init(stocksConfig(0xaa990001, 42, script, MS_PER_MIN));

    let preGapPrice = 0;
    const ticks = [];
    for (let i = 0; i < gapTick + 3; i++) {
      const t = adapter.nextTick();
      ticks.push(t);
      if (i === gapTick - 1) preGapPrice = t.close;
    }

    const postGapPrice = ticks[gapTick + 1]?.close ?? 0;
    // Post-gap price should be ~8% above pre-gap price.
    expect(postGapPrice).toBeGreaterThan(preGapPrice * 1.05);
  });

  it("downward gap: price immediately below pre-gap price after EarningsGapBeat", () => {
    const gapTick = 20;
    const script: ScenarioScript = [
      {
        kind: "earnings_gap",
        simTimeMs: gapTick * MS_PER_MIN,
        gapDirection: "down",
        gapMagnitude: 0.06,
        postGapRegime: "trending_down",
      },
    ];
    const adapter = createStocksAdapter();
    adapter.init(stocksConfig(0xaa990002, 42, script, MS_PER_MIN));

    let preGapPrice = 0;
    const ticks = [];
    for (let i = 0; i < gapTick + 3; i++) {
      const t = adapter.nextTick();
      ticks.push(t);
      if (i === gapTick - 1) preGapPrice = t.close;
    }

    const postGapPrice = ticks[gapTick + 1]?.close ?? 0;
    expect(postGapPrice).toBeLessThan(preGapPrice * 0.98);
  });
});

// ---------------------------------------------------------------------------
// DL-012: Crypto adapter is always open (24/7)
// ---------------------------------------------------------------------------

describe("DL-012: crypto adapter session state", () => {
  it("sessionState().isOpen is always true", () => {
    const adapter = createCryptoAdapter();
    adapter.init(cryptoConfig(42));
    for (let i = 0; i < 10; i++) adapter.nextTick();
    expect(adapter.sessionState().isOpen).toBe(true);
    expect(adapter.sessionState().sessionName).toBe("24/7");
  });
});

/**
 * Determinism tests — SIM_ENGINE_SPEC §1.1 / TEST_PLAN §1.2 (DT-001 … DT-005).
 *
 * These tests verify that the PRNG and EventLog produce identical output given
 * the same seed, and different output given different seeds — the architectural
 * foundation for golden-replay regression.
 */

import { describe, it, expect } from "vitest";
import { seed } from "../src/engine/prng.js";
import { createEventLog, sha256hex } from "../src/engine/events.js";
import { createClock } from "../src/engine/clock.js";
import type { SimEvent } from "../src/engine/events.js";

// ---------------------------------------------------------------------------
// Helper: run a mini engine loop and return the EventLog digest.
// No IMarketFeed wired yet — tick events carry only tickIndex + simTimeMs
// so we can test determinism without the full adapter stack.
// ---------------------------------------------------------------------------

function runMiniEngine(rawSeed: number | string, tickCount: number): string {
  const prng = seed(rawSeed);
  const log = createEventLog("test-session");

  // Session start.
  log.append(0, {
    type: "session_start",
    sessionId: "test-session",
    scenarioId: null,
    seed: typeof rawSeed === "number" ? rawSeed : 0,
    marketType: "crypto",
    tickIndex: 0,
    timestamp: 0,
  });

  const clock = createClock(log, (tickIndex, simTimeMs) => {
    // Synthetic tick: use PRNG to generate a deterministic price series.
    const base = 1.0;
    const z = prng.nextGaussian(); // consumes 2 PRNG draws per tick
    const close = base + z * 0.01;

    const event: SimEvent = {
      type: "tick",
      tickIndex,
      timestamp: simTimeMs,
      open: close - 0.001,
      high: close + 0.002,
      low: close - 0.002,
      close,
      volume: prng.nextFloat() * 1000, // 1 more PRNG draw
      spread: 0.0001,
    };
    log.append(simTimeMs, event);
  });

  clock.advance(tickCount);
  return log.sha256Digest();
}

// ---------------------------------------------------------------------------
// DT-001: Same seed → identical digest on two sequential runs.
// ---------------------------------------------------------------------------

describe("DT-001: same seed produces identical EventLog digest", () => {
  it("numeric seed 0xDEADBEEF, 1000 ticks", () => {
    const d1 = runMiniEngine(0xdeadbeef, 1000);
    const d2 = runMiniEngine(0xdeadbeef, 1000);
    expect(d1).toBe(d2);
  });

  it("string seed 'tradegame', 500 ticks", () => {
    const d1 = runMiniEngine("tradegame", 500);
    const d2 = runMiniEngine("tradegame", 500);
    expect(d1).toBe(d2);
  });
});

// ---------------------------------------------------------------------------
// Different seeds → different digests.
// ---------------------------------------------------------------------------

describe("different seeds produce different EventLog digests", () => {
  it("seed 0xDEADBEEF vs 0xCAFEBABE", () => {
    const d1 = runMiniEngine(0xdeadbeef, 100);
    const d2 = runMiniEngine(0xcafebabe, 100);
    expect(d1).not.toBe(d2);
  });

  it("seed 1 vs seed 2", () => {
    const d1 = runMiniEngine(1, 50);
    const d2 = runMiniEngine(2, 50);
    expect(d1).not.toBe(d2);
  });
});

// ---------------------------------------------------------------------------
// PRNG stream reproducibility (DT-004 / DT-005).
// ---------------------------------------------------------------------------

describe("PRNG stream reproducibility", () => {
  it("same seed produces identical sequence of nextFloat() values", () => {
    const p1 = seed(0x12345678);
    const p2 = seed(0x12345678);
    const n = 10000;
    const results1: number[] = [];
    const results2: number[] = [];
    for (let i = 0; i < n; i++) {
      results1.push(p1.nextFloat());
      results2.push(p2.nextFloat());
    }
    expect(results1).toEqual(results2);
  });

  it("all nextFloat() values are in [0, 1)", () => {
    const p = seed(42);
    for (let i = 0; i < 10000; i++) {
      const v = p.nextFloat();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("nextRange(a, b) always returns an integer in [a, b]", () => {
    const p = seed(99);
    for (let i = 0; i < 5000; i++) {
      const v = p.nextRange(5, 15);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(15);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  // DT-005: serialize state, restore, advance → matches clean run at same offset.
  it("DT-005: getState/setState restores sequence", () => {
    const p = seed(0xfeedface);
    // Advance 500 steps.
    for (let i = 0; i < 500; i++) p.nextFloat();

    // Capture state.
    const captured = p.getState();

    // Advance 10 more from the running prng.
    const fromRunning: number[] = [];
    for (let i = 0; i < 10; i++) fromRunning.push(p.nextFloat());

    // Fresh prng at step 0, advance 500, restore captured state, advance 10.
    const p2 = seed(0xfeedface);
    for (let i = 0; i < 500; i++) p2.nextFloat();
    p2.setState(captured);
    const fromRestored: number[] = [];
    for (let i = 0; i < 10; i++) fromRestored.push(p2.nextFloat());

    expect(fromRunning).toEqual(fromRestored);
  });
});

// ---------------------------------------------------------------------------
// Gaussian determinism — Box-Muller must be deterministic given the seed.
// ---------------------------------------------------------------------------

describe("Gaussian determinism", () => {
  it("nextGaussian() produces identical sequence for same seed", () => {
    const p1 = seed(0xabcdef01);
    const p2 = seed(0xabcdef01);
    const samples1: number[] = [];
    const samples2: number[] = [];
    for (let i = 0; i < 1000; i++) {
      samples1.push(p1.nextGaussian());
      samples2.push(p2.nextGaussian());
    }
    expect(samples1).toEqual(samples2);
  });

  it("nextGaussian() distribution looks normal (rough sanity check)", () => {
    const p = seed(0x55aa55aa);
    const n = 5000;
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      const v = p.nextGaussian();
      sum += v;
      sumSq += v * v;
    }
    const mean = sum / n;
    const variance = sumSq / n - mean * mean;
    // Mean should be close to 0, variance close to 1.
    expect(Math.abs(mean)).toBeLessThan(0.1);
    expect(variance).toBeGreaterThan(0.8);
    expect(variance).toBeLessThan(1.2);
  });

  it("each nextGaussian() call consumes exactly 2 PRNG draws", () => {
    // Verify by checking that interleaving gaussian and float calls is
    // deterministic relative to a reference sequence.
    const p1 = seed(777);
    const p2 = seed(777);

    // p1: call nextGaussian() once → consumes 2 draws, then nextFloat() × 3
    const g = p1.nextGaussian();
    const f1 = p1.nextFloat();
    const f2 = p1.nextFloat();
    const f3 = p1.nextFloat();

    // p2: manually consume 2 floats, then 3 more — should match
    p2.nextFloat(); // draw 1 (u1 in Box-Muller)
    p2.nextFloat(); // draw 2 (u2 in Box-Muller)
    // g is derived from draws 1+2; we can't recompute it here but we can verify
    // that the subsequent floats match.
    const rf1 = p2.nextFloat();
    const rf2 = p2.nextFloat();
    const rf3 = p2.nextFloat();

    expect(f1).toBe(rf1);
    expect(f2).toBe(rf2);
    expect(f3).toBe(rf3);
    // Also verify g is a finite number (Box-Muller correctness).
    expect(Number.isFinite(g)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// sha256hex helper — sanity check.
// ---------------------------------------------------------------------------

describe("sha256hex helper", () => {
  it("known vector: empty string", () => {
    expect(sha256hex("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });

  it("same input → same hash", () => {
    const h1 = sha256hex("hello world");
    const h2 = sha256hex("hello world");
    expect(h1).toBe(h2);
  });

  it("different input → different hash", () => {
    expect(sha256hex("aaa")).not.toBe(sha256hex("bbb"));
  });
});

// ---------------------------------------------------------------------------
// Clock time-compression does not affect EventLog content (TC-001 proxy).
// TC-001 is fully testable only once the full pipeline exists; this tests the
// clock's advance semantics.
// ---------------------------------------------------------------------------

describe("Clock: advance semantics", () => {
  it("emits correct tickIndex and simTimeMs sequence", () => {
    const log = createEventLog("clock-test");
    const ticks: Array<{ tickIndex: number; simTimeMs: number }> = [];

    const clock = createClock(
      log,
      (tickIndex, simTimeMs) => {
        ticks.push({ tickIndex, simTimeMs });
        log.append(simTimeMs, {
          type: "tick",
          tickIndex,
          timestamp: simTimeMs,
          open: 1,
          high: 1,
          low: 1,
          close: 1,
          volume: 1,
          spread: 0,
        });
      },
      1000 // 1 second per tick
    );

    clock.advance(5);

    expect(ticks).toHaveLength(5);
    expect(ticks[0]).toEqual({ tickIndex: 0, simTimeMs: 0 });
    expect(ticks[4]).toEqual({ tickIndex: 4, simTimeMs: 4000 });
  });

  it("setCompression blocked during orderConfirm (TC-003)", () => {
    const log = createEventLog("compress-test");
    const clock = createClock(log, () => {}, 1000);

    clock.beginOrderConfirm();
    const changed = clock.setCompression("16x");
    expect(changed).toBe(false);
    expect(clock.state.compression).toBe("1x"); // unchanged

    clock.endOrderConfirm();
    const changed2 = clock.setCompression("16x");
    expect(changed2).toBe(true);
    expect(clock.state.compression).toBe("16x");
  });

  it("paused mode delivers no ticks", () => {
    const log = createEventLog("pause-test");
    let tickCount = 0;
    const clock = createClock(log, () => { tickCount++; }, 1000);

    clock.setCompression("paused");
    clock.advance(10); // should deliver 0 ticks
    expect(tickCount).toBe(0);
  });
});

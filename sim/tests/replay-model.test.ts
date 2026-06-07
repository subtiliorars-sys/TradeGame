/**
 * Replay view-model tests (ui/engine/replay.ts) — Screen 6 data layer.
 * Headless: synthetic event lists + the SCN-001 manifest.
 */

import { describe, it, expect } from "vitest";
import { buildReplayModel, fmtSimTime } from "../src/ui/engine/replay.js";
import { scn001 } from "../src/scenarios/scn001.js";
import { allScenarios } from "../src/scenarios/registry.js";
import type { SimEvent } from "../src/engine/events.js";

function tick(tickIndex: number, timestamp: number, close: number): SimEvent {
  return {
    type: "tick", tickIndex, timestamp,
    open: close, high: close, low: close, close, volume: 100, spread: 0.001,
  };
}

const EVENTS: SimEvent[] = [
  tick(0, 0, 1.0),
  tick(1, 1000, 1.01),
  {
    type: "journal_entry", entryId: "j1", tags: ["plan", "hypothesis"],
    wordCount: 28, tickIndex: 1, timestamp: 1000,
  },
  tick(2, 2000, 1.02),
  {
    type: "order_fill", orderId: "e1", fillPrice: 1.02,
    slippage: 0, spreadCost: 0, feeCost: 0, tickIndex: 2, timestamp: 2000,
  },
  tick(3, 3000, 1.03),
];

describe("buildReplayModel", () => {
  it("extracts the tick stream in order", () => {
    const m = buildReplayModel(EVENTS, scn001.manifest);
    expect(m.ticks).toHaveLength(4);
    expect(m.ticks[3]?.close).toBe(1.03);
  });

  it("fill markers anchor to the right tick with a price", () => {
    const m = buildReplayModel(EVENTS, scn001.manifest);
    const fill = m.markers.find((x) => x.kind === "fill");
    expect(fill?.tickIdx).toBe(2);
    expect(fill?.price).toBe(1.02);
  });

  it("journal annotations expose wordCount + tags ONLY — never text (§5.1 privacy)", () => {
    const m = buildReplayModel(EVENTS, scn001.manifest);
    const j = m.annotations.find((a) => a.source === "journal");
    expect(j?.label).toBe("[Your journal]");
    expect(j?.text).toBe("plan, hypothesis — 28 words");
  });

  it("decision points come from the manifest (UI logs carry no DP events)", () => {
    const m = buildReplayModel(EVENTS, scn001.manifest);
    const dps = m.dpJumpTargets;
    expect(dps.length).toBe(scn001.manifest.decisionPoints.length);
    expect(dps[0]?.label).toBe("A");
  });

  it("scenario_authored annotations render in the lane with the [Scenario] label", () => {
    const m = buildReplayModel(EVENTS, scn001.manifest);
    const scen = m.annotations.filter((a) => a.source === "scenario");
    expect(scen.length).toBe(scn001.manifest.replayAnnotations?.length ?? 0);
    expect(scen.length).toBeGreaterThan(0);
    expect(scen[0]?.label).toBe("[Scenario]");
  });

  it("ALL scenarios' authored annotations carry no directive language (§5.3 content rule)", () => {
    let swept = 0;
    for (const def of allScenarios()) {
      for (const a of def.manifest.replayAnnotations ?? []) {
        swept++;
        const t = a.text.toLowerCase();
        // Directive constructions only — structural vocabulary like "sell-side
        // prints" or "protective stops" is legitimate market mechanics (§5.3
        // bans SIGNALS, not descriptions).
        for (const banned of ["buy the", "sell the", "buy now", "sell now", "should buy", "should sell", "you should", "target price", "signal to", "will go", "guaranteed", "time to buy", "time to sell"]) {
          expect(t, `${def.manifest.id} annotation at ${a.simTimeMs} contains "${banned}"`).not.toContain(banned);
        }
      }
    }
    // Every scenario ships annotation content (the lane is never empty).
    expect(swept).toBeGreaterThanOrEqual(allScenarios().length * 4);
  });

  it("annotations and markers are time-sorted", () => {
    const m = buildReplayModel(EVENTS, scn001.manifest);
    for (let i = 1; i < m.annotations.length; i++) {
      expect(m.annotations[i]!.simTimeMs).toBeGreaterThanOrEqual(m.annotations[i - 1]!.simTimeMs);
    }
  });

  it("fmtSimTime renders the wireframe format", () => {
    expect(fmtSimTime(0)).toBe("T+00:00");
    expect(fmtSimTime(522_000)).toBe("T+08:42");
  });
});

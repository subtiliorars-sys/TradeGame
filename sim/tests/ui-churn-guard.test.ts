/**
 * UX-W1 — guard against reintroducing chart/ticket object churn in TradingScene.
 * Static source check (no Phaser boot required).
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "ui", "scenes");

describe("UI object-churn guards (UX-W1)", () => {
  it("TradingScene chart axis labels use chartAxisLabel tag-and-destroy, not delayedCall leak", () => {
    const src = readFileSync(join(ROOT, "TradingScene.ts"), "utf8");
    expect(src).toContain('setData("chartAxisLabel", true)');
    expect(src).toContain('getData("chartAxisLabel")');
    expect(src).not.toMatch(/delayedCall\(0,\s*\(\)\s*=>\s*\{[^}]*priceTxt\.destroy/s);
  });

<<<<<<< HEAD
  it("TradingScene position panel uses positionEl tag-and-destroy", () => {
=======
  it("TradingScene position panel uses positionEl tag-and-destroy (no onEngineFill redraw leak)", () => {
>>>>>>> origin/main
    const src = readFileSync(join(ROOT, "TradingScene.ts"), "utf8");
    expect(src).toContain('setData("positionEl", true)');
    expect(src).toContain('getData("positionEl")');
    expect(src).not.toMatch(/onEngineFill[\s\S]{0,800}drawPositionPanel\(\)/);
  });
<<<<<<< HEAD
=======

  it("ReplayScene marker labels destroy all replayMarkerLabel objects before redraw", () => {
>>>>>>> origin/main
    const src = readFileSync(join(ROOT, "ReplayScene.ts"), "utf8");
    const destroyBlock = src.indexOf('getData("replayMarkerLabel")');
    const markerLoop = src.indexOf("for (const m of this.model.markers)");
    expect(destroyBlock).toBeGreaterThan(-1);
    expect(markerLoop).toBeGreaterThan(destroyBlock);
  });
});

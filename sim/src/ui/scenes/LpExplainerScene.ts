/**
 * LpExplainerScene — SCN-004's T-05 two-screen LP Position Panel explainer
 * (SCENARIOS_V1 UI beat: "LP Position Panel introduced with a mandatory
 * two-screen explainer (can be skipped on replay). Panel is always visible
 * once dismissed. No dismiss-and-hide option.").
 *
 * Two pages, advanced with NEXT then BEGIN. On a REPLAY session a SKIP
 * button appears (spec: skippable on replay only). Blocking overlay
 * (PolicyCardScene pattern); the sim is paused at session start anyway,
 * so no clock handling is needed — the scene just gates the first input.
 *
 * Pure introduction — no directives, no prediction language.
 */

import Phaser from "phaser";
import {
  C,
  CSS,
  panel,
  label,
  button,
  fillRect,
  strokeRect,
  hline,
} from "../engine/draw.js";

export interface LpExplainerData {
  /** Replay sessions may skip (spec). */
  isReplay: boolean;
  onDone: () => void;
}

const PAGES: string[][] = [
  [
    "THE LP POSITION PANEL — 1 of 2",
    "",
    "In this scenario you can deposit into a liquidity pool instead of",
    "holding the assets outright. The panel at the top-left tracks four",
    "numbers for as long as you are in the pool:",
    "",
    "  Pool value     — what your pool share is worth right now",
    "  HODL baseline  — what simply HOLDING the assets would be worth",
    "  Fees earned    — your cumulative share of pool trading fees",
    "  Net vs. HODL   — pool value + fees − HODL baseline",
    "",
    "The whole scenario lives in that last line.",
  ],
  [
    "THE LP POSITION PANEL — 2 of 2",
    "",
    "When the asset's price moves AWAY from your deposit price — in either",
    "direction — the pool automatically rebalances against you. The gap",
    "that opens between pool value and the HODL baseline is called",
    "impermanent loss (IL).",
    "",
    "Fees accumulate continuously and can outpace IL when volume is high",
    "and price is stable. Whether they DO is what the panel shows you —",
    "a reading, not a recommendation.",
    "",
    "The panel stays visible for the whole session once you begin.",
  ],
];

export class LpExplainerScene extends Phaser.Scene {
  private data2!: LpExplainerData;
  private page = 0;

  constructor() {
    super({ key: "LpExplainerScene" });
  }

  init(data: unknown): void {
    this.data2 = data as LpExplainerData;
    this.page = 0;
  }

  create(): void {
    this.redraw();
  }

  private redraw(): void {
    this.children.removeAll(true);
    const { width, height } = this.scale;

    const overlay = this.add.graphics();
    fillRect(overlay, 0, 0, width, height, C.BG, 0);
    overlay.setAlpha(0.84);
    this.add.zone(0, 0, width, height).setOrigin(0, 0).setInteractive(); // block

    const pw = 600;
    const ph = 380;
    const px = width / 2 - pw / 2;
    const py = height / 2 - ph / 2;
    const g = this.add.graphics();
    panel(g, px, py, pw, ph, 8);
    strokeRect(g, px, py, pw, 4, C.AMBER, 4, 2);

    const lines = PAGES[this.page] ?? [];
    lines.forEach((line, i) => {
      label(this, px + 22, py + 20 + i * 19, line, {
        fontSize: i === 0 ? "14px" : "12px",
        color: i === 0 ? CSS.AMBER : CSS.TEXT,
        fontStyle: i === 0 ? "bold" : "normal",
      });
    });
    hline(g, px + 16, py + 44, pw - 32);

    const isLast = this.page === PAGES.length - 1;
    button(
      this,
      width / 2 - 90,
      py + ph - 54,
      180,
      36,
      isLast ? "BEGIN" : "NEXT",
      () => {
        if (isLast) this.finish();
        else {
          this.page += 1;
          this.redraw();
        }
      },
      { fontSize: "12px" }
    );

    // Replay-only skip (spec: "can be skipped on replay").
    if (this.data2.isReplay) {
      button(
        this,
        px + pw - 130,
        py + 10,
        116,
        28,
        "SKIP (replay)",
        () => this.finish(),
        { fillColor: C.SURFACE, textColor: CSS.DIM, fontSize: "10px" }
      );
    }
  }

  private finish(): void {
    const done = this.data2.onDone;
    this.scene.stop("LpExplainerScene");
    done();
  }
}

/**
 * DrillDebriefScene — live-drill session debrief (LIVE_DRILL_ENGINE_BRIEF
 * §1/§3): the three predicate results with their teaching summaries,
 * pass/fail per predicate, never a number from the account.
 *
 * XP NOTE: the drill's authored XP is displayed as PENDING — the award
 * path is deliberately unwired until the drill-economy red-team clears it
 * (hard rail: red-team any XP-economy change before it pays). The pass
 * state is computed and shown honestly either way.
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
import type { LiveDrillDef } from "../../drills/liveCatalog.js";
import {
  evaluateDrawdownSurvival,
  type PredicateResult,
} from "../../drills/livePredicates.js";
import type { EventEnvelope } from "../../engine/events.js";

export interface DrillDebriefData {
  drill: LiveDrillDef;
  logEntries: readonly EventEnvelope[];
}

const PAD = 20;

export class DrillDebriefScene extends Phaser.Scene {
  private data2!: DrillDebriefData;

  constructor() {
    super({ key: "DrillDebriefScene" });
  }

  init(data: unknown): void {
    this.data2 = data as DrillDebriefData;
  }

  create(): void {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    fillRect(g, 0, 0, width, height, C.BG, 0);

    const { drill, logEntries } = this.data2;
    const evald = evaluateDrawdownSurvival(logEntries, drill.seed);

    // Header
    fillRect(g, 0, 0, width, 48, C.SURFACE, 0);
    hline(g, 0, 48, width, C.BORDER);
    label(this, PAD, 24, `DRILL DEBRIEF — ${drill.title}`, {
      fontSize: "15px",
      color: CSS.AMBER,
      fontStyle: "bold",
    }).setOrigin(0, 0.5);

    label(this, PAD, 64, evald.pass ? "SURVIVED — process held." : "NOT THIS TIME — the read-out below is the lesson.", {
      fontSize: "14px",
      color: evald.pass ? CSS.GREEN : CSS.AMBER,
      fontStyle: "bold",
    });

    let y = 96;
    for (const r of evald.results) {
      this.drawPredicate(g, r, y);
      y += 96;
    }

    // XP line — honest about the unwired state.
    label(
      this,
      PAD,
      y + 6,
      evald.pass
        ? `${drill.xp} XP authored for this drill — award PENDING the drill-economy review (your pass is recorded in this session's log).`
        : "No XP at stake on a miss — retry freely; the drill re-seeds the same inherited position.",
      { fontSize: "11px", color: CSS.DIM, fontStyle: "italic", wordWrap: { width: width - PAD * 2 } }
    );

    button(this, PAD, y + 44, 180, 38, "RETRY DRILL", () => {
      this.scene.start("TradingScene", { liveDrillId: drill.drillId });
    });
    button(this, PAD + 196, y + 44, 180, 38, "ALL DRILLS", () => {
      this.scene.start("DrillScene");
    }, { fillColor: C.SURFACE, textColor: CSS.AMBER });
    button(this, PAD + 392, y + 44, 180, 38, "MAIN MENU", () => {
      this.scene.start("MenuScene");
    }, { fillColor: C.SURFACE, textColor: CSS.DIM });

    // Footer
    fillRect(g, 0, height - 28, width, 28, C.SURFACE, 0);
    hline(g, 0, height - 28, width, C.BORDER);
    label(this, width / 2, height - 14, "Education, not financial advice. Simulated markets only. No signals, ever.", {
      fontSize: "11px",
      color: CSS.DIM,
      fontStyle: "italic",
    }).setOrigin(0.5, 0.5);
  }

  private drawPredicate(g: Phaser.GameObjects.Graphics, r: PredicateResult, y: number): void {
    const { width } = this.scale;
    panel(g, PAD, y, width - PAD * 2, 84, 4);
    strokeRect(g, PAD, y, width - PAD * 2, 84, r.pass ? C.GREEN : C.AMBER, 1, 4);
    label(this, PAD + 14, y + 10, `${r.pass ? "✓" : "✗"}  ${r.predicateId}`, {
      fontSize: "12px",
      color: r.pass ? CSS.GREEN : CSS.AMBER,
      fontStyle: "bold",
    });
    label(this, PAD + 14, y + 32, r.summary, {
      fontSize: "12px",
      color: CSS.TEXT,
      wordWrap: { width: width - PAD * 2 - 28 },
      lineSpacing: 3,
    });
  }
}

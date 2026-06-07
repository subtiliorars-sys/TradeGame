/**
 * IlCheckpointScene — SCN-004's DP-C full-screen checkpoint
 * (SCENARIOS_V1 UI beat: "Player must type an IL estimate before the
 * checkpoint unlocks. Actual IL shown after estimate is submitted — gap
 * displayed visually (player estimate vs actual).").
 *
 * The modal shows the LP position WITHOUT the actual IL figure, asks for the
 * player's estimate (%), then reveals actual + gap. On submit it emits a
 * journal_entry tagged "il_estimate" — the il_estimate_written metric (+25)
 * grades that the estimate was made, never how accurate it was (accuracy is
 * practice; the gap is the lesson, not a score).
 *
 * Blocking overlay (RiskModalScene/PolicyCardScene pattern). The sim is
 * paused by the launching scene; play resumes via the speed controls after
 * CONTINUE, mirroring the policy-card convention.
 */

import Phaser from "phaser";
import type { EventLog, SimClock } from "../../index.js";
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
import { ilGapView, type LpPanelView } from "../engine/lp.js";

export interface IlCheckpointData {
  /** Current LP panel view (the modal hides its IL figure until reveal). */
  view: LpPanelView;
  log: EventLog;
  clock: SimClock;
  onDone: () => void;
}

export class IlCheckpointScene extends Phaser.Scene {
  private data2!: IlCheckpointData;
  private estimateStr = "";
  private revealed = false;

  constructor() {
    super({ key: "IlCheckpointScene" });
  }

  init(data: unknown): void {
    this.data2 = data as IlCheckpointData;
    this.estimateStr = "";
    this.revealed = false;
  }

  create(): void {
    this.input.keyboard?.on("keydown", this.onKey, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off("keydown", this.onKey, this);
    });
    this.redraw();
  }

  private onKey(e: KeyboardEvent): void {
    if (this.revealed) return;
    if (e.key === "Enter") {
      this.submit();
      return;
    }
    if (e.key === "Backspace") {
      this.estimateStr = this.estimateStr.slice(0, -1);
    } else if (/^[0-9.]$/.test(e.key) && !(e.key === "." && this.estimateStr.includes("."))) {
      this.estimateStr += e.key;
    } else {
      return;
    }
    this.redraw();
  }

  private redraw(): void {
    this.children.removeAll(true);
    const { width, height } = this.scale;

    const overlay = this.add.graphics();
    fillRect(overlay, 0, 0, width, height, C.BG, 0);
    overlay.setAlpha(0.84);
    this.add.zone(0, 0, width, height).setOrigin(0, 0).setInteractive(); // block

    const pw = 620;
    const ph = 420;
    const px = width / 2 - pw / 2;
    const py = height / 2 - ph / 2;
    const g = this.add.graphics();
    panel(g, px, py, pw, ph, 8);
    strokeRect(g, px, py, pw, 4, C.AMBER, 4, 2);

    label(this, width / 2, py + 26, "CHECKPOINT — ESTIMATE YOUR IMPERMANENT LOSS", {
      fontSize: "15px",
      color: CSS.AMBER,
      fontStyle: "bold",
    }).setOrigin(0.5, 0.5);
    hline(g, px + 16, py + 42, pw - 32);

    const v = this.data2.view;
    const lines = [
      "Your LP position right now (IL hidden until you estimate):",
      `  Pool value:    ${v.snapshot.poolValue.toFixed(2)} USVC`,
      `  HODL baseline: ${v.snapshot.hodlBaseline.toFixed(2)} USVC`,
      `  Fees earned:   ${v.snapshot.feesEarned.toFixed(2)} USVC`,
      "",
      "Estimate the impermanent loss as a % of the HODL baseline.",
      "The reference: IL = 2√r/(1+r) − 1, where r = price ÷ deposit price.",
    ];
    lines.forEach((line, i) => {
      label(this, px + 18, py + 54 + i * 18, line, {
        fontSize: "12px",
        color: CSS.TEXT,
      });
    });

    if (!this.revealed) {
      label(this, px + 18, py + 196, "Your estimate (%):", { fontSize: "12px", color: CSS.DIM });
      fillRect(g, px + 18, py + 214, 160, 30, C.SURFACE, 3);
      strokeRect(g, px + 18, py + 214, 160, 30, C.AMBER, 1, 3);
      label(this, px + 26, py + 229, this.estimateStr || " ", {
        fontSize: "14px",
        color: CSS.TEXT,
      }).setOrigin(0, 0.5);

      const canSubmit = this.estimateStr.trim() !== "";
      button(this, px + 196, py + 212, 170, 34, "SUBMIT ESTIMATE", () => {
        if (canSubmit) this.submit();
      }, { disabled: !canSubmit, fontSize: "12px" });

      label(
        this,
        px + 18,
        py + ph - 34,
        "The checkpoint unlocks after an estimate — comparing it to the actual is the lesson.",
        { fontSize: "10px", color: CSS.DIM, fontStyle: "italic" }
      );
    } else {
      const est = Number.parseFloat(this.estimateStr) || 0;
      const gap = ilGapView(est, v.snapshot.ilFraction);
      const rows = [
        `Your estimate:  ${est.toFixed(2)}%`,
        `Actual IL:      ${gap.actualPct.toFixed(2)}%`,
        `Gap:            ${gap.gapPts.toFixed(2)} points`,
      ];
      rows.forEach((r, i) => {
        label(this, px + 18, py + 200 + i * 20, r, {
          fontSize: "13px",
          color: i === 2 ? CSS.AMBER : CSS.TEXT,
          fontStyle: i === 2 ? "bold" : "normal",
        });
      });
      label(this, px + 18, py + 268, gap.line, {
        fontSize: "12px",
        color: CSS.TEXT,
        wordWrap: { width: pw - 36 },
      });
      label(
        this,
        px + 18,
        py + 304,
        `Net vs. HODL right now: ${v.snapshot.netVsHodl >= 0 ? "+" : ""}${v.snapshot.netVsHodl.toFixed(2)} USVC — a data point, not a signal.`,
        { fontSize: "11px", color: CSS.DIM }
      );
      button(this, width / 2 - 90, py + ph - 52, 180, 36, "CONTINUE", () => {
        const done = this.data2.onDone;
        this.scene.stop("IlCheckpointScene");
        done();
      }, { fontSize: "12px" });
    }
  }

  private submit(): void {
    if (this.revealed || this.estimateStr.trim() === "") return;
    const { log, clock } = this.data2;
    // The journal that il_estimate_written (+25) grades: the estimate was
    // MADE at the checkpoint. Accuracy is never scored.
    log.append(clock.state.simTimeMs, {
      type: "journal_entry",
      entryId: `il-est-${clock.state.tickIndex}`,
      tags: ["il_estimate"],
      wordCount: 1, // a numeric estimate, honestly counted
      tickIndex: clock.state.tickIndex,
      timestamp: clock.state.simTimeMs,
    });
    this.revealed = true;
    this.redraw();
  }
}

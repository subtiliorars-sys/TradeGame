/**
 * DrillScene — drill selection + execution (DRILL_SYSTEM_BRIEF §1.2/§1.3/§7).
 *
 * Two views in one scene:
 *   SELECT — the wave-A catalog with tier/XP/completion state.
 *   RUN    — the active drill: labeled inputs (position sizing) or a
 *            structural stop-placement diagram + stop input, the
 *            ALWAYS-VISIBLE reference card, and after submit the full
 *            step-by-step rationale (shown on pass AND fail — the rationale
 *            is the teaching; anti-headcanon protocol §4).
 *
 * Honest-XP rails (enforced by drills/catalog.ts, surfaced here):
 *   - XP awards once per drill ID; repeat passes show "practice run — no XP".
 *   - RETRY re-rolls to the next parameter set (redo the math, don't
 *     memorize the answer). No time pressure anywhere.
 *   - Failure strips nothing and costs nothing (Trade Bots autopsy #2/#9).
 *
 * Education posture: no directive language; the footer persists.
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
import {
  DRILL_CATALOG,
  evaluatePositionSizing,
  evaluateStopPlacement,
  awardDrill,
  type DrillDef,
  type DrillResult,
  type PositionSizingParams,
  type StopPlacementParams,
} from "../../drills/catalog.js";
import * as ProgressStore from "../../engine/progress.js";

const PAD = 20;
const HEADER_H = 48;
const FOOTER_H = 28;

export class DrillScene extends Phaser.Scene {
  private view: "select" | "run" = "select";
  private active: DrillDef | null = null;
  /** Per-drill attempt counter — indexes the parameter set (re-roll on retry). */
  private attempts: Map<string, number> = new Map();
  private answerStr = "";
  private answerFocused = false;
  private result: DrillResult | null = null;
  private grantedXp: number | null = null;

  constructor() {
    super({ key: "DrillScene" });
  }

  init(): void {
    this.view = "select";
    this.active = null;
    this.answerStr = "";
    this.answerFocused = false;
    this.result = null;
    this.grantedXp = null;
  }

  create(): void {
    // Answer-field keyboard capture (digits + dot + backspace; Enter submits).
    this.input.keyboard?.on("keydown", this.onKey, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off("keydown", this.onKey, this);
    });
    this.redraw();
  }

  private onKey(e: KeyboardEvent): void {
    if (this.view !== "run" || !this.answerFocused || this.result !== null) return;
    if (e.key === "Enter") {
      this.submit();
      return;
    }
    if (e.key === "Backspace") {
      this.answerStr = this.answerStr.slice(0, -1);
    } else if (/^[0-9.]$/.test(e.key) && !(e.key === "." && this.answerStr.includes("."))) {
      this.answerStr += e.key;
    } else {
      return;
    }
    this.redraw();
  }

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  private redraw(): void {
    // Full-scene rebuild (drill flows are low-frequency; simplicity wins).
    this.children.removeAll(true);
    const { width, height } = this.scale;
    const g = this.add.graphics();
    fillRect(g, 0, 0, width, height, C.BG, 0);

    // Header
    fillRect(g, 0, 0, width, HEADER_H, C.SURFACE, 0);
    hline(g, 0, HEADER_H, width, C.BORDER);
    label(this, PAD, HEADER_H / 2, this.view === "select" ? "RISK DRILLS" : (this.active?.title ?? "DRILL"), {
      fontSize: "15px",
      color: CSS.AMBER,
      fontStyle: "bold",
    }).setOrigin(0, 0.5);
    button(
      this,
      width - 180,
      8,
      164,
      32,
      this.view === "select" ? "BACK TO MENU" : "ALL DRILLS",
      () => {
        if (this.view === "select") this.scene.start("MenuScene");
        else {
          this.view = "select";
          this.active = null;
          this.result = null;
          this.redraw();
        }
      },
      { fillColor: C.SURFACE, textColor: CSS.AMBER, fontSize: "11px" }
    );

    if (this.view === "select") this.drawSelect(g);
    else this.drawRun(g);

    // Footer
    fillRect(g, 0, height - FOOTER_H, width, FOOTER_H, C.SURFACE, 0);
    hline(g, 0, height - FOOTER_H, width, C.BORDER);
    label(
      this,
      width / 2,
      height - FOOTER_H / 2,
      "Education, not financial advice. Simulated markets only. No signals, ever.",
      { fontSize: "11px", color: CSS.DIM, fontStyle: "italic" }
    ).setOrigin(0.5, 0.5);
  }

  private drawSelect(g: Phaser.GameObjects.Graphics): void {
    const done = new Set(ProgressStore.completedDrillIds());
    let y = HEADER_H + PAD + 8;

    label(this, PAD, y, "Drills build the process habits the scenarios grade. " +
      "XP is awarded once per drill; repeats are free practice.", {
      fontSize: "12px",
      color: CSS.DIM,
    });
    y += 30;

    for (const d of DRILL_CATALOG) {
      const isDone = done.has(d.id);
      panel(g, PAD, y, 1240, 64, 4);
      label(this, PAD + 14, y + 12, d.title, {
        fontSize: "13px",
        color: CSS.TEXT,
        fontStyle: "bold",
      });
      label(
        this,
        PAD + 14,
        y + 34,
        `${d.tier}  ·  ${d.market === "all" ? "all markets" : d.market}  ·  ` +
          `${d.xp} XP${isDone ? "  ·  ✓ completed (practice runs: no XP)" : ""}`,
        { fontSize: "11px", color: isDone ? CSS.AMBER : CSS.DIM }
      );
      button(this, PAD + 1100, y + 14, 120, 34, isDone ? "PRACTICE" : "START", () => {
        this.active = d;
        this.view = "run";
        this.answerStr = "";
        this.answerFocused = true;
        this.result = null;
        this.grantedXp = null;
        this.redraw();
      });
      y += 76;
    }
  }

  private currentParams(): PositionSizingParams | StopPlacementParams {
    const d = this.active!;
    const attempt = this.attempts.get(d.id) ?? 0;
    const set = d.paramSets[attempt % d.paramSets.length];
    if (set === undefined) throw new Error(`drill ${d.id}: empty paramSets`);
    return set;
  }

  private drawRun(g: Phaser.GameObjects.Graphics): void {
    const d = this.active;
    if (d === null) return;
    const p = this.currentParams();
    let y = HEADER_H + PAD + 6;

    // Reference card — ALWAYS visible (applying a shown formula, §1.2).
    panel(g, PAD, y, 1240, 58, 4);
    strokeRect(g, PAD, y, 1240, 58, C.AMBER, 1, 4);
    label(this, PAD + 12, y + 8, "REFERENCE CARD — stays on screen; using it is the point", {
      fontSize: "10px",
      color: CSS.AMBER,
      fontStyle: "bold",
    });
    d.referenceCard.forEach((line, i) => {
      label(this, PAD + 12, y + 24 + i * 15, line, { fontSize: "11px", color: CSS.TEXT });
    });
    y += 70;

    if (d.kind === "position_sizing") {
      y = this.drawSizingProblem(g, p as PositionSizingParams, y);
    } else {
      y = this.drawStopProblem(g, p as StopPlacementParams, y);
    }

    // Answer field + submit (hidden once a result is showing).
    if (this.result === null) {
      label(this, PAD, y, d.kind === "position_sizing" ? "Your position size:" : "Your stop price:", {
        fontSize: "12px",
        color: CSS.DIM,
      });
      y += 18;
      fillRect(g, PAD, y, 220, 30, C.SURFACE, 3);
      strokeRect(g, PAD, y, 220, 30, this.answerFocused ? C.AMBER : C.BORDER, 1, 3);
      label(this, PAD + 8, y + 15, this.answerStr || " ", {
        fontSize: "14px",
        color: CSS.TEXT,
      }).setOrigin(0, 0.5);
      this.add
        .zone(PAD, y, 220, 30)
        .setOrigin(0, 0)
        .setInteractive()
        .on("pointerup", () => {
          this.answerFocused = true;
          this.redraw();
        });
      const canSubmit = this.answerStr.trim() !== "";
      button(this, PAD + 236, y - 2, 130, 34, "SUBMIT", () => {
        if (canSubmit) this.submit();
      }, { disabled: !canSubmit, fontSize: "12px" });
      label(this, PAD + 384, y + 15, "No time limit. Re-read the card freely.", {
        fontSize: "10px",
        color: CSS.DIM,
        fontStyle: "italic",
      }).setOrigin(0, 0.5);
    } else {
      this.drawResult(g, y);
    }
  }

  private drawSizingProblem(
    g: Phaser.GameObjects.Graphics,
    p: PositionSizingParams,
    y: number
  ): number {
    panel(g, PAD, y, 1240, 92, 4);
    label(this, PAD + 12, y + 8, "PROBLEM", { fontSize: "10px", color: CSS.DIM, fontStyle: "bold" });
    const rows: string[] = [
      `Sim account: $${p.account.toLocaleString()}`,
      `Your rule: ${p.riskPct}% risk per trade`,
    ];
    switch (p.stop.kind) {
      case "crypto":
        rows.push(`Entry price: ${p.stop.entryPrice} · Stop distance: ${p.stop.stopPct}% from entry`);
        break;
      case "stocks":
        rows.push(`Stop distance: $${p.stop.stopDollars} per share`);
        break;
      case "forex":
        rows.push(`Stop distance: ${p.stop.stopPips} pips · Pip value: $${p.stop.pipValuePerLot} per ${p.stop.lotLabel}`);
        break;
    }
    rows.forEach((r, i) => {
      label(this, PAD + 12, y + 26 + i * 18, r, { fontSize: "12px", color: CSS.TEXT });
    });
    return y + 104;
  }

  private drawStopProblem(
    g: Phaser.GameObjects.Graphics,
    p: StopPlacementParams,
    y: number
  ): number {
    panel(g, PAD, y, 1240, 150, 4);
    label(this, PAD + 12, y + 8, "STRUCTURE", { fontSize: "10px", color: CSS.DIM, fontStyle: "bold" });
    label(this, PAD + 12, y + 24, p.structureNote, {
      fontSize: "12px",
      color: CSS.TEXT,
      wordWrap: { width: 1200 },
    });

    // Simple structural diagram: entry line, key level, player's stop preview.
    const dx = PAD + 40;
    const dw = 1100;
    const top = y + 52;
    const dh = 80;
    const prices = [p.entryPrice, p.keyLevel, p.passZone.from, p.passZone.to];
    const stop = Number.parseFloat(this.answerStr);
    if (Number.isFinite(stop)) prices.push(stop);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padPx = 10;
    const yAt = (price: number): number =>
      top + padPx + (1 - (price - min) / Math.max(1e-9, max - min)) * (dh - padPx * 2);

    // Pass zone band.
    const zy1 = yAt(Math.max(p.passZone.from, p.passZone.to));
    const zy2 = yAt(Math.min(p.passZone.from, p.passZone.to));
    fillRect(g, dx, zy1, dw, Math.max(2, zy2 - zy1), 0x1d2b1d, 0);
    // Key level + entry lines.
    g.lineStyle(1, C.AMBER, 1);
    g.lineBetween(dx, yAt(p.keyLevel), dx + dw, yAt(p.keyLevel));
    g.lineStyle(1, C.BORDER, 1);
    g.lineBetween(dx, yAt(p.entryPrice), dx + dw, yAt(p.entryPrice));
    label(this, dx + dw + 8, yAt(p.keyLevel), `key ${p.keyLevel}`, { fontSize: "9px", color: CSS.AMBER }).setOrigin(0, 0.5);
    label(this, dx + dw + 8, yAt(p.entryPrice), `entry ${p.entryPrice} (${p.side})`, { fontSize: "9px", color: CSS.DIM }).setOrigin(0, 0.5);
    // Player stop preview.
    if (Number.isFinite(stop)) {
      g.lineStyle(1, C.RED, 1);
      g.lineBetween(dx, yAt(stop), dx + dw, yAt(stop));
      label(this, dx - 8, yAt(stop), `stop ${this.answerStr}`, { fontSize: "9px", color: CSS.RED }).setOrigin(1, 0.5);
    }
    return y + 162;
  }

  private drawResult(g: Phaser.GameObjects.Graphics, y: number): void {
    const r = this.result;
    const d = this.active;
    if (r === null || d === null) return;

    panel(g, PAD, y, 1240, 200, 4);
    strokeRect(g, PAD, y, 1240, 200, r.pass ? C.GREEN : C.AMBER, 1, 4);
    label(this, PAD + 12, y + 8, r.pass ? "PASS" : "NOT YET — walk the steps below", {
      fontSize: "13px",
      color: r.pass ? CSS.GREEN : CSS.AMBER,
      fontStyle: "bold",
    });
    label(this, PAD + 12, y + 28, `Correct: ${r.correctDisplay}`, {
      fontSize: "12px",
      color: CSS.TEXT,
    });
    r.explanation.forEach((line, i) => {
      label(this, PAD + 12, y + 50 + i * 16, line, {
        fontSize: "11px",
        color: CSS.TEXT,
        wordWrap: { width: 1200 },
      });
    });

    let by = y + 212;
    if (this.grantedXp !== null && this.grantedXp > 0) {
      label(this, PAD, by, `+${this.grantedXp} XP — drill completed (feeds rank gates and scenario prerequisites)`, {
        fontSize: "12px",
        color: CSS.AMBER,
        fontStyle: "bold",
      });
      by += 24;
    } else if (r.pass) {
      label(this, PAD, by, "Practice run — already completed, no additional XP (re-practice is free, always).", {
        fontSize: "11px",
        color: CSS.DIM,
        fontStyle: "italic",
      });
      by += 24;
    }

    button(this, PAD, by, 200, 36, r.pass ? "NEXT VARIANT" : "RETRY (new numbers)", () => {
      const id = d.id;
      this.attempts.set(id, (this.attempts.get(id) ?? 0) + 1);
      this.answerStr = "";
      this.answerFocused = true;
      this.result = null;
      this.grantedXp = null;
      this.redraw();
    });
    button(this, PAD + 216, by, 160, 36, "ALL DRILLS", () => {
      this.view = "select";
      this.active = null;
      this.result = null;
      this.redraw();
    }, { fillColor: C.SURFACE, textColor: CSS.AMBER });
  }

  // -------------------------------------------------------------------------

  private submit(): void {
    const d = this.active;
    if (d === null || this.result !== null) return;
    const answer = Number.parseFloat(this.answerStr);
    const p = this.currentParams();

    this.result =
      d.kind === "position_sizing"
        ? evaluatePositionSizing(p as PositionSizingParams, answer)
        : evaluateStopPlacement(p as StopPlacementParams, answer);

    // XP on pass — once per drill ID (catalog enforces; 0 on repeats).
    this.grantedXp = this.result.pass ? awardDrill(d) : null;
    this.redraw();
  }
}

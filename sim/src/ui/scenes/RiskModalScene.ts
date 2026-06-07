/**
 * RiskModalScene — Forex leverage risk display (wireframe Screen 2a).
 *
 * SIM_ENGINE_SPEC §3.4: mandatory risk display before any forex position is opened.
 * Non-dismissable until "I UNDERSTAND" is clicked → emits leverage_ack to the EventLog.
 *
 * This scene runs as an overlay ABOVE TradingScene (Phaser parallel scene pattern).
 * It is NOT reachable in SCN-001 (crypto) but is built and unit-renderable so it
 * can be activated for SCN-003 / SCN-006 (forex) without a new scene build.
 *
 * Launch: TradingScene calls:
 *   this.scene.launch("RiskModalScene", { riskData, log, clock });
 *
 * On "I UNDERSTAND": emits LeverageAckEvent to the EventLog, then shuts itself down.
 * On "Cancel": shuts down without emitting (order is also cancelled in TradingScene).
 *
 * The position details block (margin required, pip value, max loss at stop) is fed by
 * computeForexRisk() from src/orders/risk.ts — pure function, no side effects.
 *
 * Per spec: fires once per session at first forex order submission. Re-fires at the
 * start of each new scenario session (per-session acknowledgment, not one-time-ever).
 * In Phase 2 (no persistence), this is naturally correct — re-running the game
 * re-shows the modal.
 *
 * Cannot be bypassed by any configuration flag (§3.4).
 */

import Phaser from "phaser";
import { computeForexRisk, type ForexRiskInput } from "../../orders/risk.js";
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

// ---------------------------------------------------------------------------
// Scene data passed from TradingScene when launching this overlay
// ---------------------------------------------------------------------------

export interface RiskModalData {
  riskInput: ForexRiskInput;
  /** EventLog to receive the leverage_ack event. */
  log: EventLog;
  clock: SimClock;
  /** Called when player clicks "I UNDERSTAND". */
  onAck: () => void;
  /** Called when player clicks "Cancel". */
  onCancel: () => void;
}

export class RiskModalScene extends Phaser.Scene {
  constructor() {
    super({ key: "RiskModalScene" });
  }

  create(data: RiskModalData): void {
    this.drawModal(data);
  }

  private drawModal(data: RiskModalData): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Semi-transparent dark overlay over the entire screen
    const overlay = this.add.graphics();
    fillRect(overlay, 0, 0, width, height, C.BG, 0);
    overlay.setAlpha(0.78);

    // BLOCKING (§3.4): swallow all pointer input so nothing reaches the
    // TradingScene underneath while the modal is up. The modal's own buttons
    // are added after this zone, so they stay on top and remain clickable.
    this.add
      .zone(0, 0, width, height)
      .setOrigin(0, 0)
      .setInteractive();

    // Modal panel
    const pw = 580;
    const ph = 440;
    const px = cx - pw / 2;
    const py = cy - ph / 2;

    const panelG = this.add.graphics();
    panel(panelG, px, py, pw, ph, 8);
    // Extra amber top border to signal "read this"
    strokeRect(panelG, px, py, pw, 4, C.AMBER, 4, 2);

    // Heading
    label(this, cx, py + 28, "FOREX: LEVERAGE AND RISK", {
      fontSize: "18px",
      color: CSS.AMBER,
      fontStyle: "bold",
    }).setOrigin(0.5, 0.5);

    hline(panelG, px + 16, py + 44, pw - 32);

    // Body copy
    const bodyText =
      "You are about to open a position in a leveraged forex market.\n\n" +
      "Leverage amplifies both profits and losses.\n" +
      "You can lose more than you intended if your position moves against\n" +
      "you and your stop is not honored.\n\n" +
      "This is a practice environment.\n" +
      "Real forex trading involves real money and real risk.";

    label(this, px + 16, py + 56, bodyText, {
      fontSize: "13px",
      color: CSS.TEXT,
      lineSpacing: 4,
      wordWrap: { width: pw - 32 },
    });

    hline(panelG, px + 16, py + 180, pw - 32);

    // Position details block (from computeForexRisk)
    const risk = computeForexRisk(data.riskInput);
    let dy = py + 192;

    label(this, px + 16, dy, "Your position details:", {
      fontSize: "12px",
      color: CSS.DIM,
      fontStyle: "bold",
    });
    dy += 20;

    const detailLine = (k: string, v: string) => {
      label(this, px + 24, dy, k, { fontSize: "12px", color: CSS.DIM });
      label(this, px + 200, dy, v, { fontSize: "12px", color: CSS.TEXT });
      dy += 18;
    };

    detailLine("Leverage ratio:", `${data.riskInput.leverage}:1`);
    detailLine("Margin required:", `${risk.requiredMargin.toFixed(2)} USVC`);
    detailLine("Free margin after:", `${risk.freeMargin.toFixed(2)} USVC`);
    detailLine("Pip value:", `${risk.pipValueTotal.toFixed(2)} USVC/pip`);
    detailLine(
      "Pips to margin call:",
      risk.pipsToMarginCall !== null
        ? `${risk.pipsToMarginCall.toFixed(0)} pips`
        : "ALREADY IN MARGIN-CALL TERRITORY"
    );
    detailLine(
      "Pips to stop-out:",
      risk.pipsToStopOut !== null
        ? `${risk.pipsToStopOut.toFixed(0)} pips`
        : "ALREADY IN STOP-OUT TERRITORY"
    );

    if (risk.insufficientMargin) {
      label(this, px + 24, dy, "WARNING: Insufficient margin for this position size.", {
        fontSize: "12px",
        color: CSS.RED,
        fontStyle: "bold",
      });
      dy += 20;
    }

    hline(panelG, px + 16, dy + 6, pw - 32);
    dy += 16;

    // I UNDERSTAND button
    const iUnderstandW = pw - 32;
    const ib = button(
      this,
      px + 16,
      dy,
      iUnderstandW,
      44,
      "I UNDERSTAND — THIS IS A PRACTICE SESSION. PROCEED.",
      () => this.onAcknowledge(data),
      { fontSize: "12px" }
    );
    void ib;

    dy += 52;

    // Cancel button
    const cb = button(
      this,
      px + 16,
      dy,
      iUnderstandW,
      36,
      "Cancel — Return to Order Ticket",
      () => this.onCancel(data),
      { fillColor: C.SURFACE, textColor: CSS.DIM, fontSize: "12px" }
    );
    void cb;
  }

  private onAcknowledge(data: RiskModalData): void {
    // Emit leverage_ack to the EventLog (process metric: leverage_ack per §4.2).
    data.log.append(data.clock.state.simTimeMs, {
      type: "leverage_risk_acknowledged",
      tickIndex: data.clock.state.tickIndex,
      timestamp: data.clock.state.simTimeMs,
    });

    data.onAck();
    this.scene.stop();
  }

  private onCancel(data: RiskModalData): void {
    data.onCancel();
    this.scene.stop();
  }
}

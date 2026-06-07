/**
 * TradingScene — Screen 2: In-Scenario Trading Screen (wireframe Screen 2).
 *
 * Wall-clock / sim-clock boundary: this is the ONLY place real elapsed time
 * (Phaser delta) is converted to sim-ticks. The adapter drives clock.advance()
 * from Phaser's update() delta. All price data flows from the engine tick stream.
 *
 * Programmatic candlestick chart:
 *   Candles are aggregated from tick events at 60-tick (1-min sim) resolution.
 *   Chart is drawn as rects (up candle = GREEN, down = RED, wick lines).
 *   Last ~40 candles visible; scrolls leftward as new candles arrive.
 *
 * Order ticket:
 *   Market / Limit / Stop types. Size field. Stop price field (visually mandatory).
 *   SUBMIT ORDER disabled when stop price is blank (enforces stop_before_entry).
 *   Estimated fill panel (ask, slippage, spread, fee, you-pay) always visible.
 *
 * Fee+slippage teaching mechanic:
 *   After every fill, a fill confirmation panel appears for 3 seconds showing
 *   actual vs estimated fill, slippage, fee. The cost line is styled RED/AMBER
 *   to be visually unmissable. Auto-dismisses; click to dismiss early.
 *
 * Journal drawer:
 *   textarea-equivalent (Phaser DOM element if supported, else programmatic stub).
 *   Only wordCount + tags flow into the EventLog on save (privacy split).
 *   Comment below marks where real text storage would be wired in Tier B.
 *
 * Position panel: live account balance, open positions count, current price.
 *
 * Speed controls: PAUSE / 1x / 4x / 16x — wired to clock.setCompression().
 *   Disabled during order confirm per spec §1.3.
 *
 * Education footer: persistent at bottom.
 */

import Phaser from "phaser";
import { SessionAdapter, type PriceTick, type DebriefData } from "../engine/SessionAdapter.js";
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
import type { CompressionMode } from "../../engine/clock.js";
import type { EventLog, OrderFillEvent } from "../../engine/events.js";
import { scn001 } from "../../scenarios/scn001.js";

// Scenario duration — when the sim clock reaches this ms, the session auto-ends.
const SCENARIO_DURATION_MS = scn001.manifest.durationMs; // 3,000,000 ms (40 min)

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const PAD = 16;
const HEADER_H = 52;
const FOOTER_H = 28;
const CHART_W = 720;
const CHART_H = 340;
const SIDE_W = 1280 - CHART_W - PAD * 3; // right panel width
const CHART_X = PAD;
const CHART_Y = HEADER_H + PAD;
const SIDE_X = CHART_X + CHART_W + PAD;
const SIDE_Y = HEADER_H + PAD;

// Candle aggregation
const TICKS_PER_CANDLE = 60; // 1 sim-minute
const MAX_CANDLES = 42;

// Estimate-panel display constants (for the pre-order estimate preview only —
// the actual fill uses engine computeMarketFillCosts via SessionAdapter).
const EST_FEE_RATE = 0.0015;        // crypto taker fee (matching engine FEE_CRYPTO_TAKER)
const EST_BASE_SLIPPAGE_RATE = 0.0005; // 0.05% base slippage (matching engine BASE_SLIPPAGE.crypto)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  tickIndex: number;
}

interface OpenPosition {
  orderId: string;
  side: "buy" | "sell";
  quantity: number;
  entryPrice: number;
  stopPrice: number | null;
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export class TradingScene extends Phaser.Scene {
  private adapter!: SessionAdapter;

  // Chart data
  private candles: Candle[] = [];
  private pendingCandle: Partial<Candle> | null = null;
  private pendingTicks = 0;

  // Latest price
  private latestPrice = 0;
  private latestSpread = 0.008;
  private latestSigma = 0.02; // stub — real sigma comes from generator state

  // Order ticket state
  private orderType: "market" | "limit" | "stop" = "market";
  private orderSide: "buy" | "sell" = "buy";
  private orderQuantity = "";
  private orderStopPrice = "";
  private orderLimitPrice = "";
  private focusedField: "quantity" | "stop" | "limit" | null = null;

  // Position state
  private positions: OpenPosition[] = [];
  /** Order ID of a pending market order awaiting its fill event. */
  private pendingFillOrderId: string | null = null;

  // Journal
  private journalOpen = false;
  private journalText = "";
  private journalTags: Set<string> = new Set();
  private journalEntries: Array<{ wordCount: number; tags: string[]; simTimeMs: number }> = [];

  // Graphics objects (rebuilt on relevant state changes)
  private gStatic!: Phaser.GameObjects.Graphics;
  private gChart!: Phaser.GameObjects.Graphics;
  private gTicket!: Phaser.GameObjects.Graphics;
  private gFill!: Phaser.GameObjects.Graphics;
  private gJournal!: Phaser.GameObjects.Graphics;

  // Dynamic text refs
  private simTimeLbl!: Phaser.GameObjects.Text;
  private priceLbl!: Phaser.GameObjects.Text;
  private spreadLbl!: Phaser.GameObjects.Text;
  private balanceLbl!: Phaser.GameObjects.Text;
  private positionLbl!: Phaser.GameObjects.Text;
  private estimateLbl!: Phaser.GameObjects.Text;
  private compressionBtns: Array<{
    g: Phaser.GameObjects.Graphics;
    lbl: Phaser.GameObjects.Text;
    mode: CompressionMode;
  }> = [];

  // Fill confirm overlay
  private fillOverlay: Phaser.GameObjects.Container | null = null;
  private fillTimer: Phaser.Time.TimerEvent | null = null;

  // Speed button refs for disable-during-confirm
  private speedBtnRefs: Array<{
    g: Phaser.GameObjects.Graphics;
    lbl: Phaser.GameObjects.Text;
  }> = [];

  // Whether the END SESSION transition has already fired (prevent double-fire).
  private sessionEndFired = false;


  constructor() {
    super({ key: "TradingScene" });
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  create(): void {
    const { width, height } = this.scale;

    this.sessionEndFired = false;
    this.adapter = new SessionAdapter();
    this.adapter.setManifest(scn001.manifest);
    this.adapter.onTick((tick) => this.onSimTick(tick));
    this.adapter.onFill((fill) => this.onEngineFill(fill));
    this.adapter.onSessionEnd((data) => this.transitionToDebrief(data));

    this.gStatic = this.add.graphics();
    this.gChart = this.add.graphics();
    this.gTicket = this.add.graphics();
    this.gFill = this.add.graphics();
    this.gJournal = this.add.graphics();

    this.drawStaticShell();
    this.drawSpeedControls();
    this.drawOrderTicket();
    this.drawPositionPanel();
    this.drawEstimatePanel();

    // Set initial compression to paused so player must press a speed button
    this.adapter.setCompression("paused");
    this.updateSpeedButtonHighlight("paused");
  }

  override update(_time: number, delta: number): void {
    this.adapter.update(delta);
    this.updateSimTimeLabel();
    this.updatePriceLabels();
    this.updateEstimatePanel();
  }

  shutdown(): void {
    this.adapter.offTick(this.onSimTick.bind(this));
    this.adapter.offFill(this.onEngineFill.bind(this));
  }

  // -------------------------------------------------------------------------
  // Sim tick handler
  // -------------------------------------------------------------------------

  private onSimTick = (tick: PriceTick): void => {
    // Auto-end the session when scenario duration elapses.
    if (!this.sessionEndFired && tick.simTimeMs >= SCENARIO_DURATION_MS) {
      this.sessionEndFired = true;
      this.adapter.endSession();
      return; // endSession calls transitionToDebrief via onSessionEnd listener
    }

    this.latestPrice = tick.close;
    this.latestSpread = tick.spread;

    // Candle aggregation
    if (!this.pendingCandle) {
      this.pendingCandle = {
        open: tick.open,
        high: tick.high,
        low: tick.low,
        close: tick.close,
        volume: tick.volume,
        tickIndex: tick.tickIndex,
      };
      this.pendingTicks = 1;
    } else {
      if (tick.high > (this.pendingCandle.high ?? 0))
        this.pendingCandle.high = tick.high;
      if (tick.low < (this.pendingCandle.low ?? Infinity))
        this.pendingCandle.low = tick.low;
      this.pendingCandle.close = tick.close;
      this.pendingCandle.volume = (this.pendingCandle.volume ?? 0) + tick.volume;
      this.pendingTicks++;
    }

    if (this.pendingTicks >= TICKS_PER_CANDLE) {
      this.candles.push(this.pendingCandle as Candle);
      if (this.candles.length > MAX_CANDLES) this.candles.shift();
      this.pendingCandle = null;
      this.pendingTicks = 0;
    }

    this.redrawChart();
  };

  // -------------------------------------------------------------------------
  // Static shell (header, panel outlines, footer)
  // -------------------------------------------------------------------------

  private drawStaticShell(): void {
    const { width, height } = this.scale;
    const g = this.gStatic;
    g.clear();

    // Header background
    fillRect(g, 0, 0, width, HEADER_H, C.SURFACE, 0);
    hline(g, 0, HEADER_H, width, C.BORDER);

    // Scenario name
    label(this, PAD, HEADER_H / 2, "SCN-001: The HarborUSD Depegging", {
      fontSize: "14px",
      color: CSS.AMBER,
      fontStyle: "bold",
    }).setOrigin(0, 0.5);

    // Sim time (dynamic)
    this.simTimeLbl = label(this, 400, HEADER_H / 2, "Sim: T+00:00", {
      fontSize: "13px",
      color: CSS.DIM,
    }).setOrigin(0, 0.5);

    // Market label
    label(this, 560, HEADER_H / 2, "CRYPTO  ·  HarborUSD/USVC", {
      fontSize: "13px",
      color: CSS.DIM,
    }).setOrigin(0, 0.5);

    // Chart panel outline
    panel(g, CHART_X, CHART_Y, CHART_W, CHART_H, 4);

    // Right side panels
    panel(g, SIDE_X, SIDE_Y, SIDE_W, 160, 4); // position panel
    panel(g, SIDE_X, SIDE_Y + 168, SIDE_W, 380, 4); // order ticket

    // END SESSION button — player-triggered scenario end.
    // Positioned in the header, right-adjacent to the scenario label.
    const endBtn = button(
      this,
      870,
      8,
      108,
      34,
      "END SESSION",
      () => {
        if (!this.sessionEndFired) {
          this.sessionEndFired = true;
          this.adapter.endSession();
        }
      },
      {
        fillColor: C.SURFACE,
        textColor: CSS.RED,
        fontSize: "11px",
      }
    );
    void endBtn;

    // Speed button label
    label(this, 1040, HEADER_H / 2, "Speed:", {
      fontSize: "13px",
      color: CSS.DIM,
    }).setOrigin(0, 0.5);

    // Journal button (bottom bar)
    const journalBarY = height - FOOTER_H - 44;
    panel(g, 0, journalBarY, width, 44, 0);
    hline(g, 0, journalBarY, width, C.BORDER);

    const jb = button(
      this,
      PAD,
      journalBarY + 6,
      120,
      32,
      "JOURNAL (J)",
      () => this.toggleJournal(),
      { fillColor: C.SURFACE, textColor: CSS.AMBER, fontSize: "12px" }
    );
    void jb;

    // Keyboard shortcut for J
    this.input.keyboard?.on("keydown-J", () => this.toggleJournal());

    // Footer — education-not-advice (persistent per spec)
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

  // -------------------------------------------------------------------------
  // Speed controls
  // -------------------------------------------------------------------------

  private drawSpeedControls(): void {
    const modes: Array<{ label: string; mode: CompressionMode }> = [
      { label: "PAUSE", mode: "paused" },
      { label: "1x", mode: "1x" },
      { label: "4x", mode: "4x" },
      { label: "16x", mode: "16x" },
    ];

    let bx = 1090;
    const by = 8;
    const bw = 44;
    const bh = 36;
    const gap = 6;

    this.speedBtnRefs = [];

    for (const m of modes) {
      const g = this.add.graphics();
      const lbl = label(this, bx + bw / 2, by + bh / 2, m.label, {
        fontSize: "12px",
        color: CSS.BG,
        fontStyle: "bold",
      }).setOrigin(0.5, 0.5);

      const capturedG = g;
      const capturedBx = bx;
      const capturedMode = m.mode;
      const capturedW = bw;
      const capturedBy = by;
      const capturedH = bh;

      lbl.setInteractive({ useHandCursor: true });
      lbl.on("pointerup", () => {
        if (!this.adapter.clock.state.orderConfirmPending) {
          this.adapter.setCompression(capturedMode);
          this.updateSpeedButtonHighlight(capturedMode);
        }
      });

      this.speedBtnRefs.push({ g, lbl });
      fillRect(g, bx, by, bw, bh, C.BORDER, 4);

      bx += bw + gap;
    }

    this.updateSpeedButtonHighlight("paused");
  }

  private updateSpeedButtonHighlight(active: CompressionMode): void {
    const modes: CompressionMode[] = ["paused", "1x", "4x", "16x"];
    const labels = ["PAUSE", "1x", "4x", "16x"];
    let bx = 1090;
    const by = 8;
    const bw = 44;
    const bh = 36;
    const gap = 6;

    this.speedBtnRefs.forEach((ref, i) => {
      ref.g.clear();
      const isActive = modes[i] === active;
      fillRect(ref.g, bx, by, bw, bh, isActive ? C.AMBER : C.BORDER, 4);
      ref.lbl.setColor(isActive ? CSS.BG : CSS.DIM);
      bx += bw + gap;
    });
  }

  // -------------------------------------------------------------------------
  // Candlestick chart
  // -------------------------------------------------------------------------

  private redrawChart(): void {
    const g = this.gChart;
    g.clear();

    const all = [...this.candles];
    // Add pending (partial) candle as last item
    if (this.pendingCandle && this.pendingCandle.open !== undefined) {
      all.push(this.pendingCandle as Candle);
    }
    if (all.length === 0) return;

    const chartX = CHART_X + 4;
    const chartY = CHART_Y + 4;
    const chartW = CHART_W - 8;
    const chartH = CHART_H - 8;

    // Price range with padding
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (const c of all) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    }
    const range = maxPrice - minPrice || 0.001;
    const priceToY = (p: number): number =>
      chartY + chartH - ((p - minPrice) / range) * chartH;

    // Candle layout
    const candleW = Math.max(3, Math.floor(chartW / MAX_CANDLES) - 1);
    const startX = chartX + chartW - all.length * (candleW + 1);

    all.forEach((c, i) => {
      const cx = startX + i * (candleW + 1);
      const isUp = c.close >= c.open;
      const color = isUp ? C.GREEN : C.RED;

      const bodyTop = priceToY(Math.max(c.open, c.close));
      const bodyBot = priceToY(Math.min(c.open, c.close));
      const bodyH = Math.max(1, bodyBot - bodyTop);

      // Wick
      g.lineStyle(1, color, 0.7);
      g.beginPath();
      g.moveTo(cx + candleW / 2, priceToY(c.high));
      g.lineTo(cx + candleW / 2, priceToY(c.low));
      g.strokePath();

      // Body
      g.fillStyle(color, 1);
      g.fillRect(cx, bodyTop, candleW, bodyH);
    });

    // Current price line
    if (this.latestPrice > 0) {
      const py = priceToY(this.latestPrice);
      g.lineStyle(1, C.AMBER, 0.6);
      g.beginPath();
      g.moveTo(chartX, py);
      g.lineTo(chartX + chartW, py);
      g.strokePath();
    }

    // Price labels on y-axis (3 levels)
    for (let i = 0; i <= 2; i++) {
      const p = minPrice + (range * i) / 2;
      const py = priceToY(p);
      const priceTxt = this.add.text(
        chartX + chartW + 2,
        py,
        p.toFixed(4),
        { fontFamily: "monospace", fontSize: "10px", color: CSS.DIM }
      ).setOrigin(0, 0.5);
      // Destroy after one frame (chart redraws every tick that closes a candle)
      this.time.delayedCall(0, () => {
        if (priceTxt.active) priceTxt.destroy();
      });
    }
  }

  // -------------------------------------------------------------------------
  // Position panel
  // -------------------------------------------------------------------------

  private drawPositionPanel(): void {
    const g = this.gTicket;
    const px = SIDE_X + 8;
    let py = SIDE_Y + 12;

    label(this, px, py, "POSITION PANEL", {
      fontSize: "11px",
      color: CSS.DIM,
      fontStyle: "bold",
    });
    py += 20;

    this.balanceLbl = label(this, px, py, `Account: ${this.adapter.accountBalance.toFixed(2)} USVC`, {
      fontSize: "13px",
      color: CSS.TEXT,
    });
    py += 18;

    this.positionLbl = label(this, px, py, "Open positions: 0", {
      fontSize: "13px",
      color: CSS.TEXT,
    });
    py += 18;

    this.priceLbl = label(this, px, py, "HarborUSD/USVC  —", {
      fontSize: "13px",
      color: CSS.AMBER,
    });
    py += 18;

    this.spreadLbl = label(this, px, py, `Spread: ${this.latestSpread.toFixed(4)}`, {
      fontSize: "12px",
      color: CSS.DIM,
    });
  }

  // -------------------------------------------------------------------------
  // Order ticket
  // -------------------------------------------------------------------------

  private drawOrderTicket(): void {
    const g = this.gTicket;
    const px = SIDE_X + 8;
    const py0 = SIDE_Y + 168 + 10;
    let py = py0;

    label(this, px, py, "ORDER TICKET", {
      fontSize: "11px",
      color: CSS.DIM,
      fontStyle: "bold",
    });
    py += 20;

    label(this, px, py, "Instrument: HarborUSD/USVC", {
      fontSize: "12px",
      color: CSS.DIM,
    });
    py += 22;

    // Side: BUY / SELL
    label(this, px, py, "Side:", { fontSize: "12px", color: CSS.DIM });
    py += 18;
    const buyBtn = button(this, px, py, 80, 30, "BUY", () => this.setSide("buy"), {
      fillColor: this.orderSide === "buy" ? C.GREEN : C.BORDER,
      textColor: CSS.TEXT,
    });
    const sellBtn = button(this, px + 88, py, 80, 30, "SELL", () => this.setSide("sell"), {
      fillColor: this.orderSide === "sell" ? C.RED : C.BORDER,
      textColor: CSS.TEXT,
    });
    void buyBtn; void sellBtn;
    py += 38;

    // Quantity
    label(this, px, py, "Quantity:", { fontSize: "12px", color: CSS.DIM });
    py += 18;
    this.drawInputField(px, py, 168, "quantity", this.orderQuantity);
    py += 34;

    // Order type
    label(this, px, py, "Order type:", { fontSize: "12px", color: CSS.DIM });
    py += 18;
    const types: Array<"market" | "limit" | "stop"> = ["market", "limit", "stop"];
    types.forEach((t, i) => {
      const tb = button(this, px + i * 56, py, 52, 26, t.toUpperCase(), () => {
        this.orderType = t;
        this.drawOrderTicket();
      }, {
        fillColor: this.orderType === t ? C.AMBER : C.BORDER,
        textColor: this.orderType === t ? CSS.BG : CSS.DIM,
        fontSize: "10px",
      });
      void tb;
    });
    py += 34;

    // Limit price (only for limit/stop-limit)
    if (this.orderType === "limit") {
      label(this, px, py, "Limit price:", { fontSize: "12px", color: CSS.DIM });
      py += 18;
      this.drawInputField(px, py, 168, "limit", this.orderLimitPrice);
      py += 34;
    }

    // Stop price — always shown, visually mandatory (red outline if empty)
    label(this, px, py, "Stop price: (required)", {
      fontSize: "12px",
      color: this.orderStopPrice ? CSS.DIM : CSS.RED,
    });
    py += 18;
    this.drawInputField(px, py, 168, "stop", this.orderStopPrice, !this.orderStopPrice);
    py += 38;

    // SUBMIT ORDER — disabled if stop blank
    const canSubmit = this.orderStopPrice.trim() !== "" && this.orderQuantity.trim() !== "";
    const submitBtn = button(
      this,
      px,
      py,
      SIDE_W - 16,
      40,
      "SUBMIT ORDER",
      () => { if (canSubmit) this.submitOrder(); },
      { disabled: !canSubmit, fontSize: "13px" }
    );
    void submitBtn;

    if (!canSubmit) {
      label(this, px, py + 44, "Stop required before submit", {
        fontSize: "10px",
        color: CSS.RED,
        fontStyle: "italic",
      });
    }
  }

  private drawInputField(
    x: number,
    y: number,
    w: number,
    field: "quantity" | "stop" | "limit",
    value: string,
    highlight = false
  ): void {
    const g = this.gTicket;
    fillRect(g, x, y, w, 28, C.SURFACE, 3);
    strokeRect(g, x, y, w, 28, highlight ? C.RED : C.BORDER, 1, 3);

    const txt = label(this, x + 6, y + 14, value || " ", {
      fontSize: "13px",
      color: CSS.TEXT,
    }).setOrigin(0, 0.5);

    // Make it interactive — capture keyboard input when focused
    const zone = this.add.zone(x, y, w, 28).setOrigin(0, 0).setInteractive();
    zone.on("pointerup", () => {
      this.focusedField = field;
    });
  }

  // -------------------------------------------------------------------------
  // Estimated fill panel
  // -------------------------------------------------------------------------

  private drawEstimatePanel(): void {
    const g = this.gTicket;
    const px = SIDE_X + 8;
    const py0 = SIDE_Y + 168 + 258;

    panel(g, px, py0, SIDE_W - 16, 90, 4);
    label(this, px + 6, py0 + 8, "ESTIMATED FILL", {
      fontSize: "10px",
      color: CSS.DIM,
      fontStyle: "bold",
    });

    this.estimateLbl = label(this, px + 6, py0 + 24, "—", {
      fontSize: "12px",
      color: CSS.DIM,
      lineSpacing: 4,
    });
  }

  private updateEstimatePanel(): void {
    const price = this.latestPrice;
    if (price === 0 || !this.estimateLbl) return;

    const qty = parseFloat(this.orderQuantity) || 0;
    // Estimate only — actual fill comes from engine computeMarketFillCosts.
    const slippage = price * EST_BASE_SLIPPAGE_RATE;
    const fee = qty * price * EST_FEE_RATE;
    const ask = price + this.latestSpread / 2 + slippage;

    if (qty > 0) {
      this.estimateLbl.setText(
        `Ask: ${ask.toFixed(4)}   Slippage: +${slippage.toFixed(4)}\n` +
          `Spread: ${this.latestSpread.toFixed(4)}   Fee: ${(EST_FEE_RATE * 100).toFixed(2)}%\n` +
          `You pay: ${(ask + this.latestSpread / 2).toFixed(4)}   Fee cost: ${fee.toFixed(4)} USVC`
      );
      this.estimateLbl.setColor(CSS.AMBER);
    } else {
      this.estimateLbl.setText("Enter quantity to see estimate");
      this.estimateLbl.setColor(CSS.DIM);
    }
  }

  // -------------------------------------------------------------------------
  // Dynamic label updates (called each frame)
  // -------------------------------------------------------------------------

  private updateSimTimeLabel(): void {
    if (!this.simTimeLbl) return;
    const ms = this.adapter.clock.state.simTimeMs;
    const totalSec = Math.floor(ms / 1000);
    const mm = Math.floor(totalSec / 60).toString().padStart(2, "0");
    const ss = (totalSec % 60).toString().padStart(2, "0");
    this.simTimeLbl.setText(`Sim: T+${mm}:${ss}`);
  }

  private updatePriceLabels(): void {
    if (this.priceLbl && this.latestPrice > 0) {
      this.priceLbl.setText(`HarborUSD/USVC  ${this.latestPrice.toFixed(4)}`);
    }
    if (this.spreadLbl) {
      this.spreadLbl.setText(`Spread: ${this.latestSpread.toFixed(4)}`);
    }
    if (this.balanceLbl) {
      this.balanceLbl.setText(`Account: ${this.adapter.accountBalance.toFixed(2)} USVC`);
    }
    if (this.positionLbl) {
      this.positionLbl.setText(`Open positions: ${this.positions.length}`);
    }
  }

  // -------------------------------------------------------------------------
  // Order submission
  // -------------------------------------------------------------------------

  private setSide(side: "buy" | "sell"): void {
    this.orderSide = side;
    this.drawOrderTicket();
  }

  private submitOrder(): void {
    const qty = parseFloat(this.orderQuantity);
    const stop = parseFloat(this.orderStopPrice);
    if (!qty || !stop) return;

    // Block speed changes during confirm (§1.3 — disabled until fill arrives).
    this.adapter.clock.beginOrderConfirm();

    // Route through the engine OrderBook — fill math happens inside
    // computeMarketFillCosts (same path as the harness runner).
    // The fill event is delivered asynchronously via onEngineFill when the
    // next tick processes the order.
    this.pendingFillOrderId = this.adapter.submitOrder({
      side: this.orderSide,
      quantity: qty,
      stopPrice: stop,
      orderType: this.orderType === "limit" ? "limit" : "market",
      limitPrice: this.orderType === "limit"
        ? (parseFloat(this.orderLimitPrice) || null)
        : null,
    });

    // Reset ticket immediately.
    this.orderQuantity = "";
    this.orderStopPrice = "";
    this.orderLimitPrice = "";
    this.drawOrderTicket();
  }

  // -------------------------------------------------------------------------
  // Engine fill handler — receives FillEvent from the OrderBook (via adapter)
  // -------------------------------------------------------------------------

  private onEngineFill = (fill: OrderFillEvent): void => {
    // Only handle the most-recently submitted order from this UI session.
    if (this.pendingFillOrderId !== fill.orderId) return;
    this.pendingFillOrderId = null;

    const estimatedFill = this.latestPrice + this.latestSpread / 2;
    const stopPriceForPos = parseFloat(this.orderStopPrice) || null;

    // Record position using the engine's fill price.
    this.positions.push({
      orderId: fill.orderId,
      side: this.orderSide,
      quantity: fill.fillPrice > 0 ? 1 : 0, // qty tracked externally; stub for display
      entryPrice: fill.fillPrice,
      stopPrice: stopPriceForPos,
    });

    // Emit fill confirmation overlay (teaching mechanic — visually unmissable).
    this.showFillConfirm({
      orderId: fill.orderId,
      side: this.orderSide,
      qty: this.positions[this.positions.length - 1]?.quantity ?? 0,
      estimatedFill,
      actualFill: fill.fillPrice,
      slippage: fill.slippage,
      spreadCost: fill.spreadCost,
      feeCost: fill.feeCost,
    });
  };

  // -------------------------------------------------------------------------
  // Fill confirmation overlay (teaching mechanic — §3.2, visually unmissable)
  // -------------------------------------------------------------------------

  private showFillConfirm(fill: {
    orderId: string;
    side: string;
    qty: number;
    estimatedFill: number;
    actualFill: number;
    slippage: number;
    spreadCost: number;
    feeCost: number;
  }): void {
    if (this.fillOverlay) {
      this.fillOverlay.destroy();
      this.fillOverlay = null;
    }
    if (this.fillTimer) {
      this.fillTimer.remove();
      this.fillTimer = null;
    }

    const { width, height } = this.scale;
    const pw = 400;
    const ph = 200;
    const px = (width - pw) / 2;
    const py = (height - ph) / 2;

    const container = this.add.container(0, 0);

    const bg = this.add.graphics();
    fillRect(bg, px, py, pw, ph, C.SURFACE, 8);
    strokeRect(bg, px, py, pw, ph, C.AMBER, 2, 8);
    container.add(bg);

    const addText = (x: number, y: number, text: string, color: string = CSS.TEXT, size = "13px") => {
      const t = this.add.text(x, y, text, {
        fontFamily: "monospace",
        fontSize: size,
        color,
      });
      container.add(t);
      return t;
    };

    addText(px + 12, py + 10, "FILL CONFIRMED", CSS.AMBER, "14px");
    addText(px + 12, py + 32, `Order: ${fill.orderId}  ${fill.side.toUpperCase()}  ${fill.qty} units`);
    addText(px + 12, py + 52, `Estimated fill:  ${fill.estimatedFill.toFixed(4)}`);
    addText(px + 12, py + 68, `Actual fill:     ${fill.actualFill.toFixed(4)}`);

    // Cost lines — RED/AMBER for visual emphasis (teaching mechanic)
    addText(
      px + 12,
      py + 88,
      `Slippage cost:   ${fill.slippage.toFixed(4)}  (${(fill.slippage / fill.actualFill * 100).toFixed(3)}%)`,
      CSS.RED
    );
    addText(
      px + 12,
      py + 104,
      `Spread cost:     ${fill.spreadCost.toFixed(4)} USVC`,
      CSS.RED
    );
    addText(
      px + 12,
      py + 120,
      `Fee:             ${fill.feeCost.toFixed(4)} USVC`,
      CSS.RED
    );
    addText(
      px + 12,
      py + 140,
      `Total cost:      ${(fill.slippage * fill.qty + fill.spreadCost + fill.feeCost).toFixed(4)} USVC`,
      CSS.AMBER,
      "14px"
    );

    addText(px + pw - 80, py + 168, "[click to dismiss]", CSS.DIM, "11px");

    container.setInteractive(
      new Phaser.Geom.Rectangle(px, py, pw, ph),
      Phaser.Geom.Rectangle.Contains
    );
    container.on("pointerup", () => this.dismissFillOverlay());

    this.fillOverlay = container;

    // Auto-dismiss after 3 seconds (spec SG-02 — 3s auto-dismiss, non-blocking)
    this.fillTimer = this.time.delayedCall(3000, () => this.dismissFillOverlay());
  }

  private dismissFillOverlay(): void {
    if (this.fillOverlay) {
      this.fillOverlay.destroy();
      this.fillOverlay = null;
    }
    if (this.fillTimer) {
      this.fillTimer.remove();
      this.fillTimer = null;
    }
    this.adapter.clock.endOrderConfirm();
  }

  // -------------------------------------------------------------------------
  // Journal drawer
  // -------------------------------------------------------------------------

  private toggleJournal(): void {
    this.journalOpen = !this.journalOpen;
    this.redrawJournal();
  }

  private redrawJournal(): void {
    const g = this.gJournal;
    g.clear();

    // Remove old journal objects from previous draw
    this.children.list
      .filter((c) => c.getData("journalEl") === true)
      .forEach((c) => c.destroy());

    if (!this.journalOpen) return;

    const { width, height } = this.scale;
    const jw = 340;
    const jx = width - jw;
    const jy = HEADER_H;
    const jh = height - HEADER_H - FOOTER_H - 44;

    panel(g, jx, jy, jw, jh, 0);

    const addJ = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      o.setData("journalEl", true);
      return o;
    };

    addJ(label(this, jx + 12, jy + 12, "JOURNAL", {
      fontSize: "13px",
      color: CSS.AMBER,
      fontStyle: "bold",
    }));

    addJ(label(this, jx + 12, jy + 32, `Sim: ${this.simTimeLbl?.text ?? "—"}`, {
      fontSize: "11px",
      color: CSS.DIM,
    }));

    // Tags
    const tagsList = ["pre_trade", "hypothesis", "exit", "observation", "post_trade"];
    addJ(label(this, jx + 12, jy + 52, "Tags:", {
      fontSize: "11px",
      color: CSS.DIM,
    }));

    tagsList.forEach((tag, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const tx = jx + 12 + col * 108;
      const ty = jy + 68 + row * 22;
      const active = this.journalTags.has(tag);
      const t = addJ(label(this, tx, ty, `[${tag}]`, {
        fontSize: "10px",
        color: active ? CSS.AMBER : CSS.DIM,
      }));
      t.setInteractive({ useHandCursor: true });
      t.on("pointerup", () => {
        if (this.journalTags.has(tag)) this.journalTags.delete(tag);
        else this.journalTags.add(tag);
        this.redrawJournal();
      });
    });

    // Text area stub — Phaser lacks a native textarea; this is a placeholder.
    // In Tier B, wire this to a DOM overlay or the Phaser DOM plugin.
    // Journal TEXT is stored separately from the EventLog per §5.1 privacy design.
    // Only wordCount + tags flow into the EventLog on save.
    const taY = jy + 118;
    const taH = 140;
    fillRect(g, jx + 12, taY, jw - 24, taH, C.SURFACE, 4);
    strokeRect(g, jx + 12, taY, jw - 24, taH, C.BORDER, 1, 4);
    addJ(label(this, jx + 18, taY + 8, this.journalText || "(click keyboard to type)", {
      fontSize: "12px",
      color: this.journalText ? CSS.TEXT : CSS.DIM,
      wordWrap: { width: jw - 36 },
      lineSpacing: 3,
    }));

    // Keyboard capture for journal text when journal is open
    // (simplistic: captures all char keys when journal is open and stop/qty fields are not focused)
    const captureKey = this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
      if (!this.journalOpen) return;
      if (this.focusedField !== null) return;
      if (e.key === "Backspace") {
        this.journalText = this.journalText.slice(0, -1);
      } else if (e.key.length === 1) {
        this.journalText += e.key;
      }
      this.redrawJournal();
    });

    // SAVE ENTRY
    const saveBtn = button(
      this,
      jx + 12,
      taY + taH + 10,
      jw - 24,
      34,
      "SAVE ENTRY",
      () => this.saveJournalEntry()
    );
    // Tag the bg/label GameObjects for journal cleanup
    saveBtn.bg.setData("journalEl", true);
    saveBtn.label.setData("journalEl", true);

    // Prior entries (wordCount + tags only — privacy split per §5.1)
    addJ(label(this, jx + 12, taY + taH + 52, "— Prior entries this session —", {
      fontSize: "10px",
      color: CSS.DIM,
    }));

    this.journalEntries.slice(-5).reverse().forEach((e, i) => {
      const simSec = Math.floor(e.simTimeMs / 1000);
      const mm = Math.floor(simSec / 60).toString().padStart(2, "0");
      const ss = (simSec % 60).toString().padStart(2, "0");
      addJ(label(
        this,
        jx + 12,
        taY + taH + 68 + i * 18,
        `T+${mm}:${ss}  [${e.tags.join(",")}]  ${e.wordCount} words`,
        { fontSize: "10px", color: CSS.DIM }
      ));
    });

    // Close button
    const closeBtn = button(
      this,
      jx + jw - 80,
      jy + 8,
      68,
      24,
      "[X]",
      () => this.toggleJournal(),
      { fillColor: C.SURFACE, textColor: CSS.DIM, fontSize: "11px" }
    );
    closeBtn.bg.setData("journalEl", true);
    closeBtn.label.setData("journalEl", true);
  }

  private saveJournalEntry(): void {
    const text = this.journalText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const tags = [...this.journalTags];

    // EventLog emission: wordCount + tags only.
    // Journal TEXT is NOT included in the EventLog per §5.1 privacy design.
    // In Tier B, journal text would be sent to server-side encrypted storage separately.
    this.adapter.log.append(this.adapter.clock.state.simTimeMs, {
      type: "journal_entry",
      entryId: `j-${Date.now()}`,
      tags,
      wordCount: words,
      tickIndex: this.adapter.clock.state.tickIndex,
      timestamp: this.adapter.clock.state.simTimeMs,
    });

    this.journalEntries.push({
      wordCount: words,
      tags,
      simTimeMs: this.adapter.clock.state.simTimeMs,
    });

    // Clear text and tags after save
    this.journalText = "";
    this.journalTags.clear();
    this.redrawJournal();
  }

  // -------------------------------------------------------------------------
  // Session end → Debrief transition
  // -------------------------------------------------------------------------

  /**
   * Called by the SessionAdapter's onSessionEnd listener when endSession()
   * completes. Transitions to DebriefScene, passing the DebriefData as init
   * data via Phaser's scene.start second argument.
   */
  private transitionToDebrief(data: DebriefData): void {
    this.adapter.offTick(this.onSimTick);
    this.adapter.offFill(this.onEngineFill);
    this.scene.start("DebriefScene", data);
  }

}

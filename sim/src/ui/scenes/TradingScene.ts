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
import type { ScenarioDef } from "../../scenarios/types.js";
import {
  shouldAutoPauseOnTabHide,
  shouldAutoResumeOnTabShow,
  shouldBlockResumeWhileHidden,
} from "../tabVisibility.js";
import { scn001 } from "../../scenarios/scn001.js";
import { getScenario } from "../../scenarios/registry.js";
import type { RiskModalData } from "./RiskModalScene.js";
import type { PolicyCardData } from "./PolicyCardScene.js";
import { depositFromFill, lpPanelView, type LpDeposit } from "../engine/lp.js";
import type { IlCheckpointData } from "./IlCheckpointScene.js";
import type { LpExplainerData } from "./LpExplainerScene.js";
import { getLiveDrill, type LiveDrillDef } from "../../drills/liveCatalog.js";
import type { DrillDebriefData } from "./DrillDebriefScene.js";

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

// Candle aggregation — candles target ~1 sim-minute regardless of tick size,
// so SCN-001 (1 s ticks) gets 60-tick candles and SCN-002/003 (30 s ticks)
// get 2-tick candles. Computed per scenario in create().
const CANDLE_SIM_MS = 60_000;
const MAX_CANDLES = 42;

// Estimate-panel display constants (for the pre-order estimate preview only —
// the actual fill uses engine computeMarketFillCosts via SessionAdapter).
// Per-market values match the engine constants in orders/book.ts.
const EST_FEE_RATE: Record<"crypto" | "stocks" | "forex", number> = {
  crypto: 0.0015,  // FEE_CRYPTO_TAKER
  stocks: 0.0,     // FEE_STOCKS (zero-commission model v1)
  forex: 0.0,      // FEE_FOREX (spread-only)
};
const EST_BASE_SLIPPAGE_RATE: Record<"crypto" | "stocks" | "forex", number> = {
  crypto: 0.0005,  // BASE_SLIPPAGE.crypto
  stocks: 0.0002,  // BASE_SLIPPAGE.stocks
  forex: 0.00003,  // BASE_SLIPPAGE.forex (~0.3 pips)
};

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

  // Active scenario (resolved from the registry via init data; scn001 default).
  private def: ScenarioDef = scn001;
  /** Ticks per ~1-sim-minute candle, derived from manifest.msPerTick. */
  private ticksPerCandle = 60;

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
  /** Declared account-risk % for size_compliance grading (§4.2). */
  private riskPctStr = "1.0";
  private focusedField: "quantity" | "stop" | "limit" | "risk" | null = null;

  // Forex leverage acknowledgment — once per session (re-fires each new
  // scenario session per spec §3.4 / wireframe Screen 2a interaction notes).
  private leverageAcked = false;

  // News Policy Card (scenarios with manifest.policyDeadlineMs — SCN-006)
  private policyCardShown = false;
  private policyDeclared = false;

  /** Non-null when this session runs a live drill (seeded micro-scenario). */
  private liveDrill: LiveDrillDef | null = null;

  /**
   * True when the active session is a drill (completionRoute === "drill_debrief"
   * OR liveDrill !== null). Set in init(); used to gate drill-specific logic
   * and route session-end to DrillDebriefScene instead of DebriefScene.
   * W1-5 (LIVE_DRILL_ENGINE_BRIEF §1.2).
   */
  private isDrillMode = false;

  /** Non-null when this session is a replay (set from DebriefScene init data). */
  private replayOfSessionId: string | null = null;

  /** Protective-stop orderId → entry orderId (stop-out bookkeeping, F1). */
  private stopIdToEntryId: Map<string, string> = new Map();

  // LP Position Panel (manifest.showLpPanel — SCN-004's IL Dashboard)
  private lpDeposit: LpDeposit | null = null;
  /** DP-C IL-estimate checkpoint fired (once per session). */
  private ilCheckpointShown = false;
  private lpWithdrawn = false;
  private lpFlipShown = false;
  private lpText: Phaser.GameObjects.Text | null = null;

  // Position state
  private positions: OpenPosition[] = [];
  /** Order ID of a pending market order awaiting its fill event. */
  private pendingFillOrderId: string | null = null;
  /** Stop price + quantity captured at submit (ticket clears immediately). */
  private pendingStopPrice: number | null = null;
  private pendingQty = 0;

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

  /** True when we paused solely because the browser tab hid. */
  private tabAutoPaused = false;
  /** Compression to restore after a tab auto-pause (never "paused"). */
  private compressionBeforeTabHide: CompressionMode = "1x";
  private onVisibilityChange = (): void => {
    if (this.sessionEndFired) return;
    const compression = this.adapter.compression;
    if (shouldAutoPauseOnTabHide(document.hidden, compression)) {
      this.compressionBeforeTabHide = compression;
      if (this.adapter.setCompression("paused")) {
        this.tabAutoPaused = true;
        this.updateSpeedButtonHighlight("paused");
      }
      return;
    }
    if (shouldAutoResumeOnTabShow(document.hidden, this.tabAutoPaused)) {
      const restored = this.compressionBeforeTabHide;
      if (this.adapter.setCompression(restored)) {
        this.tabAutoPaused = false;
        this.updateSpeedButtonHighlight(restored);
      }
    }
  };

  constructor() {
    super({ key: "TradingScene" });
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Receives { scenarioId } from MenuScene (or DebriefScene "Replay").
   * Unknown/absent IDs fall back to SCN-001.
   */
  init(data: unknown): void {
    let id = "SCN-001";
    this.replayOfSessionId = null;
    this.liveDrill = null;
    if (data && typeof data === "object") {
      if ("scenarioId" in data) {
        const v = (data as { scenarioId: unknown }).scenarioId;
        if (typeof v === "string") id = v;
      }
      // Set by DebriefScene's REPLAY button — the original session's ID.
      if ("replayOf" in data) {
        const r = (data as { replayOf: unknown }).replayOf;
        if (typeof r === "string") this.replayOfSessionId = r;
      }
      // Live-drill mode: the session runs a drill micro-scenario with a
      // seeded position; debrief routes to DrillDebriefScene.
      if ("liveDrillId" in data) {
        const d = (data as { liveDrillId: unknown }).liveDrillId;
        if (typeof d === "string") this.liveDrill = getLiveDrill(d) ?? null;
      }
    }
    this.def = this.liveDrill !== null ? this.liveDrill.scenario : (getScenario(id) ?? scn001);

    // W1-5: set isDrillMode when either (a) a liveDrill was resolved above, or
    // (b) a future DrillScenarioDef manifest signals completionRoute directly.
    // Cast is safe — ScenarioManifest does not carry completionRoute, so the
    // property access is undefined on non-drill manifests (no runtime error).
    const maybeRoute = (this.def.manifest as { completionRoute?: string }).completionRoute;
    this.isDrillMode = this.liveDrill !== null || maybeRoute === "drill_debrief";
  }

  /**
   * Phaser reuses scene instances across scene.start() calls, so every piece
   * of per-session mutable state must be reset here — otherwise a replay or a
   * second scenario would inherit the previous session's chart/positions.
   */
  private resetSessionState(): void {
    this.ticksPerCandle = Math.max(
      1,
      Math.round(CANDLE_SIM_MS / this.def.manifest.msPerTick)
    );
    this.candles = [];
    this.pendingCandle = null;
    this.pendingTicks = 0;
    this.latestPrice = 0;
    this.latestSpread = 0.008;
    this.orderType = "market";
    this.orderSide = "buy";
    this.orderQuantity = "";
    this.orderStopPrice = "";
    this.orderLimitPrice = "";
    this.riskPctStr = "1.0";
    this.focusedField = null;
    this.leverageAcked = false;
    this.policyCardShown = false;
    this.policyDeclared = false;
    this.positions = [];
    this.pendingFillOrderId = null;
    this.pendingStopPrice = null;
    this.pendingQty = 0;
    this.journalOpen = false;
    this.journalText = "";
    this.journalTags = new Set();
    this.journalEntries = [];
    this.stopIdToEntryId = new Map();
    this.lpDeposit = null;
    this.lpWithdrawn = false;
    this.ilCheckpointShown = false;
    this.lpFlipShown = false;
    this.lpText = null;
    this.fillOverlay = null;
    this.fillTimer = null;
    this.sessionEndFired = false;
    this.tabAutoPaused = false;
    this.compressionBeforeTabHide = "1x";
    // isDrillMode is set in init() before resetSessionState() is called from
    // create(); reset it here so a second scene.start() from a non-drill path
    // doesn't carry over a previous session's drill flag.
    this.isDrillMode = false;
  }

  create(): void {
    const { width, height } = this.scale;

    this.resetSessionState();
    const maybeRoute = (this.def.manifest as { completionRoute?: string }).completionRoute;
    this.isDrillMode = this.liveDrill !== null || maybeRoute === "drill_debrief";

    const drawdownSeed =
      this.liveDrill !== null && this.liveDrill.kind === "drawdown-survival"
        ? {
            entryOrderId: this.liveDrill.seed.entryOrderId,
            stopOrderId: this.liveDrill.seed.stopOrderId,
            side: this.liveDrill.seed.side,
            quantity: this.liveDrill.seed.quantity,
            fillPrice: this.liveDrill.seed.fillPrice,
            stopPrice: this.liveDrill.seed.stopPrice,
          }
        : undefined;

    this.adapter =
      drawdownSeed !== undefined
        ? new SessionAdapter(this.def, undefined, drawdownSeed)
        : new SessionAdapter(this.def);
    this.adapter.onTick((tick) => this.onSimTick(tick));
    this.adapter.onFill((fill) => this.onEngineFill(fill));
    this.adapter.onSessionEnd((data) => this.transitionToDebrief(data));

    // Replay marker (SIM_ENGINE_SPEC §5): a session launched via the debrief's
    // REPLAY button records replay_started — its own debrief then earns the
    // session_reviewed metric (+10, "re-review session later").
    if (this.replayOfSessionId !== null) {
      this.adapter.log.append(0, {
        type: "replay_started",
        originalSessionId: this.replayOfSessionId,
        tickIndex: 0,
        timestamp: 0,
      });
    }

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
    this.drawLpPanelShell();

    // Set initial compression to paused so player must press a speed button
    this.adapter.setCompression("paused");
    this.updateSpeedButtonHighlight("paused");

    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.events.once("shutdown", () => {
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
    });

    // Live-drill mode: drawdown drills seed position UI; all live drills
    // show a blocking briefing card before START.
    if (this.liveDrill !== null) {
      if (this.liveDrill.kind === "drawdown-survival") {
        const sd = this.liveDrill.seed;
        this.positions.push({
          orderId: sd.entryOrderId,
          side: sd.side,
          quantity: sd.quantity,
          entryPrice: sd.fillPrice,
          stopPrice: sd.stopPrice,
        });
        this.stopIdToEntryId.set(sd.stopOrderId, sd.entryOrderId);
      }
      this.drawDrillBriefing();
    }

    // T-05 LP-panel explainer (SCN-004 UI beat): mandatory two screens on
    // LP scenarios before first input; skippable on replay sessions only.
    // The sim is already paused at session start — the overlay just gates.
    if (this.def.manifest.showLpPanel) {
      const data: LpExplainerData = {
        isReplay: this.replayOfSessionId !== null,
        onDone: () => {
          // Player begins via the speed controls (session-start convention).
        },
      };
      this.scene.launch("LpExplainerScene", data);
    }
  }

  override update(_time: number, delta: number): void {
    this.adapter.update(delta);
    this.updateSimTimeLabel();
    this.updatePriceLabels();
    this.updateEstimatePanel();
  }

  shutdown(): void {
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.adapter.offTick(this.onSimTick.bind(this));
    this.adapter.offFill(this.onEngineFill.bind(this));
  }

  // -------------------------------------------------------------------------
  // Sim tick handler
  // -------------------------------------------------------------------------

  private onSimTick = (tick: PriceTick): void => {
    // Auto-end the session when scenario duration elapses.
    if (!this.sessionEndFired && tick.simTimeMs >= this.def.manifest.durationMs) {
      this.sessionEndFired = true;
      this.adapter.endSession();
      return; // endSession calls transitionToDebrief via onSessionEnd listener
    }

    // News Policy Card (SCN-006 pattern): on scenarios that author
    // policyDeadlineMs, present the card at the card decision point — the
    // latest decision point at or before the deadline (SCN-006: DP-A, T-05).
    if (
      !this.policyCardShown &&
      this.def.manifest.policyDeadlineMs !== undefined
    ) {
      const deadline = this.def.manifest.policyDeadlineMs;
      const cardDp = [...this.def.manifest.decisionPoints]
        .filter((dp) => dp.simTimeMs <= deadline)
        .sort((a, b) => b.simTimeMs - a.simTimeMs)[0];
      if (cardDp !== undefined && tick.simTimeMs >= cardDp.simTimeMs) {
        this.policyCardShown = true;
        this.showPolicyCard();
      }
    }

    this.latestPrice = tick.close;
    this.latestSpread = tick.spread;

    // LP Position Panel refresh (LP scenarios only; frozen after withdrawal).
    if (this.def.manifest.showLpPanel && !this.lpWithdrawn) {
      this.updateLpPanel(tick.simTimeMs);
    }

    // DP-C IL-estimate checkpoint (SCN-004 UI beat): fires once, only for
    // players still in the pool at the checkpoint (observation-only runs
    // earn their journal XP through patience instead).
    if (
      this.def.manifest.showLpPanel &&
      !this.ilCheckpointShown &&
      this.lpDeposit !== null &&
      !this.lpWithdrawn
    ) {
      const dpc = this.def.manifest.decisionPoints.find((d) => d.id === "DP-C");
      if (dpc !== undefined && tick.simTimeMs >= dpc.simTimeMs) {
        this.ilCheckpointShown = true;
        this.showIlCheckpoint(tick.simTimeMs);
      }
    }

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

    if (this.pendingTicks >= this.ticksPerCandle) {
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

    const m = this.def.manifest;

    // Scenario name (from the manifest — scenario-aware)
    label(this, PAD, HEADER_H / 2, `${m.id}: ${m.title}`, {
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
    label(this, 560, HEADER_H / 2, `${m.market.toUpperCase()}  ·  ${m.instrument.symbol}`, {
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

    // Keyboard shortcut for J — OPENS the journal only; while the journal is
    // open the J key types into the entry text like any other character
    // (close via the [X] button).
    this.input.keyboard?.on("keydown-J", () => {
      if (!this.journalOpen) this.toggleJournal();
    });

    // Keyboard capture for journal text when the journal is open.
    // Registered ONCE per scene create — registering inside redrawJournal()
    // would add a listener per redraw (each keystroke redraws → compounding
    // duplicate listeners → duplicated characters).
    // (simplistic: captures all char keys when journal is open and stop/qty
    // fields are not focused)
    this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
      // F7: overlay scenes own the keyboard while active.
      if (this.scene.isActive("PolicyCardScene") || this.scene.isActive("IlCheckpointScene") || this.scene.isActive("LpExplainerScene")) return;
      if (!this.journalOpen) return;
      if (this.focusedField !== null) return;
      if (e.key === "Backspace") {
        this.journalText = this.journalText.slice(0, -1);
      } else if (e.key.length === 1) {
        this.journalText += e.key;
      }
      this.redrawJournal();
    });

    // Keyboard capture for the order-ticket numeric fields (quantity / stop /
    // limit / risk %). Click a field to focus it; digits and "." edit it,
    // Backspace deletes, Enter/Escape blurs. Registered ONCE per scene create
    // (same listener-compounding rule as the journal handler above).
    this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
      // F7: overlay scenes own the keyboard while active.
      if (this.scene.isActive("PolicyCardScene") || this.scene.isActive("IlCheckpointScene") || this.scene.isActive("LpExplainerScene")) return;
      if (this.focusedField === null) return;
      if (e.key === "Enter" || e.key === "Escape") {
        this.focusedField = null;
        this.drawOrderTicket();
        return;
      }
      const edit = (v: string): string => {
        if (e.key === "Backspace") return v.slice(0, -1);
        if (/^[0-9.]$/.test(e.key) && !(e.key === "." && v.includes("."))) {
          return v + e.key;
        }
        return v;
      };
      switch (this.focusedField) {
        case "quantity": this.orderQuantity = edit(this.orderQuantity); break;
        case "stop":     this.orderStopPrice = edit(this.orderStopPrice); break;
        case "limit":    this.orderLimitPrice = edit(this.orderLimitPrice); break;
        case "risk": {
          this.riskPctStr = edit(this.riskPctStr);
          const pct = Number.parseFloat(this.riskPctStr);
          // Clamp into (0, 100]; invalid/blank falls back to the 1% default.
          this.adapter.declaredRiskPct =
            Number.isFinite(pct) && pct > 0 && pct <= 100 ? pct : 1;
          break;
        }
      }
      this.drawOrderTicket();
    });

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
        if (this.adapter.clock.state.orderConfirmPending) return;
        if (
          shouldBlockResumeWhileHidden(document.hidden) &&
          capturedMode !== "paused"
        ) {
          return;
        }
        if (this.adapter.setCompression(capturedMode)) {
          this.tabAutoPaused = false;
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

    // Price labels on y-axis (3 levels) — tag-and-destroy (UX-W1; same as ticket/journal)
    this.children.list
      .filter((c) => c.getData("chartAxisLabel") === true)
      .forEach((c) => c.destroy());

    for (let i = 0; i <= 2; i++) {
      const p = minPrice + (range * i) / 2;
      const py = priceToY(p);
      this.add.text(
        chartX + chartW + 2,
        py,
        p.toFixed(4),
        { fontFamily: "monospace", fontSize: "10px", color: CSS.DIM }
      )
        .setOrigin(0, 0.5)
        .setData("chartAxisLabel", true);
    }
  }

  // -------------------------------------------------------------------------
  // Position panel
  // -------------------------------------------------------------------------

  private drawPositionPanel(): void {
    // Tag-and-destroy — onEngineFill used to call this and leak Text objects (UX-W1).
    this.children.list
      .filter((c) => c.getData("positionEl") === true)
      .forEach((c) => c.destroy());

    const _before = this.children.list.length;
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

    this.positionLbl = label(this, px, py, `Open positions: ${this.positions.length}`, {
      fontSize: "13px",
      color: CSS.TEXT,
    });
    py += 18;

    this.priceLbl = label(this, px, py, `${this.def.manifest.instrument.symbol}  —`, {
      fontSize: "13px",
      color: CSS.AMBER,
    });
    py += 18;

    this.spreadLbl = label(this, px, py, `Spread: ${this.latestSpread.toFixed(4)}`, {
      fontSize: "12px",
      color: CSS.DIM,
    });

    for (let i = _before; i < this.children.list.length; i++) {
      this.children.list[i]?.setData("positionEl", true);
    }
  }

  // -------------------------------------------------------------------------
  // Order ticket
  // -------------------------------------------------------------------------

  private drawOrderTicket(): void {
    // Remove the previous draw's objects — this redraws per keystroke and
    // every label/button/zone created below was previously leaked (confirmed
    // object churn, consolidation finding; same tag-and-destroy pattern as
    // the journal drawer).
    this.children.list
      .filter((c) => c.getData("ticketEl") === true)
      .forEach((c) => c.destroy());

    const _before = this.children.list.length;
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

    label(this, px, py, `Instrument: ${this.def.manifest.instrument.symbol}`, {
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

    // Quantity + declared account-risk % (size_compliance grades vs this rule)
    label(this, px, py, "Quantity:", { fontSize: "12px", color: CSS.DIM });
    label(this, px + 88, py, "Risk %:", { fontSize: "12px", color: CSS.DIM });
    py += 18;
    this.drawInputField(px, py, 80, "quantity", this.orderQuantity);
    this.drawInputField(px + 88, py, 80, "risk", this.riskPctStr);
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
    // Tag everything this draw created (snapshot diff — robust against
    // multi-line creation calls) so the next draw can sweep it.
    for (let i = _before; i < this.children.list.length; i++) {
      this.children.list[i]?.setData("ticketEl", true);
    }
  }

  private drawInputField(
    x: number,
    y: number,
    w: number,
    field: "quantity" | "stop" | "limit" | "risk",
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

  /** Price display precision: 2 dp for stocks, 4 dp for crypto/forex. */
  private priceDecimals(): number {
    return this.def.manifest.market === "stocks" ? 2 : 4;
  }

  private updateEstimatePanel(): void {
    const price = this.latestPrice;
    if (price === 0 || !this.estimateLbl) return;

    const market = this.def.manifest.market;
    const feeRate = EST_FEE_RATE[market];
    const slipRate = EST_BASE_SLIPPAGE_RATE[market];
    const dp = this.priceDecimals();

    const qty = parseFloat(this.orderQuantity) || 0;
    // Estimate only — actual fill comes from engine computeMarketFillCosts.
    const slippage = price * slipRate;
    const fee = qty * price * feeRate;
    const ask = price + this.latestSpread / 2 + slippage;
    const feeLabel =
      feeRate > 0 ? `${(feeRate * 100).toFixed(2)}%` : "none (spread only)";

    if (qty > 0) {
      this.estimateLbl.setText(
        `Ask: ${ask.toFixed(dp)}   Slippage: +${slippage.toFixed(dp)}\n` +
          `Spread: ${this.latestSpread.toFixed(dp)}   Fee: ${feeLabel}\n` +
          `You pay: ${(ask + this.latestSpread / 2).toFixed(dp)}   Fee cost: ${fee.toFixed(4)} USVC`
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
      this.priceLbl.setText(
        `${this.def.manifest.instrument.symbol}  ${this.latestPrice.toFixed(this.priceDecimals())}`
      );
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

  // -------------------------------------------------------------------------
  // LP Position Panel (SCENARIOS_V1 SCN-004 "Core Mechanic: The IL Dashboard")
  // -------------------------------------------------------------------------

  /**
   * Static shell + text object for the LP panel, top-left of the chart.
   * Always visible on LP scenarios once shown (spec: "Panel is always
   * visible once dismissed. No dismiss-and-hide option."). Values update
   * per tick in updateLpPanel(). Display surface only — never scoring input.
   */
  private drawLpPanelShell(): void {
    if (!this.def.manifest.showLpPanel) return;
    const g = this.gStatic;
    const x = CHART_X + 8;
    const y = CHART_Y + 8;
    const w = 318;
    const h = 96;
    fillRect(g, x, y, w, h, C.SURFACE, 4);
    strokeRect(g, x, y, w, h, C.AMBER, 1, 4);
    label(this, x + 8, y + 6, "LP POSITION PANEL", {
      fontSize: "10px",
      color: CSS.AMBER,
      fontStyle: "bold",
    });
    this.lpText = label(this, x + 8, y + 22, "No deposit yet — observing.", {
      fontSize: "11px",
      color: CSS.DIM,
      lineSpacing: 3,
    });
  }

  /** Per-tick LP panel refresh + the one-time net-positive neutral marker. */
  private updateLpPanel(simTimeMs: number): void {
    if (this.lpText === null) return;

    const view = lpPanelView(this.lpDeposit, this.latestPrice, simTimeMs);
    if (view === null) {
      this.lpText.setText("No deposit yet — observing.");
      this.lpText.setColor(CSS.DIM);
      return;
    }

    const lines = [...view.lines];
    if (this.lpWithdrawn) lines.push("(withdrawn — final snapshot)");
    this.lpText.setText(lines.join("\n"));
    this.lpText.setColor(CSS.TEXT);

    // Spec T+72 beat: when net-vs-HODL first turns positive, a NEUTRAL
    // marker fires once: a data point, not a signal.
    if (view.netPositive && !this.lpFlipShown && !this.lpWithdrawn) {
      this.lpFlipShown = true;
      const { width, height } = this.scale;
      const note = label(
        this,
        width / 2,
        height - FOOTER_H - 84,
        "Net position vs. HODL is positive. This is a data point, not a signal.",
        { fontSize: "12px", color: CSS.DIM, fontStyle: "italic" }
      ).setOrigin(0.5, 0.5);
      this.time.delayedCall(6000, () => {
        if (note.active) note.destroy();
      });
    }
  }

  /**
   * True while trade entry is frozen for the news print: from the policy
   * deadline (T-01) until the report window opens. The freeze end derives
   * from the scenario's first no-entry window (the report time) rather than
   * a hardcoded offset (F10); 60s fallback when no window is authored.
   */
  private inNewsFreeze(): boolean {
    const deadline = this.def.manifest.policyDeadlineMs;
    if (deadline === undefined) return false;
    const freezeEnd =
      this.def.manifest.noEntryWindows?.[0]?.startMs ?? deadline + 60_000;
    const now = this.adapter.clock.state.simTimeMs;
    return now >= deadline && now < freezeEnd;
  }

  private submitOrder(): void {
    const qty = parseFloat(this.orderQuantity);
    const stop = parseFloat(this.orderStopPrice);
    if (!qty || !stop) return;

    // News-freeze window (SCENARIOS_V1 SCN-006 UI beat): trade entry is
    // disabled from the policy deadline (T-01) until the report prints.
    if (this.inNewsFreeze()) {
      this.showRejectNotice("news_freeze");
      return;
    }

    // Forex gate (SIM_ENGINE_SPEC §3.4 / wireframe Screen 2a): the blocking
    // leverage-risk modal fires at the FIRST forex order submission of the
    // session. The order proceeds only after "I UNDERSTAND" (which emits
    // leverage_risk_acknowledged to the EventLog). Cancel returns to the
    // ticket with all fields intact. Re-fires each new scenario session.
    if (this.def.manifest.market === "forex" && !this.leverageAcked) {
      this.showLeverageRiskModal(qty);
      return;
    }

    this.doSubmitOrder(qty, stop);
  }

  /** Actually route the order to the engine (after any forex ack gate). */
  private doSubmitOrder(qty: number, stop: number): void {
    // News-freeze re-check (F3): the leverage-modal ack path re-enters here
    // directly, and sim time keeps advancing under the modal — an order that
    // passed the gate in submitOrder() can land inside the freeze by the
    // time the player clicks "I UNDERSTAND".
    if (this.inNewsFreeze()) {
      this.showRejectNotice("news_freeze");
      return;
    }

    // Block speed changes during confirm (§1.3 — disabled until fill arrives).
    this.adapter.clock.beginOrderConfirm();

    // PROTECTIVE STOP IS A REAL ORDER (F1): the ticket's stop price becomes a
    // companion opposite-side stop order in the engine book, submitted BEFORE
    // the entry — the same shape the harness scripts use. This is what makes
    // stop_before_entry / stop_honored / no_stop_widen / policy option B
    // earnable in live play, lets the stop actually execute, and keeps the
    // reckless-winner stop leg alive.
    const stopSide = this.orderSide === "buy" ? "sell" : "buy";
    const stopOutcome = this.adapter.submitOrder({
      side: stopSide,
      quantity: qty,
      stopPrice: stop,
      orderType: "stop",
      leverageAckReceived: this.leverageAcked,
    });
    if (stopOutcome.rejectReason !== null) {
      this.adapter.clock.endOrderConfirm();
      this.showRejectNotice(stopOutcome.rejectReason);
      return;
    }

    // Route through the engine OrderBook — fill math happens inside
    // computeMarketFillCosts (same path as the harness runner).
    // The fill event is delivered asynchronously via onEngineFill when the
    // next tick processes the order.
    const outcome = this.adapter.submitOrder({
      side: this.orderSide,
      quantity: qty,
      stopPrice: null,
      orderType: this.orderType === "limit" ? "limit" : "market",
      limitPrice: this.orderType === "limit"
        ? (parseFloat(this.orderLimitPrice) || null)
        : null,
      leverageAckReceived: this.leverageAcked,
    });
    // Map the protective stop to this entry for stop-out bookkeeping.
    this.stopIdToEntryId.set(stopOutcome.orderId, outcome.orderId);

    if (outcome.rejectReason !== null) {
      // Order rejected at submit time (session closed, insufficient balance…).
      // Unlock the speed controls and show why; keep the ticket fields so the
      // player can correct and resubmit.
      this.adapter.clock.endOrderConfirm();
      this.showRejectNotice(outcome.rejectReason);
      return;
    }

    this.pendingFillOrderId = outcome.orderId;
    // Capture stop + qty now — the ticket fields are cleared below, but the
    // fill event arrives on a later tick (see onEngineFill).
    this.pendingStopPrice = stop;
    this.pendingQty = qty;

    // Reset ticket immediately.
    this.orderQuantity = "";
    this.orderStopPrice = "";
    this.orderLimitPrice = "";
    this.drawOrderTicket();
  }

  /**
   * Launch the blocking News Policy Card overlay (SCENARIOS_V1 SCN-006 core
   * mechanic). The sim pauses while the card is up; the card emits the
   * policy_declared event itself (policy_declared_card + policy_match read it).
   * Play stays paused after declaring — the player resumes via the speed
   * controls, mirroring the session-start convention.
   */
  private showPolicyCard(): void {
    // F4: a live fill-confirm overlay holds orderConfirmPending, which makes
    // setCompression("paused") silently fail — dismiss it (ends the confirm
    // lock) so the pause is guaranteed before the card opens.
    this.dismissFillOverlay();
    const paused = this.adapter.setCompression("paused");
    if (!paused) {
      // Defensive: release any stray confirm lock and retry.
      this.adapter.clock.endOrderConfirm();
      this.adapter.setCompression("paused");
    }
    this.updateSpeedButtonHighlight("paused");
    // F7: blur the order ticket so card rationale keystrokes don't edit the
    // quantity/stop/risk fields underneath.
    this.focusedField = null;
    const data: PolicyCardData = {
      scenarioId: this.def.manifest.id,
      hasOpenPosition: this.positions.length > 0,
      log: this.adapter.log,
      clock: this.adapter.clock,
      onDeclare: () => {
        this.policyDeclared = true;
      },
    };
    this.scene.launch("PolicyCardScene", data);
  }

  /**
   * Launch the DP-C IL-estimate checkpoint (SCN-004). Same overlay rules as
   * the policy card: dismiss any fill-confirm first (F4 — a live confirm
   * holds the orderConfirm lock and the pause silently fails), blur the
   * ticket (F7), pause; play resumes via the speed controls afterwards.
   */
  private showIlCheckpoint(simTimeMs: number): void {
    const view = lpPanelView(this.lpDeposit, this.latestPrice, simTimeMs);
    if (view === null) return;
    this.dismissFillOverlay();
    if (!this.adapter.setCompression("paused")) {
      this.adapter.clock.endOrderConfirm();
      this.adapter.setCompression("paused");
    }
    this.updateSpeedButtonHighlight("paused");
    this.focusedField = null;
    const data: IlCheckpointData = {
      view,
      log: this.adapter.log,
      clock: this.adapter.clock,
      onDone: () => {
        // Stay paused; the player resumes deliberately (policy-card convention).
      },
    };
    this.scene.launch("IlCheckpointScene", data);
  }

  /**
   * Launch the blocking forex leverage-risk modal (Screen 2a) as an overlay.
   * On acknowledge the modal emits leverage_risk_acknowledged to the EventLog
   * itself; we then mark the session acked and submit the held order.
   */
  private showLeverageRiskModal(qty: number): void {
    const summary = this.adapter.forexMarginSummary;
    const data: RiskModalData = {
      riskInput: {
        balance: this.adapter.accountBalance,
        existingUsedMargin: summary?.usedMargin ?? 0,
        lotUnits: qty,
        lots: 1,
        currentPrice: this.latestPrice > 0
          ? this.latestPrice
          : this.def.manifest.startPrice,
        leverage: this.adapter.leverage,
        existingUnrealizedPnl: 0,
      },
      log: this.adapter.log,
      clock: this.adapter.clock,
      onAck: () => {
        this.leverageAcked = true;
        // Re-read the ticket — fields are still intact (only cleared on submit).
        const heldQty = parseFloat(this.orderQuantity);
        const heldStop = parseFloat(this.orderStopPrice);
        if (heldQty && heldStop) this.doSubmitOrder(heldQty, heldStop);
      },
      onCancel: () => {
        // Return to the order ticket; nothing submitted, nothing logged.
      },
    };
    this.scene.launch("RiskModalScene", data);
  }

  /**
   * Surface a submit-time order reject (red notice above the footer;
   * auto-dismisses). Reasons map to plain teaching language.
   */
  private showRejectNotice(reason: string): void {
    const friendly: Record<string, string> = {
      leverage_ack_required: "Order rejected: acknowledge the leverage risk display first.",
      session_closed: "Order rejected: the market session is closed (market orders queue is not available).",
      insufficient_balance: "Order rejected: position size exceeds your account balance.",
      stop_limit_deferred: "Order rejected: stop-limit orders are not available in this version.",
      news_freeze: "Trade entry disabled during news print. Report window in progress.",
    };
    const text = friendly[reason] ?? `Order rejected: ${reason}`;

    const { width, height } = this.scale;
    const notice = label(this, width / 2, height - FOOTER_H - 60, text, {
      fontSize: "13px",
      color: CSS.RED,
      fontStyle: "bold",
    }).setOrigin(0.5, 0.5);

    this.time.delayedCall(4000, () => {
      if (notice.active) notice.destroy();
    });
  }

  // -------------------------------------------------------------------------
  // Engine fill handler — receives FillEvent from the OrderBook (via adapter)
  // -------------------------------------------------------------------------

  private onEngineFill = (fill: OrderFillEvent): void => {
    // Protective stop executed (F1): close the matching position and show a
    // distinct confirmation — the stop doing its job is a teaching moment,
    // not an error.
    const entryForStop = this.stopIdToEntryId.get(fill.orderId);
    if (entryForStop !== undefined) {
      this.stopIdToEntryId.delete(fill.orderId);
      const pos = this.positions.find((p) => p.orderId === entryForStop);
      this.positions = this.positions.filter((p) => p.orderId !== entryForStop);
      if (this.positionLbl) {
        this.positionLbl.setText(`Open positions: ${this.positions.length}`);
      }
      if (this.balanceLbl) {
        this.balanceLbl.setText(`Account: ${this.adapter.accountBalance.toFixed(2)} USVC`);
      }
      // LP scenarios: a triggered withdrawal trigger closes the deposit —
      // freeze the panel at the final snapshot.
      if (this.def.manifest.showLpPanel && this.lpDeposit !== null) {
        this.lpWithdrawn = true;
      }
      this.showFillConfirm({
        orderId: fill.orderId,
        side: `STOP ${pos?.side === "buy" ? "SELL" : "BUY"}`,
        qty: pos?.quantity ?? 0,
        estimatedFill: fill.fillPrice,
        actualFill: fill.fillPrice,
        slippage: fill.slippage,
        spreadCost: fill.spreadCost,
        feeCost: fill.feeCost,
      });
      return;
    }

    // Only handle the most-recently submitted order from this UI session.
    if (this.pendingFillOrderId !== fill.orderId) return;
    this.pendingFillOrderId = null;

    const estimatedFill = this.latestPrice + this.latestSpread / 2;
    // Stop + qty were captured at submit time (the ticket clears immediately
    // after submit, before the fill tick arrives).
    const stopPriceForPos = this.pendingStopPrice;
    const filledQty = this.pendingQty;
    this.pendingStopPrice = null;
    this.pendingQty = 0;

    // Record position using the engine's fill price.
    this.positions.push({
      orderId: fill.orderId,
      side: this.orderSide,
      quantity: filledQty,
      entryPrice: fill.fillPrice,
      stopPrice: stopPriceForPos,
    });

    // LP scenarios: the first entry fill IS the deposit (engine models the
    // LP position as spot — see scn004.ts LP MECHANICS NOTE).
    if (
      this.def.manifest.showLpPanel &&
      this.lpDeposit === null &&
      this.orderSide === "buy"
    ) {
      this.lpDeposit = depositFromFill(
        fill.fillPrice,
        filledQty,
        this.adapter.clock.state.simTimeMs
      );
    } else if (
      this.def.manifest.showLpPanel &&
      this.lpDeposit !== null &&
      this.orderSide === "sell"
    ) {
      // Manual withdrawal: freeze the panel at the final snapshot.
      this.lpWithdrawn = true;
    }

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

    // Tags — il_estimate / trigger_update are the SCN-004 LP-scenario
    // rubric tags (il_estimate_written, trigger_updated metrics).
    const tagsList = [
      "pre_trade",
      "hypothesis",
      "exit",
      "observation",
      "post_trade",
      "il_estimate",
      "trigger_update",
    ];
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
    // F6: an empty save is a click, not a journal — emit nothing.
    if (words === 0) return;
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
  /** One-shot blocking briefing card for live drills (premise + one rule). */
  private drawDrillBriefing(): void {
    const d = this.liveDrill;
    if (d === null) return;
    const { width, height } = this.scale;
    const isBlowup = d.kind === "blowup";
    const items: Phaser.GameObjects.GameObject[] = [];
    const overlay = this.add.graphics();
    fillRect(overlay, 0, 0, width, height, C.BG, 0);
    overlay.setAlpha(0.86);
    overlay.setDepth(50);
    items.push(overlay);
    const blocker = this.add.zone(0, 0, width, height).setOrigin(0, 0).setInteractive().setDepth(50);
    items.push(blocker);
    const g = this.add.graphics().setDepth(51);
    const pw = 620;
    const ph = isBlowup ? 360 : 330;
    const px = width / 2 - pw / 2;
    const py = height / 2 - ph / 2;
    panel(g, px, py, pw, ph, 8);
    strokeRect(g, px, py, pw, 4, C.AMBER, 4, 2);
    items.push(g);
    items.push(
      label(this, width / 2, py + 24, d.title.toUpperCase(), {
        fontSize: "15px",
        color: CSS.AMBER,
        fontStyle: "bold",
      }).setOrigin(0.5, 0.5).setDepth(51)
    );

    if (isBlowup) {
      items.push(
        label(this, width / 2, py + 48, "PRACTICE ACCOUNT — no real money involved", {
          fontSize: "12px",
          color: CSS.AMBER,
          fontStyle: "bold",
        }).setOrigin(0.5, 0.5).setDepth(51)
      );
    }

    const briefingStartY = isBlowup ? py + 72 : py + 52;
    d.briefing.forEach((line: string, i: number) => {
      items.push(
        label(this, px + 24, briefingStartY + i * 19, line, {
          fontSize: "12px",
          color: CSS.TEXT,
        }).setDepth(51)
      );
    });

    const frictionY = py + ph - (isBlowup ? 98 : 78);
    items.push(
      label(this, px + 24, frictionY,
        "This is a practice simulation. It is not financial advice and does not reflect real market conditions.",
        {
          fontSize: "10px",
          color: CSS.DIM,
          fontStyle: "italic",
          wordWrap: { width: pw - 48 },
        }
      ).setDepth(51)
    );

    let startBtn: ReturnType<typeof button> | null = null;
    const countdownLbl = isBlowup
      ? label(this, width / 2, py + ph - 62, "Starting in 5…", {
          fontSize: "11px",
          color: CSS.AMBER,
          fontStyle: "bold",
        }).setOrigin(0.5, 0.5).setDepth(51)
      : null;
    if (countdownLbl !== null) items.push(countdownLbl);

    const enableStart = (): void => {
      if (startBtn !== null) return;
      if (countdownLbl !== null) countdownLbl.destroy();
      startBtn = button(this, width / 2 - 90, py + ph - 54, 180, 38, "START", () => {
        for (const it of items) it.destroy();
        startBtn!.bg.destroy();
        startBtn!.label.destroy();
      }, { fontSize: "13px" });
      startBtn.bg.setDepth(51);
      startBtn.label.setDepth(52);
    };

    if (isBlowup) {
      // Non-dismissible 5-second practice-account reminder (DRILL_SYSTEM_BRIEF §1.5).
      let remaining = 5;
      this.time.addEvent({
        delay: 1000,
        repeat: 4,
        callback: () => {
          remaining -= 1;
          if (remaining > 0) {
            countdownLbl?.setText(`Starting in ${remaining}…`);
          } else {
            enableStart();
          }
        },
      });
    } else {
      enableStart();
    }
  }

  private transitionToDebrief(data: DebriefData): void {
    this.adapter.offTick(this.onSimTick);
    this.adapter.offFill(this.onEngineFill);
    // W1-5: isDrillMode gates drill-debrief routing.
    // Live-drill sessions (and future DrillScenarioDef sessions) debrief on
    // PREDICATES, not scenario metrics — the micro-manifest's empty rubric
    // means there's no scenario XP to account for (one-XP-book holds).
    if (this.isDrillMode && this.liveDrill !== null) {
      const drillData: DrillDebriefData = {
        drill: this.liveDrill,
        logEntries: this.adapter.log.entries,
      };
      this.scene.start("DrillDebriefScene", drillData);
      return;
    }
    // XP accounting happens in DebriefScene after completeDebrief() — the
    // debrief +30 is part of this session's total, so adding here would
    // either miss it or double-count it.
    this.scene.start("DebriefScene", data);
  }

}

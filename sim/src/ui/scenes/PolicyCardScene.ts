/**
 * PolicyCardScene — News-Event Policy Card (SCENARIOS_V1 §SCN-006, wireframe
 * "News Policy Card"; closes the top red-team live-play gap for the
 * policy_declared_card / policy_match metrics).
 *
 * Presented before a scheduled high-impact news release on scenarios that
 * author manifest.policyDeadlineMs. Full-screen, BLOCKING, and non-dismissable
 * until the player selects one of the three options AND writes a journal
 * rationale of at least MIN_RATIONALE_CHARS characters (spec UI beat: "cannot
 * be dismissed without selecting an option and writing a journal entry
 * (minimum 30 characters)").
 *
 * All three options are valid process; the card is NOT a signal. The debrief
 * grades (a) that a policy was declared before the deadline
 * (policy_declared_card) and (b) that behavior matched the declaration
 * (policy_match) — never direction or outcome.
 *
 * On DECLARE: emits a PolicyDeclaredEvent to the EventLog (option +
 * journalWordCount; rationale TEXT is NOT logged — §5.1 privacy split, same
 * rule as the journal drawer), then shuts itself down.
 *
 * Runs as an overlay ABOVE TradingScene (Phaser parallel scene pattern,
 * mirroring RiskModalScene). Launch:
 *   this.scene.launch("PolicyCardScene", { ...PolicyCardData });
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

// Spec UI beat: minimum 30 characters for the rationale. TUNABLE pending
// playtests (SCENARIOS_V1 "News Policy Card" TUNABLE note).
const MIN_RATIONALE_CHARS = 30;

export type PolicyOption = "A_flat" | "B_hold_with_stop" | "C_observe_only";

// ---------------------------------------------------------------------------
// Scene data passed from TradingScene when launching this overlay
// ---------------------------------------------------------------------------

export interface PolicyCardData {
  /** Scenario ID — used to derive the policyId logged with the declaration. */
  scenarioId: string;
  /** Whether the player currently holds an open position (conditional copy). */
  hasOpenPosition: boolean;
  /** EventLog to receive the policy_declared event. */
  log: EventLog;
  clock: SimClock;
  /** Called after the declaration event is logged. */
  onDeclare: (option: PolicyOption) => void;
}

interface OptionSpec {
  option: PolicyOption;
  key: "A" | "B" | "C";
  text: string;
}

const OPTIONS: OptionSpec[] = [
  {
    option: "A_flat",
    key: "A",
    text: "I will close all positions before the report and re-enter on confirmation.",
  },
  {
    option: "B_hold_with_stop",
    key: "B",
    text:
      "I will hold through the report; my position is sized for expected " +
      "volatility and my stop accounts for a spread blowout.",
  },
  {
    option: "C_observe_only",
    key: "C",
    text:
      "I will not trade through the report window and will resume " +
      "observation after the whipsaw resolves.",
  },
];

export class PolicyCardScene extends Phaser.Scene {
  private selected: PolicyOption | null = null;
  private rationale = "";
  private cardData!: PolicyCardData;
  private gCard!: Phaser.GameObjects.Graphics;
  private dynamicObjects: Phaser.GameObjects.GameObject[] = [];
  private noticeText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: "PolicyCardScene" });
  }

  create(data: PolicyCardData): void {
    this.cardData = data;
    this.selected = null;
    this.rationale = "";
    this.noticeText = null;

    const { width, height } = this.scale;

    // Semi-transparent dark overlay over the entire screen.
    const overlay = this.add.graphics();
    fillRect(overlay, 0, 0, width, height, C.BG, 0);
    overlay.setAlpha(0.82);

    // BLOCKING: swallow all pointer input so nothing reaches TradingScene.
    // Clicking the backdrop (an attempted dismiss) shows the spec message.
    this.add
      .zone(0, 0, width, height)
      .setOrigin(0, 0)
      .setInteractive()
      .on("pointerup", () => this.showDismissNotice());

    this.gCard = this.add.graphics();

    // Rationale keyboard capture — registered once per create.
    this.input.keyboard?.on("keydown", this.onKeyDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off("keydown", this.onKeyDown, this);
    });

    this.redraw();
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.key === "Backspace") {
      this.rationale = this.rationale.slice(0, -1);
    } else if (e.key.length === 1) {
      this.rationale += e.key;
    } else {
      return;
    }
    this.redraw();
  }

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  private redraw(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    const g = this.gCard;
    g.clear();
    for (const o of this.dynamicObjects) o.destroy();
    this.dynamicObjects = [];
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.dynamicObjects.push(o);
      return o;
    };

    const pw = 640;
    const ph = 520;
    const px = cx - pw / 2;
    const py = cy - ph / 2;

    panel(g, px, py, pw, ph, 8);
    strokeRect(g, px, py, pw, 4, C.AMBER, 4, 2);

    add(label(this, cx, py + 26, "NEWS POLICY CARD", {
      fontSize: "18px",
      color: CSS.AMBER,
      fontStyle: "bold",
    }).setOrigin(0.5, 0.5));

    hline(g, px + 16, py + 42, pw - 32);

    const intro =
      "The scheduled report releases shortly. " +
      (this.cardData.hasOpenPosition
        ? "You have an existing position."
        : "You have no existing position.") +
      "\nChoose one option and journal your reasoning. All three are valid process — " +
      "this card is a policy declaration, not a signal.";
    add(label(this, px + 16, py + 52, intro, {
      fontSize: "12px",
      color: CSS.TEXT,
      lineSpacing: 4,
      wordWrap: { width: pw - 32 },
    }));

    // Option rows
    let oy = py + 118;
    for (const spec of OPTIONS) {
      const isSel = this.selected === spec.option;
      const rowH = 54;
      fillRect(g, px + 16, oy, pw - 32, rowH, isSel ? C.AMBER : C.SURFACE, 4);
      strokeRect(g, px + 16, oy, pw - 32, rowH, isSel ? C.AMBER : C.BORDER, 1, 4);

      add(label(this, px + 28, oy + rowH / 2, `(${spec.key})`, {
        fontSize: "15px",
        color: isSel ? CSS.BG : CSS.AMBER,
        fontStyle: "bold",
      }).setOrigin(0, 0.5));

      add(label(this, px + 64, oy + rowH / 2, spec.text, {
        fontSize: "11px",
        color: isSel ? CSS.BG : CSS.TEXT,
        wordWrap: { width: pw - 96 },
        lineSpacing: 2,
      }).setOrigin(0, 0.5));

      const zone = add(
        this.add
          .zone(px + 16, oy, pw - 32, rowH)
          .setOrigin(0, 0)
          .setInteractive()
      );
      zone.on("pointerup", () => {
        this.selected = spec.option;
        this.redraw();
      });

      oy += rowH + 10;
    }

    // Rationale entry
    const taY = oy + 6;
    const taH = 64;
    add(label(this, px + 16, taY - 4, "Journal your reasoning (minimum 30 characters):", {
      fontSize: "11px",
      color: CSS.DIM,
    }));
    fillRect(g, px + 16, taY + 12, pw - 32, taH, C.SURFACE, 3);
    strokeRect(
      g,
      px + 16,
      taY + 12,
      pw - 32,
      taH,
      this.rationale.trim().length >= MIN_RATIONALE_CHARS ? C.BORDER : C.RED,
      1,
      3
    );
    add(label(this, px + 22, taY + 18, this.rationale || "Type your rationale…", {
      fontSize: "12px",
      color: this.rationale ? CSS.TEXT : CSS.DIM,
      wordWrap: { width: pw - 44 },
      lineSpacing: 3,
    }));
    add(label(
      this,
      px + 16,
      taY + 12 + taH + 6,
      `${this.rationale.trim().length}/${MIN_RATIONALE_CHARS} characters`,
      {
        fontSize: "10px",
        color:
          this.rationale.trim().length >= MIN_RATIONALE_CHARS ? CSS.DIM : CSS.RED,
        fontStyle: "italic",
      }
    ));

    // DECLARE button — enabled only with an option + sufficient rationale.
    const canDeclare =
      this.selected !== null &&
      this.rationale.trim().length >= MIN_RATIONALE_CHARS;
    const btn = button(
      this,
      cx - 130,
      py + ph - 54,
      260,
      38,
      "DECLARE POLICY",
      () => {
        if (canDeclare) this.declare();
      },
      { disabled: !canDeclare, fontSize: "13px" }
    );
    add(btn.bg);
    add(btn.label);

    // Dismiss-attempt notice slot (populated by showDismissNotice).
    this.noticeText = add(label(this, cx, py + ph - 12, "", {
      fontSize: "11px",
      color: CSS.RED,
      fontStyle: "italic",
    }).setOrigin(0.5, 0.5));
  }

  private showDismissNotice(): void {
    // Spec UI beat: "You must declare your news policy before the report
    // window opens."
    this.noticeText?.setText(
      "You must declare your news policy before the report window opens."
    );
  }

  // -------------------------------------------------------------------------
  // Declaration
  // -------------------------------------------------------------------------

  private declare(): void {
    if (this.selected === null) return;
    const { log, clock, scenarioId, onDeclare } = this.cardData;
    const words = this.rationale.trim()
      ? this.rationale.trim().split(/\s+/).length
      : 0;

    // EventLog emission: option + word count only — rationale TEXT is not
    // logged (§5.1 privacy split, same rule as the journal drawer).
    log.append(clock.state.simTimeMs, {
      type: "policy_declared",
      policyId: `${scenarioId.toLowerCase()}-card`,
      option: this.selected,
      journalWordCount: words,
      tickIndex: clock.state.tickIndex,
      timestamp: clock.state.simTimeMs,
    });

    const chosen = this.selected;
    this.scene.stop("PolicyCardScene");
    onDeclare(chosen);
  }
}

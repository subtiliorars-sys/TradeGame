/**
 * Replay view-model — Screen 6 (Replay Viewer) data layer.
 *
 * The stored EventLog is the canonical session record (SIM_ENGINE_SPEC §5.1):
 * the replay renders FROM the log — ticks, fills, journal markers — rather
 * than re-running the sim. Decision-point markers derive from the scenario
 * manifest (the UI session log does not carry decision_point events).
 *
 * Annotation lane (§5.3 / SG-06): three source types —
 *   scenario_authored — pre-vetted manifest.replayAnnotations (Phase 2 content)
 *   journal           — the player's entries, wordCount + tags ONLY (text is
 *                       private even to the owner in replay context, §5.1)
 *   decision_point    — manifest decision points
 * Coach annotations (user-generated) are post-v1.
 *
 * Pure module — no Phaser; headless-tested.
 */

import type { SimEvent, TickEvent } from "../../engine/events.js";
import type { ScenarioManifest } from "../../scenarios/types.js";

export interface ReplayMarker {
  tickIdx: number; // index into the ticks array (not engine tickIndex)
  simTimeMs: number;
  kind: "fill" | "journal" | "decision_point";
  /** Short chart label, e.g. "▲", "J", "A". */
  glyph: string;
  /** Fill price for fill markers (chart y-anchor); null otherwise. */
  price: number | null;
}

export interface AnnotationEntry {
  simTimeMs: number;
  source: "scenario" | "journal" | "decision_point";
  /** Lane label prefix per wireframe: [Scenario] / [Your journal] / [Decision Point X]. */
  label: string;
  text: string;
}

export interface ReplayModel {
  /** Tick events in session order — the playback stream. */
  ticks: TickEvent[];
  markers: ReplayMarker[];
  annotations: AnnotationEntry[];
  /** Decision-point jump targets: dp id → ticks-array index. */
  dpJumpTargets: Array<{ id: string; label: string; tickIdx: number }>;
}

/** Index of the last tick at or before simTimeMs (0 when before first tick). */
function tickIdxAt(ticks: TickEvent[], simTimeMs: number): number {
  let idx = 0;
  for (let i = 0; i < ticks.length; i++) {
    const t = ticks[i];
    if (t !== undefined && t.timestamp <= simTimeMs) idx = i;
    else break;
  }
  return idx;
}

export function buildReplayModel(
  events: readonly SimEvent[],
  manifest: ScenarioManifest
): ReplayModel {
  const ticks = events.filter((e): e is TickEvent => e.type === "tick");

  const markers: ReplayMarker[] = [];
  const annotations: AnnotationEntry[] = [];

  for (const e of events) {
    if (e.type === "order_fill") {
      markers.push({
        tickIdx: tickIdxAt(ticks, e.timestamp),
        simTimeMs: e.timestamp,
        kind: "fill",
        glyph: "◆",
        price: e.fillPrice,
      });
    } else if (e.type === "journal_entry") {
      markers.push({
        tickIdx: tickIdxAt(ticks, e.timestamp),
        simTimeMs: e.timestamp,
        kind: "journal",
        glyph: "J",
        price: null,
      });
      annotations.push({
        simTimeMs: e.timestamp,
        source: "journal",
        label: "[Your journal]",
        // §5.1 privacy: wordCount + tags only — never text, even to the owner.
        text: `${e.tags.length > 0 ? e.tags.join(", ") : "entry"} — ${e.wordCount} words`,
      });
    }
  }

  // Decision points from the manifest (UI logs carry no decision_point events).
  const dpJumpTargets: ReplayModel["dpJumpTargets"] = [];
  for (const dp of manifest.decisionPoints) {
    const idx = tickIdxAt(ticks, dp.simTimeMs);
    const letter = dp.id.replace(/^DP-/, "");
    markers.push({
      tickIdx: idx,
      simTimeMs: dp.simTimeMs,
      kind: "decision_point",
      glyph: letter,
      price: null,
    });
    annotations.push({
      simTimeMs: dp.simTimeMs,
      source: "decision_point",
      label: `[Decision Point ${letter}]`,
      text: dp.label.replace(/^Decision Point [A-Z] — /, ""),
    });
    dpJumpTargets.push({ id: dp.id, label: letter, tickIdx: idx });
  }

  // Pre-authored scenario annotations (scenario_authored — vetted at authoring
  // time per SG-06; bypass the runtime content filter).
  for (const a of manifest.replayAnnotations ?? []) {
    annotations.push({
      simTimeMs: a.simTimeMs,
      source: "scenario",
      label: "[Scenario]",
      text: a.text,
    });
  }

  annotations.sort((a, b) => a.simTimeMs - b.simTimeMs);
  markers.sort((a, b) => a.simTimeMs - b.simTimeMs);

  return { ticks, markers, annotations, dpJumpTargets };
}

/** Format sim-ms as the wireframe's T+MM:SS. */
export function fmtSimTime(simTimeMs: number): string {
  const s = Math.floor(simTimeMs / 1000);
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `T+${mm}:${ss}`;
}

/**
 * Wave B UI-engine tests — debrief completion, replay re-review flow, and the
 * rank-up marker. Headless through SessionAdapter + ProgressStore (no Phaser).
 *
 * The Phaser layer (DebriefScene/TradingScene) emits exactly these calls:
 *   - DebriefScene.create → SessionAdapter.lastSession.completeDebrief()
 *     → ProgressStore.addXp(refreshed.xpTotal)
 *   - REPLAY button → new session with a replay_started event at t0
 * These tests drive those emissions and assert the scoring/progress outcome.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { SessionAdapter } from "../src/ui/engine/SessionAdapter.js";
import { getScenario } from "../src/scenarios/registry.js";
import * as ProgressStore from "../src/engine/progress.js";

function makeAdapter(scenarioId = "SCN-001"): SessionAdapter {
  const def = getScenario(scenarioId);
  if (!def) throw new Error(`unknown scenario ${scenarioId}`);
  return new SessionAdapter(def);
}

beforeEach(() => {
  ProgressStore.reset();
});

// ---------------------------------------------------------------------------
// completeDebrief — the +30 belongs to the session being debriefed
// ---------------------------------------------------------------------------

describe("completeDebrief — debrief XP earnable in live play", () => {
  it("xpTotal grows by exactly the debrief row's +30 after completion", () => {
    const adapter = makeAdapter();
    adapter.clock.advance(3);
    adapter.log.append(adapter.clock.state.simTimeMs, {
      type: "journal_entry",
      entryId: "j-1",
      tags: ["observation"],
      wordCount: 12,
      tickIndex: adapter.clock.state.tickIndex,
      timestamp: adapter.clock.state.simTimeMs,
    });
    adapter.clock.advance(2);
    const before = adapter.endSession();
    const after = adapter.completeDebrief();
    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    expect((after?.xpTotal ?? 0) - (before?.xpTotal ?? 0)).toBe(30);
    const row = after?.rubricRows.find((r) => r.metricId === "debrief_completed");
    expect(row?.status).toBe("pass");
  });

  it("completeDebrief before endSession is a no-op (null)", () => {
    const adapter = makeAdapter();
    adapter.clock.advance(2);
    expect(adapter.completeDebrief()).toBeNull();
  });

  it("SessionAdapter.lastSession is set by endSession (DebriefScene handoff)", () => {
    const adapter = makeAdapter();
    adapter.clock.advance(2);
    adapter.endSession();
    expect(SessionAdapter.lastSession).toBe(adapter);
  });
});

// ---------------------------------------------------------------------------
// Replay flow — replay_started → session_reviewed in the replay's own debrief
// ---------------------------------------------------------------------------

describe("replay re-review flow — session_reviewed earned by the replay session", () => {
  it("a session with a replay_started marker earns session_reviewed (+10)", () => {
    // First (original) session.
    const original = makeAdapter();
    original.clock.advance(2);
    const originalDebrief = original.endSession();
    expect(originalDebrief).not.toBeNull();

    // Replay session — exactly what TradingScene does when launched with
    // { replayOf: originalSessionId }.
    const replay = makeAdapter();
    replay.log.append(0, {
      type: "replay_started",
      originalSessionId: originalDebrief?.sessionId ?? "",
      tickIndex: 0,
      timestamp: 0,
    });
    replay.clock.advance(2);
    replay.endSession();
    const replayDebrief = replay.completeDebrief();
    const row = replayDebrief?.rubricRows.find(
      (r) => r.metricId === "session_reviewed"
    );
    expect(row?.status).toBe("pass");
    expect(row?.xpEarned).toBe(10);
  });

  it("a session WITHOUT the marker does not earn session_reviewed", () => {
    const adapter = makeAdapter();
    adapter.clock.advance(2);
    adapter.endSession();
    const debrief = adapter.completeDebrief();
    const row = debrief?.rubricRows.find((r) => r.metricId === "session_reviewed");
    expect(row?.status).toBe("fail");
    expect(row?.xpEarned).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Rank-up marker (ProgressStore → DebriefScene congratulation card)
// ---------------------------------------------------------------------------

describe("ProgressStore rank-up marker (§4.5 congratulation card hook)", () => {
  it("crossing a threshold records lastRankUp; clearRankUp consumes it", () => {
    expect(ProgressStore.lastRankUp()).toBeNull();
    ProgressStore.addXp(150); // Observer (0) → still Observer (trainee at 200)
    expect(ProgressStore.lastRankUp()).toBeNull();
    ProgressStore.addXp(100); // 250 total → crosses Trainee (200)
    const up = ProgressStore.lastRankUp();
    expect(up?.from.rankId).toBe("observer");
    expect(up?.to.rankId).toBe("trainee");
    ProgressStore.clearRankUp();
    expect(ProgressStore.lastRankUp()).toBeNull();
  });

  it("additions within the same rank do not set the marker", () => {
    ProgressStore.addXp(250); // → trainee
    ProgressStore.clearRankUp();
    ProgressStore.addXp(50); // 300 — still trainee (practitioner at 800)
    expect(ProgressStore.lastRankUp()).toBeNull();
  });

  it("a single large addition records the boundary crossing once", () => {
    ProgressStore.addXp(900); // observer → practitioner in one add
    const up = ProgressStore.lastRankUp();
    expect(up?.from.rankId).toBe("observer");
    expect(up?.to.rankId).toBe("practitioner");
  });
});

// ---------------------------------------------------------------------------
// xp-parity red-team regressions (F1 ghost submit, F2 post-end freeze)
// ---------------------------------------------------------------------------

describe("F1: ghost submit cannot stack above the equal ceiling", () => {
  it("journal + rejected forex submit + end → patience path only, no journal_before_trade", () => {
    // Red-team probe B: SCN-003, submit without leverage ack → reject; the
    // submit stays in the log but nothing fills.
    const adapter = makeAdapter("SCN-003");
    adapter.clock.advance(3);
    adapter.log.append(adapter.clock.state.simTimeMs, {
      type: "journal_entry",
      entryId: "j-ghost",
      tags: ["observation"],
      wordCount: 12,
      tickIndex: adapter.clock.state.tickIndex,
      timestamp: adapter.clock.state.simTimeMs,
    });
    const outcome = adapter.submitOrder({ side: "buy", quantity: 75, stopPrice: 1.27 });
    expect(outcome.rejectReason).toBe("leverage_ack_required");
    adapter.clock.advance(2);
    adapter.endSession();
    const debrief = adapter.completeDebrief();
    const journalRow = debrief?.rubricRows.find((r) => r.metricId === "journal_before_trade");
    const patienceRow = debrief?.rubricRows.find((r) => r.metricId === "patience_observation");
    expect(journalRow?.status, "no fill → journal_before_trade inapplicable").toBe("na");
    expect(patienceRow?.status).toBe("pass");
    expect(patienceRow?.xpEarned).toBe(135);
    // Total never exceeds the observation ceiling (patience + debrief here).
    expect(debrief?.xpTotal).toBe(135 + 30);
  });
});

describe("F2: the session freezes after endSession", () => {
  it("submitOrder after endSession is rejected without touching the log", () => {
    const adapter = makeAdapter("SCN-001");
    adapter.clock.advance(2);
    adapter.endSession();
    const before = adapter.log.entries.length;
    const outcome = adapter.submitOrder({ side: "buy", quantity: 10, stopPrice: 0.9 });
    expect(outcome.rejectReason).toBe("session_ended");
    expect(adapter.log.entries.length).toBe(before);
  });

  it("un-pausing a scored session is refused", () => {
    const adapter = makeAdapter("SCN-001");
    adapter.clock.advance(2);
    adapter.endSession();
    expect(adapter.setCompression("1x")).toBe(false);
    expect(adapter.setCompression("paused")).toBe(true);
  });
});

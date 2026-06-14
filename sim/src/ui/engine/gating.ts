/**
 * Scenario + lesson gating — pure lock-state evaluation for menu cards and
 * the lesson catalog (LESSON_SYSTEM_BRIEF §7).
 *
 * HARD LOCKS — scenario-completion, shipped drill, and shipped lesson prereqs.
 * Each gate is explicit (§4.5 — never a silent stall).
 *
 * ADVISORIES — minRank and any unshipped drill/lesson prereqs (informational).
 *
 * Pure functions — no Phaser, no store reads; the caller supplies progress.
 */

import type { ScenarioManifest } from "../../scenarios/types.js";
import { CANONICAL_LADDER, type RankThreshold } from "../../engine/rank.js";
import { DRILL_CATALOG } from "../../drills/catalog.js";
import { LIVE_DRILL_CATALOG } from "../../drills/liveCatalog.js";
import { LESSON_CATALOG } from "../../lessons/catalog.js";
import { PREREQ_BY_CURRICULUM } from "../../lessons/prereqGraph.js";
import type { LessonDef } from "../../lessons/types.js";

/** IDs of drills that actually exist (shipped-drills-only flip rule). */
const SHIPPED_DRILL_IDS = new Set([
  ...DRILL_CATALOG.map((d) => d.id),
  ...LIVE_DRILL_CATALOG.map((d) => d.drillId),
]);

/** Shipped lesson IDs — hard-flip only when the lesson is in the catalog. */
const SHIPPED_LESSON_IDS = new Set(LESSON_CATALOG.map((l) => l.content.id));

const LESSON_BY_CURRICULUM = new Map(
  LESSON_CATALOG.map((l) => [l.content.curriculumId, l] as const)
);

const LESSON_BY_ID = new Map(LESSON_CATALOG.map((l) => [l.content.id, l] as const));

export interface ScenarioLockState {
  /** True when the card must not be startable. */
  locked: boolean;
  /** Hard-lock reasons (non-empty iff locked) — player-facing copy. */
  reasons: string[];
  /** Non-blocking requirement notes (rank advisory, unshipped prereqs). */
  advisories: string[];
}

export interface LessonLockState {
  locked: boolean;
  /** Hard-lock reasons — immediate parent lesson on the prereq chain. */
  reasons: string[];
  /** Ordered curriculum IDs from root to immediate parent (for UI path copy). */
  prereqPath: string[];
}

/** Ladder index for a display label; -1 when unknown. */
function rankIndexOfLabel(label: string, ladder: readonly RankThreshold[]): number {
  return ladder.findIndex((r) => r.displayLabel === label);
}

export function scenarioLockState(
  manifest: ScenarioManifest,
  playerRankId: string,
  completedScenarioIds: readonly string[],
  ladder: readonly RankThreshold[] = CANONICAL_LADDER,
  completedDrillIds: readonly string[] = [],
  completedLessonIds: readonly string[] = []
): ScenarioLockState {
  const reasons: string[] = [];
  const advisories: string[] = [];

  for (const prereq of manifest.prereqs) {
    if (prereq.startsWith("scenario:")) {
      const neededId = prereq.slice("scenario:".length);
      if (!completedScenarioIds.includes(neededId)) {
        reasons.push(`Complete ${neededId} first`);
      }
    }
    if (prereq.startsWith("drill:") && SHIPPED_DRILL_IDS.has(prereq)) {
      if (!completedDrillIds.includes(prereq)) {
        reasons.push(`Complete the ${prereqDrillLabel(prereq)} drill first (RISK DRILLS, top of menu)`);
      }
    }
    // HARD (lesson flip, brief §7.2): shipped lesson prereqs lock once the full
    // prereq chain is playable — beginner tracks + foundation are in catalog.
    if (prereq.startsWith("lesson:") && SHIPPED_LESSON_IDS.has(prereq)) {
      if (!completedLessonIds.includes(prereq)) {
        const title = LESSON_BY_ID.get(prereq)?.content.title ?? prereqLessonLabel(prereq);
        reasons.push(`Complete the ${title} lesson first (LESSONS menu)`);
      }
    }
  }

  const playerIdx = ladder.findIndex((r) => r.rankId === playerRankId);
  const requiredIdx = rankIndexOfLabel(manifest.minRank, ladder);
  if (requiredIdx > -1 && playerIdx > -1 && playerIdx < requiredIdx) {
    advisories.push(`Designed for ${manifest.minRank}+`);
  }

  const unshippedSupport = manifest.prereqs.filter(
    (p) =>
      (p.startsWith("lesson:") && !SHIPPED_LESSON_IDS.has(p)) ||
      (p.startsWith("drill:") && !SHIPPED_DRILL_IDS.has(p))
  ).length;
  if (unshippedSupport > 0) {
    advisories.push(
      `${unshippedSupport} supporting drill${unshippedSupport === 1 ? "" : "s"}/lesson${unshippedSupport === 1 ? "" : "s"} recommended`
    );
  }

  return { locked: reasons.length > 0, reasons, advisories };
}

/**
 * Lesson catalog lock — enforces the shipped prereq DAG (foundation → beginner
 * → intermediate per pillar). F-01 and other root lessons are zero-state open.
 */
export function lessonLockState(
  lesson: LessonDef,
  completedLessonIds: readonly string[]
): LessonLockState {
  const path = lessonPrereqPath(lesson.content.curriculumId);
  if (path.length === 0) {
    return { locked: false, reasons: [], prereqPath: [] };
  }

  const immediateParent = path[path.length - 1]!;
  const parentLesson = LESSON_BY_CURRICULUM.get(immediateParent);
  if (parentLesson === undefined) {
    return { locked: false, reasons: [], prereqPath: path };
  }

  if (completedLessonIds.includes(parentLesson.content.id)) {
    return { locked: false, reasons: [], prereqPath: path };
  }

  return {
    locked: true,
    reasons: [
      `Complete ${parentLesson.content.title} (${immediateParent}) first — then this lesson unlocks`,
    ],
    prereqPath: path,
  };
}

/** Curriculum IDs from foundation root through immediate parent (inclusive). */
export function lessonPrereqPath(curriculumId: string): string[] {
  const path: string[] = [];
  let current = PREREQ_BY_CURRICULUM[curriculumId] ?? null;
  while (current !== null && current !== undefined) {
    path.unshift(current);
    current = PREREQ_BY_CURRICULUM[current] ?? null;
  }
  return path;
}

/** Short player-facing label for a drill prereq ID. */
function prereqDrillLabel(id: string): string {
  return id
    .replace(/^drill:/, "")
    .replace(/-v\d+$/, "")
    .replace(/-/g, " ");
}

function prereqLessonLabel(id: string): string {
  return id.replace(/^lesson:/, "").replace(/-/g, " ");
}

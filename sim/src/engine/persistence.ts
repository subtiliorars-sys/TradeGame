/**
 * Tier-B local persistence scaffold (PERS-W2).
 *
 * Client-side only — gated behind age affirmation. No server writes.
 * Aligns with docs/legal/PRIVACY_DRAFT.md and SIM_ENGINE_SPEC §6.3.
 *
 * ETHICS RAIL: progress holds process XP and completion IDs only — never PnL.
 */

/** Current on-disk progress schema; bump when shape changes and extend migrateProgress(). */
export const PROGRESS_SCHEMA_VERSION = 1;

const KEY_PROGRESS = "tradegame_v1_progress";
const KEY_AGE_GATE = "tradegame_v1_age_gate";
const KEY_UUID = "tradegame_v1_uuid";

export type AgeTier = "18_plus" | "13_to_17";

export interface ProgressData {
  xpTotal: number;
  completedDrillIds: string[];
  bonusAwardedDrillIds: string[];
  completedScenarioIds: string[];
  completedLessonIds: string[];
}

/** Age-gate record — tier category + timestamp only (no name, email, or geolocation). */
export interface AgeGateRecord {
  acknowledged: boolean;
  tier: AgeTier;
  timestamp: number;
}

export interface PersistedProgressEnvelope {
  schemaVersion: number;
  progress: ProgressData;
}

/** GDPR portability stub — process data only; no PnL or journal text. */
export interface AccountExportPayload {
  exportedAt: number;
  schemaVersion: number;
  accountId: string;
  ageGate: AgeGateRecord | null;
  progress: ProgressData | null;
}

function hasLocalStorage(): boolean {
  return typeof localStorage !== "undefined";
}

/** Generate a pseudonymous account id (internal operations — PRIVACY_DRAFT §2). */
export function getOrCreateUUID(): string {
  if (!hasLocalStorage()) return "test-uuid";
  let uuid = localStorage.getItem(KEY_UUID);
  if (!uuid) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      uuid = crypto.randomUUID();
    } else {
      uuid =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    }
    localStorage.setItem(KEY_UUID, uuid);
  }
  return uuid;
}

function emptyProgress(): ProgressData {
  return {
    xpTotal: 0,
    completedDrillIds: [],
    bonusAwardedDrillIds: [],
    completedScenarioIds: [],
    completedLessonIds: [],
  };
}

function isProgressData(raw: unknown): raw is ProgressData {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  return (
    typeof o["xpTotal"] === "number" &&
    Array.isArray(o["completedDrillIds"]) &&
    Array.isArray(o["bonusAwardedDrillIds"]) &&
    Array.isArray(o["completedScenarioIds"]) &&
    Array.isArray(o["completedLessonIds"])
  );
}

/**
 * Migration stub — chain version steps here when PROGRESS_SCHEMA_VERSION bumps.
 * Returns null for unknown/future schemas (fail closed to empty progress).
 */
export function migrateProgress(raw: unknown): PersistedProgressEnvelope | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const version =
    typeof obj["schemaVersion"] === "number" ? obj["schemaVersion"] : 0;

  if (version === 0 && isProgressData(raw)) {
    return { schemaVersion: 1, progress: raw };
  }

  if (version === 1 && isProgressData(obj["progress"])) {
    return { schemaVersion: 1, progress: obj["progress"] as ProgressData };
  }

  if (version > PROGRESS_SCHEMA_VERSION) {
    console.warn(
      `[persistence] Unknown progress schema v${version}; reset to empty.`,
    );
  }

  return null;
}

export function saveProgress(data: ProgressData): void {
  if (!hasLocalStorage()) return;
  const age = loadAgeAffirmation();
  if (!age?.acknowledged) return;

  const envelope: PersistedProgressEnvelope = {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    progress: data,
  };
  localStorage.setItem(KEY_PROGRESS, JSON.stringify(envelope));
}

export function loadProgress(): ProgressData | null {
  if (!hasLocalStorage()) return null;
  const age = loadAgeAffirmation();
  if (!age?.acknowledged) return null;

  const raw = localStorage.getItem(KEY_PROGRESS);
  if (!raw) return null;
  try {
    const migrated = migrateProgress(JSON.parse(raw));
    return migrated?.progress ?? null;
  } catch {
    console.error("[persistence] Failed to parse progress data");
    return null;
  }
}

export function clearProgressStorage(): void {
  if (!hasLocalStorage()) return;
  localStorage.removeItem(KEY_PROGRESS);
}

export function saveAgeAffirmation(tier: AgeTier): void {
  if (!hasLocalStorage()) return;
  const record: AgeGateRecord = {
    acknowledged: true,
    tier,
    timestamp: Date.now(),
  };
  localStorage.setItem(KEY_AGE_GATE, JSON.stringify(record));
  getOrCreateUUID();
}

export function loadAgeAffirmation(): AgeGateRecord | null {
  if (!hasLocalStorage()) return null;
  const raw = localStorage.getItem(KEY_AGE_GATE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AgeGateRecord;
    if (
      parsed?.acknowledged === true &&
      (parsed.tier === "18_plus" || parsed.tier === "13_to_17") &&
      typeof parsed.timestamp === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    console.error("[persistence] Failed to parse age gate data");
    return null;
  }
}

/** Data-portability stub (PRIVACY_DRAFT §9 — no PnL fields). */
export function exportAccountData(): AccountExportPayload | null {
  const age = loadAgeAffirmation();
  if (!age?.acknowledged) return null;
  return {
    exportedAt: Date.now(),
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    accountId: getOrCreateUUID(),
    ageGate: age,
    progress: loadProgress(),
  };
}

/** Erasure stub — SIM_ENGINE_SPEC §6.3 eraseAccount local equivalent. */
export function eraseLocalAccount(): { confirmationToken: string } {
  const token = `erase-local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  clearAllData();
  return { confirmationToken: token };
}

/** Clear all local Tier-B data (erasure path). */
export function clearAllData(): void {
  if (!hasLocalStorage()) return;
  localStorage.removeItem(KEY_PROGRESS);
  localStorage.removeItem(KEY_AGE_GATE);
  localStorage.removeItem(KEY_UUID);
}

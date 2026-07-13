import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveProgress,
  loadProgress,
  saveAgeAffirmation,
  loadAgeAffirmation,
  clearAllData,
  clearProgressStorage,
  getOrCreateUUID,
  exportAccountData,
  eraseLocalAccount,
  migrateProgress,
  PROGRESS_SCHEMA_VERSION,
  type ProgressData,
} from "../src/engine/persistence.js";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

vi.stubGlobal("localStorage", localStorageMock);

const sampleProgress = (): ProgressData => ({
  xpTotal: 100,
  completedDrillIds: ["drill:a"],
  bonusAwardedDrillIds: [],
  completedScenarioIds: ["SCN-001"],
  completedLessonIds: ["lesson:f-01"],
});

describe("Persistence System (PERS-W2)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("generates and persists a pseudonymous UUID", () => {
    const uuid1 = getOrCreateUUID();
    expect(uuid1).toBeDefined();
    expect(getOrCreateUUID()).toBe(uuid1);
  });

  it("blocks progress saving when age gate not passed", () => {
    saveProgress(sampleProgress());
    expect(loadProgress()).toBeNull();
  });

  it("persists progress with schema version envelope when age gate passed", () => {
    saveAgeAffirmation("18_plus");
    saveProgress(sampleProgress());

    const raw = localStorage.getItem("tradegame_v1_progress");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.schemaVersion).toBe(PROGRESS_SCHEMA_VERSION);
    expect(parsed.progress).toEqual(sampleProgress());
    expect(loadProgress()).toEqual(sampleProgress());
  });

  it("allows progress saving for 13–17 tier", () => {
    saveAgeAffirmation("13_to_17");
    const data = sampleProgress();
    saveProgress(data);
    expect(loadProgress()).toEqual(data);
  });

  it("stores age gate as acknowledged tier + timestamp only", () => {
    saveAgeAffirmation("18_plus");
    const gate = loadAgeAffirmation();
    expect(gate).toMatchObject({
      acknowledged: true,
      tier: "18_plus",
    });
    expect(typeof gate?.timestamp).toBe("number");
  });

  it("migrates legacy flat progress shape to schema v1", () => {
    saveAgeAffirmation("18_plus");
    localStorage.setItem(
      "tradegame_v1_progress",
      JSON.stringify(sampleProgress()),
    );
    expect(loadProgress()).toEqual(sampleProgress());
  });

  it("migrateProgress returns null for unknown future schema", () => {
    expect(
      migrateProgress({ schemaVersion: 99, progress: sampleProgress() }),
    ).toBeNull();
  });

  it("exportAccountData returns process-only payload (no PnL keys)", () => {
    saveAgeAffirmation("18_plus");
    saveProgress(sampleProgress());
    const payload = exportAccountData();
    expect(payload).not.toBeNull();
    expect(payload!.progress).toEqual(sampleProgress());
    expect(payload!.ageGate?.tier).toBe("18_plus");
    expect(JSON.stringify(payload)).not.toMatch(/pnl|profit|loss/i);
  });

  it("exportAccountData returns null without age gate", () => {
    expect(exportAccountData()).toBeNull();
  });

  it("eraseLocalAccount clears all local data and returns confirmation token", () => {
    saveAgeAffirmation("18_plus");
    saveProgress(sampleProgress());
    getOrCreateUUID();

    const result = eraseLocalAccount();
    expect(result.confirmationToken).toMatch(/^erase-local-/);
    expect(loadAgeAffirmation()).toBeNull();
    expect(loadProgress()).toBeNull();
    expect(localStorage.getItem("tradegame_v1_uuid")).toBeNull();
  });

  it("clearProgressStorage removes progress but keeps age gate", () => {
    saveAgeAffirmation("18_plus");
    saveProgress(sampleProgress());
    clearProgressStorage();
    expect(loadProgress()).toBeNull();
    expect(loadAgeAffirmation()?.tier).toBe("18_plus");
  });

  it("clearAllData removes progress and age gate", () => {
    saveAgeAffirmation("18_plus");
    saveProgress(sampleProgress());
    clearAllData();
    expect(loadAgeAffirmation()).toBeNull();
    expect(loadProgress()).toBeNull();
  });
});

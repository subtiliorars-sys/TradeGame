import { describe, expect, it } from "vitest";
import { communityCoachingHint } from "../src/ui/coachingLadderHints.js";

describe("communityCoachingHint (COACH-W1)", () => {
  it("returns process-review copy for ladder ranks, not trade advice", () => {
    const trainee = communityCoachingHint("trainee");
    expect(trainee).toMatch(/process review/i);
    expect(trainee).not.toMatch(/buy|sell|signal/i);

    const strategist = communityCoachingHint("strategist");
    expect(strategist).toMatch(/education/i);
    expect(strategist).not.toMatch(/PnL|profit target/i);
  });

  it("returns null for observer (no premature coaching CTA)", () => {
    expect(communityCoachingHint("observer")).toBeNull();
  });
});

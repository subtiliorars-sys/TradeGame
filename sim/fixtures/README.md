# Golden Fixtures

Committed JSON fixtures for the golden-replay regression suite (TEST_PLAN §6).
Each fixture encodes a seed, scripted player actions, and the computed digest.

**Regenerate after any engine change that intentionally alters tick output:**

```
cd sim && npx vitest run tests/_gen_digests.test.ts --reporter verbose          # SCN-001
cd sim && npx vitest run tests/_gen_scn002_digests.test.ts --reporter verbose  # SCN-002
cd sim && npx vitest run tests/_gen_slice4_digests.test.ts --reporter verbose  # SCN-004/005/006
```

Copy the printed digests into the corresponding fixture's `expectedLogDigest` field, then commit.
All `golden*.test.ts` assertions must pass before merging.

Fixture inventory: `scn00X-<variant>.json` — one clean run + one
patience/no-trade (or option-C) variant per scenario, GR-001 … GR-012.

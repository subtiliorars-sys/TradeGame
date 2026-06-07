# Golden Fixtures

Committed JSON fixtures for the golden-replay regression suite (TEST_PLAN §6).
Each fixture encodes a seed, scripted player actions, and the computed digest.

**Regenerate after any engine change that intentionally alters tick output:**

```
cd sim && npx vitest run tests/_gen_digests.test.ts --reporter verbose
```

Copy the printed digests into the corresponding fixture's `expectedLogDigest` field, then commit.
All `golden.test.ts` assertions must pass before merging.

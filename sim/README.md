# tradegame-sim

Deterministic sim engine for TradeGame — Phase 2 foundation.
Render-agnostic: no Phaser imports here; the UI layer brings Phaser.

## What this is

Pure TypeScript engine core: seeded PRNG, EventLog, tick pipeline, time
compression, and process-metric scoring. See `docs/game/SIM_ENGINE_SPEC.md`
for architecture, determinism requirements, and the scoring ethics rail.

## How to run tests

```sh
cd sim
npm install
npm test          # vitest run — determinism + scoring tests
npm run lint-pnl  # grep guard: zero PnL reads in scoring.ts
npm run verify    # full pre-PR gate (typecheck + lint-pnl + test + build:ui)
```

On Windows, `npm run verify` uses PowerShell scripts under `scripts/`.
On Linux/macOS/CI, it uses the bash equivalents.

## Note

This repo is private. Nothing in `sim/` deploys anywhere; it is consumed
by the UI layer in a future phase.

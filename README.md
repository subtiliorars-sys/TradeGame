# TradeGame — HQ (private)

Private headquarters repo for **TradeGame**: a community-run coaching + gaming
organization for video gamers who trade — crypto, stocks, and forex as fully
first-class markets — plus an education video game (a trading-practice
simulator: paper trading, scenario replay, grid-bot sandbox).

**Education, not financial advice.** No signals, no managed money, no
performance promises. See `docs/RISK_REGISTER.md`.

## Layout
- `docs/CONCEPT.md` — org concept: who it's for, markets, surfaces, model
- `docs/GDD.md` — game design document for the trading-sim education game
- `docs/COMMUNITY.md` — Discord structure, coaching program, social revival plan
- `docs/ROADMAP.md` — phased build-out
- `docs/RISK_REGISTER.md` — compliance & risk posture (red-teamed)
- `GOVERNANCE.md` — governance tier + audit trail
- `WAVES.md` — **wave registry for autonomous workers** (vertical slices + verify gate)
- `sim/` — deterministic sim engine + Phaser UI (see `sim/README.md`)

## Autonomous development

Game work ships in **waves** — one PR per wave. See `WAVES.md` for the ordered queue.

```powershell
cd sim
npm install
npm run verify    # typecheck + lint-pnl + tests + UI build
```

Cursor automation **TradeGame — wave worker** (AgentCorps
`cursor/automation-autonomous-worker.md`) picks the next pending wave, runs
verify, and opens a PR. Owner merges in batch when green.

## Repo pattern
This is the private HQ. The sanitized public face is
`TradeGame---Preview` — nothing confidential ever lands there.

## Working here
Read `CLAUDE.md` (repo specifics) — doctrine is inherited from `~/CLAUDE.md`.
Branch per task (`work/<topic>`), hooks live in `.githooks/`
(`git config core.hooksPath .githooks` after cloning).

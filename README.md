# TradeGame — HQ (private)

**[Play the sim →](https://subtiliorars-sys.github.io/TradeGame/)** — Educational trading simulator for paper trading, scenario replay, and grid-bot practice. *Not financial advice.*

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
- `WAVES.md` — **wave registry** for autonomous workers (vertical slices + verify gate)
- `OFFICE_HOURS.md` — **same-day merge/playtest checklist** + local `/loop` starter
- `sim/` — deterministic sim engine + Phaser UI (see `sim/README.md`)

## Autonomous development (Option C)

| Engine | Cadence | You do |
|--------|---------|--------|
| Cloud wave worker | Every 2h, 9–5 weekdays | Merge + 5-min playtest (`OFFICE_HOURS.md`) |
| Local `/loop` | Every 45m at desk | Paste starter from AgentCorps `prompts/tradegame-office-loop.md` |
| Chat | Anytime | *"Do LD-W5 from WAVES.md"* for immediate burst |

After you merge, the **next wave starts automatically** — no manual restart.

## Repo pattern
This is the private HQ. The sanitized public face is
`TradeGame---Preview` — nothing confidential ever lands there.

## Working here
Read `CLAUDE.md` (repo specifics) — doctrine is inherited from `~/CLAUDE.md`.
Branch per task (`work/<topic>`), hooks live in `.githooks/`
(`git config core.hooksPath .githooks` after cloning).


## Shared asset libraries

**Agents:** do not invent colored-box placeholders when free art exists.
See [docs/ASSETS.md](docs/ASSETS.md) → `game-visual-assets`, `game-audio-assets`, `game-3d-assets`.

# TradeGame — Office-hours operating mode (Option C)

You are at the desk most of the day. Two engines run in parallel — you do **not**
restart either one manually after every merge.

| Engine | When | Your job |
|--------|------|----------|
| **Cloud wave worker** | Every 2h, 9am–5pm weekdays | Merge green PRs; playtest UI waves |
| **Local `/loop`** | Every 45m while Cursor is open | Same pickup rules; fills gaps between cloud runs |
| **You in chat** | Anytime | *"Do LD-W5"* for immediate burst |

Both engines read `WAVES.md` and obey the same pickup rules in
`cursor/automation-autonomous-worker.md` (AgentCorps repo).

---

## Pickup rules (automation + loop)

1. **Open worker PR exists?** → Report status only. Do not start another wave.
2. **No open worker PR + next wave pending?** → Implement that wave. **Do not ask
   the owner to restart.**
3. **Owner merged since last run?** → Orient on latest `main`, start next wave.
4. **Verify must pass** before any PR (`cd sim && npm run verify`).
5. **Never merge** — owner merges same day when ready.

---

## Your 5-minute PR checklist (same day)

When a wave PR opens (GitHub notification or Cursor Runs tab):

### 1. CI / verify (30 sec)
- [ ] GitHub Actions **sim-verify** green on the PR
- [ ] PR body says `npm run verify` passed locally

### 2. Diff skim (1 min)
- [ ] Scope matches **one wave** from `WAVES.md` — no drive-by refactors
- [ ] No secrets, no PnL-ranked scoring, no financial-advice copy
- [ ] `WAVES.md` updated in the PR (wave marked done or in progress)

### 3. Playtest if UI-facing (2–5 min)
Skip for test-only / docs-only waves.

```powershell
cd sim
git fetch origin
git checkout <pr-branch>
npm install
npm run dev
```

Open the printed localhost URL. Check the PR body for **what to playtest**.

Quick checks:
- [ ] Scenario or drill in the PR loads without console errors
- [ ] Core interaction in the wave works (order, debrief, drill debrief, etc.)
- [ ] Coaching tone = process, not buy/sell advice

### 4. Decide (30 sec)
- [ ] **Merge** — good enough to unblock the next wave (or wait — **automerge-safe** merges automatically when CI is green and branch is `automation/*`)
- [ ] **Comment** — one specific fix; worker picks up on next run
- [ ] **Queue** — only for owner gates (legal, deploy, COPPA); not for "keep going"

### 5. After merge
- [ ] Do nothing — cloud worker (within 2h) or local loop (within 45m) starts the
      next wave automatically
- [ ] Optional: **Run now** on the TradeGame automation if you want zero wait

---

## Start local loop (Windows / Cursor chat)

Paste once to start office-hours pickup (stop when you leave the desk):

```
/loop 45m TradeGame office pickup — repo subtiliorars-sys/TradeGame branch main.
Read OFFICE_HOURS.md and WAVES.md. Read AgentCorps cursor/automation-autonomous-worker.md
TradeGame wave worker section for full rules.

ORIENT: List open PRs authored by automation (branch automation/* or title feat(sim):).
If an open wave PR exists → report wave-in-flight + PR link + exit this tick.

If no open wave PR: find first pending/active non-blocked wave in WAVES.md.
Implement that wave only. cd sim && npm run verify must pass. Open one PR. Never merge.
Never ask owner to restart. Memory: last wave, PR URL, next candidate.
```

To stop: ask the agent to stop the loop, or close the session.

---

## Production path (revenue-aware)

Game waves and business revenue run **in parallel**:

| Track | Goal | Owner gates |
|-------|------|-------------|
| **WAVES.md queue** | Shippable sim (drills → staging → demo) | Merge + playtest |
| **OmniTender / partner** | Fastest path to revenue | `OWNER_RUNBOOK` / go-live checklist |
| **TradeGame monetization** | Later | G-1 entity, G-3 attorney (any revenue) |

Do not block game waves on revenue legal work — but do not skip gates when a wave
is marked `blocked` in `WAVES.md`.

---

## Cron reference

| Automation | Schedule | Cron |
|------------|----------|------|
| TradeGame wave worker | Every 2h, 9–5 Mon–Fri | `0 9-17/2 * * 1-5` |
| Local loop (optional) | Every 45m while at desk | `/loop 45m …` |

---

*Last updated: 2026-06-13 — Option C (cloud + local loop).*

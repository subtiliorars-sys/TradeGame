# TradeGame — Experience & Campaign Design

**Version:** 0.1 (Design brief — the *feel* layer, companion to `docs/GDD.md`)
**Status:** Draft — design intent, not final spec. Internal HQ only.
**Scope:** The game-first entertainment experience: tone, world, mentor cast,
the campaign arc across the six ranks, the ~120-hour progression budget, the
emotional/mastery throughline, and the social/accountability layer (design only).

**Ethics rail (binding, same as every game doc):** Everything below complies
with GDD §2 and the RISK_REGISTER. No financial advice, ever. No signals product.
No PnL scoring, no outcome leaderboards, no performance promises. No gambling
loops, loot boxes, or chance-reward pulls — the "juice" in this game is earned by
process, never by luck. All instruments are from `docs/game/FICTIONAL_CANON.md`
only. Social/multiplayer and any persistence beyond the device are **governance
Tier B** (consent, age gate, PII handling, erasure path) and **deferred** until
the GDD §9 / ROADMAP Phase 2 hard gate is cleared. Nothing here publishes to
`TradeGame---Preview`.

---

## Table of Contents

1. [Why this document exists](#1-why-this-document-exists)
2. [The central design problem](#2-the-central-design-problem)
3. [Experience pillars](#3-experience-pillars)
4. [Tone & art direction](#4-tone--art-direction)
5. [The world & fiction](#5-the-world--fiction)
6. [The mentor & the crew](#6-the-mentor--the-crew)
7. [The campaign — six acts, one per rank](#7-the-campaign--six-acts-one-per-rank)
8. [The 120-hour progression budget](#8-the-120-hour-progression-budget)
9. [The mastery (spiritual) arc](#9-the-mastery-spiritual-arc)
10. [Onboarding & accessibility](#10-onboarding--accessibility)
11. [Social & accountability layer (design only)](#11-social--accountability-layer-design-only)
12. [Meta-progression, cosmetics, New Game+](#12-meta-progression-cosmetics-new-game)
13. [Game-feel within the rails](#13-game-feel-within-the-rails)
14. [What stays bulletproof](#14-what-stays-bulletproof)
15. [COSTLY / TUNABLE / OPEN](#15-costly--tunable--open)
16. [AAR](#16-aar)

---

## 1. Why this document exists

The GDD (`docs/GDD.md`) is the **systems spec**: modes, scoring rails, content
templates, tech sketch. It is deliberately sober. It tells you *what the machine
does and what it must never do.*

It does not tell you what it **feels like to play.** It does not name the world,
the mentor, the jokes, the music cue when you finally hold a stop you used to
panic-cancel, or the arc that carries a curious 16-year-old (note: 18+ at ship —
see §10) or a burned-out 45-year-old from "I don't know what a bid is" to "I read
this regime before it turned."

This document is that layer. It is the answer to a real risk: a process-honest
trading simulator can be *correct and boring.* TradeGame's whole bet is that the
discipline of trading — sizing, stops, journaling, patience, drawdown survival —
can be the most satisfying core loop in the game, not the vegetables you eat to
earn dessert. **There is no dessert. The discipline is the dessert.** Making that
true is a design problem, and this is where we solve it.

This doc governs *feel and structure*. Where it touches a system, the GDD and the
linked briefs win on mechanics; this doc wins on tone, sequencing, and emotion.

---

## 2. The central design problem

> Trading education is a graveyard of good intentions. Courses are watched and
> forgotten. "Paper trading" is treated as a lesser mode and skipped. The
> dopamine of a real win trains exactly the wrong reflexes.

Every competitor either (a) makes a dry simulator nobody finishes, or (b) makes a
dopamine slot machine that *feels* like trading and teaches ruin. We refuse both.

**Our design problem, stated precisely:** make *process adherence* — the least
glamorous behavior in trading — produce the strongest, cleanest feedback loop in
the game, while making *reckless outcome-chasing* feel hollow even when it
"wins." The player must leave a lucky reckless trade feeling itchy and a
disciplined loss feeling proud. That inversion of the real-market dopamine map is
the entire pedagogical engine, and it is delivered through *game feel*, not
through lectures.

If we get that inversion to feel good, the 120 hours teach themselves. If we
don't, no amount of content saves it.

---

## 3. Experience pillars

These extend the GDD's design pillars (P1–P5) into the experience layer. They are
the tie-breakers when a feel decision is ambiguous.

| # | Pillar | What it means at the controller |
|---|--------|---------------------------------|
| X1 | **The discipline is the dopamine** | The strongest, most satisfying feedback in the game fires when the player honors a stop, sizes correctly, or sits on their hands when there's no setup. Reckless wins get a flat, hollow response and a coaching flag. |
| X2 | **Joy first, lesson smuggled** | The player is here to play. Every concept arrives inside a scene, a character beat, or a puzzle — never a wall of text. If a lesson can't be *played*, it isn't ready (echoes CURRICULUM §1). |
| X3 | **Failure is content, not a fail screen** | Blowing up is an authored, often funny, always instructive experience. The "Blow Up on Purpose" drill is a set-piece, not a punishment. Reset carries zero stigma. |
| X4 | **Three markets, one feel** | Crypto's 24/7 chaos, stocks' bell-to-bell rhythm, forex's session tides each have distinct *texture*, but one consistent control grammar and one mentor voice. No pillar is a reskin. |
| X5 | **Earn the calm** | The end-state fantasy is not "get rich." It is *composure* — reading the market's pulse without flinching. The whole arc bends toward earned calm, and the game's audiovisual language rewards it. |

---

## 4. Tone & art direction

**The vibe in one line:** *a warm, witty trading-floor world that looks like a
festival and behaves like a dojo.*

- **Carnival, not casino.** Color, motion, personality, delight — but the carnival
  imagery is decorative, never a reward mechanic. We borrow the *feast for the
  eyes* of a great festival and pointedly refuse the slot-machine grammar that
  would be the obvious (and forbidden) way to make trading "exciting." The
  distinction is load-bearing and is restated as a hard rail in §14.
- **Clean, readable, kind.** Charts are the hero UI and must be legible to a first-
  timer and an expert at the same time. Two-tier readability: a friendly default
  skin, and a "pro chart" cosmetic skin (unlocked, never sold as power) for the
  player who wants the terminal aesthetic.
- **Humor with a straight face.** The crew (§6) are funny; the *risk content* never
  winks. A joke can frame a lesson; a joke never undercuts a stop-loss. Comedy
  lives in the characters and the world, not in the consequences of bad risk.
- **The "old fox" register.** The mentor (§6) carries the tone the prompt asks for:
  clever like a fox, warm like a craftsman who's done this since before you were
  born, allergic to hype. The game's writing voice is his.
- **Diegetic everything where possible.** XP, rank, journal, and coaching surface as
  in-world objects (a guild ledger, a logbook, a mentor's margin notes), not as
  floating game HUD that breaks the spell.

Art is a **stylized 2D** direction (consistent with the GDD tech sketch and the
shipped Phaser UI) — expressive, cheap to produce at content scale, ages well.
No photoreal terminals; a *characterful* terminal.

---

## 5. The world & fiction

TradeGame is set in **the Quarter** — a fictional trading district that reads like
a bustling market town crossed with a guild hall. It is not a real exchange, not a
real city, not pinned to any real date or event (FICTIONAL_CANON Standing Rule 3).

The Quarter has three districts, one per pillar, each with its own weather and
rhythm:

| District | Pillar | Texture / "wildlife" (canon instruments) |
|----------|--------|------------------------------------------|
| **The Tide Market** | Crypto — never sleeps | Open 24/7, neon and fog. Home of **GLIMMER** (the volatile darling), the **HarborUSD/USVC** stable houses, and **ArcSwap**, the rickety-but-beloved AMM bazaar. Storms (flash crashes, depegs) roll through without warning. |
| **The Bell Quarter** | Stocks — opens and closes | A town square that wakes at the bell and sleeps at the close. **Northgate Systems (NGSM)** the growth upstart, **Calder Utilities (CALD)** the steady old dividend house, **Veldara Industrial (VLDI)** the newcomer, all riding the **NMX 100** tide. Earnings season is a festival; the **MLCR**-style data drops shake the windows. |
| **The Crossing** | Forex — follows the sun | A harbor of session tides — London, New York, Tokyo, Sydney — where **ANDU** and **KORVA** flow with the clock. Calm grind by day, sweeps and spikes at the session opens. Leverage here is the deep water everyone respects. |

The three districts share one square — the **Guild Hall** — where the mentor, the
crew, the logbook, and the rank ladder live. This is the hub; the player always
comes home here to debrief.

**Fiction discipline:** the world is flavor wrapped around true mechanics. A
GLIMMER flash crash in the Tide Market *is* SCN-002's mechanics; the Bell
Quarter's earnings festival *is* SCN-002/SCN-005. The fiction never adds a
prediction, never says an instrument is "good," and never models a real event.
Every named asset traces to a FICTIONAL_CANON entry.

---

## 6. The mentor & the crew

The prompt's social truths — *you need a mentor, you need friends who keep you
accountable, you need a crew to compete with and sharpen against* — are built into
the cast. In single-player these are **NPCs** (no PII, no accounts). The real
human versions (Discord coaches, peer cohorts) are the §11 layer and are gated.

- **The Mentor — "Wickham," the Old Fox.** Your guide. Dry, warm, never hyped,
  quietly delighted when you do the boring thing right. He never tells you what to
  trade — he asks what your *plan* is, what your *stop* is, what you *wrote down*.
  His voice is the game's voice. His highest praise is a small nod for a
  well-stopped loss. He maps to the coaching-ladder "Coach" archetype and to the
  in-game Plan Card / debrief coaching copy already specced (ADVANCED_TIER_BRIEF
  §4 Plan Card; GDD §7).
- **The Crew (accountability cast):**
  - **Pip** — the eager beginner who over-leverages and blows up (comic relief +
    the cautionary mirror; stars in the "Blow Up on Purpose" set-pieces).
  - **Marlow** — the disciplined journaler, your accountability partner NPC, who
    nudges you to log before you enter.
  - **Sable** — the rival: same rank as you, slightly ahead on *process streak* (a
    process metric, never PnL), there to be chased and matched. Rivalry is over
    discipline, not profit (X1, and the §14 rail).
- **Coaching, in fiction and system.** Wickham's margin notes in the debrief are
  the diegetic skin over the process-scoring debrief (GDD §7). When the human
  coaching ladder (COMMUNITY.md, COACHING_LADDER_RANK_MAP.md) is live and gated,
  real coach annotations slot into the same surface.

Characters are wholly fictional, not modeled on real persons, and carry no
investment opinions — only process opinions.

---

## 7. The campaign — six acts, one per rank

The campaign maps **one act per canonical rank** (`sim/src/engine/rank.ts`),
reusing every existing system (lessons, drills, scenarios, advanced tier, NG+) as
the act's content. No new scoring; this is *sequencing and emotion* over the
machine that already exists. XP thresholds shown are the current TUNABLE ladder
values — display follows code, code is the source of truth.

| Act | Rank (XP gate) | Emotional beat | Core content (existing systems) |
|-----|----------------|----------------|----------------------------------|
| **I — The Front Door** | Observer (0) | *Curiosity, no fear.* "You can't lose anything real here." | Tutorial; Foundation F-01–F-02; first paper-sandbox touch in each district. |
| **II — The Boring Superpower** | Trainee (200) | *First pride.* Sizing and stops click; the player feels the calm of a pre-placed stop. | Foundation F-03–F-06; the four Beginner drills (sizing ×3, stop-placement) — the Trainee drill gate. |
| **III — Losses Are Lessons** | Practitioner (800) | *Reframing failure.* Blowing up becomes funny and instructive, not shameful. | Foundation F-07–F-10; stop-placement ×3 + drawdown-survival ×3 drills; first scenario clears (SCN-001/002/003); journaling habit forms. |
| **IV — Pick Your District** | Journeyman (2000) | *Commitment & identity.* Player goes deep in one pillar, feels mastery of its texture. | One full Beginner pillar track; the three "Blow Up on Purpose" drills (Journeyman gate); intermediate scenarios. |
| **V — Holding Many Threads** | Strategist (4500) | *Composure under complexity.* Multiple positions, regime shifts, real drawdown campaigns. | Intermediate track complete; Advanced tier ACN-001–006 (multi-position, correlation, regime, drawdown campaign); correlation drills. |
| **VI — Reading the Pulse** | Senior Strategist (8000) | *Earned calm / quiet mastery.* The player diagnoses regimes cold and mentors others. | NG+ parameterized replays; **Blind Replay** (event type hidden — pure diagnosis); "coach candidate" flag; second-pillar Beginner. |

**The throughline:** each act ends with a **Guild Hall beat** where Wickham
reflects back what changed *in the player's behavior*, not their balance — a
short, character-driven debrief that makes the invisible skill visible. Act VI's
closing beat is the payoff of the whole arc: the player is handed the logbook to
mentor the next Pip. (Mentoring others = the COMMUNITY.md coaching ladder, gated.)

---

## 8. The 120-hour progression budget

The prompt's target — **a full progression of ~120 hours to 100% mastery** — is a
*content-volume design budget*, not a grind requirement. A player learns the core
discipline far sooner; 120 hours is the road to *mastery and replay depth*,
analogous to fully mastering a deep strategy game.

The budget below sums the existing systems plus the planned content needed to
reach it. **Honesty note:** a meaningful *subset* of this is authored today (36
lessons, ~13 drills, 6+6 scenarios). The table is the target shape; the gap
between authored-now and budget is tracked in §15 as the real production cost.

| System | First-pass hours | Mastery/replay hours | Notes |
|--------|-----------------:|---------------------:|-------|
| Lessons (Foundation + 3 pillar tracks × 3 tiers) | ~8 | ~3 | 36 authored; advanced-tier lessons remain. Re-reads on demand. |
| Risk drills (all types × 3 markets, repeated to mastery) | ~6 | ~8 | Process-mastery gates reward repetition (rank.ts drill gates). |
| Scenarios SCN-001–006 + ACN-001–006 (first clears) | ~12 | — | 40–120 min each + debrief. 6 authored, 6 advanced specced. |
| Scenario re-runs, Plan-Card mastery, debrief study | — | ~10 | Replays pay `session_reviewed` XP, not base XP (PERS-W1). |
| Paper-trading sandboxes (open play, 3 districts) | ~10 | ~18 | Open-ended; the "just one more session" loop. |
| Strategy sandboxes (grid / DCA-rebalance / carry) | ~8 | ~9 | Build → watch it break → understand (GDD §5.3). |
| NG+ parameterized difficulty + Blind Replay | — | ~16 | Senior Strategist replay layer (ADVANCED_TIER_BRIEF §2). |
| Journaling / coaching-review meta-loop | ~2 | ~6 | The habit that carries across everything. |
| **Subtotal** | **~46** | **~78** | |
| **Total to 100% mastery** | | **~124 h** | TUNABLE; target ≈ 120. |

**Design consequence:** to hit 120 hours of *non-padded* play we need the
scenario library and advanced-tier content authored out (the COSTLY items in §15),
plus enough sandbox/NG+ replay depth that the loop sustains itself. The budget is
honest about where it currently stands and what filling it costs.

---

## 9. The mastery (spiritual) arc

The prompt asks for the *emotional roller-coaster and spiritual journey* of
becoming a composed trader — the "Zen of the master." We deliver it as **designed
emotional beats**, never as mysticism and never as a profit promise.

The arc is a deliberate progression of the player's *relationship to
uncertainty*:

1. **Fear → Safety.** Act I removes the fear (nothing real at stake) so curiosity
   can lead.
2. **Chaos → Control.** Acts II–III: the player discovers that *they* control
   risk even though they can't control the market. The first held stop is a
   genuine emotional beat — we score it, sound it, and have Wickham notice it.
3. **Shame → Curiosity about failure.** Act III's blow-up set-pieces convert the
   sting of loss into curiosity ("*why* did that cascade?"). This is the single
   most important emotional conversion in the game.
4. **Greed → Patience.** Acts IV–V: the hollow feeling on a reckless win (X1)
   slowly retrains the player to *prefer* the clean process. Patience starts to
   feel like power.
5. **Reaction → Composure.** Act VI: Blind Replay forces diagnosis before action.
   The player notices they're no longer flinching. That noticing *is* the
   payoff — earned calm.

**The "guru" the prompt describes is composure, not clairvoyance.** The game never
implies the player can predict price. Mastery is defined, end to end, as *process
under uncertainty* — exactly the line RISK_REGISTER and the GDD draw. The
"spiritual" framing is honored as the felt experience of that composure, kept
strictly clear of any forecasting or performance claim.

---

## 10. Onboarding & accessibility

*Accessible to young and old* is a design requirement, with one hard constraint:
**ship audience is adults 18+** (WEBSITE_ONEPAGER FAQ; markets are real financial
risk). "Young" here means *young in trading*, and design-readiness for a future,
gated, age-appropriate edition — not shipping to minors now.

- **The first 15 minutes** must land a complete, joyful micro-loop: learn one
  tiny thing → do it in a sandbox → get a warm Wickham beat → see XP/rank tick.
  No jargon before it's needed; the first stop-loss is *felt* before it's named.
- **Two reading levels.** Every lesson has a plain-language default and an optional
  "go deeper" expander, so a beginner and an ex-pro both feel respected.
- **No twitch barrier.** Time can always be paused to journal (GDD §5.2). Mastery
  is cognitive, not mechanical-execution speed — this widens the age range.
- **Accessibility baseline:** colorblind-safe chart palettes, scalable text,
  full-keyboard play, captioned mentor audio. Treated as launch requirements, not
  post-launch.
- **Age gate** at any account creation is mandatory and is a Tier B trigger (GDD
  §9); see §11.

---

## 11. Social & accountability layer (design only)

The prompt's social pillar — mentor, accountability partners, a competitive crew —
is **designed here and deferred in build.** Single-player ships it as NPCs (§6).
The human version requires governance Tier B and is explicitly gated.

**Designed (single-player, ships safely):**
- NPC accountability partner (Marlow) nudges journaling.
- NPC rival (Sable) on a *process-streak* ladder — never PnL (GDD §7 hard rail).
- Diegetic coaching via Wickham's margin notes.

**Designed but GATED (do not build without the gate cleared):**
- Replay sharing between real players (GDD §7) → needs persistence + privacy.
- Real coach annotations / cohorts (COMMUNITY.md, COACHING_LADDER_RANK_MAP.md).
- Any leaderboard with other humans — **process metrics only, never PnL**, and
  even then subject to the toxicity-moderation posture (ROADMAP Phase 3).

**Hard gate (restating GDD §9 / ROADMAP Phase 2):** the moment the game stores
accounts, progress, or shares anything between users, governance **Tier B**
applies — consent gates, age screen, PII handling, retention schedule, breach
plan, COPPA analysis, erasure path — *before ship.* PERS-W2 and DEPLOY-W1 in
WAVES.md are blocked on exactly this. This document does not unblock them; it
documents the design so it's ready when the gate clears.

---

## 12. Meta-progression, cosmetics, New Game+

- **Meta-progression = the rank ladder** (Observer → Senior Strategist), already
  built and process-gated. The campaign (§7) is its narrative skin.
- **Cosmetics, not power.** Chart skins (incl. the "pro terminal" look), Guild Hall
  decor, Wickham voice lines, district themes. **None affect outcomes or scoring.**
  Cosmetics are the *only* sanctioned reward flourish (it's how we get visual
  delight without slot-machine mechanics — §13).
- **Monetization is GATED.** Any paid cosmetic, tier, or edition triggers
  RISK_REGISTER §4 attorney review and the org-wide compensation analysis
  (CONCEPT.md Org Model). This doc proposes cosmetic *categories* only; it sets no
  prices and authorizes no sale. No loot boxes or randomized cosmetics — ever
  (GDD §2, §14).
- **New Game+** = the existing ADVANCED_TIER_BRIEF §2 layer: parameterized
  difficulty and Blind Replay. It is the bulk of the §8 "mastery hours" and adds
  replay depth at near-zero content cost — its core design virtue.

---

## 13. Game-feel within the rails

Game-feel ("juice") is how we make discipline satisfying. The constraint: **all
juice rewards process, none simulates a gambling payout.**

- **The Held-Stop chime / the Clean-Size confirm.** Small, satisfying audiovisual
  acknowledgments that fire on *process events* (stop placed before entry, size
  within rule, journal written before entry). These are the game's signature
  feel-good moments — deliberately stronger than any outcome animation.
- **The Hollow Win.** A reckless win gets a deliberately flat response and a
  coaching flag (GDD §2, §7). The *absence* of juice is itself a designed teaching
  feel.
- **The Blow-Up set-piece.** Authored, kinetic, a little funny (Pip's catchphrase),
  then a crisp mechanism debrief. Failure feels like a great boss fight you learn
  from, not a Game Over.
- **No randomized rewards.** All randomness in the game is *market simulation*
  (seeded, deterministic — SIM_ENGINE_SPEC), never prize randomness (GDD §2).
- **Calm as an aesthetic.** As the player advances, the UI literally gets calmer —
  less flashing, more space — mirroring the §9 arc toward composure.

---

## 14. What stays bulletproof

These are the rails restated as *experience* constraints, so no feel decision ever
erodes them. They are non-negotiable and inherited from RISK_REGISTER / GDD §2:

1. **No advice, ever.** No character, scene, tooltip, or reward implies what to
   buy or sell — in the sim or in real markets. Wickham asks about *your plan*; he
   never gives a call.
2. **No PnL reward, no outcome leaderboard.** Not in any view, mode, cosmetic, or
   rivalry. Process only (rank.ts ethics rail; `lint-pnl`).
3. **Carnival, never casino.** Visual delight is decorative; reward mechanics are
   process-driven. No loot boxes, wager loops, or chance-reward pulls.
4. **Fictional instruments only** (FICTIONAL_CANON), no real dates/events.
5. **Sim ≠ market.** The friction reminders (GDD, ROADMAP Phase 2) stay present in
   the experience, framed in-world, never buried.
6. **Social/persistence is Tier B and gated** (§11). The fun ships single-player
   first; the human-social layer waits for the gate.
7. **Nothing here reaches `TradeGame---Preview`.**

A reviewer should be able to take any proposed scene or feature and check it
against this list in under a minute. If it fails one, it isn't shipped — no matter
how fun.

---

## 15. COSTLY / TUNABLE / OPEN

**COSTLY (the real cost of reaching the §8 budget):**
- Authoring the full scenario library to 120-hour depth: ACN-001–006 builds
  (multi-position aggregate-exposure UI, multi-session engine, overnight carry —
  all already flagged COSTLY in ADVANCED_TIER_BRIEF §AAR), plus advanced-tier
  lessons (C-A/S-A/X-A) into the sim.
- NG+ / Blind Replay UI and parameterized-difficulty harness.
- Character art, mentor VO, and the diegetic Guild Hall hub — net-new art/audio.
- Onboarding "first 15 minutes" bespoke scripted sequence.

**TUNABLE:**
- The 120-hour total and every row in §8 (calibrate against playtest retention).
- Rank XP thresholds (already TUNABLE in rank.ts) vs. campaign act pacing.
- Strength/exact form of the §13 process-juice (must out-feel any outcome cue —
  validate in playtest that the dopamine inversion actually lands).
- Cosmetic categories and which are free vs. (gated) paid.

**OPEN (need owner / process decision):**
1. Mentor & crew names (Wickham, Pip, Marlow, Sable) — accept as canon or rename?
   If kept, do they need a registry like FICTIONAL_CANON for *characters*?
2. Does the campaign narrative ship as a Phase-2 wave, or stay a design doc until
   the vertical slice is playtested? (Recommend: doc now, wave when slice stable.)
3. Monetization model for cosmetics/editions — fully gated to RISK_REGISTER §4;
   not decided here.
4. The future age-appropriate ("young") edition: separate product + COPPA path, or
   permanently 18+? Owner + counsel decision.
5. Should this doc seed a `DESIGN-Wn` wave in WAVES.md, or remain reference-only?

---

## 16. AAR

**DESIGNED:**
- The game-first experience layer the GDD intentionally omitted: tone, world (the
  Quarter + three districts), mentor + accountability crew (NPCs), and the feel
  rules (X1–X5) that make process the dopamine.
- A six-act campaign mapping one act per canonical rank, reusing every existing
  system (lessons, drills, scenarios, advanced tier, NG+) — sequencing and emotion
  over the machine that already exists, no new scoring.
- A ~120-hour progression budget, summed honestly across existing + planned
  systems, with the authored-now vs. target gap surfaced as COSTLY.
- The mastery/"spiritual" arc as five designed emotional conversions, defined
  strictly as composure-under-uncertainty — never forecasting or profit.
- Onboarding/accessibility for a wide *experience* range within the 18+ ship
  constraint, and the social/accountability layer designed but governance-gated.

**HELD THE LINE:**
- Every rail (no advice, no PnL/leaderboards, carnival-not-casino, fictional-only,
  sim≠market, Tier-B-gated social, never-to-Preview) restated as a §14 design
  constraint a reviewer can check in a minute.

**OPEN:** see §15 — chiefly the build cost to fill the 120-hour budget, mentor/crew
canon, monetization gate, and whether to seed a build wave.

---

*Internal strategy & design document. Companion to `docs/GDD.md`. Do not publish
to the `TradeGame---Preview` repo.*

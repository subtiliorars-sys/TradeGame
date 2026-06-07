# Owner Runbook — TradeGame

Single consolidated action queue for the owner. Everything here requires
account access, legal judgment, or a decision only you can make. Ordered by
dependency: do NOW items before GATES; GATES before public launch.

Agents handle doc iteration, spec work, and draft content. If it's not on
this list, you probably don't need to do it yourself.

---

## NOW — Complete these before moving to any gate

These have no prerequisite except your browser and admin logins. They are
ordered so earlier items unblock later ones.

---

### N-1. Paste signal-channel names into SIGNALS_LANDSCAPE.md, then delete the source channel

**What:** The source channel (your old private signals-aggregation channel) is
excluded from project scope and must be deleted after you copy the channel
names into the reference doc.

**Steps:**
1. Open the source channel.
2. Open `docs/SIGNALS_LANDSCAPE.md` in a browser editor or text editor.
3. Paste the channel names only (no links, no invite URLs, no content) into
   the "Channel names" section under the existing placeholder.
4. Save and commit the file (or ask an agent to commit it for you).
5. Delete the source channel.

**Source:** `docs/SIGNALS_LANDSCAPE.md` — the containment rules at the top
of that file apply. Names only, never publish.

---

### N-2. FB winning-trades post review

**What:** Every historical post on the Facebook page that implies a win, a
result, or a profitable outcome must be deleted or edited before any new
content is posted. This is a hard gate for all new FB activity.

**Why:** FTC Endorsement Guides treat "winning trades" showcasing as an
earnings claim. It applies even without a dollar figure — "called it," "green
again," a screenshot showing profit all count.

**Steps (Chromebook browser, facebook.com):**
1. Log in as page admin.
2. For every post in page history: does it state, imply, or suggest a specific
   earnings result, win rate, or profitable outcome?
   - YES: delete it. If other posts depend on it, edit instead — remove the
     earnings language and paste the disclosure block from
     `docs/templates/DISCLOSURE_BLOCK.md §A` verbatim at the top.
   - NO: log it as "Clean — no action."
3. Keep a running log (a text file or Google Doc on your device):
   post date | brief description | action taken.
4. When every post has a log entry and all YES posts are resolved: note the
   date. This gate is cleared.

**Source:** `docs/SOCIAL_REVIVAL_PLAN.md §1a`

**Unblocks:** all new Facebook posting; `SOCIAL_REVIVAL_PLAN.md §1d` relaunch
gate.

---

### N-3. FB rename check and display-name capture

**What:** Confirm whether the page name and username can be set to TradeGame
branding, and record the current display name regardless.

**Steps (Chromebook browser):**
1. Go to your Facebook page. Click three-dot menu under the cover photo >
   Edit Page Info, or Settings > General.
2. Check "Name" and "Username" fields.
3. Record the current display name (add it to your log from N-2 or note it
   somewhere — you will need it for audit completeness).
4. If editable: set Name to "TradeGame" and Username to `tradegame` or
   `tradegameofficial` (check availability). Save.
5. If locked: note why and the lock expiry if shown. Record as
   "not-yet-possible" in your log.

**Source:** `docs/SOCIAL_REVIVAL_PLAN.md §1b`; audit completeness item in
`§5 owner-intake queue`.

---

### N-4. Telegram channel executions

**What:** Execute the per-channel plan for all five active Telegram channels.
Each channel has a specific disposition: REPURPOSE, PARK, or HARVEST+PARK.
Channel 6 is leave-dead — no action.

**Order matters:** do Channel 1 last (it gets the Discord invite link, which
does not exist until the Discord server is live — see N-5).

**Steps by channel:**

- **Channel 2 — @TradeGameCrypto (PARK):** Post the final redirect message
  from `docs/SOCIAL_REVIVAL_PLAN.md §3 Channel 2` verbatim. Pin it. Post
  nothing else.

- **Channel 3 — "TradeGame - Learning Materials" (HARVEST then PARK):**
  Review all messages. Sort into HARVEST (curriculum seeds, concept
  explainers, no directional framing) vs. PURGE (advice-adjacent,
  market-directional). On Chromebook: use Telegram Web, scroll manually,
  copy-paste harvest candidates to a Google Doc staging area, delete purge
  items in-channel. After complete: post and pin the archive message from
  `§3 Channel 3`. Channel stays private.

- **Channel 4 — "TradeGame - Macro market" (HARVEST then PARK):** Purge-first
  pass — scan for market calls, price targets, forecasts, directional + asset
  name combinations. Delete every one before harvesting anything. Then harvest
  remaining educational explainers. Post and pin archive message. Highest
  compliance risk channel — apply the strictest lens.

- **Channel 5 — "TradeGame - Incremental Mining" (HARVEST then PARK):**
  Harvest game-design seeds (idle mechanics, mining sim concepts) to
  `docs/GDD.md` or game design notes. Apply standard purge lens. Post and pin
  archive message.

- **Channel 1 — @TradeGame_Game (REPURPOSE — do last):** Clear or archive
  history. Set description verbatim from `§3 Channel 1`. Confirm username
  retained. Once Discord server is live (N-5 or later), pin the first
  announcements post.

**Source:** `docs/SOCIAL_REVIVAL_PLAN.md §§3–4`

**Compliance lens for every item:** RISK_REGISTER §17 (FTC earnings claims)
and §6 (signals).

---

### N-5. Discord server — generate a permanent invite link

**What:** Once the Discord server is built per `docs/DISCORD_BLUEPRINT.md`,
generate a permanent invite link. This link goes into the Telegram Channel 1
pin and into any FB page revival content.

**Steps:**
1. In Discord: Server Settings > Invites > Create Invite.
2. Set expiry to "Never" and max uses to "No limit."
3. Copy the link and paste it into the Telegram Channel 1 description and pin
   text (from `docs/SOCIAL_REVIVAL_PLAN.md §3 Channel 1`).
4. Also insert it into the Channel 2 redirect post if Channel 2 was parked
   before the link existed.

**Source:** `docs/SOCIAL_REVIVAL_PLAN.md §5 owner-intake queue` (Discord
invite link dependency); `docs/DISCORD_BLUEPRINT.md §6 pre-launch checklist`.

---

### N-6. Review PR #2

**What:** There is an open pull request (#2) in the HQ repo. Review and
merge or close it before it accumulates conflicts.

**Steps (Chromebook — GitHub web):**
1. Go to the TradeGame HQ repo on GitHub.
2. Open Pull Requests > #2.
3. Read the diff. If it looks correct: merge it. If it needs changes: leave a
   comment and assign it back to the agent that opened it.

**Source:** task brief. No doc reference — straight owner judgment call.

---

## GATES — Required before public-facing activity or any revenue

Do not open Discord to the public, post social content, or accept any money
until you have cleared the relevant gate.

---

### G-1. Entity formation (hard gate — before ANY public activity)

**What:** Form a legal entity before any public-facing activity — public
Discord invite, social posts pointing to the server, any marketing. This is
not optional. An unincorporated individual running a trading-education
community is personally exposed to every compliance risk in the RISK_REGISTER.

**What to ask counsel (bring this list):**

1. **Jurisdiction choice.** Where should the entity be formed? LLC vs. other
   structure? What are the annual maintenance costs in each option?

2. **Validate the process-coaching theory.** Show counsel the COACH_AGREEMENT
   and COMMUNITY.md coaching-ladder language. Ask: does this structure — process
   only, no trade calls, no personalized direction — keep us outside the
   Investment Adviser definition under federal and applicable state law? Are
   there any phrases in the current docs that need changing?

3. **§4 ANY-revenue rule.** RISK_REGISTER §4 requires attorney review before
   ANY revenue: paid cohorts, donations, server subscriptions, paid roles,
   cosmetics, anything. Confirm with counsel what the review process looks like
   and what triggers it.

4. **Operating agreement / governance basics.** What documents does the entity
   need at formation? What can agents draft and what requires attorney input?

**Source:** `docs/ROADMAP.md Phase 1 exit criteria` (entity formed before any
public-facing activity); `docs/DISCORD_BLUEPRINT.md §6 pre-launch checklist`
(entity gate); `RISK_REGISTER §4` (attorney gate before any revenue).

**Unblocks:** public Discord launch; Phase 1 → Phase 2 transition.

---

### G-2. COPPA analysis before Phase 2 data collection

**What:** Before the game vertical slice ships with real user accounts — even
informally, even in beta — a COPPA analysis must be complete. Discord's
platform floor is 13+. The coaching content is 18+. But the game component
may draw younger users, and any account or session data collection triggers
COPPA compliance requirements.

**What to bring to counsel or a privacy specialist:**
- The game design spec (`docs/GDD.md`) covering what data the game collects
  (account info, session progress, replay data).
- The Discord Blueprint age-gate language (§4 verification text, 18+ coaching
  posture).
- Ask: does the game's account system require a COPPA-compliant age verification
  flow? What does a compliant flow look like for this use case?

**Source:** `docs/DISCORD_BLUEPRINT.md §6 pre-launch checklist` (hard gate
note); `docs/ROADMAP.md Phase 2 compliance gate` (COPPA analysis required
before vertical slice ships with user accounts).

**Unblocks:** Phase 2 game vertical-slice public ship.

---

### G-3. Attorney review before ANY revenue

**What:** No money comes in — from any source, in any form — without attorney
sign-off. This includes paid cohorts, donations, server subscriptions, Discord
paid roles, in-game cosmetics, anything.

This gate is in addition to G-1. Entity formation alone does not clear it.

**Source:** `docs/ROADMAP.md Phase 4 compliance gate` (hard gate, explicit);
`RISK_REGISTER §4` (canon); `docs/COMMUNITY.md §2 Paid Tiers` (deferred,
requires legal review before any public promise).

---

## DECISIONS PARKED — Owner judgment required, not time-critical

These are not blocking anything now. Pull them off the shelf when the trigger
event arrives.

---

### P-1. Game engine choice: Phaser vs. Pixi

**Trigger:** When game development begins in earnest (Phase 2 prep).

**DECIDED 2026-06-07: Phaser 3.**

**Decision:** Which rendering/game framework for the web-based sim?
Phaser (batteries-included, larger community) vs. Pixi.js (faster renderer,
more manual). The GDD does not currently lock this.

**Source:** `docs/GDD.md` — engine choice is an open question in the tech
stack.

---

### P-2. Verification bot selection

**Trigger:** When the Discord server is ready for member-facing rollout.

**DECIDED 2026-06-07: Carl-bot.**

**Decision:** MEE6, Carl-bot, or Discord's built-in reaction roles for the
checkmark-to-Verified auto-assignment flow? Either path is acceptable per the
Blueprint; the intro post in #verify is always manually reviewed regardless.

**Source:** `docs/DISCORD_BLUEPRINT.md §4` (verification gate flow note).

---

### P-3. AMA cadence

**Trigger:** When the community has enough active members to make a monthly
AMA worth running.

**DECIDED 2026-06-07: Quarterly until a Mentor exists, then revisit monthly.**

**Decision:** Monthly is the baseline in COMMUNITY.md. You may find bi-monthly
or quarterly works better at small community scale. Decide when you have
attendance data.

**Source:** `docs/COMMUNITY.md §4` (monthly AMA slot in content cadence).

---

### P-4. Short-form platform choice (TikTok vs. Reels/Shorts)

**Trigger:** Before launching short-form social content (Phase 4 or earlier if
social revival runs ahead of game).

**DECIDED 2026-06-07: YouTube Shorts.**

**Decision:** SOCIAL_REVIVAL_PLAN recommends picking one short-form platform
at launch. TikTok has broader reach for gamer-trader content; Reels/Shorts
integrates with the FB page if the revival succeeds. Pick based on where your
seed audience actually is.

**Source:** `docs/SOCIAL_REVIVAL_PLAN.md §3c` (surface candidates table).

---

### P-5. Retention period for mod logs and session recordings

**Trigger:** Before Phase 2 (when Tier B data governance goes live).

**DECIDED 2026-06-07: 365 days confirmed (counsel to validate).**

**Decision:** How long do you keep #mod-log records, session recordings, and
cohort notes? This feeds the data-retention schedule required at Phase 2.
Ask counsel when you do G-2 — they may have a recommendation based on
jurisdiction.

**Source:** `docs/ROADMAP.md Phase 2 compliance gate` (data retention schedule
required); `docs/DISCORD_BLUEPRINT.md §2` (mod-log retention not yet
specified).

---

## WHAT NEVER NEEDS YOU

Agents handle all of the following without owner involvement. Do not block on
these:

- Doc iteration and spec work (RISK_REGISTER updates, GDD drafts, curriculum
  content, onboarding guides).
- Draft social content (Facebook drafts in SOCIAL_REVIVAL_PLAN §2 are
  agent-drafted; owner approves and posts — never auto-scheduled).
- Channel structure and moderation playbook refinement.
- Harvest passes on Telegram content (agents can draft the sorting; you
  execute the deletions in-app since that requires admin login).
- README and public-facing copy for the Preview repo.

If an agent asks you to do something on this list, push it back — it is not
owner work.

---

*Cross-references: SOCIAL_REVIVAL_PLAN.md, DISCORD_BLUEPRINT.md §6,
ROADMAP.md phase gates, RISK_REGISTER §4/§6/§10/§14/§17/§19/§24,
COMMUNITY.md §2, docs/templates/COACH_AGREEMENT.md.*

### P-6. Fictional-instrument name confirmations (added 2026-06-07, wave 4-5)

**Trigger:** Whenever convenient; before Phase 2 content freeze at the latest.

**DECIDED 2026-06-07:**
- **KORVA** — KEPT.
- **CALD / Calder Utilities** — KEPT.
- **HBD shorthand** — RETIRED. Always write "HarborUSD" in full. Real-ticker
  collision with Hive Backed Dollar is the reason; see FICTIONAL_CANON.md entry.

**Decision:** Three naming calls in `docs/game/FICTIONAL_CANON.md`:
- **KORVA** — new fictional forex base currency (replaced the SOLU placeholder,
  which was one letter off SOL/Solana). Keep or rename.
- **CALD / Calder Utilities** — new fictional defensive dividend equity (replaced
  a miscast VRXC usage). Keep or rename.
- **HBD** — HarborUSD's shorthand collides with a real ticker (Hive Backed
  Dollar). Content mostly says "HarborUSD" in full; decide whether to retire the
  HBD shorthand entirely (small sweep) or accept the collision with the canon's
  always-use-full-name rule.

### P-7. Forex stop-out convention (added 2026-06-07, Phase 2 build)

**Trigger:** Before the forex trading screen ships (vertical slice UI).

**Decision:** Two internally-consistent stop-out conventions exist in the engine
(reconciled in `sim/src/orders/account.ts` + `risk.ts` comments): the standard
broker margin-level convention (equity / used margin ≤ 50%) vs the simplified
balance-based one the X-B02 lesson teaches (50% of starting balance → 125 pips
in the worked example). The sim UI must show ONE. Recommend: teach the
margin-level convention in the UI (it's what real brokers use) and update the
X-B02 lesson's skeleton to match; the lesson's "no buffer at max leverage"
point survives either way.

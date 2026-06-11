# TradeGame Owner Quick-Start Runbook

Created: 2026-06-10
What: All the browser-based steps only you can do, compressed into one document.

---

## ESTIMATED TOTAL TIME: 3–4 hours (spread across 2–3 sessions)

---

## PHASE 0: Legal Entity (do this first)

**What to do:**
1. Form an LLC in your state. Your state's Secretary of State website handles this online.
2. Get an EIN from IRS.gov (free, instant).
3. Open a simple business bank account (optional but recommended).
4. Record the entity name, date, and EIN in `docs/legal/ENTITY_RECORD.md`.

**Why:** RISK_REGISTER §19 — hard gate. No public community activity, no YouTube uploads, no
public website before entity formation. The Discord invite stays private until this clears.

**Cost:** $50–$500 depending on state (LLC filing fee).
**Time:** 1–2 hours online.

---

## PHASE 1a: Facebook Cleanup (30 minutes)

**What's needed:** Browser + Facebook admin login.

### Step 1 — Winning-trades review (20 min)
1. Go to your Facebook page.
2. Scroll through the post history chronologically.
3. For each post, ask: "Does this state, imply, or suggest a profitable outcome?"
   - Look for: "won," "profit," "winning trade," "made money," PnL screenshots
   - If YES: click post menu (three dots) → Delete. Don't overthink it.
   - If NO: leave it.
4. Log each post in a text file on your device:
   `[Date] | [brief desc] | [Deleted / Clean]`

**That's it.** There are ~9 months of posts to review. Most will be clean.

### Step 2 — Page rename check (5 min)
1. Page Settings > General > Name/Username
2. Try setting Name to "TradeGame"
3. Try setting Username to "tradegame" or "tradegameofficial"
4. Note what works, what doesn't.

### Step 3 — Brand refresh (5 min)
1. Upload TradeGame logo as profile photo (no charts, no dollar signs)
2. Set cover photo to game art or concept visual
3. Set category to "Education" (not Financial Service)
4. Paste the About description (see `docs/community/FB_REVIVAL_PLAN.md Step 3`)
5. Set CTA button to "Learn More"

---

## PHASE 1b: Telegram Repurpose (20 minutes)

**What's needed:** Browser + Telegram admin login (web.telegram.org).

### Channel: @TradeGame_Game
1. Open channel. Delete all existing messages (4 members, clean slate is easiest).
2. Settings > Channel Info > Description — paste the announcements description
   (see `docs/community/TELEGRAM_PLAN.md Step 2` — insert Discord invite link)
3. Settings > Discussion > Disable (so no comments)
4. Post and pin the opening announcement (see TELEGRAM_PLAN.md Step 4)
5. Confirm @TradeGame_Game handle is retained

### Channel: @TradeGameCrypto
1. Post and pin a single message: "This channel is no longer active. Join us on Discord:"
2. Do nothing else. Channel stays up to hold the handle.

### Channels 3–5 (private learning materials):
1. Open each. Scan for curriculum-worthy content (concept explainers, frameworks).
2. Delete anything advice-adjacent, directional, or price-target-like.
3. Copy-paste the good stuff into a Google Doc (labeled "Raw Harvest").
4. Post: "Archive only. Content migrated. No further posting." Pin it.

---

## PHASE 2: Discord Server Setup (1–2 hours)

**What's needed:** Discord desktop or browser + admin account.

Follow `docs/DISCORD_BLUEPRINT.md` step-by-step:

### Server Settings (10 min)
- Name: TradeGame
- Verification: Medium
- Community: Enable + Rules Screening
- 18+ posture note in rules

### Categories & Channels (30 min)
Create in order:
1. **WELCOME** — #announcements, #rules, #start-here, #verify
2. **CRYPTO** — #crypto-learn, #crypto-charts-analysis, #crypto-strategy, #crypto-journal
3. **STOCKS** — same pattern
4. **FOREX** — same pattern
5. **THE GAME** — #sim-runs, #scenario-replays, #leaderboards (hidden until game ships)
6. **COACHING** — #cohort-announcements, #office-hours, #replay-review, 2 voice channels
7. **COMMUNITY** — #off-topic, #gaming-nights, #feedback
8. **MOD** — #mod-log, #scam-reports, #mod-discussion (hidden from non-mods)

Each `*-charts-analysis` channel gets a verbatim disclaimer pinned.

### Roles (15 min)
Create in order (highest to lowest):
1. Admin (red) — you
2. Moderator (dark orange)
3. Mentor (gold)
4. Coach (green)
5. Helper (teal)
6. Verified/Member (light blue)
7. Learner (grey-blue)
8. New Arrival (grey)

Lock @everyone down: no posting outside WELCOME.

### AutoMod (10 min)
Configure keyword blocks: `signals`, `vip group`, `dm me`, `cashapp`, `100x`, `moonshot`

### Rules Screen (5 min)
Paste the rules text from DISCORD_BLUEPRINT.md §4 into Community > Rules Screening.

### Pins (10 min)
Pin the required messages in: #announcements, #verify, all *-charts-analysis channels,
#leaderboards, #office-hours, #mod-log, #scam-reports.

---

## PHASE 3: Website Deploy (15 minutes)

1. Push the `site/` folder changes to GitHub (`work/community-growth-pack` branch).
2. Merge to main. Go to Cloudflare Pages.
3. Connect repo, set build directory to `site/`, deploy.
4. Add custom domain (tradegame.game or whatever you own).
5. Update the CTA button Discord link from `YOUR_INVITE_LINK` to the real invite.
6. Remove the `publishing gated` comments from `index.html`.

---

## PHASE 4: YouTube Channel (30 minutes)

1. Create channel under entity email.
2. Paste About description from `docs/assets/YOUTUBE_CHANNEL_ASSETS.md`.
3. Design banner in Canva per the spec in that doc.
4. Record all 4 scripts in one batch session (scripts in `docs/YOUTUBE_PLAN.md`).
5. Upload on biweekly cadence starting after entity formation.

---

## PHASE 5: Facebook "We're Back" Post (5 minutes)

After the winning-trades review is logged and entity is formed:

1. Post and pin the repositioning post (text in `docs/community/FB_REVIVAL_PLAN.md Step 4`).
2. Insert the Discord invite link.
3. Start the M-W-F content cadence using the drafts in `docs/CONTENT_CALENDAR.md`.

---

## POST-LAUNCH: Weekly Cadence

| Day | What |
|-----|------|
| Monday | Market Monday — post one education concept (rotation: Crypto → Stocks → Forex) |
| Wednesday | Game Wednesday — devlog or community update |
| Friday | Replay Friday — process breakdown or community story |
| Monthly | Cohort graduation post |
| Quarterly | Surface audit + Community AMA |

---

## BLOCKERS TRACKER

| # | What blocks it | Who | Est. time |
|---|---------------|-----|----------|
| 1 | Entity formation blocks: public website, YouTube, Discord public link | Owner | 1–2 hrs |
| 2 | FB winning-trades review blocks: all new FB posts | Owner | 20 min |
| 3 | Telegram cleanup blocks: Telegram announcements | Owner | 20 min |
| 4 | Discord creation blocks: seed cohort invites | Owner | 1–2 hrs |
| 5 | Attorney review blocks: any revenue/coaching (not needed for Phase 0–1 soft launch) | Attorney | TBD |
| 6 | Content creation (M-W-F posts) | Owner + AI | ~30 min/week |

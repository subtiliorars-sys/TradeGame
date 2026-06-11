# TradeGame Community Launch — Executive Assistant Task Brief

**Date:** 2026-06-10
**For:** Executive Assistant to the Owner
**Owner availability:** Minimal — EA acts on delegated tasks where possible

---

## What This Is

TradeGame is a trading education community and simulation game. We have:
- A Facebook page with 3,600 followers (dormant since Sep 2025)
- A Telegram channel (@TradeGame_Game, 4 members)
- A website (ready to deploy)
- Full content calendars and video scripts

The goal: open the community to a seed cohort of 50–100 engaged members.

---

## TASKS — What needs to happen, in order

---

### TASK 1: Legal Entity Formation (Owner must do, or delegate to attorney)

**What:** Form an LLC in the owner's state. Get an EIN from IRS.gov.
**Why this blocks everything:** The RISK_REGISTER requires a legal entity before any public-facing activity — Discord invites, website going live, YouTube uploads, Facebook posts.
**Estimated time:** 1–2 hours online. Cost varies by state ($50–$500).
**Handoff to EA?** You can do this if the owner authorizes you as an organizer. Otherwise the owner files and shares the EIN.
**Output needed:** Entity name + EIN recorded in `docs/legal/ENTITY_RECORD.md`.

---

### TASK 2: Facebook Page Cleanup

**Platform:** Facebook (browser)
**Access needed:** Owner must grant EA admin access to the Facebook page, or EA does it while screensharing with owner.

**2a — Winning-trades post review (20 minutes)**
- Go to facebook.com/[pagename]
- Scroll through ALL posts in chronological order
- Look for posts that say things like "winning trade," "profit," "made money," or show PnL screenshots
- DELETE any that do (three-dot menu > Delete)
- Keep a simple log on your device: `[Date] | [Description] | [Deleted / Left as is]`
- Most of the ~9 months of history will be fine — just remove the explicit earnings-language posts

**2b — Brand refresh (10 minutes)**
- Profile photo: Set to the TradeGame logo (file TBD — ask owner for the logo asset)
- Cover photo: Set to game concept art or a clean dark background with "Learn to trade like a gamer"
- Page name: Try changing to "TradeGame" (Settings > General > Name)
- Username: Try setting to "tradegame" or "tradegamegame" (Settings > General > Username)
- Category: Set to "Education" not "Financial Service"
- About section: Paste this exact description:

  ```
  TradeGame is a community-first trading education org and a sim game for
  gamer-traders. We cover crypto, stocks, and forex — through education, process
  coaching, and a trading simulation game. No signals. No financial advice.
  No performance promises.

  Education only. Everything here is for learning, not investment guidance.
  Consult a licensed financial professional before making any investment decisions.
  ```

- CTA button: Set to "Learn More" pointing to the website (once deployed)

---

### TASK 3: Discord Server Setup

**Platform:** Discord (desktop app or browser)
**Access needed:** EA creates server under their own account or owner creates and adds EA as admin

Follow the blueprint at: `docs/DISCORD_BLUEPRINT.md` (5,000+ words, step-by-step)

**Summary for EA:**

#### Server Settings
- Server name: "TradeGame"
- Verification: Medium
- Enable Community Server in settings
- Enable Rules Screening

#### Create Categories and Channels (in this order):

1. **WELCOME** category
   - #announcements (Announcement type)
   - #rules
   - #start-here
   - #verify

2. **CRYPTO — EDUCATION NOT FINANCIAL ADVICE** category
   - #crypto-learn
   - #crypto-charts-analysis (PIN the verbatim disclaimer — see blueprint)
   - #crypto-strategy
   - #crypto-journal

3. **STOCKS — EDUCATION NOT FINANCIAL ADVICE** category (same 4 channels)

4. **FOREX — EDUCATION NOT FINANCIAL ADVICE** category (same 4 channels, plus jurisdiction note pin in #forex-learn)

5. **THE GAME** category
   - #sim-runs
   - #scenario-replays
   - #leaderboards

6. **COACHING** category
   - #cohort-announcements
   - #office-hours
   - #replay-review
   - Office Hours Voice (voice channel)
   - Cohort Voice (voice channel)

7. **COMMUNITY** category
   - #off-topic
   - #gaming-nights
   - #feedback

8. **MOD** category (hidden from non-mods)
   - #mod-log
   - #scam-reports (members can post here but can't see other channels in this category)
   - #mod-discussion

#### Create Roles (in this order, highest to lowest):
1. Admin (red)
2. Moderator (dark orange)
3. Mentor (gold)
4. Coach (green)
5. Helper (teal)
6. Verified (light blue) — this is the "Member" role
7. Learner (grey-blue)
8. New Arrival (grey)

**Permissions:** Lock @everyone to only see WELCOME. New Arrival can only post in #verify. Verified (Member) can see everything except MOD channels.

#### AutoMod Rules
Block these keywords server-wide:
- `signals`, `signal group`, `vip signals`, `vip group`
- `dm me`, `dm for info`, `check your dms`
- `cashapp`, `venmo`, `paypal`, `send me`
- `100x`, `moonshot`, `easy money`, `guaranteed profit`, `risk-free`
- `t.me/` (Telegram links)

#### Required Pinned Messages
Each `*-charts-analysis` channel needs this exact text pinned:

> Posts here are educational discussion only. Nothing posted in this channel constitutes financial advice, a trading recommendation, or an investment analysis report. TradeGame is not a registered investment adviser or commodity trading adviser.

Full pin text including the removal rule is in `docs/DISCORD_BLUEPRINT.md` under each market section.

Also pin messages in: #announcements, #verify, #leaderboards, #office-hours, #mod-log, #scam-reports.

#### Rules Screen Text
The full rules text to paste is in `docs/DISCORD_BLUEPRINT.md §4` — 7 rules covering education-not-advice, no signals, no DM solicitation, 18+ coaching, process over outcome, scam reports, and the second-offense ban rule.

**Generate the permanent Discord invite link** and send it to the owner for:
- The website CTA button
- The Facebook page
- The Telegram channel description
- The "we're back" Facebook post

---

### TASK 4: Telegram Channel Repurpose

**Platform:** web.telegram.org (browser)
**Access needed:** Owner must log in or share login. Telegram is phone-number tied — EA may need to do this while screensharing with owner.

**Channel: @TradeGame_Game**
1. Open channel. Delete all existing messages.
2. Channel Settings > Info > Description — paste this:

   ```
   TradeGame — official announcements.

   Game updates, community news, and educational content only.

   No financial advice. No signals. No market recommendations. Ever.

   For the full community — discussions, coaching, and the trading sim — join us on Discord: [DISCORD INVITE LINK]

   Education only. Trading involves risk of significant loss.
   ```

3. Settings > Discussion > Disable (so nobody can comment)
4. Post and pin this announcement:

   ```
   TradeGame has a new home.

   The community is on Discord — structured education channels for crypto, stocks, and forex, plus the trading simulation game and a coaching ladder.

   This Telegram channel carries official announcements only: game releases, community milestones, and major content drops.

   No signals. No financial advice. No market calls.

   Join us on Discord: [DISCORD INVITE LINK]

   Education only. Nothing here is financial advice. Trading involves risk of significant loss.
   ```

5. Verify the handle @TradeGame_Game is still set as the username.

**Channel: @TradeGameCrypto**
1. Post and pin this one message, then do nothing else:

   ```
   This channel is no longer active. The TradeGame community has moved to Discord, where you will find structured education channels for crypto, stocks, and forex — plus the trading sim community. Join us: [DISCORD INVITE LINK]

   This is not financial advice. TradeGame is education only. No signals, ever.
   ```

**Channels 3–5 (private "Learning Materials," "Macro Market," "Incremental Mining"):**
- Open each channel. Scan messages.
- If you find good concept explainers or educational content: copy-paste into a Google Doc (label it "Raw Harvest — not yet edited").
- If you find anything that sounds like a market call, price prediction, or trade recommendation: delete it.
- After review, post: "Archive only. Content migrated. No further posting." and pin it.

---

### TASK 5: Website Deploy (can be done by EA)

**Estimated time:** 15 minutes. **Cost:** $0 (Cloudflare Pages free tier).

1. The website files are ready in the `site/` folder of the TradeGame repo.
2. Go to cloudflare.com. Create an account (free).
3. Cloudflare Dashboard > Pages > Create a project.
4. Connect the TradeGame GitHub repo.
5. Set build output directory to `site/` (no build command needed).
6. Deploy. Cloudflare gives you a `[project].pages.dev` URL immediately.
7. If the owner has a custom domain (e.g., tradegame.game): add it in Pages > Custom Domains.
8. **After deploy:** Open `site/index.html`, search for `YOUR_INVITE_LINK`, replace with the real Discord invite link. Commit and push. Cloudflare auto-redeploys.

The deploy README with all 3 options is at `site/README.md`.

---

### TASK 6: YouTube Channel Setup (owner or EA can do)

**Access needed:** Google account owned by the entity or owner.

1. Create YouTube channel under the entity's Google account.
2. About > Description — paste the channel description from `docs/assets/YOUTUBE_CHANNEL_ASSETS.md §1`.
3. Design a banner in Canva (free) matching the spec in `docs/assets/YOUTUBE_CHANNEL_ASSETS.md §3` — dark background, amber logo, tagline, no charts or dollar signs.
4. Channel keywords (SEO): enter the list from `docs/assets/YOUTUBE_CHANNEL_ASSETS.md §2`.
5. Record the 4 videos (owner on camera or voiceover). Full scripts at `docs/YOUTUBE_PLAN.md` — Design Walkthrough, Win Rate explainer, Devlog, 2% Short. All can be recorded in one session.
6. Upload metadata (titles, descriptions, tags, chapters) for all 4 videos is in `docs/assets/YOUTUBE_CHANNEL_ASSETS.md §4`.
7. Upload order: start with the Design Walkthrough or the Win Rate video. Post biweekly.

**No video goes public until the entity is formed.** You can upload as "Private" or "Unlisted" and flip to Public after entity clears.

---

### TASK 7: Weekly Content Posting (ongoing)

After the Discord is live and Facebook is clean:

| Day | What to post | Where | Content source |
|-----|-------------|-------|---------------|
| Monday | Market Monday — one education concept | Discord (#crypto-learn / #stocks-learn / #forex-learn) + Facebook | `docs/CONTENT_CALENDAR.md` has 2 full weeks drafted |
| Wednesday | Game Wednesday — devlog or community update | Discord (#announcements) + Facebook | Same doc + `docs/YOUTUBE_PLAN.md` for devlog scripts |
| Friday | Replay Friday — process breakdown | Discord (#replay-review thread) + YouTube | Same doc |
| Monthly | Cohort graduation post | Discord (#cohort-announcements) + Facebook | Template in `docs/CONTENT_CALENDAR.md` |
| Quarterly | Community AMA + Surface Audit | Discord voice + YouTube | Same doc |

**Required footer on every public-facing post:**
> Education, not financial advice. Trading involves risk of significant loss. Simulated results are not real trading. No signals, ever.

---

## QUICK-REFERENCE: Links & Logins Needed

| Platform | What EA needs | Owner action needed |
|----------|--------------|-------------------|
| **State SoS website** | Entity formation | Owner or attorney files |
| **IRS.gov** | EIN | Owner or EA with owner's SSN/EIN |
| **Facebook** | Admin access to page | Owner adds EA as Page Admin (Settings > Page Roles) |
| **Telegram** | Login access | Phone-number tied — screenshare with owner or owner creates bot for EA |
| **Discord** | Create server | Anyone can do this — EA can create under their own account |
| **Cloudflare** | Free account | EA can do this independently |
| **YouTube** | Create channel | EA can set up; owner records videos |
| **GitHub** | Push access | EA already has or can be added to repo |

---

## BLOCKERS TIMELINE

```
WEEK 1:
  ▶ Entity formed (blocks everything public)
  ▶ Facebook page cleanup (20 min)
  ▶ Telegram channels repurposed (20 min)

WEEK 2:
  ▶ Discord server built (1-2 hrs)
  ▶ Permanent invite link generated → sent to owner
  ▶ Website deployed (15 min)

WEEK 3:
  ▶ YouTube channel created
  ▶ Batch-record 4 videos (1 hr, owner)
  ▶ "We're back" post on Facebook
  ▶ Seed cohort invited to Discord

ONGOING:
  ▶ M-W-F content cadence (~30 min/week)
  ▶ Telegram announcement mirroring
```

---

## Reference Files in the Repo

| File | What's in it |
|------|-------------|
| `docs/DISCORD_BLUEPRINT.md` | Complete Discord server setup (channels, roles, permissions, pins, AutoMod, mod playbook) |
| `docs/community/FB_REVIVAL_PLAN.md` | Facebook cleanup, rename, brand refresh, first post |
| `docs/community/TELEGRAM_PLAN.md` | Telegram repurpose steps for all channels |
| `docs/CONTENT_CALENDAR.md` | 2+ weeks of drafted posts with education-not-advice filter |
| `docs/YOUTUBE_PLAN.md` | 4 full video scripts + cadence + publishing checklist |
| `docs/assets/YOUTUBE_CHANNEL_ASSETS.md` | Channel SEO, upload metadata for all 4 videos |
| `docs/assets/OWNER_QUICKSTART.md` | Compressed runbook for all above |
| `site/README.md` | Website deploy instructions (3 hosting options) |

# Telegram Plan — @TradeGame_Game

Internal runbook — private HQ only. Never publish to TradeGame---Preview.
Owner executes every step in-app or via web.telegram.org.

Audit source: docs/community/SOCIAL_AUDIT_NOTES.md (§2) and docs/SOCIAL_AUDIT_NOTES.md.
Compliance references: RISK_REGISTER §6 (signals), §7 (platform ToS), §17 (FTC),
COMMUNITY.md §3b (Telegram decision rule).

---

## Why repurpose instead of replace

COMMUNITY.md §3b default action is REPLACE for channels below 200 real engaged members.
@TradeGame_Game has 4 members and does not clear that threshold.

The deviation is warranted here for one reason: the handle @TradeGame_Game is an exact
brand match and is owner-controlled. Replacing the channel means:
- Surrendering this handle (it becomes available for squatters immediately)
- Creating a new channel at best named approximately the same
- No improvement in content cleanliness — the history is easily cleared at 4 members

Repurposing delivers a clean-slate result identical to replacement while keeping the
exact-match handle. The §3b default exists to guard against reviving channels with
entrenched bad content or uncontrolled membership. Neither condition applies here.

This decision is recorded in docs/community/SOCIAL_AUDIT_NOTES.md §2.

---

## Role in the platform ecosystem

TradeGame's platform hierarchy per COMMUNITY.md §3c and §1:

- **Discord** — community HQ: all structured education channels, coaching ladder,
  cohort activity, discussion, voice sessions.
- **Telegram @TradeGame_Game** — official announcements only: game releases, community
  milestones, Discord launch events, major content drops. No discussion. Every post
  links back to Discord or YouTube for depth.
- **YouTube** — long-form: scenario replay breakdowns, game devlogs, concept explainers.
- **Short-form (TikTok or Reels/Shorts, pick one)** — 60-90s process clips; CTA to
  Discord or YouTube.

Telegram sits between YouTube and the short-form surface in terms of posting frequency.
It is a notification layer, not a community space. Members who follow it get announcements;
members who want to engage go to Discord.

Telegram does NOT replace Discord. If a member asks a question in the Telegram channel
comments (if comments are enabled — see configuration step below), redirect them to
Discord. Do not answer substantive questions in Telegram.

---

## Configuration steps (owner executes, in order)

NEEDS-HUMAN for every step: Telegram admin session required. Use web.telegram.org on
Chromebook or the Telegram mobile app.

### Step 1 — Review and clear message history

- Open @TradeGame_Game in your admin session.
- Review every existing message in the channel history.
- Delete any message that does not fit an announcements-only, education-posture channel.
  Specifically delete: any market commentary, any language that could be read as a call
  or a directional view, any personal conversation, any signals-adjacent content.
  Compliance lens: RISK_REGISTER §6 (signals) and §17 (FTC).
- Given 4 members and a pre-brand history, the cleanest path is to delete all prior
  messages and start fresh. This is the recommended action.

### Step 2 — Set channel description

Go to channel settings (Edit Channel / Channel Info). Set the description to this text
verbatim (substitute the Discord invite link once it is available):

---

TradeGame — official announcements.

Game updates, community news, and educational content only.

No financial advice. No signals. No market recommendations. Ever.

For the full community — discussions, coaching, and the trading sim — join us on
Discord: [Discord invite link]

Education only. Trading involves risk of significant loss.

---

NEEDS-HUMAN: insert the permanent Discord invite link before publishing this
description. Generate the invite after the Discord server is live.

### Step 3 — Disable comments (recommended)

Telegram channels support an optional "discussion group" that allows member comments
on posts. Disable this for @TradeGame_Game. An announcements channel with open comments
becomes a discussion surface by default and creates a moderation burden the current
team (one founder) cannot sustain.

In channel settings: look for "Discussion" or "Comments" — set to disabled or "No
linked group." If a discussion group is already linked, unlink it.

If the owner later decides to enable comments as the team grows, that is a deliberate
decision made at the right scale — not a default left on.

### Step 4 — Pin opening announcement post

After the Discord server is live and the description is set, post and pin the following
as the first message in the repurposed channel. Pin it (tap and hold > Pin > pin for
all members).

---

TradeGame has a new home.

The community is on Discord — structured education channels for crypto, stocks, and
forex, plus the trading simulation game and a coaching ladder.

This Telegram channel carries official announcements only: game releases, community
milestones, and major content drops. Every post links out for depth.

No signals. No financial advice. No market calls. That is not what we do.

Join us on Discord: [Discord invite link]

Education only. Nothing here is financial advice. Trading involves risk of significant
loss.

---

NEEDS-HUMAN: insert Discord invite link; post and pin from admin account.

### Step 5 — Bot management (deferred until Discord is live and cadence established)

When the posting cadence is established and a bot is configured to cross-post
announcements from Discord to Telegram:
- Grant the bot admin rights limited to post-only (no delete, no ban, no invite).
- Verify the bot's posts carry the standard footer (see posting rules below).
- Test one post manually before enabling automated posting.

NEEDS-HUMAN: bot credential setup and admin permission grant.

---

## Posting rules

Every post in @TradeGame_Game must comply with these rules. These are not suggestions —
they are the structural controls required by RISK_REGISTER §6 and §17.

1. Announcement or education only. Categories of acceptable posts:
   - New Discord feature or channel announcement
   - Game development update (milestone, release, new scenario)
   - New YouTube video or major educational content drop
   - Community milestone (cohort graduation — process language only, see rule 4 below)
   - Scheduled community event (AMA, replay session — with process framing per
     RISK_REGISTER §24)

2. Every post links to Discord, YouTube, or the game — no destination-less posts.

3. No market commentary, no directional language about any asset, no "I am watching X,"
   no reference to current market conditions in a directional way. If it can be read as
   an opinion on where a market is going: do not post it.

4. Cohort graduation posts and any member-outcome reference require the FTC disclosure
   block from docs/templates/DISCLOSURE_BLOCK.md §A before posting. Do not amplify a
   member result without material-connection disclosure and typicality disclosure.
   RISK_REGISTER §17.

5. Footer on every post — verbatim from docs/templates/DISCLOSURE_BLOCK.md §C:

   Education, not financial advice. Trading involves risk of significant loss.
   Simulated results are not real trading. No signals, ever.

6. Post frequency: match the Discord/YouTube announcement rhythm. Do not post for its
   own sake. One to three posts per week maximum during active phases; less is fine.
   Telegram is a notification layer, not a content engine.

---

## What Telegram does NOT replace

- Telegram does not replace Discord for community discussion.
- Telegram does not replace YouTube for educational content.
- Telegram does not replace the Discord #announcements channel — both exist; Discord
  announcements go to active community members, Telegram reaches people who prefer
  not to maintain a Discord account but want updates.
- Telegram is not the primary growth surface. Discord invite link is always the CTA.
  Growth comes from the game and YouTube content being worth finding — COMMUNITY.md §5.

---

## Owner Intake Checklist

| Item | Blocks | Status | Owner action |
|---|---|---|---|
| Review and clear message history | All configuration | OPEN | Admin session in Telegram; delete existing history (Step 1) |
| Confirm @TradeGame_Game handle is retained | Step 2 onward | OPEN | Check channel settings that username has not changed |
| Generate permanent Discord invite link | Step 2 and Step 4 | OPEN | Create invite after Discord server is live; permanent = no expiry, no member cap |
| Set channel description (Step 2) | First new post | OPEN | Insert Discord link then save |
| Disable comments/linked discussion group (Step 3) | Ongoing moderation health | OPEN | Check channel settings and disable |
| Post and pin opening announcement (Step 4) | Channel is live | OPEN | Draft is above; insert Discord link and post |
| Bot credential setup (Step 5) | Deferred — not blocking | DEFERRED | Revisit when posting cadence is established |

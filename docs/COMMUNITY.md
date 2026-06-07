# TradeGame Community Design & Social Revival Plan

Internal strategy document — private HQ only.

---

## 1. Discord Server Structure

### Moderation Roles

| Role | Permissions | How Earned |
|---|---|---|
| **@Admin** | Full server management | Owner-assigned only |
| **@Mentor** | Manage messages, mute, kick | Coach ladder tier 4 |
| **@Coach** | Manage messages in coaching category | Coach ladder tier 3 |
| **@Helper** | Pin messages, slow-mode in market channels | Coach ladder tier 2 |
| **@Member** | Standard access post-verification | Passes verification gate |
| **@New Arrival** | Read-only except #start-here and #verify | On join |

**Escalation path:** Helper flags → Coach reviews → Mentor decision → Admin final.
Rule violations surfaced in a private `#mod-log` channel; all bans require Mentor+.

### Verification Gate

New arrivals land in `@New Arrival`. To become `@Member` they must:
1. Read `#rules` and react with the checkmark.
2. Post a brief intro in `#verify` (game handle, which market(s) they want to learn, one question they have).
3. A Helper or above approves. Bot can auto-promote on reaction; intro requirement is moderated manually.

This gate keeps lurker-only accounts and spam bots out of active channels before they accumulate history.

### Anti-Signals-Channel Rule (hard constraint)

**No channel in this server will ever carry trading signals, picks, calls, or recommendations.**
Any channel whose name, description, or pinned content implies actionable trade direction — regardless of how it is framed — is prohibited. This includes channels named "calls," "alerts," "picks," "plays," "setups to watch," "hot," or any equivalent. Moderators must reject channel requests that fit this pattern. The word "signals" is banned from channel names and descriptions server-wide.

This rule must appear verbatim in `#rules` and is enforced as a permanent server policy, not a guideline.

### Channel Map

```
TRADEGAME
│
├── WELCOME
│   ├── #announcements          (Admin-post only)
│   ├── #rules                  (pinned; education-not-advice policy + anti-signals rule)
│   ├── #start-here             (orientation guide: how the server works, links to game)
│   └── #verify                 (intro post → Member role)
│
├── CRYPTO — EDUCATION NOT FINANCIAL ADVICE
│   ├── #crypto-learn           (concepts, resources, glossary; no advice)
│   ├── #crypto-charts-analysis (PINNED DISCLAIMER — see moderation rule below)
│   ├── #crypto-strategy        (system discussion, risk frameworks; no calls)
│   └── #crypto-journal         (wins AND losses; process reflection required)
│
├── STOCKS — EDUCATION NOT FINANCIAL ADVICE
│   ├── #stocks-learn
│   ├── #stocks-charts-analysis (PINNED DISCLAIMER — see moderation rule below)
│   ├── #stocks-strategy
│   └── #stocks-journal
│
├── FOREX — EDUCATION NOT FINANCIAL ADVICE
│   ├── #forex-learn
│   ├── #forex-charts-analysis  (PINNED DISCLAIMER — see moderation rule below)
│   ├── #forex-strategy
│   └── #forex-journal
│
├── THE GAME
│   ├── #sim-runs               (post your game session results + screen)
│   ├── #scenario-replays       (share saved replays for community review)
│   └── #leaderboards           (bot-updated; process metrics only — no PnL ranking component)
│
├── COACHING
│   ├── #cohort-announcements   (enrollment, graduation, cohort news)
│   ├── #office-hours           (schedule + session notes)
│   └── #replay-review          (coach-led replay breakdown threads; one thread per session)
│
└── COMMUNITY
    ├── #off-topic
    ├── #gaming-nights          (scheduling non-TradeGame game sessions)
    └── #feedback               (server improvement suggestions)
```

**Pinned disclaimer — required verbatim in every \*-charts-analysis channel description:**

> "Posts here are educational discussion only. Nothing posted in this channel constitutes financial advice, a trading recommendation, or an investment analysis report. TradeGame is not a registered investment adviser or commodity trading adviser."

**Moderation removal criteria for \*-charts-analysis channels (content-based, not intent-based):**
A post is removed if it combines a chart with marked price levels AND language that implies a specific trade action — for example, "watching this zone," "entry here," "setting alerts at," or similar. The combination of annotated levels plus directional language constitutes an actionable trade idea regardless of how it is labelled. Remove the post; do not warn first. Cross-reference RISK_REGISTER §6.

**Category description template (required on all three market categories):**

> "This category is for education and community learning only. Nothing posted here constitutes financial advice. All analysis is shared for discussion and skill development. No calls, signals, or recommendations are permitted."

---

## 2. Coaching Program

### Member-Coach Ladder

| Tier | Title | Entry Criteria |
|---|---|---|
| 1 | **Learner** | Verified Member; has completed game tutorial |
| 2 | **Helper** | 30+ days active; 20+ journal entries; consistent scenario completion with demonstrated debrief quality (process reflection, not outcome focus); nominated by a Coach |
| 3 | **Coach** | Helper for 60+ days; completed one full cohort as co-facilitator; mentor approval |
| 4 | **Mentor** | Coach for 90+ days; led at least two cohorts solo; Admin approval |

Entry criteria are **process metrics only** — number of journal entries, game completion benchmarks, consistency of participation. Raw PnL is never an entry criterion. Coaching covers process, risk management, journaling discipline, and emotional patterns; it explicitly does not cover financial advice.

### Cohort Format

- **Size:** 4–6 members per cohort.
- **Duration:** 4–6 weeks.
- **Tracks:** Crypto, Stocks, Forex (separate tracks; cross-market elective in week 5+).
- **Weekly structure:**
  - Week opens: Coach posts focus theme + game scenario assignment in the cohort thread.
  - Mid-week: Members post journal entry on their sim session.
  - Week close: Cohort replay-review call (voice channel, 45–60 min); Coach posts written summary.
- **Graduation:** Cohort reflection post in `#cohort-announcements`; process rubric reviewed by Mentor.

### Office Hours

- Held weekly in a voice channel under the COACHING category.
- Open to all Members, not just cohort participants.
- Topics: game mechanics, journaling technique, understanding risk concepts, how to self-review replays.
- Office hours are **not** trade Q&A. Moderators redirect any "should I trade X" questions to `#rules`.

### Replay-Review Sessions

Game scenario replays are the primary teaching tool. Sessions:
1. Coach selects a replay (their own or a member's with permission).
2. Screen-share or export posted in `#replay-review` as a thread.
3. Coach annotates decision points: what information was available, what process was followed, where risk rules held or broke.
4. Discussion stays in the thread; no editorializing on live markets.

### Paid Tiers (deferred, not designed yet)

Future option: paid coaching access for advanced cohorts. Any paid tier must carry the same education-not-advice constraint. Design + legal review required before launch; do not promise paid tiers publicly until that work is done. See RISK_REGISTER §4 — hard gate: attorney review required before ANY revenue (cohorts, donations, server subscriptions, paid roles, cosmetics) while the coaching ladder operates.

---

## 3. Social Revival Plan

### 3a. Facebook Page Audit Checklist

Page: [Facebook page URL — see SOCIAL_AUDIT_NOTES.md]

A human or agent with browser access should complete this checklist before any revival decision:

- [ ] Can an owner/admin log in and access Page settings? (Confirm admin access exists.)
- [ ] What is the current page name? Is it on-brand for "TradeGame" or needs rename?
- [ ] What is the follower/like count? Record it.
- [ ] Are those followers real accounts or visibly bot/purchased? (Spot-check follower profiles.)
- [ ] Review all posts in history: any post that implies trade signals, picks, calls, or specific market recommendations? List each. These must be deleted before revival.
- [ ] What was the most recent post date? Is the page visibly dormant to a visitor?
- [ ] Is the page username/URL customizable to match TradeGame branding?
- [ ] Any linked Instagram account that also needs audit?

**Decision rule:** Revive if all of the following are true:
1. Admin access confirmed.
2. Follower count includes a meaningful number of real accounts (not obviously inflated).
3. Historical content is clean of signals/advice posts, OR all such posts can be deleted.
4. Page name and URL can be set to TradeGame branding.

If any condition fails: retire the page (unpublish, do not delete — preserve in case of future claim issues) and create a new page under the TradeGame brand from scratch.

### 3b. Telegram Audit Checklist

For each dormant Telegram channel or group associated with this project:

- [ ] Does the owner hold admin rights? Can they post, edit, and delete content?
- [ ] What is the member count?
- [ ] Spot-check: what fraction of members appear to be real, active accounts vs. bots or spam accounts?
- [ ] Review recent message history: any signals, calls, or advice-adjacent content present?
- [ ] Is the channel public (joinable by link/search) or private?
- [ ] Has the channel been used by third parties to promote their own services?

**Decision rule:** Telegram carries structurally high risk of signals-seller infiltration and bot infestation. Default action is **replace**, not revive:
- Archive the old channel (leave it up but post a final "this channel is inactive, join us at [Discord link]" message).
- Create one new **announcements-only** Telegram channel: bot-managed, no discussion, links every post back to Discord.
- Only deviate from this default if the audit finds a genuinely engaged real-member base (e.g. 200+ members with visible on-topic conversation history). Even then, apply full content moderation before resuming activity.

### 3c. New Surface Candidates

**Launch with at most two surfaces beyond Discord.**

**Recommended pair: YouTube + one short-form (TikTok or Reels/Shorts).**

| Surface | Content fit | Priority |
|---|---|---|
| **YouTube** | Scenario-replay breakdowns, game devlogs, process concept explainers | Launch |
| **TikTok / Reels / Shorts** | Risk-management drills as 60-90s clips, game challenge clips | Launch (pick one) |
| X (Twitter) | Link amplification, community threads | Park — revisit after YouTube traction |
| Facebook (if revived) | Community updates, event posts | Park — revisit if revival passes audit |
| Podcast | Deep-dive coaching conversations | Park — future |

**YouTube channel rules:** every video description carries the education-not-advice disclaimer. No video may be titled or framed as "how to make money" or imply predictive accuracy. Scenario replays are framed as process analysis, not outcome tutorials.

**Short-form rules:** same disclaimer in bio. Content shows *process* (how to set a stop, how to log a trade, how to review a replay) not *outcome* (here's how much I made). Duration ≤ 90 seconds; CTA always points to Discord or YouTube for depth.

---

## 4. Content Cadence

**Core rule:** every public post — on any surface — passes this filter before publishing:
"Does this post teach a concept, show a process, or share a community story? Or does it imply someone should take a specific market action?"
If the answer is the second, do not post.

Pillars rotate so no single market dominates over any four-week window.

| Day | Recurring slot | Description |
|---|---|---|
| Monday | **Market Monday** | One concept post rotating: Crypto → Stocks → Forex → repeat. Theory, mechanics, risk idea — no current-market commentary. |
| Wednesday | **Game Wednesday** | Game devlog, new scenario release, sim challenge announcement, or community leaderboard update. |
| Friday | **Replay Friday** | Community replay-review clip or written breakdown. Sourced from game scenario replays. Process-focused. |

| Frequency | Slot | Description |
|---|---|---|
| Monthly | **Cohort Graduation** | Post celebrating cohort completion — process achievements, not PnL. Any showcased member outcome must comply with FTC Endorsement Guides: include a material-connection disclosure if the member received any benefit, and never imply their result is typical. Cross-ref RISK_REGISTER FTC entry. |
| Monthly | **Community AMA** | Coach or Mentor answers community questions in Discord voice + summary posted to YouTube. Questions pre-screened by a moderator before the session; a second staff member must be present or the session recorded. Any "should I trade X" question asked live is redirected on-air to `#rules` and not answered. |
| Quarterly | **Surface Audit** | Internal review: which platforms are producing real community engagement? Cut or reduce low-yield surfaces. |

**Content debt rule:** if the team cannot maintain the Monday-Wednesday-Friday cadence, drop the short-form surface before dropping Discord or YouTube. Core community health outranks follower counts.

---

## 5. Growth Posture

Growth comes from the quality of the free education and the pull of the game — not from promotion.

- **No follower-buying.** Any purchased follower campaigns are prohibited.
- **No engagement bait.** Posts that ask "Like if you trade crypto!" or manufacture controversy are off-brand and prohibited.
- **No paid signal funnels.** We do not cross-promote or partner with signals sellers or tip services. A signals seller offering a collab is a red flag, not an opportunity.
- **Attraction over promotion.** The game is the magnet. Someone plays the sim, gets better, joins the community, tells a friend. That is the loop. Organic referral from genuine skill-building.
- **Useful first.** Every piece of free content is complete and useful on its own. It does not withhold the valuable part behind a paywall or upsell. Trust is the asset.
- **Partner filter.** Any collab, guest post, or community crossover partner must pass the same education-not-advice standard. Decline anything that would compromise that standard regardless of the audience size offered. Any paid or token-granted relationship with a partner must be disclosed publicly on every piece of collaborative content. Do not partner with or promote any project offering token compensation without explicit disclosure; no token touting of any kind.

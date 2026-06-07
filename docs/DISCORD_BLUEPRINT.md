# Discord Server Build Blueprint — TradeGame

Internal build doc. Execute in order. Each section is a discrete checklist.
Nothing in this file is a design decision — all structure comes from COMMUNITY.md and RISK_REGISTER.md.
Where COMMUNITY.md uses a role name that differs from standard Discord nomenclature, this doc uses COMMUNITY.md as canon.

NEEDS-HUMAN: all items marked with that tag require the owner to be logged into Discord admin.

---

## 1. Server Settings

NEEDS-HUMAN: complete every item in this section before inviting anyone.

| Setting | Value | Notes |
|---|---|---|
| Server name | TradeGame | Exact — no punctuation, no tagline |
| Server icon | Owner uploads TradeGame logo | |
| Verification level | **Medium** — must have verified email AND be registered on Discord for >5 minutes | Blocks throwaway accounts at the door |
| Explicit media content filter | **Scan messages from members without a role** | Catches media posts before manual review |
| Default notification level | **Only @mentions** | Prevents notification fatigue for every new member |
| Community server feature | **Enable** | Required to unlock rules-screening, announcement channels, and AutoMod |
| Rules screening | **On** — custom rules screen text in §4 below | Members must accept before seeing the server |
| NSFW designation | **Not NSFW** — but rules screen and channel descriptions carry the 18+ coaching intent note | RISK_REGISTER §10: Discord's 13+ floor is not the org floor; coaching content is 18+; the rules screen communicates this |
| System messages channel | **Disable join/leave announcements** | Reduces noise; new-member orientation is handled by the gate flow |
| DM from server members | Owner's own account: **disable** | Personal operational security; impersonation risk is high (RISK_REGISTER §11) |

**18+ posture note (RISK_REGISTER §10):**
Discord's platform minimum is 13+. This server's coaching ladder and all financial-coaching channels are explicitly 18+ per server rules. The rules screen (§4) states this. Moderators redirect any member believed to be under 18 away from leveraged-product discussion and coaching ladder participation. This does not ban under-18 members from the server; it gates them out of coaching features.

**Community server features to enable after Community toggle is on:**

- [ ] Announcement channels (required for #announcements)
- [ ] AutoMod (configure in §5)
- [ ] Server Insights (monitor growth without acting on vanity metrics)
- [ ] Rules Screening (custom text in §4)

---

## 2. Channel Tree — Build in This Order

Build categories first, then channels within each. Set category and channel permissions as you go — do not bulk-create and fix permissions afterward.

The COMMUNITY.md channel tree is reproduced here with exact names, types, descriptions, and pinned-message text. "Type" = Text unless marked Voice.

---

### Category: WELCOME

Category description (set on the category itself):
> "Orientation, rules, and account verification. Read #rules before anything else."

Category permissions: @everyone can read. @New Arrival can read and post in #verify only.

| Channel name | Type | Topic/description | Pin required? |
|---|---|---|---|
| #announcements | Text (Announcement) | `Server news, feature releases, event dates. Admin-post only. Follow this channel from other servers to get updates.` | Yes — see pinned text below |
| #rules | Text | `Server rules, education-not-advice policy, and anti-signals rule. Read this first.` | Yes — full rules text (§4 rules screen is a condensed version; pin the full version here) |
| #start-here | Text | `How this server works: channels, ladder, game, coaching. Links to game and resources.` | Yes — orientation guide (owner drafts based on game link when available) |
| #verify | Text | `Post your intro here to unlock Member access: your game handle, which market(s) you want to learn, and one question you have. A Helper or above will approve you.` | Yes — see pinned text below |

**#announcements pinned message:**

```
Welcome to TradeGame.

This channel carries server-wide announcements: new features, community events, cohort openings, and important updates.

Only Admin accounts post here. If someone else posts here, report it to #scam-reports.

React with any emoji to follow this channel and get announcements in your own server's feed.
```

**#verify pinned message:**

```
To unlock full server access, post a brief intro in this channel:
1. Your game handle (or the name you want to go by here)
2. Which market(s) you want to learn: Crypto / Stocks / Forex (pick any or all)
3. One question you have about trading, the game, or the community

A Helper or Moderator will review your post and give you the Member role, usually within 24 hours.

Note: This server's coaching content is intended for adults (18+). By completing verification, you confirm you are 18 or older and understand that nothing here is financial advice.

No shortcuts — bots cannot replace the intro requirement. This keeps the community real.
```

---

### Category: CRYPTO — EDUCATION NOT FINANCIAL ADVICE

Category description (required verbatim per COMMUNITY.md):
> "This category is for education and community learning only. Nothing posted here constitutes financial advice. All analysis is shared for discussion and skill development. No calls, signals, or recommendations are permitted."

Category permissions: @Member and above can read and post. @New Arrival cannot see.

| Channel name | Type | Topic/description | Pin required? |
|---|---|---|---|
| #crypto-learn | Text | `Concepts, resources, and glossary for crypto markets. Share explainers, ask how things work, build vocabulary. No advice, no calls.` | No |
| #crypto-charts-analysis | Text | `Chart discussion and technical analysis education. See pinned disclaimer before posting.` | YES — verbatim disclaimer (below) |
| #crypto-strategy | Text | `Risk frameworks, position-sizing concepts, system discussion. No entry or exit calls.` | No |
| #crypto-journal | Text | `Log your sim sessions: wins and losses both. Process reflection required — what did you learn, not just what happened.` | No |

**#crypto-charts-analysis pinned message (verbatim — do not edit):**

```
Posts here are educational discussion only. Nothing posted in this channel constitutes financial advice, a trading recommendation, or an investment analysis report. TradeGame is not a registered investment adviser or commodity trading adviser.

Removal rule: a post that combines a chart with marked price levels AND language implying a specific trade action ("watching this zone," "entry here," "setting alerts at," or equivalent) will be removed without warning. The combination of annotated levels plus directional language = an actionable trade idea, regardless of how it is labelled. This is a structural rule, not a judgment call.

First removal: post removed + DM warning. Second offense: ban, no appeal.
```

---

### Category: STOCKS — EDUCATION NOT FINANCIAL ADVICE

Category description (required verbatim per COMMUNITY.md):
> "This category is for education and community learning only. Nothing posted here constitutes financial advice. All analysis is shared for discussion and skill development. No calls, signals, or recommendations are permitted."

Category permissions: same as CRYPTO.

| Channel name | Type | Topic/description | Pin required? |
|---|---|---|---|
| #stocks-learn | Text | `Concepts, resources, and glossary for equity markets. How stocks, ETFs, and market structure work. No advice, no calls.` | No |
| #stocks-charts-analysis | Text | `Chart discussion and technical analysis education. See pinned disclaimer before posting.` | YES — verbatim disclaimer (same text as #crypto-charts-analysis) |
| #stocks-strategy | Text | `Risk frameworks, position-sizing concepts, system discussion for equity markets. No entry or exit calls.` | No |
| #stocks-journal | Text | `Log your sim sessions: wins and losses both. Process reflection required.` | No |

**#stocks-charts-analysis pinned message (verbatim — do not edit):**

```
Posts here are educational discussion only. Nothing posted in this channel constitutes financial advice, a trading recommendation, or an investment analysis report. TradeGame is not a registered investment adviser or commodity trading adviser.

Removal rule: a post that combines a chart with marked price levels AND language implying a specific trade action ("watching this zone," "entry here," "setting alerts at," or equivalent) will be removed without warning. The combination of annotated levels plus directional language = an actionable trade idea, regardless of how it is labelled. This is a structural rule, not a judgment call.

First removal: post removed + DM warning. Second offense: ban, no appeal.
```

---

### Category: FOREX — EDUCATION NOT FINANCIAL ADVICE

Category description (required verbatim per COMMUNITY.md):
> "This category is for education and community learning only. Nothing posted here constitutes financial advice. All analysis is shared for discussion and skill development. No calls, signals, or recommendations are permitted."

Category permissions: same as CRYPTO.

Additional jurisdiction note (pin in #forex-learn per RISK_REGISTER §5):
> Forex leverage rules vary significantly by country. EU/UK members: ESMA/FCA leverage caps apply to your retail trading regardless of what you learn here. Members are responsible for knowing their local regulations.

| Channel name | Type | Topic/description | Pin required? |
|---|---|---|---|
| #forex-learn | Text | `Concepts, resources, and glossary for forex markets. Currency pairs, pip math, market sessions, risk management. Jurisdiction note pinned.` | YES — jurisdiction note (above) |
| #forex-charts-analysis | Text | `Chart discussion and technical analysis education. See pinned disclaimer before posting.` | YES — verbatim disclaimer (same text as #crypto-charts-analysis) |
| #forex-strategy | Text | `Risk frameworks, position-sizing concepts, system discussion for forex markets. No entry or exit calls.` | No |
| #forex-journal | Text | `Log your sim sessions: wins and losses both. Process reflection required.` | No |

**#forex-charts-analysis pinned message (verbatim — do not edit):**

```
Posts here are educational discussion only. Nothing posted in this channel constitutes financial advice, a trading recommendation, or an investment analysis report. TradeGame is not a registered investment adviser or commodity trading adviser.

Removal rule: a post that combines a chart with marked price levels AND language implying a specific trade action ("watching this zone," "entry here," "setting alerts at," or equivalent) will be removed without warning. The combination of annotated levels plus directional language = an actionable trade idea, regardless of how it is labelled. This is a structural rule, not a judgment call.

First removal: post removed + DM warning. Second offense: ban, no appeal.
```

---

### Category: THE GAME

Category description:
> "TradeGame sim runs, replays, and leaderboards. Process metrics only — no profit/loss rankings."

Category permissions: @Member and above can read and post.

| Channel name | Type | Topic/description | Pin required? |
|---|---|---|---|
| #sim-runs | Text | `Post your game session results and screenshots. What scenario did you run? What did the process look like?` | No |
| #scenario-replays | Text | `Share saved replays for community review. Include what you want feedback on — decision point, risk rule, or a moment that surprised you.` | No |
| #leaderboards | Text | `Bot-updated process leaderboard. Scored on: journaling entries, scenario completions, rule-adherence checks, replay participation. No P&L ranking component.` | YES — see pinned text below |

**#leaderboards pinned message:**

```
This leaderboard scores process, not outcomes.

Points: journal entries submitted, scenarios completed, risk-rule adherence tracked, replay sessions participated in.

P&L is not scored and is not visible on this leaderboard. A high score here means you are doing the work — logging, reflecting, showing up. It does not mean you are "winning" at trading or that your sim results predict live-market performance.

Simulated results are not real trading. Sim is practice, not proof.
```

---

### Category: COACHING

Category description:
> "Cohort program, office hours, and replay-review sessions. 18+ for coaching ladder participation. Coaching covers process: risk management, journaling, scenario analysis. Not financial advice."

Category permissions: @Member and above for #cohort-announcements and #office-hours. Cohort threads in #replay-review are visible to all Members; creation of a thread is Coach-only.

| Channel name | Type | Topic/description | Pin required? |
|---|---|---|---|
| #cohort-announcements | Text | `Enrollment windows, cohort news, and graduation milestones. Process achievements — no PnL showcases.` | No |
| #office-hours | Text | `Weekly schedule and session notes. Voice channel held weekly — open to all Members. Topics: game mechanics, journaling, replay self-review. Not trade Q&A.` | YES — see pinned text below |
| #replay-review | Text | `Coach-led replay breakdowns. Each session is a thread. Discussion stays in the thread.` | No |

**Voice channel under COACHING category:**

| Channel name | Type | Topic/description |
|---|---|---|
| Office Hours Voice | Voice | `Weekly office hours. Check #office-hours for schedule.` |
| Cohort Voice | Voice | `Active cohort sessions. Coach-invite only.` |

**#office-hours pinned message:**

```
Office hours are held weekly in the voice channel above.

Topics: game mechanics, journaling technique, how to understand risk concepts, how to self-review replays.

Office hours are NOT trade Q&A. If you ask "should I trade X?", the answer is the same every time: "That is your decision — let us look at your process." You will be redirected to #rules.

Coaches and Mentors never DM first. If someone DMs you claiming to be a coach offering personal advice or a "special program," report it to #scam-reports — that is a scam.
```

---

### Category: COMMUNITY

Category description:
> "Off-topic, gaming nights, and feedback. Keep it friendly."

Category permissions: @Member and above.

| Channel name | Type | Topic/description | Pin required? |
|---|---|---|---|
| #off-topic | Text | `Everything that is not trading or the game. Keep it civil.` | No |
| #gaming-nights | Text | `Schedule non-TradeGame game sessions with the community.` | No |
| #feedback | Text | `Server improvement suggestions. What would make this community more useful?` | No |

---

### Category: MOD (hidden from all non-mod roles)

Category permissions: @Moderator and above only.

| Channel name | Type | Topic/description | Pin required? |
|---|---|---|---|
| #mod-log | Text | `Internal: all moderation actions logged here. Signal removals, bans, scam reports, and decisions. Owner reviews weekly (RISK_REGISTER §6).` | YES — see pinned text below |
| #scam-reports | Text | `Members report DM scams and impersonation here. SLA: acknowledge within 24h, resolve within 48h (RISK_REGISTER §11).` | YES — see pinned text below |
| #mod-discussion | Text | `Mod team coordination. Escalation: Helper flags → Coach reviews → Mentor decision → Admin final.` | No |

Make #scam-reports readable by @Member so members can post there. Posting in #scam-reports should be available to all members; reading #mod-log and #mod-discussion is restricted to mods.

**#mod-log pinned message:**

```
Every moderation action is logged here with:
- Date and time
- Channel where the action occurred
- Action taken (post removed / warning / ban)
- Reason (be specific — quote the content-based removal criteria if applicable)
- Acting moderator

Owner reviews this channel weekly. Signal removals must be logged within 24 hours of the action.
```

**#scam-reports pinned message:**

```
Report DM scams and impersonation attempts here.

TradeGame coaches and staff never DM first. If someone DMs you claiming to be from TradeGame and offers advice, a "special program," or asks for payment — it is a scam.

Post what happened: who contacted you, what they said, their username/profile link if you have it.

We acknowledge within 24 hours and take action within 48 hours.
```

---

## 3. Roles and Permissions Matrix

### Role creation order (create in this order so hierarchy is correct)

1. Admin (highest)
2. Moderator
3. Mentor
4. Coach
5. Helper
6. Verified (rename from default; this is the "Member" role in COMMUNITY.md — calling it "Verified" in Discord for clarity)
7. Learner
8. New Arrival
9. @everyone (exists by default — restrict it)

### Role display names and colors

| Discord role name | COMMUNITY.md equivalent | Suggested color | Hoisted (shows separately in member list) |
|---|---|---|---|
| Admin | Admin | Red | Yes |
| Moderator | Moderator | Dark orange | Yes |
| Mentor | Mentor | Gold | Yes |
| Coach | Coach | Green | Yes |
| Helper | Helper | Teal | Yes |
| Verified | Member | Light blue | No |
| Learner | Learner | Grey-blue | No |
| New Arrival | New Arrival | Grey | No |

### Permissions matrix

Key: Y = allowed, N = denied, — = inherit from @everyone or category default

| Permission | @everyone / New Arrival | Verified (Member) | Learner | Helper | Coach | Mentor | Moderator | Admin |
|---|---|---|---|---|---|---|---|---|
| Read WELCOME channels | Y | Y | Y | Y | Y | Y | Y | Y |
| Post in #verify | Y | N (already verified) | — | — | — | — | — | — |
| Read market/game/community channels | N | Y | Y | Y | Y | Y | Y | Y |
| Post in market channels | N | Y | Y | Y | Y | Y | Y | Y |
| Post in #announcements | N | N | N | N | N | N | N | Y |
| Post in #cohort-announcements | N | N | N | N | Y | Y | Y | Y |
| Create threads in #replay-review | N | N | N | N | Y | Y | Y | Y |
| Read COACHING category | N | Y | Y | Y | Y | Y | Y | Y |
| Pin messages (market channels) | N | N | N | Y | Y | Y | Y | Y |
| Apply slow mode | N | N | N | Y | Y | Y | Y | Y |
| Manage messages (delete/edit others) | N | N | N | N | Y (coaching cat only) | Y | Y | Y |
| Mute members | N | N | N | N | N | Y | Y | Y |
| Kick members | N | N | N | N | N | Y | Y | Y |
| Ban members | N | N | N | N | N | Y (with Mentor approval) | Y | Y |
| Read #mod-log | N | N | N | N | N | N | Y | Y |
| Read #scam-reports | N | Y | Y | Y | Y | Y | Y | Y |
| Post in #scam-reports | N | Y | Y | Y | Y | Y | Y | Y |
| Read/post #mod-discussion | N | N | N | N | N | N | Y | Y |
| Manage channels | N | N | N | N | N | N | N | Y |
| Manage server | N | N | N | N | N | N | N | Y |

Note: bans at Mentor level require logged reason in #mod-log. All bans are final (no appeal) for second signal offense. See RISK_REGISTER §6.

### Ladder: how each rung is earned and what it unlocks

| Role | Entry criteria | What it unlocks |
|---|---|---|
| New Arrival | Joins server | #start-here, #rules, #verify — read only everywhere else |
| Verified (Member) | Posts intro in #verify; Helper or above approves | All public channels: market education, game, community |
| Learner | Verified + completes game tutorial | Displayed tier distinction; future cohort eligibility gate |
| Helper | 30+ days active; 20+ journal entries in market journals; consistent scenario completion with demonstrated debrief quality (process reflection, not outcome); nominated by a Coach | Pin messages in market channels; apply slow-mode; visible mod-support role |
| Coach | Helper for 60+ days; completed one full cohort as co-facilitator; Mentor approval; **signed docs/templates/COACH_AGREEMENT.md on file before role is assigned** | Manage messages in coaching category; create replay-review threads; lead cohort sessions |
| Mentor | Coach for 90+ days; led at least two cohorts solo; Admin approval | Mute/kick; approve Helper nominations; final word on ban calls below Admin |
| Moderator | Admin-assigned; not tied to coaching ladder (operational mod vs. coaching ladder) | Full moderation suite; #mod-log access |
| Admin | Owner-assigned only | Full server management |

**Coach role gate — NEEDS-HUMAN:**
Before assigning the Coach role to any member, confirm a signed copy of docs/templates/COACH_AGREEMENT.md is on file in the HQ repo. The role is not assigned without this. Per RISK_REGISTER §4, no coach operates without a signed agreement.

---

## 4. Onboarding: Rules Screen and Verification Gate

### Rules screen text

This text goes in Discord's Community > Rules Screening page. Members must accept it before they can interact.

NEEDS-HUMAN: paste verbatim into Server Settings > Community > Member Verification > Rules Screening.

---

**TradeGame Community Rules**

**This community is for education, not financial advice.**

By joining, you agree to all of the following:

1. **Education only, no advice.** Nothing posted here — by members, coaches, or staff — is financial advice, a trading recommendation, or an investment signal. TradeGame is an education and simulation community. You are responsible for your own financial decisions. Consult a licensed financial professional before making investment decisions.

2. **No signals. Ever.** No channel in this server carries trading signals, picks, calls, alerts, or recommendations. Posts that combine annotated charts with directional language ("watching this zone," "entry here," "setting alerts at," or similar) are removed without warning. The word "signals" is banned from channel names and descriptions. This rule is permanent, not a guideline.

3. **No DM solicitation.** TradeGame coaches and staff never DM you first about trading. If anyone DMs you claiming to be from TradeGame and offers advice, a program, or payment — report it to #scam-reports. That is a scam.

4. **18+ for coaching content.** Discord's platform minimum is 13+. This server's coaching ladder and financial-coaching channels are intended for adults 18 and older. By completing verification, you confirm you are 18 or older and understand that coaching content is educational and does not constitute financial advice.

5. **Process over outcome.** This community measures growth by journaling discipline, scenario completion, replay participation, and risk-rule adherence — not by profit or loss results. PnL boasting, outcome worship, and "I made X" posts are off-brand and will be redirected.

6. **Scam reports get action.** Report DM scams, impersonation, and suspicious links to #scam-reports. We acknowledge within 24 hours and act within 48 hours.

7. **Second offense = ban.** Signal-rule violations: first offense is a removed post and a DM warning. Second offense is a permanent ban with no appeal.

---

### Verification gate flow

```
Member joins
    |
    v
Receives @New Arrival role (auto)
    |
    v
Rules screening shown — must accept to proceed
    |
    v
Can read: #announcements, #rules, #start-here, #verify
Cannot read: all other categories
    |
    v
Posts intro in #verify:
  - Game handle
  - Market interest (crypto / stocks / forex)
  - One question
    |
    v
Helper or above reviews intro manually
  (Bot can auto-assign @Verified on checkmark reaction to rules;
   intro post remains a manual review gate)
    |
    v
Helper assigns @Verified role
    |
    v
@New Arrival removed; full server access unlocked
```

NEEDS-HUMAN: configure Carl-bot (decided 2026-06-07; MEE6 and Discord's built-in reaction roles remain as fallback options) to auto-assign @Verified when a member reacts with a checkmark to the #rules pinned message, OR keep the assignment fully manual. Either path works; the intro in #verify is always manually reviewed regardless.

### Role-pick prompts (market pillar interests)

After verification, prompt the member to react or use a slash command to self-tag their market interest. Use a pinned message in #start-here or a bot-managed role menu:

```
Which market(s) are you here to learn? Pick any or all:

- Crypto
- Stocks
- Forex

These tags help us route relevant content and cohort openings to you. They are not exclusive — you can change them any time.
```

These are display/notification tags, not permission gates. All Verified members see all market categories regardless of tag.

---

## 5. Moderation Playbook

### Escalation ladder

```
Helper flags post → posts message in #mod-discussion with channel link and reason
    |
    v
Coach reviews → agrees or disagrees with assessment, notes in thread
    |
    v
Mentor decides → action taken (remove / warn / mute) → logged in #mod-log
    |
    v
Admin final → required for all bans; Mentor can ban on second signal offense
              but must notify Admin within 24h
```

For signal-rule violations specifically: Mentor and above can act immediately without waiting for Coach review. Speed matters — RISK_REGISTER §6 requires removal; do not let a signal post sit.

### Signals-content removal criteria (content-based, not intent-based)

A post is removed if it meets the following test — regardless of channel, framing, or stated intent:

> The post combines (a) a chart or price reference with marked levels AND (b) language that implies a specific trade action.

Examples of (b) that trigger removal:
- "watching this zone"
- "entry here"
- "setting alerts at"
- "target at"
- "stop below"
- "loading here"
- "if this breaks I'm in"
- "I'd be buying/selling here"

The test is content-based. A member saying "this is not advice" or "just my opinion" does not change the outcome. Remove the post; do not negotiate over the framing. Log in #mod-log.

### Pump-and-dump pattern flags

Watch for these patterns in community posts. Do not amplify; investigate and escalate to Mentor:

- Repeated enthusiastic mentions of a low-cap or obscure asset across multiple channels
- Posts that frame a specific token or stock as "about to move" or "undervalued" with urgency language
- Members who join and immediately begin promoting a specific asset in multiple channels
- Links to third-party signal channels, VIP groups, or "exclusive" trading communities
- Any mention of a paid signal service, telegram group with "signals," or copy-trading platform

Action: do not engage with the content. Remove the post. Mute the member pending Mentor review. Log everything.

### Scam-report SLA (RISK_REGISTER §11)

| Step | Owner | Deadline |
|---|---|---|
| Acknowledge the report in #scam-reports | Moderator or Helper | 24 hours |
| Investigate: identify impersonation account, collect screenshots | Moderator | Within 48 hours |
| Action: report to Discord Trust & Safety, warn community if needed | Admin or Mentor | Within 48 hours of acknowledgment |
| Log outcome in #mod-log | Moderator | Same day as action |

If scam volume exceeds solo-founder capacity, post a community announcement that you are aware and investigating, set a 72h window, and document the overrun in the register.

### Raid and mass-join response (RISK_REGISTER §22 reference)

Signs of a raid or mass-join attack:
- 10+ new members join within minutes
- New accounts posting identical or near-identical messages
- Flood of DM scam reports arriving simultaneously

Immediate response (NEEDS-HUMAN):
1. Enable Discord's built-in raid protection (Server Settings > Safety Setup > Raid Protection) — if not already on.
2. Temporarily raise verification level to "Highest" (must have a verified phone number) to stop new joins.
3. Mute the affected channels while the wave is processed.
4. Sweep new accounts: ban any without a real-looking profile and history.
5. Post a brief announcement in #announcements when the situation is resolved.
6. Log everything in #mod-log.

### AutoMod starter rules

NEEDS-HUMAN: configure in Server Settings > AutoMod. These are starting rules; adjust thresholds as you learn your community's language patterns.

| Rule name | Keyword / pattern | Action |
|---|---|---|
| Signal solicitation | `signals`, `signal group`, `vip signals`, `premium signals`, `signal service` | Block message + alert to #mod-log |
| DM solicitation | `dm me`, `dm for info`, `I'll dm you`, `check your dms`, `sent you a dm` | Block message + alert |
| Payment solicitation | `cashapp`, `venmo`, `paypal`, `send me`, `pay me`, `zelle` | Block message + alert |
| VIP group spam | `vip group`, `vip channel`, `join my group`, `join my channel`, `telegram link`, `t.me/` | Block message + alert |
| Signal channel names | `calls`, `alerts`, `picks`, `plays`, `hot tips`, `setups to watch` | Flag for mod review (do not auto-block — context matters for this one) |
| Pump language | `100x`, `moonshot`, `going to moon`, `easy money`, `guaranteed profit`, `risk-free` | Block message + alert |

Spam filter: enable Discord's default spam detection (repeated identical messages, mass @mentions).

---

## 6. Phased Rollout

### Soft-launch (Phase 1 — open now)

All channels below are open at soft-launch. Coaching and game channels open but cohort rooms are not yet active.

**Open at soft-launch:**

| Category | Channels open |
|---|---|
| WELCOME | All four (#announcements, #rules, #start-here, #verify) |
| CRYPTO — EDUCATION NOT FINANCIAL ADVICE | All four (#crypto-learn, #crypto-charts-analysis, #crypto-strategy, #crypto-journal) |
| STOCKS — EDUCATION NOT FINANCIAL ADVICE | All four |
| FOREX — EDUCATION NOT FINANCIAL ADVICE | All four |
| COMMUNITY | All three (#off-topic, #gaming-nights, #feedback) |
| MOD (hidden) | All three (#mod-log, #scam-reports, #mod-discussion) |
| COACHING | #cohort-announcements and #office-hours open; #replay-review open but empty |
| Voice channels | Office Hours Voice open; Cohort Voice open |

**Held until coaching ladder has active members (ladder v0 checkpoint):**

- Cohort threads in #replay-review (channel exists; threads created when first cohort launches)
- Cohort Voice actively scheduled (channel exists; scheduling begins with first cohort)

**Held until game vertical slice ships (game category wait):**

| Category | Status | Trigger to open |
|---|---|---|
| THE GAME (#sim-runs, #scenario-replays, #leaderboards) | Category created, channels hidden or read-only | Game vertical slice ships and owner confirms playable build is available to community |

Pre-build: create THE GAME category with a placeholder message in #sim-runs:
> "The game is in development. This channel opens when the first playable build is available. Check #announcements for updates."

### Entity formation gate (RISK_REGISTER §19)

NEEDS-HUMAN: before any public-facing launch (public Discord link posted, social accounts pointing to the server, any marketing), confirm entity formation is complete. Per RISK_REGISTER §19, no public community activity before entity is formed.

This is a hard gate, not a suggestion. The blueprint assumes entity formation is complete or in final steps before this checklist is run.

### Pre-launch checklist

- [ ] Entity formed and documented (RISK_REGISTER §19 gate)
- [ ] Server settings complete (§1)
- [ ] All WELCOME channels created with correct pins
- [ ] All three market categories created with verbatim category descriptions
- [ ] All three *-charts-analysis channels have verbatim disclaimer pinned
- [ ] #leaderboards disclaimer pinned
- [ ] #office-hours pinned message in place
- [ ] #mod-log and #scam-reports pins in place
- [ ] All roles created in correct hierarchy order
- [ ] @everyone permissions locked down (no post access outside WELCOME)
- [ ] AutoMod rules configured (§5)
- [ ] Rules screening enabled with verbatim text (§4)
- [ ] Coach Agreement (docs/templates/COACH_AGREEMENT.md) collected for any Coach-role holder before launch
- [ ] THE GAME category created with placeholder message
- [ ] Owner account has 2FA enabled (RISK_REGISTER §11 — operational security)
- [ ] FB winning-trades review complete (SOCIAL_REVIVAL_PLAN §1a gate cleared) and Telegram public channels cleaned BEFORE any Discord invite link is inserted into Telegram pin texts or the FB page.
- [ ] Opening THE GAME category (leaderboard/journal/progression data) also triggers the Phase 2 Compliance Gate (SIM_ENGINE_SPEC §8): COPPA analysis must be complete before any game account or session data is collected from real users, even informally (RISK_REGISTER §10/§14).
- [ ] Confirm GDPR controller/processor posture under Discord's DPA for EU/UK member data before public launch (RISK_REGISTER §14 watch item).

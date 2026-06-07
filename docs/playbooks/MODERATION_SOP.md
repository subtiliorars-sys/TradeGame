# Moderation SOP — TradeGame Discord

Audience: volunteer mods. Read this once before your first shift. Ten minutes.

---

## The one rule you are protecting

Every *-charts-analysis channel has this disclaimer pinned verbatim:

> Posts here are educational discussion only. Nothing posted in this channel constitutes
> financial advice, a trading recommendation, or an investment analysis report. TradeGame
> is not a registered investment adviser or commodity trading adviser.
>
> Removal rule: a post that combines a chart with marked price levels AND language
> implying a specific trade action ("watching this zone," "entry here," "setting alerts at,"
> or equivalent) will be removed without warning. The combination of annotated levels plus
> directional language = an actionable trade idea, regardless of how it is labelled. This
> is a structural rule, not a judgment call.
>
> First removal: post removed + DM warning. Second offense: ban, no appeal.

Your job is to enforce this consistently, not to judge intent.

---

## Content-based removal test

A post is removed if it passes **both**:

- **(a)** Contains a chart or price reference with marked levels, AND
- **(b)** Contains language implying a specific trade action

Trigger phrases for (b): "watching this zone" / "entry here" / "setting alerts at" /
"target at" / "stop below" / "loading here" / "if this breaks I'm in" / "I'd be
buying/selling here" — and functional equivalents.

**The framing doesn't matter.** "Not advice," "just my opinion," "educational only"
appended to the post changes nothing. If it passes (a) + (b), remove it.

**Sequence:**
1. Remove the post immediately — no warning precedes removal.
2. DM the member: first offense warning.
3. Log in #mod-log within 24 hours: date, channel, action, reason (quote the test),
   your name.
4. Second offense: ban. Log immediately. No appeal.

---

## Pump-and-dump / signals / VIP-scam patterns

These are **Pattern B** (coordinated manipulation — highest severity). Act fast.

Watch for:
- Multiple accounts, especially new/low-history ones, pushing the same ticker or token
- "About to move" / "undervalued" / urgency language around a specific asset
- Members who join and immediately spam one asset across channels
- Links to external signal channels, Telegram groups, VIP communities, copy-trading platforms
- Any mention of a paid signal service

**Response:**
1. Remove posts immediately (same content-based rule — no warning).
2. Ban participating accounts. No second chance for coordinated promotion.
3. If members engaged with the content: post a mod notice in the affected channel —
   name the **pattern**, not the asset. Say: "coordinated promotion was removed; reminder —
   nobody here tells you what to buy." **Never name the specific asset publicly** — naming
   it amplifies it even in a warning context.
4. Search server-wide for the asset/handle; sweep any other posts.
5. If the TradeGame brand was used off-platform to legitimize a pump: document everything,
   post a disavowal in #announcements, report the accounts on their platform.
6. Log everything in #mod-log.

---

## DM scam / impersonation patterns

**Signals that a report is real:**
- Member reports a DM from someone claiming to be a TradeGame coach or staff
- The DM offered personal advice, a "special program," or requested payment
- Username resembles a real staff name (impersonation)

TradeGame coaches and staff **never DM first**. This is an absolute rule.

**#scam-reports SLA:**
| Step | Who | Deadline |
|---|---|---|
| Acknowledge the report in #scam-reports | Mod or Helper | 24 hours |
| Investigate: screenshots, identify the account | Moderator | 48 hours |
| Action: report to Discord Trust & Safety; warn community if needed | Admin or Mentor | 48 hours from acknowledgment |
| Log outcome in #mod-log | Moderator | Same day as action |

If volume exceeds capacity: post a community announcement that you are aware and investigating,
set a 72h window, document the overrun.

---

## When to invoke RAID_PLAYBOOK

Read `docs/playbooks/RAID_PLAYBOOK.md` in full. Invoke it when either trigger fires:

- **Pattern A (raid/spam mass-join):** 10+ new members in minutes, identical/near-identical
  posts, flood of DM scam reports arriving simultaneously. Steps: raise verification to
  Highest, pause invites, enable AutoMod blocks, ban wave accounts, lower verification
  over 48h once clear.

- **Pattern B (pump-and-dump infiltration):** multiple accounts pushing the same asset,
  especially with urgency language, across multiple channels. Severity H — treat as critical
  regardless of scale. Follow the pump pattern steps above.

**Never name the pumped asset publicly** in any server channel. Generic pattern description only.

---

## Escalation ladder

```
Helper flags post
  → post message in #mod-discussion with channel link + reason
Coach reviews
  → agrees or disagrees, notes in thread
Mentor decides
  → takes action (remove / warn / mute) → logs in #mod-log
Admin final
  → required for all bans
  → Mentor can ban on second signal offense but must notify Admin within 24h
```

Signal-rule violations: Mentor and above can act immediately without waiting for Coach review.
Speed matters. Do not let a signal post sit.

---

## Three never-do rules

1. **Never create a signals channel** — not under any name, framing, or "educational" label.
   The word "signals" is permanently banned from channel names and descriptions.
2. **Never amplify a member's trade call** — do not quote it, screenshot it, or reference it
   in any public channel, even to criticize it.
3. **Never answer "should I trade X?"** — the answer every time is: "That is your decision.
   Let us look at your process." Redirect to #rules. Never give a directional opinion on
   any asset.

---

## Quick reference

| Situation | Action | Log? |
|---|---|---|
| Chart + levels + directional language | Remove immediately, DM warn | Yes, within 24h |
| Same member, second offense | Ban immediately | Yes, immediately |
| Pump/VIP/signal solicitation | Remove, ban (coordinated = no warning), mod notice (no asset name) | Yes |
| DM scam report | Acknowledge <24h, resolve <48h, report to Discord T&S | Yes |
| Raid signs | Invoke RAID_PLAYBOOK Pattern A | Yes |
| "Should I trade X?" question | Redirect to #rules, no directional answer | No |

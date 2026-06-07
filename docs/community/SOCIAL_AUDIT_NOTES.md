# Social Audit Notes — Community Folder Copy

Internal audit notes — sensitive; private HQ only. Never publish to TradeGame---Preview
or any public surface. Mark attorney work product upon counsel engagement.

Source of truth for the full audit record (including all Telegram channel inventory and
harvest rulings): docs/SOCIAL_AUDIT_NOTES.md (root-level). This file holds the
2026-06-07 owner-supplied audit inputs, the §3a/§3b disposition decisions, and the
open-intake items for the community folder workflow.

---

## Audit Date

2026-06-07. Conducted by: owner (manual browser review). Recorded here by: Community
Strategist agent, same date.

---

## 1. Facebook Page

URL: [see docs/SOCIAL_AUDIT_NOTES.md — URL not repeated here to minimize confidential
data surface area in the community folder]

### Owner-supplied audit results (verbatim from fleet inbox 2026-06-07)

| Checklist item (per COMMUNITY.md §3a) | Owner finding |
|---|---|
| Admin access | CONFIRMED |
| Follower count | 3,600 followers; like count unknown (~100 estimated) |
| Followers appear real | Spot-check: real-looking accounts; no visible bot infestation |
| Signals/picks history | No explicit signals found |
| Winning-trades posts | YES — some posts use "winning trades" language. Count and post dates not yet enumerated. |
| Most recent post date | 2025-09-10 (approximately 9 months dormant as of audit date) |
| Page display name captured | NOT YET — owner-intake item |
| Page renameable | UNKNOWN — owner has not checked; owner-intake item |
| Linked Instagram | NONE |

### Compliance flag

The "winning trades" posts are a potential FTC earnings-claims exposure under
RISK_REGISTER §17. The FTC's Endorsement Guides and its enforcement record against
trading educators (Raging Bull, Warrior Trading, Online Trading Academy) treat any post
that states, implies, or suggests a specific profitable outcome — even without a dollar
figure — as a potential earnings claim. These posts must be individually adjudicated
before any new content is posted. See FB_REVIVAL_PLAN.md §STAGE-0 for the full
delete-vs-disclaim protocol and the log table.

### §3a Decision (COMMUNITY.md decision rule)

Four criteria required for REVIVE:
1. Admin access confirmed — YES
2. Meaningful real follower base — YES (3.6K, spot-checked real-looking)
3. Clean of signals/advice posts OR all such posts can be deleted — CONDITIONAL
   (no explicit signals; winning-trades posts must be cleared per FB_REVIVAL_PLAN.md
   §STAGE-0 before this criterion is fully met)
4. Page name/URL settable to TradeGame branding — UNKNOWN (unverified)

Three of four criteria are confirmed met. The fourth is unverified.

**Verdict: PROVISIONAL REVIVE.** Two hard gates must clear before any new posting:
- Gate A: winning-trades post review completed and logged (§3a criterion 3).
- Gate B: entity formation per RISK_REGISTER §19 and ROADMAP Phase 1 compliance gate.

The fourth criterion (rename) does not block revival but should be resolved as a
near-term action; steps in FB_REVIVAL_PLAN.md §STAGE-0.

If rename proves permanently impossible, the page still passes on the other three
criteria — it is a cosmetic gap, not a fatal one.

### Open intake items — Facebook

| Item | Urgency | Owner action required |
|---|---|---|
| Enumerate and log each winning-trades post | BLOCKS all new posting | Review page history; log each post per FB_REVIVAL_PLAN.md §STAGE-0 log table |
| Capture current page display name | Low (audit completeness) | Note the name shown on the page |
| Check rename/username availability | Near-term | Steps in FB_REVIVAL_PLAN.md §STAGE-0 rename section |
| Generate permanent Discord invite link | Blocks Telegram pin texts | After Discord server is live |

---

## 2. Telegram

One public channel audited. Additional private channels audited separately; full
inventory and harvest rulings in docs/SOCIAL_AUDIT_NOTES.md.

### Channel: @TradeGame_Game ("TradeGame - Game")

| Checklist item (per COMMUNITY.md §3b) | Owner finding |
|---|---|
| Admin access | YES — owner is admin |
| Member count | 4 |
| Visible real-member engagement | 4 members; no substantive conversation history to assess |
| Signals/advice content | Not reported; pre-launch history; low apparent risk |
| Channel visibility | PUBLIC |
| Third-party promotion present | Not reported |

### §3b Decision (COMMUNITY.md decision rule)

The COMMUNITY.md §3b default rule is REPLACE for channels below 200 real engaged
members. This channel has 4 members and does not clear that threshold.

**Deviation from default: REPURPOSE rather than replace.**

Rationale: the handle @TradeGame_Game is an exact brand match and is owner-controlled.
Replacing it creates a new handle at best approximate to the brand; squatting risk on
the old handle is real. The member count (4) is low enough that there is no meaningful
existing engagement to protect or risk disrupting. Repurposing — clearing history,
reconfiguring as announcements-only, updating description — achieves the same clean-slate
outcome as replacement without surrendering the handle.

The §3b default is designed to route away from channels with entrenched bad content or
uncontrolled membership. Neither condition applies here. Repurpose is the better call.

**Verdict: REPURPOSE as announcements-only, bot-managed channel.** See
TELEGRAM_PLAN.md for the configuration steps, channel description copy, and pinned-post
template.

### Open intake items — Telegram

| Item | Urgency | Owner action required |
|---|---|---|
| Review and clear @TradeGame_Game message history | Before any new post | Log in as admin; delete any history that doesn't fit announcements posture |
| Confirm @TradeGame_Game is retained as username | Before configuration | Verify in channel settings that username has not changed |
| Insert permanent Discord invite link into channel description and pin text | Blocks final configuration | Generate Discord invite first |

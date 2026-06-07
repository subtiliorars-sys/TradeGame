# Social Audit Notes

Internal audit notes — sensitive; never publish; mark attorney work product if counsel engages.

This file must never appear in TradeGame---Preview or any public surface. The Facebook URL below and all Telegram invite links are the confidential items. Mark this file attorney work product upon counsel engagement.

---

## Facebook Page

URL: https://www.facebook.com/profile.php?id=100081818004619

Audit checklist: see `docs/COMMUNITY.md` §3a (Facebook Page Audit Checklist) for the full
step-by-step review procedure and the decision rule (revive vs. retire).

This file holds the URL and any audit findings. COMMUNITY.md references this file in place
of the URL so the URL does not appear in any content that could be excerpted for public use.

### Audit status — CLOSED 2026-06-07

Conducted by: owner (manual review via browser).

| Checklist item | Result |
|---|---|
| Admin access confirmed | YES |
| Follower count | 3,600 followers; like count unknown (~100 estimated) |
| Followers appear real | Spot-check: real-looking accounts; no obvious bot infestation |
| Signals/picks history | No explicit signals found; some posts show "winning trades" — see compliance flag below |
| Most recent post date | 2025-09-10 (~9 months dormant) |
| Page name/username renameable | UNKNOWN — owner-intake item (steps in SOCIAL_REVIVAL_PLAN.md §1b) |
| Display name captured | NOT YET — low-priority owner-intake item |
| Linked Instagram | NONE |

**Compliance flag — winning-trades posts:** One or more historical posts show "winning trades"
language. This is a potential FTC earnings-claims exposure (RISK_REGISTER §17). These posts
must be individually reviewed and deleted or disclaimed before any new posting resumes.
See SOCIAL_REVIVAL_PLAN.md §1a for the concrete delete-or-disclaim protocol.

**Decision (§3a rule):** 3 of 4 decision criteria are confirmed met. Fourth criterion
(page renameable to TradeGame branding) is unverified. Verdict: **PROVISIONAL REVIVE.**
Hard gate: winning-trades post review (delete or disclaim each) must be completed and
logged before any new content is posted. Rename confirmation resolves the fourth criterion;
if rename proves impossible the page still passes on the other three, but on-brand URL
should be pursued as a near-term action.

---

## Telegram

Audit checklist: see `docs/COMMUNITY.md` §3b (Telegram Audit Checklist).

### Audit status — CLOSED 2026-06-07

Conducted by: owner (manual review).

Owner context: private channels were personal/friends-only archives. Owner is open to
making them public. Owner ruled 2026-06-07: **HARVEST-THEN-PARK** — archives stay private;
content is harvested into Discord channels, curriculum docs, or GDD as appropriate; then
channels are parked (pinned final message, no further posting). The rejected alternative
(publish private channels as-is) was weighed and declined: unvetted history from
friends-only contexts creates an uncontrolled moderation surface, and content written for
a private audience may contain market commentary, personal opinions, or framing that did
not carry an education-not-advice posture. Vetting first, then deciding what to surface, is
the only safe path.

### Channel inventory

| # | Handle / Name | Visibility | Members | Disposition |
|---|---|---|---|---|
| 1 | @TradeGame_Game "TradeGame - Game" | Public | 4 | REPURPOSE — announcements-only, bot-managed |
| 2 | @TradeGameCrypto "TradeGame - Chat" | Public | 4 | PARK — pin redirect to Discord; retain handle |
| 3 | "TradeGame - Learning Materials" | Private | 4 | HARVEST then PARK private |
| 4 | "TradeGame - Macro market" | Private | 5 | HARVEST then PARK private (highest advice-adjacency risk) |
| 5 | "TradeGame - Incremental Mining" | Private | 2 | HARVEST then PARK private (game-design seeds) |
| 6 | [fifth private channel — signals-related] | Private | — | LEAVE DEAD per owner ruling 2026-06-07 — no revival, no harvest. Cross-reference: docs/SIGNALS_LANDSCAPE.md. No further identifying details recorded by owner ruling. |

#### Channel 1 — @TradeGame_Game
Disposition: REPURPOSE as the announcements-only, bot-managed Telegram surface.
Rationale: handle is on-brand; member count (4) contains nothing to preserve.
Pre-launch action: review and clear message history before any new content.
See SOCIAL_REVIVAL_PLAN.md §3 for the required channel description text.

#### Channel 2 — @TradeGameCrypto
Disposition: PARK. Retain handle to prevent squatting. Post pinned redirect message
then go silent. No discussion runs here; doctrine routes discussion to Discord.
See SOCIAL_REVIVAL_PLAN.md §3 for the verbatim pin text.

#### Channel 3 — "TradeGame - Learning Materials"
Disposition: HARVEST then PARK private.
Harvest lens: curriculum seeds for the education game and HQ docs.
Purge lens: any content that reads as advice-adjacent, market-directional, or
framed as a recommendation — purge from harvest even if kept in archive.
Compliance lens: RISK_REGISTER §17 (FTC) and §6 (signals).
Target for harvested content: curriculum docs and/or game scenario library.

#### Channel 4 — "TradeGame - Macro market"
Disposition: HARVEST then PARK private.
Highest advice-adjacency risk of all five channels.
Harvest lens (strict): educational macro explainers, concept explanations, framework
descriptions with no actionable directional framing — harvest.
Purge list triggers: market calls, forecasts, "watching X level," price targets,
or any language combining an asset name with a directional statement — these go on
a purge list and are deleted from the archive before anything else is surfaced.
Compliance lens: RISK_REGISTER §17 (FTC) and §6 (signals).
Target for harvested content: education docs only; never Discord discussion channels.

#### Channel 5 — "TradeGame - Incremental Mining"
Disposition: HARVEST then PARK private.
Harvest lens: game-design seeds — incremental/idle mechanics intersecting crypto mining
themes; check against docs/GDD.md for ideas worth folding into the game.
Low compliance risk relative to channels 3 and 4, but apply standard purge lens
(RISK_REGISTER §6) to anything market-directional regardless.
Target for harvested content: docs/GDD.md or game design notes.

#### Channel 6 — [fifth private channel, signals-related]
Owner ruled 2026-06-07: leave dead. No revival, no harvest.
No identifying details beyond this entry are recorded. Reference value (names of
third-party signal channels) cross-filed at docs/SIGNALS_LANDSCAPE.md — do not edit
SIGNALS_LANDSCAPE.md here; that cross-reference is noted only.

# Raid / coordinated-manipulation playbook (RISK_REGISTER §22 mechanism)

For the Discord server. Two distinct attack patterns; know which one you're in.

## Triggers (alerts)
- **Mass-join:** join rate exceeds 2× the trailing 7-day average within any
  6-hour window, or more than X new members in 24h (set X at Phase 1 launch
  from observed normal growth; review quarterly).
- **Coordinated enthusiasm:** multiple accounts (esp. new/low-history) pushing
  the same ticker/token/"opportunity" within a short window, in any channel.
- **DM-wave reports:** 2+ member reports in #scam-reports of similar unsolicited
  DMs within 24h.

## Pattern A — raid (spam/disruption mass-join)
1. Raise server verification to Highest (Settings → Moderation) — slows the wave.
2. Pause invites (Server Settings → Invites → Pause). Existing legit members
   are unaffected.
3. Enable/confirm AutoMod block rules (per DISCORD_BLUEPRINT AutoMod table).
4. Ban wave: sort member list by join date; ban raid accounts (Discord supports
   selecting recent joiners). Do not agonize over edge cases — wrongly banned
   real users can appeal via the listed contact.
5. After the wave: lower verification one notch at a time over 48h; unpause
   invites; log the incident (date, scale, vector, response time) below.

## Pattern B — pump-and-dump infiltration (the finance-specific one)
The goal of the attackers is to use our channels or brand to coordinate or
legitimize a pump. This implicates the org in market manipulation — treat it
as severity H regardless of how few accounts are involved.
1. Remove the posts immediately (content-based rule, §6 — no warning first).
2. Ban participating accounts; no second chance for coordinated promotion.
3. Check whether the pushed asset got ANY organic traction in our channels;
   if members engaged, post a mod notice in the affected channel naming the
   pattern (not the asset): "coordinated promotion was removed; reminder —
   nobody here tells you what to buy." Do NOT name the specific asset or token
   in any public post — generic pattern description only; naming it amplifies
   it even in a warning context.
4. Search server-wide for the same asset/handle (Discord search) and sweep.
5. If our BRAND was used off-platform to legitimize a pump (screenshots,
   fake "TradeGame coach" accounts): document everything, post a disavowal in
   announcements, and report the accounts on the platform where they operate.
6. Log below; if the same asset/vector recurs, add its pattern to AutoMod.

## Incident log
| Date | Pattern (A/B) | Scale | Vector | Response time | Notes |
|---|---|---|---|---|---|
| | | | | | |

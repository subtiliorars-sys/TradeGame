# TradeGame — Risk Register

Living document. Each risk has a severity (H/M/L), likelihood (H/M/L), mitigation, and an
owner-trigger — the specific event that forces a re-review. Re-review means the register
entry is reread, the mitigation is reconfirmed current, and any required action is taken
before proceeding.

---

## 1. Regulatory — Investment-Advice Line (US)

**Severity:** H  
**Likelihood:** M (low with correct framing; high if framing drifts)

**The line:** Under US federal law (Investment Advisers Act 1940) and most state law,
providing personalized investment advice for compensation triggers RIA registration.
"Personalized" means advice directed at a specific person about specific securities based
on their situation. Process-coaching — how to read a chart, how to structure a trade plan,
how to manage risk as a discipline — is education, not advice. The moment a coach or any
community resource says "you should buy X" or "I would sell Y in your position," the line
is crossed, regardless of whether money changed hands for that specific exchange.

**What keeps us on the safe side:**
- All coaching framed as process: market structure, position sizing discipline, journaling
  practice, scenario analysis.
- No specific buy/sell guidance in any channel, paid or free.
- Disclaimers on all materials: "This is education, not investment advice. Consult a
  licensed financial professional before making investment decisions."
- Coaching ladder tiers defined by process skill, not outcome performance.

**Owner-trigger:** Any paid coaching product is introduced; any coach gives specific
ticker or entry/exit guidance; any community member or legal authority raises a
compliance concern.

---

## 2. Regulatory — CFTC/NFA (Forex Education)

**Severity:** H  
**Likelihood:** L (low with education framing; higher if any signals or managed accounts emerge)

**The issue:** The CFTC regulates retail forex in the US. Providing signals, managed
accounts, or "commodity trading advice" for compensation requires registration as a CTA
(Commodity Trading Advisor) or CPO. Education about forex mechanics, risk management,
and technical analysis is not inherently regulated; advising on when to trade specific
pairs is.

**Mitigation:**
- Forex content is market-structure education and process-coaching only.
- No forex signals, no managed-account offerings, no "trade this pair now" guidance.
- Any forex-adjacent paid tier reviewed against CTA/CPO thresholds before launch.

**Owner-trigger:** Paid forex-specific coaching introduced; any signal-adjacent content
appears in forex channels; CFTC enforcement action against a comparable educator noted
in public reporting.

---

## 3. Regulatory — Crypto Flux

**Severity:** H  
**Likelihood:** H (regulatory landscape is actively shifting)

**The issue:** The US regulatory status of crypto assets (securities vs. commodities) is
contested and evolving. What is clearly "education about crypto trading" today may be
characterized differently by future enforcement. International rules vary sharply.

**Mitigation:**
- Crypto content framed as education about market mechanics, risk management, and
  on-chain literacy — not advice on specific tokens.
- No token recommendations, no "gem" signals, no yield/staking offers.
- Periodic review: crypto regulatory status must be re-checked at Phase 4 launch even
  if checked earlier (see ROADMAP Phase 4 compliance gate).
- Maintain awareness of SEC/CFTC/state enforcement actions against comparable orgs.

**Owner-trigger:** Major US regulatory action against crypto educators; new legislation
or rule that redefines "investment contract" in a way that touches educational content;
Phase 4 launch.

---

## 4. Regulatory — Paid Coaching Cohorts (HARD GATE)

**Severity:** H  
**Likelihood:** H if launched without legal review

**The issue:** Paid structured coaching combines compensation + advice-adjacent content.
Even a carefully framed process-coaching cohort needs legal review to confirm it falls
outside RIA, CTA, and state-level thresholds.

**Mitigation — REQUIRED, not optional:**
- A licensed attorney with securities/financial-services experience reviews the cohort
  structure, marketing copy, and coaching-ladder language before any cohort is sold.
- This review is documented and stored in HQ repo.
- Phase 4 roadmap gate is a hard stop: no paid cohorts without this review on file.

**Owner-trigger:** Any decision to open paid cohorts. This risk is non-negotiable.

---

## 5. Jurisdiction — Global Discord, US-Centric Rules

**Severity:** M  
**Likelihood:** H (Discord is inherently global)

**The issue:** A global Discord community will include members subject to rules that
differ from US defaults. Leveraged retail forex is restricted or prohibited for retail
traders in the EU (ESMA leverage caps), UK (FCA), Canada, Australia (ASIC), and other
jurisdictions. Some US states have stricter RIA thresholds than federal law.

**Mitigation:**
- Community materials note that trading regulations vary by jurisdiction and members
  are responsible for knowing their local rules.
- No channel advises on leverage ratios as if universally legal; forex content notes
  jurisdiction differences explicitly.
- No brokerage referrals at launch; any affiliate link program treated as a separate
  risk decision requiring its own register entry before activation.
- Education framing (not brokerage substitute) reduces exposure but does not
  eliminate it.

**Owner-trigger:** Affiliate link program introduced; a significant non-US member
concentration emerges; a jurisdiction-specific complaint or legal notice is received.

---

## 6. No-Signal-Selling — Structural, Not Just Policy

**Severity:** H  
**Likelihood:** L (with structural controls); H (without them)

**Why this is an existential risk:** Signal-selling is the dominant scam pattern in
crypto/forex communities. It exposes the org to regulatory action (unregistered CTA/RIA),
destroys community trust when signals fail (and they always eventually fail), and defines
TradeGame as exactly what it is built to oppose. This is not a "we try not to do this"
policy — it is a structural prohibition.

**Structural controls (not just rules):**
- No signal channel exists in the Discord. None. Moderators do not create one "just to
  test." Channel creation requires founder approval.
- Moderators are trained on the definition: a signal is any specific entry, exit, or
  position-size directive tied to a real asset, regardless of how it is framed.
- First offense: post removed + member warned. Second offense: ban, no appeal. This
  is documented in server rules.
- The org does not sell, share, or imply signals in any marketing, even when doing so
  would be profitable. This is a cultural and legal commitment.
- Game leaderboards are process-scored, not outcome-scored, so the sim does not create
  a "signal performance" artifact that could be sold (see §Game-Specific).

**Owner-trigger:** Any moderator or founding member proposes a signal channel or
signal-adjacent product; any paid tier is designed with outcome-based performance
metrics.

---

## 7. Platform — Discord/Facebook/Telegram ToS and Ad Policy

**Severity:** M  
**Likelihood:** M

**The issue:** Discord, Facebook, and Telegram all have ToS provisions and moderation
policies around financial content. Facebook/Meta ad policy severely restricts finance-
adjacent advertising. Any of these platforms can suspend accounts without warning.

**Mitigation:**
- Financial content stays in the "education and community" framing explicitly supported
  by platform policies.
- No ads run on Facebook/Meta without reviewing current ad policy at the time of the
  campaign (policy changes frequently).
- Contingency plan: the org owns its mailing list (established by Phase 3) and a
  website with its own signup path. If Discord suspends the server, the community is not
  lost — it can be reconstituted via the list.
- Telegram channels are supplementary; HQ is Discord + owned properties.

**Owner-trigger:** Platform policy change affecting financial content; account suspension
or warning received on any platform; any paid ad campaign planned on Meta.

---

## 8. Community Harm — Real Money Losses and Blame

**Severity:** H  
**Likelihood:** M (markets will have bad periods; some members will trade real money)

**The issue:** Community members who trade real money and lose may attribute losses to
coaching or content, creating both reputational and potential legal exposure.

**Mitigation:**
- Disclaimers on every piece of coaching content, game surface, and community resource:
  "Past performance in simulation does not predict future results. This is education, not
  financial advice. You can lose money trading."
- Paper-first culture enforced: beginner spaces explicitly prohibit real-money trade
  discussion. Members are encouraged to paper-trade until they have a consistent
  documented process.
- No real-money talk in channels designated as beginner spaces. This is a moderation
  rule, not just a suggestion.
- Coaches do not ask about or encourage disclosure of real-money position sizes.

**Owner-trigger:** Member publicly attributes a real-money loss to org content; a legal
notice or threat is received; a pattern of members skipping paper-trading phase is observed.

---

## 9. Community Harm — Gambling-Adjacent Behavior and Addiction

**Severity:** H  
**Likelihood:** M (trading communities attract compulsive-behavior patterns)

**The issue:** For some members, trading becomes a gambling substitute. The org must
not enable or ignore this. This is both an ethical obligation and a reputational risk.

**Mitigation:**
- Moderation playbook includes a section on addiction-adjacent signals: posts expressing
  loss-chasing, "I can't stop," large loss disclosures, appeals for "one more tip to
  recover," or similar. Moderators are trained to respond with resources, not trading advice.
- Community culture actively promotes process over outcome, patience over urgency.
- Game design: no "chase the loss" mechanic, no time-pressure gambling-style UI patterns
  (see GDD for specifics).
- Mental health resources linked in `#start-here` and `#rules`.

**Owner-trigger:** Moderator identifies a member exhibiting clear addiction-adjacent
patterns; multiple such cases observed in a period; community culture drift toward
outcome obsession is noticed.

---

## 10. Community Harm — Minors

**Severity:** H  
**Likelihood:** L (with controls)

**The issue:** Finance community with a game component is appealing to minors. COPPA
applies to under-13 data collection. Discord's own minimum age is 13. Financial content
directed at minors carries heightened scrutiny.

**Mitigation:**
- Discord age gate enforced; server rules explicitly state 13+ (Discord minimum) and note
  that financial content is intended for adults.
- The org does not target minors in any marketing, social, or game context.
- No data collection outside Discord. When own-platform data collection begins (Tier B
  trigger per governance), COPPA compliance reviewed at that time.
- Game is not marketed as a children's education product.

**Owner-trigger:** Evidence of under-13 members; launch of own platform with user data
collection; any marketing campaign that could reach minors.

---

## 11. Reputational — Impersonation and DM Scams

**Severity:** H  
**Likelihood:** H (this is the standard crypto Discord attack vector)

**The issue:** Scammers create fake accounts impersonating coaches or the org, DM members
with investment offers, phishing links, or fake signal services. This is a near-certainty
at any appreciable community size in crypto/finance Discord spaces.

**Mitigation:**
- Server rule, pinned prominently: "Coaches and staff never DM first. If someone DMs you
  claiming to be from TradeGame, it is a scam."
- Verification system: official accounts have a verified role; members can check in a
  pinned staff list.
- `#scam-report` channel live from Phase 1 launch; scam reports actioned within 24 hours.
- Periodic community announcements reminding members of the DM-scam risk, especially
  after new-member influxes.
- Founder and coach accounts use 2FA; account-takeover prevention is personal operational
  security hygiene.

**Owner-trigger:** First DM scam reported; rapid community growth (new attack surface);
any coach or staff account suspected of compromise.

---

## 12. Reputational — Market Crashes and Sentiment Sours

**Severity:** M  
**Likelihood:** H (markets crash; sentiment will sour)

**The issue:** Extended bear markets or dramatic crashes will cause a subset of members
to blame the community, the coaching, or the game.

**Mitigation:**
- Community culture built on process and long-term thinking from day one; not momentum
  or hype.
- Coaching content explicitly addresses bear-market psychology as a curriculum topic, not
  an afterthought.
- Clear disclaimers in place before any crisis (retroactive disclaimers are not credible).
- Community continues to run its cadence during downturns; do not go dark.

**Owner-trigger:** Major market correction (>30% drawdown in a primary market); spike in
member complaints or churn; visible public criticism of the org tied to market events.

---

## 13. Operational — Key-Person Risk

**Severity:** M  
**Likelihood:** M (solo-founder start)

**The issue:** A solo founder means the org pauses if the founder is unavailable.

**Mitigation:**
- Community self-governance is a design goal from Phase 1: moderators trained, coaching
  ladder creates community leaders.
- Documentation in HQ repo kept current so a successor or returning founder can orient
  quickly.
- AI-agent build team reduces single-point failure on technical build.

**Owner-trigger:** Founder unavailable for more than two weeks; moderator team attrition.

---

## 14. Operational — Member Data

**Severity:** M  
**Likelihood:** L (current) → M (if own platform)

**The issue:** Discord holds member data under Discord's privacy policy. The org currently
collects minimal data beyond what Discord inherently holds. If the org moves to an own
platform, data collection triggers Governance Tier B requirements.

**Mitigation:**
- Collect minimum necessary data in Discord: no DMs soliciting personal info, no forms
  collecting PII beyond email for mailing list.
- Mailing list managed with a reputable ESP; unsubscribe honored immediately.
- Governance Tier B trigger documented: when own-platform member data collection begins,
  privacy policy, data-retention rules, and breach-response plan are required before
  launch.

**Owner-trigger:** Own platform with user accounts is built; mailing list exceeds a scale
where a breach would be material; GDPR complaint received (non-US members).

---

## 15. Game-Specific — Sim Overconfidence

**Severity:** M  
**Likelihood:** H (sim success does not transfer directly to live markets)

**The issue:** A player who performs well in simulation may overestimate their readiness
for live trading. The sim is deliberately riskless; live markets are not.

**Mitigation:**
- "Sim is not the market" friction points built into the game UI at scenario start, end,
  and any leaderboard or results surface (required, not optional — see GDD).
- Coaching ladder advancement based on process metrics (journaling quality, risk-rule
  adherence, scenario analysis) not sim win rate.
- Replay sessions explicitly discuss where sim results diverge from live conditions
  (slippage, liquidity, emotional pressure).
- In-game copy uses language like "practice environment" not "trading simulator" where
  the latter might imply predictive validity.

**Owner-trigger:** Member publicly claims sim performance as evidence of live-trading
readiness; GDD is revised in a way that reduces these friction points.

---

## 16. Game-Specific — Leaderboard Incentives and Process Integrity

**Severity:** M  
**Likelihood:** M (leaderboard dynamics are well-documented to distort behavior)

**The issue:** Outcome-based leaderboards incentivize high-risk behavior that looks like
skill in the short run and teaches the wrong lessons.

**Mitigation:**
- Leaderboards are process-scored: points for journaling, rule-adherence, scenario
  completion, replay participation — not for P&L.
- Outcome-only leaderboards explicitly not implemented (see GDD).
- Design review before any leaderboard feature is added: does this score process or
  outcome? If outcome, it requires explicit founder sign-off and a documented rationale.

**Owner-trigger:** Any proposal to add outcome-based scoring or P&L leaderboards; player
feedback reveals leaderboard gaming that undermines process learning.

---

## Register Maintenance

- This register is reviewed at every phase compliance gate (see ROADMAP).
- Any new platform, revenue stream, or market triggers a review of affected entries.
- Red-team review scheduled after Phase 1 community launch and again before Phase 4.
- Entries are never removed — they are marked superseded if replaced by a stricter control.

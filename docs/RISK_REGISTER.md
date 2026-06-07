# TradeGame — Risk Register

Living document. Each risk has a severity (H/M/L), two-column likelihood score
(Inherent | Residual — inherent = before controls; residual = with controls in place),
mitigation, and an owner-trigger — the specific event that forces a re-review. Re-review
means the register entry is reread, the mitigation is reconfirmed current, and any
required action is taken before proceeding.

**Owner note:** All entries are owned by Founder (sole operator). Because the watcher
and the watched are the same person, every mitigation must be a MECHANISM — a named
template, checklist, or cadence — or it is relabeled "accepted risk." Paper-only
commitments (e.g., "maintain awareness") are escalated below to named-source lists and
monthly review cadences.

---

## Review log

| Date | Event | Verdict |
|------|-------|---------|
| 2026-06-06 | Red-team pass (AI review, no attorney) | GO-WITH-FIXES — all fixes applied in this revision. Re-verification required before Phase 1 compliance gate. Attorney review (§4) remains a hard gate before any revenue. |

---

## 1. Regulatory — Investment-Advice Line (US)

**Severity:** H
**Likelihood:** Inherent H | Residual M (residual depends on controls holding)

**Legal theory — Advisers Act three-prong test (SEC Release IA-1092):**
Registration as an investment adviser is triggered when all three prongs are met:
(a) **Advice about securities** — the statute covers "advisability of investing in
securities generally" and advice about specific securities. Importantly, advice does not
require naming tickers. Market-timing methodology, entry/exit frameworks, asset-allocation
guidance, and any teaching about when or whether to commit capital to securities markets
all qualify as advice about securities. The scope is broad.
(b) **In the business of** — regularity of activity, holding oneself out as an adviser.
A structured coaching ladder delivered to cohorts on a recurring schedule is squarely
in-business even if each session is called "education."
(c) **For compensation** — see §4 for scope; any economic benefit to the org or a coach.

**Publisher's exclusion (Lowe v. SEC) is UNAVAILABLE.** The Supreme Court's Lowe
exclusion protects bona fide publications of general and regular circulation. An
interactive cohort-based coaching ladder — with coach-member dialogue, personalized
feedback, and tiered advancement — is not a publication of general circulation. Do not
rely on Lowe as a defense.

**Load-bearing position:** The org's primary defense is that process-coaching — how to
read a chart, how to structure a trade plan, how to manage risk as a discipline — is not
"advice about securities" at all because it does not direct capital deployment decisions.
This theory is **PLAUSIBLE BUT UNTESTED AND UNCITED.** It has not been validated by
published no-action letters or case law directly on point. The Phase 4 attorney review
must evaluate the theory itself, not just marketing copy. Do not treat current framing
as a confirmed safe harbor.

**Mechanisms:**
- All coaching framed as process only: market structure, position sizing discipline,
  journaling practice, scenario analysis. No coach guidance on whether/when to deploy
  capital into a named or unnamed security.
- No specific buy/sell guidance in any channel, paid or free.
- Disclaimers on all materials (see §6 for required verbatim text in analysis channels):
  "This is education, not investment advice. Consult a licensed financial professional
  before making investment decisions."
- Coaching ladder tiers defined by process skill, not outcome performance.
- Phase 4 attorney review: validates theory itself, not just copy. HARD GATE (see §4).
- **Enforcement awareness:** SEC enforcement actions against trading educators reviewed
  monthly. Named sources: SEC Litigation Releases (sec.gov/litigation), NASAA enforcement
  page. Owner cadence: first Friday of each month.

**Owner-trigger:** Any paid coaching product is introduced; any coach gives specific
entry/exit guidance or market-timing direction on a named or unnamed asset; any community
member or legal authority raises a compliance concern; attorney review at Phase 4.

---

## 2. Regulatory — CFTC/NFA (Forex Education)

**Severity:** H
**Likelihood:** Inherent H | Residual L (with education framing and no signals)

**The issue:** The CFTC regulates retail forex in the US. Providing signals, managed
accounts, or "commodity trading advice" for compensation requires registration as a CTA
(Commodity Trading Advisor) or CPO. Education about forex mechanics, risk management,
and technical analysis is not inherently regulated; advising on when to trade specific
pairs is. The same broad "advice about" scope in §1 applies here under the CEA.

**Mechanisms:**
- Forex content is market-structure education and process-coaching only.
- No forex signals, no managed-account offerings, no "trade this pair now" guidance.
- Any forex-adjacent paid tier reviewed against CTA/CPO thresholds before launch.
- **Enforcement awareness:** CFTC enforcement releases reviewed monthly (same cadence
  as §1; source: cftc.gov/PressRoom).

**Owner-trigger:** Paid forex-specific coaching introduced; any signal-adjacent content
appears in forex channels; CFTC enforcement action against a comparable educator noted
in public reporting.

---

## 3. Regulatory — Crypto Flux

**Severity:** H
**Likelihood:** Inherent H | Residual M (regulatory landscape is actively shifting)

**The issue:** The US regulatory status of crypto assets (securities vs. commodities) is
contested and evolving. What is clearly "education about crypto trading" today may be
characterized differently by future enforcement. International rules vary sharply.
See also §20 (AI×crypto, bots, token touting).

**Mechanisms:**
- Crypto content framed as education about market mechanics, risk management, and
  on-chain literacy — not advice on specific tokens.
- No token recommendations, no "gem" signals, no yield/staking offers.
- Periodic review: crypto regulatory status must be re-checked at Phase 4 launch even
  if checked earlier (see ROADMAP Phase 4 compliance gate).
- **Enforcement awareness:** SEC/CFTC/state enforcement actions against crypto educators
  reviewed monthly (same cadence as §1).

**Owner-trigger:** Major US regulatory action against crypto educators; new legislation
or rule that redefines "investment contract" in a way that touches educational content;
Phase 4 launch.

---

## 4. Regulatory — Monetization Gate (HARD GATE)

**Severity:** H
**Likelihood:** Inherent H | Residual H if launched without legal review

**The issue — scope of "compensation" under the Advisers Act:** Compensation is defined
as any economic benefit to the adviser, analyzed org-wide, not per-product. The following
all count as compensation while the coaching ladder operates:

- Paid cohorts, paid tiers, subscriptions
- Donations, tips, Patreon/Ko-fi, Ko-fi memberships
- Discord Server Subscriptions, paid Discord roles
- Game cosmetics, battle passes, or any premium game purchase
- Affiliate or referral revenue
- Any revenue received by a coach personally — Venmo tips, direct payment, in-kind
  gifts of material value

Signed coach agreements are required, explicitly prohibiting personal monetization in
any form (Venmo tips, direct payment, gifts). Non-monetary coach benefits — early
access to features, exclusive cosmetics, recognition beyond a role label — trigger
re-evaluation of CTA/RIA compensation analysis and must be pre-cleared.

**Mechanisms — REQUIRED, not optional:**
- A licensed attorney with securities/financial-services experience reviews the full
  monetization structure, marketing copy, coaching-ladder language, and compensation
  arrangements (org and coach) before any revenue is received in any form.
- This review is documented and stored in HQ repo.
- Signed coach agreements on file before any coach operates.
- Phase 4 roadmap gate is a hard stop: no revenue of any kind without this review on
  file.

**Owner-trigger:** Any decision to introduce revenue of any kind; any coach compensation
arrangement (monetary or non-monetary material benefit); any cosmetic or premium game
feature. This risk is non-negotiable.

---

## 5. Jurisdiction — Global Discord, US-Centric Rules

**Severity:** M
**Likelihood:** Inherent H | Residual M (Discord is inherently global)

**The issue:** A global Discord community will include members subject to rules that
differ from US defaults. Leveraged retail forex is restricted or prohibited for retail
traders in the EU (ESMA leverage caps), UK (FCA), Canada, Australia (ASIC), and other
jurisdictions. Some US states have stricter RIA thresholds than federal law.

**Attorney review scope note:** The Phase 4 attorney review must explicitly include
non-US analysis, particularly the UK/EU forex-leverage circumvention angle — an org
teaching leverage strategies to UK/EU retail members may be viewed as circumventing
FCA/ESMA rules even if based in the US.

**Mechanisms:**
- Community materials note that trading regulations vary by jurisdiction and members
  are responsible for knowing their local rules.
- No channel advises on leverage ratios as if universally legal; forex content notes
  jurisdiction differences explicitly.
- No brokerage referrals at launch; any affiliate link program treated as a separate
  risk decision requiring its own register entry before activation.
- Education framing (not brokerage substitute) reduces exposure but does not
  eliminate it.

**Owner-trigger:** Affiliate link program introduced; a significant non-US member
concentration emerges; a jurisdiction-specific complaint or legal notice is received;
Phase 4 attorney review scope set.

---

## 6. No-Signal-Selling — Structural, Not Just Policy

**Severity:** H
**Likelihood:** Inherent H | Residual L (with structural controls); H (without them)

**Why this is an existential risk:** Signal-selling is the dominant scam pattern in
crypto/forex communities. It exposes the org to regulatory action (unregistered CTA/RIA),
destroys community trust when signals fail (and they always eventually fail), and defines
TradeGame as exactly what it is built to oppose. This is not a "we try not to do this"
policy — it is a structural prohibition.

**Content-based removal criteria (not channel-naming-based):** A post is a signal and
must be removed if it contains a specific entry, exit, or position-size directive tied to
a real asset, regardless of channel or framing. A chart with marked levels plus "watching
this zone" = actionable trade idea = remove. The test is content, not where it was posted.

**Required verbatim disclaimer — pinned in every \*-charts-analysis channel:**
> "Posts here are educational discussion only. Nothing posted in this channel constitutes
> financial advice, a trading recommendation, or an investment analysis report. TradeGame
> is not a registered investment adviser or commodity trading adviser."

This disclaimer must be pinned before the channel is open to posting. Owner checklist
item for every new analysis channel.

**Leaderboard resolution:** Leaderboards are process-scored ONLY. No P&L ranking
component exists in any leaderboard feature. This overrides any GDD language to the
contrary. See §16.

**Structural controls (not just rules):**
- No signal channel exists in the Discord. None. Moderators do not create one "just to
  test." Channel creation requires founder approval.
- Moderators are trained on the content-based removal criteria above.
- First offense: post removed + member warned. Second offense: ban, no appeal. This
  is documented in server rules.
- The org does not sell, share, or imply signals in any marketing, even when doing so
  would be profitable. This is a cultural and legal commitment.
- Game leaderboards are process-scored, not outcome-scored (see §16 and above).
- **Moderation log:** signal removal actions logged in a named moderator log channel
  (mod-log or equivalent). Owner reviews weekly.

**Owner-trigger:** Any moderator or founding member proposes a signal channel or
signal-adjacent product; any paid tier is designed with outcome-based performance
metrics; any analysis-channel post matching the content-based removal criteria is not
removed within 24 hours.

---

## 7. Platform — Discord/Facebook/Telegram ToS and Ad Policy

**Severity:** M
**Likelihood:** Inherent M | Residual M

**The issue:** Discord, Facebook, and Telegram all have ToS provisions and moderation
policies around financial content. Facebook/Meta ad policy severely restricts finance-
adjacent advertising. Any of these platforms can suspend accounts without warning.

**Mechanisms:**
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
**Likelihood:** Inherent H | Residual M (markets will have bad periods; some members
will trade real money)

**The issue:** Community members who trade real money and lose may attribute losses to
coaching or content, creating both reputational and potential legal exposure.

**Mechanisms:**
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
notice or threat is received; a pattern of members skipping paper-trading phase is
observed.

---

## 9. Community Harm — Gambling-Adjacent Behavior and Addiction

**Severity:** H
**Likelihood:** Inherent H | Residual M (trading communities attract compulsive-behavior
patterns)

**The issue:** For some members, trading becomes a gambling substitute. The org must
not enable or ignore this. This is both an ethical obligation and a reputational risk.

**Mechanisms:**
- Moderation playbook includes a section on addiction-adjacent signals: posts expressing
  loss-chasing, "I can't stop," large loss disclosures, appeals for "one more tip to
  recover," or similar. Moderators are trained to respond with resources, not trading
  advice.
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
**Likelihood:** Inherent H | Residual M

**Likelihood rationale:** Game + gamer audience + TikTok short-form marketing = minors
are a core demographic, not an edge case. The Discord 13+ birthdate gate is worthless as
a verification mechanism — it is self-reported and trivially bypassed.

**The issue:** COPPA applies to under-13 data collection. Financial content directed
at minors carries heightened regulatory scrutiny. The org must maintain an 18+ audience
floor for all financial-coaching content, distinct from the 13+ platform floor Discord
sets.

**Mechanisms:**
- Server rules state 18+ for financial-coaching channels and all coaching ladder
  participation. The 13+ Discord minimum is the platform floor, not the org's floor.
- Marketing-creative review rule: any piece of marketing content (TikTok, short-form
  video, social copy) is reviewed before posting to confirm it does not target or
  disproportionately appeal to under-18 audiences.
- Age screen at game account creation: users must affirm 18+ (or 13+ for game-only,
  gated away from coaching features) before any account data is stored.
- **COPPA analysis required BEFORE the game stores any account data** — this is a
  hard gate at Phase 2 game build, not a post-launch cleanup. See §14.
- Moderation redirects minors away from leveraged-product discussion and coaching
  channels; moderators trained to apply this redirect.
- The org does not target minors in any marketing, social, or game context.

**Owner-trigger:** Evidence of under-13 members; Phase 2 game build with account data
collection begins; any marketing campaign reaching a predominantly under-18 audience;
COPPA analysis not complete before game account data storage begins.

---

## 11. Reputational — Impersonation and DM Scams

**Severity:** H
**Likelihood:** Inherent H | Residual M (this is the standard crypto Discord attack
vector)

**The issue:** Scammers create fake accounts impersonating coaches or the org, DM members
with investment offers, phishing links, or fake signal services. This is a near-certainty
at any appreciable community size in crypto/finance Discord spaces.

**Mechanisms:**
- Server rule, pinned prominently: "Coaches and staff never DM first. If someone DMs you
  claiming to be from TradeGame, it is a scam."
- Verification system: official accounts have a verified role; members can check in a
  pinned staff list.
- `#scam-report` channel live from Phase 1 launch.
- **Scam report SLA:** Solo-founder realistic SLA is 48 hours (not 24 hours — 24h is
  not sustainable without staff). Acknowledge within 24h; resolve/action within 48h.
  This is the committed cadence, not an aspiration. Escalate if volume exceeds capacity.
- Periodic community announcements reminding members of the DM-scam risk, especially
  after new-member influxes.
- Founder and coach accounts use 2FA; account-takeover prevention is personal operational
  security hygiene.

**Owner-trigger:** First DM scam reported; rapid community growth (new attack surface);
any coach or staff account suspected of compromise.

---

## 12. Reputational — Market Crashes and Sentiment Sours

**Severity:** M
**Likelihood:** Inherent H | Residual M (markets crash; sentiment will sour)

**The issue:** Extended bear markets or dramatic crashes will cause a subset of members
to blame the community, the coaching, or the game.

**Mechanisms:**
- Community culture built on process and long-term thinking from day one; not momentum
  or hype.
- Coaching content explicitly addresses bear-market psychology as a curriculum topic,
  not an afterthought.
- Clear disclaimers in place before any crisis (retroactive disclaimers are not credible).
- Community continues to run its cadence during downturns; do not go dark.

**Owner-trigger:** Major market correction (>30% drawdown in a primary market); spike in
member complaints or churn; visible public criticism of the org tied to market events.

---

## 13. Operational — Key-Person Risk

**Severity:** M
**Likelihood:** Inherent H | Residual M (solo-founder start)

**The issue:** A solo founder means the org pauses if the founder is unavailable.

**Mechanisms:**
- Community self-governance is a design goal from Phase 1: moderators trained, coaching
  ladder creates community leaders.
- Documentation in HQ repo kept current so a successor or returning founder can orient
  quickly.
- AI-agent build team reduces single-point failure on technical build.

**Owner-trigger:** Founder unavailable for more than two weeks; moderator team attrition.

---

## 14. Operational — Member Data

**Severity:** M
**Likelihood:** Inherent M | Residual L (Discord phase) → Residual M (Phase 2 game
build)

**The issue:** Discord holds member data under Discord's privacy policy. The org currently
collects minimal data beyond what Discord inherently holds.

**Phase 2 trigger is now — not later:** The GDD's vertical slice stores accounts,
portfolios, XP, and journal entries. Journal entries are sensitive financial-behavior PII.
The "no own-platform data currently" posture is false by Phase 2. Governance Tier B
requirements (privacy policy, data-retention rules, breach-response plan, COPPA analysis)
must be completed before Phase 2 game build ships any user data, not after.

**GDPR/UK GDPR watch item:** During the Discord phase, the org is processing EU/UK
members' data. Confirm controller/processor posture under Discord's Data Processing
Agreement and the org's own terms. If the org operates as a controller with respect to
EU/UK member data (e.g., collecting email addresses, running bots that log data), GDPR
obligations attach. Owner action: review before Phase 1 public launch.

**Mechanisms:**
- Collect minimum necessary data in Discord: no DMs soliciting personal info, no forms
  collecting PII beyond email for mailing list.
- Mailing list managed with a reputable ESP; unsubscribe honored immediately.
- Governance Tier B trigger: privacy policy, data-retention rules, and breach-response
  plan required before Phase 2 game build ships any account data.
- COPPA analysis: required before any game account data is stored (see §10).
- GDPR/UK GDPR posture confirmed before Phase 1 public launch.

**Owner-trigger:** Phase 2 game build begins with user accounts; mailing list exceeds a
scale where a breach would be material; GDPR complaint received (non-US members); any
Discord bot or tool collects member data on behalf of the org.

---

## 15. Game-Specific — Sim Overconfidence

**Severity:** M
**Likelihood:** Inherent H | Residual M (sim success does not transfer directly to live
markets)

**The issue:** A player who performs well in simulation may overestimate their readiness
for live trading. The sim is deliberately riskless; live markets are not.

**Mechanisms:**
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
**Likelihood:** Inherent M | Residual L (with process-only scoring)

**The issue:** Outcome-based leaderboards incentivize high-risk behavior that looks like
skill in the short run and teaches the wrong lessons.

**Resolved:** Leaderboards are process-scored ONLY — points for journaling, rule-
adherence, scenario completion, replay participation. No P&L ranking component in any
leaderboard feature, anywhere. This is a hard architectural constraint, not a design
preference. See §6 for the register-level resolution of any contradiction.

**Mechanisms:**
- Outcome-only leaderboards explicitly not implemented (see GDD).
- Design review before any leaderboard feature is added: does this score process or
  outcome? If outcome, it is rejected. No override path exists without a register
  amendment and a red-team pass.

**Owner-trigger:** Any proposal to add outcome-based scoring or P&L leaderboards; player
feedback reveals leaderboard gaming that undermines process learning.

---

## 17. Regulatory — FTC Deceptive Earnings Claims and Endorsement Guides

**Severity:** H
**Likelihood:** Inherent H | Residual M

**The FTC is the dominant enforcer against trading educators.** Reference actions:
Raging Bull (FTC, $137M consent order); Warrior Trading (FTC, ~$3M, 2022); Online
Trading Academy (FTC). The SEC is not the primary threat here — the FTC is.

**Triggers:**
- Implied earnings claims: any marketing that suggests members can or do make money
  (even without stating a number).
- Success stories, member-win showcases, cohort-graduation posts.
- COMMUNITY.md schedules monthly cohort-graduation showcases — every showcased outcome
  is an FTC Endorsement Guides event: (a) material-connection disclosure required
  (member received coaching from this org), (b) typicality disclosure required ("results
  not typical; most participants do not achieve similar outcomes").
- Testimonials used in any marketing context: same two disclosures apply.

**Exposure scales with community success.** A larger, more visible community with more
member wins = higher FTC scrutiny target, not lower. Controls must scale with growth.

**Mechanisms:**
- Earning-claim review: any marketing copy, social post, or community announcement
  referencing member outcomes reviewed against FTC Guides before publishing.
  Owner checklist item for every marketing piece.
- Standard disclosure block drafted and stored in HQ; copy-paste into any testimonial
  or success-story context.
- Community.md graduation showcase events: disclosure block mandatory; no showcase
  published without it.
- Moderator training: member posts in community channels that constitute implied earnings
  claims (screenshots of wins, "I made X using this method") are not amplified by org
  accounts without disclosure treatment.
- **Enforcement awareness:** FTC enforcement actions against trading educators reviewed
  monthly (source: ftc.gov/news-events/actions, search "trading"). Same cadence as §1.

**Owner-trigger:** Any marketing content referencing member outcomes; first cohort
graduation showcase; any paid advertising featuring results; community size crosses 1,000
members (increased visibility threshold).

---

## 18. Coach and UGC Liability

**Severity:** H
**Likelihood:** Inherent H | Residual M

**The issue:** Org-credentialed volunteer coaches giving personalized guidance in cohort
calls create vicarious liability and aiding-abetting unregistered-adviser exposure for
both the org and the founder personally. Member-to-member advice in org-branded channels
compounds this — curation of such content (pinning, amplifying, featuring) worsens the
org's Section 230 posture (platform vs. publisher distinction).

**Mechanisms:**
- Signed coach code-of-conduct required before any coach operates: explicitly defines
  what constitutes a signal or personalized advice, prohibits both, and acknowledges that
  violations may expose both the coach and the org to regulatory action.
- Spot-check/audit of cohort content: founder or designated monitor reviews a sample
  of each cohort session (recording or notes) within one week of delivery. Checklist
  stored in HQ.
- Takedown SLA for advice posts: **named owner = Founder.** SLA: 48 hours from report
  to removal action. Posts flagged by moderators as personalized advice or signals are
  escalated immediately; founder action within 48h.
- Do not pin, feature, or amplify member posts that contain actionable trade guidance.
  Amplification converts platform behavior to publisher behavior.
- Coach agreements (see §4) also cover this: personal monetization prohibition and
  code-of-conduct are a single signed document.

**Owner-trigger:** Any coach credentialed by the org operates; any cohort call occurs;
a moderator flags a member post as personalized advice; org account amplifies
member-trade content.

---

## 19. Legal Entity and Insurance

**Severity:** H
**Likelihood:** Inherent H | Residual M

**The issue:** Every risk in this register currently lands on the founder personally.
No entity means no liability shield.

**Mechanisms — GATES:**
- Entity formation (LLC or corp, jurisdiction TBD with counsel) is gated BEFORE Phase 1
  public-facing activity. No public Discord launch, no public website, no community
  marketing before entity is formed and documented in HQ.
- E&O (errors & omissions) and media-liability insurance reviewed and bound BEFORE
  Phase 4 monetization. Attorney can advise on appropriate coverage for an education/
  coaching org at that stage.
- All contracts (coach agreements, platform terms of service, privacy policy) executed
  in the entity's name, not the founder's personal name.

**Owner-trigger:** Phase 1 public launch planned (entity formation gate); Phase 4
monetization planned (insurance gate); any coach agreement drafted.

---

## 20. AI x Crypto, Bots, and Token Touting

**Severity:** M
**Likelihood:** Inherent M | Residual L

**The issue:** The org is one collaboration away from inadvertently promoting a
third-party trading bot or tool. FTC material-connection rules apply to any tool or
service endorsed or featured in org channels where a relationship (monetary or otherwise)
exists. CTA adjacency risk: a featured tool that provides trade signals is a CTA product;
endorsing it without disclosure may implicate the org. Named gaming tokens used in the
sim are plausibly unregistered securities — the sim is not a safe harbor for evaluative
content about real tokens.

**Mechanisms:**
- Editorial rule: named-token content in the sim and any educational channel is
  mechanics-only (how the token ecosystem works, volatility characteristics, on-chain
  mechanics). Never evaluative (price targets, "undervalued," "strong buy," project
  opinions).
- Partner/paid-relationship disclosure policy: any mention of a third-party tool,
  platform, or service in org channels where a material connection exists (monetary or
  non-monetary benefit to the org or a coach) must be disclosed. Template disclosure
  stored in HQ.
- Securities Act §17(b) anti-touting: any compensation received for promoting a security
  (including tokens) must be disclosed in the promotion. Policy: org channels do not
  promote named tokens for compensation, period.
- Pre-collaboration checklist: before any tool/bot/platform collaboration is announced,
  review against CTA adjacency risk and FTC disclosure requirements. Checklist stored
  in HQ.

**Owner-trigger:** Any third-party tool or bot featured in org channels; any token
featured in a non-mechanics context; any compensation received for mentioning a
third-party product; any collab or partnership announced.

---

## 21. OFAC and Sanctions Compliance

**Severity:** M
**Likelihood:** Inherent M | Residual L

**The issue:** Global community + future paid products means the org will transact with
members in jurisdictions subject to OFAC sanctions (Iran, North Korea, Cuba, Russia
(certain sectors), others). Processing payments to/from sanctioned jurisdictions is a
strict-liability violation — intent is irrelevant.

**Mechanisms:**
- Trigger: first paid product.
- Payment processor selection: use processors (Stripe, etc.) with built-in OFAC/sanctions
  screening as a minimum requirement. Confirm geo-blocking capability before activation.
- Terms of Service: explicit exclusion of sanctioned jurisdictions from eligibility for
  paid products.
- Community terms: sanctions-jurisdiction members may participate in free content;
  cannot transact. Document this distinction clearly.
- Cost of mitigation is low; do not defer.

**Owner-trigger:** First paid product introduced; payment processor selected; any member
from a sanctions-listed jurisdiction attempts to transact.

---

## 22. Coordinated Manipulation and Raid Risk

**Severity:** M
**Likelihood:** Inherent M | Residual L

**The issue:** Pump-and-dump crews and coordinated bad actors use trading community
channels to amplify specific assets, recruit participants, and then exit. An org-branded
channel used for coordinated manipulation exposes the org to regulatory attention and
community destruction.

**Mechanisms:**
- Raid playbook: documented response protocol in HQ for sudden coordinated new-member
  influx. Trigger: more than X new members in a 24h period (set threshold at Phase 1
  launch based on normal growth rate).
- Mass-join heuristic: moderator alert when join rate exceeds 2x the trailing 7-day
  average in any 6-hour window.
- "Sudden coordinated ticker enthusiasm" trigger: if multiple new accounts post about
  the same named asset within a short window, moderators flag for founder review before
  any engagement or amplification.
- Channel creation gate (see §6): no new channels without founder approval reduces
  surface area for coordinated channel creation.
- Moderation log (see §6): raid activity logged and preserved.

**Owner-trigger:** Rapid new-member influx; multiple new accounts mentioning same asset;
any external report of the org's channels being used for coordination.

---

## 23. Market-Data Licensing and Scenario IP

**Severity:** M
**Likelihood:** Inherent M | Residual L (with license review gate)

**The issue:** Free-tier data feeds (CoinGecko, polygon.io, Alpha Vantage, and similar)
prohibit redistribution and derivative use in their terms of service. "Educational use"
is not a recognized ToS carve-out — it is not a safe harbor. Historical price data
used in game scenarios may be subject to database rights or vendor licensing requirements.
This mirrors GDD open questions Q1/Q2.

**Mechanisms:**
- Hard gate: no real or historical market data integrated into the game (even for
  scenarios) without license review. This gate applies at Phase 2 game build.
- Before Phase 2: identify candidate data providers, review their ToS (redistribution,
  derivative works, educational-use provisions), and obtain appropriate licensing or
  select a provider whose terms permit the intended use.
- Fictional/synthetic scenario data (generated price series, not real historical data)
  may be used freely and is the default until licensing is confirmed.
- Attorney review at Phase 4 to include data licensing posture.

**Owner-trigger:** Phase 2 game build begins; any real or historical market data
integration proposed; any data provider ToS reviewed or changed.

---

## 24. Voice Surfaces — Cohort Calls, Office Hours, AMAs

**Severity:** M
**Likelihood:** Inherent M | Residual L

**The issue:** Cohort calls, office hours, and AMAs are unlogged real-time surfaces where
"should I trade X" gets asked and where an off-script coach or host may answer in a way
that crosses the investment-advice line. Unlike text channels, voice surfaces leave no
automatic record.

**Mechanisms:**
- Record-or-two-staff-present rule: every cohort call, office hours session, or AMA is
  either recorded (with participant notice) or conducted with at least two org-affiliated
  staff/coaches present. No solo unrecorded voice sessions with members.
- AMA question pre-screening: questions submitted in advance; host reviews and reframes
  or declines "should I trade X" style questions before the session. Live-question format
  is higher risk; if used, host has a prepared redirect script ("That's a specific trading
  decision — I can talk about the process considerations, but I can't tell you what to do").
- Rename convention: any event previously called "trade review Q&A" or similar is renamed
  to process/replay language. Examples: "Replay Session," "Process Review," "Scenario
  Debrief." The name itself sets listener expectations.
- Recordings stored in HQ repo (or linked from HQ) for at least 12 months.

**Owner-trigger:** Any cohort call, AMA, or office hours event scheduled; any coach
conducts a voice session without following the record-or-two-staff rule; any recording is
not stored per the retention policy.

---

## 25. Tax-Advice Adjacency

**Severity:** L
**Likelihood:** Inherent M | Residual L

**The issue:** Trading communities naturally surface tax questions (wash sale rules, crypto
cost-basis, tax-loss harvesting timing). A coach or moderator who answers a specific tax
question may be providing unauthorized tax advice.

**Mechanisms:**
- Moderation rule: tax-specific questions receive a standard redirect macro, not an
  answer. Macro text: "Tax treatment varies by jurisdiction and individual situation —
  please consult a licensed tax professional (CPA or tax attorney) for guidance on your
  specific circumstances."
- Redirect macro stored in HQ and pinned in moderator resources.
- Educational content may discuss tax *concepts* (what wash sale rules are, how crypto
  is generally treated) but must not address a specific member's tax situation.

**Owner-trigger:** Any coach or moderator answers a specific member tax question with
a direct answer rather than a redirect; any educational content veers into member-
specific tax guidance.

---

## Register Maintenance

- This register is reviewed at every phase compliance gate (see ROADMAP).
- Any new platform, revenue stream, or market triggers a review of affected entries.
- Red-team review: completed 2026-06-06 (see review log above). Next scheduled: before
  Phase 1 community launch and again before Phase 4.
- Entries are never removed — they are marked superseded if replaced by a stricter control.
- Owner is Founder throughout. Each mitigation must be a named mechanism (template,
  checklist, or cadence). Any mitigation that is not a mechanism is an accepted risk and
  labeled as such.

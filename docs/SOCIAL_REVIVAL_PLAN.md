# Social Revival Plan

Internal operational plan — private HQ only. Owner executes each step.
Audit source: docs/SOCIAL_AUDIT_NOTES.md (closed 2026-06-07).

---

## 1. Facebook Revival Sequence

Gate: complete steps 1a through 1c IN ORDER. Do not post anything until 1a is fully logged.

### 1a. Winning-Trades Post Review (hard gate — MUST complete before any new posting)

This step exists because some historical posts show "winning trades" language, which is
a potential FTC earnings-claims violation (RISK_REGISTER §17). Every such post must be
individually adjudicated before the page goes active.

**Protocol — for each post in page history:**

1. Open the post. Ask: does this post state, imply, or suggest a specific earnings result,
   win rate, or profitable outcome — even without a dollar figure?
   - "Won on this trade," "called it," "green again," "winning trade," any screenshot
     showing profit, any language that implies readers could replicate a result = YES.
   - Pure concept post, process post, announcement with no outcome framing = NO.

2. If YES: preferred action is **delete** (click post menu > Delete > confirm).
   If deletion would remove context other posts depend on, **edit instead**: remove
   the earnings-claim language and add this disclosure block verbatim at the top of
   the post body (from docs/templates/DISCLOSURE_BLOCK.md §A):

   > [Member] is a TradeGame community member. Their experience is their own and
   > is not typical or guaranteed — most people who trade lose money. TradeGame
   > is education, not financial advice, and showcases learning progress, not
   > trading profits. [If any relationship exists: "Member receives X from
   > TradeGame" — e.g., a coach role, early access, cosmetics.]

   For posts featuring the owner rather than a named member, replace "[Member]" with
   "This post" and adapt accordingly.

3. Log each action in a plain text or spreadsheet file on your device:
   - Post date
   - Brief description (3–5 words)
   - Action taken: Deleted / Edited+disclaimed / Clean (no action needed)

4. When every post in history has a log entry and all YES posts are resolved: the
   winning-trades gate is cleared. Note the date.

NEEDS-HUMAN: browser access to the Facebook page to review, delete, and edit posts.

### 1b. Rename Check (plain-language steps for Chromebook browser)

Goal: confirm the page URL/username can be set to TradeGame branding.

1. Go to your Facebook page. Click the page name at the top to open it.
2. Click the three-dot menu (More) under the page cover photo, then click "Edit Page Info"
   — OR — click "Settings" in the left sidebar.
3. In Page Info or General Settings, look for "Name" and "Username" (the @handle that
   appears in your page URL).
4. If "Name" is editable: change it to "TradeGame" (or your chosen on-brand variant).
   Note: Facebook limits name changes; if a change was made recently it may be locked.
5. If "Username" is editable: set it to tradegame or tradegameofficial (check availability).
   Your page URL will become facebook.com/[username].
6. Save both. If either field is greyed out or locked, note why and add it to the
   owner-intake queue (record in §5 below).

NEEDS-HUMAN: browser access with page admin login.

### 1c. Brand Refresh Checklist

Complete after 1a and 1b. Before uploading anything, confirm the education-not-advice
posture is reflected in all visual and text elements.

- [ ] **Profile photo (avatar):** TradeGame logo or wordmark. No charts, no candlesticks,
      no dollar signs, no "profit" imagery.
- [ ] **Cover photo:** On-brand. Can show the game, a community scene, or a concept
      visual. No performance results, no "join our winning community" language.
- [ ] **About / Page description:** Must include the phrase "education, not financial
      advice" or equivalent. No claims about member results, returns, or win rates.
      Suggested text: "TradeGame — community-first trading education and a sim game for
      gamer-traders. Education only. No signals, no advice, no performance promises."
- [ ] **Call-to-action button:** Set to "Learn More" pointing to the Discord invite or
      the game landing page. Do not use "Sign Up" with any implied earnings promise in
      surrounding text.
- [ ] **Category:** Set to "Education" not "Financial Service."

NEEDS-HUMAN: browser access with page admin login.

### 1d. Relaunch Gate

Do not post new content until ALL of the following are ticked:

- [ ] Step 1a complete — winning-trades review log exists; all flagged posts resolved.
- [ ] Step 1b complete — rename confirmed or documented as not-yet-possible.
- [ ] Step 1c complete — brand refresh live.
- [ ] ROADMAP Phase 1 entity gate passed (attorney review; see RISK_REGISTER §4).

---

## 2. First-Month Facebook Content Drafts

Eight ready-to-post drafts, two per week, four weeks. Pillar rotation: Crypto / Stocks /
Forex / Game Devlog. Every draft ends with the verbatim §C footer from
docs/templates/DISCLOSURE_BLOCK.md. Zero performance claims. Attraction-not-promotion tone.

All drafts marked: **DRAFT — owner approves and posts; do not schedule automatically.**

Posting cadence maps to COMMUNITY.md §4: Monday (Market Monday) and Wednesday
(Game Wednesday) or Friday (Replay Friday) in alternating weeks.

---

### Week 1

**Draft W1-A — Monday, Market Monday (Crypto)**

What is a risk/reward ratio — and why it matters more than win rate.

Most traders track whether they "won" or "lost" a trade. A better question: what was
the ratio? A 1:3 risk/reward means you can be wrong more often than you are right and
still come out ahead over time. The TradeGame sim builds this into every scenario so
you practice the math before any real money is involved.

What ratio do you typically target? Drop it below.

Education, not financial advice. Trading involves risk of significant loss. Simulated
results are not real trading. No signals, ever.

---

**Draft W1-B — Wednesday, Game Devlog**

Building the sim's first scenario set: what we got right, what broke, and what we
rebuilt.

Designing a trading sim that actually teaches something is harder than it sounds. The
first pass had players optimizing for score rather than process — the wrong outcome. So
we rebuilt the scoring layer around decision quality: did you size correctly, did you
journal, did you follow your stated rule?

The game is still in design. This is where the design stands today — no playable build exists yet.

[Attach: design sketch or spec excerpt — must be clearly labeled as design-stage material, not gameplay]

Education, not financial advice. Trading involves risk of significant loss. Simulated
results are not real trading. No signals, ever.

---

### Week 2

**Draft W2-A — Monday, Market Monday (Stocks)**

Position sizing: the concept most beginners skip entirely.

You can be right about a stock's direction and still blow up your account — if you
sized too large. Position sizing is the discipline of deciding how much of your capital
to allocate to a single trade based on where your stop loss sits and what you are
willing to lose on the trade. It is one of the first skills the TradeGame sim puts in
front of new players, because it is foundational to everything else.

No formula here is financial advice — this is the concept. Study it.

Education, not financial advice. Trading involves risk of significant loss. Simulated
results are not real trading. No signals, ever.

---

**Draft W2-B — Wednesday, Game Devlog**

**HOLD — DO NOT POST until a playable vertical-slice build has shipped and owner confirms (ROADMAP Phase 2).**

Community feature sneak peek: the replay-review system.

One of the things that separates TradeGame from a generic sim: every session generates
a replay. You can go back, annotate your decision points, and share them with a coach
or the community for review. No PnL required — the review is about process, not outcome.

This feature is part of the game design — here is how we are thinking about it and
why the process-over-outcome framing shapes every design decision.

Education, not financial advice. Trading involves risk of significant loss. Simulated
results are not real trading. No signals, ever.

---

### Week 3

**Draft W3-A — Monday, Market Monday (Forex)**

Why forex traders talk about pips — a plain-language explainer.

A pip is the smallest standardized price move in a currency pair. For most pairs it is
the fourth decimal place. Why does it matter? Because your risk is measured in pips
before it is measured in dollars. Knowing how many pips to your stop, and what one pip
is worth in your account currency, is a core skill. The TradeGame forex scenarios build
this literacy from the first session.

Education, not financial advice. Trading involves risk of significant loss. Simulated
results are not real trading. No signals, ever.

---

**Draft W3-B — Friday, Replay Friday**

**HOLD — DO NOT POST until a playable vertical-slice build has shipped and owner confirms (ROADMAP Phase 2).**

Community learning moment: what one bad entry taught us about patience.

[Summary of a Process-Concept replay — describe a trading decision point, what
information was available, what choice was made, and what the debrief revealed about
process. Do NOT reference real markets, real tickers, or real outcomes. Keep framing
entirely within the sim. Until the game ships, use the Process-Concept variant of this
slot — the scenario is a described concept, not a recorded game replay.]

Owner note before posting: this slot uses the Process-Concept variant until the game
vertical slice ships and real replay data is available.

Education, not financial advice. Trading involves risk of significant loss. Simulated
results are not real trading. No signals, ever.

---

### Week 4

**Draft W4-A — Monday, Market Monday (Crypto)**

How to read a candlestick without reading a direction into it.

A candlestick shows you four things: open, close, high, low for a given period. It
does not tell you what happens next. Traders who confuse pattern recognition with
prediction are taking the first step toward overconfidence. The TradeGame community
focuses on reading candlesticks as information — not as signals.

Education, not financial advice. Trading involves risk of significant loss. Simulated
results are not real trading. No signals, ever.

---

**Draft W4-B — Wednesday, Game Devlog**

**HOLD — DO NOT POST until a playable vertical-slice build has shipped and owner confirms (ROADMAP Phase 2).**

What we are building next — and how the community shapes it.

The current development priority list includes [two or three items from GDD]. We share
these early because the people who care most about trading education should have a voice
in what the game teaches. If you are on the Discord, you can submit feedback and shape
what gets built.

[Attach: current dev roadmap screenshot or short list]

Education, not financial advice. Trading involves risk of significant loss. Simulated
results are not real trading. No signals, ever.

---

## 3. Telegram Execution Checklist

Complete these steps IN ORDER per channel. Owner executes in-app (Chromebook browser
or Telegram web: web.telegram.org).

### Channel 1 — @TradeGame_Game (REPURPOSE as announcements-only)

- [ ] Log in as admin.
- [ ] Review full message history. Delete any signals, picks, market calls, or advice-
      adjacent content. Delete anything not suitable for a public-facing announcements
      channel.
- [ ] Clear or archive remaining history (optional, but recommended given 4-member count).
- [ ] Set channel type: Public (confirm it is already public).
- [ ] Set channel description to this text verbatim:

      TradeGame official announcements. Game updates, community news, and education
      content only. This channel carries no financial advice, no signals, and no market
      recommendations — ever. Discussion lives on Discord: [Discord invite link].

- [ ] Set channel username: confirm @TradeGame_Game is retained.
- [ ] Pin the first new post once the Discord server is live (use the announcements
      template from the relaunch sequence).
- [ ] Bot management: if/when a posting bot is configured, grant it admin rights
      (post only; no delete, no ban). NEEDS-HUMAN to configure bot credentials.

NEEDS-HUMAN: Telegram admin session; Discord invite link to insert above.

### Channel 2 — @TradeGameCrypto (PARK)

- [ ] Log in as admin.
- [ ] Post the following message as the final post in the channel, pinned:

      This channel is no longer active. The TradeGame community has moved to Discord,
      where you will find structured education channels for crypto, stocks, and forex —
      plus the trading sim community. Join us: [Discord invite link]

      This is not financial advice. TradeGame is education only. No signals, ever.

- [ ] Pin that message (tap and hold the message > Pin > pin for all members).
- [ ] Do not post anything else here. Channel stays up to hold the handle.

NEEDS-HUMAN: Telegram admin session; Discord invite link to insert.

### Channel 3 — "TradeGame - Learning Materials" (HARVEST then PARK private)

- [ ] Log in as admin. Confirm channel is private.
- [ ] Export or manually review all messages.
- [ ] Sort into two buckets:
      - HARVEST: curriculum seeds, concept explanations, resource lists, frameworks
        with no directional market framing. Target doc: curriculum docs or education
        game scenario library.
      - PURGE: anything advice-adjacent, market-directional, or not suitable for the
        education-not-advice posture. Delete from channel history.
      Compliance lens: RISK_REGISTER §17 (FTC) and §6 (signals).
- [ ] After harvest and purge complete: post a single final message — "Archive only.
      Content migrated. No further posting." — and pin it.
- [ ] Channel stays private. No new members added.

NEEDS-HUMAN: Telegram admin session for review and deletion.

### Channel 4 — "TradeGame - Macro market" (HARVEST then PARK private)

Highest compliance risk. Apply the strictest purge lens first.

- [ ] Log in as admin. Confirm channel is private.
- [ ] Purge-first pass: scan all messages for market calls, price targets, forecasts,
      directional language combined with asset names ("BTC looks ready to break X"),
      or any language a regulator could read as an actionable recommendation.
      Delete each one. Do not harvest anything on the purge list.
      Compliance lens: RISK_REGISTER §17 (FTC) and §6 (signals).
- [ ] Harvest pass: what remains — macro educational explainers, concept breakdowns,
      framework descriptions with no directional actionable framing — harvest to
      education docs only. Do not surface in Discord discussion channels.
- [ ] After harvest and purge complete: post and pin — "Archive only. Content migrated.
      No further posting." Channel stays private.

NEEDS-HUMAN: Telegram admin session for review and deletion.

### Channel 5 — "TradeGame - Incremental Mining" (HARVEST then PARK private)

- [ ] Log in as admin. Confirm channel is private.
- [ ] Harvest pass: game-design seeds — incremental and idle mechanics, crypto mining
      simulation ideas, any game loop concepts. Cross-check against docs/GDD.md for
      ideas worth folding in. Target doc: docs/GDD.md or game design notes.
- [ ] Apply standard purge lens (RISK_REGISTER §6): remove anything market-directional
      regardless of low apparent compliance risk.
- [ ] After harvest and purge complete: post and pin — "Archive only. Content migrated.
      No further posting." Channel stays private.

NEEDS-HUMAN: Telegram admin session for review and deletion.

### Channel 6 — [fifth private channel]

Owner ruled 2026-06-07: LEAVE DEAD. No action required. Do not open, harvest, or
document further. See SOCIAL_AUDIT_NOTES.md for the ruling record.

---

## 4. Harvest Procedure (Channels 3–5)

When the owner is ready to execute each harvest session:

**Export method (preferred if Telegram Desktop is available):**
Telegram Desktop > channel > three-dot menu > Export Chat History > export as HTML
or JSON. Review the exported file off-platform for cleaner sorting.

**Browser method (Chromebook, Telegram Web):**
Open the channel in web.telegram.org. Scroll through manually. Copy-paste harvest
candidates into a staging doc (Google Doc works). Delete purge-list items from the
channel directly.

**Two-bucket sort discipline:**

| Bucket | Criteria | Destination |
|---|---|---|
| HARVEST | Concept explainer, process framework, resource list, game-design seed — no directional market framing | Named target doc (see per-channel steps above) |
| PURGE | Market call, forecast, price target, directional + asset-name combination, win showcase, anything advice-adjacent | Delete from channel; do not record content |

**Compliance lens for every item:**
- RISK_REGISTER §17 (FTC): would this post, if public, constitute an earnings claim or
  imply a result a member could replicate?
- RISK_REGISTER §6 (signals): does this post contain a specific entry, exit, or
  position-size directive tied to a real asset?
  If YES to either: PURGE.

**After harvest:**
- Paste harvested content into target doc in a clearly marked "Raw Harvest — not yet
  reviewed" section.
- A second editorial pass turns raw harvest into polished curriculum content — that
  pass is a separate task, not part of the harvest session.

---

## 5. Owner-Intake Queue

Items that only the owner can resolve. Nothing else blocks the revival sequence except
the FB winning-trades gate (§1a) and the Telegram Discord-link dependency (§3).

| Item | Blocks | Status |
|---|---|---|
| FB winning-trades post review (§1a) | All new FB posting | OPEN — owner action |
| FB page name capture (current display name) | Audit completeness | Low priority; record when convenient |
| FB rename confirmation (§1b) | Fourth §3a criterion | OPEN — owner action |
| Discord invite link (permanent) | Telegram pin texts in §3 | OPEN — generate after Discord server is live |

NEEDS-HUMAN: all four items above require account access only the owner holds.

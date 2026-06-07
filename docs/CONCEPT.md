# TradeGame — Concept Document

**Status:** Living doc | Private HQ only  
**Scope:** Org identity, audience, market pillars, surfaces, model, differentiation, principles

---

## Mission & Identity

TradeGame is a community-run organization for video gamers who trade and retail traders who game.

The core insight: gamers already have the mental model for learning markets — progression systems, practice modes, replays, incremental mastery, studying wins and losses without ego. We apply that culture to real financial education.

We do not sell signals. We do not manage money. We do not promise returns. We teach.

**What we are:**
- An educational community, not an investment advisory
- Peer-to-peer coaching structured like a guild, not a guru's Discord
- A space where "I paper-traded that and blew up — here's the replay" is a badge of learning, not shame
- Developers of an original trading-simulation education game (see `docs/GDD.md`)

**What we are not:**
- A financial advisor or broker
- A signal service
- A get-rich-fast brand

---

## Audience

**Primary:**
- Video gamers (PC/console/mobile) who are curious about crypto, stocks, or forex but don't know where to start
- Complete beginners: the paper-only track is the front door; no real money required to participate fully

**Secondary:**
- Existing retail traders who are burned out on finfluencer culture and want a community that thinks in mechanics, not hype
- Gamers already dabbling in markets (crypto especially) who want structured learning and peer accountability

**Not targeted:**
- Professional traders or funds
- Anyone seeking trade recommendations or managed portfolios

---

## Market Pillars

All three markets are first-class citizens. No market is a bolt-on. Every surface — website, apps, Discord, socials, the game — covers all three in parallel.

### Crypto
- Day trading: reading order books, how entries/exits are structured and journaled, volatility management
- Grid trading: automated range strategies, when they work, when they don't
- Spot vs derivatives: why beginners should understand spot first
- Liquidity pools and DeFi basics: how AMMs price assets, impermanent loss explained
- AI x crypto: algorithmic tools, bots, what retail can realistically use
- Gaming tokens and in-game economies: bridge content for gamer audience

### Stocks
- Long-term investing: index funds, ETFs, compounding — unglamorous and important
- Day and swing trading: how setups are evaluated and journaled, sector rotation as a concept, how earnings seasons move markets
- Paper trading: fully supported track before any real capital
- Reading a stock screener, understanding earnings, basic fundamental vs technical literacy

### Forex
- Major pairs, minor pairs, and why market hours matter
- Session overlap education: London/New York, Tokyo/London — when volume moves
- Risk management emphasis above all else: forex leverage is the most dangerous lever retail traders encounter; we teach this as the primary lesson, not an afterthought
- Pip math, position sizing, and stop-loss discipline before any live discussion

---

## Surfaces

### Website
Public front door. Market-pillar navigation is equal-weighted (no crypto-first layout). Free resources, community links, game preview. No upsells on landing.

### Mobile and Desktop Apps
Practice modes, paper trading dashboards, progress tracking, cohort check-ins. Game client ships here. All three market tracks accessible from first launch.

### Discord (Community Home)
Primary real-time space. Structure mirrors the contribution ladder (see Org Model). Channels organized by market pillar (not by asset class popularity). Moderation doctrine: no signal-sharing, no "call of the day," no performance bragging without full context.

### Socials
- Facebook: community updates, longer-form education posts
- Telegram: revival or purpose-built replacement for real-time broadcast; decision TBD
- YouTube: recorded sessions, game dev logs, concept explainers (all three markets)
- TikTok: short-form education; gamer-native format; strict no-signal rule on all posts
- Other candidates evaluated as community grows

Content rule across all socials: education only. No "I made X% today." No screenshots of gains without full trade context and loss disclosure.

### The Education Game
A discrete product, not a metaphor. Details in `docs/GDD.md`. Short summary: a simulation game that teaches trading mechanics through designed progression, failure states, replay analysis, and leaderboards. All three markets are playable tracks within the game.

---

## Org Model

Community-run means the organization grows from within.

**Contribution Ladder:**
1. **Learner** — joins, participates in cohorts, uses paper trading tools, completes curriculum modules
2. **Helper** — answers questions, assists in beginner channels, demonstrates consistent practice habits; no formal coaching yet
3. **Coach** — vetted by community leads; runs cohorts; creates curriculum content; recognized publicly

No one on the ladder is selling advice. Coaches teach method, process, and risk discipline — they do not tell members what to trade.

**Free vs Paid (future):**
- Always free: core curriculum, Discord access, paper trading tools, game base content
- Potentially paid (when org is ready): structured cohort programs with dedicated coach time, advanced curriculum tracks, cosmetic items in the game
- Never paid for: signals, trade recommendations, managed accounts, performance-based tiers

(Any paid offering — including cosmetics, donations, subscriptions — requires the RISK_REGISTER §4 attorney-review gate first; compensation is analyzed org-wide.)

Monetization decisions require explicit org-level review against the education-not-advice principle. See `docs/RISK_REGISTER.md`.

---

## Differentiation

**vs. Trading-guru Discords**
- No lambo culture, no flexing PnL, no "lifetime access" sales funnel
- Coach role is earned by community contribution, not by claiming profit history
- Losses are curriculum material, not hidden

**vs. Paper-trading apps (Webull paper, Thinkorswim sim, etc.)**
- Those are tools; we are a learning community built around those tools plus original game design
- Coaching, cohorts, and peer accountability layers don't exist in standalone apps
- The game teaches market mechanics through designed failure — not just a price-feed simulator

**vs. Finfluencers**
- No personality-led brand; the org is the identity
- Founder stays out of the spotlight; community coaches are the faces
- No engagement bait ("the market is about to do X — watch"); content is instructional or retrospective

**vs. Traditional finance education (courses, certifications)**
- Lower barrier: free entry, gamer-native format
- Peer cohort model replaces lecture-watch-and-forget
- Game-based practice makes failure safe and repeatable

---

## Principles

**Practice before real money.**  
Paper trading is not a lesser mode. It is the required foundation. The org does not celebrate or encourage accelerating past it.

**Risk management is the core skill.**  
Every market pillar leads with it. Forex leverage education is mandatory before any live forex discussion. Stop-loss discipline is a cohort milestone, not an advanced topic.

**Transparency about losses.**  
Members and coaches are expected to share losing trades with the same candor as winning ones. Loss analysis is a structured activity. Hiding losses is a moderation issue.

**No performance promises.**  
No language implying that following our curriculum produces specific returns. No testimonials framed as proof of profitability. No projections.

**Education, not advice.**  
The line: teaching how a grid strategy works = education. Telling a member to open a specific grid on a specific pair today = advice. The org does not cross that line, and the contribution ladder enforces it.

**Compliance posture.**  
Regulatory exposure grows as the org scales. Known risk areas, mitigations, and open questions live in `docs/RISK_REGISTER.md`. That document is the source of truth for compliance decisions; this concept doc does not override it.

---

*This document is internal strategy. Do not publish to the Preview repo.*

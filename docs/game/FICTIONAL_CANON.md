# TradeGame — Fictional Instrument Canon

**Version:** 1.0
**Status:** Authoritative registry
**Rule:** ALL TradeGame content (lessons, scenarios, marketing, coaching scripts)
uses ONLY instruments listed here. Any new instrument requires a canon entry
BEFORE it appears in content. Before adding an entry, check: does the proposed
ticker or name belong to a real listed company, token, index, or protocol?
Note the check result in the entry.

---

## Standing Rules

1. **Closed registry** — instruments not listed here must not appear in any
   TradeGame artifact. If a draft uses an unlisted name, it is a bug.
2. **No real instruments named evaluatively** — per RISK_REGISTER §20, no
   real-world ticker, index, or asset may be described as a buy, sell, good
   hold, or bad investment anywhere in TradeGame content.
3. **Archetypes only, no real dates or events** — scenarios teach structural
   market mechanics (earnings gaps, depegs, index inclusion). No fictional
   scenario may be pinned to a real calendar date or modeled on a named
   real-world event (e.g., do not name a specific historical collapse or crash).
4. **Collision check required** — before any addition, the author must assert
   whether the proposed name/ticker matches a real listed asset. Ambiguous
   collisions must be escalated, not assumed safe.
5. **HBD collision flag** — the abbreviated ticker HBD is shared with the real
   crypto token "Hive Backed Dollar." HBD is retained in the registry for
   continuity with existing content, but authors must ensure no TradeGame
   content creates confusion with the real HBD asset. Prefer spelling out
   "HarborUSD" in lesson body copy where ambiguity could arise.
6. **NMX partial collision flag** — "NMX" is a recognized trading symbol for
   Natural Gas futures at NYMEX. The TradeGame index is the "NMX 100" (always
   two words, never bare "NMX"). Authors must always use the full form "NMX 100"
   to distinguish it from the real futures symbol.

---

## Registry

### 1. HarborUSD / HBD

| Field | Value |
|-------|-------|
| **Name** | HarborUSD |
| **Ticker** | HBD |
| **Type** | Fictional stablecoin (token) |
| **Profile** | Algorithmic stablecoin soft-pegged to 1.00 USD; relies on a reserve and defense mechanism to hold the peg. Used as the primary quote currency in crypto scenarios. |
| **Used in** | `docs/game/SCENARIOS_V0.md` (SCN-001 — depeg scenario), `docs/game/SCENARIOS_V1.md` (SCN-004 — LP pool), `docs/lessons/PILLAR_INTROS.md`, `docs/game/TEST_PLAN.md` |
| **Collision check** | FLAGGED — "HBD" is the live ticker for Hive Backed Dollar (real crypto stablecoin). Always use full name "HarborUSD" in lesson body copy. See Standing Rule 5. |

---

### 2. USVC

| Field | Value |
|-------|-------|
| **Name** | USVC |
| **Ticker** | USVC |
| **Type** | Fictional stablecoin (token) — second stable, quote currency |
| **Profile** | A second fictional stable used as the neutral quote denomination when HarborUSD itself is the subject under stress (e.g., the depeg scenario). Not subject to peg risk in any authored scenario. |
| **Used in** | `docs/game/SCENARIOS_V0.md` (SCN-001, pair HBD/USVC), `docs/game/SCENARIOS_V1.md` (SCN-004, pool value denominated in USVC) |
| **Collision check** | No known real token, stablecoin, or ticker named USVC. Clear. |

---

### 3. GLIMMER

| Field | Value |
|-------|-------|
| **Name** | GLIMMER |
| **Ticker** | GLIMMER |
| **Type** | Fictional volatile crypto token |
| **Profile** | General-purpose volatile crypto asset; trades against HarborUSD (spot pair GLIMMER/HarborUSD). Used for spot mechanics, margin comparison, volatility regime, and AMM impermanent loss lessons. No protocol or utility backstory required. |
| **Used in** | `docs/lessons/PILLAR_INTROS.md` (spot vs. margin, volatility regimes), `docs/game/SCENARIOS_V1.md` (SCN-004 — AMM/LP pool), `docs/COACH_ONBOARDING.md` |
| **Collision check** | No known major exchange listing or CoinGecko-top-500 token named GLIMMER as of knowledge cutoff. Clear. |

---

### 4. ArcSwap

| Field | Value |
|-------|-------|
| **Name** | ArcSwap |
| **Ticker** | N/A (venue, not tradeable asset) |
| **Type** | Fictional DEX / AMM venue |
| **Profile** | A fictional automated market maker exchange where the GLIMMER/HarborUSD liquidity pool is hosted in SCN-004. Provides the UI skin for the LP position panel. |
| **Used in** | `docs/game/SCENARIOS_V1.md` (SCN-004) |
| **Collision check** | No known DEX or exchange named ArcSwap. Clear. |

---

### 5. VRXC

| Field | Value |
|-------|-------|
| **Name** | VRXC |
| **Ticker** | VRXC |
| **Type** | Fictional crypto pair (spot) |
| **Profile** | Volatile crypto asset used for spread-cost and FOMO illustration examples in Foundation lessons. Trades quoted against USD in worked examples. |
| **Used in** | `docs/lessons/FOUNDATION.md` |
| **Collision check** | No known listed company or major token with ticker VRXC. Clear. |

---

### 6. NGSM — Northgate Systems

| Field | Value |
|-------|-------|
| **Name** | Northgate Systems |
| **Ticker** | NGSM |
| **Type** | Fictional US-listed equity |
| **Profile** | Mid-to-large-cap fictional technology/systems company. Trades on a simulated US exchange with standard session hours (9:30–16:00 ET). Used for earnings gaps, session-spread observation, ETF/single-name comparison, and time-horizon examples. One of the 100 constituents of the NMX 100 (1.5% weight in examples). |
| **Used in** | `docs/game/SCENARIOS_V0.md` (SCN-002 — earnings gap), `docs/lessons/PILLAR_INTROS.md` (stocks pillar, ETF/diversification, time horizons), `docs/lessons/FOUNDATION.md`, `docs/game/TEST_PLAN.md` |
| **Collision check** | "Northgate" as a standalone name exists (Northgate plc, ticker NTG on LSE). However, "Northgate Systems" with ticker NGSM does not appear on US exchanges. "NGSM" is not a recognized US-listed ticker. Clear for US simulation context; note the partial name proximity. |

---

### 7. NMX 100

| Field | Value |
|-------|-------|
| **Name** | NMX 100 |
| **Ticker** | NMX 100 (always as two words; never bare "NMX") |
| **Type** | Fictional broad equity index |
| **Profile** | A synthetic basket of 100 fictional large-cap names. The curriculum's canonical broad index; analogous in structure to a real large-cap index. NGSM is one constituent (~1.5% weight in worked examples). A corresponding NMX 100 ETF exists in the sim for DCA/rebalance scenarios. |
| **Used in** | `docs/lessons/PILLAR_INTROS.md` (stocks pillar — session hours, ETF/diversification, time horizons), `docs/game/SCENARIOS_V1.md` (SCN-005 — index inclusion) |
| **Collision check** | FLAGGED — "NMX" alone is a recognized trading symbol for Natural Gas futures at NYMEX. Always use full form "NMX 100." See Standing Rule 6. |

---

### 8. VLDI — Veldara Industrial

| Field | Value |
|-------|-------|
| **Name** | Veldara Industrial |
| **Ticker** | VLDI |
| **Type** | Fictional US-listed equity (mid-cap) |
| **Profile** | Fictional mid-cap manufacturer added to the NMX 100 in SCN-005. Used exclusively to teach index-inclusion mechanics: announcement-driven price run, passive-fund forced buying at closing auction, and post-inclusion fade. No recurring appearance in other content. |
| **Used in** | `docs/game/SCENARIOS_V1.md` (SCN-005 — NMX 100 inclusion) |
| **Collision check** | "Veldara" is not a known company name. "VLDI" is not a recognized US-listed ticker. Clear. |

---

### 9. ANDU

| Field | Value |
|-------|-------|
| **Name** | ANDU |
| **Ticker** | ANDU (base currency in pair ANDU/HarborUSD) |
| **Type** | Fictional forex pair (base currency) |
| **Profile** | High-liquidity fictional forex major, modeled structurally on a real major pair (pip structure, four-decimal quoting, standard lot = 100,000 units). Used for session mechanics, pip/lot sizing, leverage/margin, carry, and news-event scenarios. Pair: ANDU/HarborUSD. |
| **Used in** | `docs/game/SCENARIOS_V0.md` (SCN-003 — London open sweep), `docs/game/SCENARIOS_V1.md` (SCN-006 — employment report), `docs/lessons/PILLAR_INTROS.md` (forex pillar — pips, pip value, leverage, sessions), `docs/lessons/FOUNDATION.md`, `docs/game/TEST_PLAN.md` |
| **Collision check** | "ANDU" is not a recognized forex pair, exchange ticker, or token. Clear. |

---

### 10. MLCR — Monthly Labor Conditions Report

| Field | Value |
|-------|-------|
| **Name** | Monthly Labor Conditions Report |
| **Ticker** | MLCR (used as shorthand label in text) |
| **Type** | Fictional macroeconomic report / scheduled news event |
| **Profile** | A fictional high-impact scheduled macroeconomic data release, structurally analogous to a real employment report (e.g., NFP). Releases at a defined time; outcome is unknown pre-release; causes spread spike and directional move on ANDU. Used to teach news-event mechanics without referencing any real government report. |
| **Used in** | `docs/game/SCENARIOS_V1.md` (SCN-006 — employment report on ANDU) |
| **Collision check** | "MLCR" is not a recognized report name, ticker, or instrument. Clear. |

---

### 11. KORVA

| Field | Value |
|-------|-------|
| **Name** | KORVA |
| **Ticker** | KORVA (base currency in pair KORVA/HarborUSD) |
| **Type** | Fictional forex base currency |
| **Profile** | High-liquidity fictional forex major pairing with HarborUSD as the quote currency. Structurally similar to ANDU — four-decimal quoting, standard lot sizing — but introduced as a second concurrent pair in ACN-006 to teach correlation exposure. No real-world country or currency backstory. |
| **Used in** | `docs/game/ADVANCED_TIER_BRIEF.md` (ACN-006 — correlation crisis scenario) |
| **Collision check** | No known forex pair, exchange ticker, or token named KORVA. Distinct from KRW (Korean Won ISO code). No known ticker or token "KORVA" on CoinGecko/CMC top-1000 or major US/international equity listings. Clear. (Former placeholder name SOLU was renamed here to avoid collision with SOL/Solana per Standing Rule 4.) |

---

### 12. CALD — Calder Utilities

| Field | Value |
|-------|-------|
| **Name** | Calder Utilities |
| **Ticker** | CALD |
| **Type** | Fictional US-listed equity (defensive, dividend-paying) |
| **Profile** | Fictional mature utility company with a stable dividend yield. Used as the archetypal defensive sector name in the stocks curriculum — the counterpart to NGSM (growth) in sector-rotation and dividend lessons. Dividend paid quarterly. No protocol or operational backstory required beyond the defensive/yield profile. |
| **Used in** | `docs/lessons/STOCKS_INTERMEDIATE.md` (S-I03 sector rotation worked example, S-I04 dividends sim drill) |
| **Collision check** | "CALD" is not a recognized US-listed equity ticker. Distinct from CALM (Cal-Maine Foods, real ticker) and CAL (real ticker, various). "Calder" as a standalone name has no major exchange collision. Clear. |

---

### 13. ANDU (crypto reference) — see entry 9

*ANDU appears once in `docs/COACH_ONBOARDING.md` in a coaching-filter example
("do you think ANDU is a good hold") — this is covered by the standing ANDU entry above.*

---

## Addition Checklist

To add a new instrument:

1. Confirm the name and ticker do not appear in the existing registry.
2. Check whether the proposed name or ticker matches a real listed stock (US or major
   international), a real cryptocurrency (CoinGecko, CMC top-1000 as a minimum check),
   a real forex pair, or a real index. Use judgment; exact matches are blockers,
   close matches require a note.
3. Add an entry to this file following the format above, including the collision-check
   result.
4. Add the instrument to every content file that uses it before the content ships.
5. Treat any omission (content using an unlisted instrument) as a bug to fix before
   that content is reviewed or published.

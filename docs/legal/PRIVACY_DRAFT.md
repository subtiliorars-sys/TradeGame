> **DRAFT — NOT IN FORCE. Requires licensed-attorney review before publication or any user acceptance (RISK_REGISTER §4/§19 hard gates). Written by AI as a starting point for counsel, not as legal advice.**

# TradeGame — Privacy Policy (Draft)

**Last revised:** [PLACEHOLDER — insert date when published]
**Entity:** [PLACEHOLDER — counsel: entity name and jurisdiction TBD, see RISK_REGISTER §19]

---

## 1. Data Minimization Posture

TradeGame is built on a data-minimization principle: we collect only what the Service
requires to function and nothing beyond that. We do not monetize user data. We do not
run advertising. We do not sell or share personal data with third parties except as
described in this Policy.

---

## 2. What the Game Stores

The following data is stored per user account (see SIM_ENGINE_SPEC §6.2 for the
canonical engineering list):

| Data | Stored | Notes |
|------|--------|-------|
| Account identifier (UUID) | Yes | Randomly generated; no real name required |
| Age affirmation result | Yes | One of: 18+, 13–17, or under-13 (blocked) |
| Age affirmation timestamp | Yes | Audit record for COPPA compliance gate |
| Session IDs | Yes | References to replay records |
| XP total and process-metric breakdown | Yes | Progression; process scores only — no PnL |
| Journal entry text | Yes, encrypted at rest | See §3 below |
| Email address | Optional | Collected only if user provides it for account recovery |
| Display name | Optional | No real name required or requested |
| Portfolio state | Yes | Session continuity (simulated balances only) |

---

## 3. Journal Entry Privacy

Journal entries are sensitive financial-behavior data. They receive the following
protections:

- **Encrypted at rest:** Journal text is encrypted using AES-256-GCM with a
  per-account key derived from a server-side master key and the account ID (HKDF).
  The per-account key is never stored independently; it is derived on read.
  (SIM_ENGINE_SPEC §6.4)

- **Never in shared replays:** When a session replay is shared, journal entry text
  is excluded. Only non-identifying metadata — word count and entry tags — travels
  with the replay format. This is a deliberate privacy design decision, not an
  oversight. (SIM_ENGINE_SPEC §5.1)

- **Not used for coaching without consent:** Journal text is not visible to coaches
  by default. Any replay review by a coach sees word count and tags only.

---

## 4. What Is NOT Collected

TradeGame does not collect and is not designed to collect:

- Real-money account data, brokerage credentials, or any live trading information.
  The simulation has no connection to any real brokerage or financial account.
- Precise geolocation.
- Advertising identifiers, cross-site tracking cookies, or third-party tracking pixels.
- Real name, phone number, or government-issued identification.
- Payment information. (No payment functionality exists in Phase 2; when payment
  is introduced at Phase 4, this policy will be updated before any transaction occurs.)
- PnL history in any user-accessible or persistable form. (SIM_ENGINE_SPEC §4.4 and
  §6.2 — PnL data is not stored in the account record.)

---

## 5. Discord — Community Phase

During the Discord community phase, Discord, Inc. processes community member data
(usernames, messages, join/leave events) under Discord's own Privacy Policy and Terms
of Service.

**Controller/processor determination:** [PLACEHOLDER — counsel: confirm whether
TradeGame operates as a data controller with respect to EU/UK member data collected
through Discord integrations or bots (RISK_REGISTER §14). If any Discord bot or
integration logs member data on behalf of TradeGame, a Data Processing Agreement with
Discord and a GDPR controller analysis are required before Phase 1 public launch.]

TradeGame's current policy during the Discord phase:
- No Discord bots that log member PII are operated without a completed GDPR posture
  review.
- No forms collecting PII beyond an optional mailing-list email signup are used.
- The mailing list is managed with a reputable email service provider; unsubscribe
  requests are honored immediately.

---

## 6. Data Retention

[PLACEHOLDER — counsel/owner: default retention period is 365 days after last login
(SIM_ENGINE_SPEC §6.3 TUNABLE value). Owner must confirm this period before
publication. Implementation: soft-delete flag set on account record; hard-delete
executed by scheduled job at day 365.]

Active accounts: data retained while the account is active.
Inactive accounts: data deleted [PLACEHOLDER: 365 days] after last login.
Erasure requests: honored within the timeline described in §7.

---

## 7. Erasure Path (Right to Delete)

Users may request deletion of their account and all associated data at any time.

**In-app path:** Settings > Delete My Account. This action permanently erases the
account record, all associated session data, journal entries, and XP records.
A confirmation dialog is presented before deletion. Deletion is irreversible — the
user is warned before proceeding and receives a confirmation token for their records.
(SIM_ENGINE_SPEC §6.3 `eraseAccount` interface)

**Manual request path:** Users who cannot access the in-app function may submit a
deletion request to [PLACEHOLDER — contact email]. TradeGame will complete the erasure
within [PLACEHOLDER — counsel: confirm timeframe; GDPR requires "without undue delay"
and sets a 30-day outer limit for confirmed requests].

**Scope of erasure:** All server-side data associated with the account is deleted,
including journal entries, session records, XP records, and account metadata. Anonymized
aggregate data (not linked to any account identifier) may be retained.

---

## 8. Children's Privacy

**Under-13 blocked:** The age screen blocks account creation for users who identify
as under 13. No account data is stored for users who select "I am under 13."
(SIM_ENGINE_SPEC §6.1)

**COPPA analysis — hard gate:** A formal COPPA compliance analysis is required before
the game stores any account data on a server, even for users who affirm they are 13
or older. This analysis is a Phase 2 compliance gate (SIM_ENGINE_SPEC §8 and
RISK_REGISTER §10). Until the analysis is complete, the Phase 2 vertical slice
operates in client-side-only mode without server-side account persistence.

**13–17 age tier:** Users who affirm they are 13–17 receive a game-only account.
Coaching features are locked. The data collected for this tier is the same minimal set
described in §2. Whether parental consent is required for this tier under COPPA
(which applies to under-13) or under other jurisdiction-specific rules is:
[PLACEHOLDER — counsel: COPPA applies strictly to under-13; confirm whether the 13–17
tier triggers any state-level minor-protection requirements.]

**UK AADC and EU child consent ages:** The UK Age Appropriate Design Code (AADC) and
GDPR member-state child-consent ages (which vary from 13–16 depending on jurisdiction)
may impose obligations beyond US COPPA. [PLACEHOLDER — counsel: assess UK AADC
applicability and EU member-state child-consent age requirements before any public
launch reaching UK/EU users.]

---

## 9. EU and UK Members — GDPR / UK GDPR

If you are located in the European Union or the United Kingdom, you have rights under
the General Data Protection Regulation (GDPR) or UK GDPR, including:

- **Access:** Request a copy of the personal data we hold about you.
- **Rectification:** Request correction of inaccurate personal data.
- **Erasure:** Request deletion of your personal data (see §7).
- **Restriction:** Request that we restrict processing of your data in certain
  circumstances.
- **Data portability:** Request your data in a portable format.
- **Objection:** Object to processing of your data in certain circumstances.

**Lawful basis for processing:** [PLACEHOLDER — counsel: identify the lawful basis for
each processing activity listed in §2 (likely contract performance for account data;
legitimate interests for security/audit; consent for optional data). Confirm before
publication.]

**Data transfers:** [PLACEHOLDER — counsel: if server infrastructure is located outside
the EU/UK, identify the transfer mechanism (adequacy decision, SCCs, or other).]

To exercise any of these rights, contact: [PLACEHOLDER — contact address from §12.]

---

## 10. Breach Notification

In the event of a data breach that poses a risk to user rights and freedoms, TradeGame
will:

- Notify affected users without undue delay once the breach is confirmed.
- Notify relevant supervisory authorities as required by applicable law (GDPR requires
  72-hour notification to the relevant DPA where feasible).
- Provide users with information about the nature of the breach, the data affected,
  likely consequences, and steps taken.

[PLACEHOLDER — counsel: confirm the breach-notification obligations that apply given
the entity jurisdiction and the geographic distribution of users. Document the breach-
response plan in the HQ repo (required by RISK_REGISTER §14 and SIM_ENGINE_SPEC §6.3
Tier B requirements) before Phase 2 ships.]

---

## 11. Changes to This Policy

When this Policy is updated, we will post the revised version with an updated date.
Material changes will be communicated to registered users via email or in-app notice
before the change takes effect.

[PLACEHOLDER — counsel: confirm adequate notice period under applicable law.]

---

## 12. Contact

[PLACEHOLDER — counsel/owner: insert contact email or postal address after entity
formation. This must be the entity's address (RISK_REGISTER §19). For GDPR purposes,
if a Data Protection Officer is required or appointed, include their contact information
here separately.]

# Docs Consolidation — Completed 2026-06-10

## Problem
~30 doc files spread across `docs/`, `docs/community/`, `docs/game/`, `docs/legal/`,
`docs/lessons/`, `docs/playbooks/`, `docs/templates/` with some cross-references pointing
to the wrong location. Some files had canonical-home redirect notes but the redirects were
easily missed.

## New assets created

### Website (deployable)
| File | Purpose |
|------|---------|
| `site/legal.html` | Legal & license page |
| `site/_redirects` | Cloudflare Pages redirect config |
| `site/_headers` | Security headers for Cloudflare Pages |
| `site/checklist/index.html` | The Trader's Process Checklist (print via browser → PDF) |

### Docs assets
| File | Purpose |
|------|---------|
| `docs/assets/YOUTUBE_CHANNEL_ASSETS.md` | Channel description, SEO tags, upload metadata for first 4 videos |
| `docs/assets/OWNER_QUICKSTART.md` | All browser-based owner steps in one runbook |

### Site updates
| File | Change |
|------|--------|
| `site/index.html` | Removed `noindex`, updated Discord link from `#` to placeholder, legal link now real |
| `site/README.md` | Rewrote from "do not deploy" to full deploy instructions (3 options) |

## Cross-references preserved
All original doc files remain intact. The SOCIAL_AUDIT_NOTES.md and SOCIAL_REVIVAL_PLAN.md
files in `docs/` still point to `docs/community/` as canonical. No files were deleted.

## What the owner still needs to do (non-automatable)
See `docs/assets/OWNER_QUICKSTART.md` for the complete runbook.

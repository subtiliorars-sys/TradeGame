# TradeGame Website — Static Site

## Deploy status
READY TO DEPLOY — see deployment options below.
Entity formation (RISK_REGISTER §19) must be confirmed before publishing publicly.

## Files
- `index.html` — Landing page (single-page, no JS)
- `legal.html` — Legal & license page
- `style.css` — Dark-gamer theme, no CDN/external dependencies
- `_redirects` — Cloudflare Pages redirects
- `_headers` — Security headers for Cloudflare Pages
- `CNAME` — Custom domain (deploy-time; not committed to git for preview)

## No tracking
Zero advertising pixels, no analytics scripts, no third-party trackers.
If analytics are added later, use privacy-respecting aggregate-only (e.g., Plausible, Umami).

## Deployment options

### Option A: Cloudflare Pages (recommended — free tier)
1. Push this `site/` directory to a GitHub repo (or keep it in the TradeGame repo).
2. Go to Cloudflare Dashboard > Pages > Create a project.
3. Connect your GitHub repo, set build command to empty, set build output to `site/`.
4. Add custom domain (e.g., tradegame.game, tradegame.org, tradegame.gg).
5. Root points to `index.html`. The `_redirects` file handles `/legal → legal.html`.

### Option B: GitHub Pages
1. In your repo Settings > Pages, set source to "GitHub Actions" or deploy from the `site/` folder.
2. Or use the `/docs` folder on the main branch (rename `site/` to `docs/`).
3. Add a CNAME file for custom domain.

### Option C: Netlify (free tier)
1. Connect repo to Netlify.
2. Set publish directory to `site/`.
3. Add custom domain.

## Post-deploy checklist
- [ ] Custom domain DNS configured and HTTPS working
- [ ] Discord invite link updated from `YOUR_INVITE_LINK` to a real permanent invite
- [ ] Meta description and OG tags verified (share preview on social)
- [ ] Legal page reviewed by attorney before public launch per RISK_REGISTER §4

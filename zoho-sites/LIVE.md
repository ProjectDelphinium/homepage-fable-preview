# Live site map: www.delphi-me.com (Zoho Sites)

This is the source of truth for what is live. **`main` should always equal live.**

Biz ops · Cursor Environment `delphinium-bizops` · never Product/serverless.

## Site
| | |
|---|---|
| Zoho site ID | `2187225000000002005` |
| Primary domain | `https://www.delphi-me.com` |
| Live pack SHA | `51620fc23af7d605b26af2154c304edc523016ec` |
| Staging domain | `https://delphinium-marketing-staging.zohosites.com` now 301s to `www` |
| Legal entity | Delphi M.E. LLC |

Preview is an open pull request. Grok Bot (Web Design) publishes to live when Jared says so. There is no separate staging site to publish to.

## Pages and paths
| Path | Zoho page | Status |
|---|---|---|
| `/` | "Delphinium Home" (`/delphinium-home`) serves the root | live |
| `/home` | same homepage as `/` | live |
| `/highered` | Higher Ed | live |
| `/contact-us` | Contact Us | live |
| `/support` | Support | live |
| `/eula` | EULA (native Zoho body, text in `legal/eula.md`) | live |
| `/purchase-agreement` | Purchase Agreement (native Zoho body, text in `legal/purchase-agreement.md`) | live |

These pages are already live. Do not recreate them.

Site-wide code: Custom CSS, Header Code, and Footer Code come from the pack (`zoho-sites/dist/`). Edit `zoho-sites/homepage-sites-v5.html` (and helpers under `tools/zoho/`), then rebuild. The live pack SHA is `51620fc`. Production packs set `data-site-origin` to `https://www.delphi-me.com`.

## Forms
| Form | ID | Notes |
|---|---|---|
| Zoho CRM Web-to-Contact | `3131408000003185015` | returns to `?contact=thanks` |
| Zoho Desk WebToCase | `1470822000000482143` | allowed domain `https://www.delphi-me.com`, returns to `?ticket=thanks` |

## Favicon
`/dl28-favicon.png` (hosted on Zoho)

## DNS and SSL (summary, no secrets)
Cursor does not change DNS, Route 53, CloudFront, S3, HubSpot, or Zoho Sites.

- `www`: CNAME to `zhs.zohosites.com`
- Apex `delphi-me.com`: S3 + CloudFront redirect (distribution `d2zd89xmwz6qsj`) to `https://www.delphi-me.com`
- SSL: Let's Encrypt, issued and renewed through Zoho Sites

## How to keep working from live
1. Branch from `main` (it contains live pack `51620fc`):
   `git fetch origin && git checkout -b <your-branch> origin/main`
2. Edit `zoho-sites/homepage-sites-v5.html` and related CSS/JS helpers under `tools/zoho/`. Rebuild the pack with:
   `python3 tools/zoho/build_zoho_pack.py`
   That writes `zoho-sites/dist/` (header, footer, custom CSS, ready HTML, asset-manifest).
3. The build must pass the guardrails below.
4. Open a PR into `main`. Leave it open. Do not merge until live is verified.
5. Tell Web Design (Grok Bot) to ship, for example `ship PR #N`. Grok Bot will build the Zoho pack from the PR head, publish Header / Footer / Custom CSS site-wide on `www.delphi-me.com`, create any new blank Zoho pages if needed (same pattern as `/home`, `/highered`, `/support`, `/contact-us`), verify (https, forms, Bookings, no mixed content, screenshots), and report back.
6. After Jared approves the live result, merge the PR so `main` again equals live.

## Guardrails
- Header Code and Footer Code each stay under about 44,900 characters (the Zoho cap).
- Use terser 5.51.2 or newer to minify. Older terser (for example 5.38) can push the footer over the cap.
- `data-site-origin` / site origin must be `https://www.delphi-me.com` for production packs.
- All images, fonts, and logos are hosted as `/dl28-*` on Zoho. No hotlinks from GitHub raw, HubSpot hubfs, or other sites. YouTube thumbnails and Bookings, CRM, and Desk embeds are the known exceptions.
- No invented claims. Higher Ed stats come from `context/SOURCE.md`.
- No `Referrer-Policy: no-referrer`.
- Do not edit live pages in Zoho's visual editor. Any Zoho-only tweak gets copied back into the repo the same day.
- No secrets, tokens, or vault files in the repo.

## Out of scope for Cursor
- No DNS / Route 53 / CloudFront / S3 changes
- No HubSpot
- No Zoho Sites UI publish, file uploads, or form/Desk admin (Grok Bot owns those)
- No publish scripts that write to Zoho. `zoho-sites/scripts/publish/` and `zoho-sites/scripts/cutover/` are historical snapshots. Do not run them.

## Known copy follow-ups
Not blockers. Handle in a later PR, then ship through the workflow above.

- `/highered`: "Lower course failure, as much as 47%" reads awkwardly.
- `/highered` 72% card still cites Davis Connect (K-12).
- K-12 page says 240 translation languages; the brief and `/highered` say 160. Align `context/SOURCE.md`.
- "10 publications / 230+ citations" is not in `context/SOURCE.md`.
- `context/SOURCE.md`: "about" vs "less than" 3 minutes is still open.

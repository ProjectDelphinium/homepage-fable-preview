# Live site map: www.delphi-me.com (Zoho Sites)

This is the source of truth for what is live. **`main` should always equal live.**

## Site
| | |
|---|---|
| Zoho site ID | `2187225000000002005` |
| Primary domain | `https://www.delphi-me.com` |
| Staging domain | `https://delphinium-marketing-staging.zohosites.com` |
| Legal entity | Delphi M.E. LLC |

## Pages and paths
| Path | Zoho page | Status |
|---|---|---|
| `/` | "Delphinium Home" (`/delphinium-home`) serves the root | live |
| `/contact-us` | Contact Us | live |
| `/support` | Support | live |
| `/eula` | EULA (native Zoho body, text in `legal/eula.md`) | live |
| `/purchase-agreement` | Purchase Agreement (native Zoho body, text in `legal/purchase-agreement.md`) | live |
| `/schedule-jared` | Schedule Jared (`2187225000000053002`); hidden page, sitemap off, page Header/Footer instant redirect to Schedule Jared 60 min. See `pages/schedule-jared/` | live |
| `/home` | | coming |
| `/highered` | Higher Ed | coming |

Site-wide code: Custom CSS, Header Code and Footer Code come from the pack (`dist/`). The live pack was built from `c3ea350`; see `scripts/README.md`.

## Forms
| Form | ID | Notes |
|---|---|---|
| Zoho CRM Web-to-Contact (Website Contact Us) | `3131408000003185015` | returns to `?contact=thanks`; **Google reCAPTCHA v2** site key `6LcnUtkt…` (live 2026-10-01); honeypot `aG9uZXlwb3Q` retained; image CaptchaServlet removed |
| Zoho Desk WebToCase | `1470822000000482143` | allowed domain `https://www.delphi-me.com`, returns to `?ticket=thanks` (unchanged) |

Contact form HTML lives in the site-wide Header/Footer pack (`homepage-sites-v5.html` → `dist/`), not the native `/contact-us` page body. Pack sizes after reCAPTCHA paste (2026-10-01 MT): Header 44,425 / Footer 44,230 (under 44,900).

## Favicon
`/dl28-favicon.png` (hosted on Zoho)

## DNS and SSL (summary, no secrets)
- `www`: CNAME to `zhs.zohosites.com`
- Apex `delphi-me.com`: S3 + CloudFront redirect (distribution `d2zd89xmwz6qsj`) to `https://www.delphi-me.com`
- SSL: Let's Encrypt, issued and renewed through Zoho Sites

## Release workflow
1. Make a branch from `main`
2. Open a PR into `main`
3. Web Design publishes the PR build to **staging** (`delphinium-marketing-staging.zohosites.com`)
4. **Jared approves** the staging result
5. Publish to **live** (`www.delphi-me.com`)
6. Verify live (`scripts/verify/verify_golive_2026_09_28.py`)
7. Merge the PR, so `main` again equals live

Don't merge before the live publish is verified. Don't publish to live without Jared's approval.

## Guardrails
- Header Code and Footer Code each stay **under 44,900 characters** (the Zoho cap; the publish script asserts this).
- All assets are **hosted on Zoho** (`/dl28-*` via Zoho Files).
- **No hotlinks**: no HubSpot (`hubfs`, `hs-fs`), `raw.githubusercontent.com` or other third-party image or font URLs.
- No secrets, tokens, cookies or session files in this repo.

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

## SalesIQ
Jared approved the Delphi SalesIQ chat for go-live on 2026-10-06. Live Header Code ends with this block (do not swap the widget code). It is the last thing in Header Code (`dist/homepage-sites-v5.zoho-header.html`; the builder appends `SALESIQ` in `tools/zoho/build_zoho_pack.py`). The inline script in front of the widget closes the chat window when the Schedule a demo modal opens, so the modal is not covered: on a click of `[data-bookings-open]` or `[data-research-book]`, on a `hashchange` to `#schedule-demo`, and (through `$zoho.salesiq.ready`) when a page loads with `#schedule-demo`, which is what happens when the bot link is clicked on a URL with a query string. It calls `$zoho.salesiq.floatwindow.visible('hide')` only while `#dl-book-modal` is open (`inert === false`), at 0, 1, 2, 4, 7 and 10 s, because SalesIQ restores an open chat window about 3 s after load. Every lookup is optional-chained, so a missing widget or modal does nothing. Live 2026-10-07 (fix 330).

```html
<script>{let z=window.$zoho=window.$zoho||{},s='#schedule-demo',q=location.hash==s,x=()=>self['dl-book-modal']?.inert===!1&&z.salesiq.floatwindow?.visible('hide'),y=()=>[0,1,2,4,7,10].map(t=>setTimeout(x,t*1e3)),h=e=>(e.type<'d'?e.target.closest?.('[data-bookings-open],[data-research-book]'):location.hash==s)&&y();(z.salesiq=z.salesiq||{}).ready=()=>q&&y();addEventListener('hashchange',h);addEventListener('click',h,!0)}</script><script id="zsiqscript" src="https://salesiq.zohopublic.com/widget?wc=siq43657238767afe5a3238ca4de01feca14e1d65dc4607454dc9beb3e80e4c5351" defer></script>
```

Schedule a demo buttons in the bot should use `https://www.delphi-me.com/#schedule-demo`. The homepage script opens `#dl-book-modal` through `window.dlOpenBookings()` (Demo Bookings embed `4937208000000036014`) and then removes the hash. It does not navigate to Bookings, and it does not use `bookings.delphi-me.com`.

## Forms
| Form | ID | Notes |
|---|---|---|
| Zoho CRM Web-to-Contact (Website Contact Us) | `3131408000003185015` | returns to `?contact=thanks`; **Google reCAPTCHA v2** site key `6LcnUtkt…` (live 2026-10-01); honeypot `aG9uZXlwb3Q` retained; image CaptchaServlet removed |
| Zoho Desk WebToCase | `1470822000000482143` | allowed domain `https://www.delphi-me.com`, returns to `?ticket=thanks` (unchanged) |

Contact form HTML lives in the site-wide Header/Footer pack (`homepage-sites-v5.html` → `dist/`), not the native `/contact-us` page body. Pack sizes after reCAPTCHA paste (2026-10-01 MT): Header 44,425 / Footer 44,230 (under 44,900). After the SalesIQ close-on-demo script (2026-10-07 MT, fix 330): Header 44,881 / Footer 44,886 as pasted (`dist` footer has 2 extra leading newlines). To make room, the `/* dl28: ... */` comment was moved out of the shipped neutralizer script into the builder source.

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

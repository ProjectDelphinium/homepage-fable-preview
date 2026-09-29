# Zoho SEO ops checklist

Draft pack only. Do not publish to www.delphi-me.com until Jared approves a staging pass. Rules: `docs/GEO-AEO-SEO.md`. Claims: `context/SOURCE.md`.

## Build

```bash
python3 tools/zoho/build_zoho_pack.py
```

Header Code and Footer Code must each print at or under **44,900** characters. The script exits if they do not. Paste `zoho-sites/dist/homepage-sites-v5.zoho-header.html`, `zoho-sites/dist/homepage-sites-v5.zoho-footer.html`, and `zoho-sites/dist/homepage-sites-v5.zoho-custom.css` site-wide. Do not hand-edit `dist/`.

## Upload before the next Zoho publish

Host on Zoho Files. Do not hotlink GitHub.

| Repo file | Zoho path |
| --- | --- |
| `zoho-sites/assets/og-default.jpg` | `/dl28-og-default.jpg` (1200×630) |
| `zoho-sites/assets/canvas-module-before.svg` | `/dl28-canvas-module-before.svg` |

The Makeover “before” graphic used to be inline. The pack now references the file above. Publishing the header without that upload leaves the Canvas-only side of the Makeover blank. `/dl28-logo-new.svg` is already live and is the Organization logo.

## Static page SEO (crawlers that do not run JavaScript)

Header Code is shared, so it does **not** include a sitewide meta description. Zoho’s per-page SEO fields are the static title and description. Paste these. The path script sets the same strings after it runs, and it will correct `/highered` if the K-12 description is still there.

| Page | Title | Description |
| --- | --- | --- |
| `/` and `/home` | Delphinium · Canvas delivers content. Delphinium delivers engagement. | The Canvas engagement layer for K-12 online schools. Turn the Canvas courses you already run into engaging student experiences and an early-warning system for teachers. Up to 31% fewer course failures. |
| `/highered` | Higher Ed Online · Delphinium | Delphinium is the Canvas engagement layer for Higher Ed Online programs. Faculty keep teaching in Canvas. It adds motivation and early-warning visibility, with no course migration. |
| `/contact-us` | Contact · Delphinium | Contact Delphi M.E. about Delphinium for K-12 online schools and Higher Ed Online programs on Canvas. |
| `/support` | Support · Delphinium | Get support for Delphinium on Canvas. Send a ticket and Delphi M.E. will get back to you. |
| `/eula` | EULA · Delphinium | End user license agreement for Delphinium (Delphi M.E. LLC). |
| `/purchase-agreement` | Purchase agreement · Delphinium | Purchase agreement for Delphinium (Delphi M.E. LLC). |

On each of those pages, also set:

- Social image: `https://www.delphi-me.com/dl28-og-default.jpg`
- Card: `summary_large_image` (Zoho currently emits `twitter:card=summary` first; change the page social setting so the server-rendered tag matches)
- Canonical: the `https://www.delphi-me.com/...` URL for that path
- Do not set keywords equal to the title

Do not put 47%, 67%, or 65% in the Higher Ed meta description unless Jared asks.

## After publish, check

- View source on `/` and `/highered`. `/highered` must not show the K-12 “Up to 31%” description as its only description.
- JSON-LD `#dl-seo` includes Organization name Delphi M.E. LLC, a WebSite, and a SoftwareApplication. No `SearchAction`, no `aggregateRating`, no `"price"`.
- `og:image` points at `/dl28-og-default.jpg` on this host.
- One visible H1 on home, Higher Ed, contact, and support.
- https://validator.schema.org/ on the homepage JSON-LD.

## Still NEED_JARED

Public contact email, YouTube handle confirmation (`@DelphiniumEngage` vs `@DelphiniumEngagement`), vanity social URLs, Higher Ed percents in meta, a PNG logo if SVG is too weak for Google, and any AI-crawler blocks.

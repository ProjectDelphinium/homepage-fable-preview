# Zoho SEO ops checklist

Live pack. Jared approved publishing to www.delphi-me.com on 2026-09-29 (Web Design pastes it into Zoho). Rules: `docs/GEO-AEO-SEO.md`. Claims: `context/SOURCE.md`.

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

Header Code is shared, so it does **not** include a sitewide meta description, `<title>`, or canonical. Zoho’s per-page SEO fields are the static title and description, and Zoho writes the canonical, `og:url`, and `twitter:url` for each page itself (live check 2026-09-29: `/highered` renders `<link rel="canonical" href="https://www.delphi-me.com/highered">`). Paste these in each page's Page Settings > SEO. The path script sets the same strings after it runs, and it will correct `/highered` if the K-12 description is still there. The build checks that the path script strings stay at or under 60 (title) and 160 (description) characters; keep this table and the script in step.

| Page | Title (chars) | Description (chars) | Canonical |
| --- | --- | --- | --- |
| `/` (K-12) | Canvas engagement for online K-12 schools · Delphinium (54) | Delphinium makes Canvas courses engaging for online and virtual K-12 students and gives teachers an early-warning system. Up to 31% fewer course failures. (154) | `https://www.delphi-me.com/` |
| `/home` | Same as `/` until the 301 below is in place | Same as `/` | `https://www.delphi-me.com/` once `/home` redirects (see Configuration > SEO below) |
| `/highered` | Canvas engagement for colleges and universities · Delphinium (60) | Canvas engagement for online college and university courses. In a Utah Valley University study, course failure fell as much as 47% and withdrawals 67%. (151) | `https://www.delphi-me.com/highered` (never `/` or `/home`) |
| `/contact-us` | Contact · Delphinium | Contact Delphi M.E. about Delphinium for K-12 online schools and Higher Ed Online programs on Canvas. |
| `/support` | Support · Delphinium | Get support for Delphinium on Canvas. Send a ticket and Delphi M.E. will get back to you. |
| `/eula` | EULA · Delphinium | End user license agreement for Delphinium (Delphi M.E. LLC). |
| `/purchase-agreement` | Purchase agreement · Delphinium | Purchase agreement for Delphinium (Delphi M.E. LLC). |

On each of those pages, also set:

- Social image: `https://www.delphi-me.com/dl28-og-default.jpg`
- Card: `summary_large_image` (Zoho currently emits `twitter:card=summary` first; change the page social setting so the server-rendered tag matches)
- Canonical: Zoho adds a self canonical automatically. If the page panel has a canonical field, leave it empty or set it to that page's own `https://www.delphi-me.com/...` URL. `/highered` must never point at `/` or `/home`.
- Social title and description: the same title and description as the table (Zoho's social fields feed `og:title`, `og:description`, and the Twitter tags)
- Do not set keywords equal to the title

Also in Configuration > SEO:

- 301 `/home` and `/index` to `/`. Both are live copies of the homepage with their own canonicals, and both are in the sitemap. If Zoho will not redirect a live page, unpublish it or turn off its Sitemap XML toggle.
- 301 `/schedule-jared` to Jared’s Zoho Bookings page. It is a 404 on Zoho today, and the JSON-LD Offer points at it.
- Robots text: keep allow-all and add `Sitemap: https://www.delphi-me.com/sitemap.xml`.
- Site name: “Delphinium”, so Zoho’s `#schemagenerator` WebSite name matches ours.

`/highered` uses those Higher Ed percents (Utah Valley University study numbers). The withdrawal figure is 67% (Jared, 2026-09-29, correcting the prospectus 68%, which is superseded); if an old Zoho field still says 68%, replace it with the string above. Do not put the K-12 “Up to 31%” line on that page. Home stays “up to 31%”.

## After publish, check

- View source on `/` and `/highered`. `/highered` must not show the K-12 “Up to 31%” description as its only description.
- JSON-LD `#dl-seo` includes Organization name Delphi M.E. LLC, a WebSite, and a SoftwareApplication. No `SearchAction`, no `aggregateRating`, no `"price"`.
- `og:image` points at `/dl28-og-default.jpg` on this host.
- One visible H1 on home, Higher Ed, contact, and support.
- https://validator.schema.org/ on the homepage JSON-LD.
- Search Console URL Inspection on `/highered`: the rendered HTML shows the Higher Ed swap, and the Google-selected canonical is `/highered`, not `/`.
- `/home`, `/index`, and `/schedule-jared` answer 301, not 200 or 404.

## Resolved (Jared, 2026-09-29)

- Public contact email in Organization JSON-LD: `support@delphi-me.com`
- YouTube `sameAs`: `https://www.youtube.com/@DelphiniumEngage`
- `/highered` meta includes as much as 47% lower course failure and 67% lower withdrawals (Jared, 2026-09-29: 67, not 68; the 68% is superseded). It does not cite the part-time faculty figure; if it ever does, use 64% (Jared, 2026-09-29: 64, not 65; the 65% for part-time faculty is superseded, and 65% now means dropouts only)
- Titles about 50 to 60 characters and descriptions about 140 to 160, one set per URL (Jared, 2026-09-29). The home title no longer carries the full headline; the headline stays the H1 and the WebSite JSON-LD description.

## Still open (optional)

Vanity social URLs, a PNG logo if the SVG is too weak for Google, and any AI-crawler blocks.

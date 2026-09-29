# HubSpot legal pages: public text snapshot (read-only, 2026-09-28, 6:14 PM MT)
Source: the delphi-me.com HubSpot site (portal 44351218). Purpose: recreate these pages on Zoho Sites before the apex leaves HubSpot. The Zoho pages have NOT been created.

| Page | URL | HubSpot page id | HTTP | Words | Files |
|---|---|---|---|---|---|
| EULA | https://delphi-me.com/eula | 151498101051 (STANDARD_PAGE) | 200 | ~1,210 | `eula.md` (structured), `eula.txt` (raw innerText), `eula.html` (full page), `eula.png` (screenshot) |
| Purchase Agreement | https://delphi-me.com/purchase-agreement | 154440579919 (STANDARD_PAGE) | 200 | ~1,209 | `purchase-agreement.md`, `.txt`, `.html`, `.png` |

`inventory.json` holds the title, meta description (empty on both), canonical and links for each page.

Coverage:
- The sitemap snapshot (`../2026-09-28-hubspot-sitemap-snapshot.xml`, 11 URLs) has only these two legal pages.
- I probed privacy, privacy-policy, terms, terms-of-service, terms-of-use, terms-and-conditions, legal, dpa, data-privacy, accessibility, cookie-policy, student-data-privacy, ferpa, coppa, refund-policy, sla and security. All return 404.
- The crawled pages link only to /eula and /purchase-agreement. **There is no privacy policy or terms page on the HubSpot site.**

Notes for recreating these pages:
- The Purchase Agreement links to `https://delphi-me.com/eula` (in Definitions A and elsewhere). After cutover the apex 301s to `https://www.delphi-me.com/eula`, so the Zoho pages should use the same slugs: `/eula` and `/purchase-agreement`.
- Invoices and past agreements reference these URLs, so keep the text verbatim unless Jared or legal edits it.
- Content flags for Jared, left as they are in the snapshot:
  - EULA clause 7 cites "clause 6(c)", but the list isn't numbered on the page.

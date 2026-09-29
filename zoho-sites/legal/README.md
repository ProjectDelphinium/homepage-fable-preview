# Legal page snapshots

Repo copies of the live Zoho pages `/eula` and `/purchase-agreement`. Those pages already exist. Do not recreate them.

First captured from the public HubSpot site on 2026-09-28, 6:14 PM MT (portal 44351218), then pasted into Zoho. HubSpot page ids below are historical.

| Page | URL | HubSpot page id | HTTP | Words | Files |
|---|---|---|---|---|---|
| EULA | https://delphi-me.com/eula | 151498101051 (STANDARD_PAGE) | 200 | ~1,210 | `eula.md` (structured), `eula.txt` (raw innerText), `eula.html` (full page), `eula.png` (screenshot) |
| Purchase Agreement | https://delphi-me.com/purchase-agreement | 154440579919 (STANDARD_PAGE) | 200 | ~1,209 | `purchase-agreement.md`, `.txt`, `.html`, `.png` |

`inventory.json` holds the title, meta description (empty on both), canonical and links for each page.

Coverage:
- The sitemap snapshot (`../2026-09-28-hubspot-sitemap-snapshot.xml`, 11 URLs) has only these two legal pages.
- I probed privacy, privacy-policy, terms, terms-of-service, terms-of-use, terms-and-conditions, legal, dpa, data-privacy, accessibility, cookie-policy, student-data-privacy, ferpa, coppa, refund-policy, sla and security. All return 404.
- The crawled pages link only to /eula and /purchase-agreement. **There is no privacy policy or terms page on the HubSpot site.**

Notes:
- The Purchase Agreement links to `https://delphi-me.com/eula`. The apex 301s to `https://www.delphi-me.com/eula`. Keep the slugs `/eula` and `/purchase-agreement`.
- Invoices and past agreements reference these URLs. Cursor does not paste into Zoho. When this snapshot changes, Web Design (Grok Bot) updates the native Zoho body after Jared says to ship.
- Purchase Agreement opening line in this snapshot is Delphi M.E. LLC. It previously said "Delphinium, Inc." The rest of the agreement already named Delphi M.E. LLC. The live Zoho page still has the old opening line until this change is pasted.
- EULA: `eula.md` does not name a legal entity. The `eula.txt` preamble names "Delphi M.E., LLC". Left unchanged for Jared or counsel.
- EULA clause 7 cites "clause 6(c)", but the list is not numbered on the page. Left as captured.

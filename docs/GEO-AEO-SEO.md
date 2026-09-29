# GEO / AEO / SEO for delphi-me.com (Delphinium)

**Date:** 2026-09-29 (America/Denver)
**Product:** Delphinium, the Canvas LMS engagement layer
**Legal entity:** Delphi M.E. LLC
**Live site:** https://www.delphi-me.com (Zoho Sites)
**Pack:** `zoho-sites/homepage-sites-v5.html` + `tools/zoho/build_zoho_pack.py` → `zoho-sites/dist/`
**Claims ceiling:** `context/SOURCE.md` only. Anything new is `NEED_JARED`.
**Ops paste list:** `zoho-sites/SEO.md`
**Constraint:** Zoho Header Code and Footer Code each stay under 44,900 characters. Assets are `/dl28-*` on Zoho. Do not hotlink GitHub, raw, or HubSpot. Do not publish to Zoho live from an agent. Do not edit HubSpot or DNS.

This file is the in-repo copy of the 2026-09-29 research brief, with paths for this repo and the decisions shipped in the pack. It does not invent product claims, reviews, legal pages, or off-site profiles.

---

## 1. Definitions

| Discipline | Working definition | Goal | Unit |
| --- | --- | --- | --- |
| **SEO** | Improve visibility in classic search by optimizing content, structure, and technical elements so pages rank and earn organic clicks. | Ranked URL, then a click | Page |
| **AEO** | Structure content so it can be extracted as a direct answer (snippets, voice, AI Overviews, assistants). | Be the cited answer | Answer block |
| **GEO** | Craft content and metadata so generative systems can retrieve, summarize, and cite the brand: clear entities, credibility, structured data, unambiguous explanations. | Citation inside a synthesized answer | Entity + quotable passage |

How they nest: SEO is the foundation (crawl, index, helpful content). Google’s AI-features guidance adds no special markup beyond normal Search eligibility. AEO is the answer-shaped layer (a direct first sentence, visible Q&A). GEO is the citation layer (entity names, fact density, schema). FAQ rich results were retired in May 2026; do not chase them. A visible Q&A is for people and for answer engines. Do not add `WebSite` + `SearchAction`. This site has no on-site search, and Google removed the sitelinks search box docs in Nov 2024.

---

## 2. What the pack ships

Built by `python3 tools/zoho/build_zoho_pack.py`. Header Code gets the JSON-LD and social image tags. The path script in the page sets one title and one description per URL. `dist/` is build output. Do not hand-edit it.

| Item | Where | Decision |
| --- | --- | --- |
| Organization + WebSite + SoftwareApplication JSON-LD | Header Code, `#dl-seo` | One `@graph`. `@id`s match Zoho’s `#schemagenerator` (`https://www.delphi-me.com#organization` and `#website`) so the graphs can merge. The path script removes `#schemagenerator` after it runs. |
| No SearchAction | JSON-LD | No site search. |
| No `aggregateRating` / `review` | JSON-LD | No real reviews on the site. Software App rich results need a price and a rating. We skip both rather than invent them. |
| No `price: 0` | Offer | Delphinium is institutional licensing, not a free consumer app. Offer is contact-only: schedule a demo for pricing (`https://delphi-me.com/schedule-jared`). |
| Public email | Organization | `support@delphi-me.com` on Organization and on the sales `contactPoint` (Jared, 2026-09-29). |
| `sameAs` | Organization | Only profiles already linked in the footer. YouTube is `https://www.youtube.com/@DelphiniumEngage` (Jared confirmed; not `@DelphiniumEngagement`). Also LinkedIn company `78437190`, Facebook `1502817329972174`, X `@ProjDelphinium`. Not Jared’s personal LinkedIn. |
| Path title + description | Path script | Home and `/home` keep the K-12 description with **up to 31%**. `/highered` uses the Higher Ed percents with **as much as** (47% / 67% / 65%) and the dropout definition. It does not use the Davis 31%. Contact, support, EULA, and purchase agreement get short titles and descriptions. The script also updates `og:title`, `og:description`, `og:url`, and the matching Twitter fields, deletes extra description tags, and removes a `keywords` meta. |
| No sitewide description meta in Header Code | Build | A static K-12 `<meta name="description">` in the shared header is what crawlers saw on `/highered`. Do not put it back. |
| `og:image` + `twitter:card=summary_large_image` | Header Code, static | `https://www.delphi-me.com/dl28-og-default.jpg` (1200×630). Source file: `zoho-sites/assets/og-default.jpg`. Absolute Zoho URL. Not a GitHub hotlink. |
| Hero and story body | Homepage | Pre-#25 wording. No “Delphinium is…” line under the hero (Jared, 2026-09-29). Do not rewrite the Makeover, case, or proof story to add a definition. |
| One visible H1 | `dl-path-*` | Hero H1 on `/`, `/home`, and `/highered`. Contact and support each have one H1. Thank-you lines are paragraphs, not a second H1. Q&A uses h2 and h3. |
| Visible Q&A | `#dl-faq`, last block inside the homepage main | After the close CTA, above the footer. Three SOURCE-only answers. K-12 answer cites Davis and exact 31% with study context. `/highered` swaps to as much as 47% / 67% / 65% plus the dropout definition. No FAQPage schema. |
| Davis proof line | K-12 proof card | Restored pre-#25 line: Davis School District, Utah; 72 online classes and 6,000 students. The kicker is still “The Davis Connect study” and the figure is still exact **31%**. The fuller study sentence (same courses, teachers, and content) lives in the K-12 Q&A, not in the proof card. |

---

## 3. Path titles and descriptions

The path script is the runtime copy. Zoho’s own page SEO fields are what non-JS crawlers see. Paste the same strings there (`zoho-sites/SEO.md`). Do not let the K-12 description sit on `/highered`.

| Path | Title | Description |
| --- | --- | --- |
| `/`, `/home` | Delphinium · Canvas delivers content. Delphinium delivers engagement. | The Canvas engagement layer for K-12 online schools. Turn the Canvas courses you already run into engaging student experiences and an early-warning system for teachers. Up to 31% fewer course failures. |
| `/highered` | Higher Ed Online · Delphinium | Delphinium is the Canvas engagement layer for Higher Ed Online programs. In Higher Ed Online sections, course failure is as much as 47% lower, withdrawal as much as 67% lower, and dropout as much as 65% lower. Dropout means finishing with less than about a third of the points. |
| `/contact-us` | Contact · Delphinium | Contact Delphi M.E. about Delphinium for K-12 online schools and Higher Ed Online programs on Canvas. |
| `/support` | Support · Delphinium | Get support for Delphinium on Canvas. Send a ticket and Delphi M.E. will get back to you. |
| `/eula` | EULA · Delphinium | End user license agreement for Delphinium (Delphi M.E. LLC). |
| `/purchase-agreement` | Purchase agreement · Delphinium | Purchase agreement for Delphinium (Delphi M.E. LLC). |

Higher Ed percents (as much as 47% / 67% / 65%, with the dropout definition) are in the `/highered` meta description and in the on-page Higher Ed copy. Jared approved that on 2026-09-29. Do not put the K-12 “up to 31%” line on `/highered`.

---

## 4. Schema sketch (as emitted)

Validate at https://validator.schema.org/ . Google’s Software App rich-result test will not pass without a real price and a real rating. That is acceptable.

Organization `name` / `legalName`: Delphi M.E. LLC. `alternateName`: Delphinium, Delphi M.E. `email`: `support@delphi-me.com` (also on `contactPoint`). Logo: `https://www.delphi-me.com/dl28-logo-new.svg`. Description from the SOURCE position line (company builds Delphinium, the Canvas LMS engagement layer for online K-12 and Higher Ed Online). YouTube `sameAs`: `https://www.youtube.com/@DelphiniumEngage`.

WebSite `name`: Delphinium. `publisher` points at the Organization `@id`. `inLanguage`: en-US. Description: “Canvas delivers content. Delphinium delivers engagement.”

SoftwareApplication `name`: Delphinium. `applicationCategory`: EducationalApplication. `operatingSystem`: “Web; Canvas LMS”. `brand` and `provider` point at the Organization. Offer URL is the schedule-jared demo, description “Institutional licensing. Schedule a demo for pricing.”

Do not add FAQPage until a visible FAQ is approved to match character for character, and do not add it in order to win a Google FAQ accordion.

---

## 5. Claims rules for this surface

| Claim | Allowed framing | Where |
| --- | --- | --- |
| K-12 course failure | Exact **31%** only with Davis Connect named and the study context (72 classes, 6,000 students, same courses, teachers, and content). Promises, CTAs, and meta: **up to 31%**. | Proof card keeps the pre-#25 context line under the Davis Connect kicker and exact 31%. The K-12 Q&A carries the full study sentence. Hero and home meta use “up to 31%”. |
| Motivation | **72%** more / much more motivating; open word **Fun**. | Existing proof cards. Tiffany Dance and Natalie Niederhauser stay spelled that way. |
| HE failure / withdrawal / dropout | **as much as 47% / 67% / 65%**, only on Higher Ed surfaces, with the dropout definition (finished with less than about a third of the points). | HE proof, the HE Q&A answer, and the `/highered` meta description. |
| Names | Product = **Delphinium**. Legal publisher = **Delphi M.E. LLC**. Short company = **Delphi M.E.** Never treat “Delphi” alone as the product. Canvas is Instructure’s LMS. | Schema and meta. Do not add a visible “Delphinium is…” line to the hero. |

Never: UC Davis; Davis as the homepage logo or primary brand face; “Results like a 31%”; fake stars; invented customers, dollars, or security badges.

---

## 6. Resolved with Jared (2026-09-29)

- Public contact email is `support@delphi-me.com`. It is on Organization and on `contactPoint`.
- YouTube `sameAs` stays `https://www.youtube.com/@DelphiniumEngage`. `@DelphiniumEngagement` is not the channel.
- `/highered` meta description includes as much as 47% / 67% / 65% and the dropout definition. Home meta stays “up to 31%”.
- Later the same day: keep this technical pack. Do not rewrite the visible hero or story body. The “Delphinium is…” line stays off the page. The Davis proof card stays on the pre-#25 wording. A compact SOURCE-only Q&A sits after the close CTA, above the footer. No FAQPage schema.

## 7. Still open (optional)

- Vanity URLs for LinkedIn and Facebook, if the numeric ids in the footer should not be the canonical `sameAs`.
- A raster Organization logo (`/dl28-logo-org.png`, at least 112×112) if Google’s logo guidelines treat the SVG as weak. Schema currently uses the live SVG `/dl28-logo-new.svg`.
- Extra profiles (Crunchbase, Wikidata) before they are added to `sameAs`.
- Any block of AI crawlers in `robots.txt`. Leave allow-all until Jared decides.
- Dropping the stale `/index` URL from the Zoho sitemap, if it is still a duplicate.

---

## 8. Non-goals

- No DNS, HubSpot, or production Zoho edits. This repo does not publish the live site.
- No invented privacy, terms, or cookie pages beyond the existing EULA and purchase agreement.
- No Davis-as-logo treatment.
- No fake reviews, ratings, or testimonials.
- No new proof stats.
- No SearchAction.
- No chasing Google FAQ rich results.
- No hotlinked images or fonts.
- No blocking AI crawlers without Jared’s approval.

---

## 9. Where it lives

| Path | Role |
| --- | --- |
| `docs/GEO-AEO-SEO.md` | This file. Agents follow it. |
| `zoho-sites/SEO.md` | Publish checklist: char budget, files to upload, Zoho page SEO strings. |
| `zoho-sites/homepage-sites-v5.html` | Pre-#25 story body, Q&A above the footer, path script, single-H1 markup. |
| `tools/zoho/build_zoho_pack.py` | Emits JSON-LD and OG/Twitter image tags. Asserts the char cap and the HE description. |
| `zoho-sites/dist/` | Built header, footer, CSS. Rebuild; do not hand-edit. |
| `zoho-sites/assets/og-default.jpg` | 1200×630 image. Upload as `/dl28-og-default.jpg` before a Zoho publish. |
| `zoho-sites/assets/canvas-module-before.svg` | Makeover “before” graphic, moved out of Header Code so the schema fit. Upload as `/dl28-canvas-module-before.svg` before a Zoho publish. |
| `context/SOURCE.md` | Claims ceiling, including the public-stat attribution note. |

Header and footer must each stay at or under 44,900 characters. The build script exits if they do not.

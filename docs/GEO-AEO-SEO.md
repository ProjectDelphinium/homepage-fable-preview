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

How they nest: SEO is the foundation (crawl, index, helpful content). Google’s AI-features guidance adds no special markup beyond normal Search eligibility. AEO is the answer-shaped layer (a direct first sentence, visible Q&A). GEO is the citation layer (entity names, fact density, schema). FAQ rich results stopped showing in Google on 7 May 2026; do not chase them. A visible Q&A is for people and for answer engines. Do not add `WebSite` + `SearchAction`. This site has no on-site search, and Google removed the sitelinks search box docs in Nov 2024.

What the evidence supports (checked 2026-09-29):

- Google’s May 2026 guide, [Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), says AI Overviews and AI Mode use the normal index. There are no extra requirements. You do not need `llms.txt`, “chunking”, or special schema. It also asks you to cut duplicate content and make sure structured data matches the visible text.
- `llms.txt`: Google does not read it. No major AI search provider documents reading it. Ahrefs (June 2026, 137k domains) found 97% of published files got zero requests. Not worth shipping here.
- OpenAI, Anthropic, and Perplexity crawlers fetch raw HTML and do not run JavaScript ([Vercel crawler study](https://vercel.com/blog/the-rise-of-the-ai-crawler)). Google and Apple render. Anything this pack sets with JavaScript (the `/highered` copy swap, the path title and description, og:title) is invisible to those crawlers. Zoho’s static page fields are what they get.
- Microsoft says schema helps Copilot’s models understand pages (Fabrice Canel, SMX Munich, March 2025). Bing Webmaster Tools has an AI Performance report (citations in Copilot) and pushes IndexNow for freshness.
- The GEO paper (Aggarwal et al., KDD 2024) found that citing sources, adding quotations, and adding statistics raised visibility in generated answers by up to about 40%, and keyword stuffing did not help. The homepage already does all three (named quotes, named study, sourced stats). Caveat: it was a lab benchmark, and it measures prominence once a page is retrieved, not retrieval.

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
| Path title + description | Path script | Home and `/home` keep the K-12 description with **up to 31%**. `/highered` uses the Higher Ed percents with **as much as** (47% lower course failure, 67% lower withdrawals). It does not use the Davis 31%. Contact, support, EULA, and purchase agreement get short titles and descriptions. The script also updates `og:title`, `og:description`, `og:url`, and the matching Twitter fields, deletes extra description tags, and removes a `keywords` meta. |
| No sitewide description meta in Header Code | Build | A static K-12 `<meta name="description">` in the shared header is what crawlers saw on `/highered`. Do not put it back. |
| No sitewide `<title>` in Header Code | Build | Same problem: a static K-12 `<title>` after Zoho's own gave `/highered` a second K-12 title. Titles come from Zoho page SEO fields and the path script. The build exits if a `<title>` is in Header Code. |
| `og:image` + `twitter:card=summary_large_image` | Header Code, static | `https://www.delphi-me.com/dl28-og-default.jpg` (1200×630). Source file: `zoho-sites/assets/og-default.jpg`. Absolute Zoho URL. Not a GitHub hotlink. |
| Hero and story body | Homepage | Pre-#25 wording. No “Delphinium is…” line under the hero (Jared, 2026-09-29). Do not rewrite the Makeover, case, or proof story to add a definition. |
| One visible H1 | `dl-path-*` | Hero H1 on `/`, `/home`, and `/highered`. Contact and support each have one H1. Thank-you lines are paragraphs, not a second H1. |
| No Q&A block | Homepage | `#dl-faq` was removed on 2026-09-29 (Jared). The close CTA is the last section. Its three answers are covered by body copy: setup time (cover points, How cards), results (Davis proof card: Davis Connect, Davis School District, Utah, 72 online classes, 6,000 students, and “The courses didn't change. The teachers didn't change.”). “Does it replace Canvas?” is only implied on the page (“Keep Canvas”, “no new platform”, “You stay in Canvas”), so the SoftwareApplication description now says it outright. FAQPage stays banned. |
| Davis proof line | K-12 proof card | Restored pre-#25 line: Davis School District, Utah; 72 online classes and 6,000 students. The kicker is still “The Davis Connect study” and the figure is still exact **31%**. The card’s closing line (the courses and teachers didn't change) carries the same-courses context now that the Q&A is gone. |
| Logo alt text | Logo strip | Each alt is the name printed on the logo (for example Kings Peak High School, American Heritage Online High School, Virtual Prince William), not an abbreviation or “Partner school logo”. The clone list stays `alt=""`. |

---

## 3. Path titles and descriptions

The path script is the runtime copy. Zoho’s own page SEO fields are what non-JS crawlers see. Paste the same strings there (`zoho-sites/SEO.md`). Do not let the K-12 description sit on `/highered`.

| Path | Title | Description |
| --- | --- | --- |
| `/`, `/home` | Canvas engagement for online K-12 schools · Delphinium | Delphinium makes Canvas courses engaging for online and virtual K-12 students and gives teachers an early-warning system. Up to 31% fewer course failures. |
| `/highered` | Canvas engagement for colleges and universities · Delphinium | Canvas engagement for online college and university courses. In a Utah Valley University study, course failure fell as much as 47% and withdrawals 67%. |
| `/contact-us` | Contact · Delphinium | Contact Delphi M.E. about Delphinium for K-12 online schools and Higher Ed Online programs on Canvas. |
| `/support` | Support · Delphinium | Get support for Delphinium on Canvas. Send a ticket and Delphi M.E. will get back to you. |
| `/eula` | EULA · Delphinium | End user license agreement for Delphinium (Delphi M.E. LLC). |
| `/purchase-agreement` | Purchase agreement · Delphinium | Purchase agreement for Delphinium (Delphi M.E. LLC). |

Higher Ed percents are in the `/highered` meta description (as much as 47% lower course failure and 67% lower withdrawals) and in the on-page Higher Ed proof card (the Utah Valley University study: 14 sections, about 420 students). Jared approved that on 2026-09-29, and the same day corrected the withdrawal figure to 67% (“67, not 68”); the prospectus 68% is superseded, do not use it. Do not put the K-12 “up to 31%” line on `/highered`.

`/highered` shares its H1 with home, so the title is the main thing that tells the two URLs apart. Google’s [title link guide](https://developers.google.com/search/docs/appearance/title-link) asks for descriptive, distinct titles. Jared (2026-09-29) asked for titles of about 50 to 60 characters and descriptions of about 140 to 160, one set per URL: K-12 leads with online and virtual K-12 schools, Higher Ed with colleges and universities and the Utah Valley University study. The home title no longer carries the full headline (it ran about 70 characters and would be cut); the headline stays the H1 and the WebSite JSON-LD description. Earlier titles, for the record: home “Delphinium · Canvas delivers content. Delphinium delivers engagement.”; `/highered` “Higher Ed Online · Delphinium”, then “Canvas engagement layer for Higher Ed Online · Delphinium”.

Lengths: home title 54, description 154 (so “Up to 31%” now fits before the cut); `/highered` title 60, description 151. The build fails if a path script title passes 60 or a description passes 160. Canonicals are Zoho’s own self canonicals (`https://www.delphi-me.com/` and `https://www.delphi-me.com/highered`); the pack sets none. The `/highered` meta names the study, so “as much as 47%” carries the study framing and 67% is the study’s withdrawal result.

---

## 4. Schema sketch (as emitted)

Validate at https://validator.schema.org/ . Google’s Software App rich-result test will not pass without a real price and a real rating. That is acceptable.

Organization `name` / `legalName`: Delphi M.E. LLC. `alternateName`: Delphinium, Delphi M.E. `email`: `support@delphi-me.com` (also on `contactPoint`). Logo: `https://www.delphi-me.com/dl28-logo-new.svg`. Description from the SOURCE position line (company builds Delphinium, the Canvas LMS engagement layer for online K-12 and Higher Ed Online). YouTube `sameAs`: `https://www.youtube.com/@DelphiniumEngage`.

WebSite `name`: Delphinium. `publisher` points at the Organization `@id`. `inLanguage`: en-US. Description: “Canvas delivers content. Delphinium delivers engagement.”

SoftwareApplication `name`: Delphinium. `applicationCategory`: EducationalApplication. `operatingSystem`: “Web; Canvas LMS”. `brand` and `provider` point at the Organization. Description ends “It is not an LMS and does not replace Canvas.” (SOURCE: not an LMS replacement). Offer URL is the schedule-jared demo, description “Institutional licensing. Schedule a demo for pricing.” Search Console’s Software App report will list this item as invalid (no price, no rating). That only means no rich result. Do not add a price or rating to clear it.

There is no visible FAQ, so there is no FAQPage, and the build still fails if FAQPage appears. Google no longer shows FAQ rich results. If a Q&A comes back, FAQPage needs Jared’s OK and must match it character for character.

Not added, on purpose: `VideoObject` (the YouTube videos open in a modal and are not the page’s main content, so Google will not show video features for this page, and the upload dates are not in SOURCE), `founder` / `Person` (SOURCE does not name the founder; the page says “the researcher behind Delphinium”), `WebPage` per path (the Header Code is shared by every path), and `Review` for the testimonials (they are hand-picked quotes with no ratings, and Google’s [review snippet rules](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) make an organization ineligible for stars when it controls the reviews about itself).

---

## 5. Claims rules for this surface

| Claim | Allowed framing | Where |
| --- | --- | --- |
| K-12 course failure | Exact **31%** only with Davis Connect named and the study context (72 classes, 6,000 students, same courses, teachers, and content). Promises, CTAs, and meta: **up to 31%**. | Proof card keeps the pre-#25 context line under the Davis Connect kicker and exact 31%, and its closing line says the courses and teachers didn't change. Hero and home meta use “up to 31%”. |
| Motivation | **72%** more / much more motivating; open word **Fun**. | Existing proof cards. Tiffany Dance and Natalie Niederhauser stay spelled that way. |
| HE failure / withdrawal / dropout | **as much as 47%** lower course failure, **64%** fewer failures for part-time faculty, **67%** fewer withdrawals, **65%** fewer dropouts (dropout = finished with less than about a third of the points), only on Higher Ed surfaces. Study: Utah Valley University (cleared to name), 14 sections, about 420 students. The prospectus 68% withdrawal figure is superseded (Jared, 2026-09-29: 67, not 68), and so are the prospectus 65% part-time faculty figure (Jared, 2026-09-29: 64, not 65) and the prospectus 66% dropout figure (Jared, 2026-09-29: 65, not 66). | HE proof card (JavaScript swap) and the `/highered` meta description (47% and 67% only, so it needs no dropout definition). |
| Names | Product = **Delphinium**. Legal publisher = **Delphi M.E. LLC**. Short company = **Delphi M.E.** Never treat “Delphi” alone as the product. Canvas is Instructure’s LMS. | Schema and meta. Do not add a visible “Delphinium is…” line to the hero. |

Never: UC Davis; Davis as the homepage logo or primary brand face; “Results like a 31%”; fake stars; invented customers, dollars, or security badges.

---

## 6. Resolved with Jared (2026-09-29)

- Public contact email is `support@delphi-me.com`. It is on Organization and on `contactPoint`.
- YouTube `sameAs` stays `https://www.youtube.com/@DelphiniumEngage`. `@DelphiniumEngagement` is not the channel.
- `/highered` meta description includes as much as 47% lower course failure and 67% lower withdrawals (UVU study numbers; Jared corrected withdrawal from 68% to 67% the same day, 68% superseded). Home meta stays “up to 31%”.
- Later the same day: keep this technical pack. Do not rewrite the visible hero or story body. The “Delphinium is…” line stays off the page. The Davis proof card stays on the pre-#25 wording. A compact SOURCE-only Q&A sits after the close CTA, above the footer. No FAQPage schema.
- Later still: the Q&A section is removed (Jared: the content is already on the page). See the “No Q&A block” row in section 2 for what covers each answer.

## 6a. Live site and the two audiences (checked 2026-09-29)

Read-only checks against www.delphi-me.com:

- `/`, `/home`, and `/index` all return the homepage (200), each with its own canonical, and all three are in `sitemap-cms.xml`. Nothing in the pack links to `/home`.
- `https://delphi-me.com/schedule-jared` redirects to `https://www.delphi-me.com/schedule-jared`. As of 2026-10-05 that www path is a hidden page that instant-redirects to Schedule Jared 60 min. See `zoho-sites/pages/schedule-jared/REDIRECT.md`. The JSON-LD Offer uses `/schedule-jared`.
- `/dl28-og-default.jpg` and `/dl28-canvas-module-before.svg` are 404 (not uploaded yet).
- `robots.txt` is `User-agent: *` with no rules and no `Sitemap:` line. That allows everything. `llms.txt` is 404, which is fine.
- Zoho writes `twitter:card=summary`, its own og:title (“Higher Ed - Delphinium | Canvas engagement layer”), and a `#schemagenerator` WebSite named “Delphinium | Canvas engagement layer”. Only the path script corrects these, and only for crawlers that run JavaScript.
- `/home` and `/highered` have no Zoho meta description. Once this pack ships (no description in Header Code), they have none for non-JS crawlers until the Zoho fields are filled.

`/home` and `/highered` send the same HTML. Google renders it, so it sees the Higher Ed swap and the hidden K-12 blocks. GPTBot, ClaudeBot, and PerplexityBot do not, so to them `/highered` reads as the K-12 page (Davis 31%, parents, logos). Both paths also share the H1. Google may treat `/highered` as a duplicate and pick `/` as canonical. Least-risk handling:

1. Keep a self canonical on `/highered`. Do not point it at `/`.
2. Fill the Zoho title, description, and social fields for `/highered` with the section 3 strings. For non-JS crawlers, those fields are the only Higher Ed text.
3. Do not put Higher Ed text in the Zoho page body. Custom CSS hides `.zpsection`, so it would be hidden text.
4. After publish, check URL Inspection on `/highered`. If the Google-selected canonical is `/`, the real fix is a visible Higher Ed line near the H1 (Jared’s copy call) or a separate server-rendered Higher Ed page.

## 6b. Owner to-do (Zoho, Search Console, Bing)

Zoho (not done by agents):

- Page SEO fields on `/` and `/highered`: the titles and descriptions in section 3, the same strings in the social fields, social image `https://www.delphi-me.com/dl28-og-default.jpg`, and robots boxes unchecked.
- 301 `/home` and `/index` to `/` (Configuration > SEO > 301 Redirect). If Zoho will not redirect a live page, unpublish that page or turn off its Sitemap XML toggle.
- `/schedule-jared` is live (2026-10-05) as a page-level instant redirect to Schedule Jared 60 min (`zoho-sites/pages/schedule-jared/REDIRECT.md`). Zoho's 301 tool only accepts an internal destination, so the Bookings hop is the page Header/Footer Code.
- Upload `/dl28-og-default.jpg` and `/dl28-canvas-module-before.svg`.
- Set the Zoho site name to “Delphinium” so `#schemagenerator` matches the WebSite JSON-LD.
- Add `Sitemap: https://www.delphi-me.com/sitemap.xml` to robots.txt. Keep allow-all.

Search Console: verify the domain property and submit `sitemap.xml`. Check that the site is included in Search generative AI features (Google’s May 2026 guide calls this an eligibility requirement). After publish, URL Inspection on `/` and `/highered`: the rendered HTML should show the Higher Ed swap, and each should be its own Google-selected canonical. Watch the Generative AI performance report.

Bing Webmaster Tools: import from Search Console, submit the sitemap, and watch AI Performance (Copilot citations). Zoho has no built-in IndexNow. Use Bing’s URL submission after big updates.

Off-site: use one definition line on LinkedIn, YouTube, Facebook, and X (for example “Delphinium is the Canvas engagement layer for K-12 online schools and Higher Ed Online programs, from Delphi M.E.”). “Delphinium” is also a flower. Pairing the name with Canvas everywhere is what tells engines which one you mean.

Copy notes for Jared (not changed by agents):

- Confirmed (Jared 2026-09-29): trust strip “WCAG 2.1 Level AA” is accurate and supersedes the older “WCAG 2.0 AA / Sec 508” wording. See `context/SOURCE.md`.
- Confirmed (Jared 2026-09-29): “10 peer-reviewed studies” and “230+ citations” are accurate and now in `context/SOURCE.md`.
- Confirmed (Jared 2026-09-29): “Go live in less than 3 minutes” is accurate and supersedes “about three minutes” in `context/SOURCE.md`.
- `Your <span class="dk">school</span><span class="dh">program</span>` reads as “Your schoolprogram” to crawlers that ignore CSS.
- If a visible “not an LMS” answer is wanted, one sentence in the How section would do it. The JSON-LD already says it.

## 7. Still open (optional)

- Vanity URLs for LinkedIn and Facebook, if the numeric ids in the footer should not be the canonical `sameAs`.
- A raster Organization logo (`/dl28-logo-org.png`, at least 112×112) if Google’s logo guidelines treat the SVG as weak. Schema currently uses the live SVG `/dl28-logo-new.svg`.
- Extra profiles (Crunchbase, Wikidata) before they are added to `sameAs`.
- Organization `name` is “Delphi M.E. LLC”, and the WebSite `name` is “Delphinium”. Google’s [Organization guide](https://developers.google.com/search/docs/appearance/structured-data/organization) asks for the same name as the site name. “Delphinium” is already an Organization `alternateName`. If Jared wants the brand to lead, use `name` “Delphinium”, keep `legalName` “Delphi M.E. LLC”, and update the build check that looks for “Delphi M.E. LLC”.
- Any block of AI crawlers in `robots.txt`. Leave allow-all until Jared decides.
- `/index` and `/home` are still live duplicates of `/`. See section 6b.

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
| `zoho-sites/homepage-sites-v5.html` | Pre-#25 story body, path script, single-H1 markup. |
| `tools/zoho/build_zoho_pack.py` | Emits JSON-LD and OG/Twitter image tags. Asserts the char cap and the HE description. |
| `zoho-sites/dist/` | Built header, footer, CSS. Rebuild; do not hand-edit. |
| `zoho-sites/assets/og-default.jpg` | 1200×630 image. Upload as `/dl28-og-default.jpg` before a Zoho publish. |
| `zoho-sites/assets/canvas-module-before.svg` | Makeover “before” graphic, moved out of Header Code so the schema fit. Upload as `/dl28-canvas-module-before.svg` before a Zoho publish. |
| `context/SOURCE.md` | Claims ceiling, including the public-stat attribution note. |

Header and footer must each stay at or under 44,900 characters. The build script exits if they do not.

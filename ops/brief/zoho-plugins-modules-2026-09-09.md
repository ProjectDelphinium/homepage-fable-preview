# Zoho design / UX expanders for delphi-me.com (Sites + ecosystem)

**Date researched:** 2026-09-09  
**Audience:** Jared Chapman — HubSpot → Zoho marketing homepage rebuild  
**Scope:** What actually expands design/UX and conversion options. No fluff. Capabilities below are from Zoho product pages, help docs, and pricing as of research date. Items that could not be confirmed from primary sources are marked **VERIFY**.

---

## TLDR — Use these vs skip these

### Use these (homepage rebuild)

1. **Zoho Sites (Pro)** — primary public marketing site builder/host (not Marketing Plus as the site host).
2. **Custom HTML/CSS/JS + Code Snippet + header/footer code** — main design escape hatch (not a WordPress-style plugin store).
3. **Visual Editor + mobile/tablet style editor + element animation + sections/shapers** — native design depth without reinventing layout.
4. **Custom fonts (Pro)** + brand CSS overrides — match Delphinium brand typography.
5. **Zoho Bookings** — primary CTA (“schedule / demo”) embed on homepage.
6. **Zoho CRM webforms** (and/or Sites forms → CRM) — secondary lead capture if needed beyond Bookings.
7. **Zoho PageSense** — heatmaps + A/B / Split URL testing on the live Sites pages (Sites has no built-in A/B).
8. **Zoho SalesIQ** — optional live chat / visitor engagement (keep light; B2B education buyers often prefer schedule).

### Skip these (for homepage v1)

1. **Treating “Zoho CMS” as a separate product** — community/partner slang for Sites; no distinct public-CMS product found for this use case.
2. **Zoho Marketplace “Sites plugins”** — no real Sites app store like HubSpot/Wix/WordPress; don’t plan design around third-party theme plugins.
3. **Zoho Commerce** — ecommerce storefront; not needed for a brochure + demo CTA site.
4. **Zoho Survey** on homepage — use later for research; clutter for primary CTA.
5. **Zoho Social** as a site design tool — publishing/scheduling, not page design.
6. **Heavy scroll engines / Framer-style motion / full React SPAs** — Sites won’t become HubSpot CMS HubL or a React host; don’t design the brand around that.
7. **Marketing Plus Landing Pages as the main homepage** — useful for campaign LPs; wrong product for the persistent corporate homepage (use Sites).
8. **Subsites / multilingual / mega menu add-ons** — only if you later need microsites/locales; not required for v1 English homepage.

---

## 1. Product split — what applies to a public marketing homepage

| Product | What it is | Applies to delphi-me.com homepage? |
| --- | --- | --- |
| **Zoho Sites** | Drag-and-drop website builder + hosting + built-in blog/SEO/forms. The actual place you build the public site. | **Yes — primary.** |
| **Zoho Marketing Plus** | Unified marketing *suite* (Campaigns, Social, PageSense, Survey, Marketing Automation, Analytics, WorkDrive, Backstage/webinar-related pieces per Zoho/Valoir materials). Orchestration layer, not a replacement for Sites. | **Partial.** Use for ops/analytics/email/social; do **not** confuse with “the website.” |
| **“Zoho CMS”** | Informal label; Sites functions as the CMS. Community threads use “Zoho CMS” interchangeably with Sites. | **No separate product to buy.** |
| **Zoho LandingPage (in Marketing Plus)** | Fast campaign landing pages, pop-ups, A/B on LPs. | **Campaign micros / ads → LP.** Keep corporate homepage on Sites. |
| **Zoho SalesIQ** | Live chat / visitor tracking; native Sites integration. | **Optional UX overlay.** |
| **Zoho Bookings** | Appointment scheduling; native Sites integration. | **Yes — demo CTA.** |
| **Zoho Forms** | Standalone forms embeddable in Sites. | **Optional** if CRM/Sites forms aren’t enough. |
| **Zoho Commerce** | Full ecommerce (catalog, cart, checkout). | **No** for this marketing site. |
| **Zoho CRM webforms / Bigin forms** | Lead capture into CRM. | **Yes** for secondary capture. |
| **Zoho PageSense** | Heatmaps, session insights, A/B & Split URL tests; one-click Sites integration. | **Yes** for conversion UX. |
| **Zoho Campaigns / Marketing Automation** | Email + signup widgets/pop-ups. | **Supporting** (newsletter/pop-up), not the page canvas. |
| **Zoho Survey / Social / Analytics** | Feedback, social publishing, BI dashboards. | **Supporting** — not homepage design expanders. |

**Sources:**  
https://www.zoho.com/sites/ · https://www.zoho.com/sites/features/ · https://www.zoho.com/sites/integrations.html · https://www.zoho.com/sites/pricing.html · https://www.zoho.com/marketingplus/ · https://www.zoho.com/marketingplus/landing-pages.html · https://www.zoho.com/marketingplus/valoir-view-report.html · https://help.zoho.com/portal/en/kb/marketing-plus/getting-started/articles/introduction-to-marketing-plus

**Implication for migration:** Host and design **delphi-me.com on Zoho Sites (Pro recommended)**. Wire Bookings + CRM + PageSense (+ optional SalesIQ). Use Marketing Plus / LandingPage only if you also run paid campaigns that need disposable LPs.

---

## 2. Native Zoho Sites features that expand design

Confirmed from Zoho Sites marketing, What’s New, pricing, and FACE docs:

### Layout & visual design
- **Drag-and-drop builder** with sections, columns (resize), elements (text, images, video, tables, buttons, maps, accordion, carousels, galleries, lightbox, shapers).
- **Visual Editor / Advanced Visual Editor** — colors, fonts, headers, banners, element-level styling without code.
- **Header styles** + **mobile header styles**; **page-specific footer** (2024).
- **Mega menu**, menu icons, menu highlight (**Pro / add-on territory for mega menu** — pricing lists Mega Menu as Pro add-on).
- **Element animation** (slide, bounce, fade, etc.) — listed on Starter+.
- **Sticky content** — pin sections/elements while scrolling.
- **Message bar** — announcements / cookie notices.
- **Button groups**, hero banner height control (incl. mobile/tablet heights), device visibility per element.
- **Saved sections** (Pro).
- **Mobile and tablet style editor** — column layout, image sizing, typography, element alignment per breakpoint.
- **WCAG 2.2 AA alignment** claimed for Sites-built sites (2024 What’s New) — **VERIFY** against Delphinium’s accessibility bar in QA.

### Code & templates (real design leverage)
- **Code Snippet** element — embed third-party HTML/JS widgets on a page.
- **Header & footer code** — site-wide scripts (analytics, translators, trackers).
- **Custom CSS editor** + **custom class names** per element.
- **JavaScript events** attachable to elements (minimal JS).
- **FACE custom templates** — full HTML/CSS/JS template upload (`page.face`, `blog-*.face`, `template.conf`); closest thing to “theme development.” Third-party web fonts via `@import` in template stylesheets; Sites font library via Visual Editor / `template.conf`.
- **Custom fonts** explicitly on **Pro** pricing.

### Content / conversion building blocks on-site
- **Built-in blog**, SEO tools (titles, meta, sitemaps, reports, schema generator on Pro).
- **Built-in Sites forms** + file field (Pro); CRM / Bigin / Forms / Bookings / Campaigns / PageSense / SalesIQ / Survey / Marketing Automation listed as integrations.
- **Dynamic content** (Pro) — pull from Zoho CRM / Creator / Sheet / third-party (limits apply).
- **Subsites** — multilingual / RTL / microsites (add-on); Zoho Translation (Zia) for microsites.
- **Member portal / password protection / access control** (Pro) — not needed for public homepage.

### A/B testing on Sites itself?
- **Not a native Sites builder feature.** A/B is via **PageSense** (or LandingPage for Marketing Plus LPs). Do not assume HubSpot-style page A/B inside the Sites editor.

**Sources:**  
https://www.zoho.com/sites/features/ · https://www.zoho.com/sites/features/visual-editor.html · https://www.zoho.com/sites/features/custom-coded-websites.html · https://www.zoho.com/sites/features/high-resolution-elements.html · https://www.zoho.com/sites/whats-new.html · https://www.zoho.com/sites/pricing.html · https://documentation.zohosites.com/template.html?src=ft · https://help.zohosites.com/template-conf · https://help.zohosites.com/page-face

---

## 3. Marketplace / extensions / integrations (design-relevant)

### Honest answer
**Zoho Sites does not have a WordPress/Wix-style marketplace of design plugins.** Expansion model is:

1. **Native Zoho app integrations** (CRM, Forms, Bookings, SalesIQ, PageSense, Campaigns, Marketing Automation, Survey, Bigin, Mailchimp, GA, GTM, etc.).
2. **Code Snippet / header-footer code** for third-party embeds.
3. **FACE custom templates** for deep visual control.
4. **Zoho Marketplace** exists broadly in Zoho (especially CRM extensions) — **VERIFY** any listing before assuming it injects into Sites pages. Do not plan the homepage on “find a Sites theme plugin.”

Official integrations catalog: https://www.zoho.com/sites/integrations.html

### Design / conversion-relevant integrations (real)

| Integration | Design/UX role |
| --- | --- |
| **PageSense** | Heatmaps, A/B, personalization-oriented optimization — *expands conversion UX*, not art direction. |
| **Bookings** | Scheduling UI / CTA destination. |
| **CRM / Bigin / Forms** | Form UX + lead routing. |
| **SalesIQ** | Chat widget chrome on pages. |
| **Marketing Automation** | Signup forms + **pop-ups** on webpages (Sites What’s New). |
| **Campaigns / Mailchimp** | Newsletter widgets (Campaigns on Pro pricing list). |
| **Survey** | Embed surveys. |
| **Google Analytics / GTM / Bing Webmaster** | Measurement, not design. |
| **Google / Zoho Translate** | Multilingual UX overlays. |
| **Unsplash / Pixabay / stock image library** | Media sourcing inside builder. |
| **YouTube / Vimeo / social embeds** | Media embeds. |

**Third-party design widgets** (popups, advanced galleries, etc.) generally arrive via paste-embed, not install-from-store. Reliability, CLS, and cookie consent are your problem.

---

## 4. Ecosystem modules worth wiring for marketing UX

Mapped to Delphinium homepage job: **prove Canvas engagement → action → book a conversation** (primary CTA = schedule).

| Module | Wire for homepage? | Why |
| --- | --- | --- |
| **Bookings** | **Yes — primary** | Matches existing CTA pattern (`/schedule-jared`). Native Sites integration. |
| **CRM webforms** | **Yes — secondary** | Contact / “send materials” without booking; feeds sales pipeline. |
| **PageSense** | **Yes** | Heatmaps + A/B/Split URL on Sites; one-click Sites integration. Use for CTA copy, hero layout, proof placement. |
| **SalesIQ** | **Maybe later** | Live chat helps some buyers; can compete with Bookings CTA. Start off or soft. |
| **Campaigns** | **Supporting** | Blog/newsletter signup → nurture. Not homepage design. |
| **Marketing Automation** | **Optional** | Pop-ups / lead gen widgets if you want exit-intent capture; keep non-spammy for K-12 buyers. |
| **Forms** | **Only if needed** | Prefer CRM forms or Sites forms first to reduce tools. |
| **Survey** | **Skip homepage** | Post-demo / research. |
| **Social** | **Skip as design tool** | Schedule posts; link icons only on site. |
| **Analytics (Zoho)** | **Nice-to-have** | Dashboards combining web + CRM; PageSense + GA often enough at start. |
| **LandingPage (Marketing Plus)** | **Campaigns only** | Paid ads / webinar LPs; not the main domain homepage. |
| **Commerce** | **Ignore** | No cart. |

**Sources:**  
https://www.zoho.com/sites/integrations.html · https://www.zoho.com/pagesense/integrations.html · https://www.zoho.com/pagesense/optimize/web-testing.html · https://www.zoho.com/sites/whats-new.html (Bookings, PageSense, Marketing Automation, Survey entries)

---

## 5. Honest limits — what plugins/modules will not fix

Zoho’s own marketing claims “code when you want” / “no limitations.” Treat that as sales copy. Practical constraints for a HubSpot-quality marketing site:

1. **Not a freeform front-end host.** You are inside a section/column element model + FACE templates. Building a full **React/Vue SPA**, WebGL, or Framer-level continuous scroll narrative as “the site” is a fight you will lose or brittle-embed.
2. **Heavy scroll engines / parallax storytelling** — native tools give element animation, sticky, carousels, shapers — not GSAP ScrollTrigger-class control. Custom JS may work via snippets/header code but can break with Sites DOM updates; **VERIFY** any complex motion in staging.
3. **No plugin marketplace for design systems.** You can’t install “HubSpot theme modules” or 50 niche layout plugins. Design system = Visual Editor presets + custom CSS + optionally a FACE template.
4. **A/B is external (PageSense),** not first-class in the page editor like some CMS marketing hubs.
5. **Embed / widget height and sandbox issues** show up in Zoho community (iframe/widget sizing, cross-origin). Complex interactive demos of Delphinium itself should be **video / linked product** more than in-page app shells.
6. **Plan ceilings matter:** Starter = **5 pages**, 500MB, limited forms — too small for a real marketing site. **Pro = 50 pages**, custom fonts, dynamic content, Campaigns, redirects, schema, saved sections. Subsites/mega menu/SEO tools may be **add-ons**. Confirm current account entitlements before design lock. Source: https://www.zoho.com/sites/pricing.html
7. **Design ceiling vs Squarespace/Webflow/Framer:** Independent comparisons (and Zoho’s own Squarespace-alternative positioning) frame Sites as **ecosystem + ops**, not “most beautiful builder.” Expect more work in CSS/FACE to hit Delphinium brand polish.
8. **Popups:** Prefer Marketing Automation / Campaigns / PageSense popups rather than inventing a Sites-native popup builder. Native message bar ≠ full modal system.

**Do not invent workarounds** that fight the platform (shipping a separate React homepage on another host while “using Zoho” for forms only) unless Jared explicitly chooses a hybrid architecture.

---

## 6. Recommendation for Delphinium (homepage rebuild)

### Enable / rely on (5–8)

1. **Zoho Sites Pro** — page budget, custom fonts, redirects, schema, saved sections, CRM/Campaigns hooks.
2. **Visual Editor + mobile/tablet editors + animations + sections** — ship layout without custom template first; escalate to FACE only if brand needs structural chrome Sites templates can’t give.
3. **Custom CSS + Code Snippets + header/footer code** — brand tokens, fine typography, selective third-party embeds (e.g. YouTube).
4. **Zoho Bookings** — primary CTA (“Book a conversation / demo”).
5. **Zoho CRM webforms** — secondary capture + CRM ownership post-HubSpot migration.
6. **Zoho PageSense** — heatmaps + A/B on hero, proof block, CTA wording/placement (homepage job is conversion, not decoration).
7. **Built-in blog + SEO tools** — content engine for “Canvas engagement → action” stories.
8. **(Optional 8th) SalesIQ** — only if sales wants live assist; otherwise skip to keep CTA clean.

### Ignore for now
- Commerce, Survey-on-homepage, Social-as-design, Subsites/multilingual, Member portal, Mega menu (unless IA demands it), Marketing Plus LandingPage-as-homepage, any fantasy “Sites plugin store,” Marketing Automation popups until baseline conversion path is measured.

### Build approach (practical)
1. Design homepage **inside Sites constraints** (section stack, clear proof, one primary Bookings CTA) — see `marketing-site-brief-2026-09-04.md`.
2. Brand polish via **Pro custom fonts + CSS**, not a third-party theme marketplace.
3. Put interactive product “wow” in **video / linked demo**, not a scroll-hijack engine.
4. After launch, run **PageSense** tests on CTA and proof placement before adding chat/popups.
5. Use **Marketing Plus Landing Pages** only when running campaigns that need disposable URLs — keep `delphi-me.com` homepage authoritative on Sites.

---

## Quick decision matrix

| Need | Use | Don’t use |
| --- | --- | --- |
| Corporate homepage host | Sites Pro | Marketing Plus LandingPage alone |
| Brand fonts / CSS | Custom fonts + CSS / FACE | Hope a marketplace theme exists |
| Demo CTA | Bookings | Survey / Commerce |
| Lead form → CRM | CRM webforms / Sites forms | Random third-party form embeds |
| A/B & heatmaps | PageSense | “Native Sites A/B” (doesn’t exist) |
| Chat | SalesIQ (optional) | Default-on clutter |
| Campaign microsites | LandingPage or Sites Subsites | Replacing homepage |
| Fancy motion site | Out of scope / hybrid **VERIFY** | Expect Sites plugins to unlock Framer |

---

## VERIFY checklist (before locking architecture)

- [ ] Exact **Zoho One / Sites plan** Jared already owns (Pro features + which add-ons).
- [ ] Whether **Bookings** URL/embed can replace HubSpot Meetings 1:1 for `/schedule-jared`.
- [ ] **PageSense** entitlement (standalone vs Marketing Plus bundle) and Sites one-click enable on the production domain.
- [ ] Accessibility: WCAG 2.2 AA claim vs real audit on chosen template + custom CSS.
- [ ] Any **FACE** template work needed vs Visual Editor-only for brand match.
- [ ] Cookie consent + SalesIQ/PageSense/MA scripts under GDPR/education-buyer expectations.
- [ ] Confirm no required “Zoho CMS” SKU separate from Sites in the contract.

---

## Primary citations (2026-09-09)

- https://www.zoho.com/sites/
- https://www.zoho.com/sites/features/
- https://www.zoho.com/sites/features/visual-editor.html
- https://www.zoho.com/sites/features/custom-coded-websites.html
- https://www.zoho.com/sites/features/high-resolution-elements.html
- https://www.zoho.com/sites/whats-new.html
- https://www.zoho.com/sites/integrations.html
- https://www.zoho.com/sites/pricing.html
- https://documentation.zohosites.com/template.html?src=ft
- https://help.zohosites.com/template-conf
- https://help.zohosites.com/page-face
- https://www.zoho.com/marketingplus/
- https://www.zoho.com/marketingplus/landing-pages.html
- https://www.zoho.com/marketingplus/valoir-view-report.html
- https://help.zoho.com/portal/en/kb/marketing-plus/getting-started/articles/introduction-to-marketing-plus
- https://www.zoho.com/pagesense/integrations.html
- https://www.zoho.com/pagesense/optimize/web-testing.html

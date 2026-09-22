# Live HubSpot site inventory (read-only)
Date: 2026-09-04 (America/Denver)
Domain: https://delphi-me.com
Portal: 44351218
Source: HubSpot content analytics (TOTALS, last ~30d default window) + public homepage fetch
Guardrail: copy-only; HubSpot stays live; no edits/unpublish/DNS

## Traffic snapshot (portal content analytics)
- Aggregate rawViews ~89,983; submissions ~978; contacts ~293; bounce ~41%; avg time/pageview ~18s
- Top driver by far: Meetings link `/meetings/jared381/educate` (~50k views) — not a marketing page
- Current homepage `https://delphi-me.com` ("learn more 2", LANDING_PAGE id 190310685327): ~10.6k views, 62 submissions
- Legacy `/old` ("learn more"): ~4.4k views still
- Legacy `/homeold` (STANDARD_PAGE "Home"): ~3.2k views still

## Information architecture (ranked by views)

### Core marketing (keep / redesign on Zoho)
| Path | Title (HubSpot) | Type | Role | Notes |
|------|-----------------|------|------|-------|
| `/` | learn more 2 | LANDING_PAGE | Homepage | Primary public face |
| `/engage` | Fact Page | STANDARD_PAGE | Product/proof | |
| `/about-us` | About Us | STANDARD_PAGE | Company | |
| `/request-a-demo` | Request a Demo | STANDARD_PAGE | Lead form | High bounce (~86%) |
| `/delphinium-pricing` | Pricing | LANDING_PAGE | Pricing | Long dwell (~228s) |
| `/delphinium-pricing-report` | Pricing Report | LANDING_PAGE | Pricing deep | |
| `/contact-us` | Contact | STANDARD_PAGE | Contact form | |
| `/support` | Support | STANDARD_PAGE | Support form | High submissions |
| `/highered` | learn more Higher Ed | LANDING_PAGE | Persona LP | |
| `/schedule-jared` | Schedule Jared | STANDARD_PAGE | Booking wrapper | High submissions |
| `/help-desk-request-form` | Help Desk Request Form | STANDARD_PAGE | Support | |
| `/purchase-agreement` | Purchase Agreement | STANDARD_PAGE | Legal | |
| `/eula` | EULA | STANDARD_PAGE | Legal | |

### Event / campaign LPs (archive or redirect after cutover)
| Path | Title | Notes |
|------|-------|-------|
| `/make-canvas-courses-you-and-your-students-will-love-0-0` | Back to School Webinar - Davis | High conversion historically |
| `/make-canvas-courses-you-and-your-students-will-love-0` | Back to School Webinar - Generic | |
| `/get-the-most-out-of-canvas` | Webinar | |
| `/delphinium2024` | Generic Conference LP 2024 | |
| `/uaesp2024` | UAESP 2024 | |
| `/uassp2024` | UASSP 2024 | |
| `/davis-coaching` | Davis Principals 2024 | |

### Legacy / cleanup candidates (redirect plan draft later)
| Path | Issue |
|------|-------|
| `/old` | Prior homepage still ranking/traffic |
| `/homeold` | Older Home STANDARD_PAGE |
| `/7dea362b-3fac-3e00-956a-4952a3d4f474` | UUID slug LP (~14k views) — map destination |
| `/delphinium-pricing-1` | Pricing Draft |
| `/404` | Custom 404 traffic |

### Meetings / forms (CRM plumbing — keep working through cutover)
- `/meetings/jared381/*` (educate, schedule-a-demo, delphinium-training, etc.)
- External: `survey.hsforms.com/*`, `share.hsforms.com/*`, `app.hubspot.com/meetings/*`

## Homepage content map (from public fetch of `/`)
Ordered sections observed:
1. Skip link + institution toggle cue ("My institution is...")
2. Hero: "Help your students WANT to learn!" + Schedule FREE demo
3. Founder/research intro (Dr. Jared R. Chapman)
4. CTA: Schedule demo / Absenteeism Recovery Action Plan
5. Real Stories (Directors / Teachers tabs)
6. Who's using Delphinium (logos presumed)
7. Six feature pillars with emoji markers: Student Driven Engagement, Streamlined Communication, Insightful Data, Instant Integration, Effortless Gamification, Evidence and Theory Driven
8. Testimonials (mostly role titles, not full names — provenance risk)
9. Product cards: Engagement Builder / Community Builder / Bundle
10. Student Engagement benefit list + Messaging Center benefit list
11. Closing CTA: Get Started Today

Approved claims present: 31% failure-rate drop, Davis Connect, 72 classes, 6,000 students (matches brand SOURCE.md).

## Design / CMS-template tells (why rebuild, not clone)
- Emoji section markers (🙋‍♂️💬🚀⚡️🏆📜)
- Feature-card / benefit-grid stacks
- Generic role-only testimonials
- Multiple competing CTAs and legacy parallel homes (`/`, `/old`, `/homeold`)
- Landing-page CMS modules rather than a crafted scroll journey
- Copy density without a single engineered emotional peak

## SEO / meta inventory status
- Titles available from HubSpot for named pages (above)
- Full meta description / OG inventory: pending browser pass + per-page fetch
- Analytics pagination: first 50 content rows returned; more may exist (offset 50)

## Redirect plan status
Draft only — not implemented. Priority candidates: `/old` → `/`, `/homeold` → `/`, UUID LP → confirmed destination, stale conference LPs → archive or home.

## Next
- Visual crawl screenshots (browser, in progress)
- Draft scroll-craft BRIEF.md for homepage (grammar + signature move) for Jared OK
- Asset inventory (logo PNG from Drive pointer, product screenshots, YouTube @DelphiniumEngage)

## HubSpot CRM SITE_PAGE records (2026-09-04, read-only)
Editor template: https://app.hubspot.com/pages/44351218/editor/{id}/content
Note: Current homepage `/` is a LANDING_PAGE ("learn more 2"), not SITE_PAGE.

| Name | Slug | html title | URL |
|------|------|------------|-----|
| Support | support | Support | /support |
| Home | homeold | Delphinium | /homeold |
| Schedule Jared | schedule-jared | Schedule Dr. Jared R. Chapman | /schedule-jared |
| Purchase Agreement | purchase-agreement | Purchase Agreement | /purchase-agreement |
| About Us | about-us | About Us | /about-us |
| Help Desk Request Form | help-desk-request-form | Support | /help-desk-request-form |
| EULA | eula | EULA | /eula |
| Contact | contact-us | Contact Us | /contact-us |
| Fact Page | engage | Delphinium | /engage |
| Request a Demo | request-a-demo | Request a Demo | /request-a-demo |
| Untitled | temporary slug | — | draft/orphan |
| support (orphan) | temporary slug | — | draft/orphan |

Total SITE_PAGE objects: 12. Design Manager / File Manager: not exposed via HubSpot MCP — UI crawl in progress.

# Cursor handoff — Delphinium public homepage redesign

**Owner desk:** Web Design (Grok Bot) · **User:** Jared Chapman · **Timezone:** America/Denver  
**Status:** Continue development of the Fable 5.1 draft; HubSpot live site untouched  
**Share URL:** https://japomani.github.io/delphinium-homepage-fable-preview/  
**Repo:** https://github.com/japomani/delphinium-homepage-fable-preview  

---

## Mission

Build a better public marketing homepage for Delphinium (Canvas engagement layer for virtual/online K-12). This is **not** a pixel clone of the current HubSpot site. When Jared locks a version, Web Design stages it on **Zoho** (staging/preview). **Do not** cut DNS or unpublish HubSpot.

Primary CTA: book a conversation → `https://delphi-me.com/schedule-jared`

---


## Jared 2026-09-05 — product sell first
The first Fable dump made you scroll 4–5 screens (recognition → chase → insight → silence) before the category headline. **Wrong.**

**Rule:** first viewport must sell Delphinium the product:
- ★ Headline: Canvas delivers content. Delphinium delivers engagement.
- 25-word / 3-minute / just turn it on
- Davis: named study = 31%; promises = up to 31%
- CTA + jump to Makeover

Recognition/chase can follow as *why*, not as the opener. Do not put the sell after a long problem film.

## Starting point

`index.html` was generated with **Claude Fable 5.1** from the locked BRIEF + SOURCE pack. It already includes:

- Hero recognition (silence / blank gradebook)
- 3-minute Makeover before/after (“Which class would YOU rather take?”)
- Davis Connect proof (**31%** when study named; promises **up to 31%**)
- Motivation / Fun / Tiffany
- Families / parent-observer beat (soft literacy line, Community Builder, celebrate wins)
- How: Control Tower / messaging
- CTA to schedule-jared

Improve craft, motion, mobile, uniqueness, and fidelity to BRIEF — do not restart from a generic SaaS template.

---

## Canonical context (read these)

| File | Role |
|------|------|
| `context/BRIEF.md` | Scroll journey, peak stack, vibe, grammar notes, parent beats, hard nos |
| `context/SOURCE.md` | **Claims ceiling** — do not strengthen |
| `context/position-and-value-statements.md` | Position + ranked value statements |
| `context/delphinium-marketing-synthesis.md` | Full marketing reference |
| `context/marketing-positioning-grounding.md` | Grounding index |
| `context/youtube-brief-gap-audit.md` | Parent/family channel beats (supporting) |

---

## Product / category (public)

- **Headline ★:** Canvas delivers content. Delphinium delivers engagement.
- **IS:** Canvas LMS engagement layer / enhancement for virtual & online K-12. ~3-minute Makeover; early-warning for teachers; no migration; just turn it on.
- **NOT:** An LMS, rip-and-replace, “a website,” admin analytics alone, HE-first homepage.

### Jared-locked 31% rule
- Promises / CTAs / ads: always **“up to 31%.”**
- Citing Davis study by name with study context: exact **31%.**
- Never “up to 31%” when narrating the named study result incorrectly; never “Results like a 31%”; never “UC Davis.”

### Peak stack (do not invert)
1. **First visual:** 3-minute Makeover (gray wall → color-coded course)
2. **Gut:** Davis outcome
3. **Emotional:** 72% motivating + Fun + Tiffany
4. **Family confidence (supporting):** parents informed; positive school–family relationship; Community Builder; color-coded parent/observer view — **not** gut peak, **not** HE hero
5. **How:** Control Tower + Message Center (+ Natalie) — supporting mechanism, not the category story

### Vibe (Jared)
personal, fun, a little quirky, approachable, yet cutting-edge · playful-premium

### Site structure
- One site; homepage = K-12 online default
- Higher Ed = secondary path (`/highered` later) — link OK, not homepage hero
- Zoho staging later; HubSpot stays live until cutover OK

---

## Hard nos (public)

- “It’s the site where…” framing Delphinium as the marketing website
- Inventing stats, customers, dollars, testimonials, parent NPS / “parents are happy” as a measured %
- “UC Davis”; “up to 31%” used wrong; name typos Neuser/Dan (use **Niederhauser** / **Dance**)
- Public “Delphinium changes what the student does” unless Jared OKs
- Unnamed competitor wedge / attacking Canvas
- HE or brick-and-mortar-only as homepage hero
- Publishing SLCC UEN promo pricing ($6k / $11,950)
- AI-generated testimonial headshots / fake social proof
- Em dashes in copy (brand/scroll-craft preference)
- Feature-card grids, clay dioramas, `01/06` counters, “scroll to explore” cues, gradient text as template tells

---

## Soft / preferred wording

- Parent pain: “When a parent finds out late…” / “Parents shouldn’t need Canvas literacy…” — Overview’s “I don’t know, Dad” OK as optional aside
- Capability: color-coded parent/observer view; include observers/families on sends; celebrate wins with parents; Community Builder + 160-language translate
- Early calm outreach → support before failure; fewer surprise complaints — not invented happiness %

---

## Design / craft goals for Cursor

1. Raise visual craft and scroll experience beyond the first Fable dump without losing BRIEF peaks.
2. Makeover must feel interactive and honest (labelled demo scenario).
3. Strong mobile art direction (not just shrunk desktop).
4. Prefer authentic brand assets / CSS product UI mocks over invented photography.
5. Keep claims SOURCE-exact; when in doubt, remove a claim rather than invent.
6. Single clear CTA to schedule-jared; secondary HE path only.
7. Add a visible **DRAFT — not the live site** banner until Zoho staging.

Optional later: expand from one `index.html` into a small static structure (`/`, `/highered`, assets/) still deployable to GitHub Pages.

---

## What Cursor should NOT do

- Edit HubSpot, DNS, production Zoho, or CRM
- Open PRs against `ProjectDelphinium/serverless` (product app — wrong repo)
- Claim Zoho cutover is done
- Borrow Marketing/Product Claude pools unless Jared/Constructor says so for a new generate

---

## Hand-back when “ready”

When Jared (or Web Design) says the draft is good enough:

1. Tag or note the commit SHA on `main`
2. Confirm claims still match `context/SOURCE.md`
3. Web Design ports to **Zoho Sites/CMS staging/preview only**
4. Jared reviews Zoho preview → only then discuss HubSpot cutover

---

## Suggested Cursor agent prompt (paste / launch)

See `docs/CURSOR_AGENT_PROMPT.md`.

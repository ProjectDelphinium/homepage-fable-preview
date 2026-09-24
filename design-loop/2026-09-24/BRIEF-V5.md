# Sites v5 brief — Opus 5.5 craft (2026-09-24)

**Baseline:** Sites **v2** (`zoho-sites/homepage-sites-v2.html` / repo equivalent). Jared: v3/v4 got uglier — reset to v2 and iterate.
**Model:** Claude Opus 5.5 (`claude-opus-5-5`).
**Staging target:** https://delphinium-marketing-staging.zohosites.com (publish is Web Design / Jev after PR; you only ship repo HTML).
**HubSpot / DNS / production:** untouched.

## Goal
A Zoho Sites–shaped homepage that influences ICP (K–12 virtual / online Canvas directors) to **Schedule a demo**.
Primary CTA (every button): `https://jared-delphi-me.zohobookings.com/4937208000000036014`

## Story / flow (from Jared’s prospectus PDF — structure + voice; not a BYU quote page)
Use the prospectus arc as the page journey. Prefer prospectus phrasing when it matches SOURCE; improve freely for web; no em dashes.

1. **Hook** — Locked: “Canvas delivers content. Delphinium delivers engagement.” Value: existing Canvas → engaging student experience + early-warning for teachers/parents.
2. **Case for engagement** — Education moved online; engagement didn’t. Gray wall of text / insight-poor Canvas. (Do **not** invent RAND/NAEP/$229K/attendance stats — not in SOURCE.)
3. **Makeover peak** — “Which class would YOU rather take?” Real before/after from PDF asset `img-067` (Canvas list vs Canvas + Delphinium cells). Kill CSS-illustrated fake modules.
4. **Proof** — up to 31% promise in hero; exact 31% only with Davis Connect study context (72 classes / 6,000 students / same courses·teachers·content). 72% motivating; Netflix student quote; Fun. Supporting only — Davis is not the hero face/logo wall.
5. **What you get** — Core (Control Tower + Canvas-native + support), Engagement Builder (visual course), Community Builder / Message Center (right student, right moment). Use real PDF UI crops: Control Tower roster, Engagement widgets (`img-071`), Message Center (`img-085`).
6. **How it works** — Built on science / lightning setup (~3 min turn on) / zero learning curve (teachers keep Canvas).
7. **Video proof** — Real delphi-me Mux/YouTube videos with real posters from live catalog. Prefer K12 sizzle + directors + teachers/coaches videos. No fake AI headshots.
8. **Close** — Schedule a demo. Quiet HE Online after close only.

## Hard constraints
- **Claims ceiling:** `context/SOURCE.md` (uploaded). Fail closed. No BYU pricing, hold dates, go-live targets, “125,000 enrollments,” attendance/NAEP/$229K, or other PDF-only numbers unless they also appear in SOURCE.
- **No fake assets:** delete CSS gray-module theater and invented course stills. Use: PDF Makeover graphic, PDF product screenshots, live `delphi-me.com` / hubfs posters + Mux streams from the media catalog.
- **No AI face testimonials** from hubfs `AI-Generated Media/`.
- **Logo strip:** optional muted; Davis not primary branding.
- **Zoho Sites:** one self-contained HTML file (inline CSS/JS OK). No `scrollcraft.js`. No bottom sticky bar (badge collision until Settings remove). Custom HTML/CSS/JS only.
- **Badge:** do not add CSS `display:none` wars on Zoho credit. Note in SNIPPETS that Web Design will remove “Made with Zoho Sites” via Sites plan settings (Jared: full license). Keep footer padding sensible.
- **Provenance:** no agent/model stamps in public HTML.

## Deliverables (draft PR)
1. `zoho-sites/homepage-sites-v5.html` — full page from v2 rewrite.
2. `zoho-sites/SNIPPETS-V5.md` — paste notes for Zoho (Header / Custom CSS / snippet).
3. `design-loop/2026-09-24/BRIEF-V5.md` — this brief committed.
4. Copy useful PDF crops into `zoho-sites/assets/from-prospectus-2026-09-24/` (Makeover composite, Control Tower, Engagement widgets, Message Center) and reference them with paths that also work when hotlinked later; for GitHub Pages preview use relative `assets/...`. For Zoho staging notes, prefer also documenting public hubfs/Mux URLs for video.
5. One-line in `HANDOFF.md` + `docs/CURSOR_DESKTOP.md` if present: Biz ops · Cursor Environment `delphinium-bizops` · never Product/serverless.
6. Short PR description: what changed vs v2; asset list; claims checklist.

## Success
- Feels like prospectus quality (clean, logo-compatible colors: navy, magenta CTA, green proof, yellow energy) not v3/v4 fan-cut experiments.
- Makeover uses **real** PDF before/after graphic, not CSS fakes.
- At least one real product video (poster + link or embed) from delphi-me catalog.
- All Schedule CTAs → Bookings URL above.
- Draft banner retained until Jared clears.

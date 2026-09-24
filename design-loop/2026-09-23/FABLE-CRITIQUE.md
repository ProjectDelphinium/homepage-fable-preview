# FABLE CRITIQUE: Delphinium homepage, anti-anchor pass

**Date:** 2026-09-23 · **Author:** Fable 5.1 (design + conversion critique) · **For:** Jared Chapman, Web Design desk
**Baseline under critique:** https://delphinium-marketing-staging.zohosites.com (Zoho Sites staging, captured 2026-09-23 21:29 UTC at 1440x900 and 390x844)
**Goal of the page:** get K-12 virtual and HE Online Canvas leaders to click **Schedule a demo** → https://jared-delphi-me.zohobookings.com/4937208000000036014
**Claims ceiling:** `context/SOURCE.md` (uploads SOURCE.md is the same file). Nothing below strengthens it.
**Ship surface:** Zoho Sites only. Custom HTML/CSS/JS snippets, Header/Footer Code, Custom CSS, Code Snippet sections, native sections, Bookings CTA, embedded video. No scrollcraft.js, no pin-scrub engine, no SPA, no external host. Section 8 maps every recommendation to a Sites mechanism.

This document is a critique and a direction, not a polish list for the gray template. Where I say "kill," I mean it.

---

## 0. The one-paragraph verdict

The page argues that Canvas is a gray wall of text and Delphinium brings color and motivation. Then it delivers that argument as a gray wall of text with cards. The visual rhetoric contradicts the verbal rhetoric on every screen. The logo is a five-color fan (yellow, cyan, green, magenta, navy) and the site uses only the navy petal, which is the smallest shape in the mark (about 4% of the logo's pixels), on a #f6f7fb gray. The centerpiece question, "Which class would YOU rather take?", is answered with a stock photo of a student cheering, not a class. Five internal production notes are published as body copy. The persistent CTA is hidden behind the Zoho badge on every viewport. The whole prototype is pasted into the Header Code box, so it renders from inside `<head>` and the Sites editor cannot see it. None of this is fixable by adjusting spacing. The fix is a different page built the way Sites wants to be built.

---

## 1. Why the current design fails as visual rhetoric and persuasion

Evidence is from my own capture of staging (desktop and mobile), the served HTML, and `/zs-customcss.css`.

### 1.1 The page performs the opposite of its thesis
- Thesis: "Canvas delivers content. Delphinium delivers engagement." Gray wall → color.
- Rendering: page ground #f6f7fb, surfaces #ffffff, borders #d5d9e6, ink #1a1f3a, one accent #283391. Alternating white and pale gray bands. Every section is eyebrow → H2 → lead paragraph → card. Squint and the page is one even field. That is the visual definition of a gray wall.
- The brand mark says "playful, multi-color, engagement." The page says "fintech dashboard." A director of online learning who has seen forty edtech homepages this year will file this under "another one."

### 1.2 The centerpiece collapses
- The Makeover "Before" panel is three CSS list rows ("Module 1: Getting Started" etc.). Not a course. Nobody believes a div-built mock.
- The Makeover "After" panel is `engagethumb.png`: a stock actor in headphones with fists in the air, with a **play button baked into the pixels** that does not play anything. The question is "Which class would YOU rather take?" and the answer shown is not a class. This is the single most damaging thing on the page: it turns the strongest asset in the whole story into a bait-and-switch.
- The same `engagethumb.png` is also the hero image. The most important visual on the page appears twice and shows the product zero times.
- The three "feature tiles" under it are three video posters that all carry the same centered logo lockup. Rendered, it is a row of three identical Delphinium logos over blurred stock backgrounds. That is a feature-card grid (a hard no in `HANDOFF.md`) made of the same image three times.

### 1.3 Internal notes shipped as public copy
Published verbatim on staging:
- "Live product engagement still from delphi-me.com."
- "Marks shown on the live delphi-me.com logo wall. Soft label pending Jared clearance for staging share. Davis is one mark among others, not the hero."
- "Attribution from approved SOURCE language (paraphrase, not a lifted quote block)."
- "Product data UI from the live site (datathumb). Not a Control Tower screenshot. Real CT stills still needed."
- "Communication feature thumb (commthumb). Stands in for Message Center until a cleared MC still is captured."
- HE persona card: "Online programs on Canvas (not a campus-HE hero)."

A buyer who has to defend a purchase to a superintendent reads these and concludes the vendor is not finished. Production notes belong in HTML comments, not `<p>` tags.

### 1.4 Hero is the SaaS default, over-stuffed
Eight text elements in the hero (eyebrow, H1, lead, bold outcome line, button, subline, two persona cards with three lines each) plus a captioned image card on the right. Two persona cards use 88x72 crops of video posters that render as blurry logos. The H1 maxes at 2.85rem, which is barely larger than the H2s. Nothing on the page is big. The 31% is a chip. The 72% is the largest number on the page and it is the secondary proof.

### 1.5 Logo abuse
The wordmark PNG (663x471, "delphinium / The Engagement Builder") is squashed into a 40x40 box with `object-fit: contain`, which makes the word illegible, then the word "Delphinium" is typed next to it in DM Sans. A double wordmark, one of them unreadable. Same in the footer at 36px.

### 1.6 The persistent CTA is invisible
`.sticky-cta` is `position: fixed; bottom: 0; height 56px`. The Zoho "This site was created using Zoho Sites" badge is `position: fixed; bottom: 0; height 60px; z-index: 1000000`. Measured: sticky CTA occupies y 842 to 900, the badge occupies y 840 to 900. The badge wins on both desktop and mobile. On mobile the nav CTA is also hidden (`.nav-cta { display: none }` below 720px), so a phone visitor sees a Schedule button only in the hero and at the very bottom. The one thing a conversion page must do (keep the ask reachable) is broken.

### 1.7 Proof is typeset as an afterthought
Davis 31% sits in a bordered text box, body-size. The logo wall is grayscale at 36 to 110px wide with mismatched heights and the internal clearance note under it. "Measured in a real online program" is a good headline that gets no visual weight. For a DOL persona, this is the section they screenshot for their boss. It is currently the least designed section on the page.

### 1.8 Zero video on a brand that owns 15 videos
The live site has fifteen MP4s (Mux and hubfs) and a YouTube channel with a Makeover start-to-finish, Control Tower, and Overview. Staging embeds none. It uses posters as static tiles with fake play buttons, which trains the visitor that clicking does nothing.

### 1.9 Structurally fighting the platform
- The entire prototype (`<header class="site-nav">`, `<main>`, `<footer>`, `.sticky-cta`) is injected via **Header Code**. In the served HTML it begins at byte 5081; `</head>` is at byte 18749. The browser implicitly closes `<head>` at the first `<header>` tag. Consequences: two `<title>` tags, theme stylesheet links and the real `<body>` land mid-document, the Sites editor sees none of our content, the mobile/tablet style editor is useless, native element animation is unavailable, and every theme update risks breaking the CSS that hides the theme.
- The CyberDesk template's lorem ipsum ("The face of the moon was in shadow", "Endless Security Service" x30) is still in the DOM, hidden with `display:none !important`. Crawlers read it. The skip link points at hidden content.
- Theme fonts (Poppins, PT Sans) load alongside DM Sans. Three families, one used.

### 1.10 Copy is safe but not persuasive
Claims are inside SOURCE, which is good. But the copy narrates features instead of staging a decision. "See how Delphinium reconnects struggling students to your Canvas courses" is a subline that asks nothing. There is no risk reversal in the hero, the close repeats the hero, and the strongest sentence in the brand (the Netflix quote) is missing entirely.

---

## 2. Recommended visual system

Principle: **the page performs the Makeover.** Everything that is "Canvas" is gray. Everything that is "Delphinium" carries the fan's color. The visitor should feel color arrive.

### 2.1 Palette (logo-derived, contrast-checked)

Sampled from `Delphinium Logo.png`: yellow #F8F000, cyan #00A8E8, green #00A050, magenta #E80088, navy #283090, wordmark charcoal #404040. The brand's own video title cards use a butter ground (#FBEAB2 sampled from the Ryan Hansen and Natalie posters).

| Role | Token | Hex | Notes |
|---|---|---|---|
| Paper (page ground, "after" world) | `--paper` | #FFFCF2 | Warm white with a trace of the yellow petal. Not gray. |
| Butter (engagement surface) | `--butter` | #FBEAB2 | Brand video ground. Owns the Makeover "after" region and the student section. Ink on butter 13.0:1. |
| Ink | `--ink` | #23232A | Off-black graphite. 15.2:1 on paper. |
| Ink soft | `--ink-soft` | #5A5A66 | Tinted, not flat gray. 6.6:1 on paper, 5.7:1 on butter. |
| Canvas gray (the "before" world) | `--canvas` | #EDEDED | Only ever used for Canvas-side panels. |
| Canvas ink | `--canvas-ink` | #6B6B75 | 4.5:1 on Canvas gray. Deliberately just-legible: it is the gray wall. |
| Navy (Canvas chrome, close band) | `--navy` | #2E3192 | Logo navy. White on navy 10.7:1, butter on navy 8.9:1. |
| Accent (CTA only) | `--accent` | #C7007A | Logo magenta darkened for AA: white on accent 5.7:1, accent text on paper 5.5:1. Raw #EC008C fails AA (4.25:1) and stays inside the fan artwork only. |
| Highlighter | `--mark` | #F8F000 | Logo yellow. Used once: a solid highlighter block behind the word "engagement" in the H1. Ink on yellow 13.0:1. No gradient text. |
| Petal accents | `--green` #00A651, `--cyan` #00AEEF | Only inside the fan artwork and the Makeover/status contexts where real product UI already uses them. Never as UI accents. |

Rules: one CTA accent (magenta) for the whole page. The fan colors own regions (the Makeover "after," the close band artwork), never confetti. No pure black, no pure white surfaces except product screenshots. Secondary text is always tinted ink, never #888.

### 2.2 Type
Two families, both loadable via Google Fonts `<link>` in Header Code (or uploaded as custom fonts on Sites Pro).

- **Display: Outfit** (300 for the "Canvas delivers content." line, echoing the thin geometric wordmark; 700 for "Delphinium delivers engagement."). Tracking tightens with size: -0.02em at 3rem and above.
- **Text: Source Sans 3** (400/600), tabular numerals on for every statistic (`font-variant-numeric: tabular-nums`).
- Scale (fluid): H1 `clamp(2.6rem, 6.2vw, 5.2rem)`, line-height 1.0; H2 `clamp(1.9rem, 3.6vw, 3rem)`, 1.08; stat display `clamp(4rem, 10vw, 8rem)`; body 1.125rem / 1.6; measure 62ch max. Step the H1 down one rung under 700px.
- Kill DM Sans, Poppins, PT Sans. Set the theme fonts in the Visual Editor to Outfit/Source Sans 3 so the theme does not load a third family.
- `text-wrap: balance` on headings, `pretty` on body. Em dashes never appear in public copy.

### 2.3 Spacing and rhythm
- 4px base scale. Section padding fluid: `clamp(3.5rem, 8vw, 7.5rem)`; phones never inherit desktop air.
- More space above a heading than below it. The gap belongs to the section boundary.
- No white/gray alternating bands. Rhythm comes from three hard ground changes only: paper (hero, proof) → butter (students) → paper (teachers) → navy (close). Everything else is proximity and space.
- Max content width 1120px for text; the Makeover stage and the Control Tower diptych go edge to edge (full-bleed media, contained text).
- Cards: none as page structure. Hairlines and space instead. Product screenshots sit in a 1px navy "Canvas chrome" frame with a 12px radius and a tinted shadow (`0 24px 60px rgba(46,49,146,.12)`), nothing else gets a card.

### 2.4 Photography and video treatment
- **Real product UI or nothing.** No div-built dashboards, no stock actors standing in for the product. Every screenshot is the same demo course so the diptychs are honest ("same course, same content").
- **People appear only when they are real and named:** Ryan Hansen, Natalie Niederhauser, Tiffany Dance video tiles, after clearance. No AI headshots (the live site's `AI-Generated Media/` folder is dead to us).
- **Video plays where it is shown.** Every poster is a real facade: click plays the MP4 or YouTube inline. Never a play button in the JPEG.
- **Motion budget:** the seam sweep (one auto-play, then hand-driven), 30 to 60ms staggered entrances on text, hover 150ms on buttons. All `transform`/`opacity`/`clip-path`. Respect `prefers-reduced-motion` (keep opacity fades, drop position changes, skip the auto sweep).

---

## 3. Signature move and section journey

### 3.1 Signature move: the seam
**One gesture, used at the two moments that matter, resolved at the close.**

A vertical seam splits a real Canvas course home (left, gray) from the same course with Delphinium on (right, in color). When the hero enters view the seam sweeps once from left to right over about 1.8 seconds, so the visitor sees the Makeover happen without touching anything. Then the handle stays, and they can drag it. The same seam reappears once more on the teacher screen (gray gradebook → Control Tower red/yellow/green). At the close the seam is fully swept: the ground is navy, the fan is whole, and the calendar is on the page.

Tell-a-friend line: "It's the page where you drag a line across a Canvas course and it turns into color."

Why this converts: it makes the three-minute claim visible in three seconds, it proves "same course, same content" with the visitor's own hand, and it gives directors a thing to show colleagues. It is also honest: the two states are real screenshots of one course.

Fingerprint note (vs `ops/FINGERPRINTS.md` rows): grammar changes from Split stage / pinned scrub to a flat six-screen flow; nav changes to a native sticky bar with logo and one CTA; hero device changes to display headline over a full-bleed seam stage (single column, not 50/50); act shape is six flat screens, no pins; close changes to an inline calendar. That clears the 4-of-6 gate against both rows.

### 3.2 Section journey (six screens plus close; mobile about five thumb-scrolls)

**Nav (native header, sticky):** full-color wordmark at 140px wide (not 40px square), one button "Schedule a demo" (visible on mobile as a compact pill), one text link "Higher Ed Online." Nothing else. Kill the bottom sticky bar; the header is the persistent CTA.

**Screen 1: Hero + Makeover (sell first, Jared 2026-09-05).**
Display H1 as a diptych in type: "Canvas delivers content." in Outfit 300 graphite, "Delphinium delivers engagement." in Outfit 700 with a yellow highlighter behind "engagement." One sentence of sub copy, the CTA, one proof line. Below the text, edge to edge: the seam stage over the real course. Caption: "Which class would YOU rather take?" The visitor has seen the product, the promise, and the proof number without scrolling on desktop; on mobile the seam begins at the bottom of the first viewport and sweeps as it enters.

**Screen 2: Proof ("Measured, not promised").**
31% set as the largest type on the page, tabular numerals, with the study context typeset as part of the same visual unit: Davis Connect, Davis School District (Utah), 72 fully online classes, 6,000 students, year without vs year with, same courses, same teachers, same content, course failure rates down 31%. Davis is named as supporting proof (allowed by SOURCE), not as the hero face (the hero carries "up to 31%"). Below: the program logo row in color at a normalized cap height, once cleared, with no caption at all. One text link: "Higher Ed Online results" → `/highered` (keeps the 47/67/65 HE figures off the K-12 homepage per SOURCE).

**Screen 3: Students (butter ground).**
The Netflix quote set large as the remembered moment. Beside it, 72% and "Fun." Real student-home footage (progress, avatar) from the Engagement Builder video in a Canvas-chrome frame. Tiffany Dance paraphrase as a one-line attribution. Learn more → Makeover video (HuYuD8UQoiM).

**Screen 4: Teachers (paper ground, second seam).**
Diptych: gray gradebook → Control Tower roster with red/yellow/green. Copy covers early warning, about forty seconds to message a struggling group, families included on the send, and the parent/observer color view. Natalie Niederhauser's 12 emails a day → 6 messages a week and "saved most of my Saturday nights." Learn more → Control Tower (PIe6VxqLwkw) and Community Builder (Q80sFMP4wFQ).

**Screen 5: Risk, three lines, no cards.**
"About three minutes to turn on. No migration. Teachers stay in Canvas." Then the trust strip as plain small type: Canvas LTI 1.3 · FERPA · Chromebook-friendly (HECVAT available · US AWS · WCAG 2.0 AA / Sec 508 only after Compliance confirms; these are listed as approved optional in `context/BRIEF.md` §0 but SOURCE says never invent security posture, so confirm before publishing).

**Close (navy ground, fan whole).**
"See it on a Canvas course, live with Jared." Marketing's approved subline. The Bookings calendar embedded inline on desktop (official Bookings embed or the Sites Bookings element; see 8.10), with the "Schedule a demo" button above it as the mobile primary. Three-word risk reversal under the button. Footer: real wordmark, Higher Ed link, YouTube channel link, contact.

Total public copy on the page: about 330 words. The current page is roughly 620 plus captions.

### 3.3 Mobile art direction (not shrunk desktop)
- H1 steps down to about 2.4rem; "engagement." still highlighted; sub copy trimmed to one line group; CTA full width, 52px tall, above the seam.
- Seam stage uses a portrait crop of the same two screenshots (module list region), 4:5 aspect, so the modules are legible at 390px. Handle is 48px, and the whole image accepts a horizontal swipe, not just the handle. Auto sweep still fires once on enter.
- Proof: 31% at about 5rem, study context as a stacked list.
- Students: quote first, then 72%, then the video facade (tap to play inline, `playsinline`).
- Teachers: seam stage again in portrait crop of the roster.
- Close: button first, then the calendar embed collapsed behind a "Pick a time" toggle so the page end is not a 900px iframe.
- Header stays sticky at 56px with wordmark + pill CTA. No bottom bar, so the Zoho badge (staging only) collides with nothing.

### 3.4 Measurement plan (Sites has no native A/B)
Enable **PageSense** (one-click Sites integration). Tests in order: (1) H1 variant A vs B (below), (2) hero proof line on vs off, (3) inline calendar vs button-only close. Success metric: clicks to Bookings and completed bookings, not scroll depth.

---

## 4. Copy rewrites (inside SOURCE; no em dashes; "up to 31%" for promises, exact 31% only with Davis context)

### 4.1 Hero

**H1 (★ locked):**
Canvas delivers content.
Delphinium delivers **engagement**.

**Sub (one paragraph, 30 words):**
Give the Canvas courses you already run a three-minute Makeover. Students get a course they want to open. Teachers get early warning on who needs help. No migration.

**CTA:** Schedule a demo
**Secondary text link:** Watch the overview → https://www.youtube.com/watch?v=DuZRx9aN9tw

**Proof line (small, under the CTA):**
Up to 31% fewer course failures. Same courses, same teachers, same content.

**Seam caption:**
Which class would YOU rather take?
Drag the line. Left is a Canvas course home. Right is the same course with Delphinium turned on.

**H1 variant B for PageSense (approved message-map line):**
Give Canvas a Makeover.
Sub: Canvas delivers content. Delphinium delivers engagement. Same course, about three minutes, and students who want to open it.

### 4.2 Makeover block (sits directly under the seam stage)

**H2:** Same course. Three minutes later.

**Body:**
Nothing about the course changed: same modules, same assignments, same teacher. Delphinium adds the layer students respond to: visible progress, color that means something, and a reason to come back tomorrow. Teachers do not rebuild anything. They turn it on.

**Learn more:** See a Makeover start to finish → https://www.youtube.com/watch?v=HuYuD8UQoiM

### 4.3 Close

**H2:** See it on a Canvas course, live with Jared.

**Body (Marketing-approved line):**
Meet the person behind Delphinium and see how it could work in your Canvas courses.

**CTA:** Schedule a demo → https://jared-delphi-me.zohobookings.com/4937208000000036014

**Under the button:**
No migration to plan. Nothing to install before the call. You stay in Canvas.

**Trust line (small):**
Canvas LTI 1.3 · FERPA · Chromebook-friendly

### 4.4 Supporting copy (bonus, so the implementer is not left guessing)

**Proof:**
31%
fewer course failures at Davis Connect, Davis School District (Utah). 72 fully online classes. 6,000 students. The year before Delphinium against the year with it. Same courses, same teachers, same content.

**Students:**
"I was sitting on the couch watching Netflix and the thought popped into my head: I could be doing homework right now." (a Delphinium student, survey response)
72% of students say a Delphinium course is more or much more motivating than a traditional Canvas course. The word they use most: Fun.
Tiffany Dance, Instructional Coach at Davis Connect, calls it a game changer. Her students redo quizzes for avatar points and googly eyes.

**Teachers:**
H2: Early warning for teachers. About forty seconds to act on it.
Control Tower shows every student as red, yellow, or green from your Canvas data. Message Center sends one message to every struggling student, and to their families if you choose, in about forty seconds. Templates, multiple channels, no spreadsheet. Families see the same color-coded picture in the parent and observer view.
Natalie Niederhauser teaches high school math to more than 100 students at Davis Connect. She went from about 12 emails a day to about 6 messages a week. "Saved most of my Saturday nights."

**Risk:**
About three minutes to turn on. No migration. Teachers stay in Canvas.

Words to avoid anywhere on the page: seamless, elevate, unleash, revolutionize, next-gen, "gone quiet," "changes what the student does" (not cleared for public), "UC Davis," any dollar figure, any % about parents.

---

## 5. Which live delphi-me assets to feature, and how

| Asset | Verdict | How |
|---|---|---|
| `Delphinium Logo.png` (663x471 full-color wordmark) | **Feature** | Nav at 140px wide on paper, footer at 120px on navy (needs a light-wordmark variant; ask Jared for SVG or make one from the PNG). Fan mark alone as favicon and as the close-band artwork at large scale. Never 40x40. |
| `datathumb.png` | **Feature, cropped** | The only real product UI on the live site (Canvas + Delphinium roster with green/yellow status). Crop out the burned-in play button by using the right two-thirds, or better, replace with a clean Control Tower capture. Until then it is the "after" side of the teacher diptych. |
| YouTube: Makeover start to finish (HuYuD8UQoiM) | **Feature** | Frame grabs for the hero seam (before/after of one course) until Jared captures clean stills; embed as the Makeover "Learn more" via a click-to-load facade. |
| YouTube: Control Tower (PIe6VxqLwkw), Early-warning spot (wcYutkaPZ7A), Community Builder (Q80sFMP4wFQ), Overview (DuZRx9aN9tw) | **Feature** | Per-section "Learn more" links (Marketing 2026-09-06 asked for exactly this). Overview is the hero's secondary link. |
| Mux MP4s (K-12 brand/product videos, 1080p) | **Feature selectively** | Too heavy to autoplay (40 to 120MB). Use one as the students-section video with poster and `preload="none"`, click to play inline. Ask Jared which Mux ID is the K-12 Sizzle Reel. |
| `K12-Sizzle-Reel` poster | **Keep as poster only** | Behind the students video facade. Not a hero image. |
| `Ryan Hansen` poster, `Teachers and Instructional Coaches` poster (Natalie) | **Feature after clearance** | Two real, named video tiles under the proof screen ("Hear it from Davis Connect"). Titles from SOURCE: Ryan Hansen, Director of Digital Learning, Davis School District; Natalie Niederhauser, HS Math, Davis Connect. Flagged: clearance for staging share. |
| Program logo wall (Baker, UTVA, Davis SD, NSSD, AHS, Richfield, Kelsey Peak, Rocky Peak) | **Keep, once cleared** | In color, normalized to a 28px cap height, one row, no caption. Not grayscale, not tiny. Davis is one of eight. |
| `engagethumb.png`, `engagethumb-1.png`, `commthumb.png`, `integratethumb.png` | **Kill** | Stock actors with play buttons baked in. They are not the product and they cannot be clicked. |
| `researchthumb.png` | **Kill from homepage** | Whiteboard-animation frame; fine on a research page, wrong register here. |
| Gamification / Data / Communication / Integration title-card posters | **Kill as tiles** | All carry the identical centered logo. Use only as `poster=` on real video embeds. |
| `directorthumb.png`, `teacherthumb.png` (2880x1620 tiles with headshots) | **Hold** | Real people, but crop out the baked-in play button and confirm clearance. Prefer the plain posters above. |
| AI-generated headshots | **Never** | Hard no in SOURCE and HANDOFF. |

**Assets that do not exist and must be captured (ask Jared, six screenshots, one demo course, 2560px wide, no personal data):**
1. Canvas course home, Delphinium off.
2. Same course home, Delphinium on.
3. Canvas gradebook, Delphinium off.
4. Control Tower roster for the same course.
5. Message Center compose with "include observers" visible.
6. Parent/observer color-coded view.
Plus a 12-second muted screen recording of a Makeover being turned on, if he wants the seam to be video rather than stills (optional; stills are enough).

---

## 6. Kill / keep / invent

### Kill
- The gray/blue template palette (#f6f7fb, #283391, DM Sans) and the white/gray band alternation.
- Header Code as the page container. Rebuild as real Sites sections.
- The bottom sticky CTA bar (hidden behind the badge; duplicate chrome).
- Persona cards in the hero, the outcome line + subline stack, and every eyebrow except at most one on the page.
- Div-built "Before" mock and the stock "After" image. The Makeover is real screenshots or it does not ship.
- The three-poster feature row.
- All internal notes in public copy (six instances listed in 1.3).
- Grayscale logo wall with caption.
- Squashed 40px logo plus typed "Delphinium."
- Leftover CyberDesk sections and their hidden lorem ipsum (delete in the editor, do not hide with CSS).
- Theme fonts Poppins and PT Sans.
- The bordered "proof card." Proof is display type, not a box.

### Keep
- ★ H1 wording. The Marketing-approved close subline. "Which class would YOU rather take?"
- Sell-first order (product, promise, proof in the first viewport).
- Davis as named supporting proof with exact 31% and full study context; "up to 31%" everywhere forward-looking.
- 72% + "Fun." + Tiffany paraphrase. Natalie's Saturday nights. Control Tower + Message Center as the how.
- Family beat as supporting (parent/observer view, families on the send). No parent %.
- Bookings share URL as the one CTA destination, one label everywhere: "Schedule a demo."
- Trust line: Canvas LTI 1.3 · FERPA · Chromebook-friendly.
- Learn-more links to the official YouTube videos.
- Custom HTML/CSS/JS as the craft layer inside Sites (the approach is right; the container was wrong).

### Invent
- **The seam** (auto-sweep once, then drag) in the hero and again on the teacher screen.
- **Type diptych H1** (300 gray line, 700 color line, yellow highlighter on "engagement").
- **Butter ground** for the students screen, lifted from the brand's own video title cards.
- **31% as display type** with methodology set as part of the figure, not a footnote.
- **Netflix quote as the remembered moment**, set large.
- **Inline Bookings calendar at the close**, button-first on mobile.
- **Real video facades** (poster + click to play) instead of posters pretending to be video.
- **Closing fan**: the full five-color mark at scale on the navy close band, the only place the whole palette appears at once.
- **PageSense** A/B on H1 variant and close pattern.

---

## 7. Zoho Sites constraints note

What the platform gives us and what it does not, so nobody designs past the ceiling.

**Available (confirmed in `ops/brief/zoho-plugins-modules-2026-09-09.md` and by inspecting staging):**
- Native sections and columns with per-breakpoint mobile/tablet style editor, element animation, sticky header, hero height control, button groups, device visibility per element.
- **Code Snippet / Custom HTML** sections that accept HTML, inline `<style>`, and `<script>` (scripts run on the published/preview URL; they may not execute inside the editor canvas).
- **Header Code / Footer Code** for site-wide `<link>` (fonts, preloads) and one small deferred `<script>`.
- **Custom CSS** editor (site-wide) and custom class names on native elements, so native text can carry our tokens.
- Native **Video** element (YouTube/Vimeo URL) and image/gallery elements; Sites file manager for our own images.
- Native **Zoho Bookings** integration and **PageSense** one-click integration.
- Custom fonts upload on Pro; Google Fonts `<link>` works on any plan.

**Not available or not allowed on this project:**
- No scrollcraft.js, no pinned scrub, no scroll-hijack, no SPA, no separate host, no WordPress-style plugins.
- No native A/B (use PageSense). No REST API for publishing (manual port).
- Raw iframe of the Bookings share URL: the URL answers with `X-Frame-Options: SAMEORIGIN`, so it must be the official Bookings embed code or the Sites Bookings element, not a hand-written iframe.
- The "created using Zoho Sites" badge is fixed at `bottom: 0; z-index: 1000000` on the current staging plan. Nothing of ours may live at the bottom edge until the production plan removes it. VERIFY plan entitlement.
- Code Snippet content is wrapped in the theme's section container; set that section to full width and zero padding in the editor or the seam stage will not bleed.

**Known gotchas to design around:**
- Images inside snippets need explicit `width`/`height` attributes and `loading="lazy"` below the fold; hero images should be preloaded from Header Code.
- Test everything on the preview/published URL, not in the editor canvas.
- Keep JS to one file's worth (under ~120 lines total), vanilla, `defer`, no libraries.
- Third-party embeds (YouTube) should be click-to-load facades to keep the hero LCP under 2.5s.

---

## 8. Zoho Sites buildability: every move mapped to a Sites mechanism

Ceiling per Jared's addendum: custom HTML/CSS/JS snippets, Header/Footer Code, Custom CSS, Code Snippet / Custom HTML sections, native sections, Bookings share URL CTA, embedded video if Sites allows. Nothing below needs more than that.

| # | Move | Sites mechanism | Notes / verify |
|---|---|---|---|
| 8.1 | Palette tokens | **Custom CSS** `:root { --paper … --accent }` plus native section background colors set in the Visual Editor to the same hexes | Native sections get the ground color natively; snippets read the CSS variables. |
| 8.2 | Outfit + Source Sans 3 | **Header Code** `<link rel="preconnect">` + Google Fonts `<link>`; set theme heading/body fonts to the same families in Visual Editor (Pro: upload as custom fonts instead) | Prevents Poppins/PT Sans loading. |
| 8.3 | Type scale, tabular numerals, `text-wrap: balance` | **Custom CSS** targeting custom class names assigned to native text elements (e.g. `.dl-h1`, `.dl-stat`) | Custom class names per element are a native Sites feature. |
| 8.4 | Sticky nav with wordmark + one CTA | **Native header**: logo element (upload PNG, set width 140px), one button linked to the Bookings URL, header "sticky" on; **Custom CSS** for height, blur, and the mobile pill | Delete the current `display:none` chrome-hiding CSS. Native header gives a working mobile menu for free. |
| 8.5 | Hero type diptych + highlighter on "engagement" | Native heading element with two `<span>`s via the text editor's HTML mode, or a small **Custom HTML** block; **Custom CSS** for weights and the `background: var(--mark)` highlighter with `box-decoration-break: clone` | Pure CSS. |
| 8.6 | **The seam** (auto-sweep once, then drag) | One **Code Snippet** section set to full width: two `<img>` (before/after), the "after" clipped with `clip-path: inset(0 X% 0 0)`, an `<input type="range">` for the handle, about 40 lines of vanilla JS: IntersectionObserver fires a one-time CSS transition of the clip from 0 to 100%, then binds `input`/pointer events to update `--seam` | No scroll-hijack, no library. Reduced-motion: skip the auto sweep, start at 50%. Sketch in Appendix A. |
| 8.7 | Second seam (teacher screen) | Same snippet, different images, `data-autoplay="false"` or once | Copy the snippet; Sites Pro "saved sections" makes this a one-click reuse. |
| 8.8 | 31% display proof | Native columns: one heading element with class `.dl-stat`, one text element for context | No code beyond CSS. |
| 8.9 | Logo row | Native image gallery (row layout) or a **Custom HTML** flex row; **Custom CSS** `height: 28px; width: auto` on each | Upload cleared logos to Sites file manager; stop hotlinking hubfs before production. |
| 8.10 | Inline calendar close | **Native Zoho Bookings element** (Sites integration) or the **official Bookings embed code** pasted in a Code Snippet; keep the "Schedule a demo" button (native) linked to the share URL above it | Raw iframe of the share URL is blocked (`X-Frame-Options: SAMEORIGIN`). On mobile hide the embed behind a native accordion or a CSS toggle. VERIFY embed renders in staging preview. |
| 8.11 | Video facades (students section, Learn more) | **Code Snippet**: `<video controls preload="none" poster="…" playsinline>` with the Mux `capped-1080p.mp4` URL; YouTube Learn-more as an `<a>` to the watch URL or a click-to-load `<iframe>` swap | Native Video element also works for YouTube if a plain embed is acceptable. Mux direct MP4 URLs are public and CORS-safe for `<video>`. |
| 8.12 | Entrance motion (30 to 60ms staggers) | **Native element animation** (fade/slide up) on native elements; for snippets, a 10-line IntersectionObserver in **Footer Code** toggling `.is-in` and CSS transitions | Wrap in `@media (prefers-reduced-motion: no-preference)`. |
| 8.13 | Ground changes (paper → butter → paper → navy) | Native section background color per section | Zero code. |
| 8.14 | Kill template debris | Delete CyberDesk sections in the editor; remove the hide-theme CSS | Not a CSS job. Fixes SEO and the skip link. |
| 8.15 | Performance | **Header Code** `<link rel="preload" as="image">` for the two hero images (WebP, under 200KB each); `loading="lazy"` on everything below the fold | Aim: LCP under 2.5s on a 4G phone. |
| 8.16 | A/B and heatmaps | **PageSense** one-click Sites integration | H1 A vs B; close pattern. |
| 8.17 | Higher Ed path | Native page `/highered` later; nav text link now | Not a homepage build item. |
| 8.18 | Trust line | Native text element | Confirm HECVAT/AWS/WCAG lines with Compliance before adding them. |

Total custom JS on the page: the seam (about 40 lines, once per instance) and the entrance observer (about 10 lines). Everything else is native sections plus Custom CSS. This is a smaller code footprint than the current staging build, which carries the whole page in Header Code.

---

## 9. Asks for Jared (blocking vs not)

**Blocking the hero:** the six product screenshots listed in section 5 (one demo course, off/on). Until they arrive, frame grabs from the Makeover video are the fallback, labelled honestly in an HTML comment only.

**Blocking the proof screen from external share:** logo wall clearance (eight marks) and Ryan/Natalie tile clearance.

**Not blocking:** which Mux ID is the K-12 Sizzle Reel; a light-on-navy wordmark variant (I can derive one from the PNG); Sites plan confirmation (badge removal, custom fonts, saved sections); Compliance sign-off on the extended trust strip.

---

## Appendix A. Seam snippet sketch (for the Cursor implementer; Code Snippet section, full width)

```html
<section class="dl-seam" data-autosweep="true" aria-label="Same Canvas course before and after Delphinium">
  <div class="dl-seam__stage" style="--seam:0%">
    <img class="dl-seam__before" src="/before-course-home.webp" width="2400" height="1200" alt="Canvas course home without Delphinium: gray module list">
    <img class="dl-seam__after"  src="/after-course-home.webp"  width="2400" height="1200" alt="Same course with Delphinium: color-coded, visible progress">
    <label class="dl-seam__handle"><span class="sr-only">Drag to compare</span>
      <input type="range" min="0" max="100" value="0" aria-label="Compare before and after">
    </label>
  </div>
  <p class="dl-seam__caption">Which class would YOU rather take? Drag the line.</p>
</section>
<style>
.dl-seam__stage{position:relative;overflow:hidden;aspect-ratio:2/1;border:1px solid var(--navy);border-radius:12px}
.dl-seam__stage img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.dl-seam__after{clip-path:inset(0 calc(100% - var(--seam)) 0 0)}
.dl-seam__stage.is-sweeping .dl-seam__after{transition:clip-path 1.8s cubic-bezier(.23,1,.32,1)}
.dl-seam__handle input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0}
.dl-seam__handle::before{content:"";position:absolute;top:0;bottom:0;left:var(--seam);width:2px;background:var(--paper);transform:translateX(-1px);box-shadow:0 0 0 1px rgba(35,35,42,.25)}
@media (max-width:700px){.dl-seam__stage{aspect-ratio:4/5}}
</style>
<script>
(()=>{const s=document.querySelector('.dl-seam');if(!s)return;const st=s.querySelector('.dl-seam__stage'),r=s.querySelector('input');
const set=v=>{st.style.setProperty('--seam',v+'%');r.value=v};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
r.addEventListener('input',()=>{st.classList.remove('is-sweeping');set(r.value)});
if(reduce||s.dataset.autosweep!=='true'){set(50);return}
new IntersectionObserver((e,o)=>{if(!e[0].isIntersecting)return;o.disconnect();st.classList.add('is-sweeping');requestAnimationFrame(()=>set(100));
setTimeout(()=>set(62),2000);setTimeout(()=>st.classList.remove('is-sweeping'),3900)},{threshold:.5}).observe(st)})();
</script>
```

Behavior: sweeps 0 → 100 once when half visible, settles at 62% so both states remain visible with the "after" dominant, then the range input drives it. The same block is reused for the Control Tower diptych with different images. No dependencies.

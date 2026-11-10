# MUSE CRITIQUE: Delphinium marketing homepage (anti-anchor pass)

**Date:** 2026-09-23 · **Author:** Muse Spark · **Status:** DRAFT, not live
**Baseline beaten:** Zoho staging at `https://delphinium-marketing-staging.zohosites.com` (generic template, reference only)
**Primary CTA:** Schedule a demo → `https://jared-delphi-me.zohobookings.com/4937208000000036014`
**Claims ceiling:** `context/SOURCE.md` (repo) plus HE addendum in the 2026-09-23 upload pack for HE surfaces only
**Constraint (Jared addendum):** everything below must be buildable in Zoho Sites. No scrollcraft.js, no pin-scrub engine, no freestanding SPA, no WordPress plugins, no separate host.

---

## 1. Verdict on the staging baseline (what we are beating, not polishing)

The current Zoho staging page is a competent generic SaaS template and that is exactly the problem. It reads as: navy pill buttons, centered teal headline, gray body copy, a video card with a stat pill, two small persona cards with blurry logo thumbnails. Nothing on the page could only be Delphinium. Swap the headline for any edtech product and the layout still works. That interchangeability is the failure.

Specific charges:

1. **No visual argument.** The headline says engagement but the page shows restraint: white field, gray text, one restrained navy. The product promise (color, motion, fun) is absent from the page's own behavior. A page selling a makeover must itself look made over.
2. **The video still is doing all the emotional work, uncredited.** The strongest element on staging is the celebration still (student with headphones, arms up) because it is the only human energy on the page. But it is framed as a video card with a dead play glyph and a caption that reads like a footnote. Media is decoration here, not rhetoric.
3. **The persona cards are sterile.** Two small cards with the same logo thumbnail repeated, low contrast captions, and a Higher Ed card that the brief explicitly says is not the homepage hero. They add choice friction at the exact moment the page should add momentum.
4. **The 31% claim is correctly hedged and badly staged.** "Up to a 31% reduction in course failure rates" is the right promise language, but it appears twice in competing treatments (body bold + blue pill) with no study context, so it reads as marketing number rather than measured outcome. Proof without context invites skepticism.
5. **No emotional curve.** Every section sits at the same polite volume. There is no boredom beat, no surprise beat, no relief beat. A flat page cannot move a director to book a call.
6. **Mobile is stacked, not directed.** The mobile shot shows hero, CTA, then cards in one long polite column. No sticky CTA, no makeover moment above the fold, no reason to keep scrolling.

None of this is fixed with better padding. The information architecture, color system, and media logic need replacement. What follows is that replacement, inside the Zoho Sites budget.

---

## 2. Visual rhetoric: the argument the page must make with its eyes

Thesis: **the page itself must demonstrate the before/after transformation it sells.** Delphinium's whole category claim is gray wall of Canvas text in, color-coded living course out. So the page should open gray and get colorful, literally. A visitor should feel the makeover happen to the page they are reading, not just read about it happening to someone else's course.

Rhetorical structure (five moves, one per screen):

1. **Recognition (gray).** Open with the Canvas gray wall as a visual texture: dense, monochrome, flat. The visitor, who lives in Canvas admin views, should feel "this is my Tuesday." Restrained palette, tight leading, boxy list rows. This is the only gray section on the page.
2. **Rupture (the switch).** One interaction flips the same course into color. Same content, new skin. This is the page's thesis statement and it must be visible without scrolling on desktop and within one swipe on mobile.
3. **Proof (numbers, quiet design).** After the color high, go visually quiet: white field, one large "up to 31%" with Davis study context in small honest type. Let the number be the color. Restrained design here reads as confidence.
4. **Warmth (human energy).** Fun, Tiffany, Natalie, the Netflix quote. Real product video and real student voice. Color returns but as accents, not noise. This is the likability stretch that makes a buyer want to meet Jared.
5. **Control (competence).** Control Tower and Message Center as calm, dark, instrument-like panels. The closer is reassurance: this fun thing is also governable. Then one CTA, large, with a human subline.

Peak order honored throughout: Makeover first, Davis gut, motivation/Fun/Tiffany emotion, family as supporting confidence, Control Tower/Message Center as the how. Family never headlines, Higher Ed never headlines, Davis never becomes a logo wall without clearance.

---

## 3. Emotional curve (designed, not hoped for)

| Screen | Feeling | Intensity | Copy job |
|---|---|---|---|
| 1. Gray wall | Tired recognition ("our courses look like this") | Low, flat | Name the pain in their words |
| 2. The switch | Delight and surprise ("same course?") | Spike, the page peak | Label it an honest demo, invite the flip |
| 3. Davis proof | Belief ("measured, same teachers, same content") | Calm, grounded | Study context, exact 31% only here |
| 4. Fun and voice | Liking ("students call it fun") | Warm rise | 72%, Tiffany, Netflix quote |
| 5. Teacher time | Relief ("Saturday nights back") | Warm, personal | Natalie Niederhauser, ~40 seconds |
| 6. Family calm | Trust ("parents stop finding out late") | Soft, supporting | Parent view, Community Builder, no invented happiness stats |
| 7. How it runs | Confidence ("we can operate this") | Cool, competent | Control Tower, Message Center |
| 8. Final CTA | Resolve ("book the call") | One clear action | Meet Jared, see your own courses |

The staging page sits at row 3 volume for all rows. The redesign spends restraint early (gray), spikes once (the switch), then converts warmth into a booking. One spike per page. Everything else serves it.

---

## 4. Color energy: logo-compatible, staging-incompatible

The Delphinium mark is the palette brief: a shard fan in **yellow (dominant), cyan/sky blue, green, deep navy, magenta**, over a gray wordmark with a green "The Engagement Builder" tagline. The staging page uses almost none of this energy: navy buttons, teal headline, gray text, one pale blue pill. It is logo-adjacent, not logo-compatible.

### Palette tokens (sampled from `Delphinium-Logo.png`, verify with eyedropper before lock)

```css
:root {
  --delph-ink: #0f3338;      /* headlines, deep teal ink (keep from staging, it works) */
  --delph-navy: #2b2f7e;     /* primary CTA, trust surfaces */
  --delph-navy-deep: #1d2158;/* CTA hover, footer */
  --delph-yellow: #ffe600;   /* energy accent, makeover "after" highlights, never body text */
  --delph-cyan: #29aae1;     /* links, progress cues, observer view accents */
  --delph-green: #00a651;    /* success states, parent calm, tagline echo */
  --delph-magenta: #ec008c;  /* sparing: gamification dots, avatar points, one spike per screen max */
  --delph-paper: #fffdf6;    /* warm page ground instead of clinical #ffffff */
  --delph-slate: #4c5a67;    /* body copy */
  --delph-gray-wall: #e8e9eb;/* the "before" gray, quarantined to section 1 only */
}
```

### Color rules (opinionated)

1. **Gray is quarantined.** `--delph-gray-wall` appears exactly once: the before frame. Everywhere else, surfaces are warm paper, white, or deep navy. Gray must read as "the old world," not the site chrome.
2. **Yellow is energy, not text.** Yellow never carries words (contrast failure). It underlines, highlights behind ink text, and marks the "after" state. One yellow moment per viewport.
3. **Magenta is a spice, not a sauce.** One magenta accent per screen maximum: a progress dot, an avatar point badge, a small underline. Staging uses zero magenta; the logo demands some.
4. **Navy owns action.** Every bookable element is navy, same shape, same label. No competing button colors. Secondary links are text links, not ghost buttons.
5. **The after-state palette is the product palette.** The made-over course frame uses yellow/cyan/green/magenta chips on white, mirroring the logo shards. The page teaches the brand while demonstrating the product.
6. **Dark closer.** The Control Tower section and footer go deep navy/teal. Ending dark makes the final navy-on-white CTA button pop by inversion and signals "instrument, not toy."

---

## 5. Media direction: video and posters first, sterile cards never

Ruling principle: **prefer real product and real motion over CSS mocks and stock.** The 2026-09-23 live media catalog gives us a usable kit with known gaps. Plan around both.

### Feature, don't frame (ranked)

1. **Hero media: K12 Sizzle Reel poster as the face, with an honest play button.** The celebration still already on staging (student, headphones, arms up) is the poster for live K12 video. Keep the image, change the rhetoric: large play affordance, caption naming it as product video ("Watch a Delphinium course in action, 60 seconds"), tap to play embedded video. It earns the hero slot because it shows the emotional outcome, but it must play, not sit.
2. **The Makeover Switch is the centerpiece, built from `engagethumb.png` + `datathumb.png`.** These are the only clearly visible product UI thumbs in the catalog. The before frame is a plain gray CSS list (Canvas wall, labelled "typical Canvas module list, illustrated"). The after frame shows the real thumbs plus color-coded CSS rows. Same course, same content caption throughout. Honest labelling is what makes this persuasive instead of gimmicky.
3. **Feature tiles use the live title-card posters** (Communication, Data, Gamification, Integration) as clickable video tiles with per-topic Learn More links to the official YouTube URLs in BRIEF. These replace the sterile persona cards entirely. Four tiles max, each with a one-line capability caption, no invented claims.
4. **Higher Ed poster stays off the homepage hero.** `Higher-Ed-Elevate-and-Amplify` poster is reserved for the secondary HE path section near the footer, one quiet link. Homepage leads virtual K-12 per brief.
5. **No logo-wall without clearance.** Customer and institution marks from the catalog (Davis School District, Utah virtual schools, HE logos) stay out of staging until Jared clears each mark. Davis appears as named study text with context, never as a logo strip. This is both a legal and a credibility call: the brief keeps Davis as proof, not the face.

### Kill list for media

- Repeated logo thumbnails as card art (the current persona cards). A logo is not an illustration.
- Any AI-generated testimonial headshots from the catalog's `people/` folder. They are catalogued as AI-sourced and must never carry names, quotes, or claims.
- Stock celebration photography presented as evidence. The celebration still is legitimate only as the labelled poster of a real product video.
- Fake dashboard mockups invented in CSS that imply a Control Tower screenshot we do not have. The catalog flags this gap openly: no public Control Tower or Message Center screenshot exists. Show the capability as calm dark panels with real capability copy, never as a fabricated UI screenshot.

---

## 6. Persuasion path to "Schedule a demo"

One job per screen, one primary CTA repeated, micro-commitments between. The buyer is a K-12 virtual director, principal, or instructional coach who already pays for Canvas.

1. **Hero: category + outcome + action in one viewport.** Headline (locked), 25-word support, up to 31% promise line, navy CTA, and the playing video still. No persona choice, no navigation maze. The only decision is watch or book, and both are visible.
2. **The switch: the demo before the demo.** Flipping before/after is a micro-conversion. A visitor who flips has rehearsed the sales call. Caption under the switch: "Same course. Same content. About three minutes." Then a quiet text link: "See it on your courses, schedule a demo."
3. **Proof: answer the skepticism the switch creates.** "That looks nice, but does it work?" gets Davis Connect with full study context (72 fully online classes, 6,000 students, same courses, same content, same teachers, year without then year with) and the exact 31% decrease, stated once. Forward-looking lines elsewhere say "up to 31%." This split is the Jared lock and the page must show both forms used correctly.
4. **Liking: 72% motivating, most common word "Fun," Tiffany Dance avatar redos, the Netflix quote.** This is the section a principal forwards to a teacher. Include one Learn More video link, not five.
5. **Cost of inaction, gently.** Teacher time (Natalie Niederhauser: about 12 emails a day down to about 6 manual messages a week, Saturday nights back) plus the Message Center 40-second send. No invented ROI dollars, no pricing, no discount language.
6. **Family calm as supporting beat.** Late-find-out pain, color-coded parent/observer view, Community Builder with 160-language translate, celebrate wins with parents. Short. No happiness percentages. Positioned for the principal's parent-complaint anxiety, then move on.
7. **How it runs: Control Tower + Message Center + no migration.** Three calm facts (Canvas native, about three minutes, no new tool to learn) as a checklist, not cards. Objection handling, not a new pitch.
8. **Final CTA: human, not corporate.** "Schedule a demo with Jared. Meet the person behind Delphinium and see how it could work in your Canvas courses." Bookings URL button, large. Below it, one quiet line linking the HE Online path. Footer carries the DRAFT banner note until staging is approved.

CTA discipline: the label "Schedule a demo" appears on every navy button, identical wording, identical destination. No "Learn more" buttons competing visually; Learn More links are text links to YouTube. No newsletter popup on first visit (keep Marketing Automation popups off until PageSense data says otherwise).

---

## 7. Kill / keep / invent

### Kill
- Persona choice cards in the hero zone (K-12 vs Higher Ed split at first viewport). Homepage leads K-12; HE gets one quiet line at the close.
- Repeated logo thumbnails as illustration.
- The blue stat pill floating without study context.
- Generic stock-as-evidence and all AI headshots with attributed quotes.
- Feature-card grids, numbered-step chrome, gradient headline text, "scroll to explore" cues (all listed template tells in HANDOFF).
- Em dashes anywhere in page copy (brand rule). UC Davis naming (always Davis Connect / Davis School District, Utah).
- Marketing Automation popups, SalesIQ chat, and any second CTA competing with the demo button on v1.

### Keep
- Locked headline: Canvas delivers content. Delphinium delivers engagement.
- Up to 31% promise language in hero and CTAs; exact 31% with Davis study context in proof.
- Celebration video still, reframed as a real playable product video.
- Real product thumbs (`engagethumb.png`, `datathumb.png`) as the after frame.
- Title-card video posters as the feature tile set with official YouTube Learn More links.
- Natalie Niederhauser and Tiffany Dance with correct spellings, SOURCE-exact details.
- Netflix couch quote, 72% motivating with Fun, Community Builder with 160-language translate, ~40 second Message Center send.
- DRAFT banner until Zoho staging is approved. HubSpot, DNS, and production Zoho untouched.

### Invent
- **The Makeover Switch** (signature move, section 8): labelled before/after toggle, same course both sides, gray quarantined to before.
- **Logo-shard ribbon dividers**: thin angled color bars (yellow/cyan/green/navy/magenta) between sections, pure CSS. The brand mark becomes the page's punctuation.
- **Quiet proof treatment**: oversized "up to 31%" with study context in small honest type, no pill, no glow.
- **Dark competence closer**: Control Tower section on deep navy with a pre-demo checklist.
- **Sticky mobile demo bar**: persistent bottom bar with one navy button after the hero scrolls away.
- **Human CTA close**: Jared-named subline under the final button, per Marketing 2026-09-06 feedback.

---

## 8. Signature move: The Makeover Switch

One interaction, labelled honestly, doing the selling that five sections of copy cannot.

**What it is:** a two-frame toggle. Left (or top on mobile) shows a gray, dense, monochrome module list labelled "A typical Canvas course today (illustrated)." Right (or bottom) shows the same course made over: color-coded rows, progress cues, avatar point badge, built from the real `engagethumb.png` / `datathumb.png` thumbs plus CSS rows. A large tap target flips between them with a 300ms crossfade. Caption beneath, always visible: "Same course. Same content. About three minutes. No migration."

**Why it wins:** it compresses the category claim into five seconds of touch; it creates a micro-conversion before the demo ask; it is honest by construction (labelled illustration plus real thumbs, never a fake screenshot); and it is buildable in Zoho Sites with zero scroll engine (see section 11).

**What it is not:** not a scroll-scrubbed animation, not a draggable slider requiring pixel math, not an embedded app. A toggle. Restraint is the point.

---

## 9. Copy beats (section journey, draft copy, no em dashes)

Claims-checked against `context/SOURCE.md`. Spellings: Niederhauser, Dance. Percent rule: "up to 31%" for promises, exact "31%" only in the Davis proof block with study context.

1. **Eyebrow:** Canvas engagement layer for virtual and online K-12
2. **H1:** Canvas delivers content. Delphinium delivers engagement.
3. **Sub (25-word):** Delphinium turns the Canvas courses your program already has into experiences students actually open, and gives teachers visibility into who needs help.
4. **Promise line:** Schools using Delphinium have seen up to a 31% reduction in course failure rates.
5. **CTA + subline:** [Schedule a demo] / Meet the person behind Delphinium and see how it could work in your Canvas courses.
6. **Makeover head:** Which class would YOU rather take? **Caption:** Same course. Same content. About three minutes. No migration. Left: a typical Canvas course today (illustrated). Right: the same course with Delphinium.
7. **Proof head:** Measured where it matters: fully online, same everything. **Body:** At Davis Connect, Davis School District, Utah, 72 fully online classes and 6,000 students used the same courses, same content, and same teachers, comparing the year before Delphinium to the year with it. Result: a 31% decrease in course failure rates. Learn more: Davis case video link.
8. **Motivation head:** Students call it more motivating. Their word for it: fun. **Body:** 72% of students say Delphinium is more or much more motivating than a traditional Canvas course. Instructional coach Tiffany Dance watched students redo quizzes to earn avatar points and googly eyes. One student put it this way: "I was sitting on the couch watching Netflix and the thought popped into my head: I could be doing homework right now."
9. **Teacher time head:** Saturday nights back. **Body:** High school math teacher Natalie Niederhauser went from about 12 emails a day to about 6 manual messages a week. The Message Center reaches a struggling group in about 40 seconds, across channels students actually read.
10. **Family head (supporting):** Parents see where things stand, before the grade does. **Body:** When a parent finds out late, the grade has already taken a hit. Delphinium gives families a color-coded view of progress without needing Canvas literacy, and Community Builder shares weekly progress in up to 160 languages. Celebrate wins with parents, not just warnings.
11. **How head:** Built to run inside Canvas, not next to it. **Checklist:** Canvas native, about three minutes to turn on, no migration, no new tool for teachers to learn, Chromebook friendly. Control Tower shows who needs help. Message Center turns that signal into outreach.
12. **Final CTA head:** Fewer failures. Up to 31%. **Sub:** Schedule a demo with Jared. Meet the person behind Delphinium and see how it could work in your Canvas courses. [Schedule a demo]. **Quiet line:** Running Higher Ed Online on Canvas? Ask about the HE path.

---

## 10. Asset plan (from the 2026-09-23 live media catalog)

| Slot | Asset | Source | Treatment |
|---|---|---|---|
| Hero video | K12 Sizzle Reel poster + Mux stream | live catalog High ranks 3-10, poster `K12-Sizzle-Reel-With-Title-Card-mp4-poster.jpg` | Native video element with poster, tap to play; caption names it as product video |
| After frame | `engagethumb.png`, `datathumb.png` | `hubfs/engagethumb.png`, `hubfs/datathumb.png` | Cropped into color-coded rows; alt text honest ("Delphinium course view") |
| Feature tiles | Communication, Data, Gamification, Integration title-card posters | live catalog posters | Four video tiles max, each with official YouTube Learn More link from BRIEF |
| Proof | No image; typographic number | n/a | Oversized numerals, study context in small type; no logo wall |
| Family | `Communication-with-Title-Card` poster or CSS parent-view mock | catalog | Capability visual only, no invented parent testimonial |
| HE path | `Higher-Ed-Elevate-and-Amplify` poster | catalog | One quiet link block near footer, off the hero |
| Header/footer | `Delphinium-Logo.png` | `hubfs/Delphinium%20Logo.png` | Header wordmark, footer lockup; favicon `delphiMEFavicon.png` |
| Never ship | AI headshots in `people/`, uncleared institution logos | catalog Low/Med/customer marks | Excluded until Jared clears each face and mark in writing |

**Gap to close with Jared:** no public Control Tower, Message Center, or before/after screenshot exists in the catalog. Options in order: (a) export fresh stills from the Mux feature videos, (b) record a 20 second labelled demo capture for the after frame, (c) keep CSS illustration labelled as illustration. Never fabricate a dashboard screenshot.

**Mobile notes:** single column; Makeover Switch stacks before on top with the toggle pinned; video poster full width with 16:9 ratio; sticky bottom demo bar appears after hero; tiles become a vertical tap list; numerals scale with clamp so "up to 31%" never overflows a 360px viewport; touch targets 44px minimum.

---

## 11. Zoho Sites buildability (each move mapped to a Sites mechanism)

Ceiling per Jared addendum: custom HTML/CSS/JS snippets, Header/Footer Code, Custom CSS, Code Snippet / Custom HTML sections, native sections, Bookings share URL CTA, embedded video where Sites allows. Nothing below needs more than that.

| # | Design move | Sites mechanism | Notes |
|---|---|---|---|
| 1 | Page skeleton, 8 sections in order | Native sections + columns, device visibility per element | No FACE template required for v1; escalate only if brand chrome demands it |
| 2 | Palette tokens, type scale, ribbon dividers | Custom CSS editor + custom class names per element | Ribbons are static `clip-path` polygons; zero JS |
| 3 | Makeover Switch toggle | One Code Snippet / Custom HTML section: radio inputs + labels + CSS `:checked` crossfade | No JS framework; optional 10 line vanilla script for analytics event only; verify in staging preview |
| 4 | Gray wall texture (before frame) | Custom CSS list styling inside the same snippet | Static styled list; labelled "illustrated" |
| 5 | After frame with product thumbs | Image elements or `<img>` in snippet pointing at hosted hubfs/local copies | Rehost thumbs in Sites file manager; keep honest alt text |
| 6 | Hero video with poster | Native video element or YouTube/Mux embed via Code Snippet | Prefer native video element with poster attr; fallback YouTube embed; confirm autoplay off and tap to play on iOS |
| 7 | Feature video tiles | Native image + link, or video elements with posters | Link each tile to official YouTube URLs; no lightbox plugin needed |
| 8 | Sticky mobile demo bar | Native sticky content / sticky section | Show on mobile breakpoint only via mobile style editor / device visibility |
| 9 | DRAFT banner | Native message bar at top | Keep until Zoho staging approved; remove only on Jared OK |
| 10 | Schedule a demo buttons | Native buttons pointing at the Bookings share URL | Same label, same URL everywhere; test Bookings embed vs outbound link and ship whichever converts in PageSense |
| 11 | Element entrance motion | Native element animation (fade/slide) | One subtle fade per section max; no scroll scrub, no pin, no GSAP |
| 12 | Quiet proof numerals | Visual Editor text with custom classes | `clamp()` sizing in Custom CSS for 360px safety |
| 13 | Dark competence closer | Native section with dark background + checklist | Checklist is text elements, not a plugin |
| 14 | SEO, schema, fonts | Pro: custom fonts, SEO titles/meta, schema generator | Confirm Pro entitlements before lock |
| 15 | A/B and heatmaps | PageSense one-click integration (outside the page editor) | Test hero layout, proof placement, CTA subline after launch |
| 16 | Secondary capture | Sites forms or CRM webforms | Only if Bookings alone underperforms; never a popup on v1 |

**Explicitly out:** scrollcraft.js or any pin-scrub scroll engine, full React/Vue SPA, Framer-style continuous narrative, WordPress plugins, third-party gallery/popup widgets via fragile embeds, Marketing Plus Landing Page as the homepage host, any design that fights the section/column element model.

**Verify in staging before lock:** (a) Code Snippet CSS `:checked` toggle across Sites preview and published page, (b) video poster + tap-to-play on iOS Safari and Android Chrome, (c) sticky bar behavior with the message bar banner present, (d) Bookings share URL vs embed conversion, (e) custom font rendering on the Pro plan, (f) 360px overflow pass on numerals and tiles.

---

## 12. Zoho Sites note (staging discipline)

Draft lives in this repo. Preview on GitHub Pages. Stage to Zoho Sites staging/preview only via Code Snippet and custom HTML/CSS on Pro. Jared OK required before any Zoho publish. Never cut DNS, never unpublish HubSpot, never touch production Zoho or CRM plumbing. Confirm the approved draft commit SHA at hand-back. HE Online numbers from the upload pack (as much as 47% lower failure, 67% lower withdrawal, 65% lower deep disengagement) stay on HE surfaces with study context; the homepage promise stays "up to 31%" with Davis as the named proof.

---

## 13. Claims compliance checklist

- [ ] Every percentage traces to `context/SOURCE.md` or the HE addendum with audience restriction noted
- [ ] Promise language says "up to 31%"; exact "31%" appears only beside the Davis Connect study context
- [ ] No "UC Davis" anywhere; spellings Niederhauser / Dance verified
- [ ] No invented customers, dollars, testimonials, security badges, or parent happiness stats
- [ ] No em dashes in any page copy beat above
- [ ] Davis is proof text, not a logo wall or hero face
- [ ] Peak order intact: Makeover, Davis, Fun/Tiffany, family supporting, Control Tower/Message how
- [ ] DRAFT banner present until Zoho staging approved

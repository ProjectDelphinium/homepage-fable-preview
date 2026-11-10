# Fable pass 2: staging homepage, anti-anchor

**Date:** 2026-09-23 · **Author:** Fable (design + conversion) · **For:** Jared Chapman, Web Design desk
**Page:** https://delphinium-marketing-staging.zohosites.com
**Captured:** 2026-09-23, desktop 1440×900 and phone 390×844, plus the served HTML and `/zs-customcss.css`. User crops (hero / mid / bottom) match this capture.
**Goal:** a Director of Online Learning or an HE Online lead clicks **Schedule a demo** → https://jared-delphi-me.zohobookings.com/4937208000000036014
**Claims ceiling:** `context/SOURCE.md`. Nothing below strengthens it.
**Ship surface:** Zoho Sites. Custom HTML, Custom CSS, Header/Footer Code, Code Snippet sections, native sections, a Bookings link. No scrollcraft.js, no pin, no scrub, no second host.

Pass 1 asked for a drag seam and then, correctly, got deferred until real course stills exist. v2 shipped the warm paper, the yellow word, the magenta button, and a Makeover Switch made of CSS. This pass does not polish that switch. The switch is the wrong peak.

---

## Verdict

v2 finally looks like the logo. Warm paper, yellow on "engagement", one magenta button, Davis set in display type, moon copy gone from the DOM. The first screen still does not show a course.

At 1440×900 the stage starts at y=800. The Zoho badge is `position: fixed` at y=840, height 60, `z-index: 1000000`. A buyer sees about 40 pixels of the product, and those pixels sit under the badge. On a 390×844 phone the stage starts at y=746 and the badge starts at y=784. Same sliver.

After the scroll, the peak is a drawing that apologizes in a black label ("Illustrated demo scenario"), answers "Which class would YOU rather take?" with teacher chips (On track, Needs a nudge, Behind), and contradicts its own caption. The caption says the left side is Canvas. The clip-path puts Delphinium on the left. Default `--reveal` is 72%, so the Canvas side is a gray sliver on the right. The auto-sweep never runs on load: the observer wants 35% of a 700px stage, and only ~100px is in the viewport.

Three controls do one job (a View segment, a drag layer, a caption that says "drag"). The stage sets `touch-action: none`, so a thumb on the course cannot scroll the page. The handle is vertically centered on that tall stage, which on a phone parks the white circle in the badge.

The Schedule button in the hero does clear a 900px-tall window (y 594–638). It will not clear a shorter laptop, because the headline, a four-line lead, and a proof line are stacked above it, under a 116px logo bar that is stuck 32px below the top. The 32px is `--draft-h`. There is no draft banner in the HTML.

What converts here is a first viewport that is already the course turned on, with one switch, and a button that sits clear of the badge on a laptop and a phone.

---

## 1. What still feels generic, and what fails persuasion

Evidence is from the capture above. v2 fixed the gray template. These are the problems that remain.

### 1.1 The product is below the argument

Measured document positions at 1440×900:

| Piece | y start | height |
|---|---:|---:|
| Nav (sticky `top: 32px`) | 32 | 116 |
| H1 | 263 | 132 |
| Lead | 414 | 115 |
| "Up to 31%" line | 546 | 24 |
| Hero Schedule button | 594 | 45 |
| "Which class would YOU rather take?" | 694 | 90 |
| Stage | 800 | 700 |
| Davis 31% | 2037 | 153 |

`.dl-section` padding is `clamp(3.5rem, 8vw, 7.5rem)`. At 1440px that is 115px before the H1 even starts. The logo PNG is 663×471, a stacked fan-over-word lockup, forced to 140px wide, so the bar is 116px tall. Add the phantom 32px. The first screen is a text column with a category eyebrow ("Canvas engagement layer"). That eyebrow is the small-caps label every SaaS template uses. The page's own thesis is that a gray wall of text is the problem.

Scroll height is 5732px on desktop and 5380px on the phone. The remembered picture, the course, begins at 800px.

### 1.2 The Switch answers the wrong question

The prompt is a student question: which class would you rather take? The On state is a teacher dashboard: status chips and completion bars. "Needs a nudge" and "Behind" are Control Tower words. A director who flips this does not see a course a student wants to open. They see an early-warning roster wearing a course title ("Introduction to Biology"). The category story (engagement) and the mechanism story (early warning) are collapsed into one fake screen, and the mechanism wins.

The drawing also impersonates Canvas chrome (left rail, module rows) and then flinches. `.dl-stage::after` prints "Illustrated demo scenario" in white on a black chip. The caption underneath says the drawing stands in "until a cleared course-home still ships." A buyer reads an unfinished prototype. A deliberate drawing can carry the peak. An apology cannot.

### 1.3 The comparison is backwards, and it does not play

`.dl-stage__after` is clipped with `inset(0 calc(100% - var(--reveal)) 0 0)`. At the shipped 72%, Delphinium occupies the left 72% and Canvas shows as a right-hand sliver. The visible caption says: "Left is a typical Canvas module list. Right is the same course with Delphinium turned on." The pixels say the opposite.

The range input covers the whole stage. The Before button sets 8% and After sets 92%, so the buttons are internally consistent with the clip and inconsistent with the sentence. On first paint `--reveal` stays 72%. The IntersectionObserver (`threshold: 0.35`) cannot fire, because the stage is barely on screen. The sweep v2 added for life on the page does not run when someone lands.

### 1.4 Mobile: the peak eats the scroll

Under 720px the stage becomes `aspect-ratio: 4/5` and `touch-action: none`. The phone stage is a tall, dead rectangle. Vertical drags on it do not scroll the page. The handle `::after` is centered on the stage, so the affordance sits where the badge already is. The Before/After pill is a second, small control ("VIEW") that looks like a segment from a component library. A director on a phone will not discover a 3px yellow line.

### 1.5 The second proof peak, and the unfinished how

`#highered` is its own band (y 4370, 489px tall) with an H2, three percentages (as much as 47 / 67 / 65), and another Schedule button. Those figures are SOURCE-legal for an HE Online audience. On this page they compete with the Davis 31% the K-12 buyer came to remember. SOURCE also says the homepage leads with the virtual K-12 story, and that Davis is supporting proof, not the face. A second outcome block with its own button makes the page argue twice.

The teacher band then shows `datathumb.png` and `commthumb.png` (both 838×299). They are marketing title cards: a play triangle baked into the pixels, and sentences burned into the image ("Real-time data that matters", "Communication that gets through"). The figcaptions say so, in public: "marketing still, not a full Control Tower capture" and "Stands in for Message Center until a cleared MC still is captured." Pass 1 killed this pattern. It is back, with softer wording. A play glyph that does not play trains the same distrust as the old hero thumbnail.

The family line under those figures is the right weight (one supporting paragraph, no parent percentage). It is stranded under two broken pictures.

### 1.6 The close, the logos, and the badge

The close band is the right sentence ("See it on a Canvas course, live with Jared.") on navy. The decoration is five diagonal CSS stripes at 35% opacity. Squint and it is a generic dark gradient, not the fan. The trust line "Canvas LTI 1.3 · FERPA · Chromebook-friendly" appears in the teacher band and again on the close. The risk-reversal line is good and should be said once.

The logo row is `opacity: 0.55` and `grayscale(0.35)` at a 28px cap, under the label "Programs on Canvas." They read as a footer that is unsure it is allowed to show them. The footer then places the full color wordmark (dark type in the PNG) on `--navy-deep`. The fan survives. The word fights the ground.

The badge cannot be removed from this staging plan. Custom CSS already tries, twice (the stylesheet is duplicated end to end), with `display: none` on a stack of selectors. The badge that wins has an empty class and `z-index: 1000000`. Further selector wars will lose. Every control and every button needs to live above that 60px strip. `body` already has 60px of padding at the document end. That protects the footer. It does not protect the first viewport.

### 1.7 Structure, only where it changes the pitch

The prototype is still injected in Header Code. In the served HTML the `<header class="dl-nav">` appears before `</head>`. The theme still loads Poppins and PT Sans. Outfit and Source Sans 3 are what the page actually uses. This is worth fixing after the peak, not before. Replatforming into native sections will not move the stage up the page. Cutting the hero padding will.

Claims check on the live copy: hero promise is "up to 31%"; the named Davis block is exact 31% with 72 classes, 6,000 students, and same courses, teachers, and content; HE uses "as much as"; Niederhauser and Dance are spelled correctly; no em dashes in the public copy. Keep that discipline.

---

## 2. Signature move: Turn it on

**One switch. The course is the hero. The word "engagement" is the lamp.**

Tell-a-friend line: "You tap Delphinium on, and the gray course becomes the one a student would actually open."

This replaces the seam, the range input, the Before/After segment, and the black "illustrated" chip. It is not a second version of the slider.

### 2.1 What the buyer sees

Desktop, from 960px up, one composition inside the first viewport (design to 1280×720 as well as 1440×900):

- Left column, about 28rem: the locked H1, two short sentences, the "up to 31%" line, the magenta **Schedule a demo** button, and a quiet text link "Watch the overview."
- Right column: the course poster, filling the column, with a 48px switch in its top edge: **Canvas** | **Delphinium on**. Default is **Delphinium on**.

Phone, 390px, top to bottom: H1, one sentence, full-width Schedule button, the "up to 31%" line, then the poster. The poster is capped so its switch and its first modules sit above the badge (`max-height` inside `100svh` minus the nav minus 72px). The poster does not capture scroll.

### 2.2 The two states (a drawing, labeled once)

Same four module names in both states, so "same course" is visible. This is a drawing. Say that once, in the caption, in human language. Do not print a production status.

**Canvas (off).** Gray ground, gray type, a short left rail, four rows:

- Module 1: Getting Started. Pages, assignments, due dates.
- Module 2: Cells and Structure. Readings, quiz.
- Module 3: Energy and Metabolism. Discussion, lab.
- Module 4: Genetics. Exam review.

No color. No chips. This is the wall.

**Delphinium on.** Same modules, student-facing, which is what the question asked:

- A progress row labeled "Your progress" (a bar, no invented streak count).
- An avatar mark labeled "Avatar points" (SOURCE: Tiffany Dance's students redo quizzes for avatar points). CSS circle, no face, no photo.
- Module 1 complete, green edge, bar full.
- Module 2 marked "Start here", the reason to come back tomorrow.
- Modules 3 and 4 present, in color, not as failure labels.

Do not put "Needs a nudge" or "Behind" on this poster. Those words belong to Control Tower, in the teacher paragraph, where they are true. The hero picture is the class. The teacher picture is a sentence.

When the switch is off, the yellow behind "engagement" turns off (`background: none`). When it is on, the yellow is on. The headline and the poster move together. That is the only motion.

### 2.3 Behavior

- CSS default is On, so a no-JS visitor still gets the sell.
- If motion is allowed, about 15 lines of JS: on first view, if the poster is in the viewport, set Off, then on the next frame set On, with a 700ms color and clip transition. Once. Then the switch is the visitor's.
- `prefers-reduced-motion: reduce`: stay On, no flip.
- Hit target is the switch, at least 48px. The poster itself scrolls normally. No `touch-action: none`. No full-stage invisible range.

When Jared sends real course-home stills, they replace the two drawings inside the same switch. The layout does not change. The peak does not wait on the stills.

### 2.4 Why this is a higher peak than the current Switch

The current Switch is a widget under a text hero, and the widget shows the wrong product. Turn it on puts the course in the first viewport, makes the gray-to-color thesis something a thumb can do, and keeps early warning in the section where Natalie and the forty seconds already carry it. A director can flip it on a laptop in a meeting without dragging a 3px line. The Schedule button sits in that same view, next to the course, which is the conversion.

---

## 3. Palette, type, rhythm

v2's tokens are the system. Do not invent a new palette. Change where the color is allowed to work.

### 3.1 Palette (keep)

| Role | Token | Hex | Where it goes now |
|---|---|---|---|
| Paper | `--paper` | `#fffdf6` | Page ground, hero, proof, teacher band |
| Butter | `--butter` | `#fbeab2` | Student band only |
| Ink | `--ink` | `#23232a` | Headlines, body |
| Ink soft | `--ink-soft` | `#5a5a66` | Secondary text |
| Canvas gray | `--canvas` | `#ededed` | The Off poster only |
| Navy | `--navy` | `#2b2f7e` | Close band, switch "on" side, poster chrome |
| Magenta | `--accent` | `#C7007A` | Schedule buttons only. Raw logo magenta stays inside the fan artwork |
| Yellow | `--mark` | `#F8F000` | The word "engagement", and only while the switch is on |
| Green, cyan | `#00A651`, `#00AEEF` | Inside the On poster, as progress and fan color. Not as text accents |

"Fun." is currently `--green`. Set it in `--ink`, same as 72%. Green goes back to meaning progress inside the poster.

Close decoration: delete the diagonal stripe stack. Paint five large circles in yellow, cyan, navy, magenta, and green, cropped by the top-right corner of the navy band, at full color. That is the fan, readable at a glance. Footer wordmark: crop the PNG to the fan (`object-fit: cover; object-position: top`) at about 48px, and set the word "Delphinium" in Outfit 600, white. Or sit the full PNG on a small paper chip. Do not lay dark wordmark pixels on navy.

Logo row: `filter: none; opacity: 1; height: 36px; width: auto; object-fit: contain`. Keep the "Programs on Canvas" label. Give each image an alt from the name already in the file (Baker Web Academy, Utah Virtual Academy, Kelsey Peak, Rocky Peak, Richfield). No results sentence under them.

### 3.2 Type

Keep Outfit for display and Source Sans 3 for text. Both are already linked. Theme Poppins and PT Sans can stay loaded until the Header Code split. They are unused by our classes.

- H1: `clamp(2.4rem, 4.6vw, 4.4rem)`, line-height 1.02, weight 300 on the Canvas line, 700 on the Delphinium line. Do not go larger than this in the split hero, or the left column wraps and the button drops.
- Poster switch: Outfit 600, 1rem.
- Body: 1.125rem / 1.55, measure 38rem on the hero lead (two sentences, not four lines).
- Davis figure: keep `clamp(4rem, 12vw, 7.5rem)`, tabular numerals.
- Kill the eyebrow. The H1 is the category line.
- `text-wrap: balance` on headings. No em dashes in any public string.

Nav image: `height: 56px; width: auto`. Header height 72px including padding. Sticky `top: 0`. Delete `--draft-h` until a real banner exists. If the stacked PNG makes the word illegible at 56px, ask Jared for a horizontal SVG. A short bar beats a readable-but-enormous one: the current bar costs 116px plus 32px of empty stick.

### 3.3 Rhythm

Five bands, not eight. Space comes from the poster and the 31%, not from cloned section padding.

1. **Hero (paper, padding-top 1.5rem).** Split on desktop. Poster + switch + button in the first view. One caption under the poster: the Makeover sentence (section 4). YouTube text link.
2. **Proof (paper).** The 31% and the Davis context. Under it, one quiet HE paragraph, no H2, no second button. Anchor `#highered` lands here so the nav link still works.
3. **Students (butter).** Netflix quote, 72%, Fun., the Makeover video facade (click to play, the one real play button on the page).
4. **Teachers (paper).** Heading, Control Tower and Message Center in prose, Natalie, one family sentence. A row of three dots (red, yellow, green) beside the heading. No fake screenshots.
5. **Close (navy) + logos (paper) + footer (navy).** Trust line once. Risk reversal once.

Hero padding is the main rhythm bug. The shared `.dl-section` clamp is fine on proof, students, teachers, and close. Override it on the hero.

Safe area: `padding-bottom: 72px` on `main` is not enough for the fixed badge. Each viewport must keep its last interactive control at least 72px above the viewport bottom. On the hero, that means the poster height is `min(100%, calc(100svh - 72px - 72px - 4rem))` beside the type, not a 700px 16:10 card.

---

## 4. Copy rewrites

SOURCE-safe. No em dashes. Promises say "up to 31%." Exact 31% appears only in the named Davis block, with the study context. HE figures stay "as much as," and they are not the hero.

### 4.1 Hero

**H1 (locked):**
Canvas delivers content.
Delphinium delivers engagement.

**Lead:**
A three-minute Makeover for the Canvas courses you already run. Students get a course they want to open. Teachers see who needs help. No migration.

**Button:** Schedule a demo
**Text link:** Watch the overview → https://www.youtube.com/watch?v=DuZRx9aN9tw

**Proof line:**
Up to 31% fewer course failures. Same courses, same teachers, same content.

**Switch labels:** Canvas · Delphinium on

**Poster caption (the only place the drawing is described):**
Which class would YOU rather take? Same modules, drawn off and on.

### 4.2 Makeover

This block sits under the poster, still in the hero, not as a new band with a second widget.

**H2:** Same course. Three minutes later.

**Body:**
Nothing about the course changed. Same modules, same assignments, same teacher. Delphinium adds visible progress, color that means something, and a reason to come back tomorrow. Teachers do not rebuild anything. They turn it on.

**Link:** See a Makeover start to finish → https://www.youtube.com/watch?v=HuYuD8UQoiM

### 4.3 Close

**H2:** See it on a Canvas course, live with Jared.

**Body:**
Meet the person behind Delphinium and see how it could work in your Canvas courses.

**Button:** Schedule a demo → https://jared-delphi-me.zohobookings.com/4937208000000036014

**Under the button:**
No migration to plan. Nothing to install before the call. You stay in Canvas.

**Trust line (once, here):**
Canvas LTI 1.3 · FERPA · Chromebook-friendly

### 4.4 Supporting lines the implementer should paste, so nothing gets invented

**Davis (exact 31%, named, with context):**
31%
fewer course failures at Davis Connect, Davis School District (Utah). 72 fully online classes. 6,000 students. The year before Delphinium against the year with it. Same courses, same teachers, same content.

**HE, quiet, under Davis, no button:**
Higher Ed Online: as much as 47% lower course failure, 67% lower withdrawal, and 65% lower deep disengagement (students finishing with less than about a third of points). Ask on the demo for study context that matches your campus.

**Students:** keep the Netflix survey sentence as a quote, the 72% motivating line, the word Fun., and the Tiffany Dance paraphrase (game changer, avatar points, googly eyes). Do not add quotation marks around Tiffany. She is paraphrased in SOURCE, not delivered as a clean quote block.

**Teachers:**
Early warning for teachers. About forty seconds to act on it.
Control Tower shows every student as red, yellow, or green from your Canvas data. Message Center sends one message to every struggling student, and to their families if you choose, in about forty seconds. Templates, multiple channels, no spreadsheet.
Natalie Niederhauser teaches high school math to more than 100 students at Davis Connect. She went from about 12 emails a day to about 6 messages a week. "Saved most of my Saturday nights."

**Family (one sentence, supporting):**
Families stay in the loop. When a parent finds out late, the grade has already taken a hit. Observers get the same color-coded picture teachers see, and Community Builder helps a school celebrate wins with parents.

Drop "with translate support for many languages" unless the page is ready to say the SOURCE number (160) in a Community Builder context. The shorter line is enough on this page.

**Do not publish:** "illustrated scenario until a cleared still ships," "marketing still," "stands in for," "not a full Control Tower capture," any parent percentage, "UC Davis," dollar amounts, "gone quiet," "changes what the student does."

---

## 5. Zoho Sites buildability map

The whole move fits the current paste path (one snippet + Custom CSS). Native sections are a later cleanup. None of this needs scrollcraft.js.

| # | Move | Where it lives | JS |
|---|---|---|---|
| 5.1 | Tokens, type scale, hero split, 72px nav, badge safe area | **Custom CSS.** Delete the duplicated second copy of the stylesheet while pasting | 0 |
| 5.2 | Fonts already linked (Outfit, Source Sans 3) | **Header Code** `<link>`, already present | 0 |
| 5.3 | H1 highlighter tied to the switch | **Custom CSS** `.dl-hero:has(#dl-on:checked) .hl` or the reverse (default On). `:has()` is the whole behavior | 0 |
| 5.4 | Turn it on poster | **Code Snippet** (or the existing header snippet): a checkbox + label as the switch, two divs (off / on), CSS grid poster. Off pane hidden with CSS when `:checked` | 0 for the control |
| 5.5 | One-time off-to-on flip | Same snippet, **about 15 lines** at the bottom of the existing script: if `prefers-reduced-motion` is false and the poster intersects, uncheck, `requestAnimationFrame`, check. Remove the range, the Before/After listeners, and the IntersectionObserver on `#makeover-stage` | ~15, replacing ~40 |
| 5.6 | Video facade | Keep the current click-to-iframe on `#makeover-video` | ~15, already written |
| 5.7 | Davis figure, quiet HE line, teacher prose, three dots | HTML in the snippet. Dots are three spans, colored in CSS | 0 |
| 5.8 | Close petals | **Custom CSS** on `.dl-close::before` using radial circles, not linear stripes | 0 |
| 5.9 | Logo row and footer fan crop | **Custom CSS** plus `alt` text in the snippet | 0 |
| 5.10 | Sticky nav | Already a positioned header. Set `top: 0`. Do not add a fixed bottom bar. The badge owns the bottom edge | 0 |
| 5.11 | Bookings | Keep the anchor to https://jared-delphi-me.zohobookings.com/4937208000000036014. Do not iframe the share URL (pass 1 measured `X-Frame-Options: SAMEORIGIN`). An inline calendar is a later verify against the official Bookings embed, not this peak | 0 |
| 5.12 | Badge | Do not hide it. Design above it. Staging plan injects an empty-class fixed div at z-index 1000000 | 0 |

**Total new JS:** about 15 lines, swapped for the seam script. The video facade stays. No libraries.

**Native, when someone has editor time (not this peak):** section backgrounds for paper, butter, and navy; the nav as a real header element; the button as a native button. Until then the snippet is the page, which is how v2 shipped.

**Sketch for the switch (Code Snippet, poster column):**

```html
<div class="dl-ignition">
  <input type="checkbox" id="dl-on" checked>
  <div class="dl-ignition__switch" role="group" aria-label="Course with Delphinium off or on">
    <label for="dl-on" class="is-off">Canvas</label>
    <label for="dl-on" class="is-on">Delphinium on</label>
  </div>
  <div class="dl-ignition__off" aria-hidden="true"><!-- four gray modules, same names --></div>
  <div class="dl-ignition__on"><!-- progress, avatar points, start here --></div>
</div>
<p class="dl-ignition__cap">Which class would YOU rather take? Same modules, drawn off and on.</p>
```

```css
.dl-ignition { position: relative; }
.dl-ignition__off, .dl-ignition__on { transition: opacity 700ms ease; }
#dl-on { position: absolute; opacity: 0; }
#dl-on:checked ~ .dl-ignition__off { opacity: 0; pointer-events: none; }
#dl-on:not(:checked) ~ .dl-ignition__on { opacity: 0; pointer-events: none; }
#dl-on:not(:checked) ~ .dl-ignition__switch .is-off,
#dl-on:checked ~ .dl-ignition__switch .is-on { background: var(--navy); color: #fff; }
.dl-hero:has(#dl-on:not(:checked)) .hl { background: none; }
@media (prefers-reduced-motion: reduce) {
  .dl-ignition__off, .dl-ignition__on { transition: none; }
}
```

Both labels point at the same checkbox. Style the pressed side from `:checked`. Give the input an accessible name ("Delphinium on") via `aria-label` on the checkbox itself if the two labels get noisy for screen readers. Keyboard: the checkbox is a real control, so Space toggles it.

---

## 6. Ranked craft checklist for Cursor

Do them in this order. 1 through 4 are the conversion pass. The rest are the same PR if they fit, and the next PR if they do not.

1. **First viewport.** Desktop split from 960px. Hero padding-top 1.5rem. Nav image height 56px, bar 72px, `top: 0`. Delete the draft offset. Poster and Schedule button both clear the badge at 1280×720 and at 390×844. Phone order: H1, one sentence, full-width button, proof line, poster.
2. **Replace the Switch.** Remove `#makeover-stage`, the range input, `#btn-before`, `#btn-after`, `.dl-stage::after` ("Illustrated demo scenario"), `touch-action: none`, and the seam script. Build the checkbox poster in section 5. Default On. One-time flip only if reduced motion is off. Student On state uses "Your progress", "Avatar points", and "Start here." No "Behind." No "Needs a nudge."
3. **Caption truth.** One line, section 4. Delete "until a cleared course-home still ships" and the left/right sentence. The left/right sentence is false at the current clip.
4. **Delete the two how figures** (`datathumb.png`, `commthumb.png`) and both figcaptions. Teacher band becomes the prose in section 4 plus three color dots. Family stays one short paragraph.
5. **Collapse `#highered`.** Keep the anchor. One quiet paragraph under Davis, the words in section 4. Remove that band's H2, eyebrow, and extra Schedule button.
6. **Say it once.** Trust line and risk-reversal line live only on the close. Paste the hero, Makeover, and close copy from section 4 exactly, including "up to 31%" in the hero and exact 31% only in the Davis block.
7. **Logos and close fan.** Color logo row at 36px, real alts. Five circles on the close. Fan crop or paper chip in the footer. No grayscale, no 0.55 opacity.
8. **CSS hygiene.** Paste `/zs-customcss.css` once. Stop adding badge-hide rules. Confirm in the preview URL, not the editor, that the hero button and the switch sit above y = viewport minus 72px.
9. **Later, not this peak.** Split the Header Code blob into Code Snippet sections so the editor can see the page. Drop Poppins and PT Sans when the theme fonts can be set to Outfit and Source Sans 3. Swap the drawing for real course stills when Jared sends them, same switch, same layout.

**Do not undo:** warm paper, butter student band, magenta-only buttons, yellow on "engagement", Outfit / Source Sans 3, the locked H1, the Bookings URL, the Netflix quote, 72% and Fun., Natalie Niederhauser, Tiffany Dance, the Davis context on the exact 31%, "up to 31%" on the promise, no parent percentage, no em dashes.

**Do not do:** a drag seam, a bottom sticky bar, an iframe of the Bookings share URL, a second CSS product mock for Control Tower, HubSpot edits, DNS, production Zoho, invented stats, or scrollcraft.js.

# Fable pass 3: Open on

**Date:** 2026-09-23, finished against live staging 2026-09-24 · **Author:** Fable (design + conversion) · **For:** Jared Chapman, Web Design desk
**Reviewed:** https://delphinium-marketing-staging.zohosites.com, captured in Chrome at 1440×900, 1280×720, and 390×844, at rest and after the click. The served page is the v3 fan-cut. No drag line. No moon line. **Turn it on**, **Avatar points**, and **Schedule a demo** (Bookings URL, four anchors) are in the first screen.
**File checked against the capture:** `zoho-sites/homepage-sites-v3.html`. The snippet matches. The live page adds Zoho section padding and the fixed "This site was created using" badge. Those two change where the caption sits.
**Goal:** a Director of Online Learning clicks **Schedule a demo** → https://jared-delphi-me.zohobookings.com/4937208000000036014
**Claims ceiling:** `context/SOURCE.md`. Nothing below strengthens it.
**Ship surface:** Zoho Sites. Custom HTML, Custom CSS, Header Code, one Code Snippet. No scrollcraft.js, no pin, no scrub, no second host.

Pass 2 asked for the course in the first viewport, with one switch, default on. Synthesis v3 locked the resting picture as a half/half fan-cut and shipped that. The fan-cut got the course onto the first screen. It still asks the buyer to finish the sell.

---

## Verdict

v3 is the first draft where a course shares the first screen with the headline and the magenta button. The draft bar is real, the nav sits at `top: 0`, teacher chips are gone, the how-stills are gone, Davis is exact 31% with the study context, and the promise line stays "up to." Keep all of that.

The peak still loses the click. At rest the page is a comparison, so the course is the right-hand half of a diagram, inset about 50px from the viewport by Zoho's section. The navy pill that says **Turn it on** sits on the logo blades, in the same view as **Schedule a demo**. On a 1280×720 laptop the diagram is 225px tall, the on-side type drops to 16.8px, and the pill shares its row with "Start here." On the phone, the click leaves the gray list at full size (360×134) and changes the label to **Show the Canvas list**. On every viewport the badge covers **See a Makeover start to finish**. At 1440×900 that link is y=869, and the element under the cursor is the badge.

What converts is a first viewport whose course is already on, at a size you can read, with Schedule as the only pill.

---

## 1. What still feels generic, and what fails persuasion

### 1.1 The headline was shrunk to make room for a widget

The hero is locked to `100dvh - 26px - 52px - 72px`. That formula assumes the draft bar starts at y=0. On staging it does not. `.zpsection` has `padding: 50px 0`, and the draft bar starts at y=70. The hero is then 750px tall and ends at y=898, two pixels above the bottom of a 900px window. The 72px of clearance the formula tried to save is used up by the padding above the draft.

Inside the hero, desktop, the copy block is about 230px and the caption block is 118px. Whatever is left is the fan-cut. These are live measurements.

| Viewport | Draft y | Fan-cut | H1 | On-side type | Badge | Caption vs badge |
|---|---:|---:|---:|---:|---:|---|
| 1440×900 | 70 | 399×1325, split 663/663 | 37.6px | 28px | y=840, h=60 | Link y=869, under the badge |
| 1280×720 | 70 | 225×1165 | 34.6px | 16.8px | y=660, h=60 | Note runs to y=718, badge starts at 660 |
| 390×844 | 70 | 343×360, stacked | 22.7px | 16px | y=784, h=60 | Note runs to y=842, badge starts at 784 |

The 16.8px collapse is a container query: `@container (max-height: 280px)` hides "Introduction to Biology" and sets module names to 1.05rem. The pane clears 280px on the 1440×900 capture and misses it at 1280×720. A director on that laptop gets both lists at 16.8px, plus a pill. All four names are still inside the cut. The failure at 720 is size and the pill on the Start here row (pill y=463 to 511, that row y=472), plus the caption under the badge.

Pass 2 set the H1 at `clamp(2.4rem, 4.6vw, 4.4rem)`. v3 capped it at 2.35rem so the diagram would fit. The eyebrow "Canvas engagement layer" is back on desktop (10.9px, tracked uppercase). The page's own thesis is that a gray wall of small text is the problem. The first screen opens with one.

### 1.2 Turn it on is the second button, and it sits on the product

**Schedule a demo** is in the nav and again under the headline. On the live 1440×900 capture the hero button is y=311 to 355, clear of the badge. **Turn it on** is a second pill: navy outline, 48px tall, `position: absolute` at the center of the blades (y=557 to 605).

The "Start here" row is y=549. They share a horizontal band. The blades are the most saturated object on the screen, and the pill is parked on them. The blades also hang out of the cut (`top: -14%`, `bottom: -14%`): on this capture they run from y=326 to y=835, across the proof line and across "Which class would YOU rather take?" (y=786). The eye lands on the toy. The booking button is a magenta lozenge in the text column above.

After the click, wide layout, `.dl-cut.is-on` collapses the gray half to `max-width: 0` and moves the pill to `left: 0.85rem`. The on-pane's left padding becomes 13.5rem (216px) to clear the pill and the blades. The course text starts after a blank cream field. The label becomes **Show the Canvas list**, which is the undo. The buyer who did the thing the page asked for is then invited to reverse it.

The yellow slab on "engagement" does not move with the switch. It is painted on every state. The headline and the course are not the same gesture.

### 1.3 The on state is a colored list

Same four module names on both sides. The on side adds an 8×144px bar, a chip, and the words "Start here." The bar is four equal logo colors (yellow, cyan, green, magenta). It restates the fan. It does not read as progress: nothing in it is full, nothing in it is remaining.

**Avatar points** is a 0.68rem chip (11px) on Getting Started, whose meta line is "Pages · Assignments · Due dates." Tiffany Dance's students redo quizzes for avatar points. The quiz is the next row, "Cells and Structure / Readings · Quiz," and that row only says "Start here." The chip is on the wrong module, and it is too small to read as a reward.

Green, cyan, yellow, and magenta each appear in the blades, the bar, and the module ticks. None of them means "done." A buyer who has seen a SaaS feature comparison sees another one: gray column, color column, a toggle in the middle.

### 1.4 The caption is true only at rest, on a wide screen

Under the cut:

> Illustrated. Left is a typical Canvas module list. Right is the same course with Delphinium on.

"Illustrated." is the apology pass 2 removed, shortened. The left/right sentence matches the resting wide layout (gray at x=50, course at x=713 on the live 1440 screen). After the click, the left side is blades and a button. Under 800px the layout stacks, so there is no left and no right. The sentence is in the DOM for every state.

### 1.5 The phone does not turn on

Under 800px the band stacks: gray list, a 14px horizontal five-color rule, the pill, the color list. The rule reads as a divider. The logo fan is a set of vertical blades. A horizontal stripe between two lists is a template seam.

The collapse to `max-width: 0` lives inside `@media (min-width: 800px)`. The only on-state rule that applies on a phone is `.dl-cut.is-on .dl-cut__off { opacity: 0.45 }`. After the tap on the live 390×844 page, the gray list is still 360×134, the label is **Show the Canvas list**, and the color course is the list that was already underneath. The verb and the picture disagree.

Phone type on the live 390×844 capture: H1 is 1.42rem (22.7px, the row is 71px tall because it wraps), lead is 0.92rem, module meta is `display: none`. The first viewport spends a full-width Schedule button (y=292, clear of the badge), a wrapped "Watch the overview" line, the proof line, both lists, and the caption. The gray list is 134px. The color list is 134px. Genetics on the color side is y=710, above the badge at y=784. The caption is the piece that falls under the badge.

The band does scroll. `touch-action: none` is gone. That part of pass 2 landed.

### 1.6 The live page is inset, and the badge owns the caption link

The theme header is `display: none` (the "Delphinium | Canvas engagement layer" site name does not paint). The badge is not hidden, which is the right call. It is an empty-class `div`, `position: fixed`, `z-index: 1000000`, 60px tall, text "This site was created using". It sits at the bottom of every viewport above.

What the hero formula missed:

- `.zpsection` padding-top is 50px. The draft bar, which the formula treats as the top of the page, starts at y=70.
- `.zpcontainer` adds side padding, and the column adds more. At 1440 the fan-cut is 1325px wide and starts at x=50. At 390 it is 360px wide and starts at x=15. The fan is a boxed diagram, not a full-bleed blade.
- Hero bottom on a 900px window is y=898. The badge starts at y=840. "Which class would YOU rather take?" (y=786) clears it. **See a Makeover start to finish** (y=869) does not. `elementFromPoint` on that link returns the badge, so the link is visible in the DOM and not clickable.

Schedule in the nav and in the hero clears the badge at all three sizes. The control that does not is the one under the diagram. Zero the section padding in Custom CSS. That is page padding, not a badge-hide rule. Then re-check the link on the staging URL. A 72px pad inside a hero that has already been pushed down by 70px does not clear the badge.

### 1.7 What v3 got right, so this pass does not reopen it

Claims on the v3 copy stay inside SOURCE. The hero promise is "up to a 31%." Exact 31% appears in the Davis block with Davis School District, 72 classes, 6,000 students, and same courses, content, and teachers. Higher Ed stays "as much as" 47 / 67 / 65, after the close, with a text link. Niederhauser and Dance are spelled correctly. The family line is one paragraph, with Community Builder and 160 languages, which the synthesis already allows. No parent percentage. No em dashes in the public strings.

The later bands can stay: butter quote, 72% and Fun. in Fraunces, Tiffany in one sentence, the Makeover facade, Control Tower and Message Center in prose, Natalie, the close with one magenta button and the trust line once. Logos are `grayscale(0.9)` at 0.78 opacity. Leave them for a later pass. They are not why the first screen fails.

---

## 2. Signature move: Open on

**The course is already on. The gray list is a text control. Schedule is the only pill.**

Tell-a-friend line: "You land on the color course. The gray Canvas list is a text link in the card's top bar. The button that books is the magenta one."

This keeps one course, the same four module names, and the words "Turn it on." It drops the resting half/half, the traveling pill, and the horizontal rule.

### 2.1 What the buyer sees

Desktop and phone use the same stack. The hero is as tall as its content. It is not locked to `100dvh`. Before that height is computed, Custom CSS sets `.zpsection` padding to 0 and the column side padding to 0, so the draft bar starts at y=0 and the course can run edge to edge. Badge clearance is `padding-bottom: 72px` on the hero, so the last control clears a 60px credit. If that makes a 720px laptop scroll, it scrolls. A clipped module is a worse trade. Confirm on the staging URL, with `elementFromPoint`, that the last link in the hero is not the badge.

1. H1 at display size. No eyebrow.
2. The lead from section 4, then the magenta **Schedule a demo**, with "Watch the overview" as a text link.
3. One proof line: "Up to 31% fewer course failures."
4. One course card, full width, default **on**. A vertical fan spine on the card's left edge (five logo colors, about 22px wide, skewed on wide screens, straight on a phone). Module names at least 16px, all four visible, none under a pill.
5. A text control in the card's top bar, on the right: **See the Canvas list**. Hit target at least 44px. It is not a filled button and not a navy pill.

The caption under the card is one line and does not say left or right. It can sit past the first screen on a short laptop. The course cannot.

### 2.2 The two faces of one card

Same card, same height, two faces stacked in one grid cell. Switching hides one face. The card does not change width, and the spine does not travel.

**On (default, including no JS).** Student course:

- Title: Introduction to Biology.
- "Your progress" as a label. Getting Started has a green stripe and a full green bar on that row only. No percentage.
- Cells and Structure has a cyan stripe, the words "Start here," and a 16px **Avatar points** chip. This is the quiz row.
- Energy and Metabolism, and Genetics, use a quiet ink stripe. No status words.
- The yellow slab on "engagement" in the H1 is on.

**Canvas list (after the text control).** Same four names, gray ground, gray type, no stripes, no bar, no chip. The spine desaturates. The yellow slab turns off. The control's label becomes **Turn it on**.

Green means the finished module. Cyan means the row to open. Yellow means the word "engagement." Magenta means Schedule. The five logo colors live in the spine only. They stop doing a second job as the progress bar.

### 2.3 Behavior

- The control is a checkbox, checked in the HTML. `:checked` shows the on face. `:has()` turns the yellow slab off when the box is unchecked. No script for the peak.
- Both labels are in the DOM. CSS shows one. Keyboard: the checkbox is a real control.
- `prefers-reduced-motion: reduce` skips the opacity fade. The faces still swap.
- The card does not use `overflow: hidden` on the module list. `touch-action` stays at the default. No range input. No centered pill. No `max-width: 0` animation.
- When Jared sends a real course-home still, it replaces the on face inside this card. The layout stays.

### 2.4 Why this is a higher peak than the fan-cut

The fan-cut's resting state is the weaker picture, and its reveal is a resize. On a phone the reveal is a fade that leaves the gray list up. Open on puts the student course at full width before anyone clicks, keeps "Turn it on" as the way back to the gray list, and leaves the magenta button as the only pill in the view. The director who never touches the toy still sees the class.

---

## 3. Palette, type, rhythm

v3's tokens stay. Color gets a job each.

### 3.1 Palette (keep the hexes)

| Role | Token | Hex | Where it goes |
|---|---|---|---|
| Paper | `--paper` | `#fffdf6` | Page, hero, on-face ground |
| Butter | `--butter` | `#fbeab2` | Student band only |
| Ink | `--ink` | `#23232a` | Headlines, module names, Fun. |
| Ink soft | `--ink-soft` | `#5a5a66` | Lead, meta, quiet stripes |
| Canvas gray | `--canvas` | `#d5d8df` | The Canvas-list face only |
| Navy | `--navy` | `#2b2f7e` | Text control, "Start here," close band |
| Magenta | `--accent` | `#C7007A` | Schedule buttons only |
| Yellow | `--mark` | `#F8F000` | The word "engagement," and only while the course is on |
| Green | `#00A651` | The finished module and its bar |
| Cyan | `#00AEEF` | The Start here stripe |
| Fan set | yellow, green, cyan, navy, `#EC008C` | The spine only |

The text control is navy type, underlined, transparent background. A navy pill next to a magenta pill is the v3 failure. Fraunces stays on the Netflix quote and on Fun. It stays out of the hero.

### 3.2 Type

Outfit for display, Source Sans 3 for text. Both are already linked.

- H1: `clamp(2.15rem, 4.2vw, 3.5rem)`, line-height 1.02, weight 300 on the Canvas line, 700 on the Delphinium line. 3.5rem is the cap so a phone still has two lines and a 1440 screen still has a headline. The v3 cap of 2.35rem is what made the H1 a caption.
- Lead: 1.125rem / 1.45, measure 38rem, two sentences.
- Module names: `clamp(1.05rem, 1.6vw, 1.5rem)`, and never under 16px. The 11px chip is gone. Avatar points is 1rem, weight 700.
- "Your progress" and "Start here": 1rem, Outfit 700.
- Text control: 1rem, Outfit 600.
- Davis figure: keep `clamp(4rem, 12vw, 7.5rem)`.
- Delete the eyebrow. `text-wrap: balance` on headings.

Nav stays short: logo 40px, bar 52px, sticky `top: 0`. The draft bar stays in flow at 26px. Do not bring back the 116px lockup.

### 3.3 Rhythm

The bands below the hero stay in the v3 order. The hero stops pretending to be exactly one viewport.

1. **Hero (paper).** H1, lead, Schedule, proof line, the on course, one caption line. Padding-bottom 72px. No fixed height. Zoho section padding at 0, so this pad is actually below the content. The caption link has to clear the badge on the staging URL.
2. **Proof.** Unchanged Davis block.
3. **Students (butter).** Unchanged.
4. **Teachers.** Unchanged prose, dots, family paragraph, two YouTube links.
5. **Close, quiet Higher Ed, logos, footer.** Unchanged this pass.

Space in the hero comes from deleting the eyebrow, the left/right caption, and the second list. It does not come from a smaller H1.

---

## 4. Copy rewrites

SOURCE-safe. No em dashes. Promises say "up to 31%." Exact 31% stays in the Davis block only, with the study context already on the page. Paste these strings over the hero. Leave the Davis, student, teacher, family, and close copy as v3 has them.

### 4.1 Hero

**H1 (locked):**
Canvas delivers content.
Delphinium delivers engagement.

**Lead:**
A three-minute Makeover for the Canvas courses you already run. Students get a course they want to open. No migration.

**Button:** Schedule a demo
**Text link:** Watch the overview → https://www.youtube.com/watch?v=DuZRx9aN9tw

**Proof line:**
Up to 31% fewer course failures.

**Card title:** Introduction to Biology

**On face:**
Your progress
Getting Started
Cells and Structure · Start here · Avatar points
Energy and Metabolism
Genetics

**Control, course on:** See the Canvas list
**Control, course off:** Turn it on

**Caption (one line, true in both states):**
Which class would YOU rather take? Same modules. Same assignments. About three minutes.

### 4.2 Delete these strings

- "Canvas engagement layer" (the eyebrow).
- "Illustrated. Left is a typical Canvas module list. Right is the same course with Delphinium on. Same modules. Same assignments. About three minutes. No migration."
- "Show the Canvas list" (the undo label).
- "Up to a 31% reduction in course failure rates." Replace with the proof line above. The shorter line is the same promise, and it gives the course the row the longer line was using.

### 4.3 Do not publish

Any parent percentage, "UC Davis," dollar amounts, "gone quiet," "changes what the student does," "illustrated scenario," "marketing still," "stands in for," a day streak, or a roster word (Behind, Needs a nudge, On track) on this card.

---

## 5. Zoho Sites buildability map

One snippet and Custom CSS, same paste path as v3. The peak adds no script. The Makeover facade script stays.

| # | Move | Where it lives | JS |
|---|---|---|---|
| 5.1 | Delete the fixed hero height. Padding-bottom 72px. `.zpsection { padding: 0 }`. `.zpcontainer, .zpelem-col { padding-left: 0; padding-right: 0 }` | **Custom CSS** | 0 |
| 5.2 | H1 scale, no eyebrow, lead measure | **Custom CSS** plus deleting the eyebrow node | 0 |
| 5.3 | One card, two faces in one grid cell, spine absolute at the left | **Code Snippet** HTML, **Custom CSS** | 0 |
| 5.4 | Checkbox default `checked`. Yellow slab via `.dl-hero:has(#dl-on:not(:checked)) .hl` | **Custom CSS** | 0 |
| 5.5 | Label swap (`See the Canvas list` / `Turn it on`) | **Custom CSS** on spans inside the label | 0 |
| 5.6 | Phone and desktop share the swap. Delete the 45% opacity fallback and the `max-width: 0` collapse | **Custom CSS** | 0 |
| 5.7 | Video facade | Keep the existing click-to-iframe | ~15, already written |
| 5.8 | Bookings | Every Schedule anchor stays https://jared-delphi-me.zohobookings.com/4937208000000036014 | 0 |
| 5.9 | Badge | Do not hide it. After 5.1, hit-test the hero's last link on the staging URL. It must not return the empty-class fixed div | 0 |

**JS removed:** the `is-on` class toggle and the label rewrite. The checkbox does that work.

**Sketch (body snippet, card only):**

```html
<div class="dl-open" id="course">
  <input type="checkbox" id="dl-on" checked aria-label="Delphinium on">
  <div class="dl-spine" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
  <div class="dl-open__bar">
    <p class="dl-open__title">Introduction to Biology</p>
    <label for="dl-on" class="dl-see">
      <span class="when-on">See the Canvas list</span>
      <span class="when-off">Turn it on</span>
    </label>
  </div>
  <div class="dl-faces">
    <div class="dl-face dl-face--on"><!-- progress, green done row, quiz row with Start here and Avatar points --></div>
    <div class="dl-face dl-face--off"><!-- four gray names, same order --></div>
  </div>
</div>
<p class="dl-open__cap">Which class would YOU rather take? Same modules. Same assignments. About three minutes.</p>
```

```css
.dl-open { position: relative; display: grid; grid-template-rows: auto 1fr; padding-left: 2rem; }
.dl-spine { position: absolute; top: 0; bottom: 0; left: 0; width: 22px; display: flex; gap: 2px; }
.dl-spine i { flex: 1; }
.dl-faces { display: grid; }
.dl-face--on, .dl-face--off { grid-area: 1 / 1; }
#dl-on {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
#dl-on:checked ~ .dl-faces .dl-face--off { visibility: hidden; }
#dl-on:not(:checked) ~ .dl-faces .dl-face--on { visibility: hidden; }
#dl-on:checked ~ .dl-open__bar .when-off,
#dl-on:not(:checked) ~ .dl-open__bar .when-on { display: none; }
#dl-on:not(:checked) ~ .dl-spine { filter: grayscale(1); opacity: 0.4; }
#dl-on:focus-visible ~ .dl-open__bar .dl-see { outline: 2px solid var(--navy); outline-offset: 3px; }
.dl-hero:has(#dl-on:not(:checked)) .hl { background: none; }
.dl-see { font-family: var(--font-display); font-weight: 600; font-size: 1rem; color: var(--navy); cursor: pointer; min-height: 44px; display: inline-flex; align-items: center; }
@media (prefers-reduced-motion: reduce) {
  .dl-face--on, .dl-face--off, .dl-spine { transition: none; }
}
```

The bar, the faces, and the spine have to follow the checkbox in the DOM so `~` can see them. `visibility: hidden` takes the idle face out of the accessibility tree, so the sketch does not set a permanent `aria-hidden`. Wide screens can skew the spine (`transform: skewX(-12deg)` on each stripe). Under 800px, leave the stripes straight so they still read as the logo edge.

---

## 6. Ranked craft checklist for Cursor

Do them in this order. 1 through 6 are the conversion pass. 7 is the same PR if it fits. Check 1 through 6 on https://delphinium-marketing-staging.zohosites.com, not only in the raw HTML file.

1. **Zero the Zoho inset, then check the badge on the staging URL.** `.zpsection` padding to 0. Column and container side padding to 0. Do not add a badge-hide rule. After the paste, at 1440×900 and 390×844, `elementFromPoint` on Schedule, on the course control, and on the Makeover link must return those controls. Today the Makeover link returns the badge.
2. **Default the course to on.** Replace `#turn-on` with the one-card sketch in section 5. Checkbox checked in HTML. Delete the half/half flex, the centered `.dl-turn` pill, the horizontal blade, and the `is-on` script. Phone and desktop use the same swap.
3. **Stop clipping the course.** Remove the fixed `height` on `.dl-hero`. Keep `padding-bottom: 72px`. All four module names visible at 1280×720 and at 390×844, at 16px or larger. The text control is in the card's top bar, clear of the names.
4. **Make color mean something.** Green on Getting Started only. Cyan and a 16px Avatar points chip on Cells and Structure. Ink stripes on the last two modules. Fan colors only in the spine. Delete the four-color 8px bar.
5. **Restore the headline.** H1 clamp from section 3. Delete the eyebrow. Lead and proof line from section 4. Yellow slab follows the checkbox.
6. **Caption truth.** One line from section 4. Delete the left/right sentence and the word "Illustrated."
7. **Later, not this peak.** Full-color logo row. Real course stills in the on face when Jared sends them. Splitting the snippet into native sections. Dropping Poppins and PT Sans when the theme fonts can be Outfit and Source Sans 3.

**Do not undo:** warm paper, the short nav, the in-flow draft bar, butter student band, magenta-only Schedule buttons, yellow on "engagement," Outfit / Source Sans 3, Fraunces on the quote and on Fun., the locked H1, the Bookings URL, the Netflix line, 72% and Fun., Tiffany Dance, Natalie Niederhauser, the Davis context on the exact 31%, "up to 31%" on the promise, Higher Ed after the close, family as one paragraph, no teacher chips, no how-stills, no parent percentage, no em dashes.

**Do not do:** a drag seam, a resting half/half, a pill inside the course, a bottom sticky bar, an iframe of the Bookings share URL, a second product mock for Control Tower, badge-hide CSS, HubSpot edits, DNS, production Zoho, invented stats, or scrollcraft.js.

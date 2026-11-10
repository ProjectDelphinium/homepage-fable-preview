# MUSE PASS 3: Delphinium homepage (anti-anchor)

**Date:** 2026-09-23 · **Author:** Muse Spark · **Status:** DRAFT direction, not a Zoho publish
**Looked at:** `zoho-sites/homepage-sites-v3.html` on PR 10 (`cursor/sites-v3-fan-cut-12ae`), the four Sites v3 craft shots (desktop and phone, at rest and after the click), and the live staging HTML at `https://delphinium-marketing-staging.zohosites.com` fetched the same day
**Primary CTA:** Schedule a demo → `https://jared-delphi-me.zohobookings.com/4937208000000036014`
**Claims ceiling:** `context/SOURCE.md`
**Constraint:** Zoho Sites custom HTML/CSS/JS only. No scrollcraft.js, no pin-scrub, no freestanding app. HubSpot, DNS, and production Zoho stay untouched.

Pass 2 asked for a fan-cut and a Turn it on control. Both shipped. This pass does not restyle that control. The first screen now contains a course, and the course still does not make a Canvas director want the call.

---

## 1. Brutal critique

The page is doing the job pass 2 set: half gray, half color, logo blade, navy button, magenta reserved for Schedule, student rows instead of a teacher roster. A director who does not scroll can see modules. What they see is two copies of the same list, and a button that deletes one of them.

### The picture is a syllabus with ticks

The locked promise on this band is a class you would rather take. The right pane is the left pane plus an 8px stripe, a 9rem by 8px bar labelled "Your progress," a 0.68rem chip reading "Avatar points," and a 0.72rem "Start here." Module names on the color side cap at `clamp(1rem, 2vw, 1.75rem)`. The gray side stays at `1rem`. Four names, four names. The color is garnish on a list.

"Your progress" is four equal segments in logo order. It does not show progress. It shows the palette a second time. A director who lives in Canvas will read it as decoration. Avatar points are real (Tiffany Dance). A legend painted as a meter is not.

Both panes also spend their first line repeating the H1: "Canvas delivers content." and "Delphinium delivers engagement." with a second yellow slab. The course title under that, "Introduction to Biology," is `0.75rem`. A container query hides it whenever the pane is under 280px tall. The headline already said the category. The pane should have used that line for the class.

### Turn it on erases the comparison

Rest is the only state where both courses exist. The click adds `is-on`. On a wide screen the gray half goes to `max-width: 0` and `opacity: 0`. The blade moves to `left: 0.6rem`. The button follows and its label becomes "Show the Canvas list." The color pane then takes `padding-left: 13.5rem` so the type clears the button.

The turned-on desktop shot is that rule made visible: a scrap of fan at the left edge, the undo label sitting in a white margin, and the same four rows shifted right. The course did not turn on. The layout slid. The 13.5rem gap is the entire result of the interaction.

The label is a retreat. After the click there is no Schedule next to the revealed course, no lit row, no change in what a student would open. The next ask is still the close, past Davis, Fun, and How. The micro-commit dead-ends in an undo.

On the phone the same click sets the gray list to 45% opacity and leaves it in the stack. The turned-on phone shot still shows the gray block, the rainbow rule, the button, and the color list. Dimmed gray is still a second list. The decision on screen does not change.

Pass 2 was right that a resting split has to show the difference with zero interaction. The button then undoes that decision. Most people will not click a toy. The people who do click lose the gray that made the color mean something.

### The question arrives after the lists, and it lies on the phone

"Which class would YOU rather take?" sits in `.dl-hero__note`, under the band, at `0.95rem`. The eye meets two lists, then learns they were a choice. The caption under that still says "Left is a typical Canvas module list. Right is the same course." Under 800px the band stacks. There is no left and no right. The phone also sets `.dl-course` and `.dl-mod__meta` to `display: none`, so "Introduction to Biology" and the assignment lines ("Pages · Assignments · Due dates") disappear while the caption still claims same assignments.

### Copy and a second Schedule sit on top of the course

The hero is `100dvh` minus the 26px draft bar, the 52px nav, and 72px of badge clearance. Into that budget the cluster still puts an eyebrow, a two-line H1 at `clamp(1.5rem, 2.7vw, 2.35rem)`, a two-line lead, a 44px Schedule, "Watch the overview," and "Up to a 31% reduction in course failure rates." The caption block then takes another three lines plus a link. The cut is whatever flex space survives. In the desktop craft shot the type is the top of the screen and the course is a short band underneath.

The in-flow Schedule is above that band. A director can book before seeing the class, or skip a magenta pill they are not ready for. The nav pill is the one that should be persistent. The second pill currently answers a question the picture has not asked.

"Up to a 31%" between the button and the course delays the peak and borrows the gut punch. Exact 31% is correctly parked in the Davis band with Davis School District, 72 classes, 6,000 students, and same courses, content, and teachers. The hero line has no study context, which is legal for a promise and still the wrong slot. Makeover is the first peak. Davis is the next one.

The lead ("three-minute Makeover," "a course they want to open," "early warning") restates the caption, the picture, and the How heading. It is the paragraph pass 2 already cut from under the card, moved up.

### What is already working and should survive

Keep these. Do not reopen them to make the peak louder.

- Draft line is a real bar. Nav sticks at `top: 0`. No phantom 32px offset.
- Magenta `#c7007a` fills Schedule a demo and nothing else. Turn it on is navy. After this pass, nothing navy needs to impersonate a booking button either.
- Student side has no On track, Needs a nudge, Behind, or Day streak.
- Davis numeral, study context, and the phrase "decrease in course failure rates."
- Netflix sentence exact. Fun. in Fraunces on the butter band. Tiffany Dance in one sentence.
- How is prose plus the two YouTube links. No datathumb, no commthumb.
- Family stays one paragraph. Higher Ed sits after the close, text link only, as much as 47 / 67 / 65 with the deep-disengagement definition.
- LTI, FERPA, Chromebook, and the no-migration line once, on the close.
- Footer padded for the Zoho credit. No badge-hide CSS. No sticky bottom bar.
- Bookings URL on every demo control. `https://delphi-me.com/schedule-jared` stays the public brand route. This pass does not swap the href.

### Staging is still the previous page

Fetched 2026-09-23, the staging document still injects the homepage in `<head>`. The theme `<body>` is an empty shell. The makeover is still `#makeover-range`, a Before/After segment, "Your progress · Day streak," and an IntersectionObserver that auto-parks on After. The v3 file has not replaced that page. The next paste has to replace Header Code and the custom CSS, not append a second homepage onto the slider.

---

## 2. Signature move: Open the course

One course band in the first viewport. The gray list stays. The color side stops being a second syllabus. One module is open, large enough to choose. There is no toggle.

### What the visitor sees at rest (JS off, animation off, still the same picture)

Desktop, first screen, nav and draft bar included:

1. A short type cluster. Eyebrow, the locked headline, then the question on its own line: "Which class would YOU rather take?" No lead. No Schedule in this cluster. No "up to a 31%" here. The cluster stays under about 8.5rem so the band can be taller than the type. Check at 1440×900: the course band is taller than everything above it inside the hero.
2. The band, edge to edge, still inside the hero on a 1280×800 and a 1440×900. Three columns, about 36% / 56px / the rest. The color side is wider. Equal columns say the two lists are peers. A wider color side says which class the question means.
3. **Gray column.** Ground `#d5d8df`. Label: Canvas. Course name: Introduction to Biology, at least 1rem, never hidden by a container query. Four module rows at 16px or larger, with the existing meta (Pages · Assignments · Due dates, and the three lines under the other names). No app chrome. No kicker repeating the H1.
4. **Blade.** The same five skewed stripes, about 56px wide, full height of the band. No button on it. The current pill sits in the middle of the fan and hides the cut. The fan is the hinge between gray and color.
5. **Color column.** Ground `#fffdf6`. Label: Delphinium. Same course name. Then a single open module, **Cells and Structure**, set at `clamp(1.6rem, 2.6vw, 2.4rem)`, Outfit 700. Under the name: "Start here" in navy, and one outlined chip, "Avatar points." Meta under that: "Readings · Quiz." The row ground is cyan mixed into paper (`color-mix(in srgb, #00aeef 18%, #fffdf6)`) with a solid cyan bar on its left edge, about 8px. Under the open module, a quiet index of the other three names at about 0.95rem, each with an 8px stripe in the remaining logo colors: Getting Started (yellow), Energy and Metabolism (green), Genetics (magenta). Cells is not repeated in the index.
6. **Progress.** One track, about 7.5rem by 8px, labelled "Your progress," fill a bit past halfway, drawn from the fan colors as a continuous bar. No numeral. The bar is `aria-hidden`. Do not put a percent on an illustrated meter.

Caption and ask under the band, in that order: the illustrated caption, then **Schedule a demo**, then one line of text links. The nav pill remains the persistent Schedule. The in-flow pill is the resolution of the picture, not a step before it.

### What happened to Turn it on

The verb moves into the caption: "Teachers turn it on." The control is gone. So is `is-on`, the width collapse, the 13.5rem pad, the phone opacity dim, and the label "Show the Canvas list."

A button that reveals a better picture fails the people who never click, and the current button reveals a worse one. The resting picture has to be the makeover. A later test can add a control. This pass does not ship one.

### One animation, optional, and not the design

Under `prefers-reduced-motion: no-preference`, the open row's wash and the progress fill can run once, about 700ms, on load. The base CSS already has the lit row and the partial fill. Reduced motion, a paused animation, and a screenshot of the file all show that end state. No script for the peak. The video facade script stays as it is.

### Why this is the booking picture

- The gray list is recognizable Canvas, and it stays on screen for the whole visit.
- The color side has a next step and a reason to care (Start here, Avatar points) at a size you can read from the back of a demo. The other modules prove it is the same course.
- The question is the line above that choice. The Schedule under it is the action that follows the choice.
- The fan is visible for its full height. Brand color is the hinge, not a zipper parked in the margin after a click.
- Nothing on the band is a fake Control Tower, a roster, a streak, or an avatar drawing. Prize boxes and googly eyes stay in Tiffany's sentence.

### What this is not

Not a drag seam. Not a Before/After segment. Not a second toggle with a kinder label. Not a scroll-scrub. Not a pinned scene. Not an illustrated face, prize box, or leaderboard. When Jared delivers a real course-home still, it replaces the open module and the index, and the word "illustrated" stays until he clears the still. The gray column stays a labelled CSS list until a real Canvas list still exists.

### Mobile (stack the same objects, do not shrink the columns)

Under 800px, in this order: type cluster (eyebrow, H1, question), gray list, horizontal fan rule (the five colors, about 14px), the open module and its three-name index, the caption, a full-width Schedule, then the two text links.

Gray module names stay at least 16px. The course name stays visible. The open module name stays at least 1.35rem, with Start here, Avatar points, and "Readings · Quiz." Meta on the gray list and on the index can hide if the four names would otherwise fall past the Schedule. Meta on the open row stays. No range input. No dimmed duplicate. No bottom bar. The nav pill remains.

The caption does not say Left or Right.

---

## 3. Palette, type, rhythm

Palette tokens stay the v3 set. Two jobs change.

| Token | Value | Job on this pass |
|---|---|---|
| Paper | `#fffdf6` | Page ground and the color column |
| Canvas | `#d5d8df` | Gray column only |
| Cyan | `#00aeef` | Open-module wash and its left bar. Also a fan stripe |
| Mark | `#f8f000` | Yellow slab behind "engagement" in the H1 only. First index stripe. Never a second slab inside the band |
| Magenta button | `#c7007a` | Schedule a demo only |
| Fan magenta | `#ec008c` | Genetics stripe and the blade. Not a row fill. Too hot next to the button |
| Navy | `#2b2f7e` | Start here, the Avatar points outline, the question |

Rules that stay: gray only in the Canvas column. Magenta fills buttons, not sections. The fan lives on this band (and the mobile rule). The close has no fan wallpaper. Fraunces stays on the Netflix quote and the word Fun. The question and the open module name are Outfit. Do not add a third quirk face in the hero.

### Rhythm

The hero spends its height on the open module. Later bands keep the v3 rhythm and the v3 grounds.

| Band | What changes |
|---|---|
| 1. Open the course | Shorter type, question above the band, unequal cut, Schedule under the picture |
| 2. Davis through logos | Unchanged. Exact 31% stays in Davis. The hero promise moves to the close as "up to a 31%." |

Hero padding under the nav stays tight (the v3 `0.55rem`). Do not give the headline its old `clamp(1.5rem, 2.7vw, 2.35rem)` back. Set the H1 at `clamp(1.35rem, 2.2vw, 1.85rem)`. Set the question at `clamp(1.05rem, 1.6vw, 1.35rem)`, Outfit 700, navy, one line on desktop.

---

## 4. Copy rewrites

Paste-ready. No em dashes. The hero does not contain "31%". The close promise says "up to a 31%." Exact "31%" stays in the Davis band, next to the study context. Spellings elsewhere on the page stay Niederhauser and Dance. CTA label is always **Schedule a demo**.

### Hero cluster

- Eyebrow: Canvas engagement layer
- H1: Canvas delivers content. Delphinium delivers engagement.
- Question, under the H1, above the band: Which class would YOU rather take?

Delete the lead. "A course they want to open" is the picture. "Early warning" is the How heading. "Three-minute Makeover" and "turn it on" move to the caption. Putting the lead back will shrink the band again.

Delete the hero line "Up to a 31% reduction in course failure rates."

### Band labels

- Gray label: Canvas
- Color label: Delphinium
- Course name, both columns: Introduction to Biology
- Open module: Cells and Structure
- Open module line: Start here
- Chip, one: Avatar points
- Open module meta: Readings · Quiz
- Progress label: Your progress
- Index: Getting Started · Energy and Metabolism · Genetics

Gray meta stays: Pages · Assignments · Due dates / Readings · Quiz / Discussion · Lab / Exam review.

Delete both pane kickers. Delete the button labels "Turn it on" and "Show the Canvas list."

### Under the band

- Caption: Illustrated. A typical Canvas module list, and the same course with Delphinium on. Same modules. Same assignments. About three minutes. Teachers turn it on. No migration.
- Button: Schedule a demo
- Links, one line: Watch the overview → `https://www.youtube.com/watch?v=DuZRx9aN9tw` · See a Makeover start to finish → `https://www.youtube.com/watch?v=HuYuD8UQoiM`

### Close (promise only; the rest of the close stays)

Add this line under the Jared sentence, above the button:

Up to a 31% reduction in course failure rates.

The close heading, the Jared sentence, the trust line, and the no-migration line stay as written in v3.

### Davis band

Do not edit. Numeral 31%, "decrease in course failure rates at Davis Connect," then Davis School District, Utah, 72 fully online classes, 6,000 students, same courses, same content, same teachers.

---

## 5. Zoho Sites buildability map

Same three pastes as v3. No new library. The peak script gets smaller.

| Move | Where it lives | JS |
|---|---|---|
| Fonts (Outfit, Source Sans 3, Fraunces) | Header Code, `<link>` only. No page markup in the header | 0 |
| Open-module layout, 36/64 cut, blade, wash, mobile stack, hero height | Custom CSS, one copy. Replace the v3 cut rules that collapse `.dl-cut__off` | 0 |
| Markup from draft bar through footer | Body Code Snippet. On staging, this replaces the v2 page that still lives in Header Code | 0 |
| Load wash | CSS animation, 700ms, gated on `prefers-reduced-motion: no-preference`. End state is in the base rule | 0 |
| Turn it on script | Delete it with the button | 0 |
| Schedule a demo | Anchor, every time, to `https://jared-delphi-me.zohobookings.com/4937208000000036014` | 0 |
| Makeover video facade | Existing click-to-iframe. Leave it on the butter band | ~15 lines, already written |
| Davis, Fun, family, HE, logos, draft bar, footer pad | Unchanged from v3 | 0 |
| Zoho badge | Still no hide rules. Keep the 72px hero clearance and the footer pad | 0 |

Explicitly out: scrollcraft.js, GSAP, pin, scroll listeners, IntersectionObserver on the band, drag math, a range input, a Before/After segment, a toggle that hides the gray list, a sticky bottom bar, a second filled button color, an avatar illustration, any edit to HubSpot, DNS, or production Zoho.

Staging check before calling the paste done:

- 1440×900 and 1280×800: draft bar, nav, headline, question, both sides of the band, caption, and the in-flow Schedule sit above a 60px bottom credit. The band is taller than the type cluster. The gray list is still there without a click.
- 390×844: gray names at 16px or more, open module name at 1.35rem or more, course name visible, Schedule under the picture, caption has no "Left" or "Right."
- No element with the text "Turn it on," "Show the Canvas list," "Day streak," "On track," "Needs a nudge," or "Behind."
- View source on the staging URL: no `#makeover-range`, no homepage markup inside `<head>`.
- One exact "31%", in the Davis band. The close says "up to a 31%." The hero says neither.
- Every filled Schedule button uses the Bookings URL. The draft line is visible. The Zoho credit does not cover the footer lockup.

---

## 6. Ranked craft checklist

1. **Delete the toggle.** Remove the button, `is-on`, the gray collapse, the 13.5rem left pad, and the phone 45% dim. The gray list stays visible.
2. **Rebuild the color column as one open module.** Cells and Structure at display size, Start here, one Avatar points chip, Readings · Quiz, cyan wash. Getting Started, Energy and Metabolism, and Genetics are the index under it. The gray column keeps all four modules.
3. **Make the color column wider** (about 64% to the gray column's 36%). Leave the blade full height with no control on it.
4. **Put the question above the band.** Delete both pane kickers. Stop hiding the course name under 280px or on the phone.
5. **Move the in-flow Schedule under the picture.** Delete the hero lead and the hero promise line. Add "Up to a 31% reduction in course failure rates." to the close, under the Jared sentence.
6. **Use one caption** that never says Left or Right, and that carries "Teachers turn it on."
7. **Mobile stack** as specified in section 2. Open-row meta stays. Gray and index meta may hide. No second full syllabus.
8. **Optional 700ms wash** on load. The lit row is the CSS default.
9. **Leave Davis, the butter band, How, family, HE, logos, the draft bar, the footer pad, and the magenta rule.**
10. **Replace the staging header page.** Confirm the live HTML no longer contains the range slider or Day streak before treating v3 as what visitors see.

Do not build a second peak, a Control Tower fake, or a new toggle to compensate. The open module is the peak until a real course still arrives.

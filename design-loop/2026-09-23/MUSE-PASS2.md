# MUSE PASS 2: Delphinium homepage (anti-anchor)

**Date:** 2026-09-23 · **Author:** Muse Spark · **Status:** DRAFT direction, not a Zoho publish
**Looked at:** live staging HTML + `zs-customcss.css` from `https://delphinium-marketing-staging.zohosites.com`, plus the 2026-09-23 hero / mid / bottom shots after the moon DOM purge
**Primary CTA:** Schedule a demo → `https://jared-delphi-me.zohobookings.com/4937208000000036014`
**Claims ceiling:** `context/SOURCE.md`
**Constraint:** Zoho Sites custom HTML/CSS/JS only. No scrollcraft.js, no pin-scrub, no freestanding app. HubSpot, DNS, and production Zoho stay untouched.

Pass 1 asked for a Makeover Switch. It shipped. This pass does not polish that card. The first screen still fails the only test that matters: a Canvas director should see the transformation and have a reason to book before they scroll.

---

## 1. Brutal critique

The page is on-brand in the way a pitch deck is on-brand. Warm paper, logo navy, a yellow slab behind one word, a magenta pill. Swap the headline for another Canvas add-on and the layout still works. The product promise is color, motion, and a course a student would rather open. The page delivers a column of copy and a miniature dashboard.

### The first screen does not contain the product

Hero type tops out at `clamp(2.1rem, 5.5vw, 3.75rem)` and the section padding runs to `7.5rem`. The course card starts after another `3.5rem`. On the captured fold the visible objects are the wordmark, "Higher Ed Online", the magenta pill, the eyebrow, the two-line headline, the lead, and the "up to 31%" line. The Makeover is the next screen. A director who does not scroll has read a category sentence and not seen a course.

The in-flow **Schedule a demo** sits under that proof line, so the nav pill is the only ask that reliably clears the fold. "Watch the overview" is a fair text link. It is not a substitute for the course.

### The Switch answers the wrong question, and it hides the gray

The prompt is "Which class would YOU rather take?" The After frame is a teacher status list: **On track**, **Needs a nudge**, **Avatar unlocked**, **Behind**, plus a bar that says **Your progress · Day streak**. That is an ops widget. A student does not open a class to read "Behind." "Day streak" is not in SOURCE. It implies a feature we have not claimed. Avatar points are real (Tiffany Dance). A streak counter is not.

The comparison itself is illegible at rest. Inline `--reveal` is `72%`. Before snaps to `8%`, After to `92%`, and the scroll-in motion parks at `88%`. The gray Canvas list is a sliver behind a yellow drag line. The caption says "Drag the line." The chrome also offers a Before/After segmented control. Two metaphors, one card, and the resting state already chose After. The recognition beat (this is my Tuesday) never holds.

The card is also dressed as a fake app: 52px rail, three dots, 16:10 frame, drop shadow, 10–12px type. At phone size that type is a texture, not a course. The "Illustrated demo scenario" badge is the honest part. It reads as an apology stuck to a toy.

### One column, one volume, one too many numbers

After the card, every section is the same `1120px` wrap at the same polite size.

- "Same course. Three minutes later." restates the caption in a paragraph. The Switch was supposed to make that paragraph unnecessary.
- Davis is the right proof and the right scale (`clamp(4rem, 12vw, 7.5rem)`). Then a link in that block jumps to Higher Ed results, so the gut punch offers an exit into a different statistic.
- Motivation has the best raw material on the page (the Netflix line, 72%, Fun, Tiffany) and spends it as a quote, a navy number, and the word "Fun." at `1.5rem` in green. Fun is the students' word. It is set like a label.
- How, Natalie, the two real thumbs, family, the three-minute line, and LTI/FERPA/Chromebook share one section. Family is a bordered paragraph. The thumbs are the first real product pixels (`datathumb.png`, `commthumb.png`) and they arrive after the fake dashboard has already defined what Delphinium looks like.
- `#highered` is a full proof block **before** the close, with its own magenta **Schedule a demo**. A K-12 buyer meets 31%, then 47% / 67% / 65%, then the ask. The larger numbers win the argument by accident. HE is a path. It is not the step before the booking.
- The close repeats the trust line and the no-migration line the How section already said. The logo fan is painted here as a 35% opacity wallpaper (`dl-close::before`). Brand color shows up as decoration at the moment it should have been the mechanism, several screens earlier.
- "Programs on Canvas" is a soft grayscale strip of marks already used on the HubSpot site. Alt text is empty. Davis is correctly absent as a logo. Leave the set alone. Do not grow it.

### Craft that looks finished and behaves fragile

- The entire homepage markup is injected in the document `<head>` (Header Code). The theme `<body>` is an empty shell whose site name still says "Delphinium | Canvas engagement layer". The moon purge removed blank sections. The architecture that invited them is unchanged. Validators, some embed paths, and the next theme edit will keep fighting a page that does not live in the body.
- `zs-customcss.css` contains the page rules twice, plus a stack of `!important` rules trying to hide the Zoho Sites badge. The badge is still in the footer shot. More selectors will not win. Give the footer padding and leave the credit alone. Do not put a booking control in that row. Do not bring back a sticky bottom bar (it collides with that badge).
- `.dl-draft` is styled and the nav is `sticky` with `top: var(--draft-h)` (`2rem`). The banner element is not in the markup. On scroll the nav reserves a blank strip for a banner that is not there. The workspace rule still wants a visible draft banner until this staging URL is approved as the public face.
- Outfit + Source Sans 3 are fine mechanical choices. Poppins and PT Sans still load with the theme. The page feels generic because every display moment is Outfit at a medium size, weight 300 on the first headline line, with a single highlighter word. A yellow highlight on one word is a template move now. It can stay as a rhyme. It cannot be the peak.

What is already worth keeping, and should survive the rebuild: the locked headline, magenta `#c7007a` as the only button color, warm paper, the Davis numeral with study context in the same block, the Netflix sentence kept exact, Niederhauser / Dance spellings, honest "illustrated" labelling, real thumbs in the How section, the Bookings URL on every demo control, and no sticky bottom CTA.

---

## 2. Signature move: Turn it on

One full-bleed cut in the first viewport. The logo fan is the blade. Both courses are visible without dragging. A single control matches the product verb: turn it on.

### What the visitor sees at rest (JS off still works)

Desktop, first screen, nav included:

1. A short type cluster, left aligned, on warm paper. Eyebrow, the locked headline, one lead sentence, **Schedule a demo**, the "up to 31%" line in small type. This cluster is compact. It does not get a `7.5rem` pad.
2. Directly under it, edge to edge inside the same screen on a 1280×800 and a 1440×900 laptop: the course, split in half.
3. **Left half, Canvas.** Ground `#d5d8df`. No app rail, no dots, no window chrome. Four module names at 16px or larger, hairline rows, tiny meta ("Pages · Assignments · Due dates"). Above the list, in the gray, the quiet line "Canvas delivers content."
4. **Right half, Delphinium.** Ground `#fffdf6`. The same four module names at roughly 28–32px. Each row has an 8px stripe in logo order: yellow `#f8f000`, cyan `#00aeef`, green `#00a651`, magenta `#ec008c`. No percent bars. No "On track / Behind / Needs a nudge." No "Day streak." One chip only, on one module, reading **Avatar points** (Tiffany's observed behavior). Above the list: "Delphinium delivers engagement." with the existing yellow slab behind "engagement."
5. **The blade** sits on the cut, full height of the course band. Five skewed stripes, about 6px each, logo order, rotated about -8deg. This is the mark, used as structure. It replaces the 1px yellow drag line and the fake rails.
6. **One control**, a real button on the blade, label **Turn it on**. It is not a booking button and it is not magenta. Magenta is reserved for Schedule a demo. This control is navy text on paper, or a navy outline, so it cannot be mistaken for the ask.

Caption under the band, always visible: "Illustrated. Left is a typical Canvas module list. Right is the same course with Delphinium on. Same modules. Same assignments. About three minutes. No migration."

Text link under that, unchanged destination: "See a Makeover start to finish" → `https://www.youtube.com/watch?v=HuYuD8UQoiM`.

### What "Turn it on" does

Adds `is-on` on the course band. CSS transitions the left pane from half width to nothing and slides the blade to the left edge, about 700ms. The color course fills the band. Pressing again (label swaps to **Show the Canvas list**) returns to the half cut. `prefers-reduced-motion: reduce` disables the transition and still shows the half cut.

There is no auto-play that parks on After. The current observer does that, and it deletes the comparison. Resting state is the split. The click is the delight, and it rehearses the sales sentence ("teachers just turn it on").

### Why this converts harder than the card

- The difference is visible with zero interaction. A toggle that hides the gray asks the buyer to do the demo's job.
- The After side is a class you could choose, set in type a person can read. The How section keeps the teacher story (Control Tower, Message Center, Natalie). The hero stops speaking ops.
- The fan stops being footer wallpaper and becomes the thing that cuts gray from color. That is the only Delphinium-shaped move on the page.
- "Turn it on" is a micro-commit sitting next to Schedule a demo. The booking control stays the only magenta pill.

### What this is not

Not a drag seam. Not a Before/After segmented control. Not a scroll-scrub. Not a pinned scene. Not a fake Control Tower. Not a claim that the CSS rows are a screenshot. When Jared delivers a real course-home still, it drops into the right pane and the "illustrated" word stays until he says the still is the course. The left pane stays a labelled CSS list until a real Canvas list still exists. Do not invent the missing still in CSS.

### Mobile (design it, do not shrink the split)

Under 800px, stack: type cluster, **Schedule a demo**, gray course, a horizontal fan rule (the same five colors, about 14px tall), color course, caption. **Turn it on** sits between the two courses and toggles which one is fully lit (the other dims to 45% opacity). No range input. No 10px type. Module names stay at least 16px. The nav pill remains the persistent ask. No bottom bar.

---

## 3. Palette, type, rhythm

### Palette (lock what staging already sampled, change the job of each color)

| Token | Value | Job |
|---|---|---|
| Paper | `#fffdf6` | Page ground, and the After half |
| Canvas | `#d5d8df` | Before half only. Darker than today's `#ededed`, so it separates from paper |
| Ink | `#23232a` | Headlines on paper |
| Ink soft | `#5a5a66` | Body |
| Navy | `#2b2f7e` | Wordmark echo, outline controls, Davis numeral |
| Navy deep | `#1d2158` | Close and footer |
| Mark | `#f8f000` | Yellow slab behind "engagement", first fan stripe. Never body text |
| Cyan | `#00aeef` | Fan stripe, one progress cue |
| Green | `#00a651` | Fan stripe |
| Magenta button | `#c7007a` (hover `#a50064`) | Every **Schedule a demo** pill, white label. The only filled button color |
| Magenta fan | `#ec008c` | Decorative stripe only. Too hot for small white type |

Rules:

1. Gray appears in the Before half and nowhere else. Paper, butter, and navy are the only other grounds.
2. Magenta fills buttons. It does not fill sections.
3. The fan has one home: the hero blade (and its mobile rule). Delete the close `::before` wallpaper so the ending is quiet.
4. The yellow highlighter stays on the single word "engagement" and does not spread to other headlines.

### Type

- **Outfit** for the H1, the Turn it on / Schedule a demo labels, and the Davis numeral. It is already loaded and it sits closer to the geometric wordmark than a serif would.
- **Source Sans 3** for body. Keep the measure short (about 42ch on leads, about 52ch on proof context).
- **Fraunces** (Google font link, same pattern as the Outfit link already in the head) for exactly two strings: the Netflix quote and the word **Fun.** That is the quirky note. Do not set the H1, the nav, or the buttons in Fraunces.
- Stop letting theme Poppins and PT Sans style anything visible. The theme header is already `display: none`. Do not restyle the theme; do not depend on it.
- Scale events, in order: the course names on the After half, the Davis numeral, the word Fun. If a fourth thing is also huge, the page is shouting again.

### Rhythm

One idea per band. Change the ground when the feeling changes. Cut the essay under the course.

| Band | Ground | Feeling | What is on it |
|---|---|---|---|
| 1. Turn it on | Paper, then the split | Recognition, then the rupture | Headline, CTA, both courses, the blade |
| 2. Davis | Paper, narrow, lots of air | Belief | The numeral and four lines of study context. No HE link in this band |
| 3. Motivation | Butter `#fbeab2`, full bleed | Liking | Quote, then **Fun.** at display size with 72% beside it, Tiffany in one sentence, Makeover video |
| 4. How | Paper | Competence | Control Tower + Message Center, Natalie, the two real thumbs with honest captions |
| 5. Family | Paper, a hairline, not a new hero | Relief | One short paragraph. Supporting only |
| 6. Close | Navy, no fan wallpaper | Resolve | One heading, Jared subline, one magenta button, trust once |
| 7. Higher Ed | Paper, after the button | A different buyer | As much as 47 / 67 / 65 with the deep-disengagement definition. Text link only |
| 8. Logos + footer | Paper, then navy | Soft context | Existing marks, draft-safe alts, room for the Zoho credit |

Hero padding collapses to roughly `1.25rem` under the nav. Later bands can keep the current generous pad. The first screen spends its space on the course.

---

## 4. Copy rewrites

Paste-ready. No em dashes. Promises say "up to 31%." Exact "31%" appears only in the Davis band, next to the study context. Spellings: Niederhauser, Dance. CTA label is always **Schedule a demo**.

### Hero

- Eyebrow: Canvas engagement layer
- H1: Canvas delivers content. Delphinium delivers engagement.
- Lead: Give the Canvas courses you already run a three-minute Makeover. Students get a course they want to open. Teachers get early warning on who needs help.
- Promise: Up to a 31% reduction in course failure rates.
- Button: Schedule a demo
- Text link: Watch the overview → `https://www.youtube.com/watch?v=DuZRx9aN9tw`

The line "Same courses, same teachers, same content" leaves the hero. It is the Davis method, and it belongs next to the named study. The hero promise stops borrowing it.

### Makeover (the cut)

- Prompt: Which class would YOU rather take?
- Button: Turn it on
- Button, pressed: Show the Canvas list
- Caption: Illustrated. Left is a typical Canvas module list. Right is the same course with Delphinium on. Same modules. Same assignments. About three minutes. No migration.
- Link: See a Makeover start to finish → `https://www.youtube.com/watch?v=HuYuD8UQoiM`

Delete the heading "Same course. Three minutes later." and the paragraph under it. The caption is the whole explanation.

After-pane chip (one): Avatar points
After-pane bar must not say "Day streak", "On track", "Needs a nudge", or "Behind."

### Close

- H2: See it on your Canvas courses.
- Body: Schedule a demo with Jared. Meet the person behind Delphinium and see how it could work in your Canvas courses.
- Button: Schedule a demo
- Trust, once: Canvas LTI 1.3 · FERPA · Chromebook-friendly
- Risk, once: No migration to plan. Nothing to install before the call. You stay in Canvas.
- Quiet link: Higher Ed Online results → `#highered`

Remove the duplicate trust and no-migration lines from the How band.

### Davis band (so the hero cut does not strand the proof)

- Numeral: 31%
- Unit: decrease in course failure rates at Davis Connect
- Context: Davis School District, Utah. 72 fully online classes. 6,000 students. Same courses, same content, same teachers. The year before Delphinium, then the year with it.

### Higher Ed band (moved under the close, claims unchanged)

- Eyebrow: Higher Ed Online
- H2: As much as 47% lower course failure in Higher Ed Online sections.
- Body: Also as much as 67% lower withdrawal and 65% lower deep disengagement (students finishing with less than about a third of points). Ask on the demo for study context that matches your campus.
- Link, not a pill: Schedule a demo (same Bookings URL)

### Family line (supporting, still not a section headline)

Families stay in the loop. When a parent finds out late, the grade has already taken a hit. Delphinium gives observers the same color-coded picture teachers see. Community Builder shares weekly progress in up to 160 languages. Celebrate wins with parents.

### Draft banner (restore the element)

Draft. Not the live site.

---

## 5. Zoho Sites buildability map

Everything below fits the path staging already uses: a Custom HTML / Code Snippet block, Custom CSS, a short script, outbound Bookings links, a YouTube iframe created on click. No scroll engine.

| Move | Where it lives | JS |
|---|---|---|
| Font links (Outfit, Source Sans 3, add Fraunces) | Header Code, `<link>` only | 0 |
| Palette, type, fan blade, half-cut, mobile stack, butter band, navy close | Custom CSS. One copy of the rules. Delete the duplicated block in `zs-customcss.css` | 0 |
| Page markup (nav through footer) | **Body** Code Snippet / Custom HTML section. Take it out of Header Code so the theme body is no longer an empty shell with a second site name | 0 |
| Turn it on | Button toggles class `is-on` on the course band. Width or `clip-path` transition in CSS. No range input, no second button group | ~18 lines, including the reduced-motion check and the label swap |
| Schedule a demo | Anchor, every time, to the Bookings URL already on staging. Do not swap in a new URL. `https://delphi-me.com/schedule-jared` stays the public brand route; confirm it is the same destination before any cutover. This pass does not change the href | 0 |
| Makeover video facade | Keep the existing click-to-iframe. Overview stays a normal link | ~15 lines, already written |
| Davis numeral, Fun, family, HE | Text in the same snippet. `clamp()` for the numeral | 0 |
| Draft banner | The `.dl-draft` node, first in the snippet. Nav `top` equals the banner height only while that node exists | 0 |
| Zoho badge | Do not add hide rules. Footer padding so the credit sits under the logo row, clear of the button | 0 |
| Logo strip | Same five images, grayscale, real alt text taken from the marks already shown. No new logos, no Davis mark | 0 |
| Theme debris | Keep hiding empty theme header/sections only as a safety net. The body snippet is the real fix. Do not reintroduce moon/Endless blocks | 0 |
| Course-home still, later | An `<img>` in the right pane when Jared sends one. Caption keeps "illustrated" until he clears the still | 0 |

Explicitly out: scrollcraft.js, GSAP, pin, scroll listeners, IntersectionObserver auto-park, drag math, a sticky bottom bar, a second filled button color, Marketing Automation popups, any edit to HubSpot, DNS, or production Zoho.

Check on staging preview before calling it done: the half-cut at 1280×800 and 1440×900 with the CTA and both courses in view; the mobile stack at 390px with 16px module names; the toggle with JS off (split still visible); reduced motion; the Bookings URL on every demo control; one exact "31%" and it sits in the Davis band; the draft banner visible; the Zoho credit not covering the footer lockup.

---

## 6. Ranked craft checklist

1. **Replace the card with the fan cut.** Rest at half/half. One **Turn it on** control. Delete the range, the Before/After segment, the 52px rails, the dots, the status chips, and the words "Day streak." Keep the illustrated caption.
2. **Fit headline + CTA + both courses in the first laptop screen.** Cut hero padding. Put **Schedule a demo** in the type cluster, above the course.
3. **Move the markup from Header Code into a body Code Snippet.** Header keeps font links, CSS, and the short script. Dedupe the doubled rules in custom CSS.
4. **Restore the draft banner element** and stop offsetting the nav by `2rem` when the banner is missing.
5. **Move "same courses, same teachers, same content" into the Davis band only.** Hero promise is "Up to a 31% reduction in course failure rates." Davis uses exact 31% with the 72 classes / 6,000 students / same courses, content, and teachers context. Say "decrease in course failure rates."
6. **Place `#highered` under the close.** Keep as much as 47 / 67 / 65 and the "less than about a third of points" definition. Text link only, so the K-12 scroll meets one magenta button at the ask.
7. **Set Fun. in Fraunces at display size** on the butter band. Keep the Netflix sentence exact. Tiffany Dance in one sentence: game changer, quiz redos, avatar points, googly eyes.
8. **Say 160 languages** in the family paragraph. Leave family supporting.
9. **Say LTI / FERPA / Chromebook and the no-migration line once**, in the close.
10. **Alt text on the five program marks. No new marks. No Davis logo.** Stop writing badge-hide CSS. Pad the footer.
11. **Mobile stack** as specified in section 2. No drag handle, no 10px mock.
12. **When a real course-home still arrives**, put it in the right pane. Until then the right pane stays labelled illustration.

Do not build a scroll narrative, a second peak, or a Control Tower fake to compensate. The thumbs in How are enough until Jared captures the real screens.

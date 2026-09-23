# Sites v3 paste notes

Draft only. Do not publish over HubSpot, change DNS, or edit production Zoho. There is no Sites API for this page. Paste by hand into the staging site after Jared reviews the file.

Source file: `zoho-sites/homepage-sites-v3.html`  
Decisions: `design-loop/2026-09-23/SYNTHESIS-V3.md`  
Bookings (every Schedule a demo control): `https://jared-delphi-me.zohobookings.com/4937208000000036014`

`https://delphi-me.com/schedule-jared` stays the public brand route. This pass does not swap it in. Confirm the two destinations match before any cutover.

## Where each piece goes

The HTML file is one self-contained preview (open it in a browser). Zoho gets three pastes, not a second copy of the rules.

1. **Header Code.** The three font `<link>` tags only (preconnect plus the Outfit / Source Sans 3 / Fraunces stylesheet). No page markup in the header. The v2 page lived in Header Code and left the theme body empty. Do not repeat that.
2. **Custom CSS.** The contents of the single `<style>` block, once. Delete the duplicated homepage rules already in `zs-customcss.css`. Delete every badge-hide rule (`display: none` on the Zoho credit, `!important` stacks, mutation observers). Do not add new ones. The footer already has bottom padding so the 60px credit sits under the lockup.
3. **Body Code Snippet.** From `<div class="dl-draft">` through the closing `</script>`. One snippet. The theme header can stay `display: none` as a safety net. Do not reintroduce empty sections.

Leave the Zoho Sites badge alone. Design above it. Do not add a sticky bottom bar. It collides with that credit.

## What v3 replaced

- The range input, the drag seam, the Before / After segment, and the auto-sweep observer.
- The black "Illustrated demo scenario" chip, the fake app rails, and the teacher chips (On track, Needs a nudge, Behind, Day streak).
- `datathumb.png` and `commthumb.png`. How is prose plus two real YouTube links.
- The phantom `--draft-h` / `top: 32px` offset. The draft line is a real in-flow bar. The nav sticks at `top: 0`.
- The Higher Ed band that sat before the close with its own magenta button. `#highered` is a quiet block after the close. Its Schedule a demo is an underline, not a pill.
- The second LTI / FERPA / Chromebook line and the second no-migration line. Both are said once, on the close.
- The close fan wallpaper. The fan is the hero blade only.

## How the peak works

At rest the course band is half gray Canvas list, half student course, split by five logo-colored stripes. **Turn it on** is a navy outline button, not a booking button. It adds `is-on`: on a wide screen the gray half collapses and the blade moves to the left edge (about 700ms). Press again (**Show the Canvas list**) to return to the split. With JavaScript off, the split still shows. `prefers-reduced-motion: reduce` skips the slide and still toggles.

Under 800px the band stacks: gray list, horizontal fan rule, the same button, color course. Turning it on dims the gray list to 45% instead of collapsing it. No range input. Module names stay at least 16px. The band does not capture scroll.

The student side shows the same four module names, a "Your progress" stripe, one **Avatar points** chip, and **Start here**. It does not show a roster.

The first section is sized to `100dvh` minus the draft bar, the nav, and 72px, so the course and both Schedule controls in that screen sit above a 60px bottom credit on a 1440×900 laptop and a 390×844 phone.

## Claims to leave alone

- Hero promise says **up to a 31%**. Exact **31%** appears only in the Davis block, next to Davis School District, 72 classes, 6,000 students, and same courses, content, and teachers. Never "UC Davis."
- Higher Ed stays **as much as** 47 / 67 / 65, with deep disengagement defined as finishing with less than about a third of points.
- Netflix sentence is exact. Fun. is the students' word. Tiffany Dance and Natalie Niederhauser keep those spellings.
- No new logos, no Davis mark, no parent percentage, no invented stills.

## After paste, check on the preview URL

- 1440×900 and 390×844: a course and Schedule a demo sit above the bottom credit. Turn it on is in that same view.
- Resting state is the split, not a full-color course.
- One click fills the color course. The second click brings the gray list back.
- Every filled button is magenta and says Schedule a demo, and every one uses the Bookings URL above.
- The draft line is visible. Scrolling does not leave a blank strip under the browser chrome.
- The footer lockup is not covered by the Zoho credit.

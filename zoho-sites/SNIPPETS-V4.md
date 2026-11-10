# Sites v4 paste notes

Draft only. Do not publish over HubSpot, change DNS, or edit production Zoho. There is no Sites API for this page. Paste by hand into the staging site after Jared reviews the file.

Source file: `zoho-sites/homepage-sites-v4.html`  
Decisions: `design-loop/2026-09-23/SYNTHESIS-V4.md`  
Bookings (every Schedule a demo control): `https://jared-delphi-me.zohobookings.com/4937208000000036014`

`https://delphi-me.com/schedule-jared` stays the public brand route. This pass does not swap the href. Confirm the two destinations match before any cutover.

## Where each piece goes

The HTML file is one self-contained preview (open it in a browser). Zoho gets three pastes. Replace the v3 pastes. Do not append a second homepage.

1. **Header Code.** The three font `<link>` tags only (preconnect plus the Outfit / Source Sans 3 / Fraunces stylesheet). No page markup in the header. Staging previously injected a whole homepage into `<head>` and left the theme body empty. Do not repeat that.
2. **Custom CSS.** The contents of the single `<style>` block, once. Delete the v3 cut rules and any duplicated homepage rules already in `zs-customcss.css`. These rules are in that block and must survive the paste:

```css
.zpsection { padding: 0 !important; }
.zpcontainer,
.zpelem-col {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
```

```css
.dl-hero { padding-bottom: 72px; }
```

`!important` is only so the theme's 50px section padding and column side padding lose. It is page inset, not a badge-hide rule. Do not add `display: none` on the Zoho credit, `!important` stacks aimed at that credit, or a mutation observer. The hero is not locked to `100dvh` or `100vh`. The footer already has bottom padding so the 60px credit sits under the lockup.

3. **Body Code Snippet.** From `<div class="dl-draft">` through the closing `</script>`. One snippet. The theme header can stay `display: none` as a safety net. Do not reintroduce empty sections.

Leave the Zoho Sites badge alone. Design above it. Do not add a sticky bottom bar. It collides with that credit.

## How the peak works

The course is already on. One card, not a half/half diagram. A vertical fan of five logo stripes is the left spine (straight on a phone, skewed on a wide screen). The card shows Introduction to Biology with **Cells and Structure** open: **Start here**, one **Avatar points** chip, and Readings · Quiz. Getting Started, Energy and Metabolism, and Genetics sit under it as an index. Cells is not repeated there.

**Show Canvas list** is a navy text control in the card's top bar, at least 44px tall. It is not a filled button and not a pill. The checkbox is `checked` in the HTML, so the student course shows with JavaScript off. Unchecking it reveals the gray Canvas list (same four modules) and the label becomes **Turn it on**. The spine desaturates. The yellow slab on "engagement" turns off. Checking it again restores the open module. `prefers-reduced-motion: reduce` skips the 700ms wash. The lit row is the CSS default either way.

Above the card: eyebrow, the locked headline, and "Which class would YOU rather take?" No lead. No 31% in that cluster. No second Schedule pill above the course.

Under the card: the caption, then the magenta **Schedule a demo**, then Watch the overview and See a Makeover start to finish. The nav pill is the other Schedule in the first screen.

## What v4 changed from v3

- Deleted the half/half cut, the centered **Turn it on** pill, the `is-on` collapse, the 13.5rem pad, and the phone 45% dim.
- Deleted the hero lead and the hero promise line. The promise now sits on the close, under the Jared sentence: "Up to a 31% reduction in course failure rates."
- The question sits above the card. The caption does not say Left or Right.
- Custom CSS zeros `.zpsection` padding and container/column side padding.

## What stayed

- Draft line is a real in-flow bar. Nav sticks at `top: 0`.
- Magenta `#c7007a` fills Schedule a demo and nothing else.
- Davis numeral, study context, and "decrease in course failure rates."
- Netflix sentence. Fun. in Fraunces on the butter band. Tiffany Dance in one sentence.
- How is prose plus the two YouTube links. No fake stills.
- Family stays one paragraph. Higher Ed sits after the close. Its Schedule a demo is an underline, not a pill.
- LTI, FERPA, Chromebook, and the no-migration line once, on the close.
- Footer padded for the Zoho credit.

## Claims to leave alone

- The hero does not say 31%. The close promise says **up to a 31%**. Exact **31%** appears only in the Davis block, next to Davis School District, 72 classes, 6,000 students, and same courses, content, and teachers. Never "UC Davis."
- Higher Ed stays **as much as** 47 / 67 / 65, with deep disengagement defined as finishing with less than about a third of points.
- Netflix sentence is exact. Fun. is the students' word. Tiffany Dance and Natalie Niederhauser keep those spellings.
- No new logos, no parent percentage, no invented stills.
- No "On track," "Needs a nudge," "Behind," or "Day streak."

## After paste, check on the preview URL

- 1440×900 and 390×844: the open module and Schedule a demo sit above the 60px credit. Module names are at least 16px on the phone. The question is above the card. Schedule in the hero is under the card.
- `elementFromPoint` on Schedule a demo and on See a Makeover start to finish returns those links, not the badge.
- The gray list appears only after Show Canvas list. It is not a second column.
- Every filled button is magenta and says Schedule a demo, and every Schedule a demo control uses the Bookings URL above.
- The draft line is visible. The footer lockup is not covered by the Zoho credit.
- View source: no `#makeover-range`, no homepage markup inside `<head>`, no `100dvh` hero height.

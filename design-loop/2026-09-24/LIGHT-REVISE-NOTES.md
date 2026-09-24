# Light revise notes: Sites v5 homepage (2026-09-24)

**Inputs:** Jared's `LIGHT-REVISE-GO-2026-09-24.md` (locked decisions, authoritative), `STORY-COMPARISON-handout-vs-sites-v5.md` (section order + ranked moves), `homepage-sites-v5.zoho-ready.html` (Bookings modal, hires wiring, chrome kills).
**File:** `zoho-sites/homepage-sites-v5.html` · paste notes `zoho-sites/SNIPPETS-V5.md`
**Scope:** copy + section structure. No Zoho publish, no HubSpot/DNS, no production.

## Section order

| Before (v5) | After |
|---|---|
| 1 Hero | 1 Hero (unchanged, text only) |
| 2 Case for engagement | cut to a kicker above the Makeover |
| 3 Makeover | 2 Makeover: "Education moved online. Engagement didn't." then "Which class would YOU rather take?" |
| 4 Proof | 3 Proof (unchanged) |
| n/a | 4 **Mid-page CTA:** "Ready to transform your Canvas?" + Schedule a demo |
| 5 Insight-poor gap | folded into Core copy |
| 6 What your school gets | 5 "Do more, in less time." Core · Engagement Builder · face + quotes · Community Builder + families |
| 7 How it works (3 cards) | 6 Trust strip (one sentence + chips) |
| 8 Videos | 7 Videos |
| 9 Close | 8 Close |
| 10 HE band | 9 HE band (unchanged) |

Peak order holds: Makeover, Davis, motivation / Fun / Tiffany, families supporting (inside Community Builder), Control Tower / Message Center how.

## What changed

- **Base:** started from the zoho-ready pack (Bookings modal with `data-bookings-open` + preload, no-subtitle SVG wordmark, hi-res product crops, no DRAFT strip, no hero eyebrow). Image paths are back to relative `assets/...` for the GitHub Pages preview. SNIPPETS §1 has the one find/replace for Zoho.
- **Case:** section removed. Kicker above the Makeover title. The Ryan Hansen "If you ask kids" pull quote is dropped from the page for pace. His director video is still in Videos.
- **Mid-page CTA:** yellow band right after Proof, same Bookings URL and modal wiring. Six Schedule links total (nav, hero, mid, close, HE band, footer).
- **Insight-poor:** standalone section and its student / parent / teacher rows removed. Core sub now reads "Canvas is data-rich, but insight-poor. Control Tower turns that data into action..." The parent point stays in the families callout. The teacher point stays in Natalie's 12/day to 6/week.
- **Product:** H2 "Do more, in less time." Core H3 "Turn Canvas into an early-warning system." Engagement Builder H3 "Transform Canvas into an engagement engine." (sub keeps the single remaining "gray wall of text" line). Community Builder H3 "Support students, effortlessly." (comma, not the handout's em dash). Product names stay as tags. Lists, Natalie, Tiffany, stats, videos, and the families callout are unchanged.
- **Face + quotes:** the handout's owned stock portrait (square crop, circular frame) sits after Engagement Builder next to "Empower students with clear signals, so they can take charge of their own learning." with "Students say" (2 lines) and "Teachers say" (1 line), exact handout wording and no attribution, per Jared. The optional Natalie one-on-one line was skipped: Natalie already appears twice. The portrait has empty alt text so it isn't read as the quoted person. No face in the hero.
- **How it works:** the three cards repeated the hero trio. Now one row: heading, one sentence (14 years of research + edits flow through automatically), and trust chips.
- **Nav hairline:** the full-width nav border cut through the wordmark. It is now a `.dl-nav::after` line that starts after the 128px logo plus the nav gap (Jared ask).
- **Setup line (Jared locked):** "Go live in less than 3 minutes. Keep Canvas, enhance with Delphinium." replaces the hero tick ("About three minutes to turn on...") and the Makeover foot heading ("Nothing to rebuild. About three minutes later."). The "Lightning fast setup" card was already gone with the trust-strip shrink, and the strip has no minutes wording, so nothing conflicts.
- **Videos:** all durations removed from text links, card overlays, and aria-labels (Jared ask). Mux poster `?time=` frame picks are kept.
- **Housekeeping:** `width`/`height` attributes now match the refreshed hi-res PNGs (the zoho-ready values were from an older export). The Makeover "before" side uses the clean prospectus crop: the hi-res crop includes a "Which class would" fragment, a second Canvas pill, part of the handout photo, and cuts off the last module row. Fixed a pre-existing reduced-motion bug where both Makeover sides showed stacked on mobile.

## Kept

Davis Connect 31% with study context, up to 31% in the hero, 72%, "Fun.", Netflix quote, Tiffany (x2), Natalie (x2), all Mux videos, families callout, quiet HE band ("as much as 47%"), Bookings modal, no-subtitle logo, hi-res assets. No "Cut failures by up to 47%" or "Reduce absenteeism" on this page. No agent stamps.

## Open for Jared / Web Design

- **SOURCE sync:** the three unattributed handout quotes are cleared by Jared in the GO brief but are not in `context/SOURCE.md` yet. Add a dated line there so future agents don't strip them. Same for the locked setup line: SOURCE still says "in about three minutes".
- **DRAFT strip:** removed per the zoho-ready staging convention. The workspace rule still says to keep a draft banner until Zoho staging. This page is the Zoho staging build, so that's consistent, but re-add the strip if it ships anywhere public first.
- **Student photo:** no smiling-student crop exists in repo assets, so the instructor portrait is used. Swap in the student crop if one turns up.
- **HE twin site:** later IA item (audience switch, HE videos/stats, no parents). Not built.

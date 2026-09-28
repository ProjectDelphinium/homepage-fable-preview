# Synthesis v4 — Muse + Fable pass 3 → Cursor craft

**Sources:** MUSE-PASS3.md · FABLE-PASS3.md · live staging v3 · SOURCE.md  
**CTA:** https://jared-delphi-me.zohobookings.com/4937208000000036014  
**Surface:** Zoho Sites only (no scrollcraft.js)

## Locked decisions

| Topic | Choice | Why |
|---|---|---|
| Peak | **Open on** — course already on at readable size; gray Canvas is a text control, not half the hero | Both: Turn it on click loses; phone barely changes |
| Layout | Fan as **left spine** (5 logo stripes). Student course is the main card (open module “Cells and Structure” with Start here + Avatar points; other modules as index). Gray list behind text “Turn it on / Show Canvas list” or off-canvas | Fable Open on + Muse open module |
| Type cluster | Eyebrow + locked H1 + question “Which class would YOU rather take?” No long lead. No 31% in hero | Muse |
| Schedule | Magenta under the picture (resolution of the peak). Nav pill stays. No second pill above the course | Both |
| Zoho inset | Custom CSS: `.zpsection { padding: 0 }` and kill side padding on container/column for this page. Hero `padding-bottom: 72px`. No fixed `100dvh` hero | Fable measured |
| Badge | Do not hide. Hit-test last hero links clear of badge after paste | Both |
| HE / Davis / Fun | Keep v3 discipline: HE after close; exact 31% only in Davis; close says “up to a 31%…” | Muse |
| How | Prose + YouTube links; no fake stills | Keep |

## Deliverables

1. `design-loop/2026-09-23/SYNTHESIS-V4.md` (this file)
2. `zoho-sites/homepage-sites-v4.html`
3. `zoho-sites/SNIPPETS-V4.md`
4. Draft PR

## Verify before claim done

1440×900 and 390×844: course + Schedule readable above 60px badge; `elementFromPoint` on Schedule and Makeover link is not the badge; module type ≥16px on phone.

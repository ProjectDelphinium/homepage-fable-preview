# Zoho Sites publish (staging only)

## Pipeline

1. **Draft** in this repo (`ProjectDelphinium/homepage-fable-preview`) — HTML/CSS/JS under root and/or `builds/`.
2. **Preview** on GitHub Pages (mirror: https://japomani.github.io/delphinium-homepage-fable-preview/).
3. **Stage** on Zoho Sites using **Code Snippet / custom HTML/CSS** (Zoho Sites Pro). Port section-shaped HTML + CSS tokens; keep JS light.
4. **Jared OK required** before any Zoho publish or further promotion.
5. **Never** cut DNS, unpublish HubSpot, or point production domains at Zoho until Jared explicitly approves cutover.

## Important constraints

- There is **no Zoho Sites REST API** for this homepage workflow. Staging is manual (or desk-assisted) via the Sites editor: custom HTML/CSS / Code Snippet modules.
- HubSpot at https://delphi-me.com/ stays live until cutover is approved.
- Do not invent CRM embeds or Bookings URLs; use existing Delphinium schedule CTA (`https://delphi-me.com/schedule-jared`) unless Jared specifies otherwise.
- Claims must stay within `context/SOURCE.md` / `ops/brand/SOURCE.md`.

## What Web Design does at stage time

- Confirm commit SHA on the approved draft.
- Port to Zoho Sites staging/preview only.
- Leave HubSpot and DNS untouched.
- Ask Jared to review the Zoho preview before any further step.

## Related

- `HANDOFF.md` — mission, hard nos, hand-back
- `ops/brief/zoho-plugins-modules-2026-09-09.md` — Zoho Sites module notes
- `docs/CURSOR_DESKTOP.md` — opening this workspace

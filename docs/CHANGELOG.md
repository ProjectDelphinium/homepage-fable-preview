# Changelog

## 2026-09-29: Header audience toggle, no shared title
- "My institution is" K-12 | Higher Ed pill beside the logo (720px+) and at the top of the mobile menu, back from 78e5ec2. Real links to `/` and `/highered`; a pre-paint script sets `aria-current` from `html.dl-path-*`. Replaces the separate "Higher ed" nav link.
- Header Code no longer carries the static K-12 `<title>`. The path script and Zoho page SEO fields set the title per path. The build fails if a `<title>` returns.
- Logo strip pause control and one section spacing (`clamp(4rem, 9vw, 7rem)`) kept through the SEO merge. Not published to Zoho.

## 2026-09-29 — Jared's SEO answers
- Organization JSON-LD email is support@delphi-me.com.
- YouTube sameAs stays https://www.youtube.com/@DelphiniumEngage.
- /highered meta description includes as much as 47% / 67% / 65% and the dropout definition. Home meta stays "up to 31%".

## 2026-09-29 — GEO / AEO / SEO pack
- Header Code now emits Organization, WebSite, and SoftwareApplication JSON-LD, plus a Zoho-hosted Open Graph image. No SearchAction, ratings, or invented price.
- Path script sets title and description per path. `/highered` no longer inherits the K-12 description. Home promises stay "up to 31%".
- Visible "Delphinium is..." definition on the homepage (Higher Ed wording swaps with the existing path classes), plus a short SOURCE-only Q&A.
- Rules live in `docs/GEO-AEO-SEO.md`. Not published to Zoho.

## 2026-09-05 — Fable 5.1 initial dump
- Single-file homepage generated via Product Claude (`claude-fable-5-1`) from locked BRIEF/SOURCE packet
- Hosted on GitHub Pages for sharing
- Cursor handoff pack added (HANDOFF, context/, rules, agent prompt)

## 2026-09-05 — Product sell first
- Jared: too many scrolls before the product. Hero is now the category headline + 3-min + Davis 31
## 2026-09-05 — Product sell first
- Jared: too many scrolls before the product. Hero is now the category headline + 3-min + Davis 31% / up to 31% + CTA. Recognition/chase follows.
- Draft banner added.

## 2026-09-05 — Prospectus story remake (Fable 5.1)
- Jared: tell the Davis District prospectus story, not text-heavy.
- Sequence: bold+31% Davis proof, problem (silence), Makeover solve, why/research, Davis voices, Core / Community Builder / Engagement Builder, supporting beats, CTA up to 31%.
- Framing still unlocked. HubSpot untouched.

## 2026-09-06 — Marketing Slack feedback into BRIEF
- Cut claim repetition; Makeover is visual centerpiece; one question per section + Learn more YT links; page takeaway + CTA subline (Jared demo).

## 2026-09-09 — CRM Migration form share pages
- Added `/forms/<slug>/` Zoho embed wrappers for CRM Migration shareable links. HubSpot untouched.

## 2026-09-19 — Cursor workspace sync

- Added `builds/` (homepage, homepage-live-v1, homepage-split-v1) from Web Design desk
- Added `ops/` (FINGERPRINTS, brief pack, brand SOURCE, HubSpot inventory)
- Added `refs/scroll-craft/` taste/skill notes only (full engine not vendored)
- Docs: `docs/CURSOR_DESKTOP.md`, `docs/ZOHO_SITES_PUBLISH.md`; HANDOFF Local builds section

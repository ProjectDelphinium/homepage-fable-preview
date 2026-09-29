# Changelog

## 2026-09-29: HE dropout figure 65%
- Jared, on the live `/highered` outcomes card: "65, not 66". The dropout figure is 65% (outcomes card, GEO-AEO-SEO.md, SNIPPETS, HANDOFF, SOURCE, ops/brand/SOURCE, highered-source). The prospectus 66% is superseded, and the 2026-09-28 "do not use 65 for dropout" rule no longer applies. The build requires 65% fewer dropouts on the card and fails on 66%. `/home` is unchanged (the card is hidden there).

## 2026-09-29: HE part-time faculty figure 64%
- Jared, on the live `/highered` outcomes card: "64 not 65". The part-time faculty figure is 64% (outcomes card, SEO.md, GEO-AEO-SEO.md, SNIPPETS, HANDOFF, SOURCE, highered-source). The prospectus 65% for part-time faculty is superseded; 65% now means dropouts only. The build requires 64% for part-time faculty on the card and fails on the old 65% line. Current HE figures: 47% / 64% part-time faculty / 67% withdrawals / 65% dropouts.

## 2026-09-29: HE withdrawal figure 67%
- Jared, on the live `/highered` outcomes card: "67, not 68". The HE withdrawal figure is 67% everywhere (outcomes card, `/highered` path meta, SEO.md, GEO-AEO-SEO.md, SNIPPETS, SOURCE). The prospectus 68% is superseded. The build now requires 67% in the HE meta and on the card and fails on 68%. 47% course failure and 65% part-time faculty unchanged.

## 2026-09-29: Go-live pack
- Jared approved the live launch. The DRAFT / not-live rule is retired and must not come back (the banner markup itself was already gone since `b8b17d5`). Rule, HANDOFF, AGENTS, and `zoho-sites/SEO.md` updated.
- The preview HTML keeps `<meta name="robots" content="noindex, nofollow">` so the GitHub Pages / local copy stays out of search. The build strips it and fails if `noindex` reaches Header Code.
- Also in this pack: HE hidden-cost cards and the NCES tall card, HE proof layout, HE video swaps and hero label, footer spacing, schedule modal header crop, "You're invited" card color bar, per-page SEO meta, SOURCE cleanup.

## 2026-09-29 — Restore pre-SEO body copy
- Jared: keep the GEO/AEO/SEO technical pack. Remove the hero "Delphinium is..." line. Restore the Davis proof context line to the pre-#25 wording (Davis School District, Utah; 72 online classes and 6,000 students).
- SOURCE-only Q&A moved to the end of the homepage, after the close CTA and above the footer. K-12 cites Davis and exact 31%. `/highered` uses as much as 47% / 67% / 65% and the dropout definition. No FAQPage schema. Q&A headings are not H1.
- 2026-09-29, later: Q&A section (`#dl-faq`, "Straight answers about Delphinium.") and its CSS removed at Jared's request. The close CTA is now the last section above the footer. There was no FAQPage schema to remove. The build no longer requires the Q&A; the FAQPage ban stays.

## 2026-09-29: Header audience toggle, no shared title
- "My institution is" K-12 | Higher Ed pill beside the logo (720px+) and at the top of the mobile menu, back from 78e5ec2. Real links to `/` and `/highered`; a pre-paint script sets `aria-current` from `html.dl-path-*`. Replaces the separate "Higher ed" nav link.
- Header Code no longer carries the static K-12 `<title>`. The path script and Zoho page SEO fields set the title per path. The build fails if a `<title>` returns.
- Logo strip pause control and one section spacing (`clamp(4rem, 9vw, 7rem)`) kept through the SEO merge. Not published to Zoho.
- SEO review of the GEO/AEO/SEO pack: `/highered` title is now "Canvas engagement layer for Higher Ed Online · Delphinium". SoftwareApplication JSON-LD adds "It is not an LMS and does not replace Canvas." (the one Q&A answer the body only implies). Logo alts now read the name on each logo (Kings Peak High School, Kelsey Peak Virtual Middle School, Rocky Peak Virtual Elementary, American Heritage Online High School, Virtual Prince William). Live-site findings and the owner to-do (duplicate `/home` and `/index`, `/schedule-jared` 404, Zoho fields) are in `docs/GEO-AEO-SEO.md` 6a and 6b.

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

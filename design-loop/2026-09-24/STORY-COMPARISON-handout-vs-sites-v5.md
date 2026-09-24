# Story comparison: Delphinium HiEd Handout vs Sites v5 homepage

**Question (Jared):** Given the story of the HiEd Handout, should we revise the story on the marketing site?
**Scope:** analysis only. No HTML shipped, no Zoho publish, no HubSpot/DNS.
**Date:** 2026-09-24

## TL;DR

- **Call: Light revise.** Don't restructure. The handout's front page already follows v5's structure: same headline, same Nuclear Chemistry Makeover, then proof, then an ask.
- Where the handout wins is pace. It tells the story in about 6 beats and asks for the demo right after the proof. v5 runs 10 sections, has two problem beats (one of them lands *after* the proof), and has no in-page ask between the hero and the close.
- Three moves: (1) add a "Ready to transform your Canvas?" demo CTA right after Proof. (2) Cut the "case for engagement" and "insight-poor" beats down to one line each. (3) Retitle the product section "Do more, in less time" and use the handout's benefit subheads.
- Don't bring over the handout's proof. "Up to 47%" is Higher Ed-only data (SOURCE wants "as much as" plus study context), and "Reduce absenteeism" plus 3 of its 4 quotes are not in SOURCE.
- Keep v5's K-12 proof (Davis Connect 31% with study context, 72%, "Fun.", Tiffany), the videos, the families callout, and the quiet HE band.
- The handout is written for Higher Ed. Its story carries over to K-12; its numbers don't.

---

## Sources read

| What | Where |
|---|---|
| Handout (rendered both pages + text layer) | `uploads/Delphinium-HiEd-Handout.pdf` |
| Handout text spans + observed arc | `uploads/HANDOUT-STORY-EXTRACT-2026-09-24.md` |
| Sites v5 brief | `uploads/BRIEF-V5.md` (same as `design-loop/2026-09-24/BRIEF-V5.md` on `cursor/sites-v5-hires-2026-09-24`) |
| Sites v5 HTML | `uploads/homepage-sites-v5.zoho-ready.html` (line refs below point to this file); repo copy `zoho-sites/homepage-sites-v5.html` on `cursor/sites-v5-hires-2026-09-24` (same copy except hero eyebrow, DRAFT strip, and Bookings modal) |
| Paste notes / page map | `zoho-sites/SNIPPETS-V5.md` on the same branch |
| Claims ceiling | `ops/brand/SOURCE.md` on `main` (2026-09-16 pack, includes HE proof). `context/SOURCE.md` on `main` is still the 2026-09-04 copy; the v5 branches sync it to 09-16. Line refs below are to `ops/brand/SOURCE.md`. |
| Attributed quotes | `context/delphinium-marketing-synthesis.md` |
| Framing / peak order | `HANDOFF.md`, `context/STORY.md`, `.cursor/rules/delphinium-homepage.mdc` |

**Note on the extract:** the SVG extract lists "Canvas delivers content / Delphinium delivers ENGAGEMENT" as a contrast line *after* the Makeover. On the rendered PDF, that line is the **headline at the top of the front page**, above the Makeover. So the two pieces open the same way. Most of the "order" gap in the extract comes from the order of the SVG text layer, not from the real layout.

---

## 1. Handout story, beat by beat

A 2-page letter flyer. Front page = the pitch. Back page = how it works for teachers and students.

| # | Page | Beat | Copy on the flyer | Visual |
|---|---|---|---|---|
| 1 | Front | **Hook** | "Canvas delivers content." (small gray pill) then "delphinium delivers ENGAGEMENT" (logo + large magenta) | Smiling student photo, top right |
| 2 | Front | **Makeover (peak)** | "Which class would YOU rather take?" Canvas vs "Canvas + Delphinium!" | Gray Canvas module list (Unit 5: Nuclear Chemistry) vs course home with teacher photo, countdown, color-coded weekly cards. The largest image on either page. |
| 3 | Front | **Real Outcomes** | "Cut failures by up to 47%" · "Reduce absenteeism" | Yellow box |
| 4 | Front | **CTA 1** | "Ready to transform your Canvas? Let's Talk!" | Magenta button + QR + delphi-me.com |
| 5 | Back | **Efficiency promise** | "Do more, in less time" | Big type headline |
| 6 | Back | **Teacher wins (x2)** | "Turn Canvas into an early-warning system" · "Support students—effortlessly" | Control Tower roster + student detail; Message Center composer |
| 7 | Back | **Student engine** | "Transform Canvas into an engagement engine!" | Engagement widget strip (prize boxes, avatar, % complete, performance, achievements, tracker) |
| 8 | Back | **Agency + voice** | "Empower students with clear signals, so they can take charge of their own learning" · "Students say…" (2 quotes) · "Teachers say…" (2 quotes) | Quote panel |
| 9 | Back | **CTA 2** | "Learn how! Schedule a Demo Now" | Magenta button + QR |

- **What it sells:** a layer on top of the Canvas you already have. Students get a course they want to open, and teachers get early warning and time back.
- **Emotional peak:** the Makeover (beat 2). The whole front page builds to it, and the outcomes and CTA land right after it.
- **CTA:** asks twice. Once right after the peak and proof, and once at the end.
- **Audience signal:** the copy never says K-12 or Higher Ed. The only audience-specific element is the 47% outcome, which is Higher Ed data.

## 2. Sites v5 story, beat by beat

From the uploaded zoho-ready HTML and BRIEF-V5 §"Story / flow".

| # | Section (line) | Beat | Key copy | Proof / asset |
|---|---|---|---|---|
| 1 | Hero (885) | **Hook + promise** | "Canvas delivers content. Delphinium delivers engagement." 25-word line. "Up to 31% fewer course failures." Trio: about three minutes · zero learning curve · built on science | Schedule a demo + K-12 video (3:29) |
| 2 | Case (916) | **Problem** | "Education moved online. Engagement didn't follow." Gray wall of text paragraph | Ryan Hansen quote |
| 3 | Makeover (930) | **Peak** | "Which class would YOU rather take?" "Nothing to rebuild. About three minutes later." | Real prospectus before/after (the same Nuclear Chemistry graphic as the handout) |
| 4 | Proof (970) | **Gut + emotional proof** | "The courses didn't change. The teachers didn't change. Engagement did." | Davis Connect 31% with study context · 72% · "Fun." · Netflix quote · Tiffany googly eyes |
| 5 | Gap (1007) | **Problem again** | "Canvas is data-rich, but insight-poor." Student / parent / teacher rows | none |
| 6 | Product (1021) | **What you get** | Core / Control Tower · Engagement Builder · Community Builder / Message Center · families callout | Control Tower, widgets, Message Center crops · Natalie x2, Tiffany · 12/day to 6/week |
| 7 | How (1127) | **Objection handling** | Built on science · lightning setup · zero learning curve · trust chips | none (repeats hero trio) |
| 8 | Videos (1163) | **Voices** | K-12 sizzle · directors (Ryan Hansen) · teachers (Natalie) | Mux videos |
| 9 | Close (1194) | **CTA** | "See Delphinium on one of your Canvas courses." Meet Jared | Schedule a demo |
| 10 | HE band (1203) | **Secondary path** | "as much as 47% lower course failure and as much as 67% lower withdrawal" | Schedule a demo link |

- **What it sells:** the same thing as the handout, plus K-12 proof and a director-level walkthrough.
- **Emotional peak:** the Makeover, followed by the Davis/72%/Fun proof stack. This matches the locked peak order.
- **CTA:** sticky nav button, hero, close, HE band, footer. There is **no in-page ask across sections 2 through 8** (lines 916 to 1194).

## 3. Where they align (keep)

| Beat | Handout | v5 | Why keep |
|---|---|---|---|
| Headline | Front-page hook | Hero H1 | Locked ★ headline (SOURCE L10–11) |
| Makeover is the centerpiece | Largest image, front page | Section 3, real prospectus graphic | Peak #1 in the peak order; same asset in both (SOURCE L13) |
| Proof comes right after the Makeover | Real Outcomes box | Proof section | Right order: show it, then prove it |
| Early-warning for teachers | Back-page subhead | Core / Control Tower | SOURCE L18 |
| Engagement widgets / gamification | "engagement engine" strip | Engagement Builder | SOURCE L13, L43 |
| Message Center / time back | "Support students effortlessly" | Community Builder + Natalie 12/day to 6/week | SOURCE L36, L43 |
| Single verb: schedule a demo | "Schedule a Demo Now" | Every button | BRIEF-V5 |

The core story is the same in both. The handout is effectively a two-page cut of v5.

## 4. Where they diverge

| Dimension | Handout | v5 | Tension | Verdict |
|---|---|---|---|---|
| **Problem beats** | None. Goes straight from hook to Makeover | Two: "case for engagement" before the Makeover, "insight-poor" after the Proof | The second problem beat backtracks after the peak and slows the path to the ask. The first delays the Makeover by one screen. | **Trim both** (move 2) |
| **CTA cadence** | Ask right after the peak + proof, then at the end | Ask in the hero, then not again until the close, 7 sections later (sticky nav aside) | A director convinced at the Proof has no contextual button to click | **Add a mid-page CTA** (move 1) |
| **Proof content** | "Up to 47%" failures, "Reduce absenteeism" | Davis Connect 31% (named, with context), 72%, "Fun.", Tiffany | The handout's proof is Higher Ed data or unsourced. v5's proof is the K-12 set SOURCE assigns to directors and principals (L49–50). | **Keep v5** |
| **Where proof first shows up** | After the Makeover | "Up to 31%" in the hero | The hero number helps the Director of Online Learning persona (SOURCE L49) | **Keep v5** |
| **Product framing** | By benefit: "Do more, in less time" → early-warning · support effortlessly · engagement engine | By product name: Core / Engagement Builder / Community Builder, with benefit H3s | The handout's frame is shorter, uses approved lines, and speaks to both the teacher-time and student-engagement pain | **Borrow the headers, keep product names as labels** (move 3) |
| **Student agency line** | "Empower students with clear signals, so they can take charge of their own learning" | "When students can see where they stand and where they're headed, they own the journey." | Same idea; the handout's line is tighter | **Borrow** (move 4) |
| **Voices** | Anonymous "Students say / Teachers say" | Named and attributed (Tiffany Dance, Natalie Niederhauser, Ryan Hansen) | Named quotes are more credible, and 3 of the 4 handout quotes aren't in SOURCE | **Keep v5** |
| **Human face** | Student photo in the hook | Text-only hero | A face adds warmth ("personal, fun, approachable"), but we don't know where the photo came from | **Open question** (Q1) |
| **Beats only v5 has** | none | How it works, Videos, families callout, HE band | Videos and families are required supporting beats; How it works repeats the hero trio | **Keep videos, families, HE band; trim How it works** (move 5) |
| **Length** | About 9 beats over 2 pages | 10 sections | Marketing feedback (HANDOFF 2026-09-06): "cut repetition; Makeover centerpiece". "Gray wall of text" appears 3 times; "three minutes / zero learning curve / built on science" appear twice | **Trim repeats** |

## 5. Recommendation: **Light revise**

**Why not keep v5 as-is:** the handout shows the same story works in far fewer beats, with the ask placed right after the peak. v5 makes the visitor scroll through a second problem beat, three product blocks, a How it works section that repeats the hero, and videos before it asks again in the page. For a K-12 virtual/online Canvas director, the moment they're most likely to book is just after the Makeover and Davis proof. v5 has only the sticky nav there.

**Why not restructure toward the handout:** the handout's structure *already is* v5's structure. A restructure would mean importing the handout's *content*, and that's where it breaks down for a K-12 homepage:
- Its outcomes are Higher Ed ("up to 47%") or unsourced ("Reduce absenteeism"). Swapping them in would drop the named Davis Connect 31% study and the 72% motivation stat, which are the proof SOURCE assigns to K-12 directors and principals (L30–34, L49–50).
- A two-page print flyer is made to be scanned in seconds at a booth. A director on the homepage needs the product walkthrough and videos to justify a demo to their team. v5 has those; the handout can't.
- Its anonymous quotes are weaker than v5's named ones and mostly can't be sourced.

**Net:** keep v5's order, proof, and assets. Apply the handout's pacing (fewer problem beats, an ask right after the peak) and its benefit language for the product section. Every move below is a copy change or a section move inside the existing HTML. No new claims or new assets are needed, and the locked peak order (Makeover → Davis → motivation/Fun/Tiffany → family supporting → Control Tower/Message how) stays intact.

## 6. If revise: ranked moves (section order + copy only)

### Proposed section order

| Now (v5) | Proposed |
|---|---|
| 1 Hero | 1 Hero *(unchanged)* |
| 2 Case for engagement | *(folded into Makeover intro, move 2)* |
| 3 Makeover | 2 Makeover |
| 4 Proof | 3 Proof |
| n/a | **3b NEW: mid-page CTA** (move 1) |
| 5 Insight-poor gap | *(folded into product intro, move 2)* |
| 6 What your school gets | 4 "Do more, in less time" (Core · Engagement Builder · Community Builder + families) |
| 7 How it works | 5 Trust strip *(trimmed, move 5)* |
| 8 Videos | 6 Videos |
| 9 Close | 7 Close |
| 10 HE band | 8 HE band *(unchanged)* |

Ten sections become eight, and there are three in-page asks (hero, after Proof, close) instead of two.

### Ranked moves

**1. Add a demo CTA right after Proof (highest conversion impact).** The handout's front page ends on its peak plus an ask. Do the same:

```html
<section class="dl-section dl-close" aria-labelledby="mid-cta-heading">
  <div class="dl-wrap">
    <h2 id="mid-cta-heading">Ready to transform your Canvas?</h2>
    <a class="dl-btn" href="https://jared-delphi-me.zohobookings.com/4937208000000036014" data-bookings-open>Schedule a demo</a>
  </div>
</section>
```

Heading is from the handout (not a claim). Keep the button label "Schedule a demo" instead of "Let's Talk!" so every button uses the same verb (BRIEF-V5).

**2. Cut both problem beats to one line each.**
- *Case for engagement (line 916):* keep "Education moved online. Engagement didn't follow." as the kicker above "Which class would YOU rather take?". Drop the paragraph. Move the Ryan Hansen quote under the Makeover intro (synthesis L327–329). The Makeover arrives one screen sooner, which is what the handout does.
- *Insight-poor gap (line 1007):* replace the section with a one-line intro to the product section: "Canvas is data-rich, but insight-poor. Delphinium turns that data into action." ("Turn Canvas data into action" is SOURCE L40's preferred public phrasing.) Drop the student / parent / teacher rows. The parent point is already in the families callout, and the teacher point is covered by Natalie's 12/day to 6/week.

**3. Retitle the product section with the handout's benefit frame.**
- Section H2: "Do more, in less time." (SOURCE L13)
- Core kicker: "Turn Canvas into an early-warning system." (SOURCE L18)
- Engagement Builder kicker: "Transform Canvas into an engagement engine." (SOURCE L13). This also removes one of the three "gray wall of text" repeats (current EB H3).
- Community Builder kicker: "Support students, effortlessly." Uses a comma, **not** the handout's em dash. Backed by "no extra teacher work" (SOURCE L18) and Natalie's numbers (L36).
- Keep the product names (Core / Engagement Builder / Community Builder) as small labels, and keep the current order: Core, Engagement Builder, Community Builder. Engagement Builder sits right after Core so the story flows from early warning into the student experience. The families callout stays inside Community Builder (supporting, not a peak).

**4. Swap in the handout's agency line.** Engagement Builder lead line becomes: "Empower students with clear signals, so they can take charge of their own learning." This is qualitative self-regulated learning framing (SOURCE L46). It replaces "When students can see where they stand and where they're headed, they own the journey."

**5. Trim How it works to a trust strip.** The hero already carries "about three minutes · zero learning curve · built on science" (lines 908–910). Keep the hero trio for above-the-fold objection handling. Shrink section 7 to the trust chips (Canvas LTI 1.3 · FERPA · alias-based leaderboards · Chromebook-friendly) and the one sentence "Edits in Canvas flow through automatically, so there are never two systems to maintain." Or merge them into the close.

**6. (Conditional) Hero face.** Only if Jared confirms the handout's student photo is licensed or released and not AI-generated (Q1). Otherwise keep the text-only hero. The HANDOFF hard nos rule out AI faces and fake social proof.

### Handout lines that must NOT go public on the K-12 homepage

| Handout line | Status | Why |
|---|---|---|
| "Cut failures by up to 47%" | **Do not use on the K-12 story** | Higher Ed Online data only. SOURCE L32 says not to swap it for the K-12 Davis 31% story, and prefers **"as much as"** with study context, not "up to". v5's HE band already phrases it correctly ("as much as 47%"). *Side note for the flyer itself: its "up to 47%" wording doesn't match SOURCE either.* |
| "Reduce absenteeism" | **Do not use** | Not in SOURCE. SNIPPETS-V5 §6 already lists attendance claims as PDF-only. |
| "I liked knowing that a little extra effort would make a difference." (Students say) | **Do not use** | Not in SOURCE or the synthesis; no attribution. |
| "I saw that I was doing much better than I thought I was." (Students say) | **Do not use** | Not in SOURCE or the synthesis; no attribution. |
| "Students feel they are getting constant personal attention and feedback" (Teachers say) | **Do not use** | Not in SOURCE or the synthesis; no attribution. |
| "The ease of Delphinium [gives] me much more opportunity to work one-on-one with my students" (Teachers say) | **OK only with attribution** | In the synthesis as Natalie Niederhauser, HS Math, Davis Connect (L119–120, L321–322). Must be attributed, not anonymous. v5 already has two Natalie quotes, so adding it is optional and adds repetition. |
| "Support students—effortlessly" | **Rewrite** | Em dash. Use "Support students, effortlessly." |
| Student hero photo | **Hold** | Source unknown. No AI faces (HANDOFF hard nos). |
| Headline, "Which class would YOU rather take?", "Do more, in less time", "Transform Canvas into an engagement engine", "early-warning system" | **OK** | SOURCE L10–13, L18 |

### Housekeeping noticed (not story, flag only)

- The uploaded zoho-ready HTML removes the yellow **DRAFT strip** that the repo v5 still has. The workspace rule and SNIPPETS-V5 §6 both expect a visible draft banner until Jared clears it. Confirm the removal was intentional for Zoho staging.
- **CTA URL:** the workspace rule and HANDOFF say `https://delphi-me.com/schedule-jared`; BRIEF-V5 (newer, from Jared) uses the Zoho Bookings URL on every button. The example snippet above follows BRIEF-V5. One of the two should be updated so they agree.
- `context/SOURCE.md` on `main` still lacks the 2026-09-16 HE proof and homepage-face lines that `ops/brand/SOURCE.md` has. The v5 branches fix this; merging either one resolves it.

## 7. Open questions for Jared

1. **Hero face:** is the smiling student on the handout a licensed stock photo or a released real student (not AI)? If so, do you want a face in the v5 hero?
2. **Unsourced handout lines:** is there a survey or study file behind "Reduce absenteeism" and the two "Students say" quotes plus the "constant personal attention" teacher quote? If yes, add it to SOURCE and they become usable. If not, they stay off the site (and arguably should come off the flyer too).
3. **Case beat:** OK to cut the prospectus "Education moved online" section down to a one-line kicker above the Makeover (move 2)?
4. **Mid-page CTA wording:** "Ready to transform your Canvas?" + a "Schedule a demo" button, or keep the handout's "Let's Talk!" energy on that one button?
5. **K-12 twin handout:** want a K-12 version of this flyer (same layout, Davis Connect 31% with context + 72% + "Fun.") so print and web tell the same K-12 story, with the 47% version reserved for HE Online?

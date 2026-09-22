# Web skills / harnesses / prompting research — Delphinium marketing site

**For:** Jared Chapman · Delphinium Web Design desk  
**Date:** 2026-09-09 (America/Denver)  
**Access date for web sources:** 2026-09-09  
**Constraints:** Zoho hosting (Sites/CMS or equivalent); Claude Fable 5.1 for design generation; current path used scroll-craft (nateherkai / nateherk-design); confidence in that skill is low — this report tests that doubt honestly.

**Related local docs read:**
- `/workspace/web-ai-scratchpad-findings.md`
- `/workspace/claude-packets/marketing/web-ai-stack-research-2026-09-09/out.md`
- `/workspace/delphinium-os/web-design/builds/homepage/BRIEF.md` (skim)
- `/workspace/delphinium-os/web-design/README.md`, `FINGERPRINTS.md`, `share/fable-v1/HANDOFF.md`
- `/workspace/scroll-craft/plugins/nateherk-design/skills/scroll-craft/` (SKILL.md + uniqueness/verify notes)
- Buyer / site briefs under `web-design/brief/`

---

## 0. How to use this report

Three layers matter, in this order:

1. **Host constraint (Zoho)** — what can actually ship.
2. **Skill / harness** — what teaches the agent how to build.
3. **Model (Fable 5.1)** — locked for generation quality; already strong for design-to-code and Brand & Marketing on Arena (see prior stack research; Elo figures dated 2026-09-09 from arena.ai via that packet — re-check before quoting to customers).

A skill that produces a gorgeous GitHub Pages experience and then dies on Zoho is the wrong skill for production. A skill that produces Zoho-safe pages that look like every other CMS template fails the buyer brief. The stack below aims at both.

Tag convention (same spirit as the 2026-09-09 stack packet):
- **[V]** verified this session (local file or live fetch)
- **[V~]** verified via vendor docs / secondary sources this session
- **[U]** inherited / plausible but not re-verified
- **[?]** open decision for Jared

---

## 1. What “skills” options exist for AI webpage building in 2026

### 1.1 The portable unit: Agent Skills (`SKILL.md`)

**[V~]** Agent Skills is an open standard: a folder with `SKILL.md` (YAML frontmatter `name` + `description`, then markdown instructions) plus optional `scripts/`, `references/`, `assets/`. Agents load metadata first, then the body, then resources on demand ([agentskills.io](https://agentskills.io), [Cursor docs](https://cursor.com/docs/skills), [OpenAI Codex skills](https://developers.openai.com/codex/skills), [specification](https://raw.githubusercontent.com/agentskills/agentskills/refs/heads/main/docs/specification.mdx)).

**Where skills live (practical):**

| Location | Who reads it | Notes |
|---|---|---|
| `.agents/skills/*/SKILL.md` | Broadest shared path (Codex primary; Cursor / Copilot / others) | Best for repo-portable Delphinium skills |
| `.cursor/skills/*/SKILL.md` | Cursor native | Cloud Agents need project skills in-repo or Sync Skills for personal `~/.cursor/skills/` |
| `.claude/skills/*/SKILL.md` | Claude Code (+ Cursor compatibility load) | scroll-craft ships as a Claude plugin today |
| Plugin / marketplace packages | Cursor Plugins, Claude plugins (`.claude-plugin/marketplace.json`), Codex plugins | Good for install UX; still just skills + optional MCP/hooks |

**[V]** Cursor discovers skills automatically, supports `/skill-name` invoke, Custom Modes, and built-ins like `/create-skill`, `/migrate-to-skills` ([cursor.com/docs/skills](https://cursor.com/docs/skills)).

**Implication for Delphinium:** invest in **repo-local** skills under the homepage draft repo (and/or `delphinium-os`), not only Jared’s personal Cursor skills — Cloud Agent is the standing coding harness ([web-design/README.md](../README.md)).

### 1.2 Catalog of relevant skill / workflow families

| Option | What it is | Fit for Delphinium marketing pages | Fit given Zoho |
|---|---|---|---|
| **Custom brand skill** (`delphinium-marketing` SKILL.md) | Claims ceiling, peak stack, tone, anti-slop, CTA, Zoho port rules | **Primary** — nothing else encodes SOURCE.md discipline | Excellent if written for Zoho-safe output |
| **scroll-craft** (nateherk-design) | Full craft system: interview → grammar → feeling curve → fingerprint → scroll engine + verify | Strong for aesthetics / uniqueness / persuasion *journey* | **Weak as production host skill** — see §5 |
| **Official shadcn/ui skill + MCP** | Project-aware component patterns; MCP search/install from registries ([ui.shadcn.com/docs/skills](https://ui.shadcn.com/docs/skills), [MCP](https://ui.shadcn.com/docs/mcp)) | Excellent for React/Next prototypes | Poor for Zoho Sites pages (wrong runtime) |
| **Cursor built-in skills** | `/create-skill`, `/create-rule`, review, etc. | Meta-tools to *author* Delphinium skills | Neutral |
| **Agent Skills marketplace / plugins** | Installable skill packs across Cursor / Claude / Codex | Useful to browse patterns; do not treat marketplace popularity as taste | Filter hard for Zoho |
| **Next.js / Tailwind brand-token skills** | RSC rules, token maps | Useful only if staying on React host | Not Zoho |
| **Playwright / visual-verify skill** | Screenshot gates (desktop / mobile / reduced-motion) | High value for any host | High — keep |
| **v0 (Vercel) workflow** | Prompt → React/Next UI | Fast scaffold for experiments | Output is not Zoho-native; handoff tax high |
| **Lovable / Bolt / Replit workflows** | Prompt → app scaffold | Prototypes / MVP apps | Wrong category for marketing CMS |
| **Framer AI** | Design-forward site that stays on Framer canvas | Best-in-class *marketing* AI polish in no-code class ([2026 roundups](https://cut-the-saas.com/the-cut/best-ai-website-builders), [Framer compare](https://www.framer.com/compare/framer-vs-lovable)) | **Blocked by Zoho lock-in** — use only as moodboard reference, never production SoT |
| **Webflow AI** | CMS/system generator; editable in Webflow | Strong for content-heavy marketing systems | Same — not production under Zoho |
| **Zoho Sites native builder + header/footer/code snippets** | Drag-drop sections, custom HTML/CSS/JS, CRM/Forms embeds | The **shipping surface** | Native — skill must *target* this |

**Taxonomy that matters:** code generators (v0, Lovable, scroll-craft HTML) vs system generators (Framer, Webflow, Zoho Sites). Delphinium production is a **system generator host**. Skills that assume a free React/static host will systematically over-promise motion and under-deliver on maintainability.

### 1.3 Model vs skill (brief)

Prior packet (2026-09-09) ranked **claude-fable-5.1-max** as the most defensible default across Brand & Marketing / Reference-Based Design / Fullstack boards on Code Arena WebDev (fetched that day from [arena.ai WebDev boards](https://arena.ai/leaderboard/code/webdev)). Jared is already locked to Fable 5.1 for design generation — keep that. This report does **not** re-rank models; it asks which *skills* make Fable (or Cursor’s picker) produce Zoho-shippable marketing pages.

Do not invent or restate Arena scores beyond: treat any Elo as dated 2026-09-09 from that packet; gaps under ~20 pts are noise.

---

## 2. How to prompt AI to get the best marketing web pages

Prompting quality beats skill shopping when the brief is weak. Delphinium already learned this: the first Fable dump buried the product sell 4–5 scrolls deep; Jared corrected to **sell first** ([HANDOFF.md](../share/fable-v1/HANDOFF.md)).

### 2.1 Brief structure that works (combine scroll-craft method + Delphinium locks)

Put these in every generation / Cloud Agent prompt (or in a `BRIEF.md` the skill must read):

1. **Job of the page** — one sentence (Delphinium: prove content→engagement + measured outcome → book `/schedule-jared`).
2. **Audience ranked** — DOL / virtual principal first; IT gate; teachers soft; HE secondary path only.
3. **First viewport contract** — headline + 25-word + ~3-min Makeover promise + Davis rule + primary CTA. No long problem film before the sell.
4. **Peak stack (ordered)** — Makeover visual → Davis gut → Fun/Tiffany emotional → family supporting → Control Tower/Message how.
5. **Feeling curve** — one emotion per section + what on screen causes it (scroll-craft’s best transferable idea).
6. **IA / nav** — max ~5 top items; IT/LTI reassurance findable in 1–2 scrolls or clear nav; HE as link not hero.
7. **Aesthetic direction** — vibe words + 1–3 non-website references (film, magazine, product UI) — not “sites like X.”
8. **Anti-template bans** — feature-card grids, clay dioramas, `01/06` counters, “scroll to explore,” gradient-text SaaS, stock/AI faces.
9. **Claims ceiling** — “SOURCE.md only; when in doubt delete the claim.” Include the 31% rule explicitly.
10. **Host contract** — “Output must be Zoho-port-ready: no React runtime, no unbounded GSAP ScrollTrigger pin theater, prefer CSS + light JS, embeds for CRM/Bookings.”
11. **CTA discipline** — one primary label everywhere; secondary path only.
12. **Mobile art direction** — separate composition notes, not “stack the desktop.”
13. **Reduced motion** — static peak still communicates Makeover + Davis without scrubbing.
14. **Verification** — screenshot checklist: desktop, 390×844, reduced-motion; contrast; focus states.

### 2.2 Anti-template / anti-slop rules (pasteable)

```
Banned by default:
- Feature icon grids as the story
- Clay / soft-matte AI worlds, "scroll to explore", 01/06 section counters
- Gradient text + purple SaaS chrome
- AI-generated testimonial headshots or invented quotes
- Em dashes in public copy
- Strengthening any SOURCE claim; inventing %; "UC Davis"; public list pricing
- HE or brick-and-mortar as homepage hero
- Three competing CTAs

Required:
- First viewport sells the product
- Makeover is the visual centerpiece (interactive if host allows; honest static fallback)
- Named proof with methodology visible (Davis context)
- Canvas as ally / LTI path visible
- One primary CTA → schedule-jared
```

### 2.3 Aesthetic direction prompts that work

- Give **token constraints**: primary `#283391`, coral/accent from brand pack, cool light product-UI when Live-surface grammar; avoid pure black; two type families max.
- Ask for **depth via composition** (planes, occlusion, UI chrome) not via “add parallax.”
- Prefer **authentic product UI / CSS Canvas chrome** over generated photography ([k12-online-buyer-design-research](./k12-online-buyer-design-research-2026-09-04.md)).
- Specify **quirky-personal** as microcopy and motion personality, while **claims stay sober**.

### 2.4 Navigation / IA prompts

- “Committee buyer has ~3 minutes: outcome → proof → Canvas/LTI reassurance → CTA.”
- “Each section answers one question; Learn more → specific YouTube URLs (not only channel footer).”
- “Cut repetition — do not restate Davis in every section.”
- Provide the approved Learn more map from BRIEF (Makeover, Control Tower, early-warning, Community Builder, overview).

### 2.5 Persuasion / CRO prompts

Use story shape already locked by Marketing:

`Hook → Problem → Insight → Bridge → Product → Proof → Takeaway → CTA`

But **override** pure problem-first openers with Jared’s sell-first rule: product pitch in viewport 1, then problem/recognition.

CRO specifics to demand:
- Single primary CTA label
- Proof near CTA (Davis + methodology)
- Trust strip optional (FERPA · HECVAT available · US AWS · Canvas LTI 1.3 · WCAG 2.0 AA / Sec 508 — only approved language)
- Form / Bookings wiring explicit (Zoho Bookings / CRM webform — not a fake HTML form)
- No fake scarcity / countdown

### 2.6 Claims discipline (non-negotiable)

Prompt agents with:

- Read `SOURCE.md` / brand pack before writing copy
- Promises / CTAs: **“up to 31%”**; named Davis study with context: exact **31%**
- Never invent customers, dollars, parent NPS, security badges, or “parents are happy” as a measured %
- Prefer Niederhauser / Dance naming with roles; Ryan Hansen when approved
- If uncertain → omit

This is more important than any aesthetic skill.

---

## 3. Criteria for choosing a skill

### 3.1 Emphasize these three (Jared’s ask)

| Criterion | What “good” looks like | How to test a skill |
|---|---|---|
| **Aesthetics** | Premium but personal / quirky / approachable / cutting-edge; not SaaS-template or scroll-theater cliché | Side-by-side with HubSpot live + 2 prior AI dumps; fingerprint uniqueness |
| **Ease of navigation** | DOL finds proof + CTA in <3 minutes; IT finds LTI; mobile not a trap | Timed scan test; nav count; mobile scroll map |
| **Persuasiveness of messaging** | Peak stack lands; claims exact; CTA clear; story not feature grid | Can a champion defend Davis + Makeover to a principal from the page alone? |

### 3.2 Other criteria Jared should weigh

1. **Zoho / CMS host fit** — Can output be ported without rewriting the interaction model?
2. **Accessibility (WCAG)** — Contrast, focus-visible, semantic headings, form labels; WCAG 2.0 AA / Sec 508 language only if approved.
3. **Mobile art direction** — Separate layouts; no horizontal overflow; CTA thumb-reachable.
4. **Performance** — Video scrub / heavy JS vs Lighthouse; IT-minded buyers punish slow pages.
5. **Reduced motion** — Peak readable with `prefers-reduced-motion`; no essential content only in motion.
6. **Claim provenance** — Skill must refuse to invent; bind to SOURCE.md.
7. **Uniqueness / fingerprint vs AI-slop** — Grammar + signature move + bans beat “make it unique.”
8. **Maintainability** — Marketing can change copy without an agent; Zoho sections/CMS fields beat opaque one-file engines.
9. **SEO** — Real H1, title/meta, sitemap, crawlable text (not canvas-only stories).
10. **Form / CTA wiring** — Zoho CRM webforms, Zoho Forms, Bookings, schedule-jared; iframe embeds already used for CRM share pages.
11. **Brand tokens** — Palette / type / spacing encoded so Fable and Cursor don’t drift.
12. **LTI / product honesty** — Marketing site can *show* Canvas chrome and link IT path; it is not an LTI tool host. Don’t pretend iframe demo = Canvas LTI install.
13. **Harness fit** — Skill must work with Cursor Cloud Agent default (repo skills), Fable when expressly asked.
14. **Cost / ops** — kie.ai asset pipelines, video encodes, Playwright shoots — optional for Zoho-static pages.
15. **Team portability** — `.agents/skills` in git > personal Cursor-only skills.

### 3.3 Decision rule

Score each candidate skill 1–5 on: **Aesthetics · Nav · Persuasion · Zoho-fit · Claims safety · Maintainability**.  
Reject any skill that scores ≤2 on Zoho-fit **or** Claims safety, regardless of aesthetics.

---

## 4. Zoho Sites / Zoho CMS hosting limits that constrain skills

**Open decision [?]:** Jared has not locked Zoho Sites vs Zoho CMS (`needs-from-jared.md` item 6). Below covers **Zoho Sites** (documented product for marketing sites in Zoho One) plus what local notes imply for staging.

### 4.1 What Zoho officially enables **[V~]**

From Zoho Sites feature pages and Zoho One guide ([features](https://www.zoho.com/sites/features/), [custom code](https://www.zoho.com/sites/features/custom-coded-websites.html), [building guide](https://www.zoho.com/one/guides/building-your-website.html)):

- Drag-and-drop **sections + elements** as the default authoring model
- **Custom HTML / CSS / JS** on paid plans; code snippets; template customization (HTML & CSS & JS)
- **Header & footer code** (site-wide) and **page-specific** header/footer code for trackers/widgets
- **Custom domain** + free SSL + hosting/CDN included (marketing claim; confirm plan in subscription)
- **Forms:** Zoho Sites forms, **Zoho CRM webforms**, Zoho Forms embeds, generic **iframe Embed** element
- Native ties to CRM, SalesIQ, Campaigns, Bookings, PageSense, etc.
- Custom templates via FACE language + `template.conf` registering stylesheets/javascripts ([template docs](https://documentation.zohosites.com/template.html?src=ft), [template.conf](https://help.zohosites.com/template-conf))
- Blogging / page management / SEO tools / 301 redirects (plan-dependent)

### 4.2 Practical constraints that kill “full scroll-craft” ports

These are the constraints that matter for skill choice — mix of vendor docs, community evidence, and Delphinium local practice:

| Area | Constraint | Impact on AI skills |
|---|---|---|
| **Runtime** | Sites is not a Node/React host; you publish builder content or custom FACE templates, not Next.js | Ban shadcn/v0/Lovable as production SoT |
| **Custom JS reliability** | Community reports: HTML/CSS often load; **complex animation JS (e.g. GSAP) fails** unless registered carefully in template files / load order ([Zoho community thread](https://help.zoho.com/portal/en/community/topic/adding-javascript)) | Skills that assume free rein ScrollTrigger/pin scrubbing are high risk |
| **Interaction budget** | Snippets + template JS work best for modest enhancements; not for multi-pin cinematic engines | Prefer CSS transitions, light IntersectionObserver, optional short muted video — not scrollcraft.js as SoT |
| **Section model** | Marketing edits happen in sections/elements | Skills should output **section-shaped HTML** + CSS tokens, not one opaque SPA |
| **Video / scrub** | Possible via embed/video elements; frame-accurate scrub + pinned acts are fragile under builder chrome | Makeover: CSS before/after or range-input scrub > video timeline scrub |
| **Forms / CTA** | Use CRM webform / Bookings / schedule URL — Delphinium already wraps Zoho CRM embeds because hosted WebFormServeServlet URLs were unavailable ([forms README](../share/forms-pages/README.md)) | Skill must specify embed wiring, not invent form backends |
| **LTI on marketing site** | LTI is a Canvas product concern; marketing site can only **document / screenshot / embed demos** | Do not ask skills for “LTI embed on homepage” as if Sites were Canvas |
| **Code injection surface** | Header/footer + snippets + template JS — not arbitrary server handlers | No serverless on Sites; no product APIs from the marketing page |
| **Zoho One site licensing** | Guide notes One includes limited live licensed sites (e.g. 1 live site / 10 employee licenses, up to 5 websites — verify current entitlement) | Staging vs live needs an explicit plan |
| **Export / lock-in** | Marketing claims data export; not a substitute for keeping a git draft SoT | Keep GitHub draft as design SoT; Zoho as publish target |

### 4.3 Local Delphinium implications **[V]**

- Draft SoT today: GitHub Pages preview (`japomani` / `ProjectDelphinium` homepage-fable-preview), HubSpot still live until cutover OK.
- Staging path: Web Design ports to **Zoho Sites/CMS staging/preview only** after Jared says “stage this.”
- Forms path already Zoho-shaped (CRM embeds).
- Therefore: **prototype freely; design for port.** Any skill that cannot describe a Zoho port plan is incomplete.

---

## 5. Honest assessment: scroll-craft vs alternatives (Zoho marketing site)

### 5.1 What scroll-craft is excellent at **[V]**

Path: `/workspace/scroll-craft/plugins/nateherk-design/skills/scroll-craft/`

Strengths aligned with Jared’s three priorities:

- **Aesthetics / craft floor** — typography, spacing, colour roles, depth tools, photographic-world rules, bans on clay diorama defaults (`taste.md`, `worlds.md`).
- **Persuasion structure** — feeling curve, one engineered peak, journey-before-sections, peak-end discipline (`feel.md`).
- **Uniqueness** — eight grammars, signature move, fingerprint gate vs prior builds (`uniqueness.md`, local `FINGERPRINTS.md`).
- **Mobile + reduced motion + verify** — explicit shoot scripts for desktop/mobile/reduced-motion (`verify.md`).
- **Anti-slop culture** — exactly the template tells Delphinium HANDOFF already bans.

Delphinium already used it productively for BRIEF/SCORE/fingerprint thinking (Split stage + Makeover signature).

### 5.2 Where scroll-craft is the wrong production skill for Zoho

| Issue | Detail |
|---|---|
| **Engine coupling** | Ships `scrollcraft.js` / `scrollcraft.css` driven by `data-sc-*` acts (pin, scrub, pan, etc.). That is a mini framework, not Zoho sections. |
| **Host assumption** | Optimized for a real HTML page on a static host (local ports, GH Pages) with Playwright verification — matches current *draft* path, not Zoho builder. |
| **Motion budget** | Multi-pin cinematic scores + video scrub are exactly the JS class Zoho users struggle to stabilize. |
| **Asset pipeline** | kie.ai generation + encode.sh is optional power — overkill and off-brand if authentic Canvas UI is the rule. |
| **Maintainability** | Marketing cannot safely edit a scroll-score page inside Zoho the way they can edit sections. |
| **Jared’s doubt** | Correct for *production*. scroll-craft is a **prototype craft coach**, not a Zoho publisher. |

### 5.3 Alternatives, scored for Delphinium + Zoho

| Approach | Aesthetics | Nav | Persuasion | Zoho-fit | Verdict |
|---|---|---|---|---|---|
| Full scroll-craft + engine on Zoho | 5 | 4 | 5 | **1–2** | Reject as ship path |
| scroll-craft **method only** (BRIEF/feel/fingerprint) + Zoho-safe build | 4–5 | 4–5 | 5 | **4–5** | **Recommended hybrid** |
| Custom `delphinium-marketing` skill alone | 3→5 with tokens | 5 | 5 | 5 | **Required core** |
| shadcn + Next + Cloud Agent | 4 | 4 | 3–4 | **1** | Draft lab only |
| v0 / Lovable | 3–4 | 3 | 2–3 | **1** | Throwaway |
| Framer AI / Webflow AI | 5 | 4 | 4 | **0** (wrong host) | Moodboard only |
| Zoho builder + weak prompts | 2 | 3 | 2 | 5 | How AI-slop happens |
| Fable 5.1 + brand skill + Zoho port checklist | 4–5 | 5 | 5 | 5 | **Production default** |

### 5.4 Bottom line on scroll-craft

Keep scroll-craft’s **brain** (interview topics, feeling curve, peak, fingerprint, anti-template, verify).  
Do **not** keep scroll-craft’s **body** (engine-first multi-device scroll theater) as the Zoho deliverable.

Jared’s instinct that “this might not be the best skill” is right **if** the skill is treated as the production stack. It is still one of the best **design-thinking** skills available for marketing pages — extract and rehome it.

---

## 6. Concrete recommendation — skill stack + prompting changes

### 6.1 Recommended skill stack (Zoho + Fable 5.1)

**A. Required — author `delphinium-marketing` (Agent Skill)**  
Location: homepage draft repo `.agents/skills/delphinium-marketing/SKILL.md` (also mirror under `delphinium-os` if useful).

Must include:
- Position / peak stack / sell-first hero
- SOURCE.md claims ceiling + 31% rule + hard nos
- Buyer IA + CTA → schedule-jared
- Brand tokens + anti-slop bans
- **Zoho port contract** (section-shaped HTML, CSS tokens, light JS, embed map for CRM/Bookings, no React)
- Accessibility + reduced-motion + mobile composition checklist
- Pointers to canonical BRIEF/SOURCE files

**B. Optional method pack — `delphinium-scroll-brief` (thin skill)**  
Steal from scroll-craft without the engine:
- Eight-topic brief
- Feeling curve + one peak
- Fingerprint dimensions (grammar/nav/hero/act shape/close/signature) adapted to **Zoho-safe signature moves** (e.g. Makeover CSS scrub, not worldflight video)

Either keep scroll-craft installed for lab prototypes on GH Pages, or delete engine usage from production prompts. Do not let Cloud Agent default to “build a scroll-craft page” when the publish target is Zoho.

**C. Verification skill — Playwright / screenshot gate**  
Desktop + mobile + reduced-motion; contrast sanity. scroll-craft’s verify mindset is right; implement host-agnostically.

**D. Explicitly do not install as production dependencies**
- shadcn skill/MCP (unless a separate React lab)
- Framer/Webflow as SoT
- v0/Lovable as SoT
- Full scroll-craft engine on Zoho

**E. Harness (unchanged standing rules)**
- Day-to-day / autonomous iteration: **Cursor Cloud Agent** on homepage-fable-preview
- Design generation: **Fable 5.1** when Jared expressly asks Web Design for Claude/Fable
- Publish: human/Web Design Zoho staging after lock — not the agent

### 6.2 What to change about prompting (actionable)

| Change | From | To |
|---|---|---|
| Host awareness | “Build a premium scroll page” | “Build a Zoho-port-ready marketing page; list which interactions degrade on Sites” |
| Skill invocation | scroll-craft as default builder | `delphinium-marketing` always; scroll-brief method optional |
| Hero | Problem film / recognition first (failed once) | Sell first: headline + 3-min + Davis rule + CTA |
| Signature move | Engine-heavy scrub/pin | Makeover before/after that works as CSS/range input + static fallback |
| Claims | Model improvises | SOURCE-only; omit > invent |
| Sectioning | One long cinematic HTML | Named sections Marketing can remap in Zoho |
| Motion | Variety of devices for its own sake | Motion only when it teaches Makeover / proof / how |
| Nav | Divider-as-chrome experiments OK in lab | Predictable product chrome + Book CTA for Zoho |
| QA | Visual vibe check | Timed 3-minute buyer scan + mobile + reduced-motion shots |
| CTA/forms | Generic “contact form” | schedule-jared + Zoho CRM/Bookings embed instructions |

### 6.3 Suggested Zoho-safe signature moves (examples)

These preserve persuasiveness without scroll-craft engine dependency:

1. **Makeover compare** — labelled demo before/after with slider; static stacked images under reduced motion.
2. **Davis proof block** — methodology-visible numbers that “lock” on scroll into view once (CSS), not a counter theater.
3. **Canvas chrome → Delphinium layer** — CSS UI mock showing enhancement, not rip-and-replace.
4. **Control Tower quiet → message** — short stepped reveal, not multi-vh pin sequence.

### 6.4 Implementation order (next concrete steps)

1. Write `delphinium-marketing` SKILL.md into the homepage draft repo (Cloud Agent–visible).
2. Add a one-page **Zoho port checklist** to HANDOFF (snippets vs custom template; form embeds; domain/SSL; staging site license).
3. Decide Sites vs CMS **[?]**.
4. Rebuild homepage draft with Fable/Cursor under the new skill — keep Makeover peak, drop engine-required acts.
5. Stage on Zoho preview; only then discuss HubSpot cutover.

---

## 7. Sources

### Web (accessed 2026-09-09)

- [Cursor — Agent Skills](https://cursor.com/docs/skills)
- [Agent Skills specification (raw)](https://raw.githubusercontent.com/agentskills/agentskills/refs/heads/main/docs/specification.mdx)
- [OpenAI Codex — Agent Skills](https://developers.openai.com/codex/skills)
- [agentskills.io](https://agentskills.io)
- [shadcn/ui — Skills](https://ui.shadcn.com/docs/skills) · [MCP](https://ui.shadcn.com/docs/mcp)
- [Zoho Sites — Features](https://www.zoho.com/sites/features/)
- [Zoho Sites — Custom coded websites](https://www.zoho.com/sites/features/custom-coded-websites.html)
- [Zoho Sites template documentation](https://documentation.zohosites.com/template.html?src=ft)
- [Zoho Sites — template.conf](https://help.zohosites.com/template-conf)
- [Zoho One — Building your website](https://www.zoho.com/one/guides/building-your-website.html)
- [Zoho community — Adding Javascript](https://help.zoho.com/portal/en/community/topic/adding-javascript)
- [Framer vs Lovable](https://www.framer.com/compare/framer-vs-lovable)
- [Best AI website builders 2026 — Cut The SaaS](https://cut-the-saas.com/the-cut/best-ai-website-builders)
- [Webflow AI vs v0/Lovable — Working Ref](https://www.working-ref.com/en/reference/webflow-ai-site-builder-vs-v0-lovable-2026)
- Prior Arena citations live in `/workspace/claude-packets/marketing/web-ai-stack-research-2026-09-09/out.md` (do not treat Elo as timeless)

### Local

- `/workspace/web-ai-scratchpad-findings.md`
- `/workspace/claude-packets/marketing/web-ai-stack-research-2026-09-09/out.md`
- `/workspace/scroll-craft/` (README, SKILL.md, uniqueness/verify/taste)
- `/workspace/delphinium-os/web-design/` (BRIEF, HANDOFF, FINGERPRINTS, buyer research, forms notes)

---

## TLDR recommendation

**Do not use full scroll-craft as the Zoho production skill.** Keep its briefing / peak / anti-slop / verify *methods*, but ship through a new repo-local **`delphinium-marketing` Agent Skill** that encodes SOURCE claims, sell-first hero, peak stack, brand tokens, and a **Zoho-safe interaction budget** (CSS Makeover scrub + light JS + CRM/Bookings embeds — no scrollcraft.js engine).

**Model/harness:** keep **Fable 5.1** for design generation (when expressly asked) and **Cursor Cloud Agent** for draft iteration on GitHub; port manually to Zoho staging after lock.

**Prompting change that matters most:** every prompt must include (1) sell-first viewport, (2) SOURCE ceiling, (3) Zoho port constraints, (4) one CTA, (5) mobile + reduced-motion acceptance — not “make a premium scroll experience.”

**Skip for production:** shadcn/v0/Lovable/Framer/Webflow as source of truth (wrong host or wrong runtime under the Zoho lock-in).

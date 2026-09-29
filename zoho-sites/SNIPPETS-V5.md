# Zoho Sites paste notes: Homepage Sites v5

**Source file:** `zoho-sites/homepage-sites-v5.html` (one self-contained file: inline CSS, one small inline script, no external JS libraries)
**Brief:** `design-loop/2026-09-24/BRIEF-V5.md` · **Current pack:** zoho-ready Sites staging pack (case section restored; not the older light-revise kicker-only cut)
**Baseline:** Sites v2 (`cursor/homepage-sites-v2-craft-ca52`). v3/v4 fan-cut experiments are not carried forward.
**Claims ceiling:** `context/SOURCE.md`
**Primary CTA (every Schedule link, 6 total, all open the Bookings modal):** https://jared-delphi-me.zohobookings.com/4937208000000036014
**Staging target:** https://delphinium-marketing-staging.zohosites.com (Web Design publishes after Jared OKs the PR; HubSpot, DNS, production untouched)

## 0. Zoho procedure (2026-09-28 verified pack)

Build from source. Do not publish from this repo. HubSpot, DNS, and production Zoho stay untouched.

```bash
python3 tools/zoho/build_zoho_pack.py
```

| Output | Paste into | Cap |
|---|---|---|
| `zoho-sites/dist/homepage-sites-v5.zoho-ready.html` | Not pasted. This is the zoho-ready document the split is built from. It matches the pack verified on staging (2026-09-28). | |
| `zoho-sites/dist/homepage-sites-v5.zoho-header.html` | **Header Code** | 44,900 chars |
| `zoho-sites/dist/homepage-sites-v5.zoho-footer.html` | **Footer Code** | 44,900 chars |
| `zoho-sites/dist/homepage-sites-v5.zoho-custom.css` | **Custom CSS** | Save once |
| `zoho-sites/dist/asset-manifest.json` | Reference. Old URL to `/dl28-…` on the Zoho document root. | |

**Header Code** is `<title>` and the meta description, the head links (logo preload, Bookings, YouTube, `embed.js`), a small script that resets the title and description after Zoho's theme, favicon links, the neutralizer script, then markup from `.dl-top` through `</main>`, plus the `#dl-modal` video modal. The legacy Home snippet also has `id=dl-modal`, so ours has to come first in the DOM. Research, contact, and book modals stay in the footer.

**Footer Code** is `footer.dl-footer`, the research / contact / book modals, and the inline script minified with `terser -c -m`. Bookings stays on portal-embed (`…/portal-embed#/4937208000000036014`). There is no Bookings URL parameter that hides the service card.

**Custom CSS**, saved once: `tools/zoho/zoho-chrome-hide.css` (soft-chrome hide already on staging), then `tools/zoho/safety-reset.css` (low-specificity `vertical-align: baseline` on our images, buttons, and links; no `!important`, so page rules still win), then the self-hosted `@font-face` block, then the page `<style>`, including the Bookings clip. The box saw the CSS doubled when CodeMirror `setValue` and the textarea sync both fired. Paste with one write.

**`&#32;`:** after comments are removed and markup is dedented, every whitespace-only run between tags (outside `script`, `style`, `textarea`, and `pre`) is replaced with `&#32;`. Zoho strips inter-tag whitespace, which turned "would YOU rather" into "wouldYOUrather". `&#32;` survives Zoho.

**Neutralizer** (in Header Code, before `.dl-top`): the legacy Home snippet's inline `<style>` loads after `zs-customcss.css` and was the root of the layout bugs (2-column Hidden costs, lost section backgrounds, 12.5px eyebrows, Watch pills with no border, and the rest of the 2026-09-28 diff). The script disables theme stylesheets (`/template/`, `zsite-core`, `webfonts.zoho`, `fonts.googleapis`) and, with a MutationObserver plus a DOMContentLoaded sweep, neuters `style` / `script` / `img` / `source` / `video` / `iframe` / `link` nodes inside `.theme-content-area`, `.zpcontent-container`, and `[data-element-type]`.

**Assets:** every `assets/…`, `mewalogo.gif`, `raw.githubusercontent.com`, and `delphi-me.com/hs-fs/hubfs` URL is rewritten to a root-relative `/dl28-<basename>`. Google Fonts `<link>`s are removed. The font files are the `/dl28-font-*.woff2` faces already on Zoho. Favicon links: `/dl28-favicon.svg` (svg icon), `/dl28-favicon.png` (32×32 icon and apple touch icon). Source copies live in `zoho-sites/assets/favicon/` (from serverless `8daf637`: `stacks/theme/assets/images/favicon.svg` and `stacks/react-admin/public/favicon.png`).

**Bookings clip** (in the page CSS, pack only): the cross-origin portal-embed shows a service card (SC tile / jared_delphi-me / 1 hr) from y=30 to y=214. "Select date and time" starts at 238, same at 1440, 1024, and 390. The clip hides that card:

```css
.dl-modal--book #dl-book-frame { overflow: hidden; }
.dl-modal--book #dl-book-frame iframe { top: -222px; bottom: auto; height: calc(100% + 222px); }
```

**Contact modal:** a real `<form method="POST">` to `https://crm.zoho.com/crm/WebToContactForm` (not fetch, not Web-to-Case). Hidden fields stay `xnQsjsdp`, `zc_gad`, `xmIwtLD`, `actionType`, `returnURL`, `CONTACTCF3` (`Website Contact Us (staging)`), and honeypot `aG9uZXlwb3Q` (empty). The captcha image is Zoho's CaptchaServlet, with Reload and `enterdigest`. A valid submit navigates the page. Zoho sends people back to `returnURL`, and `?contact=thanks` opens the thank-you state. An iframe cannot tell a captcha failure from success, so the form does not post into one. Production cutover: in `zoho-sites/homepage-sites-v5.html`, change `CONTACT_SITE_ORIGIN` and the `returnURL` host from `https://delphinium-marketing-staging.zohosites.com` to `https://delphi-me.com`, and update `CONTACTCF3` if CRM issues a production source value. Then rebuild.

**Watch pills:** local `.dl-link:hover` stays cyan fill, navy-deep text, cyan border. The pack strips the native `title` attribute on `a[data-youtube]` and `a[data-mux]` so the browser tooltip does not repeat the visible label. `data-title` stays (the modal uses it). That strip is pack-only until Jared asks for it in source.

**Close punch:** source now reads `Your school already runs on Canvas,` (trailing comma). Jared, 2026-09-28.

**Flag, do not edit:** the hero lead still says "courses you already teach in into". That typo is intentional until Jared changes the copy. The build script prints the flag and leaves the words alone.

**Flag, Mewa:** `mewalogo.gif` is rewritten to `/dl28-mewalogo.gif` so the image loads, and it is still not in the approved source list (`context/SOURCE.md`). Keep it as Jared has it. Do not add a new customer claim around it.

Section 2 below is the older single-snippet paste. Use this section for the current staging pack.

## 1. Before you paste: make the images absolute

The HTML uses relative paths (`assets/...`) so the GitHub Pages preview works. Zoho cannot resolve those. On a copy of the file, find `"assets/` and replace with one of:

| Option | Replace `"assets/` with |
|---|---|
| **A. Zoho gallery (preferred for production)** | Upload the files below to the Sites image gallery and replace each `src` with its Zoho URL. |
| **B. GitHub Pages (after merge to `main`)** | `"https://projectdelphinium.github.io/homepage-fable-preview/zoho-sites/assets/` |
| **C. Raw GitHub (staging, works before merge)** | `"https://raw.githubusercontent.com/ProjectDelphinium/homepage-fable-preview/<commit-sha>/zoho-sites/assets/` (use the PR head commit SHA so the URLs never move) |

Only match `"assets/` with the leading quote. The Bookings script URL (`bookings.nimbuspop.com/assets/embed.js`) must not change.

| File | Used for | Size (px) |
|---|---|---|
| `from-hied-hires-2026-09-24/delphinium-logo.svg` | Nav + footer logo (official mark, no subtitle) and the `<head>` preload | 211×150 |
| `from-hied-hires-2026-09-24/makeover-before-canvas-hires.png` | Makeover left side: Canvas module list only (cropped; no nested pill/chrome from the handout). | 747×762 |
| `from-hied-hires-2026-09-24/makeover-after-delphinium-hires.png` | Makeover right side: Canvas + Delphinium course home | 1847×1575 |
| `from-hied-hires-2026-09-24/control-tower-roster-hires.png` | Core / Control Tower main shot | 2453×1619 |
| `from-hied-hires-2026-09-24/control-tower-student-detail-hires.png` | Core floating card: student detail | 2305×2064 |
| `from-hied-hires-2026-09-24/engagement-widgets-hires.png` | Engagement Builder strip (tablet and desktop) | 3879×1265 |
| `from-prospectus-2026-09-24/engagement-widgets-left.png` | Engagement Builder, mobile top half | 1176×639 |
| `from-prospectus-2026-09-24/engagement-widgets-right.png` | Engagement Builder, mobile bottom half | 1183×639 |
| `from-hied-handout-2026-09-24/portrait-instructor-square.jpg` | Face next to the "take charge of their own learning" quotes, after Engagement Builder. Owned stock from the HiEd handout. Never in the hero. | 900×900 |
| `from-hied-hires-2026-09-24/message-center-schedule-hires.png` | Community Builder main shot: Message Center schedule | 2194×1400 |
| `from-hied-hires-2026-09-24/community-builder-create-message-hires.png` | Community Builder floating card: message composer | 2131×2021 |

`from-hied-handout-2026-09-24/hero-portrait-instructor-original.png` is the uncropped source (2501×929) and is not referenced by the page.

## 2. Recommended port

The 2026-09-28 staging pack uses section 0 (Header Code, Footer Code, Custom CSS), not the single snippet below. The steps here are the older fallback.

1. Create a blank homepage (or one full-width **Code Snippet / Custom HTML** section). Set the section to **full width** and **zero padding**.
2. Paste the edited file contents (the `<style>` block, then `<div class="dl-top">` through the closing `</script>`) into that snippet. Pasting the full document also works; Zoho strips the outer `<html>/<head>/<body>`.
3. Delete leftover theme sections (CyberDesk, "moon", "Endless Security") in the editor. Do not rely on CSS hiding for production SEO.
4. Preview on the published/preview URL, not only inside the Sites canvas. Scripts and iframes may not run in-editor.

### Optional split (closer to native Sites)

| Destination | What to paste |
|---|---|
| **Header Code** | The Google Fonts `preconnect` + stylesheet links, the logo `preload`, and the Bookings `preconnect` / `dns-prefetch` links + `embed.js` script from `<head>`. |
| **Custom CSS** | Everything inside the `<style>` block. |
| **Code Snippet body** | From `<div class="dl-top">` through both modals (`#dl-book-modal`, `#dl-modal`) and the `<script>` at the bottom. |
| **Native header (future)** | If Web Design ships a native Zoho header, delete the `.dl-top` block from the snippet and point one **Schedule a demo** button in the native header at the Bookings URL. |

**Bookings modal:** every Schedule link has `data-bookings-open`. The script preloads the Bookings portal-embed iframe on idle and opens it in `#dl-book-modal` on click. Without JS, the links go straight to the Bookings page.

**Chrome:** no yellow DRAFT strip and no hero eyebrow. This follows the Zoho staging convention Jared accepted on the zoho-ready pack.

## 3. Zoho badge

Do **not** add CSS or JS to hide the "Made with Zoho Sites" credit. Web Design removes the credit in **Sites plan settings** (Jared has the full license). The footer keeps `5.5rem` bottom padding so the badge never covers links until then. There is **no bottom sticky CTA** anywhere on the page.

## 4. Video (live delphi-me media, public Mux streams)

Every video opens in one lightweight modal that loads the Mux player iframe on click (`https://player.mux.com/<playbackId>?autoplay=true&accent-color=%23c7007a`). No player script loads until someone clicks. Without JS, each trigger links straight to the Mux MP4.

**No durations in the UI (Jared 2026-09-24):** video text links, card overlays, and aria-labels do not show run times. The lengths below are reference only. The `?time=3` on the sizzle poster is a thumbnail frame pick, not a label.

| Where on page | Title (as on delphi-me.com) | Length (ref only) | Mux playback ID | Poster |
|---|---|---|---|---|
| Hero link + Videos feature | K12 Sizzle Reel With Title Card | 3:29 | `LoTwl8xXgp9g14ewgXHaehN71e200PFdg5wKCE00TTJkI` | `https://image.mux.com/LoTwl8xXgp9g14ewgXHaehN71e200PFdg5wKCE00TTJkI/thumbnail.jpg?time=3&width=1280` |
| Videos card | Digital Learning and Curriculum Directors (Dr. Ryan Hansen) | 5:42 | `32SFE7z1kEHl4JU01lvaXzTMg01kxeKQt4TeHQEjh4Fb8` | `https://delphi-me.com/hs-fs/hubfs/directorthumb.png?width=960&name=directorthumb.png` |
| Videos card | Teachers and Instructional Coaches (Natalie Niederhauser) | 5:52 | `qHMrqxfysc8NPiOTXwvqkbrZk7iEWdHpK00i36GbmBRo` | `https://delphi-me.com/hs-fs/hubfs/teacherthumb.png?width=960&name=teacherthumb.png` |
| Core product link | Data with Title Card | 3:59 | `bVXbIyK200RWbCuLWzSFX102TIn4HekyW4XZfV01L01FyaA` | (text link) |
| Makeover + Engagement Builder links | Gamification with Title Card | 5:22 | `tKbhHrk01Yk89aFYU02CJbJqa002qUZWyNLhuNcuyDUMyY` | (text link) |
| Community Builder link | Communication with Title Card | 6:18 | `CG9AfH1Ohcx4Tgz6juR4uFAUDFspppNF1kfrJCxWlk00` | (text link) |

Stream-to-title mapping was confirmed from the `VideoObject` JSON-LD on https://delphi-me.com/ (2026-09-24) and Mux frame grabs. The director and teacher posters are the live site's own video CTA thumbnails (real people, not `AI-Generated Media/`).

**Before HubSpot cutover:** the two `delphi-me.com/hs-fs/hubfs/...` posters are served by HubSpot. Re-host them in the Zoho gallery before HubSpot is turned off. Mux URLs are independent of HubSpot.

## 5. Page map (zoho-ready pack, 2026-09-24)

1. **Hero / cover:** Canvas delivers content. Delphinium delivers engagement. Cover line **"Cut failures, up to" / 31%**. Schedule a demo + K-12 video. Text only, no face. Close punch: "Your school already runs on Canvas," (comma).
2. **Case for engagement (restored):** H2 uses plain weight on the first clause — `<span class="dl-h2__plain">Education moved online,</span>` (comma, not period) then *Engagement* didn't follow. Lede includes **"teachers can read the room"**.
3. **Makeover peak:** "Which class would YOU rather take?" with before/after. Stages use `align-items: start`. Before image is Canvas-only hires crop (`module-only-20260924b` cache-bust). Desktop side by side; mobile Canvas / Canvas + Delphinium toggle.
4. **Proof:** Davis Connect **31%** with full study context, 72% motivating, "Fun.", Netflix quote, Tiffany Dance.
5. **Mid-page ask:** Schedule a demo (Sites Bookings modal + portal-embed — not Zoho Button/Link widgets).
6. **Product:** Core / Engagement Builder / face + handout quotes / Community Builder with families callout.
7. **How it works (trust strip):** Canvas LTI 1.3 / FERPA / alias leaderboards / Chromebook chips.
8. **Videos:** modal titles via `videoLabel(el)` match the button labels. No durations in the UI.
9. **Close:** Schedule a demo. Then a quiet Higher Ed Online band.

**Locked setup line (Jared 2026-09-24):** "Go live in less than 3 minutes. Keep Canvas, enhance with Delphinium." Used verbatim where present. Do not reintroduce "about three minutes" wording.

**Supersedes light-revise kicker-only story:** the standalone Case section is **back** (not collapsed to a Makeover kicker). Schedule stays Sites modal + portal-embed.

**HE twin site (later, not built):** K-12 staging is the current path. A Higher Ed audience twin (an audience switch like delphi-me.com's top choice, different videos and stats, no parents on HE) is a later IA item.

## 6. Verify before Jared share

- [ ] All 6 **Schedule a demo** links go to the Bookings URL above and open the modal. Escape and the backdrop close it.
- [ ] Hero/cover says **Cut failures, up to** / **31%** (promise). Exact **31%** only in the Davis Connect card with 72 classes / 6,000 students / same courses, teachers, content.
- [ ] Case section present: H2 plain clause "Education moved online," (comma) and lede "teachers can read the room".
- [ ] Video modal titles come from `videoLabel(el)` matching the button labels; no durations in UI or aria-labels.
- [ ] Schedule CTAs use Sites Bookings modal + portal-embed (`data-bookings-open`), not Zoho Button/Link widgets.
- [ ] No "Cut failures by up to 47%" or "Reduce absenteeism" on this K-12 page. 47% appears only in the quiet HE band as "as much as 47%".
- [ ] No BYU name, pricing, hold dates, go-live targets, or PDF-only numbers (attendance, NAEP, $229K, 26% vs 18%, 125,000 enrollments, 100 languages).
- [ ] No em dashes in visible copy. Niederhauser / Dance spelled correctly. Never "UC Davis".
- [ ] No AI faces, no logo wall, no invented quotes. Named quotes are attributed in `context/delphinium-marketing-synthesis.md`. The three "Students say / Teachers say" lines are the HiEd handout's own lines, used without attribution per Jared 2026-09-24 (not yet in `context/SOURCE.md`).
- [ ] Portrait appears only in the product section, never in the hero.
- [ ] Setup copy is the locked line ("Go live in less than 3 minutes. Keep Canvas, enhance with Delphinium.") with no leftover "about three minutes".
- [ ] Images load (absolute URLs, section 1). Each video opens and plays in the modal; Escape and the backdrop close it.
- [ ] No Zoho badge hiding code. No bottom sticky bar. No agent or model stamps in the HTML.

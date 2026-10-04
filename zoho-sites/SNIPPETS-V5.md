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
| `zoho-sites/dist/homepage-sites-v5.zoho-ready.html` | Not pasted. This is the zoho-ready document the split is built from. Rebuild it from `homepage-sites-v5.html` after `962c89f`. It is not the older 2026-09-28 byte pack. | |
| `zoho-sites/dist/homepage-sites-v5.zoho-header.html` | **Header Code** | 44,900 chars |
| `zoho-sites/dist/homepage-sites-v5.zoho-footer.html` | **Footer Code** | 44,900 chars |
| `zoho-sites/dist/homepage-sites-v5.zoho-custom.css` | **Custom CSS** | Save once |
| `zoho-sites/dist/asset-manifest.json` | Reference. Old URL to `/dl28-…` on the Zoho document root. | |

**Header Code** is the `dl-seo` JSON-LD graph (Organization, WebSite, SoftwareApplication), Open Graph and Twitter image tags, the head links (logo preload, Bookings, YouTube, `embed.js`), favicon links, the neutralizer script, a path script, then the skip link and markup from `.dl-top` through the homepage `</main>`, plus the `#dl-modal` video modal. There is no sitewide `<title>`, `<meta name="description">`, or canonical in Header Code. The path script sets one title and one description per path, including `/highered`, and drops Zoho's skeletal `#schemagenerator` plus a `keywords` meta. Static per-page titles and descriptions for crawlers that do not run JS are the Zoho page SEO fields in `zoho-sites/SEO.md` (paste per page; Zoho writes each page's self canonical and `og:url`). The legacy Home snippet also has `id=dl-modal`, so ours has to come first in the DOM. Research, contact, and book modals stay in the footer. The skip link stays the first focusable control.

**Footer Code** is the `/contact-us` and `/support` bodies, then `footer.dl-footer`, the research / contact / book modals, and the inline scripts (Desk captcha, then the page script), minified with `terser -c -m`. Subpages sit in Footer Code because Header Code is already against the 44,900 cap. Bookings stays on portal-embed (`…/portal-embed#/4937208000000036014`). There is no Bookings URL parameter that hides the service card.

**Where to paste:** the three files stay **site-wide** (Header Code, Footer Code, Custom CSS). Do not paste a different copy per page. The path script shows the homepage body on `/`, `/home`, and the local preview filenames. Zoho has no `/home` page yet, so create one. The pack already treats `/home` as the homepage. `/contact-us` and `/support` show that page's body plus the shared nav and footer. `/eula` and `/purchase-agreement` show the shared nav and footer around Zoho's native page content. `/highered` shows the same homepage sections, with higher-ed copy swapped in. Any other path shows the nav and footer only. Zoho still needs pages at `/contact-us`, `/support`, `/eula`, `/purchase-agreement`, `/highered`, and `/home`. Leave theme content empty on `/contact-us`, `/support`, and `/highered`. The neutralizer strips scripts and images inside the theme content area on every path except `/eula` and `/purchase-agreement`, so the forms have to live in this pack, not in a page snippet.

**Custom CSS**, saved once: `tools/zoho/zoho-chrome-hide.css` (soft-chrome hide already on staging), then `tools/zoho/safety-reset.css` (low-specificity `vertical-align: baseline` on our images, buttons, and links; no `!important`, so page rules still win), then the self-hosted `@font-face` block, then the page `<style>`, including the Bookings header hide. The box saw the CSS doubled when CodeMirror `setValue` and the textarea sync both fired. Paste with one write.

**`&#32;`:** after comments are removed and markup is dedented, same-line whitespace between tags (outside `script`, `style`, `textarea`, and `pre`) is replaced with `&#32;`. Newline gaps between tags are removed so Header Code stays under 44,900. Zoho strips inter-tag whitespace, which turned "would YOU rather" into "wouldYOUrather". That phrase is same-line, so `&#32;` keeps it.

**Neutralizer** (in Header Code, before `.dl-top`): the legacy Home snippet's inline `<style>` loads after `zs-customcss.css` and was the root of the layout bugs (2-column Hidden costs, lost section backgrounds, 12.5px eyebrows, Watch pills with no border, and the rest of the 2026-09-28 diff). The script disables theme stylesheets (`/template/`, `zsite-core`, `webfonts.zoho`, `fonts.googleapis`) and, with a MutationObserver plus a DOMContentLoaded sweep, neuters `style` / `script` / `img` / `source` / `video` / `iframe` / `link` nodes inside `.theme-content-area`, `.zpcontent-container`, and `[data-element-type]`. On `/eula` and `/purchase-agreement` it still disables those theme stylesheets, and it does not strip the native page content. Paste the legal text into those two Zoho pages with the editor or API. Custom CSS shows that content as a document (about 760px, site fonts, headings, lists, and spacing) and still hides `.zpsection` on every other path.

**Assets:** every `assets/…`, `mewalogo.gif`, `raw.githubusercontent.com`, and `delphi-me.com/hs-fs/hubfs` URL is rewritten to a root-relative `/dl28-<basename>`. Google Fonts `<link>`s are removed. The font files are the `/dl28-font-*.woff2` faces already on Zoho. Favicon links: `/dl28-favicon.svg` (svg icon), `/dl28-favicon.png` (32×32 icon and apple touch icon). Source copies live in `zoho-sites/assets/favicon/` (from serverless `8daf637`: `stacks/theme/assets/images/favicon.svg` and `stacks/react-admin/public/favicon.png`).

**Bookings pane** (in the page `<style>` of `homepage-sites-v5.html`, so the local preview and the pack match): the portal-embed iframe fills `#dl-book-frame` with no negative offset, no scale, no white mask, no clip-path, and no SVG filter. The staff card (SC tile, title, name, duration) and the calendar stay in view the way the embed looks on its own. The close control sits on the booking pane, above the iframe. The closed modal still preloads as class `p` (6px strip, opacity 1, inert).

**Contact:** `/contact-us` is a real `<form method="POST">` to `https://crm.zoho.com/crm/WebToContactForm` (not fetch). One form node serves both that page and the homepage modal. In the HTML it already has the prod hidden fields: `xnQsjsdp` `bc4e45a0b137feef26eb42c2cc5c61705aaa909168b76d2dca36e445f83c7b1c`, `xmIwtLD` `81a68c833fac6c6528816e6bf9a3e73e7d04469082ce2586e6f669697acede2f32ab0fd04402050c0c676bc65227e2c9`, empty `zc_gad`, `actionType` `Q29udGFjdHM=`, `returnURL` `https://www.delphi-me.com/contact-us?contact=thanks`, `CONTACTCF3` `Website Contact Us`, and empty honeypot `aG9uZXlwb3Q`. Visible fields match the staging modal: First Name, Last Name, Email, Phone, Account Name labelled School or District, Title labelled Role, Description labelled Message, CONTACTCF9 labelled Canvas course URL, and `enterdigest` with CaptchaServlet. `?contact=thanks` shows the thank-you on `/contact-us`. The DOM id stays `webform3131408000003206001`. Zoho routes on the hidden values, not that id.

On any path other than `/contact-us`, the script moves that form into the modal. If `data-site-origin` is not `https://www.delphi-me.com`, it puts the staging ids back (`xnQsjsdp` `33c9e1be…`, `xmIwtLD` `c80403ce…`, `CONTACTCF3` `Website Contact Us (staging)`, return URL `data-site-origin` + `/?contact=thanks`). If `data-site-origin` is `https://www.delphi-me.com`, the modal keeps the prod values, including return URL `https://www.delphi-me.com/contact-us?contact=thanks`. Homepage `?contact=thanks` still opens the modal. It does not also open on `/contact-us`.

The footer Contact link is `/contact-us`. Support is `/support`. EULA and Purchase agreement are in the footer bottom. With JS, `data-site-path` links become `data-site-origin` plus the path. Production cutover is still `data-site-origin` set to `data-site-origin-production` (`https://www.delphi-me.com`) on `.dl-top`.

**Support:** `/support` is a real multipart POST to `https://desk.zoho.com/support/WebToCase`. Hidden fields: `xnQsjsdp` `edbsnd59c603a21cb9a686e70b29d1f759eb6`, `xmIwtLD` `edbsn9b4dd777b2c64d4edda94dd889b90b992928bb012fd1e45acb2a2c2a8710fd06`, empty `xJdfEaS`, `actionType` `Q2FzZXM=`, `returnURL` `https://www.delphi-me.com/support?ticket=thanks`. Fields: First Name, Contact Name (labelled Last Name, required), School Name, Email (required), Subject labelled Ticket short name (required), Course URL (required, N/A allowed), Description (required), `zsWebFormCaptchaWord`, and `attachment_1` through `attachment_5` (20 MB each, checked before submit). The captcha image is `#zsCaptchaSrc`. Desk's `GenerateCaptcha` response fills that image and `xJdfEaS`. The pack loads jQuery 3.5.1, the version Desk web forms shipped, then calls `jQuery.noConflict(true)` so Zoho's own jQuery stays in place. `js.zohostatic.com/support/app/js/jqueryandencoder.min.js` currently 404s, so the script src is `https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js`. `?ticket=thanks` shows the thank-you. Do not set `Referrer-Policy: no-referrer`.

**EULA and purchase agreement:** `/eula` and `/purchase-agreement` use the same nav and footer. The pack does not include the legal text. Paste it into each Zoho page natively. On those two paths the neutralizer leaves the theme content in place, and Custom CSS lays it out as the page body.

**Higher ed:** `/highered` reuses the homepage sections, nav, Bookings modal, and contact form. The nav link Higher ed is on every path. K-12-only blocks (hidden-cost stats, school logos, parent lines, the Davis Connect high school quote) stay hidden on that path. The hero and proof card use the Higher Ed Online figures from `context/SOURCE.md` (the Utah Valley University study: as much as 47% lower course failure, 64% fewer failures for part-time faculty, 67% fewer withdrawals, 65% fewer dropouts; the prospectus 68% withdrawal, 65% part-time faculty, and 66% dropout figures are superseded by Jared's 2026-09-29 corrections). There is no approved higher-ed client logo or named campus story in SOURCE, so none is shown.

**Watch pills:** local `.dl-link:hover` stays cyan fill, navy-deep text, cyan border. `title` and `data-title` stay as on `962c89f`. The pack does not strip them.

**Close punch:** source keeps `962c89f`: `Your school already runs on Canvas` with no trailing comma. The older pack's comma does not override that page.

**Grammar:** the hero lead is `courses you already teach into` (the extra "in" in "teach in into" was a clear error). The build prints a flag if that extra "in" comes back.

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

1. **Hero / cover:** Canvas delivers content. Delphinium delivers engagement. Cover line **"Cut fail-rate up to" / 31%** (Higher Ed uses the same line with **47%**). Schedule a demo + K-12 video. Text only, no face. Close punch: "Your school already runs on Canvas," (comma).
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
- [ ] Hero/cover says **Cut fail-rate up to** / **31%** on K-12 and **Cut fail-rate up to** / **47%** on `/highered` (promise). Exact **31%** only in the Davis Connect card with 72 classes / 6,000 students / same courses, teachers, content.
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

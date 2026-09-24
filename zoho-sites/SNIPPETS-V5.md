# Zoho Sites paste notes: Homepage Sites v5

**Source file:** `zoho-sites/homepage-sites-v5.html` (one self-contained file: inline CSS, one small inline script, no external JS libraries)
**Brief:** `design-loop/2026-09-24/BRIEF-V5.md`
**Baseline:** Sites v2 (`cursor/homepage-sites-v2-craft-ca52`). v3/v4 fan-cut experiments are not carried forward.
**Claims ceiling:** `context/SOURCE.md`
**Primary CTA (every Schedule button, 5 total):** https://jared-delphi-me.zohobookings.com/4937208000000036014
**Staging target:** https://delphinium-marketing-staging.zohosites.com (Web Design publishes after Jared OKs the PR; HubSpot, DNS, production untouched)

## 1. Before you paste: make the images absolute

The HTML uses relative paths (`assets/from-prospectus-2026-09-24/...`) so the GitHub Pages preview works. Zoho cannot resolve those. Do one find/replace on a copy of the file before pasting:

| Find | Replace with (pick one) |
|---|---|
| `assets/from-prospectus-2026-09-24/` | **A. Zoho gallery (preferred for production):** upload the 9 files below to the Sites image gallery and replace each `src` with its Zoho URL. |
| | **B. GitHub Pages (after this PR merges to `main`):** `https://projectdelphinium.github.io/homepage-fable-preview/zoho-sites/assets/from-prospectus-2026-09-24/` |
| | **C. Raw GitHub (staging only, works before merge):** `https://raw.githubusercontent.com/ProjectDelphinium/homepage-fable-preview/cursor/sites-v5-prospectus-5c51/zoho-sites/assets/from-prospectus-2026-09-24/` |

Files in `zoho-sites/assets/from-prospectus-2026-09-24/` (all lifted from Jared's prospectus PDF, product UI with sample data):

| File | Used for | Size (px) |
|---|---|---|
| `makeover-before-canvas.png` | Makeover left side: Canvas module list | 722×846 |
| `makeover-after-delphinium.png` | Makeover right side: Canvas + Delphinium course home | 996×860 |
| `control-tower-roster.png` | Core / Control Tower main shot | 1173×773 |
| `control-tower-student-detail.png` | Core floating card: student detail | 866×776 |
| `engagement-widgets.png` | Engagement Builder strip (tablet and desktop) | 2359×639 |
| `engagement-widgets-left.png` | Engagement Builder, mobile top half | 1176×639 |
| `engagement-widgets-right.png` | Engagement Builder, mobile bottom half | 1183×639 |
| `message-center.png` | Community Builder main shot: school-wide Message Center templates | 1626×1137 |
| `community-builder-create-message.png` | Community Builder floating card: message composer | 835×794 |
| `makeover-canvas-vs-delphinium.png` | Full composite, not referenced by the page. Keep for social/OG or a single-image fallback. | 2101×1113 |

## 2. Recommended port

1. Create a blank homepage (or one full-width **Code Snippet / Custom HTML** section). Set the section to **full width** and **zero padding**.
2. Paste the edited file contents (from `<div class="dl-top">` through the closing `</script>`, plus the `<style>` block) into that snippet. Pasting the full document also works; Zoho strips the outer `<html>/<head>/<body>`.
3. Delete leftover theme sections (CyberDesk, "moon", "Endless Security") in the editor. Do not rely on CSS hiding for production SEO.
4. Preview on the published/preview URL, not only inside the Sites canvas. Scripts and iframes may not run in-editor.

### Optional split (closer to native Sites)

| Destination | What to paste |
|---|---|
| **Header Code** | The two Google Fonts `preconnect` links, the Fonts stylesheet link, and the logo `preload` link from `<head>`. |
| **Custom CSS** | Everything inside the `<style>` block. |
| **Code Snippet body** | From `<div class="dl-top">` through the modal `</div>` and the `<script>` at the bottom. |
| **Native header (future)** | If Web Design ships a native Zoho header, delete the `.dl-top` block from the snippet and put one **Schedule a demo** button in the native header pointing at the Bookings URL. Keep the yellow DRAFT strip somewhere visible until Jared clears it. |

## 3. Zoho badge

Do **not** add CSS or JS to hide the "Made with Zoho Sites" credit (the v2 badge-hiding script was removed on purpose). Web Design removes the credit in **Sites plan settings** (Jared has the full license). The footer keeps `5.5rem` bottom padding so the badge never covers links until then. There is **no bottom sticky CTA** anywhere on the page.

## 4. Video (live delphi-me media, public Mux streams)

Every video opens in one lightweight modal that loads the Mux player iframe on click (`https://player.mux.com/<playbackId>?autoplay=true&accent-color=%23c7007a`). No player script loads until someone clicks. Without JS, each trigger links straight to the Mux MP4.

| Where on page | Title (as on delphi-me.com) | Length | Mux playback ID | Poster |
|---|---|---|---|---|
| Hero link + Videos feature | K12 Sizzle Reel With Title Card | 3:29 | `LoTwl8xXgp9g14ewgXHaehN71e200PFdg5wKCE00TTJkI` | `https://image.mux.com/LoTwl8xXgp9g14ewgXHaehN71e200PFdg5wKCE00TTJkI/thumbnail.jpg?time=3&width=1280` |
| Videos card | Digital Learning and Curriculum Directors (Dr. Ryan Hansen) | 5:42 | `32SFE7z1kEHl4JU01lvaXzTMg01kxeKQt4TeHQEjh4Fb8` | `https://delphi-me.com/hs-fs/hubfs/directorthumb.png?width=960&name=directorthumb.png` |
| Videos card | Teachers and Instructional Coaches (Natalie Niederhauser) | 5:52 | `qHMrqxfysc8NPiOTXwvqkbrZk7iEWdHpK00i36GbmBRo` | `https://delphi-me.com/hs-fs/hubfs/teacherthumb.png?width=960&name=teacherthumb.png` |
| Core product link | Data with Title Card | 3:59 | `bVXbIyK200RWbCuLWzSFX102TIn4HekyW4XZfV01L01FyaA` | (text link) |
| Makeover + Engagement Builder links | Gamification with Title Card | 5:22 | `tKbhHrk01Yk89aFYU02CJbJqa002qUZWyNLhuNcuyDUMyY` | (text link) |
| Community Builder link | Communication with Title Card | 6:18 | `CG9AfH1Ohcx4Tgz6juR4uFAUDFspppNF1kfrJCxWlk00` | (text link) |

Stream-to-title mapping was confirmed from the `VideoObject` JSON-LD on https://delphi-me.com/ (2026-09-24) and Mux frame grabs. The director and teacher posters are the live site's own video CTA thumbnails (real people, not `AI-Generated Media/`).

**Before HubSpot cutover:** the two `delphi-me.com/hs-fs/hubfs/...` posters and the logo (`delphi-me.com/hubfs/Delphinium%20Logo.png`) are served by HubSpot. Re-host them in the Zoho gallery before HubSpot is turned off. Mux URLs are independent of HubSpot.

## 5. Page map (prospectus arc)

1. **Hero:** Canvas delivers content. Delphinium delivers engagement. Promise uses **up to 31%**. Schedule a demo + K-12 video.
2. **Case for engagement:** education moved online, engagement didn't. Ryan Hansen "If you ask kids" quote (supporting).
3. **Makeover peak:** "Which class would YOU rather take?" with the real prospectus before/after. Desktop shows both side by side (Delphinium side slides in once). Mobile shows a Canvas / Canvas + Delphinium toggle that flips to Delphinium once on first view (skipped with reduced motion or if the visitor taps first).
4. **Proof:** Davis Connect **31%** with full study context, 72% motivating, "Fun.", Netflix quote, Tiffany Dance.
5. **Insight-poor bridge:** student / parent / teacher rows from the prospectus.
6. **What you get:** Core (Control Tower), Engagement Builder, Community Builder / Message Center. Families as a supporting callout.
7. **How it works:** built on science, about three minutes, zero learning curve.
8. **Videos:** K-12 sizzle, directors, teachers and coaches.
9. **Close:** Schedule a demo. Then a quiet Higher Ed Online line.

## 6. Verify before Jared share

- [ ] All 5 **Schedule a demo** links go to the Zohobookings URL above.
- [ ] Hero says **up to 31%**. Exact **31%** only in the Davis Connect card with 72 classes / 6,000 students / same courses, teachers, content.
- [ ] No BYU name, pricing, hold dates, go-live targets, or PDF-only numbers (attendance, NAEP, $229K, 26% vs 18%, 125,000 enrollments, 100 languages).
- [ ] No em dashes in visible copy. Niederhauser / Dance spelled correctly. Never "UC Davis".
- [ ] No AI faces, no logo wall, no invented testimonials. All quotes are attributed in `context/delphinium-marketing-synthesis.md`.
- [ ] Yellow DRAFT strip visible.
- [ ] Images load (absolute URLs, section 1). Each video opens and plays in the modal; Escape and the backdrop close it.
- [ ] No Zoho badge hiding code. No bottom sticky bar.

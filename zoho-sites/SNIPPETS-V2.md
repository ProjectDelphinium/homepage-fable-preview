# Zoho Sites paste notes — Homepage Sites v2

**Source file:** `zoho-sites/homepage-sites-v2.html` (self-contained HTML + inline CSS + JS)  
**Synthesis:** `design-loop/2026-09-23/SYNTHESIS-V2.md`  
**Claims ceiling:** `context/SOURCE.md`  
**Primary CTA (all buttons):** https://jared-delphi-me.zohobookings.com/4937208000000036014

## Recommended port (do not paste the whole page into Header Code)

1. **Create a blank homepage** (or a single full-width **Code Snippet / Custom HTML** section). Set the section to **full width** and **zero padding** in the Visual Editor so the Makeover stage can bleed edge to edge.
2. **Paste the entire contents** of `homepage-sites-v2.html` into that snippet (or split as below if Jared prefers native header).
3. **Delete** leftover CyberDesk / “moon” / “Endless Security” theme sections in the editor (do not rely on CSS hide alone for production SEO).
4. **Preview on the published/preview URL**, not only inside the Sites canvas (scripts and embeds may not run in-editor).

### Optional split (closer to long-term native Sites)

| Destination | What to paste |
|---|---|
| **Header Code** | Only the two Google Fonts `<link>` tags and the `<link rel="preload" as="image" …>` for the Delphinium logo from the file `<head>`. |
| **Custom CSS** | Everything inside the first `<style>` block in `<head>` (from `:root` through the mobile `@media` rules). Add the theme-debris block below if the template still renders under the snippet. |
| **Code Snippet body** | From `<div class="dl-draft">` through `</footer>`, plus the small `.visually-hidden` style block and the `<script>` at the bottom. |
| **Native sticky header** (future) | Upload `Delphinium Logo.png` at ~140px width, one **Schedule a demo** button → Bookings URL; remove the duplicate `.dl-nav` from the snippet when native header ships. |

## Custom CSS — hide residual theme chrome (staging only)

Paste into **Custom CSS** if the CyberDesk template still injects sections below your snippet:

```css
/* Staging: hide theme lorem blocks if they remain in the DOM. Still delete them in the editor for production. */
.zpsection-moon,
.zpsection-endless,
[class*="moon" i][class*="section" i],
[class*="endless" i][class*="security" i] {
  display: none !important;
}

/* Do NOT add a bottom sticky CTA — Zoho badge sits at bottom:0 with z-index 1e6 */
```

## v2 behavior checklist

- **Makeover Switch:** CSS gray Canvas module list (before) vs `datathumb.png` (after). One-time auto-reveal on first view unless `prefers-reduced-motion`. Manual range slider + Before/After buttons.
- **No** `engagethumb` / play-button stock hero. **No** bottom sticky bar. **Nav CTA stays visible on mobile.**
- **Palette:** warm paper `#fffdf6`, navy `#2b2f7e`, butter `#fbeab2`, CTA magenta `#C7007A`.
- **DRAFT** banner until Jared approves Zoho staging share.
- **Assets:** hotlinked from `delphi-me.com/hubfs/` (PR #4 local pack not on `main` yet). Swap to `assets/from-live-hubspot/2026-09-23/` paths after merge.

## Bookings close (optional next step)

The share URL cannot be raw-iframed (`X-Frame-Options: SAMEORIGIN`). For an inline calendar at the close, add the **native Zoho Bookings** element below the close copy and keep the magenta **Schedule a demo** button for mobile-first booking.

## Verify before Jared share

- [ ] All **Schedule a demo** links hit the Zohobookings URL above.
- [ ] Hero promise uses **up to 31%**; Davis block uses exact **31%** with study context.
- [ ] No em dashes in visible copy.
- [ ] No AI faces; logo strip is muted only.
- [ ] Makeover plays once, then respects drag/toggle.

# Website tracking (S1–S7), live 2026-11-09

`dl-track.js` (1,347 chars, minified) is inlined at the start of the footer's last `<script>`. It runs before the existing code strips `?contact=thanks`.

- **S1, `window.dlTrack(name)`:** sends a SalesIQ custom action through `$zoho.salesiq.visitor.customaction`, retrying until SalesIQ loads.
- **S2, first-touch capture:** records utm_source, utm_medium, utm_campaign, utm_content, landing page and referrer in `sessionStorage.dlU`.
- **S3, Bookings prefill:** builds `window.dlBP` = `?defaultParams=utm_source:..;utm_medium:..;utm_campaign:..;utm_content:..;landing_page:..;dl_audience:K-12|Higher Ed`. The Bookings iframe src appends it: `...portal-embed#/4937208000000036014"+(self.dlBP||"")`.
- **S4, events:**
  - demo_click: clicks on `[data-bookings-open]`
  - audience_switch: clicks on the audience toggle
  - contact_submit: page loads with `?contact=thanks`
  - video_play: YouTube playerState 1
- **S5, contact form hidden inputs:** adds CONTACTCF13–19 (UTM fields, Landing Page, Web Referrer, Web Audience), CONTACTCF12=Contact Form and Lead Source=Website - Contact Form to `[action*=WebToContact]` forms.

`build.py` rebuilds the footer from a base footer. To fit under Zoho's 44,900-char limit, it removes the quotes from simple HTML attributes outside script/style; the parsed DOM stays the same.

Sizes at publish: footer 44,883 chars (from 43,878), header 44,845 (unchanged), CSS 139,774 (unchanged).
Published to Zoho Sites at 18:29 MT 2026-11-09 with exact read-back.

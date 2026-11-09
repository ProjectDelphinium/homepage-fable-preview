# delphi-me.com load-time patch: videos and Schedule a demo stay responsive (2026-11-09)

Not published to Zoho. Not merged. Patched files: `patched/` (Header, Footer, Custom CSS). Readable diffs: `diff-*.diff`. Patch script: `patch.py` (dist), `srcpatch.py` (source and zoho-ready).

## Character counts (cap 44,900)
| File | Live | Patched |
|---|---|---|
| Header Code | 44,898 | 44,735 |
| Footer Code | 44,763 | 43,169 |
| Custom CSS (no cap) | 132,042 | 132,622 |

## What changed
- **Videos:** the page no longer loads ~10 hidden YouTube players at page load. About 1.5 s after load, once the page is idle, it warms ONE player (the first visible video, hero K-12 or HE). Hovering, focusing or touching any video card (`pointerover`/`focusin`/`touchstart`) starts that card's player. On click, the warm player moves into the popup with `moveBefore`, so it does not reload (Chrome 133+; other browsers fall back to the old `appendChild`). There's a spinner behind the player while it loads (2.4 s spin under reduced motion).
- **Video autoplay fix:** if the player finishes loading after the click (slow phones), the page starts it as soon as YouTube reports ready or cued (`onReady`, or state -1/5). Today the site only sends `playVideo` in the first 400 ms, so on slow connections, and in 2/3 of desktop runs, the video showed but never started.
- **Bookings:** no longer preloaded at window load. It's preloaded at `requestIdleCallback` after load: ~0.3 s after load with a mouse (`pointer:fine`), ~2 s on touch screens. Hover, focus or touch on any `[data-bookings-open]`, `[data-research-book]` or `a[href$="#schedule-demo"]` starts it right away. Opening still goes through the same `dlOpenBookings`/park-class modal.
- **reCAPTCHA:** removed the site-wide load-time loader from Header. It now loads on `/contact-us` at window load, or when the contact modal opens.
- **jQuery 3.5.1:** was a parser-blocking `<script>` on every page. It now loads only on `/support`, for the Desk captcha.
- **Kept:** `a.dl-link[href][data-youtube][title]` contract, HE ID swap, popup title function `w()`, SalesIQ snippet incl. `siq_embed` clear, `#schedule-demo` listener, `dlOpenBookings`, `dlOpenContact`.
- **Removed:** the dead Mux warm/playback code (no `data-mux` anywhere). That freed Footer room.

## Method
- Playwright (Chrome 153). The live site was served with patched Header/Footer/CSS injected through CDP `Fetch` (not `page.route`, so the HTTP cache stays on). The baseline gets the same treatment with live HTML.
- **Phone:** 390x844, DPR 3, touch, Android UA, Slow 4G (562.5 ms RTT, 1.47 Mbps down / 675 kbps up), 4x CPU. Site isolation is off, as on Android Chrome, so iframes get the same throttle.
- **Desktop:** 1280x800, unthrottled. Hover 350 ms before the click.
- Fresh browser per run. Modes are interleaved. Medians of 3 runs.
- **Clicks:** clicks are scheduled at 1 s / 3 s after `loadEventEnd`. Times count **from the user's click**, including any input delay while the page is busy, to:
  - the player showing in the popup,
  - the video actually playing (`playing` event inside the YouTube frame),
  - the Bookings calendar visible (desktop: dates + time slots; phone: dates, since times only appear after picking a day).
- Runs that never got there count as caps: 30 s desktop, 60 s phone.
- **Lighthouse:** Lighthouse 12 (simulated throttling, default mobile + desktop config), 3 runs each, through the same injection. Some Lighthouse runs overlapped the phone benchmark on the same box, so treat absolute scores as noisy; compare columns.

## Results (medians)
| Device | Page | Click on | Clicked at | Metric | Today (median) | Patched (median) | n | notes |
|---|---|---|---|---|---|---|---|---|
| Desktop 1280 | / | Hero video card | 3s after load | Tap/click → player shown | 882ms | 59ms | 3/3 |  |
| Desktop 1280 | / | Hero video card | 3s after load | Tap/click → video playing | 1.85s | 990ms | 3/3 | today: 2/3 never got there in 30s |
| Desktop 1280 | / | Hero video card | 3s after load | of which: input delay (page busy) | 151ms | 7ms | | |
| Desktop 1280 | / | Hero video card | 1s after load | Tap/click → player shown | 2.22s | 83ms | 3/3 |  |
| Desktop 1280 | / | Hero video card | 1s after load | Tap/click → video playing | — | 1.22s | 3/3 | today: 3/3 never got there in 30s |
| Desktop 1280 | / | Hero video card | 1s after load | of which: input delay (page busy) | 903ms | 56ms | | |
| Desktop 1280 | / | Product video card | 3s after load | Tap/click → player shown | 554ms | 107ms | 3/3 |  |
| Desktop 1280 | / | Product video card | 3s after load | Tap/click → video playing | 1.65s | 986ms | 3/3 | today: 1/3 never got there in 30s |
| Desktop 1280 | / | Product video card | 3s after load | of which: input delay (page busy) | 64ms | 42ms | | |
| Desktop 1280 | / | Product video card | 1s after load | Tap/click → player shown | 2.19s | 125ms | 3/3 |  |
| Desktop 1280 | / | Product video card | 1s after load | Tap/click → video playing | — | 1.19s | 3/3 | today: 3/3 never got there in 30s |
| Desktop 1280 | / | Product video card | 1s after load | of which: input delay (page busy) | 730ms | 69ms | | |
| Desktop 1280 | / | Schedule a demo | 3s after load | Click → calendar + times visible | 719ms | 18ms | 3/3 |  |
| Desktop 1280 | / | Schedule a demo | 3s after load | of which: input delay (page busy) | 32ms | 9ms | | |
| Desktop 1280 | / | Schedule a demo | 1s after load | Click → calendar + times visible | 3.43s | 1.89s | 3/3 |  |
| Desktop 1280 | / | Schedule a demo | 1s after load | of which: input delay (page busy) | 583ms | 6ms | | |
| Desktop 1280 | /highered | Hero video card | 3s after load | Tap/click → player shown | 661ms | 62ms | 3/3 |  |
| Desktop 1280 | /highered | Hero video card | 3s after load | Tap/click → video playing | 1.80s | 1.07s | 3/3 |  |
| Desktop 1280 | /highered | Hero video card | 3s after load | of which: input delay (page busy) | 95ms | 8ms | | |
| Desktop 1280 | /highered | Hero video card | 1s after load | Tap/click → player shown | 1.64s | 100ms | 3/3 |  |
| Desktop 1280 | /highered | Hero video card | 1s after load | Tap/click → video playing | 2.69s | 1.20s | 3/3 | today: 1/3 never got there in 30s |
| Desktop 1280 | /highered | Hero video card | 1s after load | of which: input delay (page busy) | 784ms | 70ms | | |
| Desktop 1280 | /highered | Product video card | 3s after load | Tap/click → player shown | 564ms | 111ms | 3/3 |  |
| Desktop 1280 | /highered | Product video card | 3s after load | Tap/click → video playing | 1.54s | 1.18s | 3/3 |  |
| Desktop 1280 | /highered | Product video card | 3s after load | of which: input delay (page busy) | 76ms | 56ms | | |
| Desktop 1280 | /highered | Schedule a demo | 3s after load | Click → calendar + times visible | 561ms | 14ms | 3/3 |  |
| Desktop 1280 | /highered | Schedule a demo | 3s after load | of which: input delay (page busy) | 7ms | 6ms | | |
| Desktop 1280 | /highered | Schedule a demo | 1s after load | Click → calendar + times visible | 2.78s | 1.48s | 3/3 |  |
| Desktop 1280 | /highered | Schedule a demo | 1s after load | of which: input delay (page busy) | 597ms | 7ms | | |
| Phone 390, Slow 4G, 4x CPU | / | Hero video card | 3s after load | Tap/click → player shown | 18.85s | 7.43s | 3/3 |  |
| Phone 390, Slow 4G, 4x CPU | / | Hero video card | 3s after load | Tap/click → video playing | — | 14.54s | 3/3 | today: 3/3 never got there in 60s |
| Phone 390, Slow 4G, 4x CPU | / | Hero video card | 3s after load | of which: input delay (page busy) | 31ms | 36ms | | |
| Phone 390, Slow 4G, 4x CPU | / | Hero video card | 1s after load | Tap/click → player shown | 20.81s | 9.65s | 3/3 |  |
| Phone 390, Slow 4G, 4x CPU | / | Hero video card | 1s after load | Tap/click → video playing | — | 17.34s | 3/3 | today: 3/3 never got there in 60s |
| Phone 390, Slow 4G, 4x CPU | / | Hero video card | 1s after load | of which: input delay (page busy) | 31ms | 48ms | | |
| Phone 390, Slow 4G, 4x CPU | / | Product video card | 3s after load | Tap/click → player shown | 17.01s | 8.50s | 3/3 |  |
| Phone 390, Slow 4G, 4x CPU | / | Product video card | 3s after load | Tap/click → video playing | — | 15.31s | 3/3 | today: 3/3 never got there in 60s |
| Phone 390, Slow 4G, 4x CPU | / | Product video card | 3s after load | of which: input delay (page busy) | 40ms | 51ms | | |
| Phone 390, Slow 4G, 4x CPU | / | Schedule a demo | 3s after load | Tap → calendar visible | 37.86s | 23.95s | 3/3 |  |
| Phone 390, Slow 4G, 4x CPU | / | Schedule a demo | 3s after load | of which: input delay (page busy) | 46ms | 35ms | | |
| Phone 390, Slow 4G, 4x CPU | / | Schedule a demo | 1s after load | Tap → calendar visible | 38.62s | 25.98s | 3/3 |  |
| Phone 390, Slow 4G, 4x CPU | / | Schedule a demo | 1s after load | of which: input delay (page busy) | 34ms | 54ms | | |
| Phone 390, Slow 4G, 4x CPU | /highered | Hero video card | 3s after load | Tap/click → player shown | 15.03s | 7.46s | 4/3 |  |
| Phone 390, Slow 4G, 4x CPU | /highered | Hero video card | 3s after load | Tap/click → video playing | — | 14.47s | 4/3 | today: 4/4 never got there in 60s |
| Phone 390, Slow 4G, 4x CPU | /highered | Hero video card | 3s after load | of which: input delay (page busy) | 25ms | 28ms | | |
| Phone 390, Slow 4G, 4x CPU | /highered | Schedule a demo | 3s after load | Tap → calendar visible | 38.98s | 24.18s | 3/3 |  |
| Phone 390, Slow 4G, 4x CPU | /highered | Schedule a demo | 3s after load | of which: input delay (page busy) | 25ms | 23ms | | |

| Lighthouse | Perf today | Perf patched | LCP today | LCP patched | TBT today | TBT patched | Transfer today | Transfer patched | Requests today / patched |
|---|---|---|---|---|---|---|---|---|---|
| K-12 / mobile | 45 (41–47) | 49 (48–53) | 5.3s | 5.1s | 1133ms | 1049ms (934–1152) | 7.6 MB | 4.9 MB (4.9–4.9) | 246 / 98 |
| K-12 / desktop | 88 (75–91) | 89 (80–93) | 1.4s | 1.8s | 184ms | 0ms (0–0) | 8.3 MB | 2.8 MB (2.6–2.8) | 249 / 69 |
| /highered mobile | 44 (43–48) | 70 (53–71) | 6.1s | 6.1s | 1222ms | 12ms (0–639) | 8.0 MB | 3.1 MB (3.1–5.4) | 222 / 73 |
| /highered desktop | 88 (85–90) | 93 (93–94) | 1.5s | 1.5s | 182ms | 0ms (0–57) | 8.3 MB | 3.3 MB (3.3–5.6) | 224 / 75 |


## Verdict
**Click responsiveness is the same or better in every scenario measured. It's not worse anywhere.**
- **Desktop:** the popup with the player appears in ~60–125 ms (today 0.55–2.2 s). The video starts ~1.0–1.2 s after the click (today 1.5–2.7 s), and today it often never auto-starts (10 of 21 desktop video runs today vs 0 of 21 patched).
- **Desktop Schedule a demo:** the calendar shows immediately at 3 s (~15 ms vs ~0.6–0.7 s). At 1 s it's ~1.5–1.9 s vs ~2.8–3.4 s.
- **Input delay:** clicks 1 s after load no longer wait 0.6–0.9 s for a busy page.
- **Phone (Slow 4G, 4x CPU):** the player shows in ~7.4–9.7 s vs 15–21 s, and plays in ~14.5–17 s. Today it never auto-started in 60 s. The calendar shows in ~24–26 s vs ~38–39 s. These are still slow in absolute terms on Slow 4G. Bookings itself is ~2.4 MB plus heavy JS.
- **Lighthouse:** transfer drops a lot on every page:
  - K-12 mobile 7.6 → 4.9 MB, desktop 8.3 → 2.8 MB.
  - HE mobile 8.0 → 3.1 MB, desktop 8.3 → 3.3 MB.
  - Requests drop from ~245 to ~70–100.
- **Lighthouse HE mobile:** perf 44 → 70, TBT 1.2 s → ~0.
- **Lighthouse K-12 mobile:** only 45 → 49. Lighthouse's trace still catches the idle Bookings preload (~1 s main-thread work), so TBT stays ~1 s. That's the agreed idle preload. Delaying Bookings until first interaction would lift it, but that changes the agreed design.
- **LCP is unchanged (~5–6 s mobile).** The LCP element is the hero lead text (`p.dl-hero__lead`), which is render/font bound and not part of this patch. It's the next thing to fix for the score.

## Regression checks (regression.json, shots/)
All pass on /, /highered at 1280 and 390, baseline vs patched:
- **Video links and swap:** identical `data-youtube`/`href`/`title` on every video link, and the HE swap is intact.
- **Popup titles:** identical, including the existing K-12 hero double "Watch:" title bug, which is unchanged.
- **SalesIQ:** the widget is present.
- **Bookings:** the modal opens with the calendar and closes, and `#schedule-demo` opens it.
- **Reduced motion:** reveals are all shown and the spinner is slowed.
- **Warm player:** moved without reload (patched true, today false).
- **reCAPTCHA:** renders on `/contact-us` and in the contact modal.
- **/support:** jQuery loads and the Desk captcha image loads.
- **Errors:** the only page error is YouTube-internal (`this.api.isExternalMethodAvailable`) and happens in both.

## Not done / follow-ups
- Thumbnails still use `maxresdefault.jpg` (~650 KB). `mqdefault` (320x180) would save ~550 KB, but it's a visual-quality call.
- `embed.js` (nimbuspop, 2.4 KB, unused by our code) is left as is.
- The full build (`build_zoho_pack.py`) still can't regenerate from source because the source Header is over the cap. That was already true before this patch, so dist was edited directly, as in #63–#66. Source and zoho-ready are mirrored.

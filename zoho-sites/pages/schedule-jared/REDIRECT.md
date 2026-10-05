# /schedule-jared → Schedule Jared (Zoho Bookings)

**Date:** 2026-10-05 (America/Denver)  
**Site:** `2187225000000002005` (www.delphi-me.com)  
**Store:** `939950337`  
**Page resource:** `2187225000000053002` (`Schedule Jared`, URL `schedule-jared`)

Paste-ready copies of the page code sit beside this file: `page-header-code.html` and `page-footer-code.html`. They are page-level only. Do not paste them into the site-wide Header Code, Footer Code, or Custom CSS.

## Why not a native 301 to Bookings?

Zoho Sites **Configuration → SEO → 301 Redirect** only accepts an **internal** page/file destination (page picker). An external Bookings URL cannot be set as the Destination. Prior attempt in `live-publish-4fd8c68/04_seo_redirects.py` hit the same limit.

## What was configured

### 1. Thin page (primary)

Created Zoho page **Schedule Jared** at `/schedule-jared`.

**Page Header Code** (page-specific, not the site-wide Header Code slot):

```html
<!-- /schedule-jared → Schedule Jared (60 min) Zoho Bookings -->
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="refresh" content="0;url=https://jared-delphi-me.zohobookings.com/4937208000000036028">
<link rel="canonical" href="https://jared-delphi-me.zohobookings.com/4937208000000036028">
<script>(function(){try{location.replace("https://jared-delphi-me.zohobookings.com/4937208000000036028");}catch(e){location.href="https://jared-delphi-me.zohobookings.com/4937208000000036028";}})();</script>
```

**Page Footer Code** (noscript fallback link only):

```html
<noscript><p style="font:16px system-ui;padding:2rem"><a href="https://jared-delphi-me.zohobookings.com/4937208000000036028">Continue to Schedule Jared</a></p></noscript>
```

Target is **Schedule Jared 60 min** service id `4937208000000036028` — **not** the Demo embed (`…36014`).

Persisted via authenticated Sites API:

`PUT /zs-site/api/v1/pages/2187225000000053002`  
body: `{ "header_footer_code": { "headercode": "…", "footercode": "…" } }`  
(`api_kind`: Edit Page). Do **not** send unknown keys (returns `EXTRA_KEY_FOUND_IN_JSON`).

Also toggled **SEO → Include this page in sitemap** off in the page-info UI. Meta `noindex,nofollow` is in the page Header Code.

### 2. Trailing-slash 301 (internal)

Native Zoho 301:

| Request URL | Destination |
|-------------|-------------|
| `/schedule-jared/` | Schedule Jared page (`/schedule-jared`) |

So `/schedule-jared/` → 301 → `/schedule-jared` → client redirect → Bookings.

### 3. Explicitly not changed

- Site-wide **Header Code / Footer Code / Custom CSS** (homepage pack untouched; live CSS still has `860px` / `min(1240px`).
- Homepage Demo modal.
- DNS / HubSpot.
- `bookings.delphi-me.com` not used.

## Expected live behavior

| URL | Expected |
|-----|----------|
| `https://www.delphi-me.com/schedule-jared` | HTTP 200 thin/wrapper HTML containing `location.replace(…36028)` + meta refresh 0 + `noindex` |
| `https://www.delphi-me.com/schedule-jared/` | HTTP 301 `Location: /schedule-jared` (or equivalent path) |
| `https://delphi-me.com/schedule-jared` | CloudFront/S3 301 → www, then same as www (browser then client-navigates to Bookings) |

Browsers land on `https://jared-delphi-me.zohobookings.com/4937208000000036028`. `curl` without JS stops on the www HTML that contains the redirect script.

## Repo sync

When folding back into `homepage-fable-preview` / Zoho Sites docs the same day:

1. Document this redirect contract (path → Bookings service `…36028`).
2. Keep page Header Code in sync if the Bookings URL ever changes.
3. Do not replace this with a site-wide Header Code pathname hack unless product agrees (would touch the shared homepage pack).

## Trailing slash note

After publish, `/schedule-jared/` may answer **301 → `/schedule-jared`** (Zoho native redirect) or **200** with the same thin-page Header Code, depending on Zoho’s slash normalization. Both paths must still client-redirect to Bookings `…36028`. Re-check with GET (not only HEAD) after any Sites publish.

#!/usr/bin/env python3
"""Build the Zoho Sites v5 pack from zoho-sites/homepage-sites-v5.html.

Ports the 2026-09-28 box scripts (build_pack + split_pack). Writes the
zoho-ready document and the Header Code / Footer Code / Custom CSS parts.
Does not publish. Does not touch HubSpot, DNS, or production Zoho.
"""
from __future__ import annotations

import html as H
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "zoho-sites" / "homepage-sites-v5.html"
DIST = ROOT / "zoho-sites" / "dist"
FONTS = Path(__file__).resolve().parent / "fonts-selfhost.css"
CHROME = Path(__file__).resolve().parent / "zoho-chrome-hide.css"
SAFETY = Path(__file__).resolve().parent / "safety-reset.css"
CHAR_CAP = 44900
LEAD_TYPO = "courses you already teach in into"
SITE = "https://www.delphi-me.com"
ORG_ID = SITE + "#organization"
WEB_ID = SITE + "#website"
APP_ID = SITE + "#delphinium"
OG_IMAGE = SITE + "/dl28-og-default.jpg"
OG_ALT = "Delphinium, the Canvas engagement layer from Delphi M.E. LLC."

# Favicons copied from the Zoho-hosted files (serverless@8daf637
# stacks/theme/assets/images/favicon.svg and
# stacks/react-admin/public/favicon.png). This bizops checkout cannot
# read the product repo; the bytes are the ones already on staging.
FAVICON_LINKS = (
    '<link rel="icon" type="image/svg+xml" href="/dl28-favicon.svg">\n'
    '<link rel="icon" type="image/png" sizes="32x32" href="/dl28-favicon.png">\n'
    '<link rel="apple-touch-icon" href="/dl28-favicon.png">'
)

NEUTRALIZE = (
    # dl28: page is standalone; switch off Zoho theme CSS + legacy Home-snippet inline
    # styles so only zs-customcss (ours) applies. (Comment kept here, not in the
    # shipped script, to stay under the 44,900 Header cap.)
    "<script>"
    "(function(){var d=document;var legal=/\\/(?:eula|purchase-agreement)$/.test((location.pathname||\"/\").replace(/\\/+$/,\"\")||\"/\");function off(n){try{if(n.tagName==='LINK'&&/stylesheet/i.test(n.rel||'')&&/\\/template\\/|zsite-core|webfonts\\.zoho|fonts\\.googleapis/.test(n.href||'')){n.disabled=true;n.media='not all';n.setAttribute('data-dl-off','1');}\n"
    "else if(!legal&&n.closest&&n.closest('.theme-content-area,.zpcontent-container,[data-element-type]')){var t=n.tagName;n.setAttribute('data-dl-off','1');\n"
    "if(t==='STYLE'){n.media='not all';}else if(t==='SCRIPT'){n.type='text/plain';}else if(t==='LINK'){n.removeAttribute('href');}\n"
    "else if(t==='IMG'||t==='SOURCE'){n.removeAttribute('srcset');n.removeAttribute('src');}else if(t==='VIDEO'){n.removeAttribute('poster');n.removeAttribute('src');n.preload='none';}else if(t==='IFRAME'){n.removeAttribute('src');}}}catch(e){}}\n"
    "function sweep(){d.querySelectorAll('link,style,script,img,source,video,iframe').forEach(off);}sweep();\n"
    "var mo=new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1){off(n);if(n.querySelectorAll)n.querySelectorAll('link,style,script,img,source,video,iframe').forEach(off);}});});});\n"
    "mo.observe(d.documentElement,{childList:true,subtree:true});d.addEventListener('DOMContentLoaded',function(){sweep();setTimeout(function(){sweep();mo.disconnect();},4000);});})();</script>"
)

# SalesIQ widget (Jared go-live 2026-10-06), last thing in Header Code. The inline
# script closes the chat window when the Schedule a demo modal opens: on a click of
# [data-bookings-open] / [data-research-book], on a hashchange to #schedule-demo,
# and (via $zoho.salesiq.ready) when a page loads with #schedule-demo. It only
# hides while #dl-book-modal is open (inert === false), retrying for ~10 s because
# SalesIQ restores an open window a few seconds after load. Do not swap the widget code.
SALESIQ = (
    "<script>{let z=window.$zoho=window.$zoho||{},s='#schedule-demo',q=location.hash==s,x=()=>self['dl-book-modal']?.inert===!1&&z.salesiq.floatwindow?.visible('hide'),y=()=>[0,1,2,4,7,10].map(t=>setTimeout(x,t*1e3)),h=e=>(e.type<'d'?e.target.closest?.('[data-bookings-open],[data-research-book]'):location.hash==s)&&y();(z.salesiq=z.salesiq||{}).ready=()=>q&&y();addEventListener('hashchange',h);addEventListener('click',h,!0)}</script>"
    '<script id="zsiqscript" src="https://salesiq.zohopublic.com/widget?wc=siq43657238767afe5a3238ca4de01feca14e1d65dc4607454dc9beb3e80e4c5351" defer></script>'
)

FONT_COMMENT = "/* self-hosted fonts (Zoho Files) 2026-09-28 */\n"


def zname(rel_or_url: str) -> str:
    base = unquote(os.path.basename(urlparse(H.unescape(rel_or_url)).path)).replace(" ", "-")
    return re.sub(r"[^A-Za-z0-9._-]", "-", base)


def rewrite_assets(src: str) -> tuple[str, list[dict]]:
    """Same substitutions as build_pack_2026_09_28_v2.py. URLs only; files are already on Zoho."""
    man: list[dict] = []

    def sub_local(m: re.Match) -> str:
        quote, path = m.group(1), m.group(2)
        new = "/dl28-" + zname(path)
        man.append({"old": path, "new": new})
        return f"{quote}{new}\""

    src = re.sub(r'(=")((?:assets/[^"]+)|mewalogo\.gif)"', sub_local, src)

    def sub_hub(m: re.Match) -> str:
        url = m.group(1)
        new = "/dl28-hubfs-" + zname(url)
        man.append({"old": url, "new": new})
        return f'"{new}"'

    src = re.sub(r'"(https://delphi-me\.com/hs-fs/hubfs/[^"]+)"', sub_hub, src)

    def sub_raw(m: re.Match) -> str:
        url = m.group(1)
        new = "/dl28-" + zname(url)
        man.append({"old": url, "new": new})
        return f'"{new}"'

    src = re.sub(r'"(https://raw\.githubusercontent\.com/[^"]+)"', sub_raw, src)
    return src, man


def transform_document(src: str) -> tuple[str, list[dict]]:
    src = src.replace("\r", "")
    src, man = rewrite_assets(src)
    src = re.sub(r"\s*<link[^>]+(fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>", "", src)
    faces = FONTS.read_text(encoding="utf-8").replace("__ZOHO__/", "/")
    if faces.endswith("\n"):
        faces = faces[:-1]
    src = src.replace("<style>", "<style>\n" + FONT_COMMENT + faces + "\n", 1)
    for url in re.findall(r"url\((/dl28-font-[^)]+)\)", faces):
        man.append({"old": "fonts.gstatic.com (Google Fonts css2)", "new": url})
    seen: set[str] = set()
    deduped = []
    for item in man:
        if item["old"] in seen:
            continue
        seen.add(item["old"])
        deduped.append(item)
    deduped.append({"old": "serverless@8daf637 stacks/theme/assets/images/favicon.svg", "new": "/dl28-favicon.svg"})
    deduped.append({"old": "serverless@8daf637 stacks/react-admin/public/favicon.png", "new": "/dl28-favicon.png"})
    return src, deduped


def style_inner(doc: str) -> str:
    start = doc.find("<style>")
    end = doc.find("</style>")
    if start < 0 or end < 0 or end < start:
        raise SystemExit("page <style> block not found")
    return doc[start + len("<style>") : end]


def seo_head() -> str:
    """Sitewide JSON-LD and social image tags. Path titles live in the page script.

    No SearchAction (no on-site search). No aggregateRating. No price (licensing
    is a demo conversation, not a free app). Public email is support@delphi-me.com.
    Organization @ids match Zoho's #schemagenerator so the graphs can merge.
    The path script removes that skeletal tag after it runs.
    """
    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": ORG_ID,
                "name": "Delphi M.E. LLC",
                "legalName": "Delphi M.E. LLC",
                "alternateName": ["Delphinium", "Delphi M.E."],
                "url": SITE + "/",
                "logo": {
                    "@type": "ImageObject",
                    "url": SITE + "/dl28-logo-new.svg",
                    "contentUrl": SITE + "/dl28-logo-new.svg",
                },
                "description": (
                    "Delphi M.E. LLC builds Delphinium, the Canvas LMS engagement layer "
                    "for online K-12 and Higher Ed Online programs."
                ),
                "email": "support@delphi-me.com",
                "sameAs": [
                    "https://www.youtube.com/@DelphiniumEngage",
                    "https://www.linkedin.com/company/78437190",
                    "https://www.facebook.com/1502817329972174",
                    "https://x.com/ProjDelphinium",
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "sales",
                    "email": "support@delphi-me.com",
                    "url": SITE + "/contact-us",
                },
            },
            {
                "@type": "WebSite",
                "@id": WEB_ID,
                "name": "Delphinium",
                "url": SITE + "/",
                "description": "Canvas delivers content. Delphinium delivers engagement.",
                "publisher": {"@id": ORG_ID},
                "inLanguage": "en-US",
            },
            {
                "@type": "SoftwareApplication",
                "@id": APP_ID,
                "name": "Delphinium",
                "applicationCategory": "EducationalApplication",
                "operatingSystem": "Web; Canvas LMS",
                "url": SITE + "/",
                "description": (
                    "Delphinium is the Canvas engagement layer that turns existing Canvas "
                    "courses into motivating student experiences and an early-warning system "
                    "for teachers, typically in about three minutes, with no course migration. "
                    "It is not an LMS and does not replace Canvas."
                ),
                "brand": {"@id": ORG_ID},
                "provider": {"@id": ORG_ID},
                "offers": {
                    "@type": "Offer",
                    "url": "https://delphi-me.com/schedule-jared",
                    "description": "Institutional licensing. Schedule a demo for pricing.",
                },
            },
        ],
    }
    blob = json.dumps(graph, separators=(",", ":"), ensure_ascii=False)
    if "SearchAction" in blob or "aggregateRating" in blob or '"price"' in blob:
        raise SystemExit("SEO graph includes a disallowed property")
    if blob.count("support@delphi-me.com") < 2:
        raise SystemExit("public contact email missing from Organization schema")
    if "youtube.com/@DelphiniumEngagement" in blob:
        raise SystemExit("YouTube sameAs must stay @DelphiniumEngage")
    return (
        "<!--dl-seo-->"
        f'<script type="application/ld+json" id="dl-seo">{blob}</script>'
        '<meta property="og:site_name" content="Delphinium">'
        f'<meta property="og:image" content="{OG_IMAGE}">'
        '<meta property="og:image:width" content="1200">'
        '<meta property="og:image:height" content="630">'
        f'<meta property="og:image:alt" content="{OG_ALT}">'
        '<meta name="twitter:card" content="summary_large_image">'
        f'<meta name="twitter:image" content="{OG_IMAGE}">'
        f'<meta name="twitter:image:alt" content="{OG_ALT}">'
        "<!--/dl-seo-->"
    )


def inject_seo(doc: str) -> str:
    if "id=\"dl-seo\"" in doc or "id='dl-seo'" in doc:
        return doc
    meta = re.search(r'<meta name="description"[^>]*>', doc)
    if not meta:
        raise SystemExit("description meta missing from source")
    return doc[: meta.end()] + "\n" + seo_head() + doc[meta.end() :]


def header_code(doc: str) -> str:
    preload = re.search(r'<link rel="preload"[^>]*>', doc)
    seo = re.search(r"<!--dl-seo-->.*?<!--/dl-seo-->", doc, re.S)
    if not (preload and seo):
        raise SystemExit("logo preload or SEO block missing")
    # Shared Header Code is pasted on every path. A static title or description
    # here is what forced the K-12 strings onto /highered (a second <title> after
    # Zoho's own). The path script sets one title and description per path and
    # deletes duplicates. Zoho page SEO fields are the static copy crawlers see
    # before JS (see zoho-sites/SEO.md).
    head_tail = doc.split("</style>", 1)[1].split("</head>", 1)[0]
    # Inline head scripts are kept when they hold no "<" (the reCAPTCHA-after-load loader).
    links = re.findall(r"<link\b[^>]*>|<script\b[^>]*>[^<]*</script>", head_tail)
    if not links:
        raise SystemExit("head links after the style block were not found")
    body_start = doc.find('<a class="dl-skip"')
    if body_start < 0:
        body_start = doc.find('<div class="dl-top">')
    body_end = doc.rfind("</script>")
    if body_start < 0 or body_end < body_start:
        raise SystemExit("page body markers missing")
    body = doc[body_start : body_end + len("</script>")]
    return "\n".join([seo.group(0), preload.group(0), *links]) + body


def keep_ws(src: str) -> str:
    """Zoho strips whitespace-only text between tags.

    Same-line gaps separate inline words ("would YOU rather"), so they become &#32;.
    Newline gaps are block or flex boundaries. Encoding those pushed Header Code over
    Zoho's 44,900 cap, and dropping them does not join the inline words.
    """
    parts = re.split(r"(<(script|style|textarea|pre)\b.*?</\2>)", src, flags=re.S | re.I)
    out = []
    i = 0
    while i < len(parts):
        seg = parts[i]
        if i % 3 == 0:
            def repl(m: re.Match) -> str:
                if "\n" in m.group(1) or "\r" in m.group(1):
                    return "><"
                return ">&#32;<"
            seg = re.sub(r">([ \t\n\r]+)<", repl, seg)
            out.append(seg)
            i += 1
        else:
            out.append(seg)
            i += 2
    return "".join(out)


def dedent_markup(src: str) -> str:
    no_comments = re.sub(r"<!--(?!\[).*?-->", "", src, flags=re.S)
    return re.sub(r"\n[ \t]+", "\n", no_comments)


def minify_js(js: str) -> str:
    binary = shutil.which("terser")
    npx = shutil.which("npx")
    if binary:
        argv = [binary]
    elif npx:
        argv = [npx, "--yes", "terser"]
    else:
        raise SystemExit("terser failed: neither terser nor npx is on PATH")
    argv += ["-c", "-m", "--ecma", "2015"]
    proc = subprocess.run(argv, input=js, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise SystemExit("terser failed:\n" + proc.stderr)
    return proc.stdout


def split_parts(full_header: str) -> tuple[str, str]:
    """Header Code is the homepage through </main>, plus the video modal.

    Subpages sit between </main> and the footer in the source so they read in
    order, but they have to ship in Footer Code. Header Code is already against
    Zoho's 44,900 cap.
    """
    split_at = full_header.find("</main>")
    if split_at < 0:
        raise SystemExit("</main> not found")
    split_at += len("</main>")
    header, footer = full_header[:split_at], full_header[split_at:]
    modal = re.search(r'\s*<div class="dl-modal" id="dl-modal" hidden>.*?(?=\s*<script>)', footer, re.S)
    if not modal:
        raise SystemExit("video modal #dl-modal not found in the footer part")
    header = header + "\n" + modal.group(0).strip() + "\n"
    footer = footer[: modal.start()] + footer[modal.end() :]

    def repl_script(m: re.Match) -> str:
        body = m.group(1).strip()
        if not body:
            return m.group(0)
        return "<script>" + minify_js(body) + "</script>"

    if "<script>" not in footer:
        raise SystemExit("footer inline script not found")
    footer = re.sub(r"<script>(.*?)</script>", repl_script, footer, flags=re.S)
    header, footer = dedent_markup(header), dedent_markup(footer)
    top = header.find('<a class="dl-skip"')
    if top < 0:
        top = header.find('<div class="dl-top"')
    if top < 0:
        raise SystemExit(".dl-top not found")
    header = header[:top] + FAVICON_LINKS + NEUTRALIZE + header[top:]
    return keep_ws(header) + SALESIQ, keep_ws(footer)


def custom_css(doc: str) -> str:
    """Chrome hide + safety reset + self-hosted fonts + page style, once.

    The page <style> starts with a newline in the HTML document. Custom CSS
    drops that newline so the font block follows the safety reset directly.
    """
    chrome = CHROME.read_text(encoding="utf-8")
    safety = SAFETY.read_text(encoding="utf-8").strip() + "\n\n"
    inner = style_inner(doc).lstrip("\n")
    return chrome + safety + inner


def flag_copy(doc: str) -> None:
    if LEAD_TYPO in doc:
        print(
            'FLAG: hero still says "courses you already teach in into". That extra "in" is a grammar error.',
            file=sys.stderr,
        )
    if re.search(r"referrer-policy|name=[\"']referrer[\"']", doc, re.I):
        raise SystemExit("pack sets a Referrer-Policy. Do not set no-referrer.")


def assert_split(header: str, footer: str) -> None:
    if 'class="dl-home"' not in header:
        raise SystemExit("homepage main missing from Header Code")
    if "<footer class=\"dl-footer\">" not in footer:
        raise SystemExit("footer chrome missing from Footer Code")
    for marker in ('data-dl-page="contact"', 'data-dl-page="support"'):
        if marker not in footer:
            raise SystemExit(marker + " missing from Footer Code")
        if marker in header:
            raise SystemExit(marker + " landed in Header Code")
    for marker in ('data-dl-page="eula"', 'data-dl-page="agree"'):
        if marker in header or marker in footer:
            raise SystemExit(marker + " placeholder still in the pack")
    if "purchase-agreement" not in header:
        raise SystemExit("legal-page neutralizer exception missing from Header Code")
    if "/highered" not in header or 'k="he"' not in header:
        raise SystemExit("higher ed path missing from Header Code")
    if "dl-path-he" not in footer:
        raise SystemExit("higher ed swap missing from Footer Code")
    if "WebToContactForm" not in footer or "WebToCase" not in footer:
        raise SystemExit("contact or support form missing from Footer Code")


def assert_seo(header: str, footer: str) -> None:
    if 'id="dl-seo"' not in header:
        raise SystemExit("JSON-LD missing from Header Code")
    ld = header[header.find("dl-seo") : header.find("</script>", header.find("dl-seo")) + 9]
    for banned in ("SearchAction", "aggregateRating", '"price"'):
        if banned in ld:
            raise SystemExit("disallowed schema property in JSON-LD: " + banned)
    if ld.count("support@delphi-me.com") < 2:
        raise SystemExit("support@delphi-me.com missing from Organization JSON-LD")
    if "@DelphiniumEngagement" in ld:
        raise SystemExit("YouTube sameAs must stay @DelphiniumEngage")
    if "EducationalApplication" not in header or "Delphi M.E. LLC" not in header:
        raise SystemExit("Organization or SoftwareApplication schema incomplete")
    if OG_IMAGE not in header or "summary_large_image" not in header:
        raise SystemExit("og:image or twitter card missing from Header Code")
    if re.search(r'<meta name="description"', header):
        raise SystemExit("sitewide description meta is back in Header Code")
    if re.search(r"<title\b", header):
        raise SystemExit("sitewide <title> is back in Header Code")
    if "noindex" in header:
        raise SystemExit("noindex leaked into Header Code")
    rows = dict(
        (k, (t, d)) for k, t, d in re.findall(r'(home|he):\["([^"]*)","([^"]*)"\]', header)
    )
    if set(rows) != {"home", "he"}:
        raise SystemExit("home or Higher Ed title/description missing from the path script")
    for k, (title, desc) in rows.items():
        # Must match the Zoho page SEO strings in zoho-sites/SEO.md.
        t = title.replace("\\u00b7", "\u00b7")
        if len(t) > 60 or len(desc) > 160:
            raise SystemExit(f"{k} title/description too long: {len(t)} / {len(desc)}")
    if "Up to 31%" not in rows["home"][1]:
        raise SystemExit("K-12 promise line missing from the home description")
    # HE meta may cite the SOURCE percents. It must not cite the K-12 Davis 31%.
    he_title, he_desc = rows["he"]
    if "31%" in he_desc or "K-12" in he_desc or "K-12" in he_title:
        raise SystemExit("Higher Ed meta description inherited the K-12 promise")
    for bit in ("as much as 47%", "67%", "Utah Valley University"):
        if bit not in he_desc:
            raise SystemExit("Higher Ed meta description missing " + bit)
    for stale in ("68%", "66%"):
        if stale in he_desc:
            raise SystemExit("Higher Ed meta description uses superseded " + stale)
    # keep_ws writes the space between the number and its label as &#32;.
    card = header.replace("&#32;", " ")
    if "<b>67%</b> <span>fewer withdrawals</span>" not in card or "<b>68%</b>" in card:
        raise SystemExit("HE outcomes card must show 67% fewer withdrawals (68% superseded)")
    if "<b>65%</b> <span>fewer dropouts</span>" not in card or "<b>66%</b>" in card:
        raise SystemExit("HE outcomes card must show 65% fewer dropouts (66% superseded)")
    part_time = '<span>fewer failures for <span class="dl-nowrap">part-time</span> faculty</span>'
    if "<b>64%</b> " + part_time not in card or "<b>65%</b> " + part_time in card:
        raise SystemExit("HE outcomes card must show 64% fewer failures for part-time faculty (65% superseded)")
    if re.search(r"6[5-9]%[^.;|\"]{0,40}part-time", he_desc):
        raise SystemExit("Higher Ed meta description uses a superseded part-time faculty figure")
    if 'id="dl-define"' in header or "dl-define" in header:
        raise SystemExit("hero definition line is back in the visible page")
    if "FAQPage" in header or "FAQPage" in footer:
        raise SystemExit("FAQPage schema is not allowed")
    if "Davis School District, Utah. <b>72 online classes and 6,000 students.</b>" not in header:
        raise SystemExit("Davis proof context line was not restored")
    if "Davis Connect, Davis School District, Utah." in header:
        raise SystemExit("Davis proof context line was rewritten again")
    if "/dl28-canvas-module-before.svg" not in header:
        raise SystemExit("Canvas before asset was not rewritten to /dl28-")
    if header.count("<h1") != 1:
        raise SystemExit("homepage Header Code should expose one h1; found %s" % header.count("<h1"))
    if footer.count("<h1") != 2:
        raise SystemExit("Footer Code should have the contact and support h1 only; found %s" % footer.count("<h1"))
    if "raw.githubusercontent.com" in header or "raw.githubusercontent.com" in footer:
        raise SystemExit("hotlinked asset still in the pack")


def assert_cap(name: str, text: str) -> None:
    n = len(text)
    print(f"{name}: {n} chars")
    if n > CHAR_CAP:
        raise SystemExit(f"{name} is {n} chars, over the {CHAR_CAP} cap")


def main() -> int:
    src = SRC.read_text(encoding="utf-8")
    doc, manifest = transform_document(src)
    doc = inject_seo(doc)
    manifest.append({"old": "zoho-sites/assets/og-default.jpg", "new": "/dl28-og-default.jpg"})
    flag_copy(doc)
    css = custom_css(doc)
    header, footer = split_parts(header_code(doc))
    assert_split(header, footer)
    assert_seo(header, footer)
    assert_cap("header", header)
    assert_cap("footer", footer)
    left = sorted(set(re.findall(r"https?://[^\"\s)']+\.(?:png|jpe?g|gif|svg|webp|woff2?)\b", doc)))
    left = [u for u in left if not u.startswith(SITE + "/dl28-")]
    if left:
        print("external image urls still in the pack:", left, file=sys.stderr)
    DIST.mkdir(parents=True, exist_ok=True)
    (DIST / "homepage-sites-v5.zoho-ready.html").write_text(doc, encoding="utf-8")
    (DIST / "homepage-sites-v5.zoho-header.html").write_text(header, encoding="utf-8")
    (DIST / "homepage-sites-v5.zoho-footer.html").write_text(footer, encoding="utf-8")
    (DIST / "homepage-sites-v5.zoho-custom.css").write_text(css, encoding="utf-8")
    (DIST / "asset-manifest.json").write_text(json.dumps(manifest, indent=1) + "\n", encoding="utf-8")
    print(f"ready: {DIST / 'homepage-sites-v5.zoho-ready.html'} ({len(doc)} chars)")
    print(f"css: {len(css)} chars")
    print(f"manifest entries: {len(manifest)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

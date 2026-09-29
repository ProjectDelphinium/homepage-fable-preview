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
    "<script>/* dl28: page is standalone; switch off Zoho theme CSS + legacy Home-snippet inline styles so only zs-customcss (ours) applies */\n"
    "(function(){var d=document;function off(n){try{if(n.tagName==='LINK'&&/stylesheet/i.test(n.rel||'')&&/\\/template\\/|zsite-core|webfonts\\.zoho|fonts\\.googleapis/.test(n.href||'')){n.disabled=true;n.media='not all';n.setAttribute('data-dl-off','1');}\n"
    "else if(n.closest&&n.closest('.theme-content-area,.zpcontent-container,[data-element-type]')){var t=n.tagName;n.setAttribute('data-dl-off','1');\n"
    "if(t==='STYLE'){n.media='not all';}else if(t==='SCRIPT'){n.type='text/plain';}else if(t==='LINK'){n.removeAttribute('href');}\n"
    "else if(t==='IMG'||t==='SOURCE'){n.removeAttribute('srcset');n.removeAttribute('src');}else if(t==='VIDEO'){n.removeAttribute('poster');n.removeAttribute('src');n.preload='none';}else if(t==='IFRAME'){n.removeAttribute('src');}}}catch(e){}}\n"
    "function sweep(){d.querySelectorAll('link,style,script,img,source,video,iframe').forEach(off);}sweep();\n"
    "var mo=new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1){off(n);if(n.querySelectorAll)n.querySelectorAll('link,style,script,img,source,video,iframe').forEach(off);}});});});\n"
    "mo.observe(d.documentElement,{childList:true,subtree:true});d.addEventListener('DOMContentLoaded',function(){sweep();setTimeout(function(){sweep();mo.disconnect();},4000);});})();</script>"
)

BOOKINGS_CLIP = """
/* dl28 bookings clip (Zoho pack) */
.dl-modal--book #dl-book-frame { overflow: hidden; }
.dl-modal--book #dl-book-frame iframe { top: -222px; bottom: auto; height: calc(100% + 222px); }
"""

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
    src = src.replace("</style>", BOOKINGS_CLIP + "</style>", 1)
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


def header_code(doc: str) -> str:
    title = re.search(r"<title>.*?</title>", doc, re.S)
    meta = re.search(r'<meta name="description"[^>]*>', doc)
    preload = re.search(r'<link rel="preload"[^>]*>', doc)
    if not (title and meta and preload):
        raise SystemExit("title, description, or logo preload missing")
    head_tail = doc.split("</style>", 1)[1].split("</head>", 1)[0]
    links = re.findall(r"<link\b[^>]*>|<script\b[^>]*>\s*</script>", head_tail)
    if not links:
        raise SystemExit("head links after the style block were not found")
    desc = re.search(r'content="([^"]*)"', meta.group(0)).group(1)
    title_text = re.search(r"<title>(.*?)</title>", title.group(0), re.S).group(1)
    # \u00b7 keeps the middle dot as an ASCII escape, matching the staging header script.
    title_js = title_text.replace("·", r"\u00b7")
    setter = (
        "<script>try{document.title=\"" + title_js + "\";"
        "var m=document.querySelector('meta[name=\"description\"]');"
        "if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m);}"
        "m.setAttribute('content',\"" + desc + "\");}catch(e){}</script>"
    )
    body_start = doc.find('<a class="dl-skip"')
    if body_start < 0:
        body_start = doc.find('<div class="dl-top">')
    body_end = doc.rfind("</script>")
    if body_start < 0 or body_end < body_start:
        raise SystemExit("page body markers missing")
    body = doc[body_start : body_end + len("</script>")]
    return "\n".join([title.group(0), meta.group(0), preload.group(0), *links]) + setter + body


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
    argv = [binary] if binary else ["npx", "--yes", "terser"]
    argv += ["-c", "-m", "--ecma", "2015"]
    proc = subprocess.run(argv, input=js, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise SystemExit("terser failed:\n" + proc.stderr)
    return proc.stdout


def split_parts(full_header: str) -> tuple[str, str]:
    footer_at = full_header.find('<footer class="dl-footer">')
    if footer_at < 0:
        raise SystemExit("footer.dl-footer not found")
    header, footer = full_header[:footer_at], full_header[footer_at:]
    modal = re.search(r'\s*<div class="dl-modal" id="dl-modal" hidden>.*?(?=\s*<script>)', footer, re.S)
    if not modal:
        raise SystemExit("video modal #dl-modal not found in the footer part")
    header = header + "\n" + modal.group(0).strip() + "\n"
    footer = footer[: modal.start()] + footer[modal.end() :]
    script = re.search(r"<script>(.*?)</script>", footer, re.S)
    if not script:
        raise SystemExit("footer inline script not found")
    footer = footer[: script.start()] + "<script>" + minify_js(script.group(1)) + "</script>" + footer[script.end() :]
    header, footer = dedent_markup(header), dedent_markup(footer)
    top = header.find('<a class="dl-skip"')
    if top < 0:
        top = header.find('<div class="dl-top"')
    if top < 0:
        raise SystemExit(".dl-top not found")
    header = header[:top] + FAVICON_LINKS + NEUTRALIZE + header[top:]
    return keep_ws(header), keep_ws(footer)


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


def assert_cap(name: str, text: str) -> None:
    n = len(text)
    print(f"{name}: {n} chars")
    if n > CHAR_CAP:
        raise SystemExit(f"{name} is {n} chars, over the {CHAR_CAP} cap")


def main() -> int:
    src = SRC.read_text(encoding="utf-8")
    doc, manifest = transform_document(src)
    flag_copy(doc)
    css = custom_css(doc)
    header, footer = split_parts(header_code(doc))
    assert_cap("header", header)
    assert_cap("footer", footer)
    left = sorted(set(re.findall(r"https?://[^\"\s)']+\.(?:png|jpe?g|gif|svg|webp|woff2?)\b", doc)))
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

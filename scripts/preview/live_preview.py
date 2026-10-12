"""Local preview of zoho-sites/homepage-sites-v5.html.

Serves zoho-sites/ on http://127.0.0.1:8767. The page picks its variant from
location.pathname, so / and /home render K-12 and /highered renders Higher Ed.
Rewrites happen in the HTTP response only; source files and the Zoho pack are
never modified.

The page points [data-site-path] links at the staging origin; a small injected
script puts them back on local paths so they stay on this server.

The served <head> stands in for what Zoho renders on each page: the per-path
title and description from the page's own path script (the strings Zoho's page
SEO fields should hold, see zoho-sites/SEO.md), canonical and og tags for that
URL, and the Header Code JSON-LD / og:image block from the pack builder.

Since the 2026-09-28 cutover, delphi-me.com/hs-fs/hubfs/* redirects to Zoho and
404s, so those image URLs are swapped for the live Zoho copies listed in
dist/asset-manifest.json (the same files the live site serves).

    python scripts/preview/live_preview.py [--port 8767]
"""

import argparse
import html as H
import http.server
import json
import pathlib
import re
import sys

REPO = pathlib.Path(__file__).resolve().parents[2]
ROOT = REPO / "zoho-sites"
PAGE = ROOT / "homepage-sites-v5.html"
MANIFEST = ROOT / "dist" / "asset-manifest.json"
LIVE = "https://www.delphi-me.com"
DEAD_PREFIX = "https://delphi-me.com/hs-fs/hubfs/"
PATH_KEYS = {"/": "home", "/home": "home", "/highered": "he", "/contact-us": "contact", "/support": "support"}
CANONICAL = {"/": "/", "/home": "/home", "/highered": "/highered", "/contact-us": "/contact-us", "/support": "/support"}

sys.dont_write_bytecode = True
sys.path.insert(0, str(REPO / "tools" / "zoho"))
try:
    from build_zoho_pack import seo_head
except Exception:  # builder missing or broken: preview still serves the page
    seo_head = None

LOCAL_LINKS = """
<script id="dl-preview-local-links">
  addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-site-path]").forEach(function (el) {
      el.setAttribute("href", el.getAttribute("data-site-path"));
    });
  });
</script>
"""


def use_live_hubspot_copies(html):
    try:
        entries = json.loads(MANIFEST.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return html
    for e in entries:
        if e.get("old", "").startswith(DEAD_PREFIX):
            html = html.replace(e["old"], LIVE + e["new"])
    return html


def path_meta(html):
    """Title/description pairs from the page's `var M={...}` path script."""
    block = re.search(r"var M=\{(.*?)\};", html, re.S)
    if not block:
        return {}
    pairs = re.findall(r'(\w+):\[("(?:[^"\\]|\\.)*"),("(?:[^"\\]|\\.)*")\]', block.group(1))
    return {k: (json.loads(t), json.loads(d)) for k, t, d in pairs}


def page_head(html, path):
    meta = path_meta(html).get(PATH_KEYS[path])
    if not meta:
        return html
    title, desc = (H.escape(s, quote=True) for s in meta)
    url = LIVE + CANONICAL[path]
    html = re.sub(r"<title>.*?</title>", lambda m: f"<title>{title}</title>", html, count=1, flags=re.S)
    tags = (
        f'<meta name="description" content="{desc}">\n'
        f'  <link rel="canonical" href="{url}">\n'
        f'  <meta property="og:url" content="{url}">\n'
        f'  <meta property="og:title" content="{title}">\n'
        f'  <meta property="og:description" content="{desc}">'
    )
    if seo_head:
        tags += "\n  " + seo_head()
    return re.sub(r'<meta name="description"[^>]*>', lambda m: tags, html, count=1)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = self.path.split("?", 1)[0].split("#", 1)[0]
        if path.rstrip("/") == "/highered" and path.endswith("/"):
            self.send_response(301)
            self.send_header("Location", "/highered")
            self.end_headers()
            return
        if path not in PATH_KEYS:
            return super().do_GET()
        html = page_head(use_live_hubspot_copies(PAGE.read_text(encoding="utf-8")), path)
        head, sep, rest = html.partition("<body")
        tag_end = rest.index(">") + 1
        body = (head + sep + rest[:tag_end] + LOCAL_LINKS + rest[tag_end:]).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8767)
    port = ap.parse_args().port
    # Windows lets a second server share a reused port silently; fail instead.
    http.server.ThreadingHTTPServer.allow_reuse_address = False
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"K-12:      http://127.0.0.1:{port}/", flush=True)
    print(f"Higher Ed: http://127.0.0.1:{port}/highered", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()

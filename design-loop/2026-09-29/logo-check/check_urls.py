"""Check each logo URL (source and live /dl28-*) returns a real image."""
import json
import pathlib
import re
import urllib.request

REPO = pathlib.Path(__file__).resolve().parents[3]
SRC = (REPO / "zoho-sites/homepage-sites-v5.html").read_text(encoding="utf-8")
MANIFEST = json.loads((REPO / "zoho-sites/dist/asset-manifest.json").read_text(encoding="utf-8"))
MAP = {m["old"]: m["new"] for m in MANIFEST}
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130 Safari/537.36"}

block = SRC[SRC.index('id="customers"'):]
block = block[: block.index('dl-logos__list--clone')]
imgs = re.findall(r'<img src="([^"]+)"[^>]*alt="([^"]*)"', block)


def magic(b):
    if b[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if b[:4] == b"RIFF" and b[8:12] == b"WEBP":
        return "webp"
    if b[:4] == b"GIF8":
        return "gif"
    if b[:3] == b"\xff\xd8\xff":
        return "jpeg"
    if b.lstrip()[:1] == b"<":
        return "HTML"
    return "?"


def check(url):
    try:
        req = urllib.request.Request(url.replace("&amp;", "&"), headers=UA)
        with urllib.request.urlopen(req, timeout=30) as r:
            body = r.read()
            return r.status, r.headers.get("Content-Type"), len(body), magic(body), r.url
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Content-Type"), 0, "-", url
    except Exception as e:  # noqa: BLE001
        return "ERR", str(e)[:60], 0, "-", url


rows = []
for src, alt in imgs:
    new = MAP.get(src)
    s_abs = src if src.startswith("http") else "http://127.0.0.1:8767/" + src
    s = check(s_abs)
    l = check("https://www.delphi-me.com" + new) if new else None
    rows.append({"alt": alt, "src": src, "src_check": s, "dl28": new, "live_check": l})
    print(f"{alt!r}\n  SRC  {s}\n  LIVE {new} {l}")

(pathlib.Path(__file__).parent / "url-check.json").write_text(json.dumps(rows, indent=1, default=str))

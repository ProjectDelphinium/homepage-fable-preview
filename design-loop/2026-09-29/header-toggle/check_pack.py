"""Read-only checks on the rebuilt Zoho pack and the preview's served HTML."""
import json
import pathlib
import re
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[3]
DIST = ROOT / "zoho-sites" / "dist"
header = (DIST / "homepage-sites-v5.zoho-header.html").read_text(encoding="utf-8")
footer = (DIST / "homepage-sites-v5.zoho-footer.html").read_text(encoding="utf-8")
css = (DIST / "homepage-sites-v5.zoho-custom.css").read_text(encoding="utf-8")
ok = True


def check(name, cond, detail=""):
    global ok
    ok &= bool(cond)
    print(f"{'PASS' if cond else 'FAIL'}  {name}{('  ' + detail) if detail else ''}")


print("== pack ==")
print("chars (LF, as built): header", len(header), "footer", len(footer), "css", len(css))
check("header <= 44900", len(header) <= 44900)
check("footer <= 44900", len(footer) <= 44900)
check("no <title> in Header Code", not re.search(r"<title\b", header))
check("no description meta in Header Code", '<meta name="description"' not in header)
ld = re.search(r'<script type="application/ld\+json" id="dl-seo">(.*?)</script>', header, re.S)
check("JSON-LD present", ld)
graph = json.loads(ld.group(1))
types = [n["@type"] for n in graph["@graph"]]
check("JSON-LD parses; types", types == ["Organization", "WebSite", "SoftwareApplication"], str(types))
blob = ld.group(1)
for bad in ("aggregateRating", '"review"', '"price"', "SearchAction"):
    check(f"JSON-LD has no {bad}", bad not in blob)
check("JSON-LD public email support@delphi-me.com", blob.count("support@delphi-me.com") >= 2)
org, site, app = graph["@graph"]
check("Organization legal entity", org["name"] == "Delphi M.E. LLC" and org["legalName"] == "Delphi M.E. LLC")
check("SoftwareApplication brand Delphinium", app["name"] == "Delphinium" and app["brand"]["@id"] == org["@id"])
check("JSON-LD no UC Davis", "UC Davis" not in blob)
og = re.findall(r'<meta (?:property|name)="(?:og|twitter):image" content="([^"]+)"', header)
check("og/twitter image absolute /dl28-", og and all(u.startswith("https://www.delphi-me.com/dl28-") for u in og), str(og))
for part, text in (("header", header), ("footer", footer), ("css", css)):
    imgs = set(re.findall(r'(?:src|href|content)="(https?://[^"]+\.(?:png|jpe?g|gif|svg|webp))"', text))
    imgs |= set(re.findall(r"url\((https?://[^)]+)\)", text))
    ext = sorted(u for u in imgs if not u.startswith("https://www.delphi-me.com/dl28-"))
    check(f"{part}: no image hotlinks", not ext, str(ext))
    check(f"{part}: no raw.githubusercontent / hubfs", "raw.githubusercontent" not in text and "/hs-fs/hubfs/" not in text)
check("toggle in Header Code (bar + menu)", header.count('class="dl-aud__opt"') == 4)
check("toggle hrefs plain / and /highered", header.count('<a class="dl-aud__opt" href="/">K-12</a>') == 2
      and header.count('<a class="dl-aud__opt" href="/highered">Higher Ed</a>') == 2)
check("aria-current script in Header Code", 'setAttribute("aria-current","page")' in header)
check("separate Higher ed nav link gone", "Higher ed</a>" not in header)
check("Contact/Support open in new tab", footer.count('target="_blank" rel="noopener" aria-label="Contact (opens in new tab)"') == 1
      and footer.count('target="_blank" rel="noopener" aria-label="Support (opens in new tab)"') == 1)
check("toggle nothing in Footer Code", "dl-aud" not in footer)
check("toggle CSS in Custom CSS", ".dl-aud__opt[aria-current" in css and ".dl-mnav__aud" in css)
check("pause control still in pack", "pause" in header.lower() or "pause" in footer.lower())
check("section spacing in CSS", ".dl-section { padding: clamp(4rem, 9vw, 7rem) 0; }" in css)
m = re.search(r'data-site-origin="([^"]*)"', header)
print("data-site-origin:", m.group(1) if m else None)
check("no em dash in Header/Footer copy", "\u2014" not in header and "\u2014" not in footer)
check("no UC Davis in pack", "UC Davis" not in header + footer)

print("\n== preview raw HTML ==")
want = {
    "/": ("Delphinium \u00b7 Canvas delivers content. Delphinium delivers engagement.", "K-12", "https://www.delphi-me.com/"),
    "/home": ("Delphinium \u00b7 Canvas delivers content. Delphinium delivers engagement.", "K-12", "https://www.delphi-me.com/home"),
    "/highered": ("Higher Ed Online \u00b7 Delphinium", "Higher Ed Online", "https://www.delphi-me.com/highered"),
}
for path, (title, word, url) in want.items():
    raw = urllib.request.urlopen("http://127.0.0.1:8767" + path).read().decode("utf-8")
    titles = re.findall(r"<title>(.*?)</title>", raw, re.S)
    descs = re.findall(r'<meta name="description" content="([^"]*)"', raw)
    canon = re.findall(r'<link rel="canonical" href="([^"]*)"', raw)
    ogurl = re.findall(r'<meta property="og:url" content="([^"]*)"', raw)
    lds = re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', raw, re.S)
    import html as H
    check(f"{path}: one title, correct", len(titles) == 1 and H.unescape(titles[0]) == title, str(titles))
    check(f"{path}: one description, right audience", len(descs) == 1 and word in descs[0], descs[0][:70] if descs else "")
    if path == "/highered":
        check(f"{path}: no K-12 meta (31%, K-12)", "31%" not in descs[0] and "K-12" not in descs[0] and "K-12" not in titles[0])
        check(f"{path}: HE percents framed 'as much as'", all(f"as much as {n}%" in descs[0] for n in (47, 67, 65)))
    else:
        check(f"{path}: promise says Up to 31%", "Up to 31%" in descs[0])
    check(f"{path}: canonical + og:url", canon == [url] and ogurl == [url], f"{canon} {ogurl}")
    check(f"{path}: JSON-LD parses", len(lds) == 1 and json.loads(lds[0])["@graph"])
    check(f"{path}: toggle links", raw.count('class="dl-aud__opt" href="/"') == 2 and raw.count('class="dl-aud__opt" href="/highered"') == 2)
    check(f"{path}: no dl-preview-bar", "dl-preview-bar" not in raw)

print("\nALL PASS" if ok else "\nSOME FAILED")
sys.exit(0 if ok else 1)

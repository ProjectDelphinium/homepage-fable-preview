"""Read-only char-cost estimate for porting the 78e5ec2 audience toggle into the live pack."""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[3]
DIST = ROOT / "zoho-sites" / "dist"
CAP = 44900

header = (DIST / "homepage-sites-v5.zoho-header.html").read_text(encoding="utf-8")
footer = (DIST / "homepage-sites-v5.zoho-footer.html").read_text(encoding="utf-8")
css = (DIST / "homepage-sites-v5.zoho-custom.css").read_text(encoding="utf-8")
print("now header", len(header), "left", CAP - len(header))
print("now footer", len(footer), "left", CAP - len(footer))
print("now css", len(css))

SEG = ('<ul class="dl-aud__seg"><li><a href="/home" aria-current="page">K-12</a></li>'
       '<li><a href="/highered">Higher Ed</a></li></ul>')
DESK = '<nav class="dl-aud" aria-label="Choose version"><p class="dl-aud__label">My institution is</p>' + SEG + '</nav>'
MOB = '<div class="dl-aud dl-mnav__aud" role="group" aria-label="Choose version"><p class="dl-aud__label">My institution is</p>' + SEG + '</div>'
OLD_DESK = ('<nav class="dl-aud" aria-label="Choose version"><p class="dl-aud__label">My institution is</p><ul class="dl-aud__seg">'
            '<li><a class="dl-aud__opt" href="homepage-sites-v5.html" data-aud="k12" aria-current="page">K-12</a></li>'
            '<li><a class="dl-aud__opt" href="homepage-sites-v5-highered.html" data-aud="he">Higher Ed</a></li></ul></nav>')
NAV_LINK = '<a href="/highered" data-site-path="/highered">Higher ed</a>'
MNAV_LINK = '<li><a href="/highered" data-site-path="/highered">Higher ed</a></li>'
ARIA_JS_HEADER = ('<script>document.documentElement.classList.contains("dl-path-he")&&'
                  'document.querySelectorAll(".dl-aud a").forEach((a,i)=>a.ariaCurrent=i%2?"page":null)</script>')
ARIA_JS_FOOTER = 'document.querySelectorAll(".dl-aud a").forEach((e,t)=>e.ariaCurrent=t%2?"page":null);'

print()
for name, s in [("old 78e5ec2 desktop markup", OLD_DESK), ("lean desktop", DESK), ("lean mobile", MOB),
                ("header aria script", ARIA_JS_HEADER), ("footer aria js (inside HE IIFE)", ARIA_JS_FOOTER),
                ("nav Higher ed link", NAV_LINK), ("mnav Higher ed li", MNAV_LINK)]:
    print(f"{len(s):5d}  {name}")

assert header.count(NAV_LINK) == 2 and MNAV_LINK in header
add = len(DESK) + len(MOB) + len(ARIA_JS_HEADER)
save = len(NAV_LINK) + len(MNAV_LINK)
print()
print("header delta (toggle x2 + aria script - Higher ed links):", add - save,
      "-> header", len(header) + add - save, "left", CAP - (len(header) + add - save))

print()
print("final proposal:")
FSEG = '<p>My institution is</p><ul><li><a href="/">K-12</a></li><li><a href="/highered">Higher Ed</a></li></ul>'
FDESK = '<nav class="dl-aud" aria-label="Audience">' + FSEG + '</nav>'
FMOB = '<div class="dl-aud" role="group" aria-label="Audience">' + FSEG + '</div>'
FJS = ('<script>(h=>document.querySelectorAll(".dl-aud a").forEach((a,i)=>i%2==h&&a.setAttribute("aria-current","page")))'
       '(/path-he/.test(document.documentElement.className))</script>')
titles = sum(map(len, re.findall(r' title="Watch:[^"]*"', header)))
for name, s in [("desktop", FDESK), ("mobile", FMOB), ("aria script", FJS)]:
    print(f"{len(s):5d}  {name}")
fadd = len(FDESK) + len(FMOB) + len(FJS)
for label, saved in [("toggle only", 0), ("- Higher ed links", save), ("- Higher ed links - Watch titles", save + titles)]:
    n = len(header) + fadd - saved
    print(f"  {label:34s} delta {fadd - saved:+5d} -> header {n} left {CAP - n}")

origin = re.search(r' data-site-origin="[^"]*" data-site-origin-production="[^"]*"', header).group(0)
print("data-site-origin attrs:", len(origin))
yt_titles = re.findall(r' title="Watch:[^"]*"', header)
print("title=\"Watch:...\" attrs duplicating data-title:", len(yt_titles), sum(map(len, yt_titles)))
print("aria-hidden=\"true\" count:", header.count(' aria-hidden="true"'))
print("loading=\"lazy\" count:", header.count(' loading="lazy"'), " decoding=\"async\" count:", header.count(' decoding="async"'))

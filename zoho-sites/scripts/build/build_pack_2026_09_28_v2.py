#!/usr/bin/env python3
"""Build zoho-ready v2 pack from Jared's local file: all assets Zoho-hosted (/dl28-*), self-hosted fonts, no design edits."""
import re, json, html as H
from pathlib import Path
from urllib.parse import urlparse, unquote
import os
ROOT=Path(__file__).resolve().parent
SRC=Path('/workspace/uploads/homepage-local-2026-09-28/zoho-sites/homepage-sites-v5.html')
OUTF=ROOT/'homepage-sites-v5.zoho-ready.2026-09-28-local-v2.html'
AD=ROOT/'assets/zoho-upload-2026-09-28'
s=SRC.read_text(encoding='utf-8').replace('\r','')
man=[]
def zname(rel_or_url):
    base=unquote(os.path.basename(urlparse(H.unescape(rel_or_url)).path)).replace(' ','-')
    base=re.sub(r'[^A-Za-z0-9._-]','-',base)
    return base
def sub_local(m):
    q,path=m.group(1),m.group(2)
    n='dl28-'+zname(path); assert (AD/n).exists(), n
    man.append({"old":path,"new":"/"+n}); return f'{q}/{n}"'
# relative assets (assets/... and mewalogo.gif)
s=re.sub(r'(=")((?:assets/[^"]+)|mewalogo\.gif)"', sub_local, s)
def sub_hub(m):
    u=m.group(1); n='dl28-hubfs-'+zname(u); assert (AD/n).exists(), n
    man.append({"old":u,"new":"/"+n}); return f'"/{n}"'
s=re.sub(r'"(https://delphi-me\.com/hs-fs/hubfs/[^"]+)"', sub_hub, s)
# raw.githubusercontent (hires/prospectus branches)
def sub_raw(m):
    u=m.group(1); n='dl28-'+zname(u); assert (AD/n).exists(), n
    man.append({"old":u,"new":"/"+n}); return f'"/{n}"'
s=re.sub(r'"(https://raw\.githubusercontent\.com/[^"]+)"', sub_raw, s)
# fonts: drop Google Fonts links/preconnects, add self-hosted @font-face
s=re.sub(r'\s*<link[^>]+(fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>', '', s)
ff=(AD/'fonts-selfhost.css.tmpl').read_text().replace('__ZOHO__/','/')
for m in re.findall(r"url\((/dl28-font-[^)]+)\)",ff): man.append({"old":"fonts.gstatic.com (Google Fonts css2)","new":m})
s=s.replace('<style>', '<style>\n/* self-hosted fonts (Zoho Files) 2026-09-28 */\n'+ff+'\n', 1)
# redundant native tooltips on Watch links (title == visible text)
def strip_title(m):
    tag=m.group(0); t=re.search(r' title="([^"]*)"',tag)
    return tag.replace(t.group(0),'') if t else tag
s=re.sub(r'<a [^>]*data-(?:youtube|mux)="[^"]*"[^>]*>', strip_title, s)

# Jared 2026-09-28: clip the Bookings service card (SC tile / jared_delphi-me / 1 hr) out of the cross-origin portal-embed.
# Card spans y=30..214 inside the iframe at 1440/1024/390; "Select date and time" starts at 238 -> clip 222px, add it back to height.
BK = """
/* dl28 bookings clip (Zoho pack) */
.dl-modal--book #dl-book-frame { overflow: hidden; }
.dl-modal--book #dl-book-frame iframe { top: -222px; bottom: auto; height: calc(100% + 222px); }
"""
s = s.replace('</style>', BK + '</style>', 1)
# Jared copy edit 2026-09-28 17:22: trailing comma
assert s.count('already runs on Canvas</span>')==1
s = s.replace('already runs on Canvas</span>', 'already runs on Canvas,</span>')
left=sorted(set(re.findall(r'https?://[^"\s)\']+\.(?:png|jpe?g|gif|svg|webp|woff2?)\b',s)))
OUTF.write_text(s,encoding='utf-8')
seen=set(); man=[x for x in man if not (x['old'] in seen or seen.add(x['old']))]
(ROOT/'verify-2026-09-28-layout-fix/asset-manifest.json').write_text(json.dumps(man,indent=1))
print(len(s), len(man), 'external asset urls left:', left)
print(re.findall(r'https?://[a-z0-9.-]+',s) and sorted(set(re.findall(r'https?://([a-z0-9.-]+)',s))))

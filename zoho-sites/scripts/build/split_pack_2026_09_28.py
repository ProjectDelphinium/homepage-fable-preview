"""Build split Header/Footer payloads for the 2026-09-28 pack (fallback if Zoho caps Header Code)."""
import re, subprocess, json
from pathlib import Path
ROOT = Path(__file__).resolve().parent
NEUTRALIZE = """<script>/* dl28: page is standalone; switch off Zoho theme CSS + legacy Home-snippet inline styles so only zs-customcss (ours) applies */
(function(){var d=document;function off(n){try{if(n.tagName==='LINK'&&/stylesheet/i.test(n.rel||'')&&/\/template\/|zsite-core|webfonts\.zoho|fonts\.googleapis/.test(n.href||'')){n.disabled=true;n.media='not all';n.setAttribute('data-dl-off','1');}
else if(n.closest&&n.closest('.theme-content-area,.zpcontent-container,[data-element-type]')){var t=n.tagName;n.setAttribute('data-dl-off','1');
if(t==='STYLE'){n.media='not all';}else if(t==='SCRIPT'){n.type='text/plain';}else if(t==='LINK'){n.removeAttribute('href');}
else if(t==='IMG'||t==='SOURCE'){n.removeAttribute('srcset');n.removeAttribute('src');}else if(t==='VIDEO'){n.removeAttribute('poster');n.removeAttribute('src');n.preload='none';}else if(t==='IFRAME'){n.removeAttribute('src');}}}catch(e){}}
function sweep(){d.querySelectorAll('link,style,script,img,source,video,iframe').forEach(off);}sweep();
var mo=new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1){off(n);if(n.querySelectorAll)n.querySelectorAll('link,style,script,img,source,video,iframe').forEach(off);}});});});
mo.observe(d.documentElement,{childList:true,subtree:true});d.addEventListener('DOMContentLoaded',function(){sweep();setTimeout(function(){sweep();mo.disconnect();},4000);});})();</script>
"""

def keep_ws(s: str) -> str:
    """Zoho strips whitespace-only text between tags; encode it as &#32; outside script/style/textarea/pre."""
    parts = re.split(r"(<(script|style|textarea|pre)\b.*?</\2>)", s, flags=re.S | re.I)
    out = []
    i = 0
    while i < len(parts):
        seg = parts[i]
        if i % 3 == 0:
            seg = re.sub(r">[ \t\n\r]+<", ">&#32;<", seg)
            out.append(seg); i += 1
        else:
            out.append(seg); i += 2
    return "".join(out)

def build(header_code_full: str):
    # header_code_full = head bits + title/meta script + body (from v5.html_parts)
    fi = header_code_full.find('<footer class="dl-footer">')
    A, B = header_code_full[:fi], header_code_full[fi:]
    # move the video modal (#dl-modal) into A (legacy page snippet on Home also has id=dl-modal)
    m = re.search(r'\s*<div class="dl-modal" id="dl-modal" hidden>.*?(?=\s*<script>)', B, re.S)
    if m:
        A = A + "\n" + m.group(0).strip() + "\n"; B = B[:m.start()] + B[m.end():]
    # minify the inline script with terser (compress+mangle locals), dedent markup
    sm = re.search(r"<script>(.*?)</script>", B, re.S)
    js = subprocess.run(["terser", "-c", "-m", "--ecma", "2015"], input=sm.group(1), capture_output=True, text=True, check=True).stdout
    B = B[:sm.start()] + "<script>" + js + "</script>" + B[sm.end():]
    ded = lambda s: re.sub(r"\n[ \t]+", "\n", re.sub(r"<!--(?!\[).*?-->", "", s, flags=re.S))
    A, B = ded(A), ded(B)
    # neutralizer right after the <title>/<meta> lines, before any body markup
    k = A.find("<div class=\"dl-top\"")
    FAV = '<link rel="icon" type="image/svg+xml" href="/dl28-favicon.svg">\n<link rel="icon" type="image/png" sizes="32x32" href="/dl28-favicon.png">\n<link rel="apple-touch-icon" href="/dl28-favicon.png">\n'
    A = A[:k] + FAV + NEUTRALIZE + A[k:]
    return keep_ws(A), keep_ws(B)
if __name__ == "__main__":
    import importlib.util
    spec = importlib.util.spec_from_file_location("w", str(ROOT / "publish_sites_v5_2026_09_28_local.py")); w = importlib.util.module_from_spec(spec); spec.loader.exec_module(w)
    hc = w.v5.html_parts()["header_code"]
    A, B = build(hc)
    print(len(hc), len(A), len(A.encode()), len(B), len(B.encode()))
    (ROOT/"homepage-sites-v5.zoho-ready.2026-09-28-local.split-header.html").write_text(A); (ROOT/"homepage-sites-v5.zoho-ready.2026-09-28-local.split-footer.html").write_text(B)

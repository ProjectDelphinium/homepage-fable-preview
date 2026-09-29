#!/usr/bin/env python3
"""Trigger Verify for www.delphi-me.com (then apex if still unverified). No primary change, no SSL."""
import importlib.util, json, sys, time
from pathlib import Path
ZS=Path('/workspace/delphinium-os/web-design/zoho-sites'); OUT=Path(__file__).resolve().parent/'zoho-run'/'verify'; OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location("v5",str(ZS/"publish_sites_v5.py")); v5=importlib.util.module_from_spec(spec); spec.loader.exec_module(v5); v3=v5.v3
from playwright.sync_api import sync_playwright
B,S=v5.BUILDER_BASE,v5.SITE_ID; res={"notes":[],"blockers":[]}; api=[]
FORBID=('primary','ssl','publish')
with sync_playwright() as p:
    br=p.chromium.launch(headless=True,channel="chrome",args=["--no-sandbox"]); ctx=br.new_context(viewport={"width":1440,"height":1000},storage_state=str(v5.STORAGE_SITES)); v3.install_route_guards(ctx); page=ctx.new_page(); page.set_default_timeout(20000)
    def guard(route):
        r=route.request
        if r.method!='GET' and '/zs-site/api/' in r.url and any(f in r.url.lower() for f in FORBID): print("BLOCKED",r.method,r.url); route.abort()
        else: route.fallback()
    page.route("**/zs-site/api/**",guard)
    page.on("response",lambda r: api.append({"m":r.request.method,"s":r.status,"u":r.url,"req":(r.request.post_data or '')[:800],"b":r.text()[:3000]}) if '/zs-site/api/' in r.url and 'domain' in r.url else None)
    if not v5.ensure_auth_with_password(page, OUT, res): sys.exit(4)
    for target in ["http://www.delphi-me.com","http://delphi-me.com"]:
        page.goto(f"{B}/zcms/{S}/settings/domains",wait_until="domcontentloaded"); v3.wait_out_of_please_wait(page,30); page.wait_for_timeout(4000)
        ok=page.evaluate("""(t)=>{const cands=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&(e.innerText||'').trim()===t&&e.offsetParent);
          for(const c of cands){let r=c;for(let i=0;i<6&&r;i++){const v=[...r.querySelectorAll('*')].find(x=>x.children.length===0&&(x.innerText||'').trim()==='Verify'&&x.offsetParent);if(v){v.click();return r.innerText.replace(/\\s+/g,' ').slice(0,120)}r=r.parentElement}}return null}""",target)
        print("row click",target,ok); page.wait_for_timeout(3000)
        # if an instructions dialog opened, press its Verify button
        clicked=page.evaluate("""()=>{const ov=[...document.querySelectorAll('.hb-dialog-overlay,[role=dialog],.sites-modal')].filter(e=>e.offsetParent);for(const o of ov){const b=[...o.querySelectorAll('button,.sites-button,span')].filter(x=>(x.innerText||'').trim()==='Verify'&&x.offsetParent).pop();if(b){b.click();return true}}return false}""")
        print("dialog verify clicked",clicked); page.wait_for_timeout(8000)
        page.screenshot(path=str(OUT/f"verify-{target.split('//')[1]}-{time.strftime('%H%M%S')}.png"),full_page=True)
        t=page.locator('body').inner_text(); i=t.find('Domains',t.find('SSL hosting')); print("PAGE:",t[i:i+700].replace('\n',' | '))
    br.close()
(OUT/'api.json').write_text(json.dumps(api,indent=1))
for a in api:
    if a['m']!='GET': print(a['m'],a['s'],a['u'][-80:],'\n REQ',a['req'][:300],'\n RESP',a['b'][:1200])

#!/usr/bin/env python3
"""Pages: peek Add Page dialog, or create placeholder page. usage: peek | create <Name> <slug>"""
import importlib.util, json, sys, time
from pathlib import Path
ZS=Path('/workspace/delphinium-os/web-design/zoho-sites'); OUT=Path(__file__).resolve().parent/'zoho-run'/'pages'; OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location("v5",str(ZS/"publish_sites_v5.py")); v5=importlib.util.module_from_spec(spec); spec.loader.exec_module(v5); v3=v5.v3
from playwright.sync_api import sync_playwright
B,S=v5.BUILDER_BASE,v5.SITE_ID; res={"notes":[],"blockers":[]}; api=[]
mode=sys.argv[1]; tag=f"{mode}-{time.strftime('%H%M%S')}"
CTRL="""()=>[...document.querySelectorAll('input,select,textarea,button,.sites-button,label,[role=switch],[role=checkbox]')].filter(e=>e.offsetParent!==null).map(e=>({t:e.tagName,type:e.type||'',id:e.id,name:e.name||'',checked:e.checked,val:(e.value||'').slice(0,60),txt:(e.innerText||e.placeholder||'').trim().slice(0,70),ev:e.getAttribute('data-event')||''}))"""
with sync_playwright() as p:
    br=p.chromium.launch(headless=True,channel="chrome",args=["--no-sandbox"]); ctx=br.new_context(viewport={"width":1440,"height":1000},storage_state=str(v5.STORAGE_SITES)); v3.install_route_guards(ctx); page=ctx.new_page(); page.set_default_timeout(20000)
    page.on("response",lambda r: api.append({"m":r.request.method,"s":r.status,"u":r.url,"req":(r.request.post_data or '')[:1500],"b":(r.text()[:1500] if r.request.method!='GET' else '')}) if '/zs-site/api/' in r.url else None)
    if not v5.ensure_auth_with_password(page, OUT, res): sys.exit(4)
    page.goto(f"{B}/zcms/{S}/pages/directory/{S}",wait_until="domcontentloaded"); v3.wait_out_of_please_wait(page,30); page.wait_for_timeout(4000)
    page.get_by_text("Add Page",exact=True).first.click(); page.wait_for_timeout(2500)
    page.screenshot(path=str(OUT/f"{tag}-01.png")); c=page.evaluate(CTRL); (OUT/f"{tag}-01.json").write_text(json.dumps(c,indent=1))
    t=page.locator('body').inner_text(); i=t.find('Add Page', t.find('Add Page')+1); (OUT/f"{tag}-01.txt").write_text(t)
    if mode=="peek":
        print(json.dumps([x for x in c if x['t'] in('INPUT','SELECT','TEXTAREA') or x['ev'] or x['t']=='LABEL'],indent=0)[:5000])
    if mode=="create":
        name,slug=sys.argv[2],sys.argv[3]
        exec(open(Path(__file__).parent/'zoho_pages_create_body_indexable.py').read())
    br.close()
(OUT/f"{tag}-api.json").write_text(json.dumps(api,indent=1))
print([(a['m'],a['s'],a['u'][-60:],a['req'][:300],a['b'][:300]) for a in api if a['m']!='GET'])

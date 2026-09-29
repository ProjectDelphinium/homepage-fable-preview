#!/usr/bin/env python3
"""Edit page info: uncheck noindex for given page names. usage: names..."""
import importlib.util, json, sys, time
from pathlib import Path
ZS=Path('/workspace/delphinium-os/web-design/zoho-sites'); OUT=Path(__file__).resolve().parent/'zoho-run'/'pages'
spec=importlib.util.spec_from_file_location("v5",str(ZS/"publish_sites_v5.py")); v5=importlib.util.module_from_spec(spec); spec.loader.exec_module(v5); v3=v5.v3
from playwright.sync_api import sync_playwright
B,S=v5.BUILDER_BASE,v5.SITE_ID; res={"notes":[],"blockers":[]}; api=[]
with sync_playwright() as p:
    br=p.chromium.launch(headless=True,channel="chrome",args=["--no-sandbox"]); ctx=br.new_context(viewport={"width":1440,"height":1000},storage_state=str(v5.STORAGE_SITES)); v3.install_route_guards(ctx); page=ctx.new_page(); page.set_default_timeout(20000)
    page.on("response",lambda r: api.append({"m":r.request.method,"s":r.status,"u":r.url,"req":(r.request.post_data or '')[:1200],"b":(r.text()[:600] if r.request.method!='GET' else '')}) if '/zs-site/api/' in r.url else None)
    if not v5.ensure_auth_with_password(page, OUT, res): sys.exit(4)
    for name in sys.argv[1:]:
        page.goto(f"{B}/zcms/{S}/pages/directory/{S}",wait_until="domcontentloaded"); v3.wait_out_of_please_wait(page,30); page.wait_for_timeout(4000)
        ok=page.evaluate("""(n)=>{const c=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&(e.innerText||'').trim()===n&&e.offsetParent);for(const x of c){let r=x;for(let i=0;i<6&&r;i++){const b=[...r.querySelectorAll('*')].find(y=>y.children.length===0&&(y.innerText||'').trim()==='Edit page info');if(b){b.click();return true}r=r.parentElement}}return false}""",name)
        page.wait_for_timeout(3000); print(name,"opened",ok)
        st=page.evaluate("""()=>{const l=[...document.querySelectorAll('label,span,div')].find(e=>e.offsetParent&&(e.innerText||'').trim()==='Instruct crawlers not to index this page (noindex)'&&e.children.length===0);let r=l,cb=null;for(let i=0;i<4&&r&&!cb;i++){cb=r.querySelector('input[type=checkbox]');r=r.parentElement}
          if(!cb)return 'nf';const b=cb.checked;if(cb.checked)cb.click();return {before:b,after:cb.checked}}""")
        print(" noindex",st); page.screenshot(path=str(OUT/f"unnoindex-{name.replace(' ','_')}.png"))
        btns=page.evaluate("()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent&&/save|update/i.test(b.innerText)).map(b=>b.id+'|'+b.innerText.trim()+'|'+(b.getAttribute('data-event')||''))"); print(" btns",btns)
        page.locator("button:visible", has_text="Save").last.click(); page.wait_for_timeout(4000)
    br.close()
for a in api:
    if a['m']!='GET': print(a['m'],a['s'],a['u'][-70:],a['req'][:400],'|',a['b'][:200])

#!/usr/bin/env python3
"""Domain & SSL: mode peek | ssl | primary. Logs domain API calls."""
import importlib.util, json, sys, time
from pathlib import Path
ZS=Path('/workspace/delphinium-os/web-design/zoho-sites'); OUT=Path(__file__).resolve().parent/'zoho-run'/'ssl'; OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location("v5",str(ZS/"publish_sites_v5.py")); v5=importlib.util.module_from_spec(spec); spec.loader.exec_module(v5); v3=v5.v3
from playwright.sync_api import sync_playwright
mode=sys.argv[1]; B,S=v5.BUILDER_BASE,v5.SITE_ID; api=[]
def snap(page,tag):
    fn=OUT/f"{tag}-{time.strftime('%H%M%S')}.png"; page.screenshot(path=str(fn),full_page=True); return fn
with sync_playwright() as p:
    br=p.chromium.launch(headless=True,channel="chrome",args=["--no-sandbox"]); ctx=br.new_context(viewport={"width":1440,"height":1000},storage_state=str(v5.STORAGE_SITES)); v3.install_route_guards(ctx); page=ctx.new_page(); page.set_default_timeout(20000)
    page.on("response",lambda r: api.append({"m":r.request.method,"s":r.status,"u":r.url,"req":(r.request.post_data or '')[:800],"b":(lambda: (lambda: r.text()[:2500])() if True else "")() if r.request.method!='OPTIONS' else ''}) if '/zs-site/api/' in r.url and ('domain' in r.url or 'ssl' in r.url.lower()) else None)
    v5.ensure_auth_with_password(page,OUT,{"notes":[],"blockers":[]})
    page.goto(f"{B}/zcms/{S}/settings/domains",wait_until="domcontentloaded"); v3.wait_out_of_please_wait(page,30); page.wait_for_timeout(5000)
    if mode=="peek":
        t=page.locator('body').inner_text(); print(t[:3000])
        print(page.evaluate("""()=>[...document.querySelectorAll('[data-event]')].filter(e=>e.offsetParent).map(e=>(e.innerText||'').trim().slice(0,40)+' | '+e.getAttribute('data-event')).filter(s=>/ssl|primary|domain|cert|more|option/i.test(s)).slice(0,60)"""))
        print(snap(page,"peek"))
    elif mode in("click",):
        # click element by exact text (argv[2]) within www row context, then optional dialog button argv[3]
        txt=sys.argv[2]
        r=page.evaluate("""(t)=>{const c=[...document.querySelectorAll('*')].filter(e=>e.offsetParent&&(e.innerText||'').trim()===t&&e.children.length<=1);if(!c.length)return null;c[0].click();return c.length}""",txt)
        print("click",txt,r); page.wait_for_timeout(5000); print(snap(page,"after-"+txt[:12].replace(' ','_')))
        t=page.locator('body').inner_text(); print(t[:2500])
    if mode=="favicon":
        page.evaluate("""()=>{const a=[...document.querySelectorAll('a')].find(e=>(e.innerText||'').trim()==='Site Options'&&e.offsetParent);a&&a.click()}""")
        page.wait_for_timeout(6000); v3.wait_out_of_please_wait(page,30)
        page.evaluate("""()=>{const c=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/^favicon$/i.test((e.innerText||'').trim())&&e.offsetParent);c.length&&c[0].click()}""")
        page.wait_for_timeout(3000)
        info=page.evaluate("""()=>({dz:!!document.getElementById('favicon_dropzone'),btn:!!document.getElementById('favicon_upload'),files:[...document.querySelectorAll('input[type=file]')].map(i=>i.id+'|'+i.name+'|'+(i.closest('[id]')||{}).id),img:(document.getElementById('faviconimg')||{}).src})""")
        print("FAV",info); print(snap(page,"favicon-before"))
        if len(sys.argv)>2 and sys.argv[2]=="upload":
            page.set_input_files("#favicon_dropzone",str(Path(__file__).resolve().parent/'zoho-run'/'dl28-favicon.png'))
            page.wait_for_timeout(10000)
            print("after",page.evaluate("""()=>({img:(document.getElementById('faviconimg')||{}).src,err:(document.getElementById('favicon_error')||{}).innerText||null})"""))
            print(snap(page,"favicon-after"))
    if mode=="goto":
        page.goto(f"{B}/zcms/{S}/settings/"+sys.argv[2],wait_until="domcontentloaded"); v3.wait_out_of_please_wait(page,30); page.wait_for_timeout(5000)
        print(snap(page,"goto-"+sys.argv[2].replace('/','_')))
        t=page.locator('body').inner_text(); i=t.find('Image Optimizer'); print(t[i:i+2500])
        print(page.evaluate("""()=>[...document.querySelectorAll('[data-event],input[type=file]')].filter(e=>e.offsetParent||e.type==='file').map(e=>e.tagName+'|'+(e.id||'')+'|'+(e.getAttribute('data-event')||'')+'|'+(e.innerText||'').trim().slice(0,40)).filter(s=>!/settingsDialog|asap|feedback|publish/.test(s)).slice(0,60)"""))
    if mode=="delapex":
        page.click("#2000045068041-trash" if False else "[id='2000045068041-trash']"); page.wait_for_timeout(3000)
        dlg=page.evaluate("""()=>[...document.querySelectorAll('.hb-dialog-overlay,[role=dialog],.sites-modal,.hb-dialog,.zs-dialog,.demo-dialog')].filter(e=>e.offsetParent).map(e=>e.innerText.slice(0,600))""")
        print("DIALOG",dlg); print(snap(page,"delapex-dialog"))
        btns=page.evaluate("""()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>b.innerText.trim())""")
        print("BTNS",btns)
        ok=page.evaluate("""()=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent&&/^(delete|yes|ok|continue|move to trash)$/i.test(b.innerText.trim())).pop();if(b){b.click();return b.innerText}return null}""")
        print("confirm",ok); page.wait_for_timeout(6000)
        page.goto(f"{B}/zcms/{S}/settings/domains",wait_until="domcontentloaded"); v3.wait_out_of_please_wait(page,30); page.wait_for_timeout(5000); print(snap(page,"after-delapex"))
        t=page.locator('body').inner_text(); i=t.find('Add Domain'); print(t[i:i+600])
    if mode=="markprimary":
        skip=len(sys.argv)>2 and sys.argv[2]=="skip"
        r=page.evaluate("""([skip])=>new Promise(res=>{const q={url:app.data.api_url+'/domains/2000045068040/markPrimary',headers:Object.assign({'X-Site-Id':'939950337','X-Site-Resource-Id':'2187225000000002005'},require('csrf').getCSRFHeader()),
            handler:function(){res({status:this.status,text:String(this.responseText).slice(0,1500)})},error:function(){res({err:true,status:this.status,text:String(this.responseText).slice(0,800)})}};
            if(skip)q.bodyJSON={skip_check:true}; $X.put(q); setTimeout(()=>res({timeout:true}),30000)})""",[skip])
        print("MARKPRIMARY",skip,r)
        page.goto(f"{B}/zcms/{S}/settings/domains",wait_until="domcontentloaded"); v3.wait_out_of_please_wait(page,30); page.wait_for_timeout(5000); print(snap(page,"after-markprimary"))
        t=page.locator('body').inner_text(); i=t.find('Add Domain'); print(t[i:i+500])
    if mode=="rowdom":
        print(page.evaluate("""()=>{const a=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&(e.innerText||e.textContent||'').trim()==='http://www.delphi-me.com');let r=a;for(let i=0;i<5;i++)r=r.parentElement;return r.outerHTML.slice(0,4000)}"""))
        print(page.evaluate("""()=>[...document.querySelectorAll('[data-event]')].map(e=>e.getAttribute('data-event')).filter(x=>/domain/i.test(x)).filter((v,i,a)=>a.indexOf(v)===i)"""))
    if mode=="edit":
        page.evaluate("""()=>{const e=[...document.querySelectorAll('[data-event="click domains.showEditDomain"]')].filter(x=>x.offsetParent&&(x.innerText||'').trim()==='Edit')[0];e.click()}""")
        page.wait_for_timeout(4000); print(snap(page,"edit"))
        print(page.evaluate("""()=>{const o=[...document.querySelectorAll('select,input,[data-event]')].filter(e=>e.offsetParent).map(e=>e.tagName+'|'+(e.name||e.id)+'|'+(e.value||'').slice(0,60)+'|'+(e.getAttribute('data-event')||'')+'|'+(e.innerText||'').trim().slice(0,40));return o.slice(0,80)}"""))
    if mode=="getssl":
        def clk(t):
            return page.evaluate("""(t)=>{const c=[...document.querySelectorAll('*')].filter(e=>e.offsetParent&&(e.innerText||'').trim()===t&&e.children.length<=1);if(!c.length)return null;c[c.length-1].click();return c.length}""",t)
        print("tab",clk("SSL hosting")); page.wait_for_timeout(3000)
        print("get",clk("Get SSL Certificate")); page.wait_for_timeout(6000)
        print(snap(page,"getssl-dialog"))
        dlg=page.evaluate("""()=>[...document.querySelectorAll('.hb-dialog-overlay,[role=dialog],.sites-modal,.hb-dialog,.zs-dialog')].filter(e=>e.offsetParent).map(e=>e.innerText.slice(0,1500))""")
        print("DIALOG",dlg)
        for b in sys.argv[2:]:
            print("confirm",b,clk(b)); page.wait_for_timeout(15000); print(snap(page,"getssl-after"))
        t=page.locator('body').inner_text(); i=t.find('SSL hosting'); print(t[i:i+800])
    br.close()
(OUT/f'api-{mode}-{time.strftime("%H%M%S")}.json').write_text(json.dumps(api,indent=1))
for a in api:
    if a['m'] not in('GET','OPTIONS'): print(a['m'],a['s'],a['u'][-90:],'\n REQ',a['req'][:300],'\n RESP',a['b'][:800])

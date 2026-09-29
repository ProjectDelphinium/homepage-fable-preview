import importlib.util, json, sys
from pathlib import Path
ZS=Path('/workspace/delphinium-os/web-design/zoho-sites'); OUT=Path(__file__).resolve().parent/'zoho-run'/'editor'
spec=importlib.util.spec_from_file_location("v5",str(ZS/"publish_sites_v5.py")); v5=importlib.util.module_from_spec(spec); spec.loader.exec_module(v5); v3=v5.v3
from playwright.sync_api import sync_playwright
B=v5.BUILDER_BASE; SN="elm_PumRUx5r3lScT3Fw_GAxJA"
with sync_playwright() as p:
    br=p.chromium.launch(headless=True,channel="chrome",args=["--no-sandbox"]); ctx=br.new_context(viewport={"width":1440,"height":1000},storage_state=str(v5.STORAGE_SITES)); v3.install_route_guards(ctx); page=ctx.new_page()
    v5.ensure_auth_with_password(page,OUT,{"notes":[],"blockers":[]})
    page.goto(f"{B}/zcms/editor/delphinium-home",wait_until="domcontentloaded",timeout=90000); v3.wait_out_of_please_wait(page,60); page.wait_for_timeout(7000)
    c=page.evaluate("()=>document.getElementById('pagecanvas').contentWindow.zs_content_json")
    (OUT/"delphinium-home-before.json").write_text(json.dumps(c))
    E=c["page_content"]["elements"]; assert SN in E
    for v in E.values():
        if v and SN in (v.get("elements") or []): v["elements"].remove(SN)
    del E[SN]
    r=page.evaluate("""([c])=>new Promise(res=>{const cw=document.getElementById('pagecanvas').contentWindow;
       $X.put({url:app.data.api_url+'/pages/'+cw.zs_resource_id+'/save',headers:Object.assign({'X-Site-Id':'939950337','X-Site-Resource-Id':'2187225000000002005'},require('csrf').getCSRFHeader()),
        bodyJSON:Object.assign({isPatch:'false',user_save:true,ssi_data:{}},c),handler:function(){res({status:this.status,text:String(this.responseText).slice(0,300)})},error:function(){res({err:true,status:this.status})}});
       setTimeout(()=>res({timeout:true}),30000)})""",[c])
    print("SAVE",r)
    page.goto(f"{B}/zcms/editor/delphinium-home",wait_until="domcontentloaded",timeout=90000); v3.wait_out_of_please_wait(page,60); page.wait_for_timeout(6000)
    b=page.evaluate("()=>document.getElementById('pagecanvas').contentWindow.zs_content_json")
    print("snippet still present:", SN in b["page_content"]["elements"], "types:", sorted(set(v["type"] for v in b["page_content"]["elements"].values() if v)))
    br.close()

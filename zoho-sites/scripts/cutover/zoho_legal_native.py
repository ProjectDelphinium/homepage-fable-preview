"""Write native Zoho page content (heading/text elements) for /eula and /purchase-agreement via editor save API
(PUT {api}/pages/{rid}/save, isPatch=false), same call the builder makes. Usage: [--probe] [--dry]"""
import importlib.util, json, sys, re, html, secrets, base64
from pathlib import Path
HERE=Path(__file__).resolve().parent; ZS=Path('/workspace/delphinium-os/web-design/zoho-sites'); OUT=HERE/'zoho-run'/'editor'
LP=HERE/'legal-pages'
def eid(): return "elm_"+base64.urlsafe_b64encode(secrets.token_bytes(16)).decode().rstrip("=")
def inline(t):
    t=html.escape(t,quote=False)
    return t
def build(slug):
    md=(LP/f"{'eula' if slug=='eula' else 'purchase-agreement'}.md").read_text()
    lines=[l for l in md.splitlines() if not l.startswith("<!--")]
    blocks=[]; buf=[]; ul=[]
    def flush():
        nonlocal buf,ul
        if buf: blocks.append(("p",buf)); buf=[]
        if ul: blocks.append(("ul",ul)); ul=[]
    for l in lines:
        s=l.strip()
        if not s: continue
        if s.startswith("# "): flush(); blocks.append(("h1",s[2:]))
        elif s.startswith("## "): flush(); blocks.append(("h2",s[3:]))
        elif s.startswith("- "):
            if buf: blocks.append(("p",buf)); buf=[]
            ul.append(s[2:])
        else:
            if ul: blocks.append(("ul",ul)); ul=[]
            buf.append(s)
    flush()
    els={}; order=[]
    def add(typ,element):
        i=eid(); els[i]={"elementId":i,"type":typ,"element":element}; order.append(i)
    text_run=[]
    def flush_text():
        nonlocal text_run
        if text_run:
            add("text",{"classname":"","align":"left","content":"".join(text_run)}); text_run=[]
    for kind,val in blocks:
        if kind in("h1","h2"):
            flush_text(); add("heading",{"style":"none","tag":kind,"align":"left","content":html.escape(val,quote=False)})
        elif kind=="ul":
            text_run.append("<ul>"+"".join(f"<li>{inline(x)}</li>" for x in val)+"</ul>")
        else:
            for x in val: text_run.append(f"<p>{inline(x)}</p>")
    flush_text()
    # edits
    for i in order:
        e=els[i]["element"]
        if slug=="purchase-agreement":
            c=e["content"]
            c2=c.replace("This Purchase Agreement is between Delphinium, Inc. and","This Purchase Agreement is between Delphi M.E. LLC and")
            c2=c2.replace("found at https://delphi-me.com/eula,",'found at <a href="/eula">https://delphi-me.com/eula</a>,')
            e["content"]=c2
    col,row,sec=eid(),eid(),eid()
    els[col]={"elementId":col,"elements":order,"type":"column","element":{"medium_ratio":"12","extra_small_ratio":"12","small_ratio":"12","background":{"theme":"zpdefault","type":"none"},"otherClassNames":[""]}}
    els[row]={"elementId":row,"columns":[col],"type":"row","element":{"tablet_column_ratio":"12","mobile_column_ratio":"12","classNames":[""],"column_ratio":"12"}}
    els[sec]={"elementId":sec,"type":"section","rows":[row],"element":{"background":{"theme":"zpdefault","type":"none"},"otherClassNames":[""],"classNames":[""],"fluid":False}}
    return {"page_content":{"elements":els,"type":"page","sections":[sec]}}
if __name__=="__main__":
    probe="--probe" in sys.argv; dry="--dry" in sys.argv
    contents={s:build(s) for s in ("eula","purchase-agreement")}
    for s,c in contents.items():
        (OUT/f"native-{s}.json").write_text(json.dumps(c,indent=1))
        allc=" ".join(v["element"].get("content","") for v in c["page_content"]["elements"].values())
        print(s,len(c["page_content"]["elements"]),"els; Delphinium, Inc. present:","Delphinium, Inc." in allc,"; href=/eula:",'href="/eula"' in allc)
    if dry: sys.exit()
    spec=importlib.util.spec_from_file_location("v5",str(ZS/"publish_sites_v5.py")); v5=importlib.util.module_from_spec(spec); spec.loader.exec_module(v5); v3=v5.v3
    from playwright.sync_api import sync_playwright
    B=v5.BUILDER_BASE; res={}
    with sync_playwright() as p:
        br=p.chromium.launch(headless=True,channel="chrome",args=["--no-sandbox"]); ctx=br.new_context(viewport={"width":1440,"height":1000},storage_state=str(v5.STORAGE_SITES)); v3.install_route_guards(ctx); page=ctx.new_page()
        v5.ensure_auth_with_password(page,OUT,{"notes":[],"blockers":[]})
        for s,c in contents.items():
            page.goto(f"{B}/zcms/editor/{s}",wait_until="domcontentloaded",timeout=90000); v3.wait_out_of_please_wait(page,60); page.wait_for_timeout(7000)
            info=page.evaluate("()=>({csrf:typeof csrf, hx:(typeof require==='function')?require('csrf').getCSRFHeader():null, X:typeof $X, rid:document.getElementById('pagecanvas').contentWindow.zs_resource_id, api:app.data.api_url})")
            print(s,info)
            if probe: continue
            reqs=[]
            page.on("request",lambda q: reqs.append({"url":q.url,"method":q.method,"ct":q.headers.get("content-type"),"body":(q.post_data or "")[:300]}) if "/save" in q.url else None)
            r=page.evaluate("""([c])=>new Promise(res=>{const cw=document.getElementById('pagecanvas').contentWindow;
               const body=Object.assign({isPatch:'false',user_save:true,ssi_data:{}},c);
               $X.put({url:app.data.api_url+'/pages/'+cw.zs_resource_id+'/save',headers:Object.assign({'X-Site-Id':'939950337','X-Site-Resource-Id':'2187225000000002005'},require('csrf').getCSRFHeader()),bodyJSON:body,
                 handler:function(){res({status:this.status,text:String(this.responseText||'').slice(0,600)})},
                 error:function(){res({status:this.status,err:true,text:String(this.responseText||'').slice(0,600)})}});
               setTimeout(()=>res({timeout:true}),30000)})""",[c])
            page.wait_for_timeout(1500); r["reqs"]=reqs
            print(s,"SAVE",r); res[s]=r
            page.goto(f"{B}/zcms/editor/{s}",wait_until="domcontentloaded",timeout=90000); v3.wait_out_of_please_wait(page,60); page.wait_for_timeout(7000)
            back=page.evaluate("()=>document.getElementById('pagecanvas').contentWindow.zs_content_json")
            ok=json.dumps(back.get("page_content",{}).get("sections"))==json.dumps(c["page_content"]["sections"])
            txt=page.evaluate("()=>document.getElementById('pagecanvas').contentDocument.body.innerText.slice(0,300)")
            page.screenshot(path=str(OUT/f"native-{s}-editor.png"),full_page=False)
            print(s,"readback sections match:",ok,"| canvas text:",txt.replace("\n"," | ")[:250]); res[s]["readback"]=ok
        br.close()
    (OUT/"native-save-result.json").write_text(json.dumps(res,indent=1))

import json,re,time
from playwright.sync_api import sync_playwright
BASE="http://www.delphi-me.com"; R={}
with sync_playwright() as p:
    br=p.chromium.launch(headless=True,channel="chrome",args=["--no-sandbox"])
    for path,tag in (("/","home"),("/contact-us","contact-us"),("/support","support"),("/eula","eula"),("/purchase-agreement","purchase-agreement")):
        ctx=br.new_context(viewport={"width":1440,"height":900}); pg=ctx.new_page(); reqs=[]; bad=[]
        pg.on("request",lambda q: reqs.append(q.url)); pg.on("response",lambda r: bad.append((r.status,r.url)) if r.status>=400 else None)
        resp=pg.goto(BASE+path,wait_until="load",timeout=60000); pg.wait_for_timeout(5000)
        html=pg.content()
        info=pg.evaluate("""()=>{const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&r.width>0&&r.height>0};
          const imgs=[...document.images].filter(vis);return {cls:document.documentElement.className.match(/dl-path-\\w+/)?.[0],origin:document.querySelector('.dl-top')?.getAttribute('data-site-origin'),
          broken:imgs.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src).slice(0,10),nimg:imgs.length,
          cap:[...document.images].filter(i=>/captcha/i.test(i.id+i.src)&&vis(i)).map(i=>i.naturalWidth),forms:[...document.forms].filter(vis).length,
          footlinks:[...document.querySelectorAll('[data-site-path]')].map(a=>a.href).slice(0,4),h1:[...document.querySelectorAll('h1')].filter(vis).map(h=>h.innerText.slice(0,60))}}""")
        info["status"]=resp.status; info["final_url"]=pg.url
        info["hubspot_refs"]=sorted(set(re.findall(r'[\w.-]*(?:hubspot|hs-scripts|hsforms|hs-analytics|hubfs)[\w./-]*',html)))[:10]
        info["http_subresources"]=sorted(set(u for u in reqs if u.startswith("http://") and not u.startswith(BASE)))[:10]
        info["hubspot_requests"]=[u for u in reqs if re.search(r'hubspot|hsforms|hs-scripts|hubfs',u)][:5]
        info["non_dl28_img_hosts"]=sorted(set(re.sub(r'^(https?://[^/]+).*',r'\1',u) for u in reqs if re.search(r'\.(png|jpe?g|webp|svg|gif)(\?|$)',u) and not u.startswith(BASE+"/dl28")))[:10]
        info["bad"]=bad[:8]
        pg.screenshot(path=f"live-{tag}.png",full_page=(tag!="home"))
        if tag=="home": pg.screenshot(path="live-home-full.png",full_page=True)
        R[tag]=info; ctx.close()
    ctx=br.new_context(viewport={"width":390,"height":844}); pg=ctx.new_page(); pg.goto(BASE+"/",wait_until="load"); pg.wait_for_timeout(4000); pg.screenshot(path="live-home-mobile.png"); ctx.close()
    br.close()
json.dump(R,open("LIVE.json","w"),indent=1); print(json.dumps(R,indent=1))

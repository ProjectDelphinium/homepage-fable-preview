import json,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parent/'zoho-run'/'desk'
steps=sys.argv[1:]
with sync_playwright() as p:
    br=p.chromium.launch(headless=True,channel="chrome",args=["--no-sandbox"]); ctx=br.new_context(viewport={"width":1440,"height":1000},storage_state="/workspace/.secrets/browser-sessions/zoho-sites.storage.json"); pg=ctx.new_page()
    net=[]; pg.on("request",lambda q: net.append((q.method,q.url,(q.post_data or '')[:600])) if q.method in("POST","PUT","PATCH","DELETE") and 'desk.zoho.com' in q.url else None)
    pg.goto("https://desk.zoho.com/agent/delphime842/delphi-m-e/setup#setup/channels/helpcenter/webforms",wait_until="domcontentloaded",timeout=60000); pg.wait_for_timeout(10000)
    for st in steps:
        kind,_,arg=st.partition(":")
        if kind=="text":
            done=False
            for fr in pg.frames:
                loc=fr.get_by_text(arg,exact=True)
                if loc.count(): 
                    try: loc.first.click(timeout=8000); done=True; break
                    except Exception as e: print("clickfail",fr.url[:80],str(e)[:100])
            if not done:
                for fr in pg.frames:
                    loc=fr.get_by_text(arg)
                    if loc.count(): loc.first.click(timeout=8000,force=True); done=True; break
            print("clicked",arg,done)
        elif kind=="css": pg.locator(arg).first.click()
        elif kind=="fill":
            sel,_,val=arg.partition("=");pg.locator(sel).first.fill(val)
        elif kind=="fillval":
            old,_,new=arg.partition("=")
            for fr in pg.frames:
                loc=fr.locator("input[type=text]")
                for i in range(loc.count()):
                    el=loc.nth(i)
                    try:
                        if el.is_visible() and el.input_value()==old:
                            el.fill(new); print("filled",old,"->",new, el.input_value()); break
                    except Exception: pass
        elif kind=="btn":
            hit=None
            for fr in pg.frames:
                for loc in (fr.get_by_role("button",name=arg,exact=True), fr.locator(f"input[value='{arg}']"), fr.get_by_text(arg,exact=True)):
                    for i in range(loc.count()):
                        el=loc.nth(i)
                        try:
                            if el.is_visible(): el.click(timeout=5000); hit=(fr.url[:60],i); break
                        except Exception as e: print("btnerr",str(e)[:80])
                    if hit: break
                if hit: break
            print("btn",arg,hit)
        elif kind=="wait": pg.wait_for_timeout(int(arg))
        pg.wait_for_timeout(4000)
    fn=OUT/f"forms-{time.strftime('%H%M%S')}.png"; pg.screenshot(path=str(fn),full_page=True); print(fn)
    for fr in pg.frames[1:]:
        try: print("FRAME",fr.url[:100],fr.locator("body").inner_text()[:1500].replace("\n"," | "))
        except Exception: pass
    t=pg.locator("body").inner_text(); i=t.find("SELF SERVICE"); print(t[:200] if i<0 else t[i:i+3000])
    print("NET",json.dumps(net)[:3000])
    br.close()

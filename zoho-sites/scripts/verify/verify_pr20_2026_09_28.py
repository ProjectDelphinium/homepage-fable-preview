#!/usr/bin/env python3
"""Public verify of PR #20 publish on Zoho staging (read-only; never submits forms)."""
import json, time, re, difflib
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parent/'verify-2026-09-28-pr20'; OUT.mkdir(exist_ok=True)
STG="https://delphinium-marketing-staging.zohosites.com"
PREV="https://projectdelphinium.github.io/homepage-fable-preview/zoho-sites/homepage-sites-v5.html"
R={"checks":{},"detail":{}}
def chk(k,v,d=None):
    R["checks"][k]=bool(v)
    if d is not None: R["detail"][k]=d
VIS="""(sel)=>[...document.querySelectorAll(sel)].filter(e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0}).length"""
def goto(pg,path):
    pg.goto(STG+path+("&" if "?" in path else "?")+f"v={int(time.time())}",wait_until="load",timeout=60000); pg.wait_for_timeout(5000)
def settle(pg):
    for y in range(0,pg.evaluate("document.body.scrollHeight"),700): pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(120)
    pg.wait_for_timeout(1500); pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(800)
with sync_playwright() as p:
    br=p.chromium.launch(headless=True,channel="chrome",args=["--no-sandbox"])
    # ---- home at 1440 and 390
    for w,h,tag in ((1440,900,"desktop"),(390,844,"mobile")):
        ctx=br.new_context(viewport={"width":w,"height":h}, device_scale_factor=1); pg=ctx.new_page()
        imgs=[]; reqs=[]; errs=[]
        pg.on("request",lambda rq: (reqs.append(rq.url), imgs.append(rq.url) if rq.resource_type=="image" else None))
        pg.on("console",lambda m: errs.append(m.text[:200]) if m.type=="error" else None)
        goto(pg,"/"); settle(pg)
        pg.screenshot(path=str(OUT/f"home-{tag}.png")); pg.screenshot(path=str(OUT/f"home-{tag}-full.png"),full_page=True)
        body=pg.evaluate("()=>document.body.innerText")
        home_main=pg.evaluate("()=>{const m=document.querySelector('main.dl-home');return m?m.innerText:''}")
        R["detail"][f"home_{tag}_height"]=pg.evaluate("document.documentElement.scrollHeight")
        R["detail"][f"home_{tag}_visible_counts"]={s:pg.evaluate(VIS,s) for s in ["main.dl-home","main.dl-sub",".dl-top",".dl-footer","h1"]}
        ihosts={}
        for u in imgs:
            h_=urlparse(u).hostname or "data"; ihosts.setdefault(h_,[]).append(urlparse(u).path[:80])
        dom_imgs=pg.evaluate("()=>[...document.querySelectorAll('img')].filter(i=>i.currentSrc||i.src).map(i=>i.currentSrc||i.src)")
        R["detail"][f"home_{tag}_image_hosts"]={k:sorted(set(v))[:40] for k,v in ihosts.items()}
        bad=[u for u in imgs+dom_imgs if re.search(r'githubusercontent|github\.io|github\.com|hubspot|hubfs|hs-fs|delphi-me\.com',u)]
        stg_non_dl28=[u for u in imgs+dom_imgs if urlparse(u).hostname and 'zohosites.com' in urlparse(u).hostname and not urlparse(u).path.startswith('/dl28-')]
        chk(f"home_{tag}_no_hotlinks",not bad,bad[:10])
        chk(f"home_{tag}_all_our_images_dl28", not stg_non_dl28, {"staging_non_dl28":stg_non_dl28[:10],"other_hosts":[k for k in ihosts if 'zohosites' not in k]})
        broken=pg.evaluate("()=>[...document.querySelectorAll('main.dl-home img, .dl-top img, .dl-footer img')].filter(i=>i.complete&&i.naturalWidth===0&&(i.currentSrc||i.src)).map(i=>i.currentSrc||i.src)")
        chk(f"home_{tag}_no_broken_images",not broken,broken)
        if tag=="desktop":
            for s in ["teach into","reveal who needs help","in progress","mass messages"]: chk(f"copy '{s}'", s in body)
            chk("copy no comma after 'runs on Canvas'", "runs on Canvas," not in body and "runs on Canvas" in body)
            chk("home_single_homepage", R["detail"]["home_desktop_visible_counts"]["main.dl-home"]==1 and R["detail"]["home_desktop_visible_counts"]["main.dl-sub"]==0, R["detail"]["home_desktop_visible_counts"])
            R["detail"]["console_errors"]=errs[:20]
            # interactions
            def modal_open(sel_click, modal_id, shot):
                try:
                    pg.locator(sel_click).first.scroll_into_view_if_needed(); pg.locator(sel_click).first.click(timeout=6000); pg.wait_for_timeout(3500)
                    st=pg.evaluate("""(id)=>{const m=document.getElementById(id);if(!m)return {exists:false};const s=getComputedStyle(m);const f=m.querySelector('iframe,video');return {exists:true,vis:!m.hidden&&s.display!=='none'&&s.visibility!=='hidden',media:f?(f.src||f.currentSrc||'').slice(0,120):null}}""",modal_id)
                    pg.screenshot(path=str(OUT/shot)); pg.keyboard.press("Escape"); pg.wait_for_timeout(900); return st
                except Exception as e: return {"err":str(e)[:200]}
            yt=modal_open("main.dl-home [data-youtube]","dl-modal","modal-watch-youtube.png"); chk("watch_modal_youtube_opens", yt.get("vis"), yt)
            mx=pg.locator("main.dl-home [data-mux]").count()
            if mx:
                m2=modal_open("main.dl-home [data-mux]","dl-modal","modal-watch-mux.png"); chk("watch_modal_mux_opens", m2.get("vis"), m2)
            bk=modal_open("main.dl-home [data-bookings-open]","dl-book-modal","modal-bookings.png"); chk("bookings_modal_opens", bk.get("vis") and bk.get("media") and "zohobookings" in bk.get("media",""), bk)
            pg.wait_for_timeout(1000)
            ct=modal_open("[data-contact-open]","dl-contact-modal","modal-contact.png"); chk("contact_modal_opens", ct.get("vis"), ct)
        ctx.close()
    # ---- subpages at 1440 (+390 for forms)
    def sub(path, tag, w=1440, h=900):
        ctx=br.new_context(viewport={"width":w,"height":h}); pg=ctx.new_page(); goto(pg,path)
        info=pg.evaluate("""()=>{const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
          const subs=[...document.querySelectorAll('main.dl-sub')].filter(vis).map(m=>m.getAttribute('data-dl-page'));
          const cap=[...document.querySelectorAll('img')].filter(i=>/Captcha|zsCaptcha|captcha/i.test((i.id||'')+(i.src||''))&&vis(i)).map(i=>({id:i.id,src:(i.currentSrc||i.src).slice(0,90),nw:i.naturalWidth,complete:i.complete}));
          const forms=[...document.querySelectorAll('form')].filter(vis).map(f=>({id:f.id,action:f.action,fields:f.querySelectorAll('input:not([type=hidden]),textarea,select').length}));
          return {cls:document.documentElement.className,home_visible:vis(document.querySelector('main.dl-home')),subs,nav:vis(document.querySelector('.dl-top')),footer:vis(document.querySelector('.dl-footer')),forms,cap,
            h1:[...document.querySelectorAll('h1')].filter(vis).map(h=>h.innerText.trim().slice(0,80)),text:(document.querySelector('main.dl-sub:not([hidden])')||{}).innerText?.slice(0,300)||'',
            native:(()=>{const a=document.querySelector('.theme-content-area');const z=[...document.querySelectorAll('.theme-content-area .zpsection')].filter(vis);return {sections_visible:z.length,text:a&&vis(a)?a.innerText:'',links:a?[...a.querySelectorAll('a')].map(x=>x.getAttribute('href')):[],lis:a?a.querySelectorAll('li').length:0,h2:a?[...a.querySelectorAll('h2')].filter(vis).length:0}})()}}""")
        pg.screenshot(path=str(OUT/f"{tag}.png"),full_page=True); ctx.close(); return info
    for path,tag,key in (("/contact-us","contact-us","contact"),("/support","support","support")):
        info=sub(path,tag); R["detail"][tag]=info
        chk(f"{tag}_renders_form", key in info["subs"] and not info["home_visible"] and info["forms"], None)
        chk(f"{tag}_captcha_loaded", any(c["nw"]>0 for c in info["cap"]), None)
        info_m=sub(path,tag+"-mobile",390,844); R["detail"][tag+"-mobile"]={k:info_m[k] for k in("subs","home_visible","cap")}
    for path,tag,key in (("/eula","eula","eula"),("/purchase-agreement","purchase-agreement","agree")):
        info=sub(path,tag); R["detail"][tag]=info
        nt=info["native"]; t=nt["text"]
        chk(f"{tag}_native_content_visible", nt["sections_visible"]>0 and not info["subs"] and not info["home_visible"] and info["nav"] and info["footer"], {"sections":nt["sections_visible"],"len":len(t),"h1":info["h1"]})
        if key=="eula":
            chk("eula_text_ok", "DELPHINIUM END USER LICENSE AGREEMENT" in t and "Communications: Licensee consents" in t and nt["lis"]==10 and "Almost before we knew it" not in t, {"lis":nt["lis"]})
        else:
            chk("agree_text_ok", "This Purchase Agreement is between Delphi M.E. LLC and Purchaser" in t and "Delphinium, Inc." not in t and "e. Limits on Use." in t and nt["h2"]==16 and "/eula" in nt["links"] and not any("delphi-me.com" in (l or "") for l in nt["links"]), {"h2":nt["h2"],"links":nt["links"]})
        info_m=sub(path,tag+"-mobile",390,844); R["detail"][tag+"-mobile"]={"sections":info_m["native"]["sections_visible"],"len":len(info_m["native"]["text"])}
        chk(f"{tag}_mobile_native_visible", info_m["native"]["sections_visible"]>0 and len(info_m["native"]["text"])>500, None)
    for path,tag in (("/about-us","other-about-us"),("/zz-nonexistent-path","other-404")):
        info=sub(path,tag); R["detail"][tag]=info
        chk(f"{tag}_nav_footer_only", info["nav"] and info["footer"] and not info["home_visible"] and not info["subs"])
    # ---- compare with Pages preview
    for w,h,tag in ((1440,900,"desktop"),(390,844,"mobile")):
        ctx=br.new_context(viewport={"width":w,"height":h}); pg=ctx.new_page()
        pg.goto(PREV+f"?v={int(time.time())}",wait_until="load",timeout=60000); pg.wait_for_timeout(5000); settle(pg)
        pg.screenshot(path=str(OUT/f"preview-{tag}.png")); pg.screenshot(path=str(OUT/f"preview-{tag}-full.png"),full_page=True)
        pv=pg.evaluate("()=>{const m=document.querySelector('main');return m?m.innerText:document.body.innerText}")
        R["detail"][f"preview_{tag}_height"]=pg.evaluate("document.documentElement.scrollHeight")
        ctx.close()
        ctx=br.new_context(viewport={"width":w,"height":h}); pg=ctx.new_page(); goto(pg,"/"); settle(pg)
        st=pg.evaluate("()=>{const m=document.querySelector('main.dl-home');return m?m.innerText:''}"); ctx.close()
        norm=lambda s:[l.strip() for l in s.splitlines() if l.strip()]
        a,b=norm(pv),norm(st); diff=[d for d in difflib.unified_diff(a,b,'preview','staging',lineterm='',n=0) if not d.startswith(('---','+++','@@'))]
        (OUT/f"text-diff-{tag}.txt").write_text("\n".join(diff))
        hp,hs=R["detail"][f"preview_{tag}_height"],R["detail"][f"home_{tag}_height"]
        chk(f"home_{tag}_text_matches_preview", not diff, diff[:12])
        chk(f"home_{tag}_height_within_3pct_of_preview", abs(hp-hs)/hp<0.03, {"preview":hp,"staging":hs})
    br.close()
(OUT/"VERIFY.json").write_text(json.dumps(R,indent=1))
for k,v in R["checks"].items(): print(("PASS " if v else "FAIL ")+k)

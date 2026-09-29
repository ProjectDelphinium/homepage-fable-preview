#!/usr/bin/env python3
"""Run publish_sites_v5.py against the 2026-09-28 local-laptop pack (staging only).

Overrides only: HTML_PATH, OUT, public verify checks (new copy), and a richer verify pack
(logo nav/footer, bookings modal, console errors, Zoho badge). All paste/publish logic is v5's.
"""
import importlib.util, json, time
from pathlib import Path
ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("v5", str(ROOT / "publish_sites_v5.py"))
v5 = importlib.util.module_from_spec(spec); spec.loader.exec_module(v5)
v5.HTML_PATH = ROOT / "homepage-sites-v5.zoho-ready.2026-09-28-local-v2.html"
v5.OUT = ROOT / "verify-2026-09-28-cursor-local-publish"
LOGO = "/dl28-logo-new.svg"
_orig_verify = v5.verify_public

def verify_public(out):
    r = _orig_verify(out)
    if "checks" not in r: return r
    html = (out / "public-live.html").read_text(encoding="utf-8", errors="replace")
    c = r["checks"]
    c.update({
        "hero_muted_first_line": 'dl-hero__muted">Canvas delivers content.' in html,
        "lead_just_turn_it_on_em": "<em>Just turn it on.</em>" in html,
        "cover_cut_failures_up_to": "Cut failures, up to" in html,
        "logo_new_svg_pinned": LOGO in html,
        "contact_modal": "dl-contact-modal" in html,
        "contact_web_to_case": "crm.zoho.com/crm/WebToCaseForm" in html,
        "powered_by_zoho_text": ("created using Zoho Sites" in html) or ("Made with Zoho" in html),
    })
    need = ["canvas_delivers", "data_bookings_open", "dl_book_modal", "portal_embed",
            "cta_href", "education_moved_online_comma", "teachers_can_read_the_room", "dl_h2_plain",
            "hero_muted_first_line", "lead_just_turn_it_on_em", "cover_cut_failures_up_to", "logo_new_svg_pinned", "contact_modal"]
    r["ok"] = all(c.get(k) for k in need)
    r["note"] = "cut_failures_by_up_to superseded by 'Cut failures, up to' (Jared PR #19 copy)"
    return r

def capture_verify_pack(out, result):
    from playwright.sync_api import sync_playwright
    errs, fails = [], []
    with sync_playwright() as p:
        br = p.chromium.launch(headless=True, channel="chrome", args=["--no-sandbox", "--disable-dev-shm-usage"])
        for vp, tag in (({"width": 1280, "height": 900}, ""), ({"width": 390, "height": 844}, "-mobile")):
            page = br.new_page(viewport=vp)
            if not tag:
                page.on("console", lambda m: errs.append(m.text[:300]) if m.type == "error" else None)
                page.on("pageerror", lambda e: errs.append("PAGEERROR " + str(e)[:300]))
                page.on("requestfailed", lambda rq: fails.append(rq.url[:200]))
            page.goto(v5.STAGING_PUBLIC + f"?v={int(time.time())}", wait_until="networkidle", timeout=90000)
            page.wait_for_timeout(2500)
            page.screenshot(path=str(out / f"V-hero{tag}.png"))
            if tag:
                page.close(); continue
            result["hero_dom"] = page.evaluate("""()=>{const h=document.querySelector('.dl-hero__h1');const m=document.querySelector('.dl-hero__muted');const lead=document.querySelector('.dl-hero__lead');
              return {h1:h?h.innerText:null, muted:m?m.innerText:null, muted_color:m?getComputedStyle(m).color:null, muted_display:m?getComputedStyle(m).display:null,
                h1_font:h?getComputedStyle(h).fontFamily:null, lead:lead?lead.innerText:null, lead_em:lead&&lead.querySelector('em')?getComputedStyle(lead.querySelector('em')).fontStyle:null,
                upto:(document.querySelector('.dl-cover__upto')||{}).innerText||null, eyebrow_in_hero:!!(document.querySelector('.dl-hero__inner')||document.body).querySelector('.dl-eyebrow')}}""")
            result["logo_dom"] = page.evaluate("""()=>[...document.querySelectorAll('img')].filter(i=>/logo-new\\.svg/.test(i.src)).map(i=>({src:i.src.slice(-60),complete:i.complete,nw:i.naturalWidth,nh:i.naturalHeight,w:i.getBoundingClientRect().width,in_nav:!!i.closest('.dl-nav,header'),in_footer:!!i.closest('footer,.dl-footer')}))""")
            result["footer_logo_dom"] = page.evaluate("""()=>{const f=document.querySelector('.dl-footer, footer');if(!f)return null;const svg=f.querySelector('svg[viewBox="0 0 318.07 225.8"]');const img=f.querySelector('img');return {footer_svg_inline:!!svg, svg_w: svg?svg.getBoundingClientRect().width:0, footer_img: img? img.src.slice(-60):null}}""")
            nav = page.locator(".dl-nav").first
            try: nav.screenshot(path=str(out / "V-nav-logo.png"))
            except Exception as e: result["notes"].append(f"nav_shot_err={e}")
            ok = False
            try:
                page.locator("[data-bookings-open]").first.click(timeout=5000); page.wait_for_timeout(4000)
                ok = page.evaluate("""()=>{const m=document.getElementById('dl-book-modal');if(!m)return false;const vis=!m.hidden&&getComputedStyle(m).display!=='none';const f=m.querySelector('iframe');return {vis, iframe: f?f.src.slice(0,120):null}}""")
                page.screenshot(path=str(out / "V-bookings-modal.png"))
                page.keyboard.press("Escape"); page.wait_for_timeout(800)
            except Exception as e:
                result["notes"].append(f"bookings_click_err={str(e)[:160]}"); page.screenshot(path=str(out / "V-bookings-fail.png"))
            result["bookings_modal_ok"] = bool(ok and ok.get("vis")); result["bookings_modal_detail"] = ok
            try:
                page.locator("[data-contact-open]").first.click(timeout=5000); page.wait_for_timeout(1200)
                page.screenshot(path=str(out / "V-contact-modal.png"))
                result["contact_modal_open"] = page.evaluate("""()=>{const m=document.getElementById('dl-contact-modal');return !!m && !m.hidden && getComputedStyle(m).display!=='none'}""")
                page.keyboard.press("Escape"); page.wait_for_timeout(600)
            except Exception as e:
                result["notes"].append(f"contact_click_err={str(e)[:160]}")
            for y, n in ((1200, "makeover"), (2800, "product")):
                page.evaluate(f"window.scrollTo(0,{y})"); page.wait_for_timeout(700); page.screenshot(path=str(out / f"V-{n}.png"))
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)"); page.wait_for_timeout(1200)
            page.screenshot(path=str(out / "V-footer.png"))
            result["zoho_badge_visible"] = page.evaluate("""()=>{const t=document.body.innerText;return /created using Zoho Sites|Made with Zoho|Powered by Zoho/i.test(t)}""")
            page.screenshot(path=str(out / "V-fullpage.png"), full_page=True)
            page.close()
        br.close()
    result["console_errors"] = errs[:40]; result["failed_requests"] = fails[:40]


import split_pack_2026_09_28 as splitpack
v3 = v5.v3

def _save_code(page, pane, submit, code, out, tag, result):
    v3.goto_code_tab(page, pane.strip("#").split("-")[0] if False else {"#header-c":"header","#footer-c":"footer"}[pane],
                     {"#header-c":"Header Code","#footer-c":"Footer Code"}[pane], out, tag)
    v3.set_codemirror(page, code, pane)
    try:
        page.evaluate("(p)=>{const el=document.querySelector(p+' .CodeMirror')||document.querySelector('.CodeMirror'); if(el){el.scrollIntoView(); el.CodeMirror&&el.CodeMirror.focus();}}", pane)
        page.keyboard.press("Control+A"); page.keyboard.insert_text(code); page.wait_for_timeout(600)
        page.evaluate("(s)=>{const b=document.querySelector(s); if(b){b.disabled=false;b.removeAttribute('disabled');b.classList.remove('disabled');}}", submit)
        page.locator(submit).click(timeout=6000, force=True); page.wait_for_timeout(2500)
    except Exception as e:
        result["evidence"].append(f"{tag}_save_err={str(e)[:200]}")
    v3.shot(page, out, tag + "-saved")
    v3.goto_code_tab(page, {"#header-c":"header","#footer-c":"footer"}[pane], {"#header-c":"Header Code","#footer-c":"Footer Code"}[pane], out, tag + "-reload")
    val = page.evaluate("(p)=>{const el=document.querySelector(p+' .CodeMirror')||document.querySelector('.CodeMirror');return el&&el.CodeMirror?el.CodeMirror.getValue():''}", pane)
    ok = val.replace("\r", "").rstrip() == code.replace("\r", "").rstrip()
    result["evidence"].append(f"{tag}: want={len(code)} got={len(val)} exact={ok}")
    return ok, len(val)

def update_home(page, out, result):
    parts = v5.html_parts()
    full = parts["header_code"]
    # Custom CSS: select-all + insert (plain setValue + textarea sync doubled the CSS on save)
    css = parts["style_combined"]
    v3.goto_code_tab(page, "customcss", "Custom CSS", out, "M1-css")
    v3.set_codemirror(page, css)
    try:
        page.evaluate("()=>{const el=document.querySelector('.CodeMirror'); if(el){el.scrollIntoView(); el.CodeMirror&&el.CodeMirror.focus();}}")
        page.keyboard.press("Control+A"); page.keyboard.insert_text(css); page.wait_for_timeout(800)
        page.evaluate("()=>{for(const ta of document.querySelectorAll('#customcss_textarea, textarea.sites-codetext')){ta.value='';}}")
        page.evaluate("()=>{const el=document.querySelector('.CodeMirror'); if(el&&el.CodeMirror){el.CodeMirror.save&&el.CodeMirror.save();}}")
        page.locator("button[data-event*='saveCustomCSS']").click(timeout=5000, force=True); page.wait_for_timeout(2500)
        result["notes"].append("custom_css_saved")
    except Exception as e:
        result["evidence"].append(f"css_save_err={str(e)[:160]}")
    v3.goto_code_tab(page, "customcss", "Custom CSS", out, "M1-css-reload")
    result["evidence"].append(f"css_reload len={v3.cm_len(page)} want={len(css)}")
    # Try full Header Code first (no 45k client-side cap)
    ok, got = False, -1  # full-header attempt skipped (run2 showed it does not persist); go straight to split
    if ok:
        result["notes"].append("mode=full_header")
        empty = "<!-- Delphinium v5 2026-09-28 local pack: body in Header Code; footer cleared -->\n"
        _save_code(page, "#footer-c", "#footer_submit", empty, out, "M3-footer-clear", result)
        return True
    result["notes"].append(f"full header not persisted (got {got}); mode=split header/footer")
    A, B = splitpack.build(full)
    okA, _ = _save_code(page, "#header-c", "#header_submit", A, out, "M2-header-split", result)
    okB, _ = _save_code(page, "#footer-c", "#footer_submit", B, out, "M3-footer-split", result)
    result["notes"].append(f"split okA={okA} okB={okB} lenA={len(A)} lenB={len(B)}")
    if not (okA and okB):
        result["blockers"].append("Split Header/Footer code did not persist exactly — check M2/M3 screenshots")
        return False
    return True

v5.update_home = update_home

v5.OUT = ROOT / "verify-2026-09-28-layout-fix" / "publish"
v5.OUT.mkdir(parents=True, exist_ok=True)
v5.HIRES_NEEDLE = "dl28-"
v5.verify_public = verify_public
v5.capture_verify_pack = capture_verify_pack
if __name__ == "__main__":
    raise SystemExit(v5.main())

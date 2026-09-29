#!/usr/bin/env python3
"""Publish PR #20 dist (ProjectDelphinium/homepage-fable-preview @ c3ea350; earlier 37561420) to Zoho staging, site-wide:
Custom CSS <- dist/homepage-sites-v5.zoho-custom.css, Header Code <- zoho-header.html, Footer Code <- zoho-footer.html.
Reuses v5 auth/publish + the 2026-09-28 local wrapper's _save_code (exact read-back). Staging only; no domain/SSL changes."""
import importlib.util, json, sys, time
from pathlib import Path
ROOT = Path(__file__).resolve().parent
DIST = Path(next((a for a in sys.argv[1:] if not a.startswith("--")), "/workspace/scratch-pr20/zoho-sites/dist"))
spec = importlib.util.spec_from_file_location("w", str(ROOT / "publish_sites_v5_2026_09_28_local.py"))
w = importlib.util.module_from_spec(spec); spec.loader.exec_module(w)
v5, v3 = w.v5, w.v5.v3
OUT = ROOT / "verify-2026-09-28-pr20" / "publish"; OUT.mkdir(parents=True, exist_ok=True)
CSS = (DIST / "homepage-sites-v5.zoho-custom.css").read_text(encoding="utf-8")
HDR = (DIST / "homepage-sites-v5.zoho-header.html").read_text(encoding="utf-8").lstrip()  # Zoho trims leading whitespace
FTR = (DIST / "homepage-sites-v5.zoho-footer.html").read_text(encoding="utf-8").lstrip()
assert len(HDR) < 44900 and len(FTR) < 44900, (len(HDR), len(FTR))

def save_css(page, result):
    v3.goto_code_tab(page, "customcss", "Custom CSS", OUT, "M1-css")
    v3.set_codemirror(page, CSS)
    page.evaluate("()=>{const el=document.querySelector('.CodeMirror'); if(el){el.scrollIntoView(); el.CodeMirror&&el.CodeMirror.focus();}}")
    page.keyboard.press("Control+A"); page.keyboard.insert_text(CSS); page.wait_for_timeout(800)
    page.evaluate("()=>{for(const ta of document.querySelectorAll('#customcss_textarea, textarea.sites-codetext')){ta.value='';}}")
    page.evaluate("()=>{const el=document.querySelector('.CodeMirror'); if(el&&el.CodeMirror){el.CodeMirror.save&&el.CodeMirror.save();}}")
    page.locator("button[data-event*='saveCustomCSS']").click(timeout=5000, force=True); page.wait_for_timeout(3000)
    v3.goto_code_tab(page, "customcss", "Custom CSS", OUT, "M1-css-reload")
    val = page.evaluate("()=>{const el=document.querySelector('.CodeMirror');return el&&el.CodeMirror?el.CodeMirror.getValue():''}")
    ok = val.replace("\r", "").rstrip() == CSS.replace("\r", "").rstrip()
    result["evidence"].append(f"css want={len(CSS)} got={len(val)} exact={ok}")
    return ok

def main():
    result = {"evidence": [], "notes": [], "blockers": [], "started": time.strftime("%H:%M:%S")}
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        br = p.chromium.launch(headless=True, channel="chrome", args=["--no-sandbox", "--disable-dev-shm-usage"])
        ctx = br.new_context(viewport={"width": 1440, "height": 960}, storage_state=str(v5.STORAGE_SITES), ignore_https_errors=True)
        v3.install_route_guards(ctx); page = ctx.new_page(); page.set_default_timeout(30000)
        if not v5.ensure_auth_with_password(page, OUT, result):
            print(json.dumps(result)); return 4
        if "--publish-only" in sys.argv:
            okC = okH = okF = True; result["notes"].append("publish-only: code saved in prior run (footer differed only by 2 leading newlines Zoho trims)")
        else:
            okC = save_css(page, result)
            okH, _ = w._save_code(page, "#header-c", "#header_submit", HDR, OUT, "M2-header", result)
            okF, _ = w._save_code(page, "#footer-c", "#footer_submit", FTR, OUT, "M3-footer", result)
        result.update(css_ok=okC, header_ok=okH, footer_ok=okF)
        if okC and okH and okF and "--no-publish" in sys.argv:
            result["notes"].append("saved; publish skipped (--no-publish)"); result["published"]=None
        elif okC and okH and okF:
            pub = v3.publish_site(page, OUT, result); result["published"] = bool(pub or result.get("publish_post_200"))
        else:
            result["blockers"].append("code did not persist exactly; NOT publishing")
        try: v3.save_storage(ctx, result)
        except Exception as e: result["notes"].append(f"storage_save_err={e}")
        br.close()
    result["finished"] = time.strftime("%H:%M:%S")
    result.pop("publish_network", None)
    (OUT / "RESULT.json").write_text(json.dumps(result, indent=1))
    print(json.dumps({k: result[k] for k in result if k != "evidence"}, indent=1)); print("\n".join(result["evidence"][-8:]))
    return 0 if (result.get("published") or result.get("css_ok") and result.get("header_ok") and result.get("footer_ok")) else 1

if __name__ == "__main__":
    raise SystemExit(main())

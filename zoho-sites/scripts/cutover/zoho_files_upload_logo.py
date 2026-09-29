#!/usr/bin/env python3
"""Upload dl28-* assets to Zoho Sites Files > Document root (staging site 2187225000000002005), publish them, report public URLs. No deletes."""
import importlib.util, json, sys, time, urllib.request
from pathlib import Path
ROOT=Path('/workspace/delphinium-os/web-design/zoho-sites'); OUT=Path('/workspace/delphinium-os/web-design/cutover/zoho-run/files'); OUT.mkdir(parents=True,exist_ok=True)
SRC=ROOT/'assets/zoho-upload-2026-09-28'
spec=importlib.util.spec_from_file_location("v5",str(ROOT/"publish_sites_v5.py")); v5=importlib.util.module_from_spec(spec); spec.loader.exec_module(v5); v3=v5.v3
files=sorted(str(p) for p in SRC.glob('dl28-*'))
if len(sys.argv)>1: files=[f for f in files if any(a in f for a in sys.argv[1:])]
from playwright.sync_api import sync_playwright
log=[]; res={"notes":[],"blockers":[]}
with sync_playwright() as p:
    br=p.chromium.launch(headless=True,channel="chrome",args=["--no-sandbox"]); ctx=br.new_context(viewport={"width":1440,"height":1000},storage_state=str(v5.STORAGE_SITES)); v3.install_route_guards(ctx); page=ctx.new_page()
    page.on("response", lambda r: log.append({"m":r.request.method,"s":r.status,"u":r.url[:220],"b":(r.text()[:600] if r.request.method=="POST" else "")}) if r.request.resource_type in ("xhr","fetch") else None)
    if not v5.ensure_auth_with_password(page, OUT, res): print(res); sys.exit(4)
    page.goto(f"{v5.BUILDER_BASE}/zcms/{v5.SITE_ID}/files/directory/{v5.SITE_ID}",wait_until="domcontentloaded"); v3.wait_out_of_please_wait(page,30); page.wait_for_timeout(3000)
    for i in range(0,len(files),5):
        page.locator("#images_dropzone").set_input_files(files[i:i+5]); page.wait_for_timeout(9000)
        v3.wait_out_of_please_wait(page,60)
    page.wait_for_timeout(5000); page.screenshot(path=str(OUT/'after-upload.png'))
    page.reload(wait_until="domcontentloaded"); v3.wait_out_of_please_wait(page,30); page.wait_for_timeout(4000)
    for _ in range(5):
        try: page.locator("text=Load more files").first.click(timeout=2000); page.wait_for_timeout(2000)
        except Exception: break
    page.screenshot(path=str(OUT/'after-upload-reload.png'), full_page=True)
    (OUT/'files-body.txt').write_text(page.locator('body').inner_text())
    br.close()
(OUT/'upload-xhr.json').write_text(json.dumps(log,indent=1))
print(json.dumps([l for l in log if l["m"]=="POST"][:40],indent=1)[:8000])

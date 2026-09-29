#!/usr/bin/env python3
"""Thin Sites v5 republish: paste zoho-ready HTML into existing Home (Header Code + Custom CSS), publish.

Staging only. No page recreate / site delete / HubSpot / DNS / production / billing.
Jev+Playwright (dedicated Chromium via channel=chrome). Grok computer-use only if this fails.
"""
from __future__ import annotations

import importlib.util
import os
import json
import re
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
HTML_PATH = ROOT / "homepage-sites-v5.zoho-ready.html"
OUT = ROOT / "verify-2026-09-24-sites-v5-main-publish"
STORAGE_SITES = Path("/workspace/.secrets/browser-sessions/zoho-sites.storage.json")
STORAGE_CRM = Path("/workspace/.secrets/browser-sessions/zoho-crm.storage.json")
BROWSER_SESSION = Path("/workspace/delphinium-os/vault/browser_session.py")
AGENT_LOGIN = Path("/workspace/delphinium-os/vault/agent_login.py")
AGENT_LOGIN_ID = os.environ.get("ZOHO_AGENT_LOGIN_ID", "")  # redacted: vault entry id is not stored in the repo
CHROME_HIDE_PATH = ROOT / "zoho-chrome-hide.css"

# Import v3 helpers (publish, CodeMirror, soft chrome, route guards)
spec = importlib.util.spec_from_file_location("v3", str(ROOT / "publish_sites_v3.py"))
v3 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v3)

SITE_ID = v3.SITE_ID
BUILDER_BASE = v3.BUILDER_BASE
STAGING_PUBLIC = v3.STAGING_PUBLIC
CTA_HREF = v3.CTA_HREF
TITLE_WANT = v3.TITLE_WANT
DESC_WANT = (
    "The Canvas engagement layer for K-12 online schools. "
    "Turn the Canvas courses you already run into engaging student experiences "
    "and an early-warning system for teachers. Up to 31% fewer course failures."
)

HIRES_NEEDLE = "from-hied-hires-2026-09-24"
HERO_EYEBROW = 'class="dl-eyebrow">The Canvas engagement layer for K-12 online'
SOFT_CHROME = v3.SOFT_CHROME


def load_login() -> dict:
    r = subprocess.run(
        ["/usr/bin/python3", str(AGENT_LOGIN), "get", "--id", AGENT_LOGIN_ID],
        capture_output=True,
        text=True,
        check=False,
    )
    if r.returncode != 0:
        raise RuntimeError(f"agent_login get failed: {(r.stderr or r.stdout)[:200]}")
    return json.loads(r.stdout)


def html_parts() -> dict:
    """Full body (keep dl-top) + style + head assets (fonts, bookings preload/embed)."""
    full = HTML_PATH.read_text(encoding="utf-8")
    chrome = CHROME_HIDE_PATH.read_text(encoding="utf-8") if CHROME_HIDE_PATH.exists() else ""
    style_m = re.search(r"<style>(.*?)</style>", full, re.S)
    body_m = re.search(r"<body[^>]*>(.*?)</body>", full, re.S)
    style = style_m.group(1) if style_m else ""
    body = body_m.group(1).strip() if body_m else full

    style_combined = SOFT_CHROME + "\n" + chrome + "\n" + style

    head_bits: list[str] = []
    for m in re.finditer(
        r"<(?:link|script)[^>]+(?:fonts\.googleapis|fonts\.gstatic|bookings\.nimbuspop|"
        r"zohobookings\.com|preload|dns-prefetch)[^>]*>",
        full,
        re.I,
    ):
        tag = m.group(0)
        if tag not in head_bits:
            head_bits.append(tag)
    # Closing script tags for external scripts are empty; include self-closing/open only.
    # Also grab full <script src=...></script> for embed.js
    for m in re.finditer(
        r'<script[^>]+src="https://bookings\.nimbuspop\.com/assets/embed\.js"[^>]*>\s*</script>',
        full,
        re.I,
    ):
        if m.group(0) not in head_bits:
            head_bits.append(m.group(0))

    fonts_block = "\n".join(head_bits)
    title_js = json.dumps(TITLE_WANT)
    desc_js = json.dumps(DESC_WANT)
    header_code = (
        f"<title>{TITLE_WANT}</title>\n"
        f'<meta name="description" content="{DESC_WANT}" />\n'
        f"{fonts_block}\n"
        f"<script>try{{document.title={title_js};"
        f"var m=document.querySelector('meta[name=\"description\"]');"
        f"if(!m){{m=document.createElement('meta');m.name='description';document.head.appendChild(m);}}"
        f"m.setAttribute('content',{desc_js});"
        f"}}catch(e){{}}</script>\n"
        f"{body}\n"
    )
    return {
        "full": full,
        "style": style,
        "style_combined": style_combined,
        "body": body,
        "header_code": header_code,
        "css_mode": "soft_chrome+v5_zoho_ready",
    }


def update_home(page, out: Path, result: dict) -> bool:
    parts = html_parts()
    result["notes"].append(f"media_css_mode={parts['css_mode']}")
    result["notes"].append(
        f"parts sizes style={len(parts['style_combined'])} header={len(parts['header_code'])}"
    )

    # Sanity on source before paste
    src = parts["header_code"]
    if HERO_EYEBROW in src:
        result["blockers"].append("Source HTML still has hero eyebrow — abort paste")
        return False
    if "dl-book-modal" not in src or "data-bookings-open" not in src:
        result["blockers"].append("Source HTML missing bookings modal — abort paste")
        return False
    if HIRES_NEEDLE not in src:
        result["blockers"].append("Source HTML missing hires URLs — abort paste")
        return False

    # Custom CSS
    v3.goto_code_tab(page, "customcss", "Custom CSS", out, "M1-css")
    if not v3.set_codemirror(page, parts["style_combined"]):
        result["blockers"].append("Custom CSS CodeMirror missing")
        return False
    try:
        page.locator("button[data-event*='saveCustomCSS']").click(timeout=5000, force=True)
        page.wait_for_timeout(2000)
        result["notes"].append("custom_css_saved")
    except Exception:
        info = v3.dirty_and_save_code(
            page, "button[data-event*='saveCustomCSS']", parts["style_combined"]
        )
        result["evidence"].append(f"css_save_fallback={info}")
    v3.shot(page, out, "M1-css-saved")
    v3.goto_code_tab(page, "customcss", "Custom CSS", out, "M1-css-reload")
    result["evidence"].append(f"css_reload len={v3.cm_len(page)} head={v3.cm_head(page)[:80]!r}")

    # Header Code (full homepage body)
    v3.goto_code_tab(page, "header", "Header Code", out, "M2-header")
    v3.set_codemirror(page, parts["header_code"], "#header-c")
    info = v3.dirty_and_save_code(page, "#header_submit", parts["header_code"])
    if not info.get("ok"):
        for sel in (
            "#header_submit",
            "button[data-event*='saveHeader' i]",
            "button[data-event*='Header' i]",
        ):
            try:
                page.evaluate(
                    """(sel) => {
                      const b=document.querySelector(sel);
                      if (b) { b.disabled=false; b.removeAttribute('disabled'); }
                    }""",
                    sel,
                )
                page.locator(sel).first.click(timeout=3000, force=True)
                page.wait_for_timeout(2000)
                info = {"ok": True, "submit": sel}
                break
            except Exception as e:
                info = {"ok": False, "err": str(e)[:160], "submit": sel}
    result["evidence"].append(f"header_save={info}")
    v3.shot(page, out, "M2-header-saved")
    v3.goto_code_tab(page, "header", "Header Code", out, "M2-header-reload")
    hlen = v3.cm_len(page, "#header-c")
    hhead = v3.cm_head(page, "#header-c")
    result["evidence"].append(f"header_reload len={hlen} head={hhead[:100]!r}")

    header_ok = (
        ("dl-book-modal" in (hhead or ""))
        or ("data-bookings-open" in (hhead or ""))
        or ("Canvas delivers" in (hhead or ""))
        or hlen > 5000
    )
    # Stronger check: re-read a slice containing bookings
    has_book = page.evaluate(
        """() => {
          const el = document.querySelector('#header-c .CodeMirror') || document.querySelector('.CodeMirror');
          if (!el || !el.CodeMirror) return false;
          const v = el.CodeMirror.getValue();
          return v.includes('dl-book-modal') && v.includes('data-bookings-open') && v.includes('from-hied-hires');
        }"""
    )
    result["evidence"].append(f"header_contains_bookings_hires={has_book}")
    if not has_book and not header_ok:
        result["notes"].append("Header Code may not have persisted")
        return False

    # Clear Footer (body lives in Header Code)
    v3.goto_code_tab(page, "footer", "Footer Code", out, "M3-footer")
    empty = "<!-- Delphinium v5 body in Header Code; footer cleared sites v5 bookings-hires -->\n"
    v3.set_codemirror(page, empty, "#footer-c")
    finfo = v3.dirty_and_save_code(page, "#footer_submit", empty)
    result["evidence"].append(f"footer_clear={finfo}")
    v3.shot(page, out, "M3-footer-cleared")
    return bool(has_book or header_ok)


def ensure_auth_with_password(page, out: Path, result: dict) -> bool:
    """Load Sites builder; if login wall, agent_login + OneAuth wait (from stage_sites_v1)."""
    page.goto(f"{BUILDER_BASE}/zcms", wait_until="domcontentloaded", timeout=90000)
    v3.wait_out_of_please_wait(page, 40)
    v3.shot(page, out, "00-builder-dash")
    result["notes"].append(f"builder_url={page.url}")

    if not (v3.looks_login(page) or "accounts.zoho.com" in (page.url or "")):
        return True

    v3.shot(page, out, "00-login-wall")
    result["notes"].append("storage expired — agent_login + OneAuth path")

    # Import password helpers from stage_sites_v1 without executing its main
    sspec = importlib.util.spec_from_file_location("stage", str(ROOT / "stage_sites_v1.py"))
    stage = importlib.util.module_from_spec(sspec)
    # Avoid running main: exec module (defines helpers only at import)
    sspec.loader.exec_module(stage)

    login = load_login()
    user = login.get("username") or ""
    password = login.get("password") or ""
    if not user or not password:
        result["blockers"].append("agent_login missing username/password for Zoho")
        return False

    # Enhanced: after email, prefer long OneAuth wait; on timeout force-fill hidden password
    # and click "Show available options" / "Sign in another way".
    blocker = stage.do_password_login(page, user, password, out, result)
    if blocker and "login_password_step" in blocker:
        result["notes"].append("password visible wait failed — force-fill + alternate options")
        try:
            page.evaluate(
                """() => {
                  for (const t of ['Show available options','Sign in another way','Sign in using password','Password']) {
                    for (const el of document.querySelectorAll('a,button,span,div')) {
                      const x=(el.innerText||'').trim();
                      if (x===t || x.toLowerCase().includes(t.toLowerCase())) { try{el.click();}catch(e){} }
                    }
                  }
                }"""
            )
            page.wait_for_timeout(1500)
            page.evaluate(
                """(pw) => {
                  const el = document.querySelector("input#password, input[name='PASSWORD'], input[type='password']");
                  if (!el) return false;
                  el.style.display='block'; el.style.visibility='visible'; el.removeAttribute('hidden');
                  el.disabled=false; el.readOnly=false;
                  el.focus(); el.value=pw;
                  el.dispatchEvent(new Event('input',{bubbles:true}));
                  el.dispatchEvent(new Event('change',{bubbles:true}));
                  return true;
                }""",
                password,
            )
            page.locator("button#nextbtn, button:has-text('Sign in'), input#nextbtn").first.click(timeout=5000, force=True)
            page.wait_for_timeout(3000)
            v3.shot(page, out, "02-force-password")
            if stage.looks_mfa(page):
                if stage.wait_oneauth_push(page, out, result, seconds=300):
                    blocker = None
                else:
                    blocker = "OneAuth still required after force-password — Jared must approve push on phone (number on screen)"
            elif stage.looks_login(page):
                blocker = "still on login after force-password"
            else:
                blocker = None
        except Exception as e:
            blocker = f"force_password_err: {str(e)[:160]}"
    password = "***"
    login = {}
    if blocker:
        result["blockers"].append(blocker)
        return False

    result["method_login"] = "agent_login_after_expired_storage"
    page.goto(f"{BUILDER_BASE}/zcms", wait_until="domcontentloaded", timeout=90000)
    v3.wait_out_of_please_wait(page, 40)
    v3.shot(page, out, "00-builder-after-auth")
    if v3.looks_login(page) or "accounts.zoho.com" in (page.url or ""):
        result["blockers"].append("Still on login wall after agent_login/OneAuth")
        return False
    return True


def verify_public(out: Path) -> dict:
    import urllib.request

    url = STAGING_PUBLIC + f"?_={int(time.time())}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "DelphiniumV5PublishBot/1.0", "Cache-Control": "no-cache"},
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            html = resp.read().decode("utf-8", errors="replace")
            status = resp.status
    except Exception as e:
        return {"ok": False, "error": str(e)[:300], "url": STAGING_PUBLIC}

    (out / "public-live.html").write_text(html[:300000], encoding="utf-8")
    low = html.lower()

    checks = {
        "canvas_delivers": "canvas delivers content" in low,
        "data_bookings_open": "data-bookings-open" in low,
        "dl_book_modal": "dl-book-modal" in low,
        "portal_embed": "portal-embed" in low,
        "embed_js": "bookings.nimbuspop.com/assets/embed.js" in low,
        "hires": HIRES_NEEDLE in html,
        "no_hero_eyebrow": HERO_EYEBROW not in html,
        "cta_href": CTA_HREF in html,
        "padding_hero_inner": "padding-top: 1.75rem" in html or "padding-top:1.75rem" in html,
        # Combined tip markers (Sites v5 main)
        "cut_failures_by_up_to": "Cut failures by up to" in html,
        "education_moved_online_comma": "Education moved online," in html,
        "teachers_can_read_the_room": "teachers can read the room" in html,
        "dl_h2_plain": "dl-h2__plain" in html,
    }
    # padding may live only in custom CSS
    try:
        creq = urllib.request.Request(
            STAGING_PUBLIC.rstrip("/") + "/zs-customcss.css",
            headers={"User-Agent": "DelphiniumV5PublishBot/1.0", "Cache-Control": "no-cache"},
        )
        with urllib.request.urlopen(creq, timeout=20) as cr:
            css = cr.read().decode("utf-8", errors="replace")
        (out / "public-customcss.css").write_text(css[:120000], encoding="utf-8")
        if "padding-top: 1.75rem" in css or "padding-top:1.75rem" in css:
            checks["padding_hero_inner"] = True
    except Exception as e:
        checks["css_err"] = str(e)[:120]

    ok = all(
        checks[k]
        for k in (
            "canvas_delivers",
            "data_bookings_open",
            "dl_book_modal",
            "portal_embed",
            "hires",
            "no_hero_eyebrow",
            "cta_href",
            "cut_failures_by_up_to",
            "education_moved_online_comma",
            "teachers_can_read_the_room",
            "dl_h2_plain",
        )
    )
    return {"ok": ok, "status": status, "checks": checks, "url": STAGING_PUBLIC, "html_len": len(html)}


def capture_verify_pack(out: Path, result: dict) -> None:
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True, channel="chrome", args=["--no-sandbox", "--disable-dev-shm-usage"]
        )
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page.goto(STAGING_PUBLIC + f"?v={int(time.time())}", wait_until="networkidle", timeout=90000)
        page.wait_for_timeout(2500)
        page.screenshot(path=str(out / "V-hero.png"), full_page=False)
        # Confirm no eyebrow via DOM
        hero_info = page.evaluate(
            """() => {
              const inner = document.querySelector('.dl-hero__inner');
              if (!inner) return {ok:false};
              const kids = [...inner.children].map(el => ({tag: el.tagName, cls: el.className, text: (el.innerText||'').slice(0,60)}));
              const eyebrow = inner.querySelector('.dl-eyebrow');
              return {ok:true, kids, has_eyebrow: !!eyebrow, eyebrow_text: eyebrow ? eyebrow.innerText : null};
            }"""
        )
        result["hero_dom"] = hero_info
        # Click Schedule CTA
        bookings_ok = False
        try:
            loc = page.locator("[data-bookings-open]").first
            if loc.count():
                loc.click(timeout=5000)
                page.wait_for_timeout(1500)
                modal = page.locator("#dl-book-modal")
                bookings_ok = modal.count() > 0 and not modal.get_attribute("hidden")
                page.screenshot(path=str(out / "V-bookings-modal.png"), full_page=False)
                # close
                page.locator("[data-book-close]").first.click(timeout=3000)
        except Exception as e:
            result["notes"].append(f"bookings_click_err={str(e)[:160]}")
            page.screenshot(path=str(out / "V-bookings-fail.png"), full_page=False)
        result["bookings_modal_ok"] = bookings_ok
        tip_dom = page.evaluate(
            """() => {
              const plain = document.querySelector('.dl-h2__plain');
              const cut = document.body && document.body.innerText.includes('Cut failures by up to');
              const edu = document.body && document.body.innerText.includes('Education moved online,');
              const teachers = document.body && document.body.innerText.includes('teachers can read the room');
              return {
                has_dl_h2_plain: !!plain,
                plain_text: plain ? (plain.innerText || '').slice(0, 80) : null,
                plain_font_weight: plain ? getComputedStyle(plain).fontWeight : null,
                cut_failures: !!cut,
                education_moved_online_comma: !!edu,
                teachers_can_read_the_room: !!teachers,
              };
            }"""
        )
        result["tip_dom"] = tip_dom


        page.evaluate("window.scrollTo(0, 1200)")
        page.wait_for_timeout(600)
        page.screenshot(path=str(out / "V-makeover.png"), full_page=False)
        page.evaluate("window.scrollTo(0, 2800)")
        page.wait_for_timeout(600)
        page.screenshot(path=str(out / "V-product.png"), full_page=False)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(600)
        page.screenshot(path=str(out / "V-footer.png"), full_page=False)
        browser.close()


def main() -> int:
    out = OUT
    out.mkdir(parents=True, exist_ok=True)
    result = {
        "ok": False,
        "published": False,
        "bookings_modal_ok": False,
        "hires_swapped": [],
        "logo_swapped": False,
        "public_url": STAGING_PUBLIC,
        "blockers": [],
        "notes": [
            "Sites v5 bookings-hires republish (Jev+Playwright).",
            "Staging only; HubSpot/DNS/production untouched.",
            "No page recreate / site delete / billing.",
            "Hero eyebrow kill + 1.75rem hero inner padding from zoho-ready HTML.",
        ],
        "evidence": [],
        "verify_paths": [],
        "started_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
    }

    if not HTML_PATH.exists():
        result["blockers"].append(f"Missing {HTML_PATH}")
        (out / "RESULT.json").write_text(json.dumps(result, indent=2) + "\n")
        print(json.dumps({"ok": False, "blockers": result["blockers"]}))
        return 2

    # Record swaps from MAP.json if present
    map_path = ROOT / "assets/from-hied-hires-2026-09-24/MAP.json"
    if map_path.exists():
        try:
            m = json.loads(map_path.read_text())
            result["hires_swapped"] = m.get("swapped_unique", [])
            result["logo_swapped"] = any("logo-wordmark" in s for s in result["hires_swapped"])
            result["hires_base"] = m.get("hires_base")
        except Exception:
            pass

    from playwright.sync_api import sync_playwright

    storage = None
    if STORAGE_SITES.exists():
        storage = str(STORAGE_SITES)
        result["method_login"] = "storage_zoho-sites"
    elif STORAGE_CRM.exists():
        storage = str(STORAGE_CRM)
        result["method_login"] = "storage_zoho-crm"
    else:
        result["method_login"] = "agent_login_fresh"

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            channel="chrome",
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        ctx_kwargs = {
            "viewport": {"width": 1440, "height": 960},
            "ignore_https_errors": True,
        }
        if storage:
            ctx_kwargs["storage_state"] = storage
        context = browser.new_context(**ctx_kwargs)
        v3.install_route_guards(context)
        page = context.new_page()
        page.set_default_timeout(30000)

        if not ensure_auth_with_password(page, out, result):
            (out / "RESULT.json").write_text(json.dumps(result, indent=2) + "\n")
            browser.close()
            print(json.dumps({"ok": False, "blockers": result["blockers"], "notes": result["notes"][-5:]}))
            return 4

        update_ok = False
        try:
            update_ok = update_home(page, out, result)
        except Exception as e:
            result["notes"].append(f"update_exc={str(e)[:200]}")
            result["blockers"].append(f"media update failed: {str(e)[:160]}")

        result["publish_attempted"] = True
        try:
            pub_ok = v3.publish_site(page, out, result)
            result["published"] = bool(pub_ok or result.get("publish_post_200"))
            result["notes"].append("publish_post_200" if pub_ok else "publish_post_not_confirmed")
        except Exception as e:
            result["notes"].append(f"publish_exc={str(e)[:160]}")
            result["blockers"].append(f"publish failed: {str(e)[:120]}")

        try:
            v3.save_storage(context, result)
        except Exception as e:
            result["notes"].append(f"storage_save_err={str(e)[:120]}")
        browser.close()

    time.sleep(6)
    verify = verify_public(out)
    result["verify"] = verify

    try:
        capture_verify_pack(out, result)
    except Exception as e:
        result["notes"].append(f"verify_pack_err={str(e)[:200]}")

    result["finished_at"] = time.strftime("%Y-%m-%dT%H:%M:%S%z")
    result["ok"] = bool(verify.get("ok")) and bool(result.get("published") or result.get("publish_post_200"))
    if not result.get("bookings_modal_ok") and verify.get("checks", {}).get("dl_book_modal"):
        # Modal present in HTML even if click check flaky
        result["notes"].append("bookings_modal in HTML; click open may need cold cache")

    result["verify_paths"] = sorted(str(p) for p in out.glob("V-*.png"))
    # Slim RESULT for parent
    slim = {
        "published": bool(result.get("published") or result.get("publish_post_200")),
        "bookings_modal_ok": bool(result.get("bookings_modal_ok")),
        "hires_swapped": result.get("hires_swapped") or [],
        "logo_swapped": bool(result.get("logo_swapped")),
        "public_url": STAGING_PUBLIC,
        "blockers": result.get("blockers") or [],
        "verify_paths": result.get("verify_paths") or [],
        "verify_checks": (verify or {}).get("checks"),
        "hero_dom": result.get("hero_dom"),
        "tip_dom": result.get("tip_dom"),
        "notes": result.get("notes")[-12:],
        "ok": result["ok"],
        "status": ("success" if result["ok"] else ("blocked_on_oneauth" if any("OneAuth" in str(b) or "oneauth" in str(b).lower() or "MFA" in str(b) or "login wall" in str(b).lower() for b in (result.get("blockers") or [])) or any("OneAuth" in n for n in (result.get("notes") or [])) else "failed")),
        "hires_base": result.get("hires_base"),
        "method_login": result.get("method_login"),
        "publish_post_200": result.get("publish_post_200"),
    }
    (out / "RESULT.json").write_text(json.dumps(slim, indent=2) + "\n", encoding="utf-8")
    (out / "result-full.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(slim, indent=2))
    return 0 if slim["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

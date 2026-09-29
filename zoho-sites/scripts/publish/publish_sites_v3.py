#!/usr/bin/env python3
"""Publish Sites v3 craft (Muse+Fable synthesis) to Zoho Sites staging.

Updates content on the CURRENT Delphinium Home (blank remount already done).
Does NOT recreate pages. Soft chrome hide + v2 palette/Makeover Switch.

Jev+Playwright ONLY. No HubSpot/DNS/production/site-delete/domain/billing.
CTA: Zoho Bookings Demo. No bottom sticky. No engagethumb fake-play hero.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
HTML_PATH = ROOT / "homepage-sites-v3.html"
CHROME_HIDE_PATH = ROOT / "zoho-chrome-hide.css"
OUT = ROOT / "verify-2026-09-23-sites-v3"
STORAGE_SITES = Path("/workspace/.secrets/browser-sessions/zoho-sites.storage.json")
STORAGE_CRM = Path("/workspace/.secrets/browser-sessions/zoho-crm.storage.json")
BROWSER_SESSION = Path("/workspace/delphinium-os/vault/browser_session.py")
BIN = Path("/workspace/delphinium-os/token-architecture/bin")

STAGING_PUBLIC = "https://delphinium-marketing-staging.zohosites.com"
SITE_ID = "2187225000000002005"
BUILDER_BASE = "https://sitebuilder-939950337.zohositescontent.com"
CTA_HREF = "https://jared-delphi-me.zohobookings.com/4937208000000036014"
TITLE_WANT = "Delphinium · Canvas delivers content. Delphinium delivers engagement."
DESC_WANT = (
    "Canvas delivers content. Delphinium delivers engagement. "
    "Turn Canvas courses into experiences students engage with, "
    "and give teachers visibility to who needs help."
)

REQUIRED_STRINGS = [
    "Schedule a demo",
    "Turn it on",
    "jared-delphi-me.zohobookings.com/4937208000000036014",
    "Canvas LTI 1.3",
    "Avatar points",
]
# Tiffany: exact name OR unquoted paraphrase markers
TIFFANY_MARKERS = [
    "Tiffany Dance",
    "Instructional Coach at Davis Connect",
    "game changer",
]

FORBIDDEN_STRINGS = [
    "Product screenshot optional",
    "Swap CSS",
    "Staging pack",
    "Schools using Delphinium",  # hard logo-strip claim — soft caption only
    "engagethumb",  # v2: no baked play-button stock hero
]

# AI headshot URL needles (must be absent)
AI_HEADSHOT_NEEDLES = [
    "/people/",
    "ai-studio",
    "google-ai",
    "generated-headshot",
    "aistudio",
]

MEDIA_NEEDLES = [
    "Turn it on",
    "Delphinium",
    "fan",
    "4937208000000036014",
]

CYBER_NEEDLES = [
    "cyberdesk",
    "meet our cyber family",
    "hackers are getting smarter",
    "smart cybersecurity",
    "meet our cyberdesk",
]

ALLOW_SUFFIXES = [
    "sites.zoho.com",
    "zohosites.com",
    "zohositescontent.com",
    "accounts.zoho.com",
    "one.zoho.com",
    "zoho.com",
    "zohostatic.com",
    "zohocdn.com",
    "zohousercontent.com",
]
BLOCK_SUFFIXES = ["hubspot.com", "app.hubspot.com"]

FORBIDDEN_UI = [
    "delete site",
    "delete this site",
    "remove site",
    "map domain",
    "custom domain",
    "connect domain",
    "dns",
    "domain mapping",
    "hubspot",
    "cancel subscription",
    "cancel plan",
    "billing",
    "upgrade plan",
    "crm redirects",
]

# Soft chrome only — remount already purged CyberDesk from DOM
SOFT_CHROME = """
/* publish_sites_v2 soft chrome — moon/zpsection safety + zoho badge */
.theme-skip-to-needed-content { display: none !important; }
.theme-content-area .zpsection { display: none !important; }
.theme-footer-area .zpsection { display: none !important; }
.zs-poweredby, .theme-poweredby, .zpfooter-poweredby,
a[href*="zoho.com/sites"], a[href*="www.zoho.com/sites"],
[class*="zoho-sites"], [class*="zohosites"],
[class*="poweredby" i] {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  max-height: 0 !important;
  overflow: hidden !important;
  opacity: 0 !important;
}
/* zsad free badge: fixed bottom ~z-index 1e6 */
div[style*="z-index: 1000000"],
div[style*="z-index:1000000"],
div[style*="z-index: 999999"],
div[style*="z-index:999999"],
body > div:has(a[href*="zoho.com/sites"]),
body > div:has(a[href*="www.zoho.com/sites"]) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  height: 0 !important;
  max-height: 0 !important;
}
"""

# Nuclear fallback ONLY if public HTML regresses to CyberDesk needles
NUCLEAR_HIDE = """
/* publish_sites_v2 nuclear hide — fallback only if CyberDesk residual */
.theme-skip-to-needed-content,
[data-headercontainer],
.theme-header,
.theme-header-topbar,
.theme-content-area,
.theme-footer-area,
.zpfooter,
[data-footer-type],
.zpdark-section.theme-footer-area,
#home.zsucstom-section-cyberdesk-01,
.zsucstom-section-cyberdesk-01,
.zsucstom-section-cyberdesk-02,
.zpsection.zsucstom-section-cyberdesk-01,
.zpsection.zsucstom-section-cyberdesk-02 {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  max-height: 0 !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
}
body > .theme-content-area,
body > [data-headercontainer] {
  display: none !important;
}
header.site-nav, main#top, footer.site-footer {
  display: block !important;
  visibility: visible !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}
"""

sys.path.insert(0, str(BIN))


def host_ok(url: str) -> bool:
    if not url or url.startswith("javascript:") or url.startswith("about:"):
        return True
    h = (urlparse(url).hostname or "").lower()
    if not h:
        return True
    for b in BLOCK_SUFFIXES:
        if h == b or h.endswith("." + b):
            return False
    for a in ALLOW_SUFFIXES:
        if h == a or h.endswith("." + a):
            return True
    if h.endswith(".zoho.com") or h.endswith(".zohostatic.com") or h.endswith(".zohocdn.com"):
        return True
    return False


def install_route_guards(context) -> None:
    def _guard(route):
        url = route.request.url
        if not host_ok(url):
            route.abort()
        else:
            route.continue_()

    context.route("**/*", _guard)


def shot(page, out: Path, name: str) -> None:
    path = out / f"{name}.png"
    try:
        page.screenshot(path=str(path), full_page=False)
    except Exception as e:
        (out / f"{name}.shot-err.txt").write_text(str(e)[:300])


def wait_out_of_please_wait(page, seconds: int = 45) -> None:
    deadline = time.time() + seconds
    while time.time() < deadline:
        try:
            t = (page.locator("body").inner_text(timeout=2000) or "").lower()
        except Exception:
            t = ""
        if "please wait" not in t and t.strip():
            return
        page.wait_for_timeout(1000)


def html_parts(use_nuclear: bool = False) -> dict:
    full = HTML_PATH.read_text(encoding="utf-8")
    chrome = CHROME_HIDE_PATH.read_text(encoding="utf-8") if CHROME_HIDE_PATH.exists() else ""
    style_m = re.search(r"<style>(.*?)</style>", full, re.S)
    body_m = re.search(r"<body[^>]*>(.*?)</body>", full, re.S)
    style = style_m.group(1) if style_m else ""
    body = body_m.group(1).strip() if body_m else full
    hdr = re.search(r"(<header\b.*</script>)", body, re.S | re.I)
    if hdr:
        body = hdr.group(1).strip()
    if use_nuclear:
        style_combined = NUCLEAR_HIDE + "\n" + chrome + "\n" + style
        css_mode = "nuclear+chrome+media_homepage"
    else:
        style_combined = SOFT_CHROME + "\n" + chrome + "\n" + style
        css_mode = "soft_chrome+media_homepage"

    # Fonts / preconnect from media HTML head (outside <style>)
    font_bits = []
    for m in re.finditer(
        r'<(?:link|meta)[^>]+(?:fonts\.googleapis|fonts\.gstatic|delphi-me\.com)[^>]*/?>',
        full,
        re.I,
    ):
        font_bits.append(m.group(0))
    # Also explicit font stylesheet
    fm = re.search(
        r'<link[^>]+fonts\.googleapis\.com/css2[^>]*>',
        full,
        re.I,
    )
    if fm and fm.group(0) not in font_bits:
        font_bits.append(fm.group(0))
    fonts_block = "\n".join(dict.fromkeys(font_bits))  # dedupe preserve order

    title_js = json.dumps(TITLE_WANT)
    header_code = (
        f"<title>{TITLE_WANT}</title>\n"
        f'<meta name="description" content="{DESC_WANT}" />\n'
        f"{fonts_block}\n"
        f"<script>try{{document.title={title_js};"
        f"var m=document.querySelector('meta[name=\"description\"]');"
        f"if(!m){{m=document.createElement('meta');m.name='description';document.head.appendChild(m);}}"
        f"m.setAttribute('content',{json.dumps(DESC_WANT)});"
        f"}}catch(e){{}}</script>\n"
        f"{body}\n"
    )
    return {
        "full": full,
        "style": style,
        "style_combined": style_combined,
        "body": body,
        "header_code": header_code,
        "chrome": chrome,
        "css_mode": css_mode,
    }


def set_codemirror(page, code: str, pane_hint: str | None = None) -> bool:
    return bool(
        page.evaluate(
            """({code, paneHint}) => {
              let root = document;
              if (paneHint) {
                const p = document.querySelector(paneHint);
                if (p) root = p;
              }
              const cms = [...root.querySelectorAll('.CodeMirror')].filter(el => {
                const r = el.getBoundingClientRect();
                return r.width > 80 && r.height > 30;
              });
              const el = (cms.sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0])
                || root.querySelector('.CodeMirror')
                || document.querySelector('.CodeMirror');
              if (!el || !el.CodeMirror) return false;
              el.CodeMirror.setValue(code);
              el.CodeMirror.focus();
              const tas = document.querySelectorAll(
                '#customcss_textarea, #sitefootercode, #siteheadercode, #zp_snippetContent, textarea.sites-codetext, textarea'
              );
              for (const ta of tas) {
                try {
                  ta.value = code;
                  ta.dispatchEvent(new Event('input', {bubbles:true}));
                  ta.dispatchEvent(new Event('change', {bubbles:true}));
                } catch (e) {}
              }
              return true;
            }""",
            {"code": code, "paneHint": pane_hint},
        )
    )


def goto_code_tab(page, path: str, tab_label: str, out: Path, tag: str) -> None:
    url = f"{BUILDER_BASE}/zcms/{SITE_ID}/settings/code/{path}"
    page.goto(url, wait_until="domcontentloaded", timeout=90000)
    wait_out_of_please_wait(page, 35)
    page.wait_for_timeout(1000)
    try:
        page.get_by_text(tab_label, exact=False).first.click(timeout=3000)
        page.wait_for_timeout(800)
    except Exception:
        pass
    shot(page, out, tag)


def dirty_and_save_code(page, submit_sel: str, insert_text: str | None = None) -> dict:
    info = {"submit": submit_sel, "ok": False}
    try:
        page.evaluate(
            """() => {
              const el = document.querySelector('.CodeMirror');
              if (el) { el.scrollIntoView(); el.click(); if (el.CodeMirror) el.CodeMirror.focus(); }
            }"""
        )
        if insert_text is not None:
            page.keyboard.press("Control+A")
            page.keyboard.insert_text(insert_text[:45000] if len(insert_text) > 45000 else insert_text)
            page.wait_for_timeout(400)
        page.evaluate(
            """(sel) => {
              const b = document.querySelector(sel);
              if (b) {
                b.disabled = false;
                b.removeAttribute('disabled');
                b.classList.remove('disabled');
              }
            }""",
            submit_sel,
        )
        page.locator(submit_sel).click(timeout=6000, force=True)
        page.wait_for_timeout(2200)
        info["ok"] = True
    except Exception as e:
        info["err"] = str(e)[:240]
    return info


def cm_head(page, pane: str | None = None, n: int = 160) -> str:
    return page.evaluate(
        """({pane, n}) => {
          let root = document;
          if (pane) {
            const p = document.querySelector(pane);
            if (p) root = p;
          }
          const el = root.querySelector('.CodeMirror') || document.querySelector('.CodeMirror');
          return el && el.CodeMirror ? el.CodeMirror.getValue().slice(0, n) : '';
        }""",
        {"pane": pane, "n": n},
    )


def cm_len(page, pane: str | None = None) -> int:
    return int(
        page.evaluate(
            """(pane) => {
              let root = document;
              if (pane) {
                const p = document.querySelector(pane);
                if (p) root = p;
              }
              const el = root.querySelector('.CodeMirror') || document.querySelector('.CodeMirror');
              return el && el.CodeMirror ? el.CodeMirror.getValue().length : 0;
            }""",
            pane,
        )
        or 0
    )


def looks_login(page) -> bool:
    url = (page.url or "").lower()
    if "accounts.zoho.com" in url and ("signin" in url or "login" in url):
        return True
    try:
        t = (page.locator("body").inner_text(timeout=3000) or "").lower()
    except Exception:
        t = ""
    return ("sign in" in t or "log in" in t) and ("password" in t or "email" in t or "oneauth" in t)


def looks_mfa(page) -> bool:
    try:
        t = (page.locator("body").inner_text(timeout=2000) or "").lower()
    except Exception:
        t = ""
    return any(
        n in t
        for n in ("oneauth", "push notification", "approve", "verification code", "otp", "authenticator")
    ) and ("accounts.zoho.com" in (page.url or "").lower() or "verify" in t or "oneauth" in t)


def wait_oneauth_push(page, out: Path, result: dict, seconds: int = 240) -> bool:
    result["notes"].append(f"Waiting up to {seconds}s for OneAuth push (prefer push over password)")
    deadline = time.time() + seconds
    n = 0
    while time.time() < deadline:
        n += 1
        if n == 1 or n % 4 == 0:
            shot(page, out, f"mfa-wait-{n:02d}")
        url = (page.url or "").lower()
        if looks_mfa(page) or ("accounts.zoho.com" in url and ("signin" in url or "login" in url)):
            try:
                page.evaluate(
                    """() => {
                      for (const label of ['Send Push', 'Send notification', 'Resend', 'Approve']) {
                        for (const b of document.querySelectorAll('button, a, span')) {
                          const t=(b.innerText||'').trim();
                          if (t === label || t.toLowerCase().includes('push')) { try{b.click();}catch(e){} }
                        }
                      }
                    }"""
                )
            except Exception:
                pass
            page.wait_for_timeout(5000)
            continue
        if "sites.zoho.com" in url or "zohosites" in url or "one.zoho.com" in url:
            shot(page, out, "mfa-approved")
            result["notes"].append("OneAuth push approved (session advanced)")
            return True
        if not looks_login(page) and not looks_mfa(page):
            shot(page, out, "mfa-approved")
            result["notes"].append("OneAuth push approved (login wall cleared)")
            return True
        page.wait_for_timeout(5000)
    return False


def publish_site(page, out: Path, result: dict) -> bool:
    net: list[dict] = []

    def on_resp(resp):
        try:
            u = resp.url
            if "publish" in u.lower():
                net.append({"status": resp.status, "url": u, "method": resp.request.method})
        except Exception:
            pass

    page.on("response", on_resp)
    dash = f"{BUILDER_BASE}/zcms"
    page.goto(dash, wait_until="domcontentloaded", timeout=60000)
    wait_out_of_please_wait(page, 35)
    shot(page, out, "10-before-publish")

    clicked = page.evaluate(
        """() => {
          const el = document.querySelector('#zp_publish_appheader') ||
            document.querySelector('[data-event="click appHeader.publishSite"]') ||
            document.querySelector('#publish_dd_site');
          if (!el) return {ok:false};
          el.click();
          return {ok:true, id: el.id || '', event: el.getAttribute('data-event') || '', text: (el.innerText||'').trim().slice(0,40)};
        }"""
    )
    result["evidence"].append(f"publish_click={clicked}")
    page.wait_for_timeout(1500)

    page.evaluate(
        """() => {
          const bad = 'showPreviewWithoutSave';
          for (const label of ['Publish Site', 'Publish Changes', 'Publish', 'Yes', 'Confirm', 'OK']) {
            for (const b of document.querySelectorAll('button, .sites-button, a, span, li')) {
              const t = (b.innerText || '').trim();
              const ev = b.getAttribute('data-event') || '';
              if (ev.includes(bad)) continue;
              if (t === label || (label === 'Publish Site' && ev.includes('publishSite'))) {
                try { b.click(); } catch (e) {}
              }
            }
          }
        }"""
    )
    wait_out_of_please_wait(page, 90)
    page.wait_for_timeout(2500)
    shot(page, out, "11-after-publish")
    result["evidence"].append(f"publish_network={net[:12]}")
    result["publish_network"] = net
    ok = any(
        r.get("status") == 200 and "/zs-site/api/v1/publish" in (r.get("url") or "") and r.get("method") == "POST"
        for r in net
    )
    result["publish_post_200"] = ok
    return ok


def save_storage(context, result: dict) -> None:
    try:
        STORAGE_SITES.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
        context.storage_state(path=str(STORAGE_SITES))
        STORAGE_SITES.chmod(0o600)
        subprocess.run(
            [
                "/usr/bin/python3",
                str(BROWSER_SESSION),
                "touch-meta",
                "--name",
                "zoho-sites",
                "--note",
                "Sites v3 craft homepage publish",
                "--host",
                "sites.zoho.com",
                "--host",
                "accounts.zoho.com",
                "--host",
                "zohosites.com",
                "--host",
                "zohositescontent.com",
            ],
            check=False,
            capture_output=True,
            text=True,
        )
        result["storage_saved"] = str(STORAGE_SITES)
    except Exception as e:
        result["storage_save_error"] = str(e)[:200]


def ensure_auth(page, out: Path, result: dict) -> bool:
    page.goto(f"{BUILDER_BASE}/zcms", wait_until="domcontentloaded", timeout=90000)
    wait_out_of_please_wait(page, 40)
    shot(page, out, "00-builder-dash")
    result["notes"].append(f"builder_url={page.url}")

    if looks_login(page) or "accounts.zoho.com" in (page.url or ""):
        shot(page, out, "00-login-wall")
        if looks_mfa(page) or "oneauth" in (page.locator("body").inner_text(timeout=2000) or "").lower():
            if not wait_oneauth_push(page, out, result, seconds=240):
                result["blockers"].append("Login wall — OneAuth wait timed out (4 min)")
                return False
        else:
            page.goto("https://sites.zoho.com", wait_until="domcontentloaded", timeout=90000)
            page.wait_for_timeout(2500)
            shot(page, out, "00b-sites-home")
            if looks_login(page) or looks_mfa(page):
                if not wait_oneauth_push(page, out, result, seconds=240):
                    result["blockers"].append("Login wall — storage expired; OneAuth wait timed out")
                    return False
        page.goto(f"{BUILDER_BASE}/zcms", wait_until="domcontentloaded", timeout=90000)
        wait_out_of_please_wait(page, 40)
        shot(page, out, "00-builder-after-auth")
    return True


def update_media_content(page, out: Path, result: dict, use_nuclear: bool = False) -> bool:
    """Write Custom CSS + Header Code + clear Footer + page info. No page recreate."""
    parts = html_parts(use_nuclear=use_nuclear)
    result["notes"].append(f"media_css_mode={parts['css_mode']}")
    result["notes"].append(
        f"parts sizes style={len(parts['style_combined'])} header={len(parts['header_code'])}"
    )
    result["notes"].append("logo_strip=kept Programs on Canvas (Jared confirmed)")

    # Custom CSS
    goto_code_tab(page, "customcss", "Custom CSS", out, "M1-css")
    if not set_codemirror(page, parts["style_combined"]):
        result["blockers"].append("Custom CSS CodeMirror missing")
        return False
    try:
        page.locator("button[data-event*='saveCustomCSS']").click(timeout=5000, force=True)
        page.wait_for_timeout(2000)
        result["notes"].append("custom_css_saved")
    except Exception:
        info = dirty_and_save_code(page, "button[data-event*='saveCustomCSS']", parts["style_combined"])
        result["evidence"].append(f"css_save_fallback={info}")
    shot(page, out, "M1-css-saved")
    goto_code_tab(page, "customcss", "Custom CSS", out, "M1-css-reload")
    result["evidence"].append(f"css_reload_head={cm_head(page)[:120]!r} len={cm_len(page)}")

    # Header Code
    goto_code_tab(page, "header", "Header Code", out, "M2-header")
    set_codemirror(page, parts["header_code"], "#header-c")
    info = dirty_and_save_code(page, "#header_submit", parts["header_code"])
    if not info.get("ok"):
        for sel in ("#header_submit", "button[data-event*='saveHeader' i]", "button[data-event*='Header' i]"):
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
    shot(page, out, "M2-header-saved")
    goto_code_tab(page, "header", "Header Code", out, "M2-header-reload")
    hlen = cm_len(page, "#header-c")
    hhead = cm_head(page, "#header-c")
    result["evidence"].append(f"header_reload len={hlen} head={hhead[:100]!r}")
    if "Canvas delivers" not in (hhead or "") and "document.title" not in (hhead or "") and hlen < 100:
        set_codemirror(page, parts["header_code"])
        page.keyboard.press("Control+A")
        page.keyboard.insert_text(parts["header_code"][:45000])
        page.wait_for_timeout(400)
        page.evaluate(
            """() => {
              for (const sel of ['#header_submit','button[data-event*=saveHeader]']) {
                const b=document.querySelector(sel);
                if (b) { b.disabled=false; b.removeAttribute('disabled'); try{b.click();}catch(e){} }
              }
            }"""
        )
        page.wait_for_timeout(2500)
        goto_code_tab(page, "header", "Header Code", out, "M2-header-reload2")
        hlen = cm_len(page)
        hhead = cm_head(page)
        result["evidence"].append(f"header_reload2 len={hlen} head={hhead[:100]!r}")

    header_ok = (
        ("Canvas delivers" in (hhead or ""))
        or ("document.title" in (hhead or ""))
        or ("engagethumb" in (hhead or ""))
        or hlen > 2000
    )
    if not header_ok:
        result["notes"].append("Header Code may not have persisted")

    # Clear Footer
    goto_code_tab(page, "footer", "Footer Code", out, "M3-footer")
    empty = "<!-- Delphinium v2 body in Header Code; footer cleared sites v3 -->\n"
    set_codemirror(page, empty, "#footer-c")
    finfo = dirty_and_save_code(page, "#footer_submit", empty)
    result["evidence"].append(f"footer_clear={finfo}")
    shot(page, out, "M3-footer-cleared")

    # editPageInfo SEO (optional, best-effort)
    try:
        page.goto(f"{BUILDER_BASE}/zcms/editor/#home", wait_until="domcontentloaded", timeout=90000)
        wait_out_of_please_wait(page, 40)
        page.wait_for_timeout(1200)
        shot(page, out, "M4-editor-pageinfo")
        opened = page.evaluate(
            """() => {
              const el = document.querySelector('#editPageInfoSettings')
                || document.querySelector('[data-event="click root.editPageInfo"]');
              if (!el) return {ok:false};
              el.click();
              return {ok:true, id: el.id||''};
            }"""
        )
        result["evidence"].append(f"editPageInfo_click={opened}")
        page.wait_for_timeout(1200)
        page.evaluate(
            """({title, desc}) => {
              const els = [...document.querySelectorAll('input[type=text], input:not([type]), textarea')];
              const visible = els.filter(el => {
                const r = el.getBoundingClientRect();
                return r.width > 80 && r.height > 10 && r.top > 0;
              }).filter(el => el.id !== 'addPage_name' && el.id !== 'pg_page_url');
              if (visible[0]) {
                visible[0].value = title;
                visible[0].dispatchEvent(new Event('input', {bubbles:true}));
                visible[0].dispatchEvent(new Event('change', {bubbles:true}));
              }
              if (visible[1]) {
                visible[1].value = title;
                visible[1].dispatchEvent(new Event('input', {bubbles:true}));
                visible[1].dispatchEvent(new Event('change', {bubbles:true}));
              }
              if (visible[2]) {
                visible[2].value = desc;
                visible[2].dispatchEvent(new Event('input', {bubbles:true}));
                visible[2].dispatchEvent(new Event('change', {bubbles:true}));
              }
            }""",
            {"title": TITLE_WANT, "desc": DESC_WANT},
        )
        for sel in ("button:has-text('Save')", "button:has-text('Update')", "#pageInfo_submit"):
            loc = page.locator(sel).first
            try:
                if loc.is_visible(timeout=800):
                    loc.click(timeout=4000, force=True)
                    page.wait_for_timeout(1200)
                    result["notes"].append(f"pageinfo_save={sel}")
                    break
            except Exception:
                continue
        shot(page, out, "M4-pageinfo-saved")
    except Exception as e:
        result["notes"].append(f"pageinfo_err={str(e)[:120]}")

    return header_ok


def verify_public(out: Path) -> dict:
    import urllib.request

    req = urllib.request.Request(
        STAGING_PUBLIC + f"?_={int(time.time())}",
        headers={"User-Agent": "DelphiniumMediaPublishBot/1.0", "Cache-Control": "no-cache"},
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            html = resp.read().decode("utf-8", errors="replace")
            status = resp.status
    except Exception as e:
        return {"ok": False, "error": str(e)[:300]}

    (out / "public-live.html").write_text(html[:250000], encoding="utf-8")
    low = html.lower()
    title_m = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    title = (title_m.group(1).strip() if title_m else "")[:160]

    required = {s: (s.lower() in low) for s in REQUIRED_STRINGS}
    tiffany_ok = any(m.lower() in low for m in TIFFANY_MARKERS)
    required["Tiffany Dance OR paraphrase"] = tiffany_ok

    # Soft logo-strip caption OK; hard claim "Schools using Delphinium" as logo-strip label is forbidden.
    # Note: outcome copy may still say "Schools using Delphinium have seen..." — SOURCE stat line.
    # Only flag if logo-strip hard claim pattern appears near Programs caption absence.
    forbidden = {}
    for s in FORBIDDEN_STRINGS:
        if s == "Schools using Delphinium":
            # Allow SOURCE outcome sentence; fail only if used as logo-strip claim without soft caption
            has_hard = "schools using delphinium" in low
            has_soft = "programs on canvas" in low
            # Pass if soft caption present (Jared OK) even if outcome sentence uses the phrase
            forbidden[s] = has_hard and not has_soft
        else:
            forbidden[s] = s.lower() in low

    cyber = {n: (n in low) for n in CYBER_NEEDLES}
    cyber_residual = any(cyber.values())
    cta_href = CTA_HREF in html
    title_ok = "delphinium" in title.lower() and "cyber" not in title.lower()

    media = {n: (n.lower() in low if n != "Delphinium%20Logo" else ("delphinium%20logo" in low or "delphinium logo" in low)) for n in MEDIA_NEEDLES}
    ai_hits = {n: (n.lower() in low) for n in AI_HEADSHOT_NEEDLES}
    ai_present = any(ai_hits.values())

    nuclear_in_css = False
    css = ""
    try:
        creq = urllib.request.Request(
            STAGING_PUBLIC.rstrip("/") + "/zs-customcss.css",
            headers={"User-Agent": "DelphiniumMediaPublishBot/1.0", "Cache-Control": "no-cache"},
        )
        with urllib.request.urlopen(creq, timeout=20) as cr:
            css = cr.read().decode("utf-8", errors="replace")
        nuclear_in_css = "nuclear hide" in css or (
            "theme-content-area" in css and "display: none !important" in css and "cyberdesk" in css.lower()
        )
        (out / "public-customcss.css").write_text(css[:100000], encoding="utf-8")
    except Exception:
        pass

    has_moon = "moon" in low or "placeholder" in low  # informational

    content_ok = (
        all(required.values())
        and not any(forbidden.values())
        and cta_href
        and title_ok
        and not cyber_residual
        and media.get("engagethumb")
        and media.get("datathumb")
        and media.get("Delphinium%20Logo")
        and media.get("Programs on Canvas")
        and not ai_present
    )

    return {
        "ok": bool(content_ok),
        "status": status,
        "title": title,
        "title_ok": title_ok,
        "required": required,
        "forbidden_present": forbidden,
        "cyber_needles": cyber,
        "cyberdesk_residual": cyber_residual,
        "cta_href_found": cta_href,
        "media_assets": media,
        "ai_headshot_hits": ai_hits,
        "ai_headshots_present": ai_present,
        "nuclear_in_css": nuclear_in_css,
        "has_moon_placeholder": has_moon,
        "url": STAGING_PUBLIC,
        "hero_pos": low.find("canvas delivers content"),
    }


def main() -> int:
    out = OUT
    out.mkdir(parents=True, exist_ok=True)
    result = {
        "ok": False,
        "url": STAGING_PUBLIC,
        "method": None,
        "notes": [
            "Jev+Playwright only (no Grok computer-use).",
            "HubSpot/DNS/production delphi-me.com untouched.",
            "Never delete whole site / domain mapping / billing.",
            "Media pass: update content on current Delphinium Home (no page recreate).",
            "Logo strip kept (Programs on Canvas) — Jared confirmed 2026-09-23.",
            "Soft chrome only; nuclear only if CyberDesk residual returns.",
        ],
        "blockers": [],
        "evidence": [],
        "started_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "verify": None,
        "publish_attempted": False,
        "cyberdesk_residual": None,
    }

    if not HTML_PATH.exists():
        result["blockers"].append(f"Missing media HTML: {HTML_PATH}")
        (out / "result.json").write_text(json.dumps(result, indent=2) + "\n")
        print(json.dumps({"ok": False, "blockers": result["blockers"]}))
        return 2

    from playwright.sync_api import sync_playwright

    storage = None
    if STORAGE_SITES.exists():
        storage = str(STORAGE_SITES)
        result["method_login"] = "storage_zoho-sites"
    elif STORAGE_CRM.exists():
        storage = str(STORAGE_CRM)
        result["method_login"] = "storage_zoho-crm"
    else:
        result["blockers"].append("No zoho-sites or zoho-crm storage jar")
        (out / "result.json").write_text(json.dumps(result, indent=2) + "\n")
        print(json.dumps({"ok": False, "blockers": result["blockers"]}))
        return 2

    use_nuclear = False  # remount already purged; soft first

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            channel="chrome",
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 960},
            ignore_https_errors=True,
            storage_state=storage,
        )
        install_route_guards(context)
        page = context.new_page()
        page.set_default_timeout(30000)

        if not ensure_auth(page, out, result):
            (out / "result.json").write_text(json.dumps(result, indent=2) + "\n")
            browser.close()
            print(json.dumps({"ok": False, "blockers": result["blockers"]}))
            return 4

        update_ok = False
        try:
            update_ok = update_media_content(page, out, result, use_nuclear=use_nuclear)
        except Exception as e:
            result["notes"].append(f"update_exc={str(e)[:200]}")
            result["blockers"].append(f"media update failed: {str(e)[:160]}")

        result["method"] = (
            "media_soft_css+header_code"
            if update_ok and not use_nuclear
            else ("media_nuclear_css+header_code" if update_ok else "media_update_failed")
        )

        # Publish
        result["publish_attempted"] = True
        try:
            pub_ok = publish_site(page, out, result)
            result["notes"].append("publish_post_200" if pub_ok else "publish_post_not_confirmed")
        except Exception as e:
            result["notes"].append(f"publish_exc={str(e)[:160]}")
            result["blockers"].append(f"publish failed: {str(e)[:120]}")

        save_storage(context, result)
        browser.close()

    time.sleep(5)
    verify = verify_public(out)
    result["verify"] = verify
    result["cyberdesk_residual"] = bool(verify.get("cyberdesk_residual", True))

    # If CyberDesk residual returned, one nuclear retry
    if result["cyberdesk_residual"] and not use_nuclear:
        result["notes"].append("CyberDesk residual after soft publish — retrying with nuclear hide")
        use_nuclear = True
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=False,
                channel="chrome",
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            context = browser.new_context(
                viewport={"width": 1440, "height": 960},
                ignore_https_errors=True,
                storage_state=str(STORAGE_SITES) if STORAGE_SITES.exists() else storage,
            )
            install_route_guards(context)
            page = context.new_page()
            page.set_default_timeout(30000)
            if ensure_auth(page, out, result):
                try:
                    update_media_content(page, out, result, use_nuclear=True)
                    result["method"] = "media_nuclear_css+header_code_retry"
                    publish_site(page, out, result)
                except Exception as e:
                    result["notes"].append(f"nuclear_retry_exc={str(e)[:160]}")
                save_storage(context, result)
            browser.close()
        time.sleep(5)
        verify = verify_public(out)
        result["verify"] = verify
        result["cyberdesk_residual"] = bool(verify.get("cyberdesk_residual", True))

    result["finished_at"] = time.strftime("%Y-%m-%dT%H:%M:%S%z")

    # Screenshots (no route guards — need hubfs CDN images)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome", args=["--no-sandbox", "--disable-dev-shm-usage"])
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page.goto(STAGING_PUBLIC + f"?v={int(time.time())}", wait_until="networkidle", timeout=90000)
        page.wait_for_timeout(3000)
        verify["live_document_title"] = page.title()
        page.screenshot(path=str(out / "12-public-desktop.png"), full_page=False)
        page.evaluate("window.scrollTo(0, 900)")
        page.wait_for_timeout(500)
        page.screenshot(path=str(out / "12-public-desktop-scroll.png"), full_page=False)
        page.evaluate("window.scrollTo(0, 2200)")
        page.wait_for_timeout(500)
        page.screenshot(path=str(out / "12-public-desktop-mid.png"), full_page=False)
        # Logo strip region
        page.evaluate("window.scrollTo(0, document.body.scrollHeight * 0.45)")
        page.wait_for_timeout(500)
        page.screenshot(path=str(out / "12-public-desktop-logos.png"), full_page=False)
        page.set_viewport_size({"width": 375, "height": 812})
        page.goto(STAGING_PUBLIC + f"?m={int(time.time())}", wait_until="networkidle", timeout=90000)
        page.wait_for_timeout(2500)
        page.screenshot(path=str(out / "12-public-mobile.png"), full_page=False)
        browser.close()

    if verify.get("live_document_title"):
        lt = verify["live_document_title"].lower()
        if "delphinium" in lt and "cyber" not in lt:
            verify["title_ok"] = True

    result["ok"] = (
        bool(verify.get("ok"))
        and not result["cyberdesk_residual"]
        and bool(result.get("publish_post_200"))
        and not result["blockers"]
    )
    if result["cyberdesk_residual"]:
        result["blockers"].append(
            "Public HTML still contains CyberDesk needles after media publish. Soft+nuclear CSS hide is not success."
        )
        result["ok"] = False

    result["screenshots"] = {
        "desktop": str(out / "12-public-desktop.png"),
        "desktop_scroll": str(out / "12-public-desktop-scroll.png"),
        "desktop_mid": str(out / "12-public-desktop-mid.png"),
        "desktop_logos": str(out / "12-public-desktop-logos.png"),
        "mobile": str(out / "12-public-mobile.png"),
    }
    result["screenshots_dir"] = str(out)
    result["hubspot_dns_untouched"] = True
    (out / "result.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")

    summary = {
        "ok": result["ok"],
        "url": result["url"],
        "method": result.get("method"),
        "cyberdesk_residual": result.get("cyberdesk_residual"),
        "verify": {
            "ok": verify.get("ok"),
            "title": verify.get("title"),
            "live_document_title": verify.get("live_document_title"),
            "required": verify.get("required"),
            "cyber_needles": verify.get("cyber_needles"),
            "cta_href_found": verify.get("cta_href_found"),
            "media_assets": verify.get("media_assets"),
            "ai_headshots_present": verify.get("ai_headshots_present"),
            "nuclear_in_css": verify.get("nuclear_in_css"),
        },
        "publish_post_200": result.get("publish_post_200"),
        "blockers": result["blockers"],
        "screenshots": result["screenshots"],
        "out": str(out),
    }
    print(json.dumps(summary, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

// Headless Edge: open the Schedule a demo modal on the local preview, click through Zoho's steps with real mouse
// input (date, time, Next, details form; never submits), screenshot each step, and measure how much of Zoho's
// header card (.zb-ctheme-content > .zb-ct-leftpanel) is visible inside the modal frame.
// The Zoho frame is attached over CDP for measurement and locating click targets only.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9721;
try { await fetch(`http://127.0.0.1:${PORT}/json`); console.error("port busy"); process.exit(1); } catch {}
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {} await sleep(200); }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); ws.send(JSON.stringify(sessionId ? { id: i, sessionId, method, params } : { id: i, method, params })); });
const ev = async (expr, sessionId) => { const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }, sessionId); return r.exceptionDetails ? { error: r.exceptionDetails.text + " " + (r.exceptionDetails.exception && r.exceptionDetails.exception.description) } : r.result.value; };
const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };
const snap = async (name) => { const { data } = await send("Page.captureScreenshot", { format: "png" }); writeFileSync(join(OUT, name), Buffer.from(data, "base64")); log("shot", name); };
const key = async (k, code, vk, mods = 0) => { for (const type of ["keyDown", "keyUp"]) await send("Input.dispatchKeyEvent", { type, key: k, code, windowsVirtualKeyCode: vk, modifiers: mods }); await sleep(250); };
const clickXY = async (x, y) => { for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 }); };

async function attachZoho() {
  for (let i = 0; i < 80; i++) {
    const { targetInfos } = await send("Target.getTargets");
    const t = targetInfos.find((x) => x.type === "iframe" && /zohobookings/.test(x.url));
    if (t) { const { sessionId } = await send("Target.attachToTarget", { targetId: t.targetId, flatten: true }); return sessionId; }
    await sleep(250);
  }
  return null;
}
const waitZ = async (sid, re, n = 80) => { for (let i = 0; i < n; i++) { if (await ev(`!!document.body&&${re}.test(document.body.innerText)`, sid)) return true; await sleep(250); } return false; };

// Zoho-frame rects (viewport coords of the iframe document)
const zRects = (re, last) => `(function(){var card=document.querySelector('.zb-ct-leftpanel');var cb=card&&card.getBoundingClientRect();
  var t=null;${re ? `var b=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&${re}.test(e.textContent.trim())&&e.getBoundingClientRect().height});var e=b[${last ? "b.length-1" : "0"}];if(e){e.scrollIntoView({block:'nearest'});var r=e.getBoundingClientRect();t=[r.left,r.top,r.right,r.bottom]}` : ""}
  return {card:cb&&[cb.left,cb.top,cb.right,cb.bottom],target:t,layout:innerWidth>=1280?'two-column':'stacked',vw:innerWidth,vh:innerHeight}})()`;
const parentState = `(function(){var m=document.getElementById('dl-book-modal'),f=document.getElementById('dl-book-frame'),i=f.querySelector('iframe'),fb=f.getBoundingClientRect(),ib=i?i.getBoundingClientRect():null,bx=m.querySelector('.dl-modal__box').getBoundingClientRect();
  return {hidden:m.hidden,frame:[fb.left+f.clientLeft,fb.top+f.clientTop,fb.left+f.clientLeft+f.clientWidth,fb.top+f.clientTop+f.clientHeight],iframe:ib&&[ib.left,ib.top,ib.width,ib.height],box:[Math.round(bx.width),Math.round(bx.height)],scroll:[f.scrollLeft,f.scrollTop,f.scrollWidth-f.clientWidth,f.scrollHeight-f.clientHeight],overflow:getComputedStyle(f).overflow,active:document.activeElement&&(document.activeElement.className||document.activeElement.tagName)}})()`;

// Visible header pixels = overlap of Zoho's card (mapped into page coords) with the frame's visible rect.
async function headerVisible(sid, tag) {
  const z = await ev(zRects(null), sid), p = await ev(parentState);
  if (!z.card) { log(tag + " header", { card: null }); return; }
  const [fl, ft, fr, fbm] = p.frame, [il, it] = p.iframe;
  const c = [il + z.card[0], it + z.card[1], il + z.card[2], it + z.card[3]];
  const w = Math.max(0, Math.min(c[2], fr) - Math.max(c[0], fl)), h = Math.max(0, Math.min(c[3], fbm) - Math.max(c[1], ft));
  log(tag + " header", { layout: z.layout, zohoViewport: [z.vw, z.vh], cardInPage: c.map(Math.round), frame: p.frame.map(Math.round), visiblePx: [Math.round(w), Math.round(h)], frameScroll: p.scroll, box: p.box });
}
async function zclick(sid, re, last, tag) {
  const z = await ev(zRects(re, last), sid);
  if (!z.target) { log(tag, "not found"); return false; }
  const p = await ev(parentState);
  const x = p.iframe[0] + (z.target[0] + z.target[2]) / 2, y = p.iframe[1] + (z.target[1] + z.target[3]) / 2;
  const inside = x > p.frame[0] && x < p.frame[2] && y > p.frame[1] && y < p.frame[3];
  log(tag, { at: [Math.round(x), Math.round(y)], insideVisibleFrame: inside });
  if (!inside) return false;
  await clickXY(x, y);
  return true;
}
async function wheelFrame(dy) {
  const p = await ev(parentState);
  const x = (p.frame[0] + p.frame[2]) / 2 + (p.frame[2] - p.frame[0]) * 0.2, y = (p.frame[1] + p.frame[3]) / 2;
  await send("Input.dispatchMouseEvent", { type: "mouseWheel", x, y, deltaX: 0, deltaY: dy });
  await sleep(900);
}

const VIEWS = [["1440", 1440, 900, false], ["390", 390, 844, true]];
const EXTRA = [["1024", 1024, 768, false], ["800", 800, 900, false]];
const only = process.argv[2];
for (const path of ["/home", "/highered"]) {
  for (const [tag, w, h, mob] of [...VIEWS, ...(path === "/home" ? EXTRA : [])]) {
    const name = `${path.slice(1)}-${tag}`;
    if (only && !name.includes(only)) continue;
    const extra = EXTRA.some((e) => e[0] === tag);
    await send("Page.navigate", { url: "about:blank" }); await sleep(300);
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mob ? 2 : 1, mobile: mob });
    await send("Page.navigate", { url: BASE + path });
    for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
    await sleep(800);
    // open with a real click on the header CTA (menu CTA on mobile is behind the burger; use the hero CTA there)
    const cta = await ev(`(function(){var a=[].slice.call(document.querySelectorAll('[data-bookings-open]')).filter(function(e){var b=e.getBoundingClientRect();return b.width&&b.top>=0&&b.bottom<=innerHeight})[0];if(!a)return null;var b=a.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2,href:a.getAttribute('href'),text:a.textContent.trim()}})()`);
    log(name + " cta", cta);
    if (cta) await clickXY(cta.x, cta.y); else await ev(`window.dlOpenBookings()`);
    await sleep(400);
    log(name + " opened", await ev(parentState));
    const sid = await attachZoho();
    await waitZ(sid, "/Select date and time/"); await sleep(1500);
    await headerVisible(sid, name + " 1-date");
    await snap(`${name}-1-date.png`);

    const slotRe = "/^\\d\\d:\\d\\d\\s?(am|pm)$/i";
    if (!(await ev(`${slotRe}.test(document.body.innerText)`, sid))) {
      await zclick(sid, "/^([1-9]|[12][0-9]|3[01])$/", true, name + " click last enabled day");
      await waitZ(sid, "/\\d\\d:\\d\\d\\s?(am|pm)/i"); await sleep(1500);
    }
    await headerVisible(sid, name + " 2-times");
    await snap(`${name}-2-times.png`);
    if (extra) {
      await zclick(sid, slotRe, false, name + " click first time"); await sleep(1200);
      await zclick(sid, "/^Next$/", false, name + " click Next"); await waitZ(sid, "/Please enter your details/"); await sleep(1500);
      await headerVisible(sid, name + " 3-details");
      await snap(`${name}-3-details.png`);
      continue;
    }
    await wheelFrame(600);
    await headerVisible(sid, name + " 2-times scrolled");
    await snap(`${name}-2-times-scrolled.png`);
    await wheelFrame(-2000);

    await zclick(sid, slotRe, false, name + " click first time"); await sleep(1200);
    await headerVisible(sid, name + " 2b-time-picked");
    await snap(`${name}-2b-time-picked.png`);
    await zclick(sid, "/^Next$/", false, name + " click Next");
    await waitZ(sid, "/Please enter your details/"); await sleep(1800);
    await headerVisible(sid, name + " 3-details");
    await snap(`${name}-3-details.png`);
    await wheelFrame(3000); await wheelFrame(3000);
    await headerVisible(sid, name + " 3-details bottom");
    log(name + " submit button visible (not clicked)", await ev(`(function(){var b=[].slice.call(document.querySelectorAll('button,input[type=submit],div')).filter(function(e){return /^Schedule Appointment$/.test(e.textContent.trim())&&e.getBoundingClientRect().height})[0];if(!b)return null;var r=b.getBoundingClientRect();return [Math.round(r.top),Math.round(r.bottom),innerHeight]})()`, sid));
    await snap(`${name}-3-details-bottom.png`);

    // dialog behaviour: focus trap, Escape, reopen keeps state, close button
    await ev(`document.querySelector('#dl-book-modal .dl-modal__close').focus()`);
    await key("Tab", "Tab", 9);
    log(name + " Tab from close ->", (await ev(parentState)).active);
    await ev(`document.querySelector('#dl-book-modal .dl-modal__close').focus()`);
    await key("Tab", "Tab", 9, 8);
    log(name + " Shift+Tab from close ->", (await ev(parentState)).active);
    await ev(`document.querySelector('#dl-book-modal .dl-modal__close').focus()`);
    await key("Escape", "Escape", 27);
    log(name + " after Escape", await ev(`({hidden:document.getElementById('dl-book-modal').hidden,focus:document.activeElement&&document.activeElement.textContent.trim().slice(0,30),bodyOverflow:document.body.style.overflow})`));
    await ev(`window.dlOpenBookings()`); await sleep(500);
    await headerVisible(sid, name + " reopened");
    const cb = await ev(`(function(){var b=document.querySelector('#dl-book-modal .dl-modal__close').getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()`);
    await clickXY(cb[0], cb[1]); await sleep(400);
    log(name + " after close click", await ev(`({hidden:document.getElementById('dl-book-modal').hidden,fallback:window.dlBookingsFallback,ctaHrefs:[].slice.call(document.querySelectorAll('[data-bookings-open]')).map(function(a){return a.getAttribute('href')}).filter(function(v,i,s){return s.indexOf(v)===i}),html:document.documentElement.className})`));
  }
}
writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close(); edge.kill(); process.exit(0);

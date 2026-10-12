// Headless Edge: open the Schedule a demo modal on the local preview, click through Zoho's steps with real mouse
// input (date, time, Next, details; never submits), then replace Zoho's page with a replica of its confirmation
// (Zoho's own invoice-summary template classes, lazy CSS and fonts; no booking is made) and screenshot each state.
// Measures: header-card pixels visible in the modal frame, the left-panel divider, step content vs frame edges,
// and the confirmation heading/card position inside the frame.
// Usage: node shoot.mjs <prefix> [filter]
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9741;
try { await fetch(`http://127.0.0.1:${PORT}/json`); console.error("port busy"); process.exit(1); } catch {}
const BASE = "http://127.0.0.1:8767";
const PREFIX = process.argv[2] || "after";
const only = process.argv[3];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {} await sleep(200); }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); ws.send(JSON.stringify(sessionId ? { id: i, sessionId, method, params } : { id: i, method, params })); });
// Safety: inside the Zoho frame, fail every non-GET request except the read-only startup lookup, so nothing can be booked.
const blocked = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === "Fetch.requestPaused") {
    const r = m.params.request;
    if (r.method !== "GET" && !/\/identifyUrlById\/execute$/.test(r.url) && !/logsapi\.zoho\.com/.test(r.url)) { blocked.push([r.method, r.url]); send("Fetch.failRequest", { requestId: m.params.requestId, errorReason: "BlockedByClient" }, m.sessionId); }
    else send("Fetch.continueRequest", { requestId: m.params.requestId }, m.sessionId);
  }
});
const ev = async (expr, sessionId) => { const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }, sessionId); return r.exceptionDetails ? { error: r.exceptionDetails.text + " " + (r.exceptionDetails.exception && r.exceptionDetails.exception.description) } : r.result.value; };
const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };
const snap = async (name) => { const { data } = await send("Page.captureScreenshot", { format: "png" }); writeFileSync(join(OUT, name), Buffer.from(data, "base64")); };
const clickXY = async (x, y) => { for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 }); };

async function attachZoho() {
  for (let i = 0; i < 80; i++) {
    const { targetInfos } = await send("Target.getTargets");
    const t = targetInfos.find((x) => x.type === "iframe" && /zohobookings/.test(x.url));
    if (t) {
      const { sessionId } = await send("Target.attachToTarget", { targetId: t.targetId, flatten: true });
      await send("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] }, sessionId).catch(() => {});
      await send("Runtime.runIfWaitingForDebugger", {}, sessionId).catch(() => {});
      return sessionId;
    }
    await sleep(250);
  }
  return null;
}
const waitZ = async (sid, re, n = 80) => { for (let i = 0; i < n; i++) { if (await ev(`!!document.body&&${re}.test(document.body.innerText)`, sid)) return true; await sleep(250); } return false; };

const parentState = `(function(){var f=document.getElementById('dl-book-frame'),i=f.querySelector('iframe'),fb=f.getBoundingClientRect(),ib=i.getBoundingClientRect(),bx=document.querySelector('#dl-book-modal .dl-modal__box').getBoundingClientRect();
  return {frame:[fb.left+f.clientLeft,fb.top+f.clientTop,fb.left+f.clientLeft+f.clientWidth,fb.top+f.clientTop+f.clientHeight],iframe:[ib.left,ib.top],scale:ib.width/i.offsetWidth,zohoW:i.offsetWidth,box:[Math.round(bx.width),Math.round(bx.height)],mask:getComputedStyle(f,'::after').content!=='none'?(function(){var s=getComputedStyle(f,'::after');return [s.left,s.width]})():null}})()`;
const zGeom = `(function(){function r(e){if(!e)return null;var b=e.getBoundingClientRect();return [b.left,b.top,b.right,b.bottom]}
  function ext(root){var a=[1e9,1e9,-1,-1];[].slice.call(root.querySelectorAll('*')).forEach(function(e){var b=e.getBoundingClientRect();if(!b.width||!b.height)return;if(!(e.children.length===0||/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName)))return;a=[Math.min(a[0],b.left),Math.min(a[1],b.top),Math.max(a[2],b.right),Math.max(a[3],b.bottom)]});return a}
  var lp=document.querySelector('.zb-ct-leftpanel'),rp=document.querySelector('.zb-ct-rightpanel');
  return {vw:innerWidth,left:r(lp),leftContent:lp&&ext(lp),divider:lp&&[lp.getBoundingClientRect().right-1,lp.getBoundingClientRect().right],right:r(rp),rightContent:rp&&ext(rp),bg:lp&&[getComputedStyle(lp).backgroundColor,getComputedStyle(rp).backgroundColor]}})()`;
const R = (a) => a && a.map((v) => Math.round(v));

// Map Zoho-viewport x/y to page coords and describe it relative to the visible frame.
function toPage(p, a) { return [p.iframe[0] + a[0] * p.scale, p.iframe[1] + a[1] * p.scale, p.iframe[0] + a[2] * p.scale, p.iframe[1] + a[3] * p.scale]; }
async function measureStep(sid, tag) {
  const z = await ev(zGeom, sid), p = await ev(parentState);
  const [fl, ft, fr, fb] = p.frame;
  const card = z.left && toPage(p, z.leftContent);
  const hdrW = card ? Math.max(0, Math.min(card[2], fr) - Math.max(card[0], fl)) : 0, hdrH = card ? Math.max(0, Math.min(card[3], fb) - Math.max(card[1], ft)) : 0;
  const dv = z.divider && toPage(p, [z.divider[0], 0, z.divider[1], 0]);
  const rc = z.rightContent && toPage(p, z.rightContent);
  log(`${tag}`, { zohoW: p.zohoW, scale: +p.scale.toFixed(4), box: p.box, frame: R(p.frame), headerTextVisiblePx: [Math.round(hdrW), Math.round(hdrH)],
    dividerX_inFrame: dv && +(dv[0] - fl).toFixed(1), mask: p.mask, stepContent_inFrame: rc && [Math.round(rc[0] - fl), Math.round(rc[2] - fl)], frameW: Math.round(fr - fl),
    clippedRight: rc ? rc[2] > fr + 0.5 : null, clippedLeft: rc ? rc[0] < fl - 0.5 : null, panelBg: z.bg });
}
const find = (re, last) => `(function(){var b=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&${re}.test(e.textContent.trim())&&e.getBoundingClientRect().height});var e=b[${last ? "b.length-1" : "0"}];if(!e)return null;e.scrollIntoView({block:'nearest'});var r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]})()`;
async function zclick(sid, re, last, tag) {
  const t = await ev(find(re, last), sid);
  if (!t) { log(tag, "not found"); return false; }
  const p = await ev(parentState);
  const a = toPage(p, t), x = (a[0] + a[2]) / 2, y = (a[1] + a[3]) / 2;
  const inside = x > p.frame[0] && x < p.frame[2] && y > p.frame[1] && y < p.frame[3];
  if (!inside) { log(tag, { at: [Math.round(x), Math.round(y)], insideVisibleFrame: false }); return false; }
  await clickXY(x, y); return true;
}
async function wheelFrame(dy) {
  const p = await ev(parentState);
  await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: (p.frame[0] + p.frame[2]) / 2 + (p.frame[2] - p.frame[0]) * 0.2, y: (p.frame[1] + p.frame[3]) / 2, deltaX: 0, deltaY: dy });
  await sleep(900);
}

const CONFIRM_CSS = "https://static.zohocdn.com/bookings/V9_558_47/dist/common/assets/css/bookings-page/invoice-summary-ae69683ba8cc84f6dd8ff564f0e725a8.css";
const injectConfirm = `new Promise(function(done){
  var l=document.createElement('link');l.rel='stylesheet';l.href='${CONFIRM_CSS}';l.onload=function(){setTimeout(done,300)};l.onerror=function(){done('css error')};document.head.appendChild(l);
  [].forEach.call(document.body.children,function(e){e.style.display='none'});
  var d=document.createElement('div');d.id='dl-confirm-replica';d.className='zb-invoice-summary-one notranslate';
  d.innerHTML='<div class="zb-new-brand"><div class="zb-invoice-sumary-container zb-invoice-fullview"><div class="zb-invoice-sumary">'+
   '<div class="fonts-medium fs-highest text-center" role="heading">Appointment confirmed with jared_delphi-me!</div>'+
   '<div class="zb-iv-box pos-rel"><span class="zb-iv-details dis-flex"><span class="zb-iv-calendar field-center pos-rel"></span>'+
   '<span class="zb-iv-service-details ml15 field-center text-ellipsis"><span class="dis-flex zb-iv-theme-color fs-normal"><span class="field-center fonts-medium">29 Sep 2026</span><span class="field-center ml3 mr3">|</span><span class="field-center fonts-medium">04:00 pm</span></span>'+
   '<span class="dis-block mt5 text-gray text-ellipsis">Schedule a Demo!</span><span class="dis-block mt5 pt2 text-gray text-ellipsis fs-lower-large">America/Denver GMT -06:00</span></span></span>'+
   '<div class="zb-iv-meeting-details zb-iv-meet-detailsone"><span class="zb-iv-zoom-icon field-center mr10"></span><span class="field-center fs-lower-large zb-iv-meeting-details-field text-ellipsis field-flex-one"><span class="dis-block fonts-medium text-ellipsis">Zoom Meeting</span><span class="common-link zb-link-underline mt5 text-ellipsis cp">https://us06web.zoom.us/j/00000000000?pwd=replica</span></span><span class="field-center zb-link-underline zb-iv-theme-color cp ml10">Join</span></div>'+
   '<div class="dis-flex mt20 align-center" style="justify-content:center"><span class="field-center common-link zb-link-underline pos-rel"><span class="cp fs-medium">+ Add to Calendar</span></span><span class="ml5 mr5 field-center text-gray">|</span><span class="field-center common-link zb-link-underline fs-medium">Download as ICS</span></div>'+
   '<div class="zb-iv-menu pos-abs"><span class="zb zb-more-horizontal cp"></span></div></div>'+
   '<div class="dis-flex align-center zb-iv-theme-color zb-iv-book-appointent" style="justify-content:center"><span class="field-center fonts-medium fs-medium-small pos-rel cp">Book another appointment<span class="zb zb-arrow-right pos-abs fs-lower-large"></span></span></div>'+
   '</div></div></div>';
  document.body.appendChild(d);
})`;
const confirmGeom = `(function(){var h=document.querySelector('#dl-confirm-replica [role=heading]');var rg=document.createRange();rg.selectNodeContents(h);var a=rg.getBoundingClientRect();
  var b=document.querySelector('#dl-confirm-replica .zb-iv-box').getBoundingClientRect();var c=document.querySelector('#dl-confirm-replica .zb-iv-book-appointent > span').getBoundingClientRect();
  return {vw:innerWidth,heading:[a.left,a.top,a.right,a.bottom],card:[b.left,b.top,b.right,b.bottom],book:[c.left,c.top,c.right,c.bottom],font:getComputedStyle(h).fontSize+' '+getComputedStyle(h).fontFamily.slice(0,30)}})()`;
async function measureConfirm(sid, tag) {
  const z = await ev(confirmGeom, sid), p = await ev(parentState);
  const [fl, , fr] = p.frame;
  const h = toPage(p, z.heading), c = toPage(p, z.card);
  const contentL = Math.min(h[0], c[0]), contentR = Math.max(h[2], c[2]);
  log(tag, { zohoW: z.vw, font: z.font, zohoHeading: R(z.heading), zohoCard: R(z.card), frameW: Math.round(fr - fl),
    heading_inFrame: [Math.round(h[0] - fl), Math.round(h[2] - fl)], card_inFrame: [Math.round(c[0] - fl), Math.round(c[2] - fl)],
    headingTop_inFrame: Math.round(h[1] - p.frame[1]), marginsLR: [Math.round(contentL - fl), Math.round(fr - contentR)],
    headingClipped: h[0] < fl - 0.5 || h[2] > fr + 0.5, cardClipped: c[0] < fl - 0.5 || c[2] > fr + 0.5, maskOverHeading: p.mask ? (parseFloat(p.mask[0]) + parseFloat(p.mask[1]) > h[0] - fl) : false });
}

const VIEWS = [["1440", 1440, 900], ["1024", 1024, 768], ["900", 900, 800]];
for (const path of ["/home", "/highered"]) {
  for (const [vtag, w, h] of VIEWS) {
    if (vtag === "900" && path !== "/home") continue;
    const name = `${PREFIX}-${path.slice(1)}-${vtag}`;
    if (only && !name.includes(only)) continue;
    await send("Page.navigate", { url: "about:blank" }); await sleep(300);
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: BASE + path });
    for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
    await sleep(800);
    const cta = await ev(`(function(){var a=[].slice.call(document.querySelectorAll('[data-bookings-open]')).filter(function(e){var b=e.getBoundingClientRect();return b.width&&b.top>=0&&b.bottom<=innerHeight})[0];if(!a)return null;var b=a.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}})()`);
    if (cta) await clickXY(cta.x, cta.y); else await ev(`window.dlOpenBookings()`);
    await sleep(400);
    const sid = await attachZoho();
    await waitZ(sid, "/Select date and time/"); await sleep(1500);
    await measureStep(sid, name + " 1-date"); await snap(`${name}-1-date.png`);
    const slotRe = "/^\\d\\d:\\d\\d\\s?(am|pm)$/i";
    if (!(await ev(`${slotRe}.test(document.body.innerText)`, sid))) {
      await zclick(sid, "/^([1-9]|[12][0-9]|3[01])$/", true, name + " click last enabled day");
      await waitZ(sid, "/\\d\\d:\\d\\d\\s?(am|pm)/i"); await sleep(1500);
    }
    await measureStep(sid, name + " 2-times"); await snap(`${name}-2-times.png`);
    await zclick(sid, slotRe, false, name + " click first time"); await sleep(1200);
    await measureStep(sid, name + " 2b-time-picked"); await snap(`${name}-2b-time-picked.png`);
    await zclick(sid, "/^Next$/", false, name + " click Next");
    await waitZ(sid, "/Please enter your details/"); await sleep(1800);
    await measureStep(sid, name + " 3-details"); await snap(`${name}-3-details.png`);
    await wheelFrame(3000); await wheelFrame(3000);
    log(name + " 3-details submit button (not clicked)", await ev(`(function(){var b=[].slice.call(document.querySelectorAll('button,input[type=submit],div')).filter(function(e){return /^Schedule Appointment$/.test(e.textContent.trim())&&e.getBoundingClientRect().height})[0];if(!b)return null;var r=b.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom),innerHeight]})()`, sid));
    await snap(`${name}-3-details-bottom.png`);
    log(name + " inject confirmation replica", await ev(injectConfirm, sid) || "ok");
    await sleep(800);
    await measureConfirm(sid, name + " 4-confirm"); await snap(`${name}-4-confirm.png`);
  }
}
log("blocked non-GET requests", blocked);
writeFileSync(join(OUT, `${PREFIX}-checks.json`), JSON.stringify(results, null, 1));
ws.close(); edge.kill(); process.exit(0);

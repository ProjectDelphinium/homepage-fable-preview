// In-modal probe: log postMessage events Zoho sends the parent, and measure Zoho's header card on each step.
// Attaches to the cross-origin iframe over CDP for measurement only (the page itself cannot do this).
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9611;
try { await fetch(`http://127.0.0.1:${PORT}/json`); console.error("port busy"); process.exit(1); } catch {}
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {} await sleep(200); }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map(); const frames = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Target.attachedToTarget") {
    const { sessionId, targetInfo } = m.params;
    if (targetInfo.type === "iframe") frames.set(sessionId, "zohobookings?" + targetInfo.url);
    ws.send(JSON.stringify({ id: ++id, sessionId, method: "Runtime.runIfWaitingForDebugger" }));
  }
  if (m.method === "Target.detachedFromTarget") frames.delete(m.params.sessionId);
  if (m.method === "Runtime.executionContextCreated") {
    const c = m.params.context;
    if (/zohobookings/.test(c.origin) && c.auxData && c.auxData.isDefault) zctx = c.id;
  }
  if (m.method === "Runtime.executionContextsCleared") zctx = null;
});
let zctx = null;
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); ws.send(JSON.stringify(sessionId ? { id: i, sessionId, method, params } : { id: i, method, params })); });
// sid: a Zoho frame session (out-of-process iframe) or "ctx:<id>" for an in-process frame context
const ev = async (expr, sid) => {
  const p = { expression: expr, returnByValue: true, awaitPromise: true };
  if (typeof sid === "string" && sid.startsWith("ctx:")) { p.contextId = Number(sid.slice(4)); sid = undefined; }
  const r = await send("Runtime.evaluate", p, sid);
  return r.exceptionDetails ? { error: r.exceptionDetails.text } : r.result.value;
};
const zsid = async () => {
  for (const s of frames.keys()) { try { if (/zohobookings/.test(await ev("location.host", s))) return s; } catch {} }
  return zctx ? "ctx:" + zctx : null;
};
const snap = async (name) => { const { data } = await send("Page.captureScreenshot", { format: "png" }); writeFileSync(join(OUT, name), Buffer.from(data, "base64")); };
const out = {};

await send("Target.setAutoAttach", { autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
await send("Runtime.enable");
const LISTEN = `window.__zbMsgs=window.__zbMsgs||[];addEventListener('message',function(e){try{window.__zbMsgs.push({t:Math.round(performance.now()),origin:e.origin,data:typeof e.data==='string'?e.data.slice(0,300):JSON.stringify(e.data).slice(0,300)})}catch(x){}});1`;

// inside the Zoho frame: card + first heading of the step
const measure = `(function(){
  var sels=['.zb-ct-leftpanel','.zb-selected-container','.zb-all-details'];var card=null;for(var i=0;i<sels.length&&!card;i++)card=document.querySelector(sels[i]);
  var c=document.querySelector('.zb-ctheme-content');var st=c?c.scrollTop:0;
  var cb=card&&card.getBoundingClientRect();
  var hs=[].slice.call(document.querySelectorAll('h1,h2,h3,.zb-ct-right-header')).filter(function(h){return h.getBoundingClientRect().height}).map(function(h){var b=h.getBoundingClientRect();return [Math.round(b.top+st),h.textContent.trim().slice(0,40)]});
  var back=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&/^Back$/.test(e.textContent.trim())&&e.getBoundingClientRect().height}).map(function(e){var b=e.getBoundingClientRect();return Math.round(b.top+st)});
  return {hash:location.hash,vw:innerWidth,vh:innerHeight,card:cb&&{top:Math.round(cb.top+st),bottom:Math.round(cb.bottom+st),h:Math.round(cb.height),w:Math.round(cb.width),left:Math.round(cb.left)},headings:hs.slice(0,4),back:back,contentScroll:c&&{sh:c.scrollHeight,ch:c.clientHeight},text:document.body.innerText.replace(/\\s+/g,' ').slice(0,140)};
})()`;
// page coords of a leaf element matching re inside the frame (scrolls parent frame so it is visible)
async function clickText(sid, re, last = false) {
  const r = await ev(`(function(){var b=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&${re}.test(e.textContent.trim())&&e.getBoundingClientRect().height});var e=b[${last ? "b.length-1" : "0"}];if(!e)return null;var r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`, sid);
  if (!r) return false;
  // bring that iframe y into view in the parent scroller
  const pos = await ev(`(function(){var f=document.getElementById('dl-book-frame'),i=f.querySelector('iframe');var target=${r[1]}-222-f.clientHeight/2;f.scrollTop=Math.max(0,target);var ib=i.getBoundingClientRect();return [ib.left+${r[0]},ib.top+${r[1]}]})()`);
  await sleep(300);
  for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: pos[0], y: pos[1], button: "left", clickCount: 1 });
  return pos;
}
const waitFor = async (sid, re, n = 40) => { for (let i = 0; i < n; i++) { if (await ev(`${re}.test(document.body.innerText)`, sid)) return true; await sleep(250); } return false; };

for (const path of ["/highered", "/home"]) {
  for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
    const key = `${path.slice(1)}-${tag}`;
    await send("Page.navigate", { url: "about:blank" }); await sleep(300);
    frames.clear(); zctx = null;
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
    await send("Page.navigate", { url: BASE + path });
    for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
    await ev(LISTEN);
    await ev(`window.dlOpenBookings()`);
    let sid; for (let i = 0; i < 60 && !sid; i++) { sid = await zsid(); if (!sid) await sleep(250); }
    await waitFor(sid, "/Select date and time/", 80); await sleep(1500);
    out[key + " 1 date"] = await ev(measure, sid);
    await snap(`probe-${key}-1-date.png`);
    // step 2: pick a day with slots (30) unless slots already listed
    if (!(await ev(`/\\d\\d:\\d\\d\\s?(am|pm)/i.test(document.body.innerText)`, sid))) { out[key + " click day"] = await clickText(sid, "/^30$/", true); await waitFor(sid, "/\\d\\d:\\d\\d\\s?(am|pm)/i"); await sleep(800); }
    out[key + " 2 slots"] = await ev(measure, sid);
    await ev(`document.getElementById('dl-book-frame').scrollTop=0`); await sleep(200);
    await snap(`probe-${key}-2-slots.png`);
    out[key + " click slot"] = await clickText(sid, "/^\\d\\d:\\d\\d\\s?(am|pm)$/i"); await sleep(1200);
    out[key + " 2b slot picked"] = await ev(measure, sid);
    out[key + " click next"] = await clickText(sid, "/^Next$/"); await waitFor(sid, "/Please enter your details/"); await sleep(1200);
    out[key + " 3 details"] = await ev(measure, sid);
    await ev(`document.getElementById('dl-book-frame').scrollTop=0`); await sleep(200);
    await snap(`probe-${key}-3-details.png`);
    out[key + " messages"] = await ev(`window.__zbMsgs`);
    out[key + " activeElement"] = await ev(`document.activeElement&&document.activeElement.tagName`);
  }
}
writeFileSync(join(OUT, "probe.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
ws.close(); edge.kill(); process.exit(0);

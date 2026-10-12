// Real modal on the preview: what can the parent page observe per Zoho step? (history.length, contentWindow.length, messages)
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9715;
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
const out = {};

async function zoho() {
  for (let i = 0; i < 80; i++) {
    const { targetInfos } = await send("Target.getTargets");
    const t = targetInfos.find((x) => x.type === "iframe" && /zohobookings/.test(x.url));
    if (t) { const { sessionId } = await send("Target.attachToTarget", { targetId: t.targetId, flatten: true }); return sessionId; }
    await sleep(250);
  }
  return null;
}
const parentSig = `(function(){var f=document.querySelector('#dl-book-frame iframe');return {hist:history.length,frames:f&&f.contentWindow.length,msgs:(window.__m||[]).slice(),frameScroll:document.getElementById('dl-book-frame').scrollTop,active:document.activeElement&&document.activeElement.tagName}})()`;
const zSig = `({hist:history.length,frames:window.length,href:location.href,title:document.title,step:(document.body.innerText.match(/Select date and time|Please enter your details|\\d\\d:\\d\\d\\s?(am|pm)/i)||[''])[0]})`;
const zfind = (re, last) => `(function(){var b=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&${re}.test(e.textContent.trim())&&e.getBoundingClientRect().height});var e=b[${last ? "b.length-1" : "0"}];if(!e)return null;e.scrollIntoView({block:'center'});var r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`;
async function zclick(sid, re, last) {
  const p = await ev(zfind(re, last), sid); if (!p) return "notfound";
  await sleep(300);
  const p2 = await ev(zfind(re, last), sid);
  const ib = await ev(`(function(){var b=document.querySelector('#dl-book-frame iframe').getBoundingClientRect();return [b.left,b.top]})()`);
  const x = ib[0] + p2[0], y = ib[1] + p2[1];
  for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
  return [Math.round(x), Math.round(y)];
}
const waitZ = async (sid, re, n = 60) => { for (let i = 0; i < n; i++) { if (await ev(`${re}.test(document.body.innerText)`, sid)) return true; await sleep(250); } return false; };

await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: BASE + "/home" });
for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
await ev(`window.__m=[];addEventListener('message',function(e){__m.push([e.origin,typeof e.data==='string'?e.data.slice(0,200):JSON.stringify(e.data).slice(0,200)])});1`);
out.beforeOpen = await ev(parentSig);
await ev(`window.dlOpenBookings()`);
const sid = await zoho();
out.sid = !!sid;
await waitZ(sid, "/Select date and time/", 80); await sleep(1500);
out["1 date parent"] = await ev(parentSig); out["1 date zoho"] = await ev(zSig, sid);
out.clickDay = await zclick(sid, "/^(29|30|[1-9]|[12][0-9]|3[01])$/", true);
await waitZ(sid, "/\\d\\d:\\d\\d\\s?(am|pm)/i"); await sleep(1200);
out["2 slots parent"] = await ev(parentSig); out["2 slots zoho"] = await ev(zSig, sid);
out.clickSlot = await zclick(sid, "/^\\d\\d:\\d\\d\\s?(am|pm)$/i"); await sleep(1000);
out.clickNext = await zclick(sid, "/^Next$/"); await waitZ(sid, "/Please enter your details/"); await sleep(1500);
out["3 details parent"] = await ev(parentSig); out["3 details zoho"] = await ev(zSig, sid);
out.clickBack = await zclick(sid, "/^Back$/"); await sleep(1500);
out["4 back parent"] = await ev(parentSig); out["4 back zoho"] = await ev(zSig, sid);
writeFileSync(join(OUT, "probe-signals.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
ws.close(); edge.kill(); process.exit(0);

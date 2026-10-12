// Zoho portal-embed: reach the details step (pick a slot) and map the top band + natural content height.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9589;
try { await fetch(`http://127.0.0.1:${PORT}/json`); console.error("port busy"); process.exit(1); } catch {}
const URL_ = "https://jared-delphi-me.zohobookings.com/portal-embed#/4937208000000036014";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {} await sleep(200); }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
const out = {};
const snap = async (name) => { const { data } = await send("Page.captureScreenshot", { format: "png" }); writeFileSync(join(OUT, name), Buffer.from(data, "base64")); };
const top = `(function(){var r=[];document.querySelectorAll('body *').forEach(function(el){if(el.children.length)return;var t=el.textContent.trim();if(!t)return;var b=el.getBoundingClientRect();if(b.height&&b.top<300)r.push([Math.round(b.top),t.slice(0,40)]);});var c=document.querySelector('.zb-ctheme-content');return {top:r.slice(0,30),content:c&&{sh:c.scrollHeight,ch:c.clientHeight},natural:(function(){var p=document.querySelector('.zb-ctheme-panel');return p&&Math.round(p.getBoundingClientRect().height)})()}})()`;
const slotRe = `/^\\d\\d:\\d\\d\\s?(am|pm)$/i`;

for (const [tag, w, h, mob] of [["1440", 1100, 804, false], ["390", 358, 748, true]]) {
  await send("Page.navigate", { url: "about:blank" }); await sleep(300);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
  await send("Page.navigate", { url: URL_ });
  for (let i = 0; i < 80; i++) { if (await ev(`!!document.body&&/Select date and time/.test(document.body.innerText)`)) break; await sleep(250); }
  let slots = false;
  for (let i = 0; i < 40 && !slots; i++) { slots = await ev(`[].some.call(document.querySelectorAll('*'),function(e){return e.children.length===0&&${slotRe}.test(e.textContent.trim())})`); if (!slots) await sleep(250); }
  const clickAt = async (xy) => { if (!xy) return; for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: xy[0], y: xy[1], button: "left", clickCount: 1 }); };
  out[tag + " days"] = await ev(`[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&/^(29|30)$/.test(e.textContent.trim())}).map(function(e){var b=e.getBoundingClientRect();return [e.textContent.trim(),e.tagName,e.className,Math.round(b.left+b.width/2),Math.round(b.top+b.height/2)]})`);
  if (!slots) {
    for (const d of ["29", "30"]) {
      const xy = await ev(`(function(){var d=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&e.textContent.trim()==='${d}'});var e=d[d.length-1];if(!e)return null;var b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()`);
      await clickAt(xy); await sleep(2500);
      slots = await ev(`[].some.call(document.querySelectorAll('*'),function(e){return e.children.length===0&&${slotRe}.test(e.textContent.trim())})`);
      if (slots) break;
    }
    out[tag + " body after day click"] = await ev(`document.body.innerText.slice(0,500)`);
    for (let i = 0; i < 40 && !slots; i++) { slots = await ev(`[].some.call(document.querySelectorAll('*'),function(e){return e.children.length===0&&${slotRe}.test(e.textContent.trim())})`); if (!slots) await sleep(250); }
  }
  out[tag + " slots visible"] = slots;
  out[tag + " date"] = await ev(top);
  await snap(`probe2-${tag}-date.png`);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: 3000, deviceScaleFactor: 1, mobile: mob }); await sleep(700);
  out[tag + " date natural@3000"] = await ev(top);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob }); await sleep(700);
  const sxy = await ev(`(function(){var b=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&${slotRe}.test(e.textContent.trim())});if(!b.length)return null;b[0].scrollIntoView({block:'center'});var r=b[0].getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`);
  out[tag + " clicked"] = sxy;
  await clickAt(sxy);
  await sleep(3000);
  out[tag + " details"] = await ev(top);
  await snap(`probe2-${tag}-details.png`);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: 3000, deviceScaleFactor: 1, mobile: mob }); await sleep(700);
  out[tag + " details natural@3000"] = await ev(top);
}
writeFileSync(join(OUT, "probe2.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
ws.close(); edge.kill(); process.exit(0);

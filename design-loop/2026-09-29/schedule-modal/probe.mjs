// Load the Zoho Bookings portal-embed page top-level (same size as the modal frame) and map its header card.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9587;
try { await fetch(`http://127.0.0.1:${PORT}/json`); console.error("port busy"); process.exit(1); } catch {}
const URL_ = "https://jared-delphi-me.zohobookings.com/portal-embed#/4937208000000036014";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });
let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {}
  await sleep(200);
}
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
const out = {};

const map = `(function(){
  function path(el){var p=[];while(el&&el.nodeType===1&&p.length<9){p.unshift(el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/\\s+/).slice(0,3).join('.'):''));el=el.parentElement;}return p.join(' > ');}
  var hits=[];document.querySelectorAll('body *').forEach(function(el){var t=(el.childNodes.length===1&&el.firstChild.nodeType===3)?el.textContent.trim():'';if(/^(Schedule a Demo!|jared_delphi-me|1 hr|Select date and time|SC)$/.test(t)){var b=el.getBoundingClientRect();hits.push({t:t,y:Math.round(b.top),h:Math.round(b.height),path:path(el)});}});
  var sc=[];document.querySelectorAll('*').forEach(function(el){var cs=getComputedStyle(el);if(/(auto|scroll)/.test(cs.overflowY)&&el.scrollHeight>el.clientHeight+2){var b=el.getBoundingClientRect();sc.push({path:path(el),top:Math.round(b.top),h:el.clientHeight,sh:el.scrollHeight});}});
  var c=document.querySelector('.zb-ctheme-content'),cb=c&&c.getBoundingClientRect(),lp=document.querySelector('.zb-ct-leftpanel'),lb=lp&&lp.getBoundingClientRect();
  var se=document.scrollingElement;return {hits:hits,scrollers:sc,content:c&&{top:cb.top,bottom:cb.bottom,sh:c.scrollHeight,ch:c.clientHeight},left:lb&&{top:lb.top,h:lb.height,w:lb.width},doc:{sh:se.scrollHeight,ch:se.clientHeight,iw:innerWidth,ih:innerHeight},href:location.href};
})()`;

for (const [tag, w, h, mob] of [["1440", 1100, 804, false], ["390", 358, 748, true]]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
  await send("Page.navigate", { url: URL_ });
  for (let i = 0; i < 80; i++) { const n = await ev(`document.body&&/Select date and time/.test(document.body.innerText)`); if (n) break; await sleep(250); }
  await sleep(1500);
  out[tag + " date step"] = await ev(map);
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, `probe-${tag}-date.png`), Buffer.from(data, "base64"));
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: 2000, deviceScaleFactor: 1, mobile: mob });
  await sleep(800);
  out[tag + " tall 2000"] = await ev(map);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
  await sleep(800);
  // click first time slot to reach details step (open a date first if none are listed)
  await ev(`(function(){if(/\\d\\d:\\d\\d\\s?(am|pm)/i.test(document.body.innerText))return;var d=[].slice.call(document.querySelectorAll('td,span,div,button')).filter(function(e){return /^(29|30)$/.test(e.textContent.trim())&&e.children.length===0});if(d.length)d[d.length-1].click();})()`);
  await sleep(2000);
  out[tag + " slots"] = await ev(map);
  const s1 = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, `probe-${tag}-slots.png`), Buffer.from(s1.data, "base64"));
  const clicked = await ev(`(function(){var b=[].slice.call(document.querySelectorAll('button,li,div,span')).filter(function(e){return /^\\d\\d:\\d\\d\\s?(am|pm)$/i.test(e.textContent.trim())&&e.children.length<=1});if(!b.length)return null;b[0].click();return b[0].textContent.trim();})()`);
  out[tag + " clicked"] = clicked;
  await sleep(2500);
  out[tag + " details step"] = await ev(map + `;(function(){return document.body.innerText.slice(0,600)})()`);
  out[tag + " details map"] = await ev(map);
  const s2 = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, `probe-${tag}-details.png`), Buffer.from(s2.data, "base64"));
}
writeFileSync(join(OUT, "probe.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
ws.close(); edge.kill(); process.exit(0);

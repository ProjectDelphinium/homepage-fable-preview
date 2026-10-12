// Zoho portal-embed geometry across viewport widths, per step (date, times, details; never submits):
// left (header) panel box and the right edge of its content, right panel box, step content extents.
// Also extracts the confirmation template's class list so the confirmation can be replicated.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9733;
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
const ev = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); return r.exceptionDetails ? { error: r.exceptionDetails.text } : r.result.value; };
const waitText = async (re, n = 80) => { for (let i = 0; i < n; i++) { if (await ev(`!!document.body&&${re}.test(document.body.innerText)`)) return true; await sleep(250); } return false; };
const find = (re) => `(function(){var b=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&${re}.test(e.textContent.trim())&&e.getBoundingClientRect().height});var e=b[0];if(!e)return null;var r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`;
const findLast = (re) => find(re).replace("b[0]", "b[b.length-1]");
const clickAt = async (xy) => { if (!xy || xy.error) return false; for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: xy[0], y: xy[1], button: "left", clickCount: 1 }); return true; };

const geom = `(function(){
  function r(el){if(!el)return null;var b=el.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.right),Math.round(b.bottom)]}
  function ext(root){var minx=1e9,maxx=-1,miny=1e9,maxy=-1;[].slice.call(root.querySelectorAll('*')).forEach(function(e){var b=e.getBoundingClientRect();if(!b.width||!b.height)return;var leaf=e.children.length===0||/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName);if(!leaf)return;minx=Math.min(minx,b.left);maxx=Math.max(maxx,b.right);miny=Math.min(miny,b.top);maxy=Math.max(maxy,b.bottom)});return [Math.round(minx),Math.round(miny),Math.round(maxx),Math.round(maxy)]}
  var lp=document.querySelector('.zb-ct-leftpanel'),rp=document.querySelector('.zb-ct-rightpanel');
  var cs=lp&&getComputedStyle(lp),rs=rp&&getComputedStyle(rp);
  return {vw:innerWidth,left:r(lp),leftContent:lp&&ext(lp),leftPad:cs&&cs.padding,leftBorderR:cs&&(cs.borderRightWidth+' '+cs.borderRightColor),right:r(rp),rightContent:rp&&ext(rp),rightPad:rs&&rs.padding,rightBorderL:rs&&(rs.borderLeftWidth+' '+rs.borderLeftColor),content:r(document.querySelector('.zb-ctheme-content'))};
})()`;
const WIDTHS = [1260, 1266, 1270, 1276, 1280, 1290, 1300, 1310, 1320, 1330, 1340, 1350, 1360, 1380, 1400, 1440, 1600];
const out = {};
async function sweep(tag) {
  for (const w of WIDTHS) { await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: false }); await sleep(450); out[tag + " " + w] = await ev(geom); }
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }); await sleep(600);
}
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: URL_ }); await waitText("/Select date and time/"); await sleep(1500);
await sweep("date");
const slotRe = "/^\\d\\d:\\d\\d\\s?(am|pm)$/i";
if (!(await ev(find(slotRe)))) { await clickAt(await ev(findLast("/^([1-9]|[12][0-9]|3[01])$/"))); await waitText("/\\d\\d:\\d\\d\\s?(am|pm)/i"); await sleep(1200); }
await sweep("times");
await clickAt(await ev(find(slotRe))); await sleep(1000);
await clickAt(await ev(find("/^Next$/"))); await waitText("/Please enter your details/"); await sleep(1500);
await sweep("details");
writeFileSync(join(OUT, "probe-geom.json"), JSON.stringify(out, null, 1));
for (const k in out) { const v = out[k]; console.log(k.padEnd(14), "left", JSON.stringify(v.left), "leftContent", JSON.stringify(v.leftContent), "right", JSON.stringify(v.right), "rightContent", JSON.stringify(v.rightContent)); }
console.log("styles", JSON.stringify({ lp: out["date 1440"].leftPad, lb: out["date 1440"].leftBorderR, rp: out["date 1440"].rightPad, rb: out["date 1440"].rightBorderL }));
ws.close(); edge.kill(); process.exit(0);

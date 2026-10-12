// Natural content height per Zoho step (date, slots, details form) at modal-frame widths.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9591;
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
const clickAt = async (xy) => { if (!xy) return false; for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: xy[0], y: xy[1], button: "left", clickCount: 1 }); return true; };
const find = (re) => `(function(){var b=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&${re}.test(e.textContent.trim())&&e.getBoundingClientRect().height});var e=b[b.length>1&&${re}.source==='^(29|30)$'?b.length-1:0];if(!e)return null;e.scrollIntoView({block:'center'});var r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`;
// natural = content needed with no inner scroll: measure at a short viewport so sh > ch
const measure = async (w, mob) => {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: 300, deviceScaleFactor: 1, mobile: mob }); await sleep(600);
  const r = await ev(`(function(){var c=document.querySelector('.zb-ctheme-content');var card=document.querySelector('.zb-ct-leftpanel');var cb=card&&card.getBoundingClientRect();c&&(c.scrollTop=0);return {contentSh:c&&c.scrollHeight,iframeNeeded:c&&c.scrollHeight+85,cardBottom:cb&&Math.round(cb.bottom+(c?c.scrollTop:0)),cardH:cb&&Math.round(cb.height),text:document.body.innerText.replace(/\\s+/g,' ').slice(0,160)}})()`);
  return r;
};

for (const [tag, w, h, mob] of [["1100", 1100, 804, false], ["690", 690, 480, false], ["358", 358, 748, true]]) {
  await send("Page.navigate", { url: "about:blank" }); await sleep(300);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
  await send("Page.navigate", { url: URL_ });
  for (let i = 0; i < 80; i++) { if (await ev(`!!document.body&&/Select date and time/.test(document.body.innerText)`)) break; await sleep(250); }
  await sleep(1500);
  await snap(`p3-${tag}-1-date.png`);
  out[tag + " date"] = await measure(w, mob);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob }); await sleep(500);
  const slotRe = "/^\\d\\d:\\d\\d\\s?(am|pm)$/i";
  if (!(await ev(find(slotRe)))) { await clickAt(await ev(find("/^(29|30)$/"))); await sleep(2500); }
  await snap(`p3-${tag}-2-slots.png`);
  out[tag + " slots"] = await measure(w, mob);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob }); await sleep(500);
  await clickAt(await ev(find(slotRe))); await sleep(1200);
  await clickAt(await ev(find("/^Next$/"))); await sleep(3000);
  await ev(`(function(){var c=document.querySelector('.zb-ctheme-content');if(c)c.scrollTop=0;scrollTo(0,0)})()`);
  await snap(`p3-${tag}-3-details.png`);
  out[tag + " details"] = await measure(w, mob);
}
writeFileSync(join(OUT, "probe3.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
ws.close(); edge.kill(); process.exit(0);

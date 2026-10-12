// Narrow (single-column) Zoho layout at the 390 modal's frame width: y-range of every visible row in the top 420px, per step.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9717;
const URL_ = "https://jared-delphi-me.zohobookings.com/portal-embed#/4937208000000036014";
const W = Number(process.argv[2] || 358);
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
const out = {};
const rows = `(function(){var c=document.querySelector('.zb-ctheme-content');if(c)c.scrollTop=0;
  var card=document.querySelector('.zb-ct-leftpanel').getBoundingClientRect();
  var els=[].slice.call(document.querySelectorAll('*')).filter(function(e){var b=e.getBoundingClientRect();return b.height&&b.top<420&&(e.children.length===0||e.tagName==='svg'||/zdatetimepicker|calendar|zb-ct-right-header/.test(e.className+''))&&e.tagName!=='path'});
  return {card:[Math.round(card.top),Math.round(card.bottom)],rows:els.map(function(e){var b=e.getBoundingClientRect();return [Math.round(b.top),Math.round(b.bottom),e.tagName,(e.className+'').slice(0,40),e.textContent.trim().slice(0,30)]})};})()`;
const find = (re, last) => `(function(){var b=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&${re}.test(e.textContent.trim())&&e.getBoundingClientRect().height});var e=b[${last ? "b.length-1" : "0"}];if(!e)return null;e.scrollIntoView({block:'center'});var r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`;
const clickAt = async (xy) => { if (!xy) return false; for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: xy[0], y: xy[1], button: "left", clickCount: 1 }); return true; };
const waitText = async (re, n = 60) => { for (let i = 0; i < n; i++) { if (await ev(`!!document.body&&${re}.test(document.body.innerText)`)) return true; await sleep(250); } return false; };

await send("Emulation.setDeviceMetricsOverride", { width: W, height: 1500, deviceScaleFactor: 1, mobile: W < 500 });
await send("Page.navigate", { url: URL_ }); await waitText("/Select date and time/", 80); await sleep(1500);
out.date = await ev(rows);
await clickAt(await ev(find("/^(29|30|[1-9]|[12][0-9]|3[01])$/", true))); await waitText("/\\d\\d:\\d\\d\\s?(am|pm)/i"); await sleep(1200);
out.slots = await ev(rows);
await clickAt(await ev(find("/^\\d\\d:\\d\\d\\s?(am|pm)$/i"))); await sleep(1000);
await clickAt(await ev(find("/^Next$/"))); await waitText("/Please enter your details/"); await sleep(1500);
out.details = await ev(rows);
writeFileSync(join(OUT, `probe-rows-${W}.json`), JSON.stringify(out, null, 1));
for (const k of ["date", "slots", "details"]) { console.log(`== ${k} card ${out[k].card}`); for (const r of out[k].rows) console.log("  ", r.join(" | ")); }
ws.close(); edge.kill(); process.exit(0);

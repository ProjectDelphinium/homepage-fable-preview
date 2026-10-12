// Two-column Zoho at iframe width 1600: card box (.zb-ctheme-content) top/bottom vs viewport height; narrow scroller geometry vs height.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9719;
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
const waitText = async (re, n = 60) => { for (let i = 0; i < n; i++) { if (await ev(`!!document.body&&${re}.test(document.body.innerText)`)) return true; await sleep(250); } return false; };
const box = `(function(){function r(s){var e=document.querySelector(s);if(!e)return null;var b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.right),Math.round(b.bottom)]}
  var c=document.querySelector('.zb-ctheme-content'),cs=getComputedStyle(c);
  return {content:r('.zb-ctheme-content'),left:r('.zb-ct-leftpanel'),right:r('.zb-ct-rightpanel'),container:r('.zb-ctheme-container'),maxH:cs.maxHeight,h:cs.height,sh:c.scrollHeight,ch:c.clientHeight}})()`;
const out = {};
let first = true;
for (const [w, h] of [[1600, 600], [1600, 804], [1600, 900], [1600, 1051], [1600, 1300], [358, 748], [358, 1012]]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 500 });
  if (first) { await send("Page.navigate", { url: URL_ }); await waitText("/Select date and time/", 80); await sleep(1500); first = false; } else await sleep(800);
  out[w + "x" + h] = await ev(box);
  console.log(w + "x" + h, JSON.stringify(out[w + "x" + h]));
}
writeFileSync(join(OUT, "probe-height.json"), JSON.stringify(out, null, 1));
ws.close(); edge.kill(); process.exit(0);

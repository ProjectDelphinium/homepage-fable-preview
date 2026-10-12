// HE 760: per-part tops in the top row, with and without the order rule.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9362;
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
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

await send("Emulation.setScrollbarsHidden", { hidden: true });
await send("Emulation.setDeviceMetricsOverride", { width: 760, height: 1000, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://127.0.0.1:8767/highered" });
for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
await ev(`document.fonts.ready.then(()=>1)`);
await sleep(800);
const q = `(function(){return [].slice.call(document.querySelectorAll(".dl-case__stats > .dl-card")).filter(function(c){return getComputedStyle(c).display!=="none"}).slice(0,5).map(function(c){var b=c.getBoundingClientRect();return {x:Math.round(b.left),y:Math.round(b.top+scrollY),txt:c.children[1].textContent.trim().slice(0,12),parts:[].map.call(c.children,function(k){var r=k.getBoundingClientRect();return Math.round(r.top+scrollY)+"+"+Math.round(r.height)})}}).sort(function(a,b){return a.y-b.y||a.x-b.x})})()`;
const res = { withOrder: await ev(q) };
await ev(`(function(){var s=document.createElement("style");s.textContent=".dl-case__stats > * { order: 0 !important; }";document.head.appendChild(s);return 1})()`);
await sleep(300);
res.withoutOrder = await ev(q);
console.log(JSON.stringify(res, null, 1));
writeFileSync(join(OUT, "align760.json"), JSON.stringify(res, null, 1));
ws.close(); edge.kill(); process.exit(0);

// Try study-card fill treatments on /highered by injecting CSS, before committing one to the file.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9344;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {} await sleep(200); }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, (m) => res(m.result)); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (x) => (await send("Runtime.evaluate", { expression: x, returnByValue: true })).result.value;

const variants = {
  center: `@media (min-width:960px){html.dl-path-he .dl-proof__davis{flex:1 0 auto;align-content:center}}`,
  split: `@media (min-width:960px){html.dl-path-he .dl-proof__davis{flex:1 0 auto;grid-template-rows:auto auto 1fr}html.dl-path-he .dl-proof__he-ctx{align-self:end}}`,
};
for (const w of [1440, 1100]) for (const [name, css] of Object.entries(variants)) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "http://127.0.0.1:8767/highered" });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
  await ev(`(function(){var s=document.createElement("style");s.textContent=${JSON.stringify(css)};document.head.appendChild(s);document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.querySelector(".dl-proof__results").scrollIntoView({block:"center"})})()`);
  await sleep(900);
  const r = await ev(`(function(){var b=document.querySelector(".dl-proof__results").getBoundingClientRect();return {x:b.left+scrollX-24,y:b.top+scrollY-24,w:b.width+48,h:b.height+48}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, `variant-${name}-${w}.png`), Buffer.from(data, "base64"));
  console.log("shot", name, w);
}
ws.close(); edge.kill(); process.exit(0);

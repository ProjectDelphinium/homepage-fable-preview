// Headless Edge over CDP: makeover lede text on /home and /highered, plus a crop per path.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9357;
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });

let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {}
  await sleep(200);
}
const pageT = targets.find((t) => t.type === "page");
const ws = new WebSocket(pageT.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
const WANT = "For online students, Canvas is school, and too often it looks like a gray wall of text.";
const results = {};

for (const [path, w, h, mob] of [["/home", 1440, 900, false], ["/highered", 1440, 900, false], ["/home", 390, 844, true], ["/highered", 390, 844, true]]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(800);
  const info = await ev(`(async function(){var p=document.querySelector("main#top > section#makeover > div.dl-wrap > p.dl-lede");var t0=p.getBoundingClientRect().top+scrollY;scrollTo({top:Math.max(0,t0-innerHeight/2),behavior:"instant"});await new Promise(r=>setTimeout(r,1200));var r=p.getBoundingClientRect();var em=p.querySelector("em"),b=p.querySelector("b");return {htmlClass:document.documentElement.className,innerHTML:p.innerHTML,innerText:p.innerText,emText:em&&em.textContent,emStyle:em&&getComputedStyle(em).fontStyle,bText:b&&b.textContent,bWeight:b&&getComputedStyle(b).fontWeight,rect:[r.left+scrollX,r.top+scrollY,r.width,r.height]}})()`);
  info.matches = info.innerText.replace(/\s+/g, " ").trim() === WANT;
  info.emDash = /\u2014/.test(info.innerText);
  results[`${w} ${path}`] = info;
  console.log(`${w} ${path}`, JSON.stringify(info));
  const [x, y, cw, ch] = info.rect;
  const { data } = await send("Page.captureScreenshot", { format: "png", clip: { x: Math.max(0, x - 16), y: Math.max(0, y - 16), width: Math.min(w, cw + 32), height: ch + 32, scale: 1 } });
  writeFileSync(join(OUT, `lede-${path.slice(1)}-${w}.png`), Buffer.from(data, "base64"));
}
writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close(); edge.kill(); process.exit(0);

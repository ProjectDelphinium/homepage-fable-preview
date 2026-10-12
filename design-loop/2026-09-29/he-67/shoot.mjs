// Headless Edge over CDP: HE outcomes card (67% withdrawals) and full-page /home + /highered shots.
// Usage: node shoot.mjs <tag>   (tag = before | after | ...)
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const TAG = process.argv[2] || "check";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9347;
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  "--hide-scrollbars", "--mute-audio",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank",
], { stdio: "ignore" });

let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {}
  await sleep(200);
}
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id;
  pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: "about:blank" });
  await sleep(300);
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 80; i++) { if ((await ev(`location.pathname===${JSON.stringify(path)}&&document.readyState==="complete"`))) break; await sleep(200); }
  await sleep(1500);
  await ev(`(function(){
    var s=document.createElement("style");
    s.textContent="*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}video{visibility:hidden!important}";
    document.head.appendChild(s);
    document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});
    document.querySelectorAll("video").forEach(function(v){try{v.pause()}catch(e){}});
    return true;
  })()`);
  // Scroll through once so lazy images load, then back to top.
  const h = await ev("document.documentElement.scrollHeight");
  for (let y = 0; y < h; y += height) { await ev(`scrollTo(0,${y})`); await sleep(120); }
  await ev("scrollTo(0,0)");
  await sleep(1200);
}

const readHE = `(function(){
  var card=document.querySelector("#proof ul.dl-proof__outcomes-list");
  var art=card&&card.closest("article");
  var items=card?[].slice.call(card.querySelectorAll("li")).map(function(li){return li.innerText.replace(/\\s+/g," ").trim()}):null;
  var b=art?art.getBoundingClientRect():null;
  var md=document.querySelector('meta[name="description"]');
  return {items:items, visible:!!(art&&art.offsetParent!==null), rect:b?{x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}:null,
    metaDescription:md?md.getAttribute("content"):null, title:document.title, scrollHeight:document.documentElement.scrollHeight};
})()`;

const results = {};
for (const [path, w, h, mob] of [["/home", 1440, 900, false], ["/home", 390, 844, true], ["/highered", 1440, 900, false], ["/highered", 390, 844, true]]) {
  await load(path, w, h, mob);
  const key = `${path.slice(1)}-${w}`;
  const r = await ev(readHE);
  results[key] = r;
  console.log(key, JSON.stringify(r));
  const full = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: r.scrollHeight, scale: 1 } });
  writeFileSync(join(OUT, `${TAG}-${key}-full.png`), Buffer.from(full.data, "base64"));
  if (path === "/highered" && r.rect) {
    const p = 24;
    const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: Math.max(0, r.rect.x - p), y: r.rect.y - p, width: r.rect.w + 2 * p, height: r.rect.h + 2 * p, scale: 1 } });
    writeFileSync(join(OUT, `${TAG}-${key}-outcomes.png`), Buffer.from(data, "base64"));
  }
}
writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(results, null, 2));
ws.close();
edge.kill();
process.exit(0);

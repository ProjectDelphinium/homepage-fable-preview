// Headless Edge over CDP: check the Columbia hidden-cost card copy on /highered and /home.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const TAG = process.argv[2] || "check";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9341;
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
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

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: "about:blank" });
  await sleep(300);
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev(`location.pathname===${JSON.stringify(path)}&&document.readyState==="complete"`))) break; await sleep(200); }
  await sleep(600);
}

const findCard = `(function(){
  document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});
  var cards=[].slice.call(document.querySelectorAll("section.dl-case .dl-case__stats article.dl-card"));
  var vis=function(el){return el&&el.offsetParent!==null&&getComputedStyle(el).visibility!=="hidden"};
  var txt=function(el){if(!el)return null;var parts=[].slice.call(el.querySelectorAll("span")).filter(vis);return (parts.length?parts.map(function(s){return s.innerText}).join(" "):el.innerText).trim()};
  var c=cards.filter(vis).find(function(a){return /10.15%/.test(a.innerText)||/Attendance/i.test(a.innerText)});
  if(!c)return null;
  c.scrollIntoView({block:"center"});
  var b=c.getBoundingClientRect();
  return {index:cards.filter(vis).indexOf(c),kicker:txt(c.querySelector(".dl-card__kicker")),number:txt(c.querySelector(".dl-card__num,.dl-card__stat,.dl-card__big")),body:txt(c.querySelector(".dl-card__txt")),source:txt(c.querySelector(".dl-case__src")),rect:{x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}};
})()`;

const results = {};
for (const [path, w, h, mob] of [["/highered", 1440, 900, false], ["/highered", 390, 844, true], ["/home", 1440, 900, false]]) {
  await load(path, w, h, mob);
  const r = await ev(findCard);
  await sleep(800);
  const key = `${path.slice(1)}-${w}`;
  results[key] = r;
  console.log(key, JSON.stringify(r));
  if (r) {
    const p = 16;
    const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: Math.max(0, r.rect.x - p), y: r.rect.y - p, width: r.rect.w + 2 * p, height: r.rect.h + 2 * p, scale: 1 } });
    writeFileSync(join(OUT, `${TAG}-${key}.png`), Buffer.from(data, "base64"));
  }
}
writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(results, null, 2));
ws.close();
edge.kill();
process.exit(0);

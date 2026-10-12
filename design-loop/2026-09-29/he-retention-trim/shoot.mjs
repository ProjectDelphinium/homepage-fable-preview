// Headless Edge over CDP: HE tall "Completion and retention" card, ~1 in 3 text trim.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
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

const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
  await ev(`(function(){document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});var s=document.querySelector("section.dl-case .dl-case__stats");if(s)s.scrollIntoView({block:"center"});})()`);
  await sleep(900);
}

async function shot(sel, name) {
  const r = await ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;var b=e.getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  if (!r || !r.w) { log("shot-missing", [sel, name]); return; }
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

const state = `(function(){
  var he=document.querySelector("section.dl-case article.dl-card.dl-he");
  var ps=he?Array.from(he.querySelectorAll(":scope > p")).map(function(p){return p.textContent}):null;
  var b=he&&he.getBoundingClientRect();
  var txt=document.body.innerText;
  return {
    html:document.documentElement.className,
    heCardDisplay:he?getComputedStyle(he).display:null,
    heCardSize:b?[Math.round(b.width),Math.round(b.height)]:null,
    heCardPs:ps,
    visibleHasSeats:txt.indexOf("Seats and tuition")>=0,
    visibleHasYearTwo:txt.indexOf("first-year students don't return for year two.")>=0,
    domHasSeats:document.documentElement.outerHTML.indexOf("Seats and tuition")>=0,
    statsText:Array.from(document.querySelectorAll("section.dl-case .dl-case__stats > *")).filter(function(c){return getComputedStyle(c).display!=="none"}).map(function(c){return c.innerText.replace(/\\s+/g," ").trim()})
  };
})()`;

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  await load("/highered", w, h, mob);
  log(`highered ${tag}`, await ev(state));
  await shot("section.dl-case .dl-case__stats", `highered-${tag}-stats.png`);
  await shot("section.dl-case article.dl-card.dl-he", `highered-${tag}-tall-card.png`);
}

await load("/home", 1440, 900, false);
log("home 1440", await ev(state));
await shot("section.dl-case .dl-case__stats", "home-1440-stats.png");

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

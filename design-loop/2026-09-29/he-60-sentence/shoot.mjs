// Headless Edge over CDP: HE 60% completion sentence check at 1440 and 390, plus /home unchanged.
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
  await ev(`document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")})`);
}

const info = `(function(){
  var he=document.querySelector("section.dl-case .dl-case__stats article.dl-card.dl-he");
  var ps=he?Array.from(he.querySelectorAll("p")).map(function(p){return p.textContent}):null;
  var stats=document.querySelector("section.dl-case .dl-case__stats");
  var visible=Array.from(stats.children).filter(function(c){return getComputedStyle(c).display!=="none"}).map(function(c){return c.innerText.replace(/\\s+/g," ").trim()});
  var body=document.body.innerText;
  return {html:document.documentElement.className,heDisplay:he?getComputedStyle(he).display:null,heParas:ps,
    hasNew:body.indexOf("in 4 years, and about 40% still haven't in 6. Time-to-degree keeps stretching.")>=0,
    hasOldParen:body.indexOf("(about 40% still")>=0,emDash:body.indexOf("\\u2014")>=0,visibleCards:visible};
})()`;

async function shotCard(name) {
  const r = await ev(`(function(){var e=document.querySelector("section.dl-case .dl-case__stats article.dl-card.dl-he");e.scrollIntoView({block:"center"});var b=e.getBoundingClientRect();return {x:b.left+scrollX-16,y:b.top+scrollY-16,w:b.width+32,h:b.height+32}})()`);
  await sleep(500);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: Math.max(0, r.x), y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

async function shotSection(name) {
  const r = await ev(`(function(){var e=document.querySelector("section.dl-case");var b=e.getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  await load("/highered", w, h, mob);
  log(`highered ${tag}`, await ev(info));
  await shotCard(`highered-${tag}-card.png`);
  await shotSection(`highered-${tag}-section.png`);
}

await load("/home", 1440, 900, false);
log("home 1440", await ev(info));
await shotSection("home-1440-section.png");

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

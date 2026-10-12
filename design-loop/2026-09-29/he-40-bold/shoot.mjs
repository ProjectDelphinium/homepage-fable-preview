// Headless Edge over CDP: verify "40%" is bold in the HE completion/retention 60% stat.
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
  await send("Page.navigate", { url: BASE + path + "?t=" + Date.now() });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")})`);
  await sleep(800);
}

const check = `(function(){
  var card=document.querySelector("section.dl-case .dl-case__stats article.dl-card.dl-he");
  if(!card) return {card:null};
  var ps=[].slice.call(card.querySelectorAll(":scope > p"));
  var p=ps.find(function(x){return /finish a bachelor/.test(x.textContent)});
  var bs=[].slice.call(p.querySelectorAll("b")).map(function(b){return {text:b.textContent,weight:getComputedStyle(b).fontWeight}});
  var ref=card.querySelector("b"); 
  var plain=[].slice.call(p.childNodes).filter(function(n){return n.nodeType===3}).map(function(n){return n.textContent});
  return {display:getComputedStyle(card).display,html:p.innerHTML,pWeight:getComputedStyle(p).fontWeight,bold:bs,plainText:plain,
    ref2M:ref?{text:ref.textContent,weight:getComputedStyle(ref).fontWeight,color:getComputedStyle(ref).color}:null,
    boldColor:p.querySelector("b")?getComputedStyle(p.querySelector("b")).color:null,pColor:getComputedStyle(p).color};
})()`;

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  await load("/highered", w, h, mob);
  log(`highered ${tag}`, await ev(check));
  await ev(`document.querySelector("section.dl-case .dl-case__stats article.dl-card.dl-he").scrollIntoView({block:"center"})`);
  await sleep(500);
  const r = await ev(`(function(){var b=document.querySelector("section.dl-case .dl-case__stats article.dl-card.dl-he").getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x - 8, y: r.y - 8, width: r.w + 16, height: r.h + 16, scale: 1 } });
  writeFileSync(join(OUT, `highered-${tag}-completion-card.png`), Buffer.from(data, "base64"));
  log("shot", `highered-${tag}-completion-card.png`);
}

await load("/home", 1440, 900, false);
log("home 1440", await ev(check));

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

// Headless Edge over CDP: HE outcomes card kicker text, wrap check, and /home hidden check.
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

const state = `(function(){
  var k=document.getElementById("proof-outcomes-heading");
  if(!k) return {found:false};
  var card=k.closest("article"), cs=getComputedStyle(k), cc=getComputedStyle(card);
  var lh=parseFloat(cs.lineHeight); if(isNaN(lh)) lh=parseFloat(cs.fontSize)*1.2;
  var r=document.createRange(); r.selectNodeContents(k);
  var lines=new Set(Array.from(r.getClientRects()).map(function(x){return Math.round(x.top)})).size;
  var b=k.getBoundingClientRect(), cb=card.getBoundingClientRect();
  return {found:true,count:document.querySelectorAll("#proof-outcomes-heading").length,text:k.textContent,rendered:k.innerText,
    transform:cs.textTransform,fontSize:cs.fontSize,lineHeight:cs.lineHeight,height:Math.round(b.height),lines:lines,
    kickerWidth:Math.round(b.width),cardWidth:Math.round(cb.width),cardDisplay:cc.display,cardVisible:cb.width>0&&cb.height>0,
    htmlClass:document.documentElement.className};
})()`;

async function shot(name) {
  await ev(`document.getElementById("proof-outcomes-heading").closest("article").scrollIntoView({block:"center",behavior:"instant"})`);
  await sleep(800);
  const r = await ev(`(function(){var b=document.getElementById("proof-outcomes-heading").closest("article").getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  await load("/highered", w, h, mob);
  log(`highered ${tag}`, await ev(state));
  await shot(`highered-${tag}-outcomes-card.png`);
  await load("/home", w, h, mob);
  log(`home ${tag}`, await ev(state));
}

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

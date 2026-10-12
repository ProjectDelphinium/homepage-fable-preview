// Headless Edge over CDP: study-card kicker text + line count on /highered and /home.
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
}

const state = `(function(){
  document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});
  var k=document.getElementById("proof-study-heading"),cs=getComputedStyle(k),rg=document.createRange();
  rg.selectNodeContents(k);
  var tops={};Array.prototype.forEach.call(rg.getClientRects(),function(r){if(r.width>0)tops[Math.round(r.top)]=1});
  var b=k.getBoundingClientRect();
  return {html:document.documentElement.className,text:k.textContent,rendered:k.innerText,transform:cs.textTransform,
    fontSize:cs.fontSize,lineHeight:cs.lineHeight,lines:Object.keys(tops).length,box:[Math.round(b.width),Math.round(b.height)],
    scrollW:k.scrollWidth,clientW:k.clientWidth};
})()`;

async function shot(name) {
  await ev(`document.querySelector(".dl-proof__result--davis").scrollIntoView({block:"center"})`);
  await sleep(700);
  const r = await ev(`(function(){var b=document.querySelector(".dl-proof__result--davis").getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

for (const path of ["/highered", "/home"]) {
  for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
    await load(path, w, h, mob);
    log(`${path} ${tag}`, await ev(state));
    await shot(`${path.slice(1)}-${tag}-study-card.png`);
  }
}

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

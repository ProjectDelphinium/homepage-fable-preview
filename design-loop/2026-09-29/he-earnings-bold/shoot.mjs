// Headless Edge over CDP: checks the bold "twice" in the HE Earnings card, plus K-12 unchanged.
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
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1)); };
setTimeout(() => { console.log("timeout"); edge.kill(); process.exit(1); }, 150000);

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
  await ev(`document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")})`);
}

const CARD = `(function(){var a=[].slice.call(document.querySelectorAll(".dl-case .dl-card")).filter(function(c){return /lifetime earnings|cost of a K-12/.test(c.textContent)&&getComputedStyle(c).display!=="none"});return a[a.length-1]})()`;

const state = `(function(){var c=${CARD};var t=c.querySelector(".dl-card__txt");var vis=[].slice.call(t.children).filter(function(s){return getComputedStyle(s).display!=="none"})[0];
var bs=[].slice.call(vis.querySelectorAll("b")).map(function(b){var cs=getComputedStyle(b);return {text:b.textContent,weight:cs.fontWeight,display:cs.display,color:cs.color}});
return {html:document.documentElement.className,kicker:c.querySelector(".dl-card__kicker").innerText,num:c.querySelector(".dl-card__num").innerText,
visibleClass:vis.className,visibleText:vis.innerText,visibleHTML:vis.innerHTML,spanWeight:getComputedStyle(vis).fontWeight,bold:bs}})()`;

async function shot(name) {
  await ev(`${CARD}.scrollIntoView({block:"center"})`);
  await sleep(500);
  const r = await ev(`(function(){var b=${CARD}.getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x - 8, y: r.y - 8, width: r.w + 16, height: r.h + 16, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

for (const [path, tag] of [["/highered", "highered"], ["/home", "home"]]) {
  for (const [w, h, mob] of [[1440, 900, false], [390, 844, true]]) {
    await load(path, w, h, mob);
    log(`${tag} ${w}`, await ev(state));
    await shot(`${tag}-${w}-earnings-card.png`);
  }
}

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

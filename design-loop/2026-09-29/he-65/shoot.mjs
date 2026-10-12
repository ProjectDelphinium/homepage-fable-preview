// Headless Edge over CDP: HE dropout 66% -> 65%. Baseline = same served page with the 66% line swapped back in (Fetch interception).
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9347;
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NEW_LI = "<li><b>65%</b> <span>fewer dropouts</span></li>";
const OLD_LI = "<li><b>66%</b> <span>fewer dropouts</span></li>";

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
let baseline = false;
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id;
  pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
ws.addEventListener("message", async (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === "Fetch.requestPaused") {
    const { requestId, request } = m.params;
    const html = await (await fetch(request.url)).text();
    if (!html.includes(NEW_LI)) console.log("WARN: new li not found in served page");
    const body = baseline ? html.replace(NEW_LI, OLD_LI) : html;
    send("Fetch.fulfillRequest", { requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: "text/html; charset=utf-8" }], body: Buffer.from(body, "utf-8").toString("base64") });
  }
});
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };

await send("Fetch.enable", { patterns: [{ urlPattern: BASE + "/home", resourceType: "Document" }, { urlPattern: BASE + "/highered", resourceType: "Document" }] });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(800);
  await ev(`(function(){document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.getAnimations().forEach(function(a){try{a.finish()}catch(e){a.cancel()}});})()`);
  await sleep(1200);
}

const measure = `(function(){
  var o=document.querySelector("#proof .dl-proof__result--outcomes"),p=document.querySelector("#proof");
  function r(el){var b=el.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top+scrollY),Math.round(b.width),Math.round(b.height)]}
  var cards=[].map.call(p.querySelectorAll(".dl-card"),function(c){return getComputedStyle(c).display==="none"?null:r(c)}).filter(Boolean);
  return {outcomesDisplay:getComputedStyle(o).display,items:[].map.call(o.querySelectorAll("li"),function(l){return {text:l.innerText.replace(/\\s+/g," "),rect:r(l),numW:Math.round(l.querySelector("b").getBoundingClientRect().width*10)/10}}),
    outcomes:r(o),proof:r(p),cards:cards,docH:document.documentElement.scrollHeight};
})()`;

async function shotProof(name) {
  const r = await ev(`(function(){var b=document.querySelector("#proof").getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  if (name) writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  return data;
}
async function shotCard(name) {
  const r = await ev(`(function(){var b=document.querySelector("#proof .dl-proof__result--outcomes").getBoundingClientRect();return {x:b.left+scrollX-16,y:b.top+scrollY-16,w:b.width+32,h:b.height+32}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
}
async function shotFull() {
  const h = await ev("document.documentElement.scrollHeight");
  const w = await ev("document.documentElement.clientWidth");
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
  return data;
}

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  baseline = true;
  await load("/highered", w, h, mob);
  const mBefore = await ev(measure);
  const before = await shotProof(`before-highered-${tag}-proof.png`);
  baseline = false;
  await load("/highered", w, h, mob);
  const mAfter = await ev(measure);
  await shotProof(`highered-${tag}-proof.png`);
  await shotCard(`highered-${tag}-outcomes.png`);
  log(`highered-${tag}-before`, mBefore);
  log(`highered-${tag}-after`, mAfter);
  const same = (k) => JSON.stringify(mBefore[k]) === JSON.stringify(mAfter[k]);
  log(`highered-${tag}-layout-unchanged`, { outcomes: same("outcomes"), proof: same("proof"), cards: same("cards"), docH: same("docH"), itemRects: JSON.stringify(mBefore.items.map((i) => i.rect)) === JSON.stringify(mAfter.items.map((i) => i.rect)) });
}

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  baseline = true;
  await load("/home", w, h, mob);
  const a = await shotProof();
  const mA = await ev(measure);
  baseline = false;
  await load("/home", w, h, mob);
  const b = await shotProof(`home-${tag}-proof.png`);
  const mB = await ev(measure);
  log(`home-${tag}`, { outcomesDisplay: mB.outcomesDisplay, docH: [mA.docH, mB.docH], cardsSame: JSON.stringify(mA.cards) === JSON.stringify(mB.cards), proofPngBytesIdentical: a === b, pngLen: [a.length, b.length] });
}

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

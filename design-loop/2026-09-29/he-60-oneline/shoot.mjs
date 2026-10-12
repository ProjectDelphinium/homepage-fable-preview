// Headless Edge over CDP: HE 60% stat body on one line. Usage: node shoot.mjs before|after
// before: /home section shots only (baseline). after: /highered line counts + card shots, /home shots to diff.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const MODE = process.argv[2] === "before" ? "before" : "after";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9362;
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
  await ev("document.fonts.ready.then(function(){return 1})");
  await sleep(600);
  await ev(`document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")})`);
  await sleep(600);
}

const info = `(function(){
  function lines(p){var r=document.createRange();r.selectNodeContents(p);var tops=[];
    [].slice.call(r.getClientRects()).forEach(function(b){if(b.width<1)return;var t=Math.round(b.top);if(!tops.some(function(x){return Math.abs(x-t)<4}))tops.push(t)});return tops.length}
  var card=document.querySelector("section.dl-case .dl-case__stats article.dl-card.dl-he");
  var ps=[].slice.call(card.querySelectorAll(":scope > p"));
  var p=ps.find(function(x){return /finish/.test(x.textContent)});
  var bodies=[ps[2],ps[4],ps[6]].map(function(x){var cs=getComputedStyle(x);return {text:x.textContent.slice(0,40),font:cs.fontSize,lh:cs.lineHeight,lines:lines(x)}});
  var b=p.querySelector("b");
  return {vw:innerWidth,cardDisplay:getComputedStyle(card).display,html:p.innerHTML,boxW:+p.getBoundingClientRect().width.toFixed(1),
    lines:lines(p),boldText:b?b.textContent:null,boldWeight:b?getComputedStyle(b).fontWeight:null,bodies:bodies,
    emDash:document.body.innerText.indexOf("\\u2014")>=0};
})()`;

async function shotEl(sel, name, pad = 16) {
  await ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:"center"})`);
  await sleep(500);
  const r = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true,
    clip: { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: r.w + pad * 2, height: r.h + pad * 2, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

const CARD = "section.dl-case .dl-case__stats article.dl-card.dl-he";

if (MODE === "after") {
  for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["1112", 1112, 900, false], ["577", 577, 900, false], ["390", 390, 844, true]]) {
    await load("/highered", w, h, mob);
    log(`highered ${tag}`, await ev(info));
    await shotEl(CARD, `highered-${tag}-card.png`);
  }
}

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  await load("/home", w, h, mob);
  log(`home ${tag}`, await ev(`(function(){var c=document.querySelector(${JSON.stringify(CARD)});var s=document.querySelector("section.dl-case");
    return {heCardDisplay:c?getComputedStyle(c).display:null,caseH:s.getBoundingClientRect().height,docH:document.documentElement.scrollHeight}})()`));
  await shotEl("section.dl-case", `${MODE}-home-${tag}-case.png`, 0);
}

writeFileSync(join(OUT, `${MODE}.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

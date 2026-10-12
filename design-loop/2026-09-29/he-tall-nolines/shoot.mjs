// Headless Edge over CDP: HE tall "Completion and retention" card without pinlines. Usage: node shoot.mjs <tag>
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const TAG = process.argv[2] || "after";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9347;
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

const results = {};

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")})`);
  await ev(`document.querySelector(".dl-case__break").scrollIntoView({block:"center"})`);
  await sleep(900);
}

async function shot(name, sel) {
  const r = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: Math.max(0, r.x - 16), y: r.y - 16, width: r.w + 32, height: r.h + 32, scale: 1 } });
  const buf = Buffer.from(data, "base64");
  if (name) writeFileSync(join(OUT, name), buf);
  return createHash("sha1").update(buf).digest("hex");
}

// Gap = distance from the bottom of one stat's body text to the top of the next number's glyph box.
const probe = `(function(){
  var card=document.querySelector("section.dl-case .dl-case__stats article.dl-card.dl-he");
  var cb=card.getBoundingClientRect(), kids=[].slice.call(card.children);
  var ps=kids.map(function(p){var s=getComputedStyle(p),b=p.getBoundingClientRect();return {text:p.textContent.slice(0,24),border:s.borderTopWidth+" "+s.borderTopStyle,mt:s.marginTop,pt:s.paddingTop,top:Math.round(b.top-cb.top),bottom:Math.round(b.bottom-cb.top)}});
  var gaps=[];for(var i=3;i<kids.length-1;i+=2){gaps.push(Math.round(kids[i].getBoundingClientRect().top+parseFloat(getComputedStyle(kids[i]).paddingTop)-kids[i-1].getBoundingClientRect().bottom))}
  var others=[].filter.call(document.querySelectorAll(".dl-case__stats > article"),function(a){return a!==card&&getComputedStyle(a).display!=="none"}).map(function(a){var b=a.getBoundingClientRect();return {top:Math.round(b.top),bottom:Math.round(b.bottom),left:Math.round(b.left)}});
  return {card:{top:Math.round(cb.top),bottom:Math.round(cb.bottom),left:Math.round(cb.left),h:Math.round(cb.height)},gaps:gaps,children:ps,others:others,docH:document.documentElement.scrollHeight};
})()`;

for (const [w, h, mob] of [[1440, 900, false], [760, 1000, false], [390, 844, true]]) {
  await load("/highered", w, h, mob);
  const info = await ev(probe);
  info.shotHash = await shot(`${TAG}-highered-${w}.png`, ".dl-case__break");
  info.cardHash = await shot(`${TAG}-highered-${w}-card.png`, "section.dl-case .dl-case__stats article.dl-card.dl-he");
  results[`highered-${w}`] = info;
  console.log(`highered ${w}`, JSON.stringify({ card: info.card, others: info.others, gaps: info.gaps, docH: info.docH }));
}
for (const [w, h, mob] of [[1440, 900, false], [1040, 900, false], [760, 1000, false], [390, 844, true]]) {
  await load("/home", w, h, mob);
  const hash = await shot(w === 1440 || w === 390 ? `${TAG}-home-${w}.png` : null, ".dl-case__break");
  const docH = await ev(`document.documentElement.scrollHeight`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: docH, scale: 1 } });
  const full = createHash("sha1").update(Buffer.from(data, "base64")).digest("hex");
  results[`home-${w}`] = { shotHash: hash, fullHash: full, docH };
  console.log(`home ${w}`, hash, full, docH);
}

writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

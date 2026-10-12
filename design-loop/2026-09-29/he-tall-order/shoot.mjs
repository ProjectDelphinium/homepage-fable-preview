// Headless Edge over CDP: HE tall "Completion and retention" card order, pinlines, alignment. Usage: node shoot.mjs <tag>
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const TAG = process.argv[2] || "after";
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

async function shot(name) {
  const r = await ev(`(function(){var b=document.querySelector(".dl-case__break").getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: Math.max(0, r.x - 16), y: r.y - 16, width: r.w + 32, height: r.h + 32, scale: 1 } });
  const buf = Buffer.from(data, "base64");
  writeFileSync(join(OUT, name), buf);
  return createHash("sha1").update(buf).digest("hex");
}

const probe = `(function(){
  var card=document.querySelector("section.dl-case .dl-case__stats article.dl-card.dl-he");
  var cs=getComputedStyle(card), cb=card.getBoundingClientRect();
  var ps=[].map.call(card.children,function(p){var s=getComputedStyle(p),b=p.getBoundingClientRect();return {tag:p.tagName,text:p.textContent,border:s.borderTopWidth+" "+s.borderTopStyle,fs:s.fontSize,top:Math.round(b.top-cb.top)}});
  var others=[].filter.call(document.querySelectorAll(".dl-case__stats > article"),function(a){return a!==card&&getComputedStyle(a).display!=="none"}).map(function(a){var b=a.getBoundingClientRect();return {top:Math.round(b.top),bottom:Math.round(b.bottom),left:Math.round(b.left),right:Math.round(b.right)}});
  return {display:cs.display,card:{top:Math.round(cb.top),bottom:Math.round(cb.bottom),left:Math.round(cb.left),right:Math.round(cb.right)},children:ps,others:others};
})()`;

for (const [w, h, mob] of [[1440, 900, false], [760, 1000, false], [390, 844, true]]) {
  await load("/highered", w, h, mob);
  const info = await ev(probe);
  info.shotHash = await shot(`${TAG}-highered-${w}.png`);
  results[`highered-${w}`] = info;
  console.log(`highered ${w}`, JSON.stringify({ card: info.card, others: info.others, order: info.children.map((c) => [c.text.slice(0, 24), c.border]) }));
}
for (const [w, h, mob] of [[1440, 900, false], [390, 844, true]]) {
  await load("/home", w, h, mob);
  const hash = await shot(`${TAG}-home-${w}.png`);
  const html = await ev(`document.querySelector(".dl-case__break").outerHTML.length`);
  results[`home-${w}`] = { shotHash: hash };
  console.log(`home ${w}`, hash, html);
}

writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

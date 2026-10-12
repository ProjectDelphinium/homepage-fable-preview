// Headless Edge over CDP: teach-card row fill on /home and /highered. Usage: node shoot.mjs <before|after>
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
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

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
}

const measure = `(function(){
  var ul=document.querySelector(".dl-teach__cards");
  ul.scrollIntoView({block:"center"});
  document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});
  var u=ul.getBoundingClientRect(), cs=getComputedStyle(ul);
  var cards=[].slice.call(ul.children).filter(function(li){return getComputedStyle(li).display!=="none"}).map(function(li){
    var b=li.getBoundingClientRect();
    return {h3:li.querySelector("h3").textContent,x:Math.round(b.left-u.left),y:Math.round(b.top-u.top),w:Math.round(b.width*10)/10,h:Math.round(b.height*10)/10};
  });
  var right=Math.max.apply(null,cards.map(function(c){return c.x+c.w}));
  var rows={};cards.forEach(function(c){(rows[c.y]=rows[c.y]||[]).push(c.w)});
  return {html:document.documentElement.className,display:cs.display,cols:cs.gridTemplateColumns,gap:cs.columnGap+" / "+cs.rowGap,
    ulW:Math.round(u.width*10)/10,visible:cards.length,fill:Math.round(right/u.width*1000)/1000,rows:Object.keys(rows).map(function(k){return rows[k]}),
    heights:cards.map(function(c){return c.h}),cards:cards};
})()`;

async function shot(name) {
  await sleep(900);
  const r = await ev(`(function(){var b=document.querySelector(".dl-teach__cards").getBoundingClientRect();return {x:b.left+scrollX-16,y:b.top+scrollY-24,w:b.width+32,h:b.height+48}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
}

const results = {};
for (const path of ["/home", "/highered"]) {
  for (const [w, h, mob] of [[1440, 900, false], [1100, 900, false], [800, 1000, false], [390, 844, true]]) {
    await load(path, w, h, mob);
    const m = await ev(measure);
    const name = `${TAG}-${path.slice(1)}-${w}.png`;
    await shot(name);
    results[`${path} ${w}`] = { shot: name, ...m };
    console.log(path, w, JSON.stringify({ display: m.display, cols: m.cols, ulW: m.ulW, visible: m.visible, fill: m.fill, rows: m.rows, heights: m.heights }));
  }
}

writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

// Headless Edge over CDP: HE case stat card order + row alignment, /home pixel parity.
// /home parity is checked in-run (page as served vs. same page with the HE order rule neutralized)
// so concurrent text edits elsewhere cannot cause false diffs.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9361;
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
const zname = (u) => decodeURIComponent(new URL(u).pathname.split("/").pop()).replace(/ /g, "-").replace(/[^A-Za-z0-9._-]/g, "-");
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Fetch.requestPaused") {
    const u = m.params.request.url;
    const params = { requestId: m.params.requestId };
    if (u.includes("/hs-fs/hubfs/")) params.url = "https://delphi-me.com/dl28-hubfs-" + zname(u);
    ws.send(JSON.stringify({ id: ++id, method: "Fetch.continueRequest", params }));
  }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id;
  pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

await send("Emulation.setScrollbarsHidden", { hidden: true });
await send("Fetch.enable", { patterns: [{ urlPattern: "*delphi-me.com/hs-fs/hubfs/*" }] });
const results = {};

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`document.fonts.ready.then(()=>1)`);
  await ev(`(function(){document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.querySelector(".dl-case").scrollIntoView({block:"start"})})()`);
  await sleep(900);
}

async function shot(sel, name) {
  const r = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  if (name) writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  return data;
}

const measure = `(function(){
  var cards=[].slice.call(document.querySelectorAll(".dl-case__stats > .dl-card")).filter(function(c){return getComputedStyle(c).display!=="none"});
  var info=cards.map(function(c){
    var b=c.getBoundingClientRect(),kids=[].slice.call(c.children);
    var vis=function(p){return p.querySelector(".dh")&&document.documentElement.classList.contains("dl-path-he")?p.querySelector(".dh"):(p.querySelector(".dk")||p)};
    return {kicker:vis(kids[0]).textContent.trim(),num:vis(kids[1]).textContent.trim(),src:vis(kids[3]).textContent.trim(),
      he:c.classList.contains("dl-he"),order:getComputedStyle(c).order,col:getComputedStyle(c).gridColumnStart+"/"+getComputedStyle(c).gridColumnEnd,
      x:Math.round(b.left),y:Math.round(b.top+scrollY),w:Math.round(b.width),h:Math.round(b.height),
      tops:kids.map(function(k){return Math.round(k.getBoundingClientRect().top+scrollY)})};
  });
  var visual=info.slice().sort(function(a,b){return a.y-b.y||a.x-b.x});
  var rows=[];visual.forEach(function(c){var r=rows[rows.length-1];if(r&&Math.abs(r[0].y-c.y)<4)r.push(c);else rows.push([c])});
  var rowCheck=rows.map(function(r){return {cards:r.map(function(c){return c.kicker+" "+c.num}),
    heights:r.map(function(c){return c.h}),equalHeights:r.every(function(c){return c.h===r[0].h}),
    partsAligned:[0,1,2,3].every(function(i){return r.every(function(c){return c.tops[i]===r[0].tops[i]})})}});
  return {path:location.pathname,html:document.documentElement.className,visual:visual.map(function(c){return c.kicker+" | "+c.num+" | "+c.src+" (order "+c.order+", cols "+c.col+", "+c.w+"x"+c.h+")"}),rows:rowCheck,
    docOverflow:document.documentElement.scrollWidth>innerWidth};
})()`;

const widths = [[1440, 900, false], [1040, 900, false], [760, 1000, false], [390, 844, true]];
for (const [w, h, mob] of widths) {
  await load("/highered", w, h, mob);
  results[`he-${w}`] = await ev(measure);
  await shot(".dl-case", `he-${w}.png`);
  console.log(`he-${w}`, JSON.stringify(results[`he-${w}`], null, 1));
}

const NEUTRAL = `(function(){var s=document.createElement("style");s.id="neutral";s.textContent=".dl-case__stats > * { order: 0 !important; }";document.head.appendChild(s);return 1})()`;
for (const [w, h, mob] of widths) {
  await load("/home", w, h, mob);
  const m = await ev(measure);
  const a = await shot("main", `home-${w}.png`);
  await sleep(300);
  const ctrl = await shot("main");
  await ev(NEUTRAL);
  await sleep(300);
  const b = await shot("main");
  results[`home-${w}`] = { html: m.html, visual: m.visual, control: a === ctrl, identicalWithoutOrderRule: a === b };
  console.log(`home-${w}`, JSON.stringify(results[`home-${w}`]));
}

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

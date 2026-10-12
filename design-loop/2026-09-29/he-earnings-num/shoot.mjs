// Headless Edge over CDP: HE Earnings card number "~$1M & 2x" fit check + /home pixel parity.
// Usage: node shoot.mjs <tag>
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const TAG = process.argv[2] || "run";
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
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  return data;
}

const findCard = `[].slice.call(document.querySelectorAll(".dl-case__stats > .dl-card")).filter(function(a){return /\\$229K/.test(a.textContent)})[0]`;

const measure = `(function(){
  var c=${findCard},num=c.children[1],s=num.querySelector("span.dh"),cs=getComputedStyle(c),ns=getComputedStyle(num);
  var cb=c.getBoundingClientRect(),sb=s.getBoundingClientRect(),rects=s.getClientRects();
  var contentRight=cb.right-parseFloat(cs.paddingRight)-parseFloat(cs.borderRightWidth);
  var cards=[].slice.call(document.querySelectorAll(".dl-case__stats > .dl-card")).filter(function(a){return getComputedStyle(a).display!=="none"});
  return {text:s.textContent,html:s.innerHTML,numSize:ns.fontSize,lineHeight:ns.lineHeight,color:getComputedStyle(s).color,whiteSpace:ns.whiteSpace,
    lineBoxes:rects.length,numH:Math.round(num.getBoundingClientRect().height),spanW:Math.round(sb.width*10)/10,
    contentW:Math.round((contentRight-cb.left-parseFloat(cs.paddingLeft)-parseFloat(cs.borderLeftWidth))*10)/10,
    slack:Math.round((contentRight-sb.right)*10)/10,overflow:sb.right>contentRight+0.5||num.scrollWidth>num.clientWidth+1,
    cardW:Math.round(cb.width),cardH:Math.round(cb.height),
    rowHeights:cards.map(function(a){return Math.round(a.getBoundingClientRect().height)}),
    docOverflow:document.documentElement.scrollWidth>innerWidth}})()`;

for (const [w, h, mob] of [[1440, 900, false], [1040, 900, false], [760, 1000, false], [390, 844, true]]) {
  await load("/highered", w, h, mob);
  results[`he-${w}`] = await ev(measure);
  await shot(".dl-case__break", `${TAG}-he-${w}.png`);
  console.log(`he-${w}`, JSON.stringify(results[`he-${w}`]));
}

// /home parity: current DOM vs. DOM with the HE number restored to "~$1M" (the .dh span is hidden on K-12).
for (const [w, h, mob] of [[1440, 900, false], [1040, 900, false], [760, 1000, false], [390, 844, true]]) {
  await load("/home", w, h, mob);
  await ev(`(function(){document.querySelectorAll("img[loading=lazy]").forEach(function(i){i.loading="eager"});return 1})()`);
  for (let last = -1, same = 0; same < 6; await sleep(300)) {
    const hh = await ev("document.documentElement.scrollHeight");
    same = hh === last ? same + 1 : 0; last = hh;
  }
  await ev(`document.querySelector(".dl-case").scrollIntoView({block:"start"})`);
  await sleep(600);
  const pageH = await ev("document.documentElement.scrollHeight");
  const a = await shot(".dl-case", `${TAG}-home-${w}.png`);
  await sleep(300);
  const ctrl = await shot(".dl-case", `${TAG}-home-${w}-control.png`);
  results[`ctrl-${w}`] = a === ctrl;
  await ev(`(function(){${findCard}.children[1].querySelector("span.dh").textContent="~$1M";return 1})()`);
  await sleep(300);
  const pageH2 = await ev("document.documentElement.scrollHeight");
  const b = await shot(".dl-case", `${TAG}-home-${w}-restored.png`);
  const k12 = await ev(`(function(){var c=${findCard};return [].slice.call(c.children).map(function(p){var v=[].slice.call(p.querySelectorAll("span")).filter(function(s){return getComputedStyle(s).display!=="none"});return v.length?v.map(function(s){return s.textContent}).join(""):p.textContent})})()`);
  results[`home-${w}`] = { identical: a === b, pageH, pageH2, k12 };
  console.log(`home-${w}`, "control", a === ctrl, "identical", a === b, pageH, pageH2, JSON.stringify(k12));
}

writeFileSync(join(OUT, `${TAG}-checks.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

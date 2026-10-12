// Headless Edge over CDP: HE hidden-cost card layout + /home pixel parity for the Pew merge.
// Usage: node shoot.mjs <tag>   (tag prefixes output files, e.g. "a" or "final")
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const TAG = process.argv[2] || "run";
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
  const t = setTimeout(() => { pending.delete(i); rej(new Error(method + ": timeout")); }, 20000);
  pending.set(i, (m) => { clearTimeout(t); m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result); });
  ws.send(JSON.stringify({ id: i, method, params }));
});
const retry = async (fn) => { for (let k = 0; ; k++) { try { return await fn(); } catch (e) { console.log("retry", e.message); if (k > 2) throw e; } } };
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

await send("Fetch.enable", { patterns: [{ urlPattern: "*delphi-me.com/hs-fs/hubfs/*" }] });
const results = {};

async function load(path, width, height, mobile) { return retry(() => load1(path, width, height, mobile)); }
async function load1(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`Promise.race([document.fonts.ready,new Promise(function(r){setTimeout(r,3000)})]).then(()=>1)`);
  await ev(`(function(){document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.querySelector(".dl-case").scrollIntoView({block:"start"})})()`);
  await sleep(900);
}

async function shot(sel, name) { return retry(async () => { await sleep(300); return shot1(sel, name); }); }
async function shot1(sel, name) {
  const r = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  return data;
}

const measure = `(function(){
  var g=document.querySelector(".dl-case__stats"),gb=g.getBoundingClientRect(),cs=getComputedStyle(g);
  var cards=[].slice.call(g.children).filter(function(c){return getComputedStyle(c).display!=="none"});
  return {cols:cs.gridTemplateColumns,grid:[Math.round(gb.left),Math.round(gb.width)],docOverflow:document.documentElement.scrollWidth>innerWidth,
    cards:cards.map(function(c){var b=c.getBoundingClientRect(),vis=[].slice.call(c.querySelectorAll("p")).filter(function(p){return p.offsetParent!==null||getComputedStyle(p).display!=="none"});
      var ps=[].slice.call(c.children),txt=function(p){return [].slice.call(p.querySelectorAll("span")).length?[].slice.call(p.querySelectorAll("span")).filter(function(s){return getComputedStyle(s).display!=="none"}).map(function(s){return s.textContent}).join(""):p.textContent};
      var num=ps[1],nb=num.getBoundingClientRect();
      return {x:Math.round(b.left-gb.left),y:Math.round(b.top-gb.top),w:Math.round(b.width),h:Math.round(b.height),
        kicker:txt(ps[0]),num:txt(ps[1]),txt:txt(ps[2]),src:txt(ps[3]),kickerCss:getComputedStyle(ps[0]).textTransform,
        numColor:getComputedStyle(num.querySelector("span.dh")||num).color,numSize:getComputedStyle(num).fontSize,
        overflow:c.scrollWidth>c.clientWidth+1||ps.some(function(p){return p.scrollWidth>p.clientWidth+1})}})}})()`;

const widths = [[1440, 900, false], [1280, 900, false], [1040, 900, false], [760, 1000, false], [390, 844, true]];
for (const [w, h, mob] of widths) {
  await load("/highered", w, h, mob);
  results[`he-${w}`] = await ev(measure);
  await shot(".dl-case__break", `${TAG}-he-${w}.png`);
  console.log(`he-${w}`, JSON.stringify(results[`he-${w}`].cards.map((c) => [c.x, c.y, c.w, c.h, c.overflow])), results[`he-${w}`].cols);
}

// /home parity: current DOM vs. DOM with the removed Employment card and old HE text restored.
const restore = `(function(){var c=[].slice.call(document.querySelectorAll(".dl-case__stats > .dl-card")).filter(function(a){return /\\$229K/.test(a.textContent)})[0];
  var s=c.querySelectorAll("span.dh");s[0].textContent="Earnings";s[2].textContent="less in lifetime earnings without a degree.";
  c.insertAdjacentHTML("afterend",'<article class="dl-card dl-he"><p>Employment</p><p>2x</p><p>as likely to be unemployed without a degree.</p><p>Pew Research Center</p></article>');return 1})()`;
for (const [w, h, mob] of [[1440, 900, false], [1040, 900, false], [760, 1000, false], [390, 844, true]]) {
  await load("/home", w, h, mob);
  await ev(`(function(){var s=document.createElement("style");s.textContent="html{scrollbar-width:none}";document.head.appendChild(s);return 1})()`);
  await sleep(2500);
  const a = await shot(".dl-case", `${TAG}-home-${w}.png`);
  const a2 = await shot(".dl-case", `${TAG}-home-${w}-again.png`);
  await ev(restore);
  await sleep(300);
  const b = await shot(".dl-case", `${TAG}-home-${w}-restored.png`);
  results[`home-${w}`] = { identical: a === b, baselineStable: a === a2, k12: (await ev(measure)).cards.map((c) => [c.kicker, c.num, c.txt, c.src]) };
  console.log(`home-${w}`, results[`home-${w}`].identical, results[`home-${w}`].baselineStable);
}

writeFileSync(join(OUT, `${TAG}-checks.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

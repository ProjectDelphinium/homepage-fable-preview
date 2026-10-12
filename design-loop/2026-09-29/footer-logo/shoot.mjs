// Headless Edge over CDP: footer logo 0.5in indent on /home. Usage: node shoot.mjs [tag]
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
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

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
}

const measure = `(function(){
  var f=document.querySelector("footer.dl-footer"); f.scrollIntoView({block:"center"});
  var r=function(el){var b=el.getBoundingClientRect();return {left:Math.round(b.left*10)/10,top:Math.round(b.top),w:Math.round(b.width),h:Math.round(b.height)}};
  var logo=document.querySelector(".dl-footer__logo"), brand=document.querySelector(".dl-footer__brand"), tag=document.querySelector(".dl-footer__tag");
  return {vw:innerWidth,scrollW:document.documentElement.scrollWidth,overflowX:document.documentElement.scrollWidth>innerWidth,
    marginLeft:getComputedStyle(logo).marginLeft,display:getComputedStyle(logo).display,
    logo:r(logo),brand:r(brand),tag:tag?r(tag):null};
})()`;

async function shot(name) {
  await sleep(700);
  const r = await ev(`(function(){var b=document.querySelector("footer.dl-footer").getBoundingClientRect();return {x:0,y:b.top+scrollY,w:innerWidth,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
}

const results = {};
for (const [w, h, mob] of [[1440, 900, false], [1097, 900, false], [390, 844, true]]) {
  await load("/home", w, h, mob);
  const m = await ev(measure);
  const name = `${TAG}-home-${w}-footer.png`;
  await shot(name);
  results[w] = { shot: name, ...m };
  console.log(w, JSON.stringify(m));
}

writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

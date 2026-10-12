// Headless Edge over CDP: .dl-case section shots + card geometry on /highered and /home.
// Usage: node shoot.mjs <prefix>
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const PREFIX = process.argv[2] || "shot";
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

async function load(path, width, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`document.fonts.ready.then(()=>1)`);
  await ev(`(function(){document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.querySelector(".dl-case").scrollIntoView({block:"start"})})()`);
  await sleep(900);
}

const probe = `(function(){
  var sec=document.querySelector(".dl-case");
  var cards=[].slice.call(sec.querySelectorAll(".dl-case__stats .dl-card")).filter(function(c){return getComputedStyle(c).display!=="none"});
  var vis=function(el){return [].slice.call(el.childNodes).map(function(n){return n.nodeType===3?n.textContent:(getComputedStyle(n).display==="none"?"":n.innerText)}).join("").trim()};
  return {
    html: document.documentElement.className,
    heReady: document.documentElement.classList.contains("dl-he-ready"),
    cols: getComputedStyle(sec.querySelector(".dl-case__stats")).gridTemplateColumns,
    punch: sec.querySelector(".dl-punch").innerText,
    heroLead: (document.querySelector(".dl-hero__lead")||{}).innerText,
    coverUpto: (document.querySelector(".dl-cover__upto")||{}).innerText,
    studyHeading: (document.querySelector("#proof-study-heading")||{}).innerText,
    cards: cards.map(function(c){var b=c.getBoundingClientRect();var num=c.querySelector(".dl-card__num");return {
      kicker: vis(c.querySelector(".dl-card__kicker")), num: vis(num), txt: vis(c.querySelector(".dl-card__txt")), src: vis(c.querySelector(".dl-case__src")),
      box: [Math.round(b.left), Math.round(b.width), Math.round(b.height)], numOverflow: num.scrollWidth > num.clientWidth + 1
    }})
  };
})()`;

async function shot(name) {
  let r;
  for (let i = 0; i < 20 && !r; i++) {
    r = await ev(`(function(){var s=document.querySelector(".dl-case");if(!s)return null;var b=s.getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
    if (!r) await sleep(300);
  }
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
}

for (const [path, tag] of [["/highered", "he"], ["/home", "k12"]]) {
  for (const [w, mob] of [[1440, false], [1040, false], [760, false], [390, true]]) {
    const key = `${tag}-${w}`;
    for (let i = 0; i < 3 && !results[key]; i++) {
      await load(path, w, mob);
      results[key] = await ev(probe);
    }
    await shot(`${PREFIX}-${key}.png`);
    console.log(key, JSON.stringify(results[key].cards.map((c) => [c.num, c.box, c.numOverflow])), results[key].cols);
  }
}

writeFileSync(join(OUT, `${PREFIX}.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

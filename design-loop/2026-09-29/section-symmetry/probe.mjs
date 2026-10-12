// Probe the Control Tower detail card bottom: wrap box vs clipped img vs section edge, plus a crop.
// Usage: node probe.mjs <label>
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const LABEL = process.argv[2] || "probe";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9352;
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });
let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {}
  await sleep(200);
}
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

for (const [path, w, h, mob] of [["/home", 1440, 900, false], ["/home", 1100, 800, false], ["/highered", 1024, 800, false], ["/home", 390, 844, true]]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`(async function(){document.querySelectorAll("img[loading=lazy]").forEach(function(i){i.loading="eager"});
    await Promise.all([...document.images].map(function(i){return i.complete?0:new Promise(function(r){i.onload=i.onerror=r;setTimeout(r,8000)})}));
    document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});})()`);
  await sleep(700);
  const r = await ev(`(function(){
    var s = document.querySelector("#product"), w = s.querySelector(".dl-prod__detail-wrap"), i = w.querySelector("img"), a = s.querySelector(".dl-prod");
    var sb = s.getBoundingClientRect().bottom + scrollY;
    var f = function(el){var r = el.getBoundingClientRect(); return Math.round((sb - (r.bottom + scrollY))*10)/10};
    return {wrapToEdge: f(w), imgBoxToEdge: f(i), articleToEdge: f(a), imgH: i.offsetHeight, y: Math.round(sb)};
  })()`);
  console.log(path, w, JSON.stringify(r));
  console.log(await ev(`(function(){
    var out = [];
    document.querySelectorAll("main.dl-home .dl-punch:last-child").forEach(function(p){
      if (!p.offsetParent) return;
      var k = p.querySelector(".dl-punch__key"), cs = getComputedStyle(p), fs = parseFloat(cs.fontSize);
      var c = document.createElement("canvas").getContext("2d"); c.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
      var m = c.measureText("Hg");
      var kr = k.getBoundingClientRect(), pr = p.getBoundingClientRect();
      out.push(p.parentElement.closest("section").className + " fs=" + fs + " desc/em=" + (m.fontBoundingBoxDescent / fs).toFixed(3)
        + " gDesc/em=" + (m.actualBoundingBoxDescent / fs).toFixed(3) + " markerBelowBox=" + (kr.bottom - 0.08 * parseFloat(getComputedStyle(k).fontSize) - pr.bottom).toFixed(1)
        + " keyOnLastLine=" + (kr.bottom > pr.bottom - fs * 0.5));
    });
    return out.join("\\n");
  })()`));
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: r.y - 200, width: w, height: 320, scale: 1 } });
  writeFileSync(join(OUT, `${LABEL}-ct-${path.slice(1)}-${w}.png`), Buffer.from(data, "base64"));
}
ws.close(); edge.kill(); process.exit(0);

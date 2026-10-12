// Side-effect checks for the symmetry pass: CT/MC media top vs h2 top, CT detail overlap on the roster,
// logo carousel running, and nav-anchor landing offsets. Usage: node checks.mjs
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9353;
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

const out = {};
for (const [path, w, h, mob] of [["/home", 1440, 900, false], ["/home", 1100, 800, false], ["/highered", 1024, 800, false], ["/home", 390, 844, true]]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`(async function(){document.querySelectorAll("img[loading=lazy]").forEach(function(i){i.loading="eager"});
    await Promise.all([...document.images].map(function(i){return i.complete?0:new Promise(function(r){i.onload=i.onerror=r;setTimeout(r,8000)})}));
    document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});})()`);
  await sleep(1200);
  const key = `${path.slice(1)}-${w}`;
  out[key] = await ev(`(async function(){
    var r1 = function(n){return Math.round(n*10)/10};
    var q = function(s){return document.querySelector(s)};
    var top = function(el){return el.getBoundingClientRect().top};
    var res = {
      ctMediaMinusH2: r1(top(q("#product .dl-prod__media")) - top(q("#core-heading"))),
      mcMediaMinusH2: r1(top(q("#community .dl-prod__shots")) - top(q("#cb-heading"))),
      ctDetailOverlap: r1(q("#product .dl-prod__media").getBoundingClientRect().bottom - top(q("#product .dl-prod__detail-wrap"))),
      textBoxSupported: CSS.supports("text-box", "trim-both cap alphabetic")
    };
    var track = q(".dl-logos__track");
    if (track && track.offsetParent){
      var a = getComputedStyle(track).transform; await new Promise(function(r){setTimeout(r, 600)});
      res.logosMoving = a !== getComputedStyle(track).transform; res.logosAnim = getComputedStyle(track).animationName;
    }
    document.documentElement.style.scrollBehavior = "auto";
    var land = {};
    ["#control-tower", "#community-builder", "#engagement-builder", "#customers", "#proof-eyebrow"].forEach(function(s){
      var el = q(s); if (!el || !el.offsetParent) return;
      el.scrollIntoView({block: "start"});
      var eb = s === "#customers" ? q("#logos-heading") : el;
      var cs = getComputedStyle(eb), fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight);
      land[s] = r1(top(eb));
    });
    res.anchorEyebrowTop = land;
    return res;
  })()`);
  console.log(key, JSON.stringify(out[key]));
}
writeFileSync(join(OUT, "checks.json"), JSON.stringify(out, null, 1));
ws.close(); edge.kill(); process.exit(0);

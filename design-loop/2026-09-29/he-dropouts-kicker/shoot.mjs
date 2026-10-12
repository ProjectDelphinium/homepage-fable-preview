// Headless Edge over CDP: case-card kickers on /home (1440) and /highered (1440, 390). Fresh tab per load.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9341;
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank",
], { stdio: "ignore" });
for (let i = 0; i < 50; i++) {
  try { await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; } catch {}
  await sleep(200);
}

const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };

async function open(width, height, mobile) {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
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
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  return { ws, send, ev, tid: t.id };
}

const cards = `(function(){return Array.from(document.querySelectorAll("section.dl-case .dl-case__stats > article.dl-card")).filter(function(a){return a.offsetParent!==null}).map(function(a){var p=a.querySelectorAll("p");return {kicker:p[0].innerText.trim(),num:p[1].innerText.trim(),src:p[3].innerText.trim()}})})()`;
const visual = `(function(){return Array.from(document.querySelectorAll("section.dl-case .dl-case__stats > article.dl-card")).filter(function(a){return a.offsetParent!==null}).map(function(a){var b=a.getBoundingClientRect();return {t:Math.round(b.top),l:Math.round(b.left),k:a.querySelector("p").innerText.trim(),n:a.querySelectorAll("p")[1].innerText.trim()}}).sort(function(x,y){return x.t-y.t||x.l-y.l}).map(function(c){return c.k+" ("+c.n+")"})})()`;
const rect = (sel) => `(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`;

async function shot(p, sel, name) {
  const r = await p.ev(rect(sel));
  const { data } = await p.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

for (const [path, tag, w, h, mob] of [["/home", "home-1440", 1440, 900, false], ["/highered", "highered-1440", 1440, 900, false], ["/highered", "highered-390", 390, 844, true]]) {
  const p = await open(w, h, mob);
  await p.send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 100; i++) {
    const s = await p.ev(`location.pathname+"|"+document.readyState`).catch(() => "");
    if (s === path + "|complete") break;
    await sleep(200);
  }
  await sleep(800);
  await p.ev(`(function(){document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.querySelector("section.dl-case .dl-case__stats").scrollIntoView({block:"center"});})()`);
  await sleep(1200);
  log(`${tag} page`, await p.ev(`({path:location.pathname,cls:document.documentElement.className})`));
  log(`${tag} cards (DOM order)`, await p.ev(cards));
  log(`${tag} kickers (visual order)`, await p.ev(visual));
  await shot(p, "section.dl-case .dl-case__stats", `${tag}-stats.png`);
  if (path === "/highered") {
    await p.ev(`(function(){var t=document.querySelector(".dl-top");if(t)t.style.visibility="hidden";})()`);
    await shot(p, "section.dl-case .dl-case__stats > article.dl-card", `${tag}-card1.png`);
  }
  p.ws.close();
  await fetch(`http://127.0.0.1:${PORT}/json/close/${p.tid}`).catch(() => {});
}

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
edge.kill();
process.exit(0);

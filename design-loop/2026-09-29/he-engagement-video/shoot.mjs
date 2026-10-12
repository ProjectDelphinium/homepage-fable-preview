// Headless Edge over CDP: Engagement watch link per path (/highered xbdP6GSjPgY, /home ejtU7miZWD4)
// plus the state of every HE video swap in the --dl-he map. Usage: node shoot.mjs
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9363;
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAP = [
  ["hero", "section.dl-hero .dl-hero__actions > a.dl-link", "id9dqfNZsf4", "9mfMC9jC6lU"],
  ["product", "#product a.dl-link[data-youtube]", "xC1b-9bZW4w", "MBYmCCeZqxo"],
  ["community", "#community a.dl-link[data-youtube]", "acjbTVs8IUM", "4vzDJ1poyvU"],
  ["makeover", "#makeover a.dl-link[data-youtube]", "Ek-BBS8rP_0", "63Iu4Xxg_tg"],
  ["engagement", "section#engagement article.dl-prod.dl-prod--wide .dl-eb-foot .dl-prod__more > a.dl-link", "ejtU7miZWD4", "xbdP6GSjPgY"],
  ["integration", 'a.dl-link[title="Watch: Integration is easy!"]', "L90IoF6LGAE", "U615qsZh8bc"],
];
const ENG = MAP[4][1];

const edge = spawn(EDGE, [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  "--autoplay-policy=no-user-gesture-required",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank",
], { stdio: "ignore" });

let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {}
  await sleep(200);
}
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
let errors = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Runtime.exceptionThrown") errors.push((m.params.exceptionDetails.exception || {}).description || m.params.exceptionDetails.text);
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id;
  pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
await send("Runtime.enable");

const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };

async function load(path, width, height, mobile) {
  errors = [];
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(2500);
}
async function shotView(name) {
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}
async function click(sel) {
  await ev(`(function(){document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:"center",behavior:"instant"})})()`);
  await sleep(1200);
  const [x, y] = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await sleep(150);
  return [x, y];
}
async function press(x, y) {
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}

const swapState = `(function(){
  var map=${JSON.stringify(MAP)}, html=document.body.innerHTML;
  return { html: document.documentElement.className.match(/dl-path-\\w+|dl-he-ready/g),
    links: map.map(function(r){var a=document.querySelector(r[1]);return a?{name:r[0],href:a.getAttribute("href"),yt:a.getAttribute("data-youtube"),dataTitle:a.getAttribute("data-title"),title:a.getAttribute("title"),text:a.textContent.replace(/\\s+/g," ").trim(),visible:a.getClientRects().length>0,k12InDom:html.split(r[2]).length-1,heInDom:html.split(r[3]).length-1}:{name:r[0],missing:true}}),
    ytPreloads: [].map.call(document.querySelectorAll("iframe[title='YouTube preload']"), function(f){return (f.src.match(/embed\\/([^?]+)/)||[])[1]}) };
})()`;
const modalState = `(function(){
  var m=document.getElementById("dl-modal"), f=m.querySelector("iframe"), t=document.getElementById("dl-modal-title");
  return { open: !m.hidden && getComputedStyle(m).display!=="none", title: t ? t.textContent.trim() : null, iframe: f ? f.getAttribute("src") : null, iframeTitle: f ? f.getAttribute("title") : null };
})()`;

for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  for (const path of ["/highered", "/home"]) {
    const tag = `${path.slice(1)}-${w}`;
    await load(path, w, h, mobile);
    log(`${tag} swaps`, await ev(swapState));
    await click(ENG);
    await shotView(`${tag}-engagement.png`);
    const [x, y] = await click(ENG);
    log(`${tag} hit`, await ev(`(function(){var e=document.elementFromPoint(${x},${y});return e&&e.closest("a")?e.closest("a").getAttribute("data-youtube"):String(e&&e.className)})()`));
    await press(x, y);
    await sleep(2500);
    log(`${tag} modal`, await ev(modalState));
    await shotView(`${tag}-modal.png`);
    log(`${tag} exceptions`, errors);
  }
}

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

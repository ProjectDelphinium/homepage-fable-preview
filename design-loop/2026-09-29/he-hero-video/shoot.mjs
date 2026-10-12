// Headless Edge over CDP: hero watch link video per path (/highered 9mfMC9jC6lU, /home id9dqfNZsf4).
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
  "--autoplay-policy=no-user-gesture-required",
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

const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };

async function load(path, width, height, mobile) {
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
  await ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:"center"})`);
  await sleep(300);
  const [x, y] = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}

const linkState = `(function(){
  var a=document.querySelector("section.dl-hero .dl-hero__actions > a.dl-link"), q=function(s){var e=document.querySelector(s);return e?e.textContent.replace(/\\s+/g," ").trim():null};
  return { html: document.documentElement.className.match(/dl-path-\\w+|dl-he-ready/g),
    link: { href: a.getAttribute("href"), yt: a.getAttribute("data-youtube"), dataTitle: a.getAttribute("data-title"), title: a.getAttribute("title"), text: a.textContent.replace(/\\s+/g," ").trim() },
    swaps: { lead: q(".dl-hero__lead"), upto: q(".dl-cover__upto"), num: q(".dl-cover__num"), studyHeading: q("#proof-study-heading"), davisTxt: q(".dl-proof__davis .dl-card__txt"), davisNum: q(".dl-proof__davis .dl-card__num"), punch: q(".dl-proof__study-punch") },
    oldIdInDom: document.body.innerHTML.split("id9dqfNZsf4").length-1, newIdInDom: document.body.innerHTML.split("9mfMC9jC6lU").length-1,
    ytIframes: [].map.call(document.querySelectorAll("iframe"), function(f){return (f.getAttribute("src")||"").replace(/\\?.*/,"")}).filter(function(s){return /youtube/.test(s)}) };
})()`;

const modalState = `(function(){
  var m=document.getElementById("dl-modal"), f=m.querySelector("iframe"), t=document.getElementById("dl-modal-title");
  return { open: !m.hidden && getComputedStyle(m).display!=="none", title: t ? t.textContent.trim() : null, iframe: f ? f.getAttribute("src") : null, iframeTitle: f ? f.getAttribute("title") : null };
})()`;

for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  for (const path of ["/highered", "/home"]) {
    const tag = `${path.slice(1)}-${w}`;
    await load(path, w, h, mobile);
    log(`${tag} link`, await ev(linkState));
    await shotView(`${tag}-hero.png`);
    await click("section.dl-hero .dl-hero__actions > a.dl-link");
    await sleep(2500);
    log(`${tag} modal`, await ev(modalState));
    await shotView(`${tag}-modal.png`);
  }
}

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

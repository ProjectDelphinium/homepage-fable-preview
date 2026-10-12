// Headless Edge over CDP: Makeover watch link per path (/highered 63Iu4Xxg_tg, /home Ek-BBS8rP_0) plus all HE video swaps.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9347;
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
const SEL = "section#makeover .dl-mk__aside .dl-mk__help .dl-prod__more > a.dl-link";
async function click(sel) {
  await ev(`(function(){document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.documentElement.style.scrollBehavior="auto";document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:"center",behavior:"instant"})})()`);
  await sleep(800);
  const [x, y] = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}

const linkState = `(function(){
  var a=document.querySelector(${JSON.stringify(SEL)});
  var ids=["Ek-BBS8rP_0","63Iu4Xxg_tg","id9dqfNZsf4","9mfMC9jC6lU","xC1b-9bZW4w","MBYmCCeZqxo","acjbTVs8IUM","4vzDJ1poyvU"], cnt={};
  ids.forEach(function(k){cnt[k]=document.querySelectorAll('[data-youtube="'+k+'"]').length});
  return { html: document.documentElement.className.match(/dl-path-\\w+|dl-he-ready/g),
    link: { href: a.getAttribute("href"), yt: a.getAttribute("data-youtube"), dataTitle: a.getAttribute("data-title"), title: a.getAttribute("title"), text: a.textContent.replace(/\\s+/g," ").trim() },
    allYt: [].map.call(document.querySelectorAll("a[data-youtube]"), function(e){var s=e.closest("section");return { sec: s ? (s.id || s.className.split(" ")[0]) : null, yt: e.getAttribute("data-youtube"), hrefMatches: e.href.indexOf(e.getAttribute("data-youtube"))>-1 }}),
    counts: cnt };
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
    await click(SEL);
    await sleep(2500);
    log(`${tag} modal`, await ev(modalState));
    await shotView(`${tag}-makeover-modal.png`);
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    await sleep(600);
    await shotView(`${tag}-makeover.png`);
  }
}

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

// /highered without #videos: console errors, section visibility, links to #videos,
// which YouTube ids got preloaded, and a hero video click still opening the modal. Usage: node check.mjs
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9357;
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
let logs = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Runtime.exceptionThrown") logs.push({ kind: "exception", text: (m.params.exceptionDetails.exception || {}).description || m.params.exceptionDetails.text });
  if (m.method === "Runtime.consoleAPICalled" && (m.params.type === "error" || m.params.type === "warning")) logs.push({ kind: "console." + m.params.type, text: m.params.args.map((a) => a.value ?? a.description).join(" ") });
  if (m.method === "Log.entryAdded" && m.params.entry.level === "error") logs.push({ kind: "log." + m.params.entry.source, text: m.params.entry.text, url: m.params.entry.url });
});
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
await send("Runtime.enable");
await send("Log.enable");

const out = {};
for (const [path, w, h, mob] of [["/highered", 1440, 900, false], ["/highered", 390, 844, true], ["/home", 1440, 900, false]]) {
  logs = [];
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(2500);
  const key = `${path.slice(1)}-${w}`;
  const res = await ev(`(async function(){
    var q = function(s){return document.querySelector(s)};
    var vis = function(el){return !!el && el.getClientRects().length > 0};
    var r = {
      htmlClass: document.documentElement.className,
      videosInDom: !!q("#videos"),
      videosDisplay: q("#videos") ? getComputedStyle(q("#videos")).display : null,
      customersDisplay: q("#customers") ? getComputedStyle(q("#customers")).display : null,
      linksToVideos: [...document.querySelectorAll('a[href$="#videos"]')].map(function(a){return {text: a.textContent.trim(), visible: vis(a)}}),
      visibleNavLinks: [...document.querySelectorAll(".dl-nav a[href*='#'], .dl-footer a[href*='#']")].filter(vis).map(function(a){return a.textContent.trim() + " -> " + a.getAttribute("href")}),
      warmedYtIds: [...document.querySelectorAll("iframe[title='YouTube preload']")].map(function(f){return (f.src.match(/embed\\/([^?]+)/) || [])[1]}),
      visibleVideoIds: [...document.querySelectorAll("a[data-youtube]")].filter(vis).map(function(a){return a.getAttribute("data-youtube")}),
      sectionOrder: [...q("main.dl-home").children].filter(function(s){return s.tagName === "SECTION" && getComputedStyle(s).display !== "none"}).map(function(s){return s.id || s.classList[1]})
    };
    var hero = q(".dl-hero a[data-youtube]");
    hero.click();
    await new Promise(function(res){setTimeout(res, 800)});
    var modal = q("#dl-modal");
    r.heroClickOpensModal = modal.open === true || modal.hasAttribute("open") || getComputedStyle(modal).display !== "none";
    r.modalTitle = (q("#dl-modal-title") || {}).textContent;
    var close = modal.querySelector(".dl-modal__close");
    if (close) close.click();
    await new Promise(function(res){setTimeout(res, 500)});
    return r;
  })()`);
  res.consoleErrors = logs;
  out[key] = res;
  console.log(key, JSON.stringify(res, null, 1));
}
writeFileSync(join(OUT, "check.json"), JSON.stringify(out, null, 1));
ws.close(); edge.kill(); process.exit(0);

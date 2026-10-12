// Headless Edge over CDP: Contact / Support footer links open a new tab to the right page.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9339;
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });

let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {}
  await sleep(200);
}
const pageT = targets.find((t) => t.type === "page");
const ws = new WebSocket(pageT.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };
const pages = async () => (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).filter((t) => t.type === "page");

const linkInfo = `(async function(){
  var out=[]; var links=[].filter.call(document.querySelectorAll("a"), function(a){ return /\\/(contact-us|support)$/.test(a.getAttribute("href")||""); });
  for (var a of links) out.push({ href:a.href, target:a.target, rel:a.rel, ariaLabel:a.getAttribute("aria-label"), text:a.textContent.trim(), where:a.closest("footer")?"footer":a.closest(".dl-mnav")?"menu":a.closest(".dl-nav")?"bar":"body" });
  return out; })()`;

for (const [path, w, h, mob] of [["/home", 1440, 900, false], ["/highered", 1440, 900, false], ["/home", 390, 844, true], ["/highered", 390, 844, true]]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mob ? 2 : 1, mobile: mob });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
  const links = await ev(linkInfo);
  log(`${w} ${path} links`, links);
  if (mob) log(`${w} ${path} menu has contact/support`, await ev(`!!document.querySelector('.dl-mnav a[href$="/contact-us"], .dl-mnav a[href$="/support"]')`));
  for (const sel of ['footer a[href$="/support"]', 'footer a[href$="/contact-us"]', 'footer a[href$="/support"]', 'footer a[href$="/contact-us"]']) {
    const before = (await pages()).map((t) => t.id);
    await ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:"center"})`);
    await sleep(900);
    const [x, y, hit] = await ev(`(function(){var a=document.querySelector(${JSON.stringify(sel)});var b=a.getBoundingClientRect();var X=b.left+b.width/2,Y=b.top+b.height/2;var e=document.elementFromPoint(X,Y);return [X,Y,e===a||a.contains(e)?"link":(e&&(e.tagName+"."+e.className))]})()`);
    log(`${w} ${path} hit ${sel}`, hit);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
    await sleep(1200);
    const after = await pages();
    const fresh = after.filter((t) => !before.includes(t.id));
    const self = await ev("location.pathname");
    log(`${w} ${path} click ${sel}`, { newTabs: fresh.map((t) => t.url), openerStayed: self === path });
    for (const t of fresh) await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`);
  }
}
const { data } = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(join(OUT, "footer-contact-support-390.png"), Buffer.from(data, "base64"));
writeFileSync(join(OUT, "newtab-checks.json"), JSON.stringify(results, null, 1));
ws.close(); edge.kill(); process.exit(0);

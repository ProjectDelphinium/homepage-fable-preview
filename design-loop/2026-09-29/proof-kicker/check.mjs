// Headless Edge over CDP: proof study kicker text, accessible name, and card crop on /home and /highered.
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
const results = {};
const CARD = "section#proof article.dl-proof__result--davis";

for (const [path, w, h, mob] of [["/home", 1440, 900, false], ["/highered", 1440, 900, false], ["/home", 390, 844, true], ["/highered", 390, 844, true]]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
  await ev(`document.querySelector(${JSON.stringify(CARD)}).scrollIntoView({block:"center"})`);
  await sleep(1400);
  const info = await ev(`(function(){
    var card=document.querySelector(${JSON.stringify(CARD)}), k=card.querySelector("p#proof-study-heading");
    var lb=card.getAttribute("aria-labelledby"), r=card.getBoundingClientRect();
    var q=function(s){var e=document.querySelector(s);return e?e.textContent:null};
    return {htmlClass:document.documentElement.className,
      kickerText:k.textContent, kickerRendered:k.innerText, textTransform:getComputedStyle(k).textTransform,
      kickerClass:k.className, ariaLabelledby:lb, labelledbyCount:document.querySelectorAll('[aria-labelledby="proof-study-heading"]').length,
      cardNum:q(".dl-proof__davis .dl-card__num"), studyPunch:q(".dl-proof__study-punch"),
      coverUpto:q(".dl-cover__upto"), coverNum:q(".dl-cover__num"),
      cardVisibility:getComputedStyle(card).visibility,
      rect:[r.left+scrollX,r.top+scrollY,r.width,r.height]}})()`);
  const { root } = await send("DOM.getDocument", { depth: 0 });
  const { nodeId } = await send("DOM.querySelector", { nodeId: root.nodeId, selector: CARD });
  const ax = await send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false });
  info.accessibleName = ax.nodes[0]?.name?.value ?? null;
  info.accessibleRole = ax.nodes[0]?.role?.value ?? null;
  results[`${w} ${path}`] = info;
  console.log(`${w} ${path}`, JSON.stringify(info));
  const [x, y, cw, ch] = info.rect;
  const { data } = await send("Page.captureScreenshot", { format: "png", clip: { x: Math.max(0, x - 12), y: Math.max(0, y - 12), width: Math.min(w, cw + 24), height: ch + 24, scale: 1 } });
  writeFileSync(join(OUT, `davis-card-${path.slice(1)}-${w}.png`), Buffer.from(data, "base64"));
}
writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close(); edge.kill(); process.exit(0);

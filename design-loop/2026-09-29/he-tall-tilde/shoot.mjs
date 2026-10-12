// Headless Edge over CDP: HE tall "Completion and retention" card numbers without "~".
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

let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {}
  await sleep(200);
}
console.log("targets", targets && targets.length);
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
  console.log("navigate", path, width);
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
  await ev(`(function(){document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.querySelector(".dl-case__stats").scrollIntoView({block:"center"});})()`);
  await sleep(900);
}

const state = `(function(){
  var c=document.querySelector("section.dl-case .dl-case__stats article.dl-card.dl-he");
  var cards=[].slice.call(document.querySelectorAll(".dl-case__stats > *")).filter(function(x){return getComputedStyle(x).display!=="none"});
  return {
    htmlClass: document.documentElement.className,
    heCard: c ? {display:getComputedStyle(c).display, paras:[].map.call(c.children,function(p){return p.textContent})} : null,
    heCardTildes: c ? (c.textContent.match(/~/g)||[]).length : null,
    visibleCardNums: cards.map(function(x){var n=x.querySelector(".dl-card__num");return n?n.innerText:(x.children[1]&&x.children[1].textContent)}),
    caseStatsTildes: (document.querySelector(".dl-case__stats").innerText.match(/~[^\\s]*/g)||[])
  };
})()`;

async function shot(name) {
  const r = await ev(`(function(){var b=document.querySelector(".dl-case__stats").getBoundingClientRect();return {x:b.left+scrollX-16,y:b.top+scrollY-16,w:b.width+32,h:b.height+32}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: Math.max(0, r.x), y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  await load("/highered", w, h, mob);
  log(`highered ${tag}`, await ev(state));
  await shot(`highered-${tag}-case-stats.png`);
}
await load("/home", 1440, 900, false);
log("home 1440", await ev(state));
await shot("home-1440-case-stats.png");

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

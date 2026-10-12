// Headless Edge over CDP: confirm the Columbia card bolds exactly "lower income and underprepared" on /highered only.
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
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}, timeout = 15000) => new Promise((res, rej) => {
  const i = ++id;
  const t = setTimeout(() => { pending.delete(i); rej(new Error(method + ": timeout")); }, timeout);
  pending.set(i, (m) => { clearTimeout(t); m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result); });
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true })).result.value;
const evSafe = async (expr) => { try { return await send("Runtime.evaluate", { expression: expr, returnByValue: true }, 2000).then((r) => r.result.value); } catch { return null; } };

const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path + "?cb=" + Date.now() });
  await sleep(800);
  for (let i = 0; i < 60; i++) { if ((await evSafe("location.pathname===" + JSON.stringify(path) + "&&document.readyState")) === "complete") break; await sleep(300); }
  await sleep(800);
  await ev(`document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")})`);
}

const findCard = `(function(){var c=[].slice.call(document.querySelectorAll("section.dl-case .dl-card")).find(function(a){return /Columbia University/.test(a.textContent)||/NAEP/.test(a.textContent)});return c})()`;

const check = `(function(){
  var card=${findCard}; if(!card) return {error:"card not found"};
  var txt=card.querySelector(".dl-card__txt");
  var vis=[].slice.call(txt.querySelectorAll("span")).filter(function(s){return getComputedStyle(s).display!=="none"});
  var runs=[]; var w=document.createTreeWalker(txt,NodeFilter.SHOW_TEXT);
  while(w.nextNode()){var n=w.currentNode,p=n.parentElement;if(!n.textContent.trim())continue;var hidden=false;for(var e=p;e&&e!==txt.parentElement;e=e.parentElement){if(getComputedStyle(e).display==="none"){hidden=true;break}}if(hidden)continue;runs.push({text:n.textContent,weight:getComputedStyle(p).fontWeight,tag:p.tagName})}
  var bold=runs.filter(function(r){return +r.weight>=700}).map(function(r){return r.text});
  return {htmlClass:document.documentElement.className,kicker:card.querySelector(".dl-card__kicker").innerText,num:card.querySelector(".dl-card__num").innerText,visibleText:txt.innerText,runs:runs,boldText:bold,baseWeight:getComputedStyle(txt).fontWeight};
})()`;

async function shot(name) {
  await ev(`(${findCard}).scrollIntoView({block:"center"})`);
  await sleep(500);
  const r = await ev(`(function(){var b=(${findCard}).getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const pad = 16;
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: Math.max(0, r.x - pad), y: r.y - pad, width: r.w + pad * 2, height: r.h + pad * 2, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  await load("/highered", w, h, mob);
  log(`highered ${tag}`, await ev(check));
  await shot(`highered-${tag}-columbia.png`);
}
await load("/home", 1440, 900, false);
log("home 1440", await ev(check));
await shot("home-1440-naep.png");

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

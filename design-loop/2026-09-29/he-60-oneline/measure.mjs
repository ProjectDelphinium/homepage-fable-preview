// Headless Edge over CDP: find the viewport where the HE 60% stat body box is ~483px wide,
// and count lines for each candidate wording (injected in the DOM only, file untouched).
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9361;
const BASE = "http://127.0.0.1:8767";
const CANDIDATES = [
  "of students don't finish a bachelor's in 4 years; <b>40%</b> still haven't in 6.",
  "don't finish a bachelor's in 4 years, and <b>40%</b> still haven't in 6.",
  "of students don't finish in 4 years, and <b>40%</b> still haven't in 6.",
  "of students don't finish a bachelor's in 4 years, and <b>40%</b> still haven't in 6.",
  "of students don't finish a bachelor's in 4 years, and about <b>40%</b> still haven't in 6.",
];
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
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id;
  pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };

async function load(width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + "/highered?t=" + Date.now() });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev("document.fonts.ready.then(function(){return 1})");
  await sleep(400);
  await ev(`document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")})`);
}

async function resize(width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await sleep(120);
}

const LINES = `function lines(p){var r=document.createRange();r.selectNodeContents(p);var tops=[];
  [].slice.call(r.getClientRects()).forEach(function(b){if(b.width<1)return;var t=Math.round(b.top);if(!tops.some(function(x){return Math.abs(x-t)<4}))tops.push(t)});return tops.length}`;

const probe = (cands) => `(function(){${LINES}
  var card=document.querySelector("section.dl-case .dl-case__stats article.dl-card.dl-he");
  var p=[].slice.call(card.querySelectorAll(":scope > p")).find(function(x){return /finish/.test(x.textContent)});
  var orig=p.innerHTML;var cs=getComputedStyle(p);
  var out={vw:innerWidth,boxW:+p.getBoundingClientRect().width.toFixed(1),contentW:+(p.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)).toFixed(1),font:cs.fontSize,lh:cs.lineHeight,cands:[]};
  ${JSON.stringify(cands)}.forEach(function(c){p.innerHTML=c;
    var r=document.createRange();r.selectNodeContents(p);var w=0;[].slice.call(r.getClientRects()).forEach(function(b){w+=b.width});
    p.style.whiteSpace="nowrap";var nat=+p.scrollWidth.toFixed(1);var rr=document.createRange();rr.selectNodeContents(p);var tw=rr.getBoundingClientRect().width;p.style.whiteSpace="";
    out.cands.push({lines:lines(p),naturalW:+tw.toFixed(1)});});
  p.innerHTML=orig;return out;})()`;

await load(1440, 900, false);
log("1440", await ev(probe(CANDIDATES)));

for (let w = 1100; w >= 560; w -= 10) {
  await resize(w, 900, false);
  log(String(w), await ev(probe(CANDIDATES)));
}

await load(390, 844, true);
log("390", await ev(probe(CANDIDATES)));

writeFileSync(join(OUT, "measure.json"), JSON.stringify({ candidates: CANDIDATES, results }, null, 1));
ws.close();
edge.kill();
process.exit(0);

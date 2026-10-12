// Headless Edge over CDP: checks the Columbia card kicker on /highered (and /home unchanged).
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const TAG = process.argv[2] || "check";
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
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id;
  pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
}

const probe = `(function(){
  document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});
  var cards=[].slice.call(document.querySelectorAll("section.dl-case div.dl-case__stats article.dl-card"));
  var vis=function(el){return el && el.offsetParent!==null;};
  var card=cards.find(function(c){return vis(c) && /Columbia University/.test(c.innerText);});
  if(!card){var first=cards.find(vis);return {found:false,firstKicker:first&&first.querySelector("p").innerText};}
  card.scrollIntoView({block:"center"});
  var k=card.querySelector(".dl-card__kicker");
  var r=document.createRange();r.selectNodeContents(k);
  var tops={};[].forEach.call(r.getClientRects(),function(x){if(x.width>0)tops[Math.round(x.top)]=1;});
  var t=function(sel){var p=card.querySelector(sel);return p?p.innerText:null;};
  var b=card.getBoundingClientRect();
  return {found:true,index:cards.filter(vis).indexOf(card)+1,kicker:k.innerText,kickerLines:Object.keys(tops).length,
    num:t(".dl-card__num"),body:t(".dl-card__txt"),src:t(".dl-case__src"),
    rect:{x:b.x+scrollX,y:b.y+scrollY,w:b.width,h:b.height}};
})()`;

const results = {};
for (const [path, w, h, mobile] of [["/highered", 1440, 900, false], ["/highered", 390, 844, true], ["/home", 1440, 900, false]]) {
  await load(path, w, h, mobile);
  await ev(probe);
  await sleep(900);
  const r = await ev(probe);
  results[`${path}-${w}`] = r;
  console.log(path, w, JSON.stringify(r));
  if (r.found && path === "/highered") {
    const pad = 12;
    const clip = { x: Math.max(0, r.rect.x - pad), y: Math.max(0, r.rect.y - pad), width: r.rect.w + pad * 2, height: r.rect.h + pad * 2, scale: 1 };
    const shot = await send("Page.captureScreenshot", { format: "png", clip });
    writeFileSync(join(OUT, `${TAG}-highered-${w}-card.png`), Buffer.from(shot.data, "base64"));
  }
}
writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(results, null, 2));
ws.close();
edge.kill();
process.exit(0);

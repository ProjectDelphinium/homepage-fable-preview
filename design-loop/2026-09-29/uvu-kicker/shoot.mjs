// Headless Edge over CDP: HE outcomes card kicker text, line count, and /home hidden check.
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
ws.addEventListener("close", (e) => console.log("ws closed", e.code, e.reason));
let id = 0;
const pending = new Map();
const zname = (u) => decodeURIComponent(new URL(u).pathname.split("/").pop()).replace(/ /g, "-").replace(/[^A-Za-z0-9._-]/g, "-");
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Fetch.requestPaused") {
    const u = m.params.request.url;
    const params = { requestId: m.params.requestId };
    if (u.includes("/hs-fs/hubfs/")) params.url = "https://delphi-me.com/dl28-hubfs-" + zname(u);
    ws.send(JSON.stringify({ id: ++id, method: "Fetch.continueRequest", params }));
  }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id;
  pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

await send("Fetch.enable", { patterns: [{ urlPattern: "*delphi-me.com/hs-fs/hubfs/*" }] });
const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
  await ev(`document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")})`);
  await sleep(900);
}

const state = `(function(){
  var k=document.getElementById("proof-outcomes-heading"), c=k&&k.closest("article");
  if(!k) return {found:false};
  var cs=getComputedStyle(k), cc=getComputedStyle(c), r=document.createRange(); r.selectNodeContents(k);
  var tops=[...r.getClientRects()].map(function(x){return Math.round(x.top)}).filter(function(v,i,a){return a.indexOf(v)===i});
  var kb=k.getBoundingClientRect(), cb=c.getBoundingClientRect();
  return {html:document.documentElement.className, text:k.textContent, innerText:k.innerText, transform:cs.textTransform,
    lines:tops.length, kickerW:Math.round(kb.width), kickerH:Math.round(kb.height), lineHeight:cs.lineHeight, fontSize:cs.fontSize,
    cardDisplay:cc.display, cardVisible:!!c.offsetParent && cb.height>0, cardW:Math.round(cb.width),
    textW:Math.round(r.getBoundingClientRect().width), overflow:k.scrollWidth>k.clientWidth};
})()`;

async function shot(name) {
  await ev(`document.getElementById("proof-outcomes-heading").closest("article").scrollIntoView({block:"center"})`);
  await sleep(500);
  const r = await ev(`(function(){var b=document.getElementById("proof-outcomes-heading").closest("article").getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  await load("/highered", w, h, mob);
  log(`highered ${tag}`, await ev(state));
  await shot(`highered-${tag}-outcomes-card.png`);
  await load("/home", w, h, mob);
  log(`home ${tag}`, await ev(state));
}

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

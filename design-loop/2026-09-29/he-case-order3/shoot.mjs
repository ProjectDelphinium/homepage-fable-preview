// Headless Edge over CDP: HE stat card order + /home pixel check. Usage: node shoot.mjs <label>
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const LABEL = process.argv[2] || "run";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9341;
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars",
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
ws.addEventListener("close", () => { console.error("ws closed"); process.exit(2); });
const keepAlive = setInterval(() => {}, 1000);
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id;
  const t = setTimeout(() => rej(new Error(method + ": timeout")), 30000);
  pending.set(i, (m) => { clearTimeout(t); m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result); });
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

await send("Fetch.enable", { patterns: [{ urlPattern: "*delphi-me.com/hs-fs/hubfs/*" }] });
const results = {};

async function load(path, width, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  await sleep(500);
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete" && (await ev("!!document.querySelector('.dl-case')"))) break; await sleep(200); }
  await ev(`(function(){var s=document.createElement("style");s.textContent="*,*::before,*::after{animation:none!important;transition:none!important}";document.head.appendChild(s);document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.querySelectorAll("img").forEach(function(i){i.loading="eager"});})()`);
  await sleep(1500);
}

async function clip(sel, name) {
  const r = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  const buf = Buffer.from(data, "base64");
  writeFileSync(join(OUT, name), buf);
  return createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

const cards = `(function(){var cs=[].slice.call(document.querySelectorAll(".dl-case__stats > .dl-card")).filter(function(c){return getComputedStyle(c).display!=="none"});return cs.map(function(c,i){var b=c.getBoundingClientRect(),k=c.children[0],n=c.children[1],s=c.children[3];return {dom:[].indexOf.call(c.parentNode.children,c)+1,kicker:k.innerText.trim(),num:n.innerText.trim(),src:s.innerText.trim(),x:Math.round(b.left),y:Math.round(b.top+scrollY),w:Math.round(b.width),h:Math.round(b.height),order:getComputedStyle(c).order,col:getComputedStyle(c).gridColumn,row:getComputedStyle(c).gridRow,numY:Math.round(n.getBoundingClientRect().top+scrollY),srcY:Math.round(s.getBoundingClientRect().top+scrollY)}}).sort(function(a,b){return a.y-b.y||a.x-b.x})})()`;

for (const [w, mob] of [[1440, false], [1040, false], [760, false], [390, true]]) {
  await load("/highered", w, mob);
  const c = await ev(cards);
  results[`he-${w}`] = c;
  results[`he-${w}-hash`] = await clip(".dl-case", `${LABEL}-he-${w}-case.png`);
  console.log(`HE ${w}:`, c.map((x) => `[${x.num} @${x.x},${x.y} ${x.w}x${x.h}]`).join(" "));

  await load("/home", w, mob);
  results[`home-${w}-case-hash`] = await clip(".dl-case", `${LABEL}-home-${w}-case.png`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
  const full = Buffer.from(data, "base64");
  results[`home-${w}-full-hash`] = createHash("sha256").update(full).digest("hex").slice(0, 16);
  console.log(`home ${w}: case ${results[`home-${w}-case-hash`]} full ${results[`home-${w}-full-hash`]}`);
}

writeFileSync(join(OUT, `${LABEL}.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

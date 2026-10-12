// Headless Edge over CDP: "You're invited" card color bar vs card top edge.
// Usage: node shoot.mjs before|after
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const TAG = process.argv[2] || "before";
const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9357;
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

const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };

async function load(path, width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile: width < 600 });
  // Desktop scrollbars shift headless clip rects by half their width; hide them so crops land on the card.
  await send("Emulation.setScrollbarsHidden", { hidden: true });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
  await ev(`(function(){document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.querySelector(".dl-close__invite").scrollIntoView({block:"center"});})()`);
  await sleep(2500);
}

const measure = `(function(){
  var c=document.querySelector(".dl-close__invite"),cs=getComputedStyle(c),b=getComputedStyle(c,"::before");
  var bb=c.getBoundingClientRect();
  return {cardW:c.offsetWidth,cardH:c.offsetHeight,cardRadius:cs.borderTopLeftRadius,transform:cs.transform,origin:cs.transformOrigin,
    cardBg:cs.backgroundImage.slice(0,60)+(cs.backgroundImage.length>60?"...":""),cardBgSize:cs.backgroundSize,
    before:{content:b.content,w:b.width,h:b.height,top:b.top,left:b.left,right:b.right,radius:b.borderTopLeftRadius+" / "+b.borderTopRightRadius,transform:b.transform},
    bbox:{x:Math.round(bb.left*10)/10,y:Math.round(bb.top*10)/10,w:Math.round(bb.width*10)/10,h:Math.round(bb.height*10)/10}};
})()`;

async function clip(name, r, scale = 1) {
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { ...r, scale } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

const views = [
  ["/home", "home-1440", 1440, 900],
  ["/home", "home-1097", 1097, 800],
  ["/home", "home-390", 390, 844],
  ["/highered", "he-1440", 1440, 900],
  ["/highered", "he-390", 390, 844],
];

for (const [path, name, w, h] of views) {
  await load(path, w, h);
  const m = await ev(measure);
  log(`${TAG} ${name}`, m);
  const sx = await ev("scrollX"), sy = await ev("scrollY");
  const x = m.bbox.x + sx, y = m.bbox.y + sy;
  // Tilted zoom of the card's top band (device scale 2).
  await clip(`${TAG}-${name}-zoom.png`, { x: x - 24, y: y - 30, width: m.bbox.w + 60, height: 120 });
  if (name.endsWith("1440") || name.endsWith("390") || name.endsWith("1097")) {
    // Close-up of the tilted top-left corner (device scale 2 x clip scale 4 = 8x).
    await clip(`${TAG}-${name}-corner.png`, { x: x - 6, y: y - 6, width: 44, height: 34 }, 4);
  }
  // Untilted diagnostic: remove rotation/shadow/sticker so the corner is axis aligned, then capture both top corners at 8x.
  await ev(`(function(){var s=document.createElement("style");s.id="dl-diag";s.textContent=".dl-reveal,.dl-close__invite{transform:none!important;transition:none!important}.dl-close__invite{box-shadow:none!important}.dl-close__sticker{display:none!important}";document.head.appendChild(s);})()`);
  await sleep(600);
  const f = await ev(`(function(){var r=document.querySelector(".dl-close__invite").getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width}})()`);
  await clip(`diag-${TAG}-${name}-tl.png`, { x: f.x, y: f.y, width: 24, height: 24 }, 4);
  await clip(`diag-${TAG}-${name}-tr.png`, { x: f.x + f.w - 24, y: f.y, width: 24, height: 24 }, 4);
  await ev(`document.getElementById("dl-diag").remove()`);
}

writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

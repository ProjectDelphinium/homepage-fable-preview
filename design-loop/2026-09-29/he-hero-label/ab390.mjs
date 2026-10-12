// /home 390 A/B noise probe: two captures of the new markup, two of the restored old markup, pixel diffs via canvas.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9354;
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });
let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {}
  await sleep(200);
}
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

const LINK = "main#top section.dl-hero .dl-hero__actions a.dl-link";
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Page.navigate", { url: BASE + "/home" });
for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
await sleep(3000);
await ev(`document.querySelector(${JSON.stringify(LINK)}).scrollIntoView({block:"center"})`);
await sleep(800);
const clip = async () => {
  const r = await ev(`(function(){var b=document.querySelector(${JSON.stringify(LINK)}).getBoundingClientRect();return {x:b.left+scrollX-4,y:b.top+scrollY-4,w:b.width+8,h:b.height+8}})()`);
  return (await send("Page.captureScreenshot", { format: "png", clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } })).data;
};
const geo = () => ev(`(function(){var a=document.querySelector(${JSON.stringify(LINK)}),b=a.getBoundingClientRect(),i=a.querySelector(".dl-link__icon").getBoundingClientRect();return {x:b.left,y:b.top+scrollY,w:b.width,h:b.height,iconX:i.left}})()`);
const a1 = await clip(); await sleep(500); const a2 = await clip(); const ga = await geo();
await ev(`(function(){var a=document.querySelector(${JSON.stringify(LINK)});var i=a.querySelector(".dl-link__icon");a.textContent="";a.appendChild(document.createTextNode("\\n            "));a.appendChild(i);a.appendChild(document.createTextNode("\\n            Watch: Online learning, elevated\\n          "));})()`);
await sleep(500);
const b1 = await clip(); await sleep(500); const b2 = await clip(); const gb = await geo();
writeFileSync(join(OUT, "ab-home-390-new.png"), Buffer.from(a1, "base64"));
writeFileSync(join(OUT, "ab-home-390-old.png"), Buffer.from(b1, "base64"));
const diff = await ev(`(async function(){
  async function px(d){var im=new Image();im.src="data:image/png;base64,"+d;await im.decode();var c=document.createElement("canvas");c.width=im.width;c.height=im.height;var x=c.getContext("2d");x.drawImage(im,0,0);return x.getImageData(0,0,c.width,c.height)}
  function cmp(p,q){if(p.width!==q.width||p.height!==q.height)return {size:[p.width,p.height,q.width,q.height]};var n=0,mx=0;for(var i=0;i<p.data.length;i++){var d=Math.abs(p.data[i]-q.data[i]);if(d){n++;if(d>mx)mx=d}}return {diffChannels:n,maxDelta:mx,size:[p.width,p.height]}}
  var A1=await px(${JSON.stringify(a1)}),A2=await px(${JSON.stringify(a2)}),B1=await px(${JSON.stringify(b1)}),B2=await px(${JSON.stringify(b2)});
  return {newVsNew:cmp(A1,A2),oldVsOld:cmp(B1,B2),newVsOld:cmp(A1,B1)};
})()`);
console.log(JSON.stringify({ geoNew: ga, geoOld: gb, diff }, null, 1));
ws.close(); edge.kill(); process.exit(0);

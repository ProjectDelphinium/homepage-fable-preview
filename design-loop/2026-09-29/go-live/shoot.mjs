// Headless Edge over CDP: confirm no draft banner and no top gap on /home and /highered.
// Usage: node shoot.mjs   (needs scripts/preview/live_preview.py on :8767)
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9361;
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

const measure = `(function(){
  var b=getComputedStyle(document.body),h=getComputedStyle(document.documentElement);
  var top=document.querySelector(".dl-top"),r=top?top.getBoundingClientRect():null;
  var first=null;
  for(var el of document.body.children){var cs=getComputedStyle(el);if(cs.display==="none"||cs.visibility==="hidden")continue;var br=el.getBoundingClientRect();if(br.height>0){first={tag:el.tagName,cls:el.className,top:br.top,h:br.height};break;}}
  var draft=[].slice.call(document.querySelectorAll("*")).filter(function(el){var t=(el.className&&el.className.baseVal===undefined?el.className:"")+" "+(el.id||"");return /draft/i.test(t);}).map(function(el){return el.tagName+"."+el.className+"#"+el.id});
  var txt=/DRAFT|not the live site/.test(document.body.innerText);
  var robots=document.querySelector('meta[name="robots"]');
  return {bodyPadTop:b.paddingTop,bodyMarTop:b.marginTop,htmlPadTop:h.paddingTop,htmlMarTop:h.marginTop,
    dlTopY:r&&Math.round(r.top*10)/10,dlTopH:r&&Math.round(r.height),firstVisible:first,draftNodes:draft,draftText:txt,
    robots:robots?robots.content:null,title:document.title};
})()`;

const views = [
  ["/home", "home-1440", 1440, 900],
  ["/home", "home-390", 390, 844],
  ["/highered", "highered-1440", 1440, 900],
  ["/highered", "highered-390", 390, 844],
];
const results = {};
for (const [path, name, w, h] of views) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(1800);
  await ev("scrollTo(0,0)");
  await sleep(300);
  results[name] = await ev(measure);
  console.log(name, JSON.stringify(results[name]));
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, `${name}-top.png`), Buffer.from(data, "base64"));
}
writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

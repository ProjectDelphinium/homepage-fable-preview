// Headless Edge over CDP: HE study-card context (UVU line removed) on /highered; /home Davis card unchanged.
// Usage: node shoot.mjs <label>   (e.g. before | after)
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const LABEL = process.argv[2] || "after";
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
const consoleErrors = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Runtime.exceptionThrown") consoleErrors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") consoleErrors.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
  if (m.method === "Log.entryAdded" && m.params.entry.level === "error") consoleErrors.push(m.params.entry.text + " " + (m.params.entry.url || ""));
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id;
  const t = setTimeout(() => { pending.delete(i); rej(new Error(method + ": timed out")); }, 20000);
  pending.set(i, (m) => { clearTimeout(t); m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result); });
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };

await send("Runtime.enable");
await send("Log.enable");

async function load(path, width, height, mobile) {
  consoleErrors.length = 0;
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
  await ev(`(function(){document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.querySelector(".dl-proof__result--davis").scrollIntoView({block:"center"});})()`);
  await sleep(900);
}

async function shot(sel, name, pad = 24) {
  const r = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:Math.max(0,b.left+scrollX-${pad}),y:b.top+scrollY-${pad},w:Math.min(innerWidth,b.width+${pad * 2}),h:b.height+${pad * 2}}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

const state = `(function(){
  var card=document.querySelector(".dl-proof__result--davis"),he=card.querySelector(".dl-proof__he-ctx"),dv=card.querySelector(".dl-card__ctx:not(.dl-proof__he-ctx)");
  function vis(el){return el&&getComputedStyle(el).display!=="none"}
  var shown=vis(he)?he:dv, sb=shown.getBoundingClientRect(), cs=getComputedStyle(shown);
  var first=shown.firstElementChild||shown, fr=first.getBoundingClientRect();
  var range=document.createRange(); range.selectNodeContents(shown.querySelector("li")||shown); var tr=range.getClientRects()[0];
  return {
    path:location.pathname, html:document.documentElement.className,
    kicker:card.querySelector("#proof-study-heading").textContent,
    heCtxChildren:he?[].map.call(he.children,function(c){return c.tagName+"."+c.className}):null,
    heCtxText:he?he.innerText.replace(/\\s+/g," ").trim():null, heCtxDisplay:he?getComputedStyle(he).display:null,
    davisCtxDisplay:dv?getComputedStyle(dv).display:null, davisCtxText:dv?dv.innerText:null,
    uvuParaPresent:!!(he&&[].some.call(he.querySelectorAll("p"),function(p){return /Utah Valley University\\./.test(p.textContent)})),
    outcomesPresent:!!card.querySelector(".dl-proof__outcomes"),
    shownBorderTop:cs.borderTopWidth+" "+cs.borderTopStyle, shownPaddingTop:cs.paddingTop,
    firstChild:first.tagName, firstChildMarginTop:getComputedStyle(first).marginTop,
    dividerToFirstBox:Math.round((fr.top-sb.top)*10)/10, dividerToText:tr?Math.round((tr.top-sb.top)*10)/10:null,
    ctxH:Math.round(sb.height), cardW:Math.round(card.getBoundingClientRect().width), cardH:Math.round(card.getBoundingClientRect().height),
    overflowX:document.documentElement.scrollWidth>innerWidth
  };})()`;

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  for (const path of ["/highered", "/home"]) {
    await load(path, w, h, mob);
    const name = path.slice(1);
    log(`${name} ${tag}`, await ev(state));
    log(`${name} ${tag} console errors`, [...consoleErrors]);
    await shot(".dl-proof__result--davis", `${LABEL}-${name}-${tag}-study-card.png`);
  }
}

writeFileSync(join(OUT, `${LABEL}.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

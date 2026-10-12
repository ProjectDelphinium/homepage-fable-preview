// Headless Edge over CDP: HE proof results grid re-layout (/highered), with /home pixel check.
// Usage: node shoot.mjs <label>   (label prefixes screenshots and the JSON file, e.g. "before" / "after")
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const LABEL = process.argv[2] || "after";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9351;
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
const consoleErrors = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Runtime.exceptionThrown") consoleErrors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") consoleErrors.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
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

async function load(path, width, height, mobile) {
  consoleErrors.length = 0;
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
  await ev(`(function(){document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.querySelector(".dl-proof__results").scrollIntoView({block:"center"});})()`);
  await ev(`document.fonts.ready.then(function(){return 1})`);
  await sleep(1200);
}

async function shot(sel, name, pad = 24) {
  await ev(`[].forEach.call(document.querySelectorAll("body *"),function(e){var p=getComputedStyle(e).position;if(p==="fixed"||p==="sticky")e.style.visibility="hidden"})`);
  const r = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:Math.max(0,b.left+scrollX-${pad}),y:b.top+scrollY-${pad},w:Math.min(innerWidth,b.width+${pad * 2}),h:b.height+${pad * 2}}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  const buf = Buffer.from(data, "base64");
  writeFileSync(join(OUT, name), buf);
  return createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

const state = `(function(){
  var grid=document.querySelector(".dl-proof__results"),g=grid.getBoundingClientRect();
  var r=function(el){if(!el)return null;var b=el.getBoundingClientRect();return {x:Math.round(b.left-g.left),y:Math.round(b.top-g.top),w:Math.round(b.width),h:Math.round(b.height),bottom:Math.round(b.bottom-g.top)}};
  var vis=function(el){return el&&getComputedStyle(el).display!=="none"};
  var q=function(s){return grid.querySelector(s)};
  var slack=function(card){if(!vis(card))return null;var cs=getComputedStyle(card),kids=[].filter.call(card.children,vis);
    var last=Math.max.apply(null,kids.map(function(k){return k.getBoundingClientRect().bottom}));
    return Math.round(card.getBoundingClientRect().bottom-parseFloat(cs.paddingBottom)-last)};
  var cards=[].filter.call(grid.children,vis).map(function(c){var cs=getComputedStyle(c);
    return Object.assign({cls:c.className.replace(/dl-card |dl-proof__result |dl-reveal|is-in/g,"").trim(),display:cs.display,
      bg:cs.backgroundColor,border:cs.borderTopColor,radius:cs.borderTopLeftRadius,slackBottom:slack(c)},r(c))});
  var davis=q(".dl-proof__result--davis"),mot=q(".dl-proof__result--motivation"),fun=q(".dl-proof__result--fun"),out=q(".dl-proof__result--outcomes");
  var kids=[].filter.call(davis.querySelectorAll(".dl-proof__davis > *, .dl-card__kicker"),vis);
  var contentBottom=Math.max.apply(null,kids.map(function(k){return k.getBoundingClientRect().bottom}));
  var punch=davis.querySelector(".dl-proof__study-punch").getBoundingClientRect();
  var cols=null;
  if(vis(out)){
    var lis=[].map.call(out.querySelectorAll("li"),function(li){var cs=getComputedStyle(li),b=li.querySelector("b").getBoundingClientRect(),t=li.querySelector(":scope > span").getBoundingClientRect(),lb=li.getBoundingClientRect();
      return {x:Math.round(lb.left-g.left),y:Math.round(lb.top-g.top),w:Math.round(lb.width),h:Math.round(lb.height),contentW:Math.round(lb.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-parseFloat(cs.borderLeftWidth)),
        pinL:cs.borderLeftWidth+" "+cs.borderLeftStyle+" "+cs.borderLeftColor,pinT:cs.borderTopWidth,
        numTop:Math.round(b.top-g.top),numBottom:Math.round(b.bottom-g.top),numSize:getComputedStyle(li.querySelector("b")).fontSize,
        labelTop:Math.round(t.top-g.top),labelLines:Math.round(t.height/parseFloat(getComputedStyle(li).lineHeight)),numAboveLabel:t.top>=b.bottom-1}});
    cols={lis:lis,kicker:r(out.querySelector(".dl-card__kicker"))};
  }
  var over=[].filter.call(grid.querySelectorAll("*"),function(e){return e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflowX!=="visible"}).length;
  var order=cards.slice().sort(function(a,b){return a.y-b.y||a.x-b.x}).map(function(c){return c.cls.replace("dl-proof__result--","")});
  var bal=vis(mot)&&vis(fun)?{davisTop:r(davis).y,motTop:r(mot).y,davisBottom:r(davis).bottom,funBottom:r(fun).bottom,
    topDelta:r(mot).y-r(davis).y,bottomDelta:r(fun).bottom-r(davis).bottom}:null;
  return {path:location.pathname,gridW:Math.round(g.width),gridH:Math.round(g.height),gridCols:getComputedStyle(grid).gridTemplateColumns,order:order,cards:cards,
    balance:bal,davisHole:Math.round(punch.top-contentBottom),outcomes:cols,
    overflowX:document.documentElement.scrollWidth>innerWidth,clippedEls:over,emDash:/\\u2014/.test(grid.innerText)};
})()`;

const runs = [
  ["/highered", 1440, 900, false], ["/highered", 1280, 900, false], ["/highered", 1100, 900, false],
  ["/highered", 1040, 900, false], ["/highered", 960, 900, false], ["/highered", 760, 1000, false],
  ["/highered", 390, 844, true],
  ["/home", 1440, 900, false], ["/home", 1100, 900, false], ["/home", 760, 1000, false], ["/home", 390, 844, true],
];
for (const [path, w, h, mob] of runs) {
  await load(path, w, h, mob);
  const name = path.slice(1);
  const s = await ev(state);
  s.sha = await shot(".dl-proof__results", `${LABEL}-${name}-${w}.png`);
  s.consoleErrors = [...consoleErrors];
  log(`${name} ${w}`, s);
}

writeFileSync(join(OUT, `${LABEL}.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

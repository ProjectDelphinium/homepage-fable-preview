// Headless Edge over CDP: measure visible top/bottom spacing per homepage section, plus full-page shots.
// Usage: node measure.mjs <label> [shots]
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const LABEL = process.argv[2] || "before";
const SHOTS = process.argv.includes("shots");
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
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id;
  pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
await send("Fetch.enable", { patterns: [{ urlPattern: "*delphi-me.com/hs-fs/hubfs/*" }] });

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`(async function(){document.querySelectorAll("img[loading=lazy]").forEach(function(i){i.loading="eager"});
    await Promise.all([...document.images].map(function(i){return i.complete?0:new Promise(function(r){i.onload=i.onerror=r;setTimeout(r,8000)})}));
    document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});})()`);
  await sleep(800);
}

// Visible content = text line boxes, replaced elements, and boxes with a painted background/border/shadow.
const MEASURE = `(function(){
  var r2 = function(n){return Math.round(n*10)/10};
  function painted(el, cs){
    if (/^(IMG|SVG|VIDEO|IFRAME|CANVAS|BUTTON|INPUT|PICTURE)$/i.test(el.tagName)) return true;
    var bg = cs.backgroundColor, bi = cs.backgroundImage;
    if ((bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") || (bi && bi !== "none")) return true;
    if (cs.boxShadow && cs.boxShadow !== "none") return true;
    return ["Top","Right","Bottom","Left"].some(function(s){return parseFloat(cs["border"+s+"Width"])>0 && cs["border"+s+"Style"]!=="none"});
  }
  function visible(el){
    for (var e = el; e && e !== document.body; e = e.parentElement){
      var c = getComputedStyle(e);
      if (c.display === "none" || c.visibility === "hidden" || parseFloat(c.opacity) === 0) return false;
    }
    return true;
  }
  function describe(el){
    var s = el.tagName.toLowerCase();
    if (el.id) s += "#" + el.id;
    if (el.classList.length) s += "." + [...el.classList].slice(0,2).join(".");
    return s;
  }
  var main = document.querySelector("main.dl-home");
  var secs = [...main.children].filter(function(s){return s.tagName === "SECTION"});
  var out = [];
  secs.forEach(function(sec, idx){
    var cs = getComputedStyle(sec);
    var row = {idx: idx, cls: [...sec.classList].join(" "), id: sec.id || null, display: cs.display};
    if (cs.display === "none") { out.push(row); return; }
    var sr = sec.getBoundingClientRect();
    var top = Infinity, bot = -Infinity, topEl = null, botEl = null;
    function consider(rect, el){
      if (rect.width < 1 || rect.height < 1) return;
      if (rect.top < top) { top = rect.top; topEl = el; }
      if (rect.bottom > bot) { bot = rect.bottom; botEl = el; }
    }
    var walker = document.createTreeWalker(sec, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    var n;
    while ((n = walker.nextNode())){
      if (n.nodeType === 3){
        if (!n.textContent.trim() || !visible(n.parentElement)) continue;
        var rg = document.createRange(); rg.selectNodeContents(n);
        [...rg.getClientRects()].forEach(function(rc){consider(rc, n.parentElement)});
      } else {
        if (n === sec) continue;
        var c = getComputedStyle(n);
        if (c.position === "absolute" && n.getAttribute("aria-hidden") === "true") continue;
        if (!painted(n, c) || !visible(n)) continue;
        consider(n.getBoundingClientRect(), n);
      }
    }
    var first = sec.querySelector(".dl-wrap") ? sec.querySelector(".dl-wrap").firstElementChild : sec.firstElementChild;
    var fcs = first ? getComputedStyle(first) : null;
    row.bg = cs.backgroundColor;
    row.inlineStyle = sec.getAttribute("style");
    row.height = r2(sr.height);
    row.padTop = r2(parseFloat(cs.paddingTop)); row.padBottom = r2(parseFloat(cs.paddingBottom));
    row.marTop = r2(parseFloat(cs.marginTop)); row.marBottom = r2(parseFloat(cs.marginBottom));
    row.visTop = r2(top - sr.top); row.visBottom = r2(sr.bottom - bot);
    row.firstVisible = topEl ? describe(topEl) : null; row.lastVisible = botEl ? describe(botEl) : null;
    row.firstChild = first ? describe(first) : null;
    row.firstChildMarginTop = fcs ? r2(parseFloat(fcs.marginTop)) : null;
    row.absTop = r2(sr.top + scrollY); row.absBottom = r2(sr.bottom + scrollY);
    row._contentBottomAbs = bot + scrollY; row._contentTopAbs = top + scrollY;
    out.push(row);
  });
  var vis = out.filter(function(r){return r.display !== "none"});
  for (var i = 1; i < vis.length; i++){
    vis[i].gapFromPrev = r2(vis[i]._contentTopAbs - vis[i-1]._contentBottomAbs);
    vis[i].sameBgAsPrev = vis[i].bg === vis[i-1].bg;
    vis[i].sectionGapPx = r2(vis[i].absTop - vis[i-1].absBottom);
  }
  out.forEach(function(r){delete r._contentBottomAbs; delete r._contentTopAbs});
  return out;
})()`;

async function fullShot(name) {
  const h = await ev("Math.ceil(document.documentElement.scrollHeight)");
  const w = await ev("document.documentElement.clientWidth");
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  console.log("shot", name, w, h);
}

const report = {};
for (const path of ["/home", "/highered"]) {
  for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
    await load(path, w, h, mob);
    const key = `${path.slice(1)}-${tag}`;
    report[key] = await ev(MEASURE);
    console.log(key, "ok", report[key].length);
    if (SHOTS) await fullShot(`${LABEL}-${path.slice(1)}-${tag}-full.png`);
  }
}
writeFileSync(join(OUT, `${LABEL}.json`), JSON.stringify(report, null, 1));
ws.close();
edge.kill();
process.exit(0);

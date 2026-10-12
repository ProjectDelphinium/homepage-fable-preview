// Headless Edge over CDP: visible ink gap above vs below every section boundary (hero -> ... -> footer).
// Ink rules: text = cap-top of a line .. its alphabetic baseline (canvas font metrics on Range rects);
// img/svg/button/boxes with a painted background or border = border box (box-shadow ignored);
// inline elements with a background = their fragment boxes. Everything clipped by overflow ancestors.
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
const ev = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 600));
  return r.result.value;
};
await send("Fetch.enable", { patterns: [{ urlPattern: "*delphi-me.com/hs-fs/hubfs/*" }] });

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`(async function(){document.querySelectorAll("img[loading=lazy]").forEach(function(i){i.loading="eager"});
    await Promise.all([...document.images].map(function(i){return i.complete?0:new Promise(function(r){i.onload=i.onerror=r;setTimeout(r,8000)})}));
    await document.fonts.ready;
    var st=document.createElement("style");st.textContent=".dl-reveal{transition:none!important}";document.head.appendChild(st);
    document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});})()`);
  await sleep(900);
}

const MEASURE = `(function(){
  var r1 = function(n){return Math.round(n*10)/10};
  var ctx = document.createElement("canvas").getContext("2d");
  var metricCache = new Map(), mismatch = [];
  function metrics(cs){
    var f = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    if (!metricCache.has(f)){
      ctx.font = f;
      var h = ctx.measureText("H");
      metricCache.set(f, {asc: h.fontBoundingBoxAscent, desc: h.fontBoundingBoxDescent, cap: h.actualBoundingBoxAscent});
    }
    return metricCache.get(f);
  }
  function painted(el, cs){
    if (/^(IMG|SVG|VIDEO|IFRAME|CANVAS|BUTTON|INPUT|PICTURE)$/i.test(el.tagName)) return true;
    var bg = cs.backgroundColor, bi = cs.backgroundImage;
    if ((bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") || (bi && bi !== "none")) return true;
    return ["Top","Right","Bottom","Left"].some(function(s){return parseFloat(cs["border"+s+"Width"])>0 && cs["border"+s+"Style"]!=="none"});
  }
  function visible(el){
    for (var e = el; e && e !== document.body; e = e.parentElement){
      var c = getComputedStyle(e);
      if (c.display === "none" || c.visibility === "hidden" || parseFloat(c.opacity) === 0) return false;
    }
    return true;
  }
  function clipY(el, top, bot){
    for (var e = el.parentElement; e && e !== document.body; e = e.parentElement){
      var c = getComputedStyle(e);
      if (c.overflowY !== "visible" || c.overflow === "clip"){
        var r = e.getBoundingClientRect(); top = Math.max(top, r.top); bot = Math.min(bot, r.bottom);
      }
    }
    return [top, bot];
  }
  function describe(el, txt){
    var s = el.tagName.toLowerCase();
    if (el.id) s += "#" + el.id;
    if (el.classList.length) s += "." + [...el.classList].slice(0,2).join(".");
    if (txt) s += ' "' + txt.trim().slice(0, 28) + '"';
    return s;
  }
  function ink(sec){
    var top = Infinity, bot = -Infinity, topEl = null, botEl = null;
    function consider(t, b, el, w, label){
      if (w <= 1 || b - t <= 1) return;
      var c = clipY(el, t, b); t = c[0]; b = c[1];
      if (b - t <= 0) return;
      if (t < top) { top = t; topEl = label; }
      if (b > bot) { bot = b; botEl = label; }
    }
    var walker = document.createTreeWalker(sec, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT), n;
    while ((n = walker.nextNode())){
      if (n.nodeType === 3){
        var p = n.parentElement;
        if (!n.textContent.trim() || !visible(p)) continue;
        var cs = getComputedStyle(p), m = metrics(cs);
        var rg = document.createRange(); rg.selectNodeContents(n);
        [...rg.getClientRects()].forEach(function(rc){
          if (Math.abs(rc.height - (m.asc + m.desc)) > 1.5 && mismatch.length < 40) mismatch.push(describe(p, n.textContent) + " h=" + r1(rc.height) + " m=" + r1(m.asc + m.desc));
          var base = rc.top + m.asc * rc.height / (m.asc + m.desc);
          consider(base - m.cap, base, p, rc.width, describe(p, n.textContent));
        });
      } else {
        if (n === sec) continue;
        var c = getComputedStyle(n);
        if (n.matches(".dl-punch__key, .dl-hero__engage, .dl-close__key") && visible(n)){
          // Highlighter stroke is a ::before at top 0.42em / bottom 0.08em of the key box.
          var kr = n.getBoundingClientRect(), fs = parseFloat(c.fontSize);
          consider(kr.top + 0.42 * fs, kr.bottom - 0.08 * fs, n, kr.width, describe(n) + "::before");
        }
        if (c.position === "absolute" && n.getAttribute("aria-hidden") === "true") continue;
        if (!painted(n, c) || !visible(n)) continue;
        // CT detail PNG is scaled 1.111 inside its white wrap; the overhang is transparent (checked in probe-*.png), so the wrap is the ink.
        if (n.matches("#product .dl-prod__detail")) continue;
        if (c.display === "inline"){
          [...n.getClientRects()].forEach(function(rc){consider(rc.top, rc.bottom, n, rc.width, describe(n))});
        } else {
          var r = n.getBoundingClientRect(), t = r.top, b = r.bottom;
          var ci = /^inset\\(([^)]*)\\)/.exec(c.clipPath);
          if (ci){
            var parts = ci[1].split(" round ")[0].trim().split(/\\s+/);
            var it = parts[0], ib = parts[2] || parts[0];
            var px = function(v){return v.endsWith("%") ? parseFloat(v) / 100 * n.offsetHeight : parseFloat(v)};
            var sc = c.transform && c.transform !== "none" ? new DOMMatrix(c.transform).d : 1;
            t += px(it) * sc; b -= px(ib) * sc;
          }
          consider(t, b, n, r.width, describe(n));
        }
      }
    }
    return {top: top, bot: bot, topEl: topEl, botEl: botEl};
  }
  var secs = [...document.querySelector("main.dl-home").children].filter(function(s){return s.tagName === "SECTION"});
  secs.push(document.querySelector("footer.dl-footer"));
  var rows = [];
  secs.forEach(function(sec){
    var cs = getComputedStyle(sec);
    if (cs.display === "none") return;
    var sr = sec.getBoundingClientRect(), k = ink(sec);
    var bg = cs.backgroundColor === "rgba(0, 0, 0, 0)" ? getComputedStyle(document.body).backgroundColor : cs.backgroundColor;
    rows.push({name: sec.id || [...sec.classList].filter(function(c){return c !== "dl-section"})[0], bg: bg,
      top: sr.top, bottom: sr.bottom, padTop: parseFloat(cs.paddingTop), padBottom: parseFloat(cs.paddingBottom), ink: k});
  });
  var out = [];
  for (var i = 1; i < rows.length; i++){
    var a = rows[i-1], b = rows[i];
    var above = b.top - a.ink.bot, below = b.ink.top - b.top;
    out.push({boundary: a.name + " > " + b.name, sameBg: a.bg === b.bg, seam: r1(b.top - a.bottom),
      padAbove: r1(a.padBottom), padBelow: r1(b.padTop),
      gapAbove: r1(above), gapBelow: r1(below), diff: r1(below - above), total: r1(above + below),
      lastInk: a.ink.botEl, firstInk: b.ink.topEl, y: Math.round(b.top + scrollY)});
  }
  return {boundaries: out, metricMismatches: mismatch};
})()`;

async function clip(name, y, w, h) {
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: Math.max(0, y), width: w, height: h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
}

const report = {};
for (const path of ["/home", "/highered"]) {
  for (const [w, h, mob] of [[1440, 900, false], [1100, 800, false], [1024, 800, false], [390, 844, true]]) {
    await load(path, w, h, mob);
    const key = `${path.slice(1)}-${w}`;
    const r = await ev(MEASURE);
    report[key] = r;
    const worst = Math.max(...r.boundaries.map((b) => Math.abs(b.diff)));
    console.log(key, "boundaries", r.boundaries.length, "worst |diff|", worst, "metric mismatches", r.metricMismatches.length);
    if (SHOTS) {
      const mk = r.boundaries.find((b) => b.boundary === "makeover > engagement");
      if (mk && (w === 1024 || w === 1100 || w === 390)) await clip(`${LABEL}-${key}-mk-eb.png`, mk.y - 260, w, 520);
      if (w === 1440 || w === 390) {
        const H = await ev("Math.ceil(document.documentElement.scrollHeight)");
        await clip(`${LABEL}-${key}-full.png`, 0, w, H);
      }
    }
  }
}
writeFileSync(join(OUT, `${LABEL}.json`), JSON.stringify(report, null, 1));
ws.close();
edge.kill();
process.exit(0);

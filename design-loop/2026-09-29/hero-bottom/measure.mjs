// Headless Edge over CDP: hero bottom gap vs other sections' bottom gaps, plus header/logo overhang facts.
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
const PORT = 9343;
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
  await sleep(900);
}

// Per section: padding, and DOM gap from the last visible painted box / text line to the section's bottom edge.
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
  var secs = [...document.querySelector("main.dl-home").children].filter(function(s){return s.tagName === "SECTION"});
  var out = [];
  secs.forEach(function(sec){
    var cs = getComputedStyle(sec);
    if (cs.display === "none") return;
    var sr = sec.getBoundingClientRect();
    var top = Infinity, bot = -Infinity;
    function consider(rect){
      if (rect.width < 1 || rect.height < 1) return;
      if (rect.top < top) top = rect.top;
      if (rect.bottom > bot) bot = rect.bottom;
    }
    var walker = document.createTreeWalker(sec, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT), n;
    while ((n = walker.nextNode())){
      if (n.nodeType === 3){
        if (!n.textContent.trim() || !visible(n.parentElement)) continue;
        var rg = document.createRange(); rg.selectNodeContents(n);
        [...rg.getClientRects()].forEach(consider);
      } else {
        var c = getComputedStyle(n);
        if (c.position === "absolute" && n.getAttribute("aria-hidden") === "true") continue;
        if (!painted(n, c) || !visible(n)) continue;
        consider(n.getBoundingClientRect());
      }
    }
    var name = sec.id || [...sec.classList].filter(function(c){return c !== "dl-section"}).join(" ");
    out.push({section: name, bg: cs.backgroundColor, padTop: r2(parseFloat(cs.paddingTop)), padBottom: r2(parseFloat(cs.paddingBottom)),
      visTop: r2(top - sr.top), visBottom: r2(sr.bottom - bot)});
  });
  var hero = document.querySelector(".dl-hero"), cover = hero.querySelector(".dl-cover");
  var hr = hero.getBoundingClientRect(), cr = cover.getBoundingClientRect();
  var next = out[1];
  var extra = {heroTop: r2(hr.top + scrollY), coverToHeroBottom: r2(hr.bottom - cr.bottom),
    coverToNextContent: r2(hr.bottom - cr.bottom + (next ? next.visTop : 0))};
  return {sections: out, hero: extra};
})()`;

// Scroll so hero text sits under the header, then report bar/logo boxes and backgrounds.
const HEADER = `(async function(){
  var r2 = function(n){return Math.round(n*10)/10};
  var lead = document.querySelector(".dl-hero__lead em");
  window.scrollTo(0, lead.getBoundingClientRect().top + scrollY - 70);
  await new Promise(function(r){setTimeout(r, 300)});
  var top = document.querySelector(".dl-top"), nav = document.querySelector(".dl-nav"), logo = document.querySelector(".dl-nav__logo");
  var tc = getComputedStyle(top), nc = getComputedStyle(nav), lc = getComputedStyle(logo);
  var nr = nav.getBoundingClientRect(), lr = logo.getBoundingClientRect(), er = lead.getBoundingClientRect();
  return {scrollY: Math.round(scrollY), topBg: tc.backgroundColor, topPosition: tc.position,
    navBg: nc.backgroundColor, navBackdrop: nc.backdropFilter || nc.webkitBackdropFilter, navBottom: r2(nr.bottom),
    logoBg: lc.backgroundColor, logoTop: r2(lr.top), logoBottom: r2(lr.bottom),
    leadEmTop: r2(er.top), leadEmBottom: r2(er.bottom)};
})()`;

const report = {};
for (const path of ["/home", "/highered"]) {
  for (const [w, h, mob] of [[1440, 900, false], [1100, 800, false], [390, 844, true]]) {
    await load(path, w, h, mob);
    const key = `${path.slice(1)}-${w}`;
    report[key] = await ev(MEASURE);
    if (path === "/home" && w !== 390) report[key].header = await ev(HEADER);
    if (SHOTS) {
      await ev("window.scrollTo(0,0)");
      const y = await ev(`Math.round(document.querySelector(".dl-cover").getBoundingClientRect().top + scrollY - 40)`);
      const hh = await ev(`Math.round([...document.querySelectorAll("main.dl-home > section")].filter(function(s){return getComputedStyle(s).display !== "none"})[1].getBoundingClientRect().top + scrollY + 180) - ${y}`);
      const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y, width: w, height: hh, scale: 1 } });
      writeFileSync(join(OUT, `${LABEL}-${key}-hero-bottom.png`), Buffer.from(data, "base64"));
    }
    console.log(key, "hero cover->edge", report[key].hero.coverToHeroBottom, "| hero pad", report[key].sections[0].padBottom);
  }
}
writeFileSync(join(OUT, `${LABEL}.json`), JSON.stringify(report, null, 1));
ws.close();
edge.kill();
process.exit(0);

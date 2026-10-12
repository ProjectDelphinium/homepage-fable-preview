// Headless Edge over CDP: footer top spacing + alignment on /home and /highered. Usage: node shoot.mjs [tag]
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const TAG = process.argv[2] || "after";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9351;
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

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
}

// Glyph top of a single-line text element: baseline from font metrics, minus the ink ascent of its text.
const measure = `(function(){
  var f=document.querySelector("footer.dl-footer"); f.scrollIntoView({block:"center"});
  var R=function(v){return Math.round(v*10)/10};
  var box=function(el){var b=el.getBoundingClientRect();return {left:R(b.left),top:R(b.top),right:R(b.right),bottom:R(b.bottom),w:R(b.width),h:R(b.height)}};
  var cv=document.createElement("canvas").getContext("2d");
  var glyphTop=function(el){
    var cs=getComputedStyle(el), b=el.getBoundingClientRect();
    cv.font=cs.fontWeight+" "+cs.fontSize+" "+cs.fontFamily;
    var txt=cs.textTransform==="uppercase"?el.textContent.trim().toUpperCase():el.textContent.trim();
    var m=cv.measureText(txt), lh=parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.2;
    if(/start|both/.test(cs.textBoxTrim||"")&&/cap/.test(cs.textBoxEdge||""))return R(b.top);
    var base=b.top+(lh-(m.fontBoundingBoxAscent+m.fontBoundingBoxDescent))/2+m.fontBoundingBoxAscent;
    return R(base-m.actualBoundingBoxAscent);
  };
  var fb=f.getBoundingClientRect(), grid=document.querySelector(".dl-footer__grid"), gb=grid.getBoundingClientRect();
  var logo=document.querySelector(".dl-footer__logo"), svg=logo.querySelector("svg"), tag=document.querySelector(".dl-footer__tag");
  var hs=[].slice.call(document.querySelectorAll(".dl-footer__h"));
  var bot=document.querySelector(".dl-footer__bottom"), bb=bot.getBoundingClientRect(), bp=bot.querySelector("p").getBoundingClientRect();
  var prev=f.previousElementSibling; while(prev&&getComputedStyle(prev).display==="none")prev=prev.previousElementSibling;
  return {vw:innerWidth,scrollW:document.documentElement.scrollWidth,overflowX:document.documentElement.scrollWidth>innerWidth,
    footerPadTop:getComputedStyle(f).paddingTop,footerMarginTop:getComputedStyle(f).marginTop,
    footerTopToGrid:R(gb.top-fb.top),
    logoMarginLeft:getComputedStyle(logo).marginLeft,
    logo:box(svg),tag:box(tag),tagGlyphTop:null,
    headings:hs.map(function(h){return {text:h.textContent.trim(),left:R(h.getBoundingClientRect().left),boxTop:R(h.getBoundingClientRect().top),boxH:R(h.getBoundingClientRect().height),trim:getComputedStyle(h).textBoxTrim+" / "+getComputedStyle(h).textBoxEdge,linksTop:R(h.nextElementSibling.getBoundingClientRect().top-h.getBoundingClientRect().top),glyphTop:glyphTop(h)}}),
    logoTopVsHeadingGlyph:hs.map(function(h){return R(glyphTop(h)-svg.getBoundingClientRect().top)}),
    gridToDivider:R(bb.top-gb.bottom),dividerToFooterBottom:R(fb.bottom-bb.top),copyrightToFooterBottom:R(fb.bottom-bp.bottom),
    footerH:R(fb.height),gridH:R(gb.height),prevEl:prev?(prev.tagName+"."+prev.className).slice(0,60):null};
})()`;

async function shot(name, above) {
  await sleep(500);
  const r = await ev(`(function(){var b=document.querySelector("footer.dl-footer").getBoundingClientRect();return {y:b.top+scrollY,w:innerWidth,h:b.height}})()`);
  const y = Math.max(0, r.y - above);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y, width: r.w, height: r.h + (r.y - y), scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
}

const results = {};
for (const path of ["/home", "/highered"]) {
  for (const [w, h, mob] of [[1440, 900, false], [1097, 900, false], [760, 900, false], [390, 844, true]]) {
    await load(path, w, h, mob);
    const m = await ev(measure);
    const name = `${TAG}-${path.slice(1)}-${w}-footer.png`;
    await shot(name, 80);
    results[`${path} ${w}`] = { shot: name, ...m };
    console.log(path, w, JSON.stringify({ pad: m.footerPadTop, topToGrid: m.footerTopToGrid, overflow: m.overflowX, logoLeft: m.logo.left, tagLeft: m.tag.left, logoTopVsH: m.logoTopVsHeadingGlyph, gridToDivider: m.gridToDivider, copyToBottom: m.copyrightToFooterBottom }));
  }
}

writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

// Headless Edge over CDP: screenshots + DOM checks for the header audience toggle.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9338;
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
const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };

async function waitLoad() {
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(700);
}
async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  await waitLoad();
}
async function shotClip(name, clip) {
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { ...clip, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}
async function shotView(name) {
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}
async function click(sel) {
  const [x, y] = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}
async function tab(n = 1) {
  for (let i = 0; i < n; i++) {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await sleep(80);
  }
}

const toggleState = `(function(){
  function info(root){ if(!root) return null; var cs=getComputedStyle(root), lab=root.querySelector(".dl-aud__label");
    return { shown: cs.display!=="none" && root.getBoundingClientRect().width>0,
      label: lab ? getComputedStyle(lab).display!=="none" : null,
      opts: [].map.call(root.querySelectorAll(".dl-aud__opt"), function(a){ var b=a.getBoundingClientRect(), s=getComputedStyle(a);
        return { text:a.textContent, href:a.getAttribute("href"), current:a.getAttribute("aria-current"), w:Math.round(b.width), h:Math.round(b.height), bg:s.backgroundColor }; }) }; }
  return { path: location.pathname, html: document.documentElement.className,
    bar: info(document.querySelector(".dl-nav > .dl-aud")), menu: info(document.querySelector(".dl-mnav__aud")),
    higherEdNavLink: !!document.querySelector('.dl-nav__links a[href*="highered"], .dl-mnav__list a[href*="highered"]'),
    overflowX: document.documentElement.scrollWidth > innerWidth };
})()`;

const headState = `(function(){
  function c(s){ var e=document.querySelector(s); return e ? e.getAttribute("content") : null; }
  var lds=[].map.call(document.querySelectorAll('script[type="application/ld+json"]'), function(s){ try { var g=JSON.parse(s.textContent); return (g["@graph"]||[g]).map(function(n){return n["@type"]}).join("+"); } catch(e){ return "PARSE ERROR"; } });
  return { title: document.title, titles: document.querySelectorAll("title").length, descs: [].map.call(document.querySelectorAll('meta[name="description"]'), function(m){return m.content}),
    ogTitle: c('meta[property="og:title"]'), ogDesc: c('meta[property="og:description"]'), ogUrl: c('meta[property="og:url"]'), ogImage: c('meta[property="og:image"]'),
    twCard: c('meta[name="twitter:card"]'), canonical: (document.querySelector('link[rel="canonical"]')||{}).href || null, jsonld: lds, h1: document.querySelectorAll("h1").length };
})()`;

const intact = `(function(){
  var t=document.getElementById("dl-logos-toggle"), secs=[].slice.call(document.querySelectorAll("main.dl-home > .dl-section")).filter(function(s){return getComputedStyle(s).display!=="none"});
  var pads={}; secs.forEach(function(s){ var cs=getComputedStyle(s); var k=cs.paddingTop+"/"+cs.paddingBottom; pads[k]=(pads[k]||0)+1; });
  return { pauseBtn: t ? { shown: getComputedStyle(t).display!=="none" || !!t.closest("[hidden]"), label: t.getAttribute("aria-label") } : null, sectionPads: pads };
})()`;

// 1440: /home header, head tags, click Higher Ed
await load("/home", 1440, 900, false);
log("1440 /home toggle", await ev(toggleState));
log("1440 /home head", await ev(headState));
log("1440 /home intact", await ev(intact));
await shotClip("home-1440-header.png", { x: 0, y: 0, width: 1440, height: 170 });
await shotView("home-1440-view.png");
await click(".dl-nav > .dl-aud .dl-aud__opt[href='/highered']");
await sleep(300); await waitLoad();
log("1440 after clicking Higher Ed", await ev(toggleState));
log("1440 /highered head", await ev(headState));
log("1440 /highered intact", await ev(intact));
await shotClip("highered-1440-header.png", { x: 0, y: 0, width: 1440, height: 170 });
await shotView("highered-1440-view.png");

// keyboard focus ring on the bar toggle (skip link, logo, then K-12)
await tab(3);
log("1440 focus after 3 tabs", await ev(`(function(){var a=document.activeElement,s=getComputedStyle(a);return {text:a.textContent.trim(),cls:a.className,focusVisible:a.matches(":focus-visible"),outline:s.outlineStyle+" "+s.outlineWidth+" "+s.outlineColor}})()`));
await shotClip("highered-1440-focus-k12.png", { x: 0, y: 0, width: 900, height: 120 });
await click(".dl-nav > .dl-aud .dl-aud__opt[href='/']");
await sleep(300); await waitLoad();
log("1440 after clicking K-12", await ev(toggleState));

// label breakpoints
for (const w of [1280, 1080, 1024, 980, 900, 800, 760, 720, 719]) {
  await load("/home", w, 900, false);
  const s = await ev(toggleState);
  log(`${w} bar`, { shown: s.bar.shown, label: s.bar.label, overflowX: s.overflowX, menuShown: s.menu.shown });
  if ([1024, 800, 760].includes(w)) await shotClip(`home-${w}-header.png`, { x: 0, y: 0, width: w, height: 130 });
}

// logos strip with the pause button (K-12 only)
await load("/home", 1440, 900, false);
await ev(`(function(){var s=document.getElementById("customers");s.scrollIntoView({block:"center"});s.querySelectorAll("img").forEach(function(i){i.loading="eager"});document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});})()`);
await sleep(1200);
const r = await ev(`(function(){var b=document.getElementById("customers").getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,width:b.width,height:b.height}})()`);
await shotClip("home-1440-logos-pause.png", r);

// 390: bar, open menu, toggle in menu, click Higher Ed in menu
for (const path of ["/home", "/highered"]) {
  await load(path, 390, 844, true);
  const tag = path === "/home" ? "home" : "highered";
  log(`390 ${path} toggle (menu closed)`, await ev(toggleState));
  log(`390 ${path} head`, await ev(headState));
  await shotView(`${tag}-390-view.png`);
  await click("#dl-mnav-btn");
  await sleep(500);
  log(`390 ${path} toggle (menu open)`, await ev(toggleState));
  await shotView(`${tag}-390-menu.png`);
}
await click(".dl-mnav__aud .dl-aud__opt[href='/']");
await sleep(300); await waitLoad();
log("390 after clicking K-12 in menu", await ev(toggleState));
await click("#dl-mnav-btn");
await sleep(400);
await tab(1);
log("390 focus in open menu", await ev(`(function(){var a=document.activeElement,s=getComputedStyle(a);return {text:a.textContent.trim(),focusVisible:a.matches(":focus-visible"),outline:s.outlineStyle+" "+s.outlineWidth+" "+s.outlineColor}})()`));
await shotView("home-390-menu-focus.png");

// contact: neither option current
await load("/contact-us", 1440, 900, false);
log("1440 /contact-us toggle", await ev(toggleState));

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

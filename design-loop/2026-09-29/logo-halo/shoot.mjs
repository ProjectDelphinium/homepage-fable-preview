// Headless Edge over CDP: header logo halo, at rest and with hero text scrolled behind the hanging logo.
// Usage: node shoot.mjs before|after
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const TAG = process.argv[2] || "after";
const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9341;
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

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")})`);
  // Trial filter without editing the page: HALO="drop-shadow(...) ..." node shoot.mjs trial
  if (process.env.HALO) await ev(`(function(){var s=document.createElement("style");s.textContent=".dl-nav__logo img{filter:${process.env.HALO} !important}";document.head.appendChild(s)})()`);
  await sleep(900);
}
async function shot(name, width, height) {
  const y = await ev("scrollY");
  const { data } = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y, width, height, scale: 2 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}
// Scroll so the element's top lands at viewport y
async function scrollTo(sel, y) {
  return ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});window.scrollTo({top:0,behavior:"instant"});var t=e.getBoundingClientRect().top+scrollY-${y};window.scrollTo({top:t,behavior:"instant"});var b=e.getBoundingClientRect();return {scrollY:scrollY,top:Math.round(b.top),left:Math.round(b.left)}})()`);
}
const logoState = `(function(){var a=document.querySelector(".dl-nav__logo"),i=a.querySelector("img"),r=i.getBoundingClientRect(),n=document.querySelector(".dl-nav").getBoundingClientRect();
  var clip=[];for(var p=a.parentElement;p&&p!==document.documentElement;p=p.parentElement){var s=getComputedStyle(p);if(s.overflow!=="visible"||s.contain!=="none")clip.push(p.className+":"+s.overflow+"/"+s.contain)}
  return {img:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],navH:Math.round(n.height),imgFilter:getComputedStyle(i).filter,aFilter:getComputedStyle(a).filter,aBg:getComputedStyle(a).backgroundImage,clippingAncestors:clip}})()`;

for (const [path, tag] of [["/home", "home"], ["/highered", "highered"]]) {
  for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
    await load(path, w, h, mobile);
    log(`${tag} ${w} logo`, await ev(logoState));
    const clipW = w === 1440 ? 720 : 390;
    await shot(`${TAG}-${tag}-${w}-rest.png`, clipW, 150);
    // Hero headline under the hanging logo, then the "Just turn it on." line
    log(`${tag} ${w} h1`, await scrollTo(".dl-hero h1", w === 1440 ? 58 : 50));
    await sleep(300);
    await shot(`${TAG}-${tag}-${w}-scrolled-h1.png`, clipW, 150);
    log(`${tag} ${w} em`, await scrollTo(".dl-hero__lead em", w === 1440 ? 78 : 60));
    await sleep(300);
    await shot(`${TAG}-${tag}-${w}-scrolled-lead.png`, clipW, 150);
  }
}

// Focus ring on the logo
await load("/home", 1440, 900, false);
for (let i = 0; i < 2; i++) {
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await sleep(100);
}
log("focus", await ev(`(function(){var a=document.activeElement,s=getComputedStyle(a);return {cls:a.className,focusVisible:a.matches(":focus-visible"),outline:s.outlineStyle+" "+s.outlineWidth+" "+s.outlineColor}})()`));
await shot(`${TAG}-home-1440-logo-focus.png`, 400, 150);

writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

// Headless Edge over CDP: screenshots + DOM checks for the logo pause toggle.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9337;
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
// Source hubfs URLs now 404; the pack serves Zoho copies at /dl28-hubfs-<name>. Screenshot-only redirect.
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

async function load(path, width, height, mobile, reduced = false) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }] });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
}

async function toStrip() {
  await ev(`(function(){var s=document.getElementById("customers");s.scrollIntoView({block:"center"});s.querySelectorAll("img").forEach(function(i){i.loading="eager"});document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});})()`);
  await sleep(1200);
}

async function shot(name) {
  const r = await ev(`(function(){var b=document.getElementById("customers").getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

const state = `(function(){var t=document.getElementById("dl-logos-toggle"),tr=document.querySelector(".dl-logos__track"),cs=getComputedStyle(t),b=t.getBoundingClientRect();return {label:t.getAttribute("aria-label"),title:t.title,text:t.textContent,pressed:t.getAttribute("aria-pressed"),play:getComputedStyle(tr).animationPlayState,anim:getComputedStyle(tr).animationName,display:cs.display,size:[b.width,b.height],color:cs.color,border:cs.borderTopColor,bg:cs.backgroundColor,outline:cs.outlineStyle+" "+cs.outlineWidth+" "+cs.outlineColor,focusVisible:t.matches(":focus-visible")}})()`;

async function mouse(x, y) { await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }); await sleep(150); }
async function center(sel) { return ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()`); }

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  await load("/home", w, h, mob);
  await toStrip();
  await mouse(5, 5);
  log(`${tag} rest`, await ev(state));
  await shot(`k12-logos-${tag}-rest.png`);

  const [vx, vy] = await center(".dl-logos__viewport");
  await mouse(vx, vy);
  log(`${tag} hover viewport`, await ev(state));
  const [bx, by] = await center("#dl-logos-toggle");
  await mouse(bx, by);
  log(`${tag} hover button`, await ev(state));
  await shot(`k12-logos-${tag}-hover-button.png`);

  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: bx, y: by, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: bx, y: by, button: "left", clickCount: 1 });
  await sleep(200);
  await mouse(5, 5);
  log(`${tag} after click`, await ev(state));
  await shot(`k12-logos-${tag}-paused.png`);

  await ev(`document.getElementById("dl-logos-toggle").blur()`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Shift", code: "ShiftLeft", windowsVirtualKeyCode: 16 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Shift", code: "ShiftLeft", windowsVirtualKeyCode: 16 });
  await ev(`document.getElementById("dl-logos-toggle").focus({preventScroll:true})`);
  await ev(`document.getElementById("customers").scrollIntoView({block:"center"})`);
  await sleep(400);
  log(`${tag} keyboard focus (paused)`, await ev(state));
  await shot(`k12-logos-${tag}-focus-paused.png`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  await sleep(200);
  log(`${tag} Enter -> play`, await ev(state));
  await shot(`k12-logos-${tag}-focus-playing.png`);
}

await load("/home", 1440, 900, false, true);
await toStrip();
log("1440 reduced-motion", await ev(state));
await shot("k12-logos-1440-reduced-motion.png");

await load("/highered", 1440, 900, false);
log("highered strip", await ev(`(function(){var s=document.getElementById("customers");return {html:document.documentElement.className,display:s?getComputedStyle(s).display:null}})()`));

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

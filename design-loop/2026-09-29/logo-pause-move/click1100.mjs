// Headless Edge over CDP: logo pause button moved above the marquee (lede row). Screenshots + geometry + click checks.
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

const geom = `(function(){
  var q=function(s){return document.querySelector(s)}, r=function(e){var b=e.getBoundingClientRect();return {t:Math.round(b.top*10)/10,b:Math.round(b.bottom*10)/10,l:Math.round(b.left*10)/10,r:Math.round(b.right*10)/10,h:Math.round(b.height*10)/10}};
  var t=q("#dl-logos-toggle"), lede=q(".dl-logos__lede"), vp=q(".dl-logos__viewport"), logos=q(".dl-logos"), sec=q("#customers"), wrap=q("#customers .dl-wrap");
  var T=r(t), L=r(lede), V=r(vp), G=r(logos), S=r(sec), W=r(wrap);
  var range=document.createRange(); range.selectNodeContents(lede); var lines=range.getClientRects().length;
  return {
    toggleBeforeViewportInDOM: !!(t.compareDocumentPosition(vp) & Node.DOCUMENT_POSITION_FOLLOWING),
    toggleInsideLogos: logos.contains(t),
    toggle:T, lede:L, viewport:V, logos:G, section:S,
    buttonAboveLogos: T.b <= V.t,
    centerDelta: Math.round(((T.t+T.b)/2 - (L.t+L.b)/2)*10)/10,
    buttonRightGapToWrap: Math.round((W.r - T.r)*10)/10,
    overlapsLede: !(T.l >= L.r || T.t >= L.b || T.b <= L.t),
    ledeLines: lines,
    spaceBelowViewportInLogos: Math.round((G.b - V.b)*10)/10,
    sectionPadBottom: getComputedStyle(sec).paddingBottom
  };
})()`;

const state = `(function(){var t=document.getElementById("dl-logos-toggle"),tr=document.querySelector(".dl-logos__track"),cs=getComputedStyle(t);return {label:t.getAttribute("aria-label"),title:t.title,pressed:t.getAttribute("aria-pressed"),paused:document.querySelector(".dl-logos").classList.contains("is-paused"),play:getComputedStyle(tr).animationPlayState,display:cs.display,border:cs.borderTopColor,bg:cs.backgroundColor,outline:cs.outlineStyle+" "+cs.outlineWidth,focusVisible:t.matches(":focus-visible")}})()`;

async function mouse(x, y) { await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }); await sleep(150); }
async function center(sel) { return ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()`); }

for (const w of [1100, 1100, 1440]) {
  await load("/home", w, 800, false);
  await toStrip();
  await ev(`document.documentElement.style.scrollBehavior="auto";document.getElementById("customers").scrollIntoView({block:"center",behavior:"instant"})`);
  let prev = "", same = 0;
  for (let k = 0; k < 40 && same < 4; k++) { const c = JSON.stringify(await center("#dl-logos-toggle")); same = c === prev ? same + 1 : 0; prev = c; await sleep(150); }
  const [bx, by] = await center("#dl-logos-toggle");
  const hit = await ev(`(function(){var e=document.elementFromPoint(${bx},${by});return e&&(e.id||e.className)})()`);
  await mouse(bx, by);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: bx, y: by, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: bx, y: by, button: "left", clickCount: 1 });
  await sleep(250);
  log(`${w} click`, { at: [bx, by], hit, st: await ev(state) });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: bx, y: by, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: bx, y: by, button: "left", clickCount: 1 });
  await sleep(250);
  log(`${w} click2`, await ev(state));
}
ws.close(); edge.kill(); process.exit(0);


// Headless Edge over CDP: hero watch label per path ("Higher Ed" on /highered, "Online learning" on /home).
// Checks visible text, one-line pill, data-title/title, accessible names, modal heading, and /home pixel A/B.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9353;
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  "--autoplay-policy=no-user-gesture-required",
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
let fails = 0;
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };
const check = (name, ok, v) => { if (!ok) fails++; log(`${ok ? "PASS" : "FAIL"} ${name}`, v); };

const LINK = "main#top section.dl-hero .dl-hero__actions a.dl-link";

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(2500);
}
async function shotView(name) {
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}
async function shotClip(sel, pad) {
  const r = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:b.left+scrollX-${pad},y:b.top+scrollY-${pad},w:b.width+${2 * pad},h:b.height+${2 * pad}}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  return data;
}
async function axName(sel) {
  const { root } = await send("DOM.getDocument", { depth: 0 });
  const { nodeId } = await send("DOM.querySelector", { nodeId: root.nodeId, selector: sel });
  if (!nodeId) return null;
  const { nodes } = await send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false });
  const n = nodes[0] || {};
  return { role: n.role && n.role.value, name: n.name && n.name.value, description: n.description && n.description.value };
}
async function click(sel) {
  await ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:"center"})`);
  await sleep(300);
  const [x, y] = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}

const linkState = `(function(){
  var a=document.querySelector(${JSON.stringify(LINK)}), s=getComputedStyle(a), b=a.getBoundingClientRect(), ic=a.querySelector(".dl-link__icon").getBoundingClientRect();
  var tops={}, tw=document.createTreeWalker(a, NodeFilter.SHOW_TEXT), t;
  while((t=tw.nextNode())){ var rg=document.createRange(); rg.selectNodeContents(t); [].forEach.call(rg.getClientRects(),function(r){ if(r.width>1) tops[Math.round(r.top)]=1; }); }
  var acts=a.parentElement.getBoundingClientRect(), btn=a.parentElement.querySelector(".dl-btn").getBoundingClientRect();
  return { html: document.documentElement.className.match(/dl-path-\\w+|dl-he-ready/g),
    innerText: a.innerText.replace(/\\s+/g," ").trim(), yt: a.getAttribute("data-youtube"),
    dataTitle: a.getAttribute("data-title"), title: a.getAttribute("title"),
    box: { w: Math.round(b.width*10)/10, h: Math.round(b.height*10)/10, iconH: Math.round(ic.height*10)/10 },
    textLines: Object.keys(tops).length, whiteSpace: s.whiteSpace, radius: s.borderRadius, border: s.borderTopWidth+" "+s.borderTopStyle+" "+s.borderTopColor,
    sameRowAsButton: Math.abs((b.top+b.height/2)-(btn.top+btn.height/2))<2, fitsRow: b.right<=acts.right+0.5,
    vw: innerWidth, overflowX: document.documentElement.scrollWidth>innerWidth };
})()`;

const modalState = `(function(){
  var m=document.getElementById("dl-modal"), f=m.querySelector("iframe"), t=document.getElementById("dl-modal-title");
  return { open: !m.hidden && getComputedStyle(m).display!=="none", title: t ? t.textContent.trim() : null, iframe: f ? (f.getAttribute("src")||"").replace(/\\?.*/,"") : null, iframeTitle: f ? f.getAttribute("title") : null };
})()`;

const OLD = "Watch: Online learning, elevated";
const HE = "Watch: Higher Ed, elevated";

for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  for (const path of ["/highered", "/home"]) {
    const he = path === "/highered";
    const tag = `${path.slice(1)}-${w}`;
    await load(path, w, h, mobile);
    const st = await ev(linkState);
    log(`${tag} link`, st);
    const want = he ? HE : OLD;
    check(`${tag} visible label`, st.innerText === want, st.innerText);
    check(`${tag} data-title`, st.dataTitle === want, st.dataTitle);
    check(`${tag} title`, st.title === want, st.title);
    check(`${tag} video id`, st.yt === (he ? "9mfMC9jC6lU" : "id9dqfNZsf4"), st.yt);
    check(`${tag} one line`, st.textLines === 1 && st.box.h < st.box.iconH + 20, { lines: st.textLines, box: st.box });
    check(`${tag} no x overflow`, !st.overflowX && st.fitsRow, { overflowX: st.overflowX, fitsRow: st.fitsRow });
    const ax = await axName(LINK);
    log(`${tag} link a11y`, ax);
    check(`${tag} link accessible name`, ax && ax.name === want, ax);

    if (!he) {
      const after = await shotClip("main#top section.dl-hero .dl-hero__actions", 12);
      await ev(`(function(){var a=document.querySelector(${JSON.stringify(LINK)});var i=a.querySelector(".dl-link__icon");a.textContent="";a.appendChild(document.createTextNode("\\n            "));a.appendChild(i);a.appendChild(document.createTextNode("\\n            ${OLD}\\n          "));var s=a.parentElement.querySelector("script");if(s)s.remove();})()`);
      await sleep(300);
      const before = await shotClip("main#top section.dl-hero .dl-hero__actions", 12);
      check(`${tag} pixel-identical to old markup`, after === before, { afterLen: after.length, beforeLen: before.length });
      await load(path, w, h, mobile);
    }

    await ev(`scrollTo(0,0)`);
    await sleep(400);
    await shotView(`${tag}-hero.png`);
    const crop = await shotClip("main#top section.dl-hero .dl-hero__actions", 16);
    writeFileSync(join(OUT, `${tag}-actions.png`), Buffer.from(crop, "base64"));
    log("shot", `${tag}-actions.png`);

    await click(LINK);
    await sleep(2500);
    const ms = await ev(modalState);
    log(`${tag} modal`, ms);
    check(`${tag} modal heading`, ms.open && ms.title === want, ms.title);
    check(`${tag} modal iframe title`, ms.iframeTitle === want, ms.iframeTitle);
    check(`${tag} modal video`, (ms.iframe || "").endsWith(he ? "9mfMC9jC6lU" : "id9dqfNZsf4"), ms.iframe);
    const dax = await axName("#dl-modal .dl-modal__box");
    check(`${tag} dialog accessible name`, dax && dax.name === want, dax);
    await shotView(`${tag}-modal.png`);
  }
}

log("fails", fails);
writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

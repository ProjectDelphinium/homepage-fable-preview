// Headless Edge: open the Schedule a demo modal on /home and /highered, screenshot, measure the frame scroller.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9593;
try { await fetch(`http://127.0.0.1:${PORT}/json`); console.error("port busy"); process.exit(1); } catch {}
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {} await sleep(200); }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
const results = {};
const snap = async (name, clip) => { const { data } = await send("Page.captureScreenshot", clip ? { format: "png", clip: { ...clip, scale: 1 } } : { format: "png" }); writeFileSync(join(OUT, name), Buffer.from(data, "base64")); };
const mouse = async (type, x, y, extra = {}) => send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1, ...extra });
const state = `(function(){var f=document.getElementById('dl-book-frame'),i=f&&f.querySelector('iframe'),fb=f.getBoundingClientRect(),ib=i&&i.getBoundingClientRect(),cs=getComputedStyle(f),ic=i&&getComputedStyle(i);return {modalHidden:document.getElementById('dl-book-modal').hidden,frame:{top:Math.round(fb.top),h:Math.round(fb.height),w:Math.round(fb.width),overflowY:cs.overflowY,scrollTop:f.scrollTop,scrollH:f.scrollHeight,clientH:f.clientHeight,clientW:f.clientWidth,offsetW:f.offsetWidth},iframe:ib&&{topRelFrame:Math.round(ib.top-fb.top),h:Math.round(ib.height),position:ic.position,marginTop:ic.marginTop,src:i.src}}})()`;

for (const path of ["/home", "/highered"]) {
  for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
    const key = `${path.slice(1)}-${tag}`;
    await send("Page.navigate", { url: "about:blank" }); await sleep(200);
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mob ? 2 : 1, mobile: mob });
    await send("Page.navigate", { url: BASE + path });
    for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
    await sleep(800);
    await ev(`window.dlOpenBookings()`);
    for (let i = 0; i < 3; i++) { await sleep(5000); }
    results[key + " open"] = await ev(state);
    await snap(`${key}-open.png`);
    const r = results[key + " open"].frame;
    // wheel over the iframe: does the frame (parent) scroll?
    const cx = Math.round(w / 2), cy = Math.round(r.top + r.h / 2);
    await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: cx, y: cy, deltaX: 0, deltaY: 300 });
    await sleep(900);
    results[key + " after wheel"] = await ev(state);
    await snap(`${key}-scrolled.png`);
    await ev(`document.getElementById('dl-book-frame').scrollTop=0`);
    await sleep(300);
    // click the 30th in the iframe calendar (single-column layout -> time slot step)
    if (path === "/home") {
      const day = mob ? [Math.round(r.w / 2 + 16 + 20), 0] : null;
      results[key + " note"] = "slot step: click date 30 via coordinates from probe (day row y=581 in iframe => y-222 in frame)";
      const fx = await ev(`(function(){var b=document.getElementById('dl-book-frame').getBoundingClientRect();return [b.left,b.top,b.width]})()`);
      // probe: at 358-wide iframe, day 30 at x=179,y=581; wider layouts center the calendar
      const dx = mob ? fx[0] + 179 : 492, dy = mob ? fx[1] + 581 - 222 : 306;
      await mouse("mouseMoved", dx, dy); await mouse("mousePressed", dx, dy); await mouse("mouseReleased", dx, dy);
      await sleep(3000);
      results[key + " slot step"] = await ev(state);
      await snap(`${key}-slot-step.png`);
      await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: cx, y: cy, deltaX: 0, deltaY: 2000 });
      await sleep(900);
      results[key + " slot step bottom"] = await ev(state);
      await snap(`${key}-slot-step-bottom.png`);
    }
  }
}
writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
ws.close(); edge.kill(); process.exit(0);

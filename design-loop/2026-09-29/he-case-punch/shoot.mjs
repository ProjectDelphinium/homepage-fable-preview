// Headless Edge over CDP: HE case punch first line wrap check + /home pixel parity.
// Usage: node shoot.mjs <tag>
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const TAG = process.argv[2] || "run";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9353;
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

await send("Emulation.setScrollbarsHidden", { hidden: true });
await send("Fetch.enable", { patterns: [{ urlPattern: "*delphi-me.com/hs-fs/hubfs/*" }] });
const results = {};

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`document.fonts.ready.then(()=>1)`);
  await ev(`(function(){document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});document.querySelector(".dl-case").scrollIntoView({block:"start"})})()`);
  await sleep(900);
}

async function shot(sel, name) {
  const r = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  return data;
}

// Visible text of an element split into rendered lines (words grouped by line top).
const linesOf = `function linesOf(el){
  var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),n,words=[];
  while((n=w.nextNode())){
    var p=n.parentElement;if(!p.getClientRects().length)continue;
    var re=/\\S+/g,m;while((m=re.exec(n.data))){var r=document.createRange();r.setStart(n,m.index);r.setEnd(n,m.index+m[0].length);var b=r.getClientRects()[0];if(b)words.push({t:m[0],y:Math.round(b.top)})}
  }
  var lines=[];words.forEach(function(x){var l=lines[lines.length-1];if(l&&Math.abs(l.y-x.y)<4){l.w.push(x.t)}else lines.push({y:x.y,w:[x.t]})});
  return lines.map(function(l){return l.w.join(" ")});
}`;

const measure = `(function(){${linesOf}
  var p=document.querySelector(".dl-case__break > p.dl-punch"),s=p.querySelector(".dl-punch__setup"),y=p.querySelector(".dl-punch__payoff");
  var ss=getComputedStyle(s),ps=getComputedStyle(p);
  var sl=linesOf(s),yl=linesOf(y);
  return {setupLines:sl.length,setup:sl,payoffLines:yl.length,payoff:yl,
    setupFont:ss.fontSize,setupWeight:ss.fontWeight,setupStyle:ss.fontStyle,setupColor:ss.color,textWrap:ss.textWrap||ps.textWrap,
    pW:Math.round(p.getBoundingClientRect().width),pH:Math.round(p.getBoundingClientRect().height),
    keyVisible:!!y.querySelector(".dl-punch__key")&&y.querySelector(".dl-punch__key").textContent,
    docOverflow:document.documentElement.scrollWidth>innerWidth}})()`;

const widths = [[1440, 900, false], [1040, 900, false], [760, 1000, false], [390, 844, true]];
for (const [w, h, mob] of widths) {
  await load("/highered", w, h, mob);
  results[`he-${w}`] = await ev(measure);
  await shot(".dl-case__break", `${TAG}-he-${w}.png`);
  console.log(`he-${w}`, JSON.stringify(results[`he-${w}`]));
}

// /home parity: current DOM vs. DOM with the setup restored to the pre-edit markup.
const OLD = '<span class="dk">Three</span><span class="dh">Many</span> crises, one cause: <em class="dl-punch__ital">disengagement</em>.';
for (const [w, h, mob] of widths) {
  await load("/home", w, h, mob);
  results[`home-${w}-lines`] = await ev(measure);
  const a = await shot(".dl-case__break", `${TAG}-home-${w}.png`);
  await sleep(300);
  const ctrl = await shot(".dl-case__break", `${TAG}-home-${w}-control.png`);
  await ev(`(function(){var s=document.querySelector(".dl-case__break > p.dl-punch .dl-punch__setup");s.innerHTML=s.innerHTML;return 1})()`);
  await sleep(300);
  const same = await shot(".dl-case__break", `${TAG}-home-${w}-reassigned.png`);
  await ev(`(function(){document.querySelector(".dl-case__break > p.dl-punch .dl-punch__setup").innerHTML=${JSON.stringify(OLD)};return 1})()`);
  await sleep(300);
  const b = await shot(".dl-case__break", `${TAG}-home-${w}-restored.png`);
  const ALT = '<span class="dk">Three</span><span class="dh">These are the stats that keep us up at night, and the reason we made Delphinium.</span><span class="dk"> crises, one cause: <em class="dl-punch__ital">disengagement</em>.</span>';
  await ev(`(function(){document.querySelector(".dl-case__break > p.dl-punch .dl-punch__setup").innerHTML=${JSON.stringify(ALT)};return 1})()`);
  await sleep(300);
  const alt = await shot(".dl-case__break", `${TAG}-home-${w}-alt.png`);
  console.log(`home-${w}`, "altVsRestored", alt === b);
  results[`home-${w}`] = { control: a === ctrl, reassignedSame: a === same, identical: a === b, reassignedVsRestored: same === b, altVsRestored: alt === b };
  console.log(`home-${w}`, "control", a === ctrl, "reassigned", a === same, "identical", a === b, "reassignedVsRestored", same === b, JSON.stringify(results[`home-${w}-lines`].setup));
}

writeFileSync(join(OUT, `${TAG}-checks.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

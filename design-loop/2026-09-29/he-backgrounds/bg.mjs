// Headless Edge over CDP: top-level sections of main.dl-home (+ footer) with computed backgrounds at 1440,
// including ::before/::after and what is actually painted at the band's left edge (elementsFromPoint).
// Usage: node bg.mjs <label> [shots]
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const LABEL = process.argv[2] || "before";
const SHOTS = process.argv.includes("shots");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9353;
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });
let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {}
  await sleep(200);
}
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 600));
  return r.result.value;
};

const PROBE = `(function(){
  var T = function(c){return !c || c === "rgba(0, 0, 0, 0)" || c === "transparent"};
  var secs = [...document.querySelector("main.dl-home").children].filter(function(s){return s.tagName === "SECTION"});
  secs.push(document.querySelector("footer.dl-footer"));
  return secs.map(function(sec){
    var cs = getComputedStyle(sec), b = getComputedStyle(sec, "::before"), a = getComputedStyle(sec, "::after");
    var r = sec.getBoundingClientRect(), shown = cs.display !== "none" && r.height > 0;
    var painted = [];
    if (shown) [0.08, 0.5, 0.92].forEach(function(f){
      var y = r.top + r.height * f;
      window.scrollTo({left: 0, top: Math.max(0, y + scrollY - innerHeight / 2), behavior: "instant"});
      var yy = sec.getBoundingClientRect().top + r.height * f;
      var hit = document.elementsFromPoint(4, yy).find(function(el){var c = getComputedStyle(el); return !T(c.backgroundColor) || c.backgroundImage !== "none"});
      painted.push(hit ? (hit.tagName.toLowerCase() + (hit.id ? "#" + hit.id : "") + "." + [...hit.classList].slice(0, 2).join(".") + " " + getComputedStyle(hit).backgroundColor) : "none");
    });
    window.scrollTo({left: 0, top: 0, behavior: "instant"});
    var rr = sec.getBoundingClientRect();
    return {top: rr.top + scrollY, name: sec.id || [...sec.classList].filter(function(c){return c !== "dl-section"})[0], cls: sec.className, shown: shown,
      bg: cs.backgroundColor, img: cs.backgroundImage === "none" ? "" : cs.backgroundImage.slice(0, 120),
      borderTop: cs.borderTopWidth + " " + cs.borderTopColor, borderBottom: cs.borderBottomWidth + " " + cs.borderBottomColor,
      before: b.content !== "none" ? (b.backgroundColor + " " + (b.backgroundImage === "none" ? "" : b.backgroundImage.slice(0, 80))) : "",
      after: a.content !== "none" ? (a.backgroundColor + " " + (a.backgroundImage === "none" ? "" : a.backgroundImage.slice(0, 80))) : "",
      h: Math.round(r.height), painted: painted};
  });
})()`;

const report = {};
for (const path of ["/home", "/highered"]) {
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`(async function(){document.querySelectorAll("img[loading=lazy]").forEach(function(i){i.loading="eager"});
    await Promise.all([...document.images].map(function(i){return i.complete?0:new Promise(function(r){i.onload=i.onerror=r;setTimeout(r,8000)})}));
    await document.fonts.ready;
    var st=document.createElement("style");st.textContent=".dl-reveal{transition:none!important}";document.head.appendChild(st);
    document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});})()`);
  await sleep(900);
  const key = path.slice(1);
  report[key] = { body: await ev("getComputedStyle(document.body).backgroundColor"), htmlClass: await ev("document.documentElement.className"), sections: await ev(PROBE) };
  console.log(`\n## ${key}  body=${report[key].body}  html.class="${report[key].htmlClass}"`);
  for (const s of report[key].sections) console.log(`${s.shown ? "  " : "x "}${s.name.padEnd(16)} bg=${s.bg.padEnd(22)} ${s.img ? "img=" + s.img + " " : ""}${s.before ? "::before=" + s.before + " " : ""}${s.after ? "::after=" + s.after + " " : ""}| ${s.painted.join(" | ")}`);
  if (SHOTS) {
    const H = await ev("Math.ceil(document.documentElement.scrollHeight)");
    const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1440, height: H, scale: 1 } });
    writeFileSync(join(OUT, `${LABEL}-${key}-1440-full.png`), Buffer.from(data, "base64"));
  }
}
writeFileSync(join(OUT, `${LABEL}.json`), JSON.stringify(report, null, 1));
ws.close(); edge.kill(); process.exit(0);

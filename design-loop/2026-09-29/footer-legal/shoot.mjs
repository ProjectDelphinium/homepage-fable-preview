// Headless Edge over CDP: footer screenshots + checks after removing the EULA / Purchase agreement line.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(700);
}

const footerState = `(function(){
  var f=document.querySelector("footer.dl-footer"), b=f&&f.querySelector(".dl-footer__bottom");
  var r=b.getBoundingClientRect(), fr=f.getBoundingClientRect(), cs=getComputedStyle(b);
  var ps=[].map.call(b.children,function(c){var cr=c.getBoundingClientRect();return {tag:c.tagName,cls:c.className,text:c.textContent.trim(),h:Math.round(cr.height)}});
  return { path: location.pathname, html: document.documentElement.className,
    legalEls: document.querySelectorAll(".dl-footer__legal").length,
    eulaLinks: [].map.call(document.querySelectorAll('footer a[href*="eula"], footer a[href*="purchase-agreement"]'),function(a){return a.getAttribute("href")}),
    bottom: { display: cs.display, padTop: cs.paddingTop, padBottom: cs.paddingBottom, h: Math.round(r.height), gapBelowToFooterEnd: Math.round(fr.bottom - r.bottom), children: ps },
    overflowX: document.documentElement.scrollWidth > innerWidth };
})()`;

for (const [path, tag] of [["/home", "home"], ["/highered", "highered"]]) {
  for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
    await load(path, w, h, mobile);
    await ev(`document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")})`);
    log(`${w} ${path}`, await ev(footerState));
    const clip = await ev(`(function(){var b=document.querySelector("footer.dl-footer").getBoundingClientRect();return {x:0,y:b.top+scrollY,width:innerWidth,height:b.height}})()`);
    const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { ...clip, scale: 1 } });
    const name = `${tag}-${w}-footer.png`;
    writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
    log("shot", name);
  }
}

writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

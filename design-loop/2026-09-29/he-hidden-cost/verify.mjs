// Headless Edge over CDP: verify the restored Higher Ed "hidden costs" section.
// "?before" requests are fulfilled with the current file minus this restore, so /home can be pixel-compared.
// Usage: node verify.mjs
import { spawn } from "node:child_process";
import { writeFileSync, readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const SRC = join(OUT, "..", "..", "..", "zoho-sites", "homepage-sites-v5.html");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9347;
const BASE = "http://127.0.0.1:8767";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const after = readFileSync(SRC, "utf8");
function makeBefore(html) {
  let h = html
    .replace("    html.dl-path-he .dl-logos-section,", "    html.dl-path-he .dl-case,\n    html.dl-path-he .dl-logos-section,")
    .replace("    @media (min-width: 720px) { html.dl-path-he .dl-case__stats { grid-template-columns: repeat(2, 1fr); } }\n",
      "    /* With the mist Case section gone, the hero and Teach share the paper background: one section gap between them, as with How and Close */\n    html.dl-path-he .dl-teach { padding-top: 0; }\n");
  const a = h.indexOf('<section class="dl-section dl-case"');
  const b = h.indexOf("</section>", a);
  const sec = h.slice(a, b)
    .replace(/<p class="dl-lede"><span class="dk">(.*?)<\/span><span class="dh">.*?<\/span><\/p>/, '<p class="dl-lede">$1</p>')
    .replace(/<span class="dk">([^<]*)<\/span><span class="dh">[^<]*<\/span>/g, "$1")
    .replace('<article class="dl-card dl-k12">', '<article class="dl-card">');
  return h.slice(0, a) + sec + h.slice(b);
}
const before = makeBefore(after);
if (before === after) throw new Error("before == after; reversal did not apply");

const edge = spawn(EDGE, [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars",
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
    const rid = m.params.requestId;
    if (u.startsWith(BASE) && u.includes("?before")) {
      ws.send(JSON.stringify({ id: ++id, method: "Fetch.fulfillRequest", params: {
        requestId: rid, responseCode: 200,
        responseHeaders: [{ name: "Content-Type", value: "text/html; charset=utf-8" }],
        body: Buffer.from(before, "utf8").toString("base64"),
      } }));
      return;
    }
    const params = { requestId: rid };
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
await send("Fetch.enable", { patterns: [{ urlPattern: "*delphi-me.com/hs-fs/hubfs/*" }, { urlPattern: `${BASE}/*` }] });

async function load(url, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`(async function(){document.querySelectorAll("img[loading=lazy]").forEach(function(i){i.loading="eager"});
    await Promise.all([...document.images].map(function(i){return i.complete?0:new Promise(function(r){i.onload=i.onerror=r;setTimeout(r,8000)})}));
    document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});})()`);
  await sleep(900);
}

const INFO = `(function(){
  var r2=function(n){return Math.round(n*10)/10};
  var q=function(s){var e=document.querySelector(s);return e?e.innerText.trim().replace(/\\s+/g," "):null};
  var main=document.querySelector("main.dl-home");
  var secs=[...main.children].filter(function(s){return s.tagName==="SECTION"&&getComputedStyle(s).display!=="none"});
  var seq=secs.map(function(s){var r=s.getBoundingClientRect();var cs=getComputedStyle(s);
    return {cls:[...s.classList].slice(0,2).join("."),id:s.id||null,top:r2(r.top+scrollY),h:r2(r.height),padTop:r2(parseFloat(cs.paddingTop)),padBottom:r2(parseFloat(cs.paddingBottom)),bg:cs.backgroundColor}});
  var cse=document.querySelector(".dl-case");var csv=cse&&getComputedStyle(cse).display!=="none";
  var cards=csv?[...cse.querySelectorAll(".dl-case__stats .dl-card")].filter(function(c){return getComputedStyle(c).display!=="none"}).map(function(c){var r=c.getBoundingClientRect();
    return {text:c.innerText.trim().replace(/\\s+/g," "),x:r2(r.left),w:r2(r.width),h:r2(r.height),overflowX:c.scrollWidth>c.clientWidth}}):[];
  var over=[...document.querySelectorAll(".dl-case *")].filter(function(e){var r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+0.5||r.left<-0.5)}).map(function(e){return e.tagName+"."+e.className});
  return {
    path:location.pathname, cls:document.documentElement.className,
    docOverflowX:document.documentElement.scrollWidth>document.documentElement.clientWidth,
    caseVisible:csv, caseEyebrow:q(".dl-case .dl-eyebrow"), caseH2:q("#case-heading"), caseLede:q(".dl-case .dl-lede"),
    caseCards:cards, casePunch:q(".dl-case .dl-punch"), caseOutOfViewport:over,
    heSwaps:{heroLead:q(".dl-hero__lead"),coverUpto:q(".dl-cover__upto"),coverNum:q(".dl-cover__num"),studyHeading:q("#proof-study-heading"),
      davisNum:q(".dl-proof__davis .dl-card__num"),davisTxt:q(".dl-proof__davis .dl-card__txt"),studyPunch:q(".dl-proof__study-punch"),deployPunch:q(".dl-deploy .dl-punch, section:last-of-type .dl-punch")},
    sections:seq
  };
})()`;

async function shot(name, clip) {
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { ...clip, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  return data;
}
async function fullShot(name) {
  const h = await ev("Math.ceil(document.documentElement.scrollHeight)");
  const w = await ev("document.documentElement.clientWidth");
  return shot(name, { x: 0, y: 0, width: w, height: h });
}
async function caseShot(name) {
  const r = await ev(`(function(){var s=document.querySelector(".dl-case"),p=s.previousElementSibling,n=s.nextElementSibling;
    var a=s.getBoundingClientRect(),t=a.top+scrollY;return {x:0,y:Math.max(0,t-160),width:document.documentElement.clientWidth,height:a.height+320}})()`);
  return shot(name, r);
}

const report = {};
const pixel = {};
for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  for (const variant of ["before", "after"]) {
    for (const path of ["/home", "/highered"]) {
      const url = BASE + path + (variant === "before" ? "?before" : "");
      await load(url, w, h, mob);
      const key = `${variant}-${path.slice(1)}-${tag}`;
      report[key] = await ev(INFO);
      const full = await fullShot(`${key}-full.png`);
      if (path === "/home") pixel[`home-${tag}-${variant}`] = full;
      if (variant === "after" || path === "/home") {
        if (report[key].caseVisible) await caseShot(`${key}-case.png`);
      }
      console.log(key, "caseVisible", report[key].caseVisible, "overflowX", report[key].docOverflowX);
    }
  }
}
report.homePixelIdentical = {
  "1440": pixel["home-1440-before"] === pixel["home-1440-after"],
  "390": pixel["home-390-before"] === pixel["home-390-after"],
};
console.log("home pixel identical", report.homePixelIdentical);
writeFileSync(join(OUT, "verify.json"), JSON.stringify(report, null, 1));
ws.close();
edge.kill();
process.exit(0);

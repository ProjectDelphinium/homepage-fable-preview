// Headless Edge over CDP: computed type for quote-like text on three renders.
//   live51620fc: the 51620fc source, fulfilled in place of the preview HTML (same origin, same assets)
//   branch:      the current source via the local preview on 8767
//   site:        https://www.delphi-me.com (read-only GET)
// Usage: node measure.mjs <label> [shots]
import { spawn, execSync } from "node:child_process";
import { writeFileSync, readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const LABEL = process.argv[2] || "before";
const SHOTS = process.argv.includes("shots");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9347;
const BASE = "http://127.0.0.1:8767";
const REPO = join(OUT, "..", "..", "..");
const LIVE_SRC = execSync("git show 51620fc:zoho-sites/homepage-sites-v5.html", { cwd: REPO, maxBuffer: 64 << 20 }).toString("utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
    if (u.startsWith(BASE) && u.includes("v=live51620fc") && m.params.resourceType === "Document") {
      ws.send(JSON.stringify({ id: ++id, method: "Fetch.fulfillRequest", params: {
        requestId: m.params.requestId, responseCode: 200,
        responseHeaders: [{ name: "Content-Type", value: "text/html; charset=utf-8" }],
        body: Buffer.from(LIVE_SRC, "utf8").toString("base64"),
      } }));
      return;
    }
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
await send("Fetch.enable", { patterns: [{ urlPattern: "*127.0.0.1:8767/*" }, { urlPattern: "*delphi-me.com/hs-fs/hubfs/*" }] });

async function load(url, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url });
  for (let i = 0; i < 100; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`(async function(){document.querySelectorAll("img[loading=lazy]").forEach(function(i){i.loading="eager"});
    await Promise.all([...document.images].map(function(i){return i.complete?0:new Promise(function(r){i.onload=i.onerror=r;setTimeout(r,8000)})}));
    await document.fonts.ready;
    document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});})()`);
  await sleep(1200);
}

const MEASURE = `(function(){
  var sel = "blockquote p, blockquote cite, blockquote cite span, q, .dl-quote-big, .dl-proof__study-punch, .dl-card__ctx, .dl-punch, .dl-define, .dl-hero__lead";
  var out = [];
  document.querySelectorAll(sel).forEach(function(el){
    var cs = getComputedStyle(el);
    for (var e = el; e; e = e.parentElement) { var c = getComputedStyle(e); if (c.display === "none" || c.visibility === "hidden") return; }
    var r = el.getBoundingClientRect();
    if (r.width < 1) return;
    var txt = el.textContent.replace(/\\s+/g, " ").trim();
    out.push({ key: el.tagName.toLowerCase() + "|" + txt.slice(0, 48), cls: el.className || (el.parentElement && el.parentElement.className), fs: cs.fontSize, lh: cs.lineHeight, fw: cs.fontWeight, ff: cs.fontFamily.split(",")[0], w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + scrollY) });
  });
  return { root: getComputedStyle(document.documentElement).fontSize, rows: out };
})()`;

const CLIPS = {
  "ct-quote": "#product .dl-prod__quote blockquote",
  "mk-quotes": ".dl-mk__quotes",
  "cb-quotes": ".dl-cb-quotes",
  "eb-quote": ".dl-eb-quotes",
  "hero-copy": ".dl-hero__lead",
  "davis": ".dl-proof__davis",
};
async function clips(prefix) {
  for (const [name, sel] of Object.entries(CLIPS)) {
    const box = await ev(`(function(){var el=document.querySelector(${JSON.stringify(sel)});if(!el)return null;
      if(${JSON.stringify(name)}==="hero-copy"){var d=document.querySelector(".dl-define");el=el.parentElement;var r=el.getBoundingClientRect();var r2=(d||document.querySelector(".dl-hero__actions")).getBoundingClientRect();return {x:r.left+scrollX-16,y:r.top+scrollY-16,w:r.width+32,h:r2.bottom-r.top+32};}
      var r=el.getBoundingClientRect();return {x:Math.max(0,r.left+scrollX-16),y:r.top+scrollY-16,w:r.width+32,h:r.height+32};})()`);
    if (!box) continue;
    const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: box.x, y: box.y, width: box.w, height: box.h, scale: 1 } });
    writeFileSync(join(OUT, `${prefix}-${name}.png`), Buffer.from(data, "base64"));
  }
}

const SITES = {
  live51620fc: (p) => `${BASE}${p}?v=live51620fc`,
  branch: (p) => `${BASE}${p}`,
  site: (p) => `https://www.delphi-me.com${p}`,
};
const report = {};
for (const [site, url] of Object.entries(SITES)) {
  for (const path of ["/home", "/highered"]) {
    for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
      await load(url(path), w, h, mob);
      const key = `${site}-${path.slice(1)}-${tag}`;
      report[key] = await ev(MEASURE);
      console.log(key, report[key].root, report[key].rows.length);
      if (SHOTS && path === "/home" && LABEL === "after" && site === "branch") await clips(`after-home-${tag}`);
      else if (SHOTS && path === "/home" && LABEL !== "after" && site !== "live51620fc") await clips(`${site === "site" ? "live" : "branch"}-home-${tag}`);
    }
  }
}
writeFileSync(join(OUT, `${LABEL}.json`), JSON.stringify(report, null, 1));
ws.close();
edge.kill();
process.exit(0);

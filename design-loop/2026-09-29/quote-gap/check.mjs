// CT quote gap check: HEAD source (fulfilled in place of the preview HTML) vs the working copy via the preview on :8767.
// Records bullets-to-quote gap, quote vs roster/detail collisions, roster-to-detail overlap, section height. Saves #product shots.
import { spawn, execSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9351;
const BASE = "http://127.0.0.1:8767";
const REPO = join(OUT, "..", "..", "..");
const HEAD_SRC = execSync("git show HEAD:zoho-sites/homepage-sites-v5.html", { cwd: REPO, maxBuffer: 64 << 20 }).toString("utf8");
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
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Fetch.requestPaused") {
    if (m.params.request.url.includes("v=head") && m.params.resourceType === "Document") {
      ws.send(JSON.stringify({ id: ++id, method: "Fetch.fulfillRequest", params: {
        requestId: m.params.requestId, responseCode: 200,
        responseHeaders: [{ name: "Content-Type", value: "text/html; charset=utf-8" }],
        body: Buffer.from(HEAD_SRC, "utf8").toString("base64"),
      } }));
      return;
    }
    ws.send(JSON.stringify({ id: ++id, method: "Fetch.continueRequest", params: { requestId: m.params.requestId } }));
  }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id;
  pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
await send("Fetch.enable", { patterns: [{ urlPattern: "*127.0.0.1:8767/*" }] });

async function load(url, width, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url });
  for (let i = 0; i < 100; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await ev(`(async function(){document.querySelectorAll("img[loading=lazy]").forEach(function(i){i.loading="eager"});
    await Promise.all([...document.images].map(function(i){return i.complete?0:new Promise(function(r){i.onload=i.onerror=r;setTimeout(r,8000)})}));
    await document.fonts.ready;
    document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")});})()`);
  await sleep(900);
}

const MEASURE = `(function(){
  var r = function(el){if(typeof el==="string")el=document.querySelector(el);if(!el)return null;var b=el.getBoundingClientRect();if(!b.height)return null;return {t:Math.round(b.top+scrollY),b:Math.round(b.bottom+scrollY),l:Math.round(b.left),r:Math.round(b.right)}};
  var hit = function(a,b){return !!(a&&b&&a.l<b.r&&b.l<a.r&&a.t<b.b&&b.t<a.b)};
  var list = r("#product .dl-list"), quote = r("#product .dl-prod__quote"), pull = r("#product .dl-prod__quote .dl-pull");
  var media = r("#product .dl-prod__media"), detail = r("#product .dl-prod__detail-wrap");
  return {
    listBottom: list && list.b, quote: quote, pullTop: pull && pull.t,
    gapListToQuote: list && quote ? quote.t - list.b : null,
    quoteHitsList: hit(quote, list), quoteHitsMedia: hit(quote, media), quoteHitsDetail: hit(quote, detail),
    detailLeftMinusQuoteRight: detail && quote ? detail.l - quote.r : null,
    rosterDetailOverlap: media && detail ? media.b - detail.t : null,
    detail: detail, media: media, section: r("#product"),
    docWidth: document.documentElement.scrollWidth,
  };
})()`;

async function shot(name, sel, pad = 24) {
  const box = await ev(`(function(){var el=document.querySelector(${JSON.stringify(sel)});var b=el.getBoundingClientRect();return {y:Math.max(0,b.top+scrollY-${pad}),w:document.documentElement.clientWidth,h:b.height+${pad * 2}}})()`);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: box.y, width: box.w, height: box.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
}

const report = {};
for (const w of [390, 760, 960, 1024, 1180, 1440]) {
  for (const [v, url] of [["head", `${BASE}/home?v=head`], ["work", `${BASE}/home`]]) {
    await load(url, w, w < 700);
    const m = await ev(MEASURE);
    report[`${v}-${w}`] = m;
    await shot(`${v}-ct-${w}.png`, "#product");
    console.log(v, w, "gap", m.gapListToQuote, "hitList", m.quoteHitsList, "hitMedia", m.quoteHitsMedia, "hitDetail", m.quoteHitsDetail,
      "roster/detail overlap", m.rosterDetailOverlap, "section h", m.section.b - m.section.t, "docW", m.docWidth);
  }
}
writeFileSync(join(OUT, "check.json"), JSON.stringify(report, null, 1));
ws.close();
edge.kill();
process.exit(0);

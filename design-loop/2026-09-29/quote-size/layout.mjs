// Layout check for the quote size change: HEAD source (fulfilled in place of the preview HTML) vs the working copy via the preview.
// Records section heights, Control Tower quote position vs copy/detail card, Makeover quote boxes. Saves CT/Makeover shots for the working copy.
import { spawn, execSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9349;
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
const zname = (u) => decodeURIComponent(new URL(u).pathname.split("/").pop()).replace(/ /g, "-").replace(/[^A-Za-z0-9._-]/g, "-");
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Fetch.requestPaused") {
    const u = m.params.request.url;
    if (u.includes("v=head") && m.params.resourceType === "Document") {
      ws.send(JSON.stringify({ id: ++id, method: "Fetch.fulfillRequest", params: {
        requestId: m.params.requestId, responseCode: 200,
        responseHeaders: [{ name: "Content-Type", value: "text/html; charset=utf-8" }],
        body: Buffer.from(HEAD_SRC, "utf8").toString("base64"),
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
  var r = function(sel){var el=document.querySelector(sel);if(!el)return null;var b=el.getBoundingClientRect();if(!b.height)return null;return {t:Math.round(b.top+scrollY),b:Math.round(b.bottom+scrollY),l:Math.round(b.left),r:Math.round(b.right),h:Math.round(b.height)}};
  var copy = document.querySelector("#product .dl-prod__copy");
  var last = copy && [...copy.children].filter(function(c){return c.getBoundingClientRect().height>0}).pop();
  var lb = last && last.getBoundingClientRect();
  var secs = {};
  [...document.querySelectorAll("main.dl-home > section")].forEach(function(s){var b=s.getBoundingClientRect();if(b.height)secs[s.id||s.className.split(" ").pop()]=Math.round(b.height)});
  return {
    doc: document.documentElement.scrollHeight,
    ctSection: r("#product"), ctQuoteBlock: r("#product .dl-prod__quote"), ctPull: r("#product .dl-prod__quote .dl-pull"),
    ctMore: r("#product .dl-prod__quote .dl-prod__more"), ctCopyLastBottom: lb ? Math.round(lb.bottom+scrollY) : null,
    ctMedia: r("#product .dl-prod__media"), ctDetail: r("#product .dl-prod__detail-wrap"),
    mkAside: r(".dl-mk__aside"), mkHelp: r(".dl-mk__help"), mkQuotes: r(".dl-mk__quotes"),
    cbQuotes: r(".dl-cb-quotes"), ebQuotes: r(".dl-eb-quotes"), ebFoot: r(".dl-eb-foot"),
    sections: secs,
  };
})()`;

async function shot(name, sel, pad = 24) {
  const box = await ev(`(function(){var el=document.querySelector(${JSON.stringify(sel)});if(!el)return null;var b=el.getBoundingClientRect();return {x:0,y:Math.max(0,b.top+scrollY-${pad}),w:document.documentElement.clientWidth,h:b.height+${pad * 2}}})()`);
  if (!box) return;
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: box.x, y: box.y, width: box.w, height: box.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
}

if (process.argv.includes("live")) {
  const out = {};
  for (const w of [960, 1024, 1180]) {
    await load("https://www.delphi-me.com/home", w, false);
    out[w] = await ev(MEASURE);
    await shot(`live-layout-ct-${w}.png`, "#product");
    console.log(w, "copyEnd->pull gap", out[w].ctPull.t - out[w].ctCopyLastBottom);
  }
  writeFileSync(join(OUT, "layout-live.json"), JSON.stringify(out, null, 1));
  ws.close(); edge.kill(); process.exit(0);
}

const report = {};
for (const path of ["/home", "/highered"]) {
  for (const w of [390, 960, 1024, 1180, 1280, 1440]) {
    for (const [v, url] of [["head", `${BASE}${path}?v=head`], ["work", `${BASE}${path}`]]) {
      await load(url, w, w < 700);
      report[`${v}-${path.slice(1)}-${w}`] = await ev(MEASURE);
      if (v === "work" && path === "/home") {
        await shot(`after-layout-ct-${w}.png`, "#product");
        if (w === 1440 || w === 390 || w === 960) await shot(`after-layout-mk-${w}.png`, ".dl-mk__aside");
      }
    }
    console.log(path, w, "ok");
  }
}
writeFileSync(join(OUT, "layout.json"), JSON.stringify(report, null, 1));
ws.close();
edge.kill();
process.exit(0);

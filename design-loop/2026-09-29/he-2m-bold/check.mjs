// Headless Edge over CDP: confirm only "2M a year" is bold in the HE 4 in 10 stat text.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9347;
const BASE = "http://127.0.0.1:8767";
const TAG = process.argv[2] || "after";
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
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
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

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path + "?t=" + Date.now() });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(700);
}

const probe = `(function(){
  var card=document.querySelector("section.dl-case .dl-case__stats article.dl-card.dl-he");
  if(!card) return { card:null };
  var p=[].find.call(card.querySelectorAll("p"), function(x){ return /drop out of college/.test(x.textContent); });
  var runs=[], w=document.createTreeWalker(p, NodeFilter.SHOW_TEXT), n;
  while((n=w.nextNode())) if(n.textContent.trim()) runs.push({ text:n.textContent, weight:getComputedStyle(n.parentElement).fontWeight, tag:n.parentElement.tagName });
  var bold=runs.filter(function(r){ return +r.weight>=600; }).map(function(r){ return r.text; });
  var b=card.getBoundingClientRect();
  return { cardShown:getComputedStyle(card).display!=="none" && b.width>0, text:p.textContent, html:p.innerHTML, runs:runs,
    boldText:bold, onlyTwoMBold: bold.length===1 && bold[0]==="2M a year" && runs.filter(function(r){return r.tag==="B"})[0].weight==="700",
    clip:{ x:b.left+scrollX, y:b.top+scrollY, width:b.width, height:b.height } };
})()`;

const results = [];
for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  await load("/highered", w, h, mobile);
  await ev(`document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")}); document.querySelector("section.dl-case .dl-he").scrollIntoView({block:"center"})`);
  await sleep(900);
  const r = await ev(probe);
  results.push({ path: "/highered", width: w, ...r });
  console.log(w, JSON.stringify({ cardShown: r.cardShown, boldText: r.boldText, onlyTwoMBold: r.onlyTwoMBold, html: r.html }));
  if (r.clip) {
    const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { ...r.clip, scale: 1 } });
    const name = `${TAG}-highered-${w}-he-card.png`;
    writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
    console.log("shot", name);
  }
}
await load("/home", 1440, 900, false);
const home = await ev(`(function(){var c=document.querySelector("section.dl-case .dl-he");return { heCardShown: !!c && getComputedStyle(c).display!=="none", visibleText2M: document.body.innerText.includes("2M a year") };})()`);
results.push({ path: "/home", width: 1440, ...home });
console.log("home", JSON.stringify(home));

writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(0);

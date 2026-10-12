// Headless Edge over CDP: makeover help paragraph 2 no longer carries the parent sentences on /home or /highered.
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
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });

let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {}
  await sleep(200);
}
const pageT = targets.find((t) => t.type === "page");
const ws = new WebSocket(pageT.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
const results = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };

const EXPECT = "With Delphinium, students can see at a glance what's done, what's in progress, and what comes next, so they own the journey.";
const probe = `(function(){
  var p=document.querySelectorAll("main#top > section#makeover > div.dl-wrap > div.dl-mk__aside > div.dl-mk__help > p")[1];
  if(!p) return {found:false};
  var body=document.body.innerText;
  return { found:true, innerHTML:p.innerHTML, innerText:p.innerText, children:p.children.length,
    visible:p.getBoundingClientRect().height>0, heEnabled:document.documentElement.classList.contains("dl-path-he"),
    parentTextAnywhere:/same view|frustrated bystanders/i.test(body) };
})()`;

for (const [path, w, h, mob] of [["/home", 1440, 900, false], ["/highered", 1440, 900, false], ["/home", 390, 844, true], ["/highered", 390, 844, true]]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mob ? 2 : 1, mobile: mob });
  await send("Page.navigate", { url: BASE + path + "?cb=" + Date.now() });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(600);
  const r = await ev(probe);
  r.matchesExpected = r.innerHTML === EXPECT;
  log(`${w} ${path}`, r);
}
writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close(); edge.kill(); process.exit(0);

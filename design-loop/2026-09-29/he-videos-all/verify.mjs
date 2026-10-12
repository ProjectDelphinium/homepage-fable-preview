// Headless Edge over CDP: every data-youtube link on /home and /highered, clicked, modal embed checked.
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

const PAIRS = [
  ["hero", "id9dqfNZsf4", "9mfMC9jC6lU"],
  ["control-tower", "xC1b-9bZW4w", "MBYmCCeZqxo"],
  ["community", "acjbTVs8IUM", "4vzDJ1poyvU"],
  ["makeover", "Ek-BBS8rP_0", "63Iu4Xxg_tg"],
  ["engagement", "ejtU7miZWD4", "xbdP6GSjPgY"],
  ["how", "L90IoF6LGAE", "U615qsZh8bc"],
];

const edge = spawn(EDGE, [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu", "--mute-audio",
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
  const t = setTimeout(() => { pending.delete(i); rej(new Error(method + ": timeout")); }, 20000);
  pending.set(i, (m) => { clearTimeout(t); m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result); });
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => {
  for (let tries = 0; ; tries++) {
    try { return (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value; }
    catch (e) { if (tries >= 3 || !/timeout/.test(e.message)) throw e; console.log("retry evaluate"); await sleep(1000); }
  }
};

const results = [];
const failures = [];
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };
const check = (label, ok, detail) => { if (!ok) failures.push([label, detail]); log((ok ? "PASS " : "FAIL ") + label, detail); };

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(2500);
  await ev(`document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")})`);
}

const links = `Array.from(document.querySelectorAll("a[data-youtube]")).map(function(a){var s=a.closest("section");return {sec:s?(s.id?"#"+s.id:"."+s.className.split(" ").join(".")):null,label:a.textContent.trim().replace(/\\s+/g," "),yt:a.dataset.youtube,href:a.getAttribute("href"),visible:!!a.offsetParent}})`;
const warm = `Array.from(document.querySelectorAll("iframe")).map(function(f){return f.src}).filter(function(s){return /youtube/.test(s)}).map(function(s){var m=s.match(/embed\\/([A-Za-z0-9_-]{11})/);return m?m[1]:s})`;

await send("Page.enable");
for (const [path, mode] of [["/home", "k12"], ["/highered", "he"]]) {
  for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
    if (process.env.ONLY && process.env.ONLY !== `${mode}-${tag}`) continue;
    await load(path, w, h, mob);
    const all = await ev(links);
    log(`${mode} ${tag} links`, all);
    if (mode === "he") {
      log(`he ${tag} text`, await ev(`(function(){var q=function(s){var e=document.querySelector(s);return e?e.innerHTML.trim():null};return {ready:document.documentElement.classList.contains("dl-he-ready"),lead:q(".dl-hero__lead"),upto:q(".dl-cover__upto"),num:q(".dl-cover__num"),study:q("#proof-study-heading"),txt:q(".dl-proof__davis .dl-card__txt"),punch:q(".dl-proof__study-punch")}})()`));
    }
    await sleep(2500);
    const warmIds = await ev(warm);
    log(`${mode} ${tag} warm iframes`, warmIds);
    for (const [name, k12, he] of PAIRS) {
      await load(path, w, h, mob);
      const want = mode === "he" ? he : k12;
      const other = mode === "he" ? k12 : he;
      const sel = `a[data-youtube="${want}"]`;
      const info = await ev(`(function(){var a=document.querySelector(${JSON.stringify(sel)});if(!a)return null;document.documentElement.style.scrollBehavior="auto";a.scrollIntoView({block:"center",behavior:"instant"});return {label:a.textContent.trim().replace(/\\s+/g," "),href:a.getAttribute("href"),title:a.dataset.title}})()`);
      check(`${mode} ${tag} ${name} link has ${want}`, !!info && info.href.endsWith("v=" + want), info);
      check(`${mode} ${tag} ${name} no ${other} left`, (await ev(`document.querySelectorAll('[data-youtube="${other}"],a[href*="${other}"]').length`)) === 0, other);
      check(`${mode} ${tag} ${name} warm-up has ${want}`, warmIds.includes(want), warmIds);
      if (!info) continue;
      await sleep(1200);
      const [x, y, hit] = await ev(`(function(){var a=document.querySelector(${JSON.stringify(sel)}),b=a.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,e=document.elementFromPoint(x,y);return [x,y,!!e&&(e===a||a.contains(e))]})()`);
      check(`${mode} ${tag} ${name} click point hits link`, hit, [x, y]);
      if (hit) {
        await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
        await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
      } else {
        await ev(`document.querySelector(${JSON.stringify(sel)}).click()`);
      }
      await sleep(2500);
      const modal = await ev(`(function(){var m=document.getElementById("dl-modal"),f=m&&m.querySelector("iframe");return {open:!!m&&!m.hidden,src:f?f.src:null,url:location.href}})()`);
      check(`${mode} ${tag} ${name} modal embeds ${want}`, modal.open && !!modal.src && modal.src.includes("/embed/" + want), modal);
      const { data } = await send("Page.captureScreenshot", { format: "png" });
      const file = `${mode}-${tag}-${name}-modal.png`;
      writeFileSync(join(OUT, file), Buffer.from(data, "base64"));
    }
  }
}

writeFileSync(join(OUT, process.env.ONLY ? `checks-${process.env.ONLY}.json` : "checks.json"), JSON.stringify({ failures, results }, null, 1));
console.log(failures.length ? `FAILURES: ${failures.length}` : "ALL PASS");
ws.close();
edge.kill();
process.exit(0);

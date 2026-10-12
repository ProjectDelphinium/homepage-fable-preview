// Headless Edge over CDP: per-path YouTube swaps (hero + Control Tower) and the video modal.
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
  "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu", "--autoplay-policy=no-user-gesture-required",
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
let fails = 0;
const log = (k, v) => { results.push([k, v]); console.log(k, JSON.stringify(v)); };
const expect = (k, ok) => { if (!ok) fails++; log((ok ? "PASS " : "FAIL ") + k, ok); };

async function load(path, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url: BASE + path });
  for (let i = 0; i < 60; i++) { if ((await ev("document.readyState")) === "complete") break; await sleep(200); }
  await sleep(800);
}

const linkInfo = (sel) => `(function(){var a=document.querySelector(${JSON.stringify(sel)});return a&&{href:a.getAttribute("href"),yt:a.getAttribute("data-youtube"),title:a.getAttribute("data-title"),attrTitle:a.title,text:a.textContent.trim()}})()`;
const HERO = ".dl-hero .dl-link";
const CT = "section#product article.dl-prod .dl-prod__quote .dl-prod__more > a.dl-link";

async function clickEl(sel) {
  await ev(`(function(){var a=document.querySelector(${JSON.stringify(sel)});document.documentElement.style.scrollBehavior="auto";a.scrollIntoView({block:"center",behavior:"instant"});document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")})})()`);
  await sleep(700);
  const [x, y, hit] = await ev(`(function(){var a=document.querySelector(${JSON.stringify(sel)}),b=a.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,e=document.elementFromPoint(x,y);return [x,y,!!e&&a.contains(e)]})()`);
  if (!hit) log(`pointer target not ${sel}`, [x, y]);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  await sleep(1500);
}

async function shotSel(sel, name, pad = 24) {
  const r = await ev(`(function(){var b=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:Math.max(0,b.left+scrollX-${pad}),y:Math.max(0,b.top+scrollY-${pad}),w:b.width+${pad * 2},h:b.height+${pad * 2}}})()`);
  const vw = await ev("document.documentElement.clientWidth");
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: Math.min(r.w, vw - r.x), height: r.h, scale: 1 } });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}
async function shotView(name) {
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
  log("shot", name);
}

const modalState = `(function(){var m=document.getElementById("dl-modal"),f=m&&m.querySelector("iframe");return {open:!!m&&!m.hidden,title:(m.querySelector("[id$=title],.dl-modal__title,h2")||{}).textContent,iframe:f&&f.src}})()`;

const EXPECT = {
  "/highered": { hero: "9mfMC9jC6lU", ct: "MBYmCCeZqxo" },
  "/home": { hero: "id9dqfNZsf4", ct: "xC1b-9bZW4w" },
};

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  for (const path of ["/highered", "/home"]) {
    const p = path.slice(1);
    const exp = EXPECT[path];
    await load(path, w, h, mob);
    const html = await ev("document.documentElement.className");
    log(`${p} ${tag} html class`, html);
    const hero = await ev(linkInfo(HERO));
    const ct = await ev(linkInfo(CT));
    log(`${p} ${tag} hero`, hero);
    log(`${p} ${tag} ct`, ct);
    expect(`${p} ${tag} hero id`, hero.yt === exp.hero && hero.href === `https://www.youtube.com/watch?v=${exp.hero}`);
    expect(`${p} ${tag} ct id`, ct.yt === exp.ct && ct.href === `https://www.youtube.com/watch?v=${exp.ct}`);
    expect(`${p} ${tag} ct label`, ct.title === "Watch: Insightful data" && ct.attrTitle === "Watch: Insightful data" && ct.text === "Watch: Insightful data");
    if (path === "/highered") {
      const copy = await ev(`(function(){var q=document.querySelector.bind(document);return {ready:document.documentElement.classList.contains("dl-he-ready"),lead:q(".dl-hero__lead").textContent.slice(0,40),num:q(".dl-cover__num").textContent,study:q("#proof-study-heading").textContent,davisNum:q(".dl-proof__davis .dl-card__num").textContent}})()`);
      log(`${p} ${tag} HE copy swaps`, copy);
      expect(`${p} ${tag} HE copy swaps land`, copy.ready && copy.lead.startsWith("Delphinium transforms") && copy.num === "47%!" && copy.study === "Utah Valley University studies" && copy.davisNum === "47%");
    }
    const warm = await ev(`Array.from(document.querySelectorAll("iframe")).map(function(f){return f.src}).filter(function(s){return s.indexOf("youtube")>-1}).map(function(s){return s.split("/embed/")[1].split("?")[0]})`);
    log(`${p} ${tag} warmed yt ids`, warm);

    await clickEl(CT);
    await shotSel(".dl-prod__quote", `${p}-${tag}-ct-link.png`);
    const m = await ev(modalState);
    log(`${p} ${tag} ct modal`, m);
    expect(`${p} ${tag} ct modal opens with ${exp.ct}`, m.open && !!m.iframe && m.iframe.includes(`/embed/${exp.ct}`) && m.title === "Watch: Insightful data");
    await shotView(`${p}-${tag}-ct-modal.png`);
    await ev(`document.querySelector("#dl-modal [data-close]").click()`);
    await sleep(1200);

    await clickEl(HERO);
    const mh = await ev(modalState);
    log(`${p} ${tag} hero modal`, mh);
    expect(`${p} ${tag} hero modal opens with ${exp.hero}`, mh.open && !!mh.iframe && mh.iframe.includes(`/embed/${exp.hero}`));
    await ev(`document.querySelector("#dl-modal [data-close]").click()`);
    await sleep(400);
  }
}

await load("/home", 390, 844, true);
await clickEl(HERO);
const fresh = await ev(modalState);
log("home 390 fresh-load hero modal", fresh);
expect("home 390 fresh-load hero modal opens with id9dqfNZsf4", fresh.open && !!fresh.iframe && fresh.iframe.includes("/embed/id9dqfNZsf4"));
await shotView("home-390-hero-modal-fresh.png");

log("fails", fails);
writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(fails ? 1 : 0);

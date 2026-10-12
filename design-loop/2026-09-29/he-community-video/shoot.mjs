// Headless Edge over CDP: /highered Community video swap (plus hero + Control Tower) and /home unchanged.
import { spawn } from "node:child_process";
import { writeFileSync, readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9352;
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
const LINKS = {
  hero: ".dl-hero .dl-link",
  ct: "section#product article.dl-prod .dl-prod__quote .dl-prod__more > a.dl-link",
  cb: "section#community article.dl-prod .dl-prod__shots .dl-prod__more.dl-cb-cta > a.dl-link",
};
const CB_LABEL = "Watch: Communication that works!";

// Every a[data-youtube] in source order, as /home ships it.
const K12_ALL = ["id9dqfNZsf4", "xC1b-9bZW4w", "acjbTVs8IUM", "Ek-BBS8rP_0", "ejtU7miZWD4", "Tp3IO0TzvM0", "3N0SXpFT36w", "UgEyq7gUWmM", "L90IoF6LGAE"];
// The HE table is the last --dl-he segment; other agents may append pairs, so read it from source.
const SRC = readFileSync(join(OUT, "../../../zoho-sites/homepage-sites-v5.html"), "utf8");
const pairs = SRC.match(/--dl-he: "[^"]*\|\|([^"|]*)"/)[1].trim().split(" ");
const HE_MAP = {};
for (let i = 0; i < pairs.length; i += 2) HE_MAP[pairs[i]] = pairs[i + 1];
log("HE table from source", HE_MAP);
if (HE_MAP.id9dqfNZsf4 !== "9mfMC9jC6lU" || HE_MAP["xC1b-9bZW4w"] !== "MBYmCCeZqxo" || HE_MAP.acjbTVs8IUM !== "4vzDJ1poyvU") { fails++; log("FAIL HE table missing hero/ct/community pair", false); }
const EXPECT = {
  "/highered": { hero: "9mfMC9jC6lU", ct: "MBYmCCeZqxo", cb: "4vzDJ1poyvU", all: K12_ALL.map((k) => HE_MAP[k] || k) },
  "/home": { hero: "id9dqfNZsf4", ct: "xC1b-9bZW4w", cb: "acjbTVs8IUM", all: K12_ALL },
};

async function clickEl(sel) {
  await ev(`(function(){var a=document.querySelector(${JSON.stringify(sel)});document.documentElement.style.scrollBehavior="auto";a.scrollIntoView({block:"center",behavior:"instant"});document.querySelectorAll(".dl-reveal").forEach(function(r){r.classList.add("is-in")})})()`);
  const pos = `(function(){var a=document.querySelector(${JSON.stringify(sel)}),b=a.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,e=document.elementFromPoint(x,y);return [x,y,!!e&&a.contains(e)]})()`;
  let prev = null, cur;
  for (let i = 0; i < 20; i++) {
    await sleep(300);
    cur = await ev(pos);
    if (prev && prev[0] === cur[0] && prev[1] === cur[1]) break;
    prev = cur;
  }
  const [x, y, hit] = cur;
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
const closeModal = async () => { await ev(`document.querySelector("#dl-modal [data-close]").click()`); await sleep(1200); };

for (const [tag, w, h, mob] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  for (const path of ["/highered", "/home"]) {
    const p = path.slice(1);
    const exp = EXPECT[path];
    await load(path, w, h, mob);
    log(`${p} ${tag} html class`, await ev("document.documentElement.className"));
    const errs = await ev(`window.__dlErr||null`);
    if (errs) log(`${p} ${tag} errors`, errs);

    for (const [k, sel] of Object.entries(LINKS)) {
      const info = await ev(linkInfo(sel));
      log(`${p} ${tag} ${k}`, info);
      expect(`${p} ${tag} ${k} id ${exp[k]}`, info.yt === exp[k] && info.href === `https://www.youtube.com/watch?v=${exp[k]}`);
    }
    const cb = await ev(linkInfo(LINKS.cb));
    expect(`${p} ${tag} cb label kept`, cb.title === CB_LABEL && cb.attrTitle === CB_LABEL && cb.text === CB_LABEL);

    const all = await ev(`Array.from(document.querySelectorAll("a[data-youtube]")).map(function(a){var y=a.getAttribute("data-youtube");return a.getAttribute("href")==="https://www.youtube.com/watch?v="+y?y:"MISMATCH:"+y})`);
    log(`${p} ${tag} all yt links`, all);
    expect(`${p} ${tag} all yt links as expected`, JSON.stringify(all) === JSON.stringify(exp.all));

    if (path === "/highered") {
      const copy = await ev(`(function(){var q=document.querySelector.bind(document);return {ready:document.documentElement.classList.contains("dl-he-ready"),lead:q(".dl-hero__lead").textContent.slice(0,40),num:q(".dl-cover__num").textContent,study:q("#proof-study-heading").textContent,davisNum:q(".dl-proof__davis .dl-card__num").textContent,punch:q(".dl-proof__study-punch").textContent}})()`);
      log(`${p} ${tag} HE copy swaps`, copy);
      expect(`${p} ${tag} HE copy swaps land`, copy.ready && copy.lead.startsWith("Delphinium transforms") && copy.num === "47%!" && copy.study === "Utah Valley University studies" && copy.davisNum === "47%" && copy.punch.startsWith("The courses didn't change."));
    }

    await clickEl(LINKS.cb);
    await shotSel(".dl-cb-cta", `${p}-${tag}-community-link.png`, 40);
    const m = await ev(modalState);
    log(`${p} ${tag} cb modal`, m);
    expect(`${p} ${tag} cb modal opens with ${exp.cb}`, m.open && !!m.iframe && m.iframe.includes(`/embed/${exp.cb}`) && m.title === CB_LABEL);
    await shotView(`${p}-${tag}-community-modal.png`);
    await closeModal();

    for (const k of ["hero", "ct"]) {
      await clickEl(LINKS[k]);
      const mk = await ev(modalState);
      log(`${p} ${tag} ${k} modal`, mk);
      expect(`${p} ${tag} ${k} modal opens with ${exp[k]}`, mk.open && !!mk.iframe && mk.iframe.includes(`/embed/${exp[k]}`));
      await closeModal();
    }
  }
}

log("fails", fails);
writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 1));
ws.close();
edge.kill();
process.exit(fails ? 1 : 0);

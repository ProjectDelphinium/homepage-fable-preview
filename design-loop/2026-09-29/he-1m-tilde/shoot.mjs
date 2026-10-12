// Headless Edge over CDP: Earnings card number check ("~$1M" -> "$1M") on /highered, /home unchanged.
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
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;

await send("Page.enable");
const results = [];
for (const [path, w, h] of [["/highered", 1440, 900], ["/highered", 390, 844], ["/home", 1440, 900]]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 });
  await send("Page.navigate", { url: BASE + path });
  await sleep(3500);
  const info = await evalJs(`(() => {
    const cards = [...document.querySelectorAll('section.dl-case .dl-card')];
    const card = cards.find((c) => /Earnings and employment|\\$229K/i.test(c.innerText) && getComputedStyle(c).display !== 'none' && c.querySelector('.dl-card__num'));
    if (!card) return { found: false };
    card.scrollIntoView({ block: 'center' });
    const num = card.querySelector('.dl-card__num');
    const r = card.getBoundingClientRect();
    return {
      found: true,
      numText: num.innerText.trim(),
      numHtml: num.innerHTML,
      kicker: card.innerText.split('\\n')[0].trim(),
      tildeAnywhereInCase: /~/.test(document.querySelector('section.dl-case').innerText),
      rect: { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height },
    };
  })()`);
  await sleep(600);
  const name = `${path.slice(1)}-${w}-earnings`;
  if (info?.found) {
    const pad = 24;
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: {
      x: Math.max(0, info.rect.x - pad), y: Math.max(0, info.rect.y - pad),
      width: Math.min(w, info.rect.width + pad * 2), height: info.rect.height + pad * 2, scale: 1 } });
    writeFileSync(join(OUT, `${name}.png`), Buffer.from(shot.result.data, "base64"));
    const view = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(OUT, `${path.slice(1)}-${w}-view.png`), Buffer.from(view.result.data, "base64"));
  }
  results.push({ path, width: w, ...info });
}
writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
ws.close();
edge.kill();
process.exit(0);

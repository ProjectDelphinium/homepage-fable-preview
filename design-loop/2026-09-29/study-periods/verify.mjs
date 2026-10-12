// Headless Edge over CDP: check Higher Ed study bullets have no trailing period; home unchanged.
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
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.result.value;

const SEL = "article.dl-proof__result--davis div.dl-card__ctx.dl-proof__he-ctx > ul.dl-card__ctx-list";
const results = [];
for (const [path, w, h] of [["/highered", 1440, 900], ["/highered", 390, 844], ["/home", 1440, 900], ["/home", 390, 844]]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 });
  await send("Page.navigate", { url: BASE + path });
  await sleep(2500);
  const r = await evaluate(`(() => {
    const ul = document.querySelector(${JSON.stringify(SEL)});
    if (!ul) return { found: false };
    const cs = getComputedStyle(ul.closest('.dl-proof__he-ctx'));
    ul.scrollIntoView({ block: 'center' });
    const lis = [...ul.querySelectorAll('li')].map((li) => li.innerText.trim());
    return { found: true, ctxDisplay: cs.display, visible: ul.getClientRects().length > 0, lis, trailingPeriod: lis.some((t) => t.endsWith('.')),
      proofHead: document.querySelector('#proof h2')?.innerText.trim() };
  })()`);
  await sleep(400);
  if (r.visible) {
    const box = await evaluate(`(() => { const b = document.querySelector(${JSON.stringify(SEL)}).closest('.dl-proof__davis').getBoundingClientRect(); return { x: b.x + scrollX, y: b.y + scrollY, w: b.width, h: b.height }; })()`);
    await sleep(1200);
    const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: Math.max(0, box.x - 16), y: Math.max(0, box.y - 16), width: Math.min(w, box.w + 32), height: box.h + 32, scale: 1 }, captureBeyondViewport: true });
    writeFileSync(join(OUT, `${path.slice(1)}-${w}-study.png`), Buffer.from(shot.result.data, "base64"));
  }
  results.push({ path, w, ...r });
}
writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
ws.close();
edge.kill();
process.exit(0);

// Headless Edge over CDP: verify the HE study-card gateway bullet at 1440 and 390, and /home unchanged.
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
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;

const probe = `(() => {
  const ul = document.querySelector('article.dl-proof__result--davis div.dl-card__ctx.dl-proof__he-ctx > ul.dl-card__ctx-list');
  const gw = [...document.querySelectorAll('li')].filter(l => /gateway|so much help/i.test(l.textContent)).map(l => l.textContent.trim());
  if (!ul) return { found: false, gw, ctxVisible: null };
  const lis = [...ul.querySelectorAll('li')];
  const vis = getComputedStyle(ul.closest('.dl-proof__he-ctx')).display !== 'none' && ul.offsetParent !== null;
  return { found: true, visible: vis, gw, items: lis.map(li => {
    const cs = getComputedStyle(li); const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    const r = document.createRange(); r.selectNodeContents(li);
    const tops = new Set([...r.getClientRects()].map(x => Math.round(x.top)));
    const b = li.getBoundingClientRect();
    return { text: li.textContent.trim(), html: li.innerHTML, lines: tops.size, heightLines: +(b.height / lh).toFixed(2), width: Math.round(b.width), fontSize: cs.fontSize };
  }) };
})()`;

const results = {};
for (const [path, w] of [["/highered", 1440], ["/highered", 390], ["/home", 1440], ["/home", 390]]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 600 });
  await send("Page.navigate", { url: BASE + path });
  await sleep(2500);
  const r = await evaluate(probe);
  results[`${path}-${w}`] = r;
  if (r?.found && r.visible) {
    await evaluate(`(() => { const st = document.createElement('style'); st.textContent = '.dl-reveal{transition:none!important}'; document.head.appendChild(st);
      document.querySelectorAll('.dl-reveal').forEach(r => r.classList.add('is-in')); document.querySelector('article.dl-proof__result--davis').scrollIntoView({block:'center'}); })()`);
    await sleep(600);
    const box = await evaluate(`(() => { const b = document.querySelector('article.dl-proof__result--davis').getBoundingClientRect(); return {x:b.x+scrollX,y:b.y+scrollY,w:b.width,h:b.height}; })()`);
    r.breaks = await evaluate(`(() => { const li = [...document.querySelectorAll('article.dl-proof__result--davis .dl-proof__he-ctx li')][1]; const t = li.firstChild; const out = []; let top = null, cur = '';
      for (let i = 0; i < t.length; i++) { const rg = document.createRange(); rg.setStart(t, i); rg.setEnd(t, i + 1); const rc = rg.getClientRects()[0]; const y = rc ? Math.round(rc.top) : top;
        if (top !== null && y > top + 2) { out.push(cur); cur = ''; } top = y; cur += t.data[i]; } out.push(cur); return out.map(s => s.trim()); })()`);
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: box.w + 16, height: box.h + 16, scale: 1 } });
    writeFileSync(join(OUT, `${path.slice(1)}-${w}-davis.png`), Buffer.from(shot.result.data, "base64"));
  }
}
writeFileSync(join(OUT, "checks.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
ws.close();
edge.kill();
process.exit(0);

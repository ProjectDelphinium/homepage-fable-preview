// Headless Chrome via CDP: load a page at 1440 wide, force-load every logo in
// #customers, report naturalWidth per img, and screenshot the strip.
// usage: node render_logos.mjs <url> <out-prefix>
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const [url, out] = process.argv.slice(2);
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9300 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(path.join(tmpdir(), "lc-chrome-"));
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  "--no-first-run", "--hide-scrollbars", "--window-size=1440,900", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    target = list.find((t) => t.type === "page");
  } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  else events.push(m);
});
const send = (method, params = {}) => new Promise((res) => {
  const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method, params }));
});
const evaluate = async (expr) =>
  (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;

await send("Page.enable");
await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url });
for (let i = 0; i < 100 && !events.some((e) => e.method === "Page.loadEventFired"); i++) await sleep(200);
await sleep(1500);

const report = await evaluate(`(async () => {
  const sec = document.getElementById("customers");
  if (!sec) return { error: "no #customers" };
  const imgs = [...sec.querySelectorAll("img")];
  imgs.forEach((i) => { i.loading = "eager"; });
  sec.scrollIntoView({ block: "center" });
  await Promise.all(imgs.map((i) => i.decode().catch(() => null)));
  await new Promise((r) => setTimeout(r, 800));
  return {
    href: location.href,
    sectionVisible: getComputedStyle(sec).display !== "none",
    imgs: imgs.map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, clone: !!i.closest(".dl-logos__list--clone"),
      complete: i.complete, naturalWidth: i.naturalWidth, naturalHeight: i.naturalHeight })),
  };
})()`);
writeFileSync(`${out}.json`, JSON.stringify(report, null, 1));

async function shot(file) {
  const box = await evaluate(`(() => { const s = document.getElementById("customers");
    s.scrollIntoView({ block: "start" }); const r = s.getBoundingClientRect();
    return { x: 0, y: r.top + scrollY, width: 1440, height: Math.ceil(r.height) }; })()`);
  await sleep(400);
  const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { ...box, scale: 1 } });
  writeFileSync(file, Buffer.from(r.result.data, "base64"));
}
if (report && report.sectionVisible) {
  await evaluate(`document.querySelector(".dl-logos")?.classList.add("is-paused"); true`);
  await shot(`${out}-strip.png`);
  await evaluate(`(() => { const st = document.createElement("style");
    st.textContent = ".dl-logos__viewport{overflow:visible!important;mask:none!important;-webkit-mask:none!important}" +
      ".dl-logos__track{animation:none!important;transform:none!important;width:auto!important}" +
      ".dl-logos__list{flex-wrap:wrap!important;justify-content:center!important}.dl-logos__list--clone{display:none!important}";
    document.head.appendChild(st); return true; })()`);
  await sleep(300);
  await shot(`${out}-all.png`);
}

const bad = (report?.imgs || []).filter((i) => !i.naturalWidth);
console.log(JSON.stringify({ href: report?.href, sectionVisible: report?.sectionVisible,
  total: report?.imgs?.length, broken: bad.map((b) => b.src) }, null, 1));
ws.close();
chrome.kill();
process.exit(0);

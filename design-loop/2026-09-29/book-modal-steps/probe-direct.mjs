// Zoho portal-embed loaded directly: layout of the header card (.zb-ct-leftpanel) per width and per step.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9711;
const URL_ = "https://jared-delphi-me.zohobookings.com/portal-embed#/4937208000000036014";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--disable-gpu",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "dl-edge-"))}`, "about:blank"], { stdio: "ignore" });
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {} await sleep(200); }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); return r.exceptionDetails ? { error: r.exceptionDetails.text + " " + (r.exceptionDetails.exception && r.exceptionDetails.exception.description) } : r.result.value; };
const snap = async (name) => { const { data } = await send("Page.captureScreenshot", { format: "png" }); writeFileSync(join(OUT, name), Buffer.from(data, "base64")); };
const out = {};

const layout = `(function(){
  var c=document.querySelector('.zb-ctheme-content'), st=c?c.scrollTop:0;
  function r(el){if(!el)return null;var b=el.getBoundingClientRect();return {x:Math.round(b.left),y:Math.round(b.top+st),w:Math.round(b.width),h:Math.round(b.height),b:Math.round(b.bottom+st)}}
  var card=document.querySelector('.zb-ct-leftpanel');
  var chain=[];for(var e=card;e&&e!==document.body;e=e.parentElement){var cs=getComputedStyle(e);chain.push((e.tagName+'.'+[].slice.call(e.classList).join('.')).slice(0,80)+' disp='+cs.display+' flexdir='+cs.flexDirection+' pos='+cs.position+' ov='+cs.overflowY+' '+JSON.stringify(r(e)))}
  var right=document.querySelector('.zb-ct-rightpanel,.zb-ct-right-panel,[class*=rightpanel]');
  var hs=[].slice.call(document.querySelectorAll('h1,h2,h3,h4,[class*=header],[class*=title]')).filter(function(h){return h.getBoundingClientRect().height&&h.children.length<3}).slice(0,12).map(function(h){return [r(h).y,r(h).b,(h.className+'').slice(0,50),h.textContent.trim().replace(/\\s+/g,' ').slice(0,40)]});
  var sc=[].slice.call(document.querySelectorAll('*')).filter(function(e){var cs=getComputedStyle(e);return /(auto|scroll)/.test(cs.overflowY)&&e.scrollHeight>e.clientHeight+2}).map(function(e){return (e.tagName+'.'+[].slice.call(e.classList).join('.')).slice(0,60)+' sh='+e.scrollHeight+' ch='+e.clientHeight+' st='+e.scrollTop});
  return {hash:location.hash,vw:innerWidth,vh:innerHeight,docSH:document.documentElement.scrollHeight,card:r(card),cardClass:card&&card.className,right:right&&[right.className,r(right)],chain:chain,headings:hs,scrollers:sc};
})()`;

const find = (re, last) => `(function(){var b=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&${re}.test(e.textContent.trim())&&e.getBoundingClientRect().height&&!e.closest('.zb-disabled,[disabled]')});var e=b[${last ? "b.length-1" : "0"}];if(!e)return null;e.scrollIntoView({block:'center'});var r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2,e.className+'']})()`;
const clickAt = async (xy) => { if (!xy || xy.error) return false; for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: xy[0], y: xy[1], button: "left", clickCount: 1 }); return true; };
const waitText = async (re, n = 60) => { for (let i = 0; i < n; i++) { if (await ev(`!!document.body&&${re}.test(document.body.innerText)`)) return true; await sleep(250); } return false; };

// Widths: does the card ever become a left sidebar?
for (const w of [358, 700, 1000, 1100, 1200, 1280, 1366, 1440, 1600, 1920]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 500 });
  if (w === 358) { await send("Page.navigate", { url: URL_ }); await waitText("/Select date and time/", 80); await sleep(1500); } else await sleep(700);
  out["w" + w] = await ev(layout);
  if ([358, 1100, 1440, 1920].includes(w)) await snap(`direct-w${w}-1-date.png`);
}
out.resources = await ev(`performance.getEntriesByType('resource').map(function(e){return e.name}).filter(function(n){return /\\.(js|css)(\\?|$)/.test(n)})`);

// Steps at the modal's frame widths
for (const [tag, w, mob] of [["1100", 1100, false], ["358", 358, true]]) {
  await send("Page.navigate", { url: "about:blank" }); await sleep(300);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: mob });
  await send("Page.navigate", { url: URL_ }); await waitText("/Select date and time/", 80); await sleep(1500);
  out[tag + " 1 date"] = await ev(layout);
  const slotRe = "/^\\d\\d:\\d\\d\\s?(am|pm)$/i";
  if (!(await ev(find(slotRe)))) { out[tag + " day"] = await ev(find("/^(29|30|[1-9]|[12][0-9]|3[01])$/", true)); await clickAt(out[tag + " day"]); await waitText("/\\d\\d:\\d\\d\\s?(am|pm)/i"); await sleep(1200); }
  await ev(`(function(){var c=document.querySelector('.zb-ctheme-content');if(c)c.scrollTop=0;scrollTo(0,0)})()`);
  out[tag + " 2 slots"] = await ev(layout);
  await snap(`direct-${tag}-2-slots.png`);
  out[tag + " slot"] = await ev(find(slotRe)); await clickAt(out[tag + " slot"]); await sleep(1200);
  out[tag + " 2b picked"] = await ev(layout);
  await ev(`(function(){var c=document.querySelector('.zb-ctheme-content');if(c)c.scrollTop=0;scrollTo(0,0)})()`);
  await snap(`direct-${tag}-2b-picked.png`);
  out[tag + " next"] = await ev(find("/^Next$/")); await clickAt(out[tag + " next"]); await waitText("/Please enter your details/"); await sleep(1500);
  await ev(`(function(){var c=document.querySelector('.zb-ctheme-content');if(c)c.scrollTop=0;scrollTo(0,0)})()`);
  out[tag + " 3 details"] = await ev(layout);
  await snap(`direct-${tag}-3-details.png`);
}
writeFileSync(join(OUT, "probe-direct.json"), JSON.stringify(out, null, 1));
console.log("done");
ws.close(); edge.kill(); process.exit(0);

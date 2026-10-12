// Compare terser output length of per-path YouTube swap variants (same flags as build_zoho_pack).
import { execFileSync } from "node:child_process";

const pre = `!function(){if(!document.documentElement.classList.contains("dl-path-he"))return;var a=getComputedStyle(document.documentElement).getPropertyValue("--dl-he").trim().replace(/^"|"$/g,"").split("||"),q=document.querySelector.bind(document),n=0;q(".dl-proof__study-punch").innerHTML=a[n++];`;
const post = `document.documentElement.classList.add("dl-he-ready")}();`;
const variants = {
  current: `var v=q(".dl-hero .dl-link");v.href=v.href.replace(v.dataset.youtube,v.dataset.youtube="9mfMC9jC6lU");`,
  duplicate: `var v=q(".dl-hero .dl-link");v.href=v.href.replace(v.dataset.youtube,v.dataset.youtube="9mfMC9jC6lU");v=q(".dl-prod__quote .dl-link");v.href=v.href.replace(v.dataset.youtube,v.dataset.youtube="MBYmCCeZqxo");`,
  pairs: `[[".dl-hero .dl-link","9mfMC9jC6lU"],[".dl-prod__quote .dl-link","MBYmCCeZqxo"]].forEach(function(p){var v=q(p[0]);v.href=v.href.replace(v.dataset.youtube,v.dataset.youtube=p[1])});`,
  qsaArr: `["9mfMC9jC6lU","MBYmCCeZqxo"].forEach(function(y,i){var v=document.querySelectorAll(".dl-hero .dl-link,.dl-prod__quote .dl-link")[i];v.href=v.href.replace(v.dataset.youtube,v.dataset.youtube=y)});`,
  qsaEach: `document.querySelectorAll(".dl-hero .dl-link,.dl-prod__quote .dl-link").forEach(function(v,i){v.href=v.href.replace(v.dataset.youtube,v.dataset.youtube=["9mfMC9jC6lU","MBYmCCeZqxo"][i])});`,
  fn: `function y(s,i){var v=q(s);v.href=v.href.replace(v.dataset.youtube,v.dataset.youtube=i)}y(".dl-hero .dl-link","9mfMC9jC6lU");y(".dl-prod__quote .dl-link","MBYmCCeZqxo");`,
  fnDs: `function y(s,i){var v=q(s),d=v.dataset;v.href=v.href.replace(d.youtube,d.youtube=i)}y(".dl-hero .dl-link","9mfMC9jC6lU");y(".dl-prod__quote .dl-link","MBYmCCeZqxo");`,
  fnSlice: `function y(s,i){var v=q(s);v.href=v.href.slice(0,-11)+(v.dataset.youtube=i)}y(".dl-hero .dl-link","9mfMC9jC6lU");y(".dl-prod__quote .dl-link","MBYmCCeZqxo");`,
  pairsDs: `[[".dl-hero .dl-link","9mfMC9jC6lU"],[".dl-prod__quote .dl-link","MBYmCCeZqxo"]].forEach(function(p){var v=q(p[0]),d=v.dataset;v.href=v.href.replace(d.youtube,d.youtube=p[1])});`,
};
const min = (js) => execFileSync("npx.cmd", ["--yes", "terser", "-c", "-m", "--ecma", "2015"], { input: js, encoding: "utf8", shell: true }).trim();
const base = min(pre + variants.current + post).length;
for (const [k, v] of Object.entries(variants)) {
  const out = min(pre + v + post);
  console.log(k.padEnd(10), out.length, (out.length - base >= 0 ? "+" : "") + (out.length - base));
}

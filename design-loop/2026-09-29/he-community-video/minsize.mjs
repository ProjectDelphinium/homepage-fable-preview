import { execFileSync } from "node:child_process";

const head = `!function(){if(!document.documentElement.classList.contains("dl-path-he"))return;var a=getComputedStyle(document.documentElement).getPropertyValue("--dl-he").trim().replace(/^"|"$/g,"").split("||"),q=document.querySelector.bind(document),n=0;q(".dl-proof__study-punch").innerHTML=a[n++];`;
const variants = {
  current: `function y(s,i){var v=q(s),d=v.dataset;v.href=v.href.replace(d.youtube,d.youtube=i)}y(".dl-hero .dl-link","9mfMC9jC6lU");y(".dl-prod__quote .dl-link","MBYmCCeZqxo");document.documentElement.classList.add("dl-he-ready")}();`,
  helperPlus1: `function y(s,i){var v=q(s),d=v.dataset;v.href=v.href.replace(d.youtube,d.youtube=i)}y(".dl-hero .dl-link","9mfMC9jC6lU");y(".dl-prod__quote .dl-link","MBYmCCeZqxo");y(".dl-cb-cta .dl-link","4vzDJ1poyvU");document.documentElement.classList.add("dl-he-ready")}();`,
  cssTable: `document.documentElement.classList.add("dl-he-ready");for(var m=a[n].split(" "),i=0;m[i];i+=2){var v=q('[data-youtube="'+m[i]+'"]');v.href=v.href.replace(m[i],v.dataset.youtube=m[i+1])}}();`,
  cssPairs: `document.documentElement.classList.add("dl-he-ready");a[n].split(" ").forEach(function(p){p=p.split("=");var v=q('[data-youtube="'+p[0]+'"]');v.href=v.href.replace(p[0],v.dataset.youtube=p[1])})}();`,
};
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const base = execFileSync(npx, ["--yes", "terser", "-c", "-m", "--ecma", "2015"], { input: head + "}();", encoding: "utf8", shell: true }).length;
for (const [k, js] of Object.entries(variants)) {
  const out = execFileSync(npx, ["--yes", "terser", "-c", "-m", "--ecma", "2015"], { input: head + js, encoding: "utf8", shell: true });
  console.log(k, out.length - base, out.slice(out.indexOf("study-punch")));
}

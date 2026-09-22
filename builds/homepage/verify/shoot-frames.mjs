import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const { chromium } = createRequire(path.join(root, "package.json"))("playwright-core");

const OUT = path.join(root, "verify");
const URL = process.env.SHOT_URL || "http://127.0.0.1:8765/";
const CHROME = "/usr/bin/google-chrome-stable";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

async function shoot(name, { width, height, scrollTo, script }) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(700);
  if (script) await page.evaluate(script);
  if (typeof scrollTo === "number") {
    await page.evaluate((y) => window.scrollTo(0, y), scrollTo);
    await page.waitForTimeout(700);
  } else if (typeof scrollTo === "string") {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ block: "center" });
    }, scrollTo);
    await page.waitForTimeout(900);
  }
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log("wrote", file);
  await page.close();
}

const forceCounts = () => {
  document.querySelectorAll("[data-sc-count]").forEach((el) => {
    const parts = el.getAttribute("data-sc-count").trim().split(/\s+/);
    el.textContent = parts[parts.length - 1];
  });
};

await shoot("desktop-top.png", { width: 1440, height: 900, scrollTo: 0 });
await shoot("desktop-makeover.png", {
  width: 1440,
  height: 900,
  scrollTo: "#makeover",
  script: () => {
    const r = document.getElementById("makeoverRange");
    if (r) {
      r.value = "52";
      r.dispatchEvent(new Event("input", { bubbles: true }));
    }
  },
});
await shoot("desktop-proof.png", {
  width: 1440,
  height: 900,
  scrollTo: 'section[aria-label="Davis proof"]',
  script: null,
});
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(500);
  await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: "center" }), 'section[aria-label="Davis proof"]');
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    document.querySelectorAll("[data-sc-count]").forEach((el) => {
      const parts = el.getAttribute("data-sc-count").trim().split(/\s+/);
      el.textContent = parts[parts.length - 1];
    });
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, "desktop-proof.png"), fullPage: false });
  console.log("wrote", path.join(OUT, "desktop-proof.png"));
  await page.close();
}
await shoot("mobile-top.png", { width: 390, height: 844, scrollTo: 0 });
await shoot("mobile-makeover.png", {
  width: 390,
  height: 844,
  scrollTo: "#makeover",
  script: () => {
    const r = document.getElementById("makeoverRange");
    if (r) {
      r.value = "45";
      r.dispatchEvent(new Event("input", { bubbles: true }));
    }
  },
});


await shoot("desktop-family.png", {
  width: 1440,
  height: 900,
  scrollTo: "#act-family",
});
await shoot("mobile-family.png", {
  width: 390,
  height: 844,
  scrollTo: "#act-family",
});

await browser.close();
console.log("done");

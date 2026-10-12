// Byte-compare the /home case-section shots taken before and after the edit.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const sha = (f) => createHash("sha256").update(readFileSync(join(OUT, f))).digest("hex");
const rows = ["1440", "390"].map((w) => {
  const a = sha(`before-home-${w}-case.png`), b = sha(`after-home-${w}-case.png`);
  return { width: w, before: a, after: b, identical: a === b };
});
console.log(JSON.stringify(rows, null, 1));
writeFileSync(join(OUT, "home-compare.json"), JSON.stringify(rows, null, 1));

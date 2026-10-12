"""Pixel-compare before/after full-page shots and report the HE meta length."""
import json
import re
from pathlib import Path

from PIL import Image, ImageChops

HERE = Path(__file__).resolve().parent
SRC = HERE.parents[2] / "zoho-sites" / "homepage-sites-v5.html"

out = {}
for key in ("home-1440", "home-390", "highered-1440", "highered-390"):
    after = Image.open(HERE / f"after-{key}-full.png").convert("RGB")
    row = {"after_size": after.size}
    for tag in ("before", "before2"):
        img = Image.open(HERE / f"{tag}-{key}-full.png").convert("RGB")
        if img.size != after.size:
            row[tag] = {"size": img.size, "identical": False, "note": "size differs"}
            continue
        box = ImageChops.difference(img, after).getbbox()
        row[tag] = {"identical": box is None, "diff_bbox": box}
    out[key] = row

desc = re.search(r'he:\["[^"]*","([^"]*)"\]', SRC.read_text(encoding="utf-8")).group(1)
out["he_meta"] = {"description": desc, "chars": len(desc)}
print(json.dumps(out, indent=2))
(HERE / "compare.json").write_text(json.dumps(out, indent=2), encoding="utf-8")

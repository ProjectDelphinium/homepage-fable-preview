"""Pixel truth for section spacing: rows of solid section background above the first and below the last painted pixel.

Usage: python pixel_gaps.py <label>   (reads <label>.json + <label>-<page>-<w>-full.png, writes <label>-pixels.json)
"""
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageChops

HERE = Path(__file__).parent
TOL = 10
EDGE = 2  # skip 1px border-block lines and subpixel section edges

label = sys.argv[1]
dom = json.loads((HERE / f"{label}.json").read_text())
out = {}
for key, rows in dom.items():
    shot = HERE / f"{label}-{key}-full.png"
    if not shot.exists():
        continue
    im = Image.open(shot).convert("RGB")
    res = []
    for r in rows:
        if r["display"] == "none" or r["idx"] == 0:
            continue
        rgb = tuple(int(v) for v in re.findall(r"\d+", r["bg"])[:3])
        top, bot = round(r["absTop"]) + EDGE, round(r["absBottom"]) - EDGE
        crop = im.crop((0, top, im.width, bot))
        diff = ImageChops.difference(crop, Image.new("RGB", crop.size, rgb)).convert("L").point(lambda v: 255 if v > TOL else 0)
        bbox = diff.getbbox()
        if not bbox:
            continue
        res.append({
            "idx": r["idx"],
            "section": r["cls"].replace("dl-section ", ""),
            "visTop": bbox[1] + EDGE,
            "visBottom": (bot - top) - bbox[3] + EDGE,
            "_cTop": top + bbox[1],
            "_cBot": top + bbox[3],
            "bg": r["bg"],
        })
    for i, s in enumerate(res):
        if i:
            s["contentGapFromPrev"] = s["_cTop"] - res[i - 1]["_cBot"]
            s["sameBgAsPrev"] = s["bg"] == res[i - 1]["bg"]
    for s in res:
        s.pop("_cTop"); s.pop("_cBot")
    out[key] = res
    print(f"== {key}")
    for s in res:
        print(f'  {s["idx"]:>2} {s["section"]:<32} top {s["visTop"]:>4}  bottom {s["visBottom"]:>4}  gapPrev {s.get("contentGapFromPrev", "")}{"  SAME-BG" if s.get("sameBgAsPrev") else ""}')
(HERE / f"{label}-pixels.json").write_text(json.dumps(out, indent=1))

"""Sample painted colours at x=4 and x=W/2-600 (gutter) for every shown section in the full-page shots.
Usage: python pixels.py <label>   (needs <label>.json + <label>-{home,highered}-1440-full.png from bg.mjs shots)"""
import json
import sys
from collections import Counter
from pathlib import Path

from PIL import Image

HERE = Path(__file__).parent
label = sys.argv[1] if len(sys.argv) > 1 else "before"
data = json.loads((HERE / f"{label}.json").read_text())
for key in ("home", "highered"):
    img = Image.open(HERE / f"{label}-{key}-1440-full.png").convert("RGB")
    print(f"\n## {key}")
    for s in data[key]["sections"]:
        if not s["shown"]:
            print(f"x {s['name']:<16} hidden")
            continue
        top, h = s["top"], s["h"]
        c = Counter()
        for x in (4, 60):
            for y in range(int(top) + 2, int(top + h) - 2, 4):
                c[img.getpixel((x, y))] += 1
        common = ", ".join(f"{rgb}x{n}" for rgb, n in c.most_common(3))
        print(f"  {s['name']:<16} css={s['bg']:<22} painted: {common}")

"""Pixel diff of /home before vs after: bounding boxes of changed rows, and whether any fall inside the Case section."""
import json
from pathlib import Path
from PIL import Image, ImageChops

OUT = Path(__file__).parent
rep = json.loads((OUT / "verify.json").read_text())
res = {}
for tag in ("1440", "390"):
    a = Image.open(OUT / f"before-home-{tag}-full.png").convert("RGB")
    b = Image.open(OUT / f"after-home-{tag}-full.png").convert("RGB")
    entry = {"sizeBefore": a.size, "sizeAfter": b.size}
    if a.size == b.size:
        d = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 0 else 0)
        entry["bbox"] = d.getbbox()
        bands, cur = [], None
        w, h = d.size
        px = d.load()
        for y in range(h):
            hit = any(px[x, y] for x in range(0, w, 1))
            if hit and cur is None:
                cur = [y, y]
            elif hit:
                cur[1] = y
            elif cur is not None:
                bands.append(cur); cur = None
        if cur: bands.append(cur)
        secs = rep[f"after-home-{tag}"]["sections"]
        def where(y):
            for s in secs:
                if s["top"] <= y < s["top"] + s["h"]:
                    return s["cls"] + ("#" + s["id"] if s["id"] else "")
            return "outside main"
        entry["bands"] = [{"y": bnd, "section": where(bnd[0])} for bnd in bands]
    res[tag] = entry
print(json.dumps(res, indent=1))

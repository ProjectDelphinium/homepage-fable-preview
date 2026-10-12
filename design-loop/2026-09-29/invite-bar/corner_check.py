"""Count bar-colored pixels outside the card's 18px corner arc in the untilted diagnostic crops.

Crops are 24x24 CSS px at 8 device px per CSS px, anchored on the card's top-left / top-right corner.
Usage: python corner_check.py before|after
"""
import json
import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
TAG = sys.argv[1] if len(sys.argv) > 1 else "before"
R = 18.0
S = 8  # device px per CSS px


def is_bar(p):
    r, g, b = p[:3]
    return max(r, g, b) > 150 and min(r, g, b) < 200


def check(path, side):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    cx = R if side == "tl" else 24 - R
    outside_bar = 0
    rows = {}
    for y in range(h):
        for x in range(w):
            X, Y = (x + 0.5) / S, (y + 0.5) / S
            if Y >= R:
                continue
            dx = (cx - X) if side == "tl" else (X - cx)
            if dx <= 0:
                continue
            d = (dx * dx + (R - Y) ** 2) ** 0.5
            if d > R + 0.5 and is_bar(px[x, y]):
                outside_bar += 1
                row = int(Y)
                rows[row] = max(rows.get(row, 0), round(d - R, 2))
    return {"bar_px_outside_arc": outside_bar, "css_px2": round(outside_bar / (S * S), 2),
            "max_overhang_css_px_by_row": dict(sorted(rows.items()))}


out = {}
for f in sorted(HERE.glob(f"diag-{TAG}-*.png")):
    side = f.stem.rsplit("-", 1)[1]
    out[f.stem] = check(f, side)
    print(f.stem, json.dumps(out[f.stem]))
(HERE / f"corner-{TAG}.json").write_text(json.dumps(out, indent=1), encoding="utf-8")

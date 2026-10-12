"""Pixel-diff two PNGs and report the bounding box of changed pixels."""
import sys
from pathlib import Path

from PIL import Image, ImageChops

here = Path(__file__).parent
a = Image.open(here / sys.argv[1]).convert("RGB")
b = Image.open(here / sys.argv[2]).convert("RGB")
print("sizes", a.size, b.size)
if a.size == b.size:
    d = ImageChops.difference(a, b)
    box = d.getbbox()
    n = sum(1 for px in d.getdata() if px != (0, 0, 0))
    print("changed pixels", n, "bbox", box)
    if box and len(sys.argv) > 3:
        pad = 40
        crop = (max(0, box[0] - pad), max(0, box[1] - pad), min(a.width, box[2] + pad), min(a.height, box[3] + pad))
        a.crop(crop).save(here / (sys.argv[3] + "-a.png"))
        b.crop(crop).save(here / (sys.argv[3] + "-b.png"))

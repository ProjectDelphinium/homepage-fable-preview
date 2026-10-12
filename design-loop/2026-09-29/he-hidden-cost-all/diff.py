"""K-12 /home .dl-case before vs after: pixel diff per width; lean HE card styles vs shared cards."""
import json
from pathlib import Path
from PIL import Image, ImageChops

OUT = Path(__file__).parent
before = json.loads((OUT / "before.json").read_text(encoding="utf-8"))
after = json.loads((OUT / "after.json").read_text(encoding="utf-8"))
for w in (1440, 1280, 1040, 760, 390):
    a = Image.open(OUT / f"before-k12-{w}.png").convert("RGB")
    b = Image.open(OUT / f"after-k12-{w}.png").convert("RGB")
    bbox = ImageChops.difference(a, b).getbbox() if a.size == b.size else "size differs"
    same_json = before[f"k12-{w}"] == after[f"k12-{w}"]
    print(f"k12-{w}: size {a.size} vs {b.size}, diff bbox {bbox}, probe identical {same_json}")

for w in (1440, 1280, 1040, 760, 390):
    cards = after[f"he-{w}"]["cards"]
    ref = cards[0]["styles"]
    odd = [(i, c["num"]) for i, c in enumerate(cards) if c["styles"] != ref]
    print(f"he-{w}: styles differing from card 1: {odd or 'none'}")

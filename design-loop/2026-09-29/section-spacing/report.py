"""Build spacing.md from before/after DOM + pixel measurements."""
import json
from pathlib import Path

HERE = Path(__file__).parent
NAMES = {
    1: "Case (hidden costs)", 2: "Teach (Canvas knows)", 3: "Control Tower", 4: "Community Builder",
    5: "Makeover", 6: "Engagement (Nobody quits)", 7: "Logos", 8: "Videos", 9: "Proof", 10: "How (Easy to deploy)", 11: "Close",
}


def load(label):
    dom = json.loads((HERE / f"{label}.json").read_text())
    pix = json.loads((HERE / f"{label}-pixels.json").read_text())
    return dom, pix


bd, bp = load("before")
ad, ap = load("after")
lines = [
    "# Section spacing, before and after",
    "",
    "Values in px. `pad` = computed section padding top/bottom. `box` = DOM gap between section edge and first/last visible content box",
    "(text line boxes, images, painted boxes). `pixel` = rows of solid section background in the full-page screenshot",
    "(includes glyph side-bearing on text, and drop shadows eat into it). Preview bar excluded (outside `main`).",
    "",
]
for key in ["home-1440", "home-390", "highered-1440", "highered-390"]:
    lines += [f"## {key}", "", "| # | Section | pad before | pad after | box top before | box top after | box bottom before | box bottom after | pixel top b/a | pixel bottom b/a |", "|---|---|---|---|---|---|---|---|---|---|"]
    bpx = {r["idx"]: r for r in bp[key]}
    apx = {r["idx"]: r for r in ap[key]}
    for b, a in zip(bd[key], ad[key]):
        i = b["idx"]
        if i == 0:
            continue
        if b["display"] == "none":
            lines.append(f"| {i} | {NAMES[i]} | hidden | hidden | | | | | | |")
            continue
        lines.append(
            f'| {i} | {NAMES[i]} | {b["padTop"]:g}/{b["padBottom"]:g} | {a["padTop"]:g}/{a["padBottom"]:g} | {b["visTop"]:g} | {a["visTop"]:g} | {b["visBottom"]:g} | {a["visBottom"]:g} | '
            f'{bpx[i]["visTop"]}/{apx[i]["visTop"]} | {bpx[i]["visBottom"]}/{apx[i]["visBottom"]} |'
        )
    lines.append("")
lines += [
    "## Notes",
    "",
    "- Rhythm: the existing `.dl-section` padding `clamp(4rem, 9vw, 7rem)` (64px at 390, 112px at 1440+), same top and bottom, now used by every section after the hero.",
    "- Control Tower box bottom after reads 76 because the detail image's transformed, transparent overhang sits below its card; the visible card (wrapper) ends 112px above the section edge. Pixel 102 = 112 minus the card shadow.",
    "- Pixel bottoms of 102-105 at 1440 (Control Tower, Makeover, Engagement, Proof) are card or button drop shadows inside the 112px padding.",
    "- Close keeps padding-top 0: it shares the paper background with How, so How's 112/64 bottom padding is the single gap above the navy stage. Pixel bottom is lower than 112/64 because of the stage's large drop shadow.",
    "- /highered: Case and Logos are display:none and leave no gap. Engagement and Videos then share the paper background, so Videos gets padding-top 0 on /highered (one 112/64 gap, matching How to Close).",
    "- `#customers` gets a scroll-margin offset so the nav jump still lands its eyebrow at the same 4rem as the other nav jumps (measured 184-185px from viewport top for all three tested anchors at 1440 and 390).",
    "",
]
(HERE / "spacing.md").write_text("\n".join(lines), encoding="utf-8")
print("\n".join(lines))

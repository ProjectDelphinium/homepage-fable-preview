"""Print boundary gap tables from measure.mjs output. Usage: python report.py before [after] [-v]

Colour-change boundaries: above / below / diff (below - above).
Same-background seams (no visible edge): only the total ink-to-ink gap matters, shown as "= total".
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
verbose = "-v" in sys.argv
labels = [a for a in sys.argv[1:] if a != "-v"] or ["before"]
data = {l: json.loads((HERE / f"{l}.json").read_text()) for l in labels}
keys = list(data[labels[0]].keys())


def cell(b):
    if b is None:
        return "-"
    if b["sameBg"]:
        return f"= {b['total']} (seam)"
    return f"{b['gapAbove']} / {b['gapBelow']} ({b['diff']:+})"


for key in keys:
    print(f"\n## {key}")
    print("| boundary | " + " | ".join(f"{l}: above / below (diff)" for l in labels) + " |")
    print("|---|" + "---|" * len(labels))
    rows = {l: {b["boundary"]: b for b in data[l][key]["boundaries"]} for l in labels}
    for name in rows[labels[0]]:
        print(f"| {name} | " + " | ".join(cell(rows[l].get(name)) for l in labels) + " |")
        if verbose:
            b = rows[labels[-1]].get(name)
            print(f"|   last: {b['lastInk']} / first: {b['firstInk']} |")

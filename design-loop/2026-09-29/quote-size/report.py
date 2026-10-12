"""Before/after quote type (check.json vs after.json, branch render) and layout diff (layout.json head vs work)."""
import json
from pathlib import Path

HERE = Path(__file__).parent
before = json.loads((HERE / "check.json").read_text(encoding="utf-8"))
after = json.loads((HERE / "after.json").read_text(encoding="utf-8"))

print("## Quote body text (blockquote p), branch before -> after")
for page in ("home", "highered"):
    for vw in ("1440", "390"):
        b = {r["key"]: r for r in before[f"branch-{page}-{vw}"]["rows"]}
        a = {r["key"]: r for r in after[f"branch-{page}-{vw}"]["rows"]}
        for k, ra in a.items():
            if not (k.startswith("p|\u201c") or k.startswith("cite|") or k.startswith("span|")):
                continue
            rb = b.get(k)
            if k.startswith("span|"):
                continue
            tag = "cite" if k.startswith("cite|") else "quote"
            print(f"{page:8} {vw:4} {tag:5} {k[2:40] if tag=='quote' else k[5:40]:38} "
                  f"{rb['fs']}/{rb['lh']} {rb['fw']} h{rb['h']} -> {ra['fs']}/{ra['lh']} {ra['fw']} h{ra['h']}")
        others = [k for k in a if not (k.startswith("p|\u201c") or k.startswith("cite|") or k.startswith("span|"))]
        changed = [k for k in others if k in b and (b[k]["fs"], b[k]["h"]) != (a[k]["fs"], a[k]["h"])]
        print(f"  non-quote rows changed on {page} {vw}: {changed or 'none'}")

lay = json.loads((HERE / "layout.json").read_text(encoding="utf-8"))
print("\n## Layout head -> work")
for page in ("home", "highered"):
    for w in (390, 960, 1024, 1180, 1280, 1440):
        h, k = lay[f"head-{page}-{w}"], lay[f"work-{page}-{w}"]
        ct_h, ct_k = h["ctSection"], k["ctSection"]
        line = f"{page:8} {w:5} doc {h['doc']}->{k['doc']}  ct {ct_h['h']}->{ct_k['h']}"
        if k["ctPull"]:
            line += (f"  ctPull h {h['ctPull']['h']}->{k['ctPull']['h']} top {h['ctPull']['t']-ct_h['t']}->{k['ctPull']['t']-ct_k['t']}"
                     f"  copyEnd->pull gap {h['ctPull']['t']-h['ctCopyLastBottom']}->{k['ctPull']['t']-k['ctCopyLastBottom']}")
        if k["ctMore"] and k["ctDetail"]:
            line += f"  more.b vs detail.b {h['ctMore']['b']-h['ctDetail']['b']}->{k['ctMore']['b']-k['ctDetail']['b']}"
            line += f"  more.r vs detail.l {h['ctMore']['r']-h['ctDetail']['l']}->{k['ctMore']['r']-k['ctDetail']['l']}"
        if k["mkQuotes"]:
            line += f"  mkQuotes h {h['mkQuotes']['h']}->{k['mkQuotes']['h']} mkAside h {h['mkAside']['h']}->{k['mkAside']['h']}"
        print(line)
        diffs = {s: (h["sections"].get(s), v) for s, v in k["sections"].items() if h["sections"].get(s) != v}
        print("   section heights changed:", diffs or "none")

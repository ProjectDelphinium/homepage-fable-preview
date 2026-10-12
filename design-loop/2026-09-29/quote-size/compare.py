"""Diff computed type per quote-like element across the three renders in <label>.json."""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
data = json.loads((HERE / f"{sys.argv[1] if len(sys.argv) > 1 else 'before'}.json").read_text(encoding="utf-8"))

for page in ("home", "highered"):
    for vw in ("1440", "390"):
        rows = {s: {r["key"]: r for r in data[f"{s}-{page}-{vw}"]["rows"]} for s in ("live51620fc", "branch", "site")}
        keys = list(dict.fromkeys([*rows["site"], *rows["live51620fc"], *rows["branch"]]))
        print(f"\n== {page} @ {vw}")
        for k in keys:
            vals = []
            for s in ("site", "live51620fc", "branch"):
                r = rows[s].get(k)
                vals.append(f"{r['fs']}/{r['lh']}/{r['fw']} {r['ff']} w{r['w']} h{r['h']}" if r else "-")
            flag = "" if len({v.rsplit(' h', 1)[0] for v in vals}) == 1 else "  <-- DIFF"
            print(f"{k[:60]:60} | site {vals[0]} | 51620fc {vals[1]} | branch {vals[2]}{flag}")

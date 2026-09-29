import importlib.util, json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent; sys.path.insert(0,str(ROOT))
spec=importlib.util.spec_from_file_location("w",str(ROOT/"publish_sites_v5_2026_09_28_local.py")); w=importlib.util.module_from_spec(spec); spec.loader.exec_module(w)
out=w.v5.OUT; r={"notes":[]}
r["verify"]=w.verify_public(out); w.capture_verify_pack(out,r)
(out/"RESULT-verify-only.json").write_text(json.dumps(r,indent=2)); print(json.dumps(r,indent=1)[:6000])

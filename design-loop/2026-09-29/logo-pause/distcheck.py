import difflib
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
URL = re.compile(r"https?://[^\"'\s)<>]+")
ORIGIN = re.compile(r'data-site-origin="[^"]*"')

for name in ["zoho-header.html", "zoho-footer.html", "zoho-custom.css", "zoho-ready.html"]:
    rel = f"zoho-sites/dist/homepage-sites-v5.{name}"
    old = subprocess.run(["git", "show", f"HEAD:{rel}"], cwd=ROOT, capture_output=True).stdout.decode("utf-8").replace("\r", "")
    new = (ROOT / rel).read_text(encoding="utf-8").replace("\r", "")
    added_urls = sorted(set(URL.findall(new)) - set(URL.findall(old)))
    print(f"== {name}: {len(old)} -> {len(new)} chars")
    print("   new urls:", added_urls or "none")
    print("   site-origin same:", ORIGIN.findall(old) == ORIGIN.findall(new), sorted(set(ORIGIN.findall(new))))
    print("   em dash added:", new.count("\u2014") - old.count("\u2014"))
    if name in ("zoho-header.html", "zoho-footer.html"):
        sm = difflib.SequenceMatcher(None, old, new, autojunk=False)
        for op, a1, a2, b1, b2 in sm.get_opcodes():
            if op != "equal":
                print(f"   {op}: {old[a1:a2]!r} -> {new[b1:b2]!r}")

"""Snapshot external URLs + data-site-origin across zoho-sites/dist. Usage: python dist_urls.py <out.json>"""
import json
import re
import sys
from pathlib import Path

DIST = Path(__file__).resolve().parents[3] / "zoho-sites" / "dist"
urls, origins, sizes = set(), set(), {}
for f in sorted(DIST.glob("homepage-sites-v5.*")):
    t = f.read_text(encoding="utf-8")
    sizes[f.name] = len(t)
    urls |= set(re.findall(r"https?://[^\s\"'()<>\\]+", t))
    origins |= set(re.findall(r'data-site-origin="([^"]*)"', t))
Path(sys.argv[1]).write_text(json.dumps({"sizes": sizes, "origins": sorted(origins), "urls": sorted(urls)}, indent=1))
print(sizes, sorted(origins), len(urls))

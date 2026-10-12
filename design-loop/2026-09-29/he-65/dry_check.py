"""Run every build_zoho_pack assertion without writing dist."""
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "tools" / "zoho"))
import build_zoho_pack as b  # noqa: E402

if not shutil.which("terser"):
    def _minify(js: str) -> str:
        argv = [shutil.which("npx.cmd"), "--yes", "terser", "-c", "-m", "--ecma", "2015"]
        proc = subprocess.run(argv, input=js, capture_output=True, text=True, encoding="utf-8", check=False)
        if proc.returncode != 0:
            raise SystemExit("terser failed:\n" + proc.stderr)
        return proc.stdout

    b.minify_js = _minify

doc, _ = b.transform_document(b.SRC.read_text(encoding="utf-8"))
doc = b.inject_seo(doc)
b.flag_copy(doc)
b.custom_css(doc)
header, footer = b.split_parts(b.header_code(doc))
b.assert_split(header, footer)
b.assert_seo(header, footer)
b.assert_cap("header", header)
b.assert_cap("footer", footer)
card = header.replace("&#32;", " ")
print("dropout card 65%:", "<b>65%</b> <span>fewer dropouts</span>" in card, "| 66% present:", "<b>66%</b>" in card)
print(f"all checks passed; header {len(header)} / footer {len(footer)} (cap {b.CHAR_CAP})")

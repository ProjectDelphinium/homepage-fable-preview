"""Measure Zoho pack field sizes without writing dist (imports build_zoho_pack functions)."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "tools" / "zoho"))
import build_zoho_pack as b  # noqa: E402
import shutil  # noqa: E402

_which = shutil.which
if not _which("terser"):
    import subprocess

    def _minify(js: str) -> str:
        argv = [_which("npx.cmd"), "--yes", "terser", "-c", "-m", "--ecma", "2015"]
        proc = subprocess.run(argv, input=js, capture_output=True, text=True, encoding="utf-8", check=False)
        if proc.returncode != 0:
            raise SystemExit("terser failed:\n" + proc.stderr)
        return proc.stdout

    b.minify_js = _minify

src = b.SRC.read_text(encoding="utf-8")
doc, _ = b.transform_document(src)
doc = b.inject_seo(doc)
css = b.custom_css(doc)
header, footer = b.split_parts(b.header_code(doc))
print(f"header: {len(header)} / {b.CHAR_CAP}")
print(f"footer: {len(footer)} / {b.CHAR_CAP}")
print(f"custom css: {len(css)} (no cap check)")
print("indent in css:", "margin-left: 0.5in" in css)
print("indent in header/footer:", "margin-left: 0.5in" in header or "margin-left: 0.5in" in footer)

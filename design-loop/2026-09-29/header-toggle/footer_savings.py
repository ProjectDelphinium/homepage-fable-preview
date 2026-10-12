"""Read-only: where Footer Code could give back chars."""
import pathlib

f = (pathlib.Path(__file__).resolve().parents[3] / "zoho-sites/dist/homepage-sites-v5.zoho-footer.html").read_text(encoding="utf-8")
print("footer", len(f), "left", 44900 - len(f))
for k in [' focusable="false"', " noreferrer", ' title="Delphinium on', ' title="Jared', ' aria-hidden="true"',
          "data-site-path", ' target="_blank"', "noopener noreferrer"]:
    print(f"{f.count(k):3d} x {len(k):3d} = {f.count(k) * len(k):5d}  {k!r}")

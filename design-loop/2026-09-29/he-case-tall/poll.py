import hashlib, os, re, sys, time

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
HTML = os.path.join(ROOT, "zoho-sites", "homepage-sites-v5.html")
O2 = os.path.join(ROOT, "design-loop", "2026-09-29", "he-case-order2")
O3 = os.path.join(ROOT, "design-loop", "2026-09-29", "he-case-order3")


def section_hash():
    s = open(HTML, encoding="utf-8").read()
    m = re.search(r'<section class="dl-section dl-case".*?</section>', s, re.S)
    css = "\n".join(l for l in s.splitlines() if "dl-case" in l or "dl-he" in l)
    return hashlib.md5(((m.group(0) if m else "") + css).encode()).hexdigest()[:10]


def listing(d):
    if not os.path.isdir(d):
        return []
    return sorted(os.listdir(d))


max_min = float(sys.argv[1]) if len(sys.argv) > 1 else 20
last, stable_since = None, time.time()
start = time.time()
while True:
    h = section_hash()
    if h != last:
        last, stable_since = h, time.time()
    o3 = listing(O3)
    o3_done = any(f.endswith(".png") and not f.startswith("baseline") for f in o3) and any(f.endswith(".json") for f in o3)
    stable = time.time() - stable_since
    print(f"{time.strftime('%H:%M:%S')} hash={h} stable={stable:.0f}s o2={len(listing(O2))} o3={o3}", flush=True)
    if o3_done and stable >= 120:
        print("READY", flush=True)
        break
    if time.time() - start > max_min * 60:
        print("TIMEOUT", flush=True)
        break
    time.sleep(60)

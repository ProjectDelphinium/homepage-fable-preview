#!/usr/bin/env bash
# Live Sites v5 preview for rapid design iteration.
# Serves zoho-sites/homepage-sites-v5.html on :8766 and keeps /tmp in sync
# so Cloudflare tunnels and Simple Browser see edits within ~1s.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/zoho-sites"
OUT="/tmp/sites-v5-preview"
PORT="${SITES_V5_PORT:-8766}"
SYNC_SEC="${SITES_V5_SYNC_SEC:-1}"

mkdir -p "$OUT"
rsync -a --delete \
  --exclude '.DS_Store' \
  "$SRC/" "$OUT/"
ln -sfn homepage-sites-v5.html "$OUT/index.html"

echo "[sites-v5] synced $SRC -> $OUT"
echo "[sites-v5] open http://127.0.0.1:${PORT}/homepage-sites-v5.html"

# Prefer reusing an existing listener on PORT
if ! curl -sf -o /dev/null "http://127.0.0.1:${PORT}/homepage-sites-v5.html"; then
  (cd "$OUT" && exec python3 -m http.server "$PORT") &
  HTTP_PID=$!
  echo "[sites-v5] http.server pid $HTTP_PID on :$PORT"
  trap 'kill $HTTP_PID 2>/dev/null || true' EXIT
  sleep 0.4
fi

# Background sync loop (mtime poll — no extra deps)
(
  last=""
  while true; do
    stamp="$(find "$SRC" -type f -printf '%T@ %p\n' 2>/dev/null | sort | md5sum | awk '{print $1}')"
    if [[ "$stamp" != "$last" ]]; then
      rsync -a --delete --exclude '.DS_Store' "$SRC/" "$OUT/"
      ln -sfn homepage-sites-v5.html "$OUT/index.html"
      last="$stamp"
      echo "[sites-v5] synced $(date -u +%H:%M:%S)"
    fi
    sleep "$SYNC_SEC"
  done
) &
SYNC_PID=$!
trap 'kill $HTTP_PID $SYNC_PID 2>/dev/null || true' EXIT

# Optional Cloudflare quick tunnel for Design Mode when IDE localhost tunnel is flaky
CF_BIN="$(command -v cloudflared || true)"
[[ -z "$CF_BIN" && -x "$HOME/bin/cloudflared" ]] && CF_BIN="$HOME/bin/cloudflared"
[[ -z "$CF_BIN" && -x /tmp/cloudflared ]] && CF_BIN=/tmp/cloudflared
if [[ "${SITES_V5_CF:-1}" == "1" && -n "$CF_BIN" ]]; then
  echo "[sites-v5] starting cloudflared (SITES_V5_CF=0 to skip)..."
  "$CF_BIN" tunnel --url "http://127.0.0.1:${PORT}" 2>&1 | tee /tmp/sites-v5-cloudflared.log &
  CF_PID=$!
  trap 'kill $HTTP_PID $SYNC_PID $CF_PID 2>/dev/null || true' EXIT
  for _ in $(seq 1 20); do
    url="$(rg -o 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/sites-v5-cloudflared.log 2>/dev/null | tail -1 || true)"
    if [[ -n "$url" ]]; then
      echo "[sites-v5] CF preview: ${url}/homepage-sites-v5.html"
      echo "$url" >/tmp/sites-v5-cf-url.txt
      break
    fi
    sleep 0.5
  done
fi

echo "[sites-v5] watching for edits (Ctrl+C to stop)"
wait

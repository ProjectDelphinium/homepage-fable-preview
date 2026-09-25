#!/usr/bin/env bash
# Boot Sites v5 preview in a durable tmux session (for Cloud Agent start/terminals).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SESSION="sites-v5-dev"
TMUX_CFG="/exec-daemon/tmux.portal.conf"
TMUX=(tmux)
[[ -f "$TMUX_CFG" ]] && TMUX=(tmux -f "$TMUX_CFG")

mkdir -p "$HOME/bin"
export PATH="$HOME/bin:$PATH"
if [[ ! -x "$HOME/bin/cloudflared" ]]; then
  curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
    -o "$HOME/bin/cloudflared" && chmod +x "$HOME/bin/cloudflared"
fi

"${TMUX[@]}" has-session -t "=$SESSION" 2>/dev/null || \
  "${TMUX[@]}" new-session -d -s "$SESSION" -c "$ROOT" -- "${SHELL:-bash}" -l

# Ensure http.server on 8766
if ! curl -sf -o /dev/null "http://127.0.0.1:8766/homepage-sites-v5.html"; then
  mkdir -p /tmp/sites-v5-preview
  rsync -a --delete --exclude '.DS_Store' "$ROOT/zoho-sites/" /tmp/sites-v5-preview/
  ln -sfn homepage-sites-v5.html /tmp/sites-v5-preview/index.html
  "${TMUX[@]}" new-window -t "$SESSION" -n http -c /tmp/sites-v5-preview -- \
    bash -lc 'python3 -m http.server 8766'
fi

# Sync loop (~1s) so Design Mode / CF see edits without manual refresh of the export
if ! "${TMUX[@]}" list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx sync; then
  "${TMUX[@]}" new-window -t "$SESSION" -n sync -c "$ROOT" -- bash -lc '
    SRC=/workspace/zoho-sites; OUT=/tmp/sites-v5-preview; last="";
    while true; do
      stamp=$(find "$SRC" -type f -printf "%T@ %p\n" 2>/dev/null | sort | md5sum | awk "{print \$1}");
      if [ "$stamp" != "$last" ]; then
        rsync -a --delete --exclude .DS_Store "$SRC/" "$OUT/";
        ln -sfn homepage-sites-v5.html "$OUT/index.html";
        last="$stamp"; echo "[sync] $(date -u +%H:%M:%S)";
      fi;
      sleep 1;
    done'
fi

# Cloudflare tunnel for Design Mode when IDE localhost is flaky
if ! "${TMUX[@]}" list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx cf; then
  "${TMUX[@]}" new-window -t "$SESSION" -n cf -c "$ROOT" -- bash -lc '
    export PATH="$HOME/bin:$PATH"
    rm -f /tmp/sites-v5-cloudflared.log
    cloudflared tunnel --url http://127.0.0.1:8766 2>&1 | tee /tmp/sites-v5-cloudflared.log'
fi

sleep 3
url=$(rg -o "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/sites-v5-cloudflared.log 2>/dev/null | tail -1 || true)
if [[ -n "$url" ]]; then
  echo "$url" >/tmp/sites-v5-cf-url.txt
  echo "[sites-v5] CF: ${url}/homepage-sites-v5.html"
fi
echo "[sites-v5] local: http://127.0.0.1:8766/homepage-sites-v5.html"
echo "[sites-v5] tmux session: $SESSION"

#!/usr/bin/env bash
# Boot Sites v5 preview in a durable tmux session (for Cloud Agent start/terminals).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SESSION="sites-v5-dev"
TMUX_CFG="/exec-daemon/tmux.portal.conf"
TMUX=(tmux)
[[ -f "$TMUX_CFG" ]] && TMUX=(tmux -f "$TMUX_CFG")

"${TMUX[@]}" has-session -t "=$SESSION" 2>/dev/null || \
  "${TMUX[@]}" new-session -d -s "$SESSION" -c "$ROOT" -- "${SHELL:-bash}" -l

# Kill stale preview helpers on 8766 / old tunnels for this session only
"${TMUX[@]}" send-keys -t "$SESSION:0.0" C-c 2>/dev/null || true
sleep 0.2
"${TMUX[@]}" send-keys -t "$SESSION:0.0" "cd '$ROOT' && SITES_V5_CF=1 bash scripts/sites-v5-preview.sh" C-m
echo "[sites-v5] booted tmux session $SESSION"

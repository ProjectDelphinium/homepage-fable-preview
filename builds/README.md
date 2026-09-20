# Homepage builds

Local design builds synced from the Web Design desk box (`delphinium-os/web-design/builds/`).

| Folder | Role |
|--------|------|
| `homepage/` | Primary scroll-craft build + BRIEF + SCORE + verify screenshots |
| `homepage-live-v1/` | Live-surface grammar variant |
| `homepage-split-v1/` | Split-stage variant |

Each build typically includes `index.html`, `theme.css`, inlined `scrollcraft.js` / `scrollcraft.css`, `assets/`, and optional `verify/` screenshots.

The repo-root `index.html` is the public GitHub Pages draft (separate lineage from these builds). Prefer iterating with BRIEF fidelity and SOURCE claims; do not treat any build as production.

`node_modules` (if any) are not committed — reinstall from `package.json` if needed.

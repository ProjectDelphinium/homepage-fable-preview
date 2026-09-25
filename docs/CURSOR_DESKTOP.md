# Cursor desktop — Delphinium homepage workspace

## Open this repo

**Canonical workspace:** [ProjectDelphinium/homepage-fable-preview](https://github.com/ProjectDelphinium/homepage-fable-preview)

1. In Cursor desktop: **File → Open Folder** (or clone via GitHub) on `homepage-fable-preview`.
2. Use branch `main` for the public draft; open PRs for design work.
3. Cloud Agents should use **this same repo** so they see builds, ops docs, and context together.

**Biz ops:** Cursor Environment `delphinium-bizops` · never Product/serverless.

**Mirror:** `japomani/delphinium-homepage-fable-preview` (GitHub Pages preview). Prefer pushing / PRing against `ProjectDelphinium/homepage-fable-preview`.

### Windows PC (one-shot)

Needs [Git for Windows](https://git-scm.com/download/win) + [Python](https://www.python.org/downloads/) (check **Add to PATH**).

In **PowerShell**:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\windows\setup-and-preview.ps1
```

If you do not have the repo yet, clone first then run that script, or paste:

```powershell
git clone https://github.com/ProjectDelphinium/homepage-fable-preview.git $HOME\Documents\homepage-fable-preview
cd $HOME\Documents\homepage-fable-preview
git checkout cursor/hero-h1-first-line-25b0
powershell -ExecutionPolicy Bypass -File .\scripts\windows\setup-and-preview.ps1
```

Then in Cursor: **File → Open Folder** → `Documents\homepage-fable-preview`, and Design Mode on `http://127.0.0.1:8766/homepage-sites-v5.html`.

Preview-only later: `powershell -ExecutionPolicy Bypass -File .\scripts\windows\sites-v5-preview.ps1`

## What is in the tree

| Area | Purpose |
|------|---------|
| `index.html` | Current public Pages draft |
| `context/` | BRIEF, SOURCE, positioning (canonical for agents) |
| `builds/` | Local homepage design builds + verify shots |
| `ops/` | Fingerprints, brief pack, brand SOURCE, HubSpot inventory |
| `refs/scroll-craft/` | Taste / skill notes (not the full engine) |
| `forms/` | Zoho CRM form share pages |
| `docs/` | Agent prompt, changelog, Zoho publish, this file |
| `.cursor/rules/` | Repo rules for Cursor |

## Cloud Agents

- Point Cloud Agents at **ProjectDelphinium/homepage-fable-preview**.
- Read `HANDOFF.md` first, then `context/BRIEF.md` and `context/SOURCE.md`.
- Do **not** edit HubSpot, DNS, or production Zoho.
- Full scroll-craft engine (if needed for tooling) lives on the agent box at `/workspace/scroll-craft/` — not vendored here.

## Web Design desk

Grok Web Design watches PRs on this repo, reviews craft/claims, and handles Zoho staging after Jared says the draft is ready. See `docs/ZOHO_SITES_PUBLISH.md`.

## Sites v5 rapid design (live preview)

Working file: `zoho-sites/homepage-sites-v5.html` (not root `index.html`).

```bash
# One-shot durable preview + ~1s file sync + Cloudflare URL for Design Mode
bash scripts/sites-v5-preview-boot.sh
# Then open the printed CF URL, or http://127.0.0.1:8766/homepage-sites-v5.html
```

Tips for speed:
- Stay on one Sites branch (current polish: `cursor/hero-h1-first-line-25b0`; shipped pack: `main`). Avoid craft-polish for Sites HTML.
- Keep **Multitask Mode off** for rapid-fire Design Mode prompts.
- Cloud Agent env: **delphinium-bizops** (not Product/serverless).
- If Simple Browser localhost fails, use the Cloudflare URL from `/tmp/sites-v5-cf-url.txt`.

## Suggested start

Paste `docs/CURSOR_AGENT_PROMPT.md` when launching an Agent session.

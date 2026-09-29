# Cursor desktop — Delphinium homepage workspace

## Open this repo

**Canonical workspace:** [ProjectDelphinium/homepage-fable-preview](https://github.com/ProjectDelphinium/homepage-fable-preview)

1. In Cursor desktop: **File → Open Folder** (or clone via GitHub) on `homepage-fable-preview`.
2. Branch from `main` (it matches live). Open a PR and leave it open until Jared approves the live result. See `zoho-sites/LIVE.md`.
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
- Do **not** edit HubSpot, DNS, or Zoho, and do not run publish scripts. Grok Bot (Web Design) ships when Jared says so. See `zoho-sites/LIVE.md`.
- Full scroll-craft engine (if needed for tooling) lives on the agent box at `/workspace/scroll-craft/` — not vendored here.

## Web Design desk

Grok Web Design watches PRs on this repo and reviews craft and claims. When Jared says to ship, Grok Bot publishes that PR to https://www.delphi-me.com. Cursor does not publish. See `zoho-sites/LIVE.md`.

## Sites v5 rapid design (live preview)

Working file: `zoho-sites/homepage-sites-v5.html` (not root `index.html`).

```bash
# One-shot durable preview + ~1s file sync + Cloudflare URL for Design Mode
bash scripts/sites-v5-preview-boot.sh
# Then open the printed CF URL, or http://127.0.0.1:8766/homepage-sites-v5.html
```

Tips for speed:
- Branch from `main`. Live pack SHA is `51620fc`. Avoid craft-polish for Sites HTML.
- Keep **Multitask Mode off** for rapid-fire Design Mode prompts.
- Cloud Agent env: **delphinium-bizops** (not Product/serverless).
- If Simple Browser localhost fails, use the Cloudflare URL from `/tmp/sites-v5-cf-url.txt`.

## Release workflow

Biz ops · Cursor Environment `delphinium-bizops` · never Product/serverless.

1. `git fetch origin && git checkout -b <your-branch> origin/main`
2. Edit `zoho-sites/homepage-sites-v5.html` and rebuild with `python3 tools/zoho/build_zoho_pack.py`.
3. Open a PR into `main`. Leave it open. Do not merge until live is verified.
4. Tell Web Design (Grok Bot) to ship, for example `ship PR #N`.
5. After Jared approves the live result, merge the PR so `main` again equals live.

`delphinium-marketing-staging.zohosites.com` now 301s to www. Preview is the open PR. Guardrails and the live page list are in `zoho-sites/LIVE.md`.

## Suggested start

Paste `docs/CURSOR_AGENT_PROMPT.md` when launching an Agent session.

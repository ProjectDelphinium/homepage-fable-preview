# Cursor desktop — Delphinium homepage workspace

## Open this repo

**Canonical workspace:** [ProjectDelphinium/homepage-fable-preview](https://github.com/ProjectDelphinium/homepage-fable-preview)

1. In Cursor desktop: **File → Open Folder** (or clone via GitHub) on `homepage-fable-preview`.
2. Use branch `main` for the public draft; open PRs for design work.
3. Cloud Agents should use **this same repo** so they see builds, ops docs, and context together.

**Mirror:** `japomani/delphinium-homepage-fable-preview` (GitHub Pages preview). Prefer pushing / PRing against `ProjectDelphinium/homepage-fable-preview`.
Biz ops · Cursor Environment delphinium-bizops · never Product/serverless.

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

## Suggested start

Paste `docs/CURSOR_AGENT_PROMPT.md` when launching an Agent session.

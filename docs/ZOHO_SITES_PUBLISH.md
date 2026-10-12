# Zoho Sites publish

www.delphi-me.com has been live on Zoho Sites since the 2026-09-28 cutover. `zoho-sites/LIVE.md` is the source of truth for what is live and for the release workflow. This file covers how a publish happens and who does it.

## Who publishes

- **Cursor agents in this repo do not publish.** They change source, rebuild `zoho-sites/dist/`, and open a PR. No Zoho publish, HubSpot, or DNS changes from an agent run.
- **Web Design** (the Grok Bot desk) publishes the PR build to staging, then to live after Jared approves.
- **Jared OK required** before any live publish and before any DNS or domain change.

## Release workflow (summary of `zoho-sites/LIVE.md`)

1. Branch from `main`, open a PR into `main`.
2. Web Design publishes the PR build to **staging** (`https://delphinium-marketing-staging.zohosites.com`).
3. Jared approves the staging result.
4. Web Design publishes to **live** (`https://www.delphi-me.com`).
5. Verify live (`zoho-sites/scripts/verify/verify_golive_2026_09_28.py`).
6. Merge the PR so `main` again equals live.

## How the publish works

- There is **no Zoho Sites REST API** for this. Publishing is browser automation of the Sites builder: Playwright on a dedicated Chromium (`channel="chrome"`), the "Jev+Playwright" path in `zoho-sites/scripts/publish/`. Grok computer-use is only a fallback.
- The session comes from a stored Zoho browser session on the Web Design box (never in this repo). On a login wall the script prefers waiting for a OneAuth push (up to 4 minutes); `publish_sites_v5.py` adds a password-login fallback through the box vault.
- Route guards block every host except Zoho and the allowlist (HubSpot is blocked).
- Site-wide parts: **Custom CSS**, **Header Code**, **Footer Code** from `zoho-sites/dist/`. Each code part is saved, then read back from the editor and compared exactly. If any part does not match, the script does not publish.
- Publish counts as done only when the `/zs-site/api/v1/publish` POST returns 200, then the public page is verified.
- Header Code and Footer Code each stay **under 44,900 characters** (the publish script asserts this). Zoho trims leading whitespace, so compare after `lstrip()`.

Script inventory and history: `zoho-sites/scripts/README.md`.

## Constraints

- Claims stay within `context/SOURCE.md` / `ops/brand/SOURCE.md`.
- Use the existing Zoho Bookings URLs already in the pack. Never use `bookings.delphi-me.com`.
- All assets are hosted on Zoho (`/dl28-*`). No HubSpot or GitHub hotlinks.
- No secrets, cookies, or session files in this repo.

## Related

- `zoho-sites/LIVE.md`: live site map, release workflow, guardrails
- `zoho-sites/scripts/README.md`: build, publish, cutover, and verify scripts
- `HANDOFF.md`: mission, hard nos
- `ops/brief/zoho-plugins-modules-2026-09-09.md`: Zoho Sites module notes

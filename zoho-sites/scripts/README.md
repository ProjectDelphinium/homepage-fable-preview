# Zoho Sites scripts (as used for the live cutover, 2026-09-28)

Copied from the working copies on the agent box (`delphinium-os/web-design/zoho-sites/` and `.../cutover/`) so the repo has a record of how the live site was built and published. These are **snapshots** that still hold box-specific absolute paths (`/workspace/...`). They are not wired up as a runnable toolchain in this repo yet.

**No credentials are stored here.** At runtime the publish scripts load a Zoho browser session and agent login from the box vault (`/workspace/.secrets/...`, `vault/agent_login.py`). Those files are not in the repo and must never be committed. The vault entry id in `publish/publish_sites_v5.py` was replaced with the `ZOHO_AGENT_LOGIN_ID` env var.

## build/
- `build_zoho_pack.py` plus `fonts-selfhost.css`, `safety-reset.css` and `zoho-chrome-hide.css`: the pack builder from `tools/zoho/` at commit `c3ea350` (PR #20 branch). It produced `zoho-sites/dist/` at `c3ea350`, and that output became the live pack (`dist-prod-c3ea350`). The one difference in the live Header Code is that `data-site-origin` on `.dl-top` is set to `https://www.delphi-me.com` (in the build it was the staging origin). Custom CSS and Footer Code match byte for byte.
- `build_pack_2026_09_28_v2.py`, `split_pack_2026_09_28.py`: earlier local pack build and the Header/Footer split step, from the same day.

## publish/
- `publish_sites_pr20_2026_09_28.py`: pushes a dist folder (Custom CSS, Header Code, Footer Code) site-wide and reads it back to confirm an exact match. It asserts that Header and Footer are each under 44,900 characters.
- `publish_sites_v5_2026_09_28_local.py` → `publish_sites_v5.py` → `publish_sites_v3.py`: the helper chain it imports (auth, CodeMirror save, publish, route guards).
  - Not included: `stage_sites_v1.py`. `publish_sites_v5.py` imports it only for the password-login fallback, and it is a credential-handling module.
- `zoho_files_upload_2026_09_28.py`: uploads the `/dl28-*` assets to Zoho Files.
- `zoho-chrome-hide.css`: the chrome-hide CSS that `publish_sites_v5.py` reads.

## cutover/
Scripts from the go-live: native legal pages (`zoho_legal_native.py`), Desk WebToCase form setup (`zoho_desk_forms.py`), home snippet drop, page create/indexable/un-noindex steps, logo upload, domain verify and SSL (`zoho_ssl.py`).

## verify/
- `verify_golive_2026_09_28.py`: checks the live pages (`/`, `/contact-us`, `/support`, `/eula`, `/purchase-agreement`) for HubSpot references, hotlinks, broken images and forms.
- `verify_pr20_2026_09_28.py`, `verify_only_2026_09_28.py`: verification against staging.

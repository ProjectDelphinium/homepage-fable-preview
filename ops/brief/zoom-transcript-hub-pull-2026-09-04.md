# Zoom Hub cloud-recording transcript pull — 2026-09-04

**When:** 2026-09-04 ~19:00 MDT (America/Denver)  
**For:** Delphinium / Jared Chapman (Web Design brief support)  
**Mode:** Download-only (S2S OAuth). Did **not** write HubSpot, Slack, Asana, or mutate `processed-meetings.json` / claim ledger.

**Auth:** Fresh S2S token from `/workspace/.secrets/zoom-s2s.env` → `/tmp/zoom-hub-pull-2026-09-04/token`  
Scopes present include: `cloud_recording:read:list_user_recordings:admin`, `cloud_recording:read:recording:admin`, `cloud_recording:read:meeting_transcript:admin`, past meetings/participants, meeting summaries, `my_notes:*:admin`, `user:read:user:admin`.

---

## Date windows queried

Month-by-month `GET /users/me/recordings` and `GET /users/Dt-ScQReThqGXGv6yHt_-Q/recordings` (same host: Jared `jared@delphi-me.com`):

| From | To | Meetings (unique across both user keys) |
|---|---|---|
| 2025-09-01 | 2025-09-30 | 0 |
| 2025-10-01 | 2025-10-31 | 1 |
| 2025-11-01 | 2025-11-30 | 1 |
| 2025-12-01 | 2025-12-31 | 0 |
| 2026-01-01 | 2026-01-31 | 1 |
| 2026-02-01 | 2026-02-28 | 6 |
| 2026-03-01 | 2026-03-31 | 3 |
| 2026-04-01 | 2026-04-30 | 0 |
| 2026-05-01 | 2026-05-31 | 1 |
| 2026-06-01 | 2026-06-30 | 2 |
| 2026-07-01 | 2026-07-31 | 0 |
| 2026-08-01 | 2026-08-31 | 3 |
| 2026-09-01 | 2026-09-05 | 0 |

**Total unique cloud recordings:** **18** (prior pass only saw the 3 August ones when querying from=2026-07-01 in a short window). Widening to 2025-09 was useful; nothing before Oct 2025.

Pagination: all windows returned in a single page (`page_size=300`); `next_page_token` never needed.

---

## Account-level endpoints

| Endpoint | Result |
|---|---|
| `GET /accounts/me/recordings` | **400 / 4711** — missing `cloud_recording:read:list_account_recordings:admin` |
| `GET /accounts/{accountId}/recordings` | **400 / 4711** — missing `cloud_recording:read:list_account_recordings:master` |
| `GET /users` (list users) | **400 / 4711** — missing `user:read:list_users:admin` |

Workaround used: `/users/me` + host id `Dt-ScQReThqGXGv6yHt_-Q` (identical meeting sets).

---

## Results table (all 18 cloud recordings)

| Date (UTC start) | Topic | UUID | Status | Notes |
|---|---|---|---|---|
| 2025-10-27 | Jared and Ryan (Retention Radar) | `F19TqzbUS4eeM7dO0xrHiw==` | **unavailable** | Video+audio only (MP4/M4A); no TRANSCRIPT. External: RHANSEN. |
| 2025-11-19 | Delphinium Training | `Dzvns0POSWeHkxqyX7cJMg==` | **unavailable** | Video+audio only. External: Scott A. Cloud, Semret K. Tseggai, Ms. Johnson. |
| 2026-01-20 | Learn more about Delphinium! | `Dl1g/q2bSOi+0KoEe1UygA==` | **unavailable** | Video+chat+audio; no TRANSCRIPT. Large EVA admin audience. |
| 2026-02-05 | Delphinium Meeting | `DSaGOyHMSA+qPYkDDBOz8w==` | **unavailable** | Has closed captions (CC) file but **no** `TRANSCRIPT`/audio_transcript VTT. Houghton/Fowler/Kidder/Randall/Leavitt. |
| 2026-02-10 | Schedule a Meeting with Dr. Jared R. Chapman | `FjRkfqnJSmWDV9M1sV1OdA==` | **unavailable** | Video+chat+audio; no TRANSCRIPT. Large UVA audience. |
| 2026-02-25 | Jared Chapman's Zoom Meeting | `epTj5TKMR6yJTc6yLlIJ6Q==` | **skipped** | Has TRANSCRIPT; **Jared-only** wiring — skipped download. |
| 2026-02-25 | Schedule a Meeting… | `uAXGsHneQrygzpjUd2NR2Q==` | **fetched** | VTT 90408 B. Arnel Saligumba (sales-candidate context). |
| 2026-02-26 | Delphinium Training | `1Yo4nJrJT9aKgvt5ad/eyQ==` | **fetched** | VTT 102548 B. EVA cohort (Emily Borrego et al.). |
| 2026-02-26 | Schedule a Meeting… | `zN4BQTnhQIGKzt1JjxGV/Q==` | **fetched** | VTT 51675 B. Alex (sales-candidate). |
| 2026-03-04 | Schedule a Meeting… | `LnRP/bHkQ2aa0yLdiTqaaQ==` | **fetched** | VTT 44547 B. Lorando Rongavilla (sales-candidate). |
| 2026-03-04 | Schedule a Meeting… | `MQdp4Mm8TxOdfizR01unrg==` | **fetched** | VTT 89423 B. **KC Billy** prospect demo — rich reactions. |
| 2026-03-05 | Delphinium Training | `rEbTCPQvQ9GxB9oX+wolnA==` | **fetched** | VTT 100721 B. UVA large cohort. |
| 2026-05-21 | Schedule a Meeting… | `jdIobBp5TTq0r0DSDck2Ww==` | **fetched** | VTT 958 B only (Lindsey Soffe / Elisa Taylor) — too thin for quotes. |
| 2026-06-03 | Delphinium and MEWA | `VZK4PVWJTMyhPU1aYkM6lg==` | **fetched** | VTT 85579 B. MEWA (Halley, Ballard, Struyk-Bonn, Queen, Faith…). |
| 2026-06-15 | Delphinium Training | `6qwek/3+TrqzlHnrVmJ3EQ==` | **fetched** | VTT 98184 B. MEWA teacher training. |
| 2026-08-18 | Learn more about Delphinium! | `YNHHL/uCSQaXqufAWc3J6Q==` | **already** | Prior fetch; Montclair. |
| 2026-08-19 | Delphinium Training | `epzPpevQQGCVkfch5oY7FA==` | **already** | Prior fetch; Milpark. |
| 2026-08-25 | Delphinium Training | `SRoY/ceTQla5XiRRfPDsZQ==` | **already** | Prior fetch; Milpark. |

### Counts

| Outcome | N |
|---|---|
| **fetched** (new this pass) | **9** |
| **already_fetched** | 3 |
| **unavailable** (video-only / no TRANSCRIPT) | **5** |
| **skipped** (Jared-only) | **1** |

---

## New VTT paths (this hub pull)

All under `/workspace/delphinium-os/zoom/inbox/`:

| File | Size | Meeting |
|---|---|---|
| `uAXGsHneQrygzpjUd2NR2Q_transcript.vtt` (+ `_clean.txt`, meta, past, participants) | 90408 | Schedule 2026-02-25 Arnel |
| `1Yo4nJrJT9aKgvt5ad-eyQ_transcript.vtt` (+ clean/meta/past/participants) | 102548 | Training 2026-02-26 EVA |
| `zN4BQTnhQIGKzt1JjxGV-Q_transcript.vtt` (+ …) | 51675 | Schedule 2026-02-26 Alex |
| `LnRP-bHkQ2aa0yLdiTqaaQ_transcript.vtt` (+ …) | 44547 | Schedule 2026-03-04 Lorando |
| `MQdp4Mm8TxOdfizR01unrg_transcript.vtt` (+ …) | 89423 | Schedule 2026-03-04 KC Billy |
| `rEbTCPQvQ9GxB9oX-wolnA_transcript.vtt` (+ …) | 100721 | Training 2026-03-05 UVA |
| `jdIobBp5TTq0r0DSDck2Ww_transcript.vtt` (+ …) | 958 | Schedule 2026-05-21 short |
| `VZK4PVWJTMyhPU1aYkM6lg_transcript.vtt` (+ …) | 85579 | Delphinium and MEWA 2026-06-03 |
| `6qwek-3-TrqzlHnrVmJ3EQ_transcript.vtt` (+ …) | 98184 | Training 2026-06-15 MEWA |

Raw API dumps: `/tmp/zoom-hub-pull-2026-09-04/all_cloud_recordings.json`, `fetch_results.json`, `list_log.json`.

---

## Reaction quotes appended

From **newly downloaded FULL** VTTs only (not Jared-only skip; not inventing; sales-interview “excited about opportunity” lines not numbered as product wow):

| Items | Meeting |
|---|---|
| **#49–53** | KC Billy Schedule 2026-03-04 |
| **#54–56** | EVA Training 2026-02-26 |
| **#57–58** | MEWA 2026-06-03 |
| **#59–61** | MEWA Training 2026-06-15 |
| **#62** | UVA Training 2026-03-05 |

**New quote count: 14** (next number was 49).

Updated:
- `/workspace/delphinium-os/web-design/brief/wow-reaction-quotes-from-demos.md`
- `/tmp/wow-reaction-quotes-from-demos.md`

---

## Auth / scope blockers — exact next steps for Jared

1. **S2S worked** for exhaustive `/users/me/recordings` month walk + VTT download via `download_url?access_token=…`. No reconnect needed for that path.
2. **Optional scopes to add on the Zoom S2S app** (not blocking this pull for Jared’s host recordings):
   - `cloud_recording:read:list_account_recordings:admin` — account-wide recording list (other hosts if any).
   - `user:read:list_users:admin` — enumerate all Zoom users to poll recordings per host.
   - `cloud_recording:read:list_recording_files:admin` — direct `GET /meetings/{uuid}/recordings` (still workaroundable via user recordings list).
3. **User My Notes OAuth** still missing for Hub “notes” transcript path (`my_notes:read:note` user scope). S2S `:admin` variants present but prior pass showed Hub notes need **user** OAuth. Only matters for meetings that never produced a cloud TRANSCRIPT file (the 5 unavailable rows above, plus Stevens/Milpark Aug 28 from prior report).
4. **Video-only meetings:** five Hub-relevant titles have MP4 (and sometimes CC) but Zoom never generated an `audio_transcript` TRANSCRIPT file — **cannot** invent VTTs. Possible next steps for Jared: (a) enable automatic audio transcript on cloud recordings going forward; (b) manually download CC where present and convert; (c) reconnect user OAuth and check My Notes only if Hub retained a transcript item.
5. No cookie/session scraping. No invented tokens.

---

## Success criteria check

| Criterion | Status |
|---|---|
| Exhaustive cloud-recording list across Hub-relevant range | **Yes** — 2025-09 → 2026-09-05 month-by-month; 18 unique; API ceiling for account-wide list documented |
| All downloadable TRANSCRIPT VTTs for Training / MEWA / Learn more / Schedule with externals | **Yes** — 9 new + 3 already; 5 unavailable video-only; 1 Jared-only skipped |
| New reaction quotes appended | **Yes** — #49–62 (14) |
| Report with fetched vs unavailable table | **This file** |

---

## Summary for parent

| Metric | Value |
|---|---|
| Fetched (new) | 9 |
| Already on disk | 3 |
| Unavailable (no TRANSCRIPT) | 5 |
| Skipped Jared-only | 1 |
| New reaction quotes | 14 (#49–62) |
| Auth blockers | Account list + list_users scopes missing (optional); user My Notes OAuth still needed for Hub-notes path |
| Report paths | `web-design/brief/zoom-transcript-hub-pull-2026-09-04.md` + `/tmp/zoom-transcript-hub-pull-2026-09-04.md` |

---

## Hub UI follow-up 2026-09-04 evening

Hub offered **no Generate transcript** for the remaining video-only meetings. Feb 5 Delphinium Meeting **CC** saved to inbox path `/workspace/delphinium-os/zoom/inbox/DSaGOyHMSA-qPYkDDBOz8w_cc.vtt` and mined for audience reactions (#63–67 in `wow-reaction-quotes-from-demos.md`). Other four video-only titles unchanged (still no audio transcript / no usable CC pull in this pass): Training Nov 2025, Learn more Jan 2026, Schedule Feb 10, Ryan Retention Radar Oct 2025.

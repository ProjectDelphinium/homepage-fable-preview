# Zoom transcript fetch report — 2026-09-04
**When:** 2026-09-04 18:46 MDT (America/Denver)  
**For:** Web Design (via Jared)  
**Mode:** Download-only (S2S OAuth). Did **not** mutate `processed-meetings.json` / claim ledger. No Slack / HubSpot / email.

**Auth used:** Fresh S2S token from `/workspace/.secrets/zoom-s2s.env` → `/tmp/zoom-poll/token` (scopes include `cloud_recording:read:meeting_transcript:admin`, `cloud_recording:read:list_user_recordings:admin`, `cloud_recording:read:recording:admin`, meeting past/participants, meeting summaries, `my_notes:*:admin`).

---

## Pull-order results

| Pri | Meeting | UUID | Status | Artifact / notes |
|---|---|---|---|---|
| 1 | Stevens + Delphinium / Corey Stevens (SLCC) 2026-08-31 ~9:57–10:17 AM MT | `Vd/vaQlfR6alpMCEh3WwAg==` | **unavailable** | AIC `GET /meetings/{uuid}/transcript` → HTTP 404 code **3322** (“This meeting transcript does not exist”) single+double encode. Not in `users/me/recordings` (2026-07-01→09-05). Not in `meeting_summaries` list. Past+participants refreshed on disk. **No full VTT exists in Zoom APIs we can reach.** |
| 2 | Milpark 2026-08-28 ~6:57–8:31 AM MT | `GfI+6BSqRiOKTIPkxt5vwg==` / `GfI-6BSqRiOKTIPkxt5vwg==` | **unavailable** | Same **3322** on both UUID spellings; no cloud recording; no meeting_summary row; past says AI Companion path previously off. Participants Heaven/Jani/Saajida still on disk. |
| 3 | Jared short Aug27 12:33 MT | `drlBV5HUTSyN+e0fevSR0g==` | **fetched** | AIC VTT → `zoom/inbox/drlBV5HUTSyN-e0fevSR0g_transcript.vtt` (2326 B). Jared-only wiring. |
| 3 | Jared short Aug27 12:26 MT | `a7+uCRUBQHKl2VS+xkoBZQ==` | **fetched** | `zoom/inbox/a7-uCRUBQHKl2VS-xkoBZQ_transcript.vtt` (406 B). Jared-only. |
| 3 | Jared short Aug27 12:15 MT | `XwVSaWatTMSux2qQM0SCfQ==` | **fetched** | `zoom/inbox/XwVSaWatTMSux2qQM0SCfQ_transcript.vtt` (595 B). Jared-only. |
| 3 | Jared short Aug27 12:09 MT | `CX7654GpQm+7vasGw+K/Fw==` | **fetched** | `zoom/inbox/CX7654GpQm-7vasGw-K-Fw_transcript.vtt` (754 B). Jared-only. |
| 3 | Jared short Aug27 11:53 MT | `ZfDj+GIRTcqYHCjryAcdnQ==` | **fetched** | `zoom/inbox/ZfDj-GIRTcqYHCjryAcdnQ_transcript.vtt` (195 B). Jared-only. |
| 3 | Jared short Aug27 11:50 MT | `cuUoMH4UT/mWE8EFTC3xRg==` | **fetched** | `zoom/inbox/cuUoMH4UT-mWE8EFTC3xRg_transcript.vtt` (318 B). Jared-only. |
| 3 | Jared short Aug27 11:45 MT | `iTqcBm7DTOqZx9KJJ9XCGQ==` | **fetched** | `zoom/inbox/iTqcBm7DTOqZx9KJJ9XCGQ_transcript.vtt` (772 B). Jared-only. |
| 3 | Jared short Aug27 10:21 MT | `jGhqU6A3SzSb1xYhZcX/3g==` | **fetched** | `zoom/inbox/jGhqU6A3SzSb1xYhZcX-3g_transcript.vtt` (528 B). Jared-only. |
| 4 | Stevens older 2026-08-24 (Jared-only) | `o0QVj4mDSC2tqEUwcI3A6A==` | **unavailable** | AIC 3322 again; no recording. |
| 4 | Delphinium Training (Milpark cohort) 2026-08-25 | `SRoY/ceTQla5XiRRfPDsZQ==` | **fetched** | Cloud-recording `audio_transcript` VTT (AIC 3322). → `zoom/inbox/SRoY-ceTQla5XiRRfPDsZQ_transcript.vtt` (79057 B) + `_clean.txt`. 21 participants. |
| 4 | Delphinium Training (Milpark) 2026-08-19 | `epzPpevQQGCVkfch5oY7FA==` | **fetched** | Cloud VTT → `zoom/inbox/epzPpevQQGCVkfch5oY7FA_transcript.vtt` (152878 B) + `_clean.txt`. Heaven/Jani/Saajida/Julia. |
| 4 | Learn more about Delphinium! (Montclair) 2026-08-18 | `YNHHL/uCSQaXqufAWc3J6Q==` | **fetched** | Cloud VTT → `zoom/inbox/YNHHL-uCSQaXqufAWc3J6Q_transcript.vtt` (83328 B) + `_clean.txt`. Montclair Online attendees. |
| 4 | Elder / Davis (already on disk) | `n2hoJ+dfRRiAoGFdk2pd0w==` | **fetched** (duplicate) | AIC re-download same content already mined; `n2hoJ-dfRRiAoGFdk2pd0w_transcript.vtt` also written (23519 B). |
| 4 | ~18 other past instances from scheduled demos | various | **unavailable** | AIC 3322 across the board; only the 3 cloud-recording meetings above had downloadable TRANSCRIPT files. |

Raw JSON: `/tmp/zoom-fetch-2026-09-04/primary_fetch.json`, `recording_fetch.json`, `extra_instances_fetch.json`, `past_instances.json`, `cloud_recordings_full.json`.

---

## New VTT paths (this pass)

### Full / useful for reactions
- `/workspace/delphinium-os/zoom/inbox/SRoY-ceTQla5XiRRfPDsZQ_transcript.vtt`
- `/workspace/delphinium-os/zoom/inbox/epzPpevQQGCVkfch5oY7FA_transcript.vtt`
- `/workspace/delphinium-os/zoom/inbox/YNHHL-uCSQaXqufAWc3J6Q_transcript.vtt`
- Matching `_clean.txt` dialogues beside each.

### Full but Jared-only (no audience reactions)
- Eight `*_transcript.vtt` Aug 27 shorts listed above under pri 3.

### Duplicate
- `n2hoJ-dfRRiAoGFdk2pd0w_transcript.vtt` (same Elder meeting as existing `n2ho-transcript.vtt`).

---

## Auth / scope blockers (exact next steps for Jared)

1. **S2S worked** for AIC transcript download + `GET /users/me/recordings` + past meetings/participants + meeting_summaries. No reconnect needed for those.
2. **Missing S2S scope for per-UUID recordings endpoint:** `GET /meetings/{uuid}/recordings` returns 400 code 4711 needing `cloud_recording:read:list_recording_files` or `…:admin`. Workaround used: `GET /users/me/recordings`. Optional: add that scope on the Zoom Server-to-Server app if you want UUID-direct recording lookups.
3. **My Notes / Hub transcript path blocked (user OAuth):** `GET /v2/my_notes/notes` → 401 needing `my_notes:read:note` (user, not `:admin`). No Zoom **user** OAuth token/refresh file exists on the box. Per skill, S2S `:admin` cannot substitute.  
   **Exact next step:** Jared reconnects Zoom **user** OAuth (owner `jared@delphi-me.com`) with scopes `my_notes:read:note` and `my_notes:read:content`, store token where agents can load it (same pattern as other user OAuth secrets). Then we can check Hub notes for Stevens/Milpark **only if** `transcript.items` exist.  
   **Important:** Stevens + Milpark Aug 28 already return AIC **3322** and are absent from cloud recordings + meeting_summaries — a Hub note reconnect will help **only** if Zoom Hub actually retained a transcript; it will not invent one.
4. **No cookie/session scraping** attempted. Do not invent tokens.

---

## Reaction quotes appended

From **newly fetched FULL** demo/training VTTs only (not Aug 27 shorts; not inventing):
- Montclair 2026-08-18 → items **34–38** (5)
- Milpark Training 2026-08-19 → items **39–43** (5)
- Milpark Training 2026-08-25 → items **44–48** (5)

**Total new reaction items: 15**

Updated: `web-design/brief/wow-reaction-quotes-from-demos.md` (+ `/tmp` copy). Inventory updated briefly.

---

## Summary for parent

| Target | Outcome |
|---|---|
| Stevens Aug 31 | unavailable (3322 / no cloud recording) |
| Milpark Aug 28 | unavailable (3322 / no cloud recording) |
| Aug 27 Jared shorts (8) | fetched (Jared-only; 0 reaction quotes) |
| Earlier demos with recordings | 3 fetched (Montclair Aug 18, Milpark trainings Aug 19 & 25) |
| Auth | S2S OK; user My Notes OAuth missing if Hub path needed |

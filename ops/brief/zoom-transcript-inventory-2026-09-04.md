# Zoom transcript inventory — exhaustive disk pass
**Date:** 2026-09-04 (America/Denver)  
**For:** Web Design (Assistant)  
**Scope:** Every Zoom meeting artifact found on the box under `delphinium-os/zoom/`, `processed-meetings.json`, `/tmp/*zoom*`, and related poll/probe caches.  
**API fetch:** Not run this pass. No read-only fetch script lives under `/workspace/delphinium-os/zoom/` (only `claim-meeting.py`, which mutates the processed ledger). Stale token at `/tmp/zoom-poll/token` (mtime 2026-08-31) was **not** used. Disk inventory only — no invented meetings.

**Related:** `wow-reaction-quotes-from-demos.md` (reaction mining).

---

## Summary counts

| Bucket | Count |
|---

> **Update 2026-09-04 evening (API fetch):** See `zoom-transcript-fetch-2026-09-04.md`.  
> **Newly fetched FULL VTTs:** Montclair Aug 18 (`YNHHL-uCSQaXqufAWc3J6Q`), Milpark Training Aug 19 (`epzPpevQQGCVkfch5oY7FA`), Milpark Training Aug 25 (`SRoY-ceTQla5XiRRfPDsZQ`), plus 8× Aug 27 Jared-only shorts.  
> **Still unavailable:** Stevens Aug 31 (`Vd/vaQlfR6alpMCEh3WwAg==`) and Milpark Aug 28 (`GfI+…`) — AIC 3322 / no cloud recording.  
> Reaction quotes §§ H–J appended (15 items) in `wow-reaction-quotes-from-demos.md`.

|---|
| Distinct past meetings inventoried (held / ledger / inbox) | **16** |
| With FULL VTT or clean dialogue on disk | **15+** after evening fetch (prior 4 + Montclair Aug18 + 2 Milpark trainings + 8 Aug27 Jared shorts + Elder re-download); **6 useful demos/trainings** for reactions |
| Summary-only on disk (AI Companion summary **metadata** only; no full dialogue/VTT) | **0** remaining for Aug27 shorts — VTTs now fetched |
| Past meetings with **no** full transcript on disk (404 / AI Companion off / never fetched) | **Stevens Aug31 + Milpark Aug28 + Stevens Aug24 + many non-recording past instances** (see fetch report) |
| Scheduled meeting listings in Aug 31 Zoom meetings cache with **no** past-instance artifacts on disk | **22** (appendix; not claimed as held) |
| Already mined for audience reactions | **6** (+ Montclair Aug18, Milpark trainings Aug19/25) |

---

## Master inventory (every held / ledger meeting)

| # | Topic / title | Date (America/Denver) | Attendees (if known) | FULL VTT/dialogue? | File paths | Category | Already mined for reactions? |
|---|---|---|---|---|---|---|---|
| 1 | Schedule a Meeting with Dr. Jared R. Chapman (Milpark lecturers) | 2026-09-02 ~6:59 AM–8:06 AM MT (UTC 12:59–14:06) | Jared Chapman; Jani van der Merwe; Heaven Nemaungane; Cyril Francis; saajida ebrahim | **YES** — full speaker VTT | `zoom/inbox/hsLPkonQRUSzrYKWIndFWg_transcript.vtt` (91999 B); meta `…_transcript-meta.json`; `/tmp/milpark-2026-09-02-dialogue.txt`; `/tmp/milpark-2026-09-02-keep.txt`; `/tmp/milpark_transcript_merged.txt`; `/tmp/milpark_transcript_plain.txt` | demo / prospect (Milpark Education HE pilot) | **yes** |
| 2 | Schedule a Meeting with Dr. Jared R. Chapman (Milpark follow-up) | 2026-09-04 ~6:58–7:51 AM MT (UTC 12:57–13:51) | Jared; Heaven Nemaungane; Cyril | **YES** — full VTT + clean dialogue | `zoom/inbox/teNZbKZASliJIqFdFdsWyg_transcript.vtt` (61049 B); `…_clean.txt`; past/participants/meta; `/tmp/zoom_filtered.txt` | demo / prospect (Milpark) | **yes** |
| 3 | Learn more about Delphinium! (Davis Connect / Elder) | 2026-08-28 ~8:31–8:46 AM MT (UTC 14:31–14:46) | Jared Chapman; Elder Tauraa | **YES** — full VTT + rich AI summary | `zoom/inbox/n2ho-transcript.vtt` (23519 B); `n2ho-summary.json`; `n2ho-past.json`; `n2ho-participants.json`; `n2ho-transcript-meta.json`; probe copies under `inbox/probe-2026-09-01/`; `/tmp/zoom-summary.json` | client operational (Davis Connect 7-12) | **yes** |
| 4 | Jared Chapman's Zoom Meeting (wiring / AIC dry-run) | 2026-09-01 ~4:52–4:53 AM MT (UTC 10:52–10:53) | Jared only (jared@delphi-me.com) | **YES** — tiny full VTT (~1 min, Jared monologue) | `zoom/inbox/LZ5EcyUHSMKcD2hFNI8mXQ_transcript.vtt` (880 B); `LZ5EcyUHSMKcD2hFNI8mXQ_meta.json`; duplicate AIC `note--f2fA79pSNOAavR9hZSPEA-aic-transcript.vtt`; `note--…-fetch.json` (my_notes content 401) | staff / internal (test wiring) | **scanned — no prospect/audience reactions** (not a demo) |
| 5 | Milpark (first Milpark Zoom) | 2026-08-28 ~6:57–8:31 AM MT (UTC 12:57–14:31) | Jared; Heaven Nemaungane; saajida ebrahim; Jani van der Merwe | **NO** — transcript 404/3322; summary 3001; AI Companion autostart off | `GfI-6BSqRiOKTIPkxt5vwg-past.json`; `-participants.json`; `-summary.json` (error); `-transcript-meta.json` (3322); `/tmp/zoom-poll/new_results.json` entry | demo / prospect | **no** — **pull later** |
| 6 | Stevens + Delphinium (SLCC / Corey) | 2026-08-31 ~9:57–10:17 AM MT (UTC 15:57–16:17) | Jared; Corey Stevens (corey.stevens@slcc.edu) | **NO** — transcript 3322; summary 3001; HubSpot note was written from other ingest notes, **not** from a VTT on disk | `/tmp/zoom-poll/slcc-past.json`; `slcc-participants.json`; `slcc-summary.json`; `slcc-transcript-meta.json`; probe `stevens-*.json`; processed ledger uuid `Vd/vaQlfR6alpMCEh3WwAg==` | demo / prospect (Salt Lake Community College) | **no** — **pull later** (priority) |
| 7 | Stevens + Delphinium (older instance) | 2026-08-24 ~7:58–8:18 AM MT (UTC 13:58–14:18) | Jared only | **NO** — transcript 3322; summary 3001 | `o0QVj4mDSC2tqEUwcI3A6A-past.json`; `-participants.json`; `-summary.json`; `-transcript-meta.json` | staff / internal (solo / empty client join) | **no** — unavailable |
| 8 | Jared Chapman's Zoom Meeting | 2026-08-27 ~12:33–12:35 PM MT (~2 min) | unknown (no participants file) | **NO VTT** — summary **metadata only** in Zoom meeting_summaries list (no overview body on disk) | `processed-meetings.json` uuid `drlBV5HUTSyN+e0fevSR0g==`; listed in `/tmp/zoom-poll/summaries*.json` | staff / internal (likely wiring) | **no** — summary-only / need pull |
| 9 | Jared Chapman's Zoom Meeting | 2026-08-27 ~12:26–12:27 PM MT (~30s) | unknown | **NO VTT** — summary metadata only | uuid `a7+uCRUBQHKl2VS+xkoBZQ==`; summaries*.json | staff / internal | **no** |
| 10 | Jared Chapman's Zoom Meeting | 2026-08-27 ~12:15–12:15 PM MT (~37s) | unknown | **NO VTT** — summary metadata only | uuid `XwVSaWatTMSux2qQM0SCfQ==` | staff / internal | **no** |
| 11 | Jared Chapman's Zoom Meeting | 2026-08-27 ~12:09–12:10 PM MT (~45s) | unknown | **NO VTT** — summary metadata only | uuid `CX7654GpQm+7vasGw+K/Fw==` | staff / internal | **no** |
| 12 | Jared Chapman's Zoom Meeting | 2026-08-27 ~11:53–11:53 AM MT (~29s) | unknown | **NO VTT** — summary metadata only | uuid `ZfDj+GIRTcqYHCjryAcdnQ==` | staff / internal | **no** |
| 13 | Jared Chapman's Zoom Meeting | 2026-08-27 ~11:50–11:50 AM MT (~26s) | unknown | **NO VTT** — summary metadata only | uuid `cuUoMH4UT/mWE8EFTC3xRg==` | staff / internal | **no** |
| 14 | Jared Chapman's Zoom Meeting | 2026-08-27 ~11:45–11:46 AM MT (~51s) | unknown | **NO VTT** — summary metadata only | uuid `iTqcBm7DTOqZx9KJJ9XCGQ==` | staff / internal | **no** |
| 15 | Jared Chapman's Zoom Meeting | 2026-08-27 ~10:21–10:22 AM MT (~32s) | unknown | **NO VTT** — summary metadata only | uuid `jGhqU6A3SzSb1xYhZcX/3g==` | staff / internal | **no** |
| 16 | my_notes.note_generated duplicate of #2 | 2026-09-04 (same Milpark follow-up) | (same as #2) | N/A — skipped duplicate of AIC ingest | processed ledger uuid `HoGQC16wQ9-PJutauuhtdw` / note name with 06:58 GMT-6 | (duplicate event) | covered by #2 |

**Synthetic / non-Zoom:** `[TEST] webhook cutover to Assistant` (`constructor-cutover-test-2026-08-31`) — not a Zoom meeting; skipped.

---

## Meetings missing full transcripts (after 2026-09-04 evening fetch)

1. **Stevens + Delphinium / Corey Stevens (SLCC) — 2026-08-31** — still **unavailable** (AIC 3322; no cloud recording; no meeting_summary). Paste from Zoom UI or My Notes user-OAuth only if Hub retained transcript.
2. **Milpark — 2026-08-28** — still **unavailable** (3322 both UUID forms; no cloud recording).
3. **8× Aug 27 Jared shorts** — **fetched** (Jared-only; no reaction value).
4. **Stevens older 2026-08-24** — still unavailable; low value.
5. **Earlier demos with cloud recordings** — **fetched** Montclair Aug 18 + Milpark trainings Aug 19 & 25.

---

## Appendix A — Zoom *scheduled* meetings list (Aug 31 cache)

Source: `/tmp/zoom-poll/prev_meetings_nodate.json` (25 rows). These are **calendar/meeting definitions**, not proof of a held recording/transcript on disk. Listed for exhaustiveness; **do not treat as mined demos**.

| Start (UTC) | Meeting id | Topic |
|---|---|---|
| 2026-08-31T16:00:00Z | 86725951566 | Stevens + Delphinium *(past instance = #6)* |
| 2026-08-28T14:30:00Z | 84504115670 | Learn more about Delphinium! *(past = #3)* |
| 2026-08-28T13:00:00Z | 83648306616 | Milpark *(past = #5)* |
| 2026-08-26T17:00:00Z | 88229647046 | Schedule a Meeting with Dr. Jared R. Chapman |
| 2026-08-25T11:00:00Z | 84312690584 | Delphinium Training |
| 2026-08-24T17:30:00Z | 83735739379 | Learn more about Delphinium! |
| 2026-08-21T16:00:00Z | 87220775963 | Delphinium Debug |
| 2026-08-21T15:00:00Z | 88457988087 | Schedule a Meeting with Dr. Jared R. Chapman |
| 2026-08-20T18:30:00Z | 86332566305 | Delphinium Training |
| 2026-08-20T14:30:00Z | 89231848987 | Delphinium Training |
| 2026-08-20T10:24:53Z | 81157009151 | Zoom Meeting |
| 2026-08-19T19:00:00Z | 85789992551 | Schedule a Meeting with Dr. Jared R. Chapman |
| 2026-08-19T16:30:00Z | 84483820434 | Schedule a Demo |
| 2026-08-19T13:00:00Z | 86466454998 | Delphinium Training |
| 2026-08-18T21:15:00Z | 84403371676 | Learn more about Delphinium! |
| 2026-08-18T16:15:00Z | 83264928968 | Schedule a Meeting with Dr. Jared R. Chapman |
| 2026-08-18T13:00:00Z | 83981043638 | Learn more about Delphinium! |
| 2026-08-17T15:00:00Z | 82931003559 | Canceled: Learn more about Delphinium! |
| 2026-08-14T13:00:00Z | 81821786228 | Learn more about Delphinium! |
| 2026-08-13T21:30:00Z | 82943995336 | Schedule a Meeting with Dr. Jared R. Chapman |
| 2026-08-13T13:30:00Z | 83315699073 | Schedule a Meeting with Dr. Jared R. Chapman |
| 2026-08-05T20:00:00Z | 88566675248 | Learn more about Delphinium! |
| 2026-08-05T16:39:20Z | 85074874724 | Zoom Meeting |
| 2026-08-05T13:00:00Z | 87647063224 | Schedule a Meeting with Dr. Jared R. Chapman |
| 2026-07-31T13:00:00Z | 86742173436 | Canceled: Schedule a Meeting with Dr. Jared R. Chapman |

---

## Appendix B — `/tmp` dialogue/transcript companions (not extra meetings)

| Path | Maps to |
|---|---|
| `/tmp/milpark-2026-09-02-dialogue.txt` | #1 |
| `/tmp/milpark-2026-09-02-keep.txt` | #1 extract |
| `/tmp/milpark_transcript_merged.txt` / `milpark_transcript_plain.txt` | #1 |
| `/tmp/zoom_filtered.txt` | #2 clean dialogue |
| `/tmp/zoom-summary.json` | #3 summary copy |
| `/tmp/slcc-no-transcript.json` / `slcc-notes-ready.json` | Slack-out drafts about #6 (not transcripts) |
| `/tmp/wendy-stevens-*.txt/json` | Stevens **Institute** email/HubSpot context — **not** a Zoom transcript; do not confuse with SLCC Corey Stevens |

---

## Reaction-mining status

| Full-transcript meeting | Mined? | Notes |
|---|---|---|
| Milpark 2026-09-02 | yes | Items A1–A12 (+ soft addenda in quotes file) |
| Milpark 2026-09-04 | yes | Items B13–B22 |
| Elder / Davis 2026-08-28 | yes | Items C23–C28 |
| Jared wiring 2026-09-01 | scanned | Jared-only; zero prospect lean-ins |
| Montclair 2026-08-18 | **yes** | Items H34–H38 |
| Milpark Training 2026-08-19 | **yes** | Items I39–I43 |
| Milpark Training 2026-08-25 | **yes** | Items J44–J48 |
| Aug 27 Jared shorts (8) | scanned | Jared-only; zero prospect lean-ins |

Still blocked for reactions: **Stevens Aug 31** and **Milpark Aug 28** (no retained Zoom transcript artifact).

---

*Compiled 2026-09-04 America/Denver (disk pass) + evening Zoom API fetch update. No Slack/HubSpot writes.*

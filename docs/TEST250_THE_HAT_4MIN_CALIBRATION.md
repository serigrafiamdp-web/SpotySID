# TEST250 — The Hat tunes 2/3/4: four-minute listening window

**Date:** 2026-11-15. **Status:** published for listening, **pending PASS from user**.

## Purpose

The artist **Figge Wasberger (Fegolhuzz)** has four entries from *The Hat*, available through the musician and FairLight group library:
- `Hat_tune_1.sid`: **01:48** fixed, direct AUTO NEXT without fade; user-confirmed **TEST249 PASS**. **Unchanged.**
- `Hat_tune_2.sid`: provisional **04:00** to listen and determine actual ending.
- `Hat_tune_3.sid`: provisional **04:00** to listen and determine actual ending.
- `Hat_tune_4.sid`: provisional **04:00** to listen and determine actual ending.

These 04:00 timers are **calibration windows**, not assertions that the songs last four minutes. The user will report countdown values where each melody ends, and we will calculate duration = 04:00 - countdown remaining.

## Implementation

Modified `js/customPlaylist.test101.js`, loaded at `?v=test250-hat234-four-minute-calibration`. Exact identification by `Fegolhuzz/Hat_tune_[1-4].sid`, subtune 0, or embedded identity with both matching title/author. No overrides for different authors or other tunes.

- Initial timer for 2/3/4 is 240 seconds; tune 1 stays 108 seconds.
- At the timer limit **AUTO NEXT uses the existing immediate handoff with no fade-out** for all four exact matches. This means the last five seconds of a tune are not attenuated during listening. If a song is still audible at four minutes, it will change there; this is a measurement window, not automatic musical-end detection.
- User-edited song-specific timer takes priority.
- All other tracks keep original 5-second fade, normal HVSC Songlengths lookup and the existing global silence detector state (**disabled**).
- No changes to SID bytes, playback core, artist/group lists, backend or UI other than the displayed timer.

## Tests

JavaScript syntax passed. Identity and simulated AUTO checks passed for 1–4, with no switching before each specified boundary and immediate request at 108/240 seconds. Music not played by test runner: **manual browser listening PASS pending**. Backup: `backup/pre-test250-the-hat-4min-calibration-2026-11-15`.

## User workflow

Open https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/ (Ctrl+F5). In AUTO ON, play tune 2/3/4 and note the **remaining time** at the musical end (e.g. 02:15 remaining from 04:00 means 01:45 elapsed). Report each value. We will replace only the provisional durations; retain no fade-out.

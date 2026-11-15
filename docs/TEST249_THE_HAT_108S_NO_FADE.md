# TEST249 — The Hat (tune 1): exact 01:48 end, AUTO NEXT without fade

**Date:** 2026-11-15. **Status:** implemented on the canonical SpotySid page; **browser listening PASS pending user confirmation**.

## User-reported symptom

The Hat (tune 1), by Figge Wasberger (Fegolhuzz), restarts its music loop before AUTO advances to the next track. Observed in the **FairLight** and **Fegolhuzz artist** browsing lists. Its music ends when the former **03:00** countdown showed **01:12** remaining, equivalent to **01:48 = 108 seconds elapsed**.

No global silence detector is required; TEST201 intentionally disabled that detector to avoid false early advances.

## Exact identity

Music library: `library/packs/musicians/F/Fegolhuzz.zip` → `Hat_tune_1.sid`. Song display: **The Hat (tune 1)**, **Figge Wasberger (Fegolhuzz)**. The older HVSC Songlengths.md5 snapshot in `library/songlengths/musicians-F.json` does **not** contain an entry for this new 2026 SID. The original snapshot stays unmodified.

Matching is by exact HVSC filename, pack and subtune, or exact song title + artist in a user/community playlist. **The Hat (tune 2), (tune 3), (tune 4), unrelated Hat tracks, and other Fegolhuzz compositions are unchanged.**

## Implementation

File: `js/customPlaylist.test101.js`. Canonical `index.html` loads it with the `?v=test249-hat108-hardcut` version.

1. `selectTentativeSidTimer` selects **108 seconds** as the default playing TIMER for this exact song. A deliberate manual per-track timer override still takes precedence; no changes to user playlists or HVSC reference database.
2. `getAutoDurationSeconds` returns the full specified duration for this exact song, instead of the normal `duration - 5s` fade lead time.
3. `checkAutoAdvance` delegates every other song to the original behavior; for The Hat tune 1, it queues `requestSidSwitch(nextIndex, 'silence')` at the full duration, respecting **AUTO OFF**, pause, loading, busy transition and playlist boundaries.
4. The preexisting `requestSidSwitch(..., 'silence')` branch suppresses the 5-second fade-out and switches on a **20ms control-timer**. The following SID retains the existing TEST208 opening-buffer protection, no fade-in.
5. The SID bytes, synthesis engine, playlist order, external backend, artwork, LFT and global silence detection are **unchanged**.

**Important:** 'no fade-out' refers to the transition envelope, not a claim of sample-perfect, zero-latency handoff. Loading another SID can introduce a brief buffer wait and must be checked by ear.

## Tests completed

10 mocked JavaScript assertions passed: exact archive, matching embedded/metadata playlist track, excludes other subtunes and artists, 108s duration, no switch before boundary, immediate switch at 108s, AUTO OFF, ordinary song 5s fade lead and delegation to existing `checkAutoAdvance`. Source passes JavaScript syntax compilation.

**Manual listening test:** open canonical https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/, choose the FairLight or Fegolhuzz list, play The Hat (tune 1) in AUTO ON, watch TIMER starting at 01:48 and ensure the next track starts without fade and without waiting for a second loop. Check (tune 2) remains unchanged. Mark PASS only after user confirmation.

**Backup:** branch `backup/pre-test249-hat-hard-cut-2026-11-15` before modification.

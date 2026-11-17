# TEST348 — Windows XP long-playlist first-SID priority

Date: 17 November 2026

**Status:** Implemented on main, static/simulated checks passed, hardware
PASS on Windows XP/Supermium **pending**. The user's earlier manual/AUTO
audio handoff was reported working on TEST346–347. The aim of this change is
to prevent that working playback from hanging as large lists start.

## Design

**XP mode only, for playlists containing 80 or more tracks:**

1. Resolve and validate the **first SID's real bytes** before switching
   playlists. This condition was present in the V2 progressive loader and
   remains mandatory. A failed first fetch or parse does not start the
   new playlist or substitute a fake track.
2. After the first SID becomes ready, commit/play it without waiting for
   background decoding of every other SID.
3. **Disable background SID/ZIP prefetch** for XP long reference lists.
   Unselected tracks fetch/decode on demand. This intentionally trades
   faster later song selection for a stable first song.
4. In the visible PLAYLIST, build **16 interactive song rows per ~40 ms**
   instead of making up to 2,000 buttons at once. Rows retain original
   order, action controls, group headings, styling, and selection identity.
   In-flight workers cancel whenever the list is replaced.
5. Avoid constructing the hidden, retired USER LOCAL duplicate list on XP;
   if a local view is explicitly used, that list also paints in small
   batches (16 rows per ~50 ms).
6. While XP playlist row painting is unfinished, preserve the already
   verified TEST347 **20 FPS audio-safe oscilloscope limit**. When painting
   ends, return to 25 FPS while the song plays normally.
7. For V1 playlists with **embedded base64 SIDs**, the format still requires
   validation of every track before committing playback, but decode/parse
   yields every **12 tracks for 25 ms** on XP, so the outgoing audio/UI
   does not freeze during validation.
8. Both direct manual and AUTO transitions continue using TEST344 fade
   logic, unchanged: five seconds, previously confirmed stable on XP.
   ReSIDfp routing, volume, timer, uploaded assets, and original SID
   data remain unchanged.

The first SID is guaranteed loaded **before** the new track's initial
playSong() call on V2 reference lists. The rest of the list is rendered
incrementally *after* the first song starts. As always, playback may require
an actual user gesture to unlock Web Audio depending on the browser.

## User verification on real XP/Supermium

- Confirm the upper-right text says **XP** and the saved preference persists.
- Load a **large COMMUNITY PLAYLIST** (e.g. over 100, 500, or 1,000 SIDs).
- Verify the first song starts cleanly, without a short repeating fragment.
- The list should fill progressively while the audio plays.
- Test select another song from far down the list after it appears.
- Test NEXT and AUTO while the visible list is still painting and after
  the list is complete; keep listening for audio interruptions.
- Test switching to a different playlist halfway through row painting:
  old rows must not continue to append to the newly selected playlist.
- Check HI-RES, PIXEL, PETSCII, mouse-wheel zoom, FILL/LINE, COLOR, and
  the persisted XP version indicator.

No real XP playback measurement is claimed until the user reports PASS.
A progressive row builder prevents long single-thread DOM blocks but the
sound can still stutter if the CPU cannot meet ScriptProcessor callback
deadlines. A later optional tuning step is a smaller batch size or an
off-main-thread architecture if the XP hardware demands it.

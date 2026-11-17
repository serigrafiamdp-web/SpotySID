# TEST344 — Supermium/Windows XP indicator and safe SID transitions
Date: 17 November 2026

Status: **implemented on main; real XP/Supermium PASS pending**.
Prior user result: TEST343 was smoother but still replayed a tiny fragment of
the outgoing SID several times before the fade began when clicking a new song.
The same symptom also occurred on AUTO transitions.

## Visible indicator

A minimal **XP** text label appears at the far right of the bottom toolbar
ONLY while the XP compatibility profile is active. Text uses the current
`--rico-theme-fg` CSS color, with no button/border/extra toolbar height.
- If browser reports Windows NT 5.1/5.2, profile enables automatically.
- `?xp=1` forces ON; `?xp=0` forces OFF, even on XP.
- The label proves that the compatibility profile is active. It does **not**
  prove the true OS: Supermium may spoof the user agent. Hover title
  distinguishes automatic browser detection from manual override.
- Regular browsers remain unchanged.

## Transition optimizations, XP profile ONLY

Manual NEXT/PLAY song selection and TIMER/AUTO use the shared
`requestSidSwitch` pipeline:
1. Keep the same original five-second AudioParam fade; no fade-in or changes
   to TinySID, binary SID content, sample rate, timer, per-track gain, reSIDfp
   exemptions or user playlists.
2. Use the pre-existing lightweight TEST122 playback row marker updater for
   **ordinary-sized XP playlists**, avoiding a full jQuery DOM reconstruction
   when choosing the next SID. Previous behavior only supported 1000+ songs.
3. Structural playlist updates (move, remove, rename, save, etc.) still
   perform the full render. This fast path is used at manual/AUTO transition
   entry, at native switch status refresh and after the next SID's playSong.
4. In XP, on a normal five-second fade, postpone expensive SID/ZIP prefetch
   **250 ms** after arming the fade. Generation and queued-index guards prevent
   starting a cancelled/overridden preload. Other browsers and immediate
   no-fade handoffs keep their previous timing.

The existing TEST343 8192-sample ScriptProcessor buffer and 20fps
oscilloscope limit remain. No additional reSIDfp engine was enabled.

## Validation on actual XP

Play a few SIDs in one COMMUNITY playlist and verify:
- A small **XP** appears at far right, in the current COLOR. It stays in
  place while changing COLOR or ★. If absent, compare with `?xp=1`.
- Click another track while audio is playing and listen through the first
  0.5 seconds and fade. Watch for the former 'tiny segment repeated 3×'.
- Let AUTO transition naturally and check for the same symptom.
- Use MOS open, normal playlist, HI-RES/PETSCII/PIXEL and zoom.
- Compare `?xp=0` on the same XP computer if needed.

No claim of glitch-free audio until user confirms it. ScriptProcessor still
shares the UI thread and can underrun under long synchronous ZIP decode or
slow browser/OS playback. If the threefold repeat persists, the next study
should instrument actual audio callback timing before changing engines.

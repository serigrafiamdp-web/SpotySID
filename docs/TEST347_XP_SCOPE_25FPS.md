# TEST347 — XP oscilloscope 25 FPS (safe during SID transitions)

**Date:** 17 November 2026

**Status:** Implemented and simulated checks PASS; real Windows XP/Supermium
display and audio regression **pending user PASS**.

## Why

On TEST343, the XP compatibility wrapper capped all oscilloscope rendering
at **20 FPS (50 ms)**. The PETSCII and PIXEL display wrapper already uses a
25 FPS (40 ms) maximum. That global XP wrapper was preventing all three
modes from reaching 25 FPS even when CPU headroom was available.

## Changes

- While a SID is playing normally on a computer with the XP compatibility
  profile active, the global oscilloscope drawing cap is **25 FPS (40 ms)**,
  for HI-RES, PETSCII and PIXEL.
- While `sidPlayer.autoLoading` is true (manual NEXT / AUTO transition
  fade and source loading), the cap reverts to **20 FPS (50 ms)** to keep
  main-thread CPU time available for Web Audio callbacks.
- First frame after changing visualization mode still draws immediately.
- The global `requestAnimationFrame` loop stays unchanged.
- No audio engine, ScriptProcessor buffer, SID timing/fade, zoom, palettes,
  saved XP preference, per-song TIMER or DOM playlist logic was changed.
- On non-XP profiles, the wrapper remains disabled and all existing render
  behavior is preserved.
- `scopeMaxFps` now reports **25** while XP is active; new
  `scopeTransitionFps` reports **20**.

## Test

1. On Windows XP/Supermium, verify upper-right **XP** remains active.
2. Listen to one SID in HI-RES, PETSCII and PIXEL while observing waveform
   motion. Expected: slightly smoother than TEST346.
3. Click another SID and let AUTO change one. Expected: audio remains clean;
   oscilloscope prioritizes the 20 FPS safe limit while loading/fading.
4. Check mouse-wheel zoom, FILL/LINE and randomized palette.
5. If any short audio loop returns, revert only the `scopeMaxFps` constant
   to 20 while preserving all prior TEST346 functionality.

The 25 FPS figure is a *configured ceiling*, not a measurement of real
frame rate on the user's PC; actual FPS may be lower due to CPU load.

## Simulated JS validation

- XP steady draw times over 0–100 ms: 0, 40, 80 ms.
- XP during loading over 200–300 ms: 200, 250, 300 ms.
- Mode changes force a first render even within the current interval.
- Non-XP startup does not install the FPS limiter.

All checks passed in a controlled JavaScript simulation. Real hardware
performance is not yet verified.

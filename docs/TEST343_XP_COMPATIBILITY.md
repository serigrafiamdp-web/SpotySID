# TEST343 — Windows XP / Supermium audio compatibility (17 November 2026)

**Status: implemented on main; real Windows XP/Supermium PASS still pending.**
**Previous user-confirmed baseline: TEST342 PASS (oscilloscope-only zoom).**

## Goal

Reduce audible gaps and UI stalls around SID transitions on low-powered
Windows XP computers without changing the playback path on modern systems.

## Detection and overrides

The early `js/legacyCompat.test343.js` script reads the browser user-agent.
It enables the legacy profile automatically when the UA reports Windows XP
(`Windows NT 5.1`) or Windows Server 2003 / XP x64 (`Windows NT 5.2`).

**Supermium is Chromium-based and may use a custom/spoofed user agent.**
Therefore automatic identification is best-effort, not guaranteed:

- `?xp=1` — force legacy profile on (even if the UA says Windows 10).
- `?xp=0` — force legacy profile off.
- Without a parameter, follow the reported OS.
- Inspect `window.SpotySidLegacy` in the developer console for effective
  profile, reported browser family and detected operating system.

## Changes

1. Only in legacy profile, the existing `ScriptProcessorNode` uses an
   **8192-sample output buffer** instead of 4096. This adds headroom during
   slow DOM drawing and SID/ZIP handoffs at the cost of a little latency.
   It does not change SID bytes, sample rate or audio synthesis.
2. Only in legacy profile, oscilloscope redraws are limited to **20 FPS**
   across HI-RES, PIXEL and PETSCII, while input, music rendering, timers,
   transitions, MOS, playlist operations and the tested TEST342 zoom remain.
3. `AudioContext.resume()` is now called only when the context is suspended,
   instead of being requested again unnecessarily during every SID load.

No audio engine swaps, playlist database changes, cloud operations, external
browser detection service, or extra UI widgets were introduced.

## Manual validation on XP/Supermium

1. Open
   `https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/?xp=1`.
2. Test NEXT and AUTO through at least three consecutive ordinary SIDs;
   note if gaps/repeating audio occur *during* the fade or *after* switching.
3. Repeat with MOS/PLAYLIST open and in HI-RES, PETSCII and PIXEL modes.
4. Confirm the TEST342 mouse-wheel zoom still affects only the waves.
5. Compare with `?xp=0` on the **same** computer and browser session.

If glitches persist, capture CPU speed, RAM, Supermium version and whether
the freeze also blocks mouse/visual updates. `ScriptProcessorNode` still
runs synthesis on the main UI thread: long synchronous ZIP decoding or a
browser/OS audio-driver stall may exceed even 8192 samples of protection.
A larger buffer or staged decoder may be a later test, not a claim of fix here.

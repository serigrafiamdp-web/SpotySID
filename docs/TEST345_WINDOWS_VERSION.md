# TEST345 — Upper-right Windows version diagnostic

Date: 17 November 2026. **Code implemented; real hardware/Supermium PASS pending.**

The XP indicator no longer lives in the bottom toolbar. A small label is
**fixed at the upper-right edge of the OSC background**, outside the scaled
oscilloscope canvas. It is 12px Tahoma (matching the upper information line),
uses the current theme ink color, and does not receive clicks or obstruct
controls. It is always visible, even when XP mode is not activated.

## What it says

- `XP`: the browser metadata explicitly reports NT 5.1/5.2, OR the listener
  opened the player with `?xp=1`. Hover explains if it was a manual override.
- `11`: Windows 11 reported by Chromium User-Agent Client Hints
  (`platformVersion >= 13`), where supported.
- `10`: Windows 10 reported by platformVersion 1 through 10.
- `10/11?`: legacy User-Agent says NT 10.0 and Client Hints are unavailable
  or inconclusive.
- `WIN ?`: browser did not provide sufficient Windows version metadata.
- Windows 7/8/8.1: shown if explicitly reported in UA.

**Important:** Supermium is documented to misreport Windows XP as Windows 10,
and can misreport its Client Hints as Windows 11. These labels report what
the browser APIs say, not a security-grade proof of the physical OS. When
Supermium reports a misleading version, the only reliable user-controlled
choice is `?xp=1` (known XP computer). This activates XP's audio safety
profile before the player is initialized and labels it XP without claiming
independent hardware detection.

Use `?xp=0` to disable the XP audio profile but leave the version diagnostic
visible. The XP audio/transition improvements from TEST343–344 are otherwise
unchanged.

## Test on real XP

1. Open the normal site and verify that upper-right text appears.
2. Switch COLOR and ★ and verify its color changes without affecting zoom.
3. Open with `?xp=1` and verify upper-right shows XP and that audio is still
   using the 8192-sample low-CPU profile.
4. Switch manually and automatically and listen for short repeated SID sounds
   just before fade-out.

GitHub Pages build/syntax/simulated-browser checks are not a user PASS.

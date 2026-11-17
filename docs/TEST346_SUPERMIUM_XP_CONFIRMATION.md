# TEST346 — Remember actual Windows XP on Supermium

**17 November 2026 | committed; pending user's PASS on their XP computer.**

## The real problem

On **Windows XP**, Supermium can report:
- `Windows NT 10.0` in its User-Agent;
- `19.0.0` as the Windows platform version in Chromium Client Hints.

This makes a browser-only Windows version display say **11** when the actual
computer runs **XP**. See Supermium upstream bug reports #673 and #1692.
JavaScript cannot reliably recover a real operating-system version when
the browser deliberately masks both identification channels. We must not
infer XP from the Supermium name alone (Supermium also runs on modern Windows).

## One-time XP confirmation

In the OSC background **upper-right**, the existing 12px theme-colored OS
text is also a small, accessible click target. No extra toolbar, badge or
modal appears.

- If the browser says **11? / 10? / 10/11? / WIN ?**, click the label ONCE
  on a computer you personally know is Windows XP.
- It saves `spotysid.legacyOS.confirmedXP.v1=1` to localStorage **in that
  browser only**, then reloads SpotySid. The text becomes **XP**.
- The early XP audio profile is active on reload: ScriptProcessor buffer
  8192 samples; 20 FPS scope; lighter manual/AUTO SID transitions.
- Subsequent visits on the same browser stay in XP mode, regardless of
  Supermium's spoofed UA/Client Hints.
- Click **XP** again to clear the saved selection and return to automatic
  detection. No unrelated preferences are touched.
- Enter/Space on the focused label provide keyboard access.
- `?xp=1` and `?xp=0` remain explicit URL overrides of the saved
  preference; the manual selector removes the query override on reload.
- If browser storage is disabled, the click falls back to a URL override.
- Playlist URL/share query parameters are preserved when switching.
- Client Hints that alone claim Win 11 or 10 now show **11?** or **10?**
  until the user confirms the actual operating system. This is deliberate.

This is a **saved user confirmation**, not proof that a web page has somehow
detected the true Windows version. No remote upload, tracking or external
service is involved.

## Test

1. On real XP/Supermium open SpotySid with no `xp` URL parameter.
2. If the upper-right says `11?`, click that text once; verify reload
   shows `XP`. Try changing COLOR and scope zoom; text stays in place.
3. Close the browser and reopen the normal SpotySid URL. Verify XP persists.
4. Try both a manual SID click and AUTO advancing, and report the small
   repeated-audio glitch separately (not claimed fixed by this TEST).
5. Click XP again only if you want to remove that preference.

Source: `js/legacyCompat.test343.js`, markup in `index.html`, style in
`css/style.css`. The previously accepted TEST342 zoom remains unchanged.

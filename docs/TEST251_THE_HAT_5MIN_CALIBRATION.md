# TEST251 — The Hat tunes 2, 3 and 4: 05:00 listening window

**2026-11-15 · Status: published, pending user listening PASS.**

The user reported that the temporary 04:00 TEST250 timer was insufficient to hear the complete arrangements and requested **05:00**.

- **The Hat (tune 1)** (`Fegolhuzz/Hat_tune_1.sid`): **01:48** (108 seconds), **TEST249 user PASS**, unchanged.
- **The Hat (tune 2)** (`Hat_tune_2.sid`): provisional **05:00** (300 seconds), no fade-out.
- **The Hat (tune 3)** (`Hat_tune_3.sid`): provisional **05:00** (300 seconds), no fade-out.
- **The Hat (tune 4)** (`Hat_tune_4.sid`): provisional **05:00** (300 seconds), no fade-out.

The five-minute limits are **measuring windows**, NOT verified lengths. At 05:00 with AUTO ON, each advances directly without fading; the user will report the countdown remaining when each tune ends musically. Duration = 05:00 minus remaining countdown.

Changes: `js/customPlaylist.test101.js` changes only the shared TEST250 Hat 2–4 calibration constant from 240 to 300 seconds. The normal per-song logic, TEST249 no-fade path, absence of global silence detector and unrelated songs' 5-second fade are preserved. `index.html` cache-busts to `test251-hat234-five-minute-calibration`.

**Syntax and invariant checks passed. User listening PASS pending.**

Prior calibration: [TEST250](TEST250_THE_HAT_4MIN_CALIBRATION.md). Stable tune1: [TEST249 PASS](TEST249_THE_HAT_108S_NO_FADE.md).

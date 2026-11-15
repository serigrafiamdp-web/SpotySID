# TEST252 — The Hat tunes 2/3/4: 06:00 calibration and duration audit

**2026-11-15 · Code implemented, deployment/VICE-quality listening PASS pending user confirmation.**

## Timer / fade rules

| Tune | Exact archive entry | Timer | Status |
|---|---|---|---|
| The Hat (tune 1) | `Hat_tune_1.sid` | **01:48 = 108 seconds** | **TEST249 PASS from user**, unchanged |
| The Hat (tune 2) | `Hat_tune_2.sid` | **06:00 = 360 seconds** | Provisional observation window |
| The Hat (tune 3) | `Hat_tune_3.sid` | **06:00 = 360 seconds** | Provisional observation window |
| The Hat (tune 4) | `Hat_tune_4.sid` | **06:00 = 360 seconds** | Provisional observation window |

All four specific The Hat tunes use the already-tested **hard-cut AUTO NEXT without fade-out** at their own timer. The global silence detector remains disabled; all unrelated tunes keep the original five-second fade.

Changed `js/customPlaylist.test101.js`: only `HAT_CALIBRATION_SECONDS=300` -> `360` and related comments/diagnostic version. Canonical `index.html` uses the new query string `?v=test252-hat234-six-minute-calibration`. No changes to music bytes, playlists, backend, interface, or manually saved timers.

## External and internal duration audit

- **Source:** CSDb [The Hat](https://csdb.dk/release/?id=259070), released **2026-02-01** by Fairlight and Genesis Project. Confirms the four SID tracks attributed to Fegolhuzz, but **does not publish a separate verified duration for each SID**.
- **Local repository metadata:** `library/data/musicians-F.json` includes `Hat_tune_1.sid` (4220 bytes), `Hat_tune_2.sid` (4183 bytes), `Hat_tune_3.sid` (4217 bytes), `Hat_tune_4.sid` (1850 bytes), with title/artist/release year. Those lengths are **file sizes, not musical durations**.
- **Local HVSC duration shard:** `library/songlengths/musicians-F.json` has **no keys** for `Fegolhuzz/Hat_tune_[1-4].sid`. Its Songlengths.md5 snapshot is from **2025-10-06**, predating the **2026** release.
- **Binary analysis limitation:** The GitHub connector provided the source ZIP path `library/packs/musicians/F/Fegolhuzz.zip` (400,510 bytes) but binary ZIP fetch is unavailable in this environment. No exact PSID register trace, audio rendering, or digital loop detection was possible in this audit. **Do not invent dates/durations or claim the source SID files were decoded**.
- SID/PSID file headers encode metadata such as load/init/play and number of subtunes, not an authoritative real-time musical duration. Even with the SID bytes, a **running emulator/SID renderer and repeated-state or waveform analysis** is normally required to estimate first-loop boundaries. A loop can repeat continuously **without an audible silent passage**. A global silence detector would miss that.

## Reliable next validation

User should listen with each provisional six-minute countdown, noting the exact **remaining time at the first musical loop** for tunes 2, 3, 4. Estimate **elapsed duration = 06:00 - remaining**. Confirm first repetition if possible. The real playlist-specific end can then replace just these three provisional values, with the already-working zero-fade transition.

**Regression:** tune 1 remains 01:48 PASS, unrelated songs and their 5s fade remain unchanged, AUTO OFF must not switch. Syntax and identity checks after source changes should be recorded separately from user listening PASS.

Prior: [TEST251 five-minute window](TEST251_THE_HAT_5MIN_CALIBRATION.md) · [TEST249 PASS](TEST249_THE_HAT_108S_NO_FADE.md).

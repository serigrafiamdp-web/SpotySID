# TEST254 — The Hat (tune 3): 02:34 and direct AUTO NEXT

**2026-11-15 | Implemented, awaiting user listening PASS.**

## Evidence and timing

The user measured The Hat (tune 3) within the YouTube recording of the demo:
- **Begins:** 07:18
- **Ends:** 09:52
- **Segment duration:** 02:34 = **154 seconds** (09:52 − 07:18).

These timestamps identify the **segment in the edited demo**, not necessarily the exact end/loop of the original SID played without visuals.

## Track profiles retained in SpotySid

| Track | Target duration | Transition | Status |
|---|---|---|---|
| The Hat (tune 1) | 01:48 (108 seconds) | Direct, **no fade** | TEST249 user PASS |
| The Hat (tune 2) | 05:10 (310 seconds) | **5 s fade** starting at 05:05 | TEST253 **user accepted as PASS** |
| The Hat (tune 3) | **02:34 (154 seconds)** | Direct, **no fade** (unchanged policy) | TEST254 pending listening |
| The Hat (tune 4) | 06:00 (360 seconds) | Direct, no fade, provisional listening window | Not yet measured |

The real player selects the target by exact HVSC pack/file `Fegolhuzz/Hat_tune_3.sid` (also matches embedded metadata from artist and Fairlight playlists). Tune 3 uses the already tested hard-cut path `requestSidSwitch(...,'silence')` with AUTO ON, without modifying the SID, the normal fade behavior of unrelated songs, the separate user timer override, or the global silence detector (disabled).

## Tests

JavaScript syntax PASS; isolated simulated playback timers PASS. Tune 3 has no premature switch at 02:33.95, and triggers direct NEXT at approximately 02:34; tune 1 preserved at 01:48 no fade; tune 2 still triggers its 5-second fade at 05:05 to complete at 05:10; tune 4 remains 06:00 no fade; AUTO OFF prevents advancing.

User listening validation pending for tune 3. If the edit ending sounds abrupt, the next optional adjustment is to add a 5-second fade for tune 3 as was done for tune 2, without changing the measured total.

**Main app:** https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/

**Recovery:** `backup/pre-test254-the-hat-tune3-2026-11-15`. Prior docs: [TEST249](TEST249_THE_HAT_108S_NO_FADE.md) · [TEST253](TEST253_THE_HAT_TUNE2_510_FADE5.md).

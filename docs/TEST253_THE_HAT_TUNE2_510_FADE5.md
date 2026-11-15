# TEST253 — The Hat (tune 2) | 05:10 duration, five-second fade-out

**2026-11-15 — PASS: user accepted the resulting Track 2 transition as satisfactory after TEST253.**

## Reason

The user reviewed the original demo on YouTube and reported:
- `The Hat (tune 2)` starts at **02:05** in the demo.
- Its segment ends at **07:15** in the demo.
- Segment length = **05:10 (310 seconds)**.
- Because the demo audio seems to cut before the underlying SID stops, the user requested an exploratory **five-second fade-out before 05:10**, rather than the previous hard cut.

The video segment duration is a user-measured target for this playlist transition, **not an assertion of the SID's inherent looping length**.

## Implemented behavior

- **Tune 1:** `Fegolhuzz/Hat_tune_1.sid`, **01:48**, direct NEXT without fade, **TEST249 PASS preserved**.
- **Tune 2:** `Fegolhuzz/Hat_tune_2.sid`, **05:10** countdown, begin **existing cosine five-second fade-out at 05:05**, replace with next SID around **05:10**, **no fade-in**.
- **Tunes 3/4:** still **06:00 provisional** listening windows with hard-cut NEXT and no fade, unchanged from TEST252.
- **Every other SID:** its original auto timing, fade and database lookup are unchanged.

The patch reuses the already-running standard `SidPlayer.checkAutoAdvance() → player.nextSid() → requestSidSwitch(index, 'next')` five-second transition for **tune 2 only**. The tuned timer is independent of the original HVSC Songlengths.md5 file and applies through the same exact library identity in the Fairlight and Fegolhuzz musician shelves.

Manual per-song timer adjustments still take precedence. **AUTO OFF** disables automatic transitions. The global silence detector stays disabled, the SID bytes and playlist data are unchanged.

## Source and tests

- `js/customPlaylist.test101.js`: `HAT_TUNE2_END_SECONDS=310`; exact per-song duration selection and transition policy.
- `index.html`: cache-bust `test253-hat2-510-fade5`.
- JavaScript syntax check PASSED.
- Mock tests: at 05:04.96 no advance; at 05:05.01 tune 2 invokes the normal fade transition; tune 1 triggers hard cut at 01:48; tunes 3/4 hard cut at 06:00; AUTO OFF blocks advance — **PASS at code level**. The actual audio and YouTube edit boundaries have not been objectively rendered/verified.
- **User PASS:** after TEST253 implementation, the user explicitly stated “damos por bueno track 2”. Fade-out of 5 s before 05:10 is retained.

Recovery branch: `backup/pre-test253-the-hat-tune2-fade-2026-11-15`.

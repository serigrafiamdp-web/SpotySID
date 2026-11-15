# TEST255 — The Hat (tune 3): 03:00 calibration, no fade

**Date:** 2026-11-15. **Status:** implementation and simulated timer checks PASS; actual user listening PASS pending.

The user requested **three full minutes** on The Hat (tune 3), since the prior calculated 02:34 duration from YouTube was too short to evaluate the desired playlist transition.

**Only tune 3 has been adjusted** from 154 s to a **temporary 180 s (03:00)** listening window. This does not replace the earlier video segment evidence (07:18–09:52 = 02:34); it provides additional listening room for the adjustment.

| Tune | Timer | Auto NEXT |
| --- | --- | --- |
| The Hat (tune 1) | 01:48 | Immediate, no fade — user PASS |
| The Hat (tune 2) | 05:10 | Five-second fade from 05:05 — user PASS |
| The Hat (tune 3) | **03:00** | Immediate, no fade — **provisional** |
| The Hat (tune 4) | 06:00 | Immediate, no fade — provisional |

Implemented in `js/customPlaylist.test101.js`, canonical index cache-busted with `?v=test255-hat3-300-nofade`. Existing exact archive identity `Fegolhuzz/Hat_tune_3.sid`, playlist data, SID bytes, timers on unrelated tracks and original global silence detector behavior remain unchanged.

**Tests:** JavaScript syntax PASS. Simulated AUTO triggers at 01:48 (tune 1 direct), 05:05 (tune 2 normal fade), 03:00 (tune 3 direct), 06:00 (tune 4 direct) with no early switches. The user will evaluate the final 3:00 and report an adjustment or PASS.

**Recovery branch:** `backup/pre-test255-the-hat-tune3-3min-2026-11-15`.

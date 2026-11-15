# TEST240 — Ray Manta tracker A/B diagnostic (pending listening)

## Goal
Distinguish a GoatTracker-specific problem from an emulator, filter, SID-data
or SpotySid output-path problem. This is a **diagnostic**, not a confirmed fix.

No production audio path, auto mode, playlists or LFT settings should be changed
while running this comparison.

## Audited, like-for-like HVSC #85 controls

| SID | Player-ID pattern match | PSID | SID clock/model | Init / Play | File bytes |
| --- | --- | --- | --- | --- | --- |
| `/MUSICIANS/R/Ray_Manta/All_the_Hits.sid` | `GoatTracker_V2.x` | v2 | PAL / MOS8580 | $1000 / $1003 | 4569 |
| `/MUSICIANS/R/Ray_Manta/Cazzowary.sid` | `Hermit/SidWizard_V1.x`, `SidWizard_V1.4` | v2 | PAL / MOS8580 | $1000 / $1003 | 4627 |

The bytes originate in SpotySid's `library/packs/musicians/R/Ray_Manta.zip`.
Player identification used Wilfred Bos's `player-id/config/sidid.cfg`
signature patterns searched against the **decompressed original files**.
This is signature-based identification, not a subjective assumption.

## Listening comparison — with the same playback settings

1. DeepSID, **All the Hits**:
   https://deepsid.chordian.net/?file=%2FMUSICIANS%2FR%2FRay_Manta%2FAll_the_Hits.sid
2. SpotySid, **All the Hits**, in the user's Ray Manta playlist:
   https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/
   Check whether the playlist title says **RAY MANTA MODE ON** while playing.
3. DeepSID, **Cazzowary**:
   https://deepsid.chordian.net/?file=%2FMUSICIANS%2FR%2FRay_Manta%2FCazzowary.sid
4. SpotySid, **Cazzowary**, from the same playlist and engine route.

To compare old TinySID behavior separately, open SpotySid with
`?raymode=off` (only bypasses Ray Manta mode); use the same song and song
position. Do not modify filter, song volume, gain or playback speed between
pairs. On DeepSID use the same emulator (ReSIDfp for the most useful initial
comparison) and SID model, if offered.

Record results with one of: **good / recognisable but wrong / broken** for
each of the four playbacks. Also note whether the mode label was visible in
SpotySid; no label means that the targeted route was not confirmed.

## Interpretation

- **GoatTracker bad in SpotySid, SID-Wizard good**, both good in DeepSID:
  focus on GoatTracker's waveform hard-restart/ADSR timing, filter or
  SID register write emulation; audit SpotySid's rendered audio against a
  cycle-accurate reference.
- **Both bad in SpotySid, both good in DeepSID**:
  look at the common reSIDfp adapter, SID initialization, filter and
  Web Audio output; tracker type does not explain the problem on its own.
- **Both bad in DeepSID and SpotySid**:
  compare emulator settings/chip and the expected release's audio
  before making engine changes. It may not be an app-specific regression.
- **Missing RAY MANTA MODE ON while playing Ray**:
  isolate reference selection and TEST239's immutable-byte recognition
  before making sound-quality changes.
- **DeepSID sounds good with WebSid or JSIDPlay2 but not reSIDfp**:
  isolate a reSIDfp implementation/version or filter difference.

## Status
Waiting for actual listening outcomes. Do not mark PASS until reproduction
has been compared with a known-good rendering. No release-wide fix is
claimed here.

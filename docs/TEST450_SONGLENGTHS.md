# TEST450 — Individual song duration (experimental)

TEST449 was confirmed PASS by Rico in VICE (November 27, 2026): a D81 exported from SpotySID starts the player and plays consecutive songs. The rollback branch is [test449-d81-export](https://github.com/serigrafiamdp-web/SpotySID/tree/test449-d81-export), commit 75cbce8a8608e77d816379dc6e2025c6fee70fbc.

TEST450 keeps TEST449's exact SHA-256 SID matching, order, disk writer, verification, collection-specific fade lookup, and approved TEST92 binary. It generates a modified copy of the PRG only on export, without modifying either repository's original MASTER.

## Export metadata

Uses the existing SpotySID Songlengths shard lookup for the default subtune. Copies the native Tom-Cat InjectSongLengths convention (PSID v2 bytes $7A = BCD seconds, $7B = BCD minutes). Only the exported copy of a matched single-chip PSID v2 is modified, after verifying its original hash. Missing duration is 03:05. Known tracks shorter than 00:15 or longer than 99:59 are skipped for this test, since the 5-second prefetch and 8-second fade need a safe window and native timer has two minute digits. No speed or subtune modifications.

## Player runtime

Changes only five regions of the 15,014-byte PRG. The original TEST92 selector code, fade table remap, fade engine and RAM exit trampoline $42E0 remain unchanged. The existing installer already copies the reserved 256-byte helper region to $4200; redirect its final JMP to $4260, where a 29-byte helper installs JSR hooks and jumps to the original $42E0 trampoline without modifying CPU banking. No new RAM or KERNAL workspace allocations.

- $30CA: initial activation hook (original LDA $3001) reads native PSID header bytes $86/$87 before restart. Then restores X and processor flags and performs the original LDA.
- $3A1A: Krill metadata hook (original LDA $3E0B) reads cached header bytes $3E7A/$3E7B before restart. Then restores X and processor flags and performs the original LDA.
- $4280 / $4294: hook wrappers. $42A8: shared BCD-to-ASCII conversion writes $0116, $0117, $0119, $011A. Colon, timer controls, fade algorithm, IRQ and SID payload are unchanged.

Native initial header lifetime at the hook, real cold boot, automatic handoff, timer accuracy and actual fade timing still require VICE. The CPU instruction test exercised the emitted installer and both wrappers with 11,970 cases for durations 00:15–99:59; register/stack and displaced instruction verified. JS injection checked 5,985 valid durations, fallback, bounds and unchanged input bytes. These are component simulations, not full emulator playback.

Test: export a known playlist with differing DB lengths, mount in VICE, check timer on first song and after automatic NEXT and manual RETURN. The last eight seconds should fade using the existing engine. Do not promote TEST450 to MASTER until user verifies it.

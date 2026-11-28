# Universal D81 exporter — roadmap / TEST99 double PASS (2026-11-28)

Goal approved by Rico: build one universal exporter, not a series of playlist-specific machine-code patches. Add support gradually and preserve working compatibility.

Native checkpoint: [SIDPLAY64MIX TEST99 PASS](https://github.com/serigrafiamdp-web/SIDPLAY64MIX/tree/MASTER-2026-11-28-TEST99/MASTERS/2026-11-28_TEST99_PASS) at commit 935c44805062bb9b07510bbbccfcce1edc7e5f84. Same 15978-byte PRG in both user-approved VICE disks: UCTUMI (84) and NordischSound (56), fade and individual duration working. SHA256 090100aac04a5d2eff76e27597154a5a22c34133bf1892730c18b4734355ee55. These are collection acceptance tests, not exhaustive HVSC compatibility.

## Architecture
- A fixed versioned 00player.prg: no export-time patching or composer-specific binaries.
- SpotySID analyzes actual selected SID/subtune, checks memory and engine compatibility, associates tested profiles with content hash and subtune, obtains catalog durations, and emits PLAYMAP.DAT in exact disk SID order. Use safe no-fade fallback when the engine is playable but volume handling is unverified. Do not accept unsafe load/INIT/PLAY.
- D81 writer preserves SID music payload, writes the fixed player and ordered SIDs, then the auxiliary PMAP file. PMAP v1: 12-byte header, 8-byte records, 16-bit volume instruction site and duration, fade seconds/method, index, reserved; count 1..100, CRC. Add robust file identity/order binding before expanding broadly.
- TEST99 still uses two BCD bytes 122/123 in exported SID header copies for the timer. Both reference maps contain corresponding durations; all 140 records agree with headers. Later move timer reads to PMAP so original SID bytes remain unchanged.
- Replace accumulated native binary overlays with maintained 64tass source modules and reproducible builds. The frozen binary is a regression oracle, not a template for new per-playlist hacks.

## Integration acceptance
1. Start experimental integration from current exporter; preserve TEST452 MASTER and current TEST455 main.
2. Reuse the exact TEST99 binary without modification, implement map serialization and deterministic directory order.
3. Reproduce the two approved collections, verify bytes/CRC/order and run VICE regression (startup, hide auxiliary file, timed and ENTER fades, timers, continuous transitions).
4. Validate mixed and unknown engines, collect diagnostics and compatibility profiles. Only promote when approved. Widen memory and engine support incrementally, with auditable tests.

This is documentation only. No exporter scripts, web deployment, or active native master changed.

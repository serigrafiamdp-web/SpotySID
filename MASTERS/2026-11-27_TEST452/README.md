# November 27, 2026 — TEST452 player binary backups

Current approved SpotySID export MASTER: [TEST452](../../docs/MASTER_2026-11-27_TEST452.md). This directory is an archive only; runtime fetch paths and application code are unchanged.

| File | Bytes | Git blob |
|---|---:|---|
| [SIDPLAY64MIX_TEST94_BASE.prg](SIDPLAY64MIX_TEST94_BASE.prg) | 15,014 | `384a56bc82ad594e06bbe94f68d6702b38dcbe3b` |
| [SIDPLAY64MIX_TEST452_REFERENCE.prg](SIDPLAY64MIX_TEST452_REFERENCE.prg) | 15,288 | `bc85d91b0afb93558aab8dbe1d97bd8afa6f8596` |

The first file is an exact independent backup of the approved standalone TEST94 base, identical to `assets/sidplay64mix/test94/00player.prg`. The second is reconstructed using the approved TEST452 exporter timer overlay and identity fade-map remap for all 100 original verified TEST92 corpus entries in their original order. It is **not the extracted player from Rico's latest D81**, which was not supplied. It is not a universal launcher: any other playlist or order needs the exporter to regenerate its fade map and inject song lengths into the SID copies. File naming is handled by the D81 exporter, not the PRG. Do not substitute the reference binary directly into a different disk.

Rebuild and compare: `python MASTERS/2026-11-27_TEST452/rebuild_reference.py`. Original TEST452 code and frozen branch remain unchanged. No independent VICE test of this reconstructed reference artifact is claimed.

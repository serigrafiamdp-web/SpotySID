# TEST433 — CREATE D81 preflight

- Adds CREATE D81 to primary, secondary and pinned playlist headers. Uses a snapshot of that window, independent of current audio playback. No playlist or SID modification.
- Non-modal, draggable, resizable Topaz window using SpotySID theme variables.
- Reads original SID bytes from existing local, HVSC ZIP or NO HVSC sources; uses the existing Songlengths shard cache for the default subtune.
- Conservative TEST84B header candidate profile: single-chip PSID v2, embedded LOAD, PAL-capable (unknown clock is not certified), nonzero INIT/PLAY inside payload, entire body within $1000–$2FFF, excluding $xxFF LOAD (historical loader guard).
- Candidate is NOT runtime certification. Historical additional memory classes need revalidation against TEST84B's helpers. No fade map or timer patch is synthesized yet. Export intentionally disabled until a generic player and independent disk tests exist.
- Estimated D81 data capacity: 3160 blocks (track 40 reserved), minus 58 launcher blocks, 254 bytes per data block. Current historical selector ceiling is 162 SIDs, not a fixed 100. Final generator must reserve any metadata and verify BAM/chains and selector ceiling.
- Scan in order; skips rejected or over-capacity entries, keeps scanning later smaller entries. Reports unavailable files separately in the row. No duration metadata written yet.
- Validation: synthetic PSID header positive and rejection tests executed while creating the branch. Visual and real C64 tests pending.

## TEST433B — compilation notice

The exporter explains the approximate 80–100 SID expectation, automatic candidate filtering, and intended ready-to-use D81 including 6R6's Sidplay64 Sid Mix Mod by Rico. This estimate is not a fixed limit or a compatibility guarantee. The actual selection still depends on the candidate filter, capacity and current player ceiling. Export remains disabled at this preflight stage.

## TEST434 — CREATE C64 DISK

The playlist action and floating window are now CREATE C64 DISK. D81 is selected by default; D64 can be selected before, during or after scanning. Switching formats replays cached preflight results in playlist order without downloading the files again. A 35-track D64 provides 664 data blocks, or 606 after reserving the current 58-block PRG. D81 provides 3102 after the same reservation. The existing 162-SID selector cap still applies; metadata overhead remains to be accounted for in the final generator. Both EXPORT buttons remain disabled pending generic player integration and drive tests. No changes to SID parsing or fade engine.

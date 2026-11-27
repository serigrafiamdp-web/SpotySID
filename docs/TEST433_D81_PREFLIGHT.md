# TEST433 — CREATE D81 preflight

- Adds CREATE D81 to primary, secondary and pinned playlist headers. Uses a snapshot of that window, independent of current audio playback. No playlist or SID modification.
- Non-modal, draggable, resizable Topaz window using SpotySID theme variables.
- Reads original SID bytes from existing local, HVSC ZIP or NO HVSC sources; uses the existing Songlengths shard cache for the default subtune.
- Conservative TEST84B header candidate profile: single-chip PSID v2, embedded LOAD, PAL-capable (unknown clock is not certified), nonzero INIT/PLAY inside payload, entire body within $1000–$2FFF, excluding $xxFF LOAD (historical loader guard).
- Candidate is NOT runtime certification. Historical additional memory classes need revalidation against TEST84B's helpers. No fade map or timer patch is synthesized yet. Export intentionally disabled until a generic player and independent disk tests exist.
- Estimated D81 data capacity: 3160 blocks (track 40 reserved), minus 58 launcher blocks, 254 bytes per data block. Current historical selector ceiling is 162 SIDs, not a fixed 100. Final generator must reserve any metadata and verify BAM/chains and selector ceiling.
- Scan in order; skips rejected or over-capacity entries, keeps scanning later smaller entries. Reports unavailable files separately in the row. No duration metadata written yet.
- Validation: synthetic PSID header positive and rejection tests executed while creating the branch. Visual and real C64 tests pending.

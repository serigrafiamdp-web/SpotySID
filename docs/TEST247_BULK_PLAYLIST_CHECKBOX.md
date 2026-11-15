# TEST247 — Compact multi-select SID actions

## Request

Add one clickable checkbox to **every playable SID row**, as the **first small
control immediately left of +**. Its width is 27 px, identical to the
existing + control, with the selected SpotySid theme applied to border,
checkmark, hover and focus. Do **not** add a separate toolbar.

## User interaction

1. Open any playlist in the floating player; check two or more SID entries.
   The existing track count displays `N CHECKED`. Uncheck to deselect.
2. Use one existing row's `+` to add **all checked songs** in their visible
   playlist order to the current `ADD + TO` destination. Duplicate references
   are skipped. For imported local SIDs without verified HVSC/NO HVSC
   references, use the EXISTING NO HVSC archive in batches with one
   beta-key authorization for the entire selection (rather than once per
   SID). Only one draft update/render happens at the end. Source playback is
   not changed.
3. Use an existing `↑` or `↓` to move checked songs one slot. Double-click
   works with the existing 10-slot movement. Selections retain their
   relative order. Unchecked songs retain their relative order.
4. Use an existing `×` to remove **all checked songs** from an editable loaded
   playlist in one operation. Public lists are not updated until the existing
   authorized REPUBLISH workflow. The current playing SID is preserved if it
   is not removed; otherwise playback selects the nearest remaining SID.
5. When **no** song is checked, all existing single-SID actions retain their
   original behavior. Loading a new playlist clears stale checked items.
   Checkmarks do not play the underlying SID.

## Preservation rules

- No new controls except the checkbox; no new panel, pop-up, upload or prompt.
- Selection is attached to SID entry objects, **not array indices**, so
  reordering cannot accidentally act on the wrong song.
- Reordering uses one permutation for track objects, HVSC path list,
  public playlist references, NO HVSC archive references and playing/queued
  indices. No restart of SID playback for a reorder.
- The archived NO HVSC collection retains its existing behavior: it can be
  reordered within artist groups; removing a SID from the underlying archive
  is not exposed by the current collection editor.
- Historical immutable TOP rankings retain their existing fixed order. Their
  songs still get checkboxes and support batch `+` to a personal REMIX.
- 1,000+ SID playlists reuse the existing fast-marker optimization. A
  checkbox toggle updates the count and arrow state without re-creating
  1,376 rows.
- No changes to the audio engine, fade, ray mode, LFT mode, D1 API,
  publication authorization, playlist sharing or community ranking.

## Verification

- JavaScript syntax check: PASS.
- 9 permutation cases: disjoint, contiguous, edges, ±1 and ±10: PASS.
- NO HVSC artist-group permutation test: PASS.
- Batch move/remove simulation: parallel source/public/track arrays retained
  identical ordering, audio playing index remapped, selected state cleared
  on delete: PASS.
- CSS and JS version in `index.html` updated for fresh deployment.

## Manual acceptance pending

- Open SpotySid, check songs 2 and 4: the two small boxes appear immediately
  LEFT of the + controls and use the selected palette.
- Check three songs, press + with ADD + TO selected: all three appear once
  in the destination and current audio continues.
- Check disjoint songs, press ↑ once and ↓ twice; verify both movement and
  retained selection; try double-click for 10 positions.
- Check several songs including the current one, press × and inspect the
  remaining list. Confirm the original public list stays untouched until
  authorized REPUBLISH.
- Repeat with NO HVSC, TOP 100, and a large 1,000+ SID playlist; their
  pre-existing edit permissions remain intact.
- Uncheck all: the original per-row + ↑ ↓ × behavior returns.
- Confirm C64 audio never stutters on checkbox toggling.

**TEST247 pending user PASS; no live-browser acceptance performed.**

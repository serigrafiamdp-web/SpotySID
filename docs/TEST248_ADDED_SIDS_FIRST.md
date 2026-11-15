# TEST248 — Newly added SIDs appear first in destination

## Requested behavior

Every SID added with **+** is inserted at the top (position 1) of the selected
ADD + TO destination, instead of at its end. For a checked batch, the **entire
new group** appears first, preserving the selected songs' source order.

Example:

- Existing destination: `OLD A, OLD B`
- Checked SIDs in source order: `NEW 1, NEW 2, NEW 3`
- After +: `NEW 1, NEW 2, NEW 3, OLD A, OLD B`

Existing duplicates are skipped **without moving the original**. For example,
if `NEW 2` was already in the destination, it stays in its prior position.
The other new songs still appear as the first group.

## Implementation

- `js/customPlaylist.test101.js`: the existing `addRemixTrack` accepts
  an optional batch insertion offset. Single additions splice at index 0.
  `bulkAddCheckedSids` passes the count of successfully inserted songs,
  ensuring their original order is retained at the beginning.
- Uses the same canonical HVSC/NO HVSC track references, duplication checks,
  local draft persistence, playlist preview, + destination selection, and
  existing SAVE/REPUBLISH workflow.
- The source playlist, current audio playback, SID engines, controls, SHARE
  links, public playlist ID, and COMMUNITY ordering do not change.
- `index.html` refreshes the JS cache as `test248newfirst`.

## Checks performed

- Real repo's `addRemixTrack` + `bulkAddCheckedSids` evaluated in a
  mocked runtime, with no network actions.
- Single + inserted first: PASS.
- Repeated single + skipped without reordering: PASS.
- Checked batch put all new songs first in source order while leaving two
  existing destination songs unchanged: PASS.
- Duplicate in batch skipped without altering the existing copy: PASS.
- JavaScript syntax: PASS.

## Manual acceptance (pending)

Open SpotySid. Load a list with at least two SIDs. Choose an ADD + TO
destination that already contains songs. Add one SID using +; verify it
is first in the destination. Then check three different songs, press +,
and confirm they appear as a group at positions 1–3 with the same relative
order in which they appeared in the source. If a duplicate exists, ensure
its existing position did not change. SAVE/REPUBLISH as usual when ready.

**TEST248 — Pending browser PASS.**

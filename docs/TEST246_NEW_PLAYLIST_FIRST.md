# TEST246 — New playlists first in COMMUNITY

## Change

Community ordering is currently event-based: the latest successfully published or
authorized republished playlist appears first. TEST219 already moved
confirmed EDIT/REPUBLISH changes to the top; TEST246 applies the same D1
`/catalog-order` revision-guarded protocol to **new public playlists**.
No new backend endpoint, database column, key request, or restriction was added.

## New publication paths

1. **REMIX → PUBLISH**: after the existing D1 GET verifies its saved SID
   references and order, promote the new public ID to index 0. Reuse the
   already entered beta key. Clear the private-created placement flag.
2. **Local V2 saved playlist → PUBLISH**: only on a new POST, and after GET
   verification, promote the new D1 ID. Reopening an already-published
   local list does not artificially make it newest.
3. **MY PLAYLIST → PUBLISH** (HVSC library creation): after a successful
   POST and GET verification, promote the new D1 ID. A subsequent
   ordering failure reports `COMMUNITY ORDER PENDING` without hiding
   the fact that the publication itself succeeded.
4. **OLD SID COLLECTION RICO first-time adoption**: first publication now
   counts as a CREATE event for ordering. Existing updates still follow
   the EDIT/REPUBLISH rule.

Separately, a **new unpublished REMIX draft** appears first in the
creator's local COMMUNITY list immediately after CREAR. It is not
published or added to the shared D1 order. If the creator manually reorders
Community rows, that manual choice takes priority until a new draft
is created. Only public playlists can have shareable public links.

## Invariants

- No new playlist is sent to the global ordering endpoint before a
  verified publication.
- A failed POST, invalid beta key, or rejected D1 verification never
  moves an unverified list to the top.
- The global order is revision-guarded; 409 retries read the latest
  sequence so another user's newer promotion is not overwritten.
- No automatic move on PLAY, opening a share link, creating an empty
  local list in the browser, or editing unpublished drafts.
- A verified REPUBLISH still goes first, and its public ID, SHARE URL and
  SID content order remain unchanged.
- Static historical catalog IDs and the existing manual rank controls
  remain intact.
- No change to the SID audio engines, LFT/Ray Manta detection, import,
  timer, fade or oscilloscope.

## Automated checks performed

- Full `customPlaylist.test101.js` JavaScript syntax check: PASS.
- Mock D1 shared-order promotion: new public ID at index 0; older
  public order preserved; beta-authorized PUT and GET verification;
  local draft/dirty state cleared: PASS.
- Invalid new ID rejected before any network request: PASS.
- Cache-bust in `index.html` points to TEST246 script.

## Manual acceptance (pending)

1. CREATE an empty REMIX, provide name/creator, press CREAR: it should
   immediately be first in the creator's COMMUNITY list.
2. Add an SID and PUBLISH using the existing beta workflow: the new
   published list should move to first in COMMUNITY for everyone.
3. Open COMMUNITY from a different browser, refresh, and confirm that
   this new public list is first in the shared order.
4. EDIT/REPUBLISH another published list: that list becomes first;
   the freshly created list moves second.
5. SHARE both lists: their existing links remain valid and load the
   correct playlists. Press PLAY on a public list: no reordering.
6. Simulate a publication/ordering failure if possible: display
   an accurate pending status, never claim the list moved if D1
   ordering was not confirmed.

TEST246 is implemented in the GitHub repository; real browser/D1 acceptance
is still pending user confirmation. Do not mark PASS prematurely.


**TEST246 — PASS confirmed by user on 2026-11-15.**

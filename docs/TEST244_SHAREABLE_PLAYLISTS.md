# TEST244 — Shareable COMMUNITY playlist links

## Scope

- Every **published D1 community playlist** gets a public, stable link based on
  its existing Worker ID, including when the owner REPUBLISHes the song order.
- Published/historical **GitHub curated playlists** also get links based on
  the ID in `community/playlists.json`.
- A small `SHARE` button appears on each public catalog row. The currently
  loaded public/curated playlist also has `SHARE` in its floating header.
- Locally saved lists and unpublished REMIX drafts **cannot** have portable
  links until their content is PUBLISHed. No upload, secret, beta key, or SID
  data is placed inside a share link.
- No change to the SID emulation, timers, per-song order, fades, LFT mode,
  Ray Manta mode, EDIT, or REPUBLISH.

## Link format

`https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/index.html?playlist=<public-id>`

`public-id` is either a verified D1 published playlist ID or a static
community-catalog ID. Only IDs already present in the public catalog are
accepted for automatic selection. The link fetches the public playlist from
the same sources as the existing catalog PLAY button.

Example curated link (valid only while the corresponding catalog entry exists):

`https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/index.html?playlist=unknown-csdb`

## Direct-open behavior

1. On page load, parse the `playlist` query parameter; accept only
   alphanumeric/hyphen IDs within 80 characters. No query ID => no automatic
   playlist selection (preserves TEST161).
2. Load the standard public/community catalog and find a matching remote or
   static ID. Never treat the query as an arbitrary server path.
3. Fetch the matching *published* list from the existing Worker or JSON file.
   Ignore any browser-local unpublished EDIT/REMIX draft for this shared entry.
4. Use the existing `loadStoredPlaylist` and first-song playback path. Show
   the floating playlist and current first SID. Do not modify saved lists.
5. Browsers can suspend Web Audio until a user gesture. If suspended, the
   already-present main PLAY button is used to enable audio without toggling
   immediately into PAUSE. The listener may need one click to hear music.
6. Missing/deleted IDs cause a visible `Shared playlist not found` message
   and leave ordinary COMMUNITY discovery available.

## Suggested manual acceptance tests (not yet confirmed)

- Open the standard home page without `?playlist=`: no automatic song
  selection.
- Click `SHARE` on an existing D1 published row; paste the copied URL in a
  different browser/private window. It loads that public list, with correct
  name, creator, track count and order. If autoplay is blocked, first PLAY
  click resumes audio without pausing the selection.
- Repeat with a curated/static community row, e.g. `unknown-csdb`.
- Click `SHARE` on a currently playing public list's floating header.
- Load a long/virtualized public playlist and confirm header SHARE is shown.
- Confirm a local unpublished list has no public SHARE. Publish it and use
  the published COMMUNITY row.
- REPUBLISH a song-order update on a public list; its link still targets the
  same ID and obtains the server's latest published order.
- A nonexistent `?playlist=` ID displays an error, not another playlist.
- Test with a modern autoplay-restricting browser and a user gesture.
- Re-check LFT, Ray Manta, normal transition, and EDIT paths for regressions.

## Release verification

Static syntax, link creation and DOM wiring checked. Browser playback, URL
copy permissions, deployed Worker availability and autoplay policy still need
user/device acceptance. **Do not mark PASS until direct links are tested.**

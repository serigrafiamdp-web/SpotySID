# TEST432 — Thunder NO HVSC cleanup (2026-11-26)

## Confirmed status

- **GitHub binary storage:** 104 imported Thunder SID files removed from `serigrafiamdp-web/ricos-sid-uploads` on `main`, commit [6fbf95fa](https://github.com/serigrafiamdp-web/ricos-sid-uploads/commit/6fbf95fa809a901ca281f3076708b0a0b32bacb4). The diff consists of exactly 104 removed `sid/<sha256>.sid` files; no other files were changed.
- **Preserved:** 13 original RICO SID and 3 Uctumi SID imported before 2026-11-21. The 104 Thunder SID headers were inspected and did not identify RICO/Uctumi as authors.
- **Cloudflare D1:** **NOT YET CLEANED**. The binary removals temporarily leave stale references until the D1 action below is completed. Do not mark PASS yet.
- **THUNDER 100 SIDS NO HVSC playlist:** user will delete the playlist manually after D1 cleanup. This maintenance does not delete the playlist identity.

## Operator procedure (Cloudflare D1, production)

1. In Cloudflare, open Workers & Pages → D1 → database `ricos-sid-community` (`0a860e88-4d84-40e6-9b5a-d52a7ab22c99`) → Console. Ensure this is the **production** database.
2. Execute [TEST432_THUNDER_AUDIT.sql](TEST432_THUNDER_AUDIT.sql) first (read-only).
3. Expected audit: `total_no_hvsc=120`, `thunder_identified=104`, `thunder_in_no_hvsc=104`, `other_sids_to_keep=16`, `protected_author_conflicts=0`, `github_asset_records=104`. STOP if any count differs; DO NOT run APPLY.
4. Take a D1 backup/snapshot if available. Then execute [TEST432_THUNDER_APPLY.sql](TEST432_THUNDER_APPLY.sql) in D1 Console **as one complete script** (it creates backup tables, enforces a 120/104/16 guard, updates affected playlist track references, and removes exactly the listed SHA-256 records from metadata and collections).
5. Verify `no_hvsc_remaining=16`, `collection_remaining=16`, `protected_remaining=16`, `thunder_remaining=0` from the final SELECT. Confirm the public `GET /no-hvsc` and OUR COLLECTION display 16 entries after refresh.
6. The user can then delete the playlist `THUNDER 100 SIDS NO HVSC` separately using the normal authorized playlist Delete action. The script preserves the playlist record and backup journal.

**Safety:** Never remove more files based on titles, artist name, or playlist position. Only exact SHA-256 IDs from the 2026-11-21 import were removed from GitHub and listed for D1. Historical Git commit objects can still contain earlier versions. Do not share beta keys, GitHub tokens, or Cloudflare API tokens in chat.

## TEMPORARY UI QUARANTINE — TEST432 (implemented)

- Frontend commit [492e342f](https://github.com/serigrafiamdp-web/SpotySID/commit/492e342f9cf8508dbe2a29e48d7cd0c33caab45d) installs a client-side exclusion list of the **104 exact Thunder asset SHA-256 IDs**; the main HTML now requests `customPlaylist.test101.js?v=test432-hide-thunder-nohvsc`.
- The **NO HVSC** published collection loads **16 visible SID (13 RICO + 3 Uctumi)** from its 120 D1 entries; its track count and OUR COLLECTION search metadata use filtered results. Local IndexedDB v1 SID listings are also filtered by SHA-256 where Web Crypto is supported.
- The A/B playlist browse and v2 playback routes exclude withdrawn `sidId` references; a filtered published playlist's SAVE/REPUBLISH is read-only to avoid silently changing the remote snapshot. Other HVSC library entries are not hidden by file-name matches.
- **This filter is not a D1 deletion or an API-level block.** Direct calls to Cloudflare `/no-hvsc` continue to show its unmodified records until D1 is cleaned. The repository binary deletion happened separately (see above).
- The curator will delete the THUNDER community playlist manually. **Frontend browser PASS and GitHub Pages propagation are not yet confirmed.**

### Browser verification

1. Hard-refresh [SpotySID](https://serigrafiamdp-web.github.io/SpotySID/) and navigate to **OUR COLLECTION**. NO HVSC should report **16 SID**, not 120.
2. Search titles/artist names of withdrawn Thunder SID: these should not appear from NO HVSC. Search and open RICO and Uctumi titles: they should remain.
3. Press PLAY on NO HVSC. Expect 16 entries and no missing/broken SID loads. Existing A/B audio should not change when browsing.
4. Delete the THUNDER playlist manually from COMMUNITY when convenient, without using the separate D1 cleanup scripts.

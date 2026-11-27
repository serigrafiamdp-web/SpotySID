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

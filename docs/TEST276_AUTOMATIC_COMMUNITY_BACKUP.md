# TEST276 — Automatic backups for SpotySid COMMUNITY playlists

**Status (2026-11-16):**
- **Independent GitHub backup: LIVE / INITIAL RUN VERIFIED.** Workflow `.github/workflows/backup-community-playlists.yml` completed successfully after being committed. Manifest `backups/community/runs/20261116T043332476921Z.json` confirms **31 public playlists, 31 version files, 5,867 track references**, and no missing IDs. GitHub Actions workflow run: https://github.com/serigrafiamdp-web/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/actions/runs/43804795032
- **Immediate Cloudflare D1 revision journal: SOURCE READY, NOT DEPLOYED.** Changes are in `community/api/worker.js` and `community/api/schema.sql`. Do not say it is active until a real Cloudflare deploy and a readback from D1 are verified.
- Restore is **manual/admin-only**; no RESTORE action or beta-key restoration endpoint exists yet.

## What is protected

The public `/playlists` catalog and the complete `/playlists/:id` payload for each published COMMUNITY list, including title, creator, permanent ID, every SID reference, and exact order. All published lists are covered, not just the creator's lists.

The shared **BETA KEY** is not used by the external backup job. A beta-key leak cannot invoke a delete API for backup files or D1 revision rows. The GitHub backup requires repository write permissions, separate from the beta key.

**Limitations:** The public backup only captures playlists already published on Cloudflare, not unpublished local browser drafts. It does not back up SID file bytes: HVSC files and archived NO-HVSC assets have independent storage. GitHub history and the append-only version directory are the recovery source; **no automatic restore** occurs when a deletion is detected.

## Independent GitHub backup — LIVE

- Workflow: `.github/workflows/backup-community-playlists.yml`
- Script: `scripts/backup_community_playlists.py` (Python standard library, read-only public Worker GETs)
- Schedule: every **6 hours**, at UTC minute 17; GitHub schedules may start late.
- Also supports **Run workflow** manually and triggered its initial run on push.
- For each public list, `backups/community/versions/<playlist-id>/<sha256>.json` stores a full content-addressed immutable snapshot. Identical subsequent editions are not copied again; modified editions retain the older version and add a new one.
- Each run creates a `backups/community/runs/<timestamp>.json` manifest with all IDs, counts, digests and IDs missing since the previous run.
- The GitHub Actions job commits files with its GitHub-owned token; **no Cloudflare or beta credentials are required**. It does **not** remove old backups.
- Fail-closed validation: an empty catalog, truncated 500-list catalog, incomplete JSON, duplicate IDs, missing detail, empty tracks, or a catalog/detail count discrepancy aborts rather than declaring a potentially partial backup successful. Previously committed versions remain untouched.
- Missing public IDs produce a GitHub Actions warning, while retaining their earlier snapshots.

### First successful snapshot

- 16 November 2026, 04:33:32 UTC (01:33:32 Buenos Aires)
- 31 published playlists; 5,867 listed song references
- 31 immutable version files and one run manifest

## Immediate D1 journal — DEPLOY REQUIRED

The Worker source now seeds a **baseline** for existing published playlists in a `playlist_backup_versions` table and automatically journals each successful playlist mutation:

- **POST** (create): new playlist and its backup in a single `DB.batch()` transaction
- **PUT** (reorder/remove/add tracks): new payload plus journal in one transaction
- **PATCH** (rename metadata): new payload plus journal in one transaction
- **DELETE**: original playlist payload archived first and deletion executed in the **same transaction**

Cloudflare D1 `DB.batch()` guarantees transactional rollback if a SQL statement fails. No API endpoint for reading, modifying or deleting `playlist_backup_versions` has been added. If the backup table is not writable, the Worker refuses the playlist mutation with HTTP 503 rather than risk an unbacked edit. Existing client behavior requires no additional UI.

**Deployment prerequisite:** Save/export the current live Worker and D1 first, because dashboard-edited production code may differ from GitHub. Reconcile before running `npx wrangler deploy --config community/api/wrangler.toml` using authorized Cloudflare access. Keep the existing D1 `DB` binding and `BETA_EDIT_KEY` secret. Never commit credentials. Verify `playlist_backup_versions` after a harmless authorized test action; verify any Worker-specific features previously deployed in the dashboard remain present.

## Admin-only recovery procedure (not yet automated)

1. Locate the desired public playlist by original ID under `backups/community/versions/<id>/`; consult `runs/` to identify the last known good SHA256.
2. Inspect the version's JSON and `tracks` order. Preserve the original ID, title, creator and references; do not assume any snapshot is the correct one merely because it is most recent.
3. Back up the present D1 state and current code before changing records.
4. With **Cloudflare D1 administrator credentials**, compare the desired payload to D1 `playlists`. For a missing list, a controlled insert with its original ID may be required; for a damaged list, a controlled update. Do not expose these operations through the shared beta key.
5. Confirm the list's `GET /playlists/:id` payload and that it plays in SpotySid. Verify any NO-HVSC asset links are still available.
6. Retain the backup history even after successful restoration.

## Acceptance checks

- [x] GitHub backup job completed successfully on initial push.
- [x] 31 artist/community list version directories created.
- [x] Run manifest counts 31 playlists and 5,867 tracks.
- [x] A sample backup document could be opened and parsed, including its 19 ordered SID references.
- [x] Worker source updated to journal POST/PUT/PATCH/DELETE transactionally and fail closed on unavailable backup storage.
- [ ] Production Cloudflare Worker deployed and D1 journal inspected.
- [ ] Second scheduled GitHub backup run verified.
- [ ] Controlled DELETE or damage-then-admin-restore test done (only after a safe restoration plan is approved).

**This is automatic backup, not automatic undelete.** Publishing and playback stay unchanged, and no account/user-permissions system is introduced.

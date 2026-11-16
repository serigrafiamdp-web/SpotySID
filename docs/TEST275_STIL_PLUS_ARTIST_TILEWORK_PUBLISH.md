# TEST275 — Publish STIL+ artist TILEWORKS

SpotySid stores artist-specific 256×64 1-bit drawings in the **STIL+ ARTWORK** section, independently of HVSC's official STIL text. No HVSC source file or official STIL shard is modified by these operations.

## Flow

1. Open **STIL+ → ARTWORK → CREATE TILE ARTWORK** for the artist whose SID is selected. The artist key is captured at editor opening and never retargeted by a later track change.
2. Save with the floppy-disk icon. This creates **TILEWORK 1**, **TILEWORK 2**, etc. within the artist's local draft. Clicking an existing TILEWORK opens the same bitmap; subsequent saves update the same ID.
3. Use the existing **PUBLISH** button (or **REPUBLISH** for an existing public artist profile). It sends the complete artist profile, including `tileworks`, through `POST/PUT /artist-profiles`, using the existing beta key and expected server revision.
4. The client reads the profile back through `GET /artist-profiles?key=...` and verifies its artist key, revision, and **all** artwork fields (ID, label, bit data, reverse-mode flag). Only after exact readback does it display `PUBLISHED · VERIFIED · N TILEWORKS` and clean up an unchanged local draft.
5. If publication fails, or the local draft changes while publishing, the latest local artwork is retained. Other artists' TILEWORKS are not included.

## Data format

`{id:"tw-...",label:"TILEWORK 1",bits:"<base64 2048 bytes>",reverse:false}`

- 256×64 bitmap with 1 bit per pixel = **2,048 binary bytes** (2,732 base64 characters per work).
- The Worker sanitizer validates bitmap format and unique IDs/labels.
- This data is in the **SpotySid artist_profiles** record, not in HVSC or the playlist's SID file.
- The existing `artwork` array of external URL entries remains compatible.

## Production prerequisite: deploy the Cloudflare Worker

The updated Worker source is in `community/api/worker.js`, and the configuration is `community/api/wrangler.toml`. GitHub Pages publishing **does not deploy** a Worker.

**Before deployment**, reconcile `community/api/worker.js` with any newer dashboard edits to the production Worker (they may differ), and use an authorized Cloudflare account. With Wrangler authenticated to the correct account, from the repository root:

```bash
npx wrangler deploy --config community/api/wrangler.toml
```

Do not add `BETA_EDIT_KEY`, account tokens, or credentials to the repository. The existing Worker production environment must retain its D1 binding `DB` and secret `BETA_EDIT_KEY`.

After deployment, `GET https://ricos-sid-community.serigrafiamdp.workers.dev/capabilities` must show `artistProfiles: true` and `artistTileworks: true`. If not, PUBLISH shows `TILEWORKS SAVED LOCAL · CLOUD UPDATE REQUIRED`, rather than falsely claiming publication.

## Manual acceptance test

1. Save two TILEWORKS for artist A; verify both appear under A in STIL+.
2. Press **PUBLISH** for artist A with the beta key. It must display `PUBLISHED · VERIFIED · 2 TILEWORKS`.
3. Open SpotySid in a separate browser without the original local drafts; select artist A, open STIL+, and verify both TILEWORK links load correctly.
4. Edit TILEWORK 1 and press **REPUBLISH**. The updated bitmap must be present on a separate client after readback.
5. Delete one TILEWORK locally, **REPUBLISH**, and confirm that its absence is reflected publicly while the other survives.
6. Switch to artist B and ensure A's artwork never appears under B.
7. Confirm the official HVSC STIL files remain unmodified.

**Status:** TEST275 frontend and repository Worker source committed and unit-tested. Cloudflare production deployment and real-browser public readback have not been performed from this session.

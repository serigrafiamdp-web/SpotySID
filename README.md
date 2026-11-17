# SpotySid — Rico + James SID Player

**Commodore 64 SID music · Play · Discover · Curate · Share**

[Open SpotySid](https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/) · **[FEATURES — What's new](docs/FEATURES.md)** · [User guide](docs/HELP_USER_GUIDE.md) · [Architecture](docs/ARCHITECTURE.md) · [Latest checkpoint (11 Nov 2026)](docs/CHECKPOINT_2026-11-11_SPOTYSID.md)

SpotySid preserves and extends the original James / Jojati SID Player. RICO maintains the project and develops the community, playlist and browsing tools. The project does not modify the underlying SID compositions.

## MASTER — 16 November 2026 · TEST301 (user PASS)

**Saved working snapshot:** [MASTER-2026-11-16-TEST301](https://github.com/serigrafiamdp-web/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/tree/MASTER-2026-11-16-TEST301) · [exact verified commit](https://github.com/serigrafiamdp-web/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/commit/e9f80c42835a9c55dad9bfca8d7c5867d9d8c19e).

- **PETSCII oscilloscope:** TEST301 restores the **TEST293** renderer, prior to the experimental empty-channel baseline (TEST294–300). All 3 voices, including the middle channel, were visually approved by the user.
- 14px authentic C64 ROM characters, palette-aware PETSCII button, SID noise represented with `*`.
- **No synthetic idle/baseline line**; channels with no visible signal remain blank.
- The MASTER branch is the archived checkpoint. Continued development stays on `main`.

## New additions first — TEST248 (pending browser PASS)

When adding one or multiple checked SIDs with **+**, insert the new SID(s)
at the top of the ADD + TO destination. Batch insertion preserves the order
of selected SIDs, skips existing duplicates without moving them, and keeps
the older destination entries in their original order. This is a local edit
until SAVE or REPUBLISH. [TEST248 notes](docs/TEST248_ADDED_SIDS_FIRST.md).

## Bulk SID selection — TEST247 (user PASS)

Every playable row in the floating playlist has a compact palette-aware
checkbox as its first action, immediately **left of +**. With checked SIDs,
the existing `+`, `↑`, `↓` and `×` act on the selection in one batch
(where the source already allows that operation), preserving relative
order and synchronizing HVSC/NO HVSC references. Batch addition of
locally imported unknown SIDs reuses one authorized NO HVSC archive
operation. [Manual tests and technical notes](docs/TEST247_BULK_PLAYLIST_CHECKBOX.md).

## Community ordering — TEST246 (user PASS)

Newly created unpublished REMIX drafts appear first in their creator's local COMMUNITY list. Once a new playlist is **PUBLISHed and verified**, it moves to **first place in the shared COMMUNITY catalog**, using the same authorized D1 ordering as the last EDIT/REPUBLISH. No ranking change on PLAY or SHARE. [TEST246 notes](docs/TEST246_NEW_PLAYLIST_FIRST.md).

## Shareable playlists — TEST244 (pending browser PASS)

Each published COMMUNITY playlist now has a **SHARE** button that copies its
own direct SpotySid URL. Opening `index.html?playlist=<published-id>` loads
that playlist's public selection and starts from its first SID; browsers may
require one user PLAY click to unlock Web Audio. REPUBLISH preserves the same
link because the public playlist ID is unchanged. Static curated playlists
also have share links. Unpublished local drafts require PUBLISH first.
[Implementation notes and tests](docs/TEST244_SHAREABLE_PLAYLISTS.md).

## New features — November 2026

These capabilities are now visible in **[the full feature list](docs/FEATURES.md)**:

- **HVSC GROUPS (A–Z):** discover music by group as well as MUSICIANS and DEMOS. The current index contains **84 identified groups / 10,385 HVSC SID references**, based on credited releases (not full group membership).
- **The Codeblasters:** expanded their GROUPS collection from 3 to **9** verified HVSC SID references. Updating an owner's published community list still requires **EDIT → REPUBLISH**; indexed music is **not** an automatic D1 playlist edit.
- **LINUS / LFT MODE:** special reSIDfp playback for exact approved SID references even when they are in other playlists; the LFT list does not open by itself. Three independent *visual* oscilloscope traces.
- **Community editing:** ADD + TO destination persists, **+** stages tracks, and **REPUBLISH** is designed to update an existing public playlist ID with beta-key authorisation.
- **NO HVSC:** imported SID archiving and reference-based published playlists, alongside existing HVSC ZIP references; complete cross-collection REPUBLISH still requires live verification.
- **HVSC Songlengths TIMER (TEST199):** each SID/subtune receives its recorded duration when available. Unknown times retain 03:00. Manual changes are temporary; **REPUBLISH does not save duration overrides**. [Details](docs/TEST199_HVSC_SONGLENGTHS.md).
- **Cloudflare Web Analytics (TEST169):** site traffic measurement is active. An early 24-hour screenshot reported **106 visits / 133 page views** under the displayed hostname filter, not confirmed unique SpotySid listeners.

## Existing core features

SID playback, voice and FILTER controls, oscilloscope, adjustable timer, AUTO with silence detection and fade, themed interface, community/GAMES/TOP/HVSC browsers, personal lists, local imports, ordering, HELP, ABOUT and preservation credits.

## Current status — 11 November 2026 (Argentina)

**Playback caution:** the targeted **Uctumi — Loco un Poco** 8580 filter/intro issue is **not a confirmed PASS**. TEST189–192 experiments were rolled back. **TEST193 restored the exact TEST188 bridge**, leaving the original 99-file Uctumi metadata audit archived but **not enabling reSIDfp for all Uctumi tracks**.

**Publication:** GitHub Pages deployment succeeded for the restore. This establishes the deployed code, **not** a successful audio test or a successful public D1 REPUBLISH. The existing Codeblasters list remains an independently managed D1 record.

**Documentation:** [Complete features](docs/FEATURES.md) · [11 Nov engineering checkpoint](docs/CHECKPOINT_2026-11-11_SPOTYSID.md) · [10 Nov checkpoint](docs/CHECKPOINT_2026-11-10_SPOTYSID.md). Historic TEST files are retained for traceability.

## Repository map

| Path | Responsibility |
| --- | --- |
| `index.html`, `css/style.css` | Player and playlist UI |
| `js/sidPlayer.js`, `js/backend_tinysid.js` | Original TinySID playback engine |
| `lft-test/lft-mode.experimental.js`, `lft-test/lft-wasm/` | Selective reSIDfp bridge for approved LFT and targeted Loco un Poco; TEST188 restored by TEST193 |
| `library/groups/` | GROUPS alphabetical HVSC release-credit reference index |
| `library/uctumi-chip-profiles.json` | 99-file Uctumi chip metadata audit (reference only, not global playback config) |
| `js/customPlaylist.test101.js` | Current HVSC, playlist, community and ADD + TO logic |
| `js/help.test109.js`, `js/donate.test135.js` | Help and support dialogs |
| `library/` | HVSC indexes and original ZIP packs |
| `community/playlists.json`, `community/playlists/` | Static curated lists |
| `community/api/worker.js`, `community/api/schema.sql` | Cloudflare API reference source and D1 schema |
| `docs/FEATURES.md`, `docs/CHECKPOINT_2026-11-11_SPOTYSID.md` | Visible features and latest verified/unfinished work |
| `docs/` | Architecture, help and retained historical test reports |

## Hosting and maintenance

**GitHub Pages** serves the website and HVSC reference library. **Cloudflare Worker + D1** hosts shared playlist records, NO HVSC provenance and authorized writes. The separate [ricos-sid-uploads](https://github.com/serigrafiamdp-web/ricos-sid-uploads) repository holds contributed SID binaries through the configured GitHub provider. **Cloudflare Web Analytics** measures website activity from the installed beacon onward. Updating the repository does **not** automatically deploy the Worker or back up D1. Before a Worker deployment, preserve its production settings, secrets and bindings, and back up the live Worker and D1.

[Architecture and maintenance map](docs/ARCHITECTURE.md) · [API capabilities](https://ricos-sid-community.serigrafiamdp.workers.dev/capabilities)

## Credits and preservation

**Original player:** James / Jojati (@uniquename654). **Continued development, playlist tools and community:** RICO / RicoSerigrafia.

All music and third-party components remain credited to their original creators; follow HVSC, upstream and component license notices. This README deliberately focuses on the current product. Older TEST-prefixed files and checkpoints in `docs/` are retained as engineering history rather than listed as failures or active instructions.

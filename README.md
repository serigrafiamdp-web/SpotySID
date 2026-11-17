# SpotySid — Rico + James SID Player

**Commodore 64 SID music · PLAY · CREATE · REMIX · DISCOVER · SHARE**

[**Open SpotySid**](https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/) · [Features](docs/FEATURES.md) · [User guide](docs/HELP_USER_GUIDE.md) · [Previous checkpoint — TEST341](docs/CHECKPOINT_2026-11-17_TEST341_SPOTYSID.md) · [Supermium XP confirmation — TEST346](docs/TEST346_SUPERMIUM_XP_CONFIRMATION.md) · [Architecture](docs/ARCHITECTURE.md)

SpotySid continues the original James / Jojati web SID Player, with extensions by RICO / RicoSerigrafia. The music, original artists and SID files keep their own credits; playlist editing does **not** change the original compositions.

## Features — start here

### Play and visualize SID music

- **SID player + three-voice oscilloscope**, with original TinySID playback by default.
- **Three visualization modes:** **HI-RES**, **PETSCII** (authentic C64 character rendering) and **PIXEL**. The initial display mode is randomized on page load; the selected palette is randomized separately.
- **FILL / LINE** waveform view; **COLOR** palette cycle; **★** swaps foreground/background colors across the current theme. **Master volume** controls audio and the corresponding waveform height.
- **PLAY / STOP / NEXT SID**, subtune controls, **AUTO**, adjustable **MM:SS TIMER**, HVSC song-length estimates where known, silence detection and soft transitions.
- **Selective reSIDfp** support for exact approved LFT/LINUS references and one targeted Uctumi source, without changing the normal default engine. Some targeted audio cases still need separate verification.
- **Windows XP / Supermium compatibility (TEST343–346):** tiny 12px theme-colored OS label at the upper right of the OSC background. Supermium can falsely identify XP as Windows 11; click the label **once** on a real XP machine to save XP mode **for that browser** and reload. The selection persists on later visits; click XP again to return to browser detection. The XP safety profile uses an 8192-sample audio buffer, 20 FPS scope and lighter manual/AUTO transitions. `?xp=1` forces and `?xp=0` disables it for the current URL. Real XP audio validation is pending.

### Discover music

- **COMMUNITY PLAYLISTS**, **GAMES**, historical TOP collections, **HVSC LIBRARY**, and **OUR COLLECTION** / local imports.
- Browse HVSC **MUSICIANS**, **DEMOS**, and alphabetic **GROUPS**, with SID references from the library. GROUPS represents indexed release credits, not exhaustive membership.
- Open **MOS** using the chip icon; choose playlists and tracks directly. When MOS opens, its **first visible COMMUNITY playlist is keyboard-selected** so Enter is ready immediately.

### Create, curate, remix and share

- **NEW PLAYLIST** creates a named selection with a separate **Playlist by** curator credit.
- **ADD + TO** chooses a destination; **+** adds a SID. Added tracks are placed first, and duplicates are skipped. **Checkboxes** enable batch add, reorder and remove operations where the playlist permits them.
- **SAVE** keeps local changes; **PUBLISH** creates a shared list; **REPUBLISH** updates an existing authorized published list. Read-only TOP rankings remain protected. Authorization and server verification are required for public changes.
- **SHARE** copies a playlist-specific link for supported published/curated lists. Published playlists keep their original identity when correctly republished; local drafts are not automatically public.
- **IMPORT SID / NO HVSC:** manage suitable SID files and local collections, with controlled archiving and reference-based publication paths. An imported file is **not** published automatically.

### TILEWORK — artist pixel artwork

- **TILEWORK** is a **256 × 64, one-bit** editor for artist artwork in **STIL+**.
- Pencil/drawing, fill, selection, undo, background/ink inversion, palette-aware display, mouse-wheel zoom **anchored under the cursor**, and scrolling.
- Open with the **pencil button** or **D**. **X or ESC** asks **SAVE BEFORE EXIT?** with **EXIT & SAVE** and **EXIT ONLY**. Saving the artist's local TILEWORK and publishing an artist profile to Cloudflare are separate operations.
- [TILEWORK storage/publication details and limits](docs/TEST275_STIL_PLUS_ARTIST_TILEWORK_PUBLISH.md).

### Keyboard-first navigation

- **↑ / ↓** move through visible playlists or songs without playing or reordering them.
- **Enter** uses the same PLAY/click action for the selected list or song; mouse and keyboard share **one palette-aware row highlight**.
- From the bare **OSC** screen, if the user has **not selected any SID**, bottom **PLAY** or **Enter** starts the **first song of the first available COMMUNITY playlist** (TEST341, **user PASS**). Normal PLAY/pause behavior is preserved after a SID has been selected.
- When browsing, text fields, search boxes, playlist creator fields and TIMER retain their native keyboard handling.

## Keyboard shortcuts — current main branch

| Key | Action |
| --- | --- |
| **M** | Open MOS / Choose A SID |
| **P** | Show or hide PLAYLIST |
| **C** | Change COLOR |
| **I** | Invert foreground/background (★) |
| **F** | Toggle FILL ↔ LINE |
| **D** | Open TILEWORK artist editor |
| **↑ / ↓** | Select previous/next visible playlist or SID row |
| **Enter** | PLAY selected row; from idle OSC start the first SID of the first COMMUNITY playlist |
| **ESC**, in **PLAYLIST** | Close the playlist and return to OSC |
| **ESC**, in **MOS** | Close MOS |
| **ESC**, in **OSC** with no menu open | Open MOS |
| **ESC**, in **TILEWORK** | Ask to save before exit (same as X) |

Shortcuts do not override text editing or other foreground editors/dialogs. Navigation is **not** the same as the on-row **↑/↓ reorder buttons**.

## Latest progress — 17 November 2026 · TEST346 (XP validation pending)

**Current development: `main` through TEST346.** The user confirmed **TEST341 PASS** and **TEST342 PASS** (zoom). TEST343 improved XP playback but still repeated a short SID segment during manual and automatic transitions; TEST344 addresses that common handoff path, **pending real Windows XP/Supermium PASS**. The earlier record is in [the 17 Nov TEST341 checkpoint](docs/CHECKPOINT_2026-11-17_TEST341_SPOTYSID.md).

| Area | Recent tests and change |
| --- | --- |
| Retro display | **TEST323–326:** volume-aware oscilloscope; MOS chip; NEW PLAYLIST wording; randomized HI-RES/PETSCII/PIXEL startup |
| TILEWORK | **TEST327, 329–331:** ink inversion, compact save-before-exit panel, precise wheel zoom/scroll, ESC confirmation |
| Bottom toolbar | **TEST332:** removed the fine line above the controls without changing button sizes/borders |
| Mouse + keyboard | **TEST333–338:** ↑/↓ + Enter; identical selection highlight; M, I, F, D shortcuts; first MOS row selected |
| Escape priority | **TEST340** supersedes TEST339: ESC closes PLAYLIST or MOS first; only idle OSC opens MOS |
| First playback | **TEST341 (user PASS):** bottom PLAY/Enter without an earlier song selection starts first COMMUNITY playlist's first SID |
| Oscilloscope zoom | **TEST342 (user PASS):** wheel zoom anchored under cursor; graphics only, HI-RES/PIXEL/PETSCII |
| Windows XP/Supermium | **TEST343 (partial improvement):** 8192 buffer / 20 FPS canvas; **TEST344 (PASS pending):** manual/AUTO fade handoff; **TEST345:** 12px upper-right OS text; **TEST346 (PASS pending):** one-click persistent XP confirmation when Supermium falsely claims Win11, without impacting other browsers; [test guide](docs/TEST346_SUPERMIUM_XP_CONFIRMATION.md) |

**Do not equate an implemented TEST or successful GitHub Pages build with a user PASS for every audio/UI pathway.** Confirm a changed behavior on the live site, especially when it involves Web Audio or Cloudflare.

### Preserved MASTER snapshot (not current `main`)

The previous verified baseline **MASTER-2026-11-16-TEST301** is retained as a separate [branch](https://github.com/serigrafiamdp-web/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/tree/MASTER-2026-11-16-TEST301) / [commit](https://github.com/serigrafiamdp-web/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/commit/e9f80c42835a9c55dad9bfca8d7c5867d9d8c19e). TEST301 restored the user-approved PETSCII rendering to the TEST293 design (14px authentic C64 ROM characters, no invented idle-channel baseline). The MASTER is a historical recovery point, **not** a claim that later TEST341 code is present on that branch.

## Current verification boundaries

- **Uctumi — Loco un Poco:** the specialized 8580 / reSIDfp introduction, filter and voice balance still require audio validation. Unsuccessful TEST189–192 experiments were rolled back and the TEST188 bridge was restored by TEST193. Do **not** generalize that engine to every Uctumi SID.
- **Cloudflare public writes:** HVSC/NO HVSC import, EDIT, PUBLISH and REPUBLISH UI code exists, but individual server writes, public IDs and cross-browser readback must be verified separately. Do not duplicate a user's public playlist just to test.
- **TILEWORK publication:** the local drawing editor and the artist-profile publishing endpoint are separate; a successful local SAVE does not prove Worker/D1 publishing is deployed or verified. [TEST275](docs/TEST275_STIL_PLUS_ARTIST_TILEWORK_PUBLISH.md).
- **Analytics:** Cloudflare Web Analytics measures site visits/page views after installation, not distinct listeners or song plays.

## Repository and implementation map

| Path | Role |
| --- | --- |
| `index.html` | Player layout, bilingual HELP text, ABOUT and script references |
| `css/style.css` | Interface, toolbar, playlist/keyboard selection, TILEWORK appearance |
| `js/sidPlayer.js`, `js/backend_tinysid.js` | SID player and default playback engine |
| `js/legacyCompat.test343.js` | Early XP profile detection, theme-colored XP badge and canvas throttle (TEST343–344) |
| `js/scopeZoom.test342.js` | Mouse-wheel zoom restricted to scope canvas (TEST342) |
| `js/customPlaylist.test101.js` | **Active** community, HVSC, playlists, batch actions, initial COMMUNITY playback |
| `js/dialogKeyboard.test230.js` | **Active** keyboard shortcuts, ESC and list navigation |
| `js/tileArtwork.test264.js` | **Active** TILEWORK editor, zoom, saving and exit confirmation |
| `js/petsciiMode.test282.js` | PETSCII / visual mode support |
| `js/help.test109.js` | HELP open/close/language behavior; HELP text lives in `index.html` |
| `lft-test/lft-mode.experimental.js`, `lft-test/lft-wasm/` | Selective reSIDfp playback bridge |
| `library/`, `library/groups/` | HVSC metadata, ZIP packs and GROUPS credits index |
| `community/playlists.json`, `community/playlists/` | Static curated community data |
| `community/api/worker.js`, `community/api/schema.sql` | Reference Worker source and D1 schema (separate deployment) |
| `docs/FEATURES.md` | Feature reference |
| `docs/HELP_USER_GUIDE.md` | User-facing manual |
| `docs/CHECKPOINT_2026-11-17_TEST341_SPOTYSID.md` | Earlier confirmed TEST341 checkpoint |
| `docs/TEST343_XP_COMPATIBILITY.md` | Initial XP compatibility profile, TEST343 |
| `docs/TEST344_XP_AUDIO_HANDOFF.md` | XP audio transition experiment, TEST344 |
| `docs/TEST345_WINDOWS_VERSION.md` | Top-right OS diagnostic and detection limits, TEST345 |
| `docs/TEST346_SUPERMIUM_XP_CONFIRMATION.md` | Persist user-confirmed XP with misleading Supermium metadata, TEST346 |
| `docs/ARCHITECTURE.md` | Maintenance and backend boundaries |

## Hosting, credits and preservation

**GitHub Pages** hosts SpotySid and HVSC reference files. **Cloudflare Worker + D1** supplies community/artist-profile services and authorized writes. The separate [`ricos-sid-uploads`](https://github.com/serigrafiamdp-web/ricos-sid-uploads) repository holds contributed SID binary archives. Deploying the frontend does **not** deploy the Worker or back up live D1 records. Preserve cloud bindings, server secrets, public IDs and existing assets during maintenance.

**Original web player and oscilloscope:** James / Jojati ([@uniquename654](https://twitter.com/uniquename654)). **SID engine sources:** Juergen Wothke / WebSid (see upstream license notices). **Continuation, community playlists, UI and tools:** RICO / RicoSerigrafia.

Original artists, groups, demos and composers retain their credits. This README highlights current functionality; older TEST files and reports under `docs/` remain historical engineering evidence.

[**Open SpotySid**](https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/) · [Features](docs/FEATURES.md) · [Latest checkpoint](docs/CHECKPOINT_2026-11-17_TEST341_SPOTYSID.md)

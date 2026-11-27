# SpotySid — Rico + James SID Player

**Commodore 64 SID music · PLAY · CREATE · REMIX · DISCOVER · SHARE**

[**Open SpotySid**](https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/) · [Features](docs/FEATURES.md) · [User guide](docs/HELP_USER_GUIDE.md) · [Previous checkpoint — TEST341](docs/CHECKPOINT_2026-11-17_TEST341_SPOTYSID.md) · [TEST350 controls](docs/TEST350_NEXT_HIGHLIGHT_WAVE_LABEL.md) · [Architecture](docs/ARCHITECTURE.md)

SpotySid continues the original James / Jojati web SID Player, with extensions by RICO / RicoSerigrafia. The music, original artists and SID files keep their own credits; playlist editing does **not** change the original compositions.

## Current approved export MASTER — TEST452 (November 27, 2026)

Rico confirmed PASS in VICE for the combined D81 export using SIDPLAY64MIX TEST94, automatic per-song durations and the follow-playing playlist (TEST451), followed by the removal of artificial sequence prefixes from disk filenames (TEST452). TEST452 is the final approved export MASTER of November 27, 2026. The [frozen MASTER branch](https://github.com/serigrafiamdp-web/SpotySID/tree/MASTER-2026-11-27-TEST452) preserves the approved implementation; [checkpoint and recovery instructions](docs/MASTER_2026-11-27_TEST452.md). This approval covers the C64 export workflow, not all unrelated browser/Cloudflare features. D64 and broader SID support remain pending.

## Features — start here

### Play and visualize SID music

- **SID player + three-voice oscilloscope**, with original TinySID playback by default.
- **Three visualization modes:** **HI-RES**, **PETSCII** (authentic C64 character rendering) and **PIXEL**. The initial display mode is randomized on page load; the selected palette is randomized separately.
- **FILL / LINE** waveform view (TEST350: the button names the NEXT action: filled wave → **LINE**, line wave → **FILL**); **COLOR** palette cycle; **★** swaps foreground/background colors across the current theme. **Master volume** controls audio and the corresponding waveform height.
- **PLAY / STOP / NEXT SID**, subtune controls, **AUTO**, adjustable **MM:SS TIMER**, HVSC song-length estimates where known, silence detection and soft transitions. **N = NEXT SID** (user PASS); **TEST350** highlights NEXT using the current palette until the incoming song's first audio is delivered.
- **Selective reSIDfp** support for exact approved LFT/LINUS references and one targeted Uctumi source, without changing the normal default engine. Some targeted audio cases still need separate verification.
- **Windows XP / Supermium compatibility (TEST343–348):** upper-right XP indicator with one-time saved confirmation when Supermium spoofs Windows 11; 8192-sample audio buffer, verified smooth handoffs and 25 FPS normal / 20 FPS busy oscilloscope ceilings. **NEW TEST348:** when a list has 80+ tracks in XP mode, load its first SID fully before starting, do not bulk-prefetch unselected tracks, and progressively draw long playlist rows in small chunks so audio gets priority. Real XP confirmation is pending.

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
| **N** | NEXT SID — advance to the next song using the existing button |
| **↑ / ↓** | Select previous/next visible playlist or SID row |
| **Enter** | PLAY selected row; from idle OSC start the first SID of the first COMMUNITY playlist |
| **ESC**, in **PLAYLIST** | Close the playlist and return to OSC |
| **ESC**, in **MOS** | Close MOS |
| **ESC**, in **OSC** with no menu open | Open MOS |
| **ESC**, in **TILEWORK** | Ask to save before exit (same as X) |

Shortcuts do not override text editing or other foreground editors/dialogs. Navigation is **not** the same as the on-row **↑/↓ reorder buttons**.

## Historical progress — 17 November 2026 · TEST350 (visual controls)

**Historical record as of TEST350.** The user confirmed **TEST341 PASS**, **TEST342 PASS** (zoom) and reported clean XP/Supermium audio transitions with TEST344–346. TEST347 increased the XP OSC ceiling to 25 FPS in normal playback. **TEST348 improves long lists on XP only:** verify the first SID before starting playback, disable bulk SID prefetch, and draw the playlist incrementally; OSC remains at 20 FPS while the list is painting. Real XP PASS for TEST348 is pending. **TEST349 N shortcut is user PASS**; **TEST350** adds waveform action labeling and pending-NEXT visual feedback (hardware PASS pending). The earlier record is in [the 17 Nov TEST341 checkpoint](docs/CHECKPOINT_2026-11-17_TEST341_SPOTYSID.md).

| Area | Recent tests and change |
| --- | --- |
| Retro display | **TEST323–326:** volume-aware oscilloscope; MOS chip; NEW PLAYLIST wording; randomized HI-RES/PETSCII/PIXEL startup |
| TILEWORK | **TEST327, 329–331:** ink inversion, compact save-before-exit panel, precise wheel zoom/scroll, ESC confirmation |
| Bottom toolbar | **TEST332:** removed the fine line above the controls. **TEST350 (pending user PASS):** FILL/LINE text always names the next action; NEXT SID uses palette highlight from N/click until the new song's audio starts |
| Mouse + keyboard | **TEST333–338:** ↑/↓ + Enter; identical selection highlight; M, I, F, D shortcuts; first MOS row selected. **TEST349 (user PASS):** N = NEXT SID via existing toolbar action |
| Escape priority | **TEST340** supersedes TEST339: ESC closes PLAYLIST or MOS first; only idle OSC opens MOS |
| First playback | **TEST341 (user PASS):** bottom PLAY/Enter without an earlier song selection starts first COMMUNITY playlist's first SID |
| Oscilloscope zoom | **TEST342 (user PASS):** wheel zoom anchored under cursor; graphics only, HI-RES/PIXEL/PETSCII |
| Windows XP/Supermium | **TEST343–346:** 8192-sample buffer, cleaned-up manual/AUTO transitions and remembered XP mode. **TEST347:** 25 FPS steady OSC / 20 FPS on handoff. **TEST348 (user PASS pending):** first SID ready before playback, no long-list background SID prefetch, incremental row painting and 20 FPS while list builds; [test guide](docs/TEST348_XP_LONG_PLAYLIST_FIRST_SID.md) |

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
| `js/legacyCompat.test343.js` | Saved XP confirmation, OS indicator, and dynamic 20/25 FPS audio-safe OSC throttle (TEST343–348) |
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
| `docs/TEST347_XP_SCOPE_25FPS.md` | Optional 25 FPS oscilloscope on XP without sacrificing 20 FPS transition headroom, TEST347 |
| `docs/TEST348_XP_LONG_PLAYLIST_FIRST_SID.md` | First SID priority, on-demand bytes, incremental row painting on XP, TEST348 |
| `docs/TEST350_NEXT_HIGHLIGHT_WAVE_LABEL.md` | Waveform action labels and palette-colored NEXT pending until first new audio, TEST350 |
| `docs/ARCHITECTURE.md` | Maintenance and backend boundaries |

## Hosting, credits and preservation

**GitHub Pages** hosts SpotySid and HVSC reference files. **Cloudflare Worker + D1** supplies community/artist-profile services and authorized writes. The separate [`ricos-sid-uploads`](https://github.com/serigrafiamdp-web/ricos-sid-uploads) repository holds contributed SID binary archives. Deploying the frontend does **not** deploy the Worker or back up live D1 records. Preserve cloud bindings, server secrets, public IDs and existing assets during maintenance.

**Original web player and oscilloscope:** James / Jojati ([@uniquename654](https://twitter.com/uniquename654)). **SID engine sources:** Juergen Wothke / WebSid (see upstream license notices). **Continuation, community playlists, UI and tools:** RICO / RicoSerigrafia.

Original artists, groups, demos and composers retain their credits. This README highlights current functionality; older TEST files and reports under `docs/` remain historical engineering evidence.

[**Open SpotySid**](https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/) · [Features](docs/FEATURES.md) · [Latest checkpoint](docs/CHECKPOINT_2026-11-17_TEST341_SPOTYSID.md)


### C64 disk export — TEST452 MASTER (PASS)

SpotySID now uses the approved [SIDPLAY64MIX TEST94 MASTER](https://github.com/serigrafiamdp-web/SIDPLAY64MIX/tree/fc6563b808623a7ba121d686816d00cda559d4c4/MASTERS/2026-11-27_TEST94_MASTER) for new D81 exports, with individual song lengths added at export time. The combined integration was confirmed PASS by Rico in VICE on November 27, 2026. [Technical notes and rollback](docs/TEST451_TEST94_MASTER_EXPORT.md).


**TEST452 (user PASS; current MASTER):** new D81 exports keep the playlist's physical directory order without a numeric prefix on each SID. Up to 12 characters are available before `.sid`; only name collisions receive a short alphabetic suffix. The previous TEST451 checkpoint and TEST94 launcher are unchanged. [Details](docs/TEST452_D81_FILENAMES.md).

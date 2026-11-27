# SpotySid — Features

**Frontend feature reference · C64 disk export updated 27 November 2026 (Argentina) · TEST451 MASTER**

[Open SpotySid](https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/) · [README](../README.md) · [User guide](HELP_USER_GUIDE.md) · [Latest checkpoint](CHECKPOINT_2026-11-17_TEST341_SPOTYSID.md) · [Architecture](ARCHITECTURE.md)

This is the **current list of implemented main-branch capabilities**. Where a feature requires an external Cloudflare Worker, authorized publishing or special audio playback, implementation and real-world verification are distinguished.

## Playback and oscilloscope

- C64 SID playback through the normal TinySID route, with separate, selectively approved reSIDfp tracks.
- **Three oscilloscope visual modes:** **HI-RES / PETSCII / PIXEL**; authentic C64 PETSCII font; selectable **FILL / LINE** waveforms. In TEST350 the FILL/LINE button names the *next* action rather than the current waveform.
- Random startup scope mode and random theme; palette-aware UI controls. **COLOR** cycles palettes and **★** inverts foreground/background.
- The **master volume** affects sound and the displayed oscilloscope height (TEST323). At its lowest setting, the visual wave can be flat.
- **PLAY / STOP / NEXT SID**, subtune controls, voice enable controls, FILTER, **AUTO**, silence detection, soft transitions and a configurable **MM:SS TIMER**. TEST349 **N = NEXT SID** is user PASS; TEST350 highlights NEXT SID in palette colors until the next track's first audio buffer arrives (real-browser PASS pending).
- **HVSC Songlengths** (TEST199) suggest per-track/subtune durations when a known reference is available; otherwise use default 03:00. Manual timer adjustments are session-local and **not** permanently saved by REPUBLISH.
- A limited set of approved **LINUS / LFT** SID references activates the reSIDfp engine regardless of the playlist containing that exact reference. The LFT playlist is not forced to open on startup. Its three oscilloscope channels are visual SID-register estimates, not isolated analog voice recordings.
- **Uctumi — Loco un Poco** has a targeted PAL / 8580 route. Its sustained intro-to-rhythm/filter/voice balance is **not verified PASS**; the earlier unsuccessful experiments were rolled back and the TEST188 bridge restored in TEST193. Do not activate the engine for every Uctumi track.

## Music browsing and source collections

- **MOS / Choose A SID** browsing: **COMMUNITY PLAYLISTS**, **GAMES**, historical TOP rankings, **HVSC LIBRARY**, and **OUR COLLECTION**.
- HVSC browsing by **MUSICIANS, DEMOS, GROUPS**, alphabetical shelves, and available source references. GROUPS reflects indexed credited releases rather than exhaustive CSDb/HVSC group membership.
- The generated GROUPS index recorded **84 groups and 10,385 SID references**, including **9 credited Codeblasters references** in the 11 November snapshot. These source indexes do not silently change separately published playlists.
- The first MOS COMMUNITY row is visually selected when MOS opens, including after asynchronous catalog loading (TEST337).
- Keyboard and mouse highlight the **same row style**. **↑ / ↓** choose playlists or songs without affecting playback; **Enter** executes PLAY on that selected item.

## Playlist management

- **NEW PLAYLIST** with a name and distinct **Playlist by** curator credit.
- **ADD + TO** selector persists across changes; use **+** to add references. Newly added items appear at the top of the destination, while existing duplicates are not moved.
- Compact **checkbox** before + in the floating list, enabling batch add, move and remove wherever permitted by that playlist; existing source rankings remain protected.
- **SAVE** for supported local edits, **PUBLISH** for new lists, and **REPUBLISH** for changes to a published list with its existing record ID and beta-key authorization. A private pending draft is not a public publication.
- **SHARE** links for eligible published/curated playlists. Users who open a direct link may need a PLAY click to allow Web Audio in their browser.
- **IMPORT SID** and browser-local lists; supported HVSC reference reuse and independent **NO HVSC** archiving. Archive/playlist reference backends are distinct from the original SID library, which remains unchanged.

## Export playlists to Commodore 64 disks — TEST451 MASTER (PASS)

- **CREATE C64 DISK** analyzes the selected playlist and generates a native **D81 / 1581** disk image entirely in the browser, including SIDPLAY64 SID MIX Mod by Rico and the accepted SID files in playlist order.
- **CHECK SIDS** verifies PSID compatibility, exact known-corpus hashes, individual default-subtune Songlengths, directory limits and available disk blocks. Rejected tracks and capacity skips are reported; the online playlist is not changed.
- **EXPORT D81** includes the approved SIDPLAY64MIX TEST94 launcher, with a playlist-specific fade map and duration overlay. Original library files are untouched.
- In VICE the player supports continuous playback, automatic per-song duration, eight-second fade, background prefetch, stable violet active marker and independent yellow navigation. The launcher is hidden from the visible playlist; the playing SID follows to the top at automatic or ENTER handoff.
- Current limits: exact verified 100-track corpus, at most 100 SID entries and 3,099 data blocks after the 61-block launcher, plus nine special fade-address slots. Unknown duration defaults to 03:05; known durations outside 00:15–99:59 are skipped. **D64 / 1541 is preflight only**, not an available export. Real hardware and broader SID compatibility are not yet verified.
- Combined D81 export confirmed PASS by Rico in VICE on November 27, 2026. [How to export](HELP_USER_GUIDE.md#export-a-playlist-to-commodore-64) · [Frozen MASTER and recovery](MASTER_2026-11-27_TEST451.md) · [Technical notes](TEST451_TEST94_MASTER_EXPORT.md).

## Artist artwork: TILEWORK / STIL+

- **256 × 64 1-bit pixel editor**, associated with the playing artist at opening time; drawing, fill, selection, undo, inverse ink/paper mode and palette-aware controls.
- Mouse-wheel zoom keeps the image position under the cursor, with vertical and horizontal scrolling.
- **D** or the pencil toolbar button opens TILEWORK. **X and ESC** show a compact **SAVE BEFORE EXIT?** confirmation with **EXIT & SAVE** / **EXIT ONLY**.
- Local artwork SAVE and beta-authorized **PUBLISH / REPUBLISH** of an artist's STIL+ profile are **separate steps**. Cloudflare production compatibility and cross-client verification cannot be inferred from source code alone. [Technical notes](TEST275_STIL_PLUS_ARTIST_TILEWORK_PUBLISH.md).

## Keyboard and control priority

| Control | Behavior |
| --- | --- |
| **M** | Open MOS |
| **P** | Toggle PLAYLIST |
| **C** | Next COLOR |
| **I** | Invert palette (★) |
| **F** | Toggle FILL / LINE |
| **D** | Open TILEWORK |
| **↑ / ↓** | Navigate only the visible list rows (not the upper tabs or editable fields) |
| **Enter** | Play the selected row, or on idle OSC start first SID of first COMMUNITY playlist |
| **ESC** with PLAYLIST open | Close PLAYLIST to OSC |
| **ESC** with MOS open | Close MOS |
| **ESC** on OSC without menu | Open MOS |
| **ESC** in TILEWORK | Save-before-exit confirmation |

**TEST341 (user PASS):** if the user is looking at **OSC** without ever having chosen a SID, **PLAY** on the bottom toolbar or **Enter** initiates the first song of the first eligible COMMUNITY playlist, not the old game list. This requires a user action and can wait for the remote COMMUNITY catalog. It is **not** autoplay on page load.

Shortcuts do not replace typing in text fields, search, name/creator inputs, TIMER or foreground editors.

## Help, About and project transparency

- Bilingual **HELP** (English / Español) covers browsing, creating lists, batch editing, keyboard and TILEWORK.
- **ABOUT** keeps the James / Jojati original creator attribution and original text, with separate RICO maintenance and new-feature information.
- Optional donation link; current palette styling.
- Cloudflare Web Analytics beacon tracks website visits/page views after installation, **not** song plays. An early 11 November 24-hour screenshot showed 106 visits / 133 page views for its hostname filter, which does **not** establish unique listeners.

## Technical boundary and status

- **GitHub Pages** serves the interface, curated static JSON and HVSC source ZIPs.
- **Cloudflare Worker + D1** stores published community data, authorized edits, reference metadata and available artist-profile services. Frontend changes do **not** automatically deploy the Worker or back up D1.
- Separate [ricos-sid-uploads](https://github.com/serigrafiamdp-web/ricos-sid-uploads) repository supports configured contributed SID binary archiving.
- Browser storage retains local drafts and destinations; it is not a cross-device backup.

**Confirmed by the user:** TEST301 historic MASTER (PETSCII), TEST323, TEST327, TEST329, TEST330, TEST334, TEST337 and TEST341, based on recorded interaction. **Implemented with individual live verification pending or not separately recorded:** other recent TEST324–340 changes. TEST339's initial ESC behavior was **superseded by TEST340**.

**Not to claim verified:** sustained Loco un Poco audio balance; an arbitrary public D1 REPUBLISH or full NO HVSC → D1 readback merely from a Git commit; publicly verified TILEWORK artist-profile publication. More accurate, per-test notes: [Latest checkpoint](CHECKPOINT_2026-11-17_TEST341_SPOTYSID.md), [11 Nov historical checkpoint](CHECKPOINT_2026-11-11_SPOTYSID.md), [Architecture](ARCHITECTURE.md).

Historical TEST files in `docs/` are retained as dated development references, not a list of all active UI features.


**TEST452 filename experiment:** D81 filenames use up to 12 characters of the normalized song name, plus `.sid`; alphabetic suffixes resolve collisions only. Playlist order remains unchanged. VICE confirmation pending.

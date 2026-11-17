# SpotySid — User guide

**Updated 17 November 2026 · main / TEST350**

[Open player](https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/) · [README](../README.md) · [Complete features](FEATURES.md) · [Latest checkpoint](CHECKPOINT_2026-11-17_TEST341_SPOTYSID.md)

## Quick start — playback

Use the **MOS chip icon** (or **M**) to open **Choose A SID**. The first visible COMMUNITY playlist is highlighted immediately, even if the catalog had to load first. Press **Enter** on it or click its **PLAY** button to open the list and hear the first SID. Use **↑ / ↓** to select another playlist before pressing Enter. Selection alone does not start audio.

Once a playlist is loaded, its floating **PLAYLIST** window shows the track list. Use **↑ / ↓** to select a song and **Enter** to play it, or click the song. The mouse and keyboard use the same highlight; the current playing SID remains visually distinct. **P** toggles PLAYLIST.

If you are on the bare **OSC** display and have **not yet selected any SID**, pressing **Enter** or bottom-bar **PLAY** starts the first song from the first available **COMMUNITY PLAYLIST** (TEST341). It will wait for that catalog if it is still loading. This is a response to your input, **not automatic playback**.

**PLAY / STOP / NEXT SID** control playback. Press **N** for NEXT SID: the NEXT SID button highlights in the current COLOR while the song changes and returns to its normal color once the new SID's audio begins (TEST350). **AUTO**, the **MM:SS TIMER**, detected silence, and known HVSC song-length information govern automatic advancement. Tracks may include multiple subtunes accessible through the dedicated controls. Some browsers require a user click/keypress to enable audio.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| **M** | Open MOS / Choose A SID |
| **P** | Show/hide the floating PLAYLIST |
| **C** | Change the oscilloscope color palette |
| **I** | Swap foreground and background colors, same as **★** |
| **F** | Switch **FILL** ↔ **LINE** waveform |
| **D** | Open TILEWORK pixel-art editor |
| **N** | NEXT SID (same as the bottom button) |
| **↑ / ↓** | Move between available playlists or songs; does **not** reorder or play |
| **Enter** | Play the highlighted list/song; from idle OSC starts the first COMMUNITY list's first SID |
| **ESC** in PLAYLIST | Close the playlist, return to OSC |
| **ESC** in MOS | Close MOS, return to OSC |
| **ESC** in OSC without menu | Open MOS |
| **ESC** in TILEWORK | Open the save-before-exit confirmation |

These global shortcuts **do not activate while typing** in searches, playlist name/creator fields, TIMER or other text controls; focused foreground editors retain their own keys. The **↑ / ↓** buttons *within* editable playlist rows are separate **reordering controls**, not keyboard navigation.

## Browsing collections

MOS contains **COMMUNITY PLAYLISTS**, **GAMES**, historical TOP selections, **HVSC LIBRARY**, and **OUR COLLECTION**. In HVSC LIBRARY you can browse **MUSICIANS**, **DEMOS** or **GROUPS** by alphabetical group/shelf and source references. A credited group entry does not imply every release has a linked SID.

The **SHARE** button on an eligible published playlist copies a direct link to its selection; it does not publish local drafts. Opening a shared link may require pressing PLAY once to unlock audio.

## Creating and organizing playlists

1. Click **NEW PLAYLIST**, enter a playlist name and **Playlist by** (the curator credit), then choose **CREATE**. The playlist is a local draft until published.
2. In the floating playlist choose **ADD + TO** to identify the destination. Use **+** next to a track to add it without interrupting playback. The chosen destination is preserved until changed.
3. Added SID entries are placed **at the top** of the destination list, retaining the order of a checked batch and skipping duplicates.
4. Check multiple songs with the compact checkbox just **left of +**. Existing **+**, **↑**, **↓** and **×** buttons can then act on the batch where supported. Ranked lists may prohibit moving/removing.
5. Use the row buttons **↑ / ↓** for ordering. They are **not** the same as keyboard ↑ / ↓. Use **SAVE** for supported local edits, **PUBLISH** for a new community list, and **REPUBLISH** for authorized changes to an existing published list.

Public publishing/editing requires appropriate beta authorization and successful server confirmation. A saved browser-local draft is **not** public. Always verify a public edit by reopening the same playlist link/ID after reload; avoid creating a duplicate record. TOP rankings remain read-only.

## OSC and display

- **HI-RES / PETSCII / PIXEL** cycles the oscilloscope visualization; the initial mode and palette may be different on each visit.
- **FILL / LINE** chooses a filled or line waveform. The button labels the action you can take next: it reads **LINE** while filled waves are shown, and **FILL** while line waves are shown (TEST350). **COLOR** changes the palette and **★** inverts ink/background.
- **Master volume** also changes the visual amplitude. The three oscilloscope traces are a display aid, not raw isolated audio captures.
- The standard SID engine remains TinySID; approved individual **LFT / LINUS** references can use reSIDfp. **Uctumi — Loco un Poco**'s special 8580 playback route still needs sustained audio validation.

## TILEWORK pixel-art editor

Press **D** or click the **pencil icon** beside the footer controls to open artist TILEWORK. The editor is a **256×64 one-bit** canvas: draw, fill, select, undo and invert colors; use the mouse wheel to zoom around the exact cursor position and scroll around the enlarged image. The current artist is captured when the editor opens.

Press **SAVE TILEWORK** in the editor to save locally in **STIL+ ARTWORK**. Click **X** or press **ESC** to see **SAVE BEFORE EXIT?** with **EXIT & SAVE** and **EXIT ONLY**. Closing by ESC should never discard without that question.

A local TILEWORK SAVE is distinct from publishing the artist profile to the online service. Public **PUBLISH/REPUBLISH** requires server support and authorization; do not interpret local success as a verified remote publication. [Technical notes](TEST275_STIL_PLUS_ARTIST_TILEWORK_PUBLISH.md).

## Importing and preserving SID files

**IMPORT SID** supports compatible local SID files and collections and local browser saves. The library distinguishes known HVSC references from archived **NO HVSC** assets; importing alone does not modify original HVSC files or make a track public. Existing author credits remain attached to the SID; **Playlist by** identifies the curator separately.

## Help and known limits

The floating playlist can be moved and resized. **HELP** inside the player offers English and Spanish instructions; **ABOUT** explains the preservation purpose, source credits and new capabilities. Cloudflare public data, local drafts and original SID binary files are stored separately.

**Recorded status:** the user confirmed TEST341 playback behavior (also earlier PETSCII, UI and keyboard milestones), but this does not replace manual checks of every browser, audio engine, public REPUBLISH or artist-profile publication. See [checkpoint](CHECKPOINT_2026-11-17_TEST341_SPOTYSID.md) for what was implemented and what still needs verification.

# TEST350 — Action labels and pending NEXT SID highlight

**17 November 2026 · SpotySid**

**Implementation:** committed to `main`. **Real-browser PASS:** pending.

## FILL / LINE

The oscilloscope waveform button now shows the **available action**, not
the currently displayed waveform.

| Current waveform | Button text | Clicking the button |
| --- | --- | --- |
| FILL (default) | **LINE** | Switches to line waveform |
| LINE | **FILL** | Switches to filled waveform |

The change applies to HI-RES, PIXEL and PETSCII display modes. The
existing F key uses the same button. The existing TEST320 inverted color
style remains tied to the current LINE mode, not the text label.
Button width and palette colors are unchanged.

## N / NEXT SID indication

- **N** already triggers a click on the same `#nextSid` button (TEST349,
  user PASS). A direct mouse click follows exactly the same path.
- A valid request immediately sets **`aria-pressed=true`** on NEXT SID,
  using the existing TEST316 foreground/background color inversion for
  the active theme. Text and button dimensions stay unchanged.
- Unlike a fixed 5-second timer, the visual indication stays active
  through the fade, SID loading, any ZIP decoding and the incoming track's
  asynchronous first output.
- `player.playSong()` is the transition commit; for normal ScriptProcessor
  playback, NEXT stays highlighted until the first complete NEW audio
  block passes the TEST208 opening-buffer gate.
- STOP, a cancelled/aborted transition, failed new-song load and recovery
  timeout clear the pending indication.
- A click with no available playlist or while NEXT is disabled does not
  arm the indication.
- No changes to SID bytes, Web Audio buffer size, timers, crossfade curve,
  reSIDfp eligibility, AUTO sequencing or the XP playlist renderer.

## User tests

1. Startup (filled waves): **LINE** button visible. Click or press **F**:
   line waves appear, button says **FILL**. Click again: filled waves
   appear, button says **LINE**.
2. With a song playing and NORMAL or XP profile active: press **N**.
   NEXT SID should adopt the current COLOR's active inverse-ink style
   during the fade and return to normal after the incoming music starts.
3. Test a long XP list where next SID requires ZIP loading; the highlight
   should remain while waiting and not flicker between fetch and audio.
4. Press **STOP** mid-transition: NEXT SID immediately returns to normal.
5. Test mouse NEXT as well as **N**. Verify the existing 5-second fade and
   the XP-safe audio handoff remain unchanged.

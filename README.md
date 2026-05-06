# MR Piano

Personal mixed-reality piano project.

The long-term goal is a playable piano in MR, aimed first at Meta Quest 3. Since the headset is not available yet, this repository starts with a browser-based interaction prototype that proves the core instrument logic:

- Key layout
- Note mapping
- Keyboard and pointer input
- Polyphonic sound playback
- Visual key press feedback

## Current Prototype

Open `prototype/index.html` in a browser.

Controls:

- White keys: `A S D F G H J K`
- Black keys: `W E T Y U`
- Mouse/touch: press the on-screen keys

The browser prototype uses the Web Audio API, so no external dependencies are required.

## Development Roadmap

1. Build a playable 1-octave piano prototype on desktop.
2. Separate piano logic from input logic.
3. Add a virtual fingertip object for collision-style testing.
4. Move the interaction model into Unity.
5. Add Meta XR SDK integration after Quest 3 hardware is available.
6. Tune latency, hand tracking, spatial placement, and scale.

## Repository Structure

```text
prototype/
  index.html
  styles.css
  script.js
docs/
  architecture.md
```


# Architecture Notes

## Core Idea

The MR piano should be split into small systems so the desktop prototype can evolve into a Unity/Quest implementation without rewriting the musical logic from scratch.

## Systems

### Piano Layout

Responsible for defining keys, note names, MIDI note numbers, visual positions, and key dimensions.

Initial target:

- 8 white keys from C4 to C5
- 5 black keys
- Single octave plus top C

### Input

Responsible for converting a user action into a key press or release.

Prototype inputs:

- PC keyboard
- Mouse or touch pointer

Future MR inputs:

- Tracked fingertip pose
- Collision volume above each key
- Press depth threshold

### Sound

Responsible for playing notes with low latency and overlapping voices.

Prototype:

- Web Audio oscillator voices
- Short attack and release envelope

Future:

- Unity AudioSource pool
- Sample-based piano notes or a lightweight synth
- Optional MIDI output

### Feedback

Responsible for making the instrument feel responsive.

Prototype:

- Key color change
- Small key depression transform

Future:

- Physical key depression
- Haptic proxy feedback if available
- Lighted practice mode

## Unity Migration Shape

Suggested Unity components later:

- `PianoKey`
- `PianoLayoutBuilder`
- `PianoInputRouter`
- `KeyboardInputProvider`
- `HandTrackingInputProvider`
- `PianoSoundEngine`

The important boundary is that input providers should only say "key down" and "key up". They should not own note playback or key animation directly.


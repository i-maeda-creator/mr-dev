using System.Collections.Generic;
using UnityEngine;

namespace MRPiano
{
    public static class PianoNotes
    {
        public static IReadOnlyList<PianoKeyDefinition> OneOctave()
        {
            return new[]
            {
                new PianoKeyDefinition { id = "C4", type = PianoKeyType.White, label = "C4", binding = KeyCode.A, frequency = 261.63f },
                new PianoKeyDefinition { id = "C#4", type = PianoKeyType.Black, label = "C#", binding = KeyCode.W, frequency = 277.18f, afterWhite = 1 },
                new PianoKeyDefinition { id = "D4", type = PianoKeyType.White, label = "D4", binding = KeyCode.S, frequency = 293.66f },
                new PianoKeyDefinition { id = "D#4", type = PianoKeyType.Black, label = "D#", binding = KeyCode.E, frequency = 311.13f, afterWhite = 2 },
                new PianoKeyDefinition { id = "E4", type = PianoKeyType.White, label = "E4", binding = KeyCode.D, frequency = 329.63f },
                new PianoKeyDefinition { id = "F4", type = PianoKeyType.White, label = "F4", binding = KeyCode.F, frequency = 349.23f },
                new PianoKeyDefinition { id = "F#4", type = PianoKeyType.Black, label = "F#", binding = KeyCode.T, frequency = 369.99f, afterWhite = 4 },
                new PianoKeyDefinition { id = "G4", type = PianoKeyType.White, label = "G4", binding = KeyCode.G, frequency = 392.00f },
                new PianoKeyDefinition { id = "G#4", type = PianoKeyType.Black, label = "G#", binding = KeyCode.Y, frequency = 415.30f, afterWhite = 5 },
                new PianoKeyDefinition { id = "A4", type = PianoKeyType.White, label = "A4", binding = KeyCode.H, frequency = 440.00f },
                new PianoKeyDefinition { id = "A#4", type = PianoKeyType.Black, label = "A#", binding = KeyCode.U, frequency = 466.16f, afterWhite = 6 },
                new PianoKeyDefinition { id = "B4", type = PianoKeyType.White, label = "B4", binding = KeyCode.J, frequency = 493.88f },
                new PianoKeyDefinition { id = "C5", type = PianoKeyType.White, label = "C5", binding = KeyCode.K, frequency = 523.25f },
            };
        }
    }
}

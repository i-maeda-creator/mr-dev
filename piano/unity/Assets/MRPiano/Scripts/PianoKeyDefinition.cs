using System;
using UnityEngine;

namespace MRPiano
{
    public enum PianoKeyType
    {
        White,
        Black
    }

    [Serializable]
    public class PianoKeyDefinition
    {
        public string id;
        public PianoKeyType type;
        public string label;
        public KeyCode binding;
        public float frequency;
        public int afterWhite;
    }
}

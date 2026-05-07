using System.Collections.Generic;
using UnityEngine;

namespace MRPiano
{
    public class PianoLayoutBuilder : MonoBehaviour
    {
        [Header("Dimensions")]
        [SerializeField] private Vector3 whiteKeySize = new(0.14f, 0.035f, 0.55f);
        [SerializeField] private Vector3 blackKeySize = new(0.085f, 0.055f, 0.34f);
        [SerializeField] private float blackKeyForwardOffset = 0.09f;

        [Header("Materials")]
        [SerializeField] private Material whiteKeyMaterial;
        [SerializeField] private Material blackKeyMaterial;

        private readonly Dictionary<string, PianoKey> keysById = new();

        public IReadOnlyDictionary<string, PianoKey> KeysById => keysById;

        private void Awake()
        {
            if (keysById.Count == 0)
            {
                Build();
            }
        }

        [ContextMenu("Build Piano Layout")]
        public void Build()
        {
            ClearExistingKeys();
            EnsureMaterials();

            var definitions = PianoNotes.OneOctave();
            int whiteIndex = 0;
            float whiteWidth = whiteKeySize.x;
            float startX = -whiteWidth * 3.5f;

            foreach (var definition in definitions)
            {
                if (definition.type != PianoKeyType.White)
                {
                    continue;
                }

                Vector3 position = new(startX + whiteIndex * whiteWidth, 0f, 0f);
                CreateKey(definition, position, whiteKeySize, whiteKeyMaterial);
                whiteIndex++;
            }

            foreach (var definition in definitions)
            {
                if (definition.type != PianoKeyType.Black)
                {
                    continue;
                }

                float x = startX + (definition.afterWhite - 0.5f) * whiteWidth;
                Vector3 position = new(x, 0.035f, blackKeyForwardOffset);
                CreateKey(definition, position, blackKeySize, blackKeyMaterial);
            }
        }

        public bool TryGetKey(string keyId, out PianoKey key)
        {
            return keysById.TryGetValue(keyId, out key);
        }

        private void CreateKey(PianoKeyDefinition definition, Vector3 position, Vector3 size, Material material)
        {
            GameObject keyObject = GameObject.CreatePrimitive(PrimitiveType.Cube);
            keyObject.name = $"Key_{definition.id}";
            keyObject.transform.SetParent(transform, false);
            keyObject.transform.localPosition = position;
            keyObject.transform.localScale = size;

            PianoKey pianoKey = keyObject.AddComponent<PianoKey>();
            pianoKey.Initialize(definition, material);
            keysById.Add(definition.id, pianoKey);
        }

        private void EnsureMaterials()
        {
            if (whiteKeyMaterial == null)
            {
                whiteKeyMaterial = new Material(Shader.Find("Standard")) { color = new Color(0.96f, 0.94f, 0.88f) };
            }

            if (blackKeyMaterial == null)
            {
                blackKeyMaterial = new Material(Shader.Find("Standard")) { color = new Color(0.08f, 0.09f, 0.11f) };
            }
        }

        private void ClearExistingKeys()
        {
            keysById.Clear();

            for (int i = transform.childCount - 1; i >= 0; i--)
            {
                if (Application.isPlaying)
                {
                    Destroy(transform.GetChild(i).gameObject);
                }
                else
                {
                    DestroyImmediate(transform.GetChild(i).gameObject);
                }
            }
        }
    }
}

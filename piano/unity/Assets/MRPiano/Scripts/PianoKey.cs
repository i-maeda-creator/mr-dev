using UnityEngine;

namespace MRPiano
{
    [RequireComponent(typeof(Collider))]
    public class PianoKey : MonoBehaviour
    {
        [SerializeField] private Renderer keyRenderer;
        [SerializeField] private Color idleColor = Color.white;
        [SerializeField] private Color pressedColor = new(0.58f, 0.86f, 0.79f);
        [SerializeField] private float pressDepth = 0.035f;

        private Vector3 idleLocalPosition;

        public PianoKeyDefinition Definition { get; private set; }

        public void Initialize(PianoKeyDefinition definition, Material material)
        {
            Definition = definition;
            idleLocalPosition = transform.localPosition;

            if (keyRenderer == null)
            {
                keyRenderer = GetComponent<Renderer>();
            }

            keyRenderer.material = material;
            idleColor = material.color;
            SetPressed(false);
        }

        public void SetPressed(bool isPressed)
        {
            transform.localPosition = idleLocalPosition + (isPressed ? Vector3.down * pressDepth : Vector3.zero);

            if (keyRenderer != null)
            {
                keyRenderer.material.color = isPressed ? pressedColor : idleColor;
            }
        }
    }
}

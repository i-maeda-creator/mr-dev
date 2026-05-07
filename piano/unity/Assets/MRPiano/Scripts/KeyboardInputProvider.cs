using UnityEngine;

namespace MRPiano
{
    public class KeyboardInputProvider : MonoBehaviour
    {
        [SerializeField] private PianoInputRouter inputRouter;

        private void Awake()
        {
            inputRouter ??= GetComponent<PianoInputRouter>();
        }

        private void Update()
        {
            foreach (PianoKeyDefinition key in PianoNotes.OneOctave())
            {
                if (Input.GetKeyDown(key.binding))
                {
                    inputRouter.Press(key.id);
                }

                if (Input.GetKeyUp(key.binding))
                {
                    inputRouter.Release(key.id);
                }
            }
        }
    }
}

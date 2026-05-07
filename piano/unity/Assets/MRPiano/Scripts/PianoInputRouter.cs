using UnityEngine;

namespace MRPiano
{
    public class PianoInputRouter : MonoBehaviour
    {
        [SerializeField] private PianoLayoutBuilder layoutBuilder;
        [SerializeField] private PianoSoundEngine soundEngine;

        private void Awake()
        {
            layoutBuilder ??= GetComponent<PianoLayoutBuilder>();
            soundEngine ??= GetComponent<PianoSoundEngine>();
        }

        public void Press(string keyId)
        {
            if (!layoutBuilder.TryGetKey(keyId, out PianoKey key))
            {
                return;
            }

            key.SetPressed(true);
            soundEngine.Play(key.Definition);
        }

        public void Release(string keyId)
        {
            if (!layoutBuilder.TryGetKey(keyId, out PianoKey key))
            {
                return;
            }

            key.SetPressed(false);
            soundEngine.Stop(keyId);
        }
    }
}

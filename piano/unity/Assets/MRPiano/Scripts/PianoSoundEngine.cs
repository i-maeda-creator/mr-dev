using System.Collections.Generic;
using UnityEngine;

namespace MRPiano
{
    [RequireComponent(typeof(AudioSource))]
    public class PianoSoundEngine : MonoBehaviour
    {
        [SerializeField] private float durationSeconds = 1.2f;
        [SerializeField] private float volume = 0.16f;

        private readonly Dictionary<string, AudioSource> activeSources = new();
        private AudioSource sourceTemplate;

        private void Awake()
        {
            sourceTemplate = GetComponent<AudioSource>();
            sourceTemplate.playOnAwake = false;
        }

        public void Play(PianoKeyDefinition key)
        {
            if (key == null || activeSources.ContainsKey(key.id))
            {
                return;
            }

            AudioSource source = gameObject.AddComponent<AudioSource>();
            source.playOnAwake = false;
            source.volume = volume;
            source.clip = CreateToneClip(key.id, key.frequency);
            source.Play();
            activeSources.Add(key.id, source);
        }

        public void Stop(string keyId)
        {
            if (!activeSources.TryGetValue(keyId, out AudioSource source))
            {
                return;
            }

            Destroy(source.clip);
            Destroy(source);
            activeSources.Remove(keyId);
        }

        private AudioClip CreateToneClip(string id, float frequency)
        {
            int sampleRate = AudioSettings.outputSampleRate;
            int sampleCount = Mathf.CeilToInt(sampleRate * durationSeconds);
            float[] samples = new float[sampleCount];

            for (int i = 0; i < sampleCount; i++)
            {
                float t = i / (float)sampleRate;
                float wave = Mathf.Sin(2f * Mathf.PI * frequency * t);
                float attack = Mathf.Clamp01(t / 0.012f);
                float release = Mathf.Clamp01((durationSeconds - t) / 0.15f);
                samples[i] = wave * attack * release;
            }

            AudioClip clip = AudioClip.Create($"Tone_{id}", sampleCount, 1, sampleRate, false);
            clip.SetData(samples, 0);
            return clip;
        }
    }
}

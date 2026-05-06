const keyData = [
  { id: "C4", type: "white", label: "C4", binding: "A", frequency: 261.63 },
  { id: "C#4", type: "black", label: "C#", binding: "W", frequency: 277.18, afterWhite: 1 },
  { id: "D4", type: "white", label: "D4", binding: "S", frequency: 293.66 },
  { id: "D#4", type: "black", label: "D#", binding: "E", frequency: 311.13, afterWhite: 2 },
  { id: "E4", type: "white", label: "E4", binding: "D", frequency: 329.63 },
  { id: "F4", type: "white", label: "F4", binding: "F", frequency: 349.23 },
  { id: "F#4", type: "black", label: "F#", binding: "T", frequency: 369.99, afterWhite: 4 },
  { id: "G4", type: "white", label: "G4", binding: "G", frequency: 392.0 },
  { id: "G#4", type: "black", label: "G#", binding: "Y", frequency: 415.3, afterWhite: 5 },
  { id: "A4", type: "white", label: "A4", binding: "H", frequency: 440.0 },
  { id: "A#4", type: "black", label: "A#", binding: "U", frequency: 466.16, afterWhite: 6 },
  { id: "B4", type: "white", label: "B4", binding: "J", frequency: 493.88 },
  { id: "C5", type: "white", label: "C5", binding: "K", frequency: 523.25 },
];

const keysRoot = document.querySelector("#pianoKeys");
const pressedKeys = new Map();
let audioContext;

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function createVoice(frequency) {
  const context = ensureAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.16);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);

  return { oscillator, gain };
}

function stopVoice(voice) {
  const context = ensureAudioContext();
  const now = context.currentTime;

  voice.gain.gain.cancelScheduledValues(now);
  voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), now);
  voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
  voice.oscillator.stop(now + 0.09);
}

function pressKey(id) {
  if (pressedKeys.has(id)) {
    return;
  }

  const key = keyData.find((item) => item.id === id);
  const element = document.querySelector(`[data-key-id="${CSS.escape(id)}"]`);

  if (!key || !element) {
    return;
  }

  element.classList.add("is-pressed");
  pressedKeys.set(id, createVoice(key.frequency));
}

function releaseKey(id) {
  const voice = pressedKeys.get(id);
  const element = document.querySelector(`[data-key-id="${CSS.escape(id)}"]`);

  if (!voice) {
    return;
  }

  element?.classList.remove("is-pressed");
  stopVoice(voice);
  pressedKeys.delete(id);
}

function renderKeys() {
  const whiteKeys = keyData.filter((key) => key.type === "white");
  const blackKeys = keyData.filter((key) => key.type === "black");

  whiteKeys.forEach((key) => {
    const button = document.createElement("button");
    button.className = "key white-key";
    button.dataset.keyId = key.id;
    button.type = "button";
    button.innerHTML = `<span class="key-label"><strong>${key.binding}</strong><span>${key.label}</span></span>`;
    keysRoot.append(button);
  });

  blackKeys.forEach((key) => {
    const button = document.createElement("button");
    button.className = "key black-key";
    button.dataset.keyId = key.id;
    button.type = "button";
    button.style.left = `${(key.afterWhite / whiteKeys.length) * 100}%`;
    button.innerHTML = `<span class="key-label"><strong>${key.binding}</strong><span>${key.label}</span></span>`;
    keysRoot.append(button);
  });
}

function keyForBinding(binding) {
  return keyData.find((key) => key.binding.toLowerCase() === binding.toLowerCase());
}

renderKeys();

keysRoot.addEventListener("pointerdown", (event) => {
  const keyElement = event.target.closest(".key");

  if (!keyElement) {
    return;
  }

  keyElement.setPointerCapture(event.pointerId);
  pressKey(keyElement.dataset.keyId);
});

keysRoot.addEventListener("pointerup", (event) => {
  const keyElement = event.target.closest(".key");

  if (keyElement) {
    releaseKey(keyElement.dataset.keyId);
  }
});

keysRoot.addEventListener("pointercancel", (event) => {
  const keyElement = event.target.closest(".key");

  if (keyElement) {
    releaseKey(keyElement.dataset.keyId);
  }
});

window.addEventListener("keydown", (event) => {
  if (event.repeat) {
    return;
  }

  const key = keyForBinding(event.key);

  if (key) {
    pressKey(key.id);
  }
});

window.addEventListener("keyup", (event) => {
  const key = keyForBinding(event.key);

  if (key) {
    releaseKey(key.id);
  }
});

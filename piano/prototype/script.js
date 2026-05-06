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
const instrument = document.querySelector(".instrument");
const fingertip = document.querySelector("#fingertip");
const modeButtons = document.querySelectorAll(".mode-button");
const modeStatus = document.querySelector("#modeStatus");
const depthMeter = document.querySelector(".depth-meter");
const depthFill = document.querySelector("#depthFill");
const depthLabel = document.querySelector("#depthLabel");
const pressedKeys = new Map();
const pointerPressedKeys = new Set();
const PRESS_DEPTH = 0.65;
const TOUCH_DEPTH = 0.25;
let currentMode = "play";
let fingertipPointerId = null;
let fingertipKeyId = null;
let fingertipHoverKeyId = null;
let fingertipDepth = 0;
let lastFingertipPoint = null;
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

function setMode(mode) {
  currentMode = mode;
  modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  depthMeter.classList.toggle("is-visible", mode === "fingertip");

  if (mode === "play") {
    modeStatus.textContent = "Keyboard and pointer input";
    resetFingertip();
    return;
  }

  modeStatus.textContent = "Move to aim, hold pointer or Space to press";
  setFingertipDepth(0);
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

function keyAtPoint(clientX, clientY) {
  const elements = document.elementsFromPoint(clientX, clientY);
  return elements.find((element) => element.classList?.contains("key"));
}

function moveFingertip(event) {
  const bounds = instrument.getBoundingClientRect();
  const x = event.clientX - bounds.left + instrument.scrollLeft;
  const y = event.clientY - bounds.top + instrument.scrollTop;

  lastFingertipPoint = { clientX: event.clientX, clientY: event.clientY };
  fingertip.style.left = `${x}px`;
  fingertip.style.top = `${y}px`;
  fingertip.classList.add("is-visible");
  updateFingertipTarget(event.clientX, event.clientY);
}

function setFingertipDepth(depth) {
  fingertipDepth = Math.max(0, Math.min(1, depth));
  depthFill.style.width = `${fingertipDepth * 100}%`;

  const isTouching = fingertipDepth >= TOUCH_DEPTH;
  const isPressing = fingertipDepth >= PRESS_DEPTH;
  fingertip.classList.toggle("is-touching", isTouching);
  fingertip.classList.toggle("is-pressing", isPressing);

  if (isPressing) {
    depthLabel.textContent = "Press";
  } else if (isTouching) {
    depthLabel.textContent = "Touch";
  } else {
    depthLabel.textContent = "Air";
  }

  if (lastFingertipPoint) {
    updateFingertipTarget(lastFingertipPoint.clientX, lastFingertipPoint.clientY);
  }
}

function updateFingertipTarget(clientX, clientY) {
  const keyElement = keyAtPoint(clientX, clientY);
  const nextKeyId = keyElement?.dataset.keyId ?? null;

  setFingertipHover(nextKeyId);

  if (fingertipDepth < PRESS_DEPTH) {
    releaseFingertipKey();
    return;
  }

  if (nextKeyId && nextKeyId !== fingertipKeyId) {
    releaseFingertipKey();
    fingertipKeyId = nextKeyId;
    pressKey(nextKeyId);
  }
}

function setFingertipHover(id) {
  if (id === fingertipHoverKeyId) {
    return;
  }

  if (fingertipHoverKeyId) {
    document.querySelector(`[data-key-id="${CSS.escape(fingertipHoverKeyId)}"]`)?.classList.remove("is-hovered");
  }

  fingertipHoverKeyId = id;

  if (fingertipHoverKeyId) {
    document.querySelector(`[data-key-id="${CSS.escape(fingertipHoverKeyId)}"]`)?.classList.add("is-hovered");
  }
}

function releaseFingertipKey() {
  if (fingertipKeyId) {
    releaseKey(fingertipKeyId);
    fingertipKeyId = null;
  }
}

function resetFingertip() {
  fingertipPointerId = null;
  lastFingertipPoint = null;
  setFingertipDepth(0);
  setFingertipHover(null);
  releaseFingertipKey();
  fingertip.classList.remove("is-visible", "is-touching", "is-pressing");
}

renderKeys();

keysRoot.addEventListener("pointerdown", (event) => {
  if (currentMode !== "play") {
    return;
  }

  const keyElement = event.target.closest(".key");

  if (!keyElement) {
    return;
  }

  keyElement.setPointerCapture(event.pointerId);
  pointerPressedKeys.add(keyElement.dataset.keyId);
  pressKey(keyElement.dataset.keyId);
});

keysRoot.addEventListener("pointerup", (event) => {
  if (currentMode !== "play") {
    return;
  }

  const keyElement = event.target.closest(".key");

  if (keyElement && pointerPressedKeys.has(keyElement.dataset.keyId)) {
    pointerPressedKeys.delete(keyElement.dataset.keyId);
    releaseKey(keyElement.dataset.keyId);
  }
});

keysRoot.addEventListener("pointercancel", (event) => {
  if (currentMode !== "play") {
    return;
  }

  const keyElement = event.target.closest(".key");

  if (keyElement && pointerPressedKeys.has(keyElement.dataset.keyId)) {
    pointerPressedKeys.delete(keyElement.dataset.keyId);
    releaseKey(keyElement.dataset.keyId);
  }
});

instrument.addEventListener("pointerdown", (event) => {
  if (currentMode !== "fingertip") {
    return;
  }

  event.preventDefault();
  fingertipPointerId = event.pointerId;
  instrument.setPointerCapture(event.pointerId);
  moveFingertip(event);
  setFingertipDepth(1);
});

instrument.addEventListener("pointermove", (event) => {
  if (currentMode !== "fingertip") {
    return;
  }

  moveFingertip(event);
});

instrument.addEventListener("pointerup", (event) => {
  if (event.pointerId !== fingertipPointerId) {
    return;
  }

  fingertipPointerId = null;
  setFingertipDepth(0);
});

instrument.addEventListener("pointerleave", () => {
  if (currentMode === "fingertip" && fingertipPointerId === null) {
    fingertip.classList.remove("is-visible");
    setFingertipHover(null);
  }
});

instrument.addEventListener("pointercancel", () => {
  resetFingertip();
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

window.addEventListener("keydown", (event) => {
  if (event.repeat) {
    return;
  }

  if (currentMode === "fingertip" && event.code === "Space") {
    event.preventDefault();
    setFingertipDepth(1);
    return;
  }

  if (currentMode !== "play") {
    return;
  }

  const key = keyForBinding(event.key);

  if (key) {
    pressKey(key.id);
  }
});

window.addEventListener("keyup", (event) => {
  if (currentMode === "fingertip" && event.code === "Space") {
    event.preventDefault();
    setFingertipDepth(0);
    return;
  }

  if (currentMode !== "play") {
    return;
  }

  const key = keyForBinding(event.key);

  if (key) {
    releaseKey(key.id);
  }
});

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

const PRESS_DEPTH = 0.65;
const TOUCH_DEPTH = 0.25;

class PianoModel {
  constructor(keys) {
    this.keys = keys;
  }

  get whiteKeys() {
    return this.keys.filter((key) => key.type === "white");
  }

  get blackKeys() {
    return this.keys.filter((key) => key.type === "black");
  }

  findById(id) {
    return this.keys.find((key) => key.id === id);
  }

  findByBinding(binding) {
    return this.keys.find((key) => key.binding.toLowerCase() === binding.toLowerCase());
  }
}

class PianoSoundEngine {
  constructor() {
    this.audioContext = null;
    this.voices = new Map();
  }

  press(key) {
    if (!key || this.voices.has(key.id)) {
      return;
    }

    this.voices.set(key.id, this.createVoice(key.frequency));
  }

  release(keyId) {
    const voice = this.voices.get(keyId);

    if (!voice) {
      return;
    }

    this.stopVoice(voice);
    this.voices.delete(keyId);
  }

  ensureAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  createVoice(frequency) {
    const context = this.ensureAudioContext();
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

  stopVoice(voice) {
    const context = this.ensureAudioContext();
    const now = context.currentTime;

    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), now);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    voice.oscillator.stop(now + 0.09);
  }
}

class PianoView {
  constructor({ keysRoot, model }) {
    this.keysRoot = keysRoot;
    this.model = model;
  }

  render() {
    this.model.whiteKeys.forEach((key) => this.keysRoot.append(this.createWhiteKey(key)));
    this.model.blackKeys.forEach((key) => this.keysRoot.append(this.createBlackKey(key)));
  }

  setPressed(keyId, isPressed) {
    this.keyElement(keyId)?.classList.toggle("is-pressed", isPressed);
  }

  setHovered(keyId, isHovered) {
    this.keyElement(keyId)?.classList.toggle("is-hovered", isHovered);
  }

  keyAtPoint(clientX, clientY) {
    const elements = document.elementsFromPoint(clientX, clientY);
    return elements.find((element) => element.classList?.contains("key"))?.dataset.keyId ?? null;
  }

  keyElement(keyId) {
    return document.querySelector(`[data-key-id="${CSS.escape(keyId)}"]`);
  }

  createWhiteKey(key) {
    const button = this.createKeyButton(key);
    button.classList.add("white-key");
    return button;
  }

  createBlackKey(key) {
    const button = this.createKeyButton(key);
    button.classList.add("black-key");
    button.style.left = `${(key.afterWhite / this.model.whiteKeys.length) * 100}%`;
    return button;
  }

  createKeyButton(key) {
    const button = document.createElement("button");
    button.className = "key";
    button.dataset.keyId = key.id;
    button.type = "button";
    button.innerHTML = `<span class="key-label"><strong>${key.binding}</strong><span>${key.label}</span></span>`;
    return button;
  }
}

class PianoController {
  constructor({ model, view, sound }) {
    this.model = model;
    this.view = view;
    this.sound = sound;
    this.pressedKeys = new Set();
  }

  press(keyId) {
    if (this.pressedKeys.has(keyId)) {
      return;
    }

    const key = this.model.findById(keyId);

    if (!key) {
      return;
    }

    this.pressedKeys.add(keyId);
    this.view.setPressed(keyId, true);
    this.sound.press(key);
  }

  release(keyId) {
    if (!this.pressedKeys.has(keyId)) {
      return;
    }

    this.pressedKeys.delete(keyId);
    this.view.setPressed(keyId, false);
    this.sound.release(keyId);
  }
}

class FingertipInput {
  constructor({ instrument, fingertip, depthMeter, depthFill, depthLabel, view, controller }) {
    this.instrument = instrument;
    this.fingertip = fingertip;
    this.depthMeter = depthMeter;
    this.depthFill = depthFill;
    this.depthLabel = depthLabel;
    this.view = view;
    this.controller = controller;
    this.pointerId = null;
    this.activeKeyId = null;
    this.hoverKeyId = null;
    this.depth = 0;
    this.lastPoint = null;
  }

  setEnabled(isEnabled) {
    this.depthMeter.classList.toggle("is-visible", isEnabled);

    if (!isEnabled) {
      this.reset();
      return;
    }

    this.setDepth(0);
  }

  move(event) {
    const bounds = this.instrument.getBoundingClientRect();
    const x = event.clientX - bounds.left + this.instrument.scrollLeft;
    const y = event.clientY - bounds.top + this.instrument.scrollTop;

    this.lastPoint = { clientX: event.clientX, clientY: event.clientY };
    this.fingertip.style.left = `${x}px`;
    this.fingertip.style.top = `${y}px`;
    this.fingertip.classList.add("is-visible");
    this.updateTarget(event.clientX, event.clientY);
  }

  setDepth(depth) {
    this.depth = Math.max(0, Math.min(1, depth));
    this.depthFill.style.width = `${this.depth * 100}%`;

    const isTouching = this.depth >= TOUCH_DEPTH;
    const isPressing = this.depth >= PRESS_DEPTH;
    this.fingertip.classList.toggle("is-touching", isTouching);
    this.fingertip.classList.toggle("is-pressing", isPressing);

    if (isPressing) {
      this.depthLabel.textContent = "Press";
    } else if (isTouching) {
      this.depthLabel.textContent = "Touch";
    } else {
      this.depthLabel.textContent = "Air";
    }

    if (this.lastPoint) {
      this.updateTarget(this.lastPoint.clientX, this.lastPoint.clientY);
    }
  }

  updateTarget(clientX, clientY) {
    const nextKeyId = this.view.keyAtPoint(clientX, clientY);
    this.setHover(nextKeyId);

    if (this.depth < PRESS_DEPTH) {
      this.releaseActiveKey();
      return;
    }

    if (nextKeyId && nextKeyId !== this.activeKeyId) {
      this.releaseActiveKey();
      this.activeKeyId = nextKeyId;
      this.controller.press(nextKeyId);
    }
  }

  setHover(keyId) {
    if (keyId === this.hoverKeyId) {
      return;
    }

    if (this.hoverKeyId) {
      this.view.setHovered(this.hoverKeyId, false);
    }

    this.hoverKeyId = keyId;

    if (this.hoverKeyId) {
      this.view.setHovered(this.hoverKeyId, true);
    }
  }

  releaseActiveKey() {
    if (this.activeKeyId) {
      this.controller.release(this.activeKeyId);
      this.activeKeyId = null;
    }
  }

  hide() {
    if (this.pointerId === null) {
      this.fingertip.classList.remove("is-visible");
      this.setHover(null);
    }
  }

  reset() {
    this.pointerId = null;
    this.lastPoint = null;
    this.setDepth(0);
    this.setHover(null);
    this.releaseActiveKey();
    this.fingertip.classList.remove("is-visible", "is-touching", "is-pressing");
  }
}

class PrototypeApp {
  constructor() {
    this.mode = "play";
    this.pointerPressedKeys = new Set();
    this.model = new PianoModel(keyData);
    this.view = new PianoView({
      keysRoot: document.querySelector("#pianoKeys"),
      model: this.model,
    });
    this.sound = new PianoSoundEngine();
    this.controller = new PianoController({
      model: this.model,
      view: this.view,
      sound: this.sound,
    });
    this.elements = {
      instrument: document.querySelector(".instrument"),
      modeButtons: document.querySelectorAll(".mode-button"),
      modeStatus: document.querySelector("#modeStatus"),
    };
    this.fingertipInput = new FingertipInput({
      instrument: this.elements.instrument,
      fingertip: document.querySelector("#fingertip"),
      depthMeter: document.querySelector(".depth-meter"),
      depthFill: document.querySelector("#depthFill"),
      depthLabel: document.querySelector("#depthLabel"),
      view: this.view,
      controller: this.controller,
    });
  }

  start() {
    this.view.render();
    this.bindModeControls();
    this.bindPlayPointerInput();
    this.bindFingertipInput();
    this.bindKeyboardInput();
  }

  setMode(mode) {
    this.mode = mode;
    this.elements.modeButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.mode === mode);
    });

    this.fingertipInput.setEnabled(mode === "fingertip");
    this.elements.modeStatus.textContent =
      mode === "play" ? "Keyboard and pointer input" : "Move to aim, hold pointer or Space to press";
  }

  bindModeControls() {
    this.elements.modeButtons.forEach((button) => {
      button.addEventListener("click", () => this.setMode(button.dataset.mode));
    });
  }

  bindPlayPointerInput() {
    this.view.keysRoot.addEventListener("pointerdown", (event) => {
      if (this.mode !== "play") {
        return;
      }

      const keyElement = event.target.closest(".key");

      if (!keyElement) {
        return;
      }

      keyElement.setPointerCapture(event.pointerId);
      this.pointerPressedKeys.add(keyElement.dataset.keyId);
      this.controller.press(keyElement.dataset.keyId);
    });

    const releasePointerKey = (event) => {
      if (this.mode !== "play") {
        return;
      }

      const keyElement = event.target.closest(".key");

      if (keyElement && this.pointerPressedKeys.has(keyElement.dataset.keyId)) {
        this.pointerPressedKeys.delete(keyElement.dataset.keyId);
        this.controller.release(keyElement.dataset.keyId);
      }
    };

    this.view.keysRoot.addEventListener("pointerup", releasePointerKey);
    this.view.keysRoot.addEventListener("pointercancel", releasePointerKey);
  }

  bindFingertipInput() {
    this.elements.instrument.addEventListener("pointerdown", (event) => {
      if (this.mode !== "fingertip") {
        return;
      }

      event.preventDefault();
      this.fingertipInput.pointerId = event.pointerId;
      this.elements.instrument.setPointerCapture(event.pointerId);
      this.fingertipInput.move(event);
      this.fingertipInput.setDepth(1);
    });

    this.elements.instrument.addEventListener("pointermove", (event) => {
      if (this.mode === "fingertip") {
        this.fingertipInput.move(event);
      }
    });

    this.elements.instrument.addEventListener("pointerup", (event) => {
      if (event.pointerId === this.fingertipInput.pointerId) {
        this.fingertipInput.pointerId = null;
        this.fingertipInput.setDepth(0);
      }
    });

    this.elements.instrument.addEventListener("pointerleave", () => {
      if (this.mode === "fingertip") {
        this.fingertipInput.hide();
      }
    });

    this.elements.instrument.addEventListener("pointercancel", () => {
      this.fingertipInput.reset();
    });
  }

  bindKeyboardInput() {
    window.addEventListener("keydown", (event) => {
      if (event.repeat) {
        return;
      }

      if (this.mode === "fingertip" && event.code === "Space") {
        event.preventDefault();
        this.fingertipInput.setDepth(1);
        return;
      }

      if (this.mode !== "play") {
        return;
      }

      const key = this.model.findByBinding(event.key);

      if (key) {
        this.controller.press(key.id);
      }
    });

    window.addEventListener("keyup", (event) => {
      if (this.mode === "fingertip" && event.code === "Space") {
        event.preventDefault();
        this.fingertipInput.setDepth(0);
        return;
      }

      if (this.mode !== "play") {
        return;
      }

      const key = this.model.findByBinding(event.key);

      if (key) {
        this.controller.release(key.id);
      }
    });
  }
}

new PrototypeApp().start();

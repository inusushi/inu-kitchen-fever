// Sintetiza todos los efectos con Web Audio API — sin archivos de audio externos.
export class AudioManager {
  constructor(save) {
    this.save = save;
    this.ctx = null;
  }

  _ctx() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  get muted() {
    return !!this.save.state.settings?.muted;
  }

  toggleMute() {
    if (!this.save.state.settings) this.save.state.settings = { muted: false };
    this.save.state.settings.muted = !this.save.state.settings.muted;
    this.save.persist();
    return this.save.state.settings.muted;
  }

  _tone(freq, duration, { type = 'sine', gain = 0.2, delay = 0, glideTo = null } = {}) {
    if (this.muted) return;
    const ctx = this._ctx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, ctx.currentTime + delay + duration);
    g.gain.setValueAtTime(gain, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.02);
  }

  tap() {
    this._tone(500, 0.05, { type: 'square', gain: 0.06 });
  }

  stepDone() {
    this._tone(700, 0.08, { type: 'triangle', gain: 0.12 });
  }

  serve(withCombo) {
    this._tone(660, 0.1, { type: 'sine', gain: 0.18 });
    this._tone(880, 0.12, { type: 'sine', gain: 0.16, delay: 0.08 });
    if (withCombo) this._tone(1100, 0.14, { type: 'sine', gain: 0.14, delay: 0.16 });
  }

  mismatch() {
    this._tone(220, 0.12, { type: 'square', gain: 0.1 });
  }

  customerLeft() {
    this._tone(300, 0.25, { type: 'sawtooth', gain: 0.14, glideTo: 120 });
  }

  patienceWarning() {
    this._tone(950, 0.08, { type: 'square', gain: 0.08 });
  }

  levelComplete(stars) {
    const notes = [523, 659, 784, 1046];
    for (let i = 0; i <= stars; i++) {
      this._tone(notes[Math.min(i, notes.length - 1)], 0.2, { type: 'triangle', gain: 0.18, delay: i * 0.12 });
    }
  }

  levelFailed() {
    this._tone(300, 0.3, { type: 'sawtooth', gain: 0.15, glideTo: 100 });
  }

  purchase() {
    this._tone(500, 0.06, { type: 'sine', gain: 0.14 });
    this._tone(750, 0.1, { type: 'sine', gain: 0.14, delay: 0.06 });
  }

  // Música ambiental: un vaivén corto en marimba, muy bajo de volumen, para
  // no competir con los efectos. Se apoya en _tone(), así que ya respeta el
  // silencio sin lógica extra — si está muteado, cada nota simplemente no suena.
  startMusic() {
    if (this.musicTimer) return;
    const MELODY = [523, 659, 784, 659, 587, 698, 880, 698];
    const STEP_MS = 380;
    let step = 0;
    this.musicTimer = setInterval(() => {
      this._tone(MELODY[step % MELODY.length], 0.32, { type: 'triangle', gain: 0.045 });
      if (step % 4 === 0) this._tone(MELODY[step % MELODY.length] / 2, 0.5, { type: 'sine', gain: 0.035 });
      step++;
    }, STEP_MS);
  }

  stopMusic() {
    clearInterval(this.musicTimer);
    this.musicTimer = null;
  }
}

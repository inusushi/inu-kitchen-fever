// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioManager } from '../js/core/AudioManager.js';

// jsdom no implementa Web Audio; simulamos lo mínimo que AudioManager toca.
class FakeParam {
  setValueAtTime() {}
  exponentialRampToValueAtTime() {}
}
class FakeNode {
  constructor() {
    this.frequency = new FakeParam();
    this.gain = new FakeParam();
    this.type = 'sine';
  }
  connect() { return this; }
  start() {}
  stop() {}
}
class FakeAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
  }
  createOscillator() { return new FakeNode(); }
  createGain() { return new FakeNode(); }
  resume() {}
}

const fakeSave = () => ({ state: { settings: { muted: false } }, persist() {} });

describe('AudioManager — música de fondo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.AudioContext = FakeAudioContext;
  });
  afterEach(() => {
    vi.useRealTimers();
    delete window.AudioContext;
  });

  it('starts a repeating timer and does not throw as it plays', () => {
    const audio = new AudioManager(fakeSave());
    audio.startMusic();
    expect(audio.musicTimer).toBeTruthy();
    expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
  });

  it('does not stack a second timer if started twice', () => {
    const audio = new AudioManager(fakeSave());
    audio.startMusic();
    const first = audio.musicTimer;
    audio.startMusic();
    expect(audio.musicTimer).toBe(first);
  });

  it('stops cleanly and can be nulled out', () => {
    const audio = new AudioManager(fakeSave());
    audio.startMusic();
    audio.stopMusic();
    expect(audio.musicTimer).toBeNull();
  });

  it('schedules notes without sound while muted, and does not throw', () => {
    const save = fakeSave();
    save.state.settings.muted = true;
    const audio = new AudioManager(save);
    audio.startMusic();
    expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
  });
});

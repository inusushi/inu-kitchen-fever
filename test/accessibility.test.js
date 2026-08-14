// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { applyA11ySettings } from '../js/core/accessibility.js';
import { SaveManager } from '../js/core/SaveManager.js';

describe('applyA11ySettings', () => {
  beforeEach(() => {
    document.documentElement.className = '';
  });

  it('adds both classes when both settings are on', () => {
    applyA11ySettings({ colorblind: true, largeText: true });
    expect(document.documentElement.classList.contains('colorblind')).toBe(true);
    expect(document.documentElement.classList.contains('large-text')).toBe(true);
  });

  it('removes classes when settings turn off, does not just leave them stuck', () => {
    applyA11ySettings({ colorblind: true, largeText: true });
    applyA11ySettings({ colorblind: false, largeText: false });
    expect(document.documentElement.classList.contains('colorblind')).toBe(false);
    expect(document.documentElement.classList.contains('large-text')).toBe(false);
  });

  it('handles missing keys as off, not as a crash', () => {
    expect(() => applyA11ySettings({})).not.toThrow();
    expect(document.documentElement.classList.contains('colorblind')).toBe(false);
  });
});

describe('SaveManager — accesibilidad', () => {
  beforeEach(() => localStorage.clear());

  it('starts with both accessibility options off', () => {
    const save = new SaveManager();
    expect(save.state.settings.colorblind).toBe(false);
    expect(save.state.settings.largeText).toBe(false);
  });

  it('toggles a setting and returns the new value', () => {
    const save = new SaveManager();
    expect(save.toggleSetting('colorblind')).toBe(true);
    expect(save.toggleSetting('colorblind')).toBe(false);
  });

  it('persists the toggle across reloads', () => {
    const save = new SaveManager();
    save.toggleSetting('largeText');
    const reloaded = new SaveManager();
    expect(reloaded.state.settings.largeText).toBe(true);
  });

  it('keeps settings independent of each other', () => {
    const save = new SaveManager();
    save.toggleSetting('colorblind');
    expect(save.state.settings.largeText).toBe(false);
    expect(save.state.settings.muted).toBe(false);
  });
});

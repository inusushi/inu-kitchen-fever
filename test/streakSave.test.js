// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '../js/core/SaveManager.js';
import { rewardForStreak } from '../js/game/streak.js';

const fakeApply = (streak, dateKey) => {
  if (streak.lastDate === dateKey) return { streak, rewarded: false, reward: 0, isNewDay: false };
  const day = streak.current + 1;
  return { streak: { lastDate: dateKey, current: day }, rewarded: true, reward: rewardForStreak(day), isNewDay: true };
};

describe('SaveManager — racha', () => {
  let save;
  beforeEach(() => {
    localStorage.clear();
    save = new SaveManager();
  });

  it('starts with no streak', () => {
    expect(save.state.streak).toEqual({ lastDate: null, current: 0 });
  });

  it('applies the streak and pays the coin reward', () => {
    const before = save.state.coins;
    const res = save.applyDailyStreak(fakeApply, '2026-08-13');
    expect(save.state.streak.current).toBe(1);
    expect(save.state.coins).toBe(before + res.reward);
  });

  it('does not pay twice for the same day', () => {
    save.applyDailyStreak(fakeApply, '2026-08-13');
    const coinsAfterFirst = save.state.coins;
    save.applyDailyStreak(fakeApply, '2026-08-13');
    expect(save.state.coins).toBe(coinsAfterFirst);
  });

  it('persists the streak across reloads', () => {
    save.applyDailyStreak(fakeApply, '2026-08-13');
    const reloaded = new SaveManager();
    expect(reloaded.state.streak.current).toBe(1);
  });
});

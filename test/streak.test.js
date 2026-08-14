import { describe, it, expect } from 'vitest';
import { rewardForStreak, applyDailyStreak } from '../js/game/streak.js';

describe('rewardForStreak', () => {
  it('grows day over day for the first week', () => {
    const rewards = [1, 2, 3, 4, 5, 6, 7].map(rewardForStreak);
    for (let i = 1; i < rewards.length; i++) {
      expect(rewards[i]).toBeGreaterThan(rewards[i - 1]);
    }
  });

  it('caps at the day-7 reward for longer streaks', () => {
    expect(rewardForStreak(7)).toBe(rewardForStreak(30));
    expect(rewardForStreak(7)).toBe(rewardForStreak(365));
  });

  it('never returns less than the day-1 reward', () => {
    expect(rewardForStreak(0)).toBe(rewardForStreak(1));
    expect(rewardForStreak(-5)).toBe(rewardForStreak(1));
  });
});

describe('applyDailyStreak', () => {
  const fresh = { lastDate: null, current: 0 };

  it('starts a new streak at day 1 for a first-ever visit', () => {
    const res = applyDailyStreak(fresh, '2026-08-13');
    expect(res.isNewDay).toBe(true);
    expect(res.rewarded).toBe(true);
    expect(res.streak).toEqual({ lastDate: '2026-08-13', current: 1 });
    expect(res.reward).toBe(rewardForStreak(1));
  });

  it('does nothing on a second visit the same day', () => {
    const streak = { lastDate: '2026-08-13', current: 1 };
    const res = applyDailyStreak(streak, '2026-08-13');
    expect(res.isNewDay).toBe(false);
    expect(res.rewarded).toBe(false);
    expect(res.streak).toBe(streak);
  });

  it('advances the streak on the very next day', () => {
    const streak = { lastDate: '2026-08-13', current: 3 };
    const res = applyDailyStreak(streak, '2026-08-14');
    expect(res.streak.current).toBe(4);
    expect(res.rewarded).toBe(true);
  });

  it('resets to day 1 when a day is skipped, with no reward carried over', () => {
    const streak = { lastDate: '2026-08-13', current: 5 };
    const res = applyDailyStreak(streak, '2026-08-16');
    expect(res.streak.current).toBe(1);
    expect(res.reward).toBe(rewardForStreak(1));
  });

  it('handles the month boundary correctly (not skipped)', () => {
    const streak = { lastDate: '2026-08-31', current: 2 };
    const res = applyDailyStreak(streak, '2026-09-01');
    expect(res.streak.current).toBe(3);
  });

  it('resets across a year boundary if a day was actually skipped', () => {
    const streak = { lastDate: '2026-12-30', current: 4 };
    const res = applyDailyStreak(streak, '2027-01-01');
    expect(res.streak.current).toBe(1);
  });

  it('does not advance the streak for a date earlier than the last one', () => {
    const streak = { lastDate: '2026-08-15', current: 4 };
    const res = applyDailyStreak(streak, '2026-08-14');
    // Un gap negativo no cuenta como "día siguiente": se reinicia, no retrocede mágicamente.
    expect(res.streak.current).toBe(1);
  });
});

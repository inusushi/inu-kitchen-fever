import { describe, it, expect } from 'vitest';
import {
  LEVEL_OBJECTIVES,
  evaluateObjectives,
  DAILY_CHALLENGES,
  todayKey,
  dailyChallengeFor,
  dailyProgressFrom,
  mergeDailyProgress,
} from '../js/game/objectives.js';

const run = (over = {}) => ({ coinsEarned: 0, served: 0, left: 0, bestCombo: 0, ...over });

describe('evaluateObjectives', () => {
  it('marks the clean run only when no customer was lost', () => {
    const done = (r) => evaluateObjectives(r).find((o) => o.id === 'sinPerder').done;
    expect(done(run({ left: 0 }))).toBe(true);
    expect(done(run({ left: 1 }))).toBe(false);
  });

  it('marks the combo objective at exactly 5', () => {
    const done = (r) => evaluateObjectives(r).find((o) => o.id === 'combo5').done;
    expect(done(run({ bestCombo: 4 }))).toBe(false);
    expect(done(run({ bestCombo: 5 }))).toBe(true);
  });

  it('returns one entry per defined objective', () => {
    expect(evaluateObjectives(run())).toHaveLength(LEVEL_OBJECTIVES.length);
  });
});

describe('todayKey', () => {
  it('formats the date as YYYY-MM-DD with padding', () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(todayKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('dailyChallengeFor', () => {
  it('is stable for the same day', () => {
    expect(dailyChallengeFor('2026-08-13').id).toBe(dailyChallengeFor('2026-08-13').id);
  });

  it('always returns a real challenge', () => {
    for (let d = 1; d <= 28; d++) {
      const key = `2026-08-${String(d).padStart(2, '0')}`;
      expect(DAILY_CHALLENGES).toContain(dailyChallengeFor(key));
    }
  });

  it('varies across the month rather than always picking one', () => {
    const ids = new Set();
    for (let d = 1; d <= 28; d++) {
      ids.add(dailyChallengeFor(`2026-08-${String(d).padStart(2, '0')}`).id);
    }
    expect(ids.size).toBeGreaterThan(1);
  });
});

describe('daily progress', () => {
  it('counts a perfect run only when no customer was lost', () => {
    const ch = DAILY_CHALLENGES.find((c) => c.track === 'perfectRuns');
    expect(dailyProgressFrom(ch, run({ left: 0 }))).toBe(1);
    expect(dailyProgressFrom(ch, run({ left: 3 }))).toBe(0);
  });

  it('accumulates dishes served across runs', () => {
    const ch = DAILY_CHALLENGES.find((c) => c.track === 'served');
    expect(mergeDailyProgress(ch, 7, 5)).toBe(12);
  });

  it('keeps the best attempt for single-run records', () => {
    const combo = DAILY_CHALLENGES.find((c) => c.track === 'bestCombo');
    expect(mergeDailyProgress(combo, 6, 4)).toBe(6);
    expect(mergeDailyProgress(combo, 6, 9)).toBe(9);

    const coins = DAILY_CHALLENGES.find((c) => c.track === 'coinsEarned');
    expect(mergeDailyProgress(coins, 300, 250)).toBe(300);
  });
});

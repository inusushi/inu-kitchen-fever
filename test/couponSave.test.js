// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '../js/core/SaveManager.js';

describe('SaveManager — cupón', () => {
  let save;
  beforeEach(() => {
    localStorage.clear();
    save = new SaveManager();
  });

  it('starts with no coupon', () => {
    expect(save.state.coupon.code).toBeNull();
    expect(save.state.coupon.unlockedAt).toBeNull();
  });

  it('unlocks once, generating a code and a timestamp', () => {
    const before = Date.now();
    const unlocked = save.maybeUnlockCoupon(() => 'IKF-TEST01');
    expect(unlocked).toBe(true);
    expect(save.state.coupon.code).toBe('IKF-TEST01');
    expect(save.state.coupon.unlockedAt).toBeGreaterThanOrEqual(before);
  });

  it('never unlocks a second time, even if asked again', () => {
    save.maybeUnlockCoupon(() => 'IKF-FIRST0');
    const secondCall = save.maybeUnlockCoupon(() => 'IKF-SECOND');
    expect(secondCall).toBe(false);
    expect(save.state.coupon.code).toBe('IKF-FIRST0');
  });

  it('persists the coupon across reloads', () => {
    save.maybeUnlockCoupon(() => 'IKF-PERSIST');
    const reloaded = new SaveManager();
    expect(reloaded.state.coupon.code).toBe('IKF-PERSIST');
  });
});

import { describe, it, expect } from 'vitest';
import {
  COUPON,
  isFullyMastered,
  expiryDate,
  isCouponValid,
  daysLeft,
  generateCouponCode,
} from '../js/game/coupon.js';

describe('condiciones reales del cupón (fijadas por Dany, 2026-08-13)', () => {
  it('is exactly 10% off, minimum $150, home delivery only, 30 days', () => {
    expect(COUPON.discountPercent).toBe(10);
    expect(COUPON.minPurchase).toBe(150);
    expect(COUPON.validDays).toBe(30);
    expect(COUPON.channel).toBe('Pedido a domicilio');
  });
});

describe('isFullyMastered', () => {
  it('requires 3 stars on every level, not just most of them', () => {
    const stars = { 0: 3, 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 2 };
    expect(isFullyMastered(stars, 8)).toBe(false);
  });

  it('is true only once all levels hit 3 stars', () => {
    const stars = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [i, 3]));
    expect(isFullyMastered(stars, 8)).toBe(true);
  });

  it('treats a missing level as 0 stars, not as passing', () => {
    const stars = { 0: 3, 1: 3 };
    expect(isFullyMastered(stars, 8)).toBe(false);
  });

  it('is false for an empty save', () => {
    expect(isFullyMastered({}, 8)).toBe(false);
  });
});

describe('vigencia', () => {
  const day = 24 * 60 * 60 * 1000;

  it('expires exactly 30 days after unlocking', () => {
    const unlocked = 1000;
    expect(expiryDate(unlocked)).toBe(unlocked + 30 * day);
  });

  it('is valid the instant it unlocks', () => {
    const now = Date.now();
    expect(isCouponValid(now, now)).toBe(true);
  });

  it('is still valid one day before expiring', () => {
    const unlocked = Date.now() - 29 * day;
    expect(isCouponValid(unlocked)).toBe(true);
  });

  it('is invalid the instant it expires', () => {
    const unlocked = Date.now() - 30 * day - 1;
    expect(isCouponValid(unlocked)).toBe(false);
  });

  it('is invalid when never unlocked', () => {
    expect(isCouponValid(null)).toBe(false);
  });

  it('counts down the days left without going negative', () => {
    const now = Date.now();
    expect(daysLeft(now, now)).toBe(30);
    expect(daysLeft(now - 40 * day, now)).toBe(0);
  });
});

describe('generateCouponCode', () => {
  it('starts with the IKF- prefix', () => {
    expect(generateCouponCode()).toMatch(/^IKF-[A-Z0-9]{6}$/);
  });

  it('is different across calls in practice', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateCouponCode()));
    expect(codes.size).toBeGreaterThan(1);
  });

  it('accepts an injected rng for deterministic tests', () => {
    expect(generateCouponCode(() => 0)).toBe('IKF-AAAAAA');
  });
});

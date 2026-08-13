// Cupón real de Inu Sushi. Condición fijada por Dany (2026-08-13):
// 10% de descuento, mínimo de compra $150, solo pedido a domicilio,
// vigente 30 días desde que se desbloquea (completar los 8 niveles con 3⭐).
export const COUPON = {
  discountPercent: 10,
  minPurchase: 150,
  validDays: 30,
  channel: 'Pedido a domicilio',
};

export function isFullyMastered(levelStars, levelCount) {
  if (levelCount <= 0) return false;
  for (let i = 0; i < levelCount; i++) {
    if ((levelStars[i] || 0) < 3) return false;
  }
  return true;
}

export function expiryDate(unlockedAt) {
  return unlockedAt + COUPON.validDays * 24 * 60 * 60 * 1000;
}

export function isCouponValid(unlockedAt, now = Date.now()) {
  if (!unlockedAt) return false;
  return now < expiryDate(unlockedAt);
}

export function daysLeft(unlockedAt, now = Date.now()) {
  const ms = expiryDate(unlockedAt) - now;
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function generateCouponCode(rng = Math.random) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'IKF-';
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(rng() * alphabet.length)];
  return out;
}

// Decide qué pasa al tocar a un cliente, sin tocar el DOM — así se puede probar.
//
// - 'serve'  : ya hay un plato listo de lo que pidió, en slots[slotIndex].
// - 'start'  : empezamos su pedido en la mesa libre slots[slotIndex].
// - 'reject' : no hay mesa libre, o ya estamos preparando suficientes de ese
//              platillo para todos los que lo piden (no desperdiciar una mesa).
// - 'ignore' : el cliente ya fue atendido o se fue.
export function decideCustomerTap(customer, slots, customers) {
  if (customer.state !== 'waiting') return { action: 'ignore' };

  const readyIndex = slots.findIndex(
    (s) => s.plate && s.plate.state === 'ready' && s.plate.recipe.id === customer.recipe.id,
  );
  if (readyIndex !== -1) return { action: 'serve', slotIndex: readyIndex };

  const enPreparacion = slots.filter((s) => s.plate && s.plate.recipe.id === customer.recipe.id).length;
  const loPiden = customers.filter((c) => c.state === 'waiting' && c.recipe.id === customer.recipe.id).length;
  const freeIndex = slots.findIndex((s) => !s.plate);

  if (freeIndex === -1 || enPreparacion >= loPiden) return { action: 'reject' };
  return { action: 'start', slotIndex: freeIndex };
}

// Monedas que paga un cliente: precio base, propina por rapidez, mejora de
// propina comprada en la tienda y bonus por combo (tope de 5 servicios).
export function serveReward(recipePrice, patienceRatio, tipMultiplier, combo) {
  const tip = patienceRatio > 0.5 ? 1.25 : 1;
  const comboBonus = 1 + Math.min(combo, 5) * 0.05;
  return Math.round(recipePrice * tip * tipMultiplier * comboBonus);
}

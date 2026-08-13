// Decide qué pasa al tocar a un cliente, sin tocar el DOM — así se puede probar.
//
// - 'serve'  : hay un plato listo que ese cliente todavía espera.
// - 'start'  : empezamos uno de sus platillos pendientes en una mesa libre.
// - 'reject' : no hay mesa libre, o ya se está preparando suficiente de lo que
//              falta (no desperdiciar una mesa).
// - 'ignore' : el cliente ya fue atendido o se fue.

// Cuántos platillos de esta receta siguen esperando todos los clientes juntos.
function demandOf(recipeId, customers) {
  return customers
    .filter((c) => c.state === 'waiting')
    .reduce((total, c) => total + c.pendingRecipes().filter((r) => r.id === recipeId).length, 0);
}

// Cuántos hay ya en las mesas (preparándose o listos).
function supplyOf(recipeId, slots) {
  return slots.filter((s) => s.plate && s.plate.recipe.id === recipeId).length;
}

export function decideCustomerTap(customer, slots, customers) {
  if (customer.state !== 'waiting') return { action: 'ignore' };

  const pending = customer.pendingRecipes();
  if (pending.length === 0) return { action: 'ignore' };

  // 1. Entregar algo que ya esté listo y que este cliente espere.
  const pendingIds = new Set(pending.map((r) => r.id));
  const readyIndex = slots.findIndex(
    (s) => s.plate && s.plate.state === 'ready' && pendingIds.has(s.plate.recipe.id),
  );
  if (readyIndex !== -1) return { action: 'serve', slotIndex: readyIndex };

  // 2. Si no, arrancar el primer pendiente que aún no esté cubierto.
  const freeIndex = slots.findIndex((s) => !s.plate);
  if (freeIndex === -1) return { action: 'reject' };

  const target = pending.find((r) => supplyOf(r.id, slots) < demandOf(r.id, customers));
  if (!target) return { action: 'reject' };

  return { action: 'start', slotIndex: freeIndex, recipe: target };
}

// Monedas que paga un platillo: precio base, propina por rapidez, mejora de
// propina comprada en la tienda y bonus por combo (tope de 5 servicios).
export function serveReward(recipePrice, patienceRatio, tipMultiplier, combo) {
  const tip = patienceRatio > 0.5 ? 1.25 : 1;
  const comboBonus = 1 + Math.min(combo, 5) * 0.05;
  return Math.round(recipePrice * tip * tipMultiplier * comboBonus);
}

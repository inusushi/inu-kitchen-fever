import { RECIPES } from '../data/recipes.js';

// Cuántos platillos pide un cliente. `orderSizes` es una lista de tamaños
// posibles y se sortea uno: repetir un número lo hace más probable
// (ej. [1, 1, 2] = dos de cada tres pedidos son de un solo platillo).
export function spawnOrder(level, rng = Math.random) {
  const sizes = level.orderSizes && level.orderSizes.length ? level.orderSizes : [1];
  const size = sizes[Math.floor(rng() * sizes.length)];
  const ids = level.recipeIds;

  const recipes = [];
  for (let i = 0; i < size; i++) {
    recipes.push(RECIPES[ids[Math.floor(rng() * ids.length)]]);
  }
  return recipes;
}

import { pickRandom } from '../utils/helpers.js';
import { RECIPES } from '../data/recipes.js';

export function spawnOrderRecipe(level) {
  const recipeId = pickRandom(level.recipeIds);
  return RECIPES[recipeId];
}

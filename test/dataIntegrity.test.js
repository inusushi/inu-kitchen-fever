import { describe, it, expect } from 'vitest';
import { LEVELS } from '../js/data/levels.js';
import { RECIPES } from '../js/data/recipes.js';

describe('game data integrity', () => {
  it('every level recipeId points to a real recipe', () => {
    for (const level of LEVELS) {
      for (const recipeId of level.recipeIds) {
        expect(RECIPES[recipeId], `${level.id} references missing recipe "${recipeId}"`).toBeDefined();
      }
    }
  });

  it('every recipe has at least one preparation step', () => {
    for (const recipe of Object.values(RECIPES)) {
      expect(recipe.steps.length, `${recipe.id} has no steps`).toBeGreaterThan(0);
    }
  });

  it('star goals are strictly ascending per level', () => {
    for (const level of LEVELS) {
      const [g1, g2, g3] = level.starGoals;
      expect(g1, `${level.id} star goals not ascending`).toBeLessThan(g2);
      expect(g2, `${level.id} star goals not ascending`).toBeLessThan(g3);
    }
  });

  it('every recipe id matches its object key', () => {
    for (const [key, recipe] of Object.entries(RECIPES)) {
      expect(recipe.id).toBe(key);
    }
  });
});

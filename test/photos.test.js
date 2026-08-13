import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DISH_PHOTOS, LEVEL_BACKGROUNDS, photoFor, backgroundFor } from '../js/data/photos.js';
import { RECIPES } from '../js/data/recipes.js';
import { LEVELS } from '../js/data/levels.js';

const publicPath = (file) => fileURLToPath(new URL(`../public/fotos/${file}`, import.meta.url));

describe('dish photos', () => {
  it('every mapped photo file actually exists', () => {
    for (const [recipeId, file] of Object.entries(DISH_PHOTOS)) {
      expect(existsSync(publicPath(file)), `falta public/fotos/${file} (${recipeId})`).toBe(true);
    }
  });

  it('every mapped photo belongs to a real recipe', () => {
    for (const recipeId of Object.keys(DISH_PHOTOS)) {
      expect(RECIPES[recipeId], `${recipeId} no existe en RECIPES`).toBeDefined();
    }
  });

  it('returns null for dishes without a photo, so they fall back to emoji', () => {
    expect(photoFor('banderillaMarYTierra')).toBeNull();
    expect(photoFor('inventado')).toBeNull();
  });

  it('builds a usable relative path when a photo exists', () => {
    expect(photoFor('musashiRoll')).toBe('fotos/musashi-roll.webp');
  });
});

describe('level backgrounds', () => {
  it('every background file actually exists', () => {
    for (const [levelId, file] of Object.entries(LEVEL_BACKGROUNDS)) {
      expect(existsSync(publicPath(file)), `falta public/fotos/${file} (${levelId})`).toBe(true);
    }
  });

  it('every mapped background belongs to a real level', () => {
    const ids = LEVELS.map((l) => l.id);
    for (const levelId of Object.keys(LEVEL_BACKGROUNDS)) {
      expect(ids, `${levelId} no es un nivel`).toContain(levelId);
    }
  });

  it('returns null for a level without background', () => {
    expect(backgroundFor('banderillas')).toBeNull();
  });
});

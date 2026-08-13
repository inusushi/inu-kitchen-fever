import { describe, it, expect } from 'vitest';
import { Plate } from '../js/game/Plate.js';

const recipe = {
  id: 'test-recipe',
  steps: [
    { station: 'chop', duration: 1000 },
    { station: 'cook', duration: 800 },
    { station: 'plate', duration: 500 },
  ],
};

describe('Plate', () => {
  it('starts prepping at step 0', () => {
    const plate = new Plate(recipe);
    expect(plate.state).toBe('prepping');
    expect(plate.stepIndex).toBe(0);
    expect(plate.currentStep().station).toBe('chop');
  });

  it('advances through each step without becoming ready early', () => {
    const plate = new Plate(recipe);
    plate.advance();
    expect(plate.stepIndex).toBe(1);
    expect(plate.state).toBe('prepping');
    expect(plate.currentStep().station).toBe('cook');
  });

  it('becomes ready only after the last step', () => {
    const plate = new Plate(recipe);
    plate.advance();
    plate.advance();
    expect(plate.state).toBe('prepping');
    plate.advance();
    expect(plate.state).toBe('ready');
  });

  it('resets atStation on advance', () => {
    const plate = new Plate(recipe);
    plate.atStation = true;
    plate.advance();
    expect(plate.atStation).toBe(false);
  });
});

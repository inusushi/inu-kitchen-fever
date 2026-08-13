import { describe, it, expect } from 'vitest';
import {
  TUTORIAL_STEPS,
  advanceTutorial,
  isTutorialFinished,
  tutorialFreezesClock,
} from '../js/game/tutorial.js';

describe('advanceTutorial', () => {
  it('advances when the expected event arrives', () => {
    expect(advanceTutorial(0, 'order-started')).toBe(1);
    expect(advanceTutorial(1, 'plate-ready')).toBe(2);
    expect(advanceTutorial(2, 'served')).toBe(3);
  });

  it('ignores events that do not match the current step', () => {
    expect(advanceTutorial(0, 'served')).toBeNull();
    expect(advanceTutorial(1, 'order-started')).toBeNull();
  });

  it('cannot advance past the final step', () => {
    const last = TUTORIAL_STEPS.length - 1;
    expect(advanceTutorial(last, 'served')).toBeNull();
    expect(advanceTutorial(last + 5, 'served')).toBeNull();
  });

  it('walks the full happy path in order', () => {
    let step = 0;
    step = advanceTutorial(step, 'order-started');
    step = advanceTutorial(step, 'plate-ready');
    step = advanceTutorial(step, 'served');
    expect(isTutorialFinished(step)).toBe(true);
  });
});

describe('tutorialFreezesClock', () => {
  it('freezes the clock while instructions are still pending', () => {
    expect(tutorialFreezesClock(0)).toBe(true);
    expect(tutorialFreezesClock(1)).toBe(true);
    expect(tutorialFreezesClock(2)).toBe(true);
  });

  it('lets the clock run again on the closing step', () => {
    expect(tutorialFreezesClock(TUTORIAL_STEPS.length - 1)).toBe(false);
  });
});

describe('TUTORIAL_STEPS', () => {
  it('ends with a step that needs no event', () => {
    expect(TUTORIAL_STEPS.at(-1).advanceOn).toBeNull();
  });

  it('gives every non-final step something to wait for', () => {
    for (const step of TUTORIAL_STEPS.slice(0, -1)) {
      expect(step.advanceOn, `${step.id} has no advanceOn`).toBeTruthy();
    }
  });
});

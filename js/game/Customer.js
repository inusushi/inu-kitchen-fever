import { clamp } from '../utils/helpers.js';

let nextId = 1;

export class Customer {
  constructor(recipe, patienceMs) {
    this.id = nextId++;
    this.recipe = recipe;
    this.patienceMs = patienceMs;
    this.remaining = patienceMs;
    this.state = 'waiting'; // waiting | served | left
  }

  update(dt) {
    if (this.state !== 'waiting') return;
    this.remaining -= dt;
    if (this.remaining <= 0) {
      this.remaining = 0;
      this.state = 'left';
    }
  }

  patienceRatio() {
    return clamp(this.remaining / this.patienceMs, 0, 1);
  }
}

import { clamp } from '../utils/helpers.js';

let nextId = 1;

export class Customer {
  // Un cliente puede pedir varios platillos. Se guardan por índice (no por id)
  // para que pedir dos veces lo mismo funcione sin ambigüedad.
  constructor(recipes, patienceMs) {
    this.id = nextId++;
    this.recipes = Array.isArray(recipes) ? recipes : [recipes];
    this.delivered = new Set();
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

  pendingRecipes() {
    return this.recipes.filter((_, i) => !this.delivered.has(i));
  }

  // Marca como entregado el primer platillo pendiente que coincida.
  // Devuelve true si quedó completo el pedido.
  deliver(recipeId) {
    const index = this.recipes.findIndex((r, i) => !this.delivered.has(i) && r.id === recipeId);
    if (index === -1) return false;
    this.delivered.add(index);
    return this.isComplete();
  }

  isComplete() {
    return this.delivered.size === this.recipes.length;
  }

  totalPrice() {
    return this.recipes.reduce((sum, r) => sum + r.price, 0);
  }
}

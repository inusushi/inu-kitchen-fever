export class Plate {
  constructor(recipe) {
    this.recipe = recipe;
    this.stepIndex = 0;
    this.state = 'prepping'; // prepping | ready
    this.atStation = false;
  }

  currentStep() {
    return this.recipe.steps[this.stepIndex];
  }

  advance() {
    this.stepIndex += 1;
    this.atStation = false;
    if (this.stepIndex >= this.recipe.steps.length) {
      this.state = 'ready';
    }
  }
}

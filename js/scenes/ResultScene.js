import { el, addTap } from '../utils/helpers.js';
import { LEVELS } from '../data/levels.js';
import { LevelSelectScene } from './LevelSelectScene.js';
import { KitchenScene } from './KitchenScene.js';

export class ResultScene {
  constructor(app, params) {
    this.app = app;
    this.params = params;
  }

  mount(root) {
    const { levelIndex, coinsEarned, stars, served, left } = this.params;
    const level = LEVELS[levelIndex];
    this.app.save.addCoins(coinsEarned);
    this.app.save.registerLevelResult(levelIndex, stars);

    const wrap = el('div', 'screen result-screen');
    wrap.append(el('div', 'result-emoji', stars > 0 ? '🎉' : '😕'));
    wrap.append(el('h2', 'result-title', stars > 0 ? '¡Nivel superado!' : 'Nivel no superado'));
    wrap.append(el('div', 'result-stars', '⭐'.repeat(stars).padEnd(3, '☆')));
    wrap.append(el('div', 'result-line', `Platillos servidos: ${served}`));
    wrap.append(el('div', 'result-line', `Clientes perdidos: ${left}`));
    wrap.append(el('div', 'result-coins', `+💰 ${coinsEarned}`));

    const retryBtn = el('button', 'btn btn-primary btn-big', '🔁 Reintentar');
    addTap(retryBtn, () => this.app.goTo(KitchenScene, { levelIndex }));
    wrap.append(retryBtn);

    const nextIndex = levelIndex + 1;
    if (stars > 0 && nextIndex < LEVELS.length) {
      const nextBtn = el('button', 'btn btn-secondary btn-big', `➡ Siguiente: ${LEVELS[nextIndex].name}`);
      addTap(nextBtn, () => this.app.goTo(KitchenScene, { levelIndex: nextIndex }));
      wrap.append(nextBtn);
    }

    const backBtn = el('button', 'btn btn-ghost', 'Volver a niveles');
    addTap(backBtn, () => this.app.goTo(LevelSelectScene));
    wrap.append(backBtn);

    root.append(wrap);
  }

  unmount() {}
}

import { el, addTap } from '../utils/helpers.js';
import { UPGRADES, upgradeCost } from '../data/upgrades.js';
import { LevelSelectScene } from './LevelSelectScene.js';

export class ShopScene {
  constructor(app) {
    this.app = app;
  }

  mount(root) {
    this.root = root;
    this.render();
  }

  render() {
    this.root.innerHTML = '';
    const wrap = el('div', 'screen shop-screen');

    const header = el('div', 'top-bar');
    const backBtn = el('button', 'btn btn-icon', '←');
    addTap(backBtn, () => this.app.goTo(LevelSelectScene));
    const heading = el('h2', 'top-bar-title', 'Tienda de mejoras');
    const coinsBadge = el('div', 'coins-badge', `💰 ${this.app.save.state.coins}`);
    header.append(backBtn, heading, coinsBadge);

    const list = el('div', 'upgrade-list');
    UPGRADES.forEach((upgrade) => {
      const owned = this.app.save.upgradeLevel(upgrade.id);
      const maxed = owned >= upgrade.maxLevel;
      const cost = maxed ? null : upgradeCost(upgrade, owned);

      const card = el('div', 'upgrade-card');
      const emoji = el('div', 'upgrade-emoji', upgrade.emoji);
      const info = el('div', 'upgrade-info');
      info.append(
        el('div', 'upgrade-name', upgrade.name),
        el('div', 'upgrade-desc', upgrade.desc),
        el('div', 'upgrade-level', `Nivel ${owned}/${upgrade.maxLevel}`),
      );

      const actionBtn = el('button', 'btn btn-primary', maxed ? 'Máximo' : `Comprar 💰${cost}`);
      if (maxed || this.app.save.state.coins < cost) actionBtn.disabled = true;
      if (!maxed) {
        addTap(actionBtn, () => {
          if (this.app.save.buyUpgrade(upgrade.id, cost)) {
            this.app.audio.purchase();
            this.app.cloud.scheduleAutoPush();
            this.render();
          }
        });
      }

      card.append(emoji, info, actionBtn);
      list.append(card);
    });

    wrap.append(header, list);
    this.root.append(wrap);
  }

  unmount() {}
}

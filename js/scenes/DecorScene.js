import { el, addTap } from '../utils/helpers.js';
import { DECORATIONS } from '../data/decorations.js';
import { LevelSelectScene } from './LevelSelectScene.js';

export class DecorScene {
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
    const heading = el('h2', 'top-bar-title', '🎨 Decorar la cocina');
    const coinsBadge = el('div', 'coins-badge', `💰 ${this.app.save.state.coins}`);
    header.append(backBtn, heading, coinsBadge);

    wrap.append(header, el('p', 'cloud-note', 'Cada decoración da monedas fijas extra por platillo servido, además de cambiar el aspecto de la cocina.'));

    const list = el('div', 'upgrade-list');
    const equipped = this.app.save.state.decorations.equipped;

    DECORATIONS.forEach((decor) => {
      const owned = this.app.save.ownsDecoration(decor.id);
      const isEquipped = equipped === decor.id;

      const card = el('div', `upgrade-card${isEquipped ? ' equipped' : ''}`);
      const emoji = el('div', 'upgrade-emoji', decor.emoji);
      const info = el('div', 'upgrade-info');
      info.append(
        el('div', 'upgrade-name', decor.name),
        el('div', 'upgrade-desc', decor.desc),
      );
      if (isEquipped) info.append(el('div', 'upgrade-level', '✅ Equipada'));
      card.append(emoji, info);

      if (decor.id === 'none' || owned) {
        const equipBtn = el('button', 'btn btn-secondary', isEquipped ? 'Equipada' : 'Equipar');
        equipBtn.disabled = isEquipped;
        addTap(equipBtn, () => {
          this.app.save.equipDecoration(decor.id);
          this.app.audio.tap();
          this.render();
        });
        card.append(equipBtn);
      } else {
        const buyBtn = el('button', 'btn btn-primary', `Comprar 💰${decor.cost}`);
        buyBtn.disabled = this.app.save.state.coins < decor.cost;
        addTap(buyBtn, () => {
          if (this.app.save.buyDecoration(decor.id, decor.cost)) {
            this.app.audio.purchase();
            this.app.cloud.scheduleAutoPush();
            this.render();
          }
        });
        card.append(buyBtn);
      }

      list.append(card);
    });

    wrap.append(list);
    this.root.append(wrap);
  }

  unmount() {}
}

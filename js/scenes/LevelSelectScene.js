import { el, addTap } from '../utils/helpers.js';
import { LEVELS } from '../data/levels.js';
import { MenuScene } from './MenuScene.js';
import { ShopScene } from './ShopScene.js';
import { KitchenScene } from './KitchenScene.js';
import { LeaderboardScene } from './LeaderboardScene.js';
import { DecorScene } from './DecorScene.js';
import { CouponScene } from './CouponScene.js';
import { isCouponValid } from '../game/coupon.js';

export class LevelSelectScene {
  constructor(app) {
    this.app = app;
  }

  mount(root) {
    const wrap = el('div', 'screen level-screen');

    const header = el('div', 'top-bar');
    const backBtn = el('button', 'btn btn-icon', '←');
    addTap(backBtn, () => this.app.goTo(MenuScene));
    const heading = el('h2', 'top-bar-title', 'Elige un nivel');
    const coinsBadge = el('div', 'coins-badge', `💰 ${this.app.save.state.coins}`);
    header.append(backBtn, heading, coinsBadge);

    const list = el('div', 'level-list');
    LEVELS.forEach((level, index) => {
      const unlocked = index <= this.app.save.state.unlockedLevelIndex;
      const stars = this.app.save.state.levelStars[index] || 0;

      const card = el('button', `level-card${unlocked ? '' : ' locked'}`);
      const emoji = el('div', 'level-card-emoji', level.emoji);
      const name = el('div', 'level-card-name', level.name);
      const starsRow = el('div', 'level-card-stars', '⭐'.repeat(stars).padEnd(3, '☆'));
      card.append(emoji, name, unlocked ? starsRow : el('div', 'level-card-lock', '🔒'));

      if (unlocked) {
        addTap(card, () => this.app.goTo(KitchenScene, { levelIndex: index }));
      }
      list.append(card);
    });

    const shopBtn = el('button', 'btn btn-secondary', '🛒 Tienda de mejoras');
    addTap(shopBtn, () => this.app.goTo(ShopScene));

    const decorBtn = el('button', 'btn btn-secondary', '🎨 Decorar cocina');
    addTap(decorBtn, () => this.app.goTo(DecorScene));

    wrap.append(header, list, shopBtn, decorBtn);

    if (this.app.leaderboard.configured) {
      const lbBtn = el('button', 'btn btn-secondary', '🏆 Mejores marcas');
      addTap(lbBtn, () => this.app.goTo(LeaderboardScene));
      wrap.append(lbBtn);
    }

    const { code, unlockedAt } = this.app.save.state.coupon;
    if (code && isCouponValid(unlockedAt)) {
      const couponBtn = el('button', 'btn btn-order', '🎟️ Mi cupón');
      addTap(couponBtn, () => this.app.goTo(CouponScene));
      wrap.append(couponBtn);
    }

    root.append(wrap);
  }

  unmount() {}
}

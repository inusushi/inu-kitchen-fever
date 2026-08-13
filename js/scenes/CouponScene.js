import { el, addTap, linkButton } from '../utils/helpers.js';
import { COUPON, isCouponValid, daysLeft } from '../game/coupon.js';
import { whatsappOrderUrl } from '../data/contact.js';
import { LevelSelectScene } from './LevelSelectScene.js';

export class CouponScene {
  constructor(app) {
    this.app = app;
  }

  mount(root) {
    const { code, unlockedAt } = this.app.save.state.coupon;
    const wrap = el('div', 'screen cloud-screen');

    const header = el('div', 'top-bar');
    const backBtn = el('button', 'btn btn-icon', '←');
    addTap(backBtn, () => this.app.goTo(LevelSelectScene));
    header.append(backBtn, el('h2', 'top-bar-title', '🎟️ Tu cupón'));
    wrap.append(header);

    if (!code) {
      wrap.append(el('p', 'cloud-note', 'Todavía no lo desbloqueas. Consigue 3 estrellas en los 8 niveles para ganarlo.'));
      root.append(wrap);
      return;
    }

    const vigente = isCouponValid(unlockedAt);
    const dias = daysLeft(unlockedAt);

    wrap.append(el('div', 'sync-code-box', code));
    wrap.append(el('div', 'result-coins', `${COUPON.discountPercent}% de descuento`));
    wrap.append(el('div', 'result-line', `Mínimo de compra: $${COUPON.minPurchase}`));
    wrap.append(el('div', 'result-line', `Solo aplica en: ${COUPON.channel}`));
    wrap.append(
      el(
        'div',
        `result-line${vigente ? '' : ' coupon-expired'}`,
        vigente ? `Vigente por ${dias} día${dias === 1 ? '' : 's'} más` : 'Ya venció — sigue jugando, otra vez lo ganas',
      ),
    );

    if (vigente) {
      const msg = `¡Hola Inu Sushi! 🍣 Completé Inu Kitchen Fever con 3 estrellas en todo y quiero usar mi cupón ${code}: ${COUPON.discountPercent}% de descuento (mínimo $${COUPON.minPurchase}, solo ${COUPON.channel.toLowerCase()}).`;
      const redeemBtn = linkButton('btn btn-order', '🍣 Usar mi cupón por WhatsApp', whatsappOrderUrl(msg));
      redeemBtn.addEventListener('click', () => this.app.audio.tap());
      wrap.append(redeemBtn);
    }

    root.append(wrap);
  }

  unmount() {}
}

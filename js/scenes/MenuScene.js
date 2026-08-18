import { el, addTap, linkButton } from '../utils/helpers.js';
import { LevelSelectScene } from './LevelSelectScene.js';
import { CloudScene } from './CloudScene.js';
import { todayKey, dailyChallengeFor } from '../game/objectives.js';
import { whatsappOrderUrl } from '../data/contact.js';
import { applyDailyStreak } from '../game/streak.js';
import { activeEventFor } from '../data/events.js';
import { applyA11ySettings } from '../core/accessibility.js';

export class MenuScene {
  constructor(app) {
    this.app = app;
  }

  mount(root) {
    const wrap = el('div', 'screen menu-screen');

    const muteBtn = el('button', 'btn btn-icon mute-btn', this.app.audio.muted ? '🔇' : '🔊');
    addTap(muteBtn, () => {
      const muted = this.app.audio.toggleMute();
      muteBtn.textContent = muted ? '🔇' : '🔊';
    });

    const a11yBar = el('div', 'a11y-bar');
    const colorblindBtn = el('button', 'btn btn-icon a11y-btn', '👁️');
    colorblindBtn.title = 'Modo daltónico';
    colorblindBtn.classList.toggle('active', !!this.app.save.state.settings.colorblind);
    addTap(colorblindBtn, () => {
      const on = this.app.save.toggleSetting('colorblind');
      applyA11ySettings(this.app.save.state.settings);
      colorblindBtn.classList.toggle('active', on);
      this.app.audio.tap();
    });

    const largeTextBtn = el('button', 'btn btn-icon a11y-btn', '🔠');
    largeTextBtn.title = 'Texto más grande';
    largeTextBtn.classList.toggle('active', !!this.app.save.state.settings.largeText);
    addTap(largeTextBtn, () => {
      const on = this.app.save.toggleSetting('largeText');
      applyA11ySettings(this.app.save.state.settings);
      largeTextBtn.classList.toggle('active', on);
      this.app.audio.tap();
    });
    a11yBar.append(colorblindBtn, largeTextBtn);

    const logo = document.createElement('img');
    logo.className = 'menu-logo';
    logo.src = 'fotos/logo-inu-sushi.png';
    logo.alt = 'Inu Sushi';
    logo.addEventListener('error', () => logo.remove(), { once: true });

    const title = el('h1', 'game-title', 'Inu Kitchen Fever');
    const subtitle = el('p', 'game-subtitle', 'El menú real de Inu Sushi: onigiri, rollos, bento, banderillas y Mushipan.');

    const dateKey = todayKey();
    const streakResult = this.app.save.applyDailyStreak(applyDailyStreak, dateKey);
    if (streakResult.rewarded) this.app.audio.purchase();

    const coinsBadge = el('div', 'coins-badge', `💰 ${this.app.save.state.coins}`);

    const streakCard = el('div', 'daily-card streak-card');
    streakCard.append(el('div', 'daily-card-title', '🔥 Racha de días'));
    streakCard.append(el('div', 'daily-card-label', `${this.app.save.state.streak.current} día${this.app.save.state.streak.current === 1 ? '' : 's'} seguidos`));
    streakCard.append(
      el(
        'div',
        'daily-card-progress',
        streakResult.rewarded ? `¡Bono de hoy! +💰${streakResult.reward}` : 'Vuelve mañana para seguir la racha',
      ),
    );
    const challenge = dailyChallengeFor(dateKey);
    const daily = this.app.save.dailyState(dateKey);
    const dailyCard = el('div', 'daily-card');
    dailyCard.append(el('div', 'daily-card-title', '🗓️ Desafío de hoy'));
    dailyCard.append(el('div', 'daily-card-label', challenge.label));
    dailyCard.append(
      el(
        'div',
        'daily-card-progress',
        daily.rewarded ? '✅ Completado' : `${Math.min(daily.progress, challenge.goal)} / ${challenge.goal} · 💰${challenge.reward}`,
      ),
    );

    const event = activeEventFor(dateKey);
    const eventCard = event ? el('div', 'daily-card event-card') : null;
    if (eventCard) {
      eventCard.append(el('div', 'daily-card-title', `${event.emoji} ${event.name}`));
      eventCard.append(el('div', 'daily-card-label', event.message));
      eventCard.append(el('div', 'daily-card-progress', `+${Math.round((event.coinMultiplier - 1) * 100)}% monedas en todos los niveles`));
    }

    const playBtn = el('button', 'btn btn-primary btn-big', '▶ Jugar');
    addTap(playBtn, () => {
      this.app.audio.tap();
      this.app.goTo(LevelSelectScene);
    });

    const orderBtn = linkButton(
      'btn btn-order',
      '🍣 Pide de verdad por WhatsApp',
      whatsappOrderUrl('¡Hola Inu Sushi! 🍣 Jugué Inu Kitchen Fever y ya se me antojó — quiero pedir.'),
    );
    orderBtn.addEventListener('click', () => this.app.audio.tap());

    const cloudBtn = el('button', 'btn btn-secondary', '☁ Guardado en la nube');
    addTap(cloudBtn, () => this.app.goTo(CloudScene));

    // Exploración aparte, no conectada al juego — de baja prioridad visual
    // a propósito, para no confundir a alguien que solo quiere jugar.
    const threeDBtn = linkButton('btn btn-ghost', '🧊 Prueba 3D (experimental)', 'three-demo.html');
    threeDBtn.addEventListener('click', () => this.app.audio.tap());

    const resetBtn = el('button', 'btn btn-ghost', 'Reiniciar progreso');
    addTap(resetBtn, () => {
      if (confirm('¿Borrar todo tu progreso guardado?')) {
        this.app.save.reset();
        this.app.goTo(MenuScene);
      }
    });

    wrap.append(muteBtn, a11yBar, logo, title, subtitle, coinsBadge, streakCard, dailyCard);
    if (eventCard) wrap.append(eventCard);
    wrap.append(playBtn, orderBtn, cloudBtn, threeDBtn, resetBtn);
    root.append(wrap);
  }

  unmount() {}
}

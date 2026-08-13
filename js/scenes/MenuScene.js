import { el, addTap } from '../utils/helpers.js';
import { LevelSelectScene } from './LevelSelectScene.js';
import { CloudScene } from './CloudScene.js';
import { todayKey, dailyChallengeFor } from '../game/objectives.js';

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

    const logo = document.createElement('img');
    logo.className = 'menu-logo';
    logo.src = 'fotos/logo-inu-sushi.png';
    logo.alt = 'Inu Sushi';
    logo.addEventListener('error', () => logo.remove(), { once: true });

    const title = el('h1', 'game-title', 'Inu Kitchen Fever');
    const subtitle = el('p', 'game-subtitle', 'El menú real de Inu Sushi: onigiri, rollos, bento, banderillas y Mushipan.');

    const coinsBadge = el('div', 'coins-badge', `💰 ${this.app.save.state.coins}`);

    const dateKey = todayKey();
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

    const playBtn = el('button', 'btn btn-primary btn-big', '▶ Jugar');
    addTap(playBtn, () => {
      this.app.audio.tap();
      this.app.goTo(LevelSelectScene);
    });

    const cloudBtn = el('button', 'btn btn-secondary', '☁ Guardado en la nube');
    addTap(cloudBtn, () => this.app.goTo(CloudScene));

    const resetBtn = el('button', 'btn btn-ghost', 'Reiniciar progreso');
    addTap(resetBtn, () => {
      if (confirm('¿Borrar todo tu progreso guardado?')) {
        this.app.save.reset();
        this.app.goTo(MenuScene);
      }
    });

    wrap.append(muteBtn, logo, title, subtitle, coinsBadge, dailyCard, playBtn, cloudBtn, resetBtn);
    root.append(wrap);
  }

  unmount() {}
}

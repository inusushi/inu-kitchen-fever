import { el, addTap, linkButton } from '../utils/helpers.js';
import { LEVELS } from '../data/levels.js';
import { whatsappOrderUrl } from '../data/contact.js';
import { LevelSelectScene } from './LevelSelectScene.js';
import { KitchenScene } from './KitchenScene.js';
import { LeaderboardScene } from './LeaderboardScene.js';
import { sanitizeNickname, isValidNickname, NICKNAME_MAX } from '../game/nickname.js';
import {
  evaluateObjectives,
  todayKey,
  dailyChallengeFor,
  dailyProgressFrom,
  mergeDailyProgress,
} from '../game/objectives.js';

export class ResultScene {
  constructor(app, params) {
    this.app = app;
    this.params = params;
  }

  mount(root) {
    const { levelIndex, coinsEarned, stars, served, left, bestCombo = 0, burnt = 0 } = this.params;
    const result = { coinsEarned, served, left, bestCombo };
    this.app.save.addCoins(coinsEarned);
    this.app.save.registerLevelResult(levelIndex, stars);
    if (stars > 0) this.app.audio.levelComplete(stars);
    else this.app.audio.levelFailed();

    const objectives = evaluateObjectives(result);
    const nuevos = this.app.save.recordObjectives(levelIndex, objectives);

    const dateKey = todayKey();
    const challenge = dailyChallengeFor(dateKey);
    const previo = this.app.save.dailyState(dateKey).progress;
    const aporte = dailyProgressFrom(challenge, result);
    const daily = this.app.save.applyDailyProgress(
      dateKey,
      challenge,
      mergeDailyProgress(challenge, previo, aporte),
    );

    this.app.cloud.scheduleAutoPush();

    const wrap = el('div', 'screen result-screen');
    wrap.append(el('div', 'result-emoji', stars > 0 ? '🎉' : '😕'));
    wrap.append(el('h2', 'result-title', stars > 0 ? '¡Nivel superado!' : 'Nivel no superado'));
    wrap.append(el('div', 'result-stars', '⭐'.repeat(stars).padEnd(3, '☆')));
    wrap.append(el('div', 'result-line', `Platillos servidos: ${served}`));
    wrap.append(el('div', 'result-line', `Clientes perdidos: ${left}`));
    if (burnt > 0) wrap.append(el('div', 'result-line', `Platillos quemados: ${burnt}`));
    if (bestCombo >= 2) wrap.append(el('div', 'result-line', `Mejor combo: 🔥 x${bestCombo}`));
    wrap.append(el('div', 'result-coins', `+💰 ${coinsEarned}`));

    // Objetivos del nivel
    const objBox = el('div', 'objectives-box');
    objBox.append(el('div', 'objectives-title', 'Objetivos del nivel'));
    const yaLogrados = this.app.save.objectivesDone(levelIndex);
    objectives.forEach((o) => {
      const logrado = o.done || yaLogrados.includes(o.id);
      const row = el('div', `objective-row${logrado ? ' done' : ''}`);
      row.append(el('span', 'objective-check', logrado ? '✅' : '⬜'));
      row.append(el('span', 'objective-label', o.label));
      if (nuevos.includes(o.id)) row.append(el('span', 'objective-new', '¡NUEVO!'));
      objBox.append(row);
    });
    wrap.append(objBox);

    // Desafío diario
    const dailyBox = el('div', 'daily-box');
    dailyBox.append(el('div', 'objectives-title', '🗓️ Desafío de hoy'));
    dailyBox.append(el('div', 'daily-label', challenge.label));
    const pct = Math.min(100, (daily.progress / challenge.goal) * 100);
    const dbar = el('div', 'daily-bar');
    const dfill = el('div', 'daily-bar-fill');
    dfill.style.width = `${pct}%`;
    dbar.append(dfill);
    dailyBox.append(dbar);
    dailyBox.append(
      el(
        'div',
        'daily-progress',
        daily.justCompleted
          ? `¡Completado! +💰 ${daily.reward}`
          : `${Math.min(daily.progress, challenge.goal)} / ${challenge.goal}`,
      ),
    );
    if (daily.justCompleted) this.app.audio.purchase();
    wrap.append(dailyBox);

    if (stars > 0) {
      const level = LEVELS[levelIndex];
      const orderBtn = linkButton(
        'btn btn-order',
        `🍣 Antójate y pide ${level.name} de verdad`,
        whatsappOrderUrl(`¡Hola Inu Sushi! 🍣 Acabo de jugar el nivel de ${level.name} en Inu Kitchen Fever y quiero pedirlo de verdad.`),
      );
      orderBtn.addEventListener('click', () => this.app.audio.tap());
      wrap.append(orderBtn);
    }

    if (this.app.leaderboard.configured && stars > 0) {
      wrap.append(this.buildLeaderboardBox(levelIndex, coinsEarned, stars));
    }

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

  // Publicar es opcional y explícito: el apodo queda visible para todos, así
  // que nunca se envía nada sin que el jugador toque el botón.
  buildLeaderboardBox(levelIndex, coinsEarned, stars) {
    const box = el('div', 'leaderboard-box');
    box.append(el('div', 'objectives-title', '🏆 Ranking global'));

    const input = el('input', 'sync-code-input nickname-input');
    input.placeholder = 'Tu apodo';
    input.maxLength = NICKNAME_MAX;
    input.value = this.app.save.state.nickname || '';

    const status = el('div', 'cloud-status');
    const sendBtn = el('button', 'btn btn-secondary', '📤 Publicar mi marca');

    addTap(sendBtn, async () => {
      if (!isValidNickname(input.value)) {
        status.textContent = 'Escribe un apodo de al menos 2 letras.';
        return;
      }
      const nickname = sanitizeNickname(input.value);
      this.app.save.setNickname(nickname);
      sendBtn.disabled = true;
      status.textContent = 'Publicando…';
      const res = await this.app.leaderboard.submit({
        levelId: LEVELS[levelIndex].id,
        nickname,
        coins: coinsEarned,
        stars,
      });
      if (res.ok) {
        status.textContent = '¡Marca publicada! 🎉';
        sendBtn.textContent = '✅ Publicada';
      } else {
        status.textContent = `No se pudo publicar: ${res.reason}`;
        sendBtn.disabled = false;
      }
    });

    const viewBtn = el('button', 'btn btn-ghost btn-small', 'Ver ranking');
    addTap(viewBtn, () => this.app.goTo(LeaderboardScene, { levelIndex }));

    box.append(el('div', 'lb-note', 'Tu apodo será visible para otros jugadores.'), input, sendBtn, status, viewBtn);
    return box;
  }

  unmount() {}
}

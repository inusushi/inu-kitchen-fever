const KEY = 'cocinaFeverSave_v1';

function defaultState() {
  return {
    coins: 0,
    unlockedLevelIndex: 0,
    levelStars: {},
    upgrades: { speed: 0, slot: 0, patience: 0, tip: 0, extraChop: 0, extraCook: 0 },
    settings: { muted: false, colorblind: false, largeText: false },
    tutorialDone: false,
    levelObjectives: {},
    daily: { date: null, progress: 0, rewarded: false },
    decorations: { owned: ['none'], equipped: 'none' },
    coupon: { code: null, unlockedAt: null },
    streak: { lastDate: null, current: 0 },
    nickname: '',
    syncCode: null,
  };
}

export class SaveManager {
  constructor() {
    this.state = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return {
        ...defaultState(),
        ...parsed,
        upgrades: { ...defaultState().upgrades, ...parsed.upgrades },
        settings: { ...defaultState().settings, ...parsed.settings },
        daily: { ...defaultState().daily, ...parsed.daily },
        decorations: { ...defaultState().decorations, ...parsed.decorations },
        coupon: { ...defaultState().coupon, ...parsed.coupon },
        streak: { ...defaultState().streak, ...parsed.streak },
      };
    } catch {
      return defaultState();
    }
  }

  persist() {
    localStorage.setItem(KEY, JSON.stringify(this.state));
  }

  addCoins(amount) {
    this.state.coins += amount;
    this.persist();
  }

  spendCoins(amount) {
    if (this.state.coins < amount) return false;
    this.state.coins -= amount;
    this.persist();
    return true;
  }

  registerLevelResult(levelIndex, stars) {
    const best = Math.max(this.state.levelStars[levelIndex] || 0, stars);
    this.state.levelStars[levelIndex] = best;
    if (stars > 0 && levelIndex + 1 > this.state.unlockedLevelIndex) {
      this.state.unlockedLevelIndex = levelIndex + 1;
    }
    this.persist();
  }

  upgradeLevel(id) {
    return this.state.upgrades[id] || 0;
  }

  // Guarda los objetivos recién cumplidos y devuelve solo los nuevos, para
  // poder festejarlos sin repetir los de partidas anteriores.
  recordObjectives(levelIndex, objectives) {
    const already = this.state.levelObjectives[levelIndex] || [];
    const fresh = objectives.filter((o) => o.done && !already.includes(o.id)).map((o) => o.id);
    if (fresh.length) {
      this.state.levelObjectives[levelIndex] = [...already, ...fresh];
      this.persist();
    }
    return fresh;
  }

  objectivesDone(levelIndex) {
    return this.state.levelObjectives[levelIndex] || [];
  }

  // Al cambiar el día, el progreso del reto se reinicia solo.
  dailyState(dateKey) {
    if (this.state.daily.date !== dateKey) {
      this.state.daily = { date: dateKey, progress: 0, rewarded: false };
      this.persist();
    }
    return this.state.daily;
  }

  // Devuelve { progress, justCompleted, reward } tras aplicar una partida.
  applyDailyProgress(dateKey, challenge, newProgress) {
    const daily = this.dailyState(dateKey);
    daily.progress = newProgress;
    let justCompleted = false;
    if (!daily.rewarded && newProgress >= challenge.goal) {
      daily.rewarded = true;
      justCompleted = true;
      this.state.coins += challenge.reward;
    }
    this.persist();
    return { progress: daily.progress, justCompleted, reward: justCompleted ? challenge.reward : 0 };
  }

  // Se llama una vez al entrar al menú. Aplica el avance de racha y, si
  // corresponde, paga la recompensa del día.
  applyDailyStreak(applyFn, dateKey) {
    const result = applyFn(this.state.streak, dateKey);
    if (result.isNewDay) {
      this.state.streak = result.streak;
      if (result.rewarded) this.state.coins += result.reward;
      this.persist();
    }
    return result;
  }

  toggleSetting(key) {
    this.state.settings[key] = !this.state.settings[key];
    this.persist();
    return this.state.settings[key];
  }

  setNickname(nickname) {
    this.state.nickname = nickname;
    this.persist();
  }

  markTutorialDone() {
    if (this.state.tutorialDone) return;
    this.state.tutorialDone = true;
    this.persist();
  }

  // Se llama tras cada resultado de nivel. Solo la primera vez que se
  // cumple la condición se genera el código y arranca la vigencia.
  maybeUnlockCoupon(codeFactory) {
    if (this.state.coupon.unlockedAt) return false;
    this.state.coupon = { code: codeFactory(), unlockedAt: Date.now() };
    this.persist();
    return true;
  }

  ownsDecoration(id) {
    return this.state.decorations.owned.includes(id);
  }

  buyDecoration(id, cost) {
    if (this.ownsDecoration(id)) return false;
    if (!this.spendCoins(cost)) return false;
    this.state.decorations.owned.push(id);
    this.persist();
    return true;
  }

  equipDecoration(id) {
    if (!this.ownsDecoration(id)) return false;
    this.state.decorations.equipped = id;
    this.persist();
    return true;
  }

  buyUpgrade(id, cost) {
    if (!this.spendCoins(cost)) return false;
    this.state.upgrades[id] = (this.state.upgrades[id] || 0) + 1;
    this.persist();
    return true;
  }

  reset() {
    this.state = defaultState();
    this.persist();
  }

  getOrCreateSyncCode() {
    if (!this.state.syncCode) {
      this.state.syncCode = generateSyncCode();
      this.persist();
    }
    return this.state.syncCode;
  }

  setSyncCode(code) {
    this.state.syncCode = code;
    this.persist();
  }

  replaceProgress(data) {
    const defaults = defaultState();
    this.state = {
      ...defaults,
      ...data,
      upgrades: { ...defaults.upgrades, ...data.upgrades },
      settings: { ...defaults.settings, ...data.settings },
      decorations: { ...defaults.decorations, ...data.decorations },
      coupon: { ...defaults.coupon, ...data.coupon },
      syncCode: this.state.syncCode,
    };
    this.persist();
  }
}

function generateSyncCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) out += '-';
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

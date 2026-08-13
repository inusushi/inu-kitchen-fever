const KEY = 'cocinaFeverSave_v1';

function defaultState() {
  return {
    coins: 0,
    unlockedLevelIndex: 0,
    levelStars: {},
    upgrades: { speed: 0, slot: 0, patience: 0, tip: 0, extraChop: 0, extraCook: 0 },
    settings: { muted: false },
    tutorialDone: false,
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

  markTutorialDone() {
    if (this.state.tutorialDone) return;
    this.state.tutorialDone = true;
    this.persist();
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

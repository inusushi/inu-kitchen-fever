const KEY = 'cocinaFeverSave_v1';

function defaultState() {
  return {
    coins: 0,
    unlockedLevelIndex: 0,
    levelStars: {},
    upgrades: { speed: 0, slot: 0, patience: 0, tip: 0 },
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
      return { ...defaultState(), ...parsed, upgrades: { ...defaultState().upgrades, ...parsed.upgrades } };
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
}

import { el, addTap, formatTime, randRange, clamp } from '../utils/helpers.js';
import { LEVELS } from '../data/levels.js';
import { RECIPES, STATION_TYPES } from '../data/recipes.js';
import { Customer } from '../game/Customer.js';
import { Plate } from '../game/Plate.js';
import { Station } from '../game/Station.js';
import { spawnOrderRecipe } from '../game/Order.js';
import { LevelSelectScene } from './LevelSelectScene.js';
import { ResultScene } from './ResultScene.js';

export class KitchenScene {
  constructor(app, params) {
    this.app = app;
    this.levelIndex = params.levelIndex;
    this.level = LEVELS[this.levelIndex];
  }

  mount(root) {
    const save = this.app.save;
    const speedLevel = save.upgradeLevel('speed');
    const slotLevel = save.upgradeLevel('slot');
    const patienceLevel = save.upgradeLevel('patience');
    const tipLevel = save.upgradeLevel('tip');

    this.speedMultiplier = 1 - speedLevel * 0.1;
    this.tipMultiplier = 1 + tipLevel * 0.1;
    this.patienceMs = this.level.patience * (1 + patienceLevel * 0.2);
    this.slotCount = 2 + slotLevel;

    this.timeLeft = this.level.duration;
    this.coinsEarned = 0;
    this.served = 0;
    this.left = 0;
    this.combo = 0;
    this.ended = false;

    this.customers = [];
    this.slots = Array.from({ length: this.slotCount }, () => ({ plate: null }));
    this.stations = STATION_TYPES.map((s) => new Station(s.type, s.name, s.emoji));
    this.nextSpawnIn = 800;

    this.buildDom(root);
    this.renderStatic();
  }

  buildDom(root) {
    const wrap = el('div', 'screen kitchen-screen');

    const header = el('div', 'top-bar');
    const backBtn = el('button', 'btn btn-icon', '←');
    addTap(backBtn, () => {
      if (confirm('¿Salir del nivel? Perderás el progreso de este intento.')) {
        this.app.goTo(LevelSelectScene);
      }
    });
    const muteBtn = el('button', 'btn btn-icon', this.app.audio.muted ? '🔇' : '🔊');
    addTap(muteBtn, () => {
      muteBtn.textContent = this.app.audio.toggleMute() ? '🔇' : '🔊';
    });
    this.comboEl = el('div', 'combo-badge hidden', '');
    this.coinsEl = el('div', 'coins-badge', `💰 ${this.coinsEarned}`);
    this.timerEl = el('div', 'timer-badge', formatTime(this.timeLeft));
    header.append(backBtn, el('h2', 'top-bar-title', `${this.level.emoji} ${this.level.name}`), this.comboEl, this.timerEl, this.coinsEl, muteBtn);

    this.customersRow = el('div', 'customers-row');
    this.slotsRow = el('div', 'slots-row');
    this.stationsRow = el('div', 'stations-row');

    this.customerViews = new Map();
    this.slotViews = [];
    this.stationViews = [];

    wrap.append(header, this.customersRow, el('div', 'section-label', 'Mesas de preparación'), this.slotsRow, el('div', 'section-label', 'Estaciones'), this.stationsRow);
    root.append(wrap);
    this.wrap = wrap;
  }

  renderStatic() {
    this.slots.forEach((slot, index) => {
      const view = this.buildSlotView(index);
      this.slotViews.push(view);
      this.slotsRow.append(view.node);
    });

    this.stations.forEach((station, index) => {
      const view = this.buildStationView(station);
      this.stationViews.push(view);
      this.stationsRow.append(view.node);
    });
  }

  buildSlotView(index) {
    const node = el('div', 'plate-slot empty');
    const pickerBtn = el('button', 'slot-empty-hint', '+ Nuevo plato');
    addTap(pickerBtn, () => this.openRecipePicker(index));
    node.append(pickerBtn);
    return { node, pickerBtn, recipeButtons: [] };
  }

  buildStationView(station) {
    const node = el('button', 'station');
    const emoji = el('div', 'station-emoji', station.emoji);
    const name = el('div', 'station-name', station.name);
    const bar = el('div', 'station-bar');
    const fill = el('div', 'station-bar-fill');
    bar.append(fill);
    node.append(emoji, name, bar);
    addTap(node, () => this.onStationTap(station));
    return { node, fill };
  }

  openRecipePicker(slotIndex) {
    const slot = this.slots[slotIndex];
    const view = this.slotViews[slotIndex];
    if (slot.plate) return;
    view.node.innerHTML = '';
    this.level.recipeIds.forEach((id) => {
      const recipe = RECIPES[id];
      const btn = el('button', 'recipe-pick-btn');
      btn.append(el('div', 'recipe-pick-emoji', recipe.emoji), el('div', 'recipe-pick-name', recipe.name));
      addTap(btn, () => {
        slot.plate = new Plate(recipe);
        this.refreshSlot(slotIndex);
      });
      view.node.append(btn);
    });
    const cancelBtn = el('button', 'btn btn-ghost btn-small', 'Cancelar');
    addTap(cancelBtn, () => this.refreshSlot(slotIndex));
    view.node.append(cancelBtn);
  }

  refreshSlot(index) {
    const slot = this.slots[index];
    const view = this.slotViews[index];
    view.node.innerHTML = '';
    if (!slot.plate) {
      view.node.className = 'plate-slot empty';
      const pickerBtn = el('button', 'slot-empty-hint', '+ Nuevo plato');
      addTap(pickerBtn, () => this.openRecipePicker(index));
      view.node.append(pickerBtn);
      return;
    }

    const plate = slot.plate;
    view.node.className = `plate-slot${plate.state === 'ready' ? ' ready' : ''}`;
    const header = el('div', 'plate-header');
    header.append(el('span', 'plate-emoji', plate.recipe.emoji), el('span', 'plate-name', plate.recipe.name));
    view.node.append(header);

    const stepsRow = el('div', 'plate-steps');
    plate.recipe.steps.forEach((step, i) => {
      const stationInfo = STATION_TYPES.find((s) => s.type === step.station);
      const stepEl = el('div', 'plate-step');
      if (i < plate.stepIndex) stepEl.classList.add('done');
      else if (i === plate.stepIndex) stepEl.classList.add('current');
      stepEl.textContent = stationInfo.emoji;
      stepsRow.append(stepEl);
    });
    view.node.append(stepsRow);

    if (plate.state === 'ready') {
      const serveHint = el('div', 'plate-ready-hint', 'Listo — toca a un cliente');
      view.node.append(serveHint);
      const cancelBtn = el('button', 'btn btn-ghost btn-small', 'Quitar');
      addTap(cancelBtn, () => {
        slot.plate = null;
        this.refreshSlot(index);
      });
      view.node.append(cancelBtn);
    } else if (!plate.atStation) {
      const waitHint = el('div', 'plate-wait-hint', 'Toca la estación indicada');
      view.node.append(waitHint);
    } else {
      view.node.append(el('div', 'plate-wait-hint', 'Preparando…'));
    }
  }

  onStationTap(station) {
    if (station.busy) return;
    const slotIndex = this.slots.findIndex(
      (s) => s.plate && s.plate.state === 'prepping' && !s.plate.atStation && s.plate.currentStep().station === station.type,
    );
    if (slotIndex === -1) return;
    const plate = this.slots[slotIndex].plate;
    const duration = Math.max(300, plate.currentStep().duration * this.speedMultiplier);
    station.start(plate, duration);
    this.refreshSlot(slotIndex);
    this.app.audio.tap();
  }

  onCustomerTap(customer) {
    if (customer.state !== 'waiting') return;
    const slotIndex = this.slots.findIndex((s) => s.plate && s.plate.state === 'ready' && s.plate.recipe.id === customer.recipe.id);
    if (slotIndex === -1) {
      const view = this.customerViews.get(customer.id);
      if (view) {
        view.node.classList.add('shake');
        setTimeout(() => view.node.classList.remove('shake'), 300);
      }
      this.app.audio.mismatch();
      return;
    }
    const slot = this.slots[slotIndex];
    const tip = customer.patienceRatio() > 0.5 ? 1.25 : 1;
    const comboBonus = 1 + Math.min(this.combo, 5) * 0.05;
    const coins = Math.round(slot.plate.recipe.price * tip * this.tipMultiplier * comboBonus);
    this.coinsEarned += coins;
    this.served += 1;
    this.combo += 1;
    customer.state = 'served';
    slot.plate = null;
    this.refreshSlot(slotIndex);
    this.spawnCoinPopup(this.customerViews.get(customer.id)?.node, coins);
    this.removeCustomer(customer);
    this.coinsEl.textContent = `💰 ${this.coinsEarned}`;
    this.updateComboBadge();
    this.app.audio.serve(this.combo >= 3);
  }

  spawnCoinPopup(referenceNode, coins) {
    const rect = (referenceNode || this.customersRow).getBoundingClientRect();
    const popup = el('div', 'coin-popup', `+💰${coins}`);
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top}px`;
    document.body.append(popup);
    setTimeout(() => popup.remove(), 900);
  }

  updateComboBadge() {
    if (this.combo >= 2) {
      this.comboEl.textContent = `🔥 x${this.combo}`;
      this.comboEl.classList.remove('hidden');
    } else {
      this.comboEl.classList.add('hidden');
    }
  }

  spawnCustomer() {
    if (this.customers.length >= this.level.maxCustomers) return;
    const recipe = spawnOrderRecipe(this.level);
    const customer = new Customer(recipe, this.patienceMs);
    customer.warnedLow = false;
    this.customers.push(customer);

    const node = el('div', 'customer');
    const bubble = el('div', 'customer-order', recipe.emoji);
    const face = el('div', 'customer-face', '🧑');
    const bar = el('div', 'patience-bar');
    const fill = el('div', 'patience-bar-fill');
    bar.append(fill);
    node.append(bubble, face, bar);
    addTap(node, () => this.onCustomerTap(customer));
    this.customersRow.append(node);
    this.customerViews.set(customer.id, { node, fill });
  }

  removeCustomer(customer) {
    const view = this.customerViews.get(customer.id);
    if (view) view.node.remove();
    this.customerViews.delete(customer.id);
    this.customers = this.customers.filter((c) => c.id !== customer.id);
  }

  tick(dt) {
    if (this.ended) return;

    this.timeLeft -= dt;
    this.timerEl.textContent = formatTime(this.timeLeft);
    this.timerEl.classList.toggle('urgent', this.timeLeft < 10000);

    this.nextSpawnIn -= dt;
    if (this.nextSpawnIn <= 0 && this.timeLeft > 4000) {
      this.spawnCustomer();
      this.nextSpawnIn = randRange(this.level.spawnInterval[0], this.level.spawnInterval[1]);
    }

    this.customers.forEach((customer) => {
      customer.update(dt);
      const view = this.customerViews.get(customer.id);
      if (view) {
        const ratio = customer.patienceRatio();
        view.fill.style.width = `${ratio * 100}%`;
        view.fill.classList.toggle('low', ratio < 0.3);
        if (ratio < 0.3 && !customer.warnedLow) {
          customer.warnedLow = true;
          this.app.audio.patienceWarning();
        }
      }
    });

    const departed = this.customers.filter((c) => c.state === 'left');
    departed.forEach((c) => {
      this.left += 1;
      this.combo = 0;
      this.updateComboBadge();
      this.app.audio.customerLeft();
      this.removeCustomer(c);
    });

    this.stations.forEach((station, i) => {
      const finishedPlate = station.update(dt);
      const view = this.stationViews[i];
      view.fill.style.width = `${station.progressRatio() * 100}%`;
      view.node.classList.toggle('busy', station.busy);
      if (finishedPlate) {
        const slotIndex = this.slots.findIndex((s) => s.plate === finishedPlate);
        if (slotIndex !== -1) this.refreshSlot(slotIndex);
        this.app.audio.stepDone();
      }
    });

    if (this.timeLeft <= 0) {
      this.finish();
    }
  }

  finish() {
    this.ended = true;
    const goals = this.level.starGoals;
    let stars = 0;
    if (this.coinsEarned >= goals[0]) stars = 1;
    if (this.coinsEarned >= goals[1]) stars = 2;
    if (this.coinsEarned >= goals[2]) stars = 3;
    this.app.cloud.scheduleAutoPush();
    this.app.goTo(ResultScene, {
      levelIndex: this.levelIndex,
      coinsEarned: this.coinsEarned,
      stars,
      served: this.served,
      left: this.left,
    });
  }

  unmount() {}
}

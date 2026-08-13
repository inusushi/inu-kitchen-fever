import { el, addTap, formatTime, randRange, pickRandom } from '../utils/helpers.js';
import { CUSTOMER_FACES, moodFor, cookFor } from '../game/avatars.js';
import { LEVELS } from '../data/levels.js';
import { STATION_TYPES } from '../data/recipes.js';
import { Customer } from '../game/Customer.js';
import { Plate } from '../game/Plate.js';
import { Station } from '../game/Station.js';
import { spawnOrderRecipe } from '../game/Order.js';
import { calculateStars } from '../game/scoring.js';
import { decideCustomerTap, serveReward } from '../game/interaction.js';
import { buildStationLayout } from '../game/stations.js';
import { TUTORIAL_STEPS, advanceTutorial, isTutorialFinished, tutorialFreezesClock } from '../game/tutorial.js';
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
    this.bestCombo = 0;
    this.ended = false;

    this.customers = [];
    this.slots = Array.from({ length: this.slotCount }, () => ({ plate: null }));
    this.stations = buildStationLayout(save.state.upgrades).map((s) => new Station(s.type, s.name, s.emoji));
    this.nextSpawnIn = 800;

    // El tutorial solo corre la primera vez, en el primer nivel.
    this.tutorialStep = !save.state.tutorialDone && this.levelIndex === 0 ? 0 : null;

    this.buildDom(root);
    this.renderStatic();
    this.renderTutorial();
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

    this.tutorialBar = el('div', 'tutorial-bar hidden');
    this.tutorialText = el('span', 'tutorial-text', '');
    this.tutorialSkip = el('button', 'btn btn-ghost btn-small', 'Saltar');
    addTap(this.tutorialSkip, () => this.finishTutorial());
    this.tutorialBar.append(this.tutorialText, this.tutorialSkip);

    wrap.append(header, this.tutorialBar, this.customersRow, el('div', 'section-label', 'Mesas de preparación'), this.slotsRow, el('div', 'section-label', 'Estaciones'), this.stationsRow);
    root.append(wrap);
    this.wrap = wrap;
  }

  renderTutorial() {
    if (this.tutorialStep === null) {
      this.tutorialBar.classList.add('hidden');
      return;
    }
    this.tutorialBar.classList.remove('hidden');
    this.tutorialText.textContent = TUTORIAL_STEPS[this.tutorialStep].text;
    this.tutorialSkip.textContent = isTutorialFinished(this.tutorialStep) ? '¡Vamos!' : 'Saltar';
  }

  // La cocina avisa al tutorial de lo que va logrando el jugador.
  notifyTutorial(event) {
    if (this.tutorialStep === null) return;
    const next = advanceTutorial(this.tutorialStep, event);
    if (next === null) return;
    this.tutorialStep = next;
    this.renderTutorial();
    if (isTutorialFinished(this.tutorialStep)) {
      this.app.save.markTutorialDone();
      // El mensaje de cierre se quita solo; ya no hay nada que esperar.
      this.tutorialTimeout = setTimeout(() => this.finishTutorial(), 4000);
    }
  }

  finishTutorial() {
    this.tutorialStep = null;
    this.app.save.markTutorialDone();
    this.clearTutorialHighlights();
    this.renderTutorial();
  }

  clearTutorialHighlights() {
    this.customerViews.forEach((v) => v.node.classList.remove('tut-highlight'));
    this.stationViews.forEach((v) => v.node.classList.remove('tut-highlight'));
  }

  // Resalta lo que el jugador debe tocar en este paso.
  updateTutorialHighlights() {
    this.clearTutorialHighlights();
    if (this.tutorialStep === null) return;
    const { target } = TUTORIAL_STEPS[this.tutorialStep];

    if (target === 'customer') {
      const first = this.customers.find((c) => c.state === 'waiting');
      if (first) this.customerViews.get(first.id)?.node.classList.add('tut-highlight');
      return;
    }

    if (target === 'station') {
      const plate = this.slots.find((s) => s.plate && s.plate.state === 'prepping' && !s.plate.atStation)?.plate;
      if (!plate) return;
      const needed = plate.currentStep().station;
      const index = this.stations.findIndex((s) => s.type === needed && !s.busy);
      if (index !== -1) this.stationViews[index].node.classList.add('tut-highlight');
    }
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

  buildSlotView() {
    const node = el('div', 'plate-slot empty');
    node.append(el('div', 'slot-empty-hint', 'Mesa libre'));
    return { node };
  }

  buildStationView(station) {
    const node = el('button', 'station');
    const cook = el('div', 'station-cook', cookFor(station.type));
    const emoji = el('div', 'station-emoji', station.emoji);
    const name = el('div', 'station-name', station.name);
    const bar = el('div', 'station-bar');
    const fill = el('div', 'station-bar-fill');
    bar.append(fill);
    node.append(cook, emoji, name, bar);
    addTap(node, () => this.onStationTap(station));
    return { node, fill };
  }

  refreshSlot(index) {
    const slot = this.slots[index];
    const view = this.slotViews[index];
    view.node.innerHTML = '';
    if (!slot.plate) {
      view.node.className = 'plate-slot empty';
      view.node.append(el('div', 'slot-empty-hint', 'Mesa libre'));
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

  rejectCustomerTap(customer) {
    const view = this.customerViews.get(customer.id);
    if (view) {
      view.node.classList.add('shake');
      setTimeout(() => view.node.classList.remove('shake'), 300);
    }
    this.app.audio.mismatch();
  }

  onCustomerTap(customer) {
    const decision = decideCustomerTap(customer, this.slots, this.customers);
    if (decision.action === 'ignore') return;

    if (decision.action === 'reject') {
      this.rejectCustomerTap(customer);
      return;
    }

    if (decision.action === 'start') {
      this.slots[decision.slotIndex].plate = new Plate(customer.recipe);
      this.refreshSlot(decision.slotIndex);
      this.app.audio.tap();
      this.notifyTutorial('order-started');
      return;
    }

    const readyIndex = decision.slotIndex;
    const slot = this.slots[readyIndex];
    const coins = serveReward(slot.plate.recipe.price, customer.patienceRatio(), this.tipMultiplier, this.combo);
    this.coinsEarned += coins;
    this.served += 1;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    customer.state = 'served';

    const customerNode = this.customerViews.get(customer.id)?.node;
    this.flyDish(this.slotViews[readyIndex].node, customerNode, slot.plate.recipe.emoji);

    slot.plate = null;
    this.refreshSlot(readyIndex);
    this.spawnCoinPopup(customerNode, coins);
    this.removeCustomer(customer, 'served');
    this.coinsEl.textContent = `💰 ${this.coinsEarned}`;
    this.updateComboBadge();
    this.app.audio.serve(this.combo >= 3);
    this.notifyTutorial('served');
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
    customer.face = pickRandom(CUSTOMER_FACES);
    const face = el('div', 'customer-face', customer.face);
    const mood = el('div', 'customer-mood', moodFor(1).emoji);
    face.append(mood);
    const bar = el('div', 'patience-bar');
    const fill = el('div', 'patience-bar-fill');
    bar.append(fill);
    const status = el('div', 'customer-status', '');
    node.append(bubble, face, bar, status);
    addTap(node, () => this.onCustomerTap(customer));
    node.classList.add('customer-enter');
    this.customersRow.append(node);
    this.customerViews.set(customer.id, { node, fill, status, mood });
  }

  // El cliente sale de la lógica de inmediato; su tarjeta se queda un
  // momento más solo para terminar la animación de salida.
  removeCustomer(customer, reason = 'left') {
    const view = this.customerViews.get(customer.id);
    if (view) {
      const { node } = view;
      node.classList.remove('tut-highlight', 'ready-to-serve');
      node.classList.add(reason === 'served' ? 'customer-served' : 'customer-left');
      node.style.pointerEvents = 'none';
      setTimeout(() => node.remove(), 420);
    }
    this.customerViews.delete(customer.id);
    this.customers = this.customers.filter((c) => c.id !== customer.id);
  }

  // El platillo vuela de la mesa al cliente al servirlo.
  flyDish(fromNode, toNode, emoji) {
    if (!fromNode || !toNode) return;
    const from = fromNode.getBoundingClientRect();
    const to = toNode.getBoundingClientRect();
    const dish = el('div', 'flying-dish', emoji);
    dish.style.left = `${from.left + from.width / 2}px`;
    dish.style.top = `${from.top + from.height / 2}px`;
    dish.style.setProperty('--dx', `${to.left + to.width / 2 - (from.left + from.width / 2)}px`);
    dish.style.setProperty('--dy', `${to.top + to.height / 2 - (from.top + from.height / 2)}px`);
    document.body.append(dish);
    setTimeout(() => dish.remove(), 500);
  }

  tick(dt) {
    if (this.ended) return;

    // Durante el tutorial el reloj y la paciencia se congelan: nadie pierde
    // por leer las instrucciones. Las estaciones sí siguen trabajando.
    const congelado = this.tutorialStep !== null && tutorialFreezesClock(this.tutorialStep);

    if (!congelado) {
      this.timeLeft -= dt;
      this.timerEl.textContent = formatTime(this.timeLeft);
      this.timerEl.classList.toggle('urgent', this.timeLeft < 10000);

      this.nextSpawnIn -= dt;
      if (this.nextSpawnIn <= 0 && this.timeLeft > 4000) {
        this.spawnCustomer();
        this.nextSpawnIn = randRange(this.level.spawnInterval[0], this.level.spawnInterval[1]);
      }
    } else if (this.customers.length === 0) {
      // El tutorial necesita al menos un cliente para poder explicarse.
      this.spawnCustomer();
    }

    this.customers.forEach((customer) => {
      if (!congelado) customer.update(dt);
      const view = this.customerViews.get(customer.id);
      if (view) {
        const ratio = customer.patienceRatio();
        view.fill.style.width = `${ratio * 100}%`;
        view.fill.classList.toggle('low', ratio < 0.3);
        if (ratio < 0.3 && !customer.warnedLow) {
          customer.warnedLow = true;
          this.app.audio.patienceWarning();
        }

        const mood = moodFor(ratio);
        if (view.mood.textContent !== mood.emoji) view.mood.textContent = mood.emoji;
        view.node.classList.toggle('impatient', ratio < 0.2);

        const listo = this.slots.some(
          (s) => s.plate && s.plate.state === 'ready' && s.plate.recipe.id === customer.recipe.id,
        );
        const preparando = this.slots.some(
          (s) => s.plate && s.plate.state === 'prepping' && s.plate.recipe.id === customer.recipe.id,
        );
        view.node.classList.toggle('ready-to-serve', listo);
        const texto = listo ? '¡Servir!' : preparando ? 'Preparando…' : 'Toca para pedir';
        if (view.status.textContent !== texto) view.status.textContent = texto;
      }
    });

    const departed = this.customers.filter((c) => c.state === 'left');
    departed.forEach((c) => {
      this.left += 1;
      this.combo = 0;
      this.updateComboBadge();
      this.app.audio.customerLeft();
      this.removeCustomer(c, 'left');
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
        if (finishedPlate.state === 'ready') this.notifyTutorial('plate-ready');
      }
    });

    this.updateTutorialHighlights();

    if (this.timeLeft <= 0) {
      this.finish();
    }
  }

  finish() {
    this.ended = true;
    const stars = calculateStars(this.coinsEarned, this.level.starGoals);
    this.app.cloud.scheduleAutoPush();
    this.app.goTo(ResultScene, {
      levelIndex: this.levelIndex,
      coinsEarned: this.coinsEarned,
      stars,
      served: this.served,
      left: this.left,
      bestCombo: this.bestCombo,
    });
  }

  unmount() {
    clearTimeout(this.tutorialTimeout);
  }
}

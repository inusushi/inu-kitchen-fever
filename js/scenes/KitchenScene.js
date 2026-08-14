import { el, addTap, formatTime, randRange, dishVisual } from '../utils/helpers.js';
import { randomCustomerDesign, moodFor, cookFor } from '../game/avatars.js';
import { photoFor, backgroundFor } from '../data/photos.js';
import { equipmentFor } from '../game/equipment.js';
import { pickCustomerType, patienceForOrder, isRushHour, RUSH_SPAWN_FACTOR } from '../game/customerTypes.js';
import { LEVELS } from '../data/levels.js';
import { STATION_TYPES } from '../data/recipes.js';
import { Customer } from '../game/Customer.js';
import { Plate } from '../game/Plate.js';
import { Station } from '../game/Station.js';
import { spawnOrder } from '../game/Order.js';
import { calculateStars } from '../game/scoring.js';
import { decideCustomerTap, serveReward } from '../game/interaction.js';
import { buildStationLayout } from '../game/stations.js';
import { TUTORIAL_STEPS, advanceTutorial, isTutorialFinished, tutorialFreezesClock } from '../game/tutorial.js';
import { decorationById } from '../data/decorations.js';
import { activeEventFor } from '../data/events.js';
import { todayKey } from '../game/objectives.js';
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

    this.event = activeEventFor(todayKey());
    this.speedMultiplier = 1 - speedLevel * 0.1;
    this.tipMultiplier = (1 + tipLevel * 0.1) * (this.event ? this.event.coinMultiplier : 1);
    this.patienceMs = this.level.patience * (1 + patienceLevel * 0.2);
    this.slotCount = 2 + slotLevel;
    this.decor = decorationById(save.state.decorations.equipped);

    this.timeLeft = this.level.duration;
    this.coinsEarned = 0;
    this.served = 0;
    this.left = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.ended = false;

    this.customers = [];
    this.slots = Array.from({ length: this.slotCount }, () => ({ plate: null }));
    this.stations = buildStationLayout(save.state.upgrades).map(
      (s) => new Station(s.type, s.name, s.emoji, { burns: s.burns }),
    );
    this.burnt = 0;
    this.nextSpawnIn = 800;

    // El tutorial solo corre la primera vez, en el primer nivel.
    this.tutorialStep = !save.state.tutorialDone && this.levelIndex === 0 ? 0 : null;

    this.buildDom(root);
    this.renderStatic();
    this.renderTutorial();
  }

  buildDom(root) {
    const wrap = el('div', `screen kitchen-screen${this.decor.theme ? ' ' + this.decor.theme : ''}`);

    // Fondo con la foto del tema, muy atenuado para no competir con el juego.
    const bg = backgroundFor(this.level.id);
    if (bg) {
      const bgNode = el('div', 'kitchen-bg');
      bgNode.style.backgroundImage = `url("${bg}")`;
      wrap.append(bgNode);
    }

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
    this.rushEl = el('div', 'rush-badge hidden', '⚡ ¡HORA PICO!');
    this.coinsEl = el('div', 'coins-badge', `💰 ${this.coinsEarned}`);
    this.timerEl = el('div', 'timer-badge', formatTime(this.timeLeft));
    const title = el('h2', 'top-bar-title', `${this.level.emoji} ${this.level.name}`);
    if (this.decor.id !== 'none') {
      const badge = el('span', 'decor-badge', ` ${this.decor.emoji}`);
      badge.title = this.decor.name;
      title.append(badge);
    }
    header.append(backBtn, title);
    if (this.event) {
      const eventEl = el('div', 'event-badge', `${this.event.emoji} +${Math.round((this.event.coinMultiplier - 1) * 100)}%`);
      eventEl.title = this.event.message;
      header.append(eventEl);
    }
    header.append(this.rushEl, this.comboEl, this.timerEl, this.coinsEl, muteBtn);

    const diningFloor = el('div', 'dining-floor');
    const doorHint = el('div', 'floor-door', '🚪');
    doorHint.title = 'Por aquí llegan los clientes';
    const counter = el('div', 'order-counter');
    counter.append(el('span', 'counter-bell', '🛎️'), el('span', 'counter-label', 'Barra de pedidos'));
    // Mesas de fondo: pura ambientación, no interactúan con el juego.
    const floorDecor = el('div', 'floor-decor');
    for (let i = 0; i < 4; i++) floorDecor.append(el('span', 'floor-table', '🍽️'));
    this.customersRow = el('div', 'customers-row');
    diningFloor.append(doorHint, floorDecor, counter, this.customersRow);

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

    wrap.append(header, this.tutorialBar, diningFloor, el('div', 'section-label', 'Mesas de preparación'), this.slotsRow, el('div', 'section-label', 'Estaciones'), this.stationsRow);
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
    const equipment = equipmentFor(this.level.id, station.type);
    const node = el('button', `station ambient-${equipment.ambient}`);
    const particles = el('div', 'station-particles');
    for (let i = 0; i < 3; i++) particles.append(el('span', 'particle'));
    const cook = el('div', 'station-cook', cookFor(station.type));
    const emoji = el('div', 'station-emoji', equipment.icon);
    const name = el('div', 'station-name', station.name);
    const bar = el('div', 'station-bar');
    const fill = el('div', 'station-bar-fill');
    bar.append(fill);
    node.append(particles, cook, emoji, name, bar);
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
    header.append(
      dishVisual(plate.recipe, photoFor(plate.recipe.id), 'plate-emoji dish-img'),
      el('span', 'plate-name', plate.recipe.name),
    );
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
      const enFuego = this.stations.some((s) => s.waitingPickup && s.plate === plate);
      view.node.append(
        enFuego
          ? el('div', 'plate-burn-hint', '🔥 ¡Recógelo o se quema!')
          : el('div', 'plate-wait-hint', 'Preparando…'),
      );
    }
  }

  onStationTap(station) {
    // Recoger lo que ya está listo sobre el fuego, antes de que se queme.
    if (station.waitingPickup) {
      const plate = station.collect();
      const slotIndex = this.slots.findIndex((s) => s.plate === plate);
      if (slotIndex !== -1) this.refreshSlot(slotIndex);
      this.app.audio.stepDone();
      if (plate.state === 'ready') this.notifyTutorial('plate-ready');
      return;
    }

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
      this.slots[decision.slotIndex].plate = new Plate(decision.recipe);
      this.refreshSlot(decision.slotIndex);
      this.app.audio.tap();
      this.notifyTutorial('order-started');
      return;
    }

    const readyIndex = decision.slotIndex;
    const slot = this.slots[readyIndex];
    const recipe = slot.plate.recipe;
    const customerNode = this.customerViews.get(customer.id)?.node;

    // Cada platillo se paga al entregarlo, así un pedido a medias no se pierde.
    const pago = customer.type ? customer.type.payMultiplier : 1;
    const coins = serveReward(
      recipe.price * pago,
      customer.patienceRatio(),
      this.tipMultiplier,
      this.combo,
      this.decor.tipBonus,
    );
    this.coinsEarned += coins;
    this.coinsEl.textContent = `💰 ${this.coinsEarned}`;

    const completo = customer.deliver(recipe.id);
    this.flyDish(this.slotViews[readyIndex].node, customerNode, recipe);
    this.spawnCoinPopup(customerNode, coins);

    slot.plate = null;
    this.refreshSlot(readyIndex);

    if (!completo) {
      // Todavía le falta algo: se queda esperando el resto del pedido.
      this.app.audio.stepDone();
      this.refreshCustomerOrder(customer);
      return;
    }

    this.served += 1;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    customer.state = 'served';
    this.removeCustomer(customer, 'served');
    this.updateComboBadge();
    this.app.audio.serve(this.combo >= 3);
    this.notifyTutorial('served');
  }

  // Se quemó: se pierde el platillo y la mesa queda libre para rehacerlo.
  onPlateBurnt(plate, stationNode) {
    this.burnt += 1;
    const slotIndex = this.slots.findIndex((s) => s.plate === plate);
    if (slotIndex !== -1) {
      this.slots[slotIndex].plate = null;
      this.refreshSlot(slotIndex);
    }
    this.spawnFloatingText(stationNode, '💨 ¡Se quemó!', 'burnt-popup');
    this.app.audio.customerLeft();
    // Perder un platillo corta la racha: la prisa tiene costo.
    this.combo = 0;
    this.updateComboBadge();
  }

  // Redibuja los platillos que el cliente todavía espera.
  refreshCustomerOrder(customer) {
    const view = this.customerViews.get(customer.id);
    if (!view) return;
    view.order.innerHTML = '';
    customer.pendingRecipes().forEach((r) => {
      view.order.append(dishVisual(r, photoFor(r.id), 'dish-img'));
    });
  }

  spawnCoinPopup(referenceNode, coins) {
    this.spawnFloatingText(referenceNode, `+💰${coins}`, 'coin-popup');
  }

  spawnFloatingText(referenceNode, text, className) {
    const rect = (referenceNode || this.customersRow).getBoundingClientRect();
    const popup = el('div', className, text);
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
    const tipo = pickCustomerType(this.level);
    const recipes = spawnOrder(this.level);
    // Los grupos piden de más sobre lo que ya trae el nivel.
    for (let i = 0; i < tipo.extraDishes; i++) {
      recipes.push(...spawnOrder({ ...this.level, orderSizes: [1] }));
    }
    // Los tipos impacientes no pueden cargar con pedidos enormes.
    recipes.length = Math.min(recipes.length, tipo.maxOrderSize);

    const patience = patienceForOrder(this.patienceMs, recipes.length, tipo);
    const customer = new Customer(recipes, patience);
    customer.type = tipo;
    customer.warnedLow = false;
    this.customers.push(customer);

    const node = el('div', `customer type-${tipo.id}`);
    if (recipes.length > 1) node.classList.add('big-order');
    if (tipo.badge) {
      const badge = el('div', 'customer-badge', tipo.badge);
      badge.title = tipo.label;
      node.append(badge);
    }
    // Globo de pedido con su propia barra de tiempo vertical (como en Cooking
    // Fever): el platillo y la urgencia viven juntos, no en dos lugares.
    const bubble = el('div', 'order-bubble');
    const bubbleBarTrack = el('div', 'order-bubble-bar');
    const fill = el('div', 'order-bubble-bar-fill');
    bubbleBarTrack.append(fill);
    const dishes = el('div', 'order-dishes');
    recipes.forEach((r) => dishes.append(dishVisual(r, photoFor(r.id), 'dish-img')));
    bubble.append(bubbleBarTrack, dishes, el('div', 'order-bubble-tail'));

    const design = randomCustomerDesign();
    customer.face = design.face;
    const sprite = el('div', 'customer-sprite');
    const body = el('div', 'customer-body');
    body.style.background = design.outfit;
    const face = el('div', 'customer-face', design.face);
    const mood = el('div', 'customer-mood', moodFor(1).emoji);
    face.append(mood);
    sprite.append(body, face);

    const status = el('div', 'customer-status', '');
    node.append(bubble, sprite, status);
    addTap(node, () => this.onCustomerTap(customer));
    node.classList.add('customer-walk-in');
    this.customersRow.append(node);
    this.customerViews.set(customer.id, { node, fill, status, mood, order: dishes });
  }

  // El cliente sale de la lógica de inmediato; su tarjeta se queda un
  // momento más solo para terminar la animación de salida.
  removeCustomer(customer, reason = 'left') {
    const view = this.customerViews.get(customer.id);
    if (view) {
      const { node } = view;
      node.classList.remove('tut-highlight', 'ready-to-serve');
      const served = reason === 'served';
      node.classList.add(served ? 'customer-served' : 'customer-left');
      node.style.pointerEvents = 'none';
      // Duración pareja con la animación CSS de cada salida (customer-out-happy / customer-out-angry).
      setTimeout(() => node.remove(), served ? 420 : 1420);
    }
    this.customerViews.delete(customer.id);
    this.customers = this.customers.filter((c) => c.id !== customer.id);
  }

  // El platillo vuela de la mesa al cliente al servirlo.
  flyDish(fromNode, toNode, recipe) {
    if (!fromNode || !toNode) return;
    const from = fromNode.getBoundingClientRect();
    const to = toNode.getBoundingClientRect();
    const dish = el('div', 'flying-dish');
    dish.append(dishVisual(recipe, photoFor(recipe.id), 'dish-img'));
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

      // Hora pico: a media partida los clientes llegan más seguido.
      const rush = isRushHour(this.timeLeft, this.level.duration);
      if (rush !== this.rushActive) {
        this.rushActive = rush;
        this.rushEl.classList.toggle('hidden', !rush);
        if (rush) this.app.audio.patienceWarning();
      }

      this.nextSpawnIn -= dt;
      if (this.nextSpawnIn <= 0 && this.timeLeft > 4000) {
        this.spawnCustomer();
        const espera = randRange(this.level.spawnInterval[0], this.level.spawnInterval[1]);
        this.nextSpawnIn = rush ? espera * RUSH_SPAWN_FACTOR : espera;
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
        view.fill.style.height = `${ratio * 100}%`;
        view.fill.classList.toggle('low', ratio < 0.3);
        if (ratio < 0.3 && !customer.warnedLow) {
          customer.warnedLow = true;
          this.app.audio.patienceWarning();
        }

        const mood = moodFor(ratio);
        if (view.mood.textContent !== mood.emoji) view.mood.textContent = mood.emoji;
        view.node.classList.toggle('impatient', ratio < 0.2);

        const pendientes = customer.pendingRecipes();
        const pendingIds = new Set(pendientes.map((r) => r.id));
        const listo = this.slots.some(
          (s) => s.plate && s.plate.state === 'ready' && pendingIds.has(s.plate.recipe.id),
        );
        const preparando = this.slots.some(
          (s) => s.plate && s.plate.state === 'prepping' && pendingIds.has(s.plate.recipe.id),
        );
        view.node.classList.toggle('ready-to-serve', listo);
        const faltan = pendientes.length;
        const texto = listo
          ? '¡Servir!'
          : preparando
            ? 'Preparando…'
            : faltan > 1
              ? `Pide ${faltan}`
              : 'Toca para pedir';
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
      const evento = station.update(dt);
      const view = this.stationViews[i];
      const esperando = station.waitingPickup;

      view.fill.style.width = `${(esperando ? station.burnRatio() : station.progressRatio()) * 100}%`;
      view.fill.classList.toggle('burning', esperando);
      view.node.classList.toggle('busy', station.busy);
      view.node.classList.toggle('pickup', esperando);

      if (!evento) return;

      if (evento.type === 'advanced') {
        const slotIndex = this.slots.findIndex((s) => s.plate === evento.plate);
        if (slotIndex !== -1) this.refreshSlot(slotIndex);
        this.app.audio.stepDone();
        if (evento.plate.state === 'ready') this.notifyTutorial('plate-ready');
        return;
      }

      if (evento.type === 'cooked') {
        // Queda sobre el fuego esperando que lo recojan.
        const slotIndex = this.slots.findIndex((s) => s.plate === evento.plate);
        if (slotIndex !== -1) this.refreshSlot(slotIndex);
        this.app.audio.patienceWarning();
        return;
      }

      if (evento.type === 'burnt') this.onPlateBurnt(evento.plate, view.node);
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
      burnt: this.burnt,
    });
  }

  unmount() {
    clearTimeout(this.tutorialTimeout);
  }
}

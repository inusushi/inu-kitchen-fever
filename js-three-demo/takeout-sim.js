import * as THREE from 'three';
import { buildCustomer } from './customer3d.js';
import { buildDishSprite, disposeDishSprite } from './dish-sprite.js';
import { Customer } from '../js/game/Customer.js';
import { spawnOrder } from '../js/game/Order.js';
import { patienceForOrder, pickCustomerType, isRushHour, RUSH_SPAWN_FACTOR } from '../js/game/customerTypes.js';
import { CUSTOMERS as CUSTOMER_DESIGNS, moodFor } from '../js/game/avatars.js';
import { serveReward } from '../js/game/interaction.js';

const ENTRY_X = 8.3; // cerca de la pared derecha, por donde "entran" a recoger
const SLOT_POSITIONS = [
  { x: 6.3, z: 0.3 },
  { x: 7.7, z: 0.3 },
];
const WALK_DURATION = 1.1; // tramo corto — la ventanilla está cerca de por dónde entran
const FLY_DURATION = 0.55;
const SHAKE_DURATION = 0.3;

const MOOD_TO_FACE = { contento: 'happy', esperando: 'meh', impaciente: 'meh', enojado: 'annoyed' };
const MOOD_TO_COLOR = { contento: '#4dd67a', esperando: '#a8d67a', impaciente: '#ffcc33', enojado: '#ff5a5a' };

// Cola de comida para llevar: mismo patrón que queue-sim.js (Customer,
// spawnOrder, patienceForOrder, pickCustomerType, moodFor reales), pero
// sin mesas ni compra — son 2 lugares fijos junto a la ventanilla, y en
// cuanto reciben su pedido se van (nada que "reposar", es para llevar).
// Comparte la MISMA cocina que la cola de mesas — decideCustomerTap en
// main.js junta a los clientes de las dos colas para calcular oferta y
// demanda, así que compiten por las mismas 2 mesas de preparación.
export function createTakeoutSim({ scene, camera, level, platePosition, onServed, onLeft }) {
  const active = [];
  let spawnTimer = randomSpawnDelay();
  let combo = 0;

  function randomSpawnDelay() {
    const [min, max] = level.spawnInterval;
    // Llegan un poco menos seguido que a las mesas — son solo 2 lugares.
    return ((min + Math.random() * (max - min)) / 1000) * 1.4;
  }

  function freeSlotIndex() {
    for (let i = 0; i < SLOT_POSITIONS.length; i++) {
      if (!active.some((c) => c.slotIndex === i)) return i;
    }
    return -1;
  }

  function trySpawn() {
    const slotIndex = freeSlotIndex();
    if (slotIndex === -1) return;

    const tipo = pickCustomerType(level);
    const recipes = spawnOrder(level).slice(0, tipo.maxOrderSize);
    const patience = patienceForOrder(level.patience, recipes.length, tipo);
    const game = new Customer(recipes, patience);
    game.type = tipo;

    const design = CUSTOMER_DESIGNS[Math.floor(Math.random() * CUSTOMER_DESIGNS.length)];
    const mesh = buildCustomer({ outfit: design.outfit, mood: 'happy' });
    const slot = SLOT_POSITIONS[slotIndex];
    mesh.position.set(ENTRY_X, 0, slot.z);
    scene.add(mesh);

    const bubble = buildOrderBubble(recipes);
    scene.add(bubble.mesh);

    active.push({
      game, mesh, bubble, slotIndex,
      state: 'entering',
      walkFrom: ENTRY_X, walkTo: slot.x, walkT: 0,
      phase: Math.random() * Math.PI * 2,
      lastBarDraw: 0,
      flyingDishes: [], pendingFlights: 0,
    });
  }

  function spawnFlyingDish(entry, recipe, isFinal) {
    const sprite = buildDishSprite(recipe);
    const from = platePosition.clone().add(new THREE.Vector3(0, 0.4, 0));
    sprite.position.copy(from);
    scene.add(sprite);
    entry.pendingFlights++;
    entry.flyingDishes.push({ sprite, from, t: 0, isFinal });
  }

  function buildOrderBubble(recipes) {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 190;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(0.62, 0.74);
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 10;
    return { mesh, canvas, ctx, texture, emojis: recipes.map((r) => r.emoji) };
  }

  function redrawBubble(entry, ratio, barColor) {
    const { ctx, canvas, emojis } = entry.bubble;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    roundRect(ctx, 6, 6, canvas.width - 12, canvas.height - 34, 18);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const midY = 6 + (canvas.height - 34) / 2;
    if (emojis.length === 1) {
      ctx.font = '54px sans-serif';
      ctx.fillText(emojis[0], canvas.width / 2, midY);
    } else {
      ctx.font = '36px sans-serif';
      const step = (canvas.width - 30) / emojis.length;
      emojis.forEach((e, i) => ctx.fillText(e, 20 + step * i + step / 2, midY));
    }

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 10, canvas.height - 28);
    ctx.lineTo(canvas.width / 2 + 10, canvas.height - 28);
    ctx.lineTo(canvas.width / 2, canvas.height - 14);
    ctx.closePath();
    ctx.fill();

    const barY = canvas.height - 10;
    const barW = canvas.width - 20;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    roundRect(ctx, 10, barY - 6, barW, 8, 4);
    ctx.fill();
    ctx.fillStyle = barColor;
    roundRect(ctx, 10, barY - 6, Math.max(barW * ratio, 4), 8, 4);
    ctx.fill();

    entry.bubble.texture.needsUpdate = true;
  }

  // "para llevar": no hay salida contenta/enojada distintas por lado —
  // se van por donde llegaron (ENTRY_X), con o sin su pedido.
  function beginExit(entry, happy) {
    entry.state = happy ? 'leaving-happy' : 'leaving-angry';
    entry.walkFrom = entry.mesh.position.x;
    entry.walkTo = ENTRY_X;
    entry.walkT = 0;
    scene.remove(entry.bubble.mesh);
    if (!happy) {
      combo = 0;
      onLeft?.();
    }
  }

  function getCustomerEntryAt(ndcX, ndcY) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
    for (const entry of active) {
      if (entry.state !== 'waiting') continue;
      const hits = raycaster.intersectObjects(entry.mesh.children, true);
      if (hits.length) return entry;
    }
    return null;
  }

  function getActiveCustomerGames() {
    return active.map((e) => e.game);
  }

  function serveCustomerEntry(entry, recipe) {
    const patienceRatio = entry.game.patienceRatio();
    const pago = entry.game.type ? entry.game.type.payMultiplier : 1;
    const coins = serveReward(recipe.price * pago, patienceRatio, 1, combo, 0);
    const done = entry.game.deliver(recipe.id);
    spawnFlyingDish(entry, recipe, done);
    if (done) combo += 1;
    onServed?.(coins, combo);

    if (!done) {
      const mood = moodFor(patienceRatio);
      redrawBubble(entry, patienceRatio, MOOD_TO_COLOR[mood.label]);
    }
  }

  function rejectCustomerEntry(entry) {
    entry.shakeT = 0;
  }

  function update(dt, t, timeLeftMs = level.duration) {
    const rush = isRushHour(timeLeftMs, level.duration);
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      trySpawn();
      const delay = randomSpawnDelay();
      spawnTimer = rush ? delay * RUSH_SPAWN_FACTOR : delay;
    }

    for (let i = active.length - 1; i >= 0; i--) {
      const entry = active[i];
      const { mesh } = entry;

      if (entry.state === 'entering' || entry.state.startsWith('leaving')) {
        entry.walkT = Math.min(1, entry.walkT + dt / WALK_DURATION);
        mesh.position.x = entry.walkFrom + (entry.walkTo - entry.walkFrom) * entry.walkT;
        const phase = t * 5 + entry.phase;
        mesh.position.y = Math.abs(Math.sin(phase)) * 0.12;
        mesh.rotation.z = Math.sin(phase) * 0.06;
        mesh.userData.parts.footL.rotation.x = Math.sin(phase) * 0.6;
        mesh.userData.parts.footR.rotation.x = Math.sin(phase + Math.PI) * 0.6;
        mesh.rotation.y = entry.walkTo > entry.walkFrom ? 0.15 : -0.15;

        if (entry.walkT >= 1) {
          if (entry.state === 'entering') {
            entry.state = 'waiting';
            mesh.rotation.set(0, 0, 0);
            redrawBubble(entry, 1, MOOD_TO_COLOR.contento);
          } else {
            scene.remove(mesh);
            active.splice(i, 1);
            continue;
          }
        }
      } else if (entry.state === 'waiting') {
        if (!entry.game.isComplete()) {
          entry.game.update(dt * 1000);
          const ratio = entry.game.patienceRatio();
          const mood = moodFor(ratio);
          mesh.userData.setMood(MOOD_TO_FACE[mood.label]);

          entry.lastBarDraw += dt;
          if (entry.lastBarDraw > 0.15) {
            entry.lastBarDraw = 0;
            redrawBubble(entry, ratio, MOOD_TO_COLOR[mood.label]);
          }

          if (entry.game.state === 'left') beginExit(entry, false);
        }

        const phase = t * 1.6 + entry.phase;
        mesh.position.y = Math.sin(phase) * 0.03;
        mesh.rotation.y = Math.sin(t * 0.4 + entry.phase) * 0.12;

        if (entry.shakeT !== undefined && entry.shakeT < SHAKE_DURATION) {
          entry.shakeT += dt;
          const decay = 1 - entry.shakeT / SHAKE_DURATION;
          mesh.rotation.z += Math.sin(entry.shakeT * 40) * 0.12 * decay;
        }
      }

      for (let j = entry.flyingDishes.length - 1; j >= 0; j--) {
        const flight = entry.flyingDishes[j];
        flight.t = Math.min(1, flight.t + dt / FLY_DURATION);
        const to = new THREE.Vector3(mesh.position.x, 1.9, mesh.position.z);
        flight.sprite.position.lerpVectors(flight.from, to, flight.t);
        flight.sprite.position.y += Math.sin(flight.t * Math.PI) * 0.5;
        const scale = 0.55 + Math.sin(flight.t * Math.PI) * 0.15;
        flight.sprite.scale.set(scale, scale, 1);

        if (flight.t >= 1) {
          scene.remove(flight.sprite);
          disposeDishSprite(flight.sprite);
          entry.flyingDishes.splice(j, 1);
          entry.pendingFlights--;
          // Para llevar: sin reposo — en cuanto le entregan su bolsa, se va.
          if (flight.isFinal && entry.pendingFlights <= 0 && entry.state === 'waiting') {
            mesh.userData.setMood('happy');
            beginExit(entry, true);
          }
        }
      }

      if (entry.state === 'waiting' || entry.state === 'entering') {
        entry.bubble.mesh.position.set(mesh.position.x, 2.15, mesh.position.z);
        entry.bubble.mesh.quaternion.copy(camera.quaternion);
      }
    }
  }

  function reset() {
    for (const entry of active) {
      scene.remove(entry.mesh);
      scene.remove(entry.bubble.mesh);
      entry.flyingDishes.forEach((f) => { scene.remove(f.sprite); disposeDishSprite(f.sprite); });
    }
    active.length = 0;
    combo = 0;
    spawnTimer = randomSpawnDelay();
  }

  return {
    update, reset,
    getCustomerEntryAt, getActiveCustomerGames, serveCustomerEntry, rejectCustomerEntry,
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

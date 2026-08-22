import * as THREE from 'three';
import { buildCustomer } from './customer3d.js';
import { buildDishSprite, disposeDishSprite } from './dish-sprite.js';
import { buildBambooTable } from './scene-environment.js';
import { Customer } from '../js/game/Customer.js';
import { spawnOrder } from '../js/game/Order.js';
import { patienceForOrder, pickCustomerType, isRushHour, RUSH_SPAWN_FACTOR } from '../js/game/customerTypes.js';
import { CUSTOMERS as CUSTOMER_DESIGNS, moodFor } from '../js/game/avatars.js';
import { serveReward } from '../js/game/interaction.js';

const ENTRY_X = -6.5;
const EXIT_HAPPY_X = 6.5;
const WALK_DURATION = 2.1; // segundos para cruzar toda la barra
const FLY_DURATION = 0.55; // segundos que tarda el platillo en llegar de la barra al cliente
const SHAKE_DURATION = 0.3; // segundos que dura la sacudida de "toque rechazado"

// Pedido de Dany: 5s extra de paciencia base — ahora que servir pasa por
// cuchillo + armado (antes era instantáneo), la paciencia original se
// sentía corta. Posiciones de mesa fijas para hasta 6 — comprar una mesa
// nunca mueve las que ya existen (un cliente sentado no se puede
// teletransportar sin verse roto).
export const PATIENCE_BONUS_MS = 5000;
export const START_TABLES = 3;
export const MAX_TABLES = 6;
export const TABLE_COST = 8000;
const TABLE_PATIENCE_BONUS_MS = 2000; // por cada mesa comprada arriba de las 3 iniciales
const TABLE_Z = 1.3; // un poco más cerca de cámara que el cliente (z=0.9), para no encimarse
const SLOT_POSITIONS = [
  { x: -2, z: 0.9 }, { x: 0, z: 0.9 }, { x: 2, z: 0.9 },
  { x: -4, z: 0.9 }, { x: 4, z: 0.9 }, { x: -5.5, z: 0.9 },
];

const MOOD_TO_FACE = { contento: 'happy', esperando: 'meh', impaciente: 'meh', enojado: 'annoyed' };
const MOOD_TO_COLOR = { contento: '#4dd67a', esperando: '#a8d67a', impaciente: '#ffcc33', enojado: '#ff5a5a' };

// Cola de clientes real: usa las mismas clases y funciones que KitchenScene
// (Customer, spawnOrder, patienceForOrder, pickCustomerType, moodFor) para
// que la paciencia, el tipo de cliente y el pedido no sean inventados para
// la demo — es el nivel Onigiri real corriendo, solo que dibujado en 3D.
export function createQueueSim({ scene, camera, level, platePosition, onServed, onLeft }) {
  const active = [];
  let spawnTimer = randomSpawnDelay();
  let combo = 0;
  let tableCount = START_TABLES;
  const tableMeshes = [];

  function addTableMesh(index) {
    const pos = SLOT_POSITIONS[index];
    const table = buildBambooTable();
    table.position.set(pos.x, 0, TABLE_Z);
    scene.add(table);
    tableMeshes.push(table);
  }
  for (let i = 0; i < START_TABLES; i++) addTableMesh(i);

  function randomSpawnDelay() {
    const [min, max] = level.spawnInterval;
    return (min + Math.random() * (max - min)) / 1000;
  }

  function freeSlotIndex() {
    for (let i = 0; i < tableCount; i++) {
      if (!active.some((c) => c.slotIndex === i)) return i;
    }
    return -1;
  }

  function trySpawn() {
    const slotIndex = freeSlotIndex();
    if (slotIndex === -1) return;

    const tipo = pickCustomerType(level);
    const recipes = spawnOrder(level).slice(0, tipo.maxOrderSize);
    const tableBonus = (tableCount - START_TABLES) * TABLE_PATIENCE_BONUS_MS;
    const patience = patienceForOrder(level.patience, recipes.length, tipo) + PATIENCE_BONUS_MS + tableBonus;
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

  // Para el botón "Comprar mesa": más mesas = más clientes atendidos en
  // paralelo Y más paciencia para todos (una mesa de sobra se siente
  // menos apurada). Nunca mueve mesas existentes, solo revela la
  // siguiente posición fija de SLOT_POSITIONS.
  function buyTable() {
    if (tableCount >= MAX_TABLES) return false;
    addTableMesh(tableCount);
    tableCount++;
    return true;
  }

  function getTableCount() {
    return tableCount;
  }

  // El platillo sale de la estación de armado (plate) y viaja hasta el
  // cliente — así el pedido no se completa "de la nada": se ve venir de
  // la cocina, aunque el jugador todavía no toque las estaciones a mano.
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
    // Sin depthTest, como el globo de pedido del juego real (DOM por
    // encima de todo) — así nunca queda tapado por otro cliente o la barra.
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

    // Cola del globo, apuntando hacia la cabeza.
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 10, canvas.height - 28);
    ctx.lineTo(canvas.width / 2 + 10, canvas.height - 28);
    ctx.lineTo(canvas.width / 2, canvas.height - 14);
    ctx.closePath();
    ctx.fill();

    // Barra de paciencia, mismo lugar que ocupa en el HUD 2D del juego.
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

  function beginExit(entry, happy) {
    entry.state = happy ? 'leaving-happy' : 'leaving-angry';
    entry.walkFrom = entry.mesh.position.x;
    entry.walkTo = happy ? EXIT_HAPPY_X : ENTRY_X;
    entry.walkT = 0;
    scene.remove(entry.bubble.mesh);
    // Irse enojado corta la racha, igual que en KitchenScene — la prisa
    // tiene costo, no solo cuando se quema un platillo.
    if (!happy) {
      combo = 0;
      onLeft?.();
    }
  }

  // ndcX/ndcY: coordenadas de clic ya normalizadas a [-1, 1] (las calcula
  // main.js a partir del canvas, así este módulo no toca el DOM). Devuelve
  // el cliente tocado (esperando) sin decidir qué hacer con él — esa
  // decisión (servir / arrancar un platillo / rechazar) es de
  // decideCustomerTap, la misma función que usa KitchenScene, orquestada
  // desde main.js porque necesita el estado de las estaciones también.
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

  // Los objetos Customer reales de todos los clientes activos — los que
  // necesita decideCustomerTap para calcular demanda/oferta entre todos,
  // no solo el que se tocó.
  function getActiveCustomerGames() {
    return active.map((e) => e.game);
  }

  // Entrega el platillo ya listo (decideCustomerTap ya decidió que aplica).
  function serveCustomerEntry(entry, recipe) {
    const patienceRatio = entry.game.patienceRatio();

    // Mismo cálculo y orden que KitchenScene.onCustomerTap: el pago usa
    // la racha ANTES de subirla — la racha solo sube al completar el
    // pedido entero, pero cada platillo entregado paga, sea parcial o no.
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

  // Sacudida breve cuando el toque no sirve de nada (sin mesa libre, o ya
  // hay suficiente de ese platillo preparándose) — mismo caso "reject"
  // que en KitchenScene, solo que ahí es una clase CSS y acá una animación.
  function rejectCustomerEntry(entry) {
    entry.shakeT = 0;
  }

  // timeLeftMs: tiempo restante de la ronda (en ms) — solo para saber si
  // estamos en hora pico, igual que KitchenScene con isRushHour().
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
        // Una vez completo el pedido, deja de correr la paciencia — si no,
        // un vuelo lento podría dejarlo "sin paciencia" justo cuando ya
        // le estábamos llevando su platillo.
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

      // Platillos en vuelo hacia este cliente (si el estado cambió a
      // "leaving" mientras uno seguía en el aire, igual termina su viaje).
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

  // Para el botón "Jugar de nuevo": limpia a todos los clientes y platillos
  // en vuelo de la escena y regresa la simulación a su estado inicial —
  // incluyendo las mesas compradas, ya que también se compraron con
  // monedas de esta ronda que también se reinician.
  function reset() {
    for (const entry of active) {
      scene.remove(entry.mesh);
      scene.remove(entry.bubble.mesh);
      entry.flyingDishes.forEach((f) => { scene.remove(f.sprite); disposeDishSprite(f.sprite); });
    }
    active.length = 0;
    combo = 0;
    spawnTimer = randomSpawnDelay();

    while (tableMeshes.length > START_TABLES) scene.remove(tableMeshes.pop());
    tableCount = START_TABLES;

    spawnInitialCustomers();
  }

  // Que ya se vea vida en la barra desde el primer frame — sin esto, la
  // escena arranca vacía y hay que esperar 3-5s (el spawnInterval real
  // del nivel) a que aparezca el primer cliente.
  function spawnInitialCustomers() {
    trySpawn();
    trySpawn();
  }
  spawnInitialCustomers();

  return {
    update, reset,
    getCustomerEntryAt, getActiveCustomerGames, serveCustomerEntry, rejectCustomerEntry,
    buyTable, getTableCount,
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

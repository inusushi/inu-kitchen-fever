import * as THREE from 'three';
import { Station } from '../js/game/Station.js';
import { Plate } from '../js/game/Plate.js';
import { STATION_TYPES } from '../js/data/recipes.js';

const PROGRESS_REDRAW_INTERVAL = 0.1; // segundos entre redibujos de la barra

// Cocina real: usa las mismas clases Station y Plate que KitchenScene, con
// el mismo límite de 2 "mesas" (slots) en paralelo — antes de esto, tocar
// a un cliente entregaba el pedido de la nada. Ahora hay que pasarlo por
// sus estaciones de verdad (chop → plate para el nivel Onigiri; cook
// existe pero ningún platillo de este nivel lo usa).
export function createKitchenSim({ scene, camera, stationMeshes, slotCount = 2 }) {
  const slots = Array.from({ length: slotCount }, () => ({ plate: null }));

  const stations = {};
  const badges = {};
  for (const { type, emoji } of STATION_TYPES) {
    stations[type] = new Station(type, type, emoji, { burns: type === 'cook' });
    const badge = buildProgressBadge(emoji);
    scene.add(badge.mesh);
    badges[type] = badge;
  }

  function stationWorldPosition(type) {
    const mesh = stationMeshes[type];
    const v = new THREE.Vector3();
    mesh.getWorldPosition(v);
    return v;
  }

  // Busca en qué mesa hay un plato listo para avanzar en esta estación.
  function findSlotForStation(type) {
    return slots.findIndex(
      (s) => s.plate && s.plate.state === 'prepping' && !s.plate.atStation && s.plate.currentStep().station === type,
    );
  }

  function onStationTap(type) {
    const station = stations[type];
    if (!station) return false; // tipo desconocido — main.js ya filtra null, esto es solo por seguridad

    // Recoger lo que ya está listo (solo aplica a cook, la única que quema).
    if (station.waitingPickup) {
      station.collect();
      return true;
    }

    if (station.busy) return true; // ya está trabajando, el toque no hace nada más
    const slotIndex = findSlotForStation(type);
    if (slotIndex === -1) return false; // nada esperando en esta estación

    const plate = slots[slotIndex].plate;
    const duration = Math.max(300, plate.currentStep().duration);
    station.start(plate, duration);
    return true;
  }

  // Para decideCustomerTap: crea el plato en la primera mesa libre.
  function startPlate(recipe, slotIndex) {
    slots[slotIndex].plate = new Plate(recipe);
  }

  function clearSlot(slotIndex) {
    slots[slotIndex].plate = null;
  }

  // Para "Jugar de nuevo": ninguna estación se queda a medias ni con un
  // plato fantasma de la ronda anterior.
  function reset() {
    slots.forEach((s) => { s.plate = null; });
    for (const { type } of STATION_TYPES) {
      const station = stations[type];
      station.state = 'idle';
      station.plate = null;
      station.timeLeft = 0;
      station.burnLeft = 0;
    }
  }

  // Pedido de Dany: un cuadro grande arriba de cada estación para tocar
  // ahí, en vez de tener que acertarle al cuchillo/la llama/los platos
  // (geometría chica y quisquillosa, sobre todo en celular) — el toque
  // ahora se prueba contra la insignia, no contra la estación real.
  function getStationTypeAt(ndcX, ndcY) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
    for (const { type } of STATION_TYPES) {
      const hits = raycaster.intersectObject(badges[type].mesh, true);
      if (hits.length) return type;
    }
    return null;
  }

  // dt en segundos, como el resto de la demo — Station.update() espera
  // milisegundos (misma unidad que duration en recipes.js y que usa
  // KitchenScene.tick() de verdad), así que se convierte aquí adentro.
  function update(dt) {
    for (const { type } of STATION_TYPES) {
      const station = stations[type];
      const event = station.update(dt * 1000);
      if (event && event.type === 'burnt') {
        const idx = slots.findIndex((s) => s.plate === event.plate);
        if (idx !== -1) clearSlot(idx);
      }
      badges[type].refresh(station, dt, stationWorldPosition(type), camera);
    }
  }

  return {
    slots, stations,
    onStationTap, startPlate, clearSlot, update, getStationTypeAt, reset,
  };
}

// Botón cuadrado siempre visible arriba de cada estación — es tanto el
// blanco de toque (ver getStationTypeAt) como el indicador de progreso.
// Sin trabajo: solo el emoji, como una invitación a tocar. Trabajando:
// emoji más chico + barra de progreso abajo. cook en waitingPickup se
// pone rojo — "recógelo antes de que se queme".
function buildProgressBadge(emoji) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(0.55, 0.55);
  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 12;

  let lastBusy = null;
  let redrawTimer = 0;

  function draw(busy, ratio, urgent) {
    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = urgent ? 'rgba(255,90,90,0.92)' : busy ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.68)';
    roundRectPath(ctx, 4, 4, size - 8, size - 8, 22);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.lineWidth = 3;
    roundRectPath(ctx, 4, 4, size - 8, size - 8, 22);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${busy ? 42 : 54}px sans-serif`;
    ctx.fillText(emoji, size / 2, busy ? size * 0.38 : size / 2);

    if (busy) {
      const barX = 14;
      const barY = size - 26;
      const barW = size - 28;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(barX, barY, barW, 12);
      ctx.fillStyle = urgent ? '#ff5a5a' : '#4dd67a';
      ctx.fillRect(barX, barY, Math.max(barW * ratio, 3), 12);
    }
    texture.needsUpdate = true;
  }

  function refresh(station, dt, worldPos, camera) {
    mesh.position.set(worldPos.x, worldPos.y + 0.6, worldPos.z);
    if (camera) mesh.quaternion.copy(camera.quaternion);

    const busy = station.busy || station.waitingPickup;
    const urgent = station.waitingPickup;
    const ratio = urgent ? station.burnRatio() : station.progressRatio();

    redrawTimer += dt;
    const dueForRedraw = busy && redrawTimer > PROGRESS_REDRAW_INTERVAL;
    if (busy !== lastBusy || dueForRedraw) {
      redrawTimer = 0;
      lastBusy = busy;
      draw(busy, ratio, urgent);
    }
  }

  draw(false, 0, false); // estado inicial: idle, listo para tocarse
  return { mesh, refresh };
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

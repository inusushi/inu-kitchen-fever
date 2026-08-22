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

  function getStationTypeAt(ndcX, ndcY) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
    for (const { type } of STATION_TYPES) {
      const hits = raycaster.intersectObjects(stationMeshes[type].children, true);
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

// Insignia sobre cada estación: emoji arriba, barra de progreso abajo —
// misma idea visual que el globo de pedido de los clientes. Se pinta una
// vez y solo se redibuja la barra mientras la estación está ocupada.
function buildProgressBadge(emoji) {
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 60;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(0.5, 0.25);
  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 12;
  mesh.visible = false;

  let lastRatio = -1;
  let redrawTimer = 0;

  function draw(ratio, urgent) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, canvas.width / 2, 20);

    const barX = 10;
    const barY = 42;
    const barW = canvas.width - 20;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(barX, barY, barW, 10);
    ctx.fillStyle = urgent ? '#ff5a5a' : '#4dd67a';
    ctx.fillRect(barX, barY, Math.max(barW * ratio, 2), 10);
    texture.needsUpdate = true;
  }

  function refresh(station, dt, worldPos, camera) {
    mesh.visible = station.busy || station.waitingPickup;
    if (!mesh.visible) return;

    mesh.position.set(worldPos.x, worldPos.y + 0.55, worldPos.z);
    if (camera) mesh.quaternion.copy(camera.quaternion);

    redrawTimer += dt;
    const ratio = station.waitingPickup ? station.burnRatio() : station.progressRatio();
    if (redrawTimer > PROGRESS_REDRAW_INTERVAL || Math.abs(ratio - lastRatio) > 0.3) {
      redrawTimer = 0;
      lastRatio = ratio;
      draw(ratio, station.waitingPickup);
    }
  }

  return { mesh, refresh };
}

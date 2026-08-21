import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildChef } from './chef3d.js';
import { buildBackWall, buildSideWalls, buildBambooCluster, createPetalSystem } from './scene-environment.js';
import { buildCounter, buildChopStation, buildCookStation, buildPlateStation } from './kitchen-stations.js';
import { createQueueSim } from './queue-sim.js';
import { LEVELS } from '../js/data/levels.js';
import { isRushHour } from '../js/game/customerTypes.js';
import { calculateStars } from '../js/game/scoring.js';
import { formatTime } from '../js/utils/helpers.js';

const level = LEVELS[0]; // Onigiri — el primer nivel real del juego

const wrap = document.getElementById('canvas-wrap');

// Sala oscura tipo omakase: el cuarto se pierde en negro, y el muro
// pintado es el único punto claro — así el ojo va directo ahí.
const ROOM_DARK = '#0e0c10';

const scene = new THREE.Scene();
scene.background = new THREE.Color(ROOM_DARK);
// Rango de niebla ampliado junto con la cámara: con la vista más alejada
// para que quepa el cuarto completo, el muro lateral queda a ~15 unidades
// de la cámara — con el rango viejo (7-15) ya casi no se alcanzaba a ver.
scene.fog = new THREE.Fog(ROOM_DARK, 9, 26);

// Respaldo si el viewport todavía no tiene tamaño real (por ejemplo, un
// panel de vista previa que aún no se ha mostrado en pantalla).
function viewportSize() {
  const w = window.innerWidth || wrap.clientWidth || 800;
  const h = window.innerHeight || wrap.clientHeight || 600;
  return { w, h };
}

const { w: initW, h: initH } = viewportSize();
// Cámara más abierta y más atrás que en la Fase 1 (cuando solo existía
// el muro del fondo) — para que el encuadre por defecto ya muestre todo
// junto: los 2 chefs, la barra completa, la cola de clientes llegando, y
// las 2 paredes laterales. Verificado proyectando las esquinas de cada
// pared, los chefs, la barra y la entrada de clientes a coordenadas de
// pantalla — los 9 puntos caen dentro del cuadro con margen.
const camera = new THREE.PerspectiveCamera(56, initW / initH, 0.1, 100);
camera.position.set(0, 4, 9.9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(initW, initH);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
wrap.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.4, -0.6);
controls.enableDamping = true;
controls.minDistance = 3.5;
controls.maxDistance = 12;
controls.maxPolarAngle = Math.PI * 0.5;
// Sin la "cuarta pared", la cámara es el público de un foro de teatro —
// puede acercarse o alejarse, pero no rodear el set hasta salirse por
// donde estarían las paredes laterales (con maxDistance=12 y las paredes
// en x=±8.5, el peor caso — azimuth y distancia al tope — da x≈10.39 si
// no se limita; ±43° lo deja en x≈8.19, dentro de las paredes).
controls.minAzimuthAngle = -Math.PI * (43 / 180);
controls.maxAzimuthAngle = Math.PI * (43 / 180);

// --- Luces: cuarto oscuro, con un acento cálido sobre el muro pintado ---
scene.add(new THREE.AmbientLight('#4a3f55', 0.45));

// Luz de relleno pareja para todo el cuarto — sin dirección en X/Z (solo
// depende de qué tan "hacia arriba" mira cada superficie), así que las
// dos paredes laterales, que antes se veían disparejas porque solo una
// alcanzaba la luz principal, ahora reciben exactamente lo mismo.
const roomFill = new THREE.HemisphereLight('#5a4f68', '#171316', 0.55);
scene.add(roomFill);

// Luz de acento sobre el mural — la razón de que el gris claro del muro
// se lea contra el resto del cuarto en negro.
const wallLight = new THREE.SpotLight('#ffd9a0', 3.2, 14, Math.PI / 5, 0.6, 1.2);
wallLight.position.set(0, 5.5, 2);
wallLight.target.position.set(0, 2, -3);
wallLight.castShadow = false;
scene.add(wallLight, wallLight.target);

// Luz principal sobre el mostrador/personajes, con sombra.
const key = new THREE.DirectionalLight('#ffe3b8', 0.95);
key.position.set(3, 5, 4);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -6;
key.shadow.camera.right = 6;
key.shadow.camera.top = 6;
key.shadow.camera.bottom = -6;
scene.add(key);

const rim = new THREE.DirectionalLight('#c68fff', 0.35);
rim.position.set(-4, 3, -2);
scene.add(rim);

// --- Piso oscuro ---
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(9, 48),
  new THREE.MeshStandardMaterial({ color: '#171316', roughness: 0.85 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// --- Muro con el árbol de sakura pintado ---
scene.add(buildBackWall());

// --- Paredes laterales: cuarto de 3 paredes, sin la que mira a cámara ---
scene.add(buildSideWalls());

// --- Bambú, a los lados del muro ---
const bambooLeft = buildBambooCluster(3);
bambooLeft.position.set(-4.3, 0, -1.6);
scene.add(bambooLeft);

const bambooRight = buildBambooCluster(3);
bambooRight.position.set(4.3, 0, -1.6);
scene.add(bambooRight);

// --- Pétalos flotando frente al muro ---
const petals = createPetalSystem(40);
scene.add(petals.group);

// --- Barra de la cocina, con las 3 estaciones reales del juego (chop,
// cook, plate — mismo orden y significado que STATION_TYPES en recipes.js) ---
const counter = buildCounter();
counter.position.set(0, 0, -1.85);
scene.add(counter);

const counterTopY = counter.userData.topY;
const stationZ = -1.85;

const chopStation = buildChopStation();
chopStation.position.set(-2.1, counterTopY, stationZ);
scene.add(chopStation);

const cookStation = buildCookStation();
cookStation.group.position.set(0, counterTopY, stationZ);
scene.add(cookStation.group);

const plateStation = buildPlateStation();
plateStation.position.set(2.1, counterTopY, stationZ);
scene.add(plateStation);

// --- 2 cocineros, en chop y plate — cook se queda sin chef propio, el
// fuego animado ya le da vida a esa estación por su cuenta ---
const chefZ = stationZ - 0.65;
const chefs = [
  { x: -2.1, accent: '#4a4a52', phase: 0 },
  { x: 2.1, accent: '#2d6e6e', phase: 2.3 },
].map(({ x, accent, phase }) => {
  const chef = buildChef({ accent });
  chef.position.set(x, 0, chefZ);
  chef.userData.phase = phase;
  scene.add(chef);
  return chef;
});

// --- HUD real: monedas, timer, combo y hora pico (mismas piezas que
// KitchenScene: serveReward, isRushHour, calculateStars) ---
const coinsEl = document.getElementById('coins-badge');
const timerEl = document.getElementById('timer-badge');
const comboEl = document.getElementById('combo-badge');
const rushEl = document.getElementById('rush-badge');
const resultOverlay = document.getElementById('result-overlay');
const resultStars = document.getElementById('result-stars');
const resultCoins = document.getElementById('result-coins');
const btnRestart = document.getElementById('btn-restart');

let coinsEarned = 0;
let timeLeft = level.duration;
let roundOver = false;

function startRound() {
  coinsEarned = 0;
  timeLeft = level.duration;
  roundOver = false;
  coinsEl.textContent = `💰 ${coinsEarned}`;
  timerEl.textContent = formatTime(timeLeft);
  timerEl.classList.remove('urgent');
  comboEl.classList.add('hidden');
  rushEl.classList.add('hidden');
  resultOverlay.classList.add('hidden');
}

function endRound() {
  roundOver = true;
  const stars = calculateStars(coinsEarned, level.starGoals);
  resultStars.textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  resultCoins.textContent = `💰 ${coinsEarned} monedas`;
  resultOverlay.classList.remove('hidden');
}

btnRestart.addEventListener('click', () => {
  queueSim.reset();
  startRound();
});

// --- Cola de clientes real, nivel Onigiri (el primero del juego real) ---
const queueSim = createQueueSim({
  scene, camera, level, platePosition: plateStation.position,
  onServed: (coins, combo) => {
    coinsEarned += coins;
    coinsEl.textContent = `💰 ${coinsEarned}`;
    comboEl.textContent = `🔥 x${combo}`;
    comboEl.classList.toggle('hidden', combo < 2);
  },
  onLeft: () => comboEl.classList.add('hidden'),
});
startRound();

let pointerDownAt = null;
renderer.domElement.addEventListener('pointerdown', (e) => {
  pointerDownAt = { x: e.clientX, y: e.clientY };
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!pointerDownAt) return;
  const moved = Math.hypot(e.clientX - pointerDownAt.x, e.clientY - pointerDownAt.y);
  pointerDownAt = null;
  if (moved > 6) return; // fue un arrastre de cámara, no un toque a un cliente

  const rect = renderer.domElement.getBoundingClientRect();
  const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  queueSim.tryServe(ndcX, ndcY);
});

window.addEventListener('resize', () => {
  const { w, h } = viewportSize();
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

const clock = new THREE.Clock();
function animate() {
  // getElapsedTime() llama a getDelta() por dentro — pedir los dos por
  // separado hacía que este getDelta() midiera el tiempo entre esas dos
  // líneas (microsegundos) en vez del tiempo real entre frames. Por eso
  // nada que dependiera de dt avanzaba: ni los clientes caminaban, ni
  // bajaba el timer, ni caían los pétalos — solo lo que usa t (los
  // vaivenes) se movía, dando la sensación de una escena congelada.
  const dt = clock.getDelta();
  const t = clock.elapsedTime;

  if (!roundOver) {
    timeLeft = Math.max(0, timeLeft - dt * 1000);
    timerEl.textContent = formatTime(timeLeft);
    timerEl.classList.toggle('urgent', timeLeft < 10000);
    rushEl.classList.toggle('hidden', !isRushHour(timeLeft, level.duration));

    queueSim.update(dt, t, timeLeft);
    if (timeLeft <= 0) endRound();
  }

  // El resto de la escena (chefs, pétalos, la llama) sigue con vida aunque
  // la ronda haya terminado — solo se congela la cola de clientes.
  chefs.forEach((chef) => {
    const phase = chef.userData.phase;
    chef.position.y = Math.sin(t * 1.4 + phase) * 0.025;
    // Inclinación hacia la barra, como si estuvieran trabajando en algo.
    chef.rotation.x = 0.08 + Math.sin(t * 2.2 + phase) * 0.03;
    chef.userData.parts.head.rotation.x = Math.sin(t * 2.2 + phase) * 0.08;
  });

  petals.update(dt, t);
  cookStation.update(dt, t);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildChef } from './chef3d.js';
import { buildBackWall, buildBambooCluster, createPetalSystem } from './scene-environment.js';
import { buildCounter, buildChopStation, buildCookStation, buildPlateStation } from './kitchen-stations.js';
import { createQueueSim } from './queue-sim.js';
import { LEVELS } from '../js/data/levels.js';

const wrap = document.getElementById('canvas-wrap');

// Sala oscura tipo omakase: el cuarto se pierde en negro, y el muro
// pintado es el único punto claro — así el ojo va directo ahí.
const ROOM_DARK = '#0e0c10';

const scene = new THREE.Scene();
scene.background = new THREE.Color(ROOM_DARK);
scene.fog = new THREE.Fog(ROOM_DARK, 7, 15);

// Respaldo si el viewport todavía no tiene tamaño real (por ejemplo, un
// panel de vista previa que aún no se ha mostrado en pantalla).
function viewportSize() {
  const w = window.innerWidth || wrap.clientWidth || 800;
  const h = window.innerHeight || wrap.clientHeight || 600;
  return { w, h };
}

const { w: initW, h: initH } = viewportSize();
const camera = new THREE.PerspectiveCamera(40, initW / initH, 0.1, 100);
camera.position.set(0, 2.2, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(initW, initH);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
wrap.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.2, -1.4);
controls.enableDamping = true;
controls.minDistance = 3.5;
controls.maxDistance = 12;
controls.maxPolarAngle = Math.PI * 0.5;

// --- Luces: cuarto oscuro, con un acento cálido sobre el muro pintado ---
scene.add(new THREE.AmbientLight('#4a3f55', 0.35));

// Luz de acento sobre el mural — la razón de que el gris claro del muro
// se lea contra el resto del cuarto en negro.
const wallLight = new THREE.SpotLight('#ffd9a0', 3.2, 14, Math.PI / 5, 0.6, 1.2);
wallLight.position.set(0, 5.5, 2);
wallLight.target.position.set(0, 2, -3);
wallLight.castShadow = false;
scene.add(wallLight, wallLight.target);

// Luz principal sobre el mostrador/personajes, con sombra.
const key = new THREE.DirectionalLight('#ffe3b8', 0.9);
key.position.set(3, 5, 4);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -6;
key.shadow.camera.right = 6;
key.shadow.camera.top = 6;
key.shadow.camera.bottom = -6;
scene.add(key);

const rim = new THREE.DirectionalLight('#c68fff', 0.25);
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

// --- Bambú, a los lados del muro ---
const bambooLeft = buildBambooCluster(3);
bambooLeft.position.set(-4.3, 0, -1.6);
scene.add(bambooLeft);

const bambooRight = buildBambooCluster(3);
bambooRight.position.set(4.3, 0, -1.6);
scene.add(bambooRight);

// --- Pétalos flotando frente al muro ---
const petals = createPetalSystem(30);
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

// --- Un cocinero parado detrás de cada estación (COOK_AVATARS en
// js/game/avatars.js: los 3 son emoji de chef, solo cambia el acento) ---
const chefZ = stationZ - 0.65;
const chefs = [
  { x: -2.1, accent: '#4a4a52', phase: 0 },
  { x: 0, accent: '#a13c22', phase: 1.1 },
  { x: 2.1, accent: '#2d6e6e', phase: 2.3 },
].map(({ x, accent, phase }) => {
  const chef = buildChef({ accent });
  chef.position.set(x, 0, chefZ);
  chef.userData.phase = phase;
  scene.add(chef);
  return chef;
});

// --- Cola de clientes real, nivel Onigiri (el primero del juego real) ---
const queueSim = createQueueSim({ scene, camera, level: LEVELS[0], platePosition: plateStation.position });

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
  const t = clock.getElapsedTime();
  const dt = clock.getDelta();

  queueSim.update(dt, t);

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

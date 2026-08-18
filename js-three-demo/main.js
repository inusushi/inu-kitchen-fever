import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildCustomer } from './customer3d.js';
import { buildBackWall, buildBambooCluster, createPetalSystem } from './scene-environment.js';
import { CUSTOMERS } from '../js/game/avatars.js';

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
controls.target.set(0, 1.4, -1);
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

// --- 4 clientes, con el mismo catálogo de atuendos que ya usa el juego ---
const roster = [CUSTOMERS[1], CUSTOMERS[8], CUSTOMERS[10], CUSTOMERS[4]];
const customers = roster.map((design, i) => {
  const c = buildCustomer({ outfit: design.outfit, mood: 'happy' });
  const spread = (i - (roster.length - 1) / 2) * 1.5;
  c.position.x = spread;
  c.userData.baseX = spread;
  c.userData.phase = i * 0.7;
  scene.add(c);
  return c;
});

let walking = false;
const btnIdle = document.getElementById('btn-idle');
const btnWalk = document.getElementById('btn-walk');
const btnMood = document.getElementById('btn-mood');
const moods = ['happy', 'meh', 'annoyed'];
let moodIndex = 0;

btnIdle.addEventListener('click', () => {
  walking = false;
  btnIdle.classList.add('active');
  btnWalk.classList.remove('active');
});
btnWalk.addEventListener('click', () => {
  walking = true;
  btnWalk.classList.add('active');
  btnIdle.classList.remove('active');
});
btnMood.addEventListener('click', () => {
  moodIndex = (moodIndex + 1) % moods.length;
  customers.forEach((c) => c.userData.setMood(moods[moodIndex]));
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

  customers.forEach((c) => {
    const phase = t * 5 + c.userData.phase;
    if (walking) {
      c.position.x = c.userData.baseX + Math.sin(t * 0.6 + c.userData.phase) * 0.6;
      c.position.y = Math.abs(Math.sin(phase)) * 0.12;
      c.rotation.z = Math.sin(phase) * 0.06;
      c.userData.parts.footL.rotation.x = Math.sin(phase) * 0.6;
      c.userData.parts.footR.rotation.x = Math.sin(phase + Math.PI) * 0.6;
      c.rotation.y = Math.sin(t * 0.6 + c.userData.phase) > 0 ? 0.15 : -0.15;
    } else {
      c.position.x = c.userData.baseX;
      c.position.y = Math.sin(t * 1.6 + c.userData.phase) * 0.03;
      c.rotation.z = 0;
      c.rotation.y = Math.sin(t * 0.4 + c.userData.phase) * 0.15;
      c.userData.parts.footL.rotation.x = 0;
      c.userData.parts.footR.rotation.x = 0;
    }
  });

  petals.update(dt, t);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

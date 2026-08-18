import * as THREE from 'three';

// --- Barra: base de madera oscura + tapa de madera clara, como una
// barra de omakase real (hinoki claro sobre una base oscura). ---
export function buildCounter({ width = 7.4, depth = 0.85, height = 1.05 } = {}) {
  const group = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({ color: '#3d2a20', roughness: 0.75 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), baseMat);
  base.position.y = height / 2;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const topMat = new THREE.MeshStandardMaterial({ color: '#c9a877', roughness: 0.5 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(width + 0.12, 0.06, depth + 0.12), topMat);
  top.position.y = height + 0.03;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // Dónde deben pararse las estaciones para quedar apoyadas en la tapa.
  group.userData.topY = height + 0.06;
  return group;
}

// --- Estación "chop" (🔪 Preparar): tabla + cuchillo recargado ---
export function buildChopStation() {
  const group = new THREE.Group();

  const boardMat = new THREE.MeshStandardMaterial({ color: '#d8b378', roughness: 0.6 });
  const board = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 24), boardMat);
  board.castShadow = true;
  board.receiveShadow = true;
  group.add(board);

  const knife = new THREE.Group();
  const bladeMat = new THREE.MeshStandardMaterial({ color: '#d7dde3', metalness: 0.7, roughness: 0.25 });
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.025, 0.075), bladeMat);
  blade.castShadow = true;
  knife.add(blade);

  const handleMat = new THREE.MeshStandardMaterial({ color: '#2b1c14', roughness: 0.7 });
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.16, 8), handleMat);
  handle.rotation.z = Math.PI / 2;
  handle.position.x = -0.31;
  knife.add(handle);

  knife.position.y = 0.045;
  knife.rotation.y = 0.5;
  group.add(knife);

  return group;
}

// --- Estación "cook" (🔥 Freír / Vapor): wok + llama que titila ---
export function buildCookStation() {
  const group = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({ color: '#2c2c2e', metalness: 0.4, roughness: 0.5 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.14, 20), baseMat);
  base.position.y = 0.07;
  base.castShadow = true;
  group.add(base);

  const panMat = new THREE.MeshStandardMaterial({ color: '#57595c', metalness: 0.6, roughness: 0.3 });
  const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.09, 20, 1, true), panMat);
  pan.position.y = 0.19;
  pan.castShadow = true;
  group.add(pan);

  // Llama con dos conos emisivos en vez de un sistema de partículas —
  // más barato y, a esta escala, se lee igual de bien.
  const flame = new THREE.Group();
  const outerMat = new THREE.MeshStandardMaterial({
    color: '#ff7a1f', emissive: '#ff5b00', emissiveIntensity: 1.4,
    transparent: true, opacity: 0.85,
  });
  const outer = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 10), outerMat);
  outer.position.y = 0.13;
  flame.add(outer);

  const innerMat = new THREE.MeshStandardMaterial({
    color: '#ffe066', emissive: '#ffcc33', emissiveIntensity: 1.8,
    transparent: true, opacity: 0.9,
  });
  const inner = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 10), innerMat);
  inner.position.y = 0.1;
  flame.add(inner);

  flame.position.y = 0.24;
  group.add(flame);

  const flameLight = new THREE.PointLight('#ff8c33', 1.1, 2.4, 2);
  flameLight.position.y = 0.3;
  group.add(flameLight);

  function update(dt, t) {
    const flick = Math.sin(t * 14) * 0.06 + Math.sin(t * 27 + 1.3) * 0.04;
    flame.scale.set(1, 1 + flick, 1);
    flame.rotation.y += dt * 1.4;
    flameLight.intensity = 1.1 + flick * 3;
  }

  return { group, update };
}

// --- Estación "plate" (🍽️ Armar): pila de platos + palillos ---
export function buildPlateStation() {
  const group = new THREE.Group();
  const plateMat = new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: 0.35 });

  const count = 4;
  for (let i = 0; i < count; i++) {
    const r = 0.34 - i * 0.005;
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.025, 28), plateMat);
    plate.position.y = i * 0.03;
    plate.castShadow = true;
    plate.receiveShadow = true;
    group.add(plate);
  }

  const stickMat = new THREE.MeshStandardMaterial({ color: '#7a5230', roughness: 0.6 });
  for (let i = 0; i < 2; i++) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 6), stickMat);
    stick.position.set(0.06 + i * 0.03, count * 0.03 + 0.02, 0.02);
    stick.rotation.z = Math.PI / 2.1;
    stick.rotation.y = 0.15;
    group.add(stick);
  }

  return group;
}

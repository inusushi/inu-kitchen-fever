import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const textureLoader = new THREE.TextureLoader();

// --- Muro con el árbol de sakura ---
// Ilustración real que mandó Dany (public/fotos/mural-sakura.jpg, 1408×768
// = 1.833 de aspecto), ya no el dibujo procedural de prueba. El alto de la
// pared se ajusta a ese aspecto para que la imagen no se estire.
export function buildBackWall({ width = 11, height = width / (1408 / 768) } = {}) {
  const texture = textureLoader.load('fotos/mural-sakura.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const geo = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.95 });
  const wall = new THREE.Mesh(geo, mat);
  wall.position.set(0, height / 2 - 0.1, -3.05);
  wall.receiveShadow = true;
  return wall;
}

// --- Piso de bambú ---
// Duelas pintadas en canvas (mismo truco que las caras y el mural viejo):
// tono cálido, una franja por duela con su propia variación de color, línea
// de junta entre cada una y "nudos" horizontales sueltos, para que se lea
// como bambú y no como madera genérica. Se repite (RepeatWrapping) sobre
// el piso circular, no es una sola imagen estirada.
export function buildFloorTexture({ repeat = 18 } = {}) {
  const w = 256;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const plankW = w / 4;
  for (let i = 0; i < 4; i++) {
    const shade = 0.85 + Math.random() * 0.3;
    const r = Math.round(90 * shade);
    const g = Math.round(62 * shade);
    const b = Math.round(38 * shade);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(i * plankW, 0, plankW, h);

    // Veta: un par de líneas horizontales suaves por duela.
    ctx.strokeStyle = `rgba(0,0,0,0.12)`;
    ctx.lineWidth = 1;
    for (let n = 0; n < 3; n++) {
      const y = (n + 0.5) * (h / 3) + (Math.random() * 10 - 5);
      ctx.beginPath();
      ctx.moveTo(i * plankW + 4, y);
      ctx.lineTo(i * plankW + plankW - 4, y);
      ctx.stroke();
    }

    // "Nudo" del bambú: un arco oscuro cruzando la duela.
    const knotY = h * (0.25 + Math.random() * 0.5);
    ctx.strokeStyle = 'rgba(20,12,6,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(i * plankW, knotY);
    ctx.quadraticCurveTo(i * plankW + plankW / 2, knotY + 6, i * plankW + plankW, knotY - 4);
    ctx.stroke();

    // Junta entre duelas.
    ctx.strokeStyle = 'rgba(15,9,5,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(i * plankW, 0);
    ctx.lineTo(i * plankW, h);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = 4;
  return texture;
}

// --- Paredes laterales: cuarto de 3 paredes, sin la "cuarta pared" que
// mira a cámara — como un foro de teatro, se ve hacia adentro pero nada
// bloquea la vista del público. Mismo tono oscuro que el piso, para que
// se sientan parte del mismo cascarón y no le quiten protagonismo al
// muro del mural. Quedan más allá de por dónde entran/salen los
// clientes (ver ENTRY_X/EXIT_HAPPY_X en queue-sim.js) para que nadie
// camine "a través" de una pared.
export function buildSideWalls({ x = 8.5, zFrom = -3.15, zTo = 6, height = 7 } = {}) {
  const mat = new THREE.MeshStandardMaterial({ color: '#171316', roughness: 0.9 });
  const geo = new THREE.PlaneGeometry(zTo - zFrom, height);
  const y = height / 2 - 0.1;
  const centerZ = (zFrom + zTo) / 2;

  const left = new THREE.Mesh(geo, mat);
  left.position.set(-x, y, centerZ);
  left.rotation.y = Math.PI / 2; // normal hacia +X: mira hacia adentro del cuarto
  left.receiveShadow = true;

  const right = new THREE.Mesh(geo, mat);
  right.position.set(x, y, centerZ);
  right.rotation.y = -Math.PI / 2; // normal hacia -X: mira hacia adentro del cuarto
  right.receiveShadow = true;

  const group = new THREE.Group();
  group.add(left, right);
  return group;
}

// --- Bambú: cilindros reales, no una textura ---
// Cada tallo es 100% estático (nunca se mueve tras colocarse), así que en
// vez de dejar cada segmento/anillo/hoja como su propio Mesh — 36 draw
// calls por cada llamada a esta función, 72 entre los 2 grupos de la
// escena — horneamos la posición de cada pieza directo en su geometría
// (con una jerarquía temporal que nunca se agrega a la escena, solo para
// que Three.js calcule las matrices) y fundimos todo en 3 mallas, una
// por material. Mismo resultado visual, 24 veces menos draw calls.
export function buildBambooCluster(count = 3) {
  const stalkMat = new THREE.MeshStandardMaterial({ color: '#4f7a3d', roughness: 0.55 });
  const ringMat = new THREE.MeshStandardMaterial({ color: '#33512a', roughness: 0.6 });
  const leafMat = new THREE.MeshStandardMaterial({ color: '#6fae52', roughness: 0.6, side: THREE.DoubleSide });

  const tempRoot = new THREE.Group();
  const segMeshes = [];
  const ringMeshes = [];
  const leafMeshes = [];

  for (let i = 0; i < count; i++) {
    const stalkHeight = 3.2 + Math.random() * 0.9;
    const radius = 0.09 + Math.random() * 0.02;
    const stalk = new THREE.Group();

    const segments = 5;
    const segH = stalkHeight / segments;
    for (let s = 0; s < segments; s++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, segH * 0.92, 10));
      seg.position.y = segH * s + segH / 2;
      stalk.add(seg);
      segMeshes.push(seg);

      if (s < segments - 1) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.02, radius * 0.16, 6, 12));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = segH * (s + 1);
        stalk.add(ring);
        ringMeshes.push(ring);
      }
    }

    // Un par de hojas cerca de la punta.
    for (let l = 0; l < 3; l++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.5, 4, 1, true));
      leaf.position.set(0, stalkHeight - 0.4 + l * 0.25, 0);
      leaf.rotation.z = (Math.random() - 0.5) * 1.2;
      leaf.rotation.x = 0.3 + Math.random() * 0.4;
      stalk.add(leaf);
      leafMeshes.push(leaf);
    }

    stalk.position.set(i * 0.22 - (count - 1) * 0.11, 0, i * 0.08);
    stalk.rotation.y = Math.random() * Math.PI;
    tempRoot.add(stalk);
  }

  tempRoot.updateMatrixWorld(true);
  const bake = (meshes) => mergeGeometries(meshes.map((m) => m.geometry.clone().applyMatrix4(m.matrixWorld)));

  const group = new THREE.Group();
  const stalksMesh = new THREE.Mesh(bake(segMeshes), stalkMat);
  stalksMesh.castShadow = true; // igual que antes: solo los tallos, no anillos ni hojas
  const ringsMesh = new THREE.Mesh(bake(ringMeshes), ringMat);
  const leavesMesh = new THREE.Mesh(bake(leafMeshes), leafMat);
  group.add(stalksMesh, ringsMesh, leavesMesh);

  return group;
}

// --- Pétalos flotando frente al muro ---
// Antes eran 30 Mesh independientes (30 draw calls) solo para agitar cada
// uno con su propio vaivén. Un InstancedMesh renderiza los 30 en una sola
// llamada; cada pétalo sigue siendo libre de moverse por su cuenta porque
// solo actualizamos su matriz de transformación, no su geometría.
export function createPetalSystem(count = 26) {
  const petalGeo = new THREE.PlaneGeometry(0.09, 0.06);
  const petalMat = new THREE.MeshStandardMaterial({
    color: '#f6a8c4',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    roughness: 0.4,
  });

  const instanced = new THREE.InstancedMesh(petalGeo, petalMat, count);
  instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  // Los pétalos se reparten en un área más grande que su geometría base;
  // sin esto, Three.js podría recortarlos por error de cámara al calcular
  // el volumen de recorte solo con el tamaño de un pétalo suelto.
  instanced.frustumCulled = false;

  const dummy = new THREE.Object3D();
  const petals = [];

  for (let i = 0; i < count; i++) {
    const p = {
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      fallSpeed: 0.25 + Math.random() * 0.35,
      swaySpeed: 0.6 + Math.random() * 0.8,
      swayAmount: 0.3 + Math.random() * 0.5,
      spinSpeed: (Math.random() - 0.5) * 1.5,
      phase: Math.random() * Math.PI * 2,
    };
    resetPetal(p, true);
    petals.push(p);
  }

  function resetPetal(p, randomHeight) {
    p.position.set(
      // Ancho ajustado a las paredes laterales (x=±8.5) — antes era ±4,
      // de cuando el cuarto era solo el muro del fondo, y se veían como
      // una franja angosta en medio de un cuarto ya mucho más grande.
      (Math.random() - 0.5) * 16,
      randomHeight ? Math.random() * 5 : 5 + Math.random() * 1.5,
      -2.6 + Math.random() * 1.4,
    );
    p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  }

  function update(dt, t) {
    petals.forEach((p, i) => {
      p.position.y -= p.fallSpeed * dt;
      p.position.x += Math.sin(t * p.swaySpeed + p.phase) * p.swayAmount * dt;
      p.rotation.z += p.spinSpeed * dt;
      p.rotation.x += p.spinSpeed * 0.6 * dt;
      if (p.position.y < -0.2) resetPetal(p, false);

      dummy.position.copy(p.position);
      dummy.rotation.copy(p.rotation);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    });
    instanced.instanceMatrix.needsUpdate = true;
  }

  return { group: instanced, update };
}

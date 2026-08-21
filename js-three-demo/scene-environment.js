import * as THREE from 'three';

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

// --- Bambú: cilindros reales, no una textura ---
export function buildBambooCluster(count = 3) {
  const group = new THREE.Group();
  const stalkMat = new THREE.MeshStandardMaterial({ color: '#4f7a3d', roughness: 0.55 });
  const ringMat = new THREE.MeshStandardMaterial({ color: '#33512a', roughness: 0.6 });
  const leafMat = new THREE.MeshStandardMaterial({ color: '#6fae52', roughness: 0.6, side: THREE.DoubleSide });

  for (let i = 0; i < count; i++) {
    const stalkHeight = 3.2 + Math.random() * 0.9;
    const radius = 0.09 + Math.random() * 0.02;
    const stalk = new THREE.Group();

    const segments = 5;
    const segH = stalkHeight / segments;
    for (let s = 0; s < segments; s++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, segH * 0.92, 10), stalkMat);
      seg.position.y = segH * s + segH / 2;
      seg.castShadow = true;
      stalk.add(seg);

      if (s < segments - 1) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.02, radius * 0.16, 6, 12), ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = segH * (s + 1);
        stalk.add(ring);
      }
    }

    // Un par de hojas cerca de la punta.
    for (let l = 0; l < 3; l++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.5, 4, 1, true), leafMat);
      leaf.position.set(0, stalkHeight - 0.4 + l * 0.25, 0);
      leaf.rotation.z = (Math.random() - 0.5) * 1.2;
      leaf.rotation.x = 0.3 + Math.random() * 0.4;
      stalk.add(leaf);
    }

    stalk.position.set(i * 0.22 - (count - 1) * 0.11, 0, i * 0.08);
    stalk.rotation.y = Math.random() * Math.PI;
    group.add(stalk);
  }

  return group;
}

// --- Pétalos flotando frente al muro ---
export function createPetalSystem(count = 26) {
  const petalGeo = new THREE.PlaneGeometry(0.09, 0.06);
  const petalMat = new THREE.MeshStandardMaterial({
    color: '#f6a8c4',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    roughness: 0.4,
  });

  const group = new THREE.Group();
  const petals = [];

  for (let i = 0; i < count; i++) {
    const petal = new THREE.Mesh(petalGeo, petalMat);
    resetPetal(petal, true);
    group.add(petal);
    petals.push({
      mesh: petal,
      fallSpeed: 0.25 + Math.random() * 0.35,
      swaySpeed: 0.6 + Math.random() * 0.8,
      swayAmount: 0.3 + Math.random() * 0.5,
      spinSpeed: (Math.random() - 0.5) * 1.5,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function resetPetal(mesh, randomHeight) {
    mesh.position.set(
      (Math.random() - 0.5) * 8,
      randomHeight ? Math.random() * 5 : 5 + Math.random() * 1.5,
      -2.6 + Math.random() * 1.4,
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  }

  function update(dt, t) {
    for (const p of petals) {
      p.mesh.position.y -= p.fallSpeed * dt;
      p.mesh.position.x += Math.sin(t * p.swaySpeed + p.phase) * p.swayAmount * dt;
      p.mesh.rotation.z += p.spinSpeed * dt;
      p.mesh.rotation.x += p.spinSpeed * 0.6 * dt;
      if (p.mesh.position.y < -0.2) resetPetal(p.mesh, false);
    }
  }

  return { group, update };
}

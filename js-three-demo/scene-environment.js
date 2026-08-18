import * as THREE from 'three';

// --- Muro con el árbol de sakura pintado ---
// Mismo truco que la cara de los clientes: se dibuja en un <canvas> 2D
// normal y se usa como textura. Nada de esto necesita un asset externo.
export function buildBackWall({ width = 11, height = 5.4 } = {}) {
  const texture = paintSakuraMural();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const geo = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.95 });
  const wall = new THREE.Mesh(geo, mat);
  wall.position.set(0, height / 2 - 0.1, -3.05);
  wall.receiveShadow = true;
  return wall;
}

function paintSakuraMural() {
  const w = 1400;
  const h = 700;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Gris claro, tal como se pidió — un poco de degradado para que no
  // se vea plano bajo la luz de la escena.
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#e9e5dd');
  bg.addColorStop(1, '#dcd6c9');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Textura de papel muy sutil.
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 700; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }
  ctx.globalAlpha = 1;

  drawSakuraTree(ctx, w, h);
  drawLoosePetals(ctx, w, h, 34);

  return new THREE.CanvasTexture(canvas);
}

function drawSakuraTree(ctx, w, h) {
  const baseX = w * 0.28;
  const baseY = h * 0.98;

  ctx.strokeStyle = '#3a2e26';
  ctx.lineCap = 'round';

  // Tronco y ramas: varias pasadas de una curva a mano alzada, cada vez
  // más delgada, para que se lea como pincelada de tinta y no como línea recta.
  const branches = [
    { from: [baseX, baseY], to: [baseX + 40, h * 0.55], width: 34 },
    { from: [baseX + 40, h * 0.55], to: [baseX - 60, h * 0.32], width: 20 },
    { from: [baseX + 40, h * 0.55], to: [baseX + 160, h * 0.28], width: 20 },
    { from: [baseX - 60, h * 0.32], to: [baseX - 170, h * 0.12], width: 11 },
    { from: [baseX - 60, h * 0.32], to: [baseX + 10, h * 0.1], width: 11 },
    { from: [baseX + 160, h * 0.28], to: [baseX + 260, h * 0.08], width: 11 },
    { from: [baseX + 160, h * 0.28], to: [baseX + 340, h * 0.3], width: 10 },
  ];

  branches.forEach(({ from, to, width }) => {
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    const midX = (from[0] + to[0]) / 2 + (Math.random() * 40 - 20);
    const midY = (from[1] + to[1]) / 2;
    ctx.quadraticCurveTo(midX, midY, to[0], to[1]);
    ctx.stroke();
  });

  // Racimos de flores: círculos suaves en dos tonos de rosa, agrupados
  // en las puntas de las ramas.
  const clusters = [
    [baseX - 170, h * 0.12], [baseX + 10, h * 0.1], [baseX - 60, h * 0.28],
    [baseX + 260, h * 0.08], [baseX + 340, h * 0.3], [baseX + 160, h * 0.24],
    [baseX + 40, h * 0.5], [baseX - 100, h * 0.18],
  ];

  clusters.forEach(([cx, cy]) => {
    for (let i = 0; i < 26; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 55;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist * 0.7;
      const r = 7 + Math.random() * 9;
      ctx.fillStyle = Math.random() > 0.35 ? 'rgba(247,197,214,0.9)' : 'rgba(238,150,178,0.85)';
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawLoosePetals(ctx, w, h, count) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = h * 0.15 + Math.random() * h * 0.75;
    const size = 6 + Math.random() * 10;
    const rot = Math.random() * Math.PI;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = `rgba(240, 170, 195, ${0.4 + Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
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

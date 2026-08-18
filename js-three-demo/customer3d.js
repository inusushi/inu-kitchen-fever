import * as THREE from 'three';

// Construye el mismo "diseño de cliente" que ya existe en el juego
// (cara + color de atuendo, ver js/game/avatars.js) pero como una figura
// 3D real en vez de un div plano. Devuelve un THREE.Group animable.
export function buildCustomer({ outfit = '#5b8def', skin = '#f2c9a0', mood = 'happy' } = {}) {
  const group = new THREE.Group();

  // --- Cuerpo: una cápsula suave, más kawaii que una caja dura ---
  const bodyGeo = new THREE.CapsuleGeometry(0.42, 0.55, 6, 16);
  const bodyMat = new THREE.MeshStandardMaterial({ color: outfit, roughness: 0.55, metalness: 0.05 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.62;
  body.castShadow = true;
  group.add(body);

  // --- Cabeza: esfera con textura de cara pintada en canvas ---
  const headGeo = new THREE.SphereGeometry(0.4, 32, 32);
  const faceTexture = buildFaceTexture(mood, skin);
  const headMat = new THREE.MeshStandardMaterial({ map: faceTexture, roughness: 0.6 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.42;
  head.castShadow = true;
  group.add(head);

  // --- Pies: dos cápsulas chicas, para que la caminata se lea ---
  const footGeo = new THREE.CapsuleGeometry(0.11, 0.12, 4, 8);
  const footMat = new THREE.MeshStandardMaterial({ color: '#2a2233', roughness: 0.8 });
  const footL = new THREE.Mesh(footGeo, footMat);
  footL.position.set(-0.18, 0.13, 0.05);
  const footR = footL.clone();
  footR.position.x = 0.18;
  group.add(footL, footR);

  group.userData.parts = { body, head, footL, footR };
  group.userData.mood = mood;
  group.userData.setMood = (next) => {
    group.userData.mood = next;
    headMat.map = buildFaceTexture(next, skin);
    headMat.needsUpdate = true;
  };

  return group;
}

// La cara se pinta en un <canvas> normal — el mismo truco que ya usa el
// juego para las fotos de platillos, solo que aquí es una textura de Three.
function buildFaceTexture(mood, skin) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = skin;
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const eyeY = size * 0.46;
  ctx.fillStyle = '#2a2018';
  ctx.beginPath();
  ctx.ellipse(cx - 38, eyeY, 10, 13, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 38, eyeY, 10, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mejillas: el toque "kawaii premium" del que habla la marca.
  ctx.fillStyle = 'rgba(255,130,130,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx - 62, eyeY + 30, 16, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 62, eyeY + 30, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#2a2018';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (mood === 'happy') {
    ctx.arc(cx, eyeY + 22, 26, 0.15 * Math.PI, 0.85 * Math.PI);
  } else if (mood === 'annoyed') {
    ctx.moveTo(cx - 20, eyeY + 42);
    ctx.lineTo(cx + 20, eyeY + 42);
  } else {
    ctx.arc(cx, eyeY + 48, 22, Math.PI * 1.15, Math.PI * 1.85, true);
  }
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

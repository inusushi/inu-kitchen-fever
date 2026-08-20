import * as THREE from 'three';
import { buildFaceTexture } from './customer3d.js';

// Mismo plan de cuerpo que el cliente (cápsula + cabeza esférica), pero con
// gorro y mandil — así se lee "cocinero" sin necesitar arte nuevo. El
// acento de color del mandil varía por estación (ver COOK_AVATARS en
// js/game/avatars.js: los tres son emoji de chef, no hace falta variar
// la cara, solo un detalle de color por puesto).
export function buildChef({ skin = '#e0b088', accent = '#3a3a3a' } = {}) {
  const group = new THREE.Group();

  const jacketMat = new THREE.MeshStandardMaterial({ color: '#f2efe8', roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.55, 6, 16), jacketMat);
  body.position.y = 0.62;
  body.castShadow = true;
  group.add(body);

  // Mandil: una franja al frente, para que no se confunda con un cliente.
  const apronMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.7, side: THREE.DoubleSide });
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.68), apronMat);
  apron.position.set(0, 0.46, 0.386);
  apron.rotation.x = -0.06;
  group.add(apron);

  const headGeo = new THREE.SphereGeometry(0.4, 32, 32);
  const faceTexture = buildFaceTexture('happy', skin);
  const headMat = new THREE.MeshStandardMaterial({ map: faceTexture, roughness: 0.6 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.42;
  head.castShadow = true;
  group.add(head);

  // Gorro: banda + copete redondo, estilo toque clásico.
  const hatMat = new THREE.MeshStandardMaterial({ color: '#faf8f2', roughness: 0.5 });
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.14, 20), hatMat);
  band.position.y = 1.72;
  band.castShadow = true;
  group.add(band);

  const puff = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 16), hatMat);
  puff.scale.set(1, 0.78, 1);
  puff.position.y = 1.94;
  puff.castShadow = true;
  group.add(puff);

  const footGeo = new THREE.CapsuleGeometry(0.11, 0.12, 4, 8);
  const footMat = new THREE.MeshStandardMaterial({ color: '#2a2233', roughness: 0.8 });
  const footL = new THREE.Mesh(footGeo, footMat);
  footL.position.set(-0.18, 0.13, 0.05);
  const footR = footL.clone();
  footR.position.x = 0.18;
  group.add(footL, footR);

  group.userData.parts = { body, head, apron };
  return group;
}

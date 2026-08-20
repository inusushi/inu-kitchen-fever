import * as THREE from 'three';
import { photoFor } from '../js/data/photos.js';

const loader = new THREE.TextureLoader();
const emojiTextureCache = new Map();

function emojiTexture(emoji) {
  if (emojiTextureCache.has(emoji)) return emojiTextureCache.get(emoji);
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.font = `${size * 0.7}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2 + 4);
  const tex = new THREE.CanvasTexture(canvas);
  emojiTextureCache.set(emoji, tex);
  return tex;
}

// Sprite del platillo servido: arranca con el emoji (disponible al
// instante, no hay que esperar red) y, si hay foto real del menú
// (photoFor — las mismas fotos que usa el juego 2D), la sustituye en
// cuanto termina de cargar. THREE.Sprite siempre mira a cámara solo,
// no hace falta copiar el quaternion a mano como con el globo de pedido.
export function buildDishSprite(recipe) {
  const material = new THREE.SpriteMaterial({
    map: emojiTexture(recipe.emoji), transparent: true, depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.55, 0.55, 1);
  sprite.renderOrder = 11;

  const photoPath = photoFor(recipe.id);
  if (photoPath) {
    loader.load(
      photoPath,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        material.map = tex;
        material.needsUpdate = true;
      },
      undefined,
      () => {}, // sin foto o sin red: se queda con el emoji, no truena nada
    );
  }

  return sprite;
}

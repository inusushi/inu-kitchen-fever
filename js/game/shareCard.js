// Dibuja la tarjeta de "presume tu partida" en un canvas, en el navegador
// del jugador — no necesita ningún asset generado de antemano, solo el
// logo real que ya vive en public/fotos.
export async function drawShareCard({ levelEmoji, levelName, stars, coins, logoUrl }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, '#2c2337');
  grad.addColorStop(1, '#1b1520');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.textAlign = 'center';

  ctx.font = '64px "Segoe UI Emoji", sans-serif';
  ctx.fillStyle = '#ffcf5c';
  ctx.fillText('INU KITCHEN FEVER', 540, 160);

  ctx.font = '220px "Segoe UI Emoji", sans-serif';
  ctx.fillText(levelEmoji, 540, 460);

  ctx.font = 'bold 64px "Segoe UI", sans-serif';
  ctx.fillStyle = '#f5eee6';
  ctx.fillText(levelName, 540, 560);

  ctx.font = '90px "Segoe UI Emoji", sans-serif';
  ctx.fillStyle = '#ffcf5c';
  ctx.fillText('⭐'.repeat(stars).padEnd(3, '☆'), 540, 680);

  ctx.font = 'bold 70px "Segoe UI", sans-serif';
  ctx.fillStyle = '#ff8a3d';
  ctx.fillText(`💰 ${coins} monedas`, 540, 800);

  if (logoUrl) {
    try {
      const logo = await loadImage(logoUrl);
      const size = 160;
      ctx.save();
      ctx.beginPath();
      ctx.arc(540, 950, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logo, 540 - size / 2, 950 - size / 2, size, size);
      ctx.restore();
    } catch {
      // Sin logo no pasa nada: la tarjeta sigue siendo válida sin él.
    }
  }

  return canvas;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

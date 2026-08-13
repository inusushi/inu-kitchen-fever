export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function randRange(min, max) {
  return min + Math.random() * (max - min);
}

export function randInt(min, max) {
  return Math.floor(randRange(min, max + 1));
}

export function pickRandom(list) {
  return list[randInt(0, list.length - 1)];
}

export function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function addTap(node, handler) {
  let handled = false;
  node.addEventListener('pointerdown', (e) => {
    handled = true;
    e.preventDefault();
    handler(e);
  });
  node.addEventListener('click', (e) => {
    if (handled) {
      handled = false;
      return;
    }
    handler(e);
  });
}

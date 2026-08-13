// Mismo número que usa la web real de Inu Sushi (inu-sushi/index.html).
export const WHATSAPP_NUMBER = '525548981886';

export function whatsappOrderUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

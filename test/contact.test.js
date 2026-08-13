import { describe, it, expect } from 'vitest';
import { WHATSAPP_NUMBER, whatsappOrderUrl } from '../js/data/contact.js';

describe('whatsappOrderUrl', () => {
  it('uses the real Inu Sushi number', () => {
    expect(WHATSAPP_NUMBER).toBe('525548981886');
    expect(whatsappOrderUrl('hola')).toContain('wa.me/525548981886');
  });

  it('url-encodes the message, including emoji and accents', () => {
    const url = whatsappOrderUrl('¡Hola! 🍣 ¿Cómo estás?');
    expect(url).not.toContain(' ');
    expect(url).not.toContain('¡');
    expect(decodeURIComponent(url.split('text=')[1])).toBe('¡Hola! 🍣 ¿Cómo estás?');
  });

  it('produces a well-formed https url', () => {
    expect(whatsappOrderUrl('x')).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  });
});

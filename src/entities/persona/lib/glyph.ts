import type { PersonaId } from '../model/personas';

export interface GlyphDot { x: number; y: number; s: number; o: number; c: string }

/** Точечный глиф персоны в поле 52×52. */
export function personaGlyph(id: PersonaId, c: string): GlyphDot[] {
  const out: GlyphDot[] = [];
  const add = (cx: number, cy: number, sz: number, o: number, col?: string) => out.push({ x: +(cx - sz / 2).toFixed(1), y: +(cy - sz / 2).toFixed(1), s: sz, o: +o.toFixed(2), c: col ?? c });
  switch (id) {
    case 'orbix':
      add(26, 26, 7, 1);
      for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.2832 - 1.2; add(26 + 21 * Math.cos(a), 26 + 21 * Math.sin(a), i === 0 ? 6 : 3.5, i === 0 ? 1 : 0.2 + 0.6 * (1 - i / 12)); }
      for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.2832 + 0.5; add(26 + 11 * Math.cos(a), 26 + 11 * Math.sin(a), 3, 0.35); }
      break;
    case 'apex':
      for (let r = 0; r < 5; r++) for (let j = 0; j <= r; j++) add(26 + (j - r / 2) * 10.5, 5 + r * 10.5, r === 0 ? 7 : 4, r === 0 ? 1 : 0.9 - r * 0.15);
      break;
    case 'meridian':
      [2, 3, 2, 4, 5, 6].forEach((h, i) => { for (let j = 0; j < h; j++) add(4 + i * 8.8, 48 - j * 8.6, 4, j === h - 1 ? 1 : 0.3); });
      break;
    case 'lexicon': {
      const hot = new Set(['0,4', '1,3', '2,3', '3,1', '4,0']);
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { const h = hot.has(i + ',' + j); add(6 + i * 10, 6 + j * 10, h ? 6 : 3, h ? 1 : 0.25); }
      break;
    }
    case 'archive':
      [5, 3, 4, 2, 5].forEach((n, r) => { for (let j = 0; j < n; j++) add(6 + j * 10, 6 + r * 10, 4.5, (r % 2 ? 0.45 : 0.9) - j * 0.06); });
      break;
    case 'gaya':
      for (let x = -4; x <= 4; x++) for (let y = -4; y <= 4; y++) { const d = Math.hypot(x, y); if (d > 4.3) continue; add(26 + x * 5.4, 26 + y * 5.4, 3.6, 0.15 + 0.85 * ((x / 4.3 + 1) / 2)); }
      break;
    case 'prism':
      add(5, 26, 7, 1, '#0b0b14');
      ['#3b5bfd', '#ef4444', '#f59e0b', '#a855f7', '#ec4899', '#10b981'].forEach((col, i) => { const a = -0.62 + i * 0.248; [16, 29, 42].forEach((d, k) => add(5 + d * Math.cos(a), 26 + d * Math.sin(a), 3 + k, 0.5 + k * 0.25, col)); });
      break;
  }
  return out;
}

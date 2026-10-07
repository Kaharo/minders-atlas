import { useMemo } from 'react';
import { PERSONA_BY_ID, type PersonaId } from '../model/personas';
import { personaGlyph } from '../lib/glyph';

/** Точечный глиф персоны; size — сторона в px (исходное поле 52). */
export function PersonaGlyph({ id, size = 52 }: { id: PersonaId | 'all'; size?: number }) {
  const dots = useMemo(() => (id === 'all' ? [{ x: 19, y: 19, s: 14, o: 1, c: '#0b0b14' }] : personaGlyph(id, PERSONA_BY_ID[id].color)), [id]);
  const k = size / 52;
  return (
    <div style={{ position: 'relative', flex: 'none', width: size, height: size, overflow: 'hidden' }} aria-hidden>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 52, height: 52, transform: `scale(${k})`, transformOrigin: '0 0' }}>
        {dots.map((d, i) => <span key={i} style={{ position: 'absolute', left: d.x, top: d.y, width: d.s, height: d.s, borderRadius: '50%', background: d.c, opacity: d.o }} />)}
      </div>
    </div>
  );
}

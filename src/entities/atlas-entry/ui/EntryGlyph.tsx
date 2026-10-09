import { useEffect, useRef } from 'react';

const HUE: Record<string, number> = { d_trust: 150, d_context: 192, d_runtime: 268, d_quality: 300, d_models: 228 };
const rng = (seed: number) => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

/** Миниатюра карты: цилиндр модели, блоки обвязки; домен записи подсвечен. Перенос AtlasGlyph. */
export function EntryGlyph({ domain, color, seed, height = 170 }: { domain: string; color: string; seed: number; height?: number }) {
  const wrap = useRef<HTMLDivElement>(null), cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const draw = () => {
      const w0 = wrap.current, c0 = cv.current; if (!w0 || !c0) return;
      const W = w0.clientWidth, H = w0.clientHeight; if (!W || !H) return;
      const d = Math.min(2, window.devicePixelRatio || 1); c0.width = W * d; c0.height = H * d;
      const c = c0.getContext('2d')!; c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, W, H);
      const dom = domain || 'd_models', hot = HUE[dom] ?? 228, col = color || 'hsl(' + hot + ',70%,50%)';
      const rnd = rng(seed || 7), cx = W / 2, cy = H / 2 - 4, s = Math.min(W / 300, H / 110);
      const on = (k: string) => k === dom, ink = (k: string, a: number) => (on(k) ? 'hsla(' + HUE[k] + ',70%,48%,' + a + ')' : 'rgba(120,126,146,' + a * 0.55 + ')');
      const box = (x: number, y: number, bw: number, bh: number, k: string) => { c.strokeStyle = ink(k, 0.9); c.lineWidth = on(k) ? 1.4 : 1; c.strokeRect(cx + (x - bw / 2) * s, cy + (y - bh / 2) * s, bw * s, bh * s); c.strokeRect(cx + (x - bw / 2 + 6) * s, cy + (y - bh / 2 - 5) * s, bw * s, bh * s); };
      const line = (pts: number[][], k: string, dash?: boolean) => { c.strokeStyle = ink(k, 0.7); c.lineWidth = 1; c.setLineDash(dash ? [3, 3] : []); c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(cx + p[0] * s, cy + p[1] * s) : c.moveTo(cx + p[0] * s, cy + p[1] * s))); c.stroke(); c.setLineDash([]); };
      line([[-92, -18], [-50, -18], [-50, -38], [-8, -38]], 'd_context');
      line([[8, 38], [52, 38], [52, 12], [90, 12]], 'd_runtime'); line([[90, 2], [66, 2], [66, -38], [8, -38]], 'd_runtime');
      line([[-26, 44], [-92, 44], [-92, 26]], 'd_quality', true);
      [-44, 44].forEach(y => { c.strokeStyle = ink('d_trust', 0.9); c.lineWidth = on('d_trust') ? 1.4 : 1; c.beginPath(); c.ellipse(cx, cy + y * s, 34 * s, 7 * s, 0, 0, 6.283); c.stroke(); });
      box(-108, -18, 30, 24, 'd_context'); box(108, 8, 30, 24, 'd_runtime'); box(-108, 26, 26, 20, 'd_quality');
      for (let l = 0; l < 9; l++) { const y = -30 + l * 7.5; for (let q = 0; q < 26; q++) { const a = q / 26 * 6.283, r = 22 + (q % 2) * 5; c.fillStyle = ink('d_models', on('d_models') ? 0.85 : 0.7); c.fillRect(cx + Math.cos(a) * r * s - 0.8, cy + (y + Math.sin(a) * 4) * s - 0.8, 1.6, 1.6); } }
      const P = ({ d_trust: [30, -44], d_context: [-108, -18], d_runtime: [108, 8], d_quality: [-108, 26], d_models: [18, -4] } as Record<string, number[]>)[dom] || [0, 0];
      const gx = cx + P[0] * s, gy = cy + P[1] * s, g = c.createRadialGradient(gx, gy, 0, gx, gy, 26 * s);
      g.addColorStop(0, 'hsla(' + hot + ',85%,62%,0.45)'); g.addColorStop(1, 'hsla(' + hot + ',85%,62%,0)'); c.fillStyle = g; c.fillRect(gx - 30 * s, gy - 30 * s, 60 * s, 60 * s);
      for (let q = 0; q < 26; q++) { const a = rnd() * 6.283, r = Math.sqrt(rnd()) * 12 * s; c.fillStyle = 'hsla(' + hot + ',75%,45%,' + (0.4 + rnd() * 0.5) + ')'; c.fillRect(gx + Math.cos(a) * r - 1, gy + Math.sin(a) * r - 1, 2, 2); }
      c.beginPath(); c.arc(gx, gy, 4.5, 0, 6.283); c.fillStyle = col; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#ffffff'; c.stroke();
    };
    draw();
    const ro = new ResizeObserver(draw); if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [domain, color, seed]);
  return <div ref={wrap} style={{ position: 'relative', width: '100%', height }}><canvas ref={cv} style={{ display: 'block', width: '100%', height: '100%' }} /></div>;
}

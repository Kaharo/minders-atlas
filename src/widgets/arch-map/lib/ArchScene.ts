// @ts-nocheck
// Движок карты архитектуры: перенесён из прототипа (AtlasArch) без изменений в геометрии и отрисовке.
// Класс не зависит от React: получает canvas и контейнер, props задаются через setProps().
import { ATLAS_ARCH } from '@/entities/model/lib/arch';
import { ATLAS_MODELS } from '@/entities/model/lib/registry';

export interface ArchPoint { id: string; n: number; title: string; color: string; dom: string }
export interface ArchProps {
  modelId?: string; focus?: 'incidents' | 'glossary' | 'learn'; open?: boolean; points?: ArchPoint[]; pointsKey?: string;
  selected?: string | null; hitsKey?: string; zone?: string | null; zoneCounts?: string; supportKey?: string;
  stepKey?: string | null; stepN?: number; stepTitle?: string; stepDone?: string; stepColor?: string;
  insetL?: number; insetR?: number; insetT?: number; insetB?: number; hwDock?: string; hwHidden?: boolean; hwOpen?: boolean;
  onPoint?: (id: string) => void; onZone?: (id: string) => void; onOpen?: (open: boolean) => void; onModel?: (id: string) => void;
}

export class ArchScene {
  props: ArchProps = {};
  state: any = { mid: null, mode: 'geo', target: 1, vw: 1440, vh: 900, hwOpen: true, cursor: 'grab', hover: null };
  onState: null | (() => void) = null;
  DOMG = { d_trust: 'trust', d_context: 'context', d_runtime: 'runtime', d_quality: 'quality', d_models: 'core' };
  HUE = { trust: 150, context: 192, runtime: 268, quality: 300, io: 232 };
  canvas: HTMLCanvasElement; wrap: HTMLElement; M: any; A: any; ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, wrap: HTMLElement, props: ArchProps) {
    this.canvas = canvas; this.wrap = wrap; this.props = props;
    this.M = ATLAS_MODELS; this.ctx = canvas.getContext('2d');
    this._ptrs = new Map();
    this.e = 0; this.yawOff = 0; this.pitchOff = 0; this.zoom = props.open === false ? 0.72 : 1.35;
    this._onWheel = (e) => { e.preventDefault(); this.zoom = Math.max(0.6, Math.min(2.4, (this.zoom || 1) * Math.exp(-e.deltaY * 0.0012))); this._zoomChanged(); };
    canvas.addEventListener('wheel', this._onWheel, { passive: false });
    this._resize(); this._ro = new ResizeObserver(() => this._resize()); this._ro.observe(wrap);
    this._build(); this._t0 = performance.now();
    const loop = (ts) => { if (this._dead) return; this._raf = requestAnimationFrame(loop); this._frame(ts); };
    this._raf = requestAnimationFrame(loop);
  }
  get mid() { return this.props.modelId || this.state.mid || 'gpt-oss-120b'; }
  setState(p, cb) { Object.assign(this.state, p); if (cb) cb(); if (this.onState) this.onState(); }
  forceUpdate() { if (this.onState) this.onState(); }
  destroy() { this._dead = true; this.canvas.removeEventListener('wheel', this._onWheel); cancelAnimationFrame(this._raf); if (this._ro) this._ro.disconnect(); }

  /** Обновление props из React: та же логика, что была в componentDidUpdate. */
  setProps(next: ArchProps) {
    const pp = this.props; this.props = next;
    if (pp.open !== next.open && next.open !== this._selfOpen) { this.zoom = next.open === false ? 0.72 : 1.35; this._lastOpen = next.open !== false; }
    this._selfOpen = undefined;
    if (pp.modelId !== next.modelId) { this._build(); this.forceUpdate(); }
    else if (pp.pointsKey !== next.pointsKey) this._buildPoints();
    if (pp.stepN !== next.stepN && next.stepKey) { const now = performance.now(); this._pk = { from: this._stepAt || 'in', to: next.stepKey, t: now }; this._stepAt = next.stepKey; this._stepT = now; if (next.stepKey === 'core') this._waveT = now + 500; }
    if (!next.stepKey && pp.stepKey) { this._stepAt = null; this._stepT = 0; }
  }
  setMode(mode: 'geo' | 'cloud') { this.setState({ mode }, () => { this._build(); }); }
  _zt() { return Math.max(0, Math.min(1, ((this.zoom || 1) - 0.85) / 0.4)); }
  _zoomChanged() { const v = this._zt() > 0.5; if (v !== this._lastOpen) { this._lastOpen = v; this._selfOpen = v; if (this.props.onOpen) this.props.onOpen(v); } }

  // указатель
  onDown = (e) => { this._ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (this._ptrs.size === 2) { const [a, b] = [...this._ptrs.values()]; this._pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: this.zoom }; this._drag = null; return; } this._drag = { x: e.clientX, y: e.clientY, y0: this.yawOff || 0, p0: this.pitchOff || 0, moved: false }; };
  onMove = (e) => {
    if (this._ptrs.has(e.pointerId)) this._ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this._pinch && this._ptrs.size === 2) { const [a, b] = [...this._ptrs.values()]; this.zoom = Math.max(0.6, Math.min(2.4, this._pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, this._pinch.d))); this._zoomChanged(); return; }
    if (this._drag) { const dx = e.clientX - this._drag.x, dy = e.clientY - this._drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) this._drag.moved = true; if (this._drag.moved) { this.yawOff = this._drag.y0 + dx * 0.006; this.pitchOff = Math.max(-0.55, Math.min(0.75, this._drag.p0 + dy * 0.004)); } return; }
    const h = this._pick(e), id = h ? h.type + ':' + h.id : null;
    if (id !== this.state.hover) this.setState({ hover: id, cursor: h ? 'pointer' : 'grab' });
  };
  onUp = (e) => {
    this._ptrs.delete(e.pointerId); if (this._ptrs.size < 2) this._pinch = null;
    const d = this._drag; this._drag = null; if (!d || d.moved) return;
    const h = this._pick(e); if (!h) return;
    if (h.type === 'p' && this.props.onPoint) this.props.onPoint(h.id);
    else if (h.type === 'z' && this.props.onZone) this.props.onZone(h.id);
  };
  onLeave = (e) => { if (e && this._ptrs) this._ptrs.delete(e.pointerId); this._pinch = null; this._drag = null; if (this.state.hover) this.setState({ hover: null, cursor: 'grab' }); };

  _resize() {
    const W = this.wrap.clientWidth, H = this.wrap.clientHeight; if (!W || !H) return;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(W * this.dpr); this.canvas.height = Math.round(H * this.dpr);
    this.W = W; this.H = H; this._bg();
    if (W !== this.state.vw || H !== this.state.vh) this.setState({ vw: W, vh: H });
  }
  _bg() {
    const Wd = this.canvas.width, Hd = this.canvas.height, c = this.bgC || (this.bgC = document.createElement('canvas'));
    c.width = Wd; c.height = Hd; const g = c.getContext('2d'), S = Math.max(Wd, Hd);
    g.fillStyle = '#f6f7fb'; g.fillRect(0, 0, Wd, Hd);
    const blob = (x, y, r, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, Wd, Hd); };
    blob(Wd * 0.22, Hd * 0.18, S * 0.52, 'rgba(108,140,255,0.16)'); blob(Wd * 0.84, Hd * 0.26, S * 0.46, 'rgba(167,139,250,0.14)');
    blob(Wd * 0.68, Hd * 0.92, S * 0.44, 'rgba(236,72,153,0.07)'); blob(Wd * 0.10, Hd * 0.88, S * 0.34, 'rgba(96,165,250,0.10)'); blob(Wd * 0.5, Hd * 0.52, S * 0.34, 'rgba(255,255,255,0.85)');
  }
  _rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  _sprite(h) {
    this._spr = this._spr || {}; if (this._spr[h]) return this._spr[h];
    if (h === 'grey') { const c0 = document.createElement('canvas'); c0.width = c0.height = 128; const x0 = c0.getContext('2d'), g0 = x0.createRadialGradient(64, 64, 0, 64, 64, 64); g0.addColorStop(0, 'rgba(160,166,184,0.7)'); g0.addColorStop(0.45, 'rgba(160,166,184,0.25)'); g0.addColorStop(1, 'rgba(160,166,184,0)'); x0.fillStyle = g0; x0.fillRect(0, 0, 128, 128); return (this._spr[h] = c0); }
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'hsla(' + h + ',80%,66%,0.9)'); gr.addColorStop(0.45, 'hsla(' + h + ',80%,66%,0.35)'); gr.addColorStop(1, 'hsla(' + h + ',80%,66%,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return (this._spr[h] = c);
  }
  _knn(x, y, z, ids, k, cell, maxd) {
    const grid = new Map(), K = (a, b, c) => (a + 512) * 1048576 + (b + 512) * 1024 + (c + 512), E = [], md2 = maxd * maxd;
    ids.forEach(i => { const kk = K(Math.floor(x[i] / cell), Math.floor(y[i] / cell), Math.floor(z[i] / cell)); let a = grid.get(kk); if (!a) grid.set(kk, a = []); a.push(i); });
    ids.forEach(i => {
      const cx = Math.floor(x[i] / cell), cy = Math.floor(y[i] / cell), cz = Math.floor(z[i] / cell), best = [];
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
        const a = grid.get(K(cx + dx, cy + dy, cz + dz)); if (!a) continue;
        for (const j of a) { if (j <= i) continue; const d = (x[i] - x[j]) ** 2 + (y[i] - y[j]) ** 2 + (z[i] - z[j]) ** 2; if (d > md2) continue; if (best.length < k) { best.push([d, j]); best.sort((p, q) => p[0] - q[0]); } else if (d < best[k - 1][0]) { best[k - 1] = [d, j]; best.sort((p, q) => p[0] - q[0]); } }
      }
      best.forEach(b => E.push(i, b[1]));
    });
    return E;
  }

  // железо: сколько памяти нужно и куда модель помещается
  _hw() {
    const A = this.A, hid = A.src === 'hidden' || !A.pB, pB = A.pB || 0, native = pB * A.q, q4 = pB * 0.56, G = Math.max(1, Math.ceil(native * 1.2 / 80));
    const tier = q4 <= 3 ? 0 : q4 <= 18 ? 1 : native * 1.2 <= 80 || q4 <= 60 ? 2 : native * 1.2 <= 640 ? 3 : 4;
    return { hid, native, q4, G, tier, nodes: Math.ceil(G / 8) };
  }

  _build() {
    const A = this.A = ATLAS_ARCH.get(this.M.byModel[this.mid]), geo = this.state.mode === 'geo';
    const rnd = this._rng(1234), G = () => (rnd() + rnd() + rnd() - 1.5) / 1.5, TAU = Math.PI * 2;
    const L = A.L, H = A.H, KV = Math.max(1, A.KV), E = A.E || 0, d = A.d;
    const nM = E || Math.round(d * 3.5 / 256), per = 12 + H + nM + (A.shared ? 1 : 0);
    const f = Math.min(1, 30000 / (L * per)), step = f < 1 ? Math.ceil(1 / f) : 1; this.step = step;
    // общий масштаб для всех моделей: высота ∝ числу слоёв, ширина ∝ √d, кольцо MLP/экспертов ∝ числу экспертов
    const Hc = this.Hc = Math.min(1.9, L * 0.0145), sp = this.sp = Hc / L; this.hCap = L * 0.0145 > 1.9;
    const w = Math.min(1.25, Math.sqrt(d / 8192)), r0 = 0.15 * w, rA = r0 + 0.06 + 0.0012 * H, rM = E ? rA + 0.1 + 0.0007 * E : rA + 0.06 + 0.2 * w;
    this.rA = rA; this.rM = rM;
    const xo = [], yo = [], zo = [], xc = [], yc = [], zc = [], kd = [];
    // форма «мозга» для варианта A: два полушария, слои — волнистые срезы, эксперты на коре
    const BH = 0.5 + Hc * 0.35, brain = (a, rFrac, fr, l) => {
      const y0 = (0.5 - fr) * BH * 2 * 0.9, prof = Math.sqrt(Math.max(0.05, 1 - (y0 / BH) ** 2)), R = (0.48 + rM * 0.6) * prof;
      const wob = 1 + 0.07 * Math.sin(a * 9 + fr * 23) + 0.04 * Math.sin(a * 17 - l * 0.7), r = R * rFrac * wob, side = Math.cos(a) >= 0 ? 1 : -1;
      return [Math.cos(a) * r * 1.2 + side * 0.05, y0 + 0.035 * Math.sin(a * 6 + l * 0.45) * rFrac, Math.sin(a) * r * 0.9];
    };
    const add = (p, fr, k, closedY, a, rFrac, l) => {
      const q = !geo && a != null ? brain(a, rFrac, fr, l) : p;
      xo.push(q[0] + (!geo ? G() * 0.012 : 0)); yo.push(q[1] + (!geo ? G() * 0.01 : 0)); zo.push(q[2] + (!geo ? G() * 0.012 : 0));
      const y = closedY != null ? closedY : (0.5 - fr) * 0.62, prof = Math.sqrt(Math.max(0.08, 1 - (y / 0.42) ** 2));
      xc.push(p[0] * 1.5 * prof + G() * 0.2); yc.push(y * 1.45 + G() * 0.16); zc.push(p[2] * 1.5 * prof + G() * 0.2); kd.push(k);
      return xo.length - 1;
    };
    const layers = [];
    for (let l = 0; l < L; l++) {
      const yl = Hc / 2 - (l + 0.5) * sp, fr = (l + 0.5) / L, ya = yl + sp * 0.18, ym = yl - sp * 0.22, rec = { res: [], heads: [], hg: [], mlp: [], shared: -1 };
      for (let q = 0; q < 12; q++) { const a = q < 6 ? q / 6 * TAU : rnd() * TAU, r = q < 6 ? r0 * 0.55 : r0 * Math.sqrt(rnd()); rec.res.push(add([Math.cos(a) * r, yl, Math.sin(a) * r], fr, 0, null, a, r / rM * 0.6, l)); }
      const gpH = H / KV, gapU = KV > 1 && gpH > 1 ? 1.4 : 0, tot = H + KV * gapU;
      for (let h = 0; h < H; h += step) { const gi = Math.floor(h / gpH), a = (h + gi * gapU) / tot * TAU, rj = rA + G() * 0.01; rec.heads.push(add([Math.cos(a) * rj, ya + G() * sp * 0.06, Math.sin(a) * rj], fr, 1, null, a, 0.55, l)); rec.hg.push(gi); }
      for (let q = 0; q < nM; q += step) { const a = q / nM * TAU + (l % 2) * (Math.PI / nM), r = rM + G() * (E ? 0.008 : 0.018); rec.mlp.push(add([Math.cos(a) * r, ym + G() * sp * 0.06, Math.sin(a) * r], fr, E ? 3 : 2, null, a, 0.97, l)); }
      if (A.shared) rec.shared = add([0, ym, 0], fr, 4, null, 0, 0.05, l);
      layers.push(rec);
    }
    this.layers = layers;
    const rV = this.rV = 0.2 + 0.045 * Math.log2(A.V / 32000);
    const sheet = (y, yC, k, fr) => { const out = []; for (let q = 0; q < 300; q++) { const a = rnd() * TAU, r = rV * Math.sqrt(rnd()); out.push(add([Math.cos(a) * r, y + G() * 0.004, Math.sin(a) * r], fr, k, yC, a, 0.35 + 0.5 * r / rV, -1)); } return out; };
    this.emb = sheet(Hc / 2 + 0.13, 0.37, 5, 0.0); this.head = sheet(-Hc / 2 - 0.13, -0.37, 5, 1.0);
    this.nCore = xo.length;
    const Tc = 0.4, To = geo ? Hc / 2 + 0.15 : BH + 0.12, cnt = [];
    const ho = geo ? this._geoHarness(To) : this._harness(To, cnt, false), hc = geo ? this._geoHarness(Tc) : this._harness(Tc, cnt, true);
    this.hGrp = ho.pts.map(p => p[3]); this.routesO = ho.routes; this.routesC = hc.routes;
    const SX = 0.62, SY = 0.78; this.routesC = hc.routes.map(r => ({ g: r.g, pts: r.pts.map(p => [p[0] * SX, p[1] * SY, p[2] * SX]) }));
    ho.pts.forEach((p, i) => { xo.push(p[0]); yo.push(p[1]); zo.push(p[2]); const q = hc.pts[i]; xc.push(q[0] * SX + G() * 0.12); yc.push(q[1] * SY + G() * 0.1); zc.push(q[2] * SX + G() * 0.12); kd.push(10); });
    const n = xo.length;
    this.P = { n, xo: Float32Array.from(xo), yo: Float32Array.from(yo), zo: Float32Array.from(zo), xc: Float32Array.from(xc), yc: Float32Array.from(yc), zc: Float32Array.from(zc), k: Int8Array.from(kd), sx: new Float32Array(n), sy: new Float32Array(n) };
    const n0 = this.nCore, byG = {}; this.hGrp.forEach((g, i) => { (byG[g] = byG[g] || []).push(n0 + i); });
    this.hEdges = []; Object.keys(byG).forEach(g => { const e2 = this._knn(xo, yo, zo, byG[g], 2, 0.1, 0.1); for (let q = 0; q < e2.length; q++) this.hEdges.push(e2[q]); });
    const coreIds = []; for (let i = 0; i < n0; i++) coreIds.push(i);
    this.cEdges = geo ? [] : this._knn(xo, yo, zo, coreIds, 2, 0.05, 0.05);
    this.Tc = Tc; this.To = To; this.BH = BH;
    this._buildPoints();
  }
  // точки инцидентов / терминов: на блоках обвязки по домену, модельные — на слоях
  _buildPoints() {
    const pts = this.props.points || [], To = this.To, L = this.A.L, Hc = this.Hc, sp = this.sp, rM = this.rM, SX = 0.62, SY = 0.78;
    const hsh = (s) => { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
    const u = (h, k) => ((h >>> (k * 5)) & 1023) / 1023;
    const box = (c, h) => [c[0] + (u(h, 0) * 2 - 1) * 0.16, c[1] + (u(h, 1) * 2 - 1) * 0.13, c[2] + (u(h, 2) * 2 - 1) * 0.13];
    this.pts = pts.map(p => {
      const h = hsh(p.id); let o, c, g = this.DOMG[p.dom] || 'context';
      if (g === 'core') {
        const l = h % L, fr = (l + 0.5) / L, a = u(h, 1) * 6.283, r = rM + 0.05;
        o = [Math.cos(a) * r, Hc / 2 - (l + 0.5) * sp, Math.sin(a) * r]; c = [o[0] * 0.8, (0.5 - fr) * 0.74, o[2] * 0.8];
      } else {
        if (g === 'trust') { const out = (h & 1) === 1, a = u(h, 1) * 6.283, r = 0.3 + 0.14 * u(h, 2); o = [Math.cos(a) * r, (out ? -1 : 1) * (To + 0.2), Math.sin(a) * r]; }
        else if (g === 'context') o = box([-1.3, To * 0.4 + 0.08, 0], h);
        else if (g === 'runtime') o = box([1.3, -To * 0.3, 0], h);
        else o = box([-1.3, -To * 0.3 - 0.3, 0], h);
        c = [o[0] * SX, o[1] * SY, o[2] * SX];
      }
      return { id: p.id, n: p.n, title: p.title, color: p.color, g, o, c, sx: 0, sy: 0 };
    });
  }
  _anchor(key, ee, T) {
    const kx = 0.62 + 0.38 * ee, ky = 0.78 + 0.22 * ee;
    const A = { in: [0, T + 0.46], out: [0, -T - 0.46], tok: [0, T + 0.08], emb: [0, this.Hc / 2 + 0.13], kv: [0.2, 0], d_trust: [0.34, T + 0.2], d_trust_out: [0.34, -T - 0.2], d_context: [-1.3, T * 0.4 + 0.08], d_runtime: [1.3, -T * 0.3], d_quality: [-1.3, -T * 0.3 - 0.3], core: [0, 0], d_models: [0, 0] }[key] || [0, 0];
    if (key === 'emb') return [0, 0.37 + (this.Hc / 2 + 0.13 - 0.37) * ee]; return key === 'core' || key === 'd_models' || key === 'kv' ? A : [A[0] * kx, A[1] * ky];
  }
  _pick(e) {
    if (!this.canvas || !this._prjLast) return null;
    const b = this.canvas.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    let best = null, bd = 11;
    (this.pts || []).forEach(p => { const d = Math.hypot(p.sx - x, p.sy - y); if (d < bd) { bd = d; best = { type: 'p', id: p.id }; } });
    if (best) return best;
    const ee = this._eeLast || 1, T = this._TLast || 0.4, prj = this._prjLast, zs = [['d_trust', [0, T + 0.2]], ['d_trust', [0, -T - 0.2]], ['d_context', [-1.3, T * 0.4 + 0.08]], ['d_runtime', [1.3, -T * 0.3]], ['d_quality', [-1.3, -T * 0.3 - 0.3]], ['d_models', [0, 0]]];
    const kx = 0.62 + 0.38 * ee, ky = 0.78 + 0.22 * ee;
    let zb = null, zd = 1e9;
    zs.forEach(([k, p]) => { const q = k === 'd_models' ? prj(0, 0, 0) : prj(p[0] * kx, p[1] * ky, 0), rad = (k === 'd_models' ? Math.max(40, (this.rM + 0.05) * this._ULast) : k === 'd_trust' ? 0.45 * this._ULast : 0.24 * this._ULast); const d = Math.hypot(q[0] - x, q[1] - y); if (d < rad && d < zd) { zd = d; zb = { type: 'z', id: k }; } });
    return zb;
  }

  // вариант A: органическая обвязка
  _harness(T, cnt, reuse) {
    let ci = 0; const rnd = this._rng(99), G = () => (rnd() + rnd() + rnd() - 1.5) / 1.5, TAU = Math.PI * 2, out = [];
    const add = (x, y, z, g) => out.push([x, y, z, g]);
    const chain = (a, b, g, jit, via) => {
      const pts = via ? [a, via, b] : [a, b];
      for (let s2 = 0; s2 < pts.length - 1; s2++) {
        const p = pts[s2], q = pts[s2 + 1], L = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]); let m = reuse ? cnt[ci++] : Math.max(3, Math.ceil(L / 0.03)); if (!reuse) { cnt.push(m); ci++; } let o = [0, 0, 0];
        for (let s = 1; s < m; s++) { const t = s / m, env = Math.sin(Math.PI * t); o = o.map(v => v * 0.8 + G() * jit); add(p[0] + (q[0] - p[0]) * t + o[0] * env, p[1] + (q[1] - p[1]) * t + o[1] * env, p[2] + (q[2] - p[2]) * t + o[2] * env, g); }
      }
    };
    [T + 0.2, -T - 0.2].forEach(y => { for (let q = 0; q < 220; q++) { const a = rnd() * TAU, r = 0.24 + 0.2 * Math.sqrt(rnd()); add(Math.cos(a) * r, y + G() * 0.03, Math.sin(a) * r, 'trust'); } });
    [[0, T + 0.46], [0, -T - 0.46]].forEach(([x, y], i) => { for (let q = 0; q < 30; q++) add(x + G() * 0.05, y + G() * 0.04, G() * 0.05, 'io'); chain([x, y, 0], [0, i ? -T - 0.2 : T + 0.2, 0], 'io', 0.01); });
    const C = [-1.3, T * 0.4 + 0.08, 0], R = [1.3, -T * 0.3, 0];
    [[C, 'context'], [R, 'runtime']].forEach(([c, g]) => { for (let q = 0; q < 300; q++) add(c[0] + G() * 0.24, c[1] + G() * 0.2, c[2] + G() * 0.18, g); });
    [-0.06, 0, 0.06].forEach(o => chain([C[0] + 0.2, C[1] + o, 0], [-0.15 + o, T + 0.05, 0], 'context', 0.025));
    chain([0.1, -T - 0.05, 0], [R[0] - 0.2, R[1], 0], 'runtime', 0.025);
    chain([R[0], R[1] + 0.2, 0], [0.12, T + 0.05, 0], 'runtime', 0.02, [1.15, T * 0.55 + 0.25, 0]);
    const O = [-1.3, -T * 0.3 - 0.3, 0]; for (let q = 0; q < 220; q++) add(O[0] + G() * 0.2, O[1] + G() * 0.16, O[2] + G() * 0.14, 'quality');
    [[-0.44, -T - 0.2], [C[0], C[1] - 0.2], [R[0] - 0.1, R[1] - 0.2], [-this.rM - 0.05, O[1]]].forEach(([x, y]) => chain([x, y, 0], [O[0] + 0.12, O[1], 0], 'quality', 0.012));
    return { pts: out, routes: [] };
  }
  // вариант B: геометричная обвязка — блоки и трассы под прямым углом
  _geoHarness(T) {
    const rnd = this._rng(77), TAU = Math.PI * 2, out = [], routes = [];
    const add = (x, y, z, g) => out.push([x, y, z, g]);
    const plate = (y, g) => { for (let q = 0; q < 240; q++) { let x, z; let g0 = 0; do { x = (rnd() * 2 - 1) * 0.48; z = (rnd() * 2 - 1) * 0.48; } while (Math.abs(x) < 0.3 && Math.abs(z) < 0.3 && ++g0 < 50); add(x, y, z, g); } };
    plate(T + 0.2, 'trust'); plate(-T - 0.2, 'trust');
    const box = (c, s, g, n) => { const e = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], ed = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
      ed.forEach(([a, b]) => { for (let q = 0; q <= 14; q++) { const t = q / 14; add(c[0] + (e[a][0] + (e[b][0] - e[a][0]) * t) * s[0], c[1] + (e[a][1] + (e[b][1] - e[a][1]) * t) * s[1], c[2] + (e[a][2] + (e[b][2] - e[a][2]) * t) * s[2], g); } });
      for (let q = 0; q < n; q++) add(c[0] + (rnd() * 2 - 1) * s[0] * 0.8, c[1] + (rnd() * 2 - 1) * s[1] * 0.8, c[2] + (rnd() * 2 - 1) * s[2] * 0.8, g); };
    box([0, T + 0.46, 0], [0.05, 0.05, 0.05], 'io', 10); box([0, -T - 0.46, 0], [0.05, 0.05, 0.05], 'io', 10);
    const C = [-1.3, T * 0.4 + 0.08, 0], R = [1.3, -T * 0.3, 0], s = [0.2, 0.17, 0.17];
    box(C, s, 'context', 120); box(R, s, 'runtime', 120);
    const O = [-1.3, -T * 0.3 - 0.3, 0]; box(O, s, 'quality', 100);
    const r = (g, pts, dash) => routes.push({ g, pts, dash });
    const eY = this.Hc / 2 + 0.13;
    r('io', [[0, T + 0.41, 0], [0, T + 0.2, 0], [0, T + 0.08, 0], [0, eY, 0]]); r('io', [[0, -eY, 0], [0, -T - 0.08, 0], [0, -T - 0.2, 0], [0, -T - 0.41, 0]]);
    r('io', [[-0.12, T + 0.08, 0], [0.12, T + 0.08, 0]]); r('io', [[0, -T - 0.08, 0], [0.12, -T - 0.08, 0]]);
    r('context', [[C[0] + s[0], C[1], 0], [-0.62, C[1], 0], [-0.62, T + 0.08, 0], [-0.12, T + 0.08, 0]]);
    r('runtime', [[0.12, -T - 0.08, 0], [0.66, -T - 0.08, 0], [0.66, R[1] - 0.07, 0], [R[0] - s[0], R[1] - 0.07, 0]]);
    r('runtime', [[R[0] - s[0], R[1] + 0.07, 0], [0.82, R[1] + 0.07, 0], [0.82, T + 0.08, 0], [0.12, T + 0.08, 0]]);
    r('quality', [[-0.48, -T - 0.2, 0], [O[0], -T - 0.2, 0], [O[0], O[1] - s[1], 0]], 1);
    r('quality', [[C[0], C[1] - s[1], 0], [C[0], O[1] + s[1], 0]], 1);
    r('quality', [[R[0], R[1] - s[1], 0], [R[0], -T - 0.52, 0], [O[0], -T - 0.52, 0], [O[0], -T - 0.2, 0]], 1);
    r('quality', [[-this.rM - 0.1, O[1] + 0.06, 0], [O[0] + s[0], O[1] + 0.06, 0]], 1);
    return { pts: out, routes };
  }

  _frame(ts) {
    const c = this.ctx, P = this.P; if (!P || !this.W) return;
    const dt = Math.min(0.05, (ts - (this._last || ts)) / 1000); this._last = ts;
    const t = ts - this._t0, geo = this.state.mode === 'geo';
    if (!this._opened && t > 900) this._opened = true;
    const tgt0 = this._zt();
    this.e += ((this._opened ? tgt0 : 0) - this.e) * (1 - Math.exp(-dt * 1.1));
    const e = this.e, ee = e * e * (3 - 2 * e);
    const W = this.W, H = this.H, dpr = this.dpr, T = this.Tc + (this.To - this.Tc) * ee;
    const pr = this.props, IL = pr.insetL != null ? pr.insetL : 16, IR = this._ir(), IT = pr.insetT != null ? pr.insetT : 70, IB = pr.insetB != null ? pr.insetB : 80, AW = Math.max(240, W - IL - IR), AH = Math.max(240, H - IT - IB);
    const wU = 2.2 + 1.3 * ee, totH = (2 * (T + 0.66) + 0.1) * (0.82 + 0.18 * ee), U = Math.min(AW * 0.98 / wU, AH / totH) * (0.82 + 0.18 * Math.min(1.6, this.zoom || 1)), ox = IL + AW / 2, oy = IT + AH / 2, fz = U * 4.2;
    this._ULast = U; this._eeLast = ee; this._TLast = T; this._AW = AW;
    const yaw = this.yawOff + Math.sin(t * 0.00011) * (geo ? 0.22 : 0.5) + (geo ? 0.18 : 0), tilt = 0.22 + (geo ? 0.2 : 0.1) * ee + Math.sin(t / 7000) * 0.04 + (this.pitchOff || 0);
    const cy1 = Math.cos(yaw), sy1 = Math.sin(yaw), cx1 = Math.cos(tilt), sx1 = Math.sin(tilt);
    const prj = this._prjLast = (x, y, z) => { const X0 = x * U, Y0 = -y * U, Z0 = z * U, X1 = X0 * cy1 + Z0 * sy1, Z1 = -X0 * sy1 + Z0 * cy1, Y1 = Y0 * cx1 - Z1 * sx1, Z2 = Y0 * sx1 + Z1 * cx1, s = fz / (fz + Z2 * 1.3); return [ox + X1 * s, oy + Y1 * s, s]; };
    const n = P.n, sx = P.sx, sy = P.sy, br = (1 - ee) * 0.012 + (geo ? 0 : 0.004), tw = t * 0.0007, n0 = this.nCore;
    for (let i = 0; i < n; i++) {
      const w = i < n0 ? br : geo ? 0 : 0.004;
      const x = P.xc[i] + (P.xo[i] - P.xc[i]) * ee + Math.sin(tw + i * 1.3) * w, y = P.yc[i] + (P.yo[i] - P.yc[i]) * ee + Math.cos(tw * 0.8 + i * 0.7) * w, z = P.zc[i] + (P.zo[i] - P.zc[i]) * ee;
      const X0 = x * U, Y0 = -y * U, Z0 = z * U, X1 = X0 * cy1 + Z0 * sy1, Z1 = -X0 * sy1 + Z0 * cy1, Y1 = Y0 * cx1 - Z1 * sx1, Z2 = Y0 * sx1 + Z1 * cx1, s = fz / (fz + Z2 * 1.3);
      sx[i] = ox + X1 * s; sy[i] = oy + Y1 * s;
    }
    c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(this.bgC, 0, 0); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const hz = (p, r, col) => { const g = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(246,247,251,0)'); c.fillStyle = g; c.fillRect(p[0] - r, p[1] - r, 2 * r, 2 * r); };
    hz(prj(0, 0, 0), U * (0.6 + (geo ? this.Hc / 2 : this.BH) * ee), 'hsla(228,80%,70%,' + (geo ? 0.1 : 0.16) + ')');
    const mist = (x, y, z, r, h, a, ph) => { const p = prj(x + Math.sin(t / 5200 + ph) * 0.06, y + Math.cos(t / 6100 + ph) * 0.05, z), rr = r * U * p[2]; c.globalAlpha = a * (0.7 + 0.3 * Math.sin(t / 2600 + ph * 2)); c.drawImage(this._sprite(h), p[0] - rr, p[1] - rr, 2 * rr, 2 * rr); };
    const supM = {}; (this.props.supportKey || '').split(',').forEach(p => { const q = p.split(':'); if (q[0]) supM[q[0]] = +q[1]; });
    const G2D = { trust: 'd_trust', context: 'd_context', runtime: 'd_runtime', quality: 'd_quality' }, H0 = this.HUE;
    const lvl = (g) => G2D[g] && this.props.supportKey ? (supM[G2D[g]] != null ? supM[G2D[g]] : 2) : 2;
    const hueOf = (h) => { const g = Object.keys(H0).find(k => H0[k] === h); return g && lvl(g) <= 0 ? 'grey' : h; }, lvlOf = (h) => { const g = Object.keys(H0).find(k => H0[k] === h); return g ? lvl(g) : 2; };
    this._lvl = lvl;
    const Hh = this.HUE, mk = geo ? 0.45 + 0.6 * (1 - ee) : 1.3, kx = 0.62 + 0.38 * ee, ky = 0.78 + 0.22 * ee;
    const hm = (x, y, z, r, h, a, ph) => { const lv0 = lvlOf(h); mist(x * kx, y * ky, z * kx, r * (1.35 - 0.35 * ee) * (lv0 <= 0 ? 1.2 : 1), hueOf(h), a * (0.9 + 0.1 * ee) * (lv0 === 1 ? 0.7 : lv0 <= 0 ? 1.5 + (1 - ee) : 1), ph); };
    for (let q = 0; q < 14; q++) { const a = q * 2.4, yy = (q / 13 - 0.5) * (0.5 + (geo ? this.Hc : this.BH * 1.6) * ee); mist(Math.cos(a) * this.rA * 0.9, yy, Math.sin(a) * this.rA * 0.9, this.rM * (0.9 + 0.3 * (1 - ee)) * (geo ? 1 : 1.4), 228, (0.07 + 0.05 * (1 - ee)) * (geo ? 0.7 : 1.3), q); }
    for (let q = 0; q < 10; q++) { const a = q / 10 * 6.283; hm(Math.cos(a) * 0.34, T + 0.2, Math.sin(a) * 0.34, 0.2, Hh.trust, 0.1 * mk, q); hm(Math.cos(a) * 0.34, -T - 0.2, Math.sin(a) * 0.34, 0.2, Hh.trust, 0.1 * mk, q + 3); }
    for (let q = 0; q < 12; q++) { hm(-1.3 + Math.sin(q * 2.1) * 0.18, T * 0.4 + 0.08 + Math.cos(q * 1.7) * 0.15, 0, 0.22 + (q % 3) * 0.05, Hh.context, 0.1 * mk, q); hm(-1.3 + Math.sin(q * 1.3) * 0.18, -T * 0.3 - 0.3 + Math.cos(q * 1.1) * 0.12, 0, 0.18, Hh.quality, 0.08 * mk, q + 9); hm(1.3 + Math.sin(q * 1.9) * 0.18, -T * 0.3 + Math.cos(q * 2.3) * 0.15, 0, 0.22 + (q % 3) * 0.05, Hh.runtime, 0.1 * mk, q + 5); }
    c.globalAlpha = 1;
    const learn = this.props.focus === 'learn', per = 7200, wf = this._waveT ? ((ts - this._waveT) / 2600) * 1.5 - 0.25 : -9, pulseN = learn ? Math.floor(t / per) : Math.floor((this._waveT || 0) / 1000);
    // GPU-блоки (вариант B)
    // нити обвязки
    const hp = { trust: new Path2D(), context: new Path2D(), runtime: new Path2D(), quality: new Path2D(), io: new Path2D() }, HE = this.hEdges;
    for (let q = 0; q < HE.length; q += 2) { const a = HE[q], b = HE[q + 1], g = this.hGrp[a - n0]; hp[g].moveTo(sx[a], sy[a]); hp[g].lineTo(sx[b], sy[b]); }
    const zg = this.props.zone ? this.DOMG[this.props.zone] : null, dimG = (g) => !zg ? 1 : g === zg ? 1.6 : 0.3;
    const gcol = (g, L0, S0) => g === 'io' ? '#7c8298' : lvl(g) <= 0 ? 'hsl(228,8%,' + (L0 + 18) + '%)' : lvl(g) === 1 ? 'hsl(' + Hh[g] + ',' + Math.round(S0 * 0.55) + '%,' + (L0 + 12) + '%)' : 'hsl(' + Hh[g] + ',' + S0 + '%,' + L0 + '%)';
    Object.keys(hp).forEach(g => { c.strokeStyle = gcol(g, 42, 55); c.lineWidth = 0.7; c.globalAlpha = Math.min(1, (geo ? 0.18 : 0.28) * ee * ee * dimG(g)); c.stroke(hp[g]); });
    // трассы (B): прямые углы, узлы на изгибах, бегущие пакеты
    if (geo) {
      const RO = this.routesO, RC = this.routesC;
      RO.forEach((ro, ri) => {
        const pts = ro.pts.map((p, k) => { const q = RC[ri].pts[k]; return prj(q[0] + (p[0] - q[0]) * ee, q[1] + (p[1] - q[1]) * ee, q[2] + (p[2] - q[2]) * ee); });
        const col = gcol(ro.g, 42, 60);
        c.globalAlpha = Math.min(1, 0.7 * ee * dimG(ro.g)); c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(ro.dash ? [4, 4] : []); c.beginPath(); pts.forEach((p, k) => k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); c.setLineDash([]);
        c.fillStyle = col; pts.forEach((p, k) => { if (k && k < pts.length - 1 && ee > 0.3) c.fillRect(p[0] - 2.5, p[1] - 2.5, 5, 5); });
        let Ltot = 0; const seg = []; for (let k = 1; k < pts.length; k++) { const l = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); seg.push(l); Ltot += l; }
        for (let pk = 0; pk < 0; pk++) { let dd = (((t / 2400) + pk * 0.5 + ri * 0.13) % 1) * Ltot; for (let k = 0; k < seg.length; k++) { if (dd <= seg[k]) { const u = dd / seg[k], x = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * u, y = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * u; c.globalAlpha = 0.95; c.fillRect(x - 2, y - 2, 4, 4); break; } dd -= seg[k]; } }
      });
      c.globalAlpha = 1;
    }
    // нити ядра
    const L = this.layers;
    if (geo) {
      const lane = new Path2D(), heads = new Path2D(), spokes = new Path2D();
      for (let q = 0; q < 6; q++) { const e0 = this.emb[q * 7], h0 = this.head[q * 7]; lane.moveTo(sx[e0], sy[e0]); L.forEach(r => lane.lineTo(sx[r.res[q]], sy[r.res[q]])); lane.lineTo(sx[h0], sy[h0]); }
      L.forEach(r => {
        const hs = r.heads; for (let i = 0; i < hs.length; i++) { const j = (i + 1) % hs.length; if (r.hg[i] === r.hg[j] && hs.length > 1) { heads.moveTo(sx[hs[i]], sy[hs[i]]); heads.lineTo(sx[hs[j]], sy[hs[j]]); } }
        for (let q = 0; q < 3; q++) { const a = r.res[q * 2], b = hs[Math.floor(q * hs.length / 3)]; spokes.moveTo(sx[a], sy[a]); spokes.lineTo(sx[b], sy[b]); }
      });
      c.lineWidth = 0.7; c.strokeStyle = 'hsl(228,45%,30%)'; c.globalAlpha = 0.38 * ee * ee; c.stroke(lane);
      c.strokeStyle = 'hsl(228,70%,45%)'; c.globalAlpha = 0.21 * ee * ee; c.stroke(heads);
      c.globalAlpha = 0.15 * ee * ee; c.stroke(spokes);
    } else {
      const ce = new Path2D(), CE = this.cEdges; for (let q = 0; q < CE.length; q += 2) { const a = CE[q], b = CE[q + 1]; ce.moveTo(sx[a], sy[a]); ce.lineTo(sx[b], sy[b]); }
      c.lineWidth = 0.5; c.strokeStyle = 'hsl(232,55%,40%)'; c.globalAlpha = 0.1 + 0.12 * ee; c.stroke(ce);
    }
    // точки
    const pal = ['hsl(228,40%,26%)', 'hsl(228,75%,46%)', 'hsl(252,50%,56%)', 'hsl(265,70%,55%)', 'hsl(265,80%,45%)', 'hsl(205,65%,46%)'], sz = [1.5, 1.8, 1.4, 1.9, 3.6, 1.3];
    const paths = pal.map(() => new Path2D());
    for (let i = 0; i < n0; i++) { const k = P.k[i], s = sz[k] * (0.7 + 0.3 * ee); paths[k].rect(sx[i] - s / 2, sy[i] - s / 2, s, s); }
    const dc = (zg ? (zg === 'core' ? 1.25 : 0.35) : 1) * (0.28 + 0.72 * ee);
    paths.forEach((p, k) => { c.fillStyle = pal[k]; c.globalAlpha = Math.min(1, (k === 5 ? 0.5 : k === 2 || k === 3 ? 0.55 : 0.7) * dc); c.fill(p); });
    const hpt = { trust: new Path2D(), context: new Path2D(), runtime: new Path2D(), quality: new Path2D(), io: new Path2D() };
    for (let i = n0; i < n; i++) { const g = this.hGrp[i - n0]; hpt[g].rect(sx[i] - 0.8, sy[i] - 0.8, 1.6, 1.6); }
    Object.keys(hpt).forEach(g => { c.fillStyle = gcol(g, 40, 60); c.globalAlpha = Math.min(1, (0.35 + 0.4 * ee) * dimG(g) * (lvl(g) <= 0 ? 0.8 : 1)); c.fill(hpt[g]); });
    // волна прямого прохода
    const A = this.A, lit = new Path2D(), litE = new Path2D();
    L.forEach((r, l) => {
      const fr = (l + 0.5) / L.length, dd = Math.abs(fr - wf); if (dd > 0.05) return;
      const k = 1 - dd / 0.05;
      r.heads.forEach(i => lit.rect(sx[i] - 1.4, sy[i] - 1.4, 2.8, 2.8));
      if (A.E) { for (let q = 0; q < A.k; q++) { const j = r.mlp[(((l + 1) * 2654435761 + q * 40503 + pulseN * 97) >>> 0) % r.mlp.length], rr = 2.4 + 1.6 * k; litE.moveTo(sx[j] + rr, sy[j]); litE.arc(sx[j], sy[j], rr, 0, 6.283); } if (r.shared >= 0) { litE.moveTo(sx[r.shared] + 3.5, sy[r.shared]); litE.arc(sx[r.shared], sy[r.shared], 3.5, 0, 6.283); } }
      else r.mlp.forEach((j, q) => { if (q % 3 === 0) lit.rect(sx[j] - 1.2, sy[j] - 1.2, 2.4, 2.4); });
    });
    c.globalAlpha = 0.95; c.fillStyle = 'hsl(228,95%,58%)'; c.fill(lit); c.fillStyle = 'hsl(275,95%,58%)'; c.fill(litE);
    const gl = (lo, hi) => wf > lo && wf < hi ? Math.sin((wf - lo) / (hi - lo) * Math.PI) : 0;
    const gin = gl(-0.25, -0.06), gout = gl(1.06, 1.25), gemb = gl(-0.08, 0.02), ghead = gl(0.98, 1.08);
    if (gin > 0 || gout > 0) { const pp = new Path2D(); for (let i = n0; i < n; i++) { if (this.hGrp[i - n0] !== 'trust') continue; const up = P.yo[i] > 0; if ((up && gin > 0) || (!up && gout > 0)) pp.rect(sx[i] - 1.2, sy[i] - 1.2, 2.4, 2.4); } c.globalAlpha = Math.max(gin, gout); c.fillStyle = 'hsl(150,90%,40%)'; c.fill(pp); }
    if (gemb > 0 || ghead > 0) { const pp = new Path2D(); (gemb > 0 ? this.emb : this.head).forEach(i => pp.rect(sx[i] - 1.1, sy[i] - 1.1, 2.2, 2.2)); c.globalAlpha = Math.max(gemb, ghead); c.fillStyle = 'hsl(205,95%,52%)'; c.fill(pp); }
    c.globalAlpha = 1;
    this._drawPoints(prj, ee, T, zg, ts);
    this._labels(prj, ee, T, geo);
    this._drawStep(prj, ee, T, ts);
  }

  // слои раскладываются по GPU подряд; при >8 GPU — рамки узлов
  _gpuBoxes(prj, ee, T) {
    const c = this.ctx, hw = this._hw(), A = this.A, L = A.L, top = this.Hc / 2, s = this.rM + 0.07, a = ee * ee;
    if (a < 0.03) return;
    const G = Math.min(hw.G, 16), edges = (x0, x1, y0, y1, z0, z1) => { const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]].map(p => prj(p[0], p[1], p[2])); return [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].map(([i, j]) => [v[i], v[j]]); };
    const draw = (E2, col, al, lw, dash) => { c.globalAlpha = al; c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash || []); c.beginPath(); E2.forEach(([p, q]) => { c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); }); c.stroke(); c.setLineDash([]); };
    this._gpuLab = [];
    const yTop = top + 0.06, yBot = -top - 0.06, span = yTop - yBot;
    for (let g = 0; g < G; g++) {
      const y0 = yTop - span * g / G - 0.006, y1 = yTop - span * (g + 1) / G + 0.006;
      draw(edges(-s, s, y1, y0, -s, s), 'hsl(228,30%,38%)', a * 0.38, 1);
      draw(edges(s + 0.04, s + 0.1, y1 + 0.01, y0 - 0.01, -s * 0.6, s * 0.6), 'hsl(275,55%,50%)', a * 0.45, 1);
      const l0 = Math.floor(L * g / G) + 1, l1 = Math.floor(L * (g + 1) / G);
      this._gpuLab.push({ p: prj(-s, (y0 + y1) / 2, s), g, l0, l1, h: (y0 - y1), kv: prj(s + 0.07, y0 - 0.01, s * 0.6) });
    }
    if (hw.G > 8) for (let nd = 0; nd < Math.ceil(G / 8); nd++) {
      const g0 = nd * 8, g1 = Math.min(G, g0 + 8), y0 = yTop - span * g0 / G + 0.02, y1 = yTop - span * g1 / G - 0.02;
      draw(edges(-s - 0.05, s + 0.15, y1, y0, -s - 0.05, s + 0.05), 'hsl(228,40%,30%)', a * 0.5, 1.2, [5, 4]);
    }
    c.globalAlpha = 1;
  }

  _drawPoints(prj, ee, T, zg, ts) {
    const c = this.ctx, pts = this.pts || [], sel = this.props.selected, hits = (this.props.hitsKey || '').split(','), hov = this.state.hover;
    let hovP = null;
    pts.forEach(p => {
      const x = p.c[0] + (p.o[0] - p.c[0]) * ee, y = p.c[1] + (p.o[1] - p.c[1]) * ee, z = p.c[2] + (p.o[2] - p.c[2]) * ee, q = prj(x, y, z);
      p.sx = q[0]; p.sy = q[1];
      const isSel = sel === p.id, isHit = hits.indexOf(p.id) >= 0, isHov = hov === 'p:' + p.id, dim = zg && p.g !== zg && !isSel ? 0.3 : 1;
      const r = (isSel ? 6.5 : isHit ? 5.5 : isHov ? 5.5 : 3.6) * (0.75 + 0.25 * ee);
      if (isHit || isSel) { const g = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], r * 3.2); g.addColorStop(0, p.color + '66'); g.addColorStop(1, p.color + '00'); c.globalAlpha = 1; c.fillStyle = g; c.fillRect(q[0] - r * 3.2, q[1] - r * 3.2, r * 6.4, r * 6.4); }
      c.globalAlpha = dim * (0.85 + 0.15 * Math.sin(ts / 900 + p.n));
      c.beginPath(); c.arc(q[0], q[1], r, 0, 6.283); c.fillStyle = p.color; c.fill();
      c.lineWidth = isSel ? 2 : 1.2; c.strokeStyle = '#ffffff'; c.stroke();
      if (isSel) { c.globalAlpha = 0.8; c.beginPath(); c.arc(q[0], q[1], r + 4, 0, 6.283); c.strokeStyle = p.color; c.lineWidth = 1.2; c.stroke(); }
      if (isHov || isSel) hovP = p;
    });
    c.globalAlpha = 1;
    if (hovP) { const t = (hovP.title.length > 40 ? hovP.title.slice(0, 39) + '…' : hovP.title); this._pill(hovP.sx + 12, hovP.sy - 16, t, '', hovP.color, 1, 'left'); }
  }
  // сеть каналов: те же трассы, что нарисованы в сцене
  _net(ee, T) {
    const kx = 0.62 + 0.38 * ee, ky = 0.78 + 0.22 * ee, top = this.Hc / 2, C1 = T * 0.4 + 0.08, R1 = -T * 0.3, O = [-1.3, -T * 0.3 - 0.3], sy = 0.17;
    const N = { IN: [0, T + 0.46], GIN: [0, T + 0.2], BUS: [0, T + 0.08], BUSL: [-0.12, T + 0.08], CL: [-0.62, T + 0.08], CX: [-0.62, C1], CTXE: [-1.1, C1], CTX: [-1.3, C1], BUSR: [0.12, T + 0.08], RR: [0.82, T + 0.08], RX: [0.82, R1 + 0.07], TIN: [1.1, R1 + 0.07], TOUT: [1.1, R1 - 0.07], TOOLS: [1.3, R1],
      BUSB: [0, -T - 0.08], BBR: [0.12, -T - 0.08], B1: [0.66, -T - 0.08], B2: [0.66, R1 - 0.07], GOUT: [0, -T - 0.2], GOL: [-0.48, -T - 0.2], OQ: [-1.3, -T - 0.2], OBSE: [-1.3, O[1] - sy], OBS: [-1.3, O[1]], OUT: [0, -T - 0.46] };
    Object.keys(N).forEach(k => { N[k] = [N[k][0] * kx, N[k][1] * ky]; });
    N.EMB = [0, 0.37 + (top + 0.13 - 0.37) * ee]; N.HEAD = [0, -(0.37 + (top + 0.13 - 0.37) * ee)]; N.CORE = [0, 0];
    const E = [['IN', 'GIN'], ['GIN', 'BUS'], ['BUS', 'BUSL'], ['BUSL', 'CL'], ['CL', 'CX'], ['CX', 'CTXE'], ['CTXE', 'CTX'], ['BUS', 'BUSR'], ['BUSR', 'RR'], ['RR', 'RX'], ['RX', 'TIN'], ['TIN', 'TOOLS'], ['TOUT', 'TOOLS'], ['BUS', 'EMB'], ['EMB', 'CORE'], ['CORE', 'HEAD'], ['HEAD', 'BUSB'], ['BUSB', 'GOUT'], ['BUSB', 'BBR'], ['BBR', 'B1'], ['B1', 'B2'], ['B2', 'TOUT'], ['GOUT', 'GOL'], ['GOL', 'OQ'], ['OQ', 'OBSE'], ['OBSE', 'OBS'], ['GOUT', 'OUT']];
    return { N, E };
  }
  _route(from, to, ee, T) {
    const K = { in: 'IN', d_trust: 'GIN', d_context: 'CTX', tok: 'BUS', emb: 'EMB', core: 'CORE', kv: 'CORE', d_models: 'CORE', d_runtime: 'TOOLS', d_trust_out: 'GOUT', d_quality: 'OBS', out: 'OUT' };
    const { N, E } = this._net(ee, T), a = K[from] || 'IN', b = K[to] || 'CORE', adj = {};
    E.forEach(([p, q]) => { const d = Math.hypot(N[p][0] - N[q][0], N[p][1] - N[q][1]); (adj[p] = adj[p] || []).push([q, d]); (adj[q] = adj[q] || []).push([p, d]); });
    const dist = { [a]: 0 }, prev = {}, left = new Set(Object.keys(N));
    let g1 = 0; while (left.size && ++g1 < 5000) { let u = null; left.forEach(k => { if (dist[k] != null && (u === null || dist[k] < dist[u])) u = k; }); if (u === null || u === b) break; left.delete(u); (adj[u] || []).forEach(([v, d]) => { if (dist[v] == null || dist[u] + d < dist[v]) { dist[v] = dist[u] + d; prev[v] = u; } }); }
    const path = []; for (let u = b, g2 = 0; u && g2 < 500; u = prev[u], g2++) { path.unshift(N[u]); if (u === a) break; }
    return path.length > 1 ? path : [N[a], N[b]];
  }
  _drawStep(prj, ee, T, ts) {
    const c = this.ctx, pk = this._pk, pr = this.props;
    const scr = (k) => { const a = this._anchor(k, ee, T); return prj(a[0], a[1], 0); };
    if (pk && ts - pk.t < 1250) {
      const pts = this._route(pk.from, pk.to, ee, T).map(p => prj(p[0], p[1], 0)), u = Math.min(1, (ts - pk.t) / 900), fade = 1 - Math.max(0, (ts - pk.t - 900) / 350);
      const seg = []; let Lt = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); Lt += l; }
      let d = u * Lt; const lit = [pts[0]]; let head = pts[0];
      for (let i = 0; i < seg.length; i++) { if (d >= seg[i]) { lit.push(pts[i + 1]); d -= seg[i]; head = pts[i + 1]; } else { const f = seg[i] ? d / seg[i] : 0; head = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; lit.push(head); break; } }
      const col = pr.stepColor || '#6366f1';
      if (ee < 0.55) {
        const p0 = pts[0], p1 = pts[pts.length - 1], mx = (p0[0] + p1[0]) / 2 + (p1[1] - p0[1]) * 0.35, my = (p0[1] + p1[1]) / 2 - (p1[0] - p0[0]) * 0.35, spr = this._sprite(228);
        for (let q = 0; q < 14; q++) { const v = u - q * 0.035; if (v < 0) break; const w0 = 1 - v, bx = w0 * w0 * p0[0] + 2 * w0 * v * mx + v * v * p1[0], by = w0 * w0 * p0[1] + 2 * w0 * v * my + v * v * p1[1], r = 18 - q * 0.8 + Math.sin(ts / 200 + q) * 2; c.globalAlpha = fade * (0.55 - q * 0.035); c.drawImage(spr, bx - r, by - r, 2 * r, 2 * r); }
        c.globalAlpha = 1; return this._stepPill(prj, ee, T, ts, scr);
      }
      c.globalAlpha = 0.22 * fade; c.strokeStyle = col; c.lineWidth = 5; c.lineJoin = 'round'; c.beginPath(); lit.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
      c.globalAlpha = 0.95 * fade; c.lineWidth = 1.8; c.stroke();
      const g = c.createRadialGradient(head[0], head[1], 0, head[0], head[1], 14); g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, col); g.addColorStop(1, 'rgba(246,247,251,0)');
      c.globalAlpha = fade; c.fillStyle = g; c.fillRect(head[0] - 14, head[1] - 14, 28, 28); c.globalAlpha = 1;
    }
    this._stepPill(prj, ee, T, ts, scr);
  }
  _stepPill(prj, ee, T, ts, scr) {
    const c = this.ctx, pr = this.props;
    if (pr.stepKey && this._stepT && ts - this._stepT < 5200 && ts - this._stepT > 700) {
      const k = pr.stepKey, p = scr(k), age = ts - this._stepT, a = Math.min(1, (age - 700) / 250) * Math.min(1, (5200 - age) / 400);
      const g = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], 46); g.addColorStop(0, (pr.stepColor || '#6366f1').replace('hsl(', 'hsla(').replace(')', ',0.35)')); g.addColorStop(1, 'rgba(246,247,251,0)');
      c.globalAlpha = a; c.fillStyle = g; c.fillRect(p[0] - 46, p[1] - 46, 92, 92); c.globalAlpha = 1;
      const right = !(k === 'd_context' || k === 'd_quality');
      this._pill(p[0] + (right ? 22 : -22), p[1] - 30, pr.stepTitle || '', pr.stepDone || '', pr.stepColor || '#6366f1', a, right ? 'left' : 'right');
    }
  }
  _ir() { const pr = this.props, vw = this.W || 1440; if (pr.hwDock === 'bottom' || pr.hwHidden) return pr.insetR != null ? pr.insetR : 16; if (pr.focus === 'learn' && this.state.hwOpen && vw >= 900) return 300 + 18 + 16; if (pr.focus === 'learn' && vw >= 900) return 190; return pr.insetR != null ? pr.insetR : 16; }
  _pill(x, y, title, sub, hue, a, align) {
    if (a < 0.03) return;
    const c = this.ctx; c.font = '600 11.5px Geist, system-ui'; const w1 = c.measureText(title).width; c.font = "400 10px 'Geist Mono', monospace"; const w2 = sub ? c.measureText(sub).width : 0;
    const w = Math.max(w1, w2) + 30, h = sub ? 38 : 24, lo = (this.props.insetL != null ? this.props.insetL : 16) - 8, hi = (this.W || 1440) - this._ir() - 6, x0 = Math.max(lo, Math.min(hi - w, align === 'right' ? x - w : align === 'center' ? x - w / 2 : x));
    if (this._rects) { for (let k = 0; k < 10; k++) { const hit = this._rects.find(r => x0 < r.x + r.w + 4 && x0 + w + 4 > r.x && y - h / 2 < r.y + r.h + 3 && y + h / 2 + 3 > r.y); if (!hit) break; y = hit.y + hit.h + h / 2 + 4; } this._rects.push({ x: x0, y: y - h / 2, w, h }); }
    c.globalAlpha = a; c.beginPath(); if (c.roundRect) c.roundRect(x0, y - h / 2, w, h, 12); else c.rect(x0, y - h / 2, w, h);
    c.fillStyle = 'rgba(255,255,255,0.82)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 1; c.stroke();
    c.fillStyle = typeof hue === 'number' ? 'hsl(' + hue + ',70%,48%)' : hue; c.beginPath(); c.arc(x0 + 12, y - (sub ? 7 : 0), 3.5, 0, 6.283); c.fill();
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#0b0b14'; c.font = '600 11.5px Geist, system-ui'; c.fillText(title, x0 + 21, y - (sub ? 7 : 0));
    if (sub) { c.fillStyle = '#6b7186'; c.font = "400 10px 'Geist Mono', monospace"; c.fillText(sub, x0 + 21, y + 9); }
    c.globalAlpha = 1;
  }
  _ru(v) { return ({ undisclosed: 'не раскрыто', compact: 'компактная' })[v] || v; }
  _pl(k) { const a = k % 10, b = k % 100; return a === 1 && b !== 11 ? 'слой' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'слоя' : 'слоёв'; }
  _tag(x, y, s, col, a, al) { if (a < 0.03) return; const c = this.ctx; c.font = "500 10.5px 'Geist Mono', monospace"; if (this._rects) { const w = c.measureText(s).width, x0 = al === 'right' ? x - w : x, r0 = { x: x0 - 2, y: y - 8, w: w + 4, h: 16 }; if (this._rects.some(r => r0.x < r.x + r.w && r0.x + r0.w > r.x && r0.y < r.y + r.h && r0.y + r0.h > r.y)) return; this._rects.push(r0); } c.globalAlpha = a; c.textAlign = al || 'left'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = 'rgba(246,247,251,0.9)'; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y); c.globalAlpha = 1; }
  _leader(p, q, a) { if (a < 0.03) return; const c = this.ctx; c.globalAlpha = a * 0.55; c.strokeStyle = '#8a90a6'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); c.globalAlpha = 1; }
  _labels(prj, ee, T, geo) {
    const A = this.A, n = (x) => Number(x).toLocaleString('ru-RU'), Hc = this.Hc, Hh = this.HUE, top = Hc / 2, P = this.P, sx = P.sx, sy = P.sy, c = this.ctx;
    this._rects = []; const narrow = (this._AW || 999) < 480, learn = this.props.focus === 'learn', ai = ee * ee * (learn || this.props.focus === 'glossary' ? 1 : 0), closed = 1 - Math.min(1, ee * 2.5), m = this.M.byModel[this.mid], defer = [], pl = this._pl;
    
    if (false) {
      const hw = this._hw();
      if (this._gpuLab && ai > 0.03) {
        const few = this._gpuLab.length <= 8;
        this._gpuLab.forEach((g, i) => {
          if (!few && i % 8 !== 0) return;
          const nd = Math.floor(g.g / 8) + 1, lastG = few ? g : this._gpuLab[Math.min(this._gpuLab.length - 1, i + 7)];
          const title = hw.G === 1 ? (['Телефон', 'Ноутбук', '1 GPU', '1 GPU', '1 GPU'][hw.tier]) : few ? 'GPU ' + (g.g + 1) : 'Узел ' + nd + ' · ' + (lastG.g - g.g + 1) + ' GPU';
          const sub = hw.G === 1 ? 'все ' + n(A.L) + ' ' + pl(A.L) + ' · ' + n(Math.round(hw.tier <= 1 ? hw.q4 : hw.native)) + ' ГБ' + (hw.tier <= 1 ? ' в 4 бит' : '') : 'слои ' + g.l0 + '–' + lastG.l1;
          this._tag(g.p[0] - 8, g.p[1], title + ' · ' + sub, '#22263a', ai, 'right');
        });
        const kv = this._gpuLab[0]; defer.push(() => this._tag(kv.kv[0] + 8, kv.kv[1] + 16, 'KV-кэш', '#7e22ce', ai));
      }
    } else {
      const bx = -this.rM - 0.06, ytop = geo ? top : this.BH * 0.85, pa = prj(bx, ytop, 0), pb = prj(bx, -ytop, 0);
      if (ai > 0.03) { c.globalAlpha = ai * 0.45; c.strokeStyle = '#3d4258'; c.lineWidth = 1; c.beginPath(); c.moveTo(pa[0] + 4, pa[1]); c.lineTo(pa[0], pa[1]); c.lineTo(pb[0], pb[1]); c.lineTo(pb[0] + 4, pb[1]); c.stroke(); c.globalAlpha = 1; }
      if (!narrow) defer.push(() => this._tag(Math.min(pa[0], pb[0]) - 6, (pa[1] + pb[1]) / 2, n(A.L) + ' ' + pl(A.L), '#22263a', ai, 'right'));
    }
    if (ai > 0.03) {
      const l1 = this.layers[Math.min(1, this.layers.length - 1)], hI = l1.heads[0], lm = this.layers[Math.floor(this.layers.length * 0.25)], mI = lm.mlp[0];
      const col = prj(this.rM + 0.26, 0, 0)[0], e0 = prj(this.rV, geo ? top + 0.13 : this.BH * 0.93, 0);
      const items = [
        geo ? { a: [e0[0], e0[1]], t: 'Эмбеддинг', s: n(A.V) + ' × ' + n(A.d), h: 205 } : null,
        { a: [sx[hI], sy[hI]], t: 'Attention', s: A.H + ' голов · ' + (A.KV > 1 ? A.KV + ' групп KV' : 'MLA'), h: 228 },
        { a: [sx[mI], sy[mI]], t: A.E ? 'MoE' : 'MLP', s: A.E ? A.E + ' экспертов · ' + A.k + ' акт.' : '≈ ' + n(Math.round(A.d * 3.5)) + ' нейронов', h: 265 }
      ].filter(Boolean);
      let py = -1e9;
      items.forEach(it => { const y = Math.max(it.a[1], py + (narrow ? 32 : 46)); py = y; this._leader(it.a, [col, y], ai); this._pill(col, y, it.t, narrow ? '' : it.s, it.h, ai, 'left'); });
    }
    if (geo && !narrow) { const h1 = prj(-this.rV * 0.75, -top - 0.13, this.rV * 0.5); defer.push(() => this._tag(h1[0] - 8, h1[1] + 6, 'LM head · d → ' + n(A.V), '#0369a1', ai, 'right')); }
    const lv = this._lvl || (() => 2), hd = (g) => lv(g) <= 0 ? '#b3b8c7' : Hh[g];
    const zc = {}; (this.props.zoneCounts || '').split(';').forEach(p => { const q = p.split('='); if (q[0]) zc[q[0]] = q[1]; });
    const zs = (g, s0) => zc[g] ? (narrow ? zc[g] : zc[g] + ' · ' + s0) : (narrow ? '' : s0);
    const ha = Math.min(1, ee * 1.6) * (this.props.stepKey && this._stepT && performance.now() - this._stepT < 5200 ? 0.2 : 1), gi = prj(-0.5, T + 0.2, 0), go = prj(-0.5, -T - 0.2, 0);
    this._pill(gi[0] - 14, gi[1] - 12, 'Входной guardrail', zs('trust', 'injection · PII'), hd('trust'), ha, 'right');
    this._pill(go[0] - 14, go[1] + 22, 'Выходной guardrail', narrow ? '' : 'политика · утечки', hd('trust'), ha, 'right');
    const cc = prj(-1.52, T * 0.4 + 0.08, 0), rr = geo ? prj(1.3, -T * 0.3 - 0.17 - 0.14, 0) : prj(1.3, -T * 0.3 - 0.32, 0);
    this._pill(cc[0] - 6, cc[1], 'Сборка контекста', zs('context', 'system · RAG · память'), hd('context'), ha, 'right');
    this._pill(rr[0], rr[1], 'Инструменты', zs('runtime', 'вызовы · агенты'), hd('runtime'), ha, 'center');
    const oq = prj(-1.52, -T * 0.3 - 0.3, 0);
    this._pill(oq[0] - 6, oq[1], 'Наблюдаемость', zs('quality', lv('quality') <= 0 ? 'нет в модели · своя' : 'трейсинг · оценка'), hd('quality'), ha, 'right');
    const ti = prj(0, T + 0.46, 0), to = prj(0, -T - 0.46, 0);
    this._pill(ti[0] + 14, ti[1], 'запрос', '', '#7c8298', ha, 'left');
    this._pill(to[0], to[1] + 24, 'ответ', '', '#7c8298', ha, 'center');
    defer.forEach(fn => fn());
    this._rects = null;
  }

}

// @ts-nocheck
// Движок карты: обвязка и модель как стопки тонких стеклянных плоскостей с точками.
// Запрос не рисуется линией: он по очереди зажигает часть каждого слоя. Наблюдаемость — слепки прошедших запросов.
// Класс не зависит от React: получает canvas и контейнер, props задаются через setProps().
import { ATLAS_ARCH } from '@/entities/model/lib/arch';
import { ATLAS_MODELS } from '@/entities/model/lib/registry';

export interface ArchPoint { id: string; n: number; title: string; color: string; dom: string }
export interface ArchProps {
  modelId?: string; focus?: 'incidents' | 'glossary' | 'learn'; open?: boolean; points?: ArchPoint[]; pointsKey?: string;
  selected?: string | null; hitsKey?: string; zone?: string | null; zoneCounts?: string; supportKey?: string;
  stepKey?: string | null; stepN?: number; stepTitle?: string; stepDone?: string; stepColor?: string;
  insetL?: number; insetR?: number; insetT?: number; insetB?: number; hwDock?: string; hwHidden?: boolean; hwOpen?: boolean;
  plain?: boolean; en?: boolean;
  onPoint?: (id: string) => void; onZone?: (id: string) => void; onOpen?: (open: boolean) => void; onModel?: (id: string) => void;
}

const COL = { trust: [16, 185, 129], context: [6, 182, 212], core: [99, 102, 241], edge: [129, 140, 248], runtime: [168, 85, 247], memory: [245, 158, 11], quality: [217, 70, 239] };
const INK = { trust: '#047857', context: '#0e7490', core: '#4338ca', runtime: '#7e22ce', memory: '#b45309', quality: '#a21caf', req: '#2563eb' };
const REQ = '37,99,235', AFT = '96,150,255', MAXP = 72, NB = 6;
const ZONE = { gi: 'd_trust', go: 'd_trust', ctx: 'd_context', mem: 'd_context', model: 'd_models', perm: 'd_runtime', tools: 'd_runtime' };
const GRP = { d_trust: ['gi', 'go'], d_context: ['ctx', 'mem'], d_runtime: ['tools', 'perm'], d_models: ['model'] };
const TXT = {
  gi: ['Входной guardrail', 'Input guardrail'], ctx: ['Контекст', 'Context'], model: ['Модель', 'Model'], go: ['Выходной guardrail', 'Output guardrail'],
  mem: ['Память', 'Memory'], perm: ['Разрешение', 'Permission'], tools: ['Инструменты', 'Tools'], obs: ['Наблюдаемость', 'Observability'], req: ['Запрос', 'Request'], ans: ['Ответ', 'Answer'],
};

export class ArchScene {
  props: ArchProps = {};
  state: any = { mid: null, vw: 1440, vh: 900, hwOpen: true, cursor: 'grab', hover: null };
  onState: null | (() => void) = null;
  canvas: HTMLCanvasElement; wrap: HTMLElement; M: any; A: any; ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, wrap: HTMLElement, props: ArchProps) {
    this.canvas = canvas; this.wrap = wrap; this.props = props;
    this.M = ATLAS_MODELS; this.ctx = canvas.getContext('2d');
    this._ptrs = new Map(); this.yawOff = 0; this.pitchOff = 0; this.zoom = 1; this.casts = [this._newCast()]; this.run = { core: false, seed: 7 };
    this._onWheel = (e) => { e.preventDefault(); this.zoom = Math.max(0.6, Math.min(2.6, this.zoom * Math.exp(-e.deltaY * 0.0012))); };
    canvas.addEventListener('wheel', this._onWheel, { passive: false });
    this._resize(); this._ro = new ResizeObserver(() => this._resize()); this._ro.observe(wrap);
    this._build(); this._t0 = performance.now();
    const loop = (ts) => { if (this._dead) return; this._raf = requestAnimationFrame(loop); this._frame(ts); };
    this._raf = requestAnimationFrame(loop);
  }
  get mid() { return this.props.modelId || this.state.mid || 'gpt-oss-120b'; }
  setState(p) { Object.assign(this.state, p); if (this.onState) this.onState(); }
  forceUpdate() { if (this.onState) this.onState(); }
  destroy() { this._dead = true; this.canvas.removeEventListener('wheel', this._onWheel); cancelAnimationFrame(this._raf); if (this._ro) this._ro.disconnect(); }

  setProps(next: ArchProps) {
    const pp = this.props; this.props = next;
    if (pp.modelId !== next.modelId) { this._build(); this.forceUpdate(); }
    else if (pp.pointsKey !== next.pointsKey) this._buildPoints();
    if (pp.stepN !== next.stepN && next.stepKey) this._step(next.stepKey);
    if (!next.stepKey && pp.stepKey) this.sweeps = [];
  }

  // указатель
  onDown = (e) => { this._ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (this._ptrs.size === 2) { const [a, b] = [...this._ptrs.values()]; this._pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: this.zoom }; this._drag = null; return; } this._drag = { x: e.clientX, y: e.clientY, y0: this.yawOff, p0: this.pitchOff, moved: false }; };
  onMove = (e) => {
    if (this._ptrs.has(e.pointerId)) this._ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this._pinch && this._ptrs.size === 2) { const [a, b] = [...this._ptrs.values()]; this.zoom = Math.max(0.6, Math.min(2.6, this._pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, this._pinch.d))); return; }
    if (this._drag) { const dx = e.clientX - this._drag.x, dy = e.clientY - this._drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) this._drag.moved = true; if (this._drag.moved) { this.yawOff = Math.max(-1.1, Math.min(1.1, this._drag.y0 + dx * 0.005)); this.pitchOff = Math.max(-0.5, Math.min(0.7, this._drag.p0 + dy * 0.004)); } return; }
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
    blob(Wd * 0.22, Hd * 0.18, S * 0.52, 'rgba(108,140,255,0.13)'); blob(Wd * 0.84, Hd * 0.26, S * 0.46, 'rgba(167,139,250,0.11)');
    blob(Wd * 0.10, Hd * 0.88, S * 0.34, 'rgba(96,165,250,0.08)'); blob(Wd * 0.55, Hd * 0.5, S * 0.36, 'rgba(255,255,255,0.85)');
  }
  _rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // железо: сколько памяти нужно и куда модель помещается (читает hwInfo)
  _hw() {
    const A = this.A, hid = A.src === 'hidden' || !A.pB, pB = A.pB || 0, native = pB * A.q, q4 = pB * 0.56, G = Math.max(1, Math.ceil(native * 1.2 / 80));
    const tier = q4 <= 3 ? 0 : q4 <= 18 ? 1 : native * 1.2 <= 80 || q4 <= 60 ? 2 : native * 1.2 <= 640 ? 3 : 4;
    return { hid, native, q4, G, tier, nodes: Math.ceil(G / 8) };
  }

  /** Раскладка: основная линия слева направо, снизу память и инструменты. Число пластин модели — из её архитектуры. */
  _build() {
    const A = this.A = ATLAS_ARCH.get(this.M.byModel[this.mid]), rnd = this._rng(4321);
    const L = A.L, NL = Math.min(L, MAXP), w = Math.min(1.25, Math.sqrt(A.d / 8192));
    // масштаб: одна точка — 1, 10 или 100 млн параметров, чтобы модель любого размера помещалась на экран и оставалась сравнимой
    const pB = A.pB || 0, unit = !pB ? 0 : pB < 20 ? 1 : pB < 200 ? 10 : 100, gM = unit ? Math.max(5, Math.min(24, Math.round(Math.sqrt(pB * 1000 / unit / NL)))) : 16;
    this.unit = unit; this.share = A.E && A.aB && pB ? Math.min(1, A.aB / pB) : 1;
    const sM = unit ? Math.max(0.36, gM * 0.061) : 0.78 + 0.3 * w, len = Math.min(2.7, 0.5 + L * 0.03), GAP = 0.4, SP = 0.2;
    this.hid = A.src === 'hidden'; this.capped = L > MAXP;
    this.YS = -(Math.max(1.02, sM) + 0.68); this.YI = this.YS - 0.92;
    const panes = [], blocks = {};
    const stack = (id, g, x0, n, sp, s, grid, y0, sf) => {
      const b = blocks[id] = { id, g, x0, x1: x0 + (n - 1) * sp, s, y0, ids: [] };
      for (let k = 0; k < n; k++) {
        const ss = sf ? sf(k) : s, m = grid, N = m * m, p = { b: id, g, k, x: x0 + k * sp, s: ss, y0, m, N, u: new Float32Array(N), v: new Float32Array(N), r: new Float32Array(N), lit: new Uint8Array(N), heat: 0, glow: 0, edge: id === 'model' && (k === 0 || k === n - 1) };
        for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) { const q = i * m + j; p.u[q] = (i + 0.5) / m; p.v[q] = (j + 0.5) / m; p.r[q] = rnd() < 0.12 ? -1 : rnd(); }
        b.ids.push(panes.length); panes.push(p);
      }
      b.smax = sf ? Math.max(...b.ids.map(i => panes[i].s)) : s; return b;
    };
    let x = 0;
    stack('gi', 'trust', x, 3, SP, 0.58, 13, 0); x = blocks.gi.x1 + GAP;
    stack('ctx', 'context', x, 3, SP, 0.72, 15, 0); x = blocks.ctx.x1 + GAP + 0.06;
    stack('model', 'core', x, NL, len / Math.max(1, NL - 1), sM, gM, 0, (k) => sM * (0.92 + 0.08 * Math.sin(Math.PI * k / Math.max(1, NL - 1)))); x = blocks.model.x1 + GAP + 0.06;
    stack('go', 'trust', x, 3, SP, 0.58, 13, 0);
    const cx = blocks.ctx, md = blocks.model;
    stack('mem', 'memory', (cx.x0 + cx.x1) / 2 - 0.24, 4, 0.16, 0.36, 10, this.YS);
    stack('tools', 'runtime', md.x1 - 0.5, 4, 0.16, 0.38, 10, this.YS);
    stack('perm', 'trust', blocks.tools.x0 - 0.42, 1, 0.16, 0.46, 11, this.YS);
    const mid = (blocks.gi.x0 + blocks.go.x1) / 2;
    panes.forEach(p => { p.x -= mid; }); Object.values(blocks).forEach(b => { b.x0 -= mid; b.x1 -= mid; });
    this.panes = panes; this.blocks = blocks; this.Xh = (blocks.go.x1 - blocks.gi.x0) / 2 + 0.3; this.sM = sM; this.sweeps = []; this._born = performance.now();
    this._roll(this.run.seed); this._buildPoints();
  }
  /** Какая часть каждого слоя отзывается на запрос. Плотная модель — слой целиком, смесь экспертов — полосы. */
  _roll(seed) {
    const rnd = this._rng(seed), A = this.A, moe = !!A.E, nb = 2, pb = Math.min(0.92, Math.max(0.1, (this.share || 1) * NB / nb / 0.88)); let cy = 0.62, cz = 0.46, wz = 0.5; const hw = moe ? 0.2 : 0.44, pbz = Math.min(0.92, Math.max(0.12, (this.share || 1) * NB / nb / (2 * hw)));
    this.panes.forEach(p => {
      const N = p.N; let on = null;
      if (p.b === 'model') { wz = moe ? Math.max(0.24, Math.min(0.76, wz + (rnd() - 0.5) * 0.11)) : 0.5; p.zc = ((moe ? wz : 0.5) * 2 - 1) * p.s; p.zh = hw * 2 * p.s; }
      if (p.b === 'model' && !p.edge && moe) { on = new Uint8Array(NB); let k = 0; while (k < nb) { const i = Math.floor(rnd() * NB); if (!on[i]) { on[i] = 1; k++; } } }
      cy = Math.max(0.3, Math.min(0.75, cy + (rnd() - 0.6) * 0.08)); cz = Math.max(0.3, Math.min(0.7, cz + (rnd() - 0.5) * 0.08));
      if (p.b !== 'model') { p.zc = (cz * 2 - 1) * p.s; p.zh = 0.34 * p.s; }
      for (let q = 0; q < N; q++) {
        if (p.r[q] < 0) { p.lit[q] = 0; continue; }
        if (p.b === 'model') p.lit[q] = p.edge ? (rnd() < 0.7 ? 1 : 0) : on ? (on[Math.min(NB - 1, Math.floor(p.u[q] * NB))] && Math.abs(p.v[q] - wz) < hw && rnd() < pbz ? 1 : 0) : rnd() < 0.9 ? 1 : 0;
        else { const d = Math.hypot(p.u[q] - cy, p.v[q] - cz) / 0.2; p.lit[q] = d < 1 && rnd() < 1.15 - d ? 1 : 0; }
      }
    });
  }
  _newCast() { return { ribs: [], t: performance.now(), done: false }; }
  _sweep(id, dur, from, to) { const b = this.blocks[id]; if (!b) return; let ids = b.ids; if (from != null) ids = ids.slice(from, to); this.sweeps.push({ ids, t0: performance.now(), dur: dur || (ids.length > 6 ? 1700 : 650), main: id === 'gi' || id === 'ctx' || id === 'model' || id === 'go', done: 0, rib: null }); }
  /** Шаг прохода: какие пластины зажечь и что отпечатать в слепке. */
  _step(key) {
    const run = this.run;
    if (key === 'in') {
      if (this.casts[0].ribs.length) { this.casts[0].done = true; this.casts.unshift(this._newCast()); if (this.casts.length > 4) this.casts.length = 4; }
      run.core = false; run.seed = (run.seed * 31 + 17) >>> 0; this._roll(run.seed); this.panes.forEach(p => { p.heat = 0; p.glow = 0; }); this.sweeps = []; this.at = 'in'; return;
    }
    this.sweeps = []; this.at = key;
    const nM = this.blocks.model.ids.length;
    if (key === 'd_trust') { if (run.core) { this._sweep('perm'); this.at = 'perm'; } else this._sweep('gi'); }
    else if (key === 'd_context') { this._sweep('ctx'); this._sweep('mem'); }
    else if (key === 'tok') this._sweep('model', 400, 0, 1);
    else if (key === 'emb') this._sweep('model', 500, 0, 2);
    else if (key === 'core') { this._sweep('model', run.core ? 1300 : 1900); run.core = true; }
    else if (key === 'kv') { this.blocks.model.ids.forEach(i => { this.panes[i].glow = Math.max(this.panes[i].glow, 0.75); }); this._sweep('model', 500, nM - 2, nM); }
    else if (key === 'd_runtime') this._sweep('tools');
    else if (key === 'd_trust_out') this._sweep('go');
    else if (key === 'd_quality') { this._sweep('mem'); this._flash = performance.now(); }
    else if (key === 'out') { this._flash = performance.now(); this.casts[0].done = true; }
  }

  // точки записей: на пластинах своего блока, по домену
  _buildPoints() {
    const pts = this.props.points || [], B = this.blocks, P = this.panes;
    const hsh = (s) => { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
    const u = (h, k) => ((h >>> (k * 5)) & 1023) / 1023;
    this.pts = pts.map(p => {
      const h = hsh(p.id), ids = GRP[p.dom]; let w;
      if (!ids) w = [(u(h, 0) * 2 - 1) * this.Xh * 0.9, this.YI + 0.02, (u(h, 1) * 2 - 1) * 0.5];
      else { const b = B[ids[(h >>> 3) % ids.length]], pn = P[b.ids[(h >>> 7) % b.ids.length]]; w = [pn.x, pn.y0 + (u(h, 0) * 2 - 1) * pn.s * 0.86, (u(h, 1) * 2 - 1) * pn.s * 0.86]; }
      return { id: p.id, title: p.title, color: p.color, dom: p.dom, w, sx: 0, sy: 0 };
    });
  }
  _pick(e) {
    if (!this._prj) return null;
    const b = this.canvas.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    let best = null, bd = 11;
    (this.pts || []).forEach(p => { const d = Math.hypot(p.sx - x, p.sy - y); if (d < bd) { bd = d; best = { type: 'p', id: p.id }; } });
    if (best) return best;
    let zb = null, zd = 1e9;
    Object.values(this.blocks).forEach(bl => { const q = this._prj((bl.x0 + bl.x1) / 2, bl.y0, 0), rad = Math.max(26, (bl.smax * 0.8 + (bl.x1 - bl.x0) * 0.3) * this._U), d = Math.hypot(q[0] - x, q[1] - y); if (d < rad && d / rad < zd) { zd = d / rad; zb = { type: 'z', id: ZONE[bl.id] }; } });
    if (!zb) { const q = this._prj(0, this.YI, 0); if (Math.abs(q[1] - y) < 0.22 * this._U && Math.abs(q[0] - x) < this.Xh * this._U) zb = { type: 'z', id: 'd_quality' }; }
    return zb;
  }

  _frame(ts) {
    const c = this.ctx; if (!this.panes || !this.W) return;
    const now = performance.now(), dt = Math.min(0.05, (ts - (this._last || ts)) / 1000); this._last = ts;
    const t = ts - this._t0, W = this.W, H = this.H, dpr = this.dpr, pr = this.props, P = this.panes, B = this.blocks;
    const IL = pr.insetL != null ? pr.insetL : 16, IR = pr.insetR != null ? pr.insetR : 16, IT = pr.insetT != null ? pr.insetT : 70, IB = pr.insetB != null ? pr.insetB : 80, AW = Math.max(240, W - IL - IR), AH = Math.max(240, H - IT - IB);
    const U = this._U = Math.min(AW / (2 * this.Xh * 0.95 + 1.5), AH / (this.sM - this.YI + 1.1)) * this.zoom, ox = IL + AW / 2, oy = IT + AH / 2 + (this.sM + this.YI - 0.1) / 2 * U, fz = U * 16;
    const yaw = 0.4 + this.yawOff + Math.sin(t * 0.00013) * 0.035, tilt = 0.23 + this.pitchOff + Math.sin(t / 7000) * 0.012;
    const cy1 = Math.cos(yaw), sy1 = Math.sin(yaw), cx1 = Math.cos(tilt), sx1 = Math.sin(tilt);
    const born = Math.min(1, (now - this._born) / 1100), fan = 0.35 + 0.65 * (1 - Math.pow(1 - born, 3));
    const prj = this._prj = (x, y, z) => { const X0 = x * fan * U, Y0 = -y * U, Z0 = z * U, X1 = X0 * cy1 + Z0 * sy1, Z1 = -X0 * sy1 + Z0 * cy1, Y1 = Y0 * cx1 - Z1 * sx1, Z2 = Y0 * sx1 + Z1 * cx1, s = fz / (fz + Z2); return [ox + X1 * s, oy + Y1 * s, s, Z2]; };

    // активация: волна идёт по пластинам, за ней остаётся послесвечение (KV-кэш)
    const dk = Math.exp(-dt * 2.4), gk = Math.exp(-dt * (pr.stepKey ? 0.02 : 0.25));
    P.forEach(p => { p.heat *= dk; p.glow *= gk; });
    this.sweeps.forEach(sw => {
      const n = sw.ids.length, win = n <= 4 ? n : Math.max(4, n * 0.13), h = Math.min(n - 1, -1 + (now - sw.t0) / sw.dur * (n + 1));
      for (let j = 0; j < n; j++) { const p = P[sw.ids[j]], d = h - j, v = d >= 0 ? Math.max(0, 1 - d / win) : Math.max(0, 1 + d); if (v > p.heat) p.heat = v; if (d >= 0 && p.glow < 0.62) p.glow = 0.62;
        if (d >= 0 && j >= sw.done) { sw.done = j + 1; const ribs = this.casts[0].ribs, last = ribs[ribs.length - 1], lp = last && last.pts[last.pts.length - 1]; if (!sw.rib) { sw.rib = sw.main && last && last.main && lp.x < p.x ? last : { main: sw.main, pts: [] }; if (sw.rib !== last) ribs.push(sw.rib); } sw.rib.pts.push({ x: p.x, zc: p.zc, zh: p.zh }); } }
    });

    c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(this.bgC, 0, 0); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const zone = pr.zone, dimOf = (id) => (zone && ZONE[id] !== zone ? 0.32 : 1);
    { const q = prj((B.model.x0 + B.model.x1) / 2, 0, 0), r = U * (this.sM * 1.5 + 0.5), g = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], r); g.addColorStop(0, 'rgba(99,102,241,0.13)'); g.addColorStop(1, 'rgba(246,247,251,0)'); c.fillStyle = g; c.fillRect(q[0] - r, q[1] - r, 2 * r, 2 * r); }

    this._casts(prj, U, now, zone && zone !== 'd_quality' ? 0.4 : 1);

    // пластины: дальние раньше ближних
    const ord = this._ord || (this._ord = []); ord.length = P.length; for (let i = 0; i < P.length; i++) { P[i]._d = prj(P[i].x, P[i].y0, 0)[3]; ord[i] = i; }
    ord.sort((a, b) => P[b]._d - P[a]._d);
    const TAU = 6.2832, hidden = this.hid;
    for (let o = 0; o < ord.length; o++) {
      const p = P[ord[o]], s = p.s, a = prj(p.x, p.y0 - s, -s), b = prj(p.x, p.y0 + s, -s), d = prj(p.x, p.y0 - s, s), e = prj(p.x, p.y0 + s, s);
      const col = (p.edge ? COL.edge : COL[p.g]).join(','), dim = dimOf(p.b), isM = p.b === 'model';
      c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(d[0], d[1]); c.closePath();
      c.fillStyle = 'rgba(255,255,255,' + (isM ? (p.edge ? 0.16 : hidden ? 0.07 : 0.03) : 0.12) * dim + ')'; c.fill();
      c.strokeStyle = 'rgba(' + col + ',' + (isM && !p.edge ? 0.2 : 0.32) * dim + ')'; c.lineWidth = 0.7; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,' + 0.9 * dim + ')'; c.lineWidth = 1; c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.stroke();
      const ux = b[0] - a[0], uy = b[1] - a[1], vx = d[0] - a[0], vy = d[1] - a[1], rb = Math.max(0.55, U * 0.0078 * a[2]) * (isM ? 0.95 : 1), N = p.N, hot = p.heat > 0.03, gl = p.glow > 0.03, base = (hidden && isM ? 0.6 : 1) * dim;
      for (let pass = 0; pass < 2; pass++) {
        c.beginPath();
        for (let q = 0; q < N; q++) { const r = p.r[q]; if (r < 0 || (r < 0.5) !== (pass === 0)) continue; if (hot && p.lit[q] && p.heat > 0.6) continue; const x = a[0] + ux * p.u[q] + vx * p.v[q], y = a[1] + uy * p.u[q] + vy * p.v[q], rr = rb * (0.7 + 0.5 * r); if (rr < 0.95) c.rect(x - rr, y - rr, 2 * rr, 2 * rr); else { c.moveTo(x + rr, y); c.arc(x, y, rr, 0, TAU); } }
        c.fillStyle = 'rgba(' + col + ',' + (pass ? (isM ? 0.8 : 0.7) : (isM ? 0.42 : 0.34)) * base + ')'; c.fill();
      }
      if (gl || hot) {
        const draw = (rgb, al, k) => { c.beginPath(); for (let q = 0; q < N; q++) { if (!p.lit[q]) continue; const x = a[0] + ux * p.u[q] + vx * p.v[q], y = a[1] + uy * p.u[q] + vy * p.v[q], rr = rb * k * (1 + 0.3 * p.r[q]); c.moveTo(x + rr, y); c.arc(x, y, rr, 0, TAU); } c.fillStyle = 'rgba(' + rgb + ',' + al * dim + ')'; c.fill(); };
        if (gl && p.heat < 0.9) draw(AFT, p.glow, 1.3);
        if (hot) draw(REQ, Math.min(1, p.heat * 1.15), 1.25 + 0.9 * p.heat);
      }
    }
    this._drawPoints(prj);
    this._labels(prj, U, dimOf);
  }

  /** Наблюдаемость: слепок прохода. На подложке остаётся тень только того пути, которым прошёл запрос; прошлые слепки уходят вниз. */
  _casts(prj, U, now, dim) {
    const c = this.ctx, zs = Math.max(0.6, this.sM * 0.95), x0 = -this.Xh, x1 = this.Xh;
    for (let i = this.casts.length - 1; i >= 0; i--) {
      const k = this.casts[i], y = this.YI - i * 0.17, al = dim * (i ? Math.max(0.3, 0.8 - i * 0.2) : 1), fl = i === 0 && this._flash ? Math.max(0, 1 - (now - this._flash) / 900) : 0;
      const q = [prj(x0, y, -zs), prj(x1, y, -zs), prj(x1, y, zs), prj(x0, y, zs)];
      c.beginPath(); c.moveTo(q[0][0], q[0][1]); for (let n = 1; n < 4; n++) c.lineTo(q[n][0], q[n][1]); c.closePath();
      c.fillStyle = 'rgba(255,255,255,' + 0.34 * al + ')'; c.fill(); c.strokeStyle = 'rgba(217,70,239,' + (0.22 + 0.5 * fl) * al + ')'; c.lineWidth = 0.7 + fl; c.stroke();
      const rgb = i ? '84,96,160' : REQ;
      k.ribs.forEach(r => {
        const P = r.pts, n = P.length; if (!n) return;
        const edge = (w) => { c.beginPath(); for (let a = 0; a < n; a++) { const t = prj(P[a].x - (a === 0 ? 0.05 : 0), y, P[a].zc + P[a].zh * w); a ? c.lineTo(t[0], t[1]) : c.moveTo(t[0], t[1]); } { const t = prj(P[n - 1].x + 0.05, y, P[n - 1].zc + P[n - 1].zh * w); c.lineTo(t[0], t[1]); const u = prj(P[n - 1].x + 0.05, y, P[n - 1].zc - P[n - 1].zh * w); c.lineTo(u[0], u[1]); } for (let a = n - 1; a >= 0; a--) { const t = prj(P[a].x - (a === 0 ? 0.05 : 0), y, P[a].zc - P[a].zh * w); c.lineTo(t[0], t[1]); } c.closePath(); };
        // мягкая тень: три слоя разной ширины
        edge(1.25); c.fillStyle = 'rgba(' + rgb + ',' + 0.07 * al + ')'; c.fill();
        edge(0.9); c.fillStyle = 'rgba(' + rgb + ',' + (0.12 + 0.1 * fl) * al + ')'; c.fill();
        edge(0.45); c.fillStyle = 'rgba(' + rgb + ',' + (0.2 + 0.15 * fl) * al + ')'; c.fill();
        // ось пути
        c.beginPath(); for (let a = 0; a < n; a++) { const t = prj(P[a].x, y, P[a].zc); a ? c.lineTo(t[0], t[1]) : c.moveTo(t[0], t[1]); }
        if (n === 1) { const t = prj(P[0].x + 0.05, y, P[0].zc); c.lineTo(t[0], t[1]); }
        c.strokeStyle = 'rgba(' + rgb + ',' + (i ? 0.45 : 0.85) * al + ')'; c.lineWidth = i ? 0.9 : 1.3; c.lineJoin = 'round'; c.stroke();
      });
    }
  }

  _drawPoints(prj) {
    const c = this.ctx, pts = this.pts || [], sel = this.props.selected, hits = (this.props.hitsKey || '').split(','), hov = this.state.hover; let tip = null;
    pts.forEach(p => {
      const q = prj(p.w[0], p.w[1], p.w[2]); p.sx = q[0]; p.sy = q[1];
      const on = p.id === sel, hit = hits.includes(p.id), hv = hov === 'p:' + p.id, r = on ? 6 : hit ? 5 : hv ? 4.6 : 3.2, dim = this.props.zone && p.dom !== this.props.zone ? 0.25 : 1;
      c.globalAlpha = dim; c.beginPath(); c.arc(q[0], q[1], r + 1.4, 0, 6.2832); c.fillStyle = 'rgba(255,255,255,0.95)'; c.fill();
      c.beginPath(); c.arc(q[0], q[1], r, 0, 6.2832); c.fillStyle = p.color; c.fill();
      if (on || hit) { c.beginPath(); c.arc(q[0], q[1], r + 5, 0, 6.2832); c.strokeStyle = p.color; c.globalAlpha = 0.35 * dim; c.lineWidth = 1.2; c.stroke(); }
      c.globalAlpha = 1; if (on || hv) tip = p;
    });
    if (tip) { const s = tip.title.length > 44 ? tip.title.slice(0, 43) + '…' : tip.title; c.font = '500 12px Geist, system-ui, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; const w = c.measureText(s).width, x = Math.min(this.W - w - 18, tip.sx + 12), y = tip.sy - 14; c.fillStyle = 'rgba(255,255,255,0.94)'; c.beginPath(); if (c.roundRect) c.roundRect(x - 7, y - 11, w + 14, 22, 7); else c.rect(x - 7, y - 11, w + 14, 22); c.fill(); c.fillStyle = '#0b0b14'; c.fillText(s, x, y); }
  }

  /** Подписи: одно название цветом блока, без плашек. */
  _labels(prj, U, dimOf) {
    const c = this.ctx, B = this.blocks, li = this.props.en ? 1 : 0, at = this.at && this.props.stepKey ? this.at : null, zone = this.props.zone;
    const put = (p, dx, dy, key, ink, al, size, alpha, on) => { c.font = (on ? '700 ' : '600 ') + (size || 13.5) + 'px Geist, system-ui, sans-serif'; c.textAlign = al || 'center'; c.textBaseline = 'middle'; c.globalAlpha = alpha; c.lineWidth = 3.5; c.strokeStyle = 'rgba(246,247,251,0.85)'; c.strokeText(TXT[key][li], p[0] + dx, p[1] + dy); c.fillStyle = ink; c.fillText(TXT[key][li], p[0] + dx, p[1] + dy); c.globalAlpha = 1; };
    const act = { gi: at === 'd_trust', ctx: at === 'd_context', model: at === 'core' || at === 'tok' || at === 'emb' || at === 'kv', go: at === 'd_trust_out', mem: at === 'd_context' || at === 'd_quality', perm: at === 'perm', tools: at === 'd_runtime' };
    const L = (id, w, dx, dy, al, size) => put(prj(w[0], w[1], w[2]), dx, dy, id, INK[B[id].g], al, size, dimOf(id) * (act[id] ? 1 : 0.86), act[id]);
    const g = B.gi, x = B.ctx, m = B.model, o = B.go, me = B.mem, pe = B.perm, tl = B.tools, mc = (b) => (b.x0 + b.x1) / 2;
    L('gi', [mc(g), -g.s, -g.s], 0, 20, 'center'); L('go', [mc(o), -o.s, -o.s], 0, 20, 'center');
    L('ctx', [mc(x), x.s, x.s], 0, -16, 'center'); L('model', [mc(m), m.smax, m.smax], 0, -38, 'center', 17);
    L('mem', [me.x0, me.y0, -me.s], -14, 0, 'right'); L('perm', [pe.x0, pe.y0, -pe.s], -12, 0, 'right'); L('tools', [tl.x1, tl.y0, tl.s], 16, 6, 'left');
    { const q = prj(mc(m), m.smax, m.smax), A = this.A, nf = (v) => Number(v).toLocaleString(li ? 'en-US' : 'ru-RU'), u = this.unit;
      const t1 = u ? (li ? '1 dot = ' + u + 'M parameters' : '1 точка = ' + u + ' млн параметров') : (li ? 'size not disclosed, shape is nominal' : 'размер не раскрыт, форма условная');
      const t2 = u ? ' · ' + nf(A.L) + (li ? ' layers' : ' сл.') + (this.capped ? (li ? ' (drawn: ' : ' (показано ') + MAXP + ')' : '') + (A.E && this.share < 1 ? ' · ' + (li ? 'active per token ' : 'на токен работает ') + (this.share * 100 < 10 ? (this.share * 100).toFixed(1) : Math.round(this.share * 100)) + '%' : '') : '';
      c.font = '400 11px Geist, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = dimOf('model') * 0.9; c.lineWidth = 3; c.strokeStyle = 'rgba(246,247,251,0.85)'; c.strokeText(t1 + t2, q[0], q[1] - 19); c.fillStyle = '#6b7186'; c.fillText(t1 + t2, q[0], q[1] - 19); c.globalAlpha = 1; }
    put(prj(-this.Xh, this.YI, -Math.max(0.6, this.sM * 0.95)), -2, 17, 'obs', INK.quality, 'left', 13.5, zone && zone !== 'd_quality' ? 0.4 : this.at === 'd_quality' && at ? 1 : 0.86, this.at === 'd_quality' && !!at);
    put(prj(g.x0, 0.1, -g.s), -16, 0, 'req', INK.req, 'right', 13.5, at === 'in' ? 1 : 0.86, at === 'in');
    put(prj(o.x1, 0, o.s), 16, 0, 'ans', INK.req, 'left', 13.5, at === 'out' ? 1 : 0.86, at === 'out');
  }
}

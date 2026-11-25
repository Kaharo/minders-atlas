import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLocale } from '@/shared/i18n';
import s from './GpuStrip.module.css';

/** Память одного ускорителя, ГБ (по данным производителей). Наборы по три карты: переключатель слева. */
const SETS: { id: string; ru: string; en: string; tip: string; cards: { id: string; gb: number }[] }[] = [
  { id: 'hopper', ru: 'Hopper', en: 'Hopper', tip: 'NVIDIA Hopper / Ada: L40S, H100, H200', cards: [{ id: 'L40S', gb: 48 }, { id: 'H100', gb: 80 }, { id: 'H200', gb: 141 }] },
  { id: 'blackwell', ru: 'Blackwell', en: 'Blackwell', tip: 'NVIDIA Blackwell / Rubin: B200, B300, Rubin', cards: [{ id: 'B200', gb: 180 }, { id: 'B300', gb: 288 }, { id: 'Rubin', gb: 288 }] },
  { id: 'other', ru: 'AMD · Intel', en: 'AMD · Intel', tip: 'Intel Gaudi 3, AMD Instinct MI325X, MI355X', cards: [{ id: 'Gaudi 3', gb: 128 }, { id: 'MI325X', gb: 256 }, { id: 'MI355X', gb: 288 }] },
];
const MAXC = 12;
const grid = (gb: number) => { const cols = Math.max(4, Math.round(Math.sqrt(gb * 0.72))); return { cols, rows: Math.ceil(gb / cols) }; };

/** Пластины одной карты: одна точка — 1 ГБ памяти, синие точки заняты моделью. Тот же язык, что на карте. */
function Plates({ gb, need, label }: { gb: number; need: number; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null), box = useRef<HTMLSpanElement>(null);
  const [room, setRoom] = useState(90);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(() => setRoom(el.clientWidth)); ro.observe(el); setRoom(el.clientWidth); return () => ro.disconnect(); }, []);
  const cnt = Math.max(1, Math.ceil(need / gb)), { cols, rows } = grid(gb), n3 = Math.min(cnt, 2), PX = Math.max(1.8, Math.min(4, 40 / rows, (room - (n3 - 1) * 4 - n3 * 6 - (cnt > n3 ? 24 : 0)) / (n3 * cols))), pw = cols * PX + 6, ph = rows * PX + 6;
  // сколько пластин помещается в блок; остальные уходят в «+N»
  const fit = Math.max(1, Math.floor((room + 4) / (pw + 4))), shown = cnt <= fit ? cnt : Math.max(1, Math.min(MAXC, Math.floor((room - 20) / (pw + 4))));
  const W = shown * pw + (shown - 1) * 4, H = ph;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = W * dpr; cv.height = H * dpr;
    const c = cv.getContext('2d'); if (!c) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    for (let i = 0; i < shown; i++) {
      // последняя показанная пластина — это последняя карта набора: на ней видно, сколько места осталось
      const idx = i === shown - 1 ? cnt - 1 : i, used = Math.round(Math.max(0, Math.min(gb, need - idx * gb))), x0 = i * (pw + 4);
      c.fillStyle = 'rgba(255,255,255,0.72)'; c.strokeStyle = 'rgba(99,102,241,0.38)'; c.lineWidth = 1;
      c.beginPath(); c.roundRect(x0 + 0.5, 0.5, pw - 1, ph - 1, 3); c.fill(); c.stroke();
      for (let k = 0; k < gb; k++) {
        const col = k % cols, row = rows - 1 - Math.floor(k / cols), on = k < used;
        c.fillStyle = on ? 'rgb(37,99,235)' : 'rgba(99,102,241,0.3)';
        c.beginPath(); c.arc(x0 + 3 + col * PX + PX / 2, 3 + row * PX + PX / 2, on ? PX * 0.31 : PX * 0.21, 0, 6.2832); c.fill();
      }
    }
  }, [gb, need, cnt, shown, cols, rows, pw, ph, W, H, PX]);
  return <span ref={box} className={s.plates}><canvas ref={ref} style={{ width: W, height: H }} role="img" aria-label={label} />{cnt > shown && <i className={s.more}>+{cnt - shown}</i>}</span>;
}

interface Props { gb: { native: number; q4: number; qn: string } | null; hiddenNote?: string; style?: CSSProperties }

/** Сколько ускорителей нужно выбранной модели: слева набор карт, справа три блока — число карт и их память точками. */
export function GpuStrip({ gb, hiddenNote, style }: Props) {
  const { t, locale } = useLocale();
  const need = gb ? gb.native * 1.2 : 0; // веса плюс 20% на работу, как в расчёте «где помещается»
  const [set, setSet] = useState<string | null>(null);
  const n = (x: number) => x.toLocaleString(locale === 'en' ? 'en-US' : 'ru-RU', { maximumFractionDigits: x < 10 ? 1 : 0 });
  if (!gb) return <div className={s.strip} style={style}><div className={s.side}><span className={s.k}>{t('Размер в GPU', 'Size in GPUs')}</span><span className={s.note}>{hiddenNote || t('Разработчик не публикует размер модели.', 'The developer does not publish the model size.')}</span></div></div>;
  const cur = SETS.find(x => x.id === (set ?? (need > 300 ? 'blackwell' : 'hopper'))) ?? SETS[0];
  return (
    <div className={s.strip} style={style}>
      <div className={s.side}>
        <span className={s.k}>{t('Размер в GPU', 'Size in GPUs')}{cur.id !== 'other' ? ' · NVIDIA' : ''}</span>
        <span className={s.note} title={t(`веса ${n(gb.native)} ГБ (${gb.qn}) и запас на работу (KV-кэш); хватит любого из трёх вариантов`, `weights ${n(gb.native)} GB (${gb.qn}) plus working headroom (KV cache); any one of the three is enough`)}>{t('нужно', 'needs')} <b>{n(need)} {t('ГБ', 'GB')}</b> · {t('точка = 1 ГБ', 'dot = 1 GB')}</span>
        <div className={s.tabs} role="group" aria-label={t('Набор карт', 'Card set')}>
          {SETS.map(x => <button key={x.id} type="button" className={`${s.tab} ${x.id === cur.id ? s.tabOn : ''}`} aria-pressed={x.id === cur.id} title={x.tip} onClick={() => setSet(x.id)}>{locale === 'en' ? x.en : x.ru}</button>)}
        </div>
      </div>
      {cur.cards.map(g => {
        const cnt = Math.max(1, Math.ceil(need / g.gb));
        return (
          <div key={g.id} className={s.block}>
            <div className={s.txt}>
              <div className={s.big}><b>{n(cnt)}</b><span>× {g.id}</span></div>
              <div className={s.sub} title={t('память одной карты · занято моделью', 'memory per card · used by the model')}>{g.gb} {t('ГБ', 'GB')} · {Math.round(need / (cnt * g.gb) * 100)}%</div>
            </div>
            <Plates gb={g.gb} need={need} label={`${cnt} × ${g.id}`} />
          </div>
        );
      })}
    </div>
  );
}

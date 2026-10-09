import { useMemo, useState } from 'react';
import { useLocale } from '@/shared/i18n';
import { families, models, PICK_DEFS, pickPass, ru, type PickFilter } from '@/entities/model';
import { fmt, rankOf, type Bench } from '@/entities/benchmark';
import s from './ModelPicker.module.css';

/** Выбор модели по странам и семействам с фильтрами. Перенос pkCountries прототипа. */
export function ModelPicker({ current, onPick, onClose, benches, benchId = 'hle' }: { current: string; onPick: (id: string) => void; onClose: () => void; benches: Bench[] | null; benchId?: string }) {
  const { t, locale } = useLocale();
  const en = locale === 'en';
  const [q, setQ] = useState('');
  const [pf, setPf] = useState<PickFilter>({});
  const [openFam, setOpenFam] = useState<string | null>(null);
  const filt = Object.values(pf).some(v => v && v !== 'all');
  const bench = benches?.find(b => b.id === benchId) ?? null;
  const { countries, n } = useMemo(() => {
    const qq = q.trim().toLowerCase(), byC = new Map<string, { cc: string; flag: string; name: string; n: number; fams: { key: string; name: string; org: string; ms: typeof models; open: boolean }[] }>();
    let n = 0;
    families.forEach(f => {
      const ms = f.models.filter(x => pickPass(x, pf) && (!qq || (x.name + ' ' + f.orgName + ' ' + f.countryRu + ' ' + f.countryEn).toLowerCase().includes(qq)));
      if (!ms.length) return;
      const c = byC.get(f.cc) ?? { cc: f.cc, flag: f.flag || f.cc, name: en ? f.countryEn : f.countryRu, n: 0, fams: [] };
      byC.set(f.cc, c); n += ms.length; c.n += ms.length;
      c.fams.push({ key: f.key, name: f.name, org: f.orgName, ms, open: qq.length > 0 || filt || openFam === f.key || ms.some(x => x.id === current) });
    });
    return { countries: [...byC.values()].sort((a, b) => b.n - a.n), n };
  }, [q, pf, openFam, current, en, filt]);
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.box} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={s.head}>
          <span className={s.title}>{t('Модели', 'Models')}</span>
          <span className={s.n}>{n} / {models.length}</span>
          <span style={{ flex: 1 }} />
          <input className={s.q} value={q} onChange={e => setQ(e.target.value)} placeholder={t('поиск модели, организации, страны', 'search model, org, country')} />
          <button type="button" className={s.close} onClick={onClose}>{t('закрыть', 'close')}</button>
        </div>
        <div className={s.filters}>
          {PICK_DEFS(en).map(g => (
            <div key={g.key} className={s.fg}>
              <span className={s.fl}>{g.label}</span>
              <div className={s.opts}>{g.opts.map(([v, lbl]) => <button key={v} type="button" className={`${s.opt} ${(pf[g.key] || 'all') === v ? s.optOn : ''}`} onClick={() => setPf(p => ({ ...p, [g.key]: v }))}>{lbl}</button>)}</div>
            </div>
          ))}
          {filt && <button type="button" className={s.reset} onClick={() => setPf({})}>{t('сбросить фильтры', 'reset filters')}</button>}
        </div>
        {n === 0 && <div className={s.empty}>{t('Под эти фильтры моделей нет.', 'No models match these filters.')}</div>}
        <div className={s.grid}>
          {countries.map(c => (
            <div key={c.cc} className={s.country}>
              <span className={s.bigFlag}>{c.flag}</span>
              <div className={s.ch}><span style={{ fontSize: 20, lineHeight: 1 }}>{c.flag}</span><b>{c.name}</b><span className={s.n}>{c.n} {t('мод.', 'models')}</span></div>
              {c.fams.map(f => (
                <div key={f.key} className={s.fam} style={{ background: f.ms.some(x => x.id === current) ? 'rgba(59,91,253,0.05)' : 'transparent' }}>
                  <button type="button" className={s.famHead} onClick={() => setOpenFam(openFam === f.key ? null : f.key)}><b>{f.name}</b><i>{f.org}</i><span className={s.n}>{f.ms.length}</span><span className={s.n}>{f.open ? '▾' : '▸'}</span></button>
                  {f.open && (
                    <div className={s.models}>
                      {f.ms.map(x => { const sel = x.id === current, op = (x.dep || []).includes('weights'), tr = bench ? rankOf(bench, x.id) : null, top = tr && tr.rank <= 3; return (
                        <button key={x.id} type="button" className={`${s.m} ${sel ? s.mOn : ''}`} onClick={() => onPick(x.id)}>
                          {x.ver}<small>{ru(x.par)}</small>
                          {top && <span className={s.badge} title={(bench ? (en ? bench.title.en : bench.title.ru) : '') + ': ' + fmt(benchId, tr!.v)} style={{ background: sel ? 'rgba(255,255,255,0.2)' : '#0b0b14', color: '#fff' }}>#{tr!.rank}</span>}
                          {op && <span className={s.badge} style={{ background: sel ? 'rgba(255,255,255,0.18)' : 'rgba(21,128,61,0.1)', color: sel ? '#fff' : '#15803d' }}>open</span>}
                        </button>
                      ); })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

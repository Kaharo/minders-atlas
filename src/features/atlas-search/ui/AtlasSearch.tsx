import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocale } from '@/shared/i18n';
import { api } from '@/shared/api/client';
import { ROUTES } from '@/shared/config/routes';
import s from './AtlasSearch.module.css';

type Section = 'glossary' | 'research' | 'incidents' | 'benchmarks';
interface Hit { uid: string; tag: string; key: string; title: { ru: string | null; en: string | null }; ym: string | null; snippet: string }

const SECTION: Record<string, Section> = { term: 'glossary', research: 'research', incident: 'incidents', benchmark: 'benchmarks' };
const ORDER: Section[] = ['glossary', 'incidents', 'research', 'benchmarks'];
const GROUP: Record<Section, [string, string]> = { glossary: ['Термины', 'Terms'], research: ['Исследования', 'Research'], incidents: ['Инциденты', 'Incidents'], benchmarks: ['Рейтинги', 'Benchmarks'] };
const EXAMPLES: [string[], string[]] = [['агент', 'инъекция', 'Hugging Face', 'RAG'], ['agent', 'injection', 'Hugging Face', 'RAG']];

/** Фрагмент из FTS приходит с <b>…</b> вокруг совпадений и начинается с заголовка записи. Заголовок убираем (он уже показан), HTML не вставляем. */
function parts(snippet: string, title: string): { text: string; hit: boolean }[] {
  const segs = snippet.split(/<\/?b>/).map((text, i) => ({ text, hit: i % 2 === 1 }));
  const plain = segs.map(x => x.text).join('');
  let at = title ? plain.indexOf(title) : -1, len = title.length;
  if (at < 0 && title) {
    // фрагмент мог оборваться посреди заголовка: ищем его начало в хвосте
    const tail = plain.replace(/[…\s]+$/, '');
    for (let k = Math.min(title.length - 1, tail.length); k >= 12; k--) if (tail.endsWith(title.slice(0, k))) { at = tail.length - k; len = plain.length - at; break; }
  }
  if (at < 0) return segs;
  let pos = 0;
  const out: { text: string; hit: boolean }[] = [];
  for (const x of segs) {
    const a = pos, b = pos + x.text.length; pos = b;
    const keep = x.text.slice(0, Math.max(0, Math.min(b, at) - a)) + x.text.slice(Math.max(0, Math.min(x.text.length, at + len - a)));
    if (keep) out.push({ text: keep, hit: x.hit });
  }
  return out;
}

/** Общий поиск по атласу: термины, исследования, инциденты и рейтинги через /api/search. */
export function AtlasSearch() {
  const { locale, t } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  const nav = useNavigate();
  const { pathname } = useLocation();
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [found, setFound] = useState<Hit[]>([]);
  const [cur, setCur] = useState(-1);

  // записи по разделам в постоянном порядке; индекс в общем списке нужен для стрелок
  const items = useMemo(() => ORDER.flatMap(sec => found.filter(h => SECTION[h.tag] === sec)), [found]);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const text = q.trim();
    if (text.length < 2) { setFound([]); setState('idle'); return; }
    let live = true;
    setState('loading');
    const id = setTimeout(() => {
      api.get<{ items: Hit[] }>('/search', { q: text, limit: 16 })
        .then(r => { if (live) { setFound(r.items.filter(x => SECTION[x.tag])); setCur(-1); setState('done'); } })
        .catch(() => { if (live) { setFound([]); setState('error'); } });
    }, 250);
    return () => { live = false; clearTimeout(id); };
  }, [q]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  // «/» ставит курсор в поиск, если человек не печатает в другом поле
  useEffect(() => {
    const slash = (e: globalThis.KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable))) return;
      e.preventDefault(); input.current?.focus();
    };
    document.addEventListener('keydown', slash);
    return () => document.removeEventListener('keydown', slash);
  }, []);

  const go = (h: Hit) => { setOpen(false); setQ(''); input.current?.blur(); nav(ROUTES.atlas(SECTION[h.tag], h.key)); };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setCur(c => (c + 1) % items.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCur(c => (c <= 0 ? items.length - 1 : c - 1)); }
    else if (e.key === 'Enter' && open) { e.preventDefault(); go(items[cur < 0 ? 0 : cur]); }
  };
  const typed = q.trim().length >= 2;
  const titleOf = (h: Hit) => (li ? h.title.en ?? h.title.ru : h.title.ru ?? h.title.en) ?? h.key;

  return (
    <div className={s.box} ref={box}>
      <svg className={s.icon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input ref={input} className={s.input} type="search" role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
        aria-activedescendant={open && cur >= 0 ? `${listId}-${cur}` : undefined}
        aria-label={t('Поиск по атласу', 'Search the atlas')} placeholder={t('Найти термин, инцидент, исследование…', 'Find a term, incident, study…')}
        value={q} onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKey} />
      {open && (
        <div className={s.panel}>
          {!typed && (
            <div className={s.intro}>
              <p className={s.note}>{t('Ищет сразу по всем разделам: термины, инциденты, исследования и рейтинги. Введите от двух букв.', 'Searches every section at once: terms, incidents, research and benchmarks. Type at least two letters.')}</p>
              <div className={s.examples}>
                <span className={s.lbl}>{t('Например', 'Try')}</span>
                {EXAMPLES[li].map(x => <button key={x} type="button" className={s.ex} onClick={() => { setQ(x); input.current?.focus(); }}>{x}</button>)}
              </div>
            </div>
          )}
          {typed && state === 'loading' && !items.length && <p className={s.note}>{t('Ищу…', 'Searching…')}</p>}
          {typed && state === 'error' && <p className={s.note} role="alert">{t('Поиск сейчас недоступен. Попробуйте ещё раз через минуту.', 'Search is unavailable right now. Try again in a minute.')}</p>}
          {typed && state === 'done' && !items.length && <p className={s.note}>{t('Ничего не найдено. Попробуйте одно слово, часть слова или английское название.', 'Nothing found. Try a single word, part of a word, or the English name.')}</p>}
          <ul className={s.list} id={listId} role="listbox" aria-label={t('Результаты поиска', 'Search results')}>
            {typed && items.map((h, i) => {
              const sec = SECTION[h.tag], first = i === 0 || SECTION[items[i - 1].tag] !== sec, title = titleOf(h);
              const body = parts(h.snippet, title).filter(p => p.text.trim() || p.hit);
              return (
                <Fragment key={h.uid}>
                  {first && <li role="presentation" className={`${s.group} ${s[sec]}`}>{GROUP[sec][li]} · {items.filter(x => SECTION[x.tag] === sec).length}</li>}
                  <li id={`${listId}-${i}`} role="option" aria-selected={i === cur} className={`${s.row} ${i === cur ? s.rowOn : ''}`} onPointerEnter={() => setCur(i)} onClick={() => go(h)}>
                    <span className={s.head}><span className={s.title}>{title}</span>{h.ym && <span className={s.ym}>{h.ym}</span>}</span>
                    {body.length > 0 && <span className={s.snip}>{body.map((p, k) => (p.hit ? <mark key={k}>{p.text}</mark> : <Fragment key={k}>{p.text}</Fragment>))}</span>}
                  </li>
                </Fragment>
              );
            })}
          </ul>
          {typed && items.length > 0 && <p className={s.keys} aria-hidden="true">{t('↑ ↓ выбрать · Enter открыть · Esc закрыть', '↑ ↓ select · Enter open · Esc close')}</p>}
        </div>
      )}
    </div>
  );
}

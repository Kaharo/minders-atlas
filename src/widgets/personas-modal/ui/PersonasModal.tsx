import { useLocale } from '@/shared/i18n';
import { Modal } from '@/shared/ui';
import { PERSONAS, PersonaGlyph, type PersonaId } from '@/entities/persona';
import s from './PersonasModal.module.css';

export function PersonasModal({ open, onClose, counts, onPick }: { open: boolean; onClose: () => void; counts: Record<string, number> | null; onPick: (id: PersonaId) => void }) {
  const { t, locale } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  return (
    <Modal open={open} onClose={onClose} kicker={t('Пульс', 'Pulse')} title={t('Кто такие персоны', 'Who the personas are')}>
      <p className={s.intro}>{t('Семь редакционных линз, через которые Пульс читает новости. Каждая новость попадает к персоне по теме, а персона отвечает на свой вопрос. Короткие разборы пишет модель по профилю персоны раз в день. Это интерпретация: факты всегда по ссылке на источник.', 'Seven editorial lenses through which Pulse reads the news. Each story is filed with a persona by topic, and the persona answers its own question. Short takes are written once a day by a model following the persona’s profile. They are interpretation; the facts are always behind the source link.')}</p>
      {PERSONAS.map(p => (
        <button key={p.id} type="button" className={s.row} onClick={() => onPick(p.id)}>
          <PersonaGlyph id={p.id} />
          <div className={s.body}>
            <div className={s.head}>
              <span className={s.name}>{p.name}</span>
              <span className={s.domain} style={{ color: p.ink }}>{p.domain[li]}</span>
              <span className={s.spacer} />
              {counts && <span className={s.n}>{counts[p.id] ?? 0} {t('новостей', 'stories')}</span>}
            </div>
            <span className={s.desc}>{p.desc[li]}</span>
            <span className={s.q}>{p.question[li]}</span>
            <span className={s.focus}>{p.focus[li]}</span>
          </div>
        </button>
      ))}
    </Modal>
  );
}
